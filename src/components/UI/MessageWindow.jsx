import { useState, useEffect, useRef } from 'react'
import CallModal from './CallModal'
import QuickAutoReply from './QuickAutoReply'
import ModerationControls from '../Moderation/ModerationControls'
import SpamDetectionWrapper from '../Moderation/SpamDetectionWrapper'
import AutoReplyManager from '../../services/Messaging/AutoReplyManager'
import MessageManagement from '../../services/Management/MessageManagement'
import CryptoTipping from '../../services/Finance/CryptoTipping'
import TrustIntegrationService from '../../services/Integration/TrustIntegrationService'
import ChatModerationService from '../../services/Moderation/ChatModerationService'
import RealTimeModerationService from '../../services/Moderation/RealTimeModerationService'
import AuditManager from '../../services/Management/AuditManager'
import TrustManager from '../../services/Trust/TrustManager'
import './MessageWindow.css'

// Import CallManager for privacy-first calling
import CallManager from '../../services/Messaging/CallManager'

// Call state constants
const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTED: 'connected'
}

const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video'
}

const FEATURE_FLAGS = {
  VIDEO_CALLS: true // Re-enabled for full functionality
}

const MessageWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [callManager, setCallManager] = useState(null)
  const [callState, setCallState] = useState(CALL_STATES.IDLE)
  const [currentCall, setCurrentCall] = useState(null)
  const [autoReplyManager, setAutoReplyManager] = useState(null)
  const [showAutoReply, setShowAutoReply] = useState(false)
  const [messageManagement, setMessageManagement] = useState(null)
  const [cryptoTipping, setCryptoTipping] = useState(null)
  const [trustIntegration, setTrustIntegration] = useState(null)
  const [moderationService, setModerationService] = useState(null)
  const [showMessageActions, setShowMessageActions] = useState({})
  const [showTipModal, setShowTipModal] = useState(null)
  const [showEditModal, setShowEditModal] = useState(null)
  const [currentUser, setCurrentUser] = useState({ id: 'me', name: 'You', trustLevel: 75 })
  const messagesEndRef = useRef(null)

  // Mock messages data
  useEffect(() => {
    if (selectedChat) {
      const mockMessages = [
        {
          id: '1',
          senderId: selectedChat.id,
          senderName: selectedChat.name,
          content: 'Hey! How are you doing today?',
          timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
          isEncrypted: true,
          status: 'delivered'
        },
        {
          id: '2',
          senderId: 'me',
          senderName: 'You',
          content: 'I\'m doing great! Just working on some projects. How about you?',
          timestamp: new Date(Date.now() - 50 * 60 * 1000), // 50 minutes ago
          isEncrypted: true,
          status: 'read'
        },
        {
          id: '3',
          senderId: selectedChat.id,
          senderName: selectedChat.name,
          content: selectedChat.lastMessage,
          timestamp: selectedChat.timestamp,
          isEncrypted: true,
          status: 'delivered'
        }
      ]
      setMessages(mockMessages)
    } else {
      setMessages([])
    }
  }, [selectedChat])

  // Initialize call manager with privacy-first approach - RE-ENABLED
  useEffect(() => {
    if (FEATURE_FLAGS.VIDEO_CALLS && selectedChat) {
      const manager = new CallManager(
        (state) => setCallState(state),
        (call) => setCurrentCall(call)
      )
      setCallManager(manager)
      
      return () => {
        if (manager) {
          manager.cleanup()
        }
      }
    }
  }, [selectedChat])

  // Initialize auto-reply manager and enhanced services
  useEffect(() => {
    const initServices = async () => {
      try {
        // Initialize AutoReplyManager
        const autoManager = new AutoReplyManager()
        await autoManager.initialize()
        setAutoReplyManager(autoManager)

        // Initialize management services
        const auditManager = new AuditManager()
        await auditManager.initialize()
        
        const trustManager = new TrustManager()
        await trustManager.initialize()
        
        const msgManagement = new MessageManagement(auditManager, trustManager)
        await msgManagement.initialize()
        setMessageManagement(msgManagement)
        
        const tipping = new CryptoTipping(auditManager)
        await tipping.initialize()
        setCryptoTipping(tipping)
        
        const trustIntegrationSvc = new TrustIntegrationService(trustManager, auditManager, msgManagement, null)
        await trustIntegrationSvc.initialize()
        setTrustIntegration(trustIntegrationSvc)
        
        // Initialize moderation service
        const moderation = new ChatModerationService()
        await moderation.initialize()
        setModerationService(moderation)
        
        // Initialize real-time moderation integration
        const realTimeModeration = new RealTimeModerationService()
        await realTimeModeration.initialize()
        setRealTimeModerationService(realTimeModeration)
        
        // Register current user session
        if (currentUser) {
          moderation.registerUserSession(currentUser, {
            ip: 'localhost', // In production, get real IP
            deviceFingerprint: 'browser_session',
            roomId: selectedChat.id
          })
        }
        
      } catch (error) {
        console.error('Failed to initialize services:', error)
      }
    }

    if (selectedChat) {
      initServices()
    }

    return () => {
      if (autoReplyManager) {
        autoReplyManager.destroy()
      }
      if (messageManagement) {
        messageManagement.destroy()
      }
      if (cryptoTipping) {
        cryptoTipping.destroy()
      }
      if (trustIntegration) {
        trustIntegration.destroy()
      }
      if (moderationService) {
        // No destroy method needed for moderation service - it saves state automatically
      }
    }
  }, [selectedChat, autoReplyManager, messageManagement, cryptoTipping, trustIntegration, moderationService, currentUser])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])
  
  // Listen for call events from ChatList quick actions
  useEffect(() => {
    const handleCallEvent = (event) => {
      const { type, chatId } = event.detail
      if (selectedChat && selectedChat.id === chatId) {
        handleCall(type)
      }
    }
    
    // Listen for moderation events
    const handleMessageBlocked = (event) => {
      const { messageId, reason, action, user } = event.detail
      console.log('🚫 Message blocked:', { messageId, reason, action })
      
      // Remove blocked message from UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      
      // Show notification to user
      if (user.id === currentUser?.id) {
        const blockMessage = action === 'kick' 
          ? 'You have been removed for violating chat rules'
          : `Message blocked: ${reason}`
        alert(`🚨 ${blockMessage}`)
      }
    }
    
    const handleUserKicked = (event) => {
      const { user, roomId, reason } = event.detail
      if (roomId === selectedChat?.id) {
        console.log(`👢 User ${user.username} was kicked:`, reason)
        
        // Show system message about kick
        const kickMessage = {
          id: `kick_${Date.now()}`,
          senderId: 'system',
          senderName: 'System',
          content: `⚠️ ${user.username} was removed from the chat`,
          timestamp: new Date(),
          isEncrypted: false,
          status: 'delivered',
          isSystemMessage: true
        }
        
        setMessages(prev => [...prev, kickMessage])
      }
    }
    
    window.addEventListener('startCall', handleCallEvent)
    window.addEventListener('messageBlocked', handleMessageBlocked)
    window.addEventListener('userKicked', handleUserKicked)
    
    return () => {
      window.removeEventListener('startCall', handleCallEvent)
      window.removeEventListener('messageBlocked', handleMessageBlocked)
      window.removeEventListener('userKicked', handleUserKicked)
    }
  }, [selectedChat, callManager, currentUser, handleCall, setMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedChat) return

    // Check for spam before sending
    if (moderationService) {
      const spamCheck = await moderationService.checkForSpam(currentUser, {
        content: newMessage.trim(),
        id: Date.now().toString(),
        timestamp: new Date()
      })
      
      if (spamCheck.isSpam) {
        // Show spam warning to user
        alert(`🚨 ${spamCheck.message || 'Message flagged as spam'}`)
        
        if (spamCheck.action === 'kick') {
          // Clear input and show kick message
          setNewMessage('')
          alert('🚫 You have been removed from the chat. Please rejoin with a new nickname and follow chat rules.')
          return
        }
        
        // For warnings, still allow the message but clear input to prevent repeat
        if (spamCheck.action === 'warn') {
          setNewMessage('')
          return
        }
      }
    }

    const message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
      isEncrypted: true,
      status: 'sending'
    }

    // Emit message sent event for real-time moderation
    window.dispatchEvent(new CustomEvent('messageSent', {
      detail: {
        message: message,
        user: currentUser,
        roomId: selectedChat?.id
      }
    }))

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      )
    }, 1000)

    // Check for auto-reply trigger and simulate response
    if (selectedChat.id !== 'me' && autoReplyManager) {
      setIsTyping(true)
      
      // Check if auto-reply should be sent
      const autoReply = await autoReplyManager.shouldSendAutoReply(selectedChat.id, 'message')
      
      setTimeout(() => {
        setIsTyping(false)
        
        let responseContent = 'Thanks for your message! I\'ll get back to you soon.'
        let isAutoReply = false
        
        if (autoReply) {
          responseContent = autoReply.text
          isAutoReply = true
        }
        
        const response = {
          id: (Date.now() + 1).toString(),
          senderId: selectedChat.id,
          senderName: selectedChat.name,
          content: responseContent,
          timestamp: new Date(),
          isEncrypted: true,
          status: 'delivered',
          isAutoReply: isAutoReply,
          autoReplyType: autoReply?.type
        }
        
        setMessages(prev => [...prev, response])
      }, 2000)
    }
  }

  const formatMessageTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending': return '⏳'
      case 'delivered': return '✓'
      case 'read': return '✓✓'
      default: return ''
    }
  }

  // Handle auto-reply sending from QuickAutoReply component
  const handleAutoReply = async (replyData) => {
    if (!selectedChat) return

    const autoMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: replyData.text,
      timestamp: new Date(),
      isEncrypted: true,
      status: 'sending',
      isAutoReply: true,
      autoReplyType: replyData.type
    }

    setMessages(prev => [...prev, autoMessage])
    setShowAutoReply(false)

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === autoMessage.id 
            ? { ...msg, status: 'delivered' }
            : msg
        )
      )
    }, 1000)
  }

  // Message Actions
  const handleMessageAction = (messageId, action) => {
    setShowMessageActions(prev => ({
      ...prev,
      [messageId]: action === 'show' ? true : false
    }))
  }

  const handleTipMessage = (message) => {
    setShowTipModal(message)
  }

  const handleEditMessage = (message) => {
    setShowEditModal(message)
  }

  const handleDeleteMessage = async (message) => {
    if (!messageManagement || !trustIntegration) {
      alert('Services not initialized')
      return
    }

    try {
      // Check permissions using trust integration
      const permission = await trustIntegration.validateUserPermissions(
        currentUser, 
        'delete_message', 
        message
      )

      if (!permission.allowed) {
        alert(`Cannot delete message: ${permission.reason}`)
        return
      }

      const reason = prompt('Reason for deletion (optional):')
      if (reason === null) return // User cancelled

      const result = await messageManagement.requestMessageDeletion(
        message.id, 
        currentUser, 
        reason
      )

      if (result.success) {
        if (result.status === 'pending_approval') {
          alert('Deletion request submitted for moderator approval')
        } else {
          // Remove message from UI
          setMessages(prev => prev.filter(m => m.id !== message.id))
          alert('Message deleted successfully')
        }
      }
    } catch (error) {
      console.error('Delete message error:', error)
      alert(`Failed to delete message: ${error.message}`)
    }
  }

  const handleConfirmTip = async (tipData) => {
    if (!cryptoTipping) {
      alert('Tipping service not available')
      return
    }

    try {
      const result = await cryptoTipping.createTip({
        recipientId: showTipModal.senderId,
        currency: tipData.currency,
        amount: tipData.amount,
        messageId: showTipModal.id,
        message: tipData.message || ''
      }, currentUser)

      if (result.success) {
        alert(`Tip created! Transaction ID: ${result.transactionId}`)
        // You could show QR code here
        console.log('QR Code:', result.transaction.qrCode)
      }
    } catch (error) {
      console.error('Tip creation error:', error)
      alert(`Failed to create tip: ${error.message}`)
    }
    
    setShowTipModal(null)
  }

  const handleConfirmEdit = async (editData) => {
    if (!messageManagement || !trustIntegration) {
      alert('Services not initialized')
      return
    }

    try {
      const permission = await trustIntegration.validateUserPermissions(
        currentUser, 
        'edit_message', 
        showEditModal
      )

      if (!permission.allowed) {
        alert(`Cannot edit message: ${permission.reason}`)
        return
      }

      const result = await messageManagement.requestMessageEdit(
        showEditModal.id, 
        editData.content, 
        currentUser, 
        editData.reason || ''
      )

      if (result.success) {
        if (result.status === 'pending_approval') {
          alert('Edit request submitted for moderator approval')
        } else {
          // Update message in UI
          setMessages(prev => prev.map(m => 
            m.id === showEditModal.id 
              ? { ...m, content: editData.content, edited: true }
              : m
          ))
          alert('Message edited successfully')
        }
      }
    } catch (error) {
      console.error('Edit message error:', error)
      alert(`Failed to edit message: ${error.message}`)
    }
    
    setShowEditModal(null)
  }

  const getProfileModeColor = (mode) => {
    switch (mode) {
      case 'Ultra': return '#00ff88'
      case 'Public': return '#0088ff'
      case 'Anon': return '#888888'
      case 'Basic': return '#ffaa00'
      default: return '#cccccc'
    }
  }

  // Tip Modal Component
  const TipModalContent = ({ message, onConfirm, onCancel }) => {
    const [currency, setCurrency] = useState('BTC')
    const [amount, setAmount] = useState('')
    const [tipMessage, setTipMessage] = useState('')

    const currencies = ['BTC', 'ETH', 'DOGE', 'LTC', 'SOL', 'PYTH', 'LINK']

    return (
      <div className="tip-form">
        <p>Send a tip to <strong>{message.senderName}</strong></p>
        
        <div className="form-group">
          <label>Currency:</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            {currencies.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Amount:</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.0001"
            min="0"
          />
        </div>
        
        <div className="form-group">
          <label>Message (optional):</label>
          <input 
            type="text" 
            value={tipMessage} 
            onChange={(e) => setTipMessage(e.target.value)}
            placeholder="Thanks for your message!"
          />
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => onConfirm({ currency, amount: parseFloat(amount), message: tipMessage })}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            Send Tip
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Edit Modal Component
  const EditModalContent = ({ message, onConfirm, onCancel }) => {
    const [content, setContent] = useState(message.content)
    const [reason, setReason] = useState('')

    return (
      <div className="edit-form">
        <p>Edit message:</p>
        
        <div className="form-group">
          <label>Message Content:</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Edit your message..."
          />
        </div>
        
        <div className="form-group">
          <label>Reason for edit (optional):</label>
          <input 
            type="text" 
            value={reason} 
            onChange={(e) => setReason(e.target.value)}
            placeholder="Fixing typo, adding clarification, etc."
          />
        </div>
        
        <div className="modal-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => onConfirm({ content, reason })}
            disabled={!content.trim() || content === message.content}
          >
            Save Changes
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Call handling functions - RE-ENABLED
  const handleVoiceCall = async () => {
    if (!callManager || !selectedChat) return
    
    try {
      await callManager.startCall(selectedChat.id, CALL_TYPES.VOICE)
    } catch (error) {
      console.error('Failed to start voice call:', error)
      alert('Failed to start voice call. Please check your microphone permissions.')
    }
  }

  const handleVideoCall = async () => {
    if (!callManager || !selectedChat) return
    
    try {
      await callManager.startCall(selectedChat.id, CALL_TYPES.VIDEO)
    } catch (error) {
      console.error('Failed to start video call:', error)
      alert('Failed to start video call. Please check your camera and microphone permissions.')
    }
  }

  const handleAcceptCall = async () => {
    if (!callManager || !currentCall) return
    
    try {
      await callManager.acceptCall(currentCall.id)
    } catch (error) {
      console.error('Failed to accept call:', error)
    }
  }

  const handleRejectCall = async (reason = 'declined') => {
    if (!callManager || !currentCall) return
    
    try {
      await callManager.rejectCall(currentCall.id, reason)
    } catch (error) {
      console.error('Failed to reject call:', error)
    }
  }

  const handleEndCall = async (reason = 'ended') => {
    if (!callManager || !currentCall) return
    
    try {
      await callManager.endCall(currentCall.id, reason)
    } catch (error) {
      console.error('Failed to end call:', error)
    }
  }
  
  // Unified call handler for both quick actions and in-chat buttons
  const handleCall = (type) => {
    if (type === 'voice' || type === CALL_TYPES.VOICE) {
      handleVoiceCall()
    } else if (type === 'video' || type === CALL_TYPES.VIDEO) {
      handleVideoCall()
    }
  }

  if (!selectedChat) {
    return (
      <div className="message-window-empty">
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>Welcome to UltraChat</h3>
          <p>Select a conversation to start messaging</p>
          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>End-to-End Encrypted</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <span>Local Data Only</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Cross-Platform</span>
            </div>
          </div>
          {/* Add New Chat Button */}
          <button 
            className="new-chat-btn-large"
            onClick={() => window.dispatchEvent(new CustomEvent('openNewChat'))}
          >
            🆕 Start New Chat
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="message-window">
      {/* Header */}
      <div className="message-header">
        <div className="contact-info">
          <div className="contact-avatar">
            {selectedChat.name.charAt(0).toUpperCase()}
          </div>
          <div className="contact-details">
            <h3 className="contact-name">{selectedChat.name}</h3>
            <div className="contact-meta">
              <span className="contact-handle">{selectedChat.handle}</span>
              <span 
                className="profile-mode"
                style={{ color: getProfileModeColor(selectedChat.profileMode) }}
              >
                {selectedChat.profileMode}
              </span>
              {selectedChat.trustScore > 0 && (
                <span className="trust-indicator">
                  Trust: {selectedChat.trustScore}%
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          {/* Add New Chat Button to Header */}
          <button 
            className="header-btn new-chat-btn"
            title="New Chat"
            onClick={() => window.dispatchEvent(new CustomEvent('openNewChat'))}
          >
            🆕
          </button>
          <button 
            className="header-btn voice-call-btn" 
            title="Voice Call"
            onClick={handleVoiceCall}
            disabled={!FEATURE_FLAGS.VIDEO_CALLS || callState !== CALL_STATES.IDLE}
          >
            📞
          </button>
          <button 
            className="header-btn video-call-btn" 
            title="Video Call"
            onClick={handleVideoCall}
            disabled={!FEATURE_FLAGS.VIDEO_CALLS || callState !== CALL_STATES.IDLE}
          >
            📹
          </button>
          <button 
            className="header-btn profile-btn" 
            title="View Profile"
            onClick={() => window.dispatchEvent(new CustomEvent('openProfile'))}
          >
            👤
          </button>
          <button 
            className="header-btn more-btn" 
            title="More Options"
          >
            ⋯
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map(message => (
            <SpamDetectionWrapper
              key={message.id}
              user={{
                id: message.senderId,
                username: message.senderName,
                trustLevel: message.senderId === 'me' ? currentUser.trustLevel : (selectedChat.trustScore || 0)
              }}
              message={{
                content: message.content,
                id: message.id,
                timestamp: message.timestamp
              }}
              onSpamDetected={(result, user, msg) => {
                console.log('🚨 Spam detected:', { result, user, msg })
                // Handle spam detection - message will be blocked automatically
              }}
              onMessageBlocked={(blockInfo) => {
                console.log('🚫 Message blocked:', blockInfo)
                // Optionally show notification to moderators
              }}
            >
              <div
                className={`message ${message.senderId === 'me' ? 'sent' : 'received'} ${message.isAutoReply ? 'auto-reply' : ''}`}
                onMouseEnter={() => handleMessageAction(message.id, 'show')}
                onMouseLeave={() => handleMessageAction(message.id, 'hide')}
              >
                <div className="message-content">
                  <div className="message-bubble">
                    {message.isAutoReply && (
                      <div className="auto-reply-tag">
                        <span className="auto-icon">🤖</span>
                        <span className="auto-text">Auto</span>
                      </div>
                    )}
                    <p className={message.isAutoReply ? 'auto-reply-text' : ''}>
                      {message.content}
                      {message.edited && <span className="edited-indicator"> (edited)</span>}
                    </p>
                    <div className="message-meta">
                      <span className="message-time">
                        {formatMessageTime(message.timestamp)}
                      </span>
                      {message.senderId === 'me' && (
                        <span className="message-status">
                          {getStatusIcon(message.status)}
                        </span>
                      )}
                      {message.isEncrypted && (
                        <span className="encryption-indicator">🔒</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Message Actions */}
                  {showMessageActions[message.id] && (
                    <div className="message-actions">
                      <button 
                        className="action-btn tip-btn" 
                        onClick={() => handleTipMessage(message)}
                        title="Send Tip"
                      >
                        💰
                      </button>
                      {message.senderId === 'me' && (
                        <>
                          <button 
                            className="action-btn edit-btn" 
                            onClick={() => handleEditMessage(message)}
                            title="Edit Message"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete-btn" 
                            onClick={() => handleDeleteMessage(message)}
                            title="Delete Message"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      <button 
                        className="action-btn reply-btn" 
                        onClick={() => setNewMessage(`@${message.senderName}: `)}
                        title="Reply"
                      >
                        ↩️
                      </button>
                      
                      {/* Moderation Controls - for other users' messages */}
                      {message.senderId !== 'me' && (
                        <ModerationControls
                          targetUser={{
                            id: message.senderId,
                            username: message.senderName,
                            trustLevel: selectedChat.trustScore || 0
                          }}
                          currentUser={currentUser}
                          onModerationAction={(action, user, result) => {
                            console.log(`⚖️ Moderation action ${action} applied to ${user.username}:`, result)
                            // Refresh message list or update UI as needed
                          }}
                          showQuickActions={true}
                          isInline={true}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </SpamDetectionWrapper>
          ))}
          
          {isTyping && (
            <div className="message received">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="message-input-container">
        {/* Quick Auto-Reply Component */}
        {showAutoReply && (
          <QuickAutoReply
            autoReplyManager={autoReplyManager}
            onSendReply={handleAutoReply}
            isVisible={showAutoReply}
          />
        )}
        
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="input-wrapper">
            <div className="input-actions-left">
              <button type="button" className="input-btn attachment-btn" title="Attach File">
                📎
              </button>
              <button type="button" className="input-btn emoji-btn" title="Add Emoji">
                😊
              </button>
              <button 
                type="button" 
                className={`input-btn auto-reply-btn ${showAutoReply ? 'active' : ''}`}
                title="Quick Auto-Replies"
                onClick={() => setShowAutoReply(!showAutoReply)}
              >
                🤖
              </button>
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type an encrypted message..."
              className="message-input"
            />
            <div className="input-actions-right">
              <button 
                type="button" 
                className="input-btn voice-record-btn" 
                title="Voice Message"
              >
                🎙️
              </button>
              <button 
                type="submit" 
                className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
                disabled={!newMessage.trim()}
                title="Send Message"
              >
                ➤
              </button>
            </div>
          </div>
        </form>
        
        {/* Quick Actions Bar */}
        <div className="quick-actions">
          <button className="quick-action-btn" title="Send Crypto Tip">
            💰
          </button>
          <button className="quick-action-btn" title="Send Location">
            📍
          </button>
          <button className="quick-action-btn" title="Send Photo">
            📷
          </button>
          <button className="quick-action-btn" title="Send Document">
            📄
          </button>
          <button className="quick-action-btn" title="Schedule Message">
            ⏰
          </button>
        </div>
      </div>

      {/* Call Modal - RE-ENABLED */}
      {FEATURE_FLAGS.VIDEO_CALLS && (
        <CallModal
          callManager={callManager}
          callState={callState}
          currentCall={currentCall ? { ...currentCall, contactName: selectedChat?.name } : null}
          onEndCall={handleEndCall}
          onAcceptCall={handleAcceptCall}
          onRejectCall={handleRejectCall}
        />
      )}
      
      {/* Crypto Tip Modal */}
      {showTipModal && (
        <div className="modal-overlay" onClick={() => setShowTipModal(null)}>
          <div className="tip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>💰 Send Crypto Tip</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowTipModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <TipModalContent 
                message={showTipModal}
                onConfirm={handleConfirmTip}
                onCancel={() => setShowTipModal(null)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Message Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(null)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Message</h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setShowEditModal(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <EditModalContent 
                message={showEditModal}
                onConfirm={handleConfirmEdit}
                onCancel={() => setShowEditModal(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MessageWindow
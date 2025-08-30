import React, { useState, useEffect, useRef } from 'react'
import './MessageWindow.css'

const MessageWindow = ({ selectedChat }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !selectedChat) return

    const message = {
      id: Date.now().toString(),
      senderId: 'me',
      senderName: 'You',
      content: newMessage.trim(),
      timestamp: new Date(),
      isEncrypted: true,
      status: 'sending'
    }

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

    // Simulate typing indicator and response (for demo)
    if (selectedChat.id !== 'me') {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const response = {
          id: (Date.now() + 1).toString(),
          senderId: selectedChat.id,
          senderName: selectedChat.name,
          content: 'Thanks for your message! I\'ll get back to you soon.',
          timestamp: new Date(),
          isEncrypted: true,
          status: 'delivered'
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
              <span>Privacy First</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span>Cross-Platform</span>
            </div>
          </div>
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
          <button className="header-btn" title="Voice Call">📞</button>
          <button className="header-btn" title="Video Call">📹</button>
          <button className="header-btn" title="More Options">⋯</button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <div className="messages-list">
          {messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.senderId === 'me' ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <div className="message-bubble">
                  <p>{message.content}</p>
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
              </div>
            </div>
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
        <form onSubmit={handleSendMessage} className="message-form">
          <div className="input-wrapper">
            <button type="button" className="attachment-btn" title="Attach File">
              📎
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="message-input"
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!newMessage.trim()}
              title="Send Message"
            >
              ➤
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  function getProfileModeColor(mode) {
    switch (mode) {
      case 'Ultra': return 'var(--color-mode-ultra)'
      case 'Public': return 'var(--color-mode-public)'
      case 'Anon': return 'var(--color-mode-anon)'
      case 'Basic': return 'var(--color-mode-basic)'
      default: return 'var(--color-text-muted)'
    }
  }
}

export default MessageWindow
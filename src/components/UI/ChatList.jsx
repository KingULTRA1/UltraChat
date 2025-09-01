import { useState, useEffect } from 'react'
import './ChatList.css'

// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

// New Chat Form Component
const NewChatForm = ({ type, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    handle: '',
    name: '',
    profileMode: 'Basic',
    groupMembers: [],
    memberInput: ''
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (type === 'discord') {
      await handleDiscordConnection()
    } else if (type === 'group') {
      await handleGroupCreation()
    } else if (formData.handle.trim()) {
      onSubmit({
        ...formData,
        type,
        trustScore: type === 'qr' ? 50 : 0
      })
    }
  }
  
  const handleGroupCreation = async () => {
    if (formData.groupMembers.length < 2) {
      alert('Please add at least 2 members to create a group')
      return
    }
    
    onSubmit({
      name: formData.name || 'New Group Chat',
      type: 'group',
      members: formData.groupMembers,
      handle: `group://${Date.now()}`,
      trustScore: 0
    })
  }
  
  const addGroupMember = () => {
    if (formData.memberInput.trim() && !formData.groupMembers.includes(formData.memberInput.trim())) {
      setFormData({
        ...formData,
        groupMembers: [...formData.groupMembers, formData.memberInput.trim()],
        memberInput: ''
      })
    }
  }
  
  const removeGroupMember = (member) => {
    setFormData({
      ...formData,
      groupMembers: formData.groupMembers.filter(m => m !== member)
    })
  }

  const handleDiscordConnection = async () => {
    if (!formData.handle.trim()) {
      alert('Please enter your Discord username or ID')
      return
    }

    setIsConnecting(true)
    setConnectionStatus('Connecting to Discord...')

    try {
      // Import Discord service dynamically
      const { default: DiscordService } = await import('../../services/Messaging/DiscordService')
      
      // Validate Discord ID format
      const validation = DiscordService.validateDiscordId(formData.handle)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      setConnectionStatus('Validating Discord user...')
      
      // Create Discord service instance
      const discordService = new DiscordService()
      
      // Attempt connection
      const result = await discordService.connect(formData.handle)
      
      if (result.success) {
        setConnectionStatus('Connected! Creating chat...')
        
        // Create the chat with Discord connection info
        onSubmit({
          handle: `discord://${formData.handle}`,
          name: formData.name || `Discord: ${formData.handle}`,
          type: 'discord',
          trustScore: 78,
          platform: 'discord',
          connectionId: result.connectionId,
          instructions: result.botInstructions
        })
      }
    } catch (error) {
      console.error('Discord connection failed:', error)
      setConnectionStatus('Connection failed: ' + error.message)
      
      setTimeout(() => {
        setConnectionStatus(null)
        setIsConnecting(false)
      }, 3000)
    }
  }

  return (
    <form className="new-chat-form" onSubmit={handleSubmit}>
      {type === 'handle' && (
        <>
          <input
            type="text"
            placeholder="@username, phone, or email"
            value={formData.handle}
            onChange={(e) => setFormData({...formData, handle: e.target.value})}
            required
          />
          <input
            type="text"
            placeholder="Display name (optional)"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </>
      )}
      
      {type === 'qr' && (
        <div className="platform-auth qr-auth">
          <div className="platform-icon">📱</div>
          <h3>Connect via QR Code</h3>
          
          <div className="platform-instructions">
            <p>To connect via QR code:</p>
            <ol>
              <li>Open UltraChat on your other device</li>
              <li>Go to Settings → Backup & Sync</li>
              <li>Generate QR code for this device</li>
              <li>Click &#34;Start Scanning&#34; to use camera</li>
            </ol>
          </div>
          
          <div className="qr-preview">
            <div className="qr-placeholder">
              <span className="qr-icon">📷</span>
              <p>Camera will open when you click &#34;Start Scanning&#34;</p>
            </div>
          </div>
        </div>
      )}
      
      {type === 'discord' && (
        <div className="platform-auth discord-auth">
          <div className="platform-icon">🎮</div>
          <h3>Connect via Discord</h3>
          
          {isConnecting ? (
            <div className="connection-status">
              <div className="loading-spinner"></div>
              <p>{connectionStatus}</p>
            </div>
          ) : (
            <>
              <div className="platform-instructions">
                <p>To connect via Discord:</p>
                <ol>
                  <li>Make sure you have Discord open</li>
                  <li>Enter your Discord username or user ID below</li>
                  <li>Click Connect to start the process</li>
                  <li>Follow the bot instructions in Discord</li>
                </ol>
              </div>
              <div className="form-group">
                <label>Discord Username or ID</label>
                <input
                  type="text"
                  placeholder="username#1234 or @username or 123456789012345678"
                  value={formData.handle}
                  onChange={(e) => setFormData({...formData, handle: e.target.value})}
                  required
                />
                <small>Format: username#1234, @username, or numeric user ID</small>
              </div>
              <div className="form-group">
                <label>Display Name (Optional)</label>
                <input
                  type="text"
                  placeholder="How you want to appear in UltraChat"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </>
          )}
        </div>
      )}
      
      {type === 'group' && (
        <div className="platform-auth group-auth">
          <div className="platform-icon">👥</div>
          <h3>Create Group Chat</h3>
          
          <div className="form-group">
            <label>Group Name</label>
            <input
              type="text"
              placeholder="Enter group name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Add Members</label>
            <div className="member-input-container">
              <input
                type="text"
                placeholder="Enter username, phone, or email"
                value={formData.memberInput}
                onChange={(e) => setFormData({...formData, memberInput: e.target.value})}
              />
              <button type="button" onClick={addGroupMember}>Add</button>
            </div>
            
            {formData.groupMembers.length > 0 && (
              <div className="group-members-list">
                <h4>Members ({formData.groupMembers.length}):</h4>
                <ul>
                  {formData.groupMembers.map((member, index) => (
                    <li key={index}>
                      {member}
                      <button 
                        type="button" 
                        onClick={() => removeGroupMember(member)}
                        className="remove-member-btn"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {type === 'discord' ? 'Connect to Discord' : 
           type === 'group' ? 'Create Group' : 
           type === 'qr' ? 'Start Scanning' : 
           'Start Chat'}
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

const ChatList = ({ 
  onChatSelect, 
  selectedChat, 
  collapsed, 
  hovered,
  currentUser,
  trustManager
}) => {
  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'Alice Cooper',
      lastMessage: 'Hey! How are you doing?',
      timestamp: new Date(Date.now() - 3600000),
      unread: 2,
      trustScore: 95,
      type: 'direct'
    },
    {
      id: '2',
      name: 'Bob Smith',
      lastMessage: 'Meeting at 3pm tomorrow',
      timestamp: new Date(Date.now() - 7200000),
      unread: 0,
      trustScore: 87,
      type: 'direct'
    },
    {
      id: '3',
      name: 'Dev Team',
      lastMessage: 'Charlie: PR #1234 merged',
      timestamp: new Date(Date.now() - 1800000),
      unread: 5,
      trustScore: 92,
      type: 'group'
    }
  ])
  
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatType, setNewChatType] = useState('handle')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter chats based on search term
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleNewChatSubmit = (chatData) => {
    // Create new chat object
    const newChat = {
      id: Date.now().toString(),
      name: chatData.name || chatData.handle,
      lastMessage: 'New chat started',
      timestamp: new Date(),
      unread: 0,
      trustScore: chatData.trustScore || 50,
      type: chatData.type,
      handle: chatData.handle
    }
    
    // Add to chats list
    setChats([newChat, ...chats])
    
    // Select the new chat
    onChatSelect(newChat)
    
    // Close new chat form
    setShowNewChat(false)
  }

  const handleNewChatCancel = () => {
    setShowNewChat(false)
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - date
    
    // If today
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // If yesterday
    if (diff < 48 * 60 * 60 * 1000) {
      return 'Yesterday'
    }
    
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getTrustColor = (score) => {
    if (score >= 90) return '#4CAF50' // Green
    if (score >= 75) return '#2196F3' // Blue
    if (score >= 50) return '#FF9800' // Orange
    return '#F44336' // Red
  }

  return (
    <div className={`chat-list ${collapsed ? 'collapsed' : 'expanded'} ${hovered ? 'hovered' : ''}`}>
      {/* Header */}
      <div className="chat-list-header">
        <h2>Chats</h2>
        <button 
          className="new-chat-btn"
          onClick={() => setShowNewChat(true)}
          title="New Chat"
        >
          +
        </button>
      </div>
      
      {/* Search */}
      {!collapsed && (
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      
      {/* New Chat Form */}
      {showNewChat && (
        <div className="new-chat-overlay">
          <div className="new-chat-modal">
            <div className="modal-header">
              <h3>Create New Chat</h3>
              <button 
                className="close-btn" 
                onClick={() => setShowNewChat(false)}
              >
                ×
              </button>
            </div>
            
            {!newChatType ? (
              <div className="chat-type-selector">
                <h4>Select Chat Type</h4>
                <div className="chat-type-options">
                  <button 
                    className="chat-type-option"
                    onClick={() => setNewChatType('handle')}
                  >
                    <span className="icon">👤</span>
                    <span>Direct Chat</span>
                    <small>Chat with a user via handle, phone, or email</small>
                  </button>
                  
                  <button 
                    className="chat-type-option"
                    onClick={() => setNewChatType('qr')}
                  >
                    <span className="icon">📱</span>
                    <span>QR Connect</span>
                    <small>Connect via QR code from another device</small>
                  </button>
                  
                  <button 
                    className="chat-type-option"
                    onClick={() => setNewChatType('discord')}
                  >
                    <span className="icon">🎮</span>
                    <span>Discord</span>
                    <small>Connect via Discord bot</small>
                  </button>
                  
                  <button 
                    className="chat-type-option"
                    onClick={() => setNewChatType('group')}
                  >
                    <span className="icon">👥</span>
                    <span>Group Chat</span>
                    <small>Create a new group with multiple members</small>
                  </button>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn" 
                    onClick={() => setShowNewChat(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <NewChatForm 
                type={newChatType}
                onSubmit={handleNewChatSubmit}
                onCancel={handleNewChatCancel}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Chat List */}
      <div className="chat-items">
        {filteredChats.map(chat => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
            onClick={() => onChatSelect(chat)}
          >
            <div className="chat-avatar">
              {chat.type === 'group' ? '👥' : '👤'}
            </div>
            
            <div className="chat-info">
              <div className="chat-header">
                <h4>{chat.name}</h4>
                <span className="chat-time">{formatTime(chat.timestamp)}</span>
              </div>
              
              <div className="chat-preview">
                <p>{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="unread-badge">{chat.unread}</span>
                )}
              </div>
            </div>
            
            <div className="chat-meta">
              <div 
                className="trust-indicator"
                style={{ color: getTrustColor(chat.trustScore) }}
                title={`Trust Score: ${chat.trustScore}`}
              >
                ●
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      {!collapsed && (
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => {
              setNewChatType(null)
              setShowNewChat(true)
            }}
            title="New Chat"
          >
            🆕 New Chat
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => {
              // Trigger voice call
              window.dispatchEvent(new CustomEvent('callEvent', {
                detail: { type: 'voice', chatId: selectedChat?.id }
              }))
            }}
            title="Voice Call"
            disabled={!selectedChat}
          >
            📞 Voice Call
          </button>
          
          <button 
            className="quick-action-btn"
            onClick={() => {
              // Trigger video call
              window.dispatchEvent(new CustomEvent('callEvent', {
                detail: { type: 'video', chatId: selectedChat?.id }
              }))
            }}
            title="Video Call"
            disabled={!selectedChat}
          >
            🎥 Video Call
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatList
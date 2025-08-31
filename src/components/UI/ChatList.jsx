import React, { useState, useEffect } from 'react'
import './ChatList.css'

// 🚀 UltraChat v1.2.3 Alpha - PRIVACY FIRST

// New Chat Form Component
const NewChatForm = ({ type, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    handle: '',
    name: '',
    profileMode: 'Basic'
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (type === 'discord') {
      await handleDiscordConnection()
    } else if (formData.handle.trim()) {
      onSubmit({
        ...formData,
        type,
        trustScore: type === 'qr' ? 50 : 0
      })
    }
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
              <li>Click "Start Scanning" to use camera</li>
            </ol>
          </div>
          
          <div className="qr-preview">
            <div className="qr-placeholder">
              <span className="qr-icon">📷</span>
              <p>Camera will open when you click "Start Scanning"</p>
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
      
      {['telegram', 'twitter'].includes(type) && (
        <div className="platform-auth">
          <div className="platform-icon">
            {type === 'telegram' ? '✈️' : '🐦'}
          </div>
          <h3>Connect via {type.charAt(0).toUpperCase() + type.slice(1)}</h3>
          <div className="platform-instructions">
            <p>To connect via {type}:</p>
            <ol>
              <li>Open {type} app</li>
              <li>Find the UltraChat bot</li>
              <li>Send command: <code>/connect</code></li>
              <li>Follow the bot's instructions</li>
            </ol>
          </div>
          <div className="form-group">
            <label>{type.charAt(0).toUpperCase() + type.slice(1)} Username/ID</label>
            <input
              type="text"
              placeholder={`Your ${type} username or ID`}
              value={formData.handle}
              onChange={(e) => setFormData({...formData, handle: e.target.value})}
              required
            />
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onCancel} disabled={isConnecting}>Cancel</button>
        <button 
          type="submit" 
          disabled={(!formData.handle.trim() && type !== 'qr') || isConnecting}
        >
          {isConnecting ? 'Connecting...' :
           type === 'qr' ? 'Start Scanning' : 
           type === 'discord' ? 'Connect to Discord' :
           ['telegram', 'twitter'].includes(type) ? 'Connect' : 
           'Connect'}
        </button>
      </div>
    </form>
  )
}

const ChatList = ({ onChatSelect, selectedChat, collapsed = false, hovered = false, currentUser, trustManager }) => {
  const [chats, setChats] = useState([])
  const [filteredChats, setFilteredChats] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatType, setNewChatType] = useState('handle')
  const [trustScores, setTrustScores] = useState(new Map())
  const [cryptoTipData, setCryptoTipData] = useState(new Map())
  const [auditData, setAuditData] = useState(new Map())

  // Enhanced mock chat data with v1.2.3 Alpha features
  useEffect(() => {
    const mockChats = [
      {
        id: '1',
        name: 'Alice Cooper',
        handle: '@alice_ultra',
        lastMessage: 'Hey! Just shared the contract PDF 📄 + sent 0.001 BTC tip 💰',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        unreadCount: 2,
        isOnline: true,
        profileMode: 'Ultra',
        trustScore: 95,
        isEncrypted: true,
        hasFiles: true,
        fileTypes: ['pdf', 'doc'],
        hasCryptoActivity: true,
        totalTipsReceived: 15,
        totalTipsSent: 8,
        botBridgeActive: false,
        auditEntriesCount: 247
      },
      {
        id: '2',
        name: 'Bob Smith (Discord)',
        handle: 'discord://bob_smith#1234',
        lastMessage: 'Meeting recording ready 🎥 (via Discord Bridge)',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        unreadCount: 0,
        isOnline: true,
        profileMode: 'Public',
        trustScore: 87,
        isEncrypted: true,
        hasFiles: true,
        fileTypes: ['mp4', 'mp3'],
        hasCryptoActivity: false,
        botBridgeActive: true,
        bridgePlatform: 'discord',
        auditEntriesCount: 156
      },
      {
        id: '3',
        name: 'Anonymous User',
        handle: 'anon_12345',
        lastMessage: 'Thanks for the secure doc 🔒 Tip: 0.05 ETH sent ⚡',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: false,
        profileMode: 'Anon',
        trustScore: 0,
        isEncrypted: true,
        hasCryptoActivity: true,
        totalTipsReceived: 3,
        totalTipsSent: 1,
        auditEntriesCount: 45
      },
      {
        id: '4',
        name: 'Charlie Wilson (Telegram)',
        handle: 'telegram://+1-555-0123',
        lastMessage: 'Can we reschedule? Sent audio note 🎵 (via Telegram Bridge)',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unreadCount: 1,
        isOnline: false,
        profileMode: 'Basic',
        trustScore: 76,
        isEncrypted: true,
        hasFiles: true,
        fileTypes: ['mp3'],
        botBridgeActive: true,
        bridgePlatform: 'telegram',
        auditEntriesCount: 89
      },
      {
        id: '5',
        name: 'Legacy Chat Archive',
        handle: 'legacy_backup',
        lastMessage: 'Imported: 247 messages, 15 files, 12 crypto transactions',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: false,
        profileMode: 'Ultra',
        trustScore: 100,
        isEncrypted: true,
        isLegacy: true,
        hasFiles: true,
        fileTypes: ['pdf', 'doc', 'jpg', 'mp3', 'mp4'],
        hasCryptoActivity: true,
        totalTipsReceived: 25,
        totalTipsSent: 12,
        auditEntriesCount: 512
      },
      {
        id: '6',
        name: 'Diana Ross (High Trust)',
        handle: '@diana_dev',
        lastMessage: 'Code review complete ✅ Moderated 3 operations today',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        unreadCount: 3,
        isOnline: true,
        profileMode: 'Ultra',
        trustScore: 92,
        isEncrypted: true,
        hasFiles: true,
        fileTypes: ['zip', 'js', 'md'],
        isModerator: true,
        moderationCount: 3,
        auditEntriesCount: 334
      },
      {
        id: '7',
        name: 'Signal Bridge User',
        handle: 'signal://+1-555-9999',
        lastMessage: 'Cross-platform message delivered + DOGE tip 🐕',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        unreadCount: 0,
        isOnline: true,
        profileMode: 'Public',
        trustScore: 85,
        isEncrypted: true,
        botBridgeActive: true,
        bridgePlatform: 'signal',
        hasCryptoActivity: true,
        totalTipsReceived: 7,
        auditEntriesCount: 123
      },
      {
        id: '8',
        name: 'Twitter Bridge Bot',
        handle: 'twitter://UltraChat_Bot',
        lastMessage: 'QR login successful! Welcome back 🚀 SOL tip received',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        unreadCount: 1,
        isOnline: false,
        profileMode: 'Public',
        trustScore: 78,
        isEncrypted: true,
        botBridgeActive: true,
        bridgePlatform: 'twitter',
        hasCryptoActivity: true,
        totalTipsReceived: 4,
        auditEntriesCount: 67
      }
    ]
    setChats(mockChats)
    setFilteredChats(mockChats)
    
    // Load additional v1.2.3 Alpha data
    loadEnhancedChatData(mockChats)
  }, [currentUser, trustManager])

  // Load enhanced v1.2.3 Alpha chat data
  const loadEnhancedChatData = async (chats) => {
    try {
      // Load real-time trust scores if available
      if (trustManager) {
        const trustPromises = chats.map(async (chat) => {
          try {
            const score = await trustManager.calculateTrustScore(chat.id)
            return [chat.id, score]
          } catch {
            return [chat.id, { score: chat.trustScore, level: 'unknown' }]
          }
        })
        
        const trustResults = await Promise.allSettled(trustPromises)
        const trustMap = new Map()
        trustResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            trustMap.set(result.value[0], result.value[1])
          }
        })
        setTrustScores(trustMap)
      }
      
      // Load crypto tip data
      if (window.UltraChat?.cryptoTipping) {
        const cryptoMap = new Map()
        for (const chat of chats) {
          if (chat.hasCryptoActivity) {
            try {
              const tipStats = await window.UltraChat.cryptoTipping.getTipStatistics(chat.id)
              cryptoMap.set(chat.id, tipStats)
            } catch (error) {
              console.error(`Failed to load crypto data for ${chat.id}:`, error)
            }
          }
        }
        setCryptoTipData(cryptoMap)
      }
      
      // Load audit data
      if (window.UltraChat?.auditManager) {
        const auditMap = new Map()
        for (const chat of chats) {
          try {
            const auditEntries = await window.UltraChat.auditManager.getAuditEntries(chat.id, { limit: 10 })
            auditMap.set(chat.id, {
              total: auditEntries.length,
              recent: auditEntries.filter(entry => 
                Date.now() - new Date(entry.timestamp).getTime() < 24 * 60 * 60 * 1000
              ).length
            })
          } catch (error) {
            console.error(`Failed to load audit data for ${chat.id}:`, error)
          }
        }
        setAuditData(auditMap)
      }
    } catch (error) {
      console.error('Failed to load enhanced chat data:', error)
    }
  }

  // Filter chats based on search query with enhanced v1.2.3 features
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = chats.filter(chat => 
        chat.name.toLowerCase().includes(query) ||
        chat.handle.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query) ||
        (chat.bridgePlatform && chat.bridgePlatform.toLowerCase().includes(query)) ||
        (chat.fileTypes && chat.fileTypes.some(type => type.toLowerCase().includes(query))) ||
        (chat.hasCryptoActivity && 'crypto'.includes(query)) ||
        (chat.isModerator && 'moderator'.includes(query))
      )
      setFilteredChats(filtered)
    }
  }, [searchQuery, chats])

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return timestamp.toLocaleDateString()
  }

  const getProfileModeColor = (mode) => {
    switch (mode) {
      case 'Ultra': return 'var(--color-mode-ultra)'
      case 'Public': return 'var(--color-mode-public)'
      case 'Anon': return 'var(--color-mode-anon)'
      case 'Basic': return 'var(--color-mode-basic)'
      default: return 'var(--color-text-muted)'
    }
  }

  const getTrustScoreColor = (chat) => {
    const trustData = trustScores.get(chat.id)
    const score = trustData ? trustData.score : chat.trustScore
    
    if (score >= 90) return 'var(--color-success)'
    if (score >= 70) return 'var(--color-accent-teal)'
    if (score >= 50) return 'var(--color-warning)'
    return 'var(--color-text-muted)'
  }

  const getBridgePlatformIcon = (platform) => {
    const icons = {
      discord: '🎮',
      telegram: '✈️',
      twitter: '🐦',
      signal: '📱'
    }
    return icons[platform] || '🌐'
  }

  const getCryptoActivityIndicator = (chat) => {
    if (!chat.hasCryptoActivity) return null
    
    const tipData = cryptoTipData.get(chat.id)
    const totalTips = (chat.totalTipsReceived || 0) + (chat.totalTipsSent || 0)
    
    if (totalTips > 20) return '💎' // Diamond for high activity
    if (totalTips > 10) return '💰' // Money bag for medium activity
    return '💸' // Money with wings for low activity
  }

  const getModerationIndicator = (chat) => {
    if (!chat.isModerator) return null
    return (
      <span className="moderation-badge" title={`Moderator - ${chat.moderationCount || 0} operations today`}>
        ⚖️
      </span>
    )
  }

  const handleNewChat = () => {
    setShowNewChatModal(true)
  }

  const handleCreateChat = (chatData) => {
    const newChat = {
      id: Date.now().toString(),
      name: chatData.name || (chatData.handle.startsWith('@') ? chatData.handle.substring(1) : chatData.handle),
      handle: chatData.handle,
      lastMessage: 'New conversation started',
      timestamp: new Date(),
      unreadCount: 0,
      isOnline: chatData.type === 'qr' || ['discord', 'telegram', 'twitter', 'signal'].includes(chatData.type),
      profileMode: chatData.profileMode || 'Basic',
      trustScore: chatData.trustScore || 0,
      isEncrypted: true,
      botBridgeActive: ['discord', 'telegram', 'twitter', 'signal'].includes(chatData.type),
      bridgePlatform: ['discord', 'telegram', 'twitter', 'signal'].includes(chatData.type) ? chatData.type : null,
      hasCryptoActivity: false,
      auditEntriesCount: 1
    }
    
    setChats(prev => [newChat, ...prev])
    setFilteredChats(prev => [newChat, ...prev])
    onChatSelect(newChat)
    setShowNewChatModal(false)
    
    // Log new chat creation in audit trail
    if (window.UltraChat?.auditManager) {
      window.UltraChat.auditManager.logConversationAction('created', {
        chatId: newChat.id,
        chatName: newChat.name,
        chatType: chatData.type,
        botBridge: newChat.botBridgeActive
      }, currentUser || { id: 'current_user' })
    }
  }

  return (
    <div className={`chat-list ${collapsed ? 'collapsed' : 'expanded'} ${hovered ? 'hovered' : ''}`}>
      {/* Header */}
      <div className="chat-list-header">
        <h2 className={`chat-list-title ${collapsed && !hovered ? 'hidden' : 'visible'}`}>
          {collapsed && !hovered ? '' : 'Conversations'}
        </h2>
        <div className="header-actions">
          {(!collapsed || hovered) && (
            <button 
              className="settings-btn" 
              title="Settings" 
              onClick={() => window.dispatchEvent(new CustomEvent('openSettings'))}
            >
              ⚙️
            </button>
          )}
          <button 
            className="new-chat-btn" 
            title="New Chat" 
            onClick={handleNewChat}
          >
            {collapsed && !hovered ? '+' : '+'}
          </button>
        </div>
      </div>

      {/* Search - Hidden when collapsed unless hovered */}
      {(!collapsed || hovered) && (
        <div className="chat-search">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      )}

      {/* Chat List */}
      <div className="chats-container">
        {filteredChats.length === 0 ? (
          <div className="no-chats">
            <p>No conversations found</p>
            <button className="btn btn-primary" onClick={handleNewChat}>Start New Chat</button>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              {/* Enhanced Avatar and Status with v1.2.3 indicators */}
              <div className="chat-avatar">
                <div 
                  className={`avatar-circle ${
                    chat.isLegacy ? 'legacy-chat' : ''
                  } ${
                    chat.botBridgeActive ? 'bot-bridge' : ''
                  }`}
                  title={collapsed && !hovered ? `${chat.name} (${chat.handle})` : ''}
                >
                  {chat.isLegacy ? '📁' : 
                   chat.botBridgeActive ? getBridgePlatformIcon(chat.bridgePlatform) :
                   chat.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Enhanced status indicators */}
                {chat.isOnline && <div className="online-indicator"></div>}
                {chat.hasFiles && (
                  <div className="file-indicator" title={`Files: ${chat.fileTypes?.join(', ')}`}>
                    📄
                  </div>
                )}
                {getCryptoActivityIndicator(chat) && (
                  <div className="crypto-indicator" title={`Crypto tips: ${(chat.totalTipsReceived || 0) + (chat.totalTipsSent || 0)}`}>
                    {getCryptoActivityIndicator(chat)}
                  </div>
                )}
                {getModerationIndicator(chat)}
              </div>

              {/* Chat Info */}
              <div className="chat-info">
                <div className="chat-header">
                  <span className="chat-name">{chat.name}</span>
                  <span className="chat-timestamp">{formatTimestamp(chat.timestamp)}</span>
                </div>
                
                <div className="chat-details">
                  <span className="chat-handle">{chat.handle}</span>
                  <div className="chat-badges">
                    <span 
                      className="profile-mode-badge"
                      style={{ color: getProfileModeColor(chat.profileMode) }}
                    >
                      {chat.profileMode}
                    </span>
                    
                    {/* Enhanced trust score with real-time data */}
                    {chat.trustScore > 0 && (
                      <span 
                        className="trust-score"
                        style={{ color: getTrustScoreColor(chat) }}
                        title={`Trust Score: ${trustScores.get(chat.id)?.score || chat.trustScore}% (${trustScores.get(chat.id)?.level || 'calculated'})`}
                      >
                        {trustScores.get(chat.id)?.score || chat.trustScore}%
                      </span>
                    )}
                    
                    {/* Bot Bridge indicator */}
                    {chat.botBridgeActive && (
                      <span className="bridge-badge" title={`Connected via ${chat.bridgePlatform}`}>
                        🌐
                      </span>
                    )}
                    
                    {/* Audit activity indicator */}
                    {auditData.get(chat.id)?.recent > 0 && (
                      <span className="audit-badge" title={`${auditData.get(chat.id)?.recent} recent audit entries`}>
                        📊
                      </span>
                    )}
                  </div>
                </div>

                <div className="chat-preview">
                  <span className="last-message">{chat.lastMessage}</span>
                  <div className="chat-meta">
                    {chat.isEncrypted && <span className="encryption-icon">🔒</span>}
                    {chat.hasCryptoActivity && <span className="crypto-meta-icon">💰</span>}
                    {chat.unreadCount > 0 && (
                      <span className="unread-count">{chat.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="new-chat-modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="new-chat-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start New Chat</h3>
              <button onClick={() => setShowNewChatModal(false)}>✕</button>
            </div>
            
            <div className="chat-type-selector">
              <button 
                className={`type-btn ${newChatType === 'handle' ? 'active' : ''}`}
                onClick={() => setNewChatType('handle')}
              >
                📱 Handle/Phone
              </button>
              <button 
                className={`type-btn ${newChatType === 'qr' ? 'active' : ''}`}
                onClick={() => setNewChatType('qr')}
              >
                📱 QR Code
              </button>
              <button 
                className={`type-btn ${newChatType === 'discord' ? 'active' : ''}`}
                onClick={() => setNewChatType('discord')}
              >
                🎮 Discord
              </button>
              <button 
                className={`type-btn ${newChatType === 'telegram' ? 'active' : ''}`}
                onClick={() => setNewChatType('telegram')}
              >
                ✈️ Telegram
              </button>
              <button 
                className={`type-btn ${newChatType === 'twitter' ? 'active' : ''}`}
                onClick={() => setNewChatType('twitter')}
              >
                🐦 Twitter/X
              </button>
            </div>

            <NewChatForm 
              type={newChatType} 
              onSubmit={handleCreateChat}
              onCancel={() => setShowNewChatModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatList
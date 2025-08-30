import React, { useState, useEffect } from 'react'
import './ChatList.css'

const ChatList = ({ onChatSelect, selectedChat }) => {
  const [chats, setChats] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredChats, setFilteredChats] = useState([])

  // Mock chat data - In real app, this would come from encrypted local storage
  useEffect(() => {
    const mockChats = [
      {
        id: '1',
        name: 'Alice Cooper',
        handle: '@alice_ultra',
        lastMessage: 'Hey, how are you doing?',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        unreadCount: 2,
        isOnline: true,
        profileMode: 'Ultra',
        trustScore: 95,
        isEncrypted: true
      },
      {
        id: '2',
        name: 'Bob Smith',
        handle: 'x.com/bobsmith',
        lastMessage: 'The meeting is scheduled for tomorrow',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        unreadCount: 0,
        isOnline: true,
        profileMode: 'Public',
        trustScore: 87,
        isEncrypted: true
      },
      {
        id: '3',
        name: 'Anonymous User',
        handle: 'anon_12345',
        lastMessage: 'Thanks for the information',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        unreadCount: 0,
        isOnline: false,
        profileMode: 'Anon',
        trustScore: 0,
        isEncrypted: true
      },
      {
        id: '4',
        name: 'Charlie Wilson',
        handle: '+1-555-0123',
        lastMessage: 'Can we reschedule?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        unreadCount: 1,
        isOnline: false,
        profileMode: 'Basic',
        trustScore: 76,
        isEncrypted: true
      }
    ]
    setChats(mockChats)
    setFilteredChats(mockChats)
  }, [])

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChats(chats)
    } else {
      const filtered = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
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

  const getTrustScoreColor = (score) => {
    if (score >= 90) return 'var(--color-success)'
    if (score >= 70) return 'var(--color-accent-teal)'
    if (score >= 50) return 'var(--color-warning)'
    return 'var(--color-text-muted)'
  }

  return (
    <div className="chat-list">
      {/* Header */}
      <div className="chat-list-header">
        <h2 className="chat-list-title">Conversations</h2>
        <button className="new-chat-btn" title="New Chat">
          +
        </button>
      </div>

      {/* Search */}
      <div className="chat-search">
        <input
          type="text"
          placeholder="Search chats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Chat List */}
      <div className="chats-container">
        {filteredChats.length === 0 ? (
          <div className="no-chats">
            <p>No conversations found</p>
            <button className="btn btn-primary">Start New Chat</button>
          </div>
        ) : (
          filteredChats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${selectedChat?.id === chat.id ? 'selected' : ''}`}
              onClick={() => onChatSelect(chat)}
            >
              {/* Avatar and Status */}
              <div className="chat-avatar">
                <div className="avatar-circle">
                  {chat.name.charAt(0).toUpperCase()}
                </div>
                {chat.isOnline && <div className="online-indicator"></div>}
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
                    {chat.trustScore > 0 && (
                      <span 
                        className="trust-score"
                        style={{ color: getTrustScoreColor(chat.trustScore) }}
                      >
                        {chat.trustScore}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="chat-preview">
                  <span className="last-message">{chat.lastMessage}</span>
                  <div className="chat-meta">
                    {chat.isEncrypted && <span className="encryption-icon">🔒</span>}
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
    </div>
  )
}

export default ChatList
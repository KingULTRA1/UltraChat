import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatList from './ChatList'
import MessageWindow from './MessageWindow'
import SettingsPanel from './SettingsPanel'
import ProfileModal from './ProfileModal'
import './Layout.css'

// 🚀 UltraChat v1.2.3 Alpha - PRIVACY FIRST

const Layout = ({ 
  onThemeChange, 
  onBlueFilterToggle, 
  blueFilterEnabled, 
  currentTheme, 
  onLogout, 
  currentUser,
  trustManager 
}) => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [currentView, setCurrentView] = useState('chats') // 'chats', 'settings', 'profile', 'audit', 'moderation', 'crypto'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  
  // Enhanced v1.2.3 Alpha state management
  const [botBridgeStatus, setBotBridgeStatus] = useState({
    discord: false,
    telegram: false,
    twitter: false,
    signal: false,
    overall: 'disconnected'
  })
  const [pendingOperations, setPendingOperations] = useState(0)
  const [trustLevel, setTrustLevel] = useState('unknown')
  const [trustScore, setTrustScore] = useState(0)
  const [cryptoStats, setCryptoStats] = useState({
    totalTips: 0,
    totalValue: 0,
    activeCurrencies: []
  })
  const [auditStats, setAuditStats] = useState({
    totalEntries: 0,
    recentActivity: 0
  })

  // Enhanced effect for v1.2.3 Alpha features
  useEffect(() => {
    if (currentUser && trustManager) {
      updateTrustLevel()
      updateAllStats()
    }
  }, [currentUser, trustManager])

  // Listen for custom events from child components
  useEffect(() => {
    const handleOpenSettings = () => {
      setCurrentView('settings')
      setShowSettings(true)
    }

    const handleOpenProfile = () => {
      setCurrentView('profile')
      setShowProfile(true)
    }

    const handleOpenAudit = () => {
      setCurrentView('audit')
    }

    const handleOpenModeration = () => {
      setCurrentView('moderation')
    }

    window.addEventListener('openSettings', handleOpenSettings)
    window.addEventListener('openProfile', handleOpenProfile)
    window.addEventListener('openAudit', handleOpenAudit)
    window.addEventListener('openModeration', handleOpenModeration)
    
    // Initialize v1.2.3 Alpha features
    initializeEnhancedFeatures()
    
    // Set up periodic status checks
    const statusInterval = setInterval(() => {
      checkBotBridgeStatus()
      checkPendingOperations()
      updateAllStats()
    }, 30000) // Check every 30 seconds
    
    return () => {
      window.removeEventListener('openSettings', handleOpenSettings)
      window.removeEventListener('openProfile', handleOpenProfile)
      window.removeEventListener('openAudit', handleOpenAudit)
      window.removeEventListener('openModeration', handleOpenModeration)
      clearInterval(statusInterval)
    }
  }, [])

  const initializeEnhancedFeatures = async () => {
    try {
      await checkBotBridgeStatus()
      await checkPendingOperations()
      await updateTrustLevel()
      await updateCryptoStats()
      await updateAuditStats()
    } catch (error) {
      console.error('Failed to initialize enhanced features:', error)
    }
  }

  const updateTrustLevel = async () => {
    if (!currentUser || !trustManager) return
    
    try {
      const score = await trustManager.calculateTrustScore(currentUser.id)
      setTrustScore(score.score)
      setTrustLevel(score.level)
    } catch (error) {
      console.error('Failed to calculate trust score:', error)
      setTrustLevel('unknown')
      setTrustScore(0)
    }
  }

  const updateAllStats = async () => {
    try {
      await Promise.all([
        updateCryptoStats(),
        updateAuditStats(),
        checkPendingOperations()
      ])
    } catch (error) {
      console.error('Failed to update stats:', error)
    }
  }

  const updateCryptoStats = async () => {
    try {
      if (window.UltraChat?.cryptoTipping && currentUser) {
        const stats = await window.UltraChat.cryptoTipping.getTipStatistics(currentUser.id)
        setCryptoStats({
          totalTips: stats.totalTips || 0,
          totalValue: stats.totalValue || 0,
          activeCurrencies: stats.activeCurrencies || []
        })
      }
    } catch (error) {
      console.error('Failed to update crypto stats:', error)
    }
  }

  const updateAuditStats = async () => {
    try {
      if (window.UltraChat?.auditManager && currentUser) {
        const entries = await window.UltraChat.auditManager.getAuditEntries(currentUser.id, { limit: 100 })
        const recentCount = entries.filter(entry => 
          Date.now() - new Date(entry.timestamp).getTime() < 24 * 60 * 60 * 1000
        ).length
        
        setAuditStats({
          totalEntries: entries.length,
          recentActivity: recentCount
        })
      }
    } catch (error) {
      console.error('Failed to update audit stats:', error)
    }
  }

  const checkBotBridgeStatus = async () => {
    try {
      // Check if bot bridge is running and individual platform status
      const healthResponse = await fetch('http://localhost:3001/health').catch(() => null)
      const isRunning = healthResponse && healthResponse.ok
      
      if (isRunning && window.UltraChat?.botBridge) {
        const connections = window.UltraChat.botBridge.connections || {}
        setBotBridgeStatus({
          discord: Boolean(connections.discord?.readyAt),
          telegram: Boolean(connections.telegram?.isPolling()),
          twitter: Boolean(connections.twitter),
          signal: Boolean(connections.signal),
          overall: 'connected'
        })
      } else {
        setBotBridgeStatus({
          discord: false,
          telegram: false,
          twitter: false,
          signal: false,
          overall: 'disconnected'
        })
      }
    } catch (error) {
      setBotBridgeStatus({
        discord: false,
        telegram: false,
        twitter: false,
        signal: false,
        overall: 'error'
      })
    }
  }

  const checkPendingOperations = async () => {
    try {
      if (window.UltraChat?.trustIntegration && currentUser) {
        const moderationQueue = await window.UltraChat.trustIntegration.getModerationQueue(currentUser)
        setPendingOperations(moderationQueue.length)
      }
    } catch (error) {
      console.error('Failed to check pending operations:', error)
      setPendingOperations(0)
    }
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    setCurrentView('chats')
  }

  const handleSettingsOpen = () => {
    setShowSettings(true)
    setCurrentView('settings')
  }

  const handleProfileOpen = () => {
    setShowProfile(true)
    setCurrentView('profile')
  }

  const handleCryptoView = () => {
    setCurrentView('crypto')
  }

  const handleAuditView = () => {
    setCurrentView('audit')
  }

  const handleModerationView = () => {
    setCurrentView('moderation')
  }

  const getTrustColor = () => {
    switch (trustLevel) {
      case 'maximum': return '#00ff00'
      case 'verified': return '#00cc00'
      case 'high': return '#66ff66'
      case 'medium': return '#ffff00'
      case 'low': return '#ff9900'
      case 'unknown': return '#ff6600'
      default: return '#999999'
    }
  }

  const getBotStatusIndicator = () => {
    const connectedPlatforms = Object.entries(botBridgeStatus)
      .filter(([key, value]) => key !== 'overall' && value)
      .map(([key]) => key)
    
    if (connectedPlatforms.length === 0) {
      return <span className="bot-status disconnected" title="No bots connected">🤖❌</span>
    }
    
    return (
      <span className="bot-status connected" title={`Connected: ${connectedPlatforms.join(', ')}`}>
        🤖✅
      </span>
    )
  }

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-text">UltraChat</span>
            <span className="logo-version">v1.2.3 Alpha</span>
            <span className="logo-badge">PRIVACY FIRST</span>
          </div>
          
          {/* Bot Bridge Status */}
          <div className="bot-bridge-indicator">
            {getBotStatusIndicator()}
          </div>
        </div>
        
        <div className="header-center">
          {/* Enhanced Trust Indicator */}
          <div className="trust-display">
            <div 
              className="trust-indicator"
              style={{ color: getTrustColor() }}
              title={`Trust Level: ${trustLevel} (${trustScore}%)`}
            >
              <span className="trust-icon">🛡️</span>
              <span className="trust-text">{trustLevel}</span>
              <span className="trust-score">({trustScore}%)</span>
            </div>
          </div>
          
          <nav className="main-nav">
            <button 
              className={`nav-btn ${currentView === 'chats' ? 'active' : ''}`}
              onClick={() => setCurrentView('chats')}
            >
              💬 Chats
            </button>
            
            <button 
              className={`nav-btn ${currentView === 'crypto' ? 'active' : ''}`}
              onClick={handleCryptoView}
              title="Crypto Tipping Dashboard"
            >
              💰 Tips ({cryptoStats.totalTips})
            </button>
            
            {(trustLevel === 'high' || trustLevel === 'verified' || trustLevel === 'maximum') && (
              <button 
                className={`nav-btn ${currentView === 'moderation' ? 'active' : ''}`}
                onClick={handleModerationView}
                title="Moderation Dashboard"
              >
                ⚖️ Moderate ({pendingOperations})
              </button>
            )}
            
            <button 
              className={`nav-btn ${currentView === 'audit' ? 'active' : ''}`}
              onClick={handleAuditView}
              title="Audit Trail"
            >
              📊 Audit ({auditStats.recentActivity})
            </button>
            
            <button 
              className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`}
              onClick={handleProfileOpen}
            >
              👤 Profile
            </button>
            
            <button 
              className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
              onClick={handleSettingsOpen}
            >
              ⚙️ Settings
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="status-indicators">
            {/* Enhanced Status Indicators */}
            <div className="connection-status online" title="Connected">
              <span className="status-dot"></span>
            </div>
            
            <div className="encryption-status" title="AES-256-GCM Encrypted">
              🔒
            </div>
            
            {cryptoStats.totalTips > 0 && (
              <div className="crypto-status" title={`${cryptoStats.totalTips} tips sent`}>
                💎
              </div>
            )}
            
            {pendingOperations > 0 && (
              <div className="pending-status" title={`${pendingOperations} pending operations`}>
                ⏳
              </div>
            )}
            
            <div className="privacy-status" title="Zero Tracking • Local Only">
              🛡️
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="layout-main">
        {currentView === 'chats' && (
          <div className="chat-layout">
            <aside 
              className={`chat-sidebar ${
                sidebarCollapsed ? 'collapsed' : 'expanded'
              } ${
                sidebarHovered ? 'hovered' : ''
              }`}
              onMouseEnter={() => setSidebarHovered(true)}
              onMouseLeave={() => setSidebarHovered(false)}
            >
              {/* Sidebar Toggle Button */}
              <button 
                className="sidebar-toggle"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
              
              <ChatList 
                onChatSelect={handleChatSelect}
                selectedChat={selectedChat}
                collapsed={sidebarCollapsed}
                hovered={sidebarHovered}
              />
            </aside>
            
            <section className="chat-main">
              <MessageWindow 
                selectedChat={selectedChat}
              />
            </section>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="settings-layout">
            <SettingsPanel 
              onThemeChange={onThemeChange}
              onBlueFilterToggle={onBlueFilterToggle}
              blueFilterEnabled={blueFilterEnabled}
              currentTheme={currentTheme}
              onClose={() => setCurrentView('chats')}
            />
          </div>
        )}

        {currentView === 'profile' && (
          <div className="profile-layout">
            <ProfileModal 
              currentUser={currentUser}
              trustManager={trustManager}
              onClose={() => setCurrentView('chats')}
            />
          </div>
        )}
        
        {currentView === 'crypto' && (
          <div className="crypto-layout">
            <div className="crypto-dashboard">
              <h2>💰 Crypto Tipping Dashboard</h2>
              <div className="crypto-stats">
                <div className="stat-card">
                  <h3>Total Tips</h3>
                  <span className="stat-value">{cryptoStats.totalTips}</span>
                </div>
                <div className="stat-card">
                  <h3>Total Value</h3>
                  <span className="stat-value">${cryptoStats.totalValue.toFixed(2)}</span>
                </div>
                <div className="stat-card">
                  <h3>Active Currencies</h3>
                  <span className="stat-value">{cryptoStats.activeCurrencies.join(', ')}</span>
                </div>
              </div>
              <button onClick={() => setCurrentView('chats')} className="back-btn">
                ← Back to Chats
              </button>
            </div>
          </div>
        )}
        
        {currentView === 'audit' && (
          <div className="audit-layout">
            <div className="audit-dashboard">
              <h2>📊 Audit Trail</h2>
              <div className="audit-stats">
                <div className="stat-card">
                  <h3>Total Entries</h3>
                  <span className="stat-value">{auditStats.totalEntries}</span>
                </div>
                <div className="stat-card">
                  <h3>Recent Activity (24h)</h3>
                  <span className="stat-value">{auditStats.recentActivity}</span>
                </div>
              </div>
              <button onClick={() => setCurrentView('chats')} className="back-btn">
                ← Back to Chats
              </button>
            </div>
          </div>
        )}
        
        {currentView === 'moderation' && (
          <div className="moderation-layout">
            <div className="moderation-dashboard">
              <h2>⚖️ Moderation Dashboard</h2>
              <div className="moderation-stats">
                <div className="stat-card">
                  <h3>Pending Operations</h3>
                  <span className="stat-value">{pendingOperations}</span>
                </div>
                <div className="stat-card">
                  <h3>Your Trust Level</h3>
                  <span className="stat-value" style={{ color: getTrustColor() }}>{trustLevel}</span>
                </div>
              </div>
              <button onClick={() => setCurrentView('chats')} className="back-btn">
                ← Back to Chats
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="layout-footer">
        <div className="footer-left">
          <span className="privacy-indicator">
            🛡️ No Tracking • No Analytics • Privacy First
          </span>
        </div>
        
        <div className="footer-center">
          <span className="encryption-info">
            End-to-End Encrypted • Local Storage Only
          </span>
        </div>
        
        <div className="footer-right">
          <span className="version-info">
            v1.2.3 Alpha • PRIVACY FIRST • Bot Bridge • Crypto Tipping
          </span>
        </div>
      </footer>
    </div>
  )
}

export default Layout
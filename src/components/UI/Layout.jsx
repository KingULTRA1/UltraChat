import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatList from './ChatList'
import MessageWindow from './MessageWindow'
import SettingsPanel from './SettingsPanel'
import ProfileModal from './ProfileModal'
import MultiModeInterface from '../Communication/MultiModeInterface'
import CallModal from './CallModal'
import './Layout.css'

// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

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
  const [currentView, setCurrentView] = useState('chats') // 'chats', 'settings', 'profile', 'audit', 'moderation', 'crypto', 'multi_mode'
  const [communicationMode, setCommunicationMode] = useState('text')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [showCallModal, setShowCallModal] = useState(false)
  const [callType, setCallType] = useState('voice')
  
  // Enhanced v1.2.3.4 Final state management
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

  // Enhanced effect for v1.2.3.4 Final features
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

    const handleOpenGroups = () => {
      setCurrentView('groups')
    }

    const handleOpenMultiMode = () => {
      setCurrentView('multi_mode')
    }
    
    const handleCallEvent = (event) => {
      const { type, chatId } = event.detail
      if (selectedChat && selectedChat.id === chatId) {
        setCallType(type)
        setShowCallModal(true)
      }
    }
    
    // Handle new chat request
    const handleOpenNewChat = () => {
      // This will trigger the new chat modal in ChatList
      const chatListElement = document.querySelector('.chat-list')
      if (chatListElement) {
        const newChatBtn = chatListElement.querySelector('.new-chat-btn')
        if (newChatBtn) {
          newChatBtn.click()
        }
      }
    }

    window.addEventListener('openSettings', handleOpenSettings)
    window.addEventListener('openProfile', handleOpenProfile)
    window.addEventListener('openAudit', handleOpenAudit)
    window.addEventListener('openModeration', handleOpenModeration)
    window.addEventListener('openGroups', handleOpenGroups)
    window.addEventListener('openMultiMode', handleOpenMultiMode)
    window.addEventListener('callEvent', handleCallEvent)
    window.addEventListener('openNewChat', handleOpenNewChat)
    
    // Initialize v1.2.3.4 Final features
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
      window.removeEventListener('openGroups', handleOpenGroups)
      window.removeEventListener('openMultiMode', handleOpenMultiMode)
      window.removeEventListener('callEvent', handleCallEvent)
      window.removeEventListener('openNewChat', handleOpenNewChat)
      clearInterval(statusInterval)
    }
  }, [selectedChat])

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
      const healthResponse = await fetch('http://localhost:3001/health', { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000 // 5 second timeout
      }).catch(() => null)
      
      const isRunning = healthResponse && healthResponse.ok
      
      if (isRunning && window.UltraChat?.botBridge) {
        const connections = window.UltraChat.botBridge.connections || {}
        setBotBridgeStatus({
          discord: Boolean(connections.discord?.readyAt),
          telegram: Boolean(connections.telegram?.isPolling && connections.telegram.isPolling()),
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
          overall: isRunning ? 'partial' : 'disconnected'
        })
      }
    } catch (error) {
      console.error('Bot bridge status check failed:', error)
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
      if (window.UltraChat?.trustIntegration) {
        const stats = await window.UltraChat.trustIntegration.getTrustIntegrationStats()
        setPendingOperations(stats.pendingReviews || 0)
      }
    } catch (error) {
      console.error('Failed to check pending operations:', error)
    }
  }

  const handleChatSelect = (chat) => {
    setSelectedChat(chat)
    setCurrentView('chats')
  }

  const getTrustColor = () => {
    if (trustScore >= 90) return '#4CAF50'
    if (trustScore >= 75) return '#2196F3'
    if (trustScore >= 50) return '#FF9800'
    return '#F44336'
  }

  const handleCallAccept = () => {
    // Handle call acceptance
    setShowCallModal(false)
    // In a real implementation, this would connect to the call
  }

  const handleCallReject = () => {
    // Handle call rejection
    setShowCallModal(false)
  }

  return (
    <div className="layout">
      {/* Call Modal */}
      {showCallModal && (
        <CallModal
          callType={callType}
          contactName={selectedChat?.name}
          onAccept={handleCallAccept}
          onReject={handleCallReject}
        />
      )}
      
      {/* Header */}
      <header className="layout-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-icon">🛡️</span>
            <h1>UltraChat</h1>
            <span className="version-badge">v1.2.3.4 Final</span>
          </div>
        </div>
        
        <div className="header-center">
          <nav className="main-nav">
            <button 
              className={currentView === 'chats' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('chats')}
            >
              💬 Chats
            </button>
            <button 
              className={currentView === 'multi_mode' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('multi_mode')}
            >
              🌐 Multi-Mode
            </button>
            <button 
              className={currentView === 'crypto' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('crypto')}
            >
              💰 Crypto
            </button>
            <button 
              className={currentView === 'audit' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('audit')}
            >
              📊 Audit
            </button>
            <button 
              className={currentView === 'moderation' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setCurrentView('moderation')}
            >
              ⚖️ Moderation
            </button>
          </nav>
        </div>
        
        <div className="header-right">
          <div className="user-controls">
            <div className="user-info">
              <span className="user-name">{currentUser?.name}</span>
              <div 
                className="trust-indicator"
                style={{ color: getTrustColor() }}
                title={`Trust Level: ${trustLevel} (${trustScore})`}
              >
                ●
              </div>
            </div>
            
            <div className="control-buttons">
              <button 
                className="icon-btn"
                onClick={() => setShowSettings(true)}
                title="Settings"
              >
                ⚙️
              </button>
              <button 
                className="icon-btn"
                onClick={onLogout}
                title="Logout"
              >
                🚪
              </button>
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
                currentUser={currentUser}
                trustManager={trustManager}
              />
            </aside>
            
            <section className="chat-main">
              <MessageWindow 
                selectedChat={selectedChat}
                currentUser={currentUser}
                trustManager={trustManager}
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
        
        {currentView === 'multi_mode' && (
          <div className="multi-mode-layout">
            <MultiModeInterface 
              selectedChat={selectedChat}
              currentUser={currentUser}
              trustManager={trustManager}
              onModeChange={setCommunicationMode}
              onChatSelect={setSelectedChat}
            />
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="layout-footer">
        <div className="footer-left">
          <span className="privacy-indicator">
            🛡️ No Tracking • No Analytics • Local Data Only
          </span>
        </div>
        
        <div className="footer-center">
          <span className="encryption-info">
            End-to-End Encrypted • Local Storage Only
          </span>
        </div>
        
        <div className="footer-right">
          <span className="version-info">
            v1.2.3.4 Final • PRIVACY FIRST • Bot Bridge • Crypto Tipping
          </span>
          {/* Bot Bridge Status Indicator */}
          <div className="bot-bridge-status">
            <span className={`status-indicator ${botBridgeStatus.overall}`}>
              {botBridgeStatus.overall === 'connected' ? '✅' : 
               botBridgeStatus.overall === 'partial' ? '⚠️' : 
               botBridgeStatus.overall === 'error' ? '❌' : '📡'}
            </span>
            <span className="status-text">
              {botBridgeStatus.overall === 'connected' ? 'Bot Bridge Connected' : 
               botBridgeStatus.overall === 'partial' ? 'Bot Bridge Partial' : 
               botBridgeStatus.overall === 'error' ? 'Bot Bridge Error' : 'Bot Bridge Disconnected'}
            </span>
          </div>
        </div>
      </footer>
      
      {/* Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <button 
          className={`nav-item ${currentView === 'chats' ? 'active' : ''}`}
          onClick={() => setCurrentView('chats')}
        >
          <span className="nav-icon">💬</span>
          <span className="nav-label">Chats</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'multi_mode' ? 'active' : ''}`}
          onClick={() => setCurrentView('multi_mode')}
        >
          <span className="nav-icon">📞</span>
          <span className="nav-label">Calls</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'crypto' ? 'active' : ''}`}
          onClick={() => setCurrentView('crypto')}
        >
          <span className="nav-icon">💰</span>
          <span className="nav-label">Wallet</span>
        </button>
        
        <button 
          className={`nav-item ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setCurrentView('profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Profile</span>
        </button>
      </nav>
    </div>
  )
}

export default Layout
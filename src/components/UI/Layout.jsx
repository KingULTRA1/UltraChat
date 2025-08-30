import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatList from './ChatList'
import MessageWindow from './MessageWindow'
import SettingsPanel from './SettingsPanel'
import ProfileModal from './ProfileModal'
import './Layout.css'

const Layout = ({ onThemeChange, onBlueFilterToggle, blueFilterEnabled, currentTheme }) => {
  const [selectedChat, setSelectedChat] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [currentView, setCurrentView] = useState('chats') // 'chats', 'settings', 'profile'

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

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-left">
          <div className="app-logo">
            <span className="logo-text">UltraChat</span>
            <span className="logo-badge">Privacy First</span>
          </div>
        </div>
        
        <div className="header-center">
          <nav className="main-nav">
            <button 
              className={`nav-btn ${currentView === 'chats' ? 'active' : ''}`}
              onClick={() => setCurrentView('chats')}
            >
              Chats
            </button>
            <button 
              className={`nav-btn ${currentView === 'profile' ? 'active' : ''}`}
              onClick={handleProfileOpen}
            >
              Profile
            </button>
            <button 
              className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
              onClick={handleSettingsOpen}
            >
              Settings
            </button>
          </nav>
        </div>

        <div className="header-right">
          <div className="status-indicators">
            <div className="connection-status online" title="Connected">
              <span className="status-dot"></span>
            </div>
            <div className="encryption-status" title="End-to-End Encrypted">
              🔒
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="layout-main">
        {currentView === 'chats' && (
          <div className="chat-layout">
            <aside className="chat-sidebar">
              <ChatList 
                onChatSelect={handleChatSelect}
                selectedChat={selectedChat}
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
              onClose={() => setCurrentView('chats')}
            />
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
            v1.0.0 • Open Source
          </span>
        </div>
      </footer>
    </div>
  )
}

export default Layout
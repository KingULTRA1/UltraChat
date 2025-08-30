import React, { useState } from 'react'
import './SettingsPanel.css'

const SettingsPanel = ({ 
  onThemeChange, 
  onBlueFilterToggle, 
  blueFilterEnabled, 
  currentTheme, 
  onClose 
}) => {
  const [activeSection, setActiveSection] = useState('appearance')
  const [settings, setSettings] = useState({
    notifications: {
      enabled: true,
      sounds: true,
      desktop: true,
      privacy: true
    },
    privacy: {
      analytics: false,
      tracking: false,
      crashReports: false,
      metadataCollection: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: 30,
      autoLock: true,
      keyVerification: true
    },
    messaging: {
      readReceipts: true,
      typingIndicators: true,
      messagePreview: false,
      autoDownload: false
    }
  })

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const themes = [
    { value: 'obsidian', label: 'Obsidian Black', description: 'Dark theme with deep blacks' },
    { value: 'dark', label: 'Dark Gray', description: 'Standard dark theme' },
    { value: 'light', label: 'Light', description: 'Light theme for bright environments' }
  ]

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'messaging', label: 'Messaging', icon: '💬' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ]

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="close-btn" onClick={onClose} title="Close Settings">
          ✕
        </button>
      </div>

      <div className="settings-content">
        {/* Sidebar */}
        <nav className="settings-nav">
          {sections.map(section => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="settings-main">
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h3>Appearance</h3>
              
              <div className="setting-group">
                <label className="setting-label">Theme</label>
                <div className="theme-options">
                  {themes.map(theme => (
                    <label key={theme.value} className="theme-option">
                      <input
                        type="radio"
                        name="theme"
                        value={theme.value}
                        checked={currentTheme === theme.value}
                        onChange={(e) => onThemeChange(e.target.value)}
                      />
                      <div className="theme-preview">
                        <span className="theme-name">{theme.label}</span>
                        <span className="theme-desc">{theme.description}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={blueFilterEnabled}
                    onChange={onBlueFilterToggle}
                  />
                  <span>Blue Light Filter</span>
                </label>
                <p className="setting-desc">
                  Reduces blue light for better eye comfort during extended use
                </p>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h3>Notifications</h3>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enabled}
                    onChange={(e) => handleSettingChange('notifications', 'enabled', e.target.checked)}
                  />
                  <span>Enable Notifications</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sounds}
                    onChange={(e) => handleSettingChange('notifications', 'sounds', e.target.checked)}
                  />
                  <span>Sound Alerts</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.desktop}
                    onChange={(e) => handleSettingChange('notifications', 'desktop', e.target.checked)}
                  />
                  <span>Desktop Notifications</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.notifications.privacy}
                    onChange={(e) => handleSettingChange('notifications', 'privacy', e.target.checked)}
                  />
                  <span>Privacy Mode (Hide message content)</span>
                </label>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy & Data</h3>
              
              <div className="privacy-banner">
                <h4>🛡️ Privacy First</h4>
                <p>UltraChat is designed with privacy at its core. No analytics, no tracking, no data collection.</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.privacy.analytics}
                    onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                  />
                  <span>Analytics (Always disabled)</span>
                </label>
                <p className="setting-desc">UltraChat never collects analytics data</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.privacy.tracking}
                    onChange={(e) => handleSettingChange('privacy', 'tracking', e.target.checked)}
                  />
                  <span>Usage Tracking (Always disabled)</span>
                </label>
                <p className="setting-desc">No usage tracking or behavior monitoring</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.privacy.crashReports}
                    onChange={(e) => handleSettingChange('privacy', 'crashReports', e.target.checked)}
                  />
                  <span>Crash Reports (Optional)</span>
                </label>
                <p className="setting-desc">Anonymous crash reports to improve stability</p>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <h3>Security</h3>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactor}
                    onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
                  />
                  <span>Two-Factor Authentication</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">Session Timeout (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="number-input"
                />
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.security.autoLock}
                    onChange={(e) => handleSettingChange('security', 'autoLock', e.target.checked)}
                  />
                  <span>Auto-lock when inactive</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.security.keyVerification}
                    onChange={(e) => handleSettingChange('security', 'keyVerification', e.target.checked)}
                  />
                  <span>Key Verification Required</span>
                </label>
              </div>
            </div>
          )}

          {activeSection === 'messaging' && (
            <div className="settings-section">
              <h3>Messaging</h3>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.messaging.readReceipts}
                    onChange={(e) => handleSettingChange('messaging', 'readReceipts', e.target.checked)}
                  />
                  <span>Read Receipts</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.messaging.typingIndicators}
                    onChange={(e) => handleSettingChange('messaging', 'typingIndicators', e.target.checked)}
                  />
                  <span>Typing Indicators</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.messaging.messagePreview}
                    onChange={(e) => handleSettingChange('messaging', 'messagePreview', e.target.checked)}
                  />
                  <span>Message Preview in Notifications</span>
                </label>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.messaging.autoDownload}
                    onChange={(e) => handleSettingChange('messaging', 'autoDownload', e.target.checked)}
                  />
                  <span>Auto-download Media</span>
                </label>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="settings-section">
              <h3>About UltraChat</h3>
              
              <div className="about-content">
                <div className="app-info">
                  <h4>UltraChat v1.0.0</h4>
                  <p>Privacy-first messaging application</p>
                </div>

                <div className="features-grid">
                  <div className="feature-card">
                    <h5>🔒 End-to-End Encryption</h5>
                    <p>All messages are encrypted locally</p>
                  </div>
                  <div className="feature-card">
                    <h5>🛡️ Zero Tracking</h5>
                    <p>No analytics or data collection</p>
                  </div>
                  <div className="feature-card">
                    <h5>📱 Cross-Platform</h5>
                    <p>Works on all devices</p>
                  </div>
                  <div className="feature-card">
                    <h5>🌐 Open Source</h5>
                    <p>Transparent and auditable code</p>
                  </div>
                </div>

                <div className="links">
                  <button className="link-btn">GitHub Repository</button>
                  <button className="link-btn">Privacy Policy</button>
                  <button className="link-btn">Documentation</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
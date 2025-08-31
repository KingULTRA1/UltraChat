import React, { useState } from 'react'
import PrivateDataManager from '../../services/Settings/PrivateDataManager'
import './SettingsPanel.css'

const SettingsPanel = ({ 
  onThemeChange, 
  onBlueFilterToggle, 
  blueFilterEnabled, 
  currentTheme, 
  onClose 
}) => {
  const [activeSection, setActiveSection] = useState('appearance')
  const [privateDataManager] = useState(new PrivateDataManager())
  const [qrData, setQrData] = useState(null)
  const [importData, setImportData] = useState('')
  const [backupPassword, setBackupPassword] = useState('')
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
    },
    autoReply: {
      enabled: true,
      quickReplies: true,
      smartSuggestions: true,
      customRules: true
    },
    permissions: {
      deleteMessages: 'trusted',
      editMessages: 'trusted', 
      deleteFiles: 'trusted',
      moderateContent: 'high_trust',
      viewAuditLogs: 'high_trust'
    },
    crypto: {
      tippingEnabled: true,
      currencies: ['BTC', 'ETH', 'DOGE'],
      maxTipAmount: 100,
      notifications: true
    },
    moderation: {
      autoApprove: false,
      requireReason: true,
      notifyModerators: true,
      escalateDisputes: true
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
    { id: 'autoreply', label: 'Auto-Reply', icon: '🤖' },
    { id: 'permissions', label: 'Permissions', icon: '👥' },
    { id: 'crypto', label: 'Crypto Tipping', icon: '💰' },
    { id: 'moderation', label: 'Moderation', icon: '⚖️' },
    { id: 'backup', label: 'Backup & Sync', icon: '📱' },
    { id: 'about', label: 'About', icon: 'ℹ️' }
  ]

  // Privacy-first backup and import functions
  const handleGenerateQR = async (includeMessages = false) => {
    try {
      const result = await privateDataManager.generateQRExportData(includeMessages)
      setQrData(result)
      alert('QR code generated! You can now scan it on another device to import your settings.')
    } catch (error) {
      alert(`Failed to generate QR code: ${error.message}`)
    }
  }

  const handleImportData = async () => {
    try {
      if (!importData.trim()) {
        alert('Please enter the import data')
        return
      }
      
      const data = JSON.parse(importData)
      const results = await privateDataManager.importFromQRData(data, data.transferKey)
      
      alert(`Import successful! Imported: ${results.profiles} profiles, ${results.messages} messages, ${results.conversations} conversations`)
      setImportData('')
    } catch (error) {
      alert(`Import failed: ${error.message}`)
    }
  }

  const handleSecureBackup = async () => {
    if (!backupPassword.trim()) {
      alert('Please enter a backup password')
      return
    }
    
    try {
      const backup = await privateDataManager.generateSecureBackup(backupPassword)
      
      // Create downloadable backup file
      const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ultrachat-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      alert('Secure backup downloaded! Keep this file and password safe.')
      setBackupPassword('')
    } catch (error) {
      alert(`Backup failed: ${error.message}`)
    }
  }

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
              <h3>Ultra-Privacy & Data Protection</h3>
              
              <div className="privacy-banner">
                <h4>🛡️ Maximum Privacy Mode Active</h4>
                <p>UltraChat operates in ultra-privacy mode. Zero tracking, zero analytics, zero data collection. Everything stays on your device.</p>
              </div>

              <div className="setting-group">
                <h4>Data Storage Policy</h4>
                <div className="privacy-guarantees">
                  <div className="guarantee-item">
                    <span className="guarantee-icon">✅</span>
                    <div>
                      <strong>Local Storage Only</strong>
                      <p>All your data stays on this device, encrypted and secure</p>
                    </div>
                  </div>
                  <div className="guarantee-item">
                    <span className="guarantee-icon">✅</span>
                    <div>
                      <strong>Zero External Transmission</strong>
                      <p>No data ever sent to external servers or cloud services</p>
                    </div>
                  </div>
                  <div className="guarantee-item">
                    <span className="guarantee-icon">✅</span>
                    <div>
                      <strong>No Analytics or Tracking</strong>
                      <p>We never collect usage data, analytics, or behavioral information</p>
                    </div>
                  </div>
                  <div className="guarantee-item">
                    <span className="guarantee-icon">✅</span>
                    <div>
                      <strong>Privacy-First Design</strong>
                      <p>Built from the ground up to protect your privacy</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={!settings.privacy.analytics}
                    onChange={(e) => handleSettingChange('privacy', 'analytics', !e.target.checked)}
                    disabled
                  />
                  <span>Analytics (Permanently Disabled)</span>
                </label>
                <p className="setting-desc">UltraChat never collects analytics data - this cannot be enabled</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={!settings.privacy.tracking}
                    onChange={(e) => handleSettingChange('privacy', 'tracking', !e.target.checked)}
                    disabled
                  />
                  <span>Usage Tracking (Permanently Disabled)</span>
                </label>
                <p className="setting-desc">No usage tracking or behavior monitoring - ever</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.privacy.crashReports}
                    onChange={(e) => handleSettingChange('privacy', 'crashReports', e.target.checked)}
                  />
                  <span>Local Crash Reports (Optional)</span>
                </label>
                <p className="setting-desc">Store crash reports locally only - never transmitted</p>
              </div>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                  />
                  <span>Local-Only Mode (Always Active)</span>
                </label>
                <p className="setting-desc">All data processing happens locally on your device</p>
              </div>
              
              <div className="setting-group">
                <h4>Privacy Actions</h4>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    privateDataManager.performPrivacyCleanup()
                    alert('Privacy cleanup completed! Temporary data and old logs removed.')
                  }}
                >
                  Perform Privacy Cleanup
                </button>
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

          {activeSection === 'autoreply' && (
            <div className="settings-section">
              <h3>Auto-Reply Settings</h3>
              
              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.autoReply.enabled}
                    onChange={(e) => handleSettingChange('autoReply', 'enabled', e.target.checked)}
                  />
                  <span>Enable Auto-Reply System</span>
                </label>
                <p className="setting-desc">
                  Allow quick responses and automated reply suggestions
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.autoReply.quickReplies}
                    onChange={(e) => handleSettingChange('autoReply', 'quickReplies', e.target.checked)}
                    disabled={!settings.autoReply.enabled}
                  />
                  <span>Quick Reply Buttons</span>
                </label>
                <p className="setting-desc">
                  Show predefined quick reply buttons in conversations
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.autoReply.smartSuggestions}
                    onChange={(e) => handleSettingChange('autoReply', 'smartSuggestions', e.target.checked)}
                    disabled={!settings.autoReply.enabled}
                  />
                  <span>Smart Reply Suggestions</span>
                </label>
                <p className="setting-desc">
                  AI-powered reply suggestions based on message context
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.autoReply.customRules}
                    onChange={(e) => handleSettingChange('autoReply', 'customRules', e.target.checked)}
                    disabled={!settings.autoReply.enabled}
                  />
                  <span>Custom Auto-Reply Rules</span>
                </label>
                <p className="setting-desc">
                  Create custom rules for automatic responses
                </p>
              </div>
            </div>
          )}

          {activeSection === 'permissions' && (
            <div className="settings-section">
              <h3>Trust & Permission Controls</h3>
              
              <div className="trust-banner">
                <h4>🌐 Web of Trust Integration</h4>
                <p>Permissions are dynamically adjusted based on your trust level and community endorsements.</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">Message Deletion Permission</label>
                <select 
                  value={settings.permissions.deleteMessages}
                  onChange={(e) => handleSettingChange('permissions', 'deleteMessages', e.target.value)}
                  className="permission-select"
                >
                  <option value="owner">Owner Only</option>
                  <option value="trusted">Trusted Users</option>
                  <option value="moderator">Moderators Only</option>
                  <option value="disabled">Disabled</option>
                </select>
                <p className="setting-desc">
                  Who can request message deletion in your conversations
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">Message Editing Permission</label>
                <select 
                  value={settings.permissions.editMessages}
                  onChange={(e) => handleSettingChange('permissions', 'editMessages', e.target.value)}
                  className="permission-select"
                >
                  <option value="owner">Owner Only</option>
                  <option value="trusted">Trusted Users</option>
                  <option value="moderator">Moderators Only</option>
                  <option value="disabled">Disabled</option>
                </select>
                <p className="setting-desc">
                  Who can request message editing in your conversations
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">File Deletion Permission</label>
                <select 
                  value={settings.permissions.deleteFiles}
                  onChange={(e) => handleSettingChange('permissions', 'deleteFiles', e.target.value)}
                  className="permission-select"
                >
                  <option value="owner">Owner Only</option>
                  <option value="trusted">Trusted Users</option>
                  <option value="moderator">Moderators Only</option>
                  <option value="disabled">Disabled</option>
                </select>
                <p className="setting-desc">
                  Who can request file deletion in your conversations
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">Content Moderation Access</label>
                <select 
                  value={settings.permissions.moderateContent}
                  onChange={(e) => handleSettingChange('permissions', 'moderateContent', e.target.value)}
                  className="permission-select"
                >
                  <option value="high_trust">High Trust Only</option>
                  <option value="verified">Verified Users</option>
                  <option value="disabled">Disabled</option>
                </select>
                <p className="setting-desc">
                  Who can moderate content and approve/reject operations
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">Audit Log Access</label>
                <select 
                  value={settings.permissions.viewAuditLogs}
                  onChange={(e) => handleSettingChange('permissions', 'viewAuditLogs', e.target.value)}
                  className="permission-select"
                >
                  <option value="high_trust">High Trust Only</option>
                  <option value="verified">Verified Users</option>
                  <option value="personal_only">Personal Data Only</option>
                  <option value="disabled">Disabled</option>
                </select>
                <p className="setting-desc">
                  Who can access audit trails and recovery information
                </p>
              </div>
            </div>
          )}

          {activeSection === 'crypto' && (
            <div className="settings-section">
              <h3>Crypto Tipping Settings</h3>
              
              <div className="crypto-banner">
                <h4>💰 Enhanced Crypto Tipping</h4>
                <p>Send and receive tips in multiple cryptocurrencies with full transaction logging.</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.crypto.tippingEnabled}
                    onChange={(e) => handleSettingChange('crypto', 'tippingEnabled', e.target.checked)}
                  />
                  <span>Enable Crypto Tipping</span>
                </label>
                <p className="setting-desc">
                  Allow sending and receiving cryptocurrency tips
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">Supported Currencies</label>
                <div className="crypto-currencies">
                  {['BTC', 'ETH', 'DOGE', 'LTC', 'SOL', 'PYTH', 'LINK'].map(currency => (
                    <label key={currency} className="crypto-option">
                      <input
                        type="checkbox"
                        checked={settings.crypto.currencies.includes(currency)}
                        onChange={(e) => {
                          const currencies = [...settings.crypto.currencies]
                          if (e.target.checked) {
                            currencies.push(currency)
                          } else {
                            const index = currencies.indexOf(currency)
                            if (index > -1) currencies.splice(index, 1)
                          }
                          handleSettingChange('crypto', 'currencies', currencies)
                        }}
                        disabled={!settings.crypto.tippingEnabled}
                      />
                      <span>{currency}</span>
                    </label>
                  ))}
                </div>
                <p className="setting-desc">
                  Select which cryptocurrencies you want to support for tipping
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">Maximum Tip Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={settings.crypto.maxTipAmount}
                  onChange={(e) => handleSettingChange('crypto', 'maxTipAmount', parseInt(e.target.value))}
                  className="number-input"
                  disabled={!settings.crypto.tippingEnabled}
                />
                <p className="setting-desc">
                  Maximum USD value for a single tip transaction
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.crypto.notifications}
                    onChange={(e) => handleSettingChange('crypto', 'notifications', e.target.checked)}
                    disabled={!settings.crypto.tippingEnabled}
                  />
                  <span>Tip Notifications</span>
                </label>
                <p className="setting-desc">
                  Receive notifications for sent and received tips
                </p>
              </div>
            </div>
          )}

          {activeSection === 'moderation' && (
            <div className="settings-section">
              <h3>Moderation & Trust Management</h3>
              
              <div className="moderation-banner">
                <h4>⚖️ Community Moderation</h4>
                <p>Configure how content moderation and approval workflows function in your conversations.</p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.moderation.autoApprove}
                    onChange={(e) => handleSettingChange('moderation', 'autoApprove', e.target.checked)}
                  />
                  <span>Auto-approve High Trust Operations</span>
                </label>
                <p className="setting-desc">
                  Automatically approve operations from users with maximum trust levels
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.moderation.requireReason}
                    onChange={(e) => handleSettingChange('moderation', 'requireReason', e.target.checked)}
                  />
                  <span>Require Reason for Operations</span>
                </label>
                <p className="setting-desc">
                  Users must provide a reason for deletion and edit requests
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.moderation.notifyModerators}
                    onChange={(e) => handleSettingChange('moderation', 'notifyModerators', e.target.checked)}
                  />
                  <span>Notify Moderators</span>
                </label>
                <p className="setting-desc">
                  Send notifications to moderators when operations need review
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  <input
                    type="checkbox"
                    checked={settings.moderation.escalateDisputes}
                    onChange={(e) => handleSettingChange('moderation', 'escalateDisputes', e.target.checked)}
                  />
                  <span>Escalate Disputes</span>
                </label>
                <p className="setting-desc">
                  Escalate complex moderation decisions to higher trust level moderators
                </p>
              </div>
            </div>
          )}

          {activeSection === 'backup' && (
            <div className="settings-section">
              <h3>Ultra-Private Backup & Sync</h3>
              
              <div className="privacy-banner">
                <h4>🛡️ Ultra Privacy Mode</h4>
                <p>All data stays on your devices. No cloud storage, no external servers, maximum privacy.</p>
              </div>

              <div className="setting-group">
                <h4>QR Code Export/Import</h4>
                <p className="setting-desc">Transfer settings between devices using QR codes</p>
                
                <div className="backup-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleGenerateQR(false)}
                  >
                    Generate QR (Settings Only)
                  </button>
                  
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleGenerateQR(true)}
                  >
                    Generate QR (With Messages)
                  </button>
                </div>
                
                {qrData && (
                  <div className="qr-display">
                    <h5>Scan this QR code on your other device:</h5>
                    <div className="qr-code-area">
                      <code>{JSON.stringify(qrData.qrData).substring(0, 200)}...</code>
                    </div>
                    <p><strong>Transfer Key:</strong> {qrData.keyString}</p>
                    <small>Keep this key secure and enter it on the receiving device</small>
                  </div>
                )}
              </div>

              <div className="setting-group">
                <h4>Import Data</h4>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste QR data here..."
                  className="import-textarea"
                  rows="4"
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleImportData}
                  disabled={!importData.trim()}
                >
                  Import Data
                </button>
              </div>

              <div className="setting-group">
                <h4>Secure File Backup</h4>
                <p className="setting-desc">Create encrypted backup files for Discord/Telegram sharing</p>
                
                <input
                  type="password"
                  value={backupPassword}
                  onChange={(e) => setBackupPassword(e.target.value)}
                  placeholder="Enter backup password"
                  className="backup-password"
                />
                
                <button 
                  className="btn btn-primary"
                  onClick={handleSecureBackup}
                  disabled={!backupPassword.trim()}
                >
                  Create Secure Backup
                </button>
              </div>
              
              <div className="setting-group">
                <h4>Privacy Status</h4>
                <div className="privacy-status">
                  <div className="status-item">
                    <span className="status-icon">✅</span>
                    <span>Local Storage Only</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">✅</span>
                    <span>Zero External Tracking</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">✅</span>
                    <span>End-to-End Encryption</span>
                  </div>
                  <div className="status-item">
                    <span className="status-icon">✅</span>
                    <span>No Cloud Sync</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'about' && (
            <div className="settings-section">
              <h3>About UltraChat</h3>
              
              <div className="about-content">
                <div className="app-info">
                  <h4>UltraChat v1.2.3</h4>
                  <p>Privacy-first messaging application offering end-to-end encryption, zero tracking, and cross-platform support.</p>
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
                  <button 
                    className="link-btn" 
                    onClick={() => window.open('https://github.com/KingULTRA1/UltraChat', '_blank')}
                  >
                    GitHub Repository
                  </button>
                  <button 
                    className="link-btn"
                    onClick={() => window.open('https://X.com/Ultra1', '_blank')}
                  >
                    Support (@Ultra1)
                  </button>
                  <button 
                    className="link-btn"
                    onClick={() => window.open('https://github.com/KingULTRA1/UltraChat/blob/main/PRIVACY.md', '_blank')}
                  >
                    Privacy Policy
                  </button>
                  <button 
                    className="link-btn"
                    onClick={() => window.open('https://github.com/KingULTRA1/UltraChat/blob/main/README.md', '_blank')}
                  >
                    Documentation
                  </button>
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
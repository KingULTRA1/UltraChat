import { useState, useEffect } from 'react'
import { UserDataManager } from '../../services/Settings'
import { PROFILE_MODES } from '../../utils/Constants'
import './ProfileModal.css'

// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

const ProfileModal = ({ onClose, currentUser, trustManager }) => {
  const [userDataManager] = useState(new UserDataManager())
  const [activeMode, setActiveMode] = useState(PROFILE_MODES.BASIC)
  const [profileData, setProfileData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Enhanced v1.2.3.4 Final state
  const [cryptoWallets, setCryptoWallets] = useState({})
  const [botConnections, setBotConnections] = useState({})
  const [trustStats, setTrustStats] = useState({})
  const [auditStats, setAuditStats] = useState({})
  const [tipStats, setTipStats] = useState({})

  // Initialize component and load user data with v1.2.3.4 Final features
  useEffect(() => {
    initializeProfile()
    loadEnhancedProfileData()
  }, [])

  // Load profile data when mode changes
  useEffect(() => {
    if (userDataManager.initialized) {
      loadProfileForMode(activeMode)
    }
  }, [activeMode])

  const initializeProfile = async () => {
    try {
      setLoading(true)
      await userDataManager.initialize()
      
      // Get current active mode
      const currentMode = await userDataManager.getCurrentProfileMode()
      setActiveMode(currentMode)
      
      // Load profile data for current mode
      await loadProfileForMode(currentMode)
      
      // Load v1.2.3.4 Final enhanced data
      await loadEnhancedProfileData()
      
    } catch (error) {
      console.error('Failed to initialize profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProfileForMode = async (mode) => {
    try {
      const profile = await userDataManager.storage.getProfileData(mode)
      
      if (profile) {
        setProfileData(profile)
      } else {
        // Create default profile if none exists
        const defaultProfile = await userDataManager.createDefaultProfile(mode)
        setProfileData(defaultProfile)
      }
    } catch (error) {
      console.error(`Failed to load profile for mode ${mode}:`, error)
      // Set empty default profile
      setProfileData({
        displayName: mode === PROFILE_MODES.ANON ? 'Anonymous' : 'User',
        bio: '',
        avatar: null,
        mode,
        socialHandles: {},
        trustScore: mode === PROFILE_MODES.ULTRA ? 0 : undefined,
        endorsements: mode === PROFILE_MODES.ULTRA ? [] : undefined,
        verified: false
      })
    }
  }

  const modes = [
    {
      id: PROFILE_MODES.BASIC,
      name: 'Basic',
      description: 'Minimal profile information',
      icon: '👤',
      color: 'var(--color-mode-basic)'
    },
    {
      id: PROFILE_MODES.PUBLIC,
      name: 'Public',
      description: 'Public profile with social handles',
      icon: '🌐',
      color: 'var(--color-mode-public)'
    },
    {
      id: PROFILE_MODES.ANON,
      name: 'Anonymous',
      description: 'Complete anonymity',
      icon: '🥷',
      color: 'var(--color-mode-anon)'
    },
    {
      id: PROFILE_MODES.ULTRA,
      name: 'Ultra',
      description: 'Enhanced features with Web of Trust + Crypto Tipping',
      icon: '⚡',
      color: 'var(--color-mode-ultra)'
    }
  ]

  const handleModeSwitch = async (newMode) => {
    if (newMode === activeMode) return
    
    try {
      setLoading(true)
      
      // Save current profile before switching
      await handleSaveProfile()
      
      // Switch to new mode
      await userDataManager.switchProfileMode(newMode)
      setActiveMode(newMode)
      
      // Load profile for new mode
      await loadProfileForMode(newMode)
      
    } catch (error) {
      console.error('Failed to switch profile mode:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (field, value) => {
    // Update local state immediately for UI responsiveness
    setProfileData(prev => ({
      ...prev,
      [field]: value,
      lastUpdated: new Date().toISOString()
    }))
  }

  const handleSocialHandleUpdate = async (platform, value) => {
    setProfileData(prev => ({
      ...prev,
      socialHandles: {
        ...prev.socialHandles,
        [platform]: value
      },
      lastUpdated: new Date().toISOString()
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      // Save profile data to local storage
      await userDataManager.storage.storeProfileData(profileData, activeMode)
      
      // Show success message
      console.log('Profile saved successfully')
      
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        // Convert to base64 for local storage
        const reader = new FileReader()
        reader.onload = (e) => {
          handleProfileUpdate('avatar', e.target.result)
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('Failed to upload avatar:', error)
      }
    }
  }

  // Handle profile reset
  const handleResetProfile = async () => {
    try {
      setLoading(true)
      await loadProfileForMode(activeMode)
    } catch (error) {
      console.error('Failed to reset profile:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load enhanced v1.2.3.4 Final profile data
  const loadEnhancedProfileData = async () => {
    try {
      // Load crypto wallet data
      if (window.UltraChat?.cryptoTipping && currentUser) {
        const wallets = await window.UltraChat.cryptoTipping.getUserWallets(currentUser.id)
        setCryptoWallets(wallets || {})
        
        const tips = await window.UltraChat.cryptoTipping.getTipStatistics(currentUser.id)
        setTipStats(tips || {})
      }
      
      // Load bot bridge connections
      if (window.UltraChat?.botBridge) {
        const connections = window.UltraChat.botBridge.getUserConnections?.(currentUser?.id) || {}
        setBotConnections(connections)
      }
      
      // Load trust statistics
      if (trustManager && currentUser) {
        const trustData = await trustManager.calculateTrustScore(currentUser.id)
        setTrustStats(trustData || {})
      }
      
      // Load audit statistics
      if (window.UltraChat?.auditManager && currentUser) {
        const auditEntries = await window.UltraChat.auditManager.getAuditEntries(currentUser.id, { limit: 50 })
        setAuditStats({
          total: auditEntries.length,
          recent: auditEntries.filter(entry => 
            Date.now() - new Date(entry.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
          ).length
        })
      }
    } catch (error) {
      console.error('Failed to load enhanced profile data:', error)
    }
  }

  // Handle crypto wallet management
  const handleWalletUpdate = async (currency, address) => {
    try {
      const updatedWallets = {
        ...cryptoWallets,
        [currency]: address
      }
      setCryptoWallets(updatedWallets)
      
      // Save to crypto tipping service
      if (window.UltraChat?.cryptoTipping) {
        await window.UltraChat.cryptoTipping.updateUserWallet(currentUser.id, currency, address)
      }
    } catch (error) {
      console.error('Failed to update wallet:', error)
    }
  }

  // Handle bot connection management
  const handleBotConnection = async (platform, action) => {
    try {
      if (action === 'connect') {
        // Trigger bot connection flow
        if (window.UltraChat?.botBridge) {
          await window.UltraChat.botBridge.connectPlatform(platform, currentUser.id)
        }
      } else if (action === 'disconnect') {
        // Disconnect from platform
        if (window.UltraChat?.botBridge) {
          await window.UltraChat.botBridge.disconnectPlatform(platform, currentUser.id)
        }
      }
      
      // Reload bot connections
      await loadEnhancedProfileData()
    } catch (error) {
      console.error(`Failed to ${action} ${platform}:`, error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="profile-modal">
        <div className="profile-header">
          <h2>Loading Profile...</h2>
          <button className="close-btn" onClick={onClose} title="Close Profile">
            ✕
          </button>
        </div>
        <div className="profile-content">
          <div className="loading-indicator">
            <p>Loading your profile data...</p>
          </div>
        </div>
      </div>
    )
  }

  const currentProfile = profileData
  return (
    <div className="profile-modal">
      <div className="profile-header">
        <h2>Profile Management</h2>
        <button className="close-btn" onClick={onClose} title="Close Profile">
          ✕
        </button>
      </div>

      <div className="profile-content">
        {/* Mode Selection */}
        <div className="mode-selection">
          <h3>Profile Modes</h3>
          <div className="modes-grid">
            {modes.map(mode => (
              <button
                key={mode.id}
                className={`mode-card ${activeMode === mode.id ? 'active' : ''}`}
                onClick={() => handleModeSwitch(mode.id)}
                style={{ borderColor: activeMode === mode.id ? mode.color : 'var(--color-border)' }}
                disabled={loading}
              >
                <div className="mode-icon" style={{ color: mode.color }}>
                  {mode.icon}
                </div>
                <div className="mode-info">
                  <h4 style={{ color: mode.color }}>{mode.name}</h4>
                  <p>{mode.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Editor */}
        <div className="profile-editor">
          <h3>
            Edit {activeMode} Profile
            <span className="mode-badge" style={{ backgroundColor: modes.find(m => m.id === activeMode)?.color }}>
              {modes.find(m => m.id === activeMode)?.icon} {activeMode}
            </span>
          </h3>

          <div className="editor-content">
            {/* Avatar Section */}
            <div className="avatar-section">
              <div className="avatar-preview">
                {currentProfile.avatar ? (
                  <img src={currentProfile.avatar} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {currentProfile.displayName ? currentProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              <div className="avatar-actions">
                <label className="btn btn-primary">
                  Upload Avatar
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ display: 'none' }}
                  />
                </label>
                <button className="btn" onClick={() => handleProfileUpdate('avatar', null)}>
                  Remove
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={currentProfile.displayName || ''}
                onChange={(e) => handleProfileUpdate('displayName', e.target.value)}
                className="input"
                disabled={activeMode === PROFILE_MODES.ANON || loading}
                placeholder={activeMode === PROFILE_MODES.ANON ? 'Anonymous' : 'Enter your display name'}
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={currentProfile.bio || ''}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                className="input textarea"
                rows="3"
                disabled={activeMode === PROFILE_MODES.ANON || loading}
                placeholder={activeMode === PROFILE_MODES.ANON ? 'Anonymous profiles have no bio' : 'Tell others about yourself...'}
              />
            </div>

            {/* Social Handles (Public & Ultra modes) */}
            {(activeMode === PROFILE_MODES.PUBLIC || activeMode === PROFILE_MODES.ULTRA) && (
              <div className="social-handles-section">
                <h4>Social Handles</h4>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentProfile.showSocialHandles || false}
                      onChange={(e) => handleProfileUpdate('showSocialHandles', e.target.checked)}
                      disabled={loading}
                    />
                    Show social handles publicly
                  </label>
                </div>

                {currentProfile.showSocialHandles && (
                  <div className="social-inputs">
                    <div className="form-group">
                      <label>Twitter/X</label>
                      <input
                        type="text"
                        value={currentProfile.socialHandles?.twitter || ''}
                        onChange={(e) => handleSocialHandleUpdate('twitter', e.target.value)}
                        className="input"
                        placeholder="@username"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>GitHub</label>
                      <input
                        type="text"
                        value={currentProfile.socialHandles?.github || ''}
                        onChange={(e) => handleSocialHandleUpdate('github', e.target.value)}
                        className="input"
                        placeholder="username"
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Website</label>
                      <input
                        type="text"
                        value={currentProfile.socialHandles?.website || ''}
                        onChange={(e) => handleSocialHandleUpdate('website', e.target.value)}
                        className="input"
                        placeholder="your-website.com"
                        disabled={loading}
                      />
                    </div>

                    {activeMode === PROFILE_MODES.ULTRA && (
                      <div className="form-group">
                        <label>UltraChat Handle</label>
                        <input
                          type="text"
                          value={currentProfile.socialHandles?.ultrachat || ''}
                          onChange={(e) => handleSocialHandleUpdate('ultrachat', e.target.value)}
                          className="input"
                          placeholder="@your_handle"
                          disabled={loading}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Ultra Mode Features */}
            {activeMode === PROFILE_MODES.ULTRA && (
              <div className="ultra-features">
                <h4>⚡ Ultra Features Dashboard</h4>
                
                {/* Enhanced Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card trust">
                    <div className="stat-value">{trustStats.score || currentProfile.trustScore || 0}%</div>
                    <div className="stat-label">Trust Score</div>
                    <div className="stat-sublabel">{trustStats.level || 'Calculating...'}</div>
                  </div>
                  <div className="stat-card endorsements">
                    <div className="stat-value">{currentProfile.endorsements?.length || 0}</div>
                    <div className="stat-label">Endorsements</div>
                    <div className="stat-sublabel">Community Trust</div>
                  </div>
                  <div className="stat-card crypto">
                    <div className="stat-value">{tipStats.totalTips || 0}</div>
                    <div className="stat-label">Crypto Tips</div>
                    <div className="stat-sublabel">${(tipStats.totalValue || 0).toFixed(2)} USD</div>
                  </div>
                  <div className="stat-card audit">
                    <div className="stat-value">{auditStats.recent || 0}</div>
                    <div className="stat-label">Weekly Activity</div>
                    <div className="stat-sublabel">{auditStats.total || 0} total entries</div>
                  </div>
                </div>

                {/* Crypto Wallet Management */}
                <div className="crypto-wallets-section">
                  <h5>💰 Crypto Wallets</h5>
                  <div className="wallets-grid">
                    {['BTC', 'ETH', 'DOGE', 'LTC', 'SOL', 'PYTH', 'LINK'].map(currency => (
                      <div key={currency} className="wallet-item">
                        <div className="wallet-header">
                          <span className="wallet-currency">{currency}</span>
                          <span className={`wallet-status ${cryptoWallets[currency] ? 'connected' : 'disconnected'}`}>
                            {cryptoWallets[currency] ? '✅' : '❌'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={cryptoWallets[currency] || ''}
                          onChange={(e) => handleWalletUpdate(currency, e.target.value)}
                          placeholder={`Enter ${currency} wallet address`}
                          className="wallet-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bot Bridge Connections */}
                <div className="bot-connections-section">
                  <h5>🌐 Bot Bridge Connections</h5>
                  <div className="connections-grid">
                    {[
                      { platform: 'discord', icon: '🎮', name: 'Discord' },
                      { platform: 'telegram', icon: '✈️', name: 'Telegram' },
                      { platform: 'twitter', icon: '🐦', name: 'Twitter/X' },
                      { platform: 'signal', icon: '📱', name: 'Signal' }
                    ].map(({ platform, icon, name }) => (
                      <div key={platform} className="connection-item">
                        <div className="connection-header">
                          <span className="connection-icon">{icon}</span>
                          <span className="connection-name">{name}</span>
                          <span className={`connection-status ${botConnections[platform] ? 'connected' : 'disconnected'}`}>
                            {botConnections[platform] ? '✅' : '❌'}
                          </span>
                        </div>
                        <div className="connection-actions">
                          {botConnections[platform] ? (
                            <button 
                              className="btn btn-small btn-danger"
                              onClick={() => handleBotConnection(platform, 'disconnect')}
                            >
                              Disconnect
                            </button>
                          ) : (
                            <button 
                              className="btn btn-small btn-primary"
                              onClick={() => handleBotConnection(platform, 'connect')}
                            >
                              Connect
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust & Endorsements Section */}
                <div className="endorsements-section">
                  <h5>🛡️ Trust & Endorsements</h5>
                  <div className="endorsements-list">
                    {currentProfile.endorsements && currentProfile.endorsements.length > 0 ? (
                      currentProfile.endorsements.slice(0, 3).map((endorsement, index) => (
                        <div key={endorsement.id || index} className="endorsement-item">
                          <div className="endorsement-header">
                            <span className="endorser-name">{endorsement.from || 'Anonymous'}</span>
                            <span className="endorsement-date">
                              {endorsement.timestamp ? new Date(endorsement.timestamp).toLocaleDateString() : 'Recent'}
                            </span>
                          </div>
                          <p className="endorsement-message">{endorsement.message || 'Endorsed this user'}</p>
                          <div className="endorsement-score">
                            Trust Impact: +{endorsement.trustScore || 5}%
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-endorsements">
                        <p>No endorsements yet. Build trust through:</p>
                        <ul>
                          <li>Successful crypto transactions</li>
                          <li>Community contributions</li>
                          <li>Verified bot connections</li>
                          <li>Requesting endorsements from contacts</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Actions */}
            <div className="profile-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleSaveProfile}
                disabled={saving || loading}
              >
                {saving ? 'Saving...' : 'Save All Changes'}
              </button>
              <button 
                className="btn" 
                onClick={handleResetProfile}
                disabled={loading}
              >
                Reset Profile
              </button>
              {activeMode === PROFILE_MODES.ULTRA && (
                <>
                  <button 
                    className="btn btn-crypto"
                    onClick={() => {
                      if (window.UltraChat?.cryptoTipping) {
                        console.log('Opening crypto dashboard...')
                        // This would open a crypto management modal
                      }
                    }}
                    disabled={loading}
                  >
                    💰 Crypto Dashboard
                  </button>
                  <button 
                    className="btn btn-trust"
                    onClick={() => {
                      if (trustManager) {
                        console.log('Opening trust management...')
                        // This would open trust management modal
                      }
                    }}
                    disabled={loading}
                  >
                    🛡️ Trust Center
                  </button>
                  <button 
                    className="btn btn-audit"
                    onClick={() => {
                      if (window.UltraChat?.auditManager) {
                        console.log('Opening audit viewer...')
                        // This would open audit trail viewer
                      }
                    }}
                    disabled={loading}
                  >
                    📊 View Audit Trail
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal

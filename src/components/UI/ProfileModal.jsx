import React, { useState, useEffect } from 'react'
import { UserDataManager } from '../../services/Settings'
import { PROFILE_MODES } from '../../utils/Constants'
import './ProfileModal.css'

const ProfileModal = ({ onClose }) => {
  const [userDataManager] = useState(new UserDataManager())
  const [activeMode, setActiveMode] = useState(PROFILE_MODES.BASIC)
  const [profileData, setProfileData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Initialize component and load user data
  useEffect(() => {
    initializeProfile()
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
        mode
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
      description: 'Enhanced features with Web of Trust',
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
      
      // Show success message (you could add a toast notification here)
      console.log('Profile saved successfully')
      
    } catch (error) {
      console.error('Failed to save profile:', error)
      // Show error message (you could add error handling UI here)
    } finally {
      setSaving(false)
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
                    {currentProfile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="avatar-actions">
                <button className="btn btn-primary">Upload Avatar</button>
                <button className="btn">Remove</button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="form-group">
              <label>Display Name</label>
              <input
                type="text"
                value={currentProfile.displayName}
                onChange={(e) => handleProfileUpdate('displayName', e.target.value)}
                className="input"
                disabled={activeMode === PROFILE_MODES.ANON || loading}
                placeholder={activeMode === PROFILE_MODES.ANON ? 'Anonymous' : 'Enter your display name'}
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={currentProfile.bio}
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

            {/* Ultra Mode Features */}
            {activeMode === PROFILE_MODES.ULTRA && (
              <div className="ultra-features">
                <h4>Ultra Features</h4>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{currentProfile.trustScore || 0}%</div>
                    <div className="stat-label">Trust Score</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{currentProfile.endorsements?.length || 0}</div>
                    <div className="stat-label">Endorsements</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{currentProfile.verified ? '✓' : '✗'}</div>
                    <div className="stat-label">Verified</div>
                  </div>
                </div>

                <div className="endorsements-section">
                  <h5>Recent Endorsements</h5>
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
                            Trust Score: {endorsement.trustScore || 0}%
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-endorsements">No endorsements yet. Request endorsements from trusted contacts.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="profile-actions">
              <button 
                className="btn btn-primary" 
                onClick={handleSaveProfile}
                disabled={saving || loading}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="btn" 
                onClick={handleResetProfile}
                disabled={loading}
              >
                Reset
              </button>
              {activeMode === PROFILE_MODES.ULTRA && (
                <button 
                  className="btn"
                  onClick={() => alert('Endorsement system coming soon!')}
                  disabled={loading}
                >
                  Request Endorsement
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
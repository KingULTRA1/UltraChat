import React, { useState } from 'react'
import './ProfileModal.css'

const ProfileModal = ({ onClose }) => {
  const [activeMode, setActiveMode] = useState('Basic')
  const [profile, setProfile] = useState({
    basic: {
      displayName: 'John Doe',
      bio: 'Privacy advocate and tech enthusiast',
      avatar: null
    },
    public: {
      displayName: 'John Doe',
      bio: 'Privacy advocate and tech enthusiast',
      socialHandles: {
        twitter: '@johndoe',
        github: 'johndoe',
        website: 'johndoe.dev'
      },
      showSocialHandles: true,
      avatar: null
    },
    anon: {
      displayName: 'Anonymous',
      bio: '',
      avatar: null
    },
    ultra: {
      displayName: 'John Doe',
      bio: 'Privacy advocate and tech enthusiast',
      socialHandles: {
        twitter: '@johndoe',
        github: 'johndoe',
        website: 'johndoe.dev',
        ultrachat: '@johndoe_ultra'
      },
      showSocialHandles: true,
      endorsements: 15,
      trustScore: 95,
      verified: true,
      avatar: null
    }
  })

  const [endorsements] = useState([
    {
      id: '1',
      from: 'Alice Cooper',
      message: 'Highly trustworthy and reliable',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      trustScore: 92
    },
    {
      id: '2',
      from: 'Bob Smith',
      message: 'Great privacy advocate',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      trustScore: 87
    }
  ])

  const modes = [
    {
      id: 'Basic',
      name: 'Basic',
      description: 'Minimal profile information',
      icon: '👤',
      color: 'var(--color-mode-basic)'
    },
    {
      id: 'Public',
      name: 'Public',
      description: 'Public profile with social handles',
      icon: '🌐',
      color: 'var(--color-mode-public)'
    },
    {
      id: 'Anon',
      name: 'Anonymous',
      description: 'Complete anonymity',
      icon: '🥷',
      color: 'var(--color-mode-anon)'
    },
    {
      id: 'Ultra',
      name: 'Ultra',
      description: 'Enhanced features with Web of Trust',
      icon: '⚡',
      color: 'var(--color-mode-ultra)'
    }
  ]

  const handleProfileUpdate = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [activeMode.toLowerCase()]: {
        ...prev[activeMode.toLowerCase()],
        [field]: value
      }
    }))
  }

  const handleSocialHandleUpdate = (platform, value) => {
    setProfile(prev => ({
      ...prev,
      [activeMode.toLowerCase()]: {
        ...prev[activeMode.toLowerCase()],
        socialHandles: {
          ...prev[activeMode.toLowerCase()].socialHandles,
          [platform]: value
        }
      }
    }))
  }

  const currentProfile = profile[activeMode.toLowerCase()]

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
                onClick={() => setActiveMode(mode.id)}
                style={{ borderColor: activeMode === mode.id ? mode.color : 'var(--color-border)' }}
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
                disabled={activeMode === 'Anon'}
              />
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                value={currentProfile.bio}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                className="input textarea"
                rows="3"
                disabled={activeMode === 'Anon'}
                placeholder={activeMode === 'Anon' ? 'Anonymous profiles have no bio' : 'Tell others about yourself...'}
              />
            </div>

            {/* Social Handles (Public & Ultra modes) */}
            {(activeMode === 'Public' || activeMode === 'Ultra') && (
              <div className="social-handles-section">
                <h4>Social Handles</h4>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={currentProfile.showSocialHandles}
                      onChange={(e) => handleProfileUpdate('showSocialHandles', e.target.checked)}
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
                      />
                    </div>

                    {activeMode === 'Ultra' && (
                      <div className="form-group">
                        <label>UltraChat Handle</label>
                        <input
                          type="text"
                          value={currentProfile.socialHandles?.ultrachat || ''}
                          onChange={(e) => handleSocialHandleUpdate('ultrachat', e.target.value)}
                          className="input"
                          placeholder="@your_handle"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Ultra Mode Features */}
            {activeMode === 'Ultra' && (
              <div className="ultra-features">
                <h4>Ultra Features</h4>
                
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{currentProfile.trustScore}%</div>
                    <div className="stat-label">Trust Score</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{currentProfile.endorsements}</div>
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
                    {endorsements.map(endorsement => (
                      <div key={endorsement.id} className="endorsement-item">
                        <div className="endorsement-header">
                          <span className="endorser-name">{endorsement.from}</span>
                          <span className="endorsement-date">
                            {endorsement.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <p className="endorsement-message">{endorsement.message}</p>
                        <div className="endorsement-score">
                          Trust Score: {endorsement.trustScore}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="profile-actions">
              <button className="btn btn-primary">Save Changes</button>
              <button className="btn">Reset</button>
              {activeMode === 'Ultra' && (
                <button className="btn">Request Endorsement</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal
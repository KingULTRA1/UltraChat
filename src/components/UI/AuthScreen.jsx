import React, { useState, useEffect } from 'react'
import QRScanner from './QRScanner'
import './AuthScreen.css'

// 🚀 UltraChat v1.2.3 Alpha - PRIVACY FIRST

const AuthScreen = ({ onLogin }) => {
  const [authMethod, setAuthMethod] = useState('handle')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [botBridgeStatus, setBotBridgeStatus] = useState({
    discord: false,
    telegram: false,
    twitter: false,
    signal: false
  })
  const [formData, setFormData] = useState({
    handle: '',
    name: '',
    profileMode: 'Basic',
    enableCrypto: false,
    acceptedTerms: false
  })

  const authMethods = [
    {
      id: 'handle',
      name: 'Handle/Phone',
      icon: '📱',
      description: 'Sign in with username, phone, or email',
      status: 'available'
    },
    {
      id: 'qr',
      name: 'QR Code',
      icon: '📱',
      description: 'Scan QR code from another device',
      status: 'available'
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '🎮',
      description: 'Connect via Discord bot',
      status: botBridgeStatus.discord ? 'connected' : 'available'
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      description: 'Connect via Telegram bot',
      status: botBridgeStatus.telegram ? 'connected' : 'available'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      icon: '🐦',
      description: 'Connect via Twitter/X',
      status: botBridgeStatus.twitter ? 'connected' : 'available'
    },
    {
      id: 'signal',
      name: 'Signal',
      icon: '🔒',
      description: 'Connect via Signal bridge',
      status: botBridgeStatus.signal ? 'connected' : 'available'
    }
  ]

  // Check bot bridge status on component mount
  useEffect(() => {
    checkBotBridgeStatus()
    const interval = setInterval(checkBotBridgeStatus, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const checkBotBridgeStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/health').catch(() => null)
      if (response && response.ok) {
        try {
          const status = await response.json()
          setBotBridgeStatus({
            discord: status.platforms?.discord || false,
            telegram: status.platforms?.telegram || false,
            twitter: status.platforms?.twitter || false,
            signal: status.platforms?.signal || false
          })
        } catch (jsonError) {
          // If response is not JSON (like HTML error page), bot bridge is not running
          setBotBridgeStatus({
            discord: false,
            telegram: false,
            twitter: false,
            signal: false
          })
        }
      } else {
        setBotBridgeStatus({
          discord: false,
          telegram: false,
          twitter: false,
          signal: false
        })
      }
    } catch (error) {
      // Bot bridge is not running or not accessible
      setBotBridgeStatus({
        discord: false,
        telegram: false,
        twitter: false,
        signal: false
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Check if terms are accepted for new users
    if (!formData.acceptedTerms && authMethod !== 'qr') {
      alert('Please accept the Terms of Service and Privacy Policy to continue.')
      return
    }
    
    if (authMethod === 'qr') {
      setShowQRScanner(true)
    } else if (formData.handle.trim()) {
      // Show onboarding for new users
      if (authMethod === 'handle' && formData.profileMode === 'Ultra') {
        setShowOnboarding(true)
      } else {
        completeLogin()
      }
    }
  }

  const completeLogin = () => {
    onLogin({
      method: authMethod,
      userData: {
        ...formData,
        cryptoEnabled: formData.enableCrypto,
        onboardingCompleted: true,
        trustLevel: formData.profileMode === 'Ultra' ? 'medium' : 'low'
      }
    })
  }

  const handleQRScan = (qrData) => {
    try {
      const parsedData = JSON.parse(qrData)
      if (parsedData.type === 'ultrachat_login') {
        onLogin({
          method: 'qr',
          userData: {
            userId: parsedData.userId,
            profileMode: parsedData.profileMode || 'Ultra',
            name: 'QR User',
            handle: parsedData.userId,
            imported: true,
            cryptoEnabled: parsedData.cryptoEnabled || false,
            trustLevel: parsedData.trustLevel || 'medium'
          }
        })
        setShowQRScanner(false)
      } else {
        throw new Error('Invalid UltraChat QR code')
      }
    } catch (error) {
      console.error('QR scan error:', error)
      alert('Invalid QR code: ' + error.message)
    }
  }

  const handleQRError = (error) => {
    console.error('QR Scanner error:', error)
    alert('QR Scanner error: ' + error)
  }

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <h1>UltraChat</h1>
            <span className="version">v1.2.3 Alpha</span>
            <span className="ultra-badge">PRIVACY FIRST</span>
          </div>
          <p className="tagline">Privacy First • E2E Encrypted • Zero Tracking • Crypto Tipping • Bot Bridge</p>
          
          {/* Bot Bridge Status Indicator */}
          <div className="bridge-status">
            <span className="status-label">Bot Bridges:</span>
            {Object.entries(botBridgeStatus).map(([platform, connected]) => (
              <span 
                key={platform} 
                className={`bridge-indicator ${connected ? 'connected' : 'disconnected'}`}
                title={`${platform}: ${connected ? 'Connected' : 'Disconnected'}`}
              >
                {authMethods.find(m => m.id === platform)?.icon}
              </span>
            ))}
          </div>
        </div>

        <div className="auth-content">
          <h2>Choose Sign-In Method</h2>
          
          <div className="auth-methods">
            {authMethods.map(method => (
              <button
                key={method.id}
                className={`auth-method-btn ${authMethod === method.id ? 'active' : ''} ${method.status}`}
                onClick={() => setAuthMethod(method.id)}
              >
                <span className="method-icon">{method.icon}</span>
                <div className="method-info">
                  <span className="method-name">{method.name}</span>
                  <span className="method-desc">{method.description}</span>
                  {method.status === 'connected' && (
                    <span className="method-status">✅ Bridge Active</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {authMethod === 'handle' && (
              <>
                <div className="form-group">
                  <label>Handle, Phone, or Email</label>
                  <input
                    type="text"
                    placeholder="@username, +1-555-0123, or email@domain.com"
                    value={formData.handle}
                    onChange={(e) => setFormData({...formData, handle: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    placeholder="Your display name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Privacy Mode</label>
                  <select 
                    value={formData.profileMode}
                    onChange={(e) => setFormData({...formData, profileMode: e.target.value})}
                  >
                    <option value="Basic">Basic - Minimal profile</option>
                    <option value="Public">Public - Social handles visible</option>
                    <option value="Anon">Anonymous - Complete privacy</option>
                    <option value="Ultra">Ultra - Web of Trust + Crypto Tipping</option>
                  </select>
                </div>
                
                {/* Enhanced v1.2.3 Alpha Options */}
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.enableCrypto}
                      onChange={(e) => setFormData({...formData, enableCrypto: e.target.checked})}
                    />
                    <span>Enable Crypto Tipping (BTC, ETH, DOGE, LTC, SOL, PYTH, LINK)</span>
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.acceptedTerms}
                      onChange={(e) => setFormData({...formData, acceptedTerms: e.target.checked})}
                      required
                    />
                    <span>I accept the Terms of Service and Privacy Policy</span>
                  </label>
                </div>
              </>
            )}

            {authMethod === 'qr' && (
              <div className="platform-auth qr-auth">
                <div className="platform-icon">📱</div>
                <h3>Connect via QR Code</h3>
                <div className="platform-instructions">
                  <p>To connect via QR code:</p>
                  <ol>
                    <li>Open UltraChat on your other device</li>
                    <li>Go to Settings → Backup & Sync</li>
                    <li>Generate QR code for this device</li>
                    <li>Click "Start Scanning" below to use camera</li>
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

            {['discord', 'telegram', 'twitter', 'signal'].includes(authMethod) && (
              <div className="platform-auth">
                <div className="platform-icon">
                  {authMethods.find(m => m.id === authMethod)?.icon}
                </div>
                <h3>Connect via {authMethods.find(m => m.id === authMethod)?.name}</h3>
                <div className="platform-instructions">
                  <p>To connect via {authMethod}:</p>
                  <ol>
                    <li>Open {authMethod} app</li>
                    <li>Find the UltraChat bot</li>
                    <li>Send command: <code>/connect</code></li>
                    <li>Follow the bot's instructions</li>
                  </ol>
                </div>
                <div className="form-group">
                  <label>{authMethod.charAt(0).toUpperCase() + authMethod.slice(1)} Username/ID</label>
                  <input
                    type="text"
                    placeholder={`Your ${authMethod} username or ID`}
                    value={formData.handle}
                    onChange={(e) => setFormData({...formData, handle: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={(authMethod !== 'qr' && !formData.handle.trim()) || (!formData.acceptedTerms && authMethod !== 'qr')}
            >
              {authMethod === 'qr' ? 'Start Scanning' : 
               ['discord', 'telegram', 'twitter', 'signal'].includes(authMethod) ? 'Connect via Bridge' : 
               'Sign In to UltraChat'}
            </button>
          </form>

          <div className="auth-features">
            <div className="feature">
              <span className="feature-icon">🔒</span>
              <span>AES-256-GCM Encrypted</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🛡️</span>
              <span>Zero Tracking</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🌐</span>
              <span>Cross-Platform Bridges</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💰</span>
              <span>Crypto Tipping</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🤝</span>
              <span>Web of Trust</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Audit Trails</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onError={handleQRError}
          onClose={() => setShowQRScanner(false)}
        />
      )}
      
      {/* Onboarding Modal for Ultra Mode */}
      {showOnboarding && (
        <div className="onboarding-modal-overlay">
          <div className="onboarding-modal">
            <div className="modal-header">
              <h3>🚀 Welcome to UltraChat Ultra Mode!</h3>
              <button onClick={() => setShowOnboarding(false)}>✕</button>
            </div>
            
            <div className="onboarding-content">
              <div className="onboarding-feature">
                <h4>🛡️ Web of Trust</h4>
                <p>Build trust through community endorsements and verified interactions.</p>
              </div>
              
              <div className="onboarding-feature">
                <h4>💰 Crypto Tipping</h4>
                <p>Send and receive tips in 7 cryptocurrencies with QR code generation.</p>
              </div>
              
              <div className="onboarding-feature">
                <h4>🌐 Bot Bridge</h4>
                <p>Connect Discord, Telegram, Twitter/X, and Signal for seamless messaging.</p>
              </div>
              
              <div className="onboarding-feature">
                <h4>📊 Audit Trails</h4>
                <p>Complete audit logs for all actions with local encryption.</p>
              </div>
            </div>
            
            <div className="onboarding-actions">
              <button onClick={() => setShowOnboarding(false)} className="btn-secondary">
                Skip Tutorial
              </button>
              <button onClick={() => { setShowOnboarding(false); completeLogin(); }} className="btn-primary">
                Start Ultra Experience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuthScreen
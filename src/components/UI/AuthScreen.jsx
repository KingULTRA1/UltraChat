import { useState, useEffect } from 'react'
import QRScanner from './QRScanner'
import './AuthScreen.css'
import ultraGenerator from '../../services/Communication/UltraGenerator.js'

// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

const AuthScreen = ({ onLogin }) => {
  const [authMethod, setAuthMethod] = useState('handle')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [deviceStatus, setDeviceStatus] = useState('checking')
  const [formData, setFormData] = useState({
    handle: '',
    name: '',
    accountType: 'Basic',
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
      id: 'device',
      name: 'Device Identity',
      icon: '🔐',
      description: 'Use device-based authentication',
      status: deviceStatus
    }
  ]

  // Check device status on component mount
  useEffect(() => {
    checkDeviceStatus()
  }, [])

  const checkDeviceStatus = async () => {
    try {
      const response = await fetch('http://localhost:3001/health').catch(() => null)
      if (response && response.ok) {
        const status = await response.json()
        setDeviceStatus(status.services.identity ? 'connected' : 'available')
      } else {
        setDeviceStatus('disconnected')
      }
    } catch (error) {
      setDeviceStatus('disconnected')
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
      // Show onboarding for new users with advanced account types
      if (authMethod === 'handle' && (formData.accountType === 'Ultra' || formData.accountType === 'Ultra Elite')) {
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
        trustLevel: formData.accountType === 'Ultra' || formData.accountType === 'Ultra Elite' || formData.accountType === 'Legacy' ? 'high' : 
                   formData.accountType === 'Pro' || formData.accountType === 'Anon Pro' ? 'medium' : 'low'
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
            accountType: parsedData.accountType || 'Ultra',
            name: 'QR User',
            handle: parsedData.userId,
            imported: true,
            cryptoEnabled: parsedData.cryptoEnabled || false,
            trustLevel: parsedData.accountType === 'Ultra' || parsedData.accountType === 'Ultra Elite' || parsedData.accountType === 'Legacy' ? 'high' : 
                       parsedData.accountType === 'Pro' || parsedData.accountType === 'Anon Pro' ? 'medium' : 'low'
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

  // Generate a nickname suggestion using UltraGenerator
  const generateNicknameSuggestion = () => {
    try {
      // Check if ultraGenerator is available and has the method
      if (ultraGenerator && typeof ultraGenerator.generateAuthNickname === 'function') {
        const suggestion = ultraGenerator.generateAuthNickname();
        setFormData({...formData, handle: suggestion});
      } else {
        // Fallback if UltraGenerator is not working
        const fallbackHandles = ['User' + Math.floor(Math.random() * 1000), 'UltraUser', 'ChatUser'];
        const suggestion = fallbackHandles[Math.floor(Math.random() * fallbackHandles.length)];
        setFormData({...formData, handle: suggestion});
      }
    } catch (error) {
      console.error('Error generating nickname:', error);
      // Fallback if there's an error
      const fallbackHandles = ['User' + Math.floor(Math.random() * 1000), 'UltraUser', 'ChatUser'];
      const suggestion = fallbackHandles[Math.floor(Math.random() * fallbackHandles.length)];
      setFormData({...formData, handle: suggestion});
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="auth-header">
          <div className="logo">
            <span className="logo-icon">🛡️</span>
            <h1>UltraChat</h1>
            <span className="version">v1.2.3.4 Final</span>
            <span className="ultra-badge">PRIVACY FIRST</span>
          </div>
          <p className="tagline">One Seamless Unified Communication Platform - Voice, Video, Text, Events</p>
          
          {/* Device Status Indicator */}
          <div className="bridge-status">
            <span className="status-label">Device Identity:</span>
            <span className={`bridge-indicator ${deviceStatus === 'connected' ? 'connected' : 'disconnected'}`}>
              {deviceStatus === 'connected' ? '✅ Active' : deviceStatus === 'checking' ? '🔍 Checking...' : '❌ Inactive'}
            </span>
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
                    <span className="method-status">✅ Device Ready</span>
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
                  <div className="input-with-button">
                    <input
                      type="text"
                      placeholder="@username, +1-555-0123, or email@domain.com"
                      value={formData.handle}
                      onChange={(e) => setFormData({...formData, handle: e.target.value})}
                      required
                    />
                    <button 
                      type="button" 
                      className="generate-nickname-btn"
                      onClick={generateNicknameSuggestion}
                      title="Generate Ultra Nickname"
                    >
                      🎲
                    </button>
                  </div>
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
                  <label>Account Type</label>
                  <select 
                    value={formData.accountType}
                    onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                    className={`account-type-select account-type-${formData.accountType.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <option value="Basic">Basic - Minimal access, mostly read-only or limited chat</option>
                    <option value="Public">Public - Social handles and enhanced visibility</option>
                    <option value="Legacy">Legacy/OG - Historical user privileges with standard chat, voice, and event access</option>
                    <option value="Pro">Pro - Professional user with enhanced capabilities and full feature set</option>
                    <option value="Ultra">Ultra - Unified access to all your social accounts</option>
                    <option value="Ultra Elite">Ultra Elite - Elite user with maximum features and priority access</option>
                    <option value="Anon Pro">Anon Pro - Professional anonymity with enhanced privacy features and stealth/lockdown modes</option>
                    <option value="Anon">Anon - Complete anonymity with session-based identity</option>
                  </select>
                  
                  {/* Account Type Legend */}
                  <div className="account-type-legend">
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-basic"></div>
                      <span>Basic</span>
                    </div>
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-public"></div>
                      <span>Public</span>
                    </div>
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-legacy"></div>
                      <span>Legacy/OG</span>
                    </div>
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-pro"></div>
                      <span>Pro</span>
                    </div>
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-ultra"></div>
                      <span>Ultra</span>
                    </div>
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-ultra-elite"></div>
                      <span>Ultra Elite</span>
                    </div>
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-anon-pro"></div>
                      <span>Anon Pro</span>
                    </div>
                    <div className="account-type-legend-item">
                      <div className="account-type-legend-color legend-anon"></div>
                      <span>Anon</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced v1.2.3.4 Final Options */}

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
                    <li>Click &#34;Start Scanning&#34; below to use camera</li>
                  </ol>
                </div>
                <div className="qr-demo">
                  <div className="qr-code-demo">
                    <div className="qr-pattern">
                      <div className="qr-corner tl"></div>
                      <div className="qr-corner tr"></div>
                      <div className="qr-data"></div>
                      <div className="qr-corner bl"></div>
                      <div className="qr-corner br"></div>
                    </div>
                    <p className="qr-demo-text">Sample QR Code Pattern</p>
                  </div>
                </div>
              </div>
            )}

            {authMethod === 'device' && (
              <div className="platform-auth">
                <div className="platform-icon">🔐</div>
                <h3>Device-Based Authentication</h3>
                <div className="platform-instructions">
                  <p>UltraChat uses device-based authentication for maximum security:</p>
                  <ul>
                    <li>Each device has a unique cryptographic identity</li>
                    <li>No external credentials or passwords required</li>
                    <li>All data is encrypted locally on your device</li>
                    <li>Your identity cannot be compromised by external platforms</li>
                  </ul>
                  <p className="note">
                    <strong>Note:</strong> This approach ensures you can never be banned from your own app.
                    All communication is handled directly by UltraChat without intermediary bots or bridges.
                  </p>
                </div>
                
                {/* Device Status */}
                <div className="bot-assignment">
                  <h4>_DEVICE STATUS_</h4>
                  {deviceStatus === 'connected' ? (
                    <p className="status-connected">✅ Device identity verified</p>
                  ) : deviceStatus === 'checking' ? (
                    <p className="status-checking">🔍 Verifying device identity...</p>
                  ) : (
                    <p className="status-disconnected">❌ Device identity not found</p>
                  )}
                  
                  <div className="form-group">
                    <label>Device Identity</label>
                    <div className="platform-status">
                      <span className="platform-indicator device">🔐 Cryptographic Identity</span>
                    </div>
                  </div>
                  
                  {deviceStatus !== 'connected' && (
                    <div className="setup-instructions">
                      <p>To enable device-based authentication:</p>
                      <ol>
                        <li>Start the UltraChat Unified Server</li>
                        <li>Allow UltraChat to create a device identity</li>
                        <li>Restart this application</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={(authMethod !== 'qr' && !formData.handle.trim()) || (!formData.acceptedTerms && authMethod !== 'qr')}
            >
              {authMethod === 'qr' ? 'Start Scanning' : 'Sign In to UltraChat'}
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
              <span className="feature-icon">🔐</span>
              <span>Device-Based Identity</span>
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
                <h4>🔐 Device-Based Identity</h4>
                <p>Your identity is secured with cryptographic keys stored only on your device. No external platform can ban you from your own app.</p>
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
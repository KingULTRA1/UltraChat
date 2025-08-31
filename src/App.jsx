import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/UI/Layout'
import AuthScreen from './components/UI/AuthScreen'
import ProfileManager from './services/Profiles/ProfileManager'
import TrustManager from './services/Trust/TrustManager'
import LocalStorage from './utils/LocalStorage'
import AuditManager from './services/Management/AuditManager'
import MessageManagement from './services/Management/MessageManagement'
import FileManager from './services/Management/FileManager'
import CryptoTipping from './services/Finance/CryptoTipping'
import TrustIntegrationService from './services/Integration/TrustIntegrationService'
import AutoReplyManager from './services/Messaging/AutoReplyManager'
import './App.css'

function App() {
  const [currentTheme, setCurrentTheme] = useState('obsidian')
  const [blueFilterEnabled, setBlueFilterEnabled] = useState(true)
  const [servicesInitialized, setServicesInitialized] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Initialize core services
    initializeServices()
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('ultrachat-user')
    if (savedUser) {
      setIsLoggedIn(true)
    }
    
    // Load user preferences from local storage
    const savedTheme = localStorage.getItem('ultrachat-theme') || 'obsidian'
    const savedBlueFilter = localStorage.getItem('ultrachat-blue-filter') !== 'false'
    
    setCurrentTheme(savedTheme)
    setBlueFilterEnabled(savedBlueFilter)
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', savedTheme)
    document.documentElement.setAttribute('data-blue-filter', savedBlueFilter)
  }, [])

  const initializeServices = async () => {
    try {
      console.log('🚀 Initializing UltraChat v1.2.3 Alpha services...')
      
      // Initialize LocalStorage first (required by all other services)
      const localStorageService = new LocalStorage()
      await localStorageService.initialize()
      console.log('✅ LocalStorage initialized')
      
      // Initialize core audit manager (requires LocalStorage)
      const auditManager = new AuditManager()
      await auditManager.initialize()
      console.log('✅ AuditManager initialized')
      
      // Initialize profile manager
      const profileManager = new ProfileManager()
      await profileManager.initializeStorage()
      console.log('✅ ProfileManager initialized')
      
      // Initialize trust manager with proper crypto key setup
      const trustManager = new TrustManager()
      await trustManager.initialize()
      console.log('✅ TrustManager initialized')
      
      // Initialize message management with audit trail
      const messageManagement = new MessageManagement(auditManager, trustManager)
      await messageManagement.initialize()
      console.log('✅ MessageManagement initialized')
      
      // Initialize file manager
      const fileManager = new FileManager(auditManager, messageManagement)
      await fileManager.initialize()
      console.log('✅ FileManager initialized')
      
      // Initialize crypto tipping system
      const cryptoTipping = new CryptoTipping(auditManager)
      await cryptoTipping.initialize()
      console.log('✅ CryptoTipping initialized')
      
      // Initialize trust integration service
      const trustIntegration = new TrustIntegrationService(trustManager, auditManager, messageManagement, fileManager)
      await trustIntegration.initialize()
      console.log('✅ TrustIntegrationService initialized')
      
      // Initialize auto-reply manager
      const autoReplyManager = new AutoReplyManager()
      await autoReplyManager.initialize()
      console.log('✅ AutoReplyManager initialized')
      
      // Add sample Web of Trust data if not exists
      await initializeSampleTrustData(trustManager)
      
      // Store references globally for access by components
      window.UltraChat = {
        profileManager,
        trustManager,
        auditManager,
        messageManagement,
        fileManager,
        cryptoTipping,
        trustIntegration,
        autoReplyManager,
        version: '1.2.3 Alpha'
      }
      
      setServicesInitialized(true)
      console.log('🎉 UltraChat v1.2.3 Alpha services initialized successfully!')
      
      // Log successful initialization
      await auditManager.logSystemEvent('app_initialized', {
        version: '1.2.3 Alpha',
        services: ['AuditManager', 'ProfileManager', 'TrustManager', 'MessageManagement', 
                  'FileManager', 'CryptoTipping', 'TrustIntegrationService', 'AutoReplyManager'],
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ Failed to initialize UltraChat services:', error)
      // Still allow app to load with limited functionality
      setServicesInitialized(true)
    }
  }

  const initializeSampleTrustData = async (trustManager) => {
    try {
      // Check if sample data already exists
      const existingEndorsements = await trustManager.getEndorsements()
      if (existingEndorsements.length > 0) return

      console.log('🌐 Initializing sample Web of Trust data...')
      
      // Add sample endorsements for Web of Trust
      const sampleEndorsements = [
        {
          endorseeId: '1', // Alice Cooper
          message: 'Excellent developer and trustworthy person. Worked on multiple projects together.',
          trustScore: 95,
          categories: ['professional', 'technical', 'reliability']
        },
        {
          endorseeId: '2', // Bob Smith
          message: 'Great communication and always delivers on time.',
          trustScore: 87,
          categories: ['professional', 'communication']
        },
        {
          endorseeId: '3', // Charlie Dev
          message: 'Brilliant security expert, very knowledgeable about encryption.',
          trustScore: 91,
          categories: ['technical', 'security', 'encryption']
        },
        {
          endorseeId: '4', // Diana Designer
          message: 'Amazing UX/UI designer with great attention to detail.',
          trustScore: 88,
          categories: ['design', 'ui_ux', 'creativity']
        },
        {
          endorseeId: '5', // Eve Entrepreneur
          message: 'Excellent project manager and crypto enthusiast.',
          trustScore: 84,
          categories: ['management', 'crypto', 'leadership']
        },
        {
          endorseeId: '6', // Frank Moderator
          message: 'Trusted community moderator with excellent judgment.',
          trustScore: 92,
          categories: ['moderation', 'community', 'trust']
        }
      ]

      for (const endorsementData of sampleEndorsements) {
        await trustManager.createEndorsement(endorsementData.endorseeId, endorsementData)
      }

      console.log('✅ Sample Web of Trust data initialized with 6 endorsements')
    } catch (error) {
      console.error('❌ Failed to initialize sample trust data:', error)
    }
  }

  const updateTheme = (theme) => {
    setCurrentTheme(theme)
    localStorage.setItem('ultrachat-theme', theme)
    document.documentElement.setAttribute('data-theme', theme)
  }

  const toggleBlueFilter = () => {
    const newValue = !blueFilterEnabled
    setBlueFilterEnabled(newValue)
    localStorage.setItem('ultrachat-blue-filter', newValue)
    document.documentElement.setAttribute('data-blue-filter', newValue)
  }

  const handleLogin = (authData) => {
    // Store user login state
    localStorage.setItem('ultrachat-user', JSON.stringify({
      method: authData.method,
      userData: authData.userData,
      loginTime: new Date().toISOString()
    }))
    
    setIsLoggedIn(true)
    console.log('User logged in:', authData)
  }

  const handleLogout = () => {
    localStorage.removeItem('ultrachat-user')
    setIsLoggedIn(false)
  }

  return (
    <div className="app" data-theme={currentTheme}>
      {!isLoggedIn ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <Routes>
          <Route 
            path="/*" 
            element={
              <Layout 
                onThemeChange={updateTheme}
                onBlueFilterToggle={toggleBlueFilter}
                blueFilterEnabled={blueFilterEnabled}
                currentTheme={currentTheme}
                onLogout={handleLogout}
              />
            } 
          />
        </Routes>
      )}
    </div>
  )
}

export default App
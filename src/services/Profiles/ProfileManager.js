// Profile Management System
// Handles different profile modes: Basic, Public, Anon, Ultra

import LocalStorage from '../../utils/LocalStorage.js'

class ProfileManager {
  constructor() {
    this.storage = new LocalStorage()
    this.currentProfile = null
    this.profiles = this.loadProfiles()
    this.activeMode = localStorage.getItem('ultrachat-profile-mode') || 'Basic'
    this.initializeStorage()
  }

  // Initialize secure storage
  async initializeStorage() {
    try {
      await this.storage.initialize()
      console.log('Profile storage initialized')
    } catch (error) {
      console.error('Profile storage initialization failed:', error)
    }
  }

  // Load profiles from local storage
  loadProfiles() {
    const saved = localStorage.getItem('ultrachat-profiles')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (error) {
        console.error('Failed to load profiles:', error)
      }
    }
    
    // Default profiles
    return {
      basic: {
        id: 'basic',
        mode: 'Basic',
        displayName: 'User',
        bio: '',
        avatar: null,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      public: {
        id: 'public',
        mode: 'Public',
        displayName: 'User',
        bio: '',
        avatar: null,
        socialHandles: {
          twitter: '',
          github: '',
          website: ''
        },
        showSocialHandles: true,
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      anon: {
        id: 'anon',
        mode: 'Anon',
        displayName: 'Anonymous',
        bio: '',
        avatar: null,
        sessionId: this.generateSessionId(),
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      ultra: {
        id: 'ultra',
        mode: 'Ultra',
        displayName: 'User',
        bio: '',
        avatar: null,
        socialHandles: {
          twitter: '',
          github: '',
          website: '',
          ultrachat: ''
        },
        showSocialHandles: true,
        trustScore: 0,
        endorsements: [],
        endorsementCount: 0,
        verified: false,
        keyPair: null, // Will be generated when needed
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }
    }
  }

  // Save profiles to local storage with error handling
  saveProfiles() {
    try {
      // Use both localStorage and our secure storage
      localStorage.setItem('ultrachat-profiles', JSON.stringify(this.profiles))
      localStorage.setItem('ultrachat-profile-mode', this.activeMode)
      
      // Also save to secure storage if available
      if (this.storage && this.storage.initialized) {
        this.storage.store('profiles_secure', this.profiles, true)
        this.storage.store('active_mode_secure', this.activeMode, false)
      }
      
      console.log('Profiles saved successfully:', this.activeMode)
      return true
    } catch (error) {
      console.error('Failed to save profiles:', error)
      return false
    }
  }

  // Get current active profile
  getCurrentProfile() {
    return this.profiles[this.activeMode.toLowerCase()]
  }

  // Switch profile mode
  switchMode(mode) {
    const validModes = ['Basic', 'Public', 'Anon', 'Ultra']
    if (!validModes.includes(mode)) {
      throw new Error(`Invalid profile mode: ${mode}`)
    }
    
    this.activeMode = mode
    this.currentProfile = this.getCurrentProfile()
    this.saveProfiles()
    
    // Emit profile change event
    this.emitProfileChange()
    
    return this.currentProfile
  }

  // Update profile information with enhanced persistence
  updateProfile(mode, updates) {
    const profileKey = mode.toLowerCase()
    if (!this.profiles[profileKey]) {
      throw new Error(`Profile mode ${mode} not found`)
    }

    // Validate updates based on profile mode
    const sanitizedUpdates = this.sanitizeUpdates(mode, updates)
    
    this.profiles[profileKey] = {
      ...this.profiles[profileKey],
      ...sanitizedUpdates,
      lastUpdated: new Date().toISOString()
    }

    // Save immediately with verification
    const saveSuccess = this.saveProfiles()
    if (!saveSuccess) {
      console.error('Profile save failed, attempting recovery')
      // Attempt to save to localStorage as fallback
      try {
        localStorage.setItem('ultrachat-profiles-backup', JSON.stringify(this.profiles))
      } catch (error) {
        console.error('Backup save also failed:', error)
      }
    }
    
    // If updating current profile, refresh it
    if (mode === this.activeMode) {
      this.currentProfile = this.getCurrentProfile()
      this.emitProfileChange()
    }

    console.log('Profile updated:', mode, sanitizedUpdates)
    return this.profiles[profileKey]
  }

  // Sanitize updates based on profile mode restrictions
  sanitizeUpdates(mode, updates) {
    const sanitized = { ...updates }

    switch (mode) {
      case 'Anon':
        // Anonymous profiles have restrictions
        sanitized.displayName = 'Anonymous'
        sanitized.bio = ''
        sanitized.avatar = null
        delete sanitized.socialHandles
        break
        
      case 'Basic':
        // Basic profiles don't have social handles
        delete sanitized.socialHandles
        delete sanitized.trustScore
        delete sanitized.endorsements
        break
        
      case 'Public':
        // Public profiles can't have Ultra features
        delete sanitized.trustScore
        delete sanitized.endorsements
        delete sanitized.verified
        break
        
      case 'Ultra':
        // Ultra profiles have all features
        break
    }

    return sanitized
  }

  // Generate anonymous session ID
  generateSessionId() {
    return 'anon_' + Math.random().toString(36).substr(2, 9)
  }

  // Get profile for display (respects privacy settings)
  getDisplayProfile(mode = null) {
    const profile = mode ? this.profiles[mode.toLowerCase()] : this.getCurrentProfile()
    if (!profile) return null

    const displayProfile = {
      mode: profile.mode,
      displayName: profile.displayName,
      bio: profile.bio,
      avatar: profile.avatar
    }

    // Add mode-specific features
    switch (profile.mode) {
      case 'Public':
      case 'Ultra':
        if (profile.showSocialHandles && profile.socialHandles) {
          displayProfile.socialHandles = profile.socialHandles
        }
        break
    }

    if (profile.mode === 'Ultra') {
      displayProfile.trustScore = profile.trustScore || 0
      displayProfile.endorsementCount = profile.endorsementCount || 0
      displayProfile.verified = profile.verified || false
    }

    return displayProfile
  }

  // Get all available profile modes
  getAvailableModes() {
    return [
      {
        id: 'Basic',
        name: 'Basic',
        description: 'Minimal profile information',
        icon: '👤',
        features: ['Basic messaging', 'Local storage']
      },
      {
        id: 'Public',
        name: 'Public',
        description: 'Public profile with social handles',
        icon: '🌐',
        features: ['Basic messaging', 'Social handles', 'Public visibility']
      },
      {
        id: 'Anon',
        name: 'Anonymous',
        description: 'Complete anonymity',
        icon: '🥷',
        features: ['Anonymous messaging', 'No data retention', 'Session-based']
      },
      {
        id: 'Ultra',
        name: 'Ultra',
        description: 'Enhanced features with Web of Trust',
        icon: '⚡',
        features: ['All Public features', 'Web of Trust', 'Endorsements', 'Verification']
      }
    ]
  }

  // Import/Export profile data
  exportProfile(mode = null) {
    const profile = mode ? this.profiles[mode.toLowerCase()] : this.getCurrentProfile()
    if (!profile) return null

    // Remove sensitive data for export
    const exportData = { ...profile }
    delete exportData.keyPair
    delete exportData.sessionId

    return {
      version: '1.0',
      exported: new Date().toISOString(),
      profile: exportData
    }
  }

  importProfile(profileData) {
    if (!profileData.profile || !profileData.profile.mode) {
      throw new Error('Invalid profile data')
    }

    const mode = profileData.profile.mode
    const profileKey = mode.toLowerCase()
    
    this.profiles[profileKey] = {
      ...profileData.profile,
      lastUpdated: new Date().toISOString()
    }

    this.saveProfiles()
    return this.profiles[profileKey]
  }

  // Event system for profile changes
  emitProfileChange() {
    const event = new CustomEvent('profileChanged', {
      detail: {
        mode: this.activeMode,
        profile: this.getCurrentProfile()
      }
    })
    window.dispatchEvent(event)
  }

  // Subscribe to profile changes
  onProfileChange(callback) {
    window.addEventListener('profileChanged', callback)
    return () => window.removeEventListener('profileChanged', callback)
  }

  // Validate profile data
  validateProfile(profile) {
    const required = ['mode', 'displayName']
    const missing = required.filter(field => !profile[field])
    
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`)
    }

    return true
  }

  // Reset profile to defaults
  resetProfile(mode) {
    const defaultProfiles = new ProfileManager().loadProfiles()
    const profileKey = mode.toLowerCase()
    
    if (defaultProfiles[profileKey]) {
      this.profiles[profileKey] = defaultProfiles[profileKey]
      this.saveProfiles()
      
      if (mode === this.activeMode) {
        this.currentProfile = this.getCurrentProfile()
        this.emitProfileChange()
      }
    }
  }

  // Get profile statistics
  getProfileStats() {
    const current = this.getCurrentProfile()
    return {
      mode: current.mode,
      created: current.created,
      lastUpdated: current.lastUpdated,
      messageCount: 0, // Will be populated by messaging system
      endorsementCount: current.endorsementCount || 0,
      trustScore: current.trustScore || 0
    }
  }
}

export default ProfileManager
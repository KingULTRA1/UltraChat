// User Data Manager - Handles local user data with privacy controls
// This service ensures user data stays local and is never transmitted

import LocalStorage from '../../utils/LocalStorage.js'
import { PROFILE_MODES, DEFAULT_SETTINGS } from '../../utils/Constants.js'

class UserDataManager {
  constructor() {
    this.storage = new LocalStorage()
    this.initialized = false
  }

  // Initialize user data management
  async initialize() {
    try {
      await this.storage.initialize()
      
      // Ensure user has local data structure
      const userData = await this.storage.getUserData()
      if (!userData.profile.setupCompleted) {
        await this.initializeNewUser()
      }
      
      this.initialized = true
      return true
    } catch (error) {
      console.error('User data initialization failed:', error)
      return false
    }
  }

  // Initialize new user with default settings
  async initializeNewUser() {
    const defaultUserData = {
      preferences: {
        ...DEFAULT_SETTINGS,
        firstRun: false,
        setupDate: new Date().toISOString()
      },
      profile: {
        currentMode: PROFILE_MODES.BASIC,
        setupCompleted: true,
        profilesCreated: [PROFILE_MODES.BASIC]
      },
      privacy: {
        analyticsOptOut: true,
        trackingOptOut: true,
        localOnlyMode: true,
        dataSharing: false,
        crashReporting: false
      },
      security: {
        encryptionEnabled: true,
        keyRotationEnabled: true,
        sessionTimeout: 30,
        autoLock: true
      }
    }

    await this.storage.storeUserData(defaultUserData)
    
    // Create default basic profile
    const basicProfile = {
      displayName: 'User',
      bio: '',
      avatar: null,
      mode: PROFILE_MODES.BASIC,
      created: new Date().toISOString()
    }
    
    await this.storage.storeProfileData(basicProfile, PROFILE_MODES.BASIC)
    
    return defaultUserData
  }

  // Get user preferences
  async getUserPreferences() {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    return userData.preferences || DEFAULT_SETTINGS
  }

  // Update user preferences
  async updateUserPreferences(newPreferences) {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    userData.preferences = {
      ...userData.preferences,
      ...newPreferences,
      lastModified: new Date().toISOString()
    }
    
    await this.storage.storeUserData(userData)
    this.emitPreferencesChange(userData.preferences)
    
    return userData.preferences
  }

  // Get current profile mode
  async getCurrentProfileMode() {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    return userData.profile.currentMode || PROFILE_MODES.BASIC
  }

  // Switch profile mode
  async switchProfileMode(mode) {
    if (!this.initialized) await this.initialize()
    
    if (!Object.values(PROFILE_MODES).includes(mode)) {
      throw new Error(`Invalid profile mode: ${mode}`)
    }
    
    const userData = await this.storage.getUserData()
    const previousMode = userData.profile.currentMode
    
    userData.profile.currentMode = mode
    userData.profile.lastModeSwitch = new Date().toISOString()
    
    // Add to created profiles list if not already there
    if (!userData.profile.profilesCreated.includes(mode)) {
      userData.profile.profilesCreated.push(mode)
    }
    
    await this.storage.storeUserData(userData)
    
    // Create profile if it doesn't exist
    const existingProfile = await this.storage.getProfileData(mode)
    if (!existingProfile) {
      await this.createDefaultProfile(mode)
    }
    
    this.emitProfileModeChange({ from: previousMode, to: mode })
    
    return mode
  }

  // Create default profile for a mode
  async createDefaultProfile(mode) {
    const defaultProfiles = {
      [PROFILE_MODES.BASIC]: {
        displayName: 'User',
        bio: '',
        avatar: null
      },
      [PROFILE_MODES.PUBLIC]: {
        displayName: 'User',
        bio: '',
        avatar: null,
        socialHandles: {},
        showSocialHandles: false
      },
      [PROFILE_MODES.ANON]: {
        displayName: 'Anonymous',
        bio: '',
        avatar: null,
        sessionId: this.generateAnonId()
      },
      [PROFILE_MODES.ULTRA]: {
        displayName: 'User',
        bio: '',
        avatar: null,
        socialHandles: {},
        showSocialHandles: false,
        trustScore: 0,
        endorsements: [],
        verified: false
      }
    }
    
    const profileData = {
      ...defaultProfiles[mode],
      mode,
      created: new Date().toISOString(),
      localOnly: true
    }
    
    await this.storage.storeProfileData(profileData, mode)
    return profileData
  }

  // Generate anonymous session ID
  generateAnonId() {
    return 'anon_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Get privacy settings
  async getPrivacySettings() {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    return userData.privacy || {
      analyticsOptOut: true,
      trackingOptOut: true,
      localOnlyMode: true,
      dataSharing: false,
      crashReporting: false
    }
  }

  // Update privacy settings
  async updatePrivacySettings(newSettings) {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    userData.privacy = {
      ...userData.privacy,
      ...newSettings,
      lastModified: new Date().toISOString()
    }
    
    await this.storage.storeUserData(userData)
    this.emitPrivacyChange(userData.privacy)
    
    return userData.privacy
  }

  // Get security settings
  async getSecuritySettings() {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    return userData.security || {
      encryptionEnabled: true,
      keyRotationEnabled: true,
      sessionTimeout: 30,
      autoLock: true
    }
  }

  // Update security settings
  async updateSecuritySettings(newSettings) {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    userData.security = {
      ...userData.security,
      ...newSettings,
      lastModified: new Date().toISOString()
    }
    
    await this.storage.storeUserData(userData)
    this.emitSecurityChange(userData.security)
    
    return userData.security
  }

  // Export all user data for local backup
  async exportAllUserData() {
    if (!this.initialized) await this.initialize()
    
    const exportData = await this.storage.exportUserDataLocally()
    
    // Add additional metadata
    exportData.exportType = 'complete_user_data'
    exportData.appVersion = '1.0.0'
    exportData.privacyNotice = 'This data is encrypted and meant for local backup only. Never share this file.'
    
    return exportData
  }

  // Import user data from local backup
  async importAllUserData(exportData) {
    if (!this.initialized) await this.initialize()
    
    if (!exportData.localOnly) {
      throw new Error('Can only import local-only data for privacy protection')
    }
    
    const results = await this.storage.importUserDataLocally(exportData)
    
    // Re-initialize after import
    await this.initialize()
    
    this.emitDataImported(results)
    
    return results
  }

  // Get user statistics (privacy-safe)
  async getUserStats() {
    if (!this.initialized) await this.initialize()
    
    const userData = await this.storage.getUserData()
    const storageStats = this.storage.getStorageStats()
    
    return {
      setupDate: userData.preferences?.setupDate,
      currentMode: userData.profile?.currentMode,
      profilesCreated: userData.profile?.profilesCreated?.length || 0,
      lastActivity: userData.preferences?.lastModified,
      storageUsed: storageStats.totalSizeFormatted,
      localOnlyMode: userData.privacy?.localOnlyMode,
      encryptionEnabled: userData.security?.encryptionEnabled
    }
  }

  // Clear all user data (for account deletion)
  async clearAllUserData() {
    if (!this.initialized) await this.initialize()
    
    // Clear all stored data
    this.storage.clearAll()
    
    // Reset initialization
    this.initialized = false
    
    this.emitDataCleared()
    
    return true
  }

  // Event emission for UI updates
  emitPreferencesChange(preferences) {
    window.dispatchEvent(new CustomEvent('userPreferencesChanged', {
      detail: { preferences }
    }))
  }

  emitProfileModeChange(change) {
    window.dispatchEvent(new CustomEvent('profileModeChanged', {
      detail: change
    }))
  }

  emitPrivacyChange(privacy) {
    window.dispatchEvent(new CustomEvent('privacySettingsChanged', {
      detail: { privacy }
    }))
  }

  emitSecurityChange(security) {
    window.dispatchEvent(new CustomEvent('securitySettingsChanged', {
      detail: { security }
    }))
  }

  emitDataImported(results) {
    window.dispatchEvent(new CustomEvent('userDataImported', {
      detail: results
    }))
  }

  emitDataCleared() {
    window.dispatchEvent(new CustomEvent('userDataCleared', {
      detail: { timestamp: new Date().toISOString() }
    }))
  }

  // Event listeners for UI components
  onPreferencesChange(callback) {
    window.addEventListener('userPreferencesChanged', callback)
    return () => window.removeEventListener('userPreferencesChanged', callback)
  }

  onProfileModeChange(callback) {
    window.addEventListener('profileModeChanged', callback)
    return () => window.removeEventListener('profileModeChanged', callback)
  }

  onPrivacyChange(callback) {
    window.addEventListener('privacySettingsChanged', callback)
    return () => window.removeEventListener('privacySettingsChanged', callback)
  }

  onSecurityChange(callback) {
    window.addEventListener('securitySettingsChanged', callback)
    return () => window.removeEventListener('securitySettingsChanged', callback)
  }
}

export default UserDataManager
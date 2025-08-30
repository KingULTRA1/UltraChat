// Local Storage Manager for UltraChat
// Handles secure local storage of messages and data

import CryptoUtils from './CryptoUtils.js'

class LocalStorage {
  constructor() {
    this.crypto = new CryptoUtils()
    this.storageKey = 'ultrachat'
    this.encryptionKey = null
    this.initialized = false
  }

  // Initialize storage with password/key
  async initialize(password = null) {
    try {
      if (password) {
        // Derive encryption key from password
        const salt = this.getSalt()
        this.encryptionKey = await this.crypto.deriveKeyFromPassword(password, salt)
      } else {
        // Use session-based key (not persistent)
        this.encryptionKey = await this.crypto.generateKey()
      }
      
      this.initialized = true
      return true
    } catch (error) {
      console.error('Storage initialization failed:', error)
      return false
    }
  }

  // Get or generate salt for key derivation
  getSalt() {
    const saltKey = `${this.storageKey}_salt`
    let salt = localStorage.getItem(saltKey)
    
    if (!salt) {
      const newSalt = this.crypto.generateSalt()
      salt = this.crypto.arrayBufferToBase64(newSalt)
      localStorage.setItem(saltKey, salt)
    }
    
    return this.crypto.base64ToArrayBuffer(salt)
  }

  // Store data securely
  async store(key, data, encrypt = true) {
    if (!this.initialized) {
      throw new Error('Storage not initialized')
    }

    try {
      const storageKey = `${this.storageKey}_${key}`
      
      if (encrypt && this.encryptionKey) {
        const encryptedData = await this.crypto.encrypt(data, this.encryptionKey)
        const envelope = {
          encrypted: true,
          data: encryptedData,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
        localStorage.setItem(storageKey, JSON.stringify(envelope))
      } else {
        const envelope = {
          encrypted: false,
          data: data,
          timestamp: new Date().toISOString(),
          version: '1.0'
        }
        localStorage.setItem(storageKey, JSON.stringify(envelope))
      }
      
      return true
    } catch (error) {
      console.error('Storage failed:', error)
      return false
    }
  }

  // Retrieve data securely
  async retrieve(key, defaultValue = null) {
    if (!this.initialized) {
      throw new Error('Storage not initialized')
    }

    try {
      const storageKey = `${this.storageKey}_${key}`
      const stored = localStorage.getItem(storageKey)
      
      if (!stored) {
        return defaultValue
      }

      const envelope = JSON.parse(stored)
      
      if (envelope.encrypted && this.encryptionKey) {
        const decryptedData = await this.crypto.decrypt(envelope.data, this.encryptionKey)
        return decryptedData
      } else {
        return envelope.data
      }
    } catch (error) {
      console.error('Retrieval failed:', error)
      return defaultValue
    }
  }

  // Remove data
  remove(key) {
    const storageKey = `${this.storageKey}_${key}`
    localStorage.removeItem(storageKey)
  }

  // Clear all UltraChat data
  clearAll() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.storageKey)
    )
    
    keys.forEach(key => localStorage.removeItem(key))
    this.initialized = false
    this.encryptionKey = null
  }

  // Message-specific storage methods
  async storeMessage(conversationId, message) {
    const messagesKey = `messages_${conversationId}`
    const existingMessages = await this.retrieve(messagesKey, [])
    
    const messages = Array.isArray(existingMessages) ? existingMessages : []
    messages.push({
      ...message,
      storedAt: new Date().toISOString()
    })

    // Keep only last 1000 messages per conversation
    if (messages.length > 1000) {
      messages.splice(0, messages.length - 1000)
    }

    return await this.store(messagesKey, messages)
  }

  async getMessages(conversationId, limit = 50) {
    const messagesKey = `messages_${conversationId}`
    const messages = await this.retrieve(messagesKey, [])
    
    if (!Array.isArray(messages)) return []
    
    // Return most recent messages
    return messages.slice(-limit)
  }

  async deleteConversation(conversationId) {
    const messagesKey = `messages_${conversationId}`
    this.remove(messagesKey)
    
    // Also remove from conversations list
    const conversations = await this.retrieve('conversations', [])
    const updated = conversations.filter(c => c.id !== conversationId)
    await this.store('conversations', updated)
  }

  // User data specific methods (kept locally, never synced)
  async storeUserData(userData) {
    // Store user-specific data that should never leave the device
    const userDataKey = 'user_data_local'
    const timestamp = new Date().toISOString()
    
    const dataPackage = {
      ...userData,
      lastModified: timestamp,
      version: '1.0',
      deviceId: this.getOrCreateDeviceId()
    }
    
    return await this.store(userDataKey, dataPackage, true)
  }

  async getUserData() {
    const userDataKey = 'user_data_local'
    const defaultUserData = {
      preferences: {
        theme: 'obsidian',
        blueFilter: true,
        notifications: true
      },
      profile: {
        currentMode: 'Basic',
        setupCompleted: false
      },
      privacy: {
        analyticsOptOut: true,
        trackingOptOut: true,
        localOnlyMode: true
      }
    }
    
    return await this.retrieve(userDataKey, defaultUserData)
  }

  // Generate or retrieve a unique device identifier
  getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('ultrachat_device_id')
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('ultrachat_device_id', deviceId)
    }
    return deviceId
  }

  // Enhanced profile storage with privacy controls
  async storeProfileData(profileData, mode) {
    const profileKey = `profile_${mode.toLowerCase()}_local`
    
    // Add privacy metadata
    const enhancedProfile = {
      ...profileData,
      mode,
      localOnly: true,
      lastUpdated: new Date().toISOString(),
      deviceId: this.getOrCreateDeviceId(),
      privacyLevel: this.getPrivacyLevel(mode)
    }
    
    return await this.store(profileKey, enhancedProfile, true)
  }

  async getProfileData(mode) {
    const profileKey = `profile_${mode.toLowerCase()}_local`
    return await this.retrieve(profileKey, null)
  }

  // Get privacy level based on profile mode
  getPrivacyLevel(mode) {
    const privacyLevels = {
      'Basic': 'medium',
      'Public': 'low',
      'Anon': 'maximum',
      'Ultra': 'high'
    }
    return privacyLevels[mode] || 'medium'
  }

  // Store conversation data with enhanced privacy
  async storeConversationData(conversationId, data) {
    const convKey = `conversation_${conversationId}_local`    
    const enhancedData = {
      ...data,
      localOnly: true,
      encrypted: true,
      lastAccessed: new Date().toISOString(),
      deviceId: this.getOrCreateDeviceId()
    }
    
    return await this.store(convKey, enhancedData, true)
  }

  async getConversationData(conversationId) {
    const convKey = `conversation_${conversationId}_local`
    return await this.retrieve(convKey, null)
  }

  // Export user data for local backup (excludes sensitive keys)
  async exportUserDataLocally() {
    const userData = await this.getUserData()
    const profiles = {}
    const conversations = {}
    
    // Export all profile modes
    const modes = ['Basic', 'Public', 'Anon', 'Ultra']
    for (const mode of modes) {
      const profile = await this.getProfileData(mode)
      if (profile) {
        profiles[mode] = profile
      }
    }
    
    // Export conversation metadata (not messages for privacy)
    const conversationList = await this.getConversations()
    for (const conv of conversationList) {
      const convData = await this.getConversationData(conv.id)
      if (convData) {
        // Remove sensitive message content
        conversations[conv.id] = {
          ...convData,
          messages: [], // Don't export actual messages
          messageCount: convData.messages?.length || 0
        }
      }
    }
    
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      deviceId: this.getOrCreateDeviceId(),
      userData,
      profiles,
      conversations,
      localOnly: true,
      privacyNote: 'This export contains local data only and should never be shared'
    }
  }

  // Import user data from local backup
  async importUserDataLocally(exportData) {
    if (!exportData.localOnly) {
      throw new Error('Only local-only exports can be imported')
    }
    
    const results = {
      userData: false,
      profiles: 0,
      conversations: 0,
      errors: []
    }
    
    try {
      // Import user data
      if (exportData.userData) {
        await this.storeUserData(exportData.userData)
        results.userData = true
      }
      
      // Import profiles
      if (exportData.profiles) {
        for (const [mode, profile] of Object.entries(exportData.profiles)) {
          try {
            await this.storeProfileData(profile, mode)
            results.profiles++
          } catch (error) {
            results.errors.push(`Profile ${mode}: ${error.message}`)
          }
        }
      }
      
      // Import conversations
      if (exportData.conversations) {
        for (const [id, conv] of Object.entries(exportData.conversations)) {
          try {
            await this.storeConversationData(id, conv)
            results.conversations++
          } catch (error) {
            results.errors.push(`Conversation ${id}: ${error.message}`)
          }
        }
      }
      
    } catch (error) {
      results.errors.push(`Import failed: ${error.message}`)
    }
    
    return results
  }

  // Profile storage
  async storeProfile(profileData) {
    return await this.store('profile', profileData)
  }

  async getProfile() {
    return await this.retrieve('profile', null)
  }

  // Settings storage
  async storeSettings(settings) {
    return await this.store('settings', settings, false) // Settings not encrypted
  }

  async getSettings() {
    return await this.retrieve('settings', {})
  }

  // Key storage for message encryption
  async storeKeys(keyData) {
    return await this.store('encryption_keys', keyData)
  }

  async getKeys() {
    return await this.retrieve('encryption_keys', {})
  }

  // Store contact/friend list
  async storeContacts(contacts) {
    return await this.store('contacts', contacts)
  }

  async getContacts() {
    return await this.retrieve('contacts', [])
  }

  // Analytics and usage data (privacy-safe)
  async storeUsageData(data) {
    const existing = await this.retrieve('usage_data', {})
    const updated = {
      ...existing,
      ...data,
      lastUpdate: new Date().toISOString()
    }
    return await this.store('usage_data', updated, false)
  }

  async getUsageData() {
    return await this.retrieve('usage_data', {})
  }

  // Export all data for backup
  async exportData(includeKeys = false) {
    const data = {
      version: '1.0',
      exported: new Date().toISOString(),
      conversations: await this.getConversations(),
      profile: await this.getProfile(),
      settings: await this.getSettings(),
      contacts: await this.getContacts(),
      usage: await this.getUsageData()
    }

    if (includeKeys) {
      data.keys = await this.getKeys()
    }

    // Get all message data
    data.messages = {}
    for (const conversation of data.conversations) {
      const messages = await this.getMessages(conversation.id, 10000) // Export all
      data.messages[conversation.id] = messages
    }

    return data
  }

  // Import data from backup
  async importData(exportedData, overwrite = false) {
    try {
      if (!exportedData.version) {
        throw new Error('Invalid export data format')
      }

      const results = {
        conversations: 0,
        messages: 0,
        profile: false,
        settings: false,
        contacts: 0,
        errors: []
      }

      // Import conversations
      if (exportedData.conversations) {
        for (const conversation of exportedData.conversations) {
          try {
            await this.storeConversation(conversation)
            results.conversations++
          } catch (error) {
            results.errors.push(`Conversation ${conversation.id}: ${error.message}`)
          }
        }
      }

      // Import messages
      if (exportedData.messages) {
        for (const [conversationId, messages] of Object.entries(exportedData.messages)) {
          try {
            for (const message of messages) {
              await this.storeMessage(conversationId, message)
              results.messages++
            }
          } catch (error) {
            results.errors.push(`Messages for ${conversationId}: ${error.message}`)
          }
        }
      }

      // Import profile
      if (exportedData.profile) {
        try {
          if (overwrite || !(await this.getProfile())) {
            await this.storeProfile(exportedData.profile)
            results.profile = true
          }
        } catch (error) {
          results.errors.push(`Profile: ${error.message}`)
        }
      }

      // Import settings
      if (exportedData.settings) {
        try {
          if (overwrite) {
            await this.storeSettings(exportedData.settings)
          } else {
            const existing = await this.getSettings()
            await this.storeSettings({ ...existing, ...exportedData.settings })
          }
          results.settings = true
        } catch (error) {
          results.errors.push(`Settings: ${error.message}`)
        }
      }

      // Import contacts
      if (exportedData.contacts) {
        try {
          const existing = overwrite ? [] : await this.getContacts()
          const merged = [...existing, ...exportedData.contacts]
          const unique = merged.filter((contact, index, arr) => 
            arr.findIndex(c => c.id === contact.id) === index
          )
          await this.storeContacts(unique)
          results.contacts = unique.length - existing.length
        } catch (error) {
          results.errors.push(`Contacts: ${error.message}`)
        }
      }

      return results
    } catch (error) {
      throw new Error(`Import failed: ${error.message}`)
    }
  }

  // Get storage usage statistics
  getStorageStats() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.storageKey)
    )
    
    let totalSize = 0
    const breakdown = {}
    
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      const size = new Blob([value]).size
      totalSize += size
      
      const category = key.replace(this.storageKey + '_', '').split('_')[0]
      breakdown[category] = (breakdown[category] || 0) + size
    })

    return {
      totalKeys: keys.length,
      totalSize,
      totalSizeFormatted: this.formatBytes(totalSize),
      breakdown,
      quotaUsed: this.getQuotaUsage(),
      initialized: this.initialized
    }
  }

  // Get localStorage quota usage
  getQuotaUsage() {
    try {
      const total = Object.keys(localStorage).reduce((total, key) => {
        return total + localStorage.getItem(key).length
      }, 0)
      
      // Rough estimate: localStorage typically has 5-10MB limit
      const estimatedQuota = 5 * 1024 * 1024 // 5MB
      return {
        used: total,
        estimated: estimatedQuota,
        percentage: Math.round((total / estimatedQuota) * 100)
      }
    } catch (error) {
      return { error: 'Unable to calculate quota usage' }
    }
  }

  // Format bytes for display
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Cleanup old data
  async cleanup(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
    const cutoff = new Date(Date.now() - maxAge)
    let cleaned = 0

    // Clean old messages
    const conversations = await this.getConversations()
    for (const conversation of conversations) {
      const messages = await this.getMessages(conversation.id, 10000)
      const filtered = messages.filter(msg => 
        new Date(msg.timestamp || msg.storedAt) > cutoff
      )
      
      if (filtered.length < messages.length) {
        const messagesKey = `messages_${conversation.id}`
        await this.store(messagesKey, filtered)
        cleaned += messages.length - filtered.length
      }
    }

    return { cleanedMessages: cleaned }
  }
}

export default LocalStorage
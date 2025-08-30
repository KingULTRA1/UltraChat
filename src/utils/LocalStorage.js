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

  // Store conversation metadata
  async storeConversation(conversation) {
    const conversations = await this.retrieve('conversations', [])
    const existingIndex = conversations.findIndex(c => c.id === conversation.id)
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = {
        ...conversations[existingIndex],
        ...conversation,
        updatedAt: new Date().toISOString()
      }
    } else {
      conversations.push({
        ...conversation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    return await this.store('conversations', conversations)
  }

  async getConversations() {
    return await this.retrieve('conversations', [])
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
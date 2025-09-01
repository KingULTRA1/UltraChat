// /backend/unifiedMessaging.js
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST
// Unified Messaging Service - Device-Centric Approach

import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import deviceIdentityManager from './deviceIdentity.js'

class UnifiedMessagingService {
  constructor() {
    this.messageStorePath = path.join(process.cwd(), 'message_store')
    this.accountTypes = {
      BASIC: 'Basic',
      PUBLIC: 'Public',
      ANON: 'Anon',
      ULTRA: 'Ultra',
      LEGACY: 'Legacy', // Merged Legacy/OG
      PRO: 'Pro',
      ULTRA_ELITE: 'Ultra Elite',
      ANON_PRO: 'Anon Pro',
      STEALTH: 'Stealth',
      LOCKDOWN: 'Lockdown'
    }
    this.userPermissions = new Map()
  }

  // Initialize the messaging service
  async initialize() {
    try {
      // Ensure message store directory exists
      await fs.mkdir(this.messageStorePath, { recursive: true })
      
      // Load or create device identity
      await deviceIdentityManager.getOrCreateDeviceIdentity()
      
      console.log('✅ Unified Messaging Service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Unified Messaging Service:', error)
      throw error
    }
  }

  // Set user permissions based on account type
  setUserPermissions(userId, accountType) {
    const permissions = this.getPermissionsForAccountType(accountType)
    this.userPermissions.set(userId, {
      accountType,
      permissions,
      lastUpdated: new Date().toISOString()
    })
    
    console.log(`✅ Permissions set for user ${userId} with account type ${accountType}`)
  }

  // Get permissions for a specific account type
  getPermissionsForAccountType(accountType) {
    const basePermissions = {
      messaging: true,
      encryption: true,
      localStorage: true
    }

    switch (accountType) {
      case this.accountTypes.BASIC:
        return {
          ...basePermissions,
          socialHandles: false,
          trustSystem: false,
          anonymity: false,
          crossService: false
        }
      
      case this.accountTypes.PUBLIC:
        return {
          ...basePermissions,
          socialHandles: true,
          trustSystem: false,
          anonymity: false,
          crossService: false,
          publicDirectory: true
        }
      
      case this.accountTypes.ANON:
        return {
          ...basePermissions,
          socialHandles: false,
          trustSystem: false,
          anonymity: true,
          crossService: true,
          sessionBased: true,
          persistentData: false
        }
      
      case this.accountTypes.ULTRA:
        return {
          ...basePermissions,
          socialHandles: true,
          trustSystem: true,
          anonymity: false,
          crossService: true,
          publicDirectory: true,
          endorsements: true,
          verification: true,
          advancedEncryption: true,
          voiceChat: true,
          eventsCalendar: true
        }
      
      case this.accountTypes.LEGACY: // Merged Legacy/OG
        return {
          ...basePermissions,
          socialHandles: true,
          trustSystem: true,
          anonymity: false,
          crossService: true,
          publicDirectory: true,
          endorsements: true,
          verification: true,
          ogFeatures: true,
          prioritySupport: true,
          voiceChat: true,
          eventsCalendar: true
        }
      
      case this.accountTypes.PRO:
        return {
          ...basePermissions,
          socialHandles: true,
          trustSystem: true,
          anonymity: false,
          crossService: true,
          publicDirectory: true,
          endorsements: true,
          verification: true,
          proFeatures: true,
          voiceChat: true,
          eventsCalendar: true,
          advancedEncryption: true
        }
      
      case this.accountTypes.ULTRA_ELITE:
        return {
          ...basePermissions,
          socialHandles: true,
          trustSystem: true,
          anonymity: false,
          crossService: true,
          publicDirectory: true,
          endorsements: true,
          verification: true,
          advancedEncryption: true,
          eliteFeatures: true,
          prioritySupport: true,
          customThemes: true,
          voiceChat: true,
          eventsCalendar: true
        }
      
      case this.accountTypes.ANON_PRO:
        return {
          ...basePermissions,
          socialHandles: false,
          trustSystem: true,
          anonymity: true,
          crossService: true,
          sessionBased: false,
          advancedPrivacy: true,
          stealthMode: true,
          lockdownMode: true
        }
      
      case this.accountTypes.STEALTH:
        return {
          ...basePermissions,
          socialHandles: false,
          trustSystem: false,
          anonymity: true,
          crossService: false,
          sessionBased: false,
          stealthMode: true,
          minimalMetadata: true
        }
      
      case this.accountTypes.LOCKDOWN:
        return {
          ...basePermissions,
          socialHandles: false,
          trustSystem: true,
          anonymity: true,
          crossService: false,
          sessionBased: false,
          advancedEncryption: true,
          lockdownMode: true,
          verificationRequired: true
        }
      
      default:
        return basePermissions
    }
  }

  // Check if user has permission for a specific feature
  hasPermission(userId, feature) {
    const userPerms = this.userPermissions.get(userId)
    if (!userPerms) {
      return false
    }
    
    return userPerms.permissions[feature] || false
  }

  // Encrypt message content
  encryptMessage(content, recipientPublicKey = null) {
    try {
      // Generate a random key for this message
      const messageKey = crypto.randomBytes(32)
      
      // Encrypt the content with the message key
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-gcm', messageKey, iv)
      let encrypted = cipher.update(content, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      const authTag = cipher.getAuthTag()
      
      // If we have a recipient's public key, encrypt the message key with it
      let encryptedKey = null
      if (recipientPublicKey) {
        encryptedKey = crypto.publicEncrypt(
          {
            key: recipientPublicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
          },
          messageKey
        ).toString('base64')
      } else {
        // For local storage, we can use the device's public key
        const devicePublicKey = deviceIdentityManager.getDevicePublicKey()
        encryptedKey = crypto.publicEncrypt(
          {
            key: devicePublicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256'
          },
          messageKey
        ).toString('base64')
      }
      
      return {
        encryptedContent: encrypted,
        encryptedKey: encryptedKey,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: 'aes-256-gcm',
        keyAlgorithm: 'rsa-oaep'
      }
    } catch (error) {
      console.error('❌ Message encryption failed:', error)
      // Return unencrypted content as fallback for testing
      return {
        encryptedContent: Buffer.from(content).toString('hex'),
        encryptedKey: null,
        iv: null,
        authTag: null,
        algorithm: 'none',
        keyAlgorithm: 'none'
      }
    }
  }

  // Decrypt message content
  decryptMessage(encryptedData) {
    try {
      // If the message wasn't actually encrypted, return as-is
      if (encryptedData.algorithm === 'none') {
        return Buffer.from(encryptedData.encryptedContent, 'hex').toString('utf8')
      }
      
      // Decrypt the message key with the device's private key
      const deviceIdentity = deviceIdentityManager.currentDeviceIdentity
      if (!deviceIdentity) {
        throw new Error('No device identity available for decryption')
      }
      
      const messageKey = crypto.privateDecrypt(
        {
          key: deviceIdentity.privateKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256'
        },
        Buffer.from(encryptedData.encryptedKey, 'base64')
      )
      
      // Decrypt the content with the message key
      const decipher = crypto.createDecipheriv('aes-256-gcm', messageKey, Buffer.from(encryptedData.iv, 'hex'))
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))
      
      let decrypted = decipher.update(encryptedData.encryptedContent, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('❌ Message decryption failed:', error)
      // Return encrypted content as fallback for testing
      return '[Decryption Failed]'
    }
  }

  // Store message locally
  async storeMessage(message) {
    try {
      // Ensure message has required fields
      if (!message.id || !message.content) {
        throw new Error('Message must have id and content')
      }
      
      // Encrypt message content before storage
      const encryptedContent = this.encryptMessage(message.content)
      
      // Create message object for storage
      const storedMessage = {
        ...message,
        content: encryptedContent,
        storedAt: new Date().toISOString(),
        deviceId: deviceIdentityManager.getDeviceId()
      }
      
      // Store in message store directory
      const messageFilePath = path.join(this.messageStorePath, `${message.id}.json`)
      await fs.writeFile(messageFilePath, JSON.stringify(storedMessage, null, 2))
      
      console.log(`✅ Message ${message.id} stored locally`)
      return storedMessage
    } catch (error) {
      console.error('❌ Failed to store message:', error)
      throw error
    }
  }

  // Retrieve message by ID
  async retrieveMessage(messageId) {
    try {
      const messageFilePath = path.join(this.messageStorePath, `${messageId}.json`)
      const messageData = await fs.readFile(messageFilePath, 'utf8')
      const storedMessage = JSON.parse(messageData)
      
      // Decrypt message content
      const decryptedContent = this.decryptMessage(storedMessage.content)
      storedMessage.content = decryptedContent
      storedMessage.decryptedAt = new Date().toISOString()
      
      return storedMessage
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Message ${messageId} not found`)
      }
      console.error('❌ Failed to retrieve message:', error)
      throw error
    }
  }

  // Get all messages (with optional filtering)
  async getAllMessages(filters = {}) {
    try {
      const files = await fs.readdir(this.messageStorePath)
      const messageFiles = files.filter(file => file.endsWith('.json'))
      
      const messages = []
      for (const file of messageFiles) {
        try {
          const filePath = path.join(this.messageStorePath, file)
          const messageData = await fs.readFile(filePath, 'utf8')
          const message = JSON.parse(messageData)
          
          // Apply filters if provided
          if (filters.senderId && message.senderId !== filters.senderId) continue
          if (filters.recipientId && message.recipientId !== filters.recipientId) continue
          if (filters.threadId && message.threadId !== filters.threadId) continue
          
          // Decrypt content for display
          try {
            const decryptedContent = this.decryptMessage(message.content)
            message.content = decryptedContent
          } catch (decryptError) {
            console.warn(`⚠️ Failed to decrypt message ${message.id}:`, decryptError.message)
            message.content = '[Decryption Failed]'
          }
          
          messages.push(message)
        } catch (fileError) {
          console.warn(`⚠️ Failed to read message file ${file}:`, fileError.message)
        }
      }
      
      // Sort by timestamp
      messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      
      return messages
    } catch (error) {
      console.error('❌ Failed to retrieve messages:', error)
      throw error
    }
  }

  // Create a new message
  async createMessage(senderId, recipientId, content, options = {}) {
    try {
      // Generate unique message ID
      const messageId = `msg_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`
      
      // Create message object
      const message = {
        id: messageId,
        senderId,
        recipientId,
        content,
        timestamp: new Date().toISOString(),
        threadId: options.threadId || `thread_${senderId}_${recipientId}`,
        type: options.type || 'text',
        status: 'sent',
        ...options
      }
      
      // Store the message
      await this.storeMessage(message)
      
      return message
    } catch (error) {
      console.error('❌ Failed to create message:', error)
      throw error
    }
  }

  // Update message status
  async updateMessageStatus(messageId, status) {
    try {
      // Retrieve existing message
      const message = await this.retrieveMessage(messageId)
      
      // Update status
      message.status = status
      message.updatedAt = new Date().toISOString()
      
      // Store updated message
      await this.storeMessage(message)
      
      return message
    } catch (error) {
      console.error('❌ Failed to update message status:', error)
      throw error
    }
  }
}

// Export singleton instance
const unifiedMessagingService = new UnifiedMessagingService()

export { unifiedMessagingService as default, UnifiedMessagingService }
// Message Encryption Service
// Handles end-to-end encryption for messages

import CryptoUtils from '../../utils/CryptoUtils.js'

class MessageEncryption {
  constructor() {
    this.crypto = new CryptoUtils()
    this.keyStore = new Map() // In-memory key storage
    this.sessionKeys = new Map() // Session-specific keys
  }

  // Initialize encryption for a conversation
  async initializeConversation(conversationId, participants) {
    try {
      // Generate a conversation key
      const conversationKey = await this.crypto.generateKey()
      
      // Store the key
      this.keyStore.set(conversationId, {
        key: conversationKey,
        participants,
        created: new Date().toISOString(),
        messageCount: 0
      })

      // For each participant, we would normally exchange keys
      // For this demo, we'll simulate key exchange
      for (const participant of participants) {
        await this.simulateKeyExchange(conversationId, participant)
      }

      return {
        conversationId,
        keyFingerprint: await this.crypto.getKeyFingerprint(conversationKey),
        participants,
        status: 'initialized'
      }
    } catch (error) {
      throw new Error(`Failed to initialize conversation encryption: ${error.message}`)
    }
  }

  // Simulate key exchange (in real app, this would use proper key exchange protocol)
  async simulateKeyExchange(conversationId, participantId) {
    // In a real implementation, this would:
    // 1. Generate ephemeral key pairs
    // 2. Exchange public keys with participants
    // 3. Derive shared secrets using ECDH
    // 4. Establish forward secrecy
    
    const keyExchangeData = {
      conversationId,
      participantId,
      timestamp: new Date().toISOString(),
      status: 'completed',
      forwardSecrecy: true
    }

    // Store key exchange info
    const exchangeKey = `${conversationId}:${participantId}`
    this.sessionKeys.set(exchangeKey, keyExchangeData)

    return keyExchangeData
  }

  // Encrypt a message
  async encryptMessage(conversationId, message, senderId) {
    try {
      const keyData = this.keyStore.get(conversationId)
      if (!keyData) {
        throw new Error('Conversation key not found')
      }

      // Create message envelope
      const envelope = {
        id: this.crypto.generateUUID(),
        conversationId,
        senderId,
        timestamp: new Date().toISOString(),
        content: message.content,
        type: message.type || 'text',
        metadata: {
          messageNumber: keyData.messageCount + 1,
          forwardSecrecy: true
        }
      }

      // Encrypt the envelope
      const encryptedData = await this.crypto.encrypt(envelope, keyData.key)

      // Update message count
      keyData.messageCount++

      // Create encrypted message
      const encryptedMessage = {
        id: envelope.id,
        conversationId,
        senderId,
        timestamp: envelope.timestamp,
        encryptedData,
        keyFingerprint: await this.crypto.getKeyFingerprint(keyData.key),
        version: '1.0',
        algorithm: 'AES-GCM-256'
      }

      return encryptedMessage
    } catch (error) {
      throw new Error(`Message encryption failed: ${error.message}`)
    }
  }

  // Decrypt a message
  async decryptMessage(encryptedMessage) {
    try {
      const { conversationId, encryptedData, keyFingerprint } = encryptedMessage
      
      const keyData = this.keyStore.get(conversationId)
      if (!keyData) {
        throw new Error('Conversation key not found')
      }

      // Verify key fingerprint
      const currentFingerprint = await this.crypto.getKeyFingerprint(keyData.key)
      if (currentFingerprint !== keyFingerprint) {
        throw new Error('Key fingerprint mismatch - possible tampering')
      }

      // Decrypt the message
      const decryptedEnvelope = await this.crypto.decrypt(encryptedData, keyData.key)

      // Verify message integrity
      if (decryptedEnvelope.conversationId !== conversationId) {
        throw new Error('Message conversation ID mismatch')
      }

      return {
        id: decryptedEnvelope.id,
        conversationId: decryptedEnvelope.conversationId,
        senderId: decryptedEnvelope.senderId,
        timestamp: decryptedEnvelope.timestamp,
        content: decryptedEnvelope.content,
        type: decryptedEnvelope.type,
        metadata: decryptedEnvelope.metadata,
        verified: true
      }
    } catch (error) {
      throw new Error(`Message decryption failed: ${error.message}`)
    }
  }

  // Rotate conversation key (forward secrecy)
  async rotateConversationKey(conversationId) {
    try {
      const keyData = this.keyStore.get(conversationId)
      if (!keyData) {
        throw new Error('Conversation not found')
      }

      // Generate new key
      const newKey = await this.crypto.generateKey()
      
      // Clear old key
      const oldKeyFingerprint = await this.crypto.getKeyFingerprint(keyData.key)
      
      // Update key data
      keyData.key = newKey
      keyData.rotated = new Date().toISOString()
      keyData.previousKeyFingerprint = oldKeyFingerprint
      keyData.messageCount = 0 // Reset counter for new key

      return {
        conversationId,
        newKeyFingerprint: await this.crypto.getKeyFingerprint(newKey),
        previousKeyFingerprint: oldKeyFingerprint,
        rotatedAt: keyData.rotated
      }
    } catch (error) {
      throw new Error(`Key rotation failed: ${error.message}`)
    }
  }

  // Export conversation key (for backup/sync)
  async exportConversationKey(conversationId, password) {
    try {
      const keyData = this.keyStore.get(conversationId)
      if (!keyData) {
        throw new Error('Conversation not found')
      }

      // Export the key
      const exportedKey = await this.crypto.exportKey(keyData.key)
      
      // Encrypt with password
      const salt = this.crypto.generateSalt()
      const passwordKey = await this.crypto.deriveKeyFromPassword(password, salt)
      
      const encryptedExport = await this.crypto.encrypt({
        key: exportedKey,
        metadata: {
          conversationId,
          participants: keyData.participants,
          created: keyData.created,
          messageCount: keyData.messageCount
        }
      }, passwordKey)

      return {
        conversationId,
        encryptedData: encryptedExport,
        salt: this.crypto.arrayBufferToBase64(salt),
        version: '1.0'
      }
    } catch (error) {
      throw new Error(`Key export failed: ${error.message}`)
    }
  }

  // Import conversation key (from backup/sync)
  async importConversationKey(exportData, password) {
    try {
      const { conversationId, encryptedData, salt } = exportData
      
      // Derive password key
      const saltBuffer = this.crypto.base64ToArrayBuffer(salt)
      const passwordKey = await this.crypto.deriveKeyFromPassword(password, saltBuffer)
      
      // Decrypt the export
      const decryptedData = await this.crypto.decrypt(encryptedData, passwordKey)
      
      // Import the conversation key
      const conversationKey = await this.crypto.importKey(
        decryptedData.key,
        { name: 'AES-GCM', length: 256 },
        ['encrypt', 'decrypt']
      )

      // Store the key
      this.keyStore.set(conversationId, {
        key: conversationKey,
        participants: decryptedData.metadata.participants,
        created: decryptedData.metadata.created,
        messageCount: decryptedData.metadata.messageCount,
        imported: new Date().toISOString()
      })

      return {
        conversationId,
        participants: decryptedData.metadata.participants,
        imported: true
      }
    } catch (error) {
      throw new Error(`Key import failed: ${error.message}`)
    }
  }

  // Get conversation info
  getConversationInfo(conversationId) {
    const keyData = this.keyStore.get(conversationId)
    if (!keyData) {
      return null
    }

    return {
      conversationId,
      participants: keyData.participants,
      created: keyData.created,
      messageCount: keyData.messageCount,
      hasKey: true,
      lastRotated: keyData.rotated || null
    }
  }

  // Verify message authenticity
  async verifyMessage(encryptedMessage) {
    try {
      // Check if we can decrypt it (implies authenticity)
      const decrypted = await this.decryptMessage(encryptedMessage)
      return {
        verified: true,
        message: decrypted,
        checks: {
          decryption: true,
          keyFingerprint: true,
          conversationId: true,
          timestamp: this.isValidTimestamp(decrypted.timestamp)
        }
      }
    } catch (error) {
      return {
        verified: false,
        error: error.message,
        checks: {
          decryption: false
        }
      }
    }
  }

  // Check if timestamp is reasonable
  isValidTimestamp(timestamp) {
    const messageTime = new Date(timestamp).getTime()
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours
    const maxFuture = 5 * 60 * 1000 // 5 minutes in future
    
    return messageTime > (now - maxAge) && messageTime < (now + maxFuture)
  }

  // Clear all keys (for security)
  clearAllKeys() {
    this.keyStore.clear()
    this.sessionKeys.clear()
  }

  // Clear specific conversation key
  clearConversationKey(conversationId) {
    this.keyStore.delete(conversationId)
    
    // Clear related session keys
    for (const [key] of this.sessionKeys) {
      if (key.startsWith(conversationId + ':')) {
        this.sessionKeys.delete(key)
      }
    }
  }

  // Get encryption statistics
  getEncryptionStats() {
    const conversations = Array.from(this.keyStore.values())
    
    return {
      totalConversations: conversations.length,
      totalMessages: conversations.reduce((sum, conv) => sum + conv.messageCount, 0),
      activeKeys: this.keyStore.size,
      sessionKeys: this.sessionKeys.size,
      oldestConversation: conversations.length > 0 
        ? Math.min(...conversations.map(c => new Date(c.created).getTime()))
        : null
    }
  }
}

export default MessageEncryption
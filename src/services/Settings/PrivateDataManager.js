// Ultra-Private Data Manager for UltraChat
// Handles secure local data import/export with QR codes for cross-platform sync
// Zero external servers, maximum privacy

import CryptoUtils from '../../utils/CryptoUtils.js'
import LocalStorage from '../../utils/LocalStorage.js'

class PrivateDataManager {
  constructor() {
    this.crypto = new CryptoUtils()
    this.storage = new LocalStorage()
    this.qrData = null
  }

  // Generate QR code data for secure settings export
  async generateQRExportData(includeMessages = false) {
    try {
      await this.storage.initialize()
      
      const exportData = {
        version: '1.1.0',
        exportType: 'ultra_private',
        timestamp: new Date().toISOString(),
        deviceId: this.storage.deviceId,
        localOnly: true,
        encrypted: true
      }

      // Export user profiles (all modes)
      const profiles = {}
      const modes = ['Basic', 'Public', 'Anon', 'Ultra']
      for (const mode of modes) {
        const profile = await this.storage.getProfileData(mode)
        if (profile) {
          profiles[mode] = {
            ...profile,
            exportedAt: new Date().toISOString(),
            localOnly: true
          }
        }
      }
      exportData.profiles = profiles

      // Export settings
      const userData = await this.storage.getUserData()
      exportData.settings = {
        ...userData,
        exportedAt: new Date().toISOString(),
        privateExport: true
      }

      // Optionally include encrypted messages
      if (includeMessages) {
        const conversations = await this.storage.retrieve('conversations_private', [])
        const messageData = {}
        
        for (const conv of conversations.slice(0, 10)) { // Limit to 10 conversations for QR size
          const messages = await this.storage.getMessages(conv.id, 50) // Last 50 messages
          messageData[conv.id] = {
            conversation: conv,
            messages: messages.map(msg => ({
              ...msg,
              localOnly: true,
              privateTransfer: true
            }))
          }
        }
        exportData.messages = messageData
      }

      // Generate encryption key for QR transfer
      const transferKey = await this.crypto.generateKey()
      const encryptedData = await this.crypto.encrypt(exportData, transferKey)
      
      // Export the transfer key separately for manual entry
      const keyExport = await this.crypto.exportKey(transferKey)
      
      return {
        qrData: {
          type: 'ultrachat_private_export',
          version: '1.1.0',
          data: encryptedData,
          timestamp: new Date().toISOString(),
          localOnly: true
        },
        transferKey: keyExport,
        keyString: JSON.stringify(keyExport).substring(0, 100) + '...' // Truncated for display
      }
      
    } catch (error) {
      console.error('Failed to generate QR export:', error)
      throw new Error('Failed to generate private export data')
    }
  }

  // Import data from QR code
  async importFromQRData(qrData, transferKey) {
    try {
      if (!qrData || qrData.type !== 'ultrachat_private_export') {
        throw new Error('Invalid QR data format')
      }

      // Import the encryption key
      const importedKey = await this.crypto.importKey(
        transferKey, 
        { name: 'AES-GCM', length: 256 }, 
        ['encrypt', 'decrypt']
      )

      // Decrypt the data
      const decryptedData = await this.crypto.decrypt(qrData.data, importedKey)
      
      if (!decryptedData.localOnly) {
        throw new Error('Security violation: Data not marked as local-only')
      }

      const results = {
        profiles: 0,
        settings: false,
        messages: 0,
        conversations: 0,
        errors: []
      }

      // Import profiles
      if (decryptedData.profiles) {
        for (const [mode, profile] of Object.entries(decryptedData.profiles)) {
          try {
            const privateProfile = {
              ...profile,
              importedAt: new Date().toISOString(),
              importedFrom: decryptedData.deviceId,
              localOnly: true,
              noSync: true
            }
            await this.storage.storeProfileData(privateProfile, mode)
            results.profiles++
          } catch (error) {
            results.errors.push(`Profile ${mode}: ${error.message}`)
          }
        }
      }

      // Import settings
      if (decryptedData.settings) {
        try {
          const privateSettings = {
            ...decryptedData.settings,
            importedAt: new Date().toISOString(),
            localOnly: true,
            privateImport: true
          }
          await this.storage.storeUserData(privateSettings)
          results.settings = true
        } catch (error) {
          results.errors.push(`Settings: ${error.message}`)
        }
      }

      // Import messages
      if (decryptedData.messages) {
        for (const [convId, convData] of Object.entries(decryptedData.messages)) {
          try {
            // Store conversation
            const privateConv = {
              ...convData.conversation,
              importedAt: new Date().toISOString(),
              localOnly: true,
              privateImport: true
            }
            await this.storage.storeConversationData(convId, privateConv)
            results.conversations++

            // Store messages
            for (const message of convData.messages) {
              const privateMessage = {
                ...message,
                importedAt: new Date().toISOString(),
                localOnly: true,
                privateImport: true
              }
              await this.storage.storeMessage(convId, privateMessage)
              results.messages++
            }
          } catch (error) {
            results.errors.push(`Conversation ${convId}: ${error.message}`)
          }
        }
      }

      // Log successful import locally
      const importLog = JSON.parse(localStorage.getItem('ultrachat-import-log') || '[]')
      importLog.push({
        timestamp: new Date().toISOString(),
        source: decryptedData.deviceId,
        results,
        localOnly: true
      })
      localStorage.setItem('ultrachat-import-log', JSON.stringify(importLog))

      return results

    } catch (error) {
      console.error('Failed to import from QR:', error)
      throw new Error(`Import failed: ${error.message}`)
    }
  }

  // Generate secure backup for Discord/Telegram sharing
  async generateSecureBackup(password) {
    try {
      const exportData = await this.generateQRExportData(true)
      
      // Additional encryption with user password
      const salt = this.crypto.generateSalt()
      const passwordKey = await this.crypto.deriveKeyFromPassword(password, salt)
      const encryptedBackup = await this.crypto.encrypt(exportData.qrData, passwordKey)
      
      return {
        backupData: encryptedBackup,
        salt: this.crypto.arrayBufferToBase64(salt),
        instructions: 'This backup is encrypted with your password. Keep it safe and never share the password.',
        localOnly: true,
        privateBackup: true
      }
      
    } catch (error) {
      console.error('Failed to generate secure backup:', error)
      throw new Error('Failed to generate encrypted backup')
    }
  }

  // Restore from secure backup
  async restoreFromSecureBackup(backupData, salt, password) {
    try {
      const saltBuffer = this.crypto.base64ToArrayBuffer(salt)
      const passwordKey = await this.crypto.deriveKeyFromPassword(password, saltBuffer)
      const decryptedQRData = await this.crypto.decrypt(backupData, passwordKey)
      
      return await this.importFromQRData(decryptedQRData, decryptedQRData.transferKey)
      
    } catch (error) {
      console.error('Failed to restore from backup:', error)
      throw new Error('Failed to restore backup. Check your password.')
    }
  }

  // Privacy cleanup: Remove all traces
  async performPrivacyCleanup() {
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }

      // Clear temporary data
      const tempKeys = Object.keys(localStorage).filter(key => 
        key.includes('temp') || key.includes('cache') || key.includes('session')
      )
      tempKeys.forEach(key => localStorage.removeItem(key))

      // Clear error logs older than 7 days
      const errorLog = JSON.parse(localStorage.getItem('ultrachat-error-log') || '[]')
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      const recentErrors = errorLog.filter(log => 
        new Date(log.timestamp).getTime() > oneWeekAgo
      )
      localStorage.setItem('ultrachat-error-log', JSON.stringify(recentErrors))

      // Log cleanup
      const cleanupLog = JSON.parse(localStorage.getItem('ultrachat-cleanup-log') || '[]')
      cleanupLog.push({
        timestamp: new Date().toISOString(),
        action: 'privacy_cleanup',
        localOnly: true
      })
      localStorage.setItem('ultrachat-cleanup-log', JSON.stringify(cleanupLog))

      return true
    } catch (error) {
      console.error('Privacy cleanup failed:', error)
      return false
    }
  }

  // Get privacy status
  getPrivacyStatus() {
    return {
      mode: 'ultra_private',
      localOnly: localStorage.getItem('ultrachat_local_only') === 'true',
      noTracking: localStorage.getItem('ultrachat_no_tracking') === 'true',
      deviceId: this.storage.deviceId,
      encryptionEnabled: true,
      dataStaysLocal: true,
      noExternalServers: true,
      privacyCompliant: true
    }
  }
}

export default PrivateDataManager
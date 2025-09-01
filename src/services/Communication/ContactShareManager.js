// Contact Share Manager
// Handles QR-based contact sharing for privacy-first connections

import QRJoinManager from './QRJoinManager.js'
import CryptoUtils from '../../utils/CryptoUtils.js'

class ContactShareManager {
  constructor(qrJoinManager, cryptoUtils) {
    this.qrJoinManager = qrJoinManager
    this.cryptoUtils = cryptoUtils
    this.contacts = new Map()
  }

  // Generate QR code for contact sharing
  async generateContactShareQR(userId, options = {}) {
    try {
      // TODO: Add QR-based private contact sharing
      console.log('📱 Generating contact share QR code for user:', userId)
      
      // Create contact data
      const contactData = {
        userId: userId,
        timestamp: Date.now(),
        publicKey: options.publicKey || null,
        trustLevel: options.trustLevel || 0,
        // Add encrypted user info if requested
        encryptedInfo: options.encrypt ? this.cryptoUtils.encrypt(userId) : null
      }
      
      // Generate QR code using QRJoinManager
      const qrCode = await this.qrJoinManager.generateContactQR(userId, {
        ...options,
        contactData: contactData
      })
      
      console.log('✅ Contact share QR code generated')
      return qrCode
    } catch (error) {
      console.error('❌ Failed to generate contact share QR:', error)
      throw error
    }
  }

  // Process scanned contact QR code
  async processContactShareQR(qrData) {
    try {
      console.log('📱 Processing contact share QR code')
      
      // Validate QR data
      if (!qrData.userId) {
        throw new Error('Invalid contact QR data')
      }
      
      // Add contact to local storage
      this.contacts.set(qrData.userId, {
        userId: qrData.userId,
        addedAt: new Date(),
        trustLevel: qrData.trustLevel || 0,
        publicKey: qrData.publicKey || null
      })
      
      console.log('✅ Contact added:', qrData.userId)
      return {
        success: true,
        userId: qrData.userId,
        trustLevel: qrData.trustLevel || 0
      }
    } catch (error) {
      console.error('❌ Failed to process contact share QR:', error)
      throw error
    }
  }

  // Get all shared contacts
  getContacts() {
    return Array.from(this.contacts.values())
  }

  // Remove contact
  removeContact(userId) {
    return this.contacts.delete(userId)
  }

  // Update contact trust level
  updateContactTrust(userId, trustLevel) {
    const contact = this.contacts.get(userId)
    if (contact) {
      contact.trustLevel = trustLevel
      contact.updatedAt = new Date()
      return true
    }
    return false
  }
}

export default ContactShareManager
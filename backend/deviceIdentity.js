// /backend/deviceIdentity.js
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST
// Device-Centric Identity Management

import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

class DeviceIdentityManager {
  constructor() {
    this.identityStorePath = path.join(process.cwd(), 'identity_store')
    this.currentDeviceIdentity = null
  }

  // Generate a new device identity keypair
  async generateDeviceIdentity(deviceId = null) {
    try {
      // Generate RSA keypair for device identity
      const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
          // In production, you would encrypt this with a password
        }
      })

      // Generate device ID if not provided
      if (!deviceId) {
        deviceId = `device_${crypto.randomBytes(16).toString('hex')}`
      }

      // Create identity object
      const identity = {
        deviceId,
        publicKey,
        privateKey, // In production, this should be encrypted
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        version: '1.2.3'
      }

      // Store the identity
      await this.storeDeviceIdentity(identity)
      
      this.currentDeviceIdentity = identity
      return identity
    } catch (error) {
      console.error('❌ Failed to generate device identity:', error)
      throw error
    }
  }

  // Store device identity securely
  async storeDeviceIdentity(identity) {
    try {
      // Ensure identity store directory exists
      await fs.mkdir(this.identityStorePath, { recursive: true })
      
      // Store identity in a file named after the device ID
      const identityFilePath = path.join(this.identityStorePath, `${identity.deviceId}.json`)
      
      // In production, you would encrypt the identity before storing
      await fs.writeFile(identityFilePath, JSON.stringify(identity, null, 2))
      
      console.log(`✅ Device identity stored for ${identity.deviceId}`)
    } catch (error) {
      console.error('❌ Failed to store device identity:', error)
      throw error
    }
  }

  // Load existing device identity
  async loadDeviceIdentity(deviceId) {
    try {
      const identityFilePath = path.join(this.identityStorePath, `${deviceId}.json`)
      const identityData = await fs.readFile(identityFilePath, 'utf8')
      const identity = JSON.parse(identityData)
      
      // Update last used timestamp
      identity.lastUsed = new Date().toISOString()
      await this.storeDeviceIdentity(identity)
      
      this.currentDeviceIdentity = identity
      return identity
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`⚠️ No existing identity found for device ${deviceId}`)
        return null
      }
      console.error('❌ Failed to load device identity:', error)
      throw error
    }
  }

  // Get or create device identity
  async getOrCreateDeviceIdentity(deviceId = null) {
    // If we already have a loaded identity, return it
    if (this.currentDeviceIdentity) {
      return this.currentDeviceIdentity
    }

    // If no device ID provided, check if we have any existing identities
    if (!deviceId) {
      try {
        const files = await fs.readdir(this.identityStorePath)
        const identityFiles = files.filter(file => file.endsWith('.json'))
        
        if (identityFiles.length > 0) {
          // Load the first identity found
          const firstIdentityFile = identityFiles[0]
          deviceId = path.basename(firstIdentityFile, '.json')
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error('❌ Error checking for existing identities:', error)
        }
        // Continue with generating a new identity
      }
    }

    // Try to load existing identity
    if (deviceId) {
      const existingIdentity = await this.loadDeviceIdentity(deviceId)
      if (existingIdentity) {
        return existingIdentity
      }
    }

    // Generate new identity
    return await this.generateDeviceIdentity(deviceId)
  }

  // Sign data with device private key
  signData(data) {
    if (!this.currentDeviceIdentity) {
      throw new Error('No device identity loaded')
    }

    try {
      const signature = crypto.sign(
        'sha256',
        Buffer.from(data),
        {
          key: this.currentDeviceIdentity.privateKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        }
      )
      
      return signature.toString('base64')
    } catch (error) {
      console.error('❌ Failed to sign data:', error)
      throw error
    }
  }

  // Verify signature with device public key
  verifySignature(data, signature) {
    if (!this.currentDeviceIdentity) {
      throw new Error('No device identity loaded')
    }

    try {
      const isValid = crypto.verify(
        'sha256',
        Buffer.from(data),
        {
          key: this.currentDeviceIdentity.publicKey,
          padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        },
        Buffer.from(signature, 'base64')
      )
      
      return isValid
    } catch (error) {
      console.error('❌ Failed to verify signature:', error)
      return false
    }
  }

  // Get device public key for sharing
  getDevicePublicKey() {
    if (!this.currentDeviceIdentity) {
      throw new Error('No device identity loaded')
    }
    
    return this.currentDeviceIdentity.publicKey
  }

  // Get device ID
  getDeviceId() {
    if (!this.currentDeviceIdentity) {
      throw new Error('No device identity loaded')
    }
    
    return this.currentDeviceIdentity.deviceId
  }
}

// Export singleton instance
const deviceIdentityManager = new DeviceIdentityManager()

export { deviceIdentityManager as default, DeviceIdentityManager }
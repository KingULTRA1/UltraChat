// Cryptographic Utilities for UltraChat
// Handles encryption, decryption, and key management

class CryptoUtils {
  constructor() {
    this.keySize = 256 // AES-256
    this.ivSize = 16   // 128-bit IV
    this.saltSize = 32 // 256-bit salt
  }

  // Generate a cryptographically secure random key
  async generateKey() {
    const key = await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: this.keySize
      },
      true, // extractable
      ['encrypt', 'decrypt']
    )
    return key
  }

  // Generate a random salt
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(this.saltSize))
  }

  // Generate a random IV
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(this.ivSize))
  }

  // Derive key from password using PBKDF2
  async deriveKeyFromPassword(password, salt, iterations = 100000) {
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)

    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: 'AES-GCM',
        length: this.keySize
      },
      true,
      ['encrypt', 'decrypt']
    )

    return key
  }

  // Encrypt data using AES-GCM
  async encrypt(data, key) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))
    const iv = this.generateIV()

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      dataBuffer
    )

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)

    return this.arrayBufferToBase64(combined)
  }

  // Decrypt data using AES-GCM
  async decrypt(encryptedData, key) {
    try {
      const combined = this.base64ToArrayBuffer(encryptedData)
      const iv = combined.slice(0, this.ivSize)
      const encrypted = combined.slice(this.ivSize)

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        encrypted
      )

      const decoder = new TextDecoder()
      const decryptedText = decoder.decode(decryptedBuffer)
      
      // Try to parse as JSON, fall back to string
      try {
        return JSON.parse(decryptedText)
      } catch {
        return decryptedText
      }
    } catch (error) {
      throw new Error('Decryption failed: ' + error.message)
    }
  }

  // Generate RSA key pair for asymmetric encryption
  async generateRSAKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    )

    return keyPair
  }

  // Export key to JWK format
  async exportKey(key) {
    return await crypto.subtle.exportKey('jwk', key)
  }

  // Import key from JWK format
  async importKey(jwk, algorithm, usages) {
    return await crypto.subtle.importKey('jwk', jwk, algorithm, true, usages)
  }

  // Encrypt with RSA public key
  async encryptRSA(data, publicKey) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      publicKey,
      dataBuffer
    )

    return this.arrayBufferToBase64(encrypted)
  }

  // Decrypt with RSA private key
  async decryptRSA(encryptedData, privateKey) {
    try {
      const encrypted = this.base64ToArrayBuffer(encryptedData)

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'RSA-OAEP'
        },
        privateKey,
        encrypted
      )

      const decoder = new TextDecoder()
      const decryptedText = decoder.decode(decrypted)
      
      try {
        return JSON.parse(decryptedText)
      } catch {
        return decryptedText
      }
    } catch (error) {
      throw new Error('RSA decryption failed: ' + error.message)
    }
  }

  // Generate digital signature
  async sign(data, privateKey) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))

    const signature = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      privateKey,
      dataBuffer
    )

    return this.arrayBufferToBase64(signature)
  }

  // Verify digital signature
  async verify(data, signature, publicKey) {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))
      const signatureBuffer = this.base64ToArrayBuffer(signature)

      return await crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32
        },
        publicKey,
        signatureBuffer,
        dataBuffer
      )
    } catch (error) {
      return false
    }
  }

  // Hash data using SHA-256
  async hash(data) {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(typeof data === 'string' ? data : JSON.stringify(data))
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    return this.arrayBufferToHex(hashBuffer)
  }

  // Generate secure random bytes
  generateRandomBytes(length) {
    return crypto.getRandomValues(new Uint8Array(length))
  }

  // Generate UUID v4
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // Utility: Convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  // Utility: Convert Base64 to ArrayBuffer
  base64ToArrayBuffer(base64) {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  // Utility: Convert ArrayBuffer to Hex
  arrayBufferToHex(buffer) {
    const bytes = new Uint8Array(buffer)
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Utility: Convert Hex to ArrayBuffer
  hexToArrayBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
    }
    return bytes.buffer
  }

  // Key fingerprint for verification
  async getKeyFingerprint(key) {
    const exported = await this.exportKey(key)
    const keyString = JSON.stringify(exported)
    const hash = await this.hash(keyString)
    
    // Format as human-readable fingerprint
    return hash.match(/.{1,4}/g).join(':').substring(0, 47) // First 12 groups
  }

  // Constant-time string comparison (prevents timing attacks)
  constantTimeEqual(a, b) {
    if (a.length !== b.length) {
      return false
    }
    
    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }
    
    return result === 0
  }

  // Secure key derivation for session keys
  async deriveSessionKey(masterKey, contextInfo, keyLength = 32) {
    const encoder = new TextEncoder()
    const info = encoder.encode(contextInfo)
    
    // Simple HKDF-like expansion
    const key = await crypto.subtle.importKey(
      'raw',
      await crypto.subtle.exportKey('raw', masterKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const hmac = await crypto.subtle.sign('HMAC', key, info)
    return new Uint8Array(hmac).slice(0, keyLength)
  }

  // Memory-safe key clearing (best effort)
  clearKey(keyData) {
    if (keyData instanceof ArrayBuffer) {
      const view = new Uint8Array(keyData)
      view.fill(0)
    } else if (keyData instanceof Uint8Array) {
      keyData.fill(0)
    }
    // Note: We can't actually clear CryptoKey objects from memory
  }
}

export default CryptoUtils
// /backend/qrLogin.js
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

import crypto from 'crypto'
import QRCode from 'qrcode'

class QRLogin {
  constructor() {
    this.tokens = new Map() // single-use tokens
  }

  // Generate a new QR login token
  generateToken(userId) {
    const token = crypto.randomBytes(16).toString('hex')
    this.tokens.set(token, { userId, created: Date.now() })
    return token
  }

  // Verify and consume token
  verifyToken(token) {
    const data = this.tokens.get(token)
    if (!data) return null
    this.tokens.delete(token) // single-use
    return data.userId
  }

  // Clean up expired tokens (optional, e.g., older than 5 minutes)
  cleanup(expiry = 5 * 60 * 1000) {
    const now = Date.now()
    for (const [token, { created }] of this.tokens.entries()) {
      if (now - created > expiry) this.tokens.delete(token)
    }
  }
  
  // Generate QR code data
  generateQR(userId = 'anonymous') {
    const token = this.generateToken(userId)
    const qrData = {
      type: 'ultrachat_login',
      token,
      userId,
      timestamp: Date.now(),
      version: '1.2.3'
    }
    return JSON.stringify(qrData)
  }
  
  // Generate QR code image
  async generateQRImage(userId = 'anonymous') {
    const qrData = this.generateQR(userId)
    try {
      const qrCodeUrl = await QRCode.toDataURL(qrData)
      return qrCodeUrl
    } catch (error) {
      console.error('QR code generation failed:', error)
      throw error
    }
  }
}

const qrLogin = new QRLogin()

export { qrLogin as default, QRLogin }
export const generateQR = (userId) => qrLogin.generateQR(userId)
export const generateQRImage = (userId) => qrLogin.generateQRImage(userId)
export const verifyToken = (token) => qrLogin.verifyToken(token)

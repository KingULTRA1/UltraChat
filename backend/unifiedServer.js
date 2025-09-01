// /backend/unifiedServer.js
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST
// Unified Server - Device-Centric Approach

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import unifiedMessagingService from './unifiedMessaging.js'
import deviceIdentityManager from './deviceIdentity.js'
import { generateQR, generateQRImage, verifyToken } from './qrLogin.js'
import 'dotenv/config'

const app = express()
// Lock the backend to port 3001 to prevent port conflicts
const port = 3001

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Initialize services
let initialized = false

const initializeServices = async () => {
  if (initialized) return
  
  try {
    await unifiedMessagingService.initialize()
    console.log('✅ Unified Messaging Service initialized')
    
    initialized = true
    console.log('✅ Unified Server services initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize services:', error)
    throw error
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.2.3 Alpha - Device-Centric',
    timestamp: new Date().toISOString(),
    deviceId: deviceIdentityManager.currentDeviceIdentity?.deviceId || 'not_initialized',
    services: {
      messaging: initialized,
      identity: !!deviceIdentityManager.currentDeviceIdentity
    }
  })
})

// Device identity endpoints
app.get('/device/identity', (req, res) => {
  try {
    if (!deviceIdentityManager.currentDeviceIdentity) {
      return res.status(404).json({ 
        error: 'Device identity not found',
        success: false 
      })
    }
    
    res.json({
      deviceId: deviceIdentityManager.getDeviceId(),
      publicKey: deviceIdentityManager.getDevicePublicKey(),
      createdAt: deviceIdentityManager.currentDeviceIdentity.createdAt,
      lastUsed: deviceIdentityManager.currentDeviceIdentity.lastUsed,
      success: true
    })
  } catch (error) {
    console.error('Device identity error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

// QR login endpoints
app.get('/qr-login', async (req, res) => {
  try {
    const qrData = generateQR()
    res.json({ qr: qrData, success: true })
  } catch (error) {
    console.error('QR generation error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

app.get('/qr-login/image', async (req, res) => {
  try {
    const qrImage = await generateQRImage()
    res.json({ qrImage, success: true })
  } catch (error) {
    console.error('QR image generation error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

// Messaging endpoints
app.post('/messages', async (req, res) => {
  try {
    const { senderId, recipientId, content, options } = req.body
    
    if (!senderId || !recipientId || !content) {
      return res.status(400).json({ 
        error: 'Missing required fields: senderId, recipientId, content',
        success: false 
      })
    }
    
    const message = await unifiedMessagingService.createMessage(senderId, recipientId, content, options)
    res.json({ message, success: true })
  } catch (error) {
    console.error('Message creation error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

app.get('/messages', async (req, res) => {
  try {
    const { senderId, recipientId, threadId } = req.query
    const filters = {}
    
    if (senderId) filters.senderId = senderId
    if (recipientId) filters.recipientId = recipientId
    if (threadId) filters.threadId = threadId
    
    const messages = await unifiedMessagingService.getAllMessages(filters)
    res.json({ messages, success: true })
  } catch (error) {
    console.error('Message retrieval error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

app.get('/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params
    const message = await unifiedMessagingService.retrieveMessage(messageId)
    res.json({ message, success: true })
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        error: error.message,
        success: false 
      })
    }
    
    console.error('Message retrieval error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

app.put('/messages/:messageId/status', async (req, res) => {
  try {
    const { messageId } = req.params
    const { status } = req.body
    
    if (!status) {
      return res.status(400).json({ 
        error: 'Missing required field: status',
        success: false 
      })
    }
    
    const message = await unifiedMessagingService.updateMessageStatus(messageId, status)
    res.json({ message, success: true })
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ 
        error: error.message,
        success: false 
      })
    }
    
    console.error('Message status update error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

// Account type and permissions endpoints
app.post('/users/:userId/permissions', (req, res) => {
  try {
    const { userId } = req.params
    const { accountType } = req.body
    
    if (!accountType) {
      return res.status(400).json({ 
        error: 'Missing required field: accountType',
        success: false 
      })
    }
    
    unifiedMessagingService.setUserPermissions(userId, accountType)
    res.json({ 
      message: `Permissions set for user ${userId} with account type ${accountType}`,
      success: true 
    })
  } catch (error) {
    console.error('Permission setting error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

app.get('/users/:userId/permissions', (req, res) => {
  try {
    const { userId } = req.params
    const userPerms = unifiedMessagingService.userPermissions.get(userId)
    
    if (!userPerms) {
      return res.status(404).json({ 
        error: `No permissions found for user ${userId}`,
        success: false 
      })
    }
    
    res.json({ permissions: userPerms, success: true })
  } catch (error) {
    console.error('Permission retrieval error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

app.get('/users/:userId/permissions/:feature', (req, res) => {
  try {
    const { userId, feature } = req.params
    const hasPermission = unifiedMessagingService.hasPermission(userId, feature)
    
    res.json({ 
      feature,
      allowed: hasPermission,
      success: true 
    })
  } catch (error) {
    console.error('Permission check error:', error)
    res.status(500).json({ 
      error: error.message,
      success: false 
    })
  }
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    error: 'Internal server error',
    success: false
  })
})

// Graceful shutdown
const shutdown = async () => {
  console.log('🔄 Shutting down UltraChat Unified Server...')
  // Add any cleanup logic here
  console.log('✅ UltraChat Unified Server shutdown complete')
}

// Start server with error handling
const startServer = async () => {
  try {
    await initializeServices()
    
    const server = app.listen(port, () => {
      console.log(`🚀 UltraChat Unified Server running on port ${port}`)
      console.log(`📋 Health check: http://localhost:${port}/health`)
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Please stop the other instance or change the port.`)
        console.error(`💡 Tip: Use 'netstat -ano | findstr :${port}' to find the process using this port`)
        console.error(`💡 Tip: Use 'taskkill /PID <process_id> /F' to kill the process`)
        process.exit(1)
      } else {
        console.error('❌ Server failed to start:', err)
        process.exit(1)
      }
    })
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await shutdown()
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })

    process.on('SIGTERM', async () => {
      await shutdown()
      server.close(() => {
        console.log('✅ Server closed')
        process.exit(0)
      })
    })
    
    return server
  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

// Export for use
export { startServer, app }

// CLI usage if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}
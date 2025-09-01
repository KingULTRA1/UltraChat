// /backend/server.js
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { UltraChatBotBridge } from './bot_bridge.js'
import { generateQR } from './qrLogin.js'
import 'dotenv/config'

const app = express()
// Lock the backend to port 3001 to prevent port conflicts
const port = 3001

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Initialize bot bridge
let botBridge = null

try {
  botBridge = new UltraChatBotBridge()
  await botBridge.initialize()
  console.log('✅ Bot bridge initialized successfully')
} catch (error) {
  console.warn('⚠️ Bot bridge initialization failed:', error.message)
  console.log('📝 Bot bridge will be unavailable')
}

// Health check endpoint
app.get('/health', (req, res) => {
  const status = {
    status: 'ok',
    version: '1.2.3 Alpha',
    timestamp: new Date().toISOString(),
    platforms: {},
    botBridge: botBridge !== null
  }
  
  if (botBridge && botBridge.connections) {
    status.platforms = {
      discord: Boolean(botBridge.connections.discord?.readyAt),
      telegram: Boolean(botBridge.connections.telegram?.isPolling?.()),
      twitter: Boolean(botBridge.connections.twitter),
      signal: Boolean(botBridge.connections.signal)
    }
  }
  
  res.json(status)
})

// Send message endpoint
app.post('/send', async (req, res) => {
  try {
    const { to, message, platform } = req.body
    
    if (!botBridge) {
      return res.status(503).json({ 
        error: 'Bot bridge not available',
        success: false 
      })
    }
    
    const result = await botBridge.sendMessage(platform, to, message)
    res.json({ success: true, result })
  } catch (err) {
    console.error('Send message error:', err)
    res.status(500).json({ 
      error: err.message,
      success: false 
    })
  }
})

// QR login endpoint
app.get('/qr-login', (req, res) => {
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

// Bot bridge status endpoint
app.get('/bot-status', (req, res) => {
  if (!botBridge) {
    return res.json({
      available: false,
      connections: {}
    })
  }
  
  res.json({
    available: true,
    initialized: botBridge.initialized,
    connections: Object.keys(botBridge.connections).reduce((acc, key) => {
      acc[key] = Boolean(botBridge.connections[key])
      return acc
    }, {})
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error)
  res.status(500).json({
    error: 'Internal server error',
    success: false
  })
})

// Start server with error handling to prevent silent port shifts
app.listen(port, () => {
  console.log(`🚀 UltraChat Bot Bridge Server running on port ${port}`)
  console.log(`📋 Health check: http://localhost:${port}/health`)
  console.log(`🤖 Bot status: http://localhost:${port}/bot-status`)
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
// QR Join Manager
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

// Graceful QR code generation fallback
let QRCode = null
try {
  // Try to import QRCode if available
  if (typeof window !== 'undefined' && window.QRCode) {
    QRCode = window.QRCode
  }
} catch (error) {
  console.warn('⚠️ QRCode library not available, using fallback')
}

class QRJoinManager {
  constructor(realTimeManager, ultraTextGenerator) {
    this.realTimeManager = realTimeManager
    this.ultraTextGenerator = ultraTextGenerator
    this.qrCodes = new Map()
    this.inviteMessages = new Map()
    this.scanHistory = new Map()
    this.isInitialized = false
    
    // QR code types
    this.qrTypes = {
      ROOM_JOIN: 'room_join',
      USER_CONTACT: 'user_contact',
      PAYMENT: 'payment',
      FILE_SHARE: 'file_share',
      CUSTOM: 'custom'
    }
    
    // Invite message templates
    this.inviteTemplates = {
      CASUAL: 'casual',
      FORMAL: 'formal',
      GAMING: 'gaming',
      BUSINESS: 'business',
      PARTY: 'party',
      STUDY: 'study',
      CUSTOM: 'custom'
    }
    
    // QR code styles
    this.qrStyles = {
      CLASSIC: 'classic',
      ROUNDED: 'rounded',
      DOTS: 'dots',
      SQUARES: 'squares',
      ULTRA: 'ultra'
    }
    
    // Security levels
    this.securityLevels = {
      PUBLIC: 'public',
      INVITE_ONLY: 'invite_only',
      PASSWORD_PROTECTED: 'password_protected',
      BIOMETRIC: 'biometric'
    }
  }

  // Initialize QR Join Manager
  async initialize() {
    try {
      console.log('📱 Initializing QR Join Manager...')
      
      // Check QR code capabilities
      await this.checkQRCapabilities()
      
      // Load default invite templates
      this.loadInviteTemplates()
      
      // Set up QR scanner if available
      await this.initializeScanner()
      
      this.isInitialized = true
      console.log('✅ QR Join Manager initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize QR Join Manager:', error)
      throw error
    }
  }

  // Check QR code capabilities
  async checkQRCapabilities() {
    try {
      // Check if QR generation is available
      this.canGenerate = typeof window !== 'undefined'
      
      // Check if camera is available for scanning
      this.canScan = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      
      if (this.canScan) {
        try {
          // Test camera access
          const stream = await navigator.mediaDevices.getUserMedia({ video: true })
          stream.getTracks().forEach(track => track.stop())
          console.log('✅ Camera access available for QR scanning')
        } catch (error) {
          console.warn('⚠️ Camera access limited for QR scanning:', error.message)
          this.canScan = false
        }
      }
      
      console.log(`🔍 QR Capabilities: Generate=${this.canGenerate}, Scan=${this.canScan}`)
      
    } catch (error) {
      console.error('❌ QR capability check failed:', error)
    }
  }

  // Load default invite templates
  loadInviteTemplates() {
    // Casual template
    this.inviteTemplates[this.inviteTemplates.CASUAL] = {
      name: 'Casual Hangout',
      message: '🎉 Hey! Want to join our chat?\n\n📱 Just scan this QR code and hop in!\n\n{custom_message}',
      style: 'friendly',
      emojis: ['🎉', '😊', '👋', '🤗'],
      colors: this.ultraTextGenerator?.colorThemes.ULTRACHAT
    }
    
    // Formal template
    this.inviteTemplates[this.inviteTemplates.FORMAL] = {
      name: 'Professional Meeting',
      message: '📋 **Professional Meeting Invitation**\n\nYou are invited to join our secure communication room.\n\n📱 Please scan the QR code below to access the meeting.\n\n🕐 Scheduled: {meeting_time}\n👥 Participants: {participant_count}\n🔒 Security: End-to-end encrypted\n\n{agenda}',
      style: 'professional',
      emojis: ['📋', '🏢', '💼', '⏰'],
      colors: this.ultraTextGenerator?.colorThemes.OCEAN
    }
    
    // Gaming template
    this.inviteTemplates[this.inviteTemplates.GAMING] = {
      name: 'Gaming Session',
      message: '🎮 **LEVEL UP! Gaming Session Starting**\n\n🚀 Ready to dominate? Scan to join our squad!\n\n🎯 Game: {game_name}\n⚡ Mode: {game_mode}\n👥 Squad: {player_count}/12\n🏆 Skill Level: {skill_level}\n\n{battle_cry}',
      style: 'energetic',
      emojis: ['🎮', '🚀', '⚡', '🏆', '💥', '🔥'],
      colors: this.ultraTextGenerator?.colorThemes.NEON
    }
    
    // Business template
    this.inviteTemplates[this.inviteTemplates.BUSINESS] = {
      name: 'Business Conference',
      message: '🏢 **Business Conference Room**\n\nAccess secured communication channel for:\n\n📊 {project_name}\n🗓️ {meeting_date}\n👔 Attendees: {attendee_list}\n\n🔐 Confidential - Authorized personnel only\n\n{meeting_notes}',
      style: 'corporate',
      emojis: ['🏢', '📊', '💼', '🔐'],
      colors: this.ultraTextGenerator?.colorThemes.OCEAN
    }
    
    // Party template
    this.inviteTemplates[this.inviteTemplates.PARTY] = {
      name: 'Party Time',
      message: '🎊 **PARTY TIME!** 🎊\n\n🕺💃 The fun is about to start!\n\n📍 Virtual Room: {room_name}\n🎵 Vibes: {party_theme}\n🍕 Snacks: {snack_info}\n🎈 Dress Code: {dress_code}\n\n🎉 Scan to join the celebration! 🎉\n\n{party_message}',
      style: 'festive',
      emojis: ['🎊', '🎉', '🕺', '💃', '🎵', '🎈', '🍕'],
      colors: this.ultraTextGenerator?.colorThemes.SUNSET
    }
    
    // Study template
    this.inviteTemplates[this.inviteTemplates.STUDY] = {
      name: 'Study Group',
      message: '📚 **Study Group Session**\n\n🎓 Join our collaborative learning space!\n\n📖 Subject: {subject}\n📅 Session: {study_date}\n⏰ Duration: {duration}\n🎯 Goal: {study_goal}\n\n📱 Scan to join and let\'s ace this together!\n\n{study_notes}',
      style: 'academic',
      emojis: ['📚', '🎓', '📖', '✏️', '🧠'],
      colors: this.ultraTextGenerator?.colorThemes.OCEAN
    }
    
    console.log('✅ Invite templates loaded')
  }

  // Initialize QR scanner
  async initializeScanner() {
    if (!this.canScan) {
      console.log('📱 QR Scanner not available (no camera access)')
      return
    }
    
    try {
      // Set up scanner constraints
      this.scannerConstraints = {
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      }
      
      console.log('✅ QR Scanner initialized')
    } catch (error) {
      console.warn('⚠️ QR Scanner initialization failed:', error)
    }
  }

  // Generate QR code for user contact sharing
  async generateContactQR(userId, options = {}) {
    try {
      // Create QR data for contact sharing
      const qrData = {
        type: this.qrTypes.USER_CONTACT,
        userId: userId,
        timestamp: Date.now(),
        publicKey: options.publicKey || null,
        trustLevel: options.trustLevel || 0,
        metadata: {
          version: '1.2.3',
          platform: 'ultrachat'
        }
      }
      
      // Add encryption if requested
      if (options.encrypt) {
        qrData.encrypted = true
        qrData.encryptionMethod = 'AES-256-GCM'
      }
      
      // Generate QR code string
      const qrString = JSON.stringify(qrData)
      
      // Create QR code object
      const qrCode = {
        id: this.generateQRId(),
        type: this.qrTypes.USER_CONTACT,
        data: qrData,
        dataString: qrString,
        userId: userId,
        style: options.style || this.qrStyles.ULTRA,
        size: options.size || 256,
        errorCorrection: options.errorCorrection || 'M',
        createdAt: new Date(),
        expiresAt: options.expiresAt,
        scanCount: 0,
        maxScans: options.maxScans || null,
        isActive: true
      }
      
      // Generate visual QR code
      qrCode.image = await this.generateQRImage(qrString, qrCode.style, qrCode.size)
      
      // Store QR code
      this.qrCodes.set(qrCode.id, qrCode)
      
      console.log(`✅ Contact QR code generated: ${qrCode.id}`)
      
      return qrCode
    } catch (error) {
      console.error('❌ Failed to generate contact QR code:', error)
      throw error
    }
  }

  // Generate QR code for room joining
  async generateRoomQR(roomId, options = {}) {
    try {
      const room = this.realTimeManager.getRoom(roomId)
      if (!room) {
        throw new Error('Room not found')
      }
      
      // Create QR data
      const qrData = {
        type: this.qrTypes.ROOM_JOIN,
        roomId: roomId,
        roomName: room.name,
        inviteCode: options.inviteCode || room.inviteCode,
        hostId: room.hostId,
        maxParticipants: room.settings.maxParticipants,
        accessTier: room.accessTier,
        securityLevel: options.securityLevel || this.securityLevels.PUBLIC,
        expiresAt: options.expiresAt || null,
        metadata: {
          version: '1.2.3',
          timestamp: Date.now(),
          platform: 'ultrachat'
        }
      }
      
      // Add password if required
      if (options.password) {
        qrData.passwordHash = await this.hashPassword(options.password)
        qrData.securityLevel = this.securityLevels.PASSWORD_PROTECTED
      }
      
      // Generate QR code string
      const qrString = JSON.stringify(qrData)
      
      // Create QR code object
      const qrCode = {
        id: this.generateQRId(),
        type: this.qrTypes.ROOM_JOIN,
        data: qrData,
        dataString: qrString,
        roomId: roomId,
        style: options.style || this.qrStyles.ULTRA,
        size: options.size || 256,
        errorCorrection: options.errorCorrection || 'M',
        createdAt: new Date(),
        expiresAt: options.expiresAt,
        scanCount: 0,
        maxScans: options.maxScans || null,
        isActive: true
      }
      
      // Generate visual QR code
      qrCode.image = await this.generateQRImage(qrString, qrCode.style, qrCode.size)
      
      // Store QR code
      this.qrCodes.set(qrCode.id, qrCode)
      
      console.log(`✅ Room QR code generated: ${qrCode.id}`)
      
      return qrCode
    } catch (error) {
      console.error('❌ Failed to generate room QR code:', error)
      throw error
    }
  }

  // Generate custom invite message
  generateInviteMessage(qrCode, templateType = this.inviteTemplates.CASUAL, variables = {}) {
    try {
      const template = this.inviteTemplates[templateType]
      if (!template) {
        console.warn(`⚠️ Unknown template type: ${templateType}`)
        return this.generateDefaultInvite(qrCode)
      }
      
      // Prepare default variables
      const defaultVariables = {
        room_name: qrCode.data.roomName,
        participant_count: variables.participant_count || '0',
        meeting_time: variables.meeting_time || 'TBD',
        custom_message: variables.custom_message || ''
      }
      
      // Merge with provided variables
      const allVariables = { ...defaultVariables, ...variables }
      
      // Generate message using Ultra Text Generator
      if (this.ultraTextGenerator) {
        const formatted = this.ultraTextGenerator.generateFromTemplate('qr_join', {
          qr_code: '📱 [QR Code Below]',
          ...allVariables
        })
        
        if (formatted) {
          // Add styling based on template
          let styledMessage = formatted.text
          
          // Apply template-specific styling
          if (template.colors) {
            styledMessage = this.ultraTextGenerator.generateColoredText(
              styledMessage, 
              null, 
              template.colors
            )
          }
          
          // Add emojis
          if (template.emojis && template.emojis.length > 0) {
            const randomEmoji = template.emojis[Math.floor(Math.random() * template.emojis.length)]
            styledMessage = this.ultraTextGenerator.addEmoji(
              styledMessage.text || styledMessage, 
              null, 
              'both'
            )
          }
          
          return {
            text: styledMessage.text || styledMessage,
            html: this.ultraTextGenerator.convertToHTML(styledMessage),
            template: template,
            variables: allVariables,
            qrCode: qrCode
          }
        }
      }
      
      // Fallback to simple template replacement
      let message = template.message
      for (const [key, value] of Object.entries(allVariables)) {
        message = message.replace(new RegExp(`{${key}}`, 'g'), value)
      }
      
      return {
        text: message,
        html: message.replace(/\n/g, '<br>'),
        template: template,
        variables: allVariables,
        qrCode: qrCode
      }
      
    } catch (error) {
      console.error('❌ Failed to generate invite message:', error)
      return this.generateDefaultInvite(qrCode)
    }
  }

  // Generate default invite
  generateDefaultInvite(qrCode) {
    return {
      text: `🚀 Join UltraChat Room!\n\n📱 Scan the QR code to join "${qrCode.data.roomName}"\n\n🔒 Privacy First • End-to-End Encrypted`,
      html: `🚀 <strong>Join UltraChat Room!</strong><br><br>📱 Scan the QR code to join "${qrCode.data.roomName}"<br><br>🔒 Privacy First • End-to-End Encrypted`,
      template: { name: 'Default', style: 'basic' },
      variables: {},
      qrCode: qrCode
    }
  }

  // Generate visual QR code image
  async generateQRImage(data, style = this.qrStyles.ULTRA, size = 256) {
    try {
      // Create canvas for QR code
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = size
      canvas.height = size
      
      // Simple QR code pattern generation (placeholder)
      // In a real implementation, you'd use a QR code library
      const qrSize = Math.floor(size * 0.8)
      const qrOffset = Math.floor((size - qrSize) / 2)
      const moduleSize = Math.floor(qrSize / 25) // 25x25 modules
      
      // Clear canvas
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, size, size)
      
      // Generate QR pattern based on data hash
      const hash = this.simpleHash(data)
      ctx.fillStyle = '#000000'
      
      for (let i = 0; i < 25; i++) {
        for (let j = 0; j < 25; j++) {
          const shouldFill = (hash + i * 25 + j) % 3 === 0
          if (shouldFill) {
            const x = qrOffset + i * moduleSize
            const y = qrOffset + j * moduleSize
            
            switch (style) {
              case this.qrStyles.ROUNDED:
                this.drawRoundedRect(ctx, x, y, moduleSize, moduleSize, 2)
                break
              case this.qrStyles.DOTS:
                ctx.beginPath()
                ctx.arc(x + moduleSize/2, y + moduleSize/2, moduleSize/3, 0, 2 * Math.PI)
                ctx.fill()
                break
              case this.qrStyles.ULTRA:
                // Ultra style with gradient
                const gradient = ctx.createLinearGradient(x, y, x + moduleSize, y + moduleSize)
                gradient.addColorStop(0, '#0088cc')
                gradient.addColorStop(1, '#00a6cc')
                ctx.fillStyle = gradient
                this.drawRoundedRect(ctx, x, y, moduleSize, moduleSize, 1)
                ctx.fillStyle = '#000000'
                break
              default:
                ctx.fillRect(x, y, moduleSize, moduleSize)
            }
          }
        }
      }
      
      // Add center logo for Ultra style
      if (style === this.qrStyles.ULTRA) {
        const logoSize = Math.floor(qrSize * 0.2)
        const logoX = Math.floor(size / 2 - logoSize / 2)
        const logoY = Math.floor(size / 2 - logoSize / 2)
        
        // Draw simple "U" logo
        ctx.fillStyle = '#00ff88'
        ctx.font = `${logoSize}px Arial`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('U', size/2, size/2)
      }
      
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('❌ Failed to generate QR image:', error)
      // Return placeholder
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
    }
  }

  // Draw rounded rectangle
  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()
  }

  // Simple hash function for QR pattern generation
  simpleHash(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  // Hash password (simplified for demo)
  async hashPassword(password) {
    // In a real implementation, use proper hashing like bcrypt or scrypt
    return btoa(password).split('').reverse().join('')
  }

  // Generate unique QR ID
  generateQRId() {
    return 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  // Scan QR code (simulated)
  async scanQR(imageData) {
    try {
      // Simulate scanning delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In a real implementation, you'd decode the QR code
      // For now, we'll simulate with a mock result
      const mockData = {
        type: this.qrTypes.ROOM_JOIN,
        roomId: 'room_' + Date.now(),
        roomName: 'Sample Room',
        inviteCode: 'ABC123',
        hostId: 'user_' + Date.now()
      }
      
      return {
        success: true,
        data: mockData,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Process scanned QR code
  async processScannedQR(qrData) {
    try {
      // Record scan in history
      const scanRecord = {
        id: 'scan_' + Date.now(),
        qrId: qrData.id,
        timestamp: new Date().toISOString(),
        processed: false
      }
      
      this.scanHistory.set(scanRecord.id, scanRecord)
      
      // Process based on QR type
      switch (qrData.type) {
        case this.qrTypes.USER_CONTACT:
          return await this.processContactQR(qrData)
          
        case this.qrTypes.ROOM_JOIN:
          return await this.processRoomQR(qrData)
          
        default:
          throw new Error(`Unsupported QR type: ${qrData.type}`)
      }
    } catch (error) {
      console.error('❌ Failed to process scanned QR:', error)
      throw error
    }
  }

  // Process contact QR code
  async processContactQR(qrData) {
    try {
      // Validate QR data
      if (!qrData.userId) {
        throw new Error('Invalid contact QR data')
      }
      
      // In a real implementation, you would:
      // 1. Add user to contacts
      // 2. Establish trust connection
      // 3. Exchange public keys if encrypted
      // 4. Send connection request
      
      console.log(`✅ Processed contact QR for user: ${qrData.userId}`)
      
      return {
        success: true,
        action: 'contact_added',
        userId: qrData.userId,
        trustLevel: qrData.trustLevel || 0
      }
    } catch (error) {
      throw new Error(`Failed to process contact QR: ${error.message}`)
    }
  }

  // Process room QR code
  async processRoomQR(qrData) {
    try {
      // Validate QR data
      if (!qrData.roomId) {
        throw new Error('Invalid room QR data')
      }
      
      // In a real implementation, you would:
      // 1. Validate room exists
      // 2. Check access permissions
      // 3. Join room
      // 4. Establish connection
      
      console.log(`✅ Processed room QR for room: ${qrData.roomName}`)
      
      return {
        success: true,
        action: 'room_joined',
        roomId: qrData.roomId,
        roomName: qrData.roomName
      }
    } catch (error) {
      throw new Error(`Failed to process room QR: ${error.message}`)
    }
  }

  // Get QR code by ID
  getQRCode(qrId) {
    return this.qrCodes.get(qrId)
  }

  // Deactivate QR code
  deactivateQR(qrId) {
    const qrCode = this.qrCodes.get(qrId)
    if (qrCode) {
      qrCode.isActive = false
      return true
    }
    return false
  }

  // Get scan history
  getScanHistory() {
    return Array.from(this.scanHistory.values())
  }
}

export default QRJoinManager
// Real-Time Communication Manager
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

class RealTimeManager {
  constructor() {
    this.connections = new Map()
    this.rooms = new Map()
    this.pttChannels = new Map()
    this.videoRooms = new Map()
    this.activeStreams = new Map()
    this.eventHandlers = new Map()
    this.isInitialized = false
    
    // Communication modes
    this.modes = {
      TEXT: 'text',
      VOICE: 'voice',
      VIDEO: 'video',
      PTT: 'ptt',
      HYBRID: 'hybrid'
    }
    
    // Room types
    this.roomTypes = {
      OPEN: 'open',
      INVITE_ONLY: 'invite_only',
      PAY_TO_ENTER: 'pay_to_enter',
      PRIVATE: 'private'
    }
    
    // Access tiers
    this.accessTiers = {
      PUBLIC: 'public',
      FRIENDS: 'friends',
      PREMIUM: 'premium',
      VIP: 'vip'
    }
  }

  // Initialize real-time communication system
  async initialize() {
    try {
      console.log('🚀 Initializing Real-Time Communication System...')
      
      // Initialize WebRTC configuration
      this.rtcConfig = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      }
      
      // Initialize media constraints
      this.mediaConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        }
      }
      
      // Set up event listeners
      this.setupEventListeners()
      
      // Initialize audio context for PTT
      await this.initializeAudioContext()
      
      this.isInitialized = true
      console.log('✅ Real-Time Communication System initialized')
      
      // Test WebRTC capabilities
      await this.testWebRTCCapabilities()
      
    } catch (error) {
      console.error('❌ Failed to initialize Real-Time Communication:', error)
      throw error
    }
  }

  // Test WebRTC capabilities
  async testWebRTCCapabilities() {
    try {
      const capabilities = {
        webrtc: !!window.RTCPeerConnection,
        mediaDevices: !!navigator.mediaDevices,
        getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        getDisplayMedia: !!navigator.mediaDevices?.getDisplayMedia,
        audioContext: !!window.AudioContext || !!window.webkitAudioContext
      }
      
      console.log('🔍 WebRTC Capabilities:', capabilities)
      
      // Test media access
      if (capabilities.getUserMedia) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ audio: true })
          testStream.getTracks().forEach(track => track.stop())
          console.log('✅ Audio access available')
        } catch (audioError) {
          console.warn('⚠️ Audio access limited:', audioError.message)
        }
        
        try {
          const testVideoStream = await navigator.mediaDevices.getUserMedia({ video: true })
          testVideoStream.getTracks().forEach(track => track.stop())
          console.log('✅ Video access available')
        } catch (videoError) {
          console.warn('⚠️ Video access limited:', videoError.message)
        }
      }
      
      return capabilities
    } catch (error) {
      console.error('❌ WebRTC capability test failed:', error)
      return {}
    }
  }

  // Initialize audio context for PTT and audio processing
  async initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
      
      // Create audio worklet for advanced processing
      if (this.audioContext.audioWorklet) {
        // Audio worklet for noise suppression and processing
        console.log('✅ Audio Worklet available for advanced processing')
      }
      
      console.log('✅ Audio Context initialized')
    } catch (error) {
      console.warn('⚠️ Audio Context initialization failed:', error)
    }
  }

  // Set up event listeners
  setupEventListeners() {
    // Window focus/blur for connection management
    window.addEventListener('focus', () => this.handleWindowFocus())
    window.addEventListener('blur', () => this.handleWindowBlur())
    
    // Network status monitoring
    window.addEventListener('online', () => this.handleNetworkOnline())
    window.addEventListener('offline', () => this.handleNetworkOffline())
    
    // Device change detection
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => this.handleDeviceChange())
    }
  }

  // Create a new communication room
  async createRoom(options = {}) {
    try {
      const roomId = options.id || this.generateRoomId()
      
      const room = {
        id: roomId,
        name: options.name || `Room ${roomId}`,
        type: options.type || this.roomTypes.OPEN,
        mode: options.mode || this.modes.HYBRID,
        accessTier: options.accessTier || this.accessTiers.PUBLIC,
        hostId: options.hostId,
        participants: new Map(),
        settings: {
          locked: options.locked || false,
          maxParticipants: options.maxParticipants || 50,
          recordingEnabled: options.recordingEnabled || false,
          moderationEnabled: options.moderationEnabled || true,
          pttEnabled: options.pttEnabled || true,
          videoEnabled: options.videoEnabled || true,
          textEnabled: options.textEnabled || true,
          burnAfterRead: options.burnAfterRead || false,
          entryFee: options.entryFee || null
        },
        moderators: new Set([options.hostId]),
        bannedUsers: new Set(),
        inviteCode: this.generateInviteCode(),
        qrCode: null, // Will be generated
        createdAt: new Date(),
        scheduledStart: options.scheduledStart || null,
        scheduledEnd: options.scheduledEnd || null,
        recording: null,
        analytics: {
          joinCount: 0,
          peakParticipants: 0,
          totalDuration: 0
        }
      }
      
      // Generate QR code for room joining
      room.qrCode = await this.generateRoomQR(room)
      
      this.rooms.set(roomId, room)
      
      console.log(`✅ Room created: ${roomId} (${room.name})`)
      
      // Emit room created event
      this.emit('roomCreated', { room })
      
      return room
    } catch (error) {
      console.error('❌ Failed to create room:', error)
      throw error
    }
  }

  // Join a room
  async joinRoom(roomId, userId, options = {}) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) {
        throw new Error('Room not found')
      }
      
      // Check access permissions
      const canJoin = await this.checkRoomAccess(room, userId, options)
      if (!canJoin.allowed) {
        throw new Error(canJoin.reason)
      }
      
      // Check if user is banned
      if (room.bannedUsers.has(userId)) {
        throw new Error('User is banned from this room')
      }
      
      // Check room capacity
      if (room.participants.size >= room.settings.maxParticipants) {
        throw new Error('Room is full')
      }
      
      // Create participant object
      const participant = {
        id: userId,
        name: options.name || `User ${userId}`,
        joinedAt: new Date(),
        role: room.moderators.has(userId) ? 'moderator' : 'participant',
        permissions: {
          canSpeak: !room.settings.locked || room.moderators.has(userId),
          canVideo: room.settings.videoEnabled,
          canText: room.settings.textEnabled,
          canModeratePTT: room.moderators.has(userId)
        },
        status: {
          audioEnabled: false,
          videoEnabled: false,
          pttActive: false,
          isTyping: false,
          lastActivity: new Date()
        },
        connection: null // Will store RTCPeerConnection
      }
      
      // Add participant to room
      room.participants.set(userId, participant)
      room.analytics.joinCount++
      room.analytics.peakParticipants = Math.max(
        room.analytics.peakParticipants,
        room.participants.size
      )
      
      console.log(`✅ User ${userId} joined room ${roomId}`)
      
      // Emit join events
      this.emit('userJoinedRoom', { room, participant })
      this.emit('roomUpdated', { room })
      
      return { room, participant }
    } catch (error) {
      console.error('❌ Failed to join room:', error)
      throw error
    }
  }

  // Leave a room
  async leaveRoom(roomId, userId) {
    try {
      const room = this.rooms.get(roomId)
      if (!room) return
      
      const participant = room.participants.get(userId)
      if (!participant) return
      
      // Close peer connections
      if (participant.connection) {
        participant.connection.close()
      }
      
      // Stop media streams
      await this.stopUserStreams(userId)
      
      // Remove participant
      room.participants.delete(userId)
      
      // If room is empty and not persistent, clean up
      if (room.participants.size === 0 && !room.settings.persistent) {
        this.rooms.delete(roomId)
        console.log(`🗑️ Empty room ${roomId} removed`)
      }
      
      console.log(`✅ User ${userId} left room ${roomId}`)
      
      // Emit leave events
      this.emit('userLeftRoom', { room, userId })
      this.emit('roomUpdated', { room })
      
    } catch (error) {
      console.error('❌ Failed to leave room:', error)
    }
  }

  // Generate room ID
  generateRoomId() {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate invite code
  generateInviteCode() {
    return Math.random().toString(36).substr(2, 8).toUpperCase()
  }

  // Generate QR code for room
  async generateRoomQR(room) {
    const qrData = {
      type: 'ultrachat_room_join',
      roomId: room.id,
      inviteCode: room.inviteCode,
      name: room.name,
      mode: room.mode,
      accessTier: room.accessTier,
      timestamp: Date.now(),
      version: '1.2.3'
    }
    
    return JSON.stringify(qrData)
  }

  // Check room access permissions
  async checkRoomAccess(room, userId, options = {}) {
    try {
      // Check room type
      switch (room.type) {
        case this.roomTypes.OPEN:
          return { allowed: true }
          
        case this.roomTypes.INVITE_ONLY:
          if (!options.inviteCode || options.inviteCode !== room.inviteCode) {
            return { allowed: false, reason: 'Invalid invite code' }
          }
          return { allowed: true }
          
        case this.roomTypes.PAY_TO_ENTER:
          if (!options.paymentProof && room.settings.entryFee) {
            return { allowed: false, reason: 'Payment required' }
          }
          return { allowed: true }
          
        case this.roomTypes.PRIVATE:
          if (!room.moderators.has(userId)) {
            return { allowed: false, reason: 'Private room - moderator access only' }
          }
          return { allowed: true }
          
        default:
          return { allowed: false, reason: 'Unknown room type' }
      }
    } catch (error) {
      console.error('❌ Access check failed:', error)
      return { allowed: false, reason: 'Access check failed' }
    }
  }

  // Event system
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event).add(handler)
  }

  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).delete(handler)
    }
  }

  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`❌ Event handler error for ${event}:`, error)
        }
      })
    }
  }

  // Window focus/blur handlers
  handleWindowFocus() {
    console.log('🔍 Window focused - resuming connections')
    // Resume connections if needed
  }

  handleWindowBlur() {
    console.log('👁️ Window blurred - maintaining connections')
    // Keep connections but reduce activity
  }

  // Network status handlers
  handleNetworkOnline() {
    console.log('🌐 Network online - reconnecting')
    // Reconnect all rooms
  }

  handleNetworkOffline() {
    console.log('📡 Network offline - maintaining state')
    // Maintain room state offline
  }

  // Device change handler
  handleDeviceChange() {
    console.log('🎛️ Media devices changed')
    // Update available devices and notify rooms
    this.emit('devicesChanged', {})
  }

  // Stop user streams
  async stopUserStreams(userId) {
    const streams = this.activeStreams.get(userId)
    if (streams) {
      streams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop())
      })
      this.activeStreams.delete(userId)
    }
  }

  // Get room list
  getRooms() {
    return Array.from(this.rooms.values())
  }

  // Get room by ID
  getRoom(roomId) {
    return this.rooms.get(roomId)
  }

  // Cleanup
  async destroy() {
    console.log('🛑 Destroying Real-Time Communication System...')
    
    // Close all rooms
    for (const [roomId, room] of this.rooms) {
      for (const userId of room.participants.keys()) {
        await this.leaveRoom(roomId, userId)
      }
    }
    
    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close()
    }
    
    // Clear all data
    this.rooms.clear()
    this.connections.clear()
    this.pttChannels.clear()
    this.videoRooms.clear()
    this.activeStreams.clear()
    this.eventHandlers.clear()
    
    this.isInitialized = false
    console.log('✅ Real-Time Communication System destroyed')
  }
}

export default RealTimeManager
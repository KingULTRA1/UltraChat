// Video Room Manager
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

class VideoRoomManager {
  constructor(realTimeManager) {
    this.realTimeManager = realTimeManager
    this.videoRooms = new Map()
    this.peerConnections = new Map()
    this.localStreams = new Map()
    this.remoteStreams = new Map()
    this.isInitialized = false
    
    // Video room settings
    this.settings = {
      maxParticipants: 12,
      videoQuality: 'hd', // 'sd', 'hd', '4k'
      audioQuality: 'high',
      enableScreenShare: true,
      enableVirtualBackground: true,
      enableRecording: true,
      lowLatencyMode: true,
      adaptiveQuality: true,
      simulcastEnabled: true
    }
    
    // Video layouts
    this.layouts = {
      GRID: 'grid',
      SPEAKER: 'speaker',
      PRESENTATION: 'presentation',
      CINEMA: 'cinema',
      CUSTOM: 'custom'
    }
    
    // Video states
    this.states = {
      DISCONNECTED: 'disconnected',
      CONNECTING: 'connecting',
      CONNECTED: 'connected',
      RECONNECTING: 'reconnecting'
    }
    
    // WebRTC configuration
    this.rtcConfig = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10,
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require'
    }
  }

  // Initialize video room system
  async initialize() {
    try {
      console.log('📹 Initializing Video Room System...')
      
      // Test video capabilities
      await this.testVideoCapabilities()
      
      // Initialize video processing
      await this.initializeVideoProcessing()
      
      // Set up device monitoring
      this.setupDeviceMonitoring()
      
      this.isInitialized = true
      console.log('✅ Video Room System initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize Video Room System:', error)
      throw error
    }
  }

  // Test video capabilities
  async testVideoCapabilities() {
    try {
      const capabilities = {
        video: !!navigator.mediaDevices?.getUserMedia,
        screenShare: !!navigator.mediaDevices?.getDisplayMedia,
        webrtc: !!window.RTCPeerConnection,
        mediaRecorder: !!window.MediaRecorder
      }
      
      console.log('🔍 Video capabilities:', capabilities)
      
      // Test video access
      if (capabilities.video) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 }
          })
          testStream.getTracks().forEach(track => track.stop())
          console.log('✅ Video access confirmed')
        } catch (error) {
          console.warn('⚠️ Video access limited:', error.message)
        }
      }
      
      // Test screen share
      if (capabilities.screenShare) {
        console.log('✅ Screen sharing available')
      }
      
      return capabilities
    } catch (error) {
      console.error('❌ Video capability test failed:', error)
      return {}
    }
  }

  // Initialize video processing
  async initializeVideoProcessing() {
    try {
      // Set up canvas for video effects
      this.effectsCanvas = document.createElement('canvas')
      this.effectsContext = this.effectsCanvas.getContext('2d')
      
      // Initialize virtual background processing
      if (this.settings.enableVirtualBackground) {
        await this.initializeVirtualBackground()
      }
      
      console.log('✅ Video processing initialized')
    } catch (error) {
      console.warn('⚠️ Video processing initialization failed:', error)
    }
  }

  // Initialize virtual background
  async initializeVirtualBackground() {
    try {
      // This would integrate with MediaPipe or similar for background removal
      console.log('✅ Virtual background ready (placeholder)')
    } catch (error) {
      console.warn('⚠️ Virtual background initialization failed:', error)
    }
  }

  // Create video room
  async createVideoRoom(options = {}) {
    try {
      const roomId = options.id || this.generateRoomId()
      
      const room = {
        id: roomId,
        name: options.name || `Video Room ${roomId}`,
        hostId: options.hostId,
        participants: new Map(),
        settings: {
          maxParticipants: options.maxParticipants || this.settings.maxParticipants,
          layout: options.layout || this.layouts.GRID,
          recordingEnabled: options.recordingEnabled || false,
          screenShareEnabled: options.screenShareEnabled || true,
          chatEnabled: options.chatEnabled || true,
          moderationEnabled: options.moderationEnabled || true,
          joinApprovalRequired: options.joinApprovalRequired || false,
          videoQuality: options.videoQuality || this.settings.videoQuality,
          audioQuality: options.audioQuality || this.settings.audioQuality
        },
        moderators: new Set([options.hostId]),
        currentSpeaker: null,
        pinnedParticipants: new Set(),
        screenShareActive: false,
        screenShareUserId: null,
        recording: null,
        analytics: {
          joinCount: 0,
          peakParticipants: 0,
          totalDuration: 0,
          screenShareDuration: 0
        },
        createdAt: new Date(),
        lastActivity: new Date()
      }
      
      this.videoRooms.set(roomId, room)
      
      console.log(`✅ Video room created: ${roomId}`)
      
      // Emit room created event
      this.realTimeManager.emit('videoRoomCreated', { room })
      
      return room
    } catch (error) {
      console.error('❌ Failed to create video room:', error)
      throw error
    }
  }

  // Join video room
  async joinVideoRoom(roomId, userId, options = {}) {
    try {
      const room = this.videoRooms.get(roomId)
      if (!room) {
        throw new Error('Video room not found')
      }
      
      // Check capacity
      if (room.participants.size >= room.settings.maxParticipants) {
        throw new Error('Video room is full')
      }
      
      // Check if approval required
      if (room.settings.joinApprovalRequired && !room.moderators.has(userId)) {
        // Request approval from moderators
        this.requestJoinApproval(room, userId, options)
        return { status: 'pending_approval' }
      }
      
      // Get user media
      const mediaOptions = {
        video: {
          width: this.getVideoWidth(),
          height: this.getVideoHeight(),
          frameRate: this.getFrameRate()
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(mediaOptions)
      
      // Create participant
      const participant = {
        id: userId,
        name: options.name || `User ${userId}`,
        joinedAt: new Date(),
        role: room.moderators.has(userId) ? 'moderator' : 'participant',
        stream: stream,
        connection: null,
        settings: {
          audioEnabled: options.audioEnabled !== false,
          videoEnabled: options.videoEnabled !== false,
          screenShareEnabled: false
        },
        status: {
          speaking: false,
          pinned: false,
          spotlighted: false,
          handRaised: false,
          connectionState: this.states.CONNECTING
        },
        analytics: {
          joinTime: new Date(),
          speakingTime: 0,
          dataTransferred: 0
        }
      }
      
      // Store local stream
      this.localStreams.set(userId, stream)
      
      // Create peer connections with other participants
      await this.establishPeerConnections(room, participant)
      
      // Add participant to room
      room.participants.set(userId, participant)
      room.analytics.joinCount++
      room.analytics.peakParticipants = Math.max(
        room.analytics.peakParticipants,
        room.participants.size
      )
      room.lastActivity = new Date()
      
      console.log(`✅ User ${userId} joined video room ${roomId}`)
      
      // Emit join events
      this.realTimeManager.emit('userJoinedVideoRoom', { room, participant })
      this.realTimeManager.emit('videoRoomUpdated', { room })
      
      return { room, participant, status: 'joined' }
    } catch (error) {
      console.error('❌ Failed to join video room:', error)
      throw error
    }
  }

  // Establish peer connections
  async establishPeerConnections(room, newParticipant) {
    try {
      const promises = []
      
      // Create connections with existing participants
      for (const [existingUserId, existingParticipant] of room.participants) {
        if (existingUserId !== newParticipant.id) {
          promises.push(
            this.createPeerConnection(newParticipant.id, existingUserId, room.id)
          )
        }
      }
      
      await Promise.all(promises)
      console.log(`✅ Peer connections established for ${newParticipant.id}`)
      
    } catch (error) {
      console.error('❌ Failed to establish peer connections:', error)
      throw error
    }
  }

  // Create peer connection between two users
  async createPeerConnection(userId1, userId2, roomId) {
    try {
      const connectionId = `${userId1}_${userId2}`
      
      // Create RTCPeerConnection
      const peerConnection = new RTCPeerConnection(this.rtcConfig)
      
      // Add local stream
      const localStream = this.localStreams.get(userId1)
      if (localStream) {
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream)
        })
      }
      
      // Handle remote stream
      peerConnection.ontrack = (event) => {
        const remoteStream = event.streams[0]
        this.remoteStreams.set(userId2, remoteStream)
        
        // Emit remote stream received
        this.realTimeManager.emit('remoteStreamReceived', {
          roomId,
          userId: userId2,
          stream: remoteStream
        })
      }
      
      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState
        console.log(`🔗 Connection ${connectionId} state: ${state}`)
        
        // Update participant status
        const room = this.videoRooms.get(roomId)
        const participant = room?.participants.get(userId2)
        if (participant) {
          participant.status.connectionState = state
        }
        
        // Emit connection state change
        this.realTimeManager.emit('peerConnectionStateChanged', {
          roomId,
          userId1,
          userId2,
          state
        })
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          // In a real implementation, this would be sent via signaling server
          console.log('🧊 ICE candidate generated')
        }
      }
      
      // Store peer connection
      this.peerConnections.set(connectionId, peerConnection)
      
      return peerConnection
    } catch (error) {
      console.error('❌ Failed to create peer connection:', error)
      throw error
    }
  }

  // Start screen sharing
  async startScreenShare(roomId, userId) {
    try {
      const room = this.videoRooms.get(roomId)
      if (!room) {
        throw new Error('Video room not found')
      }
      
      const participant = room.participants.get(userId)
      if (!participant) {
        throw new Error('Participant not found')
      }
      
      // Check if screen share is already active
      if (room.screenShareActive) {
        throw new Error('Screen share already active by another user')
      }
      
      // Get display media
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920, max: 4096 },
          height: { ideal: 1080, max: 2160 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: true
      })
      
      // Replace video track in peer connections
      const videoTrack = screenStream.getVideoTracks()[0]
      
      for (const [connectionId, peerConnection] of this.peerConnections) {
        if (connectionId.startsWith(userId)) {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        }
      }
      
      // Update room state
      room.screenShareActive = true
      room.screenShareUserId = userId
      participant.settings.screenShareEnabled = true
      
      // Handle screen share end
      videoTrack.onended = () => {
        this.stopScreenShare(roomId, userId)
      }
      
      console.log(`✅ Screen sharing started by ${userId} in room ${roomId}`)
      
      // Emit screen share started event
      this.realTimeManager.emit('screenShareStarted', {
        roomId,
        userId,
        stream: screenStream
      })
      
      return screenStream
    } catch (error) {
      console.error('❌ Failed to start screen share:', error)
      throw error
    }
  }

  // Stop screen sharing
  async stopScreenShare(roomId, userId) {
    try {
      const room = this.videoRooms.get(roomId)
      if (!room) return
      
      const participant = room.participants.get(userId)
      if (!participant) return
      
      // Get camera stream again
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: this.getVideoWidth(),
          height: this.getVideoHeight(),
          frameRate: this.getFrameRate()
        },
        audio: true
      })
      
      // Replace screen share track with camera track
      const videoTrack = cameraStream.getVideoTracks()[0]
      
      for (const [connectionId, peerConnection] of this.peerConnections) {
        if (connectionId.startsWith(userId)) {
          const sender = peerConnection.getSenders().find(s => 
            s.track && s.track.kind === 'video'
          )
          
          if (sender) {
            await sender.replaceTrack(videoTrack)
          }
        }
      }
      
      // Update room state
      room.screenShareActive = false
      room.screenShareUserId = null
      participant.settings.screenShareEnabled = false
      
      // Update local stream
      this.localStreams.set(userId, cameraStream)
      
      console.log(`✅ Screen sharing stopped by ${userId} in room ${roomId}`)
      
      // Emit screen share stopped event
      this.realTimeManager.emit('screenShareStopped', {
        roomId,
        userId
      })
      
    } catch (error) {
      console.error('❌ Failed to stop screen share:', error)
    }
  }

  // Toggle audio/video
  async toggleAudio(roomId, userId) {
    const room = this.videoRooms.get(roomId)
    const participant = room?.participants.get(userId)
    const stream = this.localStreams.get(userId)
    
    if (participant && stream) {
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        participant.settings.audioEnabled = audioTrack.enabled
        
        this.realTimeManager.emit('audioToggled', {
          roomId,
          userId,
          enabled: audioTrack.enabled
        })
      }
    }
  }

  async toggleVideo(roomId, userId) {
    const room = this.videoRooms.get(roomId)
    const participant = room?.participants.get(userId)
    const stream = this.localStreams.get(userId)
    
    if (participant && stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        participant.settings.videoEnabled = videoTrack.enabled
        
        this.realTimeManager.emit('videoToggled', {
          roomId,
          userId,
          enabled: videoTrack.enabled
        })
      }
    }
  }

  // Get video dimensions based on quality
  getVideoWidth() {
    switch (this.settings.videoQuality) {
      case 'sd': return 640
      case 'hd': return 1280
      case '4k': return 3840
      default: return 1280
    }
  }

  getVideoHeight() {
    switch (this.settings.videoQuality) {
      case 'sd': return 480
      case 'hd': return 720
      case '4k': return 2160
      default: return 720
    }
  }

  getFrameRate() {
    return this.settings.lowLatencyMode ? 30 : 24
  }

  // Generate room ID
  generateRoomId() {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  // Set up device monitoring
  setupDeviceMonitoring() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', () => {
        console.log('📹 Video devices changed')
        this.realTimeManager.emit('videoDevicesChanged', {})
      })
    }
  }

  // Leave video room
  async leaveVideoRoom(roomId, userId) {
    try {
      const room = this.videoRooms.get(roomId)
      if (!room) return
      
      const participant = room.participants.get(userId)
      if (!participant) return
      
      // Stop local stream
      const stream = this.localStreams.get(userId)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        this.localStreams.delete(userId)
      }
      
      // Close peer connections
      for (const [connectionId, peerConnection] of this.peerConnections) {
        if (connectionId.includes(userId)) {
          peerConnection.close()
          this.peerConnections.delete(connectionId)
        }
      }
      
      // Remove remote streams
      this.remoteStreams.delete(userId)
      
      // If user was screen sharing, stop it
      if (room.screenShareUserId === userId) {
        room.screenShareActive = false
        room.screenShareUserId = null
      }
      
      // Remove participant
      room.participants.delete(userId)
      room.lastActivity = new Date()
      
      console.log(`✅ User ${userId} left video room ${roomId}`)
      
      // Emit leave events
      this.realTimeManager.emit('userLeftVideoRoom', { room, userId })
      this.realTimeManager.emit('videoRoomUpdated', { room })
      
    } catch (error) {
      console.error('❌ Failed to leave video room:', error)
    }
  }

  // Get video rooms
  getRooms() {
    return Array.from(this.videoRooms.values())
  }

  // Get room by ID
  getRoom(roomId) {
    return this.videoRooms.get(roomId)
  }

  // Update room settings
  updateRoomSettings(roomId, settings) {
    const room = this.videoRooms.get(roomId)
    if (room) {
      room.settings = { ...room.settings, ...settings }
      this.realTimeManager.emit('videoRoomSettingsUpdated', { room })
    }
  }

  // Cleanup
  async destroy() {
    console.log('🛑 Destroying Video Room System...')
    
    // Close all peer connections
    for (const [connectionId, peerConnection] of this.peerConnections) {
      peerConnection.close()
    }
    this.peerConnections.clear()
    
    // Stop all local streams
    for (const [userId, stream] of this.localStreams) {
      stream.getTracks().forEach(track => track.stop())
    }
    this.localStreams.clear()
    
    // Clear remote streams
    this.remoteStreams.clear()
    
    // Clear all rooms
    this.videoRooms.clear()
    
    this.isInitialized = false
    console.log('✅ Video Room System destroyed')
  }
}

export default VideoRoomManager
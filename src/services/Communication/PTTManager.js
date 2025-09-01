// Push-to-Talk Manager
// 🚀 UltraChat v1.2.3.4 Final - PRIVACY FIRST

class PTTManager {
  constructor(realTimeManager) {
    this.realTimeManager = realTimeManager
    this.pttChannels = new Map()
    this.activeTransmissions = new Map()
    this.audioContext = null
    this.mediaRecorder = null
    this.isInitialized = false
    
    // PTT settings
    this.settings = {
      activationKey: 'Space',
      activationMethod: 'key', // 'key', 'button', 'voice'
      audioQuality: 'high', // 'low', 'medium', 'high'
      noiseSuppressionEnabled: true,
      echoCancellationEnabled: true,
      autoGainControlEnabled: true,
      voiceActivationThreshold: 0.1,
      maxTransmissionTime: 30000, // 30 seconds
      compressionEnabled: true
    }
    
    // Transmission states
    this.states = {
      IDLE: 'idle',
      LISTENING: 'listening',
      TRANSMITTING: 'transmitting',
      PROCESSING: 'processing'
    }
    
    this.currentState = this.states.IDLE
    this.keyListeners = new Map()
    this.voiceActivityDetector = null
  }

  // Initialize PTT system
  async initialize() {
    try {
      console.log('🎙️ Initializing Push-to-Talk System...')
      
      // Initialize audio context
      await this.initializeAudio()
      
      // Set up key listeners
      this.setupKeyListeners()
      
      // Initialize voice activity detection
      await this.initializeVoiceActivityDetection()
      
      this.isInitialized = true
      console.log('✅ Push-to-Talk System initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize PTT System:', error)
      throw error
    }
  }

  // Initialize audio context and processing
  async initializeAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
      
      // Create audio processing nodes
      this.gainNode = this.audioContext.createGain()
      this.filterNode = this.audioContext.createBiquadFilter()
      this.compressorNode = this.audioContext.createDynamicsCompressor()
      
      // Configure audio processing chain
      this.filterNode.type = 'highpass'
      this.filterNode.frequency.setValueAtTime(100, this.audioContext.currentTime) // Remove low-frequency noise
      
      this.compressorNode.threshold.setValueAtTime(-24, this.audioContext.currentTime)
      this.compressorNode.knee.setValueAtTime(30, this.audioContext.currentTime)
      this.compressorNode.ratio.setValueAtTime(12, this.audioContext.currentTime)
      this.compressorNode.attack.setValueAtTime(0.003, this.audioContext.currentTime)
      this.compressorNode.release.setValueAtTime(0.25, this.audioContext.currentTime)
      
      console.log('✅ PTT Audio processing initialized')
    } catch (error) {
      console.error('❌ PTT Audio initialization failed:', error)
      throw error
    }
  }

  // Set up keyboard listeners for PTT
  setupKeyListeners() {
    // Key down handler
    const handleKeyDown = (event) => {
      if (event.code === this.settings.activationKey && !event.repeat) {
        event.preventDefault()
        this.startTransmission()
      }
    }
    
    // Key up handler
    const handleKeyUp = (event) => {
      if (event.code === this.settings.activationKey) {
        event.preventDefault()
        this.stopTransmission()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    
    // Store listeners for cleanup
    this.keyListeners.set('keydown', handleKeyDown)
    this.keyListeners.set('keyup', handleKeyUp)
    
    console.log(`✅ PTT key listeners set up (${this.settings.activationKey})`)
  }

  // Initialize voice activity detection
  async initializeVoiceActivityDetection() {
    try {
      // Create analyzer node for voice detection
      this.analyzerNode = this.audioContext.createAnalyser()
      this.analyzerNode.fftSize = 256
      this.analyzerNode.smoothingTimeConstant = 0.8
      
      this.voiceDataArray = new Uint8Array(this.analyzerNode.frequencyBinCount)
      
      console.log('✅ Voice Activity Detection initialized')
    } catch (error) {
      console.error('❌ Voice Activity Detection initialization failed:', error)
    }
  }

  // Create PTT channel
  async createPTTChannel(options = {}) {
    try {
      const channelId = options.id || this.generateChannelId()
      
      const channel = {
        id: channelId,
        name: options.name || `PTT Channel ${channelId}`,
        roomId: options.roomId,
        participants: new Map(),
        settings: {
          maxParticipants: options.maxParticipants || 10,
          queueEnabled: options.queueEnabled || true,
          moderationEnabled: options.moderationEnabled || false,
          recordingEnabled: options.recordingEnabled || false,
          compressionLevel: options.compressionLevel || 'medium'
        },
        transmissionQueue: [],
        currentSpeaker: null,
        moderators: new Set(options.moderators || []),
        analytics: {
          totalTransmissions: 0,
          totalDuration: 0,
          averageTransmissionLength: 0
        },
        createdAt: new Date()
      }
      
      this.pttChannels.set(channelId, channel)
      
      console.log(`✅ PTT Channel created: ${channelId}`)
      
      // Emit channel created event
      this.realTimeManager.emit('pttChannelCreated', { channel })
      
      return channel
    } catch (error) {
      console.error('❌ Failed to create PTT channel:', error)
      throw error
    }
  }

  // Join PTT channel
  async joinPTTChannel(channelId, userId, options = {}) {
    try {
      const channel = this.pttChannels.get(channelId)
      if (!channel) {
        throw new Error('PTT Channel not found')
      }
      
      // Check capacity
      if (channel.participants.size >= channel.settings.maxParticipants) {
        throw new Error('PTT Channel is full')
      }
      
      // Create participant
      const participant = {
        id: userId,
        name: options.name || `User ${userId}`,
        joinedAt: new Date(),
        permissions: {
          canTransmit: true,
          canQueue: true,
          canModerate: channel.moderators.has(userId)
        },
        status: {
          inQueue: false,
          transmitting: false,
          queuePosition: -1
        },
        statistics: {
          transmissionCount: 0,
          totalTransmissionTime: 0,
          averageTransmissionLength: 0
        }
      }
      
      channel.participants.set(userId, participant)
      
      console.log(`✅ User ${userId} joined PTT channel ${channelId}`)
      
      // Emit join event
      this.realTimeManager.emit('userJoinedPTTChannel', { channel, participant })
      
      return { channel, participant }
    } catch (error) {
      console.error('❌ Failed to join PTT channel:', error)
      throw error
    }
  }

  // Start transmission
  async startTransmission(channelId, userId) {
    try {
      if (this.currentState !== this.states.IDLE) {
        console.warn('⚠️ PTT already active')
        return false
      }
      
      console.log(`🎙️ Starting PTT transmission for user ${userId}`)
      
      this.currentState = this.states.LISTENING
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: this.settings.echoCancellationEnabled,
          noiseSuppression: this.settings.noiseSuppressionEnabled,
          autoGainControl: this.settings.autoGainControlEnabled,
          sampleRate: this.getAudioSampleRate(),
          channelCount: 1
        }
      })
      
      // Set up audio processing chain
      const source = this.audioContext.createMediaStreamSource(stream)
      source.connect(this.filterNode)
      this.filterNode.connect(this.compressorNode)
      this.compressorNode.connect(this.gainNode)
      this.gainNode.connect(this.analyzerNode)
      
      // Create media recorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: this.getOptimalMimeType(),
        audioBitsPerSecond: this.getAudioBitrate()
      })
      
      const audioChunks = []
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data)
        }
      }
      
      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        await this.processTranmissionEnd(channelId, userId, audioBlob)
      }
      
      // Start recording
      this.mediaRecorder.start(100) // Collect data every 100ms
      this.currentState = this.states.TRANSMITTING
      
      // Set transmission timeout
      this.transmissionTimeout = setTimeout(() => {
        this.stopTransmission()
      }, this.settings.maxTransmissionTime)
      
      // Start voice activity monitoring
      this.startVoiceActivityMonitoring()
      
      // Emit transmission start event
      this.realTimeManager.emit('pttTransmissionStarted', {
        channelId,
        userId,
        timestamp: new Date()
      })
      
      return true
    } catch (error) {
      console.error('❌ Failed to start PTT transmission:', error)
      this.currentState = this.states.IDLE
      return false
    }
  }

  // Stop transmission
  async stopTransmission() {
    try {
      if (this.currentState !== this.states.TRANSMITTING) {
        return false
      }
      
      console.log('🎙️ Stopping PTT transmission')
      
      this.currentState = this.states.PROCESSING
      
      // Clear timeout
      if (this.transmissionTimeout) {
        clearTimeout(this.transmissionTimeout)
        this.transmissionTimeout = null
      }
      
      // Stop recording
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
      }
      
      // Stop voice activity monitoring
      this.stopVoiceActivityMonitoring()
      
      return true
    } catch (error) {
      console.error('❌ Failed to stop PTT transmission:', error)
      this.currentState = this.states.IDLE
      return false
    }
  }

  // Process transmission end
  async processTranmissionEnd(channelId, userId, audioBlob) {
    try {
      const channel = this.pttChannels.get(channelId)
      const participant = channel?.participants.get(userId)
      
      if (channel && participant) {
        // Update statistics
        const transmissionDuration = Date.now() - this.transmissionStartTime
        participant.statistics.transmissionCount++
        participant.statistics.totalTransmissionTime += transmissionDuration
        participant.statistics.averageTransmissionLength = 
          participant.statistics.totalTransmissionTime / participant.statistics.transmissionCount
        
        channel.analytics.totalTransmissions++
        channel.analytics.totalDuration += transmissionDuration
        channel.analytics.averageTransmissionLength =
          channel.analytics.totalDuration / channel.analytics.totalTransmissions
        
        // Emit transmission end event
        this.realTimeManager.emit('pttTransmissionEnded', {
          channelId,
          userId,
          audioBlob,
          duration: transmissionDuration,
          timestamp: new Date()
        })
      }
      
      this.currentState = this.states.IDLE
      
    } catch (error) {
      console.error('❌ Failed to process transmission end:', error)
      this.currentState = this.states.IDLE
    }
  }

  // Start voice activity monitoring
  startVoiceActivityMonitoring() {
    const checkVoiceActivity = () => {
      if (this.currentState !== this.states.TRANSMITTING) {
        return
      }
      
      this.analyzerNode.getByteFrequencyData(this.voiceDataArray)
      
      // Calculate average volume
      const average = this.voiceDataArray.reduce((sum, value) => sum + value, 0) / this.voiceDataArray.length
      const normalizedLevel = average / 255
      
      // Emit voice activity level
      this.realTimeManager.emit('pttVoiceActivity', {
        level: normalizedLevel,
        isActive: normalizedLevel > this.settings.voiceActivationThreshold
      })
      
      // Schedule next check
      this.voiceActivityCheck = requestAnimationFrame(checkVoiceActivity)
    }
    
    this.voiceActivityCheck = requestAnimationFrame(checkVoiceActivity)
  }

  // Stop voice activity monitoring
  stopVoiceActivityMonitoring() {
    if (this.voiceActivityCheck) {
      cancelAnimationFrame(this.voiceActivityCheck)
      this.voiceActivityCheck = null
    }
  }

  // Get optimal audio sample rate
  getAudioSampleRate() {
    switch (this.settings.audioQuality) {
      case 'low': return 16000
      case 'medium': return 22050
      case 'high': return 48000
      default: return 48000
    }
  }

  // Get optimal MIME type
  getOptimalMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus'
    ]
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }
    
    return 'audio/webm'
  }

  // Get audio bitrate based on quality
  getAudioBitrate() {
    switch (this.settings.audioQuality) {
      case 'low': return 32000
      case 'medium': return 64000
      case 'high': return 128000
      default: return 64000
    }
  }

  // Generate channel ID
  generateChannelId() {
    return `ptt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  // Update PTT settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    console.log('✅ PTT settings updated:', this.settings)
  }

  // Get PTT channels
  getChannels() {
    return Array.from(this.pttChannels.values())
  }

  // Get channel by ID
  getChannel(channelId) {
    return this.pttChannels.get(channelId)
  }

  // Leave PTT channel
  async leavePTTChannel(channelId, userId) {
    try {
      const channel = this.pttChannels.get(channelId)
      if (!channel) return
      
      channel.participants.delete(userId)
      
      // If user was transmitting, stop transmission
      if (channel.currentSpeaker === userId) {
        await this.stopTransmission()
        channel.currentSpeaker = null
      }
      
      console.log(`✅ User ${userId} left PTT channel ${channelId}`)
      
      // Emit leave event
      this.realTimeManager.emit('userLeftPTTChannel', { channel, userId })
      
    } catch (error) {
      console.error('❌ Failed to leave PTT channel:', error)
    }
  }

  // Cleanup
  async destroy() {
    console.log('🛑 Destroying PTT System...')
    
    // Stop any active transmission
    if (this.currentState === this.states.TRANSMITTING) {
      await this.stopTransmission()
    }
    
    // Remove key listeners
    for (const [event, listener] of this.keyListeners) {
      document.removeEventListener(event, listener)
    }
    this.keyListeners.clear()
    
    // Close audio context
    if (this.audioContext) {
      await this.audioContext.close()
    }
    
    // Clear all data
    this.pttChannels.clear()
    this.activeTransmissions.clear()
    
    this.isInitialized = false
    console.log('✅ PTT System destroyed')
  }
}

export default PTTManager
// 🚀 UltraChat v1.2.3.4 Final - Real-Time Moderation Integration
// PRIVACY FIRST - Connect moderation service to chat front-end interactions

import ChatModerationService from './ChatModerationService'
import LocalStorage from '../../utils/LocalStorage'

class RealTimeModerationService {
  constructor() {
    this.storage = new LocalStorage()
    this.moderationService = null
    this.eventListeners = new Map()
    this.activeRooms = new Map()
    this.userSessions = new Map()
    this.messageBuffer = new Map() // Buffer for rate limiting checks
    this.initialized = false
  }

  async initialize() {
    try {
      console.log('🚀 Initializing Real-Time Moderation Integration...')
      
      // Initialize core moderation service
      this.moderationService = new ChatModerationService()
      await this.moderationService.initialize()
      
      // Set up global event listeners for chat interactions
      this.setupEventListeners()
      
      // Load active room moderation data
      await this.loadActiveRooms()
      
      this.initialized = true
      console.log('✅ Real-Time Moderation Integration initialized')
      
    } catch (error) {
      console.error('❌ Failed to initialize Real-Time Moderation:', error)
      throw error
    }
  }

  // ===========================
  // EVENT LISTENER SETUP
  // ===========================

  setupEventListeners() {
    // Message-related events
    window.addEventListener('messageSent', this.handleMessageSent.bind(this))
    window.addEventListener('messageReceived', this.handleMessageReceived.bind(this))
    window.addEventListener('messageEdited', this.handleMessageEdited.bind(this))
    window.addEventListener('messageDeleted', this.handleMessageDeleted.bind(this))
    
    // Room/Group events
    window.addEventListener('roomJoined', this.handleRoomJoined.bind(this))
    window.addEventListener('roomLeft', this.handleRoomLeft.bind(this))
    window.addEventListener('roomCreated', this.handleRoomCreated.bind(this))
    window.addEventListener('participantJoined', this.handleParticipantJoined.bind(this))
    window.addEventListener('participantLeft', this.handleParticipantLeft.bind(this))
    
    // Communication events
    window.addEventListener('voiceCallStarted', this.handleVoiceCallStarted.bind(this))
    window.addEventListener('videoCallStarted', this.handleVideoCallStarted.bind(this))
    window.addEventListener('pttActivated', this.handlePTTActivated.bind(this))
    window.addEventListener('fileShared', this.handleFileShared.bind(this))
    
    // User events
    window.addEventListener('userNickChanged', this.handleNickChanged.bind(this))
    window.addEventListener('userProfileUpdated', this.handleProfileUpdated.bind(this))
    
    console.log('📡 Real-time moderation event listeners established')
  }

  // ===========================
  // MESSAGE MODERATION
  // ===========================

  async handleMessageSent(event) {
    const { message, user, roomId } = event.detail
    
    try {
      console.log('📝 Processing sent message for moderation:', message.content)
      
      // Register user session if not exists
      if (!this.userSessions.has(user.id)) {
        await this.registerUserSession(user, { roomId })
      }
      
      // Check spam detection
      const spamResult = await this.moderationService.checkForSpam(user, message)
      
      if (spamResult.isSpam) {
        console.log('🚨 Spam detected in message:', spamResult)
        
        // Block message from being displayed
        window.dispatchEvent(new CustomEvent('messageBlocked', {
          detail: {
            messageId: message.id,
            reason: 'spam',
            action: spamResult.action,
            user: user
          }
        }))
        
        // Apply moderation action if needed
        if (spamResult.action === 'kick') {
          await this.handleAutoKick(user, roomId, 'Spam detection: repeated messages')
        }
        
        return false // Block message
      }
      
      // Check user permissions
      const canSendMessage = this.moderationService.canUserPerformAction(user, 'send_message')
      if (!canSendMessage) {
        console.log('🚫 User blocked from sending messages:', user.username)
        
        window.dispatchEvent(new CustomEvent('messageBlocked', {
          detail: {
            messageId: message.id,
            reason: 'user_muted',
            user: user
          }
        }))
        
        return false // Block message
      }
      
      // Add to message buffer for rate limiting
      this.addToMessageBuffer(user.id, message)
      
      return true // Allow message
      
    } catch (error) {
      console.error('❌ Failed to process message moderation:', error)
      return true // Allow message on error (fail open)
    }
  }

  async handleMessageReceived(event) {
    const { message, user, roomId } = event.detail
    
    // For received messages, mainly track for pattern analysis
    try {
      if (message.platform && message.platform !== 'ultrachat') {
        console.log(`📨 External message received from ${message.platform}`)
        
        // Register external user session
        if (!this.userSessions.has(user.id)) {
          await this.registerUserSession(user, { 
            roomId, 
            platform: message.platform,
            external: true 
          })
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to process received message:', error)
    }
  }

  // ===========================
  // ROOM/GROUP MODERATION
  // ===========================

  async handleRoomJoined(event) {
    const { room, user, participant } = event.detail
    
    try {
      console.log(`🚪 User ${user.username} joining room ${room.name}`)
      
      // Check if user is banned
      if (this.moderationService.isUserBanned(user.id)) {
        console.log('🚫 Banned user attempted to join room')
        
        // Reject room join
        window.dispatchEvent(new CustomEvent('roomJoinRejected', {
          detail: {
            user: user,
            room: room,
            reason: 'User is banned'
          }
        }))
        
        return false
      }
      
      // Check if user can rejoin after kick
      if (!this.moderationService.canUserRejoin(user.id)) {
        console.log('⏱️ User in cooldown period after kick')
        
        window.dispatchEvent(new CustomEvent('roomJoinRejected', {
          detail: {
            user: user,
            room: room,
            reason: 'Cooldown period active after kick'
          }
        }))
        
        return false
      }
      
      // Register user session for room
      const sessionId = await this.registerUserSession(user, {
        roomId: room.id,
        roomName: room.name,
        joinMethod: participant.joinMethod || 'direct'
      })
      
      // Track room activity
      this.trackRoomActivity(room.id, 'user_joined', { user, sessionId })
      
      // Send welcome message if configured
      await this.sendWelcomeMessage(room, user)
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to process room join:', error)
      return true // Allow join on error (fail open)
    }
  }

  async handleParticipantJoined(event) {
    const { room, participant } = event.detail
    
    try {
      console.log(`👥 Participant ${participant.name} joined room ${room.name}`)
      
      // Update room participant count for moderation tracking
      const roomData = this.activeRooms.get(room.id) || {}
      roomData.participantCount = (roomData.participantCount || 0) + 1
      roomData.lastActivity = new Date().toISOString()
      this.activeRooms.set(room.id, roomData)
      
      // Check for suspicious rapid joining
      await this.checkRapidJoining(room.id, participant)
      
    } catch (error) {
      console.error('❌ Failed to process participant join:', error)
    }
  }

  async handleRoomCreated(event) {
    const { room, creator } = event.detail
    
    try {
      console.log(`🏗️ Room ${room.name} created by ${creator.username}`)
      
      // Initialize room moderation data
      const roomModerationData = {
        id: room.id,
        name: room.name,
        createdBy: creator.id,
        createdAt: new Date().toISOString(),
        participantCount: 1,
        moderators: [creator.id],
        settings: {
          autoModeration: true,
          spamDetection: true,
          rateLimiting: true,
          welcomeMessage: true
        }
      }
      
      this.activeRooms.set(room.id, roomModerationData)
      await this.saveActiveRooms()
      
    } catch (error) {
      console.error('❌ Failed to process room creation:', error)
    }
  }

  // ===========================
  // COMMUNICATION MODERATION
  // ===========================

  async handleVoiceCallStarted(event) {
    const { call, participants } = event.detail
    
    try {
      // Check voice permissions for all participants
      for (const participant of participants) {
        const canUseVoice = this.moderationService.canUserPerformAction(participant, 'use_voice')
        
        if (!canUseVoice) {
          console.log(`🔇 User ${participant.username} blocked from voice call`)
          
          window.dispatchEvent(new CustomEvent('voiceBlocked', {
            detail: {
              user: participant,
              reason: 'Voice permissions denied'
            }
          }))
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to process voice call moderation:', error)
    }
  }

  async handleVideoCallStarted(event) {
    const { call, participants } = event.detail
    
    try {
      // Check video permissions for all participants
      for (const participant of participants) {
        const canUseVideo = this.moderationService.canUserPerformAction(participant, 'use_video')
        
        if (!canUseVideo) {
          console.log(`📹 User ${participant.username} blocked from video call`)
          
          window.dispatchEvent(new CustomEvent('videoBlocked', {
            detail: {
              user: participant,
              reason: 'Video permissions denied'
            }
          }))
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to process video call moderation:', error)
    }
  }

  async handlePTTActivated(event) {
    const { user, room } = event.detail
    
    try {
      const canUsePTT = this.moderationService.canUserPerformAction(user, 'use_voice')
      
      if (!canUsePTT) {
        console.log(`🎙️ User ${user.username} blocked from PTT`)
        
        window.dispatchEvent(new CustomEvent('pttBlocked', {
          detail: {
            user: user,
            reason: 'PTT permissions denied'
          }
        }))
        
        return false
      }
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to process PTT moderation:', error)
      return true
    }
  }

  // ===========================
  // USER MANAGEMENT
  // ===========================

  async handleNickChanged(event) {
    const { user, oldNick, newNick, sessionId } = event.detail
    
    try {
      console.log(`👤 User changed nick from ${oldNick} to ${newNick}`)
      
      // Track nick change for session
      if (sessionId) {
        this.moderationService.trackUserAcrossNickChange(sessionId, newNick)
      }
      
      // Check for suspicious nick changing patterns
      const session = this.moderationService.getUserSession(user.id)
      if (session && session.nickChangeCount > 5) {
        console.log('⚠️ Excessive nick changes detected')
        
        await this.moderationService.warnUser(
          user,
          { id: 'system', username: 'AutoMod' },
          'Excessive nickname changes detected'
        )
      }
      
    } catch (error) {
      console.error('❌ Failed to process nick change:', error)
    }
  }

  // ===========================
  // AUTOMATED ACTIONS
  // ===========================

  async handleAutoKick(user, roomId, reason) {
    try {
      console.log(`👢 Auto-kicking user ${user.username} from room`)
      
      // Apply kick through moderation service
      await this.moderationService.kickUser(
        user,
        { id: 'system', username: 'AutoMod' },
        reason
      )
      
      // Emit room kick event
      window.dispatchEvent(new CustomEvent('userKicked', {
        detail: {
          user: user,
          roomId: roomId,
          reason: reason,
          automatic: true
        }
      }))
      
    } catch (error) {
      console.error('❌ Failed to auto-kick user:', error)
    }
  }

  async sendWelcomeMessage(room, user) {
    try {
      const roomData = this.activeRooms.get(room.id)
      
      if (roomData?.settings?.welcomeMessage) {
        const welcomeMsg = {
          id: `welcome_${Date.now()}`,
          content: `🎉 Welcome to ${room.name}, @${user.username}! Please follow the room rules and enjoy your stay.`,
          sender: { id: 'system', username: 'UltraChat' },
          timestamp: new Date(),
          isSystem: true,
          roomId: room.id
        }
        
        window.dispatchEvent(new CustomEvent('systemMessage', {
          detail: welcomeMsg
        }))
      }
      
    } catch (error) {
      console.error('❌ Failed to send welcome message:', error)
    }
  }

  // ===========================
  // UTILITY METHODS
  // ===========================

  async registerUserSession(user, metadata = {}) {
    if (!this.moderationService) return null
    
    try {
      const sessionId = this.moderationService.registerUserSession(user, {
        ip: metadata.ip || 'localhost',
        deviceFingerprint: metadata.deviceFingerprint || this.generateDeviceFingerprint(),
        roomId: metadata.roomId,
        platform: metadata.platform || 'ultrachat',
        joinMethod: metadata.joinMethod || 'direct'
      })
      
      this.userSessions.set(user.id, sessionId)
      return sessionId
      
    } catch (error) {
      console.error('❌ Failed to register user session:', error)
      return null
    }
  }

  addToMessageBuffer(userId, message) {
    if (!this.messageBuffer.has(userId)) {
      this.messageBuffer.set(userId, [])
    }
    
    const userBuffer = this.messageBuffer.get(userId)
    userBuffer.push({
      content: message.content,
      timestamp: Date.now()
    })
    
    // Keep only last 50 messages per user
    if (userBuffer.length > 50) {
      userBuffer.splice(0, userBuffer.length - 50)
    }
    
    // Clean old messages (older than 1 hour)
    const oneHourAgo = Date.now() - 3600000
    const filteredBuffer = userBuffer.filter(msg => msg.timestamp > oneHourAgo)
    this.messageBuffer.set(userId, filteredBuffer)
  }

  trackRoomActivity(roomId, activity, data = {}) {
    const roomData = this.activeRooms.get(roomId) || {}
    
    if (!roomData.activityLog) {
      roomData.activityLog = []
    }
    
    roomData.activityLog.push({
      activity,
      timestamp: new Date().toISOString(),
      data
    })
    
    // Keep only last 100 activities
    if (roomData.activityLog.length > 100) {
      roomData.activityLog.splice(0, roomData.activityLog.length - 100)
    }
    
    roomData.lastActivity = new Date().toISOString()
    this.activeRooms.set(roomId, roomData)
  }

  async checkRapidJoining(roomId, participant) {
    const roomData = this.activeRooms.get(roomId)
    if (!roomData?.activityLog) return
    
    const fiveMinutesAgo = new Date(Date.now() - 300000).toISOString()
    const recentJoins = roomData.activityLog.filter(
      log => log.activity === 'user_joined' && log.timestamp > fiveMinutesAgo
    )
    
    if (recentJoins.length > 10) {
      console.log('⚠️ Rapid joining detected in room:', roomId)
      
      // Emit warning to room moderators
      window.dispatchEvent(new CustomEvent('rapidJoiningDetected', {
        detail: {
          roomId,
          joinCount: recentJoins.length,
          timeWindow: '5 minutes'
        }
      }))
    }
  }

  generateDeviceFingerprint() {
    return {
      userAgent: navigator.userAgent.substring(0, 100),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`,
      timestamp: Date.now()
    }
  }

  async loadActiveRooms() {
    try {
      const roomData = await this.storage.retrieve('active_rooms', {})
      
      // Convert to Map
      for (const [roomId, data] of Object.entries(roomData)) {
        this.activeRooms.set(roomId, data)
      }
      
      console.log(`📋 Loaded ${this.activeRooms.size} active rooms for moderation`)
      
    } catch (error) {
      console.error('❌ Failed to load active rooms:', error)
    }
  }

  async saveActiveRooms() {
    try {
      // Convert Map to object for storage
      const roomData = {}
      for (const [roomId, data] of this.activeRooms) {
        roomData[roomId] = data
      }
      
      await this.storage.store('active_rooms', roomData)
      
    } catch (error) {
      console.error('❌ Failed to save active rooms:', error)
    }
  }

  // ===========================
  // PUBLIC API
  // ===========================

  // Get moderation status for user
  getUserModerationStatus(userId) {
    if (!this.moderationService) return null
    
    return {
      isBanned: this.moderationService.isUserBanned(userId),
      canSendMessages: this.moderationService.canUserPerformAction({ id: userId }, 'send_message'),
      canSendFiles: this.moderationService.canUserPerformAction({ id: userId }, 'send_file'),
      canUseVoice: this.moderationService.canUserPerformAction({ id: userId }, 'use_voice'),
      canUseVideo: this.moderationService.canUserPerformAction({ id: userId }, 'use_video'),
      session: this.moderationService.getUserSession(userId)
    }
  }

  // Get room moderation stats
  getRoomModerationStats(roomId) {
    const roomData = this.activeRooms.get(roomId)
    if (!roomData) return null
    
    return {
      participantCount: roomData.participantCount || 0,
      moderatorCount: roomData.moderators?.length || 0,
      activityCount: roomData.activityLog?.length || 0,
      lastActivity: roomData.lastActivity,
      settings: roomData.settings
    }
  }

  // Cleanup
  destroy() {
    // Remove event listeners
    window.removeEventListener('messageSent', this.handleMessageSent.bind(this))
    window.removeEventListener('messageReceived', this.handleMessageReceived.bind(this))
    window.removeEventListener('roomJoined', this.handleRoomJoined.bind(this))
    window.removeEventListener('participantJoined', this.handleParticipantJoined.bind(this))
    // ... remove all other listeners
    
    // Clear data
    this.activeRooms.clear()
    this.userSessions.clear()
    this.messageBuffer.clear()
    
    this.initialized = false
    console.log('🛑 Real-Time Moderation Service destroyed')
  }
}

export default RealTimeModerationService
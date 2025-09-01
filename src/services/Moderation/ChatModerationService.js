// 🚀 UltraChat v1.2.3.4 Final - Chat Moderation Service
// PRIVACY FIRST - Comprehensive moderation with session tracking

import LocalStorage from '../../utils/LocalStorage'

// Moderation action types
export const MODERATION_ACTIONS = {
  MUTE: 'mute',
  BLOCK: 'block', 
  BAN: 'ban',
  WARN: 'warn',
  KICK: 'kick',
  UNBAN: 'unban',
  UNMUTE: 'unmute',
  UNBLOCK: 'unblock'
}

// Moderation reasons
export const MODERATION_REASONS = {
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  REPEATED_VIOLATIONS: 'repeated_violations',
  AUTOMATED_DETECTION: 'automated_detection',
  MANUAL_REPORT: 'manual_report'
}

class ChatModerationService {
  constructor() {
    this.storage = new LocalStorage()
    this.sessionTracker = new Map() // sessionId -> user info
    this.messageHistory = new Map() // userId -> recent messages
    this.moderationActions = new Map() // userId -> moderation status
    this.spamDetection = new Map() // userId -> spam tracking
    this.autoModerationEnabled = true
    this.spamThreshold = 10 // 10 same messages triggers action
    this.warnCooldown = 300000 // 5 minutes
    this.initialized = false
  }

  async initialize() {
    try {
      // Load moderation data from storage
      const moderationData = await this.storage.retrieve('moderation_data', {
        actions: [],
        sessions: [],
        spamHistory: []
      })

      // Restore moderation actions
      moderationData.actions.forEach(action => {
        this.moderationActions.set(action.userId, action)
      })

      // Restore session tracking
      moderationData.sessions.forEach(session => {
        this.sessionTracker.set(session.sessionId, session)
      })

      // Restore spam history  
      moderationData.spamHistory.forEach(spam => {
        this.spamDetection.set(spam.userId, spam)
      })

      this.initialized = true
      console.log('✅ ChatModerationService initialized')
    } catch (error) {
      console.error('❌ Failed to initialize ChatModerationService:', error)
      throw error
    }
  }

  // ===========================
  // SESSION TRACKING SYSTEM
  // ===========================

  // Register user session (prevents bypass with nick changes)
  registerUserSession(user, sessionMetadata = {}) {
    const sessionId = this.generateSessionId()
    const session = {
      sessionId,
      userId: user.id,
      username: user.username || user.displayName,
      ipHash: this.hashIP(sessionMetadata.ip || 'unknown'),
      deviceFingerprint: sessionMetadata.deviceFingerprint || this.generateDeviceFingerprint(),
      joinedAt: new Date().toISOString(),
      isActive: true,
      nickChangeCount: 0,
      moderationLevel: this.getModerationLevel(user),
      trustLevel: user.trustLevel || 0
    }

    this.sessionTracker.set(sessionId, session)
    this.saveModerationData()

    console.log(`👤 User session registered: ${user.username} (${sessionId})`)
    return sessionId
  }

  // Track user across nick changes
  trackUserAcrossNickChange(sessionId, newUsername) {
    const session = this.sessionTracker.get(sessionId)
    if (!session) {
      console.warn('⚠️ Session not found for nick change')
      return false
    }

    session.previousUsernames = session.previousUsernames || []
    session.previousUsernames.push(session.username)
    session.username = newUsername
    session.nickChangeCount++
    session.lastNickChange = new Date().toISOString()

    // Excessive nick changes are suspicious
    if (session.nickChangeCount > 5) {
      this.addAutoModerationFlag(session.userId, 'excessive_nick_changes')
    }

    this.saveModerationData()
    return true
  }

  // Get user session by any identifier
  getUserSession(identifier) {
    // Search by sessionId
    if (this.sessionTracker.has(identifier)) {
      return this.sessionTracker.get(identifier)
    }

    // Search by userId or username
    for (const [sessionId, session] of this.sessionTracker) {
      if (session.userId === identifier || 
          session.username === identifier ||
          (session.previousUsernames && session.previousUsernames.includes(identifier))) {
        return session
      }
    }

    return null
  }

  // ===========================
  // CORE MODERATION ACTIONS
  // ===========================

  // Mute user
  async muteUser(targetUser, moderator, reason, duration = 3600000) { // 1 hour default
    return this.applyModerationAction({
      action: MODERATION_ACTIONS.MUTE,
      targetUser,
      moderator,
      reason,
      duration,
      restrictions: {
        canSendMessages: false,
        canSendFiles: false,
        canUseVoice: false,
        canUseVideo: false
      }
    })
  }

  // Block user (bidirectional communication block)
  async blockUser(targetUser, moderator, reason) {
    return this.applyModerationAction({
      action: MODERATION_ACTIONS.BLOCK,
      targetUser,
      moderator,
      reason,
      permanent: true,
      restrictions: {
        canSendMessages: false,
        canReceiveMessages: false,
        canSeeProfile: false,
        canJoinSameRooms: false
      }
    })
  }

  // Ban user (complete removal from chat)
  async banUser(targetUser, moderator, reason, duration = null) {
    const session = this.getUserSession(targetUser.id)
    
    const banResult = await this.applyModerationAction({
      action: MODERATION_ACTIONS.BAN,
      targetUser,
      moderator,
      reason,
      duration,
      permanent: duration === null,
      restrictions: {
        canJoinChat: false,
        canCreateAccount: false,
        canUseAnyFeatures: false
      }
    })

    // Mark session as banned to prevent rejoining
    if (session) {
      session.isBanned = true
      session.banReason = reason
      session.bannedAt = new Date().toISOString()
    }

    return banResult
  }

  // Warn user
  async warnUser(targetUser, moderator, reason) {
    const session = this.getUserSession(targetUser.id)
    const warnings = (session?.warnings || 0) + 1

    if (session) {
      session.warnings = warnings
      session.lastWarning = new Date().toISOString()
    }

    const warnResult = await this.applyModerationAction({
      action: MODERATION_ACTIONS.WARN,
      targetUser,
      moderator,
      reason,
      temporary: true,
      metadata: { warningCount: warnings }
    })

    // Auto-escalate after multiple warnings
    if (warnings >= 3) {
      console.log(`⚠️ User ${targetUser.username} has ${warnings} warnings, auto-kicking`)
      await this.kickUser(targetUser, { id: 'system', username: 'AutoMod' }, 'Multiple warnings received')
    }

    return warnResult
  }

  // Kick user (temporary removal, can rejoin with new nick)
  async kickUser(targetUser, moderator, reason) {
    const session = this.getUserSession(targetUser.id)
    
    const kickResult = await this.applyModerationAction({
      action: MODERATION_ACTIONS.KICK,
      targetUser,
      moderator, 
      reason,
      temporary: true,
      restrictions: {
        mustReconnect: true,
        cooldownPeriod: 300000 // 5 minutes
      }
    })

    // Mark session for kick
    if (session) {
      session.isKicked = true
      session.kickedAt = new Date().toISOString()
      session.kickCooldownUntil = new Date(Date.now() + 300000).toISOString()
    }

    return kickResult
  }

  // ===========================
  // SPAM DETECTION SYSTEM
  // ===========================

  // Check message for spam patterns
  checkForSpam(user, message) {
    const userId = user.id
    const messageContent = message.content.trim().toLowerCase()
    
    // Initialize spam tracking for user
    if (!this.spamDetection.has(userId)) {
      this.spamDetection.set(userId, {
        userId,
        recentMessages: [],
        duplicateCount: 0,
        lastDuplicateMessage: '',
        warningGiven: false,
        violations: []
      })
    }

    const spamData = this.spamDetection.get(userId)
    const now = Date.now()

    // Clean old messages (older than 5 minutes)
    spamData.recentMessages = spamData.recentMessages.filter(
      msg => now - msg.timestamp < 300000
    )

    // Add current message
    spamData.recentMessages.push({
      content: messageContent,
      timestamp: now
    })

    // Check for duplicate messages
    const duplicates = spamData.recentMessages.filter(
      msg => msg.content === messageContent
    )

    if (duplicates.length >= this.spamThreshold) {
      return this.handleSpamDetection(user, messageContent, duplicates.length)
    }

    // Check for rapid posting (> 5 messages in 30 seconds)
    const recentCount = spamData.recentMessages.filter(
      msg => now - msg.timestamp < 30000
    ).length

    if (recentCount > 5) {
      return this.handleRapidPosting(user, recentCount)
    }

    return { isSpam: false, action: null }
  }

  // Handle spam detection
  async handleSpamDetection(user, message, duplicateCount) {
    const spamData = this.spamDetection.get(user.id)
    
    console.log(`🚨 Spam detected: ${user.username} sent "${message}" ${duplicateCount} times`)

    if (duplicateCount >= this.spamThreshold && !spamData.warningGiven) {
      // First time hitting threshold - warn
      spamData.warningGiven = true
      spamData.lastWarning = Date.now()
      
      await this.warnUser(user, 
        { id: 'system', username: 'AutoMod' }, 
        `Spam detected: "${message}" repeated ${duplicateCount} times`
      )

      return { 
        isSpam: true, 
        action: 'warn',
        message: '⚠️ Warning: Please stop repeating the same message. Continued spam will result in removal.'
      }
    } else if (duplicateCount >= this.spamThreshold + 3) {
      // Continued spamming after warning - kick
      await this.kickUser(user,
        { id: 'system', username: 'AutoMod' },
        `Continued spam after warning: "${message}" repeated ${duplicateCount} times`
      )

      return {
        isSpam: true,
        action: 'kick', 
        message: '🚫 You have been removed for spamming. Please rejoin with a new nickname and follow chat rules.'
      }
    }

    return { isSpam: false, action: null }
  }

  // Handle rapid posting
  async handleRapidPosting(user, messageCount) {
    console.log(`⚡ Rapid posting detected: ${user.username} sent ${messageCount} messages in 30 seconds`)
    
    await this.warnUser(user,
      { id: 'system', username: 'AutoMod' },
      `Rapid posting detected: ${messageCount} messages in 30 seconds`
    )

    return {
      isSpam: true,
      action: 'warn',
      message: '⚠️ Warning: Please slow down your messaging. Rapid posting is considered spam.'
    }
  }

  // ===========================
  // MODERATION STATUS CHECKS
  // ===========================

  // Check if user can perform action
  canUserPerformAction(user, action) {
    const modAction = this.moderationActions.get(user.id)
    if (!modAction || !modAction.isActive) return true

    const restrictions = modAction.restrictions || {}
    
    switch (action) {
      case 'send_message':
        return restrictions.canSendMessages !== false
      case 'send_file':
        return restrictions.canSendFiles !== false
      case 'use_voice':
        return restrictions.canUseVoice !== false
      case 'use_video':
        return restrictions.canUseVideo !== false
      case 'join_room':
        return restrictions.canJoinSameRooms !== false
      case 'see_profile':
        return restrictions.canSeeProfile !== false
      default:
        return true
    }
  }

  // Check if user is banned
  isUserBanned(userId) {
    const session = this.getUserSession(userId)
    const modAction = this.moderationActions.get(userId)
    
    if (session?.isBanned) return true
    if (modAction?.action === MODERATION_ACTIONS.BAN && modAction.isActive) return true
    
    return false
  }

  // Check if user can rejoin after kick
  canUserRejoin(userId) {
    const session = this.getUserSession(userId)
    if (!session?.isKicked) return true
    
    const cooldownEnd = new Date(session.kickCooldownUntil).getTime()
    return Date.now() > cooldownEnd
  }

  // ===========================
  // UTILITY METHODS
  // ===========================

  // Apply moderation action
  async applyModerationAction(config) {
    const {
      action,
      targetUser,
      moderator,
      reason,
      duration,
      permanent = false,
      restrictions = {}
    } = config

    const moderationId = this.generateModerationId()
    const now = new Date().toISOString()
    
    const moderationAction = {
      id: moderationId,
      action,
      targetUserId: targetUser.id,
      targetUsername: targetUser.username || targetUser.displayName,
      moderatorId: moderator.id,
      moderatorUsername: moderator.username,
      reason,
      appliedAt: now,
      expiresAt: duration ? new Date(Date.now() + duration).toISOString() : null,
      permanent,
      restrictions,
      isActive: true,
      metadata: config.metadata || {}
    }

    this.moderationActions.set(targetUser.id, moderationAction)
    await this.saveModerationData()

    // Log the action
    console.log(`⚖️ Moderation action applied: ${action} on ${targetUser.username} by ${moderator.username} for: ${reason}`)

    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('moderationActionApplied', {
      detail: moderationAction
    }))

    return moderationAction
  }

  // Remove/undo moderation action
  async removeModerationAction(userId, moderator, reason) {
    const modAction = this.moderationActions.get(userId)
    if (!modAction) return false

    modAction.isActive = false
    modAction.removedAt = new Date().toISOString()
    modAction.removedBy = moderator.id
    modAction.removalReason = reason

    await this.saveModerationData()
    
    console.log(`✅ Moderation action removed: ${modAction.action} on ${modAction.targetUsername} by ${moderator.username}`)
    return true
  }

  // Generate secure IDs
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  generateModerationId() {
    return 'mod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  // Hash IP for privacy
  hashIP(ip) {
    // Simple hash for session tracking without storing actual IPs
    let hash = 0
    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  // Generate device fingerprint
  generateDeviceFingerprint() {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Device fingerprint', 2, 2)
    
    return {
      canvas: canvas.toDataURL().substring(0, 50),
      userAgent: navigator.userAgent.substring(0, 100),
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}x${screen.height}`
    }
  }

  // Get user moderation level
  getModerationLevel(user) {
    if (user.trustLevel >= 80) return 'admin'
    if (user.trustLevel >= 60) return 'moderator'
    if (user.trustLevel >= 40) return 'trusted'
    return 'user'
  }

  // Add auto-moderation flag
  addAutoModerationFlag(userId, flag) {
    const session = this.getUserSession(userId)
    if (session) {
      session.autoModerationFlags = session.autoModerationFlags || []
      session.autoModerationFlags.push({
        flag,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Save moderation data to storage
  async saveModerationData() {
    const data = {
      actions: Array.from(this.moderationActions.values()),
      sessions: Array.from(this.sessionTracker.values()),
      spamHistory: Array.from(this.spamDetection.values())
    }
    
    await this.storage.store('moderation_data', data)
  }

  // Get moderation statistics
  getModerationStats() {
    const activeActions = Array.from(this.moderationActions.values()).filter(a => a.isActive)
    const stats = {
      totalSessions: this.sessionTracker.size,
      activeModerationActions: activeActions.length,
      mutedUsers: activeActions.filter(a => a.action === MODERATION_ACTIONS.MUTE).length,
      blockedUsers: activeActions.filter(a => a.action === MODERATION_ACTIONS.BLOCK).length,
      bannedUsers: activeActions.filter(a => a.action === MODERATION_ACTIONS.BAN).length,
      usersWithWarnings: Array.from(this.sessionTracker.values()).filter(s => s.warnings > 0).length,
      spamDetections: this.spamDetection.size
    }
    
    return stats
  }
}

export default ChatModerationService
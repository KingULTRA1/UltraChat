/*
 * Auto-Reply Manager - UltraChat v1.2.3
 * 
 * Manages automated reply functionality including:
 * - Quick replies with predefined and custom messages
 * - Schedule-based auto-replies (active hours)
 * - Status-based auto-replies (busy, away, etc.)
 * - Missed call auto-responses
 * - Emoji-only quick reactions
 * 
 * Privacy-First: All auto-reply rules stored locally, no external AI
 */

import LocalStorage from '../../utils/LocalStorage'
import * as Constants from '../../utils/Constants';

class AutoReplyManager {
  constructor() {
    this.storage = new LocalStorage()
    this.activeRules = new Map()
    this.cooldowns = new Map()
    this.scheduleCheckInterval = null
    this.currentStatus = 'online' // online, busy, away, dnd
    this.initialized = false
  }

  async initialize() {
    try {
      // Load saved auto-reply settings
      await this.loadSettings()
      
      // Start schedule monitoring
      this.startScheduleMonitoring()
      
      this.initialized = true
      console.log('AutoReplyManager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AutoReplyManager:', error)
    }
  }

  async loadSettings() {
    const settings = await this.storage.retrieve('auto_reply_settings', {
      quickReplies: this.getDefaultQuickReplies(),
      customReplies: [],
      scheduleEnabled: false,
      activeHours: Constants.AUTO_REPLY_RULES.DEFAULT_ACTIVE_HOURS,
      statusReplies: this.getDefaultStatusReplies(),
      emojiReplies: Object.values(Constants.EMOJI_QUICK_REPLIES),
      missedCallReply: Constants.AUTO_REPLY_PRESETS.MISSED_CALL.text,
      enabled: true
    })

    this.settings = settings
    this.updateActiveRules()
  }

  async saveSettings() {
    await this.storage.store('auto_reply_settings', this.settings)
  }

  getDefaultQuickReplies() {
    return [
      Constants.AUTO_REPLY_PRESETS.ON_MY_WAY,
      Constants.AUTO_REPLY_PRESETS.CANT_TALK,
      Constants.AUTO_REPLY_PRESETS.WILL_REPLY
    ]
  }

  getDefaultStatusReplies() {
    return {
      busy: Constants.AUTO_REPLY_PRESETS.BUSY_STATUS.text,
      away: "I'm currently away from my device. I'll respond when I return.",
      dnd: "Do not disturb mode is on. I'll get back to you later."
    }
  }

  updateActiveRules() {
    this.activeRules.clear()
    
    if (!this.settings.enabled) return

    // Status-based rules
    if (this.currentStatus !== 'online') {
      this.activeRules.set('status', {
        type: Constants.AUTO_REPLY_TYPES.STATUS_BASED,
        message: this.settings.statusReplies[this.currentStatus],
        conditions: { status: this.currentStatus }
      })
    }

    // Schedule-based rules
    if (this.settings.scheduleEnabled && !this.isWithinActiveHours()) {
      this.activeRules.set('schedule', {
        type: Constants.AUTO_REPLY_TYPES.SCHEDULE,
        message: Constants.AUTO_REPLY_PRESETS.OUT_OF_HOURS.text,
        conditions: { schedule: true }
      })
    }
  }

  // Check if current time is within active hours
  isWithinActiveHours() {
    const now = new Date()
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                       now.getMinutes().toString().padStart(2, '0')
    
    const { start, end } = this.settings.activeHours
    
    if (start <= end) {
      // Same day (e.g., 09:00 to 18:00)
      return currentTime >= start && currentTime <= end
    } else {
      // Crosses midnight (e.g., 22:00 to 06:00)
      return currentTime >= start || currentTime <= end
    }
  }

  startScheduleMonitoring() {
    if (this.scheduleCheckInterval) {
      clearInterval(this.scheduleCheckInterval)
    }

    this.scheduleCheckInterval = setInterval(() => {
      this.updateActiveRules()
    }, Constants.AUTO_REPLY_RULES.SCHEDULE_CHECK_INTERVAL)
  }

  // Check if auto-reply should be sent for incoming message
  async shouldSendAutoReply(conversationId, messageType = 'message') {
    if (!this.settings.enabled || this.activeRules.size === 0) {
      return null
    }

    // Check cooldown to prevent spam
    const cooldownKey = `${conversationId}_${messageType}`
    const lastReply = this.cooldowns.get(cooldownKey)
    const cooldownMs = Constants.AUTO_REPLY_RULES.COOLDOWN_MINUTES * 60 * 1000
    
    if (lastReply && (Date.now() - lastReply) < cooldownMs) {
      return null
    }

    // Get appropriate auto-reply
    let autoReply = null

    // Handle missed call auto-reply
    if (messageType === 'missed_call') {
      autoReply = {
        text: this.settings.missedCallReply,
        type: Constants.AUTO_REPLY_TYPES.MISSED_CALL,
        isAutoReply: true
      }
    } else {
      // Check active rules in priority order
      if (this.activeRules.has('status')) {
        const rule = this.activeRules.get('status')
        autoReply = {
          text: rule.message,
          type: rule.type,
          isAutoReply: true
        }
      } else if (this.activeRules.has('schedule')) {
        const rule = this.activeRules.get('schedule')
        autoReply = {
          text: rule.message,
          type: rule.type,
          isAutoReply: true
        }
      }
    }

    if (autoReply) {
      // Set cooldown
      this.cooldowns.set(cooldownKey, Date.now())
      
      // Clean up old cooldowns periodically
      this.cleanupCooldowns()
    }

    return autoReply
  }

  cleanupCooldowns() {
    const now = Date.now()
    const cooldownMs = Constants.AUTO_REPLY_RULES.COOLDOWN_MINUTES * 60 * 1000
    
    for (const [key, timestamp] of this.cooldowns.entries()) {
      if (now - timestamp > cooldownMs) {
        this.cooldowns.delete(key)
      }
    }
  }

  // Get quick reply options for UI
  getQuickReplies() {
    return [
      ...this.settings.quickReplies,
      ...this.settings.customReplies.slice(0, Constants.AUTO_REPLY_RULES.MAX_CUSTOM_REPLIES)
    ]
  }

  // Get emoji quick replies
  getEmojiReplies() {
    return this.settings.emojiReplies
  }

  // Add custom quick reply
  async addCustomReply(text, emoji = null) {
    if (this.settings.customReplies.length >= Constants.AUTO_REPLY_RULES.MAX_CUSTOM_REPLIES) {
      throw new Error('Maximum custom replies reached')
    }

    if (text.length > Constants.AUTO_REPLY_RULES.MAX_TEXT_LENGTH) {
      throw new Error('Reply text too long')
    }

    const customReply = {
      id: 'custom_' + Date.now(),
      text: text.trim(),
      emoji: emoji,
      category: 'custom',
      created: new Date().toISOString()
    }

    this.settings.customReplies.push(customReply)
    await this.saveSettings()
    
    return customReply
  }

  // Remove custom quick reply
  async removeCustomReply(replyId) {
    this.settings.customReplies = this.settings.customReplies.filter(
      reply => reply.id !== replyId
    )
    await this.saveSettings()
  }

  // Update user status
  async setStatus(status) {
    this.currentStatus = status
    this.updateActiveRules()
    
    // Save status
    await this.storage.store('user_status', {
      status,
      timestamp: new Date().toISOString()
    })
  }

  // Update active hours
  async setActiveHours(start, end) {
    this.settings.activeHours = { start, end, timezone: 'local' }
    await this.saveSettings()
    this.updateActiveRules()
  }

  // Toggle schedule-based auto-replies
  async setScheduleEnabled(enabled) {
    this.settings.scheduleEnabled = enabled
    await this.saveSettings()
    this.updateActiveRules()
  }

  // Update status-based auto-reply message
  async setStatusReply(status, message) {
    this.settings.statusReplies[status] = message
    await this.saveSettings()
    this.updateActiveRules()
  }

  // Get current settings for UI
  getSettings() {
    return {
      ...this.settings,
      currentStatus: this.currentStatus,
      isWithinActiveHours: this.isWithinActiveHours(),
      activeRulesCount: this.activeRules.size
    }
  }

  // Toggle auto-reply system
  async setEnabled(enabled) {
    this.settings.enabled = enabled
    await this.saveSettings()
    this.updateActiveRules()
  }

  // Cleanup
  destroy() {
    if (this.scheduleCheckInterval) {
      clearInterval(this.scheduleCheckInterval)
    }
    this.cooldowns.clear()
    this.activeRules.clear()
  }
}

export default AutoReplyManager
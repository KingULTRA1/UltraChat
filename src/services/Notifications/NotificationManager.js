// Notification Manager - Privacy-First Notifications
// Handles local notifications without tracking or external services

import LocalStorage from '../../utils/LocalStorage.js'
import { NOTIFICATION_TYPES } from '../../utils/Constants.js'

class NotificationManager {
  constructor() {
    this.storage = new LocalStorage()
    this.initialized = false
    this.notificationQueue = []
    this.settings = {
      enabled: true,
      sounds: true,
      desktop: true,
      privacy: true
    }
  }

  // Initialize notification system
  async initialize() {
    try {
      await this.storage.initialize()
      
      // Load notification settings
      const savedSettings = await this.storage.retrieve('notification_settings', {})
      this.settings = { ...this.settings, ...savedSettings }
      
      // Request notification permissions if desktop notifications enabled
      if (this.settings.desktop && 'Notification' in window) {
        await this.requestNotificationPermission()
      }
      
      this.initialized = true
      return true
    } catch (error) {
      console.error('Notification manager initialization failed:', error)
      return false
    }
  }

  // Request browser notification permission
  async requestNotificationPermission() {
    try {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        return permission === 'granted'
      }
      return Notification.permission === 'granted'
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return false
    }
  }

  // Show notification
  async showNotification(type, title, message, options = {}) {
    if (!this.initialized) await this.initialize()

    try {
      if (!this.settings.enabled) {
        console.log('Notifications disabled')
        return null
      }

      const notification = {
        id: this.generateNotificationId(),
        type,
        title: this.sanitizeTitle(title),
        message: this.sanitizeMessage(message, type),
        timestamp: new Date().toISOString(),
        read: false,
        priority: options.priority || 'normal',
        actions: options.actions || []
      }

      // Store notification locally
      await this.storeNotification(notification)

      // Show desktop notification if enabled
      if (this.settings.desktop && this.canShowDesktopNotification()) {
        await this.showDesktopNotification(notification)
      }

      // Play sound if enabled
      if (this.settings.sounds && options.sound !== false) {
        this.playNotificationSound(type)
      }

      // Add to queue for UI display
      this.notificationQueue.push(notification)

      // Auto-dismiss after timeout
      if (options.timeout !== false) {
        setTimeout(() => {
          this.dismissNotification(notification.id)
        }, options.timeout || 5000)
      }

      return notification
    } catch (error) {
      console.error('Failed to show notification:', error)
      return null
    }
  }

  // Sanitize notification title for privacy
  sanitizeTitle(title) {
    if (!this.settings.privacy) {
      return title
    }

    // In privacy mode, use generic titles
    if (title.toLowerCase().includes('message')) {
      return 'New Message'
    }
    if (title.toLowerCase().includes('endorsement')) {
      return 'New Endorsement'
    }
    return 'UltraChat'
  }

  // Sanitize notification message for privacy
  sanitizeMessage(message, type) {
    if (!this.settings.privacy) {
      return message
    }

    // In privacy mode, hide sensitive content
    switch (type) {
      case NOTIFICATION_TYPES.MESSAGE:
        return 'You have a new message'
      case NOTIFICATION_TYPES.ENDORSEMENT:
        return 'You received an endorsement'
      case NOTIFICATION_TYPES.TRUST_UPDATE:
        return 'Your trust score was updated'
      case NOTIFICATION_TYPES.SECURITY:
        return 'Security notification'
      default:
        return 'You have a new notification'
    }
  }

  // Show desktop notification
  async showDesktopNotification(notification) {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false
      }

      const desktopNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        silent: !this.settings.sounds,
        requireInteraction: notification.priority === 'high'
      })

      // Handle notification click
      desktopNotification.onclick = () => {
        window.focus()
        this.markAsRead(notification.id)
        desktopNotification.close()
      }

      return true
    } catch (error) {
      console.error('Failed to show desktop notification:', error)
      return false
    }
  }

  // Check if desktop notifications can be shown
  canShowDesktopNotification() {
    return 'Notification' in window && 
           Notification.permission === 'granted' && 
           this.settings.desktop
  }

  // Play notification sound
  playNotificationSound(type) {
    try {
      if (!this.settings.sounds) return

      // Create audio context for privacy (no external resources)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Generate simple notification tones
      const frequency = this.getNotificationFrequency(type)
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1)
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }

  // Get notification tone frequency by type
  getNotificationFrequency(type) {
    switch (type) {
      case NOTIFICATION_TYPES.MESSAGE:
        return 440 // A4
      case NOTIFICATION_TYPES.ENDORSEMENT:
        return 523 // C5
      case NOTIFICATION_TYPES.TRUST_UPDATE:
        return 659 // E5
      case NOTIFICATION_TYPES.SECURITY:
        return 349 // F4 (lower, more serious)
      default:
        return 440
    }
  }

  // Store notification locally
  async storeNotification(notification) {
    const notifications = await this.storage.retrieve('notifications', [])
    notifications.push(notification)

    // Keep only last 100 notifications
    if (notifications.length > 100) {
      notifications.splice(0, notifications.length - 100)
    }

    await this.storage.store('notifications', notifications)
  }

  // Get notifications
  async getNotifications(limit = 50, unreadOnly = false) {
    const notifications = await this.storage.retrieve('notifications', [])
    
    let filtered = unreadOnly 
      ? notifications.filter(n => !n.read)
      : notifications

    return filtered.slice(-limit).reverse() // Most recent first
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    const notifications = await this.storage.retrieve('notifications', [])
    const notification = notifications.find(n => n.id === notificationId)
    
    if (notification) {
      notification.read = true
      notification.readAt = new Date().toISOString()
      await this.storage.store('notifications', notifications)
    }

    // Remove from queue
    this.notificationQueue = this.notificationQueue.filter(n => n.id !== notificationId)
  }

  // Mark all notifications as read
  async markAllAsRead() {
    const notifications = await this.storage.retrieve('notifications', [])
    notifications.forEach(notification => {
      if (!notification.read) {
        notification.read = true
        notification.readAt = new Date().toISOString()
      }
    })
    await this.storage.store('notifications', notifications)
    this.notificationQueue = []
  }

  // Dismiss notification from UI queue
  dismissNotification(notificationId) {
    this.notificationQueue = this.notificationQueue.filter(n => n.id !== notificationId)
  }

  // Get queued notifications for UI
  getQueuedNotifications() {
    return [...this.notificationQueue]
  }

  // Update notification settings
  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings }
    await this.storage.store('notification_settings', this.settings)

    // Request permission if desktop notifications were enabled
    if (newSettings.desktop && 'Notification' in window) {
      await this.requestNotificationPermission()
    }
  }

  // Get current settings
  getSettings() {
    return { ...this.settings }
  }

  // Clear all notifications
  async clearAllNotifications() {
    await this.storage.store('notifications', [])
    this.notificationQueue = []
  }

  // Get notification statistics
  async getNotificationStats(days = 7) {
    const notifications = await this.storage.retrieve('notifications', [])
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)

    const recentNotifications = notifications.filter(n => 
      new Date(n.timestamp) > cutoff
    )

    const stats = {
      total: recentNotifications.length,
      unread: recentNotifications.filter(n => !n.read).length,
      byType: {}
    }

    recentNotifications.forEach(notification => {
      const type = notification.type
      if (!stats.byType[type]) {
        stats.byType[type] = { total: 0, unread: 0 }
      }
      stats.byType[type].total++
      if (!notification.read) {
        stats.byType[type].unread++
      }
    })

    return stats
  }

  // Generate notification ID
  generateNotificationId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Helper methods for specific notification types
  async showMessageNotification(senderName, messagePreview, conversationId) {
    return await this.showNotification(
      NOTIFICATION_TYPES.MESSAGE,
      `Message from ${senderName}`,
      messagePreview,
      {
        actions: [
          { action: 'reply', title: 'Reply' },
          { action: 'view', title: 'View Conversation' }
        ],
        data: { conversationId }
      }
    )
  }

  async showEndorsementNotification(endorserName, message) {
    return await this.showNotification(
      NOTIFICATION_TYPES.ENDORSEMENT,
      `Endorsement from ${endorserName}`,
      message,
      { priority: 'high' }
    )
  }

  async showTrustUpdateNotification(newScore, change) {
    const changeText = change > 0 ? `increased by ${change}` : `decreased by ${Math.abs(change)}`
    return await this.showNotification(
      NOTIFICATION_TYPES.TRUST_UPDATE,
      'Trust Score Updated',
      `Your trust score ${changeText} (now ${newScore}%)`,
      { priority: 'normal' }
    )
  }

  async showSecurityNotification(title, message) {
    return await this.showNotification(
      NOTIFICATION_TYPES.SECURITY,
      title,
      message,
      { priority: 'high', timeout: 10000 }
    )
  }
}

export default NotificationManager
// 🚀 UltraChat v1.2.3.4 Final - Spam Detection Wrapper
// PRIVACY FIRST - Real-time spam detection for messages

import { useEffect, useState } from 'react'
import ChatModerationService from '../../services/Moderation/ChatModerationService'

const SpamDetectionWrapper = ({ 
  user, 
  message, 
  onSpamDetected, 
  onMessageBlocked,
  children 
}) => {
  const [moderationService, setModerationService] = useState(null)
  const [isMessageBlocked, setIsMessageBlocked] = useState(false)
  const [spamResult, setSpamResult] = useState(null)

  useEffect(() => {
    initializeModerationService()
  }, [])

  useEffect(() => {
    if (moderationService && user && message) {
      checkForSpam()
    }
  }, [moderationService, user, message])

  const initializeModerationService = async () => {
    try {
      const service = new ChatModerationService()
      await service.initialize()
      setModerationService(service)
    } catch (error) {
      console.error('Failed to initialize spam detection:', error)
    }
  }

  const checkForSpam = async () => {
    if (!moderationService || !user || !message) return

    try {
      // Check if user can send messages
      const canSendMessages = moderationService.canUserPerformAction(user, 'send_message')
      if (!canSendMessages) {
        setIsMessageBlocked(true)
        onMessageBlocked?.({
          reason: 'User is muted or restricted',
          user,
          message
        })
        return
      }

      // Run spam detection
      const result = await moderationService.checkForSpam(user, message)
      setSpamResult(result)

      if (result.isSpam) {
        setIsMessageBlocked(true)
        onSpamDetected?.(result, user, message)
        
        // Show spam notification to user
        showSpamNotification(result)
      }
    } catch (error) {
      console.error('Spam detection failed:', error)
    }
  }

  const showSpamNotification = (result) => {
    if (result.message) {
      // Create and show notification
      const notification = document.createElement('div')
      notification.className = 'spam-notification'
      notification.innerHTML = `
        <div class="spam-notification-content">
          <div class="spam-icon">🚨</div>
          <div class="spam-message">${result.message}</div>
          <div class="spam-action">Action: ${result.action.toUpperCase()}</div>
        </div>
      `
      
      // Style the notification
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10000;
        background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-weight: 600;
        max-width: 400px;
        text-align: center;
        animation: slideDown 0.3s ease-out, fadeOut 0.5s ease-in 4.5s forwards;
      `

      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 5000)
    }
  }

  // If message is blocked, return null or a blocked message indicator
  if (isMessageBlocked) {
    return (
      <div className="blocked-message-indicator">
        <span className="blocked-icon">🚫</span>
        <span className="blocked-text">Message blocked by spam detection</span>
        {spamResult?.action === 'warn' && (
          <span className="blocked-details">Warning issued to user</span>
        )}
        {spamResult?.action === 'kick' && (
          <span className="blocked-details">User removed from chat</span>
        )}
      </div>
    )
  }

  // Otherwise, render the children (original message component)
  return children
}

export default SpamDetectionWrapper
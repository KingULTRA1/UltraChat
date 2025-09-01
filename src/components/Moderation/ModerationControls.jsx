// 🚀 UltraChat v1.2.3.4 Final - Moderation Controls UI
// PRIVACY FIRST - Chat moderation interface

import { useState, useEffect } from 'react'
import ChatModerationService, { MODERATION_ACTIONS, MODERATION_REASONS } from '../../services/Moderation/ChatModerationService'
import './ModerationControls.css'

const ModerationControls = ({ 
  targetUser, 
  currentUser, 
  onModerationAction,
  showQuickActions = true,
  isInline = false 
}) => {
  const [moderationService, setModerationService] = useState(null)
  const [showModerationPanel, setShowModerationPanel] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState(3600000) // 1 hour default
  const [userModerationStatus, setUserModerationStatus] = useState(null)
  const [moderationStats, setModerationStats] = useState(null)

  useEffect(() => {
    initializeModerationService()
  }, [])

  useEffect(() => {
    if (moderationService && targetUser) {
      checkUserModerationStatus()
    }
  }, [moderationService, targetUser])

  const initializeModerationService = async () => {
    try {
      const service = new ChatModerationService()
      await service.initialize()
      setModerationService(service)
      
      // Get moderation stats
      const stats = service.getModerationStats()
      setModerationStats(stats)
    } catch (error) {
      console.error('Failed to initialize moderation service:', error)
    }
  }

  const checkUserModerationStatus = () => {
    if (!moderationService || !targetUser) return
    
    const status = {
      isBanned: moderationService.isUserBanned(targetUser.id),
      canSendMessages: moderationService.canUserPerformAction(targetUser, 'send_message'),
      canSendFiles: moderationService.canUserPerformAction(targetUser, 'send_file'),
      canUseVoice: moderationService.canUserPerformAction(targetUser, 'use_voice'),
      canUseVideo: moderationService.canUserPerformAction(targetUser, 'use_video'),
      session: moderationService.getUserSession(targetUser.id),
      activeModeration: moderationService.moderationActions.get(targetUser.id)
    }
    
    setUserModerationStatus(status)
  }

  const handleModerationAction = async (action) => {
    if (!moderationService || !targetUser) return

    try {
      let result
      const moderationReason = reason || MODERATION_REASONS.MANUAL_REPORT

      switch (action) {
        case MODERATION_ACTIONS.MUTE:
          result = await moderationService.muteUser(targetUser, currentUser, moderationReason, duration)
          break
        case MODERATION_ACTIONS.BLOCK:
          result = await moderationService.blockUser(targetUser, currentUser, moderationReason)
          break
        case MODERATION_ACTIONS.BAN:
          result = await moderationService.banUser(targetUser, currentUser, moderationReason, duration === -1 ? null : duration)
          break
        case MODERATION_ACTIONS.WARN:
          result = await moderationService.warnUser(targetUser, currentUser, moderationReason)
          break
        case MODERATION_ACTIONS.KICK:
          result = await moderationService.kickUser(targetUser, currentUser, moderationReason)
          break
        case MODERATION_ACTIONS.UNMUTE:
        case MODERATION_ACTIONS.UNBLOCK:
        case MODERATION_ACTIONS.UNBAN:
          result = await moderationService.removeModerationAction(targetUser.id, currentUser, reason || 'Moderation removed')
          break
      }

      if (result) {
        // Update UI
        checkUserModerationStatus()
        setShowModerationPanel(false)
        setReason('')
        
        // Notify parent component
        onModerationAction?.(action, targetUser, result)
        
        // Show success message
        showNotification(`${action} applied to ${targetUser.username || targetUser.displayName}`, 'success')
      }
    } catch (error) {
      console.error('Moderation action failed:', error)
      showNotification(`Failed to apply ${action}: ${error.message}`, 'error')
    }
  }

  const showNotification = (message, type) => {
    // Create temporary notification
    const notification = document.createElement('div')
    notification.className = `moderation-notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)
  }

  const getDurationOptions = () => [
    { value: 300000, label: '5 minutes' },
    { value: 1800000, label: '30 minutes' },
    { value: 3600000, label: '1 hour' },
    { value: 21600000, label: '6 hours' },
    { value: 86400000, label: '24 hours' },
    { value: 604800000, label: '7 days' },
    { value: -1, label: 'Permanent' }
  ]

  const getReasonOptions = () => [
    { value: MODERATION_REASONS.SPAM, label: 'Spam' },
    { value: MODERATION_REASONS.HARASSMENT, label: 'Harassment' },
    { value: MODERATION_REASONS.INAPPROPRIATE_CONTENT, label: 'Inappropriate Content' },
    { value: MODERATION_REASONS.REPEATED_VIOLATIONS, label: 'Repeated Violations' },
    { value: MODERATION_REASONS.MANUAL_REPORT, label: 'Manual Report' }
  ]

  if (!targetUser || targetUser.id === currentUser?.id) {
    return null // Don't show moderation controls for self
  }

  // Check if current user has moderation permissions
  const canModerate = currentUser?.trustLevel >= 60 || currentUser?.role === 'moderator' || currentUser?.role === 'admin'
  if (!canModerate) {
    return null
  }

  return (
    <div className={`moderation-controls ${isInline ? 'inline' : 'standalone'}`}>
      {/* Quick Action Buttons */}
      {showQuickActions && (
        <div className="quick-moderation-actions">
          <button
            className="quick-action-btn warn"
            onClick={() => handleModerationAction(MODERATION_ACTIONS.WARN)}
            title="Warn user"
            disabled={!moderationService}
          >
            ⚠️
          </button>
          
          <button
            className="quick-action-btn mute"
            onClick={() => handleModerationAction(MODERATION_ACTIONS.MUTE)}
            title="Mute user (1 hour)"
            disabled={!moderationService || !userModerationStatus?.canSendMessages}
          >
            🔇
          </button>
          
          <button
            className="quick-action-btn kick"
            onClick={() => handleModerationAction(MODERATION_ACTIONS.KICK)}
            title="Kick user"
            disabled={!moderationService}
          >
            👢
          </button>
          
          <button
            className="quick-action-btn more"
            onClick={() => setShowModerationPanel(!showModerationPanel)}
            title="More moderation options"
          >
            ⚖️
          </button>
        </div>
      )}

      {/* User Status Indicators */}
      {userModerationStatus && (
        <div className="user-status-indicators">
          {userModerationStatus.isBanned && (
            <span className="status-indicator banned">🚫 Banned</span>
          )}
          {!userModerationStatus.canSendMessages && !userModerationStatus.isBanned && (
            <span className="status-indicator muted">🔇 Muted</span>
          )}
          {userModerationStatus.session?.warnings > 0 && (
            <span className="status-indicator warnings">
              ⚠️ {userModerationStatus.session.warnings} warning(s)
            </span>
          )}
        </div>
      )}

      {/* Extended Moderation Panel */}
      {showModerationPanel && (
        <div className="moderation-panel">
          <div className="panel-header">
            <h3>Moderate {targetUser.username || targetUser.displayName}</h3>
            <button 
              className="close-btn"
              onClick={() => setShowModerationPanel(false)}
            >
              ×
            </button>
          </div>

          {/* User Information */}
          {userModerationStatus?.session && (
            <div className="user-info">
              <p><strong>Session ID:</strong> {userModerationStatus.session.sessionId}</p>
              <p><strong>Joined:</strong> {new Date(userModerationStatus.session.joinedAt).toLocaleString()}</p>
              <p><strong>Nick Changes:</strong> {userModerationStatus.session.nickChangeCount || 0}</p>
              {userModerationStatus.session.warnings > 0 && (
                <p><strong>Warnings:</strong> {userModerationStatus.session.warnings}</p>
              )}
            </div>
          )}

          {/* Action Selection */}
          <div className="action-selection">
            <label>Action:</label>
            <select 
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
            >
              <option value="">Select action...</option>
              <option value={MODERATION_ACTIONS.WARN}>Warn</option>
              <option value={MODERATION_ACTIONS.MUTE}>Mute</option>
              <option value={MODERATION_ACTIONS.KICK}>Kick</option>
              <option value={MODERATION_ACTIONS.BLOCK}>Block</option>
              <option value={MODERATION_ACTIONS.BAN}>Ban</option>
              {userModerationStatus?.activeModeration && (
                <>
                  <option value={MODERATION_ACTIONS.UNMUTE}>Remove Mute</option>
                  <option value={MODERATION_ACTIONS.UNBLOCK}>Remove Block</option>
                  <option value={MODERATION_ACTIONS.UNBAN}>Remove Ban</option>
                </>
              )}
            </select>
          </div>

          {/* Duration Selection (for temporary actions) */}
          {(selectedAction === MODERATION_ACTIONS.MUTE || selectedAction === MODERATION_ACTIONS.BAN) && (
            <div className="duration-selection">
              <label>Duration:</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              >
                {getDurationOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reason Selection */}
          <div className="reason-selection">
            <label>Reason:</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="">Select reason...</option>
              {getReasonOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Custom reason..."
              value={reason.startsWith('custom:') ? reason.substring(7) : ''}
              onChange={(e) => setReason(`custom:${e.target.value}`)}
              className="custom-reason-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="apply-btn"
              onClick={() => handleModerationAction(selectedAction)}
              disabled={!selectedAction || !reason}
            >
              Apply {selectedAction}
            </button>
            <button
              className="cancel-btn"
              onClick={() => setShowModerationPanel(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Moderation Stats (for moderators) */}
      {moderationStats && currentUser?.trustLevel >= 70 && (
        <div className="moderation-stats">
          <h4>Moderation Overview</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Active Sessions:</span>
              <span className="stat-value">{moderationStats.totalSessions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Active Actions:</span>
              <span className="stat-value">{moderationStats.activeModerationActions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Muted:</span>
              <span className="stat-value">{moderationStats.mutedUsers}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Banned:</span>
              <span className="stat-value">{moderationStats.bannedUsers}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModerationControls
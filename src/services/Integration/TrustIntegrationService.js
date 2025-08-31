/*
 * Trust Integration Service - UltraChat v1.2.3 Alpha
 * 
 * Integrates Web of Trust with message/file management and moderation:
 * - Permission validation based on trust levels
 * - Moderation workflow integration
 * - Trust-based access controls
 * - Dynamic permission updates
 * 
 * Ultra seamless integration of all trust-based features
 */

import LocalStorage from '../../utils/LocalStorage'
import Constants from '../../utils/Constants'

class TrustIntegrationService {
  constructor(trustManager, auditManager, messageManagement, fileManager) {
    this.storage = new LocalStorage()
    this.trustManager = trustManager
    this.auditManager = auditManager
    this.messageManagement = messageManagement
    this.fileManager = fileManager
    this.moderationQueue = new Map()
    this.permissionCache = new Map()
    this.initialized = false
  }

  async initialize() {
    try {
      // Load moderation queue
      const moderationData = await this.storage.retrieve('moderation_queue', [])
      this.moderationQueue = new Map(moderationData.map(item => [item.id, item]))
      
      // Initialize permission cache
      await this.refreshPermissionCache()
      
      this.initialized = true
      console.log('TrustIntegrationService initialized successfully')
    } catch (error) {
      console.error('Failed to initialize TrustIntegrationService:', error)
      throw error
    }
  }

  // Enhanced permission validation with trust integration
  async validateUserPermissions(user, action, target = null, context = {}) {
    try {
      if (!user || !user.id) {
        return { allowed: false, reason: 'User not authenticated' }
      }

      // Get fresh trust score
      const trustScore = await this.trustManager.calculateTrustScore(user.id)
      user.trustLevel = trustScore.score
      user.trustCategory = trustScore.level

      // Update cache
      this.permissionCache.set(user.id, {
        trustLevel: user.trustLevel,
        trustCategory: user.trustCategory,
        lastUpdated: new Date().toISOString()
      })

      const permission = this.evaluatePermission(user, action, target, context)
      
      // Log permission check
      await this.auditManager.logPermissionChange({
        userId: user.id,
        action: action,
        result: permission.allowed,
        trustLevel: user.trustLevel,
        context: context
      }, user, {
        target: target ? target.id : null,
        reason: permission.reason
      })

      return permission
    } catch (error) {
      console.error('Failed to validate user permissions:', error)
      return { allowed: false, reason: 'Permission validation failed' }
    }
  }

  // Core permission evaluation logic
  evaluatePermission(user, action, target, context) {
    const trustLevel = user.trustLevel || 0

    switch (action) {
      case 'delete_message':
        return this.evaluateMessageDeletion(user, target, context)
      
      case 'edit_message':
        return this.evaluateMessageEdit(user, target, context)
      
      case 'delete_file':
        return this.evaluateFileDeletion(user, target, context)
      
      case 'moderate_operation':
        return this.evaluateModeration(user, target, context)
      
      case 'create_tip':
        return this.evaluateTipping(user, target, context)
      
      case 'endorse_user':
        return this.evaluateEndorsement(user, target, context)
      
      case 'access_audit_logs':
        return this.evaluateAuditAccess(user, context)
      
      default:
        return { allowed: false, reason: 'Unknown action type' }
    }
  }

  // Message deletion permission evaluation
  evaluateMessageDeletion(user, message, context) {
    const isOwner = message && message.senderId === user.id
    const trustLevel = user.trustLevel || 0
    const messageAge = message ? Date.now() - new Date(message.timestamp).getTime() : 0

    // Immediate deletion allowed
    if ((isOwner && messageAge < Constants.MESSAGE_MANAGEMENT.IMMEDIATE_DELETE_WINDOW) ||
        trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return { 
        allowed: true, 
        immediate: true, 
        reason: 'High trust level or recent message owner' 
      }
    }

    // Requires approval
    if (isOwner || trustLevel >= Constants.TRUST_LEVELS.MEDIUM) {
      return { 
        allowed: true, 
        immediate: false, 
        requiresApproval: true,
        reason: 'Requires moderator approval' 
      }
    }

    return { allowed: false, reason: 'Insufficient trust level for message deletion' }
  }

  // Message edit permission evaluation
  evaluateMessageEdit(user, message, context) {
    const isOwner = message && message.senderId === user.id
    const trustLevel = user.trustLevel || 0
    const messageAge = message ? Date.now() - new Date(message.timestamp).getTime() : 0

    // Immediate edit allowed
    if ((isOwner && messageAge < Constants.MESSAGE_MANAGEMENT.IMMEDIATE_EDIT_WINDOW) ||
        trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return { 
        allowed: true, 
        immediate: true, 
        reason: 'High trust level or recent message owner' 
      }
    }

    // Requires approval
    if (isOwner || trustLevel >= Constants.TRUST_LEVELS.MEDIUM) {
      return { 
        allowed: true, 
        immediate: false, 
        requiresApproval: true,
        reason: 'Requires moderator approval' 
      }
    }

    return { allowed: false, reason: 'Insufficient trust level for message editing' }
  }

  // File deletion permission evaluation
  evaluateFileDeletion(user, file, context) {
    const isOwner = file && file.uploadedBy === user.id
    const trustLevel = user.trustLevel || 0
    const fileAge = file ? Date.now() - new Date(file.uploadedAt).getTime() : 0

    // Immediate deletion allowed for file owners within 1 hour or high trust users
    if ((isOwner && fileAge < 60 * 60 * 1000) || trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return { 
        allowed: true, 
        immediate: true, 
        reason: 'High trust level or recent file owner' 
      }
    }

    // Requires approval
    if (isOwner || trustLevel >= Constants.TRUST_LEVELS.MEDIUM) {
      return { 
        allowed: true, 
        immediate: false, 
        requiresApproval: true,
        reason: 'Requires moderator approval' 
      }
    }

    return { allowed: false, reason: 'Insufficient trust level for file deletion' }
  }

  // Moderation permission evaluation
  evaluateModeration(user, operation, context) {
    const trustLevel = user.trustLevel || 0

    // Only high trust users can moderate
    if (trustLevel < Constants.TRUST_LEVELS.HIGH) {
      return { allowed: false, reason: 'Insufficient trust level for moderation' }
    }

    // Cannot moderate own operations
    if (operation && operation.requestor && operation.requestor.id === user.id) {
      return { allowed: false, reason: 'Cannot moderate your own operations' }
    }

    return { allowed: true, reason: 'Authorized moderator' }
  }

  // Crypto tipping permission evaluation
  evaluateTipping(user, recipient, context) {
    const trustLevel = user.trustLevel || 0
    const amount = context.amount || 0

    // Basic tipping allowed for all users
    if (trustLevel >= Constants.TRUST_LEVELS.UNKNOWN) {
      // Large tips require higher trust
      if (amount > 100 && trustLevel < Constants.TRUST_LEVELS.MEDIUM) {
        return { 
          allowed: false, 
          reason: 'Large tips require medium trust level or higher' 
        }
      }

      return { allowed: true, reason: 'Tipping authorized' }
    }

    return { allowed: false, reason: 'Tipping not available' }
  }

  // Endorsement permission evaluation
  evaluateEndorsement(user, target, context) {
    const trustLevel = user.trustLevel || 0

    // Cannot endorse yourself
    if (target && target.id === user.id) {
      return { allowed: false, reason: 'Cannot endorse yourself' }
    }

    // Minimum trust level required for endorsements
    if (trustLevel < Constants.TRUST_LEVELS.LOW) {
      return { allowed: false, reason: 'Minimum trust level required for endorsements' }
    }

    return { allowed: true, reason: 'Endorsement authorized' }
  }

  // Audit log access evaluation
  evaluateAuditAccess(user, context) {
    const trustLevel = user.trustLevel || 0

    // Only high trust users can access audit logs
    if (trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return { allowed: true, reason: 'Audit access authorized' }
    }

    // Users can access their own audit entries
    if (context.ownDataOnly) {
      return { allowed: true, restricted: true, reason: 'Personal audit access only' }
    }

    return { allowed: false, reason: 'Insufficient trust level for audit access' }
  }

  // Add operation to moderation queue
  async addToModerationQueue(operation, priority = 'normal') {
    try {
      const moderationItem = {
        id: this.generateModerationId(),
        operationId: operation.id,
        operationType: operation.type,
        requestor: operation.requestor,
        priority: priority,
        addedAt: new Date().toISOString(),
        status: 'pending_review',
        assignedModerator: null,
        urgency: this.calculateUrgency(operation),
        metadata: {
          originalContext: operation,
          trustLevel: operation.requestor.trustLevel,
          estimatedReviewTime: this.estimateReviewTime(operation)
        }
      }

      this.moderationQueue.set(moderationItem.id, moderationItem)
      await this.saveModerationQueue()

      // Notify available moderators
      await this.notifyModerators(moderationItem)

      return moderationItem
    } catch (error) {
      console.error('Failed to add to moderation queue:', error)
      throw error
    }
  }

  // Get moderation queue for a specific moderator
  async getModerationQueue(moderator, filters = {}) {
    try {
      const permission = await this.validateUserPermissions(moderator, 'moderate_operation')
      if (!permission.allowed) {
        return []
      }

      const queue = []
      for (const [id, item] of this.moderationQueue) {
        if (item.status === 'pending_review') {
          // Apply filters
          if (filters.priority && item.priority !== filters.priority) continue
          if (filters.operationType && item.operationType !== filters.operationType) continue
          
          queue.push(item)
        }
      }

      // Sort by priority and urgency
      return queue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 }
        const aPriority = priorityOrder[a.priority] || 2
        const bPriority = priorityOrder[b.priority] || 2
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority
        }
        
        return b.urgency - a.urgency
      })
    } catch (error) {
      console.error('Failed to get moderation queue:', error)
      return []
    }
  }

  // Process moderation decision
  async processModerationDecision(moderationId, moderator, decision, reason = '') {
    try {
      const item = this.moderationQueue.get(moderationId)
      if (!item) {
        throw new Error('Moderation item not found')
      }

      const permission = await this.validateUserPermissions(moderator, 'moderate_operation', item)
      if (!permission.allowed) {
        throw new Error('Insufficient permissions for moderation')
      }

      // Update moderation item
      item.status = decision === 'approve' ? 'approved' : 'rejected'
      item.moderatedBy = moderator.id
      item.moderatedAt = new Date().toISOString()
      item.moderationReason = reason

      // Process the actual operation based on decision
      let result
      if (decision === 'approve') {
        result = await this.executeApprovedOperation(item)
      } else {
        result = await this.rejectOperation(item, reason)
      }

      // Remove from queue
      this.moderationQueue.delete(moderationId)
      await this.saveModerationQueue()

      // Log moderation decision
      await this.auditManager.logTrustAction('moderation_decision', {
        operationId: item.operationId,
        operationType: item.operationType,
        decision: decision,
        moderatorTrustLevel: moderator.trustLevel
      }, moderator, {
        reason: reason,
        moderationId: moderationId
      })

      return result
    } catch (error) {
      console.error('Failed to process moderation decision:', error)
      throw error
    }
  }

  // Execute approved operation
  async executeApprovedOperation(moderationItem) {
    const operation = moderationItem.metadata.originalContext

    switch (moderationItem.operationType) {
      case 'delete':
        if (operation.messageId) {
          return await this.messageManagement.executeMessageDeletion(
            operation.messageId, 
            operation.requestor, 
            operation.reason, 
            false, 
            { id: moderationItem.moderatedBy }
          )
        } else if (operation.fileId) {
          return await this.fileManager.executeFileDeletion(
            operation.fileId, 
            operation.requestor, 
            operation.reason, 
            false, 
            { id: moderationItem.moderatedBy }
          )
        }
        break
      
      case 'edit':
        return await this.messageManagement.executeMessageEdit(
          operation.messageId, 
          operation.newContent, 
          operation.requestor, 
          operation.reason, 
          false, 
          { id: moderationItem.moderatedBy }
        )
      
      default:
        throw new Error('Unknown operation type for execution')
    }
  }

  // Reject operation
  async rejectOperation(moderationItem, reason) {
    // The operation remains in pending state but is marked as rejected
    // The user will be notified of the rejection
    return {
      success: true,
      status: 'rejected',
      message: 'Operation rejected by moderator',
      reason: reason
    }
  }

  // Calculate operation urgency
  calculateUrgency(operation) {
    let urgency = 50 // Base urgency

    // Trust level of requestor affects urgency
    const trustLevel = operation.requestor.trustLevel || 0
    if (trustLevel >= Constants.TRUST_LEVELS.HIGH) urgency += 20
    else if (trustLevel >= Constants.TRUST_LEVELS.MEDIUM) urgency += 10

    // Operation type affects urgency
    if (operation.type === 'delete' && operation.reason?.includes('spam')) urgency += 30
    if (operation.type === 'edit' && operation.reason?.includes('correction')) urgency += 10

    return Math.min(urgency, 100)
  }

  // Estimate review time
  estimateReviewTime(operation) {
    const baseTime = 15 // minutes

    // Complex operations take longer
    if (operation.type === 'edit') return baseTime + 5
    if (operation.reason && operation.reason.length > 100) return baseTime + 10

    return baseTime
  }

  // Notify available moderators
  async notifyModerators(moderationItem) {
    // This would integrate with the notification system
    console.log(`New moderation item: ${moderationItem.operationType} operation requires review`)
  }

  // Trust level management
  async updateUserTrustLevel(userId, reason = 'periodic_update') {
    try {
      const trustScore = await this.trustManager.calculateTrustScore(userId)
      
      // Update cache
      this.permissionCache.set(userId, {
        trustLevel: trustScore.score,
        trustCategory: trustScore.level,
        lastUpdated: new Date().toISOString()
      })

      return trustScore
    } catch (error) {
      console.error('Failed to update user trust level:', error)
      return null
    }
  }

  // Refresh permission cache
  async refreshPermissionCache() {
    // This would typically load active users and update their trust levels
    console.log('Permission cache refreshed')
  }

  // Utility methods
  generateModerationId() {
    return 'mod_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  async saveModerationQueue() {
    const queueArray = Array.from(this.moderationQueue.values())
    await this.storage.store('moderation_queue', queueArray)
  }

  // Get trust integration statistics
  async getTrustIntegrationStats() {
    const stats = {
      totalModerationItems: this.moderationQueue.size,
      pendingReviews: 0,
      averageReviewTime: 0,
      trustDistribution: {
        unknown: 0,
        low: 0,
        medium: 0,
        high: 0,
        verified: 0,
        maximum: 0
      }
    }

    // Calculate pending reviews
    for (const item of this.moderationQueue.values()) {
      if (item.status === 'pending_review') {
        stats.pendingReviews++
      }
    }

    return stats
  }

  destroy() {
    this.moderationQueue.clear()
    this.permissionCache.clear()
    this.initialized = false
  }
}

export default TrustIntegrationService
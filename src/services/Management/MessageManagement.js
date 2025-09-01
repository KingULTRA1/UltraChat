/*
 * Message Management Service - UltraChat v1.2.3.4 Final
 * 
 * Handles message operations with secure encryption and local storage
 * 
 * Privacy-First: All messages encrypted and stored locally
 * Zero-Tracking: No analytics or external data transmission
 */

import LocalStorage from '../../utils/LocalStorage'
import * as Constants from '../../utils/Constants';

class MessageManagement {
  constructor(auditManager, trustManager) {
    this.storage = new LocalStorage()
    this.auditManager = auditManager
    this.trustManager = trustManager
    this.pendingOperations = new Map()
    this.initialized = false
  }

  async initialize() {
    try {
      // Load pending operations
      const pending = await this.storage.retrieve('pending_message_operations', [])
      this.pendingOperations = new Map(pending.map(op => [op.id, op]))
      
      this.initialized = true
      console.log('MessageManagement initialized successfully')
    } catch (error) {
      console.error('Failed to initialize MessageManagement:', error)
      throw error
    }
  }

  // Request message deletion (requires approval for trusted users)
  async requestMessageDeletion(messageId, requestor, reason = '') {
    try {
      const message = await this.getMessage(messageId)
      if (!message) {
        throw new Error('Message not found')
      }

      // Check permissions
      const canDelete = await this.canDeleteMessage(message, requestor)
      
      if (canDelete.immediate) {
        // User can delete immediately (own message, high trust level)
        return await this.executeMessageDeletion(messageId, requestor, reason, true)
      } else if (canDelete.requiresApproval) {
        // Create pending deletion request
        const operationId = this.generateOperationId()
        const operation = {
          id: operationId,
          type: 'delete',
          messageId: messageId,
          requestor: {
            id: requestor.id,
            name: requestor.name,
            trustLevel: requestor.trustLevel
          },
          reason: reason,
          status: 'pending_approval',
          requestedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + Constants.MESSAGE_MANAGEMENT.APPROVAL_TIMEOUT).toISOString(),
          approvals: [],
          rejections: []
        }

        this.pendingOperations.set(operationId, operation)
        await this.savePendingOperations()

        // Log the deletion request
        await this.auditManager.logMessageAction('delete_requested', message, requestor, {
          reason: reason,
          operationId: operationId,
          requiresApproval: true
        })

        return {
          success: true,
          operationId: operationId,
          status: 'pending_approval',
          message: 'Deletion request submitted for moderator approval'
        }
      } else {
        throw new Error('Insufficient permissions to delete this message')
      }
    } catch (error) {
      console.error('Failed to request message deletion:', error)
      throw error
    }
  }

  // Request message edit (requires approval)
  async requestMessageEdit(messageId, newContent, requestor, reason = '') {
    try {
      const message = await this.getMessage(messageId)
      if (!message) {
        throw new Error('Message not found')
      }

      // Check permissions
      const canEdit = await this.canEditMessage(message, requestor)
      
      if (canEdit.immediate) {
        // User can edit immediately (recent own message)
        return await this.executeMessageEdit(messageId, newContent, requestor, reason, true)
      } else if (canEdit.requiresApproval) {
        // Create pending edit request
        const operationId = this.generateOperationId()
        const operation = {
          id: operationId,
          type: 'edit',
          messageId: messageId,
          originalContent: message.content,
          newContent: newContent,
          requestor: {
            id: requestor.id,
            name: requestor.name,
            trustLevel: requestor.trustLevel
          },
          reason: reason,
          status: 'pending_approval',
          requestedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + Constants.MESSAGE_MANAGEMENT.APPROVAL_TIMEOUT).toISOString(),
          approvals: [],
          rejections: []
        }

        this.pendingOperations.set(operationId, operation)
        await this.savePendingOperations()

        // Log the edit request
        await this.auditManager.logMessageAction('edit_requested', message, requestor, {
          reason: reason,
          operationId: operationId,
          newContent: newContent,
          requiresApproval: true
        })

        return {
          success: true,
          operationId: operationId,
          status: 'pending_approval',
          message: 'Edit request submitted for moderator approval'
        }
      } else {
        throw new Error('Insufficient permissions to edit this message')
      }
    } catch (error) {
      console.error('Failed to request message edit:', error)
      throw error
    }
  }

  // Approve/reject pending operation
  async reviewPendingOperation(operationId, moderator, action, reviewReason = '') {
    try {
      const operation = this.pendingOperations.get(operationId)
      if (!operation) {
        throw new Error('Pending operation not found')
      }

      // Check moderator permissions
      if (!await this.canModerateOperation(operation, moderator)) {
        throw new Error('Insufficient permissions to moderate this operation')
      }

      // Check if operation has expired
      if (new Date() > new Date(operation.expiresAt)) {
        operation.status = 'expired'
        await this.savePendingOperations()
        throw new Error('Operation has expired')
      }

      const review = {
        moderatorId: moderator.id,
        moderatorName: moderator.name,
        action: action, // 'approve' or 'reject'
        reason: reviewReason,
        reviewedAt: new Date().toISOString()
      }

      if (action === 'approve') {
        operation.approvals.push(review)
        
        // Check if enough approvals
        const requiredApprovals = this.getRequiredApprovals(operation)
        if (operation.approvals.length >= requiredApprovals) {
          // Execute the operation
          if (operation.type === 'delete') {
            await this.executeMessageDeletion(operation.messageId, operation.requestor, operation.reason, false, moderator)
          } else if (operation.type === 'edit') {
            await this.executeMessageEdit(operation.messageId, operation.newContent, operation.requestor, operation.reason, false, moderator)
          }
          
          operation.status = 'approved'
          this.pendingOperations.delete(operationId)
        }
      } else {
        operation.rejections.push(review)
        operation.status = 'rejected'
        this.pendingOperations.delete(operationId)
      }

      await this.savePendingOperations()

      return {
        success: true,
        status: operation.status,
        operation: operation
      }
    } catch (error) {
      console.error('Failed to review pending operation:', error)
      throw error
    }
  }

  // Execute message deletion
  async executeMessageDeletion(messageId, requestor, reason, immediate = false, approver = null) {
    try {
      const message = await this.getMessage(messageId)
      if (!message) {
        throw new Error('Message not found')
      }

      // Archive the message before deletion
      await this.archiveMessage(message, 'deleted')
      
      // Mark message as deleted (don't actually remove for audit purposes)
      const updatedMessage = {
        ...message,
        deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: requestor.id,
        deleteReason: reason,
        deleteApprovedBy: approver ? approver.id : null
      }

      await this.updateMessage(messageId, updatedMessage)

      // Log the deletion
      await this.auditManager.logMessageAction('delete', message, requestor, {
        reason: reason,
        immediate: immediate,
        approvedBy: approver ? approver.id : null
      })

      return {
        success: true,
        message: 'Message deleted successfully'
      }
    } catch (error) {
      console.error('Failed to execute message deletion:', error)
      throw error
    }
  }

  // Execute message edit
  async executeMessageEdit(messageId, newContent, requestor, reason, immediate = false, approver = null) {
    try {
      const message = await this.getMessage(messageId)
      if (!message) {
        throw new Error('Message not found')
      }

      // Archive original message
      await this.archiveMessage(message, 'edited')

      // Update message with new content
      const updatedMessage = {
        ...message,
        content: newContent,
        edited: true,
        editedAt: new Date().toISOString(),
        editedBy: requestor.id,
        editReason: reason,
        editApprovedBy: approver ? approver.id : null,
        originalContent: message.content,
        editHistory: [
          ...(message.editHistory || []),
          {
            content: message.content,
            editedAt: new Date().toISOString(),
            editedBy: requestor.id,
            reason: reason
          }
        ]
      }

      await this.updateMessage(messageId, updatedMessage)

      // Log the edit
      await this.auditManager.logMessageAction('edit', updatedMessage, requestor, {
        reason: reason,
        immediate: immediate,
        approvedBy: approver ? approver.id : null,
        originalContent: message.content
      })

      return {
        success: true,
        message: 'Message edited successfully',
        updatedMessage: updatedMessage
      }
    } catch (error) {
      console.error('Failed to execute message edit:', error)
      throw error
    }
  }

  // Archive message for recovery
  async archiveMessage(message, archiveReason) {
    const archiveEntry = {
      id: this.generateOperationId(),
      originalMessageId: message.id,
      archivedAt: new Date().toISOString(),
      reason: archiveReason,
      messageData: { ...message }
    }

    const archives = await this.storage.retrieve('message_archives', [])
    archives.push(archiveEntry)
    
    // Keep only last 1000 archives to prevent storage bloat
    if (archives.length > 1000) {
      archives.splice(0, archives.length - 1000)
    }
    
    await this.storage.store('message_archives', archives)
    
    return archiveEntry.id
  }

  // Recover archived message
  async recoverMessage(archiveId, moderator) {
    try {
      const archives = await this.storage.retrieve('message_archives', [])
      const archive = archives.find(a => a.id === archiveId)
      
      if (!archive) {
        throw new Error('Archive not found')
      }

      // Check moderator permissions
      if (moderator.trustLevel < Constants.TRUST_LEVELS.HIGH) {
        throw new Error('Insufficient permissions to recover messages')
      }

      // Restore the message
      const restoredMessage = {
        ...archive.messageData,
        restored: true,
        restoredAt: new Date().toISOString(),
        restoredBy: moderator.id,
        deleted: false
      }

      await this.updateMessage(archive.originalMessageId, restoredMessage)

      // Log the recovery
      await this.auditManager.logMessageAction('recover', restoredMessage, moderator, {
        archiveId: archiveId,
        originalReason: archive.reason
      })

      return {
        success: true,
        message: 'Message recovered successfully',
        restoredMessage: restoredMessage
      }
    } catch (error) {
      console.error('Failed to recover message:', error)
      throw error
    }
  }

  // Permission checking methods
  async canDeleteMessage(message, user) {
    const isOwner = message.senderId === user.id
    const trustLevel = user.trustLevel || 0
    const messageAge = Date.now() - new Date(message.timestamp).getTime()

    // Immediate deletion allowed for:
    // - Own messages within 5 minutes
    // - Moderators (high trust level)
    if ((isOwner && messageAge < Constants.MESSAGE_MANAGEMENT.IMMEDIATE_DELETE_WINDOW) ||
        trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return { immediate: true, requiresApproval: false }
    }

    // Requires approval for:
    // - Own messages older than 5 minutes
    // - Users with medium trust level
    if (isOwner || trustLevel >= Constants.TRUST_LEVELS.MEDIUM) {
      return { immediate: false, requiresApproval: true }
    }

    // No permission
    return { immediate: false, requiresApproval: false }
  }

  async canEditMessage(message, user) {
    const isOwner = message.senderId === user.id
    const trustLevel = user.trustLevel || 0
    const messageAge = Date.now() - new Date(message.timestamp).getTime()

    // Immediate edit allowed for:
    // - Own messages within 15 minutes
    // - Moderators
    if ((isOwner && messageAge < Constants.MESSAGE_MANAGEMENT.IMMEDIATE_EDIT_WINDOW) ||
        trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return { immediate: true, requiresApproval: false }
    }

    // Requires approval for:
    // - Own messages older than 15 minutes
    // - Users with medium trust level
    if (isOwner || trustLevel >= Constants.TRUST_LEVELS.MEDIUM) {
      return { immediate: false, requiresApproval: true }
    }

    // No permission
    return { immediate: false, requiresApproval: false }
  }

  async canModerateOperation(operation, moderator) {
    return moderator.trustLevel >= Constants.TRUST_LEVELS.HIGH &&
           moderator.id !== operation.requestor.id
  }

  // Get pending operations for moderator review
  async getPendingOperations(moderator) {
    if (!await this.canModerateOperation({ requestor: { id: 'dummy' } }, moderator)) {
      return []
    }

    const now = new Date()
    const pending = []

    for (const [id, operation] of this.pendingOperations) {
      if (operation.status === 'pending_approval' && new Date(operation.expiresAt) > now) {
        pending.push(operation)
      }
    }

    return pending.sort((a, b) => new Date(a.requestedAt) - new Date(b.requestedAt))
  }

  // Get user's pending operations
  async getUserPendingOperations(userId) {
    const pending = []

    for (const [id, operation] of this.pendingOperations) {
      if (operation.requestor.id === userId && operation.status === 'pending_approval') {
        pending.push(operation)
      }
    }

    return pending
  }

  // Helper methods
  generateOperationId() {
    return 'op_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  getRequiredApprovals(operation) {
    // More sensitive operations require more approvals
    if (operation.type === 'delete') {
      return 1 // Single moderator approval for deletion
    } else if (operation.type === 'edit') {
      return 1 // Single moderator approval for edit
    }
    return 1
  }

  async savePendingOperations() {
    const operationsArray = Array.from(this.pendingOperations.entries())
    await this.storage.store('pending_message_operations', operationsArray.map(([id, op]) => op))
  }

  async getMessage(messageId) {
    // This would integrate with the existing message storage system
    const conversations = await this.storage.retrieve('conversations', [])
    
    for (const conversation of conversations) {
      const messages = await this.storage.retrieve(`messages_${conversation.id}`, [])
      const message = messages.find(m => m.id === messageId)
      if (message) {
        return { ...message, conversationId: conversation.id }
      }
    }
    
    return null
  }

  async updateMessage(messageId, updatedMessage) {
    const conversations = await this.storage.retrieve('conversations', [])
    
    for (const conversation of conversations) {
      const messages = await this.storage.retrieve(`messages_${conversation.id}`, [])
      const messageIndex = messages.findIndex(m => m.id === messageId)
      
      if (messageIndex !== -1) {
        messages[messageIndex] = updatedMessage
        await this.storage.store(`messages_${conversation.id}`, messages)
        return true
      }
    }
    
    return false
  }

  // Cleanup expired operations
  async cleanupExpiredOperations() {
    const now = new Date()
    let cleaned = 0

    for (const [id, operation] of this.pendingOperations) {
      if (new Date(operation.expiresAt) <= now && operation.status === 'pending_approval') {
        operation.status = 'expired'
        this.pendingOperations.delete(id)
        cleaned++
      }
    }

    if (cleaned > 0) {
      await this.savePendingOperations()
    }

    return cleaned
  }

  destroy() {
    this.pendingOperations.clear()
    this.initialized = false
  }
}

export default MessageManagement
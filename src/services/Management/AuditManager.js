/*
 * Audit Manager - UltraChat v1.2.3 Alpha
 * 
 * Manages secure audit trails for:
 * - Message deletions and edits
 * - File deletions and modifications
 * - Crypto tipping transactions
 * - Trust level changes and moderation actions
 * - Permission changes and administrative actions
 * 
 * Privacy-First: All audit logs stored locally with encryption
 */

import LocalStorage from '../../utils/LocalStorage'
import CryptoUtils from '../../utils/CryptoUtils'
import Constants from '../../utils/Constants'

class AuditManager {
  constructor() {
    this.storage = new LocalStorage()
    this.crypto = new CryptoUtils()
    this.auditKey = null
    this.initialized = false
  }

  async initialize() {
    try {
      // Initialize or load audit encryption key
      await this.initializeAuditKey()
      
      // Verify audit log integrity
      await this.verifyAuditIntegrity()
      
      this.initialized = true
      console.log('AuditManager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize AuditManager:', error)
      throw error
    }
  }

  async initializeAuditKey() {
    let auditKey = await this.storage.retrieve('audit_encryption_key')
    
    if (!auditKey) {
      // Generate new audit encryption key
      auditKey = await this.crypto.generateSymmetricKey()
      await this.storage.store('audit_encryption_key', auditKey)
    }
    
    this.auditKey = auditKey
  }

  async verifyAuditIntegrity() {
    const auditLogs = await this.getAuditLogs()
    
    // Verify integrity of existing logs
    for (const log of auditLogs) {
      if (!this.verifyLogSignature(log)) {
        console.warn('Audit log integrity compromised:', log.id)
      }
    }
  }

  // Log message actions
  async logMessageAction(action, messageData, actor, metadata = {}) {
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      type: 'message_action',
      action: action, // 'delete', 'edit', 'send', 'receive'
      actor: {
        id: actor.id,
        name: actor.name,
        trustLevel: actor.trustLevel,
        profileMode: actor.profileMode
      },
      target: {
        messageId: messageData.id,
        conversationId: messageData.conversationId,
        originalSender: messageData.senderId,
        contentHash: await this.hashContent(messageData.content)
      },
      metadata: {
        ...metadata,
        reason: metadata.reason || null,
        approvedBy: metadata.approvedBy || null,
        originalContent: action === 'edit' ? messageData.originalContent : null
      },
      signature: null
    }

    // Sign the audit entry
    auditEntry.signature = await this.signAuditEntry(auditEntry)
    
    // Store encrypted audit log
    await this.storeAuditEntry(auditEntry)
    
    return auditEntry.id
  }

  // Log file actions
  async logFileAction(action, fileData, actor, metadata = {}) {
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      type: 'file_action',
      action: action, // 'delete', 'upload', 'download', 'modify'
      actor: {
        id: actor.id,
        name: actor.name,
        trustLevel: actor.trustLevel,
        profileMode: actor.profileMode
      },
      target: {
        fileId: fileData.id,
        filename: fileData.name,
        fileType: fileData.type,
        fileSize: fileData.size,
        fileHash: await this.hashContent(fileData.content || fileData.path),
        conversationId: fileData.conversationId
      },
      metadata: {
        ...metadata,
        reason: metadata.reason || null,
        approvedBy: metadata.approvedBy || null,
        backupLocation: metadata.backupLocation || null
      },
      signature: null
    }

    auditEntry.signature = await this.signAuditEntry(auditEntry)
    await this.storeAuditEntry(auditEntry)
    
    return auditEntry.id
  }

  // Log crypto tipping transactions
  async logCryptoTransaction(transactionData, actor, metadata = {}) {
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      type: 'crypto_transaction',
      action: 'tip_sent',
      actor: {
        id: actor.id,
        name: actor.name,
        profileMode: actor.profileMode
      },
      target: {
        transactionId: transactionData.id,
        recipientId: transactionData.recipientId,
        currency: transactionData.currency,
        amount: transactionData.amount,
        messageId: transactionData.messageId,
        transactionHash: transactionData.hash
      },
      metadata: {
        ...metadata,
        walletAddress: transactionData.walletAddress,
        networkFee: transactionData.networkFee,
        exchangeRate: transactionData.exchangeRate
      },
      signature: null
    }

    auditEntry.signature = await this.signAuditEntry(auditEntry)
    await this.storeAuditEntry(auditEntry)
    
    return auditEntry.id
  }

  // Log trust system actions
  async logTrustAction(action, trustData, actor, metadata = {}) {
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      type: 'trust_action',
      action: action, // 'endorsement', 'rating_change', 'verification', 'moderation'
      actor: {
        id: actor.id,
        name: actor.name,
        trustLevel: actor.trustLevel,
        profileMode: actor.profileMode
      },
      target: {
        targetUserId: trustData.targetUserId,
        previousTrustLevel: trustData.previousTrustLevel,
        newTrustLevel: trustData.newTrustLevel,
        endorsementType: trustData.endorsementType,
        verificationMethod: trustData.verificationMethod
      },
      metadata: {
        ...metadata,
        reason: metadata.reason || null,
        evidence: metadata.evidence || null,
        moderatorApproval: metadata.moderatorApproval || null
      },
      signature: null
    }

    auditEntry.signature = await this.signAuditEntry(auditEntry)
    await this.storeAuditEntry(auditEntry)
    
    return auditEntry.id
  }

  // Log permission changes
  async logPermissionChange(permissionData, actor, metadata = {}) {
    const auditEntry = {
      id: this.generateAuditId(),
      timestamp: new Date().toISOString(),
      type: 'permission_change',
      action: 'permission_modified',
      actor: {
        id: actor.id,
        name: actor.name,
        trustLevel: actor.trustLevel,
        profileMode: actor.profileMode
      },
      target: {
        targetUserId: permissionData.targetUserId,
        permissionType: permissionData.type,
        previousValue: permissionData.previousValue,
        newValue: permissionData.newValue,
        scope: permissionData.scope
      },
      metadata: {
        ...metadata,
        reason: metadata.reason || null,
        expiresAt: metadata.expiresAt || null
      },
      signature: null
    }

    auditEntry.signature = await this.signAuditEntry(auditEntry)
    await this.storeAuditEntry(auditEntry)
    
    return auditEntry.id
  }

  // Get audit logs with filtering
  async getAuditLogs(filters = {}) {
    try {
      const encryptedLogs = await this.storage.retrieve('audit_logs', [])
      const decryptedLogs = []

      for (const encryptedLog of encryptedLogs) {
        try {
          const decryptedLog = await this.decryptAuditEntry(encryptedLog)
          
          // Apply filters
          if (this.matchesFilters(decryptedLog, filters)) {
            decryptedLogs.push(decryptedLog)
          }
        } catch (error) {
          console.warn('Failed to decrypt audit log:', error)
        }
      }

      return decryptedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error)
      return []
    }
  }

  // Get specific audit entry
  async getAuditEntry(auditId) {
    const logs = await this.getAuditLogs()
    return logs.find(log => log.id === auditId)
  }

  // Search audit logs
  async searchAuditLogs(searchTerm, filters = {}) {
    const logs = await this.getAuditLogs(filters)
    
    return logs.filter(log => 
      JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  // Generate audit report
  async generateAuditReport(dateRange, filters = {}) {
    const logs = await this.getAuditLogs({
      ...filters,
      startDate: dateRange.start,
      endDate: dateRange.end
    })

    const report = {
      generatedAt: new Date().toISOString(),
      period: dateRange,
      totalEntries: logs.length,
      summary: {
        messageActions: logs.filter(l => l.type === 'message_action').length,
        fileActions: logs.filter(l => l.type === 'file_action').length,
        cryptoTransactions: logs.filter(l => l.type === 'crypto_transaction').length,
        trustActions: logs.filter(l => l.type === 'trust_action').length,
        permissionChanges: logs.filter(l => l.type === 'permission_change').length
      },
      entries: logs
    }

    return report
  }

  // Helper methods
  generateAuditId() {
    return 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  async hashContent(content) {
    if (!content) return null
    return await this.crypto.hash(JSON.stringify(content))
  }

  async signAuditEntry(entry) {
    // Create signature without the signature field
    const { signature, ...entryToSign } = entry
    const entryString = JSON.stringify(entryToSign, Object.keys(entryToSign).sort())
    return await this.crypto.sign(entryString)
  }

  verifyLogSignature(entry) {
    // Implement signature verification
    // This would use public key cryptography in a full implementation
    return entry.signature && entry.signature.length > 0
  }

  async storeAuditEntry(entry) {
    const encryptedEntry = await this.encryptAuditEntry(entry)
    const existingLogs = await this.storage.retrieve('audit_logs', [])
    
    existingLogs.push(encryptedEntry)
    
    // Keep only last 10000 entries to prevent storage bloat
    if (existingLogs.length > 10000) {
      existingLogs.splice(0, existingLogs.length - 10000)
    }
    
    await this.storage.store('audit_logs', existingLogs)
  }

  async encryptAuditEntry(entry) {
    const entryString = JSON.stringify(entry)
    return await this.crypto.encrypt(entryString, this.auditKey)
  }

  async decryptAuditEntry(encryptedEntry) {
    const decryptedString = await this.crypto.decrypt(encryptedEntry, this.auditKey)
    return JSON.parse(decryptedString)
  }

  matchesFilters(log, filters) {
    if (filters.type && log.type !== filters.type) return false
    if (filters.action && log.action !== filters.action) return false
    if (filters.actorId && log.actor.id !== filters.actorId) return false
    
    if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) return false
    
    return true
  }

  // Cleanup old logs
  async cleanupOldLogs(retentionDays = 365) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays)
    
    const logs = await this.getAuditLogs()
    const recentLogs = logs.filter(log => new Date(log.timestamp) > cutoffDate)
    
    // Re-encrypt and store only recent logs
    const encryptedLogs = []
    for (const log of recentLogs) {
      const encrypted = await this.encryptAuditEntry(log)
      encryptedLogs.push(encrypted)
    }
    
    await this.storage.store('audit_logs', encryptedLogs)
    
    return logs.length - recentLogs.length // Number of logs cleaned up
  }

  // Export audit logs for backup
  async exportAuditLogs(includeEncrypted = false) {
    if (includeEncrypted) {
      return await this.storage.retrieve('audit_logs', [])
    } else {
      return await this.getAuditLogs()
    }
  }

  // Import audit logs from backup
  async importAuditLogs(logs, encrypted = false) {
    if (encrypted) {
      const existingLogs = await this.storage.retrieve('audit_logs', [])
      existingLogs.push(...logs)
      await this.storage.store('audit_logs', existingLogs)
    } else {
      // Encrypt and store decrypted logs
      for (const log of logs) {
        await this.storeAuditEntry(log)
      }
    }
  }

  // Get audit statistics
  async getAuditStatistics(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const logs = await this.getAuditLogs({
      startDate: startDate.toISOString()
    })

    return {
      totalActions: logs.length,
      messageActions: logs.filter(l => l.type === 'message_action').length,
      fileActions: logs.filter(l => l.type === 'file_action').length,
      cryptoTransactions: logs.filter(l => l.type === 'crypto_transaction').length,
      trustActions: logs.filter(l => l.type === 'trust_action').length,
      permissionChanges: logs.filter(l => l.type === 'permission_change').length,
      topActors: this.getTopActors(logs),
      dailyActivity: this.getDailyActivity(logs)
    }
  }

  getTopActors(logs) {
    const actorCounts = {}
    
    logs.forEach(log => {
      const actorId = log.actor.id
      actorCounts[actorId] = (actorCounts[actorId] || 0) + 1
    })
    
    return Object.entries(actorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([id, count]) => ({ actorId: id, actionCount: count }))
  }

  getDailyActivity(logs) {
    const dailyActivity = {}
    
    logs.forEach(log => {
      const date = log.timestamp.split('T')[0]
      dailyActivity[date] = (dailyActivity[date] || 0) + 1
    })
    
    return Object.entries(dailyActivity)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }))
  }

  destroy() {
    this.auditKey = null
    this.initialized = false
  }
}

export default AuditManager
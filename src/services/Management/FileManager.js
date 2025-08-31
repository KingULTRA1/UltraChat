/*
 * File Manager Service - UltraChat v1.2.3 Alpha
 * 
 * Manages file operations with controlled permissions:
 * - File upload with validation and scanning
 * - Controlled file deletion with approval workflow
 * - File backup and recovery
 * - Secure file storage and retrieval
 * 
 * Supports: MP3, PDF, PNG, JPG, MOV, DOC, TXT and more
 */

import LocalStorage from '../../utils/LocalStorage'
import Constants from '../../utils/Constants'

class FileManager {
  constructor(auditManager, messageManagement) {
    this.storage = new LocalStorage()
    this.auditManager = auditManager
    this.messageManagement = messageManagement
    this.pendingOperations = new Map()
    this.fileCache = new Map()
    this.initialized = false
  }

  async initialize() {
    try {
      const pending = await this.storage.retrieve('pending_file_operations', [])
      this.pendingOperations = new Map(pending.map(op => [op.id, op]))
      await this.initializeFileStorage()
      this.initialized = true
      console.log('FileManager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize FileManager:', error)
      throw error
    }
  }

  async initializeFileStorage() {
    const fileIndex = await this.storage.retrieve('file_index', {})
    const fileBackups = await this.storage.retrieve('file_backups', [])
    await this.cleanupOldBackups()
  }

  async uploadFile(file, conversationId, uploader, metadata = {}) {
    try {
      const validation = await this.validateFile(file)
      if (!validation.valid) {
        throw new Error(`File validation failed: ${validation.error}`)
      }

      const fileId = this.generateFileId()
      const fileData = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        conversationId: conversationId,
        uploadedBy: uploader.id,
        uploadedAt: new Date().toISOString(),
        hash: await this.calculateFileHash(file),
        metadata: { ...metadata, originalName: file.name, lastModified: file.lastModified },
        status: 'active'
      }

      const fileContent = await this.fileToBase64(file)
      await this.storeFile(fileId, fileContent)
      await this.updateFileIndex(fileData)
      
      await this.auditManager.logFileAction('upload', fileData, uploader, {
        conversationId: conversationId,
        fileSize: file.size,
        fileType: file.type
      })

      return {
        success: true,
        fileId: fileId,
        fileData: fileData,
        message: 'File uploaded successfully'
      }
    } catch (error) {
      console.error('Failed to upload file:', error)
      throw error
    }
  }

  async requestFileDeletion(fileId, requestor, reason = '') {
    try {
      const fileData = await this.getFileData(fileId)
      if (!fileData) {
        throw new Error('File not found')
      }

      const canDelete = await this.canDeleteFile(fileData, requestor)
      
      if (canDelete.immediate) {
        return await this.executeFileDeletion(fileId, requestor, reason, true)
      } else if (canDelete.requiresApproval) {
        const operationId = this.generateOperationId()
        const operation = {
          id: operationId,
          type: 'delete',
          fileId: fileId,
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

        await this.auditManager.logFileAction('delete_requested', fileData, requestor, {
          reason: reason,
          operationId: operationId,
          requiresApproval: true
        })

        return {
          success: true,
          operationId: operationId,
          status: 'pending_approval',
          message: 'File deletion request submitted for moderator approval'
        }
      } else {
        throw new Error('Insufficient permissions to delete this file')
      }
    } catch (error) {
      console.error('Failed to request file deletion:', error)
      throw error
    }
  }

  async executeFileDeletion(fileId, requestor, reason, immediate = false, approver = null) {
    try {
      const fileData = await this.getFileData(fileId)
      if (!fileData) {
        throw new Error('File not found')
      }

      await this.backupFile(fileData, 'deleted')
      
      const updatedFileData = {
        ...fileData,
        status: 'deleted',
        deletedAt: new Date().toISOString(),
        deletedBy: requestor.id,
        deleteReason: reason,
        deleteApprovedBy: approver ? approver.id : null
      }

      await this.updateFileIndex(updatedFileData)

      await this.auditManager.logFileAction('delete', fileData, requestor, {
        reason: reason,
        immediate: immediate,
        approvedBy: approver ? approver.id : null
      })

      return {
        success: true,
        message: 'File deleted successfully'
      }
    } catch (error) {
      console.error('Failed to execute file deletion:', error)
      throw error
    }
  }

  async downloadFile(fileId, downloader) {
    try {
      const fileData = await this.getFileData(fileId)
      if (!fileData || fileData.status === 'deleted') {
        throw new Error('File not found or has been deleted')
      }

      if (!await this.canDownloadFile(fileData, downloader)) {
        throw new Error('Insufficient permissions to download this file')
      }

      const fileContent = await this.retrieveFile(fileId)
      
      await this.auditManager.logFileAction('download', fileData, downloader)

      return {
        success: true,
        fileData: fileData,
        content: fileContent,
        mimeType: fileData.type
      }
    } catch (error) {
      console.error('Failed to download file:', error)
      throw error
    }
  }

  async getFilePreview(fileId, viewer) {
    try {
      const fileData = await this.getFileData(fileId)
      if (!fileData || fileData.status === 'deleted') {
        return null
      }

      return {
        id: fileData.id,
        name: fileData.name,
        type: fileData.type,
        size: fileData.size,
        uploadedAt: fileData.uploadedAt,
        uploadedBy: fileData.uploadedBy,
        icon: this.getFileTypeIcon(fileData.type),
        canDownload: await this.canDownloadFile(fileData, viewer),
        canDelete: (await this.canDeleteFile(fileData, viewer)).immediate || (await this.canDeleteFile(fileData, viewer)).requiresApproval
      }
    } catch (error) {
      console.error('Failed to get file preview:', error)
      return null
    }
  }

  // Permission and validation methods
  async validateFile(file) {
    if (file.size > Constants.FILE_MANAGEMENT.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${Constants.FILE_MANAGEMENT.MAX_FILE_SIZE / (1024 * 1024)}MB`
      }
    }

    if (!Constants.FILE_MANAGEMENT.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type not allowed: ${file.type}`
      }
    }

    return { valid: true }
  }

  async canDeleteFile(fileData, user) {
    const isOwner = fileData.uploadedBy === user.id
    const trustLevel = user.trustLevel || 0
    const fileAge = Date.now() - new Date(fileData.uploadedAt).getTime()

    if ((isOwner && fileAge < 60 * 60 * 1000) || trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return { immediate: true, requiresApproval: false }
    }

    if (isOwner || trustLevel >= Constants.TRUST_LEVELS.MEDIUM) {
      return { immediate: false, requiresApproval: true }
    }

    return { immediate: false, requiresApproval: false }
  }

  async canDownloadFile(fileData, user) {
    return true // All conversation participants can download files
  }

  // Utility methods
  generateFileId() {
    return 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  generateOperationId() {
    return 'fop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  async calculateFileHash(file) {
    const arrayBuffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  getFileTypeIcon(mimeType) {
    const iconMap = {
      'image/png': '🖼️', 'image/jpeg': '🖼️', 'image/jpg': '🖼️', 'image/gif': '🖼️',
      'audio/mpeg': '🎵', 'audio/wav': '🎵', 'video/mp4': '🎬', 'video/quicktime': '🎬',
      'application/pdf': '📄', 'text/plain': '📝', 'application/msword': '📄'
    }
    return iconMap[mimeType] || '📎'
  }

  async storeFile(fileId, fileContent) {
    await this.storage.store(`file_${fileId}`, fileContent)
    this.fileCache.set(fileId, fileContent)
  }

  async retrieveFile(fileId) {
    if (this.fileCache.has(fileId)) {
      return this.fileCache.get(fileId)
    }
    const content = await this.storage.retrieve(`file_${fileId}`)
    if (content) {
      this.fileCache.set(fileId, content)
    }
    return content
  }

  async updateFileIndex(fileData) {
    const index = await this.storage.retrieve('file_index', {})
    index[fileData.id] = fileData
    await this.storage.store('file_index', index)
  }

  async getFileData(fileId) {
    const index = await this.storage.retrieve('file_index', {})
    return index[fileId] || null
  }

  async backupFile(fileData, backupReason) {
    const backupId = this.generateOperationId()
    const backup = {
      id: backupId,
      originalFileId: fileData.id,
      backedUpAt: new Date().toISOString(),
      reason: backupReason,
      fileData: { ...fileData }
    }

    const backups = await this.storage.retrieve('file_backups', [])
    backups.push(backup)
    await this.storage.store('file_backups', backups)
    return backupId
  }

  async savePendingOperations() {
    const operationsArray = Array.from(this.pendingOperations.entries())
    await this.storage.store('pending_file_operations', operationsArray.map(([id, op]) => op))
  }

  async cleanupOldBackups() {
    const backups = await this.storage.retrieve('file_backups', [])
    const cutoffDate = new Date(Date.now() - Constants.FILE_MANAGEMENT.BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000)
    const validBackups = backups.filter(backup => new Date(backup.backedUpAt) > cutoffDate)
    
    if (validBackups.length !== backups.length) {
      await this.storage.store('file_backups', validBackups)
    }
  }

  destroy() {
    this.pendingOperations.clear()
    this.fileCache.clear()
    this.initialized = false
  }
}

export default FileManager
/*
 * Trust Integration Services - UltraChat v1.2.3.4 Final
 * 
 * Enhanced trust integration services for cross-component trust validation
 * 
 * Privacy-First: All trust data encrypted and stored locally
 * Zero-Tracking: No analytics or external data transmission
 */

import LocalStorage from '../../utils/LocalStorage'
import * as Constants from '../../utils/Constants';

class TrustIntegrationServices {
  constructor(trustManager, auditManager, messageManagement, profileManager) {
    this.storage = new LocalStorage()
    this.trustManager = trustManager
    this.auditManager = auditManager
    this.messageManagement = messageManagement
    this.profileManager = profileManager
    this.trustCache = new Map()
    this.validationRules = new Map()
    this.initialized = false
  }

  async initialize() {
    try {
      // Initialize trust cache
      await this.refreshTrustCache()
      
      // Load custom validation rules
      const rules = await this.storage.retrieve('trust_validation_rules', [])
      this.validationRules = new Map(rules.map(rule => [rule.id, rule]))
      
      this.initialized = true
      console.log('TrustIntegrationServices initialized successfully')
    } catch (error) {
      console.error('Failed to initialize TrustIntegrationServices:', error)
      throw error
    }
  }

  // Enhanced trust validation with cross-service integration
  async validateTrustAcrossServices(user, services = [], context = {}) {
    try {
      if (!user || !user.id) {
        return { trusted: false, reason: 'User not authenticated' }
      }

      // Get comprehensive trust profile
      const trustProfile = await this.getComprehensiveTrustProfile(user.id)
      
      // Validate against each service
      const serviceValidations = {}
      let overallTrust = true
      let reasons = []

      for (const service of services) {
        const validation = await this.validateServiceTrust(user, service, trustProfile, context)
        serviceValidations[service] = validation
        
        if (!validation.trusted) {
          overallTrust = false
          reasons.push(`${service}: ${validation.reason}`)
        }
      }

      return {
        trusted: overallTrust,
        services: serviceValidations,
        trustProfile: trustProfile,
        reason: overallTrust ? 'All services validated' : reasons.join('; ')
      }
    } catch (error) {
      console.error('Failed to validate trust across services:', error)
      return { trusted: false, reason: 'Trust validation failed' }
    }
  }

  // Get comprehensive trust profile
  async getComprehensiveTrustProfile(userId) {
    try {
      // Check cache first
      if (this.trustCache.has(userId)) {
        const cached = this.trustCache.get(userId)
        const age = Date.now() - new Date(cached.timestamp).getTime()
        if (age < Constants.TRUST.CACHE_TIMEOUT) {
          return cached.profile
        }
      }

      // Calculate fresh trust profile
      const trustScore = await this.trustManager.calculateTrustScore(userId)
      const endorsements = await this.trustManager.getEndorsementsForUser(userId)
      const profile = await this.profileManager.getProfile()
      
      const trustProfile = {
        userId: userId,
        trustScore: trustScore.score,
        trustLevel: trustScore.level,
        endorsements: endorsements.length,
        positiveEndorsements: endorsements.filter(e => e.trustScore >= 50).length,
        negativeEndorsements: endorsements.filter(e => e.trustScore < 50).length,
        profileMode: profile?.mode || 'Basic',
        accountAge: profile?.createdAt ? Date.now() - new Date(profile.createdAt).getTime() : 0,
        activityScore: await this.calculateActivityScore(userId),
        verificationStatus: await this.getVerificationStatus(userId)
      }

      // Update cache
      this.trustCache.set(userId, {
        profile: trustProfile,
        timestamp: new Date().toISOString()
      })

      return trustProfile
    } catch (error) {
      console.error('Failed to get comprehensive trust profile:', error)
      return null
    }
  }

  // Validate trust for a specific service
  async validateServiceTrust(user, service, trustProfile, context) {
    try {
      const trustLevel = trustProfile?.trustLevel || 0
      const requiredLevel = this.getRequiredTrustLevel(service, context)

      if (trustLevel < requiredLevel) {
        return {
          trusted: false,
          reason: `Insufficient trust level. Required: ${requiredLevel}, Current: ${trustLevel}`,
          requiredLevel: requiredLevel,
          currentLevel: trustLevel
        }
      }

      // Service-specific validations
      switch (service) {
        case 'messaging':
          return await this.validateMessagingTrust(user, trustProfile, context)
        
        case 'file_sharing':
          return await this.validateFileSharingTrust(user, trustProfile, context)
        
        case 'group_management':
          return await this.validateGroupManagementTrust(user, trustProfile, context)
        
        case 'crypto_tipping':
          return await this.validateCryptoTippingTrust(user, trustProfile, context)
        
        default:
          return {
            trusted: true,
            reason: 'Service validated successfully'
          }
      }
    } catch (error) {
      console.error(`Failed to validate trust for service ${service}:`, error)
      return {
        trusted: false,
        reason: `Service validation failed: ${error.message}`
      }
    }
  }

  // Validate messaging trust
  async validateMessagingTrust(user, trustProfile, context) {
    const trustLevel = trustProfile?.trustLevel || 0
    const messageCount = trustProfile?.activityScore?.messages || 0
    
    // Check for spam behavior
    if (messageCount > 100 && trustLevel < Constants.TRUST_LEVELS.MEDIUM) {
      return {
        trusted: false,
        reason: 'High message volume requires medium trust level',
        requires: 'medium'
      }
    }

    // Check for verified status for certain features
    if (context.feature === 'anonymous_messaging' && trustProfile?.verificationStatus !== 'verified') {
      return {
        trusted: false,
        reason: 'Anonymous messaging requires verified status',
        requires: 'verified'
      }
    }

    return {
      trusted: true,
      reason: 'Messaging trust validated'
    }
  }

  // Validate file sharing trust
  async validateFileSharingTrust(user, trustProfile, context) {
    const trustLevel = trustProfile?.trustLevel || 0
    const fileCount = trustProfile?.activityScore?.files || 0
    
    // Limit file sharing for low trust users
    if (trustLevel < Constants.TRUST_LEVELS.LOW) {
      return {
        trusted: false,
        reason: 'File sharing requires low trust level or higher',
        requires: 'low'
      }
    }

    // Check file size limits based on trust
    const maxFileSize = this.getMaxFileSizeForTrustLevel(trustLevel)
    if (context.fileSize > maxFileSize) {
      return {
        trusted: false,
        reason: `File too large for current trust level. Max: ${maxFileSize} bytes`,
        maxFileSize: maxFileSize
      }
    }

    return {
      trusted: true,
      reason: 'File sharing trust validated'
    }
  }

  // Validate group management trust
  async validateGroupManagementTrust(user, trustProfile, context) {
    const trustLevel = trustProfile?.trustLevel || 0
    
    // Group creation requires medium trust
    if (context.action === 'create' && trustLevel < Constants.TRUST_LEVELS.MEDIUM) {
      return {
        trusted: false,
        reason: 'Group creation requires medium trust level',
        requires: 'medium'
      }
    }

    // Group administration requires high trust
    if (context.action === 'admin' && trustLevel < Constants.TRUST_LEVELS.HIGH) {
      return {
        trusted: false,
        reason: 'Group administration requires high trust level',
        requires: 'high'
      }
    }

    return {
      trusted: true,
      reason: 'Group management trust validated'
    }
  }

  // Validate crypto tipping trust
  async validateCryptoTippingTrust(user, trustProfile, context) {
    const trustLevel = trustProfile?.trustLevel || 0
    const amount = context.amount || 0
    
    // Basic tipping allowed for all users
    if (trustLevel >= Constants.TRUST_LEVELS.UNKNOWN) {
      // Large tips require higher trust
      if (amount > 100 && trustLevel < Constants.TRUST_LEVELS.MEDIUM) {
        return {
          trusted: false,
          reason: 'Large tips require medium trust level or higher',
          requires: 'medium'
        }
      }

      // Very large tips require high trust
      if (amount > 1000 && trustLevel < Constants.TRUST_LEVELS.HIGH) {
        return {
          trusted: false,
          reason: 'Very large tips require high trust level',
          requires: 'high'
        }
      }

      return {
        trusted: true,
        reason: 'Crypto tipping trust validated'
      }
    }

    return {
      trusted: false,
      reason: 'Insufficient trust for crypto tipping',
      requires: 'unknown'
    }
  }

  // Calculate user activity score
  async calculateActivityScore(userId) {
    try {
      const conversations = await this.storage.getConversations()
      let messageCount = 0
      let fileCount = 0
      let groupCount = 0

      for (const conversation of conversations) {
        const messages = await this.storage.getMessages(conversation.id, 1000)
        messageCount += messages.length
        
        // Count files
        fileCount += messages.filter(msg => msg.type === 'file').length
      }

      // Get group participation
      const profile = await this.profileManager.getProfile()
      if (profile && profile.groups) {
        groupCount = profile.groups.length
      }

      return {
        messages: messageCount,
        files: fileCount,
        groups: groupCount,
        total: messageCount + fileCount + groupCount
      }
    } catch (error) {
      console.error('Failed to calculate activity score:', error)
      return { messages: 0, files: 0, groups: 0, total: 0 }
    }
  }

  // Get verification status
  async getVerificationStatus(userId) {
    try {
      // Check for verified endorsements
      const endorsements = await this.trustManager.getEndorsementsForUser(userId)
      const verifiedEndorsements = endorsements.filter(e => 
        e.categories && e.categories.includes('verification') && e.trustScore >= 80
      )
      
      if (verifiedEndorsements.length >= 3) {
        return 'verified'
      } else if (verifiedEndorsements.length >= 1) {
        return 'partially_verified'
      }
      
      return 'unverified'
    } catch (error) {
      console.error('Failed to get verification status:', error)
      return 'unverified'
    }
  }

  // Get required trust level for a service
  getRequiredTrustLevel(service, context) {
    // Default trust requirements
    const requirements = {
      messaging: Constants.TRUST_LEVELS.UNKNOWN,
      file_sharing: Constants.TRUST_LEVELS.LOW,
      group_management: Constants.TRUST_LEVELS.MEDIUM,
      crypto_tipping: Constants.TRUST_LEVELS.LOW
    }

    // Context-specific adjustments
    if (context && context.sensitive) {
      return Constants.TRUST_LEVELS.HIGH
    }

    return requirements[service] || Constants.TRUST_LEVELS.UNKNOWN
  }

  // Get max file size based on trust level
  getMaxFileSizeForTrustLevel(trustLevel) {
    if (trustLevel >= Constants.TRUST_LEVELS.HIGH) {
      return 100 * 1024 * 1024 // 100MB for high trust
    } else if (trustLevel >= Constants.TRUST_LEVELS.MEDIUM) {
      return 50 * 1024 * 1024 // 50MB for medium trust
    } else if (trustLevel >= Constants.TRUST_LEVELS.LOW) {
      return 10 * 1024 * 1024 // 10MB for low trust
    }
    
    return 5 * 1024 * 1024 // 5MB default
  }

  // Refresh trust cache
  async refreshTrustCache() {
    // Clear old cache entries
    const now = Date.now()
    for (const [userId, cacheEntry] of this.trustCache.entries()) {
      const age = now - new Date(cacheEntry.timestamp).getTime()
      if (age > Constants.TRUST.CACHE_TIMEOUT) {
        this.trustCache.delete(userId)
      }
    }
    
    console.log('Trust cache refreshed')
  }

  // Add custom validation rule
  async addValidationRule(rule) {
    const ruleId = 'rule_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15)
    const fullRule = {
      id: ruleId,
      ...rule,
      createdAt: new Date().toISOString()
    }
    
    this.validationRules.set(ruleId, fullRule)
    await this.saveValidationRules()
    
    return ruleId
  }

  // Save validation rules
  async saveValidationRules() {
    const rulesArray = Array.from(this.validationRules.values())
    await this.storage.store('trust_validation_rules', rulesArray)
  }

  // Get trust integration statistics
  async getTrustIntegrationStats() {
    const stats = {
      cachedProfiles: this.trustCache.size,
      customRules: this.validationRules.size,
      averageTrustScore: 0,
      trustDistribution: {
        unknown: 0,
        low: 0,
        medium: 0,
        high: 0,
        verified: 0,
        maximum: 0
      }
    }

    // Calculate average trust score from cache
    let totalScore = 0
    let profileCount = 0
    
    for (const cacheEntry of this.trustCache.values()) {
      if (cacheEntry.profile && cacheEntry.profile.trustScore) {
        totalScore += cacheEntry.profile.trustScore
        profileCount++
        
        // Update distribution
        const level = cacheEntry.profile.trustLevel
        if (stats.trustDistribution.hasOwnProperty(level)) {
          stats.trustDistribution[level]++
        }
      }
    }
    
    stats.averageTrustScore = profileCount > 0 ? Math.round(totalScore / profileCount) : 0

    return stats
  }

  destroy() {
    this.trustCache.clear()
    this.validationRules.clear()
    this.initialized = false
  }
}

export default TrustIntegrationServices
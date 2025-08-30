// Profile Modes Handler
// Manages different profile mode behaviors and validations

class ProfileModes {
  static MODES = {
    BASIC: 'Basic',
    PUBLIC: 'Public',
    ANON: 'Anon',
    ULTRA: 'Ultra'
  }

  static getModeConfig(mode) {
    const configs = {
      [this.MODES.BASIC]: {
        id: 'basic',
        name: 'Basic',
        description: 'Minimal profile information for simple messaging',
        icon: '👤',
        color: 'var(--color-mode-basic)',
        features: {
          messaging: true,
          socialHandles: false,
          trustSystem: false,
          anonymity: false,
          crossService: false,
          encryption: true,
          localStorage: true
        },
        restrictions: {
          maxBioLength: 200,
          avatarRequired: false,
          socialHandlesAllowed: false
        },
        privacy: {
          trackingResistance: 'medium',
          dataRetention: 'local',
          metadataMinimization: false
        }
      },
      
      [this.MODES.PUBLIC]: {
        id: 'public',
        name: 'Public',
        description: 'Public profile with social handles and enhanced visibility',
        icon: '🌐',
        color: 'var(--color-mode-public)',
        features: {
          messaging: true,
          socialHandles: true,
          trustSystem: false,
          anonymity: false,
          crossService: true,
          encryption: true,
          localStorage: true,
          publicDirectory: true
        },
        restrictions: {
          maxBioLength: 500,
          avatarRequired: false,
          socialHandlesAllowed: true,
          maxSocialHandles: 5
        },
        privacy: {
          trackingResistance: 'low',
          dataRetention: 'local',
          metadataMinimization: false,
          publicVisibility: true
        }
      },
      
      [this.MODES.ANON]: {
        id: 'anon',
        name: 'Anonymous',
        description: 'Complete anonymity with session-based identity',
        icon: '🥷',
        color: 'var(--color-mode-anon)',
        features: {
          messaging: true,
          socialHandles: false,
          trustSystem: false,
          anonymity: true,
          crossService: false,
          encryption: true,
          localStorage: false,
          sessionBased: true
        },
        restrictions: {
          maxBioLength: 0,
          avatarRequired: false,
          socialHandlesAllowed: false,
          displayNameEditable: false,
          persistentData: false
        },
        privacy: {
          trackingResistance: 'maximum',
          dataRetention: 'session',
          metadataMinimization: true,
          temporaryIdentity: true
        }
      },
      
      [this.MODES.ULTRA]: {
        id: 'ultra',
        name: 'Ultra',
        description: 'Enhanced features with Web of Trust and verification',
        icon: '⚡',
        color: 'var(--color-mode-ultra)',
        features: {
          messaging: true,
          socialHandles: true,
          trustSystem: true,
          anonymity: false,
          crossService: true,
          encryption: true,
          localStorage: true,
          publicDirectory: true,
          endorsements: true,
          verification: true,
          advancedEncryption: true
        },
        restrictions: {
          maxBioLength: 1000,
          avatarRequired: false,
          socialHandlesAllowed: true,
          maxSocialHandles: 10,
          verificationRequired: false
        },
        privacy: {
          trackingResistance: 'medium',
          dataRetention: 'local',
          metadataMinimization: false,
          publicVisibility: true,
          cryptographicIdentity: true
        }
      }
    }

    return configs[mode] || null
  }

  static validateModeTransition(fromMode, toMode) {
    // Define allowed transitions
    const allowedTransitions = {
      [this.MODES.BASIC]: [this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA],
      [this.MODES.PUBLIC]: [this.MODES.BASIC, this.MODES.ANON, this.MODES.ULTRA],
      [this.MODES.ANON]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ULTRA],
      [this.MODES.ULTRA]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON]
    }

    return allowedTransitions[fromMode]?.includes(toMode) || false
  }

  static getDataMigrationStrategy(fromMode, toMode) {
    const fromConfig = this.getModeConfig(fromMode)
    const toConfig = this.getModeConfig(toMode)

    if (!fromConfig || !toConfig) {
      throw new Error('Invalid mode for migration')
    }

    const strategy = {
      preserveFields: [],
      removeFields: [],
      transformFields: {},
      warnings: []
    }

    // Common fields that are usually preserved
    const commonFields = ['displayName', 'bio', 'avatar', 'created']
    
    // Fields to preserve based on target mode capabilities
    if (toConfig.features.socialHandles && fromConfig.features.socialHandles) {
      strategy.preserveFields.push('socialHandles', 'showSocialHandles')
    } else if (!toConfig.features.socialHandles) {
      strategy.removeFields.push('socialHandles', 'showSocialHandles')
      strategy.warnings.push('Social handles will be removed in this mode')
    }

    if (toConfig.features.trustSystem && fromConfig.features.trustSystem) {
      strategy.preserveFields.push('trustScore', 'endorsements', 'verified')
    } else if (!toConfig.features.trustSystem) {
      strategy.removeFields.push('trustScore', 'endorsements', 'verified')
      strategy.warnings.push('Trust system data will be removed')
    }

    // Special handling for Anonymous mode
    if (toMode === this.MODES.ANON) {
      strategy.transformFields.displayName = 'Anonymous'
      strategy.transformFields.bio = ''
      strategy.removeFields.push('avatar', 'socialHandles')
      strategy.warnings.push('All identifying information will be removed')
    }

    // Anonymous to other modes
    if (fromMode === this.MODES.ANON && toMode !== this.MODES.ANON) {
      strategy.warnings.push('You will need to set up your profile information')
    }

    return strategy
  }

  static getModeCapabilities(mode) {
    const config = this.getModeConfig(mode)
    if (!config) return null

    return {
      canSendMessages: config.features.messaging,
      canReceiveMessages: config.features.messaging,
      canUseSocialHandles: config.features.socialHandles,
      canUseEndorsements: config.features.trustSystem,
      canCrossServiceMessage: config.features.crossService,
      canBeAnonymous: config.features.anonymity,
      canUseAdvancedEncryption: config.features.advancedEncryption || false,
      canBePubliclyDiscoverable: config.features.publicDirectory || false,
      hasDataPersistence: !config.features.sessionBased,
      maxBioLength: config.restrictions.maxBioLength,
      maxSocialHandles: config.restrictions.maxSocialHandles || 0
    }
  }

  static getPrivacyLevel(mode) {
    const config = this.getModeConfig(mode)
    if (!config) return 'unknown'

    const privacy = config.privacy
    let score = 0

    // Calculate privacy score
    if (privacy.trackingResistance === 'maximum') score += 40
    else if (privacy.trackingResistance === 'medium') score += 20
    else if (privacy.trackingResistance === 'low') score += 10

    if (privacy.dataRetention === 'session') score += 30
    else if (privacy.dataRetention === 'local') score += 20

    if (privacy.metadataMinimization) score += 15
    if (privacy.temporaryIdentity) score += 15

    // Deduct for public features
    if (privacy.publicVisibility) score -= 10

    if (score >= 80) return 'maximum'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    if (score >= 20) return 'low'
    return 'minimal'
  }

  static getRecommendedMode(userPreferences) {
    const {
      prioritizePrivacy = false,
      needSocialHandles = false,
      wantTrustSystem = false,
      needCrossService = false,
      temporaryUse = false
    } = userPreferences

    // Anonymous for temporary use
    if (temporaryUse || prioritizePrivacy === 'maximum') {
      return this.MODES.ANON
    }

    // Ultra for full features
    if (wantTrustSystem || (needSocialHandles && needCrossService)) {
      return this.MODES.ULTRA
    }

    // Public for social features
    if (needSocialHandles || needCrossService) {
      return this.MODES.PUBLIC
    }

    // Basic for simple messaging
    return this.MODES.BASIC
  }

  static getModeComparison() {
    const modes = Object.values(this.MODES)
    return modes.map(mode => {
      const config = this.getModeConfig(mode)
      const capabilities = this.getModeCapabilities(mode)
      const privacyLevel = this.getPrivacyLevel(mode)

      return {
        mode,
        config: {
          name: config.name,
          description: config.description,
          icon: config.icon,
          color: config.color
        },
        capabilities,
        privacyLevel,
        features: Object.entries(config.features)
          .filter(([, enabled]) => enabled)
          .map(([feature]) => feature)
      }
    })
  }

  static isFeatureAvailable(mode, feature) {
    const config = this.getModeConfig(mode)
    return config?.features[feature] || false
  }

  static getModeRestrictions(mode) {
    const config = this.getModeConfig(mode)
    return config?.restrictions || {}
  }

  static validateProfileForMode(profile, mode) {
    const restrictions = this.getModeRestrictions(mode)
    const config = this.getModeConfig(mode)
    const errors = []

    // Check bio length
    if (profile.bio && profile.bio.length > restrictions.maxBioLength) {
      errors.push(`Bio exceeds maximum length of ${restrictions.maxBioLength} characters`)
    }

    // Check social handles
    if (profile.socialHandles && !restrictions.socialHandlesAllowed) {
      errors.push('Social handles are not allowed in this mode')
    }

    if (profile.socialHandles && restrictions.maxSocialHandles) {
      const handleCount = Object.values(profile.socialHandles).filter(Boolean).length
      if (handleCount > restrictions.maxSocialHandles) {
        errors.push(`Too many social handles (max: ${restrictions.maxSocialHandles})`)
      }
    }

    // Check display name for anonymous mode
    if (mode === this.MODES.ANON && profile.displayName !== 'Anonymous') {
      errors.push('Display name must be "Anonymous" in anonymous mode')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

export default ProfileModes
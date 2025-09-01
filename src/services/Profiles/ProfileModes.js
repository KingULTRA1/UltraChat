// Profile Modes Handler
// Manages different profile mode behaviors and validations

class ProfileModes {
  static MODES = {
    BASIC: 'Basic',
    PUBLIC: 'Public',
    ANON: 'Anon',
    ULTRA: 'Ultra',
    LEGACY: 'Legacy', // Merged Legacy/OG
    PRO: 'Pro',
    ULTRA_ELITE: 'Ultra Elite',
    ANON_PRO: 'Anon Pro',
    STEALTH: 'Stealth',
    LOCKDOWN: 'Lockdown'
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
          crossService: false,
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
          crossService: true,
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
        description: 'Unified access to all your social accounts with enhanced features',
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
          advancedEncryption: true,
          voiceChat: true,
          eventsCalendar: true
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
      },
      
      [this.MODES.LEGACY]: { // Merged Legacy/OG
        id: 'legacy',
        name: 'Legacy/OG',
        description: 'Historical user privileges with standard chat, voice, and event access',
        icon: '👑',
        color: 'var(--color-mode-legacy)',
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
          ogFeatures: true,
          prioritySupport: true,
          voiceChat: true,
          eventsCalendar: true
        },
        restrictions: {
          maxBioLength: 1000,
          avatarRequired: false,
          socialHandlesAllowed: true,
          maxSocialHandles: 10
        },
        privacy: {
          trackingResistance: 'medium',
          dataRetention: 'local',
          metadataMinimization: false,
          publicVisibility: true
        }
      },
      
      [this.MODES.PRO]: {
        id: 'pro',
        name: 'Pro',
        description: 'Professional user with enhanced capabilities and full feature set',
        icon: '💼',
        color: 'var(--color-mode-pro)',
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
          proFeatures: true,
          voiceChat: true,
          eventsCalendar: true,
          advancedEncryption: true
        },
        restrictions: {
          maxBioLength: 1500,
          avatarRequired: false,
          socialHandlesAllowed: true,
          maxSocialHandles: 12
        },
        privacy: {
          trackingResistance: 'medium',
          dataRetention: 'local',
          metadataMinimization: false,
          publicVisibility: true
        }
      },
      
      [this.MODES.ULTRA_ELITE]: {
        id: 'ultra-elite',
        name: 'Ultra Elite',
        description: 'Elite user with maximum features and priority access',
        icon: '💎',
        color: 'var(--color-mode-ultra-elite)',
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
          advancedEncryption: true,
          eliteFeatures: true,
          prioritySupport: true,
          customThemes: true,
          voiceChat: true,
          eventsCalendar: true
        },
        restrictions: {
          maxBioLength: 2000,
          avatarRequired: false,
          socialHandlesAllowed: true,
          maxSocialHandles: 20
        },
        privacy: {
          trackingResistance: 'high',
          dataRetention: 'local',
          metadataMinimization: true,
          publicVisibility: true
        }
      },
      
      [this.MODES.ANON_PRO]: {
        id: 'anon-pro',
        name: 'Anon Pro',
        description: 'Professional anonymity with enhanced privacy features and stealth/lockdown modes',
        icon: '🎭',
        color: 'var(--color-mode-anon-pro)',
        features: {
          messaging: true,
          socialHandles: false,
          trustSystem: true,
          anonymity: true,
          crossService: true,
          encryption: true,
          localStorage: true,
          sessionBased: false,
          advancedPrivacy: true,
          stealthMode: true,
          lockdownMode: true
        },
        restrictions: {
          maxBioLength: 500,
          avatarRequired: false,
          socialHandlesAllowed: false,
          displayNameEditable: true,
          persistentData: true
        },
        privacy: {
          trackingResistance: 'maximum',
          dataRetention: 'local',
          metadataMinimization: true,
          temporaryIdentity: false,
          advancedAnonymity: true
        }
      },
      
      [this.MODES.STEALTH]: {
        id: 'stealth',
        name: 'Stealth',
        description: 'Maximum privacy mode with minimal digital footprint',
        icon: '👻',
        color: 'var(--color-mode-stealth)',
        features: {
          messaging: true,
          socialHandles: false,
          trustSystem: false,
          anonymity: true,
          crossService: false,
          encryption: true,
          localStorage: true,
          sessionBased: false,
          stealthMode: true,
          minimalMetadata: true
        },
        restrictions: {
          maxBioLength: 100,
          avatarRequired: false,
          socialHandlesAllowed: false,
          displayNameEditable: true,
          persistentData: true
        },
        privacy: {
          trackingResistance: 'maximum',
          dataRetention: 'local',
          metadataMinimization: true,
          temporaryIdentity: false,
          advancedAnonymity: true,
          stealthProtection: true
        }
      },
      
      [this.MODES.LOCKDOWN]: {
        id: 'lockdown',
        name: 'Lockdown',
        description: 'Maximum security mode with restricted communications',
        icon: '🔒',
        color: 'var(--color-mode-lockdown)',
        features: {
          messaging: true,
          socialHandles: false,
          trustSystem: true,
          anonymity: true,
          crossService: false,
          encryption: true,
          localStorage: true,
          sessionBased: false,
          advancedEncryption: true,
          lockdownMode: true,
          verificationRequired: true
        },
        restrictions: {
          maxBioLength: 0,
          avatarRequired: false,
          socialHandlesAllowed: false,
          displayNameEditable: false,
          persistentData: true,
          contactRestrictions: true
        },
        privacy: {
          trackingResistance: 'maximum',
          dataRetention: 'local',
          metadataMinimization: true,
          temporaryIdentity: false,
          advancedAnonymity: true,
          lockdownProtection: true
        }
      }
    }

    return configs[mode] || configs[this.MODES.BASIC]
  }

  static validateModeTransition(fromMode, toMode) {
    // Define allowed transitions
    const allowedTransitions = {
      [this.MODES.BASIC]: [this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.PUBLIC]: [this.MODES.BASIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.ANON]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.ULTRA]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.LEGACY]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.PRO]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.ULTRA_ELITE]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ANON_PRO, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.ANON_PRO]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.STEALTH, this.MODES.LOCKDOWN],
      [this.MODES.STEALTH]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.LOCKDOWN],
      [this.MODES.LOCKDOWN]: [this.MODES.BASIC, this.MODES.PUBLIC, this.MODES.ANON, this.MODES.ULTRA, this.MODES.LEGACY, this.MODES.PRO, this.MODES.ULTRA_ELITE, this.MODES.ANON_PRO, this.MODES.STEALTH]
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
      maxSocialHandles: config.restrictions.maxSocialHandles || 0,
      canUseVoiceChat: config.features.voiceChat || false,
      canUseEventsCalendar: config.features.eventsCalendar || false,
      canUseStealthMode: config.features.stealthMode || false,
      canUseLockdownMode: config.features.lockdownMode || false
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
      temporaryUse = false,
      maximumSecurity = false,
      eliteStatus = false
    } = userPreferences

    // Lockdown for maximum security
    if (maximumSecurity) {
      return this.MODES.LOCKDOWN
    }

    // Stealth for maximum privacy
    if (prioritizePrivacy === 'maximum') {
      return this.MODES.STEALTH
    }

    // Anonymous for temporary use
    if (temporaryUse) {
      return this.MODES.ANON
    }

    // Ultra Elite for elite users
    if (eliteStatus) {
      return this.MODES.ULTRA_ELITE
    }

    // Legacy for legacy users
    if (userPreferences.isLegacy) {
      return this.MODES.LEGACY
    }

    // Pro for professional users
    if (userPreferences.isPro || userPreferences.professionalUse) {
      return this.MODES.PRO
    }

    // Anon Pro for professional anonymity
    if (userPreferences.professionalAnonymity) {
      return this.MODES.ANON_PRO
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
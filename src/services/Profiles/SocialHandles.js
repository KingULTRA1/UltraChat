// Social Handles Management
// Handles integration with external social platforms

class SocialHandles {
  constructor() {
    this.supportedPlatforms = {
      twitter: {
        name: 'Twitter/X',
        domain: 'x.com',
        prefix: '@',
        pattern: /^@?[A-Za-z0-9_]{1,15}$/,
        placeholder: '@username',
        icon: '🐦',
        verificationMethod: 'tweet'
      },
      github: {
        name: 'GitHub',
        domain: 'github.com',
        prefix: '',
        pattern: /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/,
        placeholder: 'username',
        icon: '🐙',
        verificationMethod: 'repo'
      },
      website: {
        name: 'Website',
        domain: '',
        prefix: '',
        pattern: /^https?:\/\/.+\..+$/,
        placeholder: 'https://your-website.com',
        icon: '🌐',
        verificationMethod: 'meta'
      },
      facebook: {
        name: 'Facebook',
        domain: 'facebook.com',
        prefix: '',
        pattern: /^[A-Za-z0-9.]{5,50}$/,
        placeholder: 'facebook.com/username',
        icon: '📘',
        verificationMethod: 'post',
        privacy: 'optional' // Facebook integration is optional
      },
      ultrachat: {
        name: 'UltraChat',
        domain: 'github.com',
        prefix: '@',
        pattern: /^@?[A-Za-z0-9_]{3,20}$/,
        placeholder: '@your_handle',
        icon: '⚡',
        verificationMethod: 'signature'
      }
    }
  }

  // Validate social handle format
  validateHandle(platform, handle) {
    const config = this.supportedPlatforms[platform]
    if (!config) {
      return { valid: false, error: 'Unsupported platform' }
    }

    if (!handle || handle.trim() === '') {
      return { valid: true, handle: '' } // Empty handles are allowed
    }

    const trimmedHandle = handle.trim()
    
    // Remove prefix if present for validation
    let cleanHandle = trimmedHandle
    if (config.prefix && trimmedHandle.startsWith(config.prefix)) {
      cleanHandle = trimmedHandle.substring(config.prefix.length)
    }

    if (!config.pattern.test(cleanHandle)) {
      return { 
        valid: false, 
        error: `Invalid format for ${config.name}. Expected: ${config.placeholder}` 
      }
    }

    // Return normalized handle
    const normalizedHandle = config.prefix ? config.prefix + cleanHandle : cleanHandle
    return { valid: true, handle: normalizedHandle }
  }

  // Format handle for display
  formatHandle(platform, handle) {
    const config = this.supportedPlatforms[platform]
    if (!config || !handle) return handle

    const validation = this.validateHandle(platform, handle)
    if (!validation.valid) return handle

    return validation.handle
  }

  // Generate handle URL
  generateHandleURL(platform, handle) {
    const config = this.supportedPlatforms[platform]
    if (!config || !handle) return null

    const validation = this.validateHandle(platform, handle)
    if (!validation.valid) return null

    const cleanHandle = validation.handle.replace(config.prefix, '')

    switch (platform) {
      case 'twitter':
        return `https://x.com/${cleanHandle}`
      case 'github':
        return `https://github.com/${cleanHandle}`
      case 'website':
        return handle.startsWith('http') ? handle : `https://${handle}`
      case 'facebook':
        return `https://facebook.com/${cleanHandle}`
      case 'ultrachat':
        return `ultrachat://profile/${cleanHandle}`
      default:
        return null
    }
  }

  // Get platform icon
  getPlatformIcon(platform) {
    return this.supportedPlatforms[platform]?.icon || '🔗'
  }

  // Get platform name
  getPlatformName(platform) {
    return this.supportedPlatforms[platform]?.name || platform
  }

  // Validate all handles in a profile
  validateAllHandles(handles) {
    const results = {}
    const errors = []

    for (const [platform, handle] of Object.entries(handles)) {
      const validation = this.validateHandle(platform, handle)
      results[platform] = validation
      
      if (!validation.valid && handle) {
        errors.push(`${this.getPlatformName(platform)}: ${validation.error}`)
      }
    }

    return {
      valid: errors.length === 0,
      results,
      errors
    }
  }

  // Generate verification challenges for social handles
  generateVerificationChallenge(platform, handle) {
    const config = this.supportedPlatforms[platform]
    if (!config) return null

    const challengeCode = this.generateChallengeCode()
    const timestamp = new Date().toISOString()

    switch (config.verificationMethod) {
      case 'tweet':
        return {
          method: 'tweet',
          challenge: challengeCode,
          instructions: `Post a tweet with the text: "Verifying UltraChat profile: ${challengeCode}"`,
          verifyUrl: this.generateHandleURL(platform, handle),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }

      case 'repo':
        return {
          method: 'repo',
          challenge: challengeCode,
          instructions: `Create a public repository named "ultrachat-verification" with a README containing: ${challengeCode}`,
          verifyUrl: `https://github.com/${handle}/ultrachat-verification`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }

      case 'meta':
        return {
          method: 'meta',
          challenge: challengeCode,
          instructions: `Add a meta tag to your website: <meta name="ultrachat-verification" content="${challengeCode}">`,
          verifyUrl: this.generateHandleURL(platform, handle),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }

      case 'post':
        return {
          method: 'post',
          challenge: challengeCode,
          instructions: `Create a public post with the text: "Verifying UltraChat profile: ${challengeCode}"`,
          verifyUrl: this.generateHandleURL(platform, handle),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          note: 'Facebook verification is optional and for enhanced trust only'
        }

      case 'signature':
        return {
          method: 'signature',
          challenge: challengeCode,
          instructions: 'Sign the challenge with your UltraChat private key',
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString()
        }

      default:
        return null
    }
  }

  // Generate random challenge code
  generateChallengeCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'UC-'
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Mock verification (in a real app, this would make actual network requests)
  async mockVerifyHandle(platform, handle, challenge) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate success/failure randomly for demo purposes
    const success = Math.random() > 0.3 // 70% success rate
    
    if (success) {
      return {
        verified: true,
        platform,
        handle,
        verifiedAt: new Date().toISOString(),
        challenge
      }
    } else {
      return {
        verified: false,
        platform,
        handle,
        error: 'Verification content not found or invalid',
        challenge
      }
    }
  }

  // Get available platforms for a profile mode
  getAvailablePlatforms(profileMode) {
    const allPlatforms = Object.keys(this.supportedPlatforms)
    
    switch (profileMode) {
      case 'Basic':
        return [] // No social handles in basic mode
      case 'Public':
        return allPlatforms.filter(p => p !== 'ultrachat')
      case 'Ultra':
        return allPlatforms
      case 'Anon':
      default:
        return []
    }
  }

  // Generate social handle suggestions
  generateSuggestions(displayName, existingHandles = {}) {
    const suggestions = {}
    const baseName = displayName.toLowerCase().replace(/[^a-z0-9]/g, '')
    
    if (!baseName) return suggestions

    // Twitter suggestions
    if (!existingHandles.twitter) {
      suggestions.twitter = [
        `@${baseName}`,
        `@${baseName}_dev`,
        `@${baseName}2024`,
        `@${baseName}_ultra`
      ]
    }

    // GitHub suggestions
    if (!existingHandles.github) {
      suggestions.github = [
        baseName,
        `${baseName}-dev`,
        `${baseName}-ultra`,
        `${baseName}2024`
      ]
    }

    // UltraChat suggestions
    if (!existingHandles.ultrachat) {
      suggestions.ultrachat = [
        `@${baseName}`,
        `@${baseName}_ultra`,
        `@${baseName}_user`,
        `@ultra_${baseName}`
      ]
    }

    return suggestions
  }

  // Export/Import social handles
  exportHandles(handles) {
    return {
      version: '1.0',
      exported: new Date().toISOString(),
      handles: Object.entries(handles)
        .filter(([, handle]) => handle)
        .reduce((acc, [platform, handle]) => {
          acc[platform] = {
            handle,
            url: this.generateHandleURL(platform, handle),
            platform: this.getPlatformName(platform)
          }
          return acc
        }, {})
    }
  }

  importHandles(exportData) {
    if (!exportData.handles) return {}
    
    const imported = {}
    for (const [platform, data] of Object.entries(exportData.handles)) {
      if (this.supportedPlatforms[platform]) {
        const validation = this.validateHandle(platform, data.handle)
        if (validation.valid) {
          imported[platform] = validation.handle
        }
      }
    }
    
    return imported
  }

  // Privacy-aware handle display
  getDisplayHandles(handles, showPrivate = true) {
    const display = {}
    
    for (const [platform, handle] of Object.entries(handles)) {
      if (!handle) continue
      
      // Facebook handles are only shown if explicitly allowed
      if (platform === 'facebook' && !showPrivate) {
        continue
      }
      
      display[platform] = {
        handle: this.formatHandle(platform, handle),
        url: this.generateHandleURL(platform, handle),
        icon: this.getPlatformIcon(platform),
        name: this.getPlatformName(platform)
      }
    }
    
    return display
  }
}

export default SocialHandles
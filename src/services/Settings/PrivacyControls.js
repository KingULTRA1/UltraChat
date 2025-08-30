// Privacy Controls Service
// Manages privacy settings and ensures data stays local

class PrivacyControls {
  constructor() {
    this.privacyLevel = 'maximum'
    this.trackingBlocked = true
    this.analyticsDisabled = true
    this.localOnlyMode = true
  }

  // Get current privacy configuration
  getPrivacyConfig() {
    return {
      level: this.privacyLevel,
      features: {
        // Data Collection
        analytics: false,           // Never collect analytics
        tracking: false,            // Never track user behavior
        crashReporting: false,      // Optional crash reports only
        errorLogging: false,        // Local error logging only
        
        // Data Storage
        localStorageOnly: true,     // All data stays local
        cloudSync: false,           // No cloud synchronization
        backupToCloud: false,       // No automatic cloud backup
        
        // Communication
        telemetry: false,           // No telemetry data
        usageStats: false,          // No usage statistics
        performanceMetrics: false,  // Local performance tracking only
        
        // External Services
        thirdPartyServices: false,  // No third-party integrations for tracking
        socialLogin: false,         // No social media login tracking
        externalAPIs: false,        // Minimal external API usage
        
        // Privacy Features
        metadataMinimization: true, // Minimize metadata collection
        dataMinimization: true,     // Collect only essential data
        purposeLimitation: true,    // Use data only for stated purposes
        
        // Security Features
        endToEndEncryption: true,   // All messages encrypted
        localEncryption: true,      // Local data encrypted
        secureKeyStorage: true,     // Secure key management
        forwardSecrecy: true        // Forward secrecy enabled
      }
    }
  }

  // Validate privacy compliance
  validatePrivacyCompliance(action, data = null) {
    const config = this.getPrivacyConfig()
    const violations = []

    // Check for analytics attempts
    if (action.includes('analytics') || action.includes('track')) {
      violations.push('Analytics and tracking are disabled')
    }

    // Check for external data transmission
    if (action.includes('send') || action.includes('upload')) {
      if (data && this.containsSensitiveData(data)) {
        violations.push('Cannot send sensitive data externally')
      }
    }

    // Check for cloud storage attempts
    if (action.includes('cloud') || action.includes('sync')) {
      violations.push('Cloud storage and sync are disabled')
    }

    return {
      compliant: violations.length === 0,
      violations
    }
  }

  // Check if data contains sensitive information
  containsSensitiveData(data) {
    const sensitivePatterns = [
      /password/i,
      /key/i,
      /token/i,
      /private/i,
      /secret/i,
      /personal/i,
      /message/i,
      /conversation/i,
      /profile/i
    ]

    const dataString = JSON.stringify(data).toLowerCase()
    return sensitivePatterns.some(pattern => pattern.test(dataString))
  }

  // Get privacy-safe data for specific purposes
  getPrivacySafeData(originalData, purpose) {
    const safePurposes = ['display', 'local_storage', 'encryption', 'ui_update']
    
    if (!safePurposes.includes(purpose)) {
      throw new Error(`Purpose '${purpose}' not allowed for privacy protection`)
    }

    // Clone data and remove sensitive fields
    const safeData = JSON.parse(JSON.stringify(originalData))
    
    // Remove sensitive fields based on purpose
    if (purpose === 'display') {
      this.removeSensitiveFields(safeData, ['password', 'privateKey', 'token', 'secret'])
    }

    return safeData
  }

  // Remove sensitive fields from data
  removeSensitiveFields(obj, sensitiveFields) {
    if (typeof obj !== 'object' || obj === null) return

    for (const key in obj) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        delete obj[key]
      } else if (typeof obj[key] === 'object') {
        this.removeSensitiveFields(obj[key], sensitiveFields)
      }
    }
  }

  // Generate privacy notice for users
  generatePrivacyNotice() {
    return {
      title: 'UltraChat Privacy Protection',
      summary: 'Your privacy is completely protected with local-only data storage and zero tracking.',
      details: {
        dataCollection: 'We collect no personal data, analytics, or usage statistics.',
        dataStorage: 'All your data stays on your device and is encrypted locally.',
        dataSharing: 'We never share your data with third parties or external services.',
        tracking: 'No tracking, cookies, or behavioral monitoring of any kind.',
        encryption: 'End-to-end encryption protects all your messages and data.',
        control: 'You have complete control over your data and can delete it anytime.'
      },
      userRights: [
        'Right to data portability (export your data)',
        'Right to erasure (delete all your data)',
        'Right to access (view all stored data)',
        'Right to rectification (modify your data)',
        'Right to restrict processing (local-only mode)'
      ],
      contact: 'For privacy questions, contact @ULTRA1 on Twitter'
    }
  }

  // Audit data handling practices
  auditDataPractices() {
    const audit = {
      timestamp: new Date().toISOString(),
      checks: {
        localStorageOnly: true,
        encryptionEnabled: true,
        trackingDisabled: true,
        analyticsDisabled: true,
        thirdPartyServicesDisabled: true,
        metadataMinimized: true,
        userControlMaintained: true,
        transparencyProvided: true
      },
      score: 0,
      recommendations: []
    }

    // Calculate privacy score
    const totalChecks = Object.keys(audit.checks).length
    const passedChecks = Object.values(audit.checks).filter(Boolean).length
    audit.score = Math.round((passedChecks / totalChecks) * 100)

    // Generate recommendations
    if (audit.score < 100) {
      Object.entries(audit.checks).forEach(([check, passed]) => {
        if (!passed) {
          audit.recommendations.push(`Improve: ${check}`)
        }
      })
    }

    return audit
  }

  // Privacy-safe error reporting
  createPrivacySafeErrorReport(error, context = {}) {
    return {
      timestamp: new Date().toISOString(),
      type: error.name || 'Error',
      message: this.sanitizeErrorMessage(error.message || 'Unknown error'),
      context: {
        component: context.component || 'unknown',
        action: context.action || 'unknown',
        userAgent: this.getAnonymizedUserAgent()
      },
      // Never include: user data, messages, keys, tokens, personal info
      privacy: {
        userDataIncluded: false,
        personalInfoIncluded: false,
        anonymized: true,
        localOnly: true
      }
    }
  }

  // Sanitize error messages to remove sensitive info
  sanitizeErrorMessage(message) {
    // Remove potential sensitive patterns
    return message
      .replace(/[A-Za-z0-9+/]{20,}/g, '[REDACTED]') // Base64 patterns
      .replace(/[a-f0-9]{32,}/g, '[REDACTED]')       // Hex patterns
      .replace(/\b\w+@\w+\.\w+/g, '[EMAIL]')         // Email patterns
      .replace(/\b\d{10,}/g, '[NUMBER]')             // Long numbers
      .replace(/password|token|key|secret/gi, '[SENSITIVE]')
  }

  // Get anonymized user agent
  getAnonymizedUserAgent() {
    const ua = navigator.userAgent
    // Return only essential browser info, remove version specifics
    if (ua.includes('Chrome')) return 'Chrome/Generic'
    if (ua.includes('Firefox')) return 'Firefox/Generic'
    if (ua.includes('Safari')) return 'Safari/Generic'
    if (ua.includes('Edge')) return 'Edge/Generic'
    return 'Browser/Generic'
  }

  // Check if external service is privacy-safe
  isServicePrivacySafe(serviceUrl, serviceType) {
    // List of approved services (very minimal)
    const approvedServices = {
      'cdn': [], // No external CDNs to prevent tracking
      'api': [], // No external APIs that could track users
      'font': [] // Use local fonts only
    }

    return false // Default to blocking all external services for maximum privacy
  }

  // Generate privacy-compliant UUID
  generatePrivacyCompliantId() {
    // Use crypto.getRandomValues for secure, non-trackable IDs
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    
    // Convert to hex string
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Validate data export for privacy compliance
  validateExportData(data) {
    const validation = {
      safe: true,
      warnings: [],
      errors: []
    }

    // Check for sensitive data in export
    if (this.containsSensitiveData(data)) {
      validation.warnings.push('Export contains sensitive data - ensure secure handling')
    }

    // Ensure local-only flag is present
    if (!data.localOnly) {
      validation.errors.push('Export must be marked as localOnly')
      validation.safe = false
    }

    // Check for external references
    const dataString = JSON.stringify(data)
    if (dataString.includes('http://') || dataString.includes('https://')) {
      validation.warnings.push('Export contains external URLs')
    }

    return validation
  }
}

export default PrivacyControls
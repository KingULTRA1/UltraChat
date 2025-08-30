// Application Constants for UltraChat

export const APP_CONFIG = {
  name: 'UltraChat',
  version: '1.0.0',
  description: 'Privacy-First Messaging Application',
  author: 'UltraChat Team',
  repository: 'https://github.com/yourusername/ultrachat',
  supportEmail: 'support@ultrachat.app'
}

export const ENCRYPTION_CONSTANTS = {
  AES_KEY_SIZE: 256,
  RSA_KEY_SIZE: 2048,
  IV_SIZE: 16,
  SALT_SIZE: 32,
  PBKDF2_ITERATIONS: 100000,
  SIGNATURE_ALGORITHM: 'RSA-PSS',
  HASH_ALGORITHM: 'SHA-256'
}

export const STORAGE_KEYS = {
  PROFILES: 'profiles',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  SETTINGS: 'settings',
  CONTACTS: 'contacts',
  ENCRYPTION_KEYS: 'encryption_keys',
  USAGE_DATA: 'usage_data',
  SALT: 'salt',
  THEME: 'theme',
  PROFILE_MODE: 'profile_mode',
  BLUE_FILTER: 'blue_filter'
}

export const PROFILE_MODES = {
  BASIC: 'Basic',
  PUBLIC: 'Public',
  ANON: 'Anon',
  ULTRA: 'Ultra'
}

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  AUDIO: 'audio',
  VIDEO: 'video',
  LOCATION: 'location',
  CONTACT: 'contact',
  SYSTEM: 'system'
}

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
}

export const TRUST_LEVELS = {
  UNKNOWN: 0,
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  VERIFIED: 90,
  MAXIMUM: 100
}

export const SOCIAL_PLATFORMS = {
  TWITTER: 'twitter',
  GITHUB: 'github',
  WEBSITE: 'website',
  FACEBOOK: 'facebook',
  ULTRACHAT: 'ultrachat'
}

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  ENDORSEMENT: 'endorsement',
  TRUST_UPDATE: 'trust_update',
  SYSTEM: 'system',
  SECURITY: 'security'
}

export const THEME_MODES = {
  OBSIDIAN: 'obsidian',
  DARK: 'dark',
  LIGHT: 'light'
}

export const PRIVACY_LEVELS = {
  MINIMAL: 'minimal',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  MAXIMUM: 'maximum'
}

export const VERIFICATION_METHODS = {
  TWEET: 'tweet',
  REPO: 'repo',
  META: 'meta',
  POST: 'post',
  SIGNATURE: 'signature'
}

export const CROSS_SERVICE_TYPES = {
  TWITTER_DM: 'twitter_dm',
  PHONE_SMS: 'phone_sms',
  FACEBOOK_MSG: 'facebook_msg',
  EMAIL: 'email'
}

export const UI_CONSTANTS = {
  HEADER_HEIGHT: 60,
  FOOTER_HEIGHT: 40,
  SIDEBAR_WIDTH: 320,
  MAX_MESSAGE_LENGTH: 5000,
  MAX_BIO_LENGTH: {
    [PROFILE_MODES.BASIC]: 200,
    [PROFILE_MODES.PUBLIC]: 500,
    [PROFILE_MODES.ANON]: 0,
    [PROFILE_MODES.ULTRA]: 1000
  },
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300
}

export const LIMITS = {
  MAX_CONVERSATIONS: 1000,
  MAX_MESSAGES_PER_CONVERSATION: 10000,
  MAX_CONTACTS: 5000,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_SOCIAL_HANDLES: {
    [PROFILE_MODES.PUBLIC]: 5,
    [PROFILE_MODES.ULTRA]: 10
  },
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  KEY_ROTATION_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
  MESSAGE_CLEANUP_DAYS: 30
}

export const ERROR_CODES = {
  // Authentication
  AUTH_FAILED: 'AUTH_FAILED',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  
  // Encryption
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  KEY_NOT_FOUND: 'KEY_NOT_FOUND',
  INVALID_KEY: 'INVALID_KEY',
  
  // Storage
  STORAGE_FULL: 'STORAGE_FULL',
  STORAGE_ERROR: 'STORAGE_ERROR',
  DATA_CORRUPT: 'DATA_CORRUPT',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  PROFILE_MODE_ERROR: 'PROFILE_MODE_ERROR',
  
  // Trust System
  ENDORSEMENT_FAILED: 'ENDORSEMENT_FAILED',
  TRUST_CALCULATION_ERROR: 'TRUST_CALCULATION_ERROR',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED'
}

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  MESSAGE_SENT: 'Message sent',
  SETTINGS_SAVED: 'Settings saved',
  CONVERSATION_CREATED: 'Conversation created',
  ENDORSEMENT_SENT: 'Endorsement sent',
  VERIFICATION_COMPLETE: 'Verification completed',
  DATA_EXPORTED: 'Data exported successfully',
  DATA_IMPORTED: 'Data imported successfully'
}

export const ERROR_MESSAGES = {
  [ERROR_CODES.AUTH_FAILED]: 'Authentication failed',
  [ERROR_CODES.ENCRYPTION_FAILED]: 'Failed to encrypt message',
  [ERROR_CODES.DECRYPTION_FAILED]: 'Failed to decrypt message',
  [ERROR_CODES.STORAGE_FULL]: 'Storage is full',
  [ERROR_CODES.NETWORK_ERROR]: 'Network connection error',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided',
  [ERROR_CODES.PROFILE_MODE_ERROR]: 'Invalid profile mode'
}

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  TWITTER_HANDLE: /^@?[A-Za-z0-9_]{1,15}$/,
  GITHUB_HANDLE: /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/,
  WEBSITE: /^https?:\/\/.+\..+$/,
  ULTRACHAT_HANDLE: /^@?[A-Za-z0-9_]{3,20}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
}

export const MIME_TYPES = {
  // Images
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  
  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  
  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  OGG: 'audio/ogg',
  
  // Video
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  
  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed'
}

export const SUPPORTED_FILE_TYPES = {
  IMAGES: [MIME_TYPES.PNG, MIME_TYPES.JPEG, MIME_TYPES.GIF, MIME_TYPES.WEBP],
  DOCUMENTS: [MIME_TYPES.PDF, MIME_TYPES.DOC, MIME_TYPES.DOCX],
  AUDIO: [MIME_TYPES.MP3, MIME_TYPES.WAV, MIME_TYPES.OGG],
  VIDEO: [MIME_TYPES.MP4, MIME_TYPES.WEBM],
  ARCHIVES: [MIME_TYPES.ZIP, MIME_TYPES.RAR]
}

export const KEYBOARD_SHORTCUTS = {
  SEND_MESSAGE: 'Enter',
  NEW_CONVERSATION: 'Ctrl+N',
  SEARCH: 'Ctrl+F',
  SETTINGS: 'Ctrl+,',
  TOGGLE_THEME: 'Ctrl+Shift+T',
  TOGGLE_PROFILE: 'Ctrl+P',
  ESCAPE: 'Escape'
}

export const LOCAL_STORAGE_QUOTA = {
  WARNING_THRESHOLD: 0.8, // 80%
  ERROR_THRESHOLD: 0.95,  // 95%
  ESTIMATED_LIMIT: 5 * 1024 * 1024 // 5MB
}

export const DEVELOPMENT = {
  DEBUG_MODE: import.meta.env.DEV,
  API_MOCK_DELAY: 1000,
  CRYPTO_ITERATIONS_DEV: 1000, // Reduced for development
  LOG_LEVEL: import.meta.env.DEV ? 'debug' : 'error'
}

// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  VOICE_MESSAGES: false,
  VIDEO_CALLS: false,
  GROUP_CHATS: false,
  FILE_SHARING: true,
  CROSS_SERVICE_FACEBOOK: false, // Facebook integration disabled by default
  ADVANCED_TRUST_METRICS: true,
  EXPERIMENTAL_ENCRYPTION: false
}

// Default settings
export const DEFAULT_SETTINGS = {
  theme: THEME_MODES.OBSIDIAN,
  blueFilterEnabled: true,
  notifications: {
    enabled: true,
    sounds: true,
    desktop: true,
    privacy: true
  },
  privacy: {
    analytics: false,
    tracking: false,
    crashReports: false,
    metadataCollection: false
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    autoLock: true,
    keyVerification: true
  },
  messaging: {
    readReceipts: true,
    typingIndicators: true,
    messagePreview: false,
    autoDownload: false
  }
}

export default {
  APP_CONFIG,
  ENCRYPTION_CONSTANTS,
  STORAGE_KEYS,
  PROFILE_MODES,
  MESSAGE_TYPES,
  MESSAGE_STATUS,
  TRUST_LEVELS,
  SOCIAL_PLATFORMS,
  NOTIFICATION_TYPES,
  THEME_MODES,
  PRIVACY_LEVELS,
  VERIFICATION_METHODS,
  CROSS_SERVICE_TYPES,
  UI_CONSTANTS,
  LIMITS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  REGEX_PATTERNS,
  MIME_TYPES,
  SUPPORTED_FILE_TYPES,
  KEYBOARD_SHORTCUTS,
  LOCAL_STORAGE_QUOTA,
  DEVELOPMENT,
  FEATURE_FLAGS,
  DEFAULT_SETTINGS
}
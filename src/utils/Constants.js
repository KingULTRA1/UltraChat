// Application Constants for UltraChat

export const APP_CONFIG = {
  name: 'UltraChat',
  version: '1.2.3 Alpha',
  description: 'UltraChat is a privacy-first messaging application offering end-to-end encryption, zero tracking, and cross-platform support.',
  author: 'UltraChat Team',
  repository: 'https://github.com/KingULTRA1/UltraChat',
  supportContact: '@Ultra1',
  supportUrl: 'https://X.com/Ultra1',
  dashboardRepo: 'https://github.com/KingULTRA1/Ultra-Dashboard',
  features: [
    'End-to-End Encryption',
    'Zero Tracking', 
    'Cross-Platform Support',
    'Open Source',
    'Web of Trust',
    'Anonymous Mode',
    'File Sharing',
    'Audio & Video Support',
    'Crypto Tipping',
    'Contact Notes & Profiles',
    'Message Management',
    'Auto-Reply System',
    'Trust-based Moderation'
  ],
  links: {
    githubRepo: 'https://github.com/KingULTRA1/UltraChat',
    dashboard: 'https://github.com/KingULTRA1/Ultra-Dashboard',
    support: 'https://X.com/Ultra1',
    privacyPolicy: 'https://github.com/KingULTRA1/UltraChat/blob/main/PRIVACY.md',
    documentation: 'https://github.com/KingULTRA1/UltraChat/blob/main/README.md'
  }
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
  DOCUMENT: 'document',
  LOCATION: 'location',
  CONTACT: 'contact',
  SYSTEM: 'system',
  TIP: 'crypto_tip',
  NOTE: 'user_note',
  CALL_REQUEST: 'call_request',
  CALL_ACCEPT: 'call_accept',
  CALL_REJECT: 'call_reject',
  CALL_END: 'call_end'
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

export const PROFESSIONAL_CATEGORIES = {
  DEVELOPER: 'developer',
  CODER: 'coder',
  CRYPTO: 'crypto',
  REAL_ESTATE: 'real_estate',
  CONTRACTOR: 'contractor',
  DESIGNER: 'designer',
  MARKETING: 'marketing',
  FINANCE: 'finance',
  ENTREPRENEUR: 'entrepreneur',
  ARTIST: 'artist',
  HEALTHCARE: 'healthcare',
  OTHER: 'other'
}

export const USER_NOTE_TYPES = {
  GENERAL: 'general',
  PROFESSIONAL: 'professional',
  PERSONAL: 'personal',
  TRUST_RATING: 'trust_rating',
  CONTACT_INFO: 'contact_info',
  SOCIAL_LINKS: 'social_links'
}

export const TRUST_REMINDER_SETTINGS = {
  LOCK_THRESHOLD: 11, // Lock rating after 11 chats
  REMINDER_DELAY: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
  AUTO_LOCK_DELAY: 10 * 24 * 60 * 60 * 1000 // 10 days for auto-lock
}

export const MESSAGE_MANAGEMENT = {
  IMMEDIATE_DELETE_WINDOW: 5 * 60 * 1000, // 5 minutes in milliseconds
  IMMEDIATE_EDIT_WINDOW: 15 * 60 * 1000, // 15 minutes in milliseconds
  APPROVAL_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  MAX_PENDING_OPERATIONS: 50,
  ARCHIVE_RETENTION_DAYS: 30
}

export const FILE_MANAGEMENT = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB in bytes
  ALLOWED_TYPES: [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3',
    'video/mp4',
    'video/quicktime',
    'video/mov',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  BACKUP_RETENTION_DAYS: 90,
  MAX_FILES_PER_CONVERSATION: 1000
}

export const CRYPTO_CURRENCIES = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum', 
  DOGE: 'Dogecoin',
  LTC: 'Litecoin',
  SOL: 'Solana',
  PYTH: 'Pyth Network',
  LINK: 'Chainlink'
}

export const VERIFICATION_METHODS = {
  MUTUAL_CONTACTS: 'mutual_contacts',
  SOCIAL_MEDIA: 'social_media',
  PHONE_VERIFICATION: 'phone_verification',
  EMAIL_VERIFICATION: 'email_verification',
  GOVERNMENT_ID: 'government_id',
  BIOMETRIC: 'biometric',
  CRYPTOGRAPHIC_PROOF: 'cryptographic_proof',
  WEB_OF_TRUST: 'web_of_trust',
  REPUTATION_BASED: 'reputation_based'
}

export const CROSS_SERVICE_TYPES = {
  TWITTER_DM: 'twitter_dm',
  PHONE_SMS: 'phone_sms',
  FACEBOOK_MSG: 'facebook_msg',
  EMAIL: 'email'
}

export const AUTO_REPLY_TYPES = {
  QUICK: 'quick',
  SCHEDULE: 'schedule',
  STATUS_BASED: 'status_based',
  MISSED_CALL: 'missed_call',
  EMOJI_ONLY: 'emoji_only'
}

export const AUTO_REPLY_PRESETS = {
  ON_MY_WAY: {
    id: 'on_my_way',
    text: "On my way! 🚗",
    emoji: '🚗',
    category: 'quick'
  },
  CANT_TALK: {
    id: 'cant_talk',
    text: "Can't talk right now 📞",
    emoji: '📞',
    category: 'quick'
  },
  WILL_REPLY: {
    id: 'will_reply',
    text: "Will reply later 💬",
    emoji: '💬',
    category: 'quick'
  },
  BUSY_STATUS: {
    id: 'busy_status',
    text: "Currently unavailable, I'll get back to you soon.",
    emoji: '⏰',
    category: 'status'
  },
  MISSED_CALL: {
    id: 'missed_call',
    text: "Sorry I missed your call, please leave a message.",
    emoji: '📞',
    category: 'call'
  },
  OUT_OF_HOURS: {
    id: 'out_of_hours',
    text: "Thanks for your message! I'm currently offline and will respond during my active hours.",
    emoji: '🌙',
    category: 'schedule'
  }
}

export const EMOJI_QUICK_REPLIES = {
  THUMBS_UP: '👍',
  LAUGH: '😂',
  FIRE: '🔥',
  HEART: '❤️',
  THINKING: '🤔',
  OK_HAND: '👌',
  CLAP: '👏',
  EYES: '👀',
  ROCKET: '🚀',
  SPARKLES: '✨',
  LIGHTNING: '⚡',
  DIAMOND: '💎',
  MONEY: '💰',
  SHIELD: '🛡️',
  LOCK: '🔒'
}

export const AUTO_REPLY_RULES = {
  MAX_CUSTOM_REPLIES: 20,
  MAX_TEXT_LENGTH: 300,
  COOLDOWN_MINUTES: 5, // Prevent spam
  SCHEDULE_CHECK_INTERVAL: 60000, // 1 minute
  DEFAULT_ACTIVE_HOURS: {
    start: '09:00',
    end: '18:00',
    timezone: 'local'
  }
}

export const CALL_STATES = {
  IDLE: 'idle',
  CALLING: 'calling',
  RINGING: 'ringing',
  CONNECTED: 'connected',
  ENDED: 'ended',
  FAILED: 'failed',
  BUSY: 'busy'
}

export const CALL_TYPES = {
  VOICE: 'voice',
  VIDEO: 'video'
}

export const WEBRTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  iceCandidatePoolSize: 10
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
  JPG: 'image/jpg',
  GIF: 'image/gif',
  WEBP: 'image/webp',
  
  // Documents
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TXT: 'text/plain',
  
  // Audio
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  OGG: 'audio/ogg',
  M4A: 'audio/mp4',
  FLAC: 'audio/flac',
  
  // Video
  MP4: 'video/mp4',
  WEBM: 'video/webm',
  AVI: 'video/x-msvideo',
  MOV: 'video/quicktime',
  
  // Archives
  ZIP: 'application/zip',
  RAR: 'application/x-rar-compressed',
  TAR: 'application/x-tar',
  GZ: 'application/gzip'
}

export const SUPPORTED_FILE_TYPES = {
  IMAGES: [MIME_TYPES.PNG, MIME_TYPES.JPEG, MIME_TYPES.JPG, MIME_TYPES.GIF, MIME_TYPES.WEBP],
  DOCUMENTS: [MIME_TYPES.PDF, MIME_TYPES.DOC, MIME_TYPES.DOCX, MIME_TYPES.TXT],
  AUDIO: [MIME_TYPES.MP3, MIME_TYPES.WAV, MIME_TYPES.OGG, MIME_TYPES.M4A, MIME_TYPES.FLAC],
  VIDEO: [MIME_TYPES.MP4, MIME_TYPES.WEBM, MIME_TYPES.AVI, MIME_TYPES.MOV],
  ARCHIVES: [MIME_TYPES.ZIP, MIME_TYPES.RAR, MIME_TYPES.TAR, MIME_TYPES.GZ]
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
  VOICE_MESSAGES: true,
  VIDEO_MESSAGES: true,
  VIDEO_CALLS: true,
  GROUP_CHATS: false,
  FILE_SHARING: true,
  IMAGE_SHARING: true,
  DOCUMENT_SHARING: true,
  AUDIO_SHARING: true,
  CROSS_SERVICE_FACEBOOK: false, // Facebook integration disabled by default
  ADVANCED_TRUST_METRICS: true,
  WEB_OF_TRUST: true,
  USER_NOTES: true,
  PROFESSIONAL_CATEGORIES: true,
  CRYPTO_TIPPING: true,
  CONTACT_PROFILES: true,
  TRUST_REMINDERS: true,
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
    privacy: true,
    vibration: false
  },
  privacy: {
    analytics: false,
    tracking: false,
    crashReports: false,
    metadataCollection: false,
    anonymousMode: true,
    secureMessaging: true,
    trackingProtection: true,
    localStorageOnly: true
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    autoLock: true,
    keyVerification: true,
    endToEndEncryption: 'AES-256-GCM',
    forwardSecrecy: true,
    twoFactorAuthentication: true
  },
  messaging: {
    readReceipts: true,
    typingIndicators: true,
    messagePreview: false,
    autoDownload: false
  },
  appearance: {
    theme: 'dark',
    colorScheme: 'blue'
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
  PROFESSIONAL_CATEGORIES,
  USER_NOTE_TYPES,
  TRUST_REMINDER_SETTINGS,
  MESSAGE_MANAGEMENT,
  FILE_MANAGEMENT,
  CROSS_SERVICE_TYPES,
  CRYPTO_CURRENCIES,
  AUTO_REPLY_TYPES,
  AUTO_REPLY_PRESETS,
  EMOJI_QUICK_REPLIES,
  AUTO_REPLY_RULES,
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
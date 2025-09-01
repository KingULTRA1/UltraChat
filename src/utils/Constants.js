// Application Constants for UltraChat

export const APP_CONFIG = {
  name: 'UltraChat',
  version: '1.2.3.4 Final',
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
    'Web of Trust',
    'Crypto Tipping',
    'Bot Bridge Integration',
    'Audit Trails'
  ]
};

// Cryptography Constants
export const CRYPTO_CONFIG = {
  algorithm: 'AES-256-GCM',
  keyDerivation: 'PBKDF2',
  keyDerivationIterations: 100000,
  rsaKeySize: 2048,
  aesKeySize: 256,
  ivLength: 12,
  authTagLength: 16,
  hashAlgorithm: 'SHA-256'
};

// Storage Constants
export const STORAGE_KEYS = {
  currentUser: 'currentUser',
  messages: 'messages',
  contacts: 'contacts',
  settings: 'settings',
  encryptionKey: 'encryptionKey',
  trustData: 'trustData',
  cryptoKeys: 'cryptoKeys',
  auditLogs: 'auditLogs'
};

// Profile Mode Constants
export const PROFILE_MODES = {
  BASIC: 'Basic',
  PUBLIC: 'Public',
  ANONYMOUS: 'Anonymous',
  ULTRA: 'Ultra'
};

// Trust System Constants
export const TRUST_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const ENDORSEMENT_TYPES = {
  PERSONAL: 'personal',
  COMMUNITY: 'community',
  VERIFIED: 'verified'
};

// Communication Constants
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed'
};

export const PLATFORMS = {
  DISCORD: 'discord',
  TELEGRAM: 'telegram',
  TWITTER: 'twitter',
  SMS: 'sms',
  SIGNAL: 'signal'
};

// UI Constants
export const THEME_CONFIG = {
  obsidian: 'obsidian',
  dark: 'dark',
  light: 'light'
};

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  ENDORSEMENT: 'endorsement',
  SECURITY: 'security',
  SYSTEM: 'system'
};

// Error Messages
export const ERROR_MESSAGES = {
  ENCRYPTION_FAILED: 'Failed to encrypt message',
  DECRYPTION_FAILED: 'Failed to decrypt message',
  INVALID_KEY: 'Invalid encryption key',
  STORAGE_ERROR: 'Failed to access local storage',
  NETWORK_ERROR: 'Network connection failed',
  AUTH_REQUIRED: 'Authentication required',
  TRUST_ERROR: 'Trust verification failed'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  MESSAGE_SENT: 'Message sent successfully',
  MESSAGE_DECRYPTED: 'Message decrypted successfully',
  TRUST_ESTABLISHED: 'Trust established successfully',
  KEY_ROTATED: 'Encryption keys rotated successfully'
};

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: 'obsidian',
  blueLightFilter: true,
  notifications: true,
  autoLock: true,
  lockTimeout: 300000, // 5 minutes
  encryptionEnabled: true,
  trustVerification: true,
  auditLogging: true
};
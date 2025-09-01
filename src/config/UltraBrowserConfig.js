// UltraBrowserConfig.js
export const UltraBrowserConfig = {
  // Default start page
  homePage: 'https://duckduckgo.com', 

  // Tab management
  tabs: {
    maxTabs: Infinity, // Unlimited tabs
    restoreSessions: true, // Restore previous tabs on start
    privateMode: {
      enabled: false, // Can be toggled per session
      clearOnClose: true, // Deletes all cookies, cache, and history
    },
  },

  // Privacy & security
  privacy: {
    cookies: {
      blockThirdParty: true,
      sessionOnly: true, // Clears session cookies on close
    },
    cache: {
      clearOnExit: true,
      tempStorage: 'session', // Temporary files last only for session
    },
    localStorage: {
      clearPrivateMode: true,
    },
    passwords: {
      savePasswords: false, // Optional local encrypted storage only
      promptOnSave: true,
    },
    tracking: {
      blockTrackers: true,
      noAnalytics: true,
    },
  },

  // Favorites / bookmarks
  bookmarks: {
    saveLocally: true,
    encrypted: false, // Optional for advanced privacy
  },

  // URL handling
  history: {
    saveURLs: true,
    excludeSensitiveData: true, // Do not store auth tokens or parameters
  },

  // UI / Coolness factor
  ui: {
    theme: 'UltraChat', // Matches chat styling
    tabAnimation: 'slide', 
    toolbarOptions: ['back', 'forward', 'reload', 'bookmark', 'share', 'saveImage'],
    emojiBlockGoogle: '🚫', // Fun visual for blocked sites
    // Fun screensaver images
    screensaverImages: [
      'cosmic', 
      'cat', 
      'dog', 
      'cars', 
      'bikes', 
      'ninja',
      'gamer',
      'nerd',
      'dr',
      'law',
      'judge'
    ],
    // Cool emojis for different user types
    userEmojis: {
      developer: '👨‍💻', // Space alien and invaders icon
      admin: '👑',
      coder: '⌨️',
      user: '👤'
    }
  },

  // Blocked sites by default
  blockedSites: [
    'https://www.google.com',
    'https://google.com',
  ],
};

export default UltraBrowserConfig;
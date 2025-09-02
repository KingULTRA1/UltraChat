// Platform detection utility for UltraChat v2.0
// This file helps detect the current platform and provides platform-specific utilities

/**
 * Detect if we're running on web platform
 * @returns {boolean} True if running on web
 */
export const isWeb = () => {
  return typeof window !== 'undefined' && !window.ReactNative && !window.ELECTRON;
};

/**
 * Detect if we're running on mobile platform
 * @returns {boolean} True if running on mobile
 */
export const isMobile = () => {
  return typeof window !== 'undefined' && !!window.ReactNative;
};

/**
 * Detect if we're running on iOS
 * @returns {boolean} True if running on iOS
 */
export const isIOS = () => {
  if (isWeb()) {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  } else if (isMobile()) {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }
  return false;
};

/**
 * Detect if we're running on Android
 * @returns {boolean} True if running on Android
 */
export const isAndroid = () => {
  if (isWeb()) {
    return /Android/.test(navigator.userAgent);
  } else if (isMobile()) {
    return /Android/.test(navigator.userAgent);
  }
  return false;
};

/**
 * Detect if we're running on desktop (Electron)
 * @returns {boolean} True if running on desktop
 */
export const isDesktop = () => {
  return typeof window !== 'undefined' && !!window.ELECTRON;
};

/**
 * Get platform-specific storage implementation
 * @returns {Object} Storage implementation
 */
export const getStorage = () => {
  if (isWeb()) {
    return window.localStorage;
  } else if (isMobile()) {
    // In React Native, we would import AsyncStorage here
    // For now, return a mock implementation
    return {
      getItem: async (key) => {
        // Mock implementation
        return null;
      },
      setItem: async (key, value) => {
        // Mock implementation
      },
      removeItem: async (key) => {
        // Mock implementation
      }
    };
  } else if (isDesktop()) {
    // In Electron, we would use a file-based storage
    // For now, return a mock implementation
    return {
      getItem: async (key) => {
        // Mock implementation
        return null;
      },
      setItem: async (key, value) => {
        // Mock implementation
      },
      removeItem: async (key) => {
        // Mock implementation
      }
    };
  }
  
  // Fallback to in-memory storage
  const memoryStorage = {};
  return {
    getItem: async (key) => {
      return memoryStorage[key] || null;
    },
    setItem: async (key, value) => {
      memoryStorage[key] = value;
    },
    removeItem: async (key) => {
      delete memoryStorage[key];
    }
  };
};

/**
 * Get platform-specific crypto implementation
 * @returns {Object} Crypto implementation
 */
export const getCrypto = () => {
  if (isWeb() || isDesktop()) {
    return window.crypto || window.msCrypto;
  } else if (isMobile()) {
    // In React Native, we would use a native crypto module
    // For now, return a mock implementation
    return {
      getRandomValues: (array) => {
        // Mock implementation
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 256);
        }
        return array;
      },
      subtle: {
        encrypt: async () => {
          // Mock implementation
          return new ArrayBuffer(0);
        },
        decrypt: async () => {
          // Mock implementation
          return new ArrayBuffer(0);
        },
        generateKey: async () => {
          // Mock implementation
          return {};
        },
        exportKey: async () => {
          // Mock implementation
          return {};
        },
        importKey: async () => {
          // Mock implementation
          return {};
        },
        sign: async () => {
          // Mock implementation
          return new ArrayBuffer(0);
        },
        verify: async () => {
          // Mock implementation
          return true;
        },
        digest: async () => {
          // Mock implementation
          return new ArrayBuffer(0);
        }
      }
    };
  }
  
  // Fallback implementation
  return {
    getRandomValues: (array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle: {}
  };
};

export default {
  isWeb,
  isMobile,
  isIOS,
  isAndroid,
  isDesktop,
  getStorage,
  getCrypto
};
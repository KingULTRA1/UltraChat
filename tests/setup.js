// Test setup file for Vitest
import { vi } from 'vitest'

// Mock Web Crypto API for testing environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
    subtle: {
      generateKey: vi.fn(() => Promise.resolve({})),
      encrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(16))),
      decrypt: vi.fn(() => Promise.resolve(new ArrayBuffer(16))),
      importKey: vi.fn(() => Promise.resolve({})),
      exportKey: vi.fn(() => Promise.resolve({})),
      deriveKey: vi.fn(() => Promise.resolve({})),
      sign: vi.fn(() => Promise.resolve(new ArrayBuffer(16))),
      verify: vi.fn(() => Promise.resolve(true)),
      digest: vi.fn(() => Promise.resolve(new ArrayBuffer(32)))
    }
  }
})

// Mock localStorage
const localStorageMock = (() => {
  const store = {}
  return {
    store, // Expose store for testing
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: 0,
    key: vi.fn()
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock window.btoa and atob for base64 operations
global.btoa = vi.fn((str) => Buffer.from(str, 'binary').toString('base64'))
global.atob = vi.fn((str) => Buffer.from(str, 'base64').toString('binary'))

// Mock Blob for file size calculations
global.Blob = vi.fn().mockImplementation((content, options) => ({
  size: JSON.stringify(content).length,
  type: options?.type || 'text/plain'
}))

// Mock CryptoUtils
vi.mock('../src/utils/CryptoUtils.js', async () => {
  const original = await vi.importActual('../src/utils/CryptoUtils.js')
  return {
    ...original,
    default: vi.fn().mockImplementation(() => ({
      keySize: 256,
      ivSize: 16,
      saltSize: 32,
      generateRandomBytes: vi.fn(() => new Uint8Array(32)),
      generateUUID: vi.fn(() => '12345678-1234-4123-89ab-123456789abc'),
      arrayBufferToBase64: vi.fn((buffer) => {
        if (buffer instanceof ArrayBuffer) {
          return Buffer.from(buffer).toString('base64')
        }
        return 'base64-encoded-string'
      }),
      base64ToArrayBuffer: vi.fn((str) => {
        if (typeof str === 'string') {
          return Uint8Array.from(Buffer.from(str, 'base64')).buffer
        }
        return new ArrayBuffer(16)
      }),
      generateSalt: vi.fn(() => new ArrayBuffer(16)),
      deriveKeyFromPassword: vi.fn(() => Promise.resolve('derived-key')),
      generateKey: vi.fn(() => Promise.resolve('test-key')),
      encrypt: vi.fn((data) => {
        // For tests, we'll just return the JSON stringified data
        return Promise.resolve(JSON.stringify(data))
      }),
      decrypt: vi.fn((encryptedData) => {
        // For tests, we'll parse the JSON data back
        try {
          const parsed = JSON.parse(encryptedData)
          return Promise.resolve(parsed)
        } catch (e) {
          return Promise.resolve(encryptedData)
        }
      }),
      hash: vi.fn((data) => Promise.resolve('hashed-' + data)),
      getKeyFingerprint: vi.fn(() => Promise.resolve('test-fingerprint')),
      arrayBufferToHex: vi.fn((buffer) => 'hex-string'),
      hexToArrayBuffer: vi.fn((hex) => new ArrayBuffer(16)),
      constantTimeEqual: vi.fn((a, b) => a === b),
      deriveSessionKey: vi.fn(() => Promise.resolve(new Uint8Array(32))),
      clearKey: vi.fn(),
      generateIV: vi.fn(() => new Uint8Array(16)),
      exportKey: vi.fn(() => Promise.resolve({})),
      importKey: vi.fn(() => Promise.resolve({})),
      encryptRSA: vi.fn((data) => Promise.resolve('encrypted-rsa-data')),
      decryptRSA: vi.fn((data) => Promise.resolve(data)),
      sign: vi.fn(() => Promise.resolve('signature')),
      verify: vi.fn(() => Promise.resolve(true))
    }))
  }
})

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  // Clear the localStorage mock store
  localStorageMock.store = {}
})
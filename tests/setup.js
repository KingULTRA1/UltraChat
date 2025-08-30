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
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
}

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

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockReturnValue(undefined)
  localStorageMock.removeItem.mockReturnValue(undefined)
  localStorageMock.clear.mockReturnValue(undefined)
})
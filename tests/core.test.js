// Simple validation test for UltraChat core components
// This tests that our main modules can be imported and basic functionality works

import { describe, it, expect } from 'vitest'

// Import core modules
import CryptoUtils from '../src/utils/CryptoUtils.js'
import ProfileManager from '../src/services/Profiles/ProfileManager.js'
import ProfileModes from '../src/services/Profiles/ProfileModes.js'
import SocialHandles from '../src/services/Profiles/SocialHandles.js'
import MessageEncryption from '../src/services/Messaging/MessageEncryption.js'
import LocalStorage from '../src/utils/LocalStorage.js'
import * as Constants from '../src/utils/Constants.js'

describe('UltraChat Core Components', () => {
  describe('Constants', () => {
    it('should have all required constants defined', () => {
      expect(Constants.APP_CONFIG).toBeDefined();
      expect(Constants.PROFILE_MODES).toBeDefined();
      expect(Constants.CRYPTO_CONFIG).toBeDefined();
      expect(Constants.DEFAULT_SETTINGS).toBeDefined();
    });

    it('should have valid profile modes', () => {
      expect(Constants.PROFILE_MODES.BASIC).toBe('Basic');
      expect(Constants.PROFILE_MODES.PUBLIC).toBe('Public');
      expect(Constants.PROFILE_MODES.ANONYMOUS).toBe('Anonymous');
      expect(Constants.PROFILE_MODES.ULTRA).toBe('Ultra');
    });
  })

  describe('CryptoUtils', () => {
    let crypto

    beforeEach(() => {
      crypto = new CryptoUtils()
    })

    it('should initialize correctly', () => {
      expect(crypto).toBeDefined()
      expect(crypto.keySize).toBe(256)
      expect(crypto.ivSize).toBe(16)
    })

    it('should generate random bytes', () => {
      const bytes = crypto.generateRandomBytes(32)
      expect(bytes).toBeInstanceOf(Uint8Array)
      expect(bytes.length).toBe(32)
    })

    it('should generate UUIDs', () => {
      const uuid = crypto.generateUUID()
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('should convert between ArrayBuffer and Base64', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]).buffer
      const base64 = crypto.arrayBufferToBase64(buffer)
      const restored = crypto.base64ToArrayBuffer(base64)
      
      expect(new Uint8Array(restored)).toEqual(new Uint8Array([1, 2, 3, 4, 5]))
    })
  })

  describe('ProfileModes', () => {
    it('should have valid mode configurations', () => {
      const basicConfig = ProfileModes.getModeConfig('Basic')
      expect(basicConfig).toBeDefined()
      expect(basicConfig.features.messaging).toBe(true)
      expect(basicConfig.features.socialHandles).toBe(false)
    })

    it('should validate mode transitions', () => {
      const canTransition = ProfileModes.validateModeTransition('Basic', 'Ultra')
      expect(canTransition).toBe(true)
    })

    it('should get mode capabilities correctly', () => {
      const capabilities = ProfileModes.getModeCapabilities('Ultra')
      expect(capabilities.canUseSocialHandles).toBe(true)
      expect(capabilities.canUseEndorsements).toBe(true)
    })

    it('should calculate privacy levels', () => {
      const anonPrivacy = ProfileModes.getPrivacyLevel('Anon')
      const basicPrivacy = ProfileModes.getPrivacyLevel('Basic')
      
      expect(['maximum', 'high'].includes(anonPrivacy)).toBe(true)
      expect(['medium', 'high'].includes(basicPrivacy)).toBe(true)
    })
  })

  describe('SocialHandles', () => {
    let socialHandles

    beforeEach(() => {
      socialHandles = new SocialHandles()
    })

    it('should validate Twitter handles', () => {
      const valid = socialHandles.validateHandle('twitter', '@testuser')
      expect(valid.valid).toBe(true)
      expect(valid.handle).toBe('@testuser')

      const invalid = socialHandles.validateHandle('twitter', '@toolongusernamehere')
      expect(invalid.valid).toBe(false)
    })

    it('should validate GitHub handles', () => {
      const valid = socialHandles.validateHandle('github', 'testuser')
      expect(valid.valid).toBe(true)
      expect(valid.handle).toBe('testuser')
    })

    it('should generate handle URLs', () => {
      const twitterUrl = socialHandles.generateHandleURL('twitter', '@testuser')
      expect(twitterUrl).toBe('https://x.com/testuser')

      const githubUrl = socialHandles.generateHandleURL('github', 'testuser')
      expect(githubUrl).toBe('https://github.com/testuser')
    })

    it('should validate all handles', () => {
      const handles = {
        twitter: '@validuser',
        github: 'validuser',
        website: 'https://example.com'
      }

      const validation = socialHandles.validateAllHandles(handles)
      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('ProfileManager', () => {
    let profileManager

    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.clear()
      profileManager = new ProfileManager()
    })

    it('should initialize with default profiles', () => {
      expect(profileManager.profiles).toBeDefined()
      expect(profileManager.profiles.basic).toBeDefined()
      expect(profileManager.profiles.public).toBeDefined()
      expect(profileManager.profiles.anon).toBeDefined()
      expect(profileManager.profiles.ultra).toBeDefined()
    })

    it('should switch between profile modes', () => {
      const profile = profileManager.switchMode('Ultra')
      expect(profile.mode).toBe('Ultra')
      expect(profileManager.activeMode).toBe('Ultra')
    })

    it('should update profile information', () => {
      const updated = profileManager.updateProfile('Basic', {
        displayName: 'Test User',
        bio: 'Test bio'
      })

      expect(updated.displayName).toBe('Test User')
      expect(updated.bio).toBe('Test bio')
    })

    it('should get available modes', () => {
      const modes = profileManager.getAvailableModes()
      expect(modes).toHaveLength(4)
      expect(modes.map(m => m.id)).toEqual(['Basic', 'Public', 'Anon', 'Ultra'])
    })
  })

  describe('LocalStorage', () => {
    let storage

    beforeEach(async () => {
      localStorage.clear()
      storage = new LocalStorage()
      await storage.initialize()
    })

    it('should initialize correctly', () => {
      expect(storage.initialized).toBe(true)
    })

    it('should store and retrieve data', async () => {
      const testData = { test: 'value', number: 123 }
      
      const stored = await storage.store('test', testData, false)
      expect(stored).toBe(true)

      const retrieved = await storage.retrieve('test')
      expect(retrieved).toEqual(testData)
    })

    it('should handle conversations', async () => {
      const conversation = {
        id: 'test-conversation',
        name: 'Test Chat',
        participants: ['user1', 'user2']
      }

      await storage.storeConversation(conversation)
      const conversations = await storage.getConversations()
      
      expect(conversations).toHaveLength(1)
      expect(conversations[0].id).toBe('test-conversation')
    })

    it('should handle messages', async () => {
      const message = {
        id: 'msg-1',
        content: 'Test message',
        timestamp: new Date().toISOString()
      }

      await storage.storeMessage('conv-1', message)
      const messages = await storage.getMessages('conv-1')
      
      expect(messages).toHaveLength(1)
      expect(messages[0].content).toBe('Test message')
    })
  })

  describe('MessageEncryption', () => {
    let encryption

    beforeEach(() => {
      encryption = new MessageEncryption()
    })

    it('should initialize correctly', () => {
      expect(encryption).toBeDefined()
      expect(encryption.crypto).toBeDefined()
    })

    it('should track conversation info', async () => {
      const participants = ['user1', 'user2']
      const conversation = await encryption.initializeConversation('test-conv', participants)
      
      expect(conversation.conversationId).toBe('test-conv')
      expect(conversation.participants).toEqual(participants)
      expect(conversation.status).toBe('initialized')

      const info = encryption.getConversationInfo('test-conv')
      expect(info.hasKey).toBe(true)
      expect(info.messageCount).toBe(0)
    })

    it('should get encryption stats', () => {
      const stats = encryption.getEncryptionStats()
      expect(stats.totalConversations).toBe(0)
      expect(stats.totalMessages).toBe(0)
      expect(stats.activeKeys).toBe(0)
    })
  })
})

// Integration test
describe('UltraChat Integration', () => {
  it('should work together seamlessly', async () => {
    // Clear storage
    localStorage.clear()

    // Initialize components
    const profileManager = new ProfileManager()
    const storage = new LocalStorage()
    await storage.initialize()

    // Create and switch profile
    profileManager.switchMode('Ultra')
    const profile = profileManager.updateProfile('Ultra', {
      displayName: 'Integration Test User',
      bio: 'Testing integration'
    })

    // Store profile
    await storage.storeProfile(profile)
    const storedProfile = await storage.getProfile()

    expect(storedProfile.displayName).toBe('Integration Test User')
    expect(storedProfile.mode).toBe('Ultra')

    // Test social handles
    const socialHandles = new SocialHandles()
    const validation = socialHandles.validateHandle('twitter', '@testuser')
    expect(validation.valid).toBe(true)

    // Everything working together
    expect(true).toBe(true)
  })
})
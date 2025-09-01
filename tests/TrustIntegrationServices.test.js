import { describe, it, expect, beforeEach, vi } from 'vitest'
import TrustIntegrationServices from '../src/services/Integration/TrustIntegrationServices';

// Mock dependencies
const mockTrustManager = {
  calculateTrustScore: vi.fn(),
  getEndorsementsForUser: vi.fn()
};

const mockAuditManager = {};

const mockMessageManagement = {};

const mockProfileManager = {
  getProfile: vi.fn()
};

const mockLocalStorage = {
  retrieve: vi.fn(),
  store: vi.fn(),
  getConversations: vi.fn(),
  getMessages: vi.fn()
};

// Mock the LocalStorage class
vi.mock('../src/utils/LocalStorage', () => {
  return {
    default: vi.fn().mockImplementation(() => mockLocalStorage)
  };
});

// Mock Constants
vi.mock('../src/utils/Constants', () => ({
  default: {
    TRUST_LEVELS: {
      UNKNOWN: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      VERIFIED: 4,
      MAXIMUM: 5
    },
    TRUST: {
      CACHE_TIMEOUT: 300000 // 5 minutes
    }
  }
}));

describe('TrustIntegrationServices', () => {
  let trustIntegrationServices;

  beforeEach(() => {
    trustIntegrationServices = new TrustIntegrationServices(
      mockTrustManager,
      mockAuditManager,
      mockMessageManagement,
      mockProfileManager
    );
    
    // Reset all mocks
    vi.clearAllMocks();
  });

  it('should initialize successfully', async () => {
    mockLocalStorage.retrieve.mockResolvedValue([]);
    
    await trustIntegrationServices.initialize();
    
    expect(trustIntegrationServices.initialized).toBe(true);
  });

  it('should validate trust across services', async () => {
    const user = { id: 'user123' };
    const services = ['messaging', 'file_sharing'];
    
    // Mock trust profile
    mockTrustManager.calculateTrustScore.mockResolvedValue({
      score: 75,
      level: 3 // HIGH
    });
    
    mockTrustManager.getEndorsementsForUser.mockResolvedValue([
      { trustScore: 80 },
      { trustScore: 70 }
    ]);
    
    mockProfileManager.getProfile.mockResolvedValue({
      mode: 'Ultra',
      createdAt: new Date().toISOString()
    });
    
    mockLocalStorage.getConversations.mockResolvedValue([]);
    
    const result = await trustIntegrationServices.validateTrustAcrossServices(user, services);
    
    expect(result.trusted).toBe(true);
    expect(result.services).toHaveProperty('messaging');
    expect(result.services).toHaveProperty('file_sharing');
  });

  it('should reject insufficient trust for crypto tipping', async () => {
    const user = { id: 'user123' };
    const trustProfile = {
      trustLevel: 1 // LOW
    };
    
    const context = { amount: 500 }; // Large amount
    
    const result = await trustIntegrationServices.validateCryptoTippingTrust(user, trustProfile, context);
    
    expect(result.trusted).toBe(false);
    expect(result.reason).toContain('Large tips require medium trust level or higher');
  });

  it('should calculate activity score', async () => {
    mockLocalStorage.getConversations.mockResolvedValue([
      { id: 'conv1' },
      { id: 'conv2' }
    ]);
    
    mockLocalStorage.getMessages.mockResolvedValue([
      { type: 'text' },
      { type: 'file' },
      { type: 'text' }
    ]);
    
    mockProfileManager.getProfile.mockResolvedValue({
      groups: ['group1', 'group2']
    });
    
    const score = await trustIntegrationServices.calculateActivityScore('user123');
    
    expect(score.messages).toBeGreaterThanOrEqual(0);
    expect(score.files).toBeGreaterThanOrEqual(0);
    expect(score.groups).toBeGreaterThanOrEqual(0);
  });

  it('should get max file size for trust level', () => {
    // High trust level
    let maxSize = trustIntegrationServices.getMaxFileSizeForTrustLevel(3); // HIGH
    expect(maxSize).toBe(100 * 1024 * 1024); // 100MB
    
    // Medium trust level
    maxSize = trustIntegrationServices.getMaxFileSizeForTrustLevel(2); // MEDIUM
    expect(maxSize).toBe(50 * 1024 * 1024); // 50MB
    
    // Low trust level
    maxSize = trustIntegrationServices.getMaxFileSizeForTrustLevel(1); // LOW
    expect(maxSize).toBe(10 * 1024 * 1024); // 10MB
    
    // Unknown trust level
    maxSize = trustIntegrationServices.getMaxFileSizeForTrustLevel(0); // UNKNOWN
    expect(maxSize).toBe(5 * 1024 * 1024); // 5MB
  });
});
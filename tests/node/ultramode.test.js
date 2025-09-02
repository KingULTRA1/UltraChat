// UltraMode Tests
import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock fs and child_process
const mockFs = {
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  unlinkSync: vi.fn(),
  copyFileSync: vi.fn()
}

// Mock the modules
vi.mock('fs', () => ({
  default: mockFs,
  existsSync: mockFs.existsSync,
  readFileSync: mockFs.readFileSync,
  writeFileSync: mockFs.writeFileSync,
  unlinkSync: mockFs.unlinkSync,
  copyFileSync: mockFs.copyFileSync
}))

vi.mock('child_process', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    execSync: vi.fn(() => "v1.0.0\n"),
  };
})

describe('UltraMode Versioning', () => {
  let getCurrentVersion, incrementVersion, detectChangeType, VERSION_TYPES;

  beforeEach(async () => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Reset modules to ensure clean state
    vi.resetModules();
    
    // Dynamically import the functions after mocks are set up
    const ultramode = await import('../../ultramode.mjs');
    ({ getCurrentVersion, incrementVersion, detectChangeType, VERSION_TYPES } = ultramode);
  });

  describe('getCurrentVersion', () => {
    it('should get version from VERSION file if it exists', () => {
      mockFs.existsSync.mockImplementation(file => file === 'VERSION')
      mockFs.readFileSync.mockImplementation(file => (file === 'VERSION' ? 'v1.2.3.Final' : ''))

      const version = getCurrentVersion()
      expect(version).toBe('v1.2.3.Final')
    })

    it('should get version from package.json if VERSION file does not exist', () => {
      mockFs.existsSync.mockImplementation(file => file === 'package.json')
      mockFs.readFileSync.mockImplementation(file =>
        file === 'package.json' ? JSON.stringify({ version: '1.2.3' }) : ''
      )

      const version = getCurrentVersion()
      expect(version).toBe('v1.2.3')
    })

    it('should default to v1.0.0 if no version files exist', () => {
      mockFs.existsSync.mockReturnValue(false)

      const version = getCurrentVersion()
      expect(version).toBe('v1.0.0')
    })
  })

  describe('incrementVersion', () => {
    it('should increment patch version correctly', () => {
      expect(incrementVersion('v1.2.3.Final', VERSION_TYPES.PATCH)).toBe('v1.2.4.Final')
    })
    it('should increment minor version correctly', () => {
      expect(incrementVersion('v1.2.3.Final', VERSION_TYPES.MINOR)).toBe('v1.3.0.Final')
    })
    it('should increment major version correctly', () => {
      expect(incrementVersion('v1.2.3.Final', VERSION_TYPES.MAJOR)).toBe('v2.0.0.Final')
    })
    it('should handle versions without suffix', () => {
      expect(incrementVersion('v1.2.3', VERSION_TYPES.PATCH)).toBe('v1.2.4.Final')
    })
    it('should preserve existing suffix', () => {
      expect(incrementVersion('v1.2.3.Final', VERSION_TYPES.PATCH)).toBe('v1.2.4.Final')
    })
  })

  describe('detectChangeType', () => {
    it('should detect major change when core files are modified', () => {
      const changes = { added: [], modified: ['package.json'], deleted: [] }
      expect(detectChangeType(changes)).toBe(VERSION_TYPES.MAJOR)
    })

    it('should detect minor change when service files are modified', () => {
      const changes = { added: [], modified: ['src/services/Messaging/MessageEngine.js'], deleted: [] }
      expect(detectChangeType(changes)).toBe(VERSION_TYPES.MINOR)
    })

    it('should detect patch change for small modifications', () => {
      const changes = { added: [], modified: ['src/utils/Constants.js'], deleted: [] }
      expect(detectChangeType(changes)).toBe(VERSION_TYPES.PATCH)
    })

    it('should detect major change when added files affect core architecture', () => {
      const changes = { added: ['vite.config.js'], modified: [], deleted: [] }
      expect(detectChangeType(changes)).toBe(VERSION_TYPES.MAJOR)
    })
  })
})
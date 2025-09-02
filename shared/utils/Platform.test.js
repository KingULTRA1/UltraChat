// Test file for platform utility
import Platform, { 
  isWeb, 
  isMobile, 
  isIOS, 
  isAndroid, 
  isDesktop,
  getStorage,
  getCrypto
} from './Platform';

describe('Platform Utility', () => {
  beforeEach(() => {
    // Reset window object before each test
    delete global.window;
  });

  test('should detect web platform', () => {
    global.window = {
      ReactNative: undefined,
      ELECTRON: undefined,
      navigator: { userAgent: 'Mozilla/5.0' }
    };
    expect(isWeb()).toBe(true);
    expect(isMobile()).toBe(false);
    expect(isDesktop()).toBe(false);
  });

  test('should detect mobile platform', () => {
    global.window = {
      ReactNative: true,
      ELECTRON: undefined,
      navigator: { userAgent: 'Mozilla/5.0' }
    };
    expect(isWeb()).toBe(false);
    expect(isMobile()).toBe(true);
    expect(isDesktop()).toBe(false);
  });

  test('should detect desktop platform', () => {
    global.window = {
      ReactNative: undefined,
      ELECTRON: true,
      navigator: { userAgent: 'Mozilla/5.0' }
    };
    expect(isWeb()).toBe(false);
    expect(isMobile()).toBe(false);
    expect(isDesktop()).toBe(true);
  });

  test('should return fallback storage when no window', () => {
    const storage = getStorage();
    expect(storage).toBeDefined();
    expect(typeof storage.getItem).toBe('function');
    expect(typeof storage.setItem).toBe('function');
    expect(typeof storage.removeItem).toBe('function');
  });

  test('should return fallback crypto when no window', () => {
    const crypto = getCrypto();
    expect(crypto).toBeDefined();
    expect(typeof crypto.getRandomValues).toBe('function');
    expect(crypto.subtle).toBeDefined();
  });
});
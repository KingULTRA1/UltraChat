import { UltraBrowser } from '../src/utils';

describe('UltraBrowser', () => {
  beforeEach(() => {
    // Clear history and reset blocked sites
    UltraBrowser.history = [];
    UltraBrowser.blockedSites = ["google.com", "www.google.com"];
  });

  test('should block google sites by default', () => {
    const result = UltraBrowser.visit('https://www.google.com');
    expect(result).toBe('Access denied: https://www.google.com 🚫');
  });

  test('should allow non-blocked sites', () => {
    const result = UltraBrowser.visit('https://www.example.com');
    expect(result).toBe('Browsing: https://www.example.com');
  });

  test('should add sites to blocked list', () => {
    UltraBrowser.addBlockedSite('example.com');
    const result = UltraBrowser.visit('https://www.example.com');
    expect(result).toBe('Access denied: https://www.example.com 🚫');
  });

  test('should track browsing history', () => {
    UltraBrowser.visit('https://www.example.com');
    UltraBrowser.visit('https://www.github.com');
    
    const history = UltraBrowser.getHistory();
    expect(history).toHaveLength(2);
    expect(history).toContain('https://www.example.com');
    expect(history).toContain('https://www.github.com');
  });
});
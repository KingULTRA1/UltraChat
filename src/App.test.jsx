import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = JSON.stringify(value),
    removeItem: (key) => delete store[key],
    clear: () => store = {}
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock TrustManager
vi.mock('./services/Trust/TrustManager', () => ({
  default: {
    initialize: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock LocalStorage utility
vi.mock('./utils/LocalStorage', () => ({
  default: {
    getItem: vi.fn((key) => localStorageMock.getItem(key)),
    setItem: vi.fn((key, value) => localStorageMock.setItem(key, value)),
    removeItem: vi.fn((key) => localStorageMock.removeItem(key))
  }
}));

describe('App Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Just check that the app renders without crashing
    expect(screen.getByText('UltraChat 1.2.3.4 Final')).toBeInTheDocument();
  });
});
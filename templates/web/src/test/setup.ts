/**
 * Test Setup Configuration
 * 
 * This file configures the testing environment for React components
 * with jsdom, React Testing Library, and security-focused testing utilities.
 * 
 * Features:
 * - React Testing Library global setup
 * - jsdom environment configuration
 * - Custom matchers and utilities
 * - Security testing helpers
 * - Performance testing setup
 */

import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Extend Vitest's expect with Testing Library matchers
expect.extend({
  // Add custom matchers here if needed
});

// Global test setup
beforeAll(() => {
  // Start Mock Service Worker for API mocking
  if (typeof server !== 'undefined') {
    server.listen({ onUnhandledRequest: 'error' });
  }
  
  // Setup global test environment
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  }));
  
  // Security: Mock potentially dangerous APIs
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
  
  Object.defineProperty(window, 'sessionStorage', {
    value: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    writable: true,
  });
});

// Cleanup after each test
afterEach(() => {
  // Clean up React Testing Library
  cleanup();
  
  // Reset MSW handlers
  if (typeof server !== 'undefined') {
    server.resetHandlers();
  }
  
  // Clear all mocks
  vi.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

// Global test teardown
afterAll(() => {
  // Stop Mock Service Worker
  if (typeof server !== 'undefined') {
    server.close();
  }
});

// Global test utilities
declare global {
  namespace Vi {
    interface TestUtils {
      // Add custom test utilities here
    }
  }
}

// Performance testing helper
export const measurePerformance = (fn: () => void): number => {
  const start = performance.now();
  fn();
  const end = performance.now();
  return end - start;
};

// Security testing helper
export const sanitizeTestData = (data: unknown): unknown => {
  // Remove potentially dangerous properties from test data
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    delete (sanitized as any).__proto__;
    delete (sanitized as any).constructor;
    return sanitized;
  }
  return data;
};

// Accessibility testing helper
export const checkA11y = async (element: HTMLElement): Promise<void> => {
  // Basic accessibility checks
  if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
    throw new Error('Image element missing alt attribute');
  }
  
  if (element.tagName === 'BUTTON' && !element.textContent?.trim()) {
    throw new Error('Button element missing accessible text');
  }
  
  // Add more accessibility checks as needed
};

// Test data factory
export const createTestUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  ...sanitizeTestData(overrides),
});

// Mock API response factory
export const createMockApiResponse = <T>(data: T, overrides = {}) => ({
  data,
  status: 200,
  message: 'Success',
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Error boundary testing helper
export const ErrorBoundaryTest: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (hasError) {
    return <div data-testid="error-boundary">Something went wrong</div>;
  }
  
  try {
    return <>{children}</>;
  } catch (error) {
    setHasError(true);
    return <div data-testid="error-boundary">Something went wrong</div>;
  }
};
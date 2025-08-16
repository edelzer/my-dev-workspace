/**
 * Jest Test Setup
 * 
 * Global setup and configuration for configuration management tests
 */

const fs = require('fs').promises;
const path = require('path');

// Global test timeout
jest.setTimeout(30000);

// Suppress console.log during tests unless explicitly needed
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Only suppress console output if not in verbose mode
  if (!process.env.JEST_VERBOSE) {
    console.log = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  /**
   * Create a temporary directory for test files
   */
  async createTempDir(baseName = 'test') {
    const tempDir = path.join(__dirname, 'temp', `${baseName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    await fs.mkdir(tempDir, { recursive: true });
    return tempDir;
  },

  /**
   * Clean up temporary directory
   */
  async cleanupTempDir(tempDir) {
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      console.warn(`Failed to cleanup temp directory ${tempDir}:`, error.message);
    }
  },

  /**
   * Read JSON file and parse
   */
  async readJsonFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  },

  /**
   * Check if file exists
   */
  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Wait for a specified amount of time
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Validate that an object matches expected structure
   */
  validateObjectStructure(obj, expectedStructure) {
    for (const key in expectedStructure) {
      if (expectedStructure[key] === 'required') {
        expect(obj).toHaveProperty(key);
      } else if (typeof expectedStructure[key] === 'object') {
        expect(obj).toHaveProperty(key);
        this.validateObjectStructure(obj[key], expectedStructure[key]);
      }
    }
  },

  /**
   * Generate test configuration
   */
  generateTestConfig(overrides = {}) {
    const defaultConfig = {
      application: {
        name: 'test-app',
        version: '1.0.0',
        environment: 'testing',
        debug: true
      },
      server: {
        host: '0.0.0.0',
        port: 8000
      },
      database: {
        url: 'sqlite:///test.db'
      },
      security: {
        jwt: {
          secret: 'test-secret-key-not-for-production',
          algorithm: 'HS256',
          accessTokenExpiry: 3600
        }
      }
    };

    return this.deepMerge(defaultConfig, overrides);
  },

  /**
   * Deep merge utility
   */
  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
};

// Global test matchers
expect.extend({
  /**
   * Check if a configuration object is valid
   */
  toBeValidConfiguration(received) {
    const pass = received && 
                 typeof received === 'object' &&
                 received.application &&
                 received.server &&
                 typeof received.application.name === 'string' &&
                 typeof received.server.port === 'number';

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid configuration`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid configuration`,
        pass: false,
      };
    }
  },

  /**
   * Check if a file path exists
   */
  async toExistAsFile(received) {
    try {
      const stats = await fs.stat(received);
      const pass = stats.isFile();
      
      if (pass) {
        return {
          message: () => `expected file ${received} not to exist`,
          pass: true,
        };
      } else {
        return {
          message: () => `expected ${received} to exist as a file`,
          pass: false,
        };
      }
    } catch (error) {
      return {
        message: () => `expected ${received} to exist as a file, but got error: ${error.message}`,
        pass: false,
      };
    }
  },

  /**
   * Check if a configuration has secure production settings
   */
  toHaveSecureProductionSettings(received) {
    const issues = [];
    
    if (received.application?.debug === true) {
      issues.push('debug mode is enabled');
    }
    
    if (received.security?.jwt?.secret === 'test-secret-key-not-for-production') {
      issues.push('using test JWT secret');
    }
    
    if (received.cors?.allowedOrigins?.includes('*')) {
      issues.push('allowing wildcard CORS origins');
    }
    
    if (received.server?.ssl?.enabled !== true) {
      issues.push('SSL is not enabled');
    }
    
    const pass = issues.length === 0;
    
    if (pass) {
      return {
        message: () => `expected configuration not to have secure production settings`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected configuration to have secure production settings, but found issues: ${issues.join(', ')}`,
        pass: false,
      };
    }
  }
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Cleanup function for test files
global.afterEach(async () => {
  // Clean up any test files that might have been created
  const testTempDir = path.join(__dirname, 'temp');
  try {
    const files = await fs.readdir(testTempDir);
    for (const file of files) {
      if (file.startsWith('test-') || file.includes('-test-')) {
        const filePath = path.join(testTempDir, file);
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          await fs.rmdir(filePath, { recursive: true });
        } else {
          await fs.unlink(filePath);
        }
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
});

console.log('Configuration Management Test Suite Setup Complete');
/**
 * Jest Base Configuration
 * 
 * This configuration provides common Jest testing settings with
 * security-first approach and comprehensive coverage requirements.
 * 
 * Security & Quality Features:
 * - Strict coverage thresholds to ensure comprehensive testing
 * - Security-conscious file exclusions
 * - Performance optimizations for CI/CD environments
 * - TDD-friendly watch mode configurations
 * 
 * Usage:
 * In your project's jest.config.js:
 * const baseConfig = require('./config/base/jest.base.js');
 * module.exports = {
 *   ...baseConfig,
 *   // project-specific overrides
 * };
 * 
 * Or in package.json:
 * "jest": {
 *   "preset": "./config/base/jest.base.js"
 * }
 */

module.exports = {
  // === CORE CONFIGURATION ===
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // === TEST FILE PATTERNS ===
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{js,ts,jsx,tsx}',
    '**/?(*.)+(spec|test).{js,ts,jsx,tsx}',
    '**/tests/**/*.{js,ts,jsx,tsx}',
  ],
  
  // Test file extensions
  testRegex: [
    '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?|mjs)$',
  ],
  
  // Module file extensions
  moduleFileExtensions: [
    'ts',
    'tsx', 
    'js',
    'jsx',
    'json',
    'node',
    'mjs',
  ],
  
  // === TYPESCRIPT CONFIGURATION ===
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    }],
    '^.+\\.(js|jsx|mjs)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
    }],
  },
  
  // Transform ignore patterns (security-conscious)
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|.*\\.esm\\.js$))',
    '\\.(css|less|scss|sass)$',
  ],
  
  // === MODULE RESOLUTION ===
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/types$': '<rootDir>/src/types/index',
    '^@/utils$': '<rootDir>/src/utils/index',
    '^@/config$': '<rootDir>/src/config/index',
    '^@/test/(.*)$': '<rootDir>/src/test/$1',
  },
  
  // Module directories
  moduleDirectories: ['node_modules', 'src'],
  
  // === SETUP & TEARDOWN ===
  setupFilesAfterEnv: [
    '<rootDir>/src/test/setup.ts',
  ],
  
  // Global setup/teardown
  // globalSetup: '<rootDir>/src/test/globalSetup.ts',
  // globalTeardown: '<rootDir>/src/test/globalTeardown.ts',
  
  // === COVERAGE CONFIGURATION (Security-First) ===
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx,js,jsx}',
    '!src/**/*.config.{ts,js}',
    '!src/types/**/*',
    '!src/test/**/*',
    '!src/index.{ts,js}',
    '!src/main.{ts,tsx,js,jsx}',
    '!src/**/*.mock.{ts,js}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'json',
    'json-summary',
    'html',
    'lcov',
    'clover',
  ],
  
  // Coverage output directory
  coverageDirectory: 'coverage',
  
  // Strict coverage thresholds (security & quality)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Per-file thresholds can be added here
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // === PERFORMANCE & TIMEOUTS ===
  testTimeout: 10000,           // 10 seconds max per test
  setupFilesAfterEnvTimeout: 30000,
  
  // === WATCH MODE (TDD Support) ===
  watchPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
    '<rootDir>/coverage/',
    '<rootDir>/.git/',
    '<rootDir>/.next/',
  ],
  
  // Watch plugins for better TDD experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  
  // === ERROR HANDLING ===
  errorOnDeprecated: true,
  verbose: true,
  detectOpenHandles: true,
  detectLeaks: true,
  forceExit: false,
  
  // === MOCKING ===
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Mock patterns
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // === SECURITY & ISOLATION ===
  testEnvironmentOptions: {
    // Node.js environment options
    url: 'http://localhost',
    userAgent: 'jest-test-agent',
  },
  
  // Sandboxing
  isolatedModules: true,
  resetModules: true,
  
  // === SNAPSHOT TESTING ===
  snapshotSerializers: [
    // Add snapshot serializers as needed
  ],
  
  // === PARALLEL EXECUTION ===
  maxWorkers: '50%',            // Use half of available CPU cores
  maxConcurrency: 5,            // Max concurrent tests per worker
  
  // === BABEL CONFIGURATION (for JS files) ===
  globals: {
    'ts-jest': {
      useESM: false,
      isolatedModules: true,
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
      },
    },
  },
  
  // === REPORTERS ===
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'junit.xml',
      uniqueOutputName: false,
      addFileAttribute: true,
    }],
  ],
  
  // === CUSTOM MATCHERS ===
  // Add custom Jest matchers here if needed
  // setupFilesAfterEnv: ['<rootDir>/src/test/customMatchers.ts'],
  
  // === CACHE ===
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // === PROJECT CONFIGURATION ===
  displayName: {
    name: 'UNIT_TESTS',
    color: 'blue',
  },
  
  // === NOTIFICATION (Development) ===
  notify: false,
  notifyMode: 'failure-change',
};
/**
 * API Template Jest Configuration
 * 
 * This configuration extends the base Jest configuration with
 * API-specific settings for Node.js backend testing.
 * 
 * Migration Status: ✅ Migrated to use base configuration
 * - Base config: ../../config/base/jest.base.js
 * - API-specific overrides for Node.js environment
 * 
 * Benefits of migration:
 * - Eliminated configuration duplication
 * - Improved maintainability across templates
 * - Consistent testing standards
 * - Centralized test configuration management
 */

const baseConfig = require('../../config/base/jest.base.js');

module.exports = {
  // Extend base configuration
  ...baseConfig,
  
  // API-specific overrides
  displayName: {
    name: 'API_TESTS',
    color: 'green',
  },
  
  // Node.js environment for API testing
  testEnvironment: 'node',
  
  // API-specific test patterns
  testMatch: [
    '**/__tests__/**/*.{js,ts}',
    '**/?(*.)+(spec|test).{js,ts}',
    '**/tests/**/*.{js,ts}',
  ],
  
  // Module file extensions (no JSX for API)
  moduleFileExtensions: [
    'ts',
    'js',
    'json',
    'node',
    'mjs',
  ],
  
  // API-specific module mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/types$': '<rootDir>/src/types/index',
    '^@/utils$': '<rootDir>/src/utils/index',
    '^@/config$': '<rootDir>/src/config/index',
    '^@/models$': '<rootDir>/src/models/index',
    '^@/routes$': '<rootDir>/src/routes/index',
    '^@/middleware$': '<rootDir>/src/middleware/index',
    '^@/services$': '<rootDir>/src/services/index',
    '^@/database$': '<rootDir>/src/database/index',
    '^@/test/(.*)$': '<rootDir>/src/test/$1',
  },
  
  // API-specific setup files
  setupFilesAfterEnv: [
    '<rootDir>/src/test/setup.ts',
  ],
  
  // API-specific coverage collection
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,js}',
    '!src/**/*.config.{ts,js}',
    '!src/types/**/*',
    '!src/test/**/*',
    '!src/index.{ts,js}',
    '!src/server.{ts,js}',
    '!src/app.{ts,js}',
    '!src/**/*.mock.{ts,js}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/uploads/**',
    '!**/logs/**',
  ],
  
  // API-specific coverage thresholds (stricter for backend)
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    // Stricter for critical API components
    './src/routes/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/middleware/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  
  // API-specific timeout (longer for integration tests)
  testTimeout: 15000,
  
  // API-specific watch patterns
  watchPathIgnorePatterns: [
    ...baseConfig.watchPathIgnorePatterns,
    '<rootDir>/uploads/',
    '<rootDir>/logs/',
    '<rootDir>/public/',
    '<rootDir>/static/',
  ],
  
  // API-specific test environment options
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    userAgent: 'jest-api-test-agent',
  },
  
  // API-specific globals for ts-jest
  globals: {
    'ts-jest': {
      useESM: false,
      isolatedModules: true,
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
  
  // Transform configuration for Node.js
  transform: {
    '^.+\\.(ts)$': ['ts-jest', {
      tsconfig: {
        target: 'ES2020',
        module: 'commonjs',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    }],
    '^.+\\.(js|mjs)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
    }],
  },
  
  // Ignore patterns for transformation
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|.*\\.esm\\.js$))',
  ],
  
  // API-specific reporters
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'coverage',
      outputName: 'api-junit.xml',
      uniqueOutputName: false,
      addFileAttribute: true,
      ancestorSeparator: ' › ',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
    }],
  ],
};
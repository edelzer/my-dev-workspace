/**
 * API Template ESLint Configuration Overrides
 * 
 * This file contains API-specific ESLint rule overrides that extend
 * the base configuration for backend/API development.
 * 
 * API-Specific Features:
 * - Stricter security rules for server-side code
 * - Node.js best practices and environment
 * - CommonJS module support for Node.js
 * - Higher complexity tolerance for backend logic
 * - Special handling for configuration and CLI files
 * 
 * Usage:
 * This file is automatically used by templates/api/.eslintrc.js
 */

module.exports = {
  // API-specific environment
  env: {
    node: true,
    jest: true,
    es2021: true,
  },

  // API-specific parser options
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module', // Support both CommonJS and ES modules
  },

  // API-specific rule overrides
  rules: {
    // === TYPESCRIPT RULES (API-specific overrides) ===
    '@typescript-eslint/explicit-function-return-type': ['warn', { 
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
    }],
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'error', // Stricter for APIs
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    
    // === SECURITY RULES (Critical overrides for API security) ===
    'security/detect-object-injection': 'error', // Stricter for APIs
    'security/detect-child-process': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    
    // === NODE.JS BEST PRACTICES ===
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-process-exit': 'error',
    'no-process-env': 'warn', // Environment variables should be handled through config
    'no-sync': 'warn', // Avoid synchronous operations in Node.js
    
    // === CODE QUALITY RULES (API-specific) ===
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    
    // === ERROR HANDLING (Critical for APIs) ===
    'prefer-promise-reject-errors': 'error',
    'no-throw-literal': 'error',
    
    // === SONARJS RULES (API-specific adjustments) ===
    'sonarjs/cognitive-complexity': ['error', 20], // Higher for backend logic
    'sonarjs/no-duplicate-string': ['error', 5], // Stricter for APIs
  },

  // API-specific overrides for different file types
  overrides: [
    {
      // Test files - relaxed rules
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        'sonarjs/no-duplicate-string': 'off',
        'security/detect-object-injection': 'warn',
        'no-console': 'off', // Allow console in tests
      },
    },
    {
      // Configuration files - environment access allowed
      files: ['src/config/**/*.ts', '**/config.ts', '**/configuration.ts'],
      rules: {
        'no-process-env': 'off', // Configuration files can access process.env
        '@typescript-eslint/no-magic-numbers': 'off',
      },
    },
    {
      // CLI and script files - more permissive
      files: ['src/scripts/**/*.ts', 'src/cli/**/*.ts', '**/cli.ts'],
      rules: {
        'no-console': 'off', // CLI scripts can use console
        'no-process-exit': 'off', // CLI scripts can use process.exit
        'no-process-env': 'off', // Scripts may need env access
      },
    },
    {
      // Database/migration files - special handling
      files: ['src/database/**/*.ts', 'src/migrations/**/*.ts', '**/migration*.ts'],
      rules: {
        'sonarjs/no-duplicate-string': 'off', // SQL strings may be duplicated
        '@typescript-eslint/no-magic-numbers': 'off', // DB schemas use numbers
      },
    },
    {
      // Server/app entry points
      files: ['src/app.ts', 'src/server.ts', 'src/index.ts', 'src/main.ts'],
      rules: {
        'no-console': 'off', // Server startup can use console
        'no-process-env': 'off', // Entry points configure environment
      },
    },
  ],

  // API-specific ignore patterns
  ignorePatterns: [
    'dist/',
    'build/',
    'node_modules/',
    'coverage/',
    '*.js', // Ignore compiled JS files
    '*.d.ts', // Ignore declaration files
    'public/', // Static assets
    'uploads/', // File uploads
    'logs/', // Log files
  ],
};
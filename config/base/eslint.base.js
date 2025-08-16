/**
 * ESLint Base Configuration
 * 
 * This configuration provides common ESLint rules and security settings
 * that can be extended by project-specific configurations.
 * 
 * Security-First Approach:
 * - Includes security plugin rules to prevent common vulnerabilities
 * - Enforces strict TypeScript rules for type safety
 * - Includes SonarJS rules for code quality and security
 * 
 * Usage:
 * In your project's eslint.config.js:
 * const baseConfig = require('./config/base/eslint.base.js');
 * module.exports = {
 *   ...baseConfig,
 *   // project-specific overrides
 * };
 */

module.exports = {
  // Environment configuration - common across all projects
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },

  // Core extends - security-first approach
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'prettier', // Must be last to override other configs
  ],

  // Parser configuration for TypeScript
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },

  // Essential plugins for security and quality
  plugins: [
    '@typescript-eslint',
    'security',      // Security rules to prevent vulnerabilities
    'sonarjs',       // Code quality and complexity rules
  ],

  // Core rules - security-first and quality-focused
  rules: {
    // === FORMATTING & STYLE (handled by Prettier, but enforced) ===
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],

    // === TYPESCRIPT RULES (Security & Type Safety) ===
    'no-unused-vars': 'off', // Handled by TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'warn',

    // === SECURITY RULES (Critical for all projects) ===
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'warn',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-pseudoRandomBytes': 'error',

    // === CODE QUALITY RULES (SonarJS) ===
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/max-switch-cases': ['error', 30],
    'sonarjs/no-all-duplicated-branches': 'error',
    'sonarjs/no-collapsible-if': 'error',
    'sonarjs/no-collection-size-mischeck': 'error',
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-duplicated-branches': 'error',
    'sonarjs/no-element-overwrite': 'error',
    'sonarjs/no-empty-collection': 'error',
    'sonarjs/no-extra-arguments': 'error',
    'sonarjs/no-identical-conditions': 'error',
    'sonarjs/no-identical-expressions': 'error',
    'sonarjs/no-ignored-return': 'error',
    'sonarjs/no-inverted-boolean-check': 'error',
    'sonarjs/no-one-iteration-loop': 'error',
    'sonarjs/no-redundant-boolean': 'error',
    'sonarjs/no-redundant-jump': 'error',
    'sonarjs/no-same-line-conditional': 'error',
    'sonarjs/no-small-switch': 'error',
    'sonarjs/no-unused-collection': 'error',
    'sonarjs/no-use-of-empty-return-value': 'error',
    'sonarjs/no-useless-catch': 'error',
    'sonarjs/prefer-immediate-return': 'error',
    'sonarjs/prefer-object-literal': 'error',
    'sonarjs/prefer-single-boolean-return': 'error',
    'sonarjs/prefer-while': 'error',

    // === GENERAL BEST PRACTICES ===
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', {
      array: true,
      object: true,
    }],
    'prefer-template': 'error',
    'template-curly-spacing': ['error', 'never'],
    'no-template-curly-in-string': 'error',

    // === ERROR PREVENTION ===
    'no-unreachable': 'error',
    'no-unexpected-multiline': 'error',
    'no-unneeded-ternary': 'error',
    'no-nested-ternary': 'error',
    'complexity': ['error', 10],
    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
    'max-params': ['error', 4],

    // === ASYNC/PROMISE RULES ===
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'no-promise-executor-return': 'error',
    'prefer-promise-reject-errors': 'error',
    'require-atomic-updates': 'error',
  },

  // Global settings
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },

  // Ignore patterns - security-conscious defaults
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
    '*.bundle.js',
    'public/',
    '.env*',
    '*.config.js', // Allow config files to have different rules
  ],
};
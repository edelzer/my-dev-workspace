module.exports = {
  root: true,
  extends: [
    '../../config/eslint-base.config.js',
  ],
  env: {
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json',
  },
  rules: {
    // TypeScript rules - API-specific overrides
    '@typescript-eslint/explicit-function-return-type': ['warn', { allowExpressions: true }],
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-explicit-any': 'error', // Stricter for APIs
    '@typescript-eslint/ban-ts-comment': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    
    // Security rules - Critical overrides for API security
    'security/detect-object-injection': 'error', // Stricter for APIs
    'security/detect-child-process': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    
    // Node.js best practices
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-process-exit': 'error',
    'no-process-env': 'warn', // Environment variables should be handled through config
    'no-sync': 'warn', // Avoid synchronous operations in Node.js
    
    // Code quality rules - API-specific
    'object-shorthand': 'error',
    'prefer-destructuring': ['error', { object: true, array: false }],
    
    // Error handling - Critical for APIs
    'prefer-promise-reject-errors': 'error',
    'no-throw-literal': 'error',
    
    // SonarJS rules - API-specific adjustments
    'sonarjs/cognitive-complexity': ['error', 20], // Higher for backend logic
    'sonarjs/no-duplicate-string': ['error', 5], // Stricter for APIs
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.spec.ts'],
      rules: {
        // Relax some rules for test files
        '@typescript-eslint/no-explicit-any': 'warn',
        'sonarjs/no-duplicate-string': 'off',
        'security/detect-object-injection': 'warn',
      },
    },
    {
      files: ['src/config/**/*.ts'],
      rules: {
        // Configuration files can access process.env
        'no-process-env': 'off',
      },
    },
    {
      files: ['src/scripts/**/*.ts', 'src/cli/**/*.ts'],
      rules: {
        // CLI scripts can use console and process.exit
        'no-console': 'off',
        'no-process-exit': 'off',
      },
    },
  ],
  ignorePatterns: [
    'dist/',
    'node_modules/',
    'coverage/',
    '*.js',
    '*.d.ts',
  ],
};
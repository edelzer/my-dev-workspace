/**
 * Web Template ESLint Configuration
 * 
 * This configuration extends the base ESLint configuration and adds
 * React/JSX specific rules and settings for web applications.
 * 
 * Features:
 * - React 18+ with modern JSX transform
 * - React Hooks rules for proper hook usage
 * - JSX Accessibility (jsx-a11y) for inclusive web apps
 * - React Refresh for development hot reloading
 * - Testing Library rules for React testing
 * - Storybook compatibility
 * 
 * Usage:
 * This file should be extended by Web template projects:
 * extends: ['./config/templates/web.eslint.js']
 */

const baseConfig = require('../base/eslint.base.js');

module.exports = {
  // Extend base configuration
  ...baseConfig,

  // Web-specific environment
  env: {
    ...baseConfig.env,
    browser: true,    // Enable browser globals
    es2021: true,     // Modern browser features
  },

  // Web-specific extends (React ecosystem)
  extends: [
    ...baseConfig.extends,
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],

  // Parser options for JSX
  parserOptions: {
    ...baseConfig.parserOptions,
    ecmaFeatures: {
      jsx: true,      // Enable JSX parsing
    },
  },

  // Web-specific plugins
  plugins: [
    ...baseConfig.plugins,
    'react',
    'react-hooks',
    'react-refresh',
    'jsx-a11y',
  ],

  // Web-specific rules and overrides
  rules: {
    ...baseConfig.rules,

    // === REACT RULES ===
    'react/react-in-jsx-scope': 'off',                    // Not needed with new JSX transform
    'react/jsx-uses-react': 'off',                        // Not needed with new JSX transform
    'react/prop-types': 'off',                            // Using TypeScript for prop validation
    'react/jsx-props-no-spreading': 'warn',               // Encourage explicit props
    'react/jsx-no-useless-fragment': 'warn',              // Clean JSX
    'react/jsx-key': 'error',                             // Required for lists
    'react/jsx-no-duplicate-props': 'error',              // Prevent duplicate props
    'react/jsx-no-undef': 'error',                        // Prevent undefined components
    'react/jsx-pascal-case': 'error',                     // Component naming convention
    'react/no-children-prop': 'error',                    // Use children correctly
    'react/no-danger-with-children': 'error',             // Security rule
    'react/no-deprecated': 'error',                       // Avoid deprecated APIs
    'react/no-direct-mutation-state': 'error',            // Immutable state
    'react/no-find-dom-node': 'error',                    // Use refs instead
    'react/no-is-mounted': 'error',                       // Avoid memory leaks
    'react/no-render-return-value': 'error',              // Proper render usage
    'react/no-string-refs': 'error',                      // Use callback refs
    'react/no-unescaped-entities': 'error',               // Escape HTML entities
    'react/no-unknown-prop': 'error',                     // Prevent typos
    'react/no-unsafe': 'error',                           // Avoid unsafe methods
    'react/require-render-return': 'error',               // Render must return

    // === REACT HOOKS RULES ===
    'react-hooks/rules-of-hooks': 'error',                // Enforce hook rules
    'react-hooks/exhaustive-deps': 'warn',                // Effect dependencies

    // === REACT REFRESH (Development) ===
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // === ACCESSIBILITY RULES (Strict for Web) ===
    'jsx-a11y/alt-text': 'error',                         // Images need alt text
    'jsx-a11y/aria-props': 'error',                       // Valid ARIA props
    'jsx-a11y/aria-proptypes': 'error',                   // ARIA prop types
    'jsx-a11y/aria-unsupported-elements': 'error',        // ARIA element support
    'jsx-a11y/role-has-required-aria-props': 'error',     // Required ARIA props
    'jsx-a11y/role-supports-aria-props': 'error',         // Supported ARIA props
    'jsx-a11y/heading-has-content': 'error',              // Headings need content
    'jsx-a11y/html-has-lang': 'error',                    // HTML lang attribute
    'jsx-a11y/lang': 'error',                             // Valid lang values
    'jsx-a11y/no-aria-hidden-on-focusable': 'error',      // Accessibility conflict
    'jsx-a11y/no-autofocus': 'warn',                      // UX consideration
    'jsx-a11y/no-distracting-elements': 'error',          // No marquee/blink
    'jsx-a11y/no-redundant-roles': 'error',               // Clean ARIA
    'jsx-a11y/no-static-element-interactions': 'warn',    // Interactive elements
    'jsx-a11y/click-events-have-key-events': 'warn',      // Keyboard accessibility

    // === WEB-SPECIFIC SECURITY OVERRIDES ===
    'security/detect-object-injection': 'warn',           // Less strict for client-side
    'security/detect-child-process': 'warn',              // Usually not applicable
    'security/detect-non-literal-fs-filename': 'warn',    // Usually not applicable
    'security/detect-non-literal-require': 'warn',        // Bundler handles this

    // === TYPESCRIPT OVERRIDES FOR REACT ===
    '@typescript-eslint/explicit-function-return-type': 'off', // React components often inferred
    '@typescript-eslint/explicit-module-boundary-types': 'off', // React props often inferred

    // === CODE QUALITY ADJUSTMENTS FOR FRONTEND ===
    'no-console': 'warn',                                 // Allow console in development
    'sonarjs/cognitive-complexity': ['error', 15],        // Lower threshold for components
    'max-lines-per-function': ['warn', 50],               // Reasonable for components
  },

  // React settings
  settings: {
    ...baseConfig.settings,
    react: {
      version: 'detect',                                  // Auto-detect React version
    },
  },

  // File-specific overrides
  overrides: [
    // Test files
    {
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
        'vitest-globals/env': true,
      },
      extends: ['plugin:testing-library/react'],
      rules: {
        'testing-library/await-async-query': 'error',
        'testing-library/no-await-sync-query': 'error',
        'testing-library/no-debugging-utils': 'warn',
        'testing-library/no-dom-import': 'error',
        'testing-library/prefer-screen-queries': 'error',
        'testing-library/render-result-naming-convention': 'error',
        
        // Relaxed rules for tests
        '@typescript-eslint/no-explicit-any': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'max-lines-per-function': 'off',
        'sonarjs/cognitive-complexity': 'off',
      },
    },

    // Storybook files
    {
      files: ['**/*.stories.{js,jsx,ts,tsx}'],
      rules: {
        'import/no-anonymous-default-export': 'off',
        'import/no-default-export': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },

    // Configuration files
    {
      files: ['**/*.config.{js,ts,mjs}', '**/vite.config.*'],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },

    // Entry point files
    {
      files: ['src/main.{ts,tsx}', 'src/index.{ts,tsx}'],
      rules: {
        'import/no-default-export': 'off',
      },
    },

    // Hook files
    {
      files: ['**/hooks/**/*.{ts,tsx}', '**/use*.{ts,tsx}'],
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
      },
    },

    // Component files
    {
      files: ['**/components/**/*.{tsx}', '**/pages/**/*.{tsx}'],
      rules: {
        'react/display-name': 'warn',
        'react/jsx-props-no-spreading': 'warn',
      },
    },
  ],
};
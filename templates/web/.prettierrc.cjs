/**
 * Web Template Prettier Configuration
 * 
 * This configuration extends the base Prettier configuration
 * and adds web-specific formatting rules for React applications.
 * 
 * Features:
 * - Consistent formatting across React/JSX files
 * - Optimized settings for component development
 * - Integration with ESLint formatting rules
 */

const baseConfig = require('../../config/base/prettier.base.js');

const webConfig = {
  // Web-specific overrides
  printWidth: 100,                    // Slightly wider for React components
  
  // JSX-specific formatting
  jsxSingleQuote: true,              // Consistent with JavaScript
  bracketSameLine: false,            // JSX closing bracket on new line for readability
  
  // File-specific overrides for web development
  overrides: [
    // React/JSX files - enhanced formatting
    {
      files: '*.{jsx,tsx}',
      options: {
        parser: 'typescript',
        jsxSingleQuote: true,
        bracketSameLine: false,
        arrowParens: 'avoid',
        trailingComma: 'es5',
        printWidth: 100,
      },
    },
    
    // Component files - specific formatting
    {
      files: '**/components/**/*.{tsx,jsx}',
      options: {
        printWidth: 100,
        bracketSameLine: false,
        jsxSingleQuote: true,
      },
    },
    
    // Hook files - compact formatting
    {
      files: ['**/hooks/**/*.{ts,tsx}', '**/use*.{ts,tsx}'],
      options: {
        printWidth: 120,              // Hooks can be longer
        arrowParens: 'avoid',
      },
    },
    
    // Test files - relaxed formatting
    {
      files: '*.{test,spec}.{js,ts,jsx,tsx}',
      options: {
        printWidth: 120,              // Allow longer test descriptions
        trailingComma: 'es5',
      },
    },
    
    // Story files - relaxed formatting
    {
      files: '*.stories.{js,ts,jsx,tsx}',
      options: {
        printWidth: 120,
        arrowParens: 'avoid',
      },
    },
    
    // Style files (CSS modules, styled-components)
    {
      files: '*.module.{css,scss}',
      options: {
        printWidth: 120,
        singleQuote: true,
      },
    },
    
    // Vite/build configuration files
    {
      files: ['vite.config.*', 'vitest.config.*', 'playwright.config.*'],
      options: {
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
  ],
  
  // Web-specific plugins (if available)
  plugins: [
    // '@trivago/prettier-plugin-sort-imports',  // For import sorting
    // 'prettier-plugin-tailwindcss',            // For Tailwind CSS class sorting
  ],
};

// Merge base configuration with web-specific config
module.exports = {
  ...baseConfig,
  ...webConfig,
  overrides: [
    ...(baseConfig.overrides || []),
    ...(webConfig.overrides || []),
  ],
  plugins: [
    ...(baseConfig.plugins || []),
    ...(webConfig.plugins || []),
  ],
};
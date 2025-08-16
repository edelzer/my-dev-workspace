/**
 * API Template ESLint Configuration
 * 
 * This configuration extends the base ESLint configuration with
 * API-specific overrides for backend/Node.js development.
 * 
 * Migration Status: ✅ Migrated to use base configurations
 * - Base rules: ../../config/base/eslint.base.js
 * - API overrides: ../../config/templates/api.eslint.js
 * 
 * Benefits of migration:
 * - Eliminated configuration duplication
 * - Improved maintainability across templates
 * - Consistent security and quality standards
 * - Centralized rule management
 */

const baseConfig = require('../../config/base/eslint.base.js');
const apiOverrides = require('../../config/templates/api.eslint.js');

module.exports = {
  root: true,
  
  // Extend base configuration
  ...baseConfig,
  
  // Apply API-specific overrides
  env: {
    ...baseConfig.env,
    ...apiOverrides.env,
  },
  
  parserOptions: {
    ...baseConfig.parserOptions,
    ...apiOverrides.parserOptions,
    project: './tsconfig.json', // Project-specific tsconfig path
  },
  
  rules: {
    ...baseConfig.rules,
    ...apiOverrides.rules,
  },
  
  overrides: [
    // Inherit base overrides
    ...(baseConfig.overrides || []),
    // Apply API-specific overrides
    ...(apiOverrides.overrides || []),
  ],
  
  ignorePatterns: [
    // Combine base and API-specific ignore patterns
    ...baseConfig.ignorePatterns,
    ...apiOverrides.ignorePatterns,
  ],
};
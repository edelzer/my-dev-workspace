/**
 * Web Template ESLint Configuration
 * 
 * This configuration extends the Web template ESLint configuration which
 * includes React, accessibility, and web-specific rules.
 * 
 * The template configuration already extends the base configuration,
 * so this file only needs to reference the template config.
 */

module.exports = {
  root: true,
  extends: [
    '../../config/templates/web.eslint.js',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  
  // Project-specific overrides can be added here if needed
  rules: {
    // Add any project-specific rule overrides here
  },
};
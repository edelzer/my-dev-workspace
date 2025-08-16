/**
 * Prettier Base Configuration
 * 
 * This configuration provides standardized code formatting rules
 * that ensure consistency across all projects in the workspace.
 * 
 * Security & Quality Focus:
 * - Consistent formatting reduces diff noise and improves code review quality
 * - Standardized quotes and semicolons prevent parsing ambiguities
 * - File-specific overrides ensure proper formatting for all file types
 * 
 * Usage:
 * In your project's prettier.config.js:
 * const baseConfig = require('./config/base/prettier.base.js');
 * module.exports = {
 *   ...baseConfig,
 *   // project-specific overrides
 * };
 */

module.exports = {
  // === CORE FORMATTING RULES ===
  
  // Semicolons and quotes (security-conscious)
  semi: true,                    // Always use semicolons to prevent ASI issues
  singleQuote: true,             // Consistent quote style
  quoteProps: 'as-needed',       // Minimal quotes on object properties
  
  // Trailing elements
  trailingComma: 'es5',          // Compatible with ES5 and older browsers
  
  // Spacing and brackets
  bracketSpacing: true,          // Spaces in object literals: { foo: bar }
  bracketSameLine: false,        // JSX closing bracket on new line
  arrowParens: 'avoid',          // Omit parens when possible: x => x
  
  // === LINE LENGTH & INDENTATION ===
  printWidth: 100,               // Reasonable line length for modern screens
  tabWidth: 2,                   // Consistent with ESLint configuration
  useTabs: false,                // Spaces for consistent display across editors
  
  // === FILE-SPECIFIC OVERRIDES ===
  overrides: [
    // JavaScript/TypeScript files
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
      },
    },
    
    // JSON files (strict formatting)
    {
      files: '*.json',
      options: {
        parser: 'json',
        singleQuote: false,        // JSON requires double quotes
        trailingComma: 'none',     // JSON doesn't allow trailing commas
        bracketSpacing: false,     // Compact JSON formatting
      },
    },
    
    // Markdown files (preserve prose)
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'preserve',     // Don't wrap prose
        singleQuote: false,        // Use double quotes in markdown
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    
    // YAML files
    {
      files: '*.{yaml,yml}',
      options: {
        parser: 'yaml',
        singleQuote: true,
        bracketSpacing: true,
        proseWrap: 'preserve',
      },
    },
    
    // HTML files
    {
      files: '*.html',
      options: {
        parser: 'html',
        singleQuote: false,        // HTML attributes use double quotes
        bracketSameLine: true,     // More compact HTML
        htmlWhitespaceSensitivity: 'css',
        printWidth: 120,           // Allow longer lines for HTML
      },
    },
    
    // CSS/SCSS files
    {
      files: '*.{css,scss,less}',
      options: {
        parser: 'css',
        singleQuote: true,         // CSS strings can use single quotes
        printWidth: 120,           // Allow longer lines for CSS
      },
    },
    
    // Configuration files (relaxed formatting)
    {
      files: '*.config.{js,ts,mjs}',
      options: {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 120,           // Allow longer config lines
      },
    },
    
    // Package.json (special handling)
    {
      files: 'package.json',
      options: {
        parser: 'json-stringify',
        singleQuote: false,
        trailingComma: 'none',
        tabWidth: 2,
        printWidth: 120,           // Allow longer lines for dependencies
      },
    },
    
    // Test files (relaxed rules)
    {
      files: '*.{test,spec}.{js,ts,jsx,tsx}',
      options: {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'es5',
        printWidth: 120,           // Allow longer test descriptions
      },
    },
    
    // Documentation files
    {
      files: '*.{md,mdx}',
      options: {
        parser: 'markdown',
        proseWrap: 'preserve',
        singleQuote: false,
        tabWidth: 2,
        printWidth: 80,            // Narrower for better readability
      },
    },
  ],
  
  // === PLUGIN CONFIGURATIONS ===
  plugins: [
    // Additional plugins can be added here as needed
    // '@trivago/prettier-plugin-sort-imports', // For import sorting
    // 'prettier-plugin-tailwindcss',           // For Tailwind CSS
  ],
  
  // === IGNORE PATTERNS ===
  ignorePath: '.prettierignore',
  
  // === EDITOR INTEGRATION ===
  requireConfig: false,          // Don't require config file
  editorconfig: true,           // Respect .editorconfig settings
  
  // === PERFORMANCE ===
  rangeStart: 0,                // Format entire file by default
  rangeEnd: Infinity,
  requirePragma: false,         // Don't require @format pragma
  insertPragma: false,          // Don't insert @format pragma
  
  // === EXPERIMENTAL ===
  experimentalTernaries: false,  // Keep stable ternary formatting
};
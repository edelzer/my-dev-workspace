module.exports = {
  // Basic formatting
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // Line length and wrapping
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  
  // File-specific overrides
  overrides: [
    {
      files: '*.{js,jsx,ts,tsx}',
      options: {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'es5',
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        singleQuote: false,
        trailingComma: 'none',
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        proseWrap: 'preserve',
        singleQuote: false,
      },
    },
    {
      files: '*.{yaml,yml}',
      options: {
        parser: 'yaml',
        singleQuote: true,
      },
    },
    {
      files: '*.html',
      options: {
        parser: 'html',
        singleQuote: false,
        bracketSameLine: true,
      },
    },
    {
      files: '*.css',
      options: {
        parser: 'css',
        singleQuote: true,
      },
    },
    {
      files: '*.scss',
      options: {
        parser: 'scss',
        singleQuote: true,
      },
    },
  ],
  
  // Plugin configurations
  plugins: [],
  
  // Ignore patterns
  ignorePath: '.prettierignore',
};
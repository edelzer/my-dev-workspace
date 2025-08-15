module.exports = {
  root: true,
  extends: [
    '../../config/eslint-base.config.js',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  env: {
    browser: true,
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react-refresh',
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  rules: {
    // React-specific rules
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/jsx-props-no-spreading': 'warn',
    'react/jsx-no-useless-fragment': 'warn',
    
    // TypeScript rules - web-specific overrides
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // Security rules - web-specific overrides
    'security/detect-object-injection': 'warn', // Less strict for client-side
    'security/detect-child-process': 'warn',
    'security/detect-non-literal-fs-filename': 'warn',
    'security/detect-non-literal-require': 'warn',
    
    // Code quality rules - web-specific
    'no-console': 'warn', // Allowed in development
    
    // Accessibility rules - enforced for web apps
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-proptypes': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/role-has-required-aria-props': 'error',
    'jsx-a11y/role-supports-aria-props': 'error',
    'jsx-a11y/heading-has-content': 'error',
    'jsx-a11y/html-has-lang': 'error',
    'jsx-a11y/lang': 'error',
    'jsx-a11y/no-aria-hidden-on-focusable': 'error',
    
    // SonarJS rules - web-specific adjustments
    'sonarjs/cognitive-complexity': ['error', 15], // Lower for frontend components
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
      },
      extends: ['plugin:testing-library/react'],
      rules: {
        'testing-library/await-async-query': 'error',
        'testing-library/no-await-sync-query': 'error',
        'testing-library/no-debugging-utils': 'warn',
        'testing-library/no-dom-import': 'error',
      },
    },
    {
      files: ['**/*.stories.{js,jsx,ts,tsx}'],
      rules: {
        'import/no-anonymous-default-export': 'off',
      },
    },
  ],
};
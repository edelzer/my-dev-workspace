/**
 * Vitest Configuration for Web Template
 * 
 * This configuration extends the base Vitest configuration and adds
 * React/DOM specific testing setup with jsdom environment.
 * 
 * Features:
 * - React Testing Library integration
 * - DOM testing with jsdom
 * - React-specific test utilities
 * - Component testing support
 * - Extended coverage for React components
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import baseConfig from '../../config/base/vitest.base.js';

// Create web-specific test configuration
const webTestConfig = defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  
  test: {
    // Override base config for React/DOM testing
    environment: 'jsdom',           // DOM environment for React components
    globals: true,                  // Global test functions
    
    // React-specific setup
    setupFiles: ['./src/test/setup.ts'],
    
    // CSS processing for components
    css: {
      modules: {
        classNameStrategy: 'stable',
      },
    },
    
    // Web-specific includes (extends base)
    include: [
      ...baseConfig.test.include,
      'src/**/*.{test,spec}.{jsx,tsx}',
    ],
    
    // Web-specific excludes (extends base)
    exclude: [
      ...baseConfig.test.exclude,
      'src/main.tsx',
      'src/vite-env.d.ts',
      '.storybook/**',
      'public/**',
      'static/**',
    ],
    
    // Enhanced coverage for React components
    coverage: {
      ...baseConfig.test.coverage,
      
      // Web-specific coverage includes
      include: [
        'src/**/*.{js,ts,jsx,tsx}',
      ],
      
      // Web-specific coverage excludes
      exclude: [
        ...baseConfig.test.coverage.exclude,
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.stories.{js,ts,jsx,tsx}',
        '.storybook/**',
        'public/**',
        'static/**',
      ],
      
      // Enhanced thresholds for React components
      thresholds: {
        ...baseConfig.test.coverage.thresholds,
        
        // Component-specific thresholds
        'src/components/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/hooks/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
        'src/pages/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    
    // React-specific test environment
    env: {
      ...baseConfig.test.env,
      VITE_TEST: 'true',
      NODE_ENV: 'test',
    },
    
    // Enhanced watch for React development
    watch: {
      ...baseConfig.test.watch,
      ignore: [
        ...baseConfig.test.watch.ignore,
        'public/**',
        'static/**',
        '.storybook/**',
      ],
    },
  },
  
  // Resolve configuration for React imports
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/hooks': '/src/hooks',
      '@/pages': '/src/pages',
      '@/types': '/src/types',
      '@/utils': '/src/utils',
      '@/config': '/src/config',
      '@/assets': '/src/assets',
    },
  },
});

// Merge base configuration with web-specific overrides
export default mergeConfig(baseConfig, webTestConfig);

/**
 * Vite Configuration for Web Template
 * 
 * This configuration is optimized for React development with TypeScript,
 * security-first approach, and modern build optimizations.
 * 
 * Features:
 * - React with Fast Refresh
 * - TypeScript support with path mapping
 * - Security-conscious build settings
 * - Development server optimization
 * - Production build optimization
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      // Fast Refresh configuration
      fastRefresh: true,
      // JSX runtime configuration
      jsxRuntime: 'automatic',
    }),
  ],
  
  // Path resolution to match TypeScript paths
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/pages': resolve(__dirname, 'src/pages'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/config': resolve(__dirname, 'src/config'),
      '@/assets': resolve(__dirname, 'src/assets'),
    },
  },
  
  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
    // Security headers for development
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Security and performance optimizations
    minify: 'esbuild',
    target: 'es2020',
    cssCodeSplit: true,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimize chunk splitting
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  
  // Environment variables
  envPrefix: ['VITE_', 'REACT_APP_'],
  
  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
    },
    devSourcemap: true,
  },
  
  // ESBuild configuration
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  
  // Preview server (for built app)
  preview: {
    port: 3001,
    cors: true,
  },
});

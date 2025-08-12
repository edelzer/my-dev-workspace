import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.stories.*',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'dist/',
        'coverage/',
        '.storybook/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    // Security testing configuration
    testTimeout: 10000,
    hookTimeout: 10000,
    // TDD configuration
    watch: {
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
    },
    // Performance testing
    benchmark: {
      include: ['**/*.bench.{js,ts}'],
      exclude: ['node_modules/**'],
    },
  },
});
/**
 * Vitest Base Configuration
 * 
 * This configuration provides common Vitest testing settings with
 * modern testing capabilities, security-first approach, and performance optimization.
 * 
 * Security & Quality Features:
 * - Strict coverage thresholds for comprehensive testing
 * - Security-conscious file exclusions and timeouts
 * - Performance optimizations for modern JavaScript testing
 * - TDD-friendly watch mode and UI testing support
 * - Integration with modern build tools (Vite)
 * 
 * Usage:
 * In your project's vitest.config.ts:
 * import { defineConfig } from 'vitest/config';
 * import baseConfig from './config/base/vitest.base.js';
 * export default defineConfig({
 *   ...baseConfig,
 *   // project-specific overrides
 * });
 */

// Import statement for actual usage (uncomment when vitest is available):
// import { defineConfig } from 'vitest/config';

// For validation without dependencies:
const defineConfig = (config) => config;

const vitestConfig = defineConfig({
  test: {
    // === CORE CONFIGURATION ===
    environment: 'node',          // Default to Node.js environment
    globals: true,                // Enable global test functions (describe, it, expect)
    
    // === TEST FILE PATTERNS ===
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx,mjs}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx,mjs}',
      '**/__tests__/**/*.{js,ts,jsx,tsx,mjs}',
    ],
    
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/.nuxt/**',
      '**/.vercel/**',
      '**/.git/**',
      '**/cypress/**',
      '**/playwright/**',
      '**/*.config.{js,ts,mjs}',
      '**/*.d.ts',
      '**/vendor/**',
    ],
    
    // === SETUP & TEARDOWN ===
    setupFiles: [
      './src/test/setup.ts',
    ],
    
    // Global setup/teardown
    // globalSetup: './src/test/globalSetup.ts',
    // globalTeardown: './src/test/globalTeardown.ts',
    
    // === COVERAGE CONFIGURATION (Security-First) ===
    coverage: {
      provider: 'c8',             // Fast native coverage
      reporter: [
        'text',
        'text-summary',
        'json',
        'json-summary',
        'html',
        'lcov',
        'clover',
      ],
      
      // Output directory
      reportsDirectory: 'coverage',
      
      // Files to include in coverage
      include: [
        'src/**/*.{js,ts,jsx,tsx,mjs}',
      ],
      
      // Files to exclude from coverage (security-conscious)
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{js,ts,jsx,tsx}',
        'src/**/*.config.{js,ts,mjs}',
        'src/**/*.mock.{js,ts}',
        'src/test/**/*',
        'src/types/**/*',
        'src/index.{js,ts}',
        'src/main.{js,ts,jsx,tsx}',
        'src/vite-env.d.ts',
        'node_modules/**',
        'dist/**',
        'build/**',
        'coverage/**',
        '.storybook/**',
        'public/**',
        'static/**',
        '**/*.config.*',
        '**/vendor/**',
      ],
      
      // Strict coverage thresholds (security & quality)
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Per-directory thresholds
        'src/utils/': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        'src/components/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
      
      // Coverage options
      all: true,
      skipFull: false,
      clean: true,
      cleanOnRerun: true,
    },
    
    // === PERFORMANCE & TIMEOUTS ===
    testTimeout: 10000,           // 10 seconds max per test
    hookTimeout: 10000,           // 10 seconds max for hooks
    teardownTimeout: 10000,       // 10 seconds max for teardown
    
    // === WATCH MODE (TDD Support) ===
    watch: {
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.git/**',
        '**/.next/**',
        '**/.nuxt/**',
      ],
    },
    
    // === UI TESTING SUPPORT ===
    ui: true,                     // Enable Vitest UI
    open: false,                  // Don't auto-open UI
    uiBase: '/vitest/',          // UI base path
    
    // === BROWSER TESTING (Optional) ===
    // browser: {
    //   enabled: false,
    //   name: 'chrome',
    //   provider: 'playwright',
    //   headless: true,
    // },
    
    // === BENCHMARK TESTING ===
    benchmark: {
      include: [
        'src/**/*.bench.{js,ts,jsx,tsx,mjs}',
        'benchmarks/**/*.{js,ts,jsx,tsx,mjs}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
      ],
      // Benchmark reporters
      reporters: ['default', 'json'],
      outputFile: 'benchmarks/results.json',
    },
    
    // === MOCKING ===
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    
    // === PARALLEL EXECUTION ===
    pool: 'threads',              // Use worker threads
    poolOptions: {
      threads: {
        maxThreads: '50%',        // Use half of available CPU cores
        minThreads: 1,
        useAtomics: true,
      },
      forks: {
        maxForks: '50%',
        minForks: 1,
      },
    },
    
    // === ISOLATION & SECURITY ===
    isolate: true,                // Isolate tests
    passWithNoTests: false,       // Fail if no tests found
    allowOnly: false,             // Don't allow .only in CI
    dangerouslyIgnoreUnhandledErrors: false,
    
    // === REPORTERS ===
    reporter: [
      'default',
      'json',
      'html',
      'junit',
    ],
    
    outputFile: {
      json: 'coverage/test-results.json',
      html: 'coverage/test-results.html',
      junit: 'coverage/junit.xml',
    },
    
    // === CSS & ASSETS ===
    css: {
      include: /.+/,              // Process all CSS
      modules: {
        classNameStrategy: 'stable',
      },
    },
    
    // === ENVIRONMENT VARIABLES ===
    env: {
      NODE_ENV: 'test',
      VITEST: 'true',
    },
    
    // === TYPECHECK (TypeScript) ===
    typecheck: {
      enabled: false,             // Enable if you want type checking during tests
      tsconfig: './tsconfig.json',
      include: [
        'src/**/*.{test,spec}-d.ts',
      ],
    },
    
    // === SNAPSHOT TESTING ===
    resolveSnapshotPath: (testPath, snapExtension) => {
      return testPath.replace(/\.test\.([tj]sx?)/, `.test.${snapExtension}.$1`);
    },
    
    // === API TESTING ===
    api: {
      port: 51204,               // Port for Vitest API
      strictPort: false,         // Don't fail if port is taken
      host: '127.0.0.1',        // Only local access
    },
    
    // === WORKSPACE SUPPORT ===
    workspace: undefined,        // Can be configured for monorepo support
    
    // === RETRY CONFIGURATION ===
    retry: 0,                    // Don't retry failed tests by default
    bail: 0,                     // Don't bail on first failure
    
    // === SEQUENCE ===
    sequence: {
      shuffle: false,            // Don't shuffle tests by default
      concurrent: true,          // Run tests concurrently
      hooks: 'parallel',         // Run hooks in parallel
    },
    
    // === DIFF OPTIONS ===
    diff: {
      // Custom diff options can be added here
    },
    
    // === CUSTOM TEST MATCHERS ===
    // Custom matchers can be added in setup files
    
    // === DEBUGGING ===
    inspect: false,              // Don't enable inspector by default
    inspectBrk: false,          // Don't break on start
    
    // === LOGGING ===
    logHeapUsage: false,        // Don't log heap usage by default
    silent: false,              // Show test output
    hideSkippedTests: false,    // Show skipped tests
    
    // === EXPERIMENTAL ===
    experimental: {
      // Future experimental features
    },
  },
  
  // === ESBUILD CONFIGURATION ===
  esbuild: {
    target: 'es2020',
    sourcemap: true,
    minify: false,
  },
  
  // === DEFINE GLOBALS ===
  define: {
    __TEST__: true,
    __VITEST__: true,
  },
});

// Export both ES module and CommonJS for broader compatibility
module.exports = vitestConfig;

// ES module export (uncomment when using as ES module):
// export default vitestConfig;
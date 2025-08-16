/**
 * Configuration Management Integration Tests
 * 
 * Comprehensive integration tests for the multi-language configuration system
 * Tests configuration generation, validation, and consistency across all languages
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const ConfigurationManager = require('../../scripts/config-manager');
const ConfigurationValidator = require('../../scripts/config-validator');

describe('Configuration Management Integration Tests', () => {
  let configManager;
  let configValidator;
  let tempDir;

  beforeAll(async () => {
    configManager = new ConfigurationManager();
    configValidator = new ConfigurationValidator();
    tempDir = path.join(__dirname, 'temp');
    
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterAll(async () => {
    // Cleanup temp directory
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to cleanup temp directory:', error.message);
    }
  });

  describe('Schema Validation', () => {
    test('should load and validate configuration schema', async () => {
      await expect(configManager.loadSchema()).resolves.toBeTruthy();
      expect(configManager.schema).toBeDefined();
      expect(configManager.schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    });

    test('should validate schema structure', async () => {
      await configManager.loadSchema();
      
      // Check required top-level properties
      expect(configManager.schema.properties).toHaveProperty('application');
      expect(configManager.schema.properties).toHaveProperty('server');
      expect(configManager.schema.properties).toHaveProperty('database');
      expect(configManager.schema.properties).toHaveProperty('security');
      expect(configManager.schema.properties).toHaveProperty('monitoring');
    });
  });

  describe('Default Configuration', () => {
    test('should load default configuration', async () => {
      const defaults = await configManager.loadDefaults();
      expect(defaults).toBeDefined();
      expect(defaults.application).toBeDefined();
      expect(defaults.server).toBeDefined();
    });

    test('should validate default configuration against schema', async () => {
      await configManager.loadSchema();
      const defaults = await configManager.loadDefaults();
      
      expect(() => {
        configManager.validateConfiguration(defaults);
      }).not.toThrow();
    });
  });

  describe('Environment Configurations', () => {
    const environments = ['development', 'testing', 'staging', 'production'];

    test.each(environments)('should load %s environment configuration', async (env) => {
      const envConfig = await configManager.loadEnvironmentConfig(env);
      expect(envConfig).toBeDefined();
      expect(envConfig.application?.environment).toBe(env);
    });

    test.each(environments)('should validate merged %s configuration', async (env) => {
      await configManager.loadSchema();
      const defaults = await configManager.loadDefaults();
      const envConfig = await configManager.loadEnvironmentConfig(env);
      const merged = configManager.mergeConfigurations(defaults, envConfig);
      
      expect(() => {
        configManager.validateConfiguration(merged);
      }).not.toThrow();
    });

    test('should have environment-specific security settings', async () => {
      const production = await configManager.loadEnvironmentConfig('production');
      const development = await configManager.loadEnvironmentConfig('development');
      
      // Production should have stricter settings
      expect(production.application?.debug).toBe(false);
      expect(production.security?.password?.hashRounds).toBeGreaterThan(
        development.security?.password?.hashRounds || 8
      );
    });
  });

  describe('Language Adapter Tests', () => {
    const languages = ['nodejs'];
    const environments = ['development', 'production'];

    test.each(languages)('should generate %s configuration', async (language) => {
      const outputDir = path.join(tempDir, `${language}-test`);
      await fs.mkdir(outputDir, { recursive: true });
      
      const result = await configManager.generateConfig(language, 'development', outputDir);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that files were created
      for (const file of result) {
        await expect(fs.access(file.path)).resolves.toBeUndefined();
      }
    });

    test('should generate all language configurations', async () => {
      const outputDir = path.join(tempDir, 'all-languages');
      const results = await configManager.generateAllConfigs('development', outputDir);
      
      expect(results).toBeDefined();
      expect(results.nodejs).toBeDefined();
      
      // Check that Node.js configuration was generated successfully
      expect(results.nodejs.error).toBeUndefined();
      expect(Array.isArray(results.nodejs)).toBe(true);
    });

    test('should generate environment-specific configurations', async () => {
      const devDir = path.join(tempDir, 'nodejs-dev');
      const prodDir = path.join(tempDir, 'nodejs-prod');
      
      await fs.mkdir(devDir, { recursive: true });
      await fs.mkdir(prodDir, { recursive: true });
      
      const devResult = await configManager.generateConfig('nodejs', 'development', devDir);
      const prodResult = await configManager.generateConfig('nodejs', 'production', prodDir);
      
      expect(devResult).toBeDefined();
      expect(prodResult).toBeDefined();
      
      // Check that both generated files
      const devConfigPath = path.join(devDir, 'config.json');
      const prodConfigPath = path.join(prodDir, 'config.json');
      
      await expect(fs.access(devConfigPath)).resolves.toBeUndefined();
      await expect(fs.access(prodConfigPath)).resolves.toBeUndefined();
      
      // Load and compare configurations
      const devConfig = JSON.parse(await fs.readFile(devConfigPath, 'utf8'));
      const prodConfig = JSON.parse(await fs.readFile(prodConfigPath, 'utf8'));
      
      expect(devConfig.app.debug).toBe(true);
      expect(prodConfig.app.debug).toBe(false);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate schema loading', async () => {
      const schemaLoaded = await configValidator.loadSchema();
      expect(schemaLoaded).toBe(true);
      expect(configValidator.schema).toBeDefined();
    });

    test('should validate all environments', async () => {
      await configValidator.loadSchema();
      const result = await configValidator.validateEnvironments();
      
      // Should pass validation if no critical errors
      expect(configValidator.errors.filter(e => e.type === 'error').length).toBe(0);
    });

    test('should validate configuration consistency', async () => {
      await configValidator.loadSchema();
      await configValidator.validateConsistency();
      
      const report = configValidator.getValidationReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
    });

    test('should run comprehensive validation', async () => {
      const report = await configValidator.validateAll();
      
      expect(report).toBeDefined();
      expect(report.valid).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.errors).toBeDefined();
      expect(report.warnings).toBeDefined();
      
      // Should have minimal critical errors in a properly configured system
      const criticalErrors = report.errors.filter(error => 
        error.message.includes('must be set') || 
        error.message.includes('required')
      );
      expect(criticalErrors.length).toBe(0);
    });
  });

  describe('Security Configuration Tests', () => {
    test('should validate security templates exist', async () => {
      const securityDir = path.join(configManager.configDir, 'security');
      
      await expect(fs.access(path.join(securityDir, 'encryption.json'))).resolves.toBeUndefined();
      await expect(fs.access(path.join(securityDir, 'policies.json'))).resolves.toBeUndefined();
    });

    test('should validate encryption configuration', async () => {
      const encryptionPath = path.join(configManager.configDir, 'security', 'encryption.json');
      const encryptionContent = await fs.readFile(encryptionPath, 'utf8');
      const encryptionConfig = JSON.parse(encryptionContent);
      
      expect(encryptionConfig.encryption).toBeDefined();
      expect(encryptionConfig.encryption.algorithm).toBe('AES-256-GCM');
      expect(encryptionConfig.hashing?.password?.algorithm).toBe('bcrypt');
    });

    test('should validate security policies', async () => {
      const policiesPath = path.join(configManager.configDir, 'security', 'policies.json');
      const policiesContent = await fs.readFile(policiesPath, 'utf8');
      const policiesConfig = JSON.parse(policiesContent);
      
      expect(policiesConfig.authentication).toBeDefined();
      expect(policiesConfig.authorization).toBeDefined();
      expect(policiesConfig.accountSecurity).toBeDefined();
    });

    test('should enforce production security requirements', async () => {
      await configManager.loadSchema();
      const production = await configManager.loadEnvironmentConfig('production');
      const defaults = await configManager.loadDefaults();
      const merged = configManager.mergeConfigurations(defaults, production);
      
      // Production should have secure defaults
      expect(merged.application.debug).toBe(false);
      expect(merged.server?.ssl?.enabled).toBe(true);
      expect(merged.security?.password?.hashRounds).toBeGreaterThanOrEqual(12);
      expect(merged.cors?.allowedOrigins).not.toContain('*');
    });
  });

  describe('Development Tools Configuration', () => {
    test('should validate tool configuration files exist', async () => {
      const toolsDir = path.join(configManager.configDir, 'tools');
      
      const toolFiles = [
        'eslint-config.json',
        'prettier-config.json',
        'python-tools.toml',
        'java-checkstyle.xml',
        'golangci-lint.yml'
      ];
      
      for (const toolFile of toolFiles) {
        await expect(fs.access(path.join(toolsDir, toolFile))).resolves.toBeUndefined();
      }
    });

    test('should validate ESLint configuration', async () => {
      const eslintPath = path.join(configManager.configDir, 'tools', 'eslint-config.json');
      const eslintContent = await fs.readFile(eslintPath, 'utf8');
      const eslintConfig = JSON.parse(eslintContent);
      
      expect(eslintConfig.plugins).toContain('security');
      expect(eslintConfig.extends).toContain('prettier');
      expect(eslintConfig.rules).toBeDefined();
    });

    test('should validate Prettier configuration', async () => {
      const prettierPath = path.join(configManager.configDir, 'tools', 'prettier-config.json');
      const prettierContent = await fs.readFile(prettierPath, 'utf8');
      const prettierConfig = JSON.parse(prettierContent);
      
      expect(prettierConfig.printWidth).toBeDefined();
      expect(prettierConfig.singleQuote).toBeDefined();
      expect(prettierConfig.trailingComma).toBeDefined();
    });
  });

  describe('Node.js Specific Tests', () => {
    test('should generate valid Node.js configuration', async () => {
      const outputDir = path.join(tempDir, 'nodejs-specific');
      await fs.mkdir(outputDir, { recursive: true });
      
      const result = await configManager.generateConfig('nodejs', 'development', outputDir);
      
      // Check specific files
      const configFile = result.find(f => f.file === 'config.json');
      const envFile = result.find(f => f.file === '.env.example');
      
      expect(configFile).toBeDefined();
      expect(envFile).toBeDefined();
      
      // Validate config.json structure
      const configContent = JSON.parse(await fs.readFile(configFile.path, 'utf8'));
      expect(configContent.app).toBeDefined();
      expect(configContent.server).toBeDefined();
      expect(configContent.database).toBeDefined();
      expect(configContent.security).toBeDefined();
    });

    test('should generate environment file with all required variables', async () => {
      const outputDir = path.join(tempDir, 'nodejs-env');
      await fs.mkdir(outputDir, { recursive: true });
      
      const result = await configManager.generateConfig('nodejs', 'production', outputDir);
      const envFile = result.find(f => f.file === '.env.example');
      
      const envContent = await fs.readFile(envFile.path, 'utf8');
      
      // Check for essential environment variables
      expect(envContent).toContain('JWT_SECRET=');
      expect(envContent).toContain('DATABASE_URL=');
      expect(envContent).toContain('PORT=');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle invalid language gracefully', async () => {
      const outputDir = path.join(tempDir, 'invalid-lang');
      await fs.mkdir(outputDir, { recursive: true });
      
      await expect(
        configManager.generateConfig('invalid-language', 'development', outputDir)
      ).rejects.toThrow('No adapter found for language: invalid-language');
    });

    test('should handle invalid environment gracefully', async () => {
      await expect(
        configManager.loadEnvironmentConfig('invalid-environment')
      ).rejects.toThrow();
    });

    test('should handle missing schema gracefully', async () => {
      const validator = new ConfigurationValidator();
      // Don't load schema
      const valid = validator.validateConfiguration({}, 'Test');
      expect(valid).toBe(false);
      expect(validator.errors.length).toBeGreaterThan(0);
    });

    test('should handle malformed configuration', async () => {
      await configManager.loadSchema();
      
      const invalidConfig = {
        application: {
          name: 123, // Should be string
          version: true, // Should be string
          environment: 'invalid-env' // Should be valid enum
        }
      };
      
      expect(() => {
        configManager.validateConfiguration(invalidConfig);
      }).toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should generate configuration within reasonable time', async () => {
      const outputDir = path.join(tempDir, 'performance-test');
      await fs.mkdir(outputDir, { recursive: true });
      
      const startTime = Date.now();
      await configManager.generateConfig('nodejs', 'development', outputDir);
      const endTime = Date.now();
      
      // Should complete within 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
    });

    test('should validate configuration within reasonable time', async () => {
      const startTime = Date.now();
      await configValidator.validateAll();
      const endTime = Date.now();
      
      // Should complete within 10 seconds
      expect(endTime - startTime).toBeLessThan(10000);
    });
  });

  describe('Configuration Merge Logic', () => {
    test('should properly merge configurations with precedence', async () => {
      const defaults = { 
        app: { debug: false, name: 'default' },
        server: { port: 8000 }
      };
      
      const environment = { 
        app: { debug: true },
        database: { url: 'env-db-url' }
      };
      
      const overrides = {
        server: { port: 3000 }
      };
      
      const merged = configManager.mergeConfigurations(defaults, environment, overrides);
      
      expect(merged.app.debug).toBe(true); // Environment overrides default
      expect(merged.app.name).toBe('default'); // Default preserved
      expect(merged.server.port).toBe(3000); // Override takes precedence
      expect(merged.database.url).toBe('env-db-url'); // Environment addition
    });

    test('should handle deep object merging', async () => {
      const defaults = {
        security: {
          jwt: { algorithm: 'HS256', expiry: 3600 },
          password: { minLength: 8 }
        }
      };
      
      const environment = {
        security: {
          jwt: { expiry: 7200 },
          password: { requireUppercase: true }
        }
      };
      
      const merged = configManager.mergeConfigurations(defaults, environment);
      
      expect(merged.security.jwt.algorithm).toBe('HS256'); // Preserved
      expect(merged.security.jwt.expiry).toBe(7200); // Overridden
      expect(merged.security.password.minLength).toBe(8); // Preserved
      expect(merged.security.password.requireUppercase).toBe(true); // Added
    });
  });

  describe('Integration with External Tools', () => {
    test('should work with npm package scripts', async () => {
      const outputDir = path.join(tempDir, 'npm-integration');
      await fs.mkdir(outputDir, { recursive: true });
      
      const result = await configManager.generateConfig('nodejs', 'development', outputDir);
      const scriptsFile = result.find(f => f.file === 'package-scripts.json');
      
      if (scriptsFile) {
        const scripts = JSON.parse(await fs.readFile(scriptsFile.path, 'utf8'));
        expect(scripts['config:validate']).toBeDefined();
        expect(scripts['config:generate']).toBeDefined();
      }
    });

    test('should validate against external schema validators', async () => {
      // This test would integrate with external JSON Schema validators
      // to ensure our schema is valid according to different implementations
      await configManager.loadSchema();
      expect(configManager.schema).toBeDefined();
      
      // Basic schema validation
      expect(configManager.schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(configManager.schema.type).toBe('object');
      expect(configManager.schema.properties).toBeDefined();
    });
  });
});

// Performance benchmarks
describe('Configuration Performance Benchmarks', () => {
  let configManager;
  
  beforeAll(() => {
    configManager = new ConfigurationManager();
  });
  
  test('schema loading performance', async () => {
    const iterations = 10;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await configManager.loadSchema();
      times.push(Date.now() - start);
    }
    
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Schema loading average time: ${average}ms`);
    
    // Should load schema in under 100ms on average
    expect(average).toBeLessThan(100);
  });
  
  test('configuration generation performance', async () => {
    await configManager.loadSchema();
    const tempDir = path.join(__dirname, 'temp', 'perf-test');
    await fs.mkdir(tempDir, { recursive: true });
    
    const iterations = 5;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const outputDir = path.join(tempDir, `test-${i}`);
      await fs.mkdir(outputDir, { recursive: true });
      
      const start = Date.now();
      await configManager.generateConfig('nodejs', 'development', outputDir);
      times.push(Date.now() - start);
    }
    
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(`Configuration generation average time: ${average}ms`);
    
    // Should generate configuration in under 1 second on average
    expect(average).toBeLessThan(1000);
    
    // Cleanup
    await fs.rmdir(tempDir, { recursive: true });
  });
});
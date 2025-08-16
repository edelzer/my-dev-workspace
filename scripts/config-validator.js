#!/usr/bin/env node

/**
 * Configuration Validator
 * 
 * Validates configuration files against the unified schema
 * Checks consistency across environments and languages
 */

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const yaml = require('js-yaml');

class ConfigurationValidator {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.configDir = path.join(this.rootDir, 'config');
    this.ajv = new Ajv({ 
      allErrors: true, 
      strict: false,
      verbose: true,
      validateFormats: true
    });
    addFormats(this.ajv);
    
    this.schema = null;
    this.validateConfig = null;
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Load and compile the configuration schema
   */
  async loadSchema() {
    try {
      const schemaPath = path.join(this.configDir, 'shared', 'schema.json');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      this.schema = JSON.parse(schemaContent);
      this.validateConfig = this.ajv.compile(this.schema);
      console.log('✅ Configuration schema loaded and compiled');
      return true;
    } catch (error) {
      this.addError('Schema Loading', `Failed to load schema: ${error.message}`);
      return false;
    }
  }

  /**
   * Validate a single configuration object
   */
  validateConfiguration(config, context = 'Unknown') {
    if (!this.validateConfig) {
      this.addError(context, 'Schema not loaded. Call loadSchema() first.');
      return false;
    }

    const valid = this.validateConfig(config);
    
    if (!valid) {
      this.validateConfig.errors.forEach(error => {
        const errorPath = error.instancePath || 'root';
        const errorMessage = error.message;
        const fullMessage = `${errorPath}: ${errorMessage}`;
        
        if (error.data !== undefined) {
          const dataInfo = typeof error.data === 'object' 
            ? JSON.stringify(error.data).substring(0, 100)
            : String(error.data);
          fullMessage += ` (received: ${dataInfo})`;
        }
        
        this.addError(context, fullMessage);
      });
      return false;
    }

    console.log(`✅ Configuration validation passed for: ${context}`);
    return true;
  }

  /**
   * Validate all environment configurations
   */
  async validateEnvironments() {
    const environments = ['development', 'testing', 'staging', 'production'];
    let allValid = true;

    console.log('🔍 Validating environment configurations...');

    for (const env of environments) {
      try {
        const envPath = path.join(this.configDir, 'environments', `${env}.json`);
        const envContent = await fs.readFile(envPath, 'utf8');
        const envConfig = JSON.parse(envContent);

        // Load defaults and merge
        const defaultsPath = path.join(this.configDir, 'shared', 'defaults.json');
        const defaultsContent = await fs.readFile(defaultsPath, 'utf8');
        const defaults = JSON.parse(defaultsContent);
        
        const mergedConfig = this.deepMerge(defaults, envConfig);
        const isValid = this.validateConfiguration(mergedConfig, `Environment: ${env}`);
        
        if (!isValid) {
          allValid = false;
        }

        // Environment-specific validations
        this.validateEnvironmentSpecific(env, mergedConfig);

      } catch (error) {
        this.addError(`Environment: ${env}`, `Failed to load: ${error.message}`);
        allValid = false;
      }
    }

    return allValid;
  }

  /**
   * Validate environment-specific requirements
   */
  validateEnvironmentSpecific(environment, config) {
    const context = `Environment: ${environment}`;

    switch (environment) {
      case 'production':
        this.validateProductionConfig(config, context);
        break;
      case 'staging':
        this.validateStagingConfig(config, context);
        break;
      case 'development':
        this.validateDevelopmentConfig(config, context);
        break;
      case 'testing':
        this.validateTestingConfig(config, context);
        break;
    }
  }

  /**
   * Validate production-specific requirements
   */
  validateProductionConfig(config, context) {
    // Security checks for production
    if (config.application?.debug === true) {
      this.addError(context, 'Debug mode should be disabled in production');
    }

    if (config.security?.jwt?.secret === 'your-secret-key-at-least-32-chars-long') {
      this.addError(context, 'Default JWT secret detected in production');
    }

    if (!config.server?.ssl?.enabled) {
      this.addWarning(context, 'SSL is not enabled in production');
    }

    if (config.logging?.level === 'DEBUG') {
      this.addWarning(context, 'Debug logging level in production may impact performance');
    }

    if (config.cors?.allowedOrigins?.includes('*')) {
      this.addError(context, 'Wildcard CORS origins not allowed in production');
    }

    // Database security
    if (config.database?.url?.includes('localhost')) {
      this.addWarning(context, 'Database URL contains localhost in production');
    }

    // Rate limiting should be enabled
    if (!config.rateLimiting?.enabled) {
      this.addWarning(context, 'Rate limiting should be enabled in production');
    }
  }

  /**
   * Validate staging-specific requirements
   */
  validateStagingConfig(config, context) {
    if (config.application?.debug === true) {
      this.addWarning(context, 'Debug mode enabled in staging');
    }

    if (!config.monitoring?.metrics?.enabled) {
      this.addWarning(context, 'Metrics should be enabled in staging for testing');
    }
  }

  /**
   * Validate development-specific requirements
   */
  validateDevelopmentConfig(config, context) {
    if (!config.application?.debug) {
      this.addWarning(context, 'Debug mode typically enabled in development');
    }

    if (config.rateLimiting?.enabled) {
      this.addWarning(context, 'Rate limiting may hinder development');
    }
  }

  /**
   * Validate testing-specific requirements
   */
  validateTestingConfig(config, context) {
    if (config.application?.debug === true) {
      this.addWarning(context, 'Debug mode may interfere with testing');
    }

    if (config.external?.email?.enabled) {
      this.addWarning(context, 'Email should typically be disabled in testing');
    }

    if (!config.database?.url?.includes('test')) {
      this.addWarning(context, 'Test database should be clearly identifiable');
    }
  }

  /**
   * Validate consistency across environments
   */
  async validateConsistency() {
    console.log('🔍 Validating consistency across environments...');

    const environments = ['development', 'testing', 'staging', 'production'];
    const configs = {};

    // Load all environment configs
    for (const env of environments) {
      try {
        const envPath = path.join(this.configDir, 'environments', `${env}.json`);
        const envContent = await fs.readFile(envPath, 'utf8');
        configs[env] = JSON.parse(envContent);
      } catch (error) {
        this.addError('Consistency', `Failed to load ${env}: ${error.message}`);
        return false;
      }
    }

    // Check for consistent application metadata
    this.validateConsistentField(configs, 'application.name', 'Application name');
    this.validateConsistentField(configs, 'application.version', 'Application version');
    
    // Check for consistent API configuration
    this.validateConsistentField(configs, 'api.version', 'API version');
    
    // Check security configuration consistency
    this.validateSecurityConsistency(configs);
    
    // Check CORS consistency
    this.validateCORSConsistency(configs);

    return true;
  }

  /**
   * Validate that a field is consistent across environments
   */
  validateConsistentField(configs, fieldPath, fieldName) {
    const values = Object.entries(configs).map(([env, config]) => ({
      env,
      value: this.getNestedValue(config, fieldPath)
    }));

    const uniqueValues = [...new Set(values.map(v => v.value))];
    
    if (uniqueValues.length > 1) {
      this.addWarning('Consistency', 
        `${fieldName} varies across environments: ${values.map(v => `${v.env}=${v.value}`).join(', ')}`
      );
    }
  }

  /**
   * Validate security configuration consistency
   */
  validateSecurityConsistency(configs) {
    // JWT algorithm should be consistent
    this.validateConsistentField(configs, 'security.jwt.algorithm', 'JWT algorithm');
    
    // Password requirements should be consistent
    this.validateConsistentField(configs, 'security.password.minLength', 'Password minimum length');
    
    // Security headers should be consistent
    Object.keys(configs.production?.security?.headers || {}).forEach(header => {
      this.validateConsistentField(configs, `security.headers.${header}`, `Security header: ${header}`);
    });
  }

  /**
   * Validate CORS configuration consistency
   */
  validateCORSConsistency(configs) {
    // Check for potentially unsafe CORS configurations
    Object.entries(configs).forEach(([env, config]) => {
      const origins = config.cors?.allowedOrigins || [];
      
      if (origins.includes('*') && env !== 'development') {
        this.addError('CORS', `Wildcard origin found in ${env} environment`);
      }
      
      if (origins.some(origin => origin.includes('localhost')) && env === 'production') {
        this.addWarning('CORS', `Localhost origin found in production environment`);
      }
    });
  }

  /**
   * Validate security configurations
   */
  async validateSecurity() {
    console.log('🔐 Validating security configurations...');

    const securityPath = path.join(this.configDir, 'security');
    
    try {
      // Validate encryption configuration
      const encryptionPath = path.join(securityPath, 'encryption.json');
      const encryptionContent = await fs.readFile(encryptionPath, 'utf8');
      const encryptionConfig = JSON.parse(encryptionContent);
      
      this.validateEncryptionConfig(encryptionConfig);
      
      // Validate security policies
      const policiesPath = path.join(securityPath, 'policies.json');
      const policiesContent = await fs.readFile(policiesPath, 'utf8');
      const policiesConfig = JSON.parse(policiesContent);
      
      this.validateSecurityPolicies(policiesConfig);
      
    } catch (error) {
      this.addError('Security', `Failed to validate security configs: ${error.message}`);
      return false;
    }

    return true;
  }

  /**
   * Validate encryption configuration
   */
  validateEncryptionConfig(config) {
    const context = 'Security: Encryption';

    // Check for weak encryption algorithms
    const weakAlgorithms = ['DES', '3DES', 'RC4', 'MD5', 'SHA1'];
    const forbiddenAlgs = config.validation?.encryption?.forbiddenAlgorithms || [];
    
    weakAlgorithms.forEach(alg => {
      if (!forbiddenAlgs.includes(alg)) {
        this.addWarning(context, `Weak algorithm ${alg} not explicitly forbidden`);
      }
    });

    // Check key rotation settings
    if (!config.jwt?.keyManagement?.rotation?.enabled) {
      this.addWarning(context, 'JWT key rotation is not enabled');
    }

    // Check password hashing rounds
    const rounds = config.hashing?.password?.rounds;
    if (rounds?.production < 12) {
      this.addError(context, 'BCrypt rounds too low for production (minimum 12 recommended)');
    }
  }

  /**
   * Validate security policies
   */
  validateSecurityPolicies(config) {
    const context = 'Security: Policies';

    // Check password policy
    const passwordPolicy = config.accountSecurity?.password?.policy;
    if (passwordPolicy) {
      if (passwordPolicy.minLength < 8) {
        this.addError(context, 'Password minimum length should be at least 8 characters');
      }
      
      if (!passwordPolicy.requireUppercase || !passwordPolicy.requireLowercase) {
        this.addWarning(context, 'Password policy should require both upper and lowercase letters');
      }
    }

    // Check rate limiting
    const rateLimit = config.apiSecurity?.rateLimit;
    if (rateLimit?.global?.requests > 10000) {
      this.addWarning(context, 'Global rate limit seems very high');
    }

    // Check CORS configuration
    const cors = config.apiSecurity?.cors;
    if (!cors?.strictMode) {
      this.addWarning(context, 'CORS strict mode is not enabled');
    }
  }

  /**
   * Validate development tools configuration
   */
  async validateDevTools() {
    console.log('🔧 Validating development tools configuration...');

    const toolsPath = path.join(this.configDir, 'tools');
    const toolFiles = [
      'eslint-config.json',
      'prettier-config.json',
      'python-tools.toml',
      'java-checkstyle.xml',
      'golangci-lint.yml'
    ];

    for (const toolFile of toolFiles) {
      try {
        const filePath = path.join(toolsPath, toolFile);
        await fs.access(filePath);
        console.log(`✅ Found: ${toolFile}`);
        
        // Validate specific tool configurations
        if (toolFile === 'eslint-config.json') {
          await this.validateESLintConfig(filePath);
        } else if (toolFile === 'prettier-config.json') {
          await this.validatePrettierConfig(filePath);
        }
        
      } catch (error) {
        this.addError('DevTools', `Missing or invalid tool config: ${toolFile}`);
      }
    }

    return this.errors.filter(e => e.category === 'DevTools').length === 0;
  }

  /**
   * Validate ESLint configuration
   */
  async validateESLintConfig(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const eslintConfig = JSON.parse(content);
      
      if (!eslintConfig.plugins?.includes('security')) {
        this.addWarning('DevTools', 'ESLint security plugin not enabled');
      }
      
      if (!eslintConfig.extends?.includes('prettier')) {
        this.addWarning('DevTools', 'ESLint Prettier integration not configured');
      }
      
    } catch (error) {
      this.addError('DevTools', `Invalid ESLint config: ${error.message}`);
    }
  }

  /**
   * Validate Prettier configuration
   */
  async validatePrettierConfig(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const prettierConfig = JSON.parse(content);
      
      if (prettierConfig.printWidth > 120) {
        this.addWarning('DevTools', 'Print width > 120 may cause readability issues');
      }
      
    } catch (error) {
      this.addError('DevTools', `Invalid Prettier config: ${error.message}`);
    }
  }

  /**
   * Comprehensive validation of entire configuration system
   */
  async validateAll() {
    console.log('🚀 Starting comprehensive configuration validation...\n');

    this.errors = [];
    this.warnings = [];

    // Load schema first
    const schemaLoaded = await this.loadSchema();
    if (!schemaLoaded) {
      return this.getValidationReport();
    }

    // Run all validations
    await this.validateEnvironments();
    await this.validateConsistency();
    await this.validateSecurity();
    await this.validateDevTools();

    return this.getValidationReport();
  }

  /**
   * Generate validation report
   */
  getValidationReport() {
    const report = {
      valid: this.errors.length === 0,
      summary: {
        errors: this.errors.length,
        warnings: this.warnings.length
      },
      errors: this.errors,
      warnings: this.warnings,
      timestamp: new Date().toISOString()
    };

    // Print summary to console
    console.log('\n📊 Validation Report:');
    console.log(`Errors: ${report.summary.errors}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    
    if (report.summary.errors > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => {
        console.log(`  [${error.category}] ${error.message}`);
      });
    }
    
    if (report.summary.warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`  [${warning.category}] ${warning.message}`);
      });
    }

    if (report.valid) {
      console.log('\n✅ Configuration validation passed!');
    } else {
      console.log('\n❌ Configuration validation failed!');
    }

    return report;
  }

  /**
   * Utility methods
   */
  addError(category, message) {
    this.errors.push({ category, message, type: 'error' });
  }

  addWarning(category, message) {
    this.warnings.push({ category, message, type: 'warning' });
  }

  deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  const validator = new ConfigurationValidator();

  try {
    let report;
    
    switch (command) {
      case 'schema':
        await validator.loadSchema();
        report = { valid: true, message: 'Schema validation passed' };
        break;
        
      case 'environments':
        await validator.loadSchema();
        const envValid = await validator.validateEnvironments();
        report = validator.getValidationReport();
        break;
        
      case 'consistency':
        await validator.loadSchema();
        await validator.validateConsistency();
        report = validator.getValidationReport();
        break;
        
      case 'security':
        await validator.validateSecurity();
        report = validator.getValidationReport();
        break;
        
      case 'devtools':
        await validator.validateDevTools();
        report = validator.getValidationReport();
        break;
        
      case 'all':
      default:
        report = await validator.validateAll();
        break;
    }

    // Write report to file if requested
    const outputFile = args[1];
    if (outputFile) {
      await fs.writeFile(outputFile, JSON.stringify(report, null, 2));
      console.log(`📄 Report written to: ${outputFile}`);
    }

    process.exit(report.valid ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = ConfigurationValidator;

// Run CLI if called directly
if (require.main === module) {
  main();
}
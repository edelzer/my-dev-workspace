#!/usr/bin/env node

/**
 * Configuration Manager Script
 * 
 * Unified configuration management system for multi-language templates
 * Generates language-specific configurations from unified schema
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Import adapters
const NodeJSConfigAdapter = require('../config/adapters/nodejs-adapter');

class ConfigurationManager {
  constructor() {
    this.rootDir = path.resolve(__dirname, '..');
    this.configDir = path.join(this.rootDir, 'config');
    this.adapters = {
      nodejs: new NodeJSConfigAdapter(),
      // Python, Java, and Go adapters would be imported here
    };
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
  }

  /**
   * Load and validate configuration schema
   */
  async loadSchema() {
    try {
      const schemaPath = path.join(this.configDir, 'shared', 'schema.json');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      this.schema = JSON.parse(schemaContent);
      this.validateConfig = this.ajv.compile(this.schema);
      console.log('✅ Configuration schema loaded successfully');
      return this.schema;
    } catch (error) {
      console.error('❌ Failed to load configuration schema:', error.message);
      throw error;
    }
  }

  /**
   * Load default configuration
   */
  async loadDefaults() {
    try {
      const defaultsPath = path.join(this.configDir, 'shared', 'defaults.json');
      const defaultsContent = await fs.readFile(defaultsPath, 'utf8');
      this.defaults = JSON.parse(defaultsContent);
      console.log('✅ Default configuration loaded successfully');
      return this.defaults;
    } catch (error) {
      console.error('❌ Failed to load default configuration:', error.message);
      throw error;
    }
  }

  /**
   * Load environment-specific configuration
   */
  async loadEnvironmentConfig(environment) {
    try {
      const envPath = path.join(this.configDir, 'environments', `${environment}.json`);
      const envContent = await fs.readFile(envPath, 'utf8');
      const envConfig = JSON.parse(envContent);
      console.log(`✅ Environment configuration for "${environment}" loaded successfully`);
      return envConfig;
    } catch (error) {
      console.error(`❌ Failed to load environment configuration for "${environment}":`, error.message);
      throw error;
    }
  }

  /**
   * Merge configurations with proper precedence
   */
  mergeConfigurations(defaults, environment, overrides = {}) {
    const merged = this.deepMerge(defaults, environment);
    return this.deepMerge(merged, overrides);
  }

  /**
   * Deep merge utility function
   */
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

  /**
   * Validate configuration against schema
   */
  validateConfiguration(config) {
    const valid = this.validateConfig(config);
    if (!valid) {
      const errors = this.validateConfig.errors.map(error => 
        `${error.instancePath}: ${error.message}`
      );
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
    }
    console.log('✅ Configuration validation passed');
    return true;
  }

  /**
   * Generate configuration for specific language and environment
   */
  async generateConfig(language, environment, outputDir, overrides = {}) {
    try {
      console.log(`🔧 Generating ${language} configuration for "${environment}" environment...`);
      
      // Load configurations
      await this.loadSchema();
      const defaults = await this.loadDefaults();
      const envConfig = await this.loadEnvironmentConfig(environment);
      
      // Merge configurations
      const unifiedConfig = this.mergeConfigurations(defaults, envConfig, overrides);
      
      // Validate merged configuration
      this.validateConfiguration(unifiedConfig);
      
      // Get adapter for the language
      const adapter = this.adapters[language];
      if (!adapter) {
        throw new Error(`No adapter found for language: ${language}`);
      }
      
      // Generate language-specific configuration
      const result = await this.generateLanguageConfig(adapter, unifiedConfig, environment, outputDir, language);
      
      console.log(`✅ Configuration generated successfully for ${language} (${environment})`);
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to generate configuration for ${language}:`, error.message);
      throw error;
    }
  }

  /**
   * Generate language-specific configuration files
   */
  async generateLanguageConfig(adapter, unifiedConfig, environment, outputDir, language) {
    const results = [];
    
    switch (language) {
      case 'nodejs':
        return await this.generateNodeJSConfig(adapter, unifiedConfig, environment, outputDir);
      case 'python':
        return await this.generatePythonConfig(adapter, unifiedConfig, environment, outputDir);
      case 'java':
        return await this.generateJavaConfig(adapter, unifiedConfig, environment, outputDir);
      case 'go':
        return await this.generateGoConfig(adapter, unifiedConfig, environment, outputDir);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  }

  /**
   * Generate Node.js configuration files
   */
  async generateNodeJSConfig(adapter, unifiedConfig, environment, outputDir) {
    const results = [];
    
    // Generate main configuration
    const nodeConfig = adapter.generateConfig(unifiedConfig, environment);
    const configPath = path.join(outputDir, 'config.json');
    await this.writeFile(configPath, JSON.stringify(nodeConfig, null, 2));
    results.push({ file: 'config.json', path: configPath });
    
    // Generate environment file
    const envContent = adapter.generateEnvFile(unifiedConfig, environment);
    const envPath = path.join(outputDir, '.env.example');
    await this.writeFile(envPath, envContent);
    results.push({ file: '.env.example', path: envPath });
    
    // Generate package.json scripts
    const packageScripts = adapter.generatePackageScripts();
    const scriptsPath = path.join(outputDir, 'package-scripts.json');
    await this.writeFile(scriptsPath, JSON.stringify(packageScripts, null, 2));
    results.push({ file: 'package-scripts.json', path: scriptsPath });
    
    return results;
  }

  /**
   * Generate Python configuration files
   */
  async generatePythonConfig(adapter, unifiedConfig, environment, outputDir) {
    const results = [];
    
    // Generate settings.py
    const settingsCode = adapter.generateConfigClass(unifiedConfig, environment);
    const settingsPath = path.join(outputDir, 'settings.py');
    await this.writeFile(settingsPath, settingsCode);
    results.push({ file: 'settings.py', path: settingsPath });
    
    // Generate .env file
    const envContent = adapter.generateEnvFile(unifiedConfig, environment);
    const envPath = path.join(outputDir, '.env.example');
    await this.writeFile(envPath, envContent);
    results.push({ file: '.env.example', path: envPath });
    
    // Generate requirements.txt
    const requirements = adapter.generateRequirementsTxt();
    const reqPath = path.join(outputDir, 'requirements-config.txt');
    await this.writeFile(reqPath, requirements);
    results.push({ file: 'requirements-config.txt', path: reqPath });
    
    return results;
  }

  /**
   * Generate Java configuration files
   */
  async generateJavaConfig(adapter, unifiedConfig, environment, outputDir) {
    const results = [];
    
    // Generate application.yml
    const yamlConfig = await adapter.generateApplicationYml(unifiedConfig, environment);
    const yamlPath = path.join(outputDir, 'application.yml');
    await this.writeFile(yamlPath, yamlConfig);
    results.push({ file: 'application.yml', path: yamlPath });
    
    // Generate environment-specific properties
    const propertiesConfig = await adapter.generateEnvironmentProperties(unifiedConfig, environment);
    const propsPath = path.join(outputDir, `application-${environment}.properties`);
    await this.writeFile(propsPath, propertiesConfig);
    results.push({ file: `application-${environment}.properties`, path: propsPath });
    
    return results;
  }

  /**
   * Generate Go configuration files
   */
  async generateGoConfig(adapter, unifiedConfig, environment, outputDir) {
    const results = [];
    
    // Generate config.go
    const configCode = adapter.generateConfigStruct();
    const configPath = path.join(outputDir, 'config.go');
    await this.writeFile(configPath, configCode);
    results.push({ file: 'config.go', path: configPath });
    
    // Generate .env file
    const envContent = adapter.generateEnvFile(unifiedConfig, environment);
    const envPath = path.join(outputDir, '.env.example');
    await this.writeFile(envPath, envContent);
    results.push({ file: '.env.example', path: envPath });
    
    return results;
  }

  /**
   * Generate configurations for all languages
   */
  async generateAllConfigs(environment, outputBase, overrides = {}) {
    const languages = ['nodejs', 'python', 'java', 'go'];
    const results = {};
    
    for (const language of languages) {
      try {
        const outputDir = path.join(outputBase, language);
        await fs.mkdir(outputDir, { recursive: true });
        
        results[language] = await this.generateConfig(language, environment, outputDir, overrides);
      } catch (error) {
        console.error(`❌ Failed to generate config for ${language}:`, error.message);
        results[language] = { error: error.message };
      }
    }
    
    return results;
  }

  /**
   * Migrate existing project configuration
   */
  async migrateProjectConfig(projectPath, language, environment) {
    console.log(`🔄 Migrating project configuration at: ${projectPath}`);
    
    try {
      // Detect existing configuration
      const existingConfig = await this.detectExistingConfig(projectPath, language);
      
      // Generate new configuration
      const tempDir = path.join(projectPath, '.config-migration');
      await fs.mkdir(tempDir, { recursive: true });
      
      const newConfigs = await this.generateConfig(language, environment, tempDir, existingConfig);
      
      // Create backup of existing config
      const backupDir = path.join(projectPath, '.config-backup');
      await this.backupExistingConfig(projectPath, backupDir, language);
      
      // Apply new configuration
      await this.applyNewConfig(projectPath, tempDir, language);
      
      // Cleanup temp directory
      await fs.rmdir(tempDir, { recursive: true });
      
      console.log('✅ Configuration migration completed successfully');
      return { success: true, backup: backupDir, configs: newConfigs };
      
    } catch (error) {
      console.error('❌ Configuration migration failed:', error.message);
      throw error;
    }
  }

  /**
   * Detect existing configuration in project
   */
  async detectExistingConfig(projectPath, language) {
    // Implementation would detect and parse existing configuration files
    // This is a placeholder for the actual implementation
    return {};
  }

  /**
   * Backup existing configuration
   */
  async backupExistingConfig(projectPath, backupDir, language) {
    await fs.mkdir(backupDir, { recursive: true });
    // Implementation would backup existing config files
  }

  /**
   * Apply new configuration to project
   */
  async applyNewConfig(projectPath, configDir, language) {
    // Implementation would copy new config files to project
  }

  /**
   * Validate project configuration
   */
  async validateProjectConfig(projectPath, language) {
    console.log(`🔍 Validating project configuration at: ${projectPath}`);
    
    try {
      const config = await this.loadProjectConfig(projectPath, language);
      await this.loadSchema();
      this.validateConfiguration(config);
      
      console.log('✅ Project configuration is valid');
      return { valid: true };
      
    } catch (error) {
      console.error('❌ Project configuration validation failed:', error.message);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Load project configuration
   */
  async loadProjectConfig(projectPath, language) {
    // Implementation would load and parse project's current configuration
    // This is a placeholder for the actual implementation
    return {};
  }

  /**
   * Utility function to write files
   */
  async writeFile(filePath, content) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`📄 Generated: ${path.relative(this.rootDir, filePath)}`);
  }

  /**
   * Get configuration summary
   */
  async getConfigSummary() {
    const summary = {
      schema: null,
      environments: [],
      languages: Object.keys(this.adapters),
      lastGenerated: null
    };

    try {
      // Check schema
      const schemaPath = path.join(this.configDir, 'shared', 'schema.json');
      const schemaStats = await fs.stat(schemaPath);
      summary.schema = {
        exists: true,
        modified: schemaStats.mtime
      };

      // Check environments
      const envDir = path.join(this.configDir, 'environments');
      const envFiles = await fs.readdir(envDir);
      summary.environments = envFiles
        .filter(file => file.endsWith('.json'))
        .map(file => file.replace('.json', ''));

    } catch (error) {
      console.warn('Warning: Could not load configuration summary:', error.message);
    }

    return summary;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const manager = new ConfigurationManager();

  try {
    switch (command) {
      case 'generate':
        const language = args[1];
        const environment = args[2] || 'development';
        const outputDir = args[3] || './generated-config';
        
        if (!language) {
          console.error('Usage: config-manager generate <language> [environment] [output-dir]');
          process.exit(1);
        }
        
        await manager.generateConfig(language, environment, outputDir);
        break;

      case 'generate-all':
        const env = args[1] || 'development';
        const output = args[2] || './generated-configs';
        
        await manager.generateAllConfigs(env, output);
        break;

      case 'migrate':
        const projectPath = args[1];
        const lang = args[2];
        const envName = args[3] || 'development';
        
        if (!projectPath || !lang) {
          console.error('Usage: config-manager migrate <project-path> <language> [environment]');
          process.exit(1);
        }
        
        await manager.migrateProjectConfig(projectPath, lang, envName);
        break;

      case 'validate':
        const projPath = args[1];
        const projLang = args[2];
        
        if (!projPath || !projLang) {
          console.error('Usage: config-manager validate <project-path> <language>');
          process.exit(1);
        }
        
        await manager.validateProjectConfig(projPath, projLang);
        break;

      case 'summary':
        const summary = await manager.getConfigSummary();
        console.log('📊 Configuration Summary:');
        console.log(JSON.stringify(summary, null, 2));
        break;

      default:
        console.log(`
Configuration Manager - Multi-Language Configuration System

Usage:
  config-manager generate <language> [environment] [output-dir]
    Generate configuration for specific language and environment
    
  config-manager generate-all [environment] [output-dir]
    Generate configurations for all supported languages
    
  config-manager migrate <project-path> <language> [environment]
    Migrate existing project to unified configuration system
    
  config-manager validate <project-path> <language>
    Validate project configuration against schema
    
  config-manager summary
    Show configuration system summary

Supported Languages: nodejs, python, java, go
Supported Environments: development, testing, staging, production

Examples:
  config-manager generate nodejs development ./my-project/config
  config-manager generate-all production ./configs
  config-manager migrate ./my-project nodejs development
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = ConfigurationManager;

// Run CLI if called directly
if (require.main === module) {
  main();
}
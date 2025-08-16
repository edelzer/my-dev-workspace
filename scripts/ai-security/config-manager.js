#!/usr/bin/env node

/**
 * AI Security Configuration Manager
 * Phase 3 Task 3.1.3: Security AI Validation and Tuning
 * 
 * Intelligent configuration management with optimized parameters
 * Protocol Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');

class AISecurityConfigManager {
  constructor(options = {}) {
    this.options = {
      configDir: options.configDir || path.join(__dirname, '..', '..', '.claude', 'mcp'),
      backupDir: options.backupDir || path.join(__dirname, 'config-backups'),
      validateOnUpdate: options.validateOnUpdate !== false,
      ...options
    };
    
    this.configTemplates = this.getConfigTemplates();
    this.optimizedParameters = this.getOptimizedParameters();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  // Optimized parameter sets based on tuning analysis
  getOptimizedParameters() {
    return {
      // Baseline configuration from tuning analysis
      baseline: {
        confidenceThreshold: 0.7,
        falsePositiveThreshold: 0.05,
        maxValidationTime: 300000,
        contextWindowSize: 10,
        severityWeights: {
          CRITICAL: 0.9,
          HIGH: 0.8,
          MEDIUM: 0.6,
          LOW: 0.4
        },
        frameworkAwareness: true,
        learningEnabled: true
      },

      // Performance-optimized for large codebases
      performance_optimized: {
        confidenceThreshold: 0.8,
        falsePositiveThreshold: 0.03,
        maxValidationTime: 180000,
        contextWindowSize: 8,
        severityWeights: {
          CRITICAL: 0.95,
          HIGH: 0.85,
          MEDIUM: 0.6,
          LOW: 0.3
        },
        frameworkAwareness: true,
        learningEnabled: false,
        enableCaching: true,
        batchProcessing: true
      },

      // Accuracy-optimized for comprehensive detection
      accuracy_optimized: {
        confidenceThreshold: 0.6,
        falsePositiveThreshold: 0.08,
        maxValidationTime: 600000,
        contextWindowSize: 20,
        severityWeights: {
          CRITICAL: 0.85,
          HIGH: 0.75,
          MEDIUM: 0.65,
          LOW: 0.55
        },
        frameworkAwareness: true,
        learningEnabled: true,
        comprehensiveAnalysis: true,
        extendedPatternMatching: true
      },

      // Development environment optimized
      development: {
        confidenceThreshold: 0.65,
        falsePositiveThreshold: 0.1,
        maxValidationTime: 300000,
        contextWindowSize: 15,
        severityWeights: {
          CRITICAL: 0.9,
          HIGH: 0.8,
          MEDIUM: 0.65,
          LOW: 0.45
        },
        frameworkAwareness: true,
        learningEnabled: true,
        verboseLogging: true,
        interactiveMode: true
      },

      // Production environment optimized
      production: {
        confidenceThreshold: 0.85,
        falsePositiveThreshold: 0.02,
        maxValidationTime: 1200000,
        contextWindowSize: 8,
        severityWeights: {
          CRITICAL: 0.95,
          HIGH: 0.85,
          MEDIUM: 0.6,
          LOW: 0.3
        },
        frameworkAwareness: true,
        learningEnabled: false,
        auditLogging: true,
        strictMode: true
      }
    };
  }

  // Configuration templates for different scenarios
  getConfigTemplates() {
    return {
      semgrep_mcp: {
        name: "semgrep-mcp",
        description: "AI-powered security code review using Semgrep MCP server integration",
        version: "1.0.0",
        mcp_server: {
          command: "uvx",
          args: ["semgrep-mcp"],
          env: {
            SEMGREP_APP_TOKEN: "${SEMGREP_APP_TOKEN}",
            SEMGREP_RULES: "auto",
            SEMGREP_TIMEOUT: "30"
          }
        }
      },
      
      ai_validation: {
        version: "1.0.0",
        validation_engine: {
          ai_powered: true,
          model_version: "1.0.0",
          false_positive_reduction: {
            enabled: true,
            // Will be populated with optimized parameters
          },
          risk_assessment: {
            enabled: true,
            // Will be populated with optimized parameters
          },
          context_analysis: {
            enabled: true,
            // Will be populated with optimized parameters
          }
        }
      }
    };
  }

  // Generate configuration for specific environment and optimization
  generateConfig(environment = 'baseline', optimization = 'balanced') {
    const params = this.optimizedParameters[environment] || this.optimizedParameters.baseline;
    const template = JSON.parse(JSON.stringify(this.configTemplates.semgrep_mcp));
    
    // Enhanced security configuration with optimized parameters
    template.security_config = {
      rulesets: {
        javascript: {
          enabled: true,
          rules: [
            "p/javascript",
            "p/typescript", 
            "p/react",
            "p/nodejs",
            "p/security-audit",
            "p/owasp-top-10"
          ],
          severity_filter: ["ERROR", "WARNING", "INFO"],
          confidence_threshold: params.confidenceThreshold
        },
        python: {
          enabled: true,
          rules: [
            "p/python",
            "p/django",
            "p/flask",
            "p/security-audit",
            "p/owasp-top-10"
          ],
          severity_filter: ["ERROR", "WARNING", "INFO"],
          confidence_threshold: params.confidenceThreshold
        },
        java: {
          enabled: true,
          rules: [
            "p/java",
            "p/spring",
            "p/security-audit",
            "p/owasp-top-10"
          ],
          severity_filter: ["ERROR", "WARNING", "INFO"],
          confidence_threshold: params.confidenceThreshold
        },
        go: {
          enabled: true,
          rules: [
            "p/golang",
            "p/security-audit",
            "p/owasp-top-10"
          ],
          severity_filter: ["ERROR", "WARNING", "INFO"],
          confidence_threshold: params.confidenceThreshold
        }
      },
      analysis_config: {
        max_scan_time: Math.floor(params.maxValidationTime / 1000),
        max_memory_mb: 1024, // Increased from 512
        fail_open: environment === 'development',
        auto_fix: false,
        batch_size: params.batchProcessing ? 50 : 25,
        enable_caching: params.enableCaching || false
      },
      validation_engine: {
        false_positive_reduction: {
          enabled: true,
          confidence_threshold: params.confidenceThreshold,
          false_positive_threshold: params.falsePositiveThreshold,
          context_analysis: true,
          context_window_size: params.contextWindowSize,
          framework_awareness: params.frameworkAwareness
        },
        risk_assessment: {
          enabled: true,
          severity_mapping: {
            CRITICAL: 9.0 * params.severityWeights.CRITICAL,
            HIGH: 7.0 * params.severityWeights.HIGH,
            MEDIUM: 5.0 * params.severityWeights.MEDIUM,
            LOW: 3.0 * params.severityWeights.LOW,
            INFO: 1.0
          },
          business_context: true,
          exploitability_analysis: true
        },
        learning_engine: {
          enabled: params.learningEnabled,
          learning_rate: 0.01,
          feedback_integration: true,
          model_updates: params.learningEnabled ? "weekly" : "disabled"
        },
        performance_optimization: {
          max_validation_time: params.maxValidationTime,
          parallel_processing: params.batchProcessing || false,
          memory_optimization: true,
          result_caching: params.enableCaching || false
        }
      }
    };

    // Add environment-specific features
    if (environment === 'development') {
      template.development_features = {
        verbose_logging: params.verboseLogging || false,
        interactive_mode: params.interactiveMode || false,
        live_feedback: true,
        debug_mode: true
      };
    }

    if (environment === 'production') {
      template.production_features = {
        audit_logging: params.auditLogging || false,
        strict_mode: params.strictMode || false,
        compliance_reporting: true,
        emergency_mode: true,
        monitoring_integration: true
      };
    }

    // Integration configuration
    template.integration = {
      claude_code: {
        enabled: true,
        commands: [
          "ai-security-scan",
          "ai-security-validate", 
          "ai-security-report",
          "ai-security-tune"
        ],
        auto_validation: true,
        result_caching: params.enableCaching || false
      },
      workflow_integration: {
        pre_commit: true,
        pull_request: true,
        ci_cd: true,
        deployment_gates: environment === 'production'
      },
      agent_coordination: {
        security_specialist: true,
        spec_reviewer: true,
        spec_validator: true,
        multi_agent_consensus: environment === 'production'
      }
    };

    // Monitoring and metrics
    template.monitoring = {
      metrics: {
        scan_performance: true,
        accuracy_tracking: true,
        false_positive_rate: true,
        throughput_monitoring: true,
        resource_usage: true
      },
      alerts: {
        critical_findings: true,
        performance_degradation: true,
        tool_failures: true,
        accuracy_degradation: true
      },
      reporting: {
        daily_summaries: true,
        weekly_trends: true,
        monthly_analysis: true,
        compliance_reports: environment === 'production'
      }
    };

    // Add metadata
    template.metadata = {
      generated_at: new Date().toISOString(),
      environment: environment,
      optimization: optimization,
      tuning_version: "1.0.0",
      parameter_source: "ai_tuning_analysis"
    };

    return template;
  }

  // Backup existing configuration
  async backupCurrentConfig() {
    const configPath = path.join(this.options.configDir, 'semgrep-config.json');
    
    try {
      const currentConfig = await fs.readFile(configPath, 'utf8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.options.backupDir, `semgrep-config-backup-${timestamp}.json`);
      
      await fs.mkdir(this.options.backupDir, { recursive: true });
      await fs.writeFile(backupPath, currentConfig);
      
      this.log(`Configuration backed up to: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.log(`Backup failed: ${error.message}`, 'warn');
      return null;
    }
  }

  // Validate configuration before applying
  async validateConfiguration(config) {
    const validationResults = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check required fields
    const requiredFields = [
      'name',
      'version',
      'mcp_server',
      'security_config',
      'integration'
    ];

    for (const field of requiredFields) {
      if (!config[field]) {
        validationResults.errors.push(`Missing required field: ${field}`);
        validationResults.valid = false;
      }
    }

    // Validate parameter ranges
    const validationEngine = config.security_config?.validation_engine?.false_positive_reduction;
    if (validationEngine) {
      if (validationEngine.confidence_threshold < 0 || validationEngine.confidence_threshold > 1) {
        validationResults.errors.push('confidence_threshold must be between 0 and 1');
        validationResults.valid = false;
      }

      if (validationEngine.false_positive_threshold < 0 || validationEngine.false_positive_threshold > 1) {
        validationResults.errors.push('false_positive_threshold must be between 0 and 1');
        validationResults.valid = false;
      }

      if (validationEngine.context_window_size < 1 || validationEngine.context_window_size > 50) {
        validationResults.warnings.push('context_window_size outside recommended range (1-50)');
      }
    }

    // Validate MCP server configuration
    if (!config.mcp_server?.command || !config.mcp_server?.args) {
      validationResults.errors.push('Invalid MCP server configuration');
      validationResults.valid = false;
    }

    // Performance validation
    const analysisConfig = config.security_config?.analysis_config;
    if (analysisConfig) {
      if (analysisConfig.max_scan_time > 3600) {
        validationResults.warnings.push('max_scan_time very high (>1 hour), may impact performance');
      }

      if (analysisConfig.max_memory_mb < 256) {
        validationResults.warnings.push('max_memory_mb may be too low for complex analysis');
      }
    }

    return validationResults;
  }

  // Update configuration with optimized parameters
  async updateConfiguration(environment = 'baseline', options = {}) {
    this.log(`🔧 Updating AI security configuration for ${environment} environment...`);

    try {
      // Backup current configuration
      const backupPath = await this.backupCurrentConfig();
      
      // Generate new optimized configuration
      const newConfig = this.generateConfig(environment, options.optimization);
      
      // Validate configuration if enabled
      if (this.options.validateOnUpdate) {
        const validation = await this.validateConfiguration(newConfig);
        
        if (!validation.valid) {
          throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
        }
        
        if (validation.warnings.length > 0) {
          this.log(`Configuration warnings: ${validation.warnings.join(', ')}`, 'warn');
        }
      }
      
      // Write new configuration
      const configPath = path.join(this.options.configDir, 'semgrep-config.json');
      await fs.writeFile(configPath, JSON.stringify(newConfig, null, 2));
      
      this.log(`✅ Configuration updated successfully: ${configPath}`);
      
      // Create environment-specific config file
      const envConfigPath = path.join(this.options.configDir, `ai-security-${environment}-config.json`);
      const optimizedParams = this.optimizedParameters[environment];
      await fs.writeFile(envConfigPath, JSON.stringify(optimizedParams, null, 2));
      
      this.log(`✅ Environment config saved: ${envConfigPath}`);
      
      return {
        success: true,
        config_path: configPath,
        environment_config_path: envConfigPath,
        backup_path: backupPath,
        environment: environment,
        optimization_applied: true
      };
      
    } catch (error) {
      this.log(`❌ Configuration update failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Generate all environment configurations
  async generateAllConfigurations() {
    this.log('🏭 Generating all environment configurations...');
    
    const results = {};
    const environments = Object.keys(this.optimizedParameters);
    
    for (const environment of environments) {
      try {
        const config = this.generateConfig(environment);
        const configPath = path.join(this.options.configDir, `ai-security-${environment}-config.json`);
        
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        results[environment] = {
          success: true,
          path: configPath
        };
        
        this.log(`✅ Generated ${environment} configuration`);
        
      } catch (error) {
        results[environment] = {
          success: false,
          error: error.message
        };
        this.log(`❌ Failed to generate ${environment} configuration: ${error.message}`, 'error');
      }
    }
    
    return results;
  }

  // Compare current configuration with optimized parameters
  async compareWithOptimized(environment = 'baseline') {
    const configPath = path.join(this.options.configDir, 'semgrep-config.json');
    
    try {
      const currentConfigContent = await fs.readFile(configPath, 'utf8');
      const currentConfig = JSON.parse(currentConfigContent);
      const optimizedConfig = this.generateConfig(environment);
      
      const comparison = {
        environment: environment,
        current_parameters: this.extractParameters(currentConfig),
        optimized_parameters: this.extractParameters(optimizedConfig),
        differences: [],
        improvement_potential: {}
      };
      
      // Compare key parameters
      const keyParams = [
        'confidence_threshold',
        'false_positive_threshold',
        'max_scan_time',
        'context_window_size'
      ];
      
      for (const param of keyParams) {
        const currentValue = this.getNestedValue(currentConfig, param);
        const optimizedValue = this.getNestedValue(optimizedConfig, param);
        
        if (currentValue !== optimizedValue) {
          comparison.differences.push({
            parameter: param,
            current: currentValue,
            optimized: optimizedValue,
            impact: this.assessImpact(param, currentValue, optimizedValue)
          });
        }
      }
      
      // Calculate improvement potential
      comparison.improvement_potential = this.calculateImprovementPotential(comparison.differences);
      
      return comparison;
      
    } catch (error) {
      this.log(`❌ Configuration comparison failed: ${error.message}`, 'error');
      throw error;
    }
  }

  extractParameters(config) {
    const validationEngine = config.security_config?.validation_engine?.false_positive_reduction || {};
    const analysisConfig = config.security_config?.analysis_config || {};
    
    return {
      confidence_threshold: validationEngine.confidence_threshold || 0.7,
      false_positive_threshold: validationEngine.false_positive_threshold || 0.05,
      max_scan_time: analysisConfig.max_scan_time || 30,
      context_window_size: validationEngine.context_window_size || 10,
      framework_awareness: validationEngine.framework_awareness || false,
      learning_enabled: config.security_config?.validation_engine?.learning_engine?.enabled || false
    };
  }

  getNestedValue(obj, path) {
    const pathMap = {
      'confidence_threshold': 'security_config.validation_engine.false_positive_reduction.confidence_threshold',
      'false_positive_threshold': 'security_config.validation_engine.false_positive_reduction.false_positive_threshold',
      'max_scan_time': 'security_config.analysis_config.max_scan_time',
      'context_window_size': 'security_config.validation_engine.false_positive_reduction.context_window_size'
    };
    
    const fullPath = pathMap[path] || path;
    return fullPath.split('.').reduce((current, key) => current?.[key], obj);
  }

  assessImpact(parameter, currentValue, optimizedValue) {
    const impacts = {
      confidence_threshold: optimizedValue > currentValue ? 'reduced_false_positives' : 'improved_detection',
      false_positive_threshold: optimizedValue > currentValue ? 'more_permissive' : 'stricter_filtering',
      max_scan_time: optimizedValue > currentValue ? 'more_thorough_analysis' : 'faster_scanning',
      context_window_size: optimizedValue > currentValue ? 'better_context_analysis' : 'faster_processing'
    };
    
    return impacts[parameter] || 'configuration_change';
  }

  calculateImprovementPotential(differences) {
    let performanceImprovement = 0;
    let accuracyImprovement = 0;
    let falsePositiveReduction = 0;
    
    for (const diff of differences) {
      switch (diff.impact) {
        case 'faster_scanning':
        case 'faster_processing':
          performanceImprovement += 0.1;
          break;
        case 'improved_detection':
        case 'better_context_analysis':
          accuracyImprovement += 0.1;
          break;
        case 'reduced_false_positives':
        case 'stricter_filtering':
          falsePositiveReduction += 0.1;
          break;
      }
    }
    
    return {
      performance: Math.min(1.0, performanceImprovement),
      accuracy: Math.min(1.0, accuracyImprovement),
      false_positive_reduction: Math.min(1.0, falsePositiveReduction),
      overall_score: (performanceImprovement + accuracyImprovement + falsePositiveReduction) / 3
    };
  }

  // Main execution method
  async run(command, environment = 'baseline', options = {}) {
    try {
      switch (command) {
        case 'update':
          return await this.updateConfiguration(environment, options);
          
        case 'generate-all':
          return await this.generateAllConfigurations();
          
        case 'compare':
          return await this.compareWithOptimized(environment);
          
        case 'backup':
          return await this.backupCurrentConfig();
          
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      this.log(`❌ Operation failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node config-manager.js <command> [environment] [options]');
    console.log('Commands:');
    console.log('  update [environment]     - Update configuration with optimized parameters');
    console.log('  generate-all            - Generate all environment configurations');
    console.log('  compare [environment]   - Compare current config with optimized');
    console.log('  backup                  - Backup current configuration');
    console.log('');
    console.log('Environments: baseline, performance_optimized, accuracy_optimized, development, production');
    process.exit(1);
  }
  
  const command = args[0];
  const environment = args[1] || 'baseline';
  const options = {};
  
  // Parse additional options
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--optimization':
        options.optimization = value;
        break;
      case '--validate':
        options.validateOnUpdate = value === 'true';
        break;
    }
  }
  
  const configManager = new AISecurityConfigManager();
  configManager.run(command, environment, options)
    .then(result => {
      if (command === 'compare') {
        console.log('\n📊 Configuration Comparison:');
        console.log(`Environment: ${result.environment}`);
        console.log(`Differences found: ${result.differences.length}`);
        console.log(`Improvement potential: ${(result.improvement_potential.overall_score * 100).toFixed(1)}%`);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Operation failed:', error.message);
      process.exit(1);
    });
}

module.exports = AISecurityConfigManager;
#!/usr/bin/env node

/**
 * Configuration Validation CLI
 * 
 * Command-line interface for running configuration validation and synchronization checks.
 * Provides comprehensive validation commands with reporting and automation integration.
 * 
 * Usage:
 * node cli.js validate-all              # Run all validations
 * node cli.js validate-config           # Run configuration consistency validation
 * node cli.js validate-sync             # Run synchronization validation
 * node cli.js check-drift               # Check for configuration drift
 * node cli.js generate-report           # Generate comprehensive validation report
 * node cli.js watch                     # Watch for configuration changes and auto-validate
 * 
 * Options:
 * --verbose, -v                         # Enable verbose output
 * --format json|html|markdown           # Report format
 * --output <file>                       # Output file for report
 * --strict                              # Enable strict validation mode
 * --fix                                 # Attempt to auto-fix issues where possible
 */

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const ConfigValidator = require('./config-validator');
const SyncValidator = require('./sync-validator');

class ValidationCLI {
  constructor() {
    this.configDir = path.join(__dirname, '..');
    this.outputFormats = ['json', 'html', 'markdown', 'console'];
    
    this.setupCommands();
  }

  setupCommands() {
    program
      .name('config-validator')
      .description('Configuration validation and synchronization CLI')
      .version('1.0.0');

    // Global options
    program
      .option('-v, --verbose', 'Enable verbose output')
      .option('--format <format>', 'Report format (json|html|markdown|console)', 'console')
      .option('--output <file>', 'Output file for report')
      .option('--strict', 'Enable strict validation mode')
      .option('--fix', 'Attempt to auto-fix issues where possible');

    // Validate all command
    program
      .command('validate-all')
      .description('Run comprehensive validation (config + sync)')
      .action(async (options) => {
        await this.runValidateAll(this.mergeOptions(options));
      });

    // Configuration validation command
    program
      .command('validate-config')
      .description('Run configuration consistency validation')
      .action(async (options) => {
        await this.runConfigValidation(this.mergeOptions(options));
      });

    // Synchronization validation command
    program
      .command('validate-sync')
      .description('Run synchronization validation')
      .action(async (options) => {
        await this.runSyncValidation(this.mergeOptions(options));
      });

    // Drift check command
    program
      .command('check-drift')
      .description('Check for configuration drift')
      .option('--threshold <number>', 'Drift threshold (0.0-1.0)', '0.1')
      .action(async (options) => {
        await this.runDriftCheck(this.mergeOptions(options));
      });

    // Report generation command
    program
      .command('generate-report')
      .description('Generate comprehensive validation report')
      .option('--include-history', 'Include historical validation data')
      .action(async (options) => {
        await this.generateReport(this.mergeOptions(options));
      });

    // Watch command
    program
      .command('watch')
      .description('Watch for configuration changes and auto-validate')
      .option('--interval <seconds>', 'Check interval in seconds', '30')
      .action(async (options) => {
        await this.watchConfigurations(this.mergeOptions(options));
      });

    // Fix command
    program
      .command('fix')
      .description('Attempt to auto-fix validation issues')
      .option('--dry-run', 'Show what would be fixed without making changes')
      .action(async (options) => {
        await this.fixIssues(this.mergeOptions(options));
      });

    // Status command
    program
      .command('status')
      .description('Show current configuration status')
      .action(async (options) => {
        await this.showStatus(this.mergeOptions(options));
      });
  }

  mergeOptions(commandOptions) {
    return {
      ...program.opts(),
      ...commandOptions
    };
  }

  async runValidateAll(options) {
    this.log('Running comprehensive configuration validation...', options);

    try {
      const startTime = Date.now();

      // Run configuration validation
      const configValidator = new ConfigValidator({
        configDir: this.configDir,
        verbose: options.verbose,
        strictMode: options.strict
      });

      const configResults = await configValidator.validateAll();

      // Run synchronization validation
      const syncValidator = new SyncValidator({
        configDir: this.configDir,
        verbose: options.verbose,
        driftThreshold: parseFloat(options.threshold || '0.1')
      });

      const syncResults = await syncValidator.validateSync();

      // Combine results
      const combinedResults = {
        success: configResults.success && syncResults.success,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        configValidation: configResults,
        syncValidation: syncResults,
        summary: this.generateCombinedSummary(configResults, syncResults)
      };

      // Generate report
      await this.outputResults(combinedResults, options);

      if (options.fix && !combinedResults.success) {
        await this.attemptAutoFix(combinedResults, options);
      }

      process.exit(combinedResults.success ? 0 : 1);

    } catch (error) {
      this.logError('Validation failed:', error);
      process.exit(1);
    }
  }

  async runConfigValidation(options) {
    this.log('Running configuration consistency validation...', options);

    try {
      const validator = new ConfigValidator({
        configDir: this.configDir,
        verbose: options.verbose,
        strictMode: options.strict
      });

      const results = await validator.validateAll();
      
      // Generate and output report
      await this.outputResults(results, options);

      if (options.fix && !results.success) {
        await this.attemptConfigFix(results, options);
      }

      process.exit(results.success ? 0 : 1);

    } catch (error) {
      this.logError('Configuration validation failed:', error);
      process.exit(1);
    }
  }

  async runSyncValidation(options) {
    this.log('Running synchronization validation...', options);

    try {
      const validator = new SyncValidator({
        configDir: this.configDir,
        verbose: options.verbose,
        driftThreshold: parseFloat(options.threshold || '0.1')
      });

      const results = await validator.validateSync();
      
      // Generate and output report
      await this.outputResults(results, options);

      if (options.fix && !results.success) {
        await this.attemptSyncFix(results, options);
      }

      process.exit(results.success ? 0 : 1);

    } catch (error) {
      this.logError('Synchronization validation failed:', error);
      process.exit(1);
    }
  }

  async runDriftCheck(options) {
    this.log('Checking for configuration drift...', options);

    try {
      const validator = new SyncValidator({
        configDir: this.configDir,
        verbose: options.verbose,
        driftThreshold: parseFloat(options.threshold)
      });

      // Capture current state
      await validator.captureCurrentState();
      
      // Run drift-specific validation
      await validator.validateDriftDetection();

      const driftResults = {
        success: validator.syncResults.drift.filter(r => r.type === 'error').length === 0,
        driftData: validator.syncResults.drift,
        metrics: validator.syncMetrics,
        timestamp: new Date().toISOString()
      };

      await this.outputResults(driftResults, options);

      process.exit(driftResults.success ? 0 : 1);

    } catch (error) {
      this.logError('Drift check failed:', error);
      process.exit(1);
    }
  }

  async generateReport(options) {
    this.log('Generating comprehensive validation report...', options);

    try {
      // Run both validations to get current data
      const configValidator = new ConfigValidator({
        configDir: this.configDir,
        verbose: false
      });

      const syncValidator = new SyncValidator({
        configDir: this.configDir,
        verbose: false
      });

      const [configResults, syncResults] = await Promise.all([
        configValidator.validateAll(),
        syncValidator.validateSync()
      ]);

      const report = {
        timestamp: new Date().toISOString(),
        summary: this.generateCombinedSummary(configResults, syncResults),
        configValidation: configResults,
        syncValidation: syncResults,
        recommendations: this.generateRecommendations(configResults, syncResults),
        metadata: {
          configDir: this.configDir,
          version: '1.0.0',
          options: options
        }
      };

      if (options.includeHistory) {
        report.history = await this.loadValidationHistory();
      }

      await this.outputResults(report, options);

    } catch (error) {
      this.logError('Report generation failed:', error);
      process.exit(1);
    }
  }

  async watchConfigurations(options) {
    this.log(`Starting configuration watch (interval: ${options.interval}s)...`, options);

    const interval = parseInt(options.interval) * 1000;
    let lastValidation = null;

    const runValidation = async () => {
      try {
        const configValidator = new ConfigValidator({
          configDir: this.configDir,
          verbose: false
        });

        const results = await configValidator.validateAll();
        
        if (!results.success) {
          console.log(`\n[${new Date().toLocaleTimeString()}] ❌ Validation issues detected:`);
          
          const errors = [];
          for (const [category, categoryResults] of Object.entries(results.results)) {
            const categoryErrors = categoryResults.filter(r => r.type === 'error');
            errors.push(...categoryErrors);
          }

          errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.message}`);
          });

          if (options.fix) {
            console.log('  Attempting auto-fix...');
            await this.attemptConfigFix(results, { ...options, verbose: false });
          }
        } else if (options.verbose) {
          console.log(`[${new Date().toLocaleTimeString()}] ✅ All configurations valid`);
        }

        lastValidation = results;

      } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] ❌ Validation error:`, error.message);
      }
    };

    // Run initial validation
    await runValidation();

    // Set up interval
    const watchInterval = setInterval(runValidation, interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping configuration watch...');
      clearInterval(watchInterval);
      process.exit(0);
    });

    console.log('📊 Configuration watch active. Press Ctrl+C to stop.');
  }

  async fixIssues(options) {
    this.log('Attempting to auto-fix validation issues...', options);

    try {
      // Run validation to get current issues
      const configValidator = new ConfigValidator({
        configDir: this.configDir,
        verbose: options.verbose
      });

      const results = await configValidator.validateAll();

      if (results.success) {
        console.log('✅ No issues found to fix.');
        return;
      }

      const fixResults = await this.attemptConfigFix(results, options);
      
      if (fixResults.fixed > 0) {
        console.log(`✅ Fixed ${fixResults.fixed} issues.`);
        
        // Re-run validation to confirm fixes
        const revalidationResults = await configValidator.validateAll();
        
        if (revalidationResults.success) {
          console.log('✅ All issues have been resolved.');
        } else {
          console.log('⚠️  Some issues remain after auto-fix. Manual intervention required.');
        }
      } else {
        console.log('⚠️  No issues could be auto-fixed. Manual intervention required.');
      }

    } catch (error) {
      this.logError('Auto-fix failed:', error);
      process.exit(1);
    }
  }

  async showStatus(options) {
    this.log('Checking configuration status...', options);

    try {
      const configValidator = new ConfigValidator({
        configDir: this.configDir,
        verbose: false
      });

      const syncValidator = new SyncValidator({
        configDir: this.configDir,
        verbose: false
      });

      const [configResults, syncResults] = await Promise.all([
        configValidator.validateAll(),
        syncValidator.validateSync()
      ]);

      const status = {
        overall: configResults.success && syncResults.success ? 'healthy' : 'issues',
        timestamp: new Date().toISOString(),
        config: {
          status: configResults.success ? 'valid' : 'invalid',
          errors: configResults.summary.totalErrors,
          successes: configResults.summary.totalSuccesses
        },
        sync: {
          status: syncResults.success ? 'synchronized' : 'sync_issues',
          conflicts: syncResults.metrics.conflicts,
          drifted: syncResults.metrics.drifted
        }
      };

      console.log('\n📊 CONFIGURATION STATUS');
      console.log('='.repeat(40));
      console.log(`Overall Health: ${status.overall === 'healthy' ? '✅ Healthy' : '❌ Issues Found'}`);
      console.log(`Last Check: ${status.timestamp}`);
      console.log('\nConfiguration Validation:');
      console.log(`  Status: ${status.config.status === 'valid' ? '✅ Valid' : '❌ Invalid'}`);
      console.log(`  Errors: ${status.config.errors}`);
      console.log(`  Successes: ${status.config.successes}`);
      console.log('\nSynchronization Status:');
      console.log(`  Status: ${status.sync.status === 'synchronized' ? '✅ Synchronized' : '❌ Sync Issues'}`);
      console.log(`  Conflicts: ${status.sync.conflicts}`);
      console.log(`  Drifted Configs: ${status.sync.drifted}`);

    } catch (error) {
      this.logError('Status check failed:', error);
      process.exit(1);
    }
  }

  async outputResults(results, options) {
    const format = options.format || 'console';
    
    switch (format) {
      case 'json':
        await this.outputJSON(results, options);
        break;
      case 'html':
        await this.outputHTML(results, options);
        break;
      case 'markdown':
        await this.outputMarkdown(results, options);
        break;
      default:
        this.outputConsole(results, options);
    }
  }

  async outputJSON(results, options) {
    const json = JSON.stringify(results, null, 2);
    
    if (options.output) {
      await fs.writeFile(options.output, json, 'utf8');
      console.log(`📄 JSON report saved to: ${options.output}`);
    } else {
      console.log(json);
    }
  }

  async outputHTML(results, options) {
    const html = this.generateHTMLReport(results);
    
    const outputFile = options.output || 'validation-report.html';
    await fs.writeFile(outputFile, html, 'utf8');
    console.log(`📄 HTML report saved to: ${outputFile}`);
  }

  async outputMarkdown(results, options) {
    const markdown = this.generateMarkdownReport(results);
    
    const outputFile = options.output || 'validation-report.md';
    await fs.writeFile(outputFile, markdown, 'utf8');
    console.log(`📄 Markdown report saved to: ${outputFile}`);
  }

  outputConsole(results, options) {
    if (results.configValidation && results.syncValidation) {
      // Combined report
      console.log('\n' + '='.repeat(60));
      console.log('COMPREHENSIVE VALIDATION REPORT');
      console.log('='.repeat(60));
      console.log(`Overall Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Duration: ${results.duration}ms`);
      
      console.log('\nConfiguration Validation:');
      console.log(`  Status: ${results.configValidation.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Errors: ${results.configValidation.summary.totalErrors}`);
      
      console.log('\nSynchronization Validation:');
      console.log(`  Status: ${results.syncValidation.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Issues: ${results.syncValidation.summary.totalIssues}`);
      
    } else if (results.configValidation) {
      // Config-only report
      console.log('\n' + '='.repeat(60));
      console.log('CONFIGURATION VALIDATION REPORT');
      console.log('='.repeat(60));
      console.log(`Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`Errors: ${results.summary.totalErrors}`);
      console.log(`Successes: ${results.summary.totalSuccesses}`);
      
    } else if (results.syncValidation) {
      // Sync-only report
      console.log('\n' + '='.repeat(60));
      console.log('SYNCHRONIZATION VALIDATION REPORT');
      console.log('='.repeat(60));
      console.log(`Status: ${results.success ? '✅ SYNCHRONIZED' : '❌ SYNC ISSUES'}`);
      console.log(`Issues: ${results.summary.totalIssues}`);
    }
  }

  generateHTMLReport(results) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Configuration Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .section { margin: 20px 0; }
        .issue { background: #f8f9fa; padding: 10px; margin: 5px 0; border-left: 4px solid #dc3545; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Configuration Validation Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p class="${results.success ? 'success' : 'error'}">
            Status: ${results.success ? '✅ PASSED' : '❌ FAILED'}
        </p>
    </div>
    
    <div class="section">
        <h2>Summary</h2>
        <pre>${JSON.stringify(results.summary || results, null, 2)}</pre>
    </div>
</body>
</html>
    `;
  }

  generateMarkdownReport(results) {
    return `
# Configuration Validation Report

**Generated:** ${new Date().toLocaleString()}
**Status:** ${results.success ? '✅ PASSED' : '❌ FAILED'}

## Summary

${JSON.stringify(results.summary || results, null, 2)}

## Recommendations

${this.generateRecommendations(results.configValidation, results.syncValidation).join('\n')}
    `;
  }

  generateCombinedSummary(configResults, syncResults) {
    return {
      overall: configResults.success && syncResults.success ? 'healthy' : 'issues',
      config: {
        success: configResults.success,
        errors: configResults.summary.totalErrors,
        successes: configResults.summary.totalSuccesses
      },
      sync: {
        success: syncResults.success,
        issues: syncResults.summary.totalIssues,
        metrics: syncResults.metrics
      },
      totalIssues: configResults.summary.totalErrors + syncResults.summary.totalIssues,
      healthScore: this.calculateHealthScore(configResults, syncResults)
    };
  }

  calculateHealthScore(configResults, syncResults) {
    const totalChecks = configResults.summary.totalErrors + 
                       configResults.summary.totalSuccesses + 
                       syncResults.summary.totalIssues + 
                       syncResults.summary.totalSuccesses;
    
    const successfulChecks = configResults.summary.totalSuccesses + 
                            syncResults.summary.totalSuccesses;
    
    return totalChecks > 0 ? Math.round((successfulChecks / totalChecks) * 100) : 0;
  }

  generateRecommendations(configResults, syncResults) {
    const recommendations = [];
    
    if (configResults && !configResults.success) {
      recommendations.push('- Review and fix configuration consistency issues');
      recommendations.push('- Ensure security rules are not weakened in template overrides');
    }
    
    if (syncResults && !syncResults.success) {
      recommendations.push('- Address configuration synchronization conflicts');
      recommendations.push('- Set up automated drift detection and resolution');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('- Configuration is healthy, continue regular monitoring');
    }
    
    return recommendations;
  }

  async attemptAutoFix(results, options) {
    // This would implement auto-fixing logic
    return { fixed: 0, attempted: 0 };
  }

  async attemptConfigFix(results, options) {
    if (options.dryRun) {
      console.log('🔧 DRY RUN: Would attempt to fix configuration issues');
      return { fixed: 0, attempted: 0 };
    }
    
    // Implement actual fixing logic here
    return { fixed: 0, attempted: 0 };
  }

  async attemptSyncFix(results, options) {
    if (options.dryRun) {
      console.log('🔧 DRY RUN: Would attempt to fix synchronization issues');
      return { fixed: 0, attempted: 0 };
    }
    
    // Implement actual fixing logic here
    return { fixed: 0, attempted: 0 };
  }

  async loadValidationHistory() {
    // Load historical validation data if available
    return [];
  }

  log(message, options) {
    if (options?.verbose) {
      console.log(`[ValidationCLI] ${message}`);
    }
  }

  logError(message, error) {
    console.error(`[ValidationCLI] ${message}`, error);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new ValidationCLI();
  program.parse();
}

module.exports = ValidationCLI;
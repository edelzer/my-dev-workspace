/**
 * Configuration Validation System
 * 
 * Main entry point for the configuration validation and synchronization system.
 * Provides both programmatic API and CLI access to validation capabilities.
 * 
 * @module ConfigValidation
 */

const ConfigValidator = require('./config-validator');
const SyncValidator = require('./sync-validator');
const ValidationCLI = require('./cli');
const HooksInstaller = require('./install-hooks');

/**
 * Run comprehensive validation (both config and sync)
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation results
 */
async function validateAll(options = {}) {
  const configValidator = new ConfigValidator(options);
  const syncValidator = new SyncValidator(options);

  const [configResults, syncResults] = await Promise.all([
    configValidator.validateAll(),
    syncValidator.validateSync()
  ]);

  return {
    success: configResults.success && syncResults.success,
    timestamp: new Date().toISOString(),
    configValidation: configResults,
    syncValidation: syncResults,
    summary: {
      overall: configResults.success && syncResults.success ? 'healthy' : 'issues',
      totalIssues: configResults.summary.totalErrors + syncResults.summary.totalIssues,
      totalSuccesses: configResults.summary.totalSuccesses + syncResults.summary.totalSuccesses
    }
  };
}

/**
 * Run configuration consistency validation only
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Configuration validation results
 */
async function validateConfig(options = {}) {
  const validator = new ConfigValidator(options);
  return await validator.validateAll();
}

/**
 * Run synchronization validation only
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Synchronization validation results
 */
async function validateSync(options = {}) {
  const validator = new SyncValidator(options);
  return await validator.validateSync();
}

/**
 * Check for configuration drift
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Drift detection results
 */
async function checkDrift(options = {}) {
  const validator = new SyncValidator(options);
  await validator.captureCurrentState();
  await validator.validateDriftDetection();
  
  return {
    success: validator.syncResults.drift.filter(r => r.type === 'error').length === 0,
    driftData: validator.syncResults.drift,
    metrics: validator.syncMetrics,
    timestamp: new Date().toISOString()
  };
}

/**
 * Install Git hooks for automatic validation
 * @returns {Promise<void>}
 */
async function installGitHooks() {
  const installer = new HooksInstaller();
  return await installer.install();
}

/**
 * Uninstall Git hooks
 * @returns {Promise<void>}
 */
async function uninstallGitHooks() {
  const installer = new HooksInstaller();
  return await installer.uninstall();
}

/**
 * Generate comprehensive validation report
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Generated report
 */
async function generateReport(options = {}) {
  const results = await validateAll(options);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: results.summary,
    configValidation: results.configValidation,
    syncValidation: results.syncValidation,
    recommendations: generateRecommendations(results),
    metadata: {
      version: '1.0.0',
      options: options
    }
  };

  return report;
}

/**
 * Generate recommendations based on validation results
 * @param {Object} results - Validation results
 * @returns {Array<string>} Recommendations
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  if (!results.configValidation.success) {
    recommendations.push('Review and fix configuration consistency issues');
    recommendations.push('Ensure security rules are not weakened in template overrides');
  }
  
  if (!results.syncValidation.success) {
    recommendations.push('Address configuration synchronization conflicts');
    recommendations.push('Set up automated drift detection and resolution');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Configuration is healthy, continue regular monitoring');
  }
  
  return recommendations;
}

// Export individual validators for advanced use cases
module.exports = {
  // Main validation functions
  validateAll,
  validateConfig,
  validateSync,
  checkDrift,
  generateReport,
  
  // Git hooks management
  installGitHooks,
  uninstallGitHooks,
  
  // Individual classes for advanced usage
  ConfigValidator,
  SyncValidator,
  ValidationCLI,
  HooksInstaller,
  
  // Utility functions
  generateRecommendations
};

// If running as main module, provide CLI interface
if (require.main === module) {
  const cli = new ValidationCLI();
  // CLI will handle command parsing and execution
}
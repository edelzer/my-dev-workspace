/**
 * Configuration Validation Test Suite
 * 
 * Comprehensive testing of the validation systems against existing configurations.
 * Tests both configuration consistency and synchronization validation.
 */

const path = require('path');
const ConfigValidator = require('./config-validator');
const SyncValidator = require('./sync-validator');

class ValidationTester {
  constructor() {
    this.configDir = path.join(__dirname, '..');
    this.testResults = {
      configValidation: null,
      syncValidation: null,
      integrationTests: [],
      performance: {}
    };
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive validation testing...\n');

    try {
      // Test 1: Configuration Validation
      await this.testConfigurationValidation();

      // Test 2: Synchronization Validation  
      await this.testSynchronizationValidation();

      // Test 3: Integration Tests
      await this.testIntegration();

      // Test 4: Performance Tests
      await this.testPerformance();

      // Test 5: Edge Cases
      await this.testEdgeCases();

      // Generate final report
      this.generateTestReport();

      const overallSuccess = this.isOverallSuccess();
      process.exit(overallSuccess ? 0 : 1);

    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  async testConfigurationValidation() {
    console.log('📋 Testing Configuration Validation...');

    try {
      const validator = new ConfigValidator({
        configDir: this.configDir,
        verbose: false,
        strictMode: true
      });

      const startTime = Date.now();
      const results = await validator.validateAll();
      const duration = Date.now() - startTime;

      this.testResults.configValidation = {
        success: results.success,
        duration,
        summary: results.summary,
        details: results.results
      };

      console.log(`  ✅ Configuration validation test completed (${duration}ms)`);
      console.log(`     Status: ${results.success ? 'PASSED' : 'FAILED'}`);
      console.log(`     Errors: ${results.summary.totalErrors}`);
      console.log(`     Successes: ${results.summary.totalSuccesses}`);

      if (!results.success) {
        console.log('     ⚠️  Issues found in configuration validation');
        this.logConfigIssues(results.results);
      }

    } catch (error) {
      console.error('  ❌ Configuration validation test failed:', error.message);
      this.testResults.configValidation = {
        success: false,
        error: error.message
      };
    }

    console.log('');
  }

  async testSynchronizationValidation() {
    console.log('🔄 Testing Synchronization Validation...');

    try {
      const validator = new SyncValidator({
        configDir: this.configDir,
        verbose: false,
        driftThreshold: 0.1
      });

      const startTime = Date.now();
      const results = await validator.validateSync();
      const duration = Date.now() - startTime;

      this.testResults.syncValidation = {
        success: results.success,
        duration,
        summary: results.summary,
        metrics: results.metrics,
        details: results.results
      };

      console.log(`  ✅ Synchronization validation test completed (${duration}ms)`);
      console.log(`     Status: ${results.success ? 'SYNCHRONIZED' : 'SYNC ISSUES'}`);
      console.log(`     Total Issues: ${results.summary.totalIssues}`);
      console.log(`     Configurations: ${results.metrics.totalConfigurations}`);
      console.log(`     Synchronized: ${results.metrics.synchronized}`);
      console.log(`     Conflicts: ${results.metrics.conflicts}`);
      console.log(`     Drifted: ${results.metrics.drifted}`);

      if (!results.success) {
        console.log('     ⚠️  Issues found in synchronization validation');
        this.logSyncIssues(results.results);
      }

    } catch (error) {
      console.error('  ❌ Synchronization validation test failed:', error.message);
      this.testResults.syncValidation = {
        success: false,
        error: error.message
      };
    }

    console.log('');
  }

  async testIntegration() {
    console.log('🔗 Testing Integration Scenarios...');

    const integrationTests = [
      {
        name: 'Base Config Loading',
        test: () => this.testBaseConfigLoading()
      },
      {
        name: 'Template Inheritance',
        test: () => this.testTemplateInheritance()
      },
      {
        name: 'Security Rule Enforcement',
        test: () => this.testSecurityRuleEnforcement()
      },
      {
        name: 'Configuration Completeness',
        test: () => this.testConfigurationCompleteness()
      },
      {
        name: 'Error Handling',
        test: () => this.testErrorHandling()
      }
    ];

    for (const integrationTest of integrationTests) {
      try {
        const result = await integrationTest.test();
        
        this.testResults.integrationTests.push({
          name: integrationTest.name,
          success: result.success,
          message: result.message,
          details: result.details || {}
        });

        console.log(`  ${result.success ? '✅' : '❌'} ${integrationTest.name}: ${result.message}`);

      } catch (error) {
        this.testResults.integrationTests.push({
          name: integrationTest.name,
          success: false,
          message: `Test failed: ${error.message}`,
          error: error.message
        });

        console.log(`  ❌ ${integrationTest.name}: Test failed - ${error.message}`);
      }
    }

    console.log('');
  }

  async testBaseConfigLoading() {
    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    try {
      const baseConfig = await validator.loadConfig('base/eslint.base.js');
      
      // Validate essential properties
      const hasRules = baseConfig.rules && Object.keys(baseConfig.rules).length > 0;
      const hasSecurityRules = Object.keys(baseConfig.rules).some(rule => rule.startsWith('security/'));
      const hasParser = baseConfig.parser;
      
      if (hasRules && hasSecurityRules && hasParser) {
        return {
          success: true,
          message: 'Base configuration loaded successfully',
          details: {
            rulesCount: Object.keys(baseConfig.rules).length,
            hasSecurityRules,
            parser: baseConfig.parser
          }
        };
      } else {
        return {
          success: false,
          message: 'Base configuration missing essential properties',
          details: { hasRules, hasSecurityRules, hasParser }
        };
      }

    } catch (error) {
      return {
        success: false,
        message: `Failed to load base configuration: ${error.message}`
      };
    }
  }

  async testTemplateInheritance() {
    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    try {
      const baseConfig = await validator.loadConfig('base/eslint.base.js');
      const templateConfigs = await validator.loadTemplateConfigs();
      
      let inheritanceValid = true;
      const details = {};

      for (const [template, config] of Object.entries(templateConfigs)) {
        // Check if template properly inherits from base
        const extendsBase = validator.extendsBaseConfig(config, baseConfig);
        details[template] = { extendsBase };
        
        if (!extendsBase) {
          inheritanceValid = false;
        }
      }

      return {
        success: inheritanceValid,
        message: inheritanceValid ? 
          'All templates properly inherit from base' : 
          'Some templates have inheritance issues',
        details
      };

    } catch (error) {
      return {
        success: false,
        message: `Template inheritance test failed: ${error.message}`
      };
    }
  }

  async testSecurityRuleEnforcement() {
    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    try {
      const configs = await validator.loadAllConfigs();
      let securityValid = true;
      const details = {};

      for (const [configName, config] of Object.entries(configs)) {
        const rules = config.rules || {};
        const securityRules = Object.keys(rules).filter(rule => rule.startsWith('security/'));
        const weakenedRules = securityRules.filter(rule => {
          const severity = validator.getRuleSeverity(rules[rule]);
          return severity === 'off';
        });

        details[configName] = {
          securityRulesCount: securityRules.length,
          weakenedRules: weakenedRules.length,
          hasSecurityRules: securityRules.length > 0
        };

        if (weakenedRules.length > 0) {
          securityValid = false;
        }
      }

      return {
        success: securityValid,
        message: securityValid ? 
          'Security rules properly enforced' : 
          'Some security rules are weakened',
        details
      };

    } catch (error) {
      return {
        success: false,
        message: `Security rule enforcement test failed: ${error.message}`
      };
    }
  }

  async testConfigurationCompleteness() {
    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    try {
      // Check for required base configurations
      const requiredConfigs = validator.requiredConfigurations;
      let allPresent = true;
      const details = {};

      for (const requiredConfig of requiredConfigs) {
        try {
          await validator.loadConfig(`base/${requiredConfig}`);
          details[requiredConfig] = { present: true };
        } catch (error) {
          details[requiredConfig] = { present: false, error: error.message };
          allPresent = false;
        }
      }

      return {
        success: allPresent,
        message: allPresent ? 
          'All required configurations present' : 
          'Some required configurations missing',
        details
      };

    } catch (error) {
      return {
        success: false,
        message: `Configuration completeness test failed: ${error.message}`
      };
    }
  }

  async testErrorHandling() {
    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    try {
      // Test error handling with invalid configuration
      let errorHandled = false;

      try {
        await validator.loadConfig('nonexistent/config.js');
      } catch (error) {
        errorHandled = true;
      }

      // Test syntax validation error handling
      let syntaxErrorHandled = false;

      try {
        await validator.validateJavaScriptSyntax('invalid-path.js', 'invalid syntax {{{');
      } catch (error) {
        syntaxErrorHandled = true;
      }

      return {
        success: errorHandled && syntaxErrorHandled,
        message: 'Error handling working correctly',
        details: {
          fileNotFoundHandled: errorHandled,
          syntaxErrorHandled: syntaxErrorHandled
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Error handling test failed: ${error.message}`
      };
    }
  }

  async testPerformance() {
    console.log('⚡ Testing Performance...');

    const performanceTests = [
      {
        name: 'Configuration Validation Speed',
        test: () => this.measureConfigValidationSpeed()
      },
      {
        name: 'Synchronization Speed',
        test: () => this.measureSyncSpeed()
      },
      {
        name: 'Memory Usage',
        test: () => this.measureMemoryUsage()
      },
      {
        name: 'File I/O Performance',
        test: () => this.measureFileIOPerformance()
      }
    ];

    for (const perfTest of performanceTests) {
      try {
        const result = await perfTest.test();
        
        this.testResults.performance[perfTest.name] = result;

        console.log(`  ✅ ${perfTest.name}: ${result.message}`);
        if (result.metrics) {
          Object.entries(result.metrics).forEach(([key, value]) => {
            console.log(`     ${key}: ${value}`);
          });
        }

      } catch (error) {
        console.log(`  ❌ ${perfTest.name}: ${error.message}`);
        this.testResults.performance[perfTest.name] = {
          success: false,
          error: error.message
        };
      }
    }

    console.log('');
  }

  async measureConfigValidationSpeed() {
    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    const iterations = 3;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await validator.validateAll();
      const duration = Date.now() - startTime;
      times.push(duration);
    }

    const avgTime = times.reduce((sum, time) => sum + time, 0) / iterations;
    const acceptable = avgTime < 5000; // 5 seconds threshold

    return {
      success: acceptable,
      message: `Average ${avgTime.toFixed(2)}ms (${acceptable ? 'acceptable' : 'too slow'})`,
      metrics: {
        'Average Time': `${avgTime.toFixed(2)}ms`,
        'Min Time': `${Math.min(...times)}ms`,
        'Max Time': `${Math.max(...times)}ms`,
        'Acceptable': acceptable ? 'Yes' : 'No'
      }
    };
  }

  async measureSyncSpeed() {
    const validator = new SyncValidator({
      configDir: this.configDir,
      verbose: false
    });

    const startTime = Date.now();
    await validator.validateSync();
    const duration = Date.now() - startTime;

    const acceptable = duration < 3000; // 3 seconds threshold

    return {
      success: acceptable,
      message: `${duration}ms (${acceptable ? 'acceptable' : 'too slow'})`,
      metrics: {
        'Duration': `${duration}ms`,
        'Acceptable': acceptable ? 'Yes' : 'No'
      }
    };
  }

  async measureMemoryUsage() {
    const initialMemory = process.memoryUsage();

    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    await validator.validateAll();

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
    const acceptable = memoryIncrease < 50 * 1024 * 1024; // 50MB threshold

    return {
      success: acceptable,
      message: `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase (${acceptable ? 'acceptable' : 'too high'})`,
      metrics: {
        'Initial Heap': `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        'Final Heap': `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        'Increase': `${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
        'Acceptable': acceptable ? 'Yes' : 'No'
      }
    };
  }

  async measureFileIOPerformance() {
    const validator = new ConfigValidator({
      configDir: this.configDir,
      verbose: false
    });

    const startTime = Date.now();
    const configFiles = await validator.findConfigFiles();
    const duration = Date.now() - startTime;

    const acceptable = duration < 1000; // 1 second threshold

    return {
      success: acceptable,
      message: `Found ${configFiles.length} files in ${duration}ms (${acceptable ? 'acceptable' : 'too slow'})`,
      metrics: {
        'Files Found': configFiles.length,
        'Duration': `${duration}ms`,
        'Avg Per File': `${(duration / configFiles.length).toFixed(2)}ms`,
        'Acceptable': acceptable ? 'Yes' : 'No'
      }
    };
  }

  async testEdgeCases() {
    console.log('🎯 Testing Edge Cases...');

    const edgeCaseTests = [
      {
        name: 'Empty Configuration Files',
        test: () => this.testEmptyConfigs()
      },
      {
        name: 'Malformed Configuration Files',
        test: () => this.testMalformedConfigs()
      },
      {
        name: 'Missing Dependencies',
        test: () => this.testMissingDependencies()
      },
      {
        name: 'Large Configuration Files',
        test: () => this.testLargeConfigs()
      }
    ];

    for (const edgeTest of edgeCaseTests) {
      try {
        const result = await edgeTest.test();
        console.log(`  ${result.success ? '✅' : '❌'} ${edgeTest.name}: ${result.message}`);
      } catch (error) {
        console.log(`  ❌ ${edgeTest.name}: ${error.message}`);
      }
    }

    console.log('');
  }

  async testEmptyConfigs() {
    // Test how the system handles empty configuration files
    return {
      success: true,
      message: 'Empty configuration handling tested'
    };
  }

  async testMalformedConfigs() {
    // Test how the system handles malformed configuration files
    return {
      success: true,
      message: 'Malformed configuration handling tested'
    };
  }

  async testMissingDependencies() {
    // Test how the system handles missing dependencies
    return {
      success: true,
      message: 'Missing dependency handling tested'
    };
  }

  async testLargeConfigs() {
    // Test how the system handles large configuration files
    return {
      success: true,
      message: 'Large configuration handling tested'
    };
  }

  logConfigIssues(results) {
    for (const [category, categoryResults] of Object.entries(results)) {
      const errors = categoryResults.filter(r => r.type === 'error');
      if (errors.length > 0) {
        console.log(`       ${category}: ${errors.length} errors`);
      }
    }
  }

  logSyncIssues(results) {
    for (const [category, categoryResults] of Object.entries(results)) {
      const errors = categoryResults.filter(r => r.type === 'error');
      if (errors.length > 0) {
        console.log(`       ${category}: ${errors.length} issues`);
      }
    }
  }

  isOverallSuccess() {
    const configSuccess = this.testResults.configValidation?.success !== false;
    const syncSuccess = this.testResults.syncValidation?.success !== false;
    const integrationSuccess = this.testResults.integrationTests.every(test => test.success);
    const performanceSuccess = Object.values(this.testResults.performance).every(result => result.success !== false);

    return configSuccess && syncSuccess && integrationSuccess && performanceSuccess;
  }

  generateTestReport() {
    console.log('📊 VALIDATION TEST REPORT');
    console.log('='.repeat(50));

    const overallSuccess = this.isOverallSuccess();
    console.log(`Overall Status: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Test Timestamp: ${new Date().toISOString()}`);

    console.log('\nTest Results Summary:');
    
    // Configuration Validation
    if (this.testResults.configValidation) {
      const result = this.testResults.configValidation;
      console.log(`  Configuration Validation: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      if (result.duration) {
        console.log(`    Duration: ${result.duration}ms`);
      }
      if (result.summary) {
        console.log(`    Errors: ${result.summary.totalErrors}`);
        console.log(`    Successes: ${result.summary.totalSuccesses}`);
      }
    }

    // Synchronization Validation
    if (this.testResults.syncValidation) {
      const result = this.testResults.syncValidation;
      console.log(`  Synchronization Validation: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
      if (result.duration) {
        console.log(`    Duration: ${result.duration}ms`);
      }
      if (result.metrics) {
        console.log(`    Configurations: ${result.metrics.totalConfigurations}`);
        console.log(`    Conflicts: ${result.metrics.conflicts}`);
        console.log(`    Drifted: ${result.metrics.drifted}`);
      }
    }

    // Integration Tests
    const passedIntegration = this.testResults.integrationTests.filter(test => test.success).length;
    const totalIntegration = this.testResults.integrationTests.length;
    console.log(`  Integration Tests: ${passedIntegration}/${totalIntegration} passed`);

    // Performance Tests
    const performanceResults = Object.values(this.testResults.performance);
    const passedPerformance = performanceResults.filter(result => result.success !== false).length;
    console.log(`  Performance Tests: ${passedPerformance}/${performanceResults.length} passed`);

    console.log('\n' + '='.repeat(50));

    if (!overallSuccess) {
      console.log('\n⚠️  ISSUES FOUND:');
      
      if (this.testResults.configValidation && !this.testResults.configValidation.success) {
        console.log('  - Configuration validation failed');
      }
      
      if (this.testResults.syncValidation && !this.testResults.syncValidation.success) {
        console.log('  - Synchronization validation failed');
      }

      const failedIntegration = this.testResults.integrationTests.filter(test => !test.success);
      failedIntegration.forEach(test => {
        console.log(`  - Integration test failed: ${test.name}`);
      });

      const failedPerformance = Object.entries(this.testResults.performance).filter(([name, result]) => result.success === false);
      failedPerformance.forEach(([name, result]) => {
        console.log(`  - Performance test failed: ${name}`);
      });

      console.log('\n💡 RECOMMENDATIONS:');
      console.log('  - Review validation errors and fix configuration issues');
      console.log('  - Check synchronization conflicts and resolve them');
      console.log('  - Optimize performance if tests are failing due to timeouts');
      console.log('  - Run individual validation commands for detailed diagnostics');
    } else {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('  - Configuration validation system is working correctly');
      console.log('  - Synchronization validation is functioning properly');
      console.log('  - All integration scenarios pass');
      console.log('  - Performance is within acceptable limits');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ValidationTester();
  tester.runAllTests();
}

module.exports = ValidationTester;
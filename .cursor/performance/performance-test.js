#!/usr/bin/env node

/**
 * Cursor Performance Testing and Validation Script
 * Tests all aspects of the Cursor integration configuration
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

class CursorPerformanceTest {
  constructor() {
    this.results = {
      startTime: Date.now(),
      tests: [],
      summary: {
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
    
    this.configPaths = {
      settings: '.cursor/settings.json',
      rules: '.cursor/cursor.rules',
      completion: '.cursor/completion-config.json',
      indexing: '.cursor/index/indexing-config.json',
      terminal: '.cursor/terminal/terminal-config.json',
      background: '.cursor/background/agent-config.json',
      memory: '.cursor/memory/memory-config.json'
    };
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    
    return logEntry;
  }

  async test(name, testFn) {
    const startTime = performance.now();
    
    try {
      this.log('info', `Starting test: ${name}`);
      const result = await testFn();
      const endTime = performance.now();
      
      const testResult = {
        name,
        status: 'passed',
        duration: endTime - startTime,
        result
      };
      
      this.results.tests.push(testResult);
      this.results.summary.passed++;
      
      this.log('info', `✅ Test passed: ${name} (${Math.round(endTime - startTime)}ms)`);
      return testResult;
      
    } catch (error) {
      const endTime = performance.now();
      
      const testResult = {
        name,
        status: 'failed',
        duration: endTime - startTime,
        error: error.message,
        stack: error.stack
      };
      
      this.results.tests.push(testResult);
      this.results.summary.failed++;
      
      this.log('error', `❌ Test failed: ${name}`, error.message);
      return testResult;
    }
  }

  async testConfigurationFiles() {
    return this.test('Configuration Files Validation', async () => {
      const results = {};
      
      for (const [name, configPath] of Object.entries(this.configPaths)) {
        if (!fs.existsSync(configPath)) {
          throw new Error(`Missing configuration file: ${configPath}`);
        }
        
        try {
          const content = fs.readFileSync(configPath, 'utf8');
          const parsed = JSON.parse(content);
          results[name] = {
            exists: true,
            size: content.length,
            keys: Object.keys(parsed).length
          };
        } catch (parseError) {
          if (configPath.endsWith('.rules')) {
            // Rules file is plain text, not JSON
            const content = fs.readFileSync(configPath, 'utf8');
            results[name] = {
              exists: true,
              size: content.length,
              type: 'rules'
            };
          } else {
            throw new Error(`Invalid JSON in ${configPath}: ${parseError.message}`);
          }
        }
      }
      
      return results;
    });
  }

  async testTabConfiguration() {
    return this.test('Tab Configuration Optimization', async () => {
      const settings = JSON.parse(fs.readFileSync(this.configPaths.settings, 'utf8'));
      
      const requiredSettings = [
        'cursor.tab.enableAutoCompleteForPlainText',
        'cursor.tab.enableMultilineCompletion', 
        'cursor.tab.enableSmartCompletion',
        'cursor.tab.useCodebaseContext',
        'cursor.tab.maxPrefixLines'
      ];
      
      const missing = requiredSettings.filter(setting => 
        !settings.hasOwnProperty(setting)
      );
      
      if (missing.length > 0) {
        throw new Error(`Missing tab settings: ${missing.join(', ')}`);
      }
      
      return {
        configuredSettings: requiredSettings.length,
        optimizationsEnabled: Object.keys(settings).filter(key => 
          key.startsWith('cursor.tab.') && settings[key] === true
        ).length
      };
    });
  }

  async testIndexingPerformance() {
    return this.test('Indexing Performance Configuration', async () => {
      const indexConfig = JSON.parse(fs.readFileSync(this.configPaths.indexing, 'utf8'));
      
      const performanceChecks = {
        sharedTeamIndex: indexConfig.sharedTeamIndex?.enabled === true,
        incrementalSync: indexConfig.performanceSettings?.incrementalSync === true,
        backgroundPreload: indexConfig.startupOptimization?.backgroundPreload === true,
        compressionEnabled: indexConfig.performanceSettings?.compressionEnabled === true
      };
      
      const enabledOptimizations = Object.values(performanceChecks).filter(Boolean).length;
      
      if (enabledOptimizations < 3) {
        throw new Error(`Insufficient performance optimizations enabled: ${enabledOptimizations}/4`);
      }
      
      return {
        optimizationsEnabled: enabledOptimizations,
        checks: performanceChecks
      };
    });
  }

  async testTerminalIntegration() {
    return this.test('Terminal Integration Functionality', async () => {
      const terminalConfig = JSON.parse(fs.readFileSync(this.configPaths.terminal, 'utf8'));
      
      const requiredFeatures = [
        'terminalIntegration.ctrlK.enabled',
        'terminalIntegration.commandGeneration.enabled',
        'terminalIntegration.intelligentHistory.enabled'
      ];
      
      const enabledFeatures = requiredFeatures.filter(feature => {
        const keys = feature.split('.');
        let current = terminalConfig;
        for (const key of keys) {
          if (!current || !current.hasOwnProperty(key)) return false;
          current = current[key];
        }
        return current === true;
      });
      
      if (enabledFeatures.length < requiredFeatures.length) {
        const missing = requiredFeatures.filter(f => !enabledFeatures.includes(f));
        throw new Error(`Missing terminal features: ${missing.join(', ')}`);
      }
      
      return {
        enabledFeatures: enabledFeatures.length,
        totalFeatures: requiredFeatures.length,
        shortcuts: Object.keys(terminalConfig.shortcuts?.customCommands || {}).length
      };
    });
  }

  async testBackgroundProcessing() {
    return this.test('Background Processing Configuration', async () => {
      const bgConfig = JSON.parse(fs.readFileSync(this.configPaths.background, 'utf8'));
      
      const criticalAgents = [
        'asynchronousProcessing.indexingAgent.enabled',
        'asynchronousProcessing.securityAgent.enabled', 
        'asynchronousProcessing.bmadAgent.enabled'
      ];
      
      const enabledAgents = criticalAgents.filter(agent => {
        const keys = agent.split('.');
        let current = bgConfig;
        for (const key of keys) {
          if (!current || !current.hasOwnProperty(key)) return false;
          current = current[key];
        }
        return current === true;
      });
      
      if (enabledAgents.length < criticalAgents.length) {
        throw new Error(`Critical background agents not enabled: ${criticalAgents.length - enabledAgents.length} missing`);
      }
      
      return {
        enabledAgents: enabledAgents.length,
        maxConcurrent: bgConfig.backgroundAgents?.maxConcurrentAgents || 0,
        taskQueueEnabled: bgConfig.taskQueue?.enabled === true
      };
    });
  }

  async testMemorySystem() {
    return this.test('Memory & Knowledge Base System', async () => {
      const memoryConfig = JSON.parse(fs.readFileSync(this.configPaths.memory, 'utf8'));
      
      const memoryFeatures = {
        persistentMemory: memoryConfig.persistentMemory?.enabled === true,
        knowledgeBase: memoryConfig.knowledgeBase?.projectContext?.enabled === true,
        learningSystem: memoryConfig.learningSystem?.adaptiveMemory?.enabled === true,
        ruleEngine: memoryConfig.ruleEngine?.enabled === true
      };
      
      const enabledFeatures = Object.values(memoryFeatures).filter(Boolean).length;
      
      if (enabledFeatures < 3) {
        throw new Error(`Insufficient memory features enabled: ${enabledFeatures}/4`);
      }
      
      return {
        enabledFeatures,
        totalFeatures: Object.keys(memoryFeatures).length,
        features: memoryFeatures,
        knowledgeCategories: Object.keys(memoryConfig.memoryCategories || {}).length
      };
    });
  }

  async testIntegrationHealth() {
    return this.test('Overall Integration Health', async () => {
      // Test file system structure
      const requiredDirs = [
        '.cursor',
        '.cursor/index',
        '.cursor/terminal', 
        '.cursor/background',
        '.cursor/memory',
        '.cursor/rules'
      ];
      
      const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
      if (missingDirs.length > 0) {
        throw new Error(`Missing directories: ${missingDirs.join(', ')}`);
      }
      
      // Test BMad integration paths
      const bmadPaths = [
        '.bmad-core',
        '.claude'
      ];
      
      const missingBmadPaths = bmadPaths.filter(path => !fs.existsSync(path));
      if (missingBmadPaths.length > 0) {
        throw new Error(`Missing BMad integration paths: ${missingBmadPaths.join(', ')}`);
      }
      
      return {
        directoryStructure: 'complete',
        bmadIntegration: 'available',
        configurationFiles: Object.keys(this.configPaths).length
      };
    });
  }

  async runAllTests() {
    this.log('info', '🚀 Starting Cursor Integration Performance Tests');
    
    // Run all tests
    await this.testConfigurationFiles();
    await this.testTabConfiguration(); 
    await this.testIndexingPerformance();
    await this.testTerminalIntegration();
    await this.testBackgroundProcessing();
    await this.testMemorySystem();
    await this.testIntegrationHealth();
    
    // Generate summary
    const totalTime = Date.now() - this.results.startTime;
    this.results.summary.totalDuration = totalTime;
    this.results.summary.totalTests = this.results.tests.length;
    
    this.log('info', '📊 Test Results Summary');
    this.log('info', `Total Tests: ${this.results.summary.totalTests}`);
    this.log('info', `Passed: ${this.results.summary.passed}`);
    this.log('info', `Failed: ${this.results.summary.failed}`);
    this.log('info', `Total Duration: ${totalTime}ms`);
    
    // Save detailed results
    const resultsPath = '.cursor/performance/test-results.json';
    fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
    this.log('info', `Detailed results saved to: ${resultsPath}`);
    
    return this.results.summary.failed === 0;
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CursorPerformanceTest();
  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = CursorPerformanceTest;
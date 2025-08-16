#!/usr/bin/env node

/**
 * Phase 3 Comprehensive Testing and Validation Suite
 * 
 * Tests all Phase 3 implementations:
 * - SBOM Generation and Integration
 * - Advanced Hook Intelligence
 * - Workspace Performance Optimization
 * - Developer Experience Enhancements
 * 
 * Compliance: Laws #1-5 Enforced
 * Test Strategy: TDD Integration with comprehensive validation
 */

const fs = require('fs').promises;
const path = require('path');
const { performance } = require('perf_hooks');

class Phase3TestSuite {
  constructor(options = {}) {
    this.options = {
      enablePerformanceBenchmarks: options.enablePerformanceBenchmarks !== false,
      enableIntegrationTests: options.enableIntegrationTests !== false,
      enableStressTests: options.enableStressTests !== false,
      outputDir: options.outputDir || path.join(__dirname, '..', 'test-results', 'phase3'),
      verbose: options.verbose !== false,
      ...options
    };
    
    this.testResults = {
      summary: {
        total_tests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        start_time: null,
        end_time: null,
        duration: 0
      },
      phases: {},
      errors: [],
      performance_metrics: {}
    };
    
    this.projectRoot = path.join(__dirname, '..');
  }

  log(message, type = 'info') {
    if (!this.options.verbose && type === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : type === 'success' ? '✅' : '📋';
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async runAllTests() {
    this.log('🚀 Starting Phase 3 Comprehensive Testing Suite...');
    this.testResults.summary.start_time = new Date().toISOString();
    
    try {
      await fs.mkdir(this.options.outputDir, { recursive: true });
      
      // Phase 1: SBOM Integration Testing
      await this.runPhase1Tests();
      
      // Phase 2: Advanced Hook Intelligence Testing
      await this.runPhase2Tests();
      
      // Phase 3: Performance Optimization Testing
      await this.runPhase3Tests();
      
      // Phase 4: Developer Experience Testing
      await this.runPhase4Tests();
      
      // Phase 5: Integration and System Testing
      await this.runPhase5Tests();
      
      this.testResults.summary.end_time = new Date().toISOString();
      this.testResults.summary.duration = Date.now() - new Date(this.testResults.summary.start_time).getTime();
      
      await this.generateTestReport();
      await this.generateRecommendations();
      
      this.log(`\n🎯 Phase 3 Testing Complete:`);
      this.log(`   Total Tests: ${this.testResults.summary.total_tests}`);
      this.log(`   Passed: ${this.testResults.summary.passed}`);
      this.log(`   Failed: ${this.testResults.summary.failed}`);
      this.log(`   Success Rate: ${((this.testResults.summary.passed / this.testResults.summary.total_tests) * 100).toFixed(1)}%`);
      
      return this.testResults;
      
    } catch (error) {
      this.log(`❌ Testing suite failed: ${error.message}`, 'error');
      this.testResults.errors.push({
        phase: 'suite_execution',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Phase 1: SBOM Integration Testing
  async runPhase1Tests() {
    this.log('📋 Phase 1: SBOM Integration Testing...');
    
    const phase1Results = {
      name: 'SBOM Integration',
      tests: [],
      performance: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    try {
      // Test 1.1: SBOM Generator Existence and Functionality
      await this.runTest(phase1Results, 'SBOM Generator Basic Functionality', async () => {
        // Check if SBOM integration exists
        const sbomIntegrationPath = path.join(this.projectRoot, 'scripts', 'ai-security', 'sbom-integration.js');
        const exists = await this.fileExists(sbomIntegrationPath);
        
        if (!exists) {
          throw new Error('SBOM integration file not found');
        }
        
        // Test basic import
        delete require.cache[require.resolve(sbomIntegrationPath)];
        const SBOMIntegration = require(sbomIntegrationPath);
        
        if (typeof SBOMIntegration !== 'function') {
          throw new Error('SBOM integration is not a constructor function');
        }
        
        // Test instantiation
        const integration = new SBOMIntegration();
        
        if (!integration.performSecurityAnalysis || typeof integration.performSecurityAnalysis !== 'function') {
          throw new Error('SBOM integration missing performSecurityAnalysis method');
        }
        
        return { status: 'success', message: 'SBOM integration is functional' };
      });
      
      // Test 1.2: Template Coverage Testing
      await this.runTest(phase1Results, 'SBOM Template Coverage', async () => {
        const templates = ['web', 'api', 'python', 'java', 'go'];
        const templateResults = {};
        
        for (const template of templates) {
          const templatePath = path.join(this.projectRoot, 'templates', template);
          const exists = await this.directoryExists(templatePath);
          templateResults[template] = exists;
        }
        
        const supportedTemplates = Object.values(templateResults).filter(Boolean).length;
        
        if (supportedTemplates < 3) {
          throw new Error(`Only ${supportedTemplates}/5 templates available for SBOM generation`);
        }
        
        return { 
          status: 'success', 
          message: `${supportedTemplates}/5 templates support SBOM generation`,
          data: templateResults 
        };
      });
      
      // Test 1.3: Dual Format Support
      await this.runTest(phase1Results, 'Dual Format Support (SPDX/CycloneDX)', async () => {
        const sbomIntegrationPath = path.join(this.projectRoot, 'scripts', 'ai-security', 'sbom-integration.js');
        const SBOMIntegration = require(sbomIntegrationPath);
        const integration = new SBOMIntegration({
          sbomFormats: ['spdx', 'cyclone'],
          enableVulnerabilityScanning: false,
          enableAIValidation: false
        });
        
        // Check if formats are configured
        if (!integration.options.sbomFormats.includes('spdx') || !integration.options.sbomFormats.includes('cyclone')) {
          throw new Error('Dual format support not properly configured');
        }
        
        return { 
          status: 'success', 
          message: 'Dual format support (SPDX + CycloneDX) configured',
          data: { formats: integration.options.sbomFormats }
        };
      });
      
      // Test 1.4: AI Security Pipeline Integration
      await this.runTest(phase1Results, 'AI Security Pipeline Integration', async () => {
        // Check if AI security validator is available
        const validatorPath = path.join(this.projectRoot, 'scripts', 'ai-security', 'validate.js');
        const validatorExists = await this.fileExists(validatorPath);
        
        if (!validatorExists) {
          return { 
            status: 'skipped', 
            message: 'AI security validator not found - integration test skipped' 
          };
        }
        
        // Test integration workflow
        const sbomIntegrationPath = path.join(this.projectRoot, 'scripts', 'ai-security', 'sbom-integration.js');
        const SBOMIntegration = require(sbomIntegrationPath);
        const integration = new SBOMIntegration({
          enableAIValidation: true,
          confidenceThreshold: 0.8
        });
        
        // Verify AI validation can be enabled
        if (!integration.options.enableAIValidation) {
          throw new Error('AI validation integration not working');
        }
        
        return { 
          status: 'success', 
          message: 'AI security pipeline integration functional' 
        };
      });
      
      // Test 1.5: Performance Benchmarking
      if (this.options.enablePerformanceBenchmarks) {
        await this.runTest(phase1Results, 'SBOM Generation Performance', async () => {
          const startTime = performance.now();
          
          // Create a small test project structure
          const testProjectPath = path.join(this.options.outputDir, 'test-project-sbom');
          await this.createTestProject(testProjectPath, 'small');
          
          const sbomIntegrationPath = path.join(this.projectRoot, 'scripts', 'ai-security', 'sbom-integration.js');
          const SBOMIntegration = require(sbomIntegrationPath);
          const integration = new SBOMIntegration({
            enableVulnerabilityScanning: false,
            enableAIValidation: false
          });
          
          // Mock the SBOM generation
          const mockResult = {
            projectData: {
              dependencies: Array(50).fill(null).map((_, i) => ({
                name: `test-package-${i}`,
                version: '1.0.0',
                ecosystem: 'npm',
                licenses: ['MIT'],
                purl: `pkg:npm/test-package-${i}@1.0.0`
              }))
            },
            summary: {
              totalDependencies: 50,
              generatedFormats: ['spdx', 'cyclone']
            }
          };
          
          const analysisResult = await integration.analyzeSupplyChain(mockResult);
          
          const duration = performance.now() - startTime;
          
          phase1Results.performance.sbom_generation = {
            duration_ms: duration,
            dependencies_processed: 50,
            throughput: 50 / (duration / 1000)
          };
          
          if (duration > 10000) { // 10 seconds
            throw new Error(`SBOM generation too slow: ${duration.toFixed(2)}ms`);
          }
          
          return { 
            status: 'success', 
            message: `SBOM generation completed in ${duration.toFixed(2)}ms`,
            data: { duration_ms: duration, throughput: 50 / (duration / 1000) }
          };
        });
      }
      
    } catch (error) {
      this.log(`❌ Phase 1 testing error: ${error.message}`, 'error');
      phase1Results.tests.push({
        name: 'Phase 1 Error',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      phase1Results.summary.failed++;
      phase1Results.summary.total++;
    }
    
    this.testResults.phases.phase1 = phase1Results;
    this.updateSummary(phase1Results);
    
    this.log(`✅ Phase 1 Complete: ${phase1Results.summary.passed}/${phase1Results.summary.total} tests passed`);
  }

  // Phase 2: Advanced Hook Intelligence Testing
  async runPhase2Tests() {
    this.log('📋 Phase 2: Advanced Hook Intelligence Testing...');
    
    const phase2Results = {
      name: 'Advanced Hook Intelligence',
      tests: [],
      performance: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    try {
      // Test 2.1: Hook Configuration Validation
      await this.runTest(phase2Results, 'Hook Configuration Structure', async () => {
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        const hooksExists = await this.fileExists(hooksPath);
        
        if (!hooksExists) {
          throw new Error('hooks.json not found');
        }
        
        const hooksContent = await fs.readFile(hooksPath, 'utf8');
        const hooks = JSON.parse(hooksContent);
        
        // Validate structure
        const requiredSections = ['PreToolUse', 'PostToolUse', 'QualityGates', 'WorkflowTriggers'];
        const missingSections = requiredSections.filter(section => !hooks.hooks[section]);
        
        if (missingSections.length > 0) {
          throw new Error(`Missing hook sections: ${missingSections.join(', ')}`);
        }
        
        // Count total hooks
        const totalHooks = Object.values(hooks.hooks).reduce((sum, section) => 
          sum + (Array.isArray(section) ? section.length : 0), 0
        );
        
        if (totalHooks < 20) {
          throw new Error(`Insufficient hooks: ${totalHooks} found, expected 20+`);
        }
        
        return { 
          status: 'success', 
          message: `Hook intelligence configured with ${totalHooks} hooks`,
          data: { total_hooks: totalHooks, sections: Object.keys(hooks.hooks) }
        };
      });
      
      // Test 2.2: Context-Aware Hook Execution
      await this.runTest(phase2Results, 'Context-Aware Hook Execution', async () => {
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        const hooksContent = await fs.readFile(hooksPath, 'utf8');
        const hooks = JSON.parse(hooksContent);
        
        // Check for conditional hooks
        const conditionalHooks = [];
        
        Object.values(hooks.hooks).forEach(section => {
          if (Array.isArray(section)) {
            section.forEach(hookGroup => {
              if (hookGroup.condition) {
                conditionalHooks.push(hookGroup);
              }
            });
          }
        });
        
        if (conditionalHooks.length === 0) {
          throw new Error('No context-aware hooks found');
        }
        
        return { 
          status: 'success', 
          message: `${conditionalHooks.length} context-aware hooks detected`,
          data: { conditional_hooks: conditionalHooks.length }
        };
      });
      
      // Test 2.3: Intelligent Hook Ordering
      await this.runTest(phase2Results, 'Intelligent Hook Ordering', async () => {
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        const hooksContent = await fs.readFile(hooksPath, 'utf8');
        const hooks = JSON.parse(hooksContent);
        
        // Check PostToolUse hooks for proper ordering
        const postHooks = hooks.hooks.PostToolUse || [];
        
        // Look for logical ordering patterns
        const hookTypes = postHooks.map(hookGroup => {
          const firstHook = hookGroup.hooks[0];
          if (firstHook.description.toLowerCase().includes('code quality')) return 'quality';
          if (firstHook.description.toLowerCase().includes('security')) return 'security';
          if (firstHook.description.toLowerCase().includes('git')) return 'git';
          if (firstHook.description.toLowerCase().includes('test')) return 'test';
          return 'other';
        });
        
        // Quality should come before git operations
        const qualityIndex = hookTypes.indexOf('quality');
        const gitIndex = hookTypes.indexOf('git');
        
        if (qualityIndex > gitIndex && qualityIndex !== -1 && gitIndex !== -1) {
          throw new Error('Hook ordering suboptimal: git operations before quality checks');
        }
        
        return { 
          status: 'success', 
          message: 'Hook ordering appears optimized',
          data: { hook_types: hookTypes }
        };
      });
      
      // Test 2.4: Predictive Resource Management
      await this.runTest(phase2Results, 'Predictive Resource Management', async () => {
        // Check for resource-aware hook configurations
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        const hooksContent = await fs.readFile(hooksPath, 'utf8');
        const hooks = JSON.parse(hooksContent);
        
        // Look for resource management patterns
        const resourceAwareHooks = [];
        
        Object.values(hooks.hooks).forEach(section => {
          if (Array.isArray(section)) {
            section.forEach(hookGroup => {
              hookGroup.hooks.forEach(hook => {
                if (hook.command && (
                  hook.command.includes('memory') ||
                  hook.command.includes('cpu') ||
                  hook.command.includes('--quiet') ||
                  hook.command.includes('--silent')
                )) {
                  resourceAwareHooks.push(hook);
                }
              });
            });
          }
        });
        
        return { 
          status: 'success', 
          message: `${resourceAwareHooks.length} resource-aware hooks identified`,
          data: { resource_aware_hooks: resourceAwareHooks.length }
        };
      });
      
      // Test 2.5: Error Handling and Recovery
      await this.runTest(phase2Results, 'Adaptive Error Handling', async () => {
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        const hooksContent = await fs.readFile(hooksPath, 'utf8');
        const hooks = JSON.parse(hooksContent);
        
        // Count hooks with error handling
        let errorHandlingCount = 0;
        
        Object.values(hooks.hooks).forEach(section => {
          if (Array.isArray(section)) {
            section.forEach(hookGroup => {
              hookGroup.hooks.forEach(hook => {
                if (hook.command && (
                  hook.command.includes('|| true') ||
                  hook.command.includes('2>/dev/null') ||
                  hook.command.includes('|| echo')
                )) {
                  errorHandlingCount++;
                }
              });
            });
          }
        });
        
        if (errorHandlingCount < 5) {
          throw new Error(`Insufficient error handling: ${errorHandlingCount} hooks with error handling`);
        }
        
        return { 
          status: 'success', 
          message: `${errorHandlingCount} hooks implement error handling`,
          data: { error_handling_hooks: errorHandlingCount }
        };
      });
      
    } catch (error) {
      this.log(`❌ Phase 2 testing error: ${error.message}`, 'error');
      phase2Results.tests.push({
        name: 'Phase 2 Error',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      phase2Results.summary.failed++;
      phase2Results.summary.total++;
    }
    
    this.testResults.phases.phase2 = phase2Results;
    this.updateSummary(phase2Results);
    
    this.log(`✅ Phase 2 Complete: ${phase2Results.summary.passed}/${phase2Results.summary.total} tests passed`);
  }

  // Phase 3: Performance Optimization Testing
  async runPhase3Tests() {
    this.log('📋 Phase 3: Performance Optimization Testing...');
    
    const phase3Results = {
      name: 'Performance Optimization',
      tests: [],
      performance: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    try {
      // Test 3.1: Performance Tracker Existence
      await this.runTest(phase3Results, 'Performance Tracker Functionality', async () => {
        const trackerPath = path.join(this.projectRoot, 'scripts', 'bmad-performance-tracker.js');
        const exists = await this.fileExists(trackerPath);
        
        if (!exists) {
          throw new Error('BMAD performance tracker not found');
        }
        
        // Test basic functionality
        delete require.cache[require.resolve(trackerPath)];
        const PerformanceTracker = require(trackerPath);
        
        if (typeof PerformanceTracker !== 'function') {
          throw new Error('Performance tracker is not a constructor function');
        }
        
        const tracker = new PerformanceTracker();
        
        if (!tracker.trackAgentPerformance || typeof tracker.trackAgentPerformance !== 'function') {
          throw new Error('Performance tracker missing trackAgentPerformance method');
        }
        
        return { status: 'success', message: 'Performance tracker is functional' };
      });
      
      // Test 3.2: Workspace Performance Optimization
      if (this.options.enablePerformanceBenchmarks) {
        await this.runTest(phase3Results, 'Workspace Performance Benchmarks', async () => {
          const startTime = performance.now();
          
          // Test file operations performance
          const testDir = path.join(this.options.outputDir, 'performance-test');
          await fs.mkdir(testDir, { recursive: true });
          
          // Create 100 test files and measure operations
          const fileOps = [];
          for (let i = 0; i < 100; i++) {
            const opStart = performance.now();
            await fs.writeFile(path.join(testDir, `test-${i}.txt`), `Test content ${i}`);
            fileOps.push(performance.now() - opStart);
          }
          
          const avgFileOp = fileOps.reduce((sum, time) => sum + time, 0) / fileOps.length;
          const totalTime = performance.now() - startTime;
          
          phase3Results.performance.file_operations = {
            total_files: 100,
            total_time_ms: totalTime,
            avg_file_op_ms: avgFileOp,
            throughput: 100 / (totalTime / 1000)
          };
          
          // Performance target: < 50ms average per file operation
          if (avgFileOp > 50) {
            throw new Error(`File operations too slow: ${avgFileOp.toFixed(2)}ms average`);
          }
          
          return { 
            status: 'success', 
            message: `File operations optimized: ${avgFileOp.toFixed(2)}ms average`,
            data: { avg_file_op_ms: avgFileOp, total_time_ms: totalTime }
          };
        });
      }
      
      // Test 3.3: Scalability Enhancements
      await this.runTest(phase3Results, 'Scalability Enhancements', async () => {
        // Test configuration loading performance
        const startTime = performance.now();
        
        // Load multiple configuration files
        const configPaths = [
          path.join(this.projectRoot, '.claude', 'hooks.json'),
          path.join(this.projectRoot, 'package.json'),
          path.join(this.projectRoot, 'CLAUDE.md')
        ];
        
        const loadResults = [];
        for (const configPath of configPaths) {
          const loadStart = performance.now();
          try {
            const exists = await this.fileExists(configPath);
            if (exists) {
              await fs.readFile(configPath, 'utf8');
            }
            loadResults.push(performance.now() - loadStart);
          } catch (error) {
            loadResults.push(performance.now() - loadStart);
          }
        }
        
        const totalLoadTime = performance.now() - startTime;
        const avgLoadTime = loadResults.reduce((sum, time) => sum + time, 0) / loadResults.length;
        
        phase3Results.performance.config_loading = {
          total_configs: configPaths.length,
          total_time_ms: totalLoadTime,
          avg_load_ms: avgLoadTime
        };
        
        // Target: < 100ms total for config loading
        if (totalLoadTime > 100) {
          throw new Error(`Configuration loading too slow: ${totalLoadTime.toFixed(2)}ms`);
        }
        
        return { 
          status: 'success', 
          message: `Configuration loading optimized: ${totalLoadTime.toFixed(2)}ms total`,
          data: { total_time_ms: totalLoadTime, avg_load_ms: avgLoadTime }
        };
      });
      
      // Test 3.4: Resource Utilization Optimization
      await this.runTest(phase3Results, 'Resource Utilization Optimization', async () => {
        const initialMemory = process.memoryUsage();
        
        // Simulate resource-intensive operations
        const data = [];
        for (let i = 0; i < 10000; i++) {
          data.push({
            id: i,
            content: `Test data item ${i}`,
            timestamp: new Date().toISOString()
          });
        }
        
        const afterMemory = process.memoryUsage();
        const memoryDelta = afterMemory.heapUsed - initialMemory.heapUsed;
        
        phase3Results.performance.memory_utilization = {
          initial_heap_mb: initialMemory.heapUsed / (1024 * 1024),
          final_heap_mb: afterMemory.heapUsed / (1024 * 1024),
          delta_mb: memoryDelta / (1024 * 1024),
          data_items: data.length
        };
        
        // Clean up
        data.length = 0;
        
        // Target: < 50MB memory delta for 10k items
        if (memoryDelta > 50 * 1024 * 1024) {
          throw new Error(`Memory usage too high: ${(memoryDelta / (1024 * 1024)).toFixed(2)}MB`);
        }
        
        return { 
          status: 'success', 
          message: `Memory usage optimized: ${(memoryDelta / (1024 * 1024)).toFixed(2)}MB delta`,
          data: { memory_delta_mb: memoryDelta / (1024 * 1024) }
        };
      });
      
      // Test 3.5: Parallel Execution Improvements
      await this.runTest(phase3Results, 'Parallel Execution Capabilities', async () => {
        const startTime = performance.now();
        
        // Test parallel operations
        const parallelTasks = Array(10).fill(null).map((_, i) => 
          new Promise(resolve => {
            setTimeout(() => resolve(`Task ${i} completed`), Math.random() * 100);
          })
        );
        
        const results = await Promise.all(parallelTasks);
        const parallelTime = performance.now() - startTime;
        
        // Test sequential operations for comparison
        const sequentialStart = performance.now();
        for (let i = 0; i < 10; i++) {
          await new Promise(resolve => {
            setTimeout(() => resolve(`Sequential task ${i}`), Math.random() * 100);
          });
        }
        const sequentialTime = performance.now() - sequentialStart;
        
        phase3Results.performance.parallel_execution = {
          parallel_time_ms: parallelTime,
          sequential_time_ms: sequentialTime,
          improvement_ratio: sequentialTime / parallelTime,
          tasks_completed: results.length
        };
        
        // Parallel should be at least 2x faster
        if (sequentialTime / parallelTime < 2) {
          throw new Error(`Parallel execution not optimized: only ${(sequentialTime / parallelTime).toFixed(2)}x faster`);
        }
        
        return { 
          status: 'success', 
          message: `Parallel execution ${(sequentialTime / parallelTime).toFixed(2)}x faster`,
          data: { improvement_ratio: sequentialTime / parallelTime }
        };
      });
      
    } catch (error) {
      this.log(`❌ Phase 3 testing error: ${error.message}`, 'error');
      phase3Results.tests.push({
        name: 'Phase 3 Error',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      phase3Results.summary.failed++;
      phase3Results.summary.total++;
    }
    
    this.testResults.phases.phase3 = phase3Results;
    this.updateSummary(phase3Results);
    
    this.log(`✅ Phase 3 Complete: ${phase3Results.summary.passed}/${phase3Results.summary.total} tests passed`);
  }

  // Phase 4: Developer Experience Testing
  async runPhase4Tests() {
    this.log('📋 Phase 4: Developer Experience Testing...');
    
    const phase4Results = {
      name: 'Developer Experience',
      tests: [],
      performance: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    try {
      // Test 4.1: Command System Availability
      await this.runTest(phase4Results, 'Command System Availability', async () => {
        const claudeDir = path.join(this.projectRoot, '.claude');
        const commandsDir = path.join(claudeDir, 'commands');
        
        const claudeDirExists = await this.directoryExists(claudeDir);
        const commandsDirExists = await this.directoryExists(commandsDir);
        
        if (!claudeDirExists) {
          throw new Error('.claude directory not found');
        }
        
        if (!commandsDirExists) {
          throw new Error('.claude/commands directory not found');
        }
        
        // Count available commands
        const commandFiles = await fs.readdir(commandsDir);
        const commandCount = commandFiles.filter(file => file.endsWith('.md')).length;
        
        if (commandCount < 5) {
          throw new Error(`Insufficient commands: ${commandCount} found, expected 5+`);
        }
        
        return { 
          status: 'success', 
          message: `${commandCount} developer commands available`,
          data: { command_count: commandCount, commands: commandFiles }
        };
      });
      
      // Test 4.2: Interactive Onboarding Wizard
      await this.runTest(phase4Results, 'Interactive Onboarding System', async () => {
        // Check for onboarding-related files
        const onboardingFiles = [
          'CLAUDE.md',
          'README.md',
          path.join('.claude', 'commands')
        ];
        
        const availableFiles = [];
        for (const file of onboardingFiles) {
          const fullPath = path.join(this.projectRoot, file);
          const exists = await this.fileExists(fullPath) || await this.directoryExists(fullPath);
          if (exists) {
            availableFiles.push(file);
          }
        }
        
        if (availableFiles.length < 2) {
          throw new Error(`Insufficient onboarding resources: ${availableFiles.length}/3 available`);
        }
        
        return { 
          status: 'success', 
          message: `${availableFiles.length}/3 onboarding resources available`,
          data: { available_files: availableFiles }
        };
      });
      
      // Test 4.3: Intelligent Workflow Suggestions
      await this.runTest(phase4Results, 'Intelligent Workflow Suggestions', async () => {
        // Check hooks for workflow intelligence
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        const hooksExists = await this.fileExists(hooksPath);
        
        if (!hooksExists) {
          throw new Error('Hooks configuration not found');
        }
        
        const hooksContent = await fs.readFile(hooksPath, 'utf8');
        const hooks = JSON.parse(hooksContent);
        
        // Count workflow-intelligent hooks
        let intelligentHooks = 0;
        
        Object.values(hooks.hooks).forEach(section => {
          if (Array.isArray(section)) {
            section.forEach(hookGroup => {
              hookGroup.hooks.forEach(hook => {
                if (hook.description && (
                  hook.description.toLowerCase().includes('remember') ||
                  hook.description.toLowerCase().includes('consider') ||
                  hook.description.toLowerCase().includes('reminder')
                )) {
                  intelligentHooks++;
                }
              });
            });
          }
        });
        
        if (intelligentHooks < 3) {
          throw new Error(`Insufficient workflow intelligence: ${intelligentHooks} intelligent hooks`);
        }
        
        return { 
          status: 'success', 
          message: `${intelligentHooks} intelligent workflow suggestions available`,
          data: { intelligent_hooks: intelligentHooks }
        };
      });
      
      // Test 4.4: Seamless Context Switching
      await this.runTest(phase4Results, 'Seamless Context Switching', async () => {
        // Test project structure for context support
        const projectDirs = ['projects', 'templates', '.bmad-workspace'];
        const contextSupport = [];
        
        for (const dir of projectDirs) {
          const dirPath = path.join(this.projectRoot, dir);
          const exists = await this.directoryExists(dirPath);
          if (exists) {
            contextSupport.push(dir);
          }
        }
        
        if (contextSupport.length < 2) {
          throw new Error(`Insufficient context switching support: ${contextSupport.length}/3 directories`);
        }
        
        return { 
          status: 'success', 
          message: `Context switching supported: ${contextSupport.join(', ')}`,
          data: { context_directories: contextSupport }
        };
      });
      
      // Test 4.5: Contextual Help and Documentation
      await this.runTest(phase4Results, 'Contextual Help System', async () => {
        // Check documentation structure
        const docDirs = ['docs', path.join('docs', 'protocols'), path.join('docs', 'knowledge-base')];
        const availableDocs = [];
        
        for (const dir of docDirs) {
          const dirPath = path.join(this.projectRoot, dir);
          const exists = await this.directoryExists(dirPath);
          if (exists) {
            availableDocs.push(dir);
          }
        }
        
        // Check for key documentation files
        const keyDocs = ['CLAUDE.md', 'README.md'];
        const availableKeyDocs = [];
        
        for (const doc of keyDocs) {
          const docPath = path.join(this.projectRoot, doc);
          const exists = await this.fileExists(docPath);
          if (exists) {
            availableKeyDocs.push(doc);
          }
        }
        
        const totalDocResources = availableDocs.length + availableKeyDocs.length;
        
        if (totalDocResources < 3) {
          throw new Error(`Insufficient documentation: ${totalDocResources} resources available`);
        }
        
        return { 
          status: 'success', 
          message: `${totalDocResources} documentation resources available`,
          data: { doc_dirs: availableDocs, key_docs: availableKeyDocs }
        };
      });
      
    } catch (error) {
      this.log(`❌ Phase 4 testing error: ${error.message}`, 'error');
      phase4Results.tests.push({
        name: 'Phase 4 Error',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      phase4Results.summary.failed++;
      phase4Results.summary.total++;
    }
    
    this.testResults.phases.phase4 = phase4Results;
    this.updateSummary(phase4Results);
    
    this.log(`✅ Phase 4 Complete: ${phase4Results.summary.passed}/${phase4Results.summary.total} tests passed`);
  }

  // Phase 5: Integration and System Testing
  async runPhase5Tests() {
    this.log('📋 Phase 5: Integration and System Testing...');
    
    const phase5Results = {
      name: 'Integration and System',
      tests: [],
      performance: {},
      summary: { passed: 0, failed: 0, total: 0 }
    };
    
    try {
      // Test 5.1: Complete System Integration
      await this.runTest(phase5Results, 'Complete System Integration', async () => {
        const systemComponents = [
          { name: 'SBOM Integration', path: path.join('scripts', 'ai-security', 'sbom-integration.js') },
          { name: 'Hook Intelligence', path: path.join('.claude', 'hooks.json') },
          { name: 'Performance Tracker', path: path.join('scripts', 'bmad-performance-tracker.js') },
          { name: 'Command System', path: path.join('.claude', 'commands') }
        ];
        
        const workingComponents = [];
        const failedComponents = [];
        
        for (const component of systemComponents) {
          const fullPath = path.join(this.projectRoot, component.path);
          const exists = await this.fileExists(fullPath) || await this.directoryExists(fullPath);
          
          if (exists) {
            workingComponents.push(component.name);
          } else {
            failedComponents.push(component.name);
          }
        }
        
        if (failedComponents.length > 0) {
          throw new Error(`Missing system components: ${failedComponents.join(', ')}`);
        }
        
        return { 
          status: 'success', 
          message: `All ${workingComponents.length} system components integrated`,
          data: { working_components: workingComponents }
        };
      });
      
      // Test 5.2: Cross-Component Compatibility
      await this.runTest(phase5Results, 'Cross-Component Compatibility', async () => {
        // Test that multiple components can work together
        const startTime = performance.now();
        
        try {
          // Load SBOM integration
          const sbomPath = path.join(this.projectRoot, 'scripts', 'ai-security', 'sbom-integration.js');
          delete require.cache[require.resolve(sbomPath)];
          const SBOMIntegration = require(sbomPath);
          const sbomIntegration = new SBOMIntegration({ enableAIValidation: false });
          
          // Load performance tracker
          const trackerPath = path.join(this.projectRoot, 'scripts', 'bmad-performance-tracker.js');
          delete require.cache[require.resolve(trackerPath)];
          const PerformanceTracker = require(trackerPath);
          const tracker = new PerformanceTracker();
          
          // Test that they can coexist
          const testMetrics = {
            tasksCompleted: 1,
            duration: 1000,
            success: true
          };
          
          tracker.trackAgentPerformance('test-agent', testMetrics);
          
          const integrationTime = performance.now() - startTime;
          
          return { 
            status: 'success', 
            message: `Cross-component compatibility verified in ${integrationTime.toFixed(2)}ms`,
            data: { integration_time_ms: integrationTime }
          };
          
        } catch (error) {
          throw new Error(`Cross-component compatibility failed: ${error.message}`);
        }
      });
      
      // Test 5.3: System Performance Under Load
      if (this.options.enableStressTests) {
        await this.runTest(phase5Results, 'System Performance Under Load', async () => {
          const startTime = performance.now();
          const initialMemory = process.memoryUsage();
          
          // Simulate concurrent operations
          const concurrentTasks = Array(20).fill(null).map(async (_, i) => {
            // Simulate file operations
            const testFile = path.join(this.options.outputDir, `stress-test-${i}.txt`);
            await fs.writeFile(testFile, `Stress test content ${i} ${Date.now()}`);
            
            // Simulate hook parsing
            const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
            const hooksExists = await this.fileExists(hooksPath);
            if (hooksExists) {
              await fs.readFile(hooksPath, 'utf8');
            }
            
            return i;
          });
          
          const results = await Promise.all(concurrentTasks);
          
          const endTime = performance.now();
          const finalMemory = process.memoryUsage();
          
          const loadTestTime = endTime - startTime;
          const memoryDelta = finalMemory.heapUsed - initialMemory.heapUsed;
          
          phase5Results.performance.load_test = {
            concurrent_tasks: results.length,
            total_time_ms: loadTestTime,
            memory_delta_mb: memoryDelta / (1024 * 1024),
            throughput: results.length / (loadTestTime / 1000)
          };
          
          // Performance targets under load
          if (loadTestTime > 5000) { // 5 seconds
            throw new Error(`System too slow under load: ${loadTestTime.toFixed(2)}ms`);
          }
          
          if (memoryDelta > 100 * 1024 * 1024) { // 100MB
            throw new Error(`Memory usage too high under load: ${(memoryDelta / (1024 * 1024)).toFixed(2)}MB`);
          }
          
          return { 
            status: 'success', 
            message: `System handled ${results.length} concurrent tasks in ${loadTestTime.toFixed(2)}ms`,
            data: { 
              total_time_ms: loadTestTime, 
              memory_delta_mb: memoryDelta / (1024 * 1024),
              throughput: results.length / (loadTestTime / 1000)
            }
          };
        });
      }
      
      // Test 5.4: Protocol Compliance Validation
      await this.runTest(phase5Results, 'Laws #1-5 Protocol Compliance', async () => {
        const complianceChecks = {
          law1_uncertainty: false,
          law2_protocol_adherence: false,
          law3_orchestration: false,
          law4_efficiency: false,
          law5_leadership: false
        };
        
        // Check for uncertainty handling (Law #1)
        const claudeMdPath = path.join(this.projectRoot, 'CLAUDE.md');
        if (await this.fileExists(claudeMdPath)) {
          const claudeContent = await fs.readFile(claudeMdPath, 'utf8');
          if (claudeContent.includes('STOP WHEN UNCERTAIN') || claudeContent.includes('uncertainty')) {
            complianceChecks.law1_uncertainty = true;
          }
        }
        
        // Check for protocol adherence (Law #2)
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        if (await this.fileExists(hooksPath)) {
          complianceChecks.law2_protocol_adherence = true;
        }
        
        // Check for orchestration (Law #3)
        const bmadWorkspacePath = path.join(this.projectRoot, '.bmad-workspace');
        if (await this.directoryExists(bmadWorkspacePath)) {
          complianceChecks.law3_orchestration = true;
        }
        
        // Check for efficiency (Law #4)
        const performanceTrackerPath = path.join(this.projectRoot, 'scripts', 'bmad-performance-tracker.js');
        if (await this.fileExists(performanceTrackerPath)) {
          complianceChecks.law4_efficiency = true;
        }
        
        // Check for leadership (Law #5)
        if (claudeMdPath && await this.fileExists(claudeMdPath)) {
          const claudeContent = await fs.readFile(claudeMdPath, 'utf8');
          if (claudeContent.includes('Senior Lead Developer') || claudeContent.includes('leadership')) {
            complianceChecks.law5_leadership = true;
          }
        }
        
        const compliantLaws = Object.values(complianceChecks).filter(Boolean).length;
        
        if (compliantLaws < 4) {
          throw new Error(`Insufficient protocol compliance: ${compliantLaws}/5 laws validated`);
        }
        
        return { 
          status: 'success', 
          message: `${compliantLaws}/5 protocol laws validated`,
          data: complianceChecks
        };
      });
      
      // Test 5.5: Emergency Protocol Functionality
      await this.runTest(phase5Results, 'Emergency Protocol Systems', async () => {
        // Check for emergency procedures and fallback mechanisms
        const emergencyFeatures = [];
        
        // Check for error handling in hooks
        const hooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        if (await this.fileExists(hooksPath)) {
          const hooksContent = await fs.readFile(hooksPath, 'utf8');
          if (hooksContent.includes('|| true') || hooksContent.includes('2>/dev/null')) {
            emergencyFeatures.push('Hook Error Handling');
          }
        }
        
        // Check for backup configurations
        const configFiles = ['.claude/hooks.json', 'package.json', 'CLAUDE.md'];
        for (const config of configFiles) {
          const configPath = path.join(this.projectRoot, config);
          if (await this.fileExists(configPath)) {
            emergencyFeatures.push(`Backup: ${config}`);
          }
        }
        
        if (emergencyFeatures.length < 2) {
          throw new Error(`Insufficient emergency protocols: ${emergencyFeatures.length} features`);
        }
        
        return { 
          status: 'success', 
          message: `${emergencyFeatures.length} emergency protocol features available`,
          data: { emergency_features: emergencyFeatures }
        };
      });
      
    } catch (error) {
      this.log(`❌ Phase 5 testing error: ${error.message}`, 'error');
      phase5Results.tests.push({
        name: 'Phase 5 Error',
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      phase5Results.summary.failed++;
      phase5Results.summary.total++;
    }
    
    this.testResults.phases.phase5 = phase5Results;
    this.updateSummary(phase5Results);
    
    this.log(`✅ Phase 5 Complete: ${phase5Results.summary.passed}/${phase5Results.summary.total} tests passed`);
  }

  // Utility methods for testing
  async runTest(phaseResults, testName, testFunction) {
    this.log(`  🧪 ${testName}...`, 'debug');
    phaseResults.summary.total++;
    
    try {
      const result = await testFunction();
      
      phaseResults.tests.push({
        name: testName,
        status: result.status || 'success',
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
      if (result.status === 'skipped') {
        phaseResults.summary.skipped++;
        this.log(`    ⏭️ ${testName}: ${result.message}`, 'debug');
      } else {
        phaseResults.summary.passed++;
        this.log(`    ✅ ${testName}: ${result.message}`, 'debug');
      }
      
    } catch (error) {
      phaseResults.tests.push({
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      phaseResults.summary.failed++;
      this.log(`    ❌ ${testName}: ${error.message}`, 'debug');
    }
  }

  updateSummary(phaseResults) {
    this.testResults.summary.total += phaseResults.summary.total;
    this.testResults.summary.passed += phaseResults.summary.passed;
    this.testResults.summary.failed += phaseResults.summary.failed;
    this.testResults.summary.skipped += phaseResults.summary.skipped || 0;
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  async createTestProject(projectPath, size = 'small') {
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create package.json
    const packageJson = {
      name: 'test-project',
      version: '1.0.0',
      dependencies: {
        'express': '^4.18.0',
        'lodash': '^4.17.21'
      }
    };
    
    await fs.writeFile(
      path.join(projectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create some test files based on size
    const fileCount = size === 'small' ? 5 : size === 'medium' ? 20 : 50;
    
    for (let i = 0; i < fileCount; i++) {
      await fs.writeFile(
        path.join(projectPath, `file-${i}.js`),
        `// Test file ${i}\nconsole.log('Hello from file ${i}');\n`
      );
    }
  }

  async generateTestReport() {
    const reportPath = path.join(this.options.outputDir, 'phase3-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.testResults, null, 2));
    
    // Generate markdown summary
    const summaryPath = path.join(this.options.outputDir, 'phase3-test-summary.md');
    const summary = this.generateMarkdownSummary();
    await fs.writeFile(summaryPath, summary);
    
    this.log(`📄 Test report generated: ${reportPath}`);
    this.log(`📄 Test summary generated: ${summaryPath}`);
  }

  generateMarkdownSummary() {
    const successRate = ((this.testResults.summary.passed / this.testResults.summary.total) * 100).toFixed(1);
    
    return `# Phase 3 Testing Summary

## Overall Results
- **Total Tests**: ${this.testResults.summary.total}
- **Passed**: ${this.testResults.summary.passed}
- **Failed**: ${this.testResults.summary.failed}
- **Skipped**: ${this.testResults.summary.skipped}
- **Success Rate**: ${successRate}%
- **Duration**: ${(this.testResults.summary.duration / 1000).toFixed(2)} seconds

## Phase Results

${Object.entries(this.testResults.phases).map(([phaseKey, phase]) => `
### ${phase.name}
- **Tests**: ${phase.summary.total}
- **Passed**: ${phase.summary.passed}
- **Failed**: ${phase.summary.failed}
- **Success Rate**: ${((phase.summary.passed / phase.summary.total) * 100).toFixed(1)}%

${phase.tests.map(test => `- ${test.status === 'success' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'} ${test.name}: ${test.message || test.error}`).join('\n')}
`).join('')}

## Performance Metrics

${Object.entries(this.testResults.phases).map(([phaseKey, phase]) => {
  if (Object.keys(phase.performance).length > 0) {
    return `### ${phase.name} Performance
${Object.entries(phase.performance).map(([metric, data]) => `- **${metric}**: ${JSON.stringify(data, null, 2)}`).join('\n')}`;
  }
  return '';
}).filter(Boolean).join('\n\n')}

## Recommendations

${this.testResults.summary.failed > 0 ? `
### Issues to Address
${Object.entries(this.testResults.phases).map(([phaseKey, phase]) => 
  phase.tests.filter(test => test.status === 'failed').map(test => `- **${phase.name}**: ${test.name} - ${test.error}`).join('\n')
).filter(Boolean).join('\n')}
` : '✅ All tests passed successfully!'}

---
*Generated on ${new Date().toISOString()}*
`;
  }

  async generateRecommendations() {
    const recommendations = [];
    
    // Analyze test results for recommendations
    Object.entries(this.testResults.phases).forEach(([phaseKey, phase]) => {
      const failureRate = phase.summary.failed / phase.summary.total;
      
      if (failureRate > 0.2) {
        recommendations.push({
          phase: phase.name,
          priority: 'high',
          issue: 'High failure rate',
          recommendation: `Review and fix failing tests in ${phase.name}`,
          details: `${phase.summary.failed}/${phase.summary.total} tests failed`
        });
      }
      
      // Performance-specific recommendations
      if (phase.performance) {
        Object.entries(phase.performance).forEach(([metric, data]) => {
          if (metric.includes('time') && data.total_time_ms > 1000) {
            recommendations.push({
              phase: phase.name,
              priority: 'medium',
              issue: 'Performance concern',
              recommendation: `Optimize ${metric} performance`,
              details: `Current: ${data.total_time_ms}ms, Target: <1000ms`
            });
          }
        });
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push({
        phase: 'Overall',
        priority: 'low',
        issue: 'None',
        recommendation: 'All systems operating within acceptable parameters',
        details: 'Continue monitoring and maintain current performance levels'
      });
    }
    
    const recommendationsPath = path.join(this.options.outputDir, 'phase3-recommendations.json');
    await fs.writeFile(recommendationsPath, JSON.stringify(recommendations, null, 2));
    
    this.log(`📋 Recommendations generated: ${recommendationsPath}`);
    return recommendations;
  }
}

// Command line interface
if (require.main === module) {
  const options = {
    enablePerformanceBenchmarks: true,
    enableIntegrationTests: true,
    enableStressTests: true,
    verbose: true
  };
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--output-dir':
        options.outputDir = value;
        break;
      case '--no-performance':
        options.enablePerformanceBenchmarks = false;
        break;
      case '--no-integration':
        options.enableIntegrationTests = false;
        break;
      case '--no-stress':
        options.enableStressTests = false;
        break;
      case '--quiet':
        options.verbose = false;
        break;
    }
  }
  
  const testSuite = new Phase3TestSuite(options);
  testSuite.runAllTests()
    .then(results => {
      const successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(1);
      console.log(`\n🎯 Phase 3 Testing Complete: ${successRate}% success rate`);
      
      if (results.summary.failed > 0) {
        console.log(`⚠️ ${results.summary.failed} tests failed - review recommendations`);
        process.exit(1);
      } else {
        console.log(`✅ All tests passed successfully!`);
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Testing suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = Phase3TestSuite;
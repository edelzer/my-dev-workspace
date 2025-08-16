#!/usr/bin/env node

/**
 * AI Security Validation Test Suite
 * Phase 3 Task 3.1.3: Security AI Validation and Tuning
 * 
 * Comprehensive test suite for AI security validation accuracy
 * Protocol Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');
const AISecurityValidator = require('../validate.js');
const SecurityTestFixtures = require('./test-fixtures.js');

class ValidationTestSuite {
  constructor(options = {}) {
    this.options = {
      testTimeout: options.testTimeout || 300000, // 5 minutes
      confidenceThreshold: options.confidenceThreshold || 0.7,
      falsePositiveThreshold: options.falsePositiveThreshold || 0.05,
      enableDetailedLogging: options.enableDetailedLogging || false,
      ...options
    };
    
    this.testResults = [];
    this.performanceMetrics = [];
    this.fixtures = new SecurityTestFixtures();
    this.validator = new AISecurityValidator(this.options);
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    
    if (this.options.enableDetailedLogging) {
      this.testResults.push({ timestamp, type, message });
    }
  }

  async setupTestEnvironment() {
    this.log('🔧 Setting up test environment...');
    
    const testDir = path.join(__dirname, 'temp-test-env');
    await fs.mkdir(testDir, { recursive: true });
    
    // Generate test fixtures
    await this.fixtures.generateAllFixtures();
    const fixtureResult = await this.fixtures.writeFixturesToDisk(testDir);
    
    this.testEnvironment = {
      directory: testDir,
      fixtures: fixtureResult,
      expectations: this.fixtures.generateValidationExpectations()
    };
    
    this.log(`✅ Test environment ready: ${fixtureResult.fixtures_written} fixtures created`);
    return this.testEnvironment;
  }

  async runAccuracyTests() {
    this.log('🎯 Running accuracy validation tests...');
    
    const accuracyResults = {
      total_tests: 0,
      passed_tests: 0,
      failed_tests: 0,
      vulnerability_detection: {},
      false_positive_analysis: {},
      confidence_analysis: {}
    };

    for (const [filename, fixture] of this.fixtures.fixtures) {
      try {
        const testStartTime = Date.now();
        
        // Create mock security findings from fixture
        const mockFindings = this.createMockFindings(filename, fixture);
        
        // Test the validation
        const validationResults = await this.testFixtureValidation(
          filename,
          fixture,
          mockFindings
        );
        
        const testDuration = Date.now() - testStartTime;
        
        // Analyze results
        const analysis = this.analyzeValidationAccuracy(
          fixture.expected_vulnerabilities,
          validationResults,
          fixture.false_positive_probability
        );
        
        accuracyResults.total_tests++;
        if (analysis.passed) {
          accuracyResults.passed_tests++;
        } else {
          accuracyResults.failed_tests++;
        }
        
        // Store detailed results
        accuracyResults.vulnerability_detection[filename] = analysis;
        
        this.performanceMetrics.push({
          test: filename,
          duration: testDuration,
          validation_count: validationResults.length,
          complexity: fixture.metadata.complexity_score
        });
        
        this.log(`✅ ${filename}: ${analysis.passed ? 'PASSED' : 'FAILED'} (${testDuration}ms)`);
        
      } catch (error) {
        accuracyResults.failed_tests++;
        this.log(`❌ ${filename}: ERROR - ${error.message}`, 'error');
      }
    }

    accuracyResults.accuracy_rate = accuracyResults.passed_tests / accuracyResults.total_tests;
    return accuracyResults;
  }

  createMockFindings(filename, fixture) {
    const filePath = path.join(this.testEnvironment.directory, 'fixtures', filename);
    
    return fixture.expected_vulnerabilities.map((vuln, index) => ({
      id: `MOCK-${filename}-${index + 1}`,
      type: vuln.type,
      severity: vuln.severity,
      confidence: vuln.confidence,
      file: filePath,
      line: vuln.line,
      message: `Mock ${vuln.type} vulnerability`,
      recommendation: `Fix ${vuln.type} vulnerability`
    }));
  }

  async testFixtureValidation(filename, fixture, mockFindings) {
    const validationResults = [];
    
    for (const finding of mockFindings) {
      try {
        const validation = await this.validator.validateFinding(finding);
        validationResults.push(validation);
      } catch (error) {
        this.log(`⚠️ Validation error for ${finding.id}: ${error.message}`, 'warn');
      }
    }
    
    return validationResults;
  }

  analyzeValidationAccuracy(expectedVulns, validationResults, expectedFalsePositiveRate) {
    const analysis = {
      expected_vulnerabilities: expectedVulns.length,
      detected_vulnerabilities: validationResults.length,
      correctly_identified: 0,
      false_positives: 0,
      false_negatives: 0,
      confidence_scores: [],
      passed: false
    };

    // Match expected vs detected vulnerabilities
    for (const expected of expectedVulns) {
      const detected = validationResults.find(v => 
        v.finding_id.includes(expected.type) || 
        Math.abs(v.context_analysis?.line_number - expected.line) <= 2
      );
      
      if (detected && detected.validation_decision === 'VALIDATED') {
        analysis.correctly_identified++;
        analysis.confidence_scores.push(detected.validation_confidence);
      } else {
        analysis.false_negatives++;
      }
    }

    // Calculate false positive rate
    const falsePositives = validationResults.filter(v => 
      v.validation_decision === 'LIKELY_FALSE_POSITIVE'
    ).length;
    
    analysis.false_positives = falsePositives;
    analysis.false_positive_rate = falsePositives / Math.max(validationResults.length, 1);
    
    // Determine pass/fail
    const detectionRate = analysis.correctly_identified / Math.max(expectedVulns.length, 1);
    const fpWithinThreshold = analysis.false_positive_rate <= (expectedFalsePositiveRate * 1.5);
    const avgConfidence = analysis.confidence_scores.reduce((sum, c) => sum + c, 0) / 
                         Math.max(analysis.confidence_scores.length, 1);
    
    analysis.detection_rate = detectionRate;
    analysis.average_confidence = avgConfidence || 0;
    analysis.passed = detectionRate >= 0.85 && fpWithinThreshold && avgConfidence >= 0.6;
    
    return analysis;
  }

  async runPerformanceTests() {
    this.log('⚡ Running performance validation tests...');
    
    const performanceTests = [
      { name: 'small_codebase', file_count: 5, lines_per_file: 50 },
      { name: 'medium_codebase', file_count: 20, lines_per_file: 200 },
      { name: 'large_codebase', file_count: 100, lines_per_file: 500 },
      { name: 'xl_codebase', file_count: 500, lines_per_file: 1000 }
    ];

    const performanceResults = {};

    for (const test of performanceTests) {
      try {
        const testData = await this.generatePerformanceTestData(test);
        const startTime = Date.now();
        
        // Run validation on test data
        const validationResults = await this.runBenchmarkValidation(testData);
        
        const duration = Date.now() - startTime;
        const avgTimePerFile = duration / testData.files.length;
        const memoryUsage = process.memoryUsage();
        
        performanceResults[test.name] = {
          test_parameters: test,
          execution_time: duration,
          avg_time_per_file: avgTimePerFile,
          memory_usage: memoryUsage,
          validations_processed: validationResults.length,
          throughput: validationResults.length / (duration / 1000) // validations per second
        };
        
        this.log(`✅ ${test.name}: ${duration}ms (${avgTimePerFile.toFixed(2)}ms/file)`);
        
      } catch (error) {
        this.log(`❌ Performance test ${test.name} failed: ${error.message}`, 'error');
        performanceResults[test.name] = { error: error.message };
      }
    }

    return performanceResults;
  }

  async generatePerformanceTestData(testSpec) {
    const testData = {
      name: testSpec.name,
      files: [],
      total_lines: 0
    };

    // Generate synthetic code files for performance testing
    for (let i = 0; i < testSpec.file_count; i++) {
      const filename = `perf-test-${i}.js`;
      const code = this.generateSyntheticCode(testSpec.lines_per_file);
      
      testData.files.push({
        filename,
        code,
        line_count: testSpec.lines_per_file,
        synthetic_vulnerabilities: this.injectSyntheticVulnerabilities(code)
      });
      
      testData.total_lines += testSpec.lines_per_file;
    }

    return testData;
  }

  generateSyntheticCode(lineCount) {
    const codeTemplates = [
      'function processData(input) {',
      '  const result = validateInput(input);',
      '  if (result.isValid) {',
      '    return database.query("SELECT * FROM data WHERE id = ?", [result.id]);',
      '  }',
      '  throw new Error("Invalid input");',
      '}',
      '',
      'function handleRequest(req, res) {',
      '  const userId = req.params.id;',
      '  const userData = getUserData(userId);',
      '  res.json(userData);',
      '}',
      '',
      'class DataProcessor {',
      '  constructor(config) {',
      '    this.config = config;',
      '  }',
      '  ',
      '  async process(data) {',
      '    const validated = this.validate(data);',
      '    return await this.save(validated);',
      '  }',
      '}'
    ];

    let code = '';
    while (code.split('\n').length < lineCount) {
      code += codeTemplates.join('\n') + '\n\n';
    }

    return code.split('\n').slice(0, lineCount).join('\n');
  }

  injectSyntheticVulnerabilities(code) {
    // Randomly inject a few vulnerabilities for performance testing
    const vulnerabilities = [];
    const lines = code.split('\n');
    
    // Inject 1-3 random vulnerabilities
    const vulnCount = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < vulnCount; i++) {
      const line = Math.floor(Math.random() * lines.length);
      vulnerabilities.push({
        type: this.fixtures.vulnerabilityTypes[
          Math.floor(Math.random() * this.fixtures.vulnerabilityTypes.length)
        ],
        line: line + 1,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)]
      });
    }
    
    return vulnerabilities;
  }

  async runBenchmarkValidation(testData) {
    const mockFindings = [];
    
    // Create mock findings from synthetic vulnerabilities
    testData.files.forEach(file => {
      file.synthetic_vulnerabilities.forEach((vuln, index) => {
        mockFindings.push({
          id: `PERF-${file.filename}-${index}`,
          type: vuln.type,
          severity: vuln.severity,
          confidence: 0.8,
          file: file.filename,
          line: vuln.line,
          message: `Performance test ${vuln.type}`,
          recommendation: 'Fix vulnerability'
        });
      });
    });

    // Run validation on all findings
    const validationResults = [];
    for (const finding of mockFindings) {
      try {
        const validation = await this.validator.validateFinding(finding);
        validationResults.push(validation);
      } catch (error) {
        // Continue with other validations
      }
    }

    return validationResults;
  }

  async runFalsePositiveTests() {
    this.log('🔍 Running false positive detection tests...');
    
    const fpTests = {
      test_files: 0,
      mock_data: 0,
      documentation: 0,
      framework_protected: 0,
      total_false_positives: 0,
      correctly_filtered: 0
    };

    // Test specific false positive scenarios
    const falsePositiveFixtures = Array.from(this.fixtures.fixtures.entries())
      .filter(([filename]) => filename.includes('false-positive') || filename.includes('framework'));

    for (const [filename, fixture] of falsePositiveFixtures) {
      const mockFindings = this.createMockFindings(filename, fixture);
      const validationResults = await this.testFixtureValidation(filename, fixture, mockFindings);
      
      const falsePositives = validationResults.filter(v => 
        v.validation_decision === 'LIKELY_FALSE_POSITIVE'
      ).length;
      
      const category = this.categorizeFalsePositiveTest(filename);
      fpTests[category]++;
      fpTests.correctly_filtered += falsePositives;
      fpTests.total_false_positives += validationResults.length - falsePositives;
    }

    fpTests.false_positive_rate = fpTests.total_false_positives / 
      (fpTests.total_false_positives + fpTests.correctly_filtered);
    
    return fpTests;
  }

  categorizeFalsePositiveTest(filename) {
    if (filename.includes('test')) return 'test_files';
    if (filename.includes('mock')) return 'mock_data';
    if (filename.includes('doc')) return 'documentation';
    if (filename.includes('framework')) return 'framework_protected';
    return 'test_files';
  }

  async generateTestReport() {
    this.log('📊 Generating comprehensive test report...');
    
    const report = {
      test_execution: {
        timestamp: new Date().toISOString(),
        test_suite_version: '1.0.0',
        total_duration: this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0),
        test_environment: this.testEnvironment
      },
      accuracy_results: await this.runAccuracyTests(),
      performance_results: await this.runPerformanceTests(),
      false_positive_results: await this.runFalsePositiveTests(),
      recommendations: this.generateTuningRecommendations()
    };

    // Calculate overall metrics
    report.overall_metrics = {
      overall_accuracy: report.accuracy_results.accuracy_rate,
      average_confidence: this.calculateAverageConfidence(report.accuracy_results),
      false_positive_rate: report.false_positive_results.false_positive_rate,
      performance_score: this.calculatePerformanceScore(report.performance_results),
      ready_for_production: this.assessProductionReadiness(report)
    };

    return report;
  }

  generateTuningRecommendations() {
    const recommendations = [];
    
    // Analyze performance metrics for tuning suggestions
    const avgDuration = this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0) / 
                       Math.max(this.performanceMetrics.length, 1);
    
    if (avgDuration > 5000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        suggestion: 'Increase confidence threshold to reduce validation time',
        parameter: 'confidenceThreshold',
        current_value: this.options.confidenceThreshold,
        suggested_value: Math.min(0.9, this.options.confidenceThreshold + 0.1)
      });
    }

    if (avgDuration < 1000) {
      recommendations.push({
        type: 'accuracy',
        priority: 'medium',
        suggestion: 'Decrease confidence threshold to improve detection',
        parameter: 'confidenceThreshold',
        current_value: this.options.confidenceThreshold,
        suggested_value: Math.max(0.5, this.options.confidenceThreshold - 0.1)
      });
    }

    recommendations.push({
      type: 'general',
      priority: 'low',
      suggestion: 'Enable learning mode for continuous improvement',
      parameter: 'enableLearning',
      current_value: this.options.enableLearning,
      suggested_value: true
    });

    return recommendations;
  }

  calculateAverageConfidence(accuracyResults) {
    const allConfidences = [];
    Object.values(accuracyResults.vulnerability_detection).forEach(detection => {
      allConfidences.push(...detection.confidence_scores);
    });
    return allConfidences.reduce((sum, c) => sum + c, 0) / Math.max(allConfidences.length, 1);
  }

  calculatePerformanceScore(performanceResults) {
    const scores = Object.values(performanceResults).map(result => {
      if (result.error) return 0;
      
      // Score based on throughput (validations per second)
      const throughputScore = Math.min(1, result.throughput / 10); // 10 validations/sec = perfect
      
      // Score based on memory efficiency
      const memoryScore = Math.max(0, 1 - (result.memory_usage.heapUsed / (100 * 1024 * 1024))); // 100MB baseline
      
      return (throughputScore + memoryScore) / 2;
    });
    
    return scores.reduce((sum, s) => sum + s, 0) / Math.max(scores.length, 1);
  }

  assessProductionReadiness(report) {
    const criteria = {
      accuracy: report.overall_metrics.overall_accuracy >= 0.90,
      confidence: report.overall_metrics.average_confidence >= 0.75,
      false_positives: report.overall_metrics.false_positive_rate <= 0.10,
      performance: report.overall_metrics.performance_score >= 0.70
    };
    
    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    return {
      ready: passedCriteria >= 3,
      criteria_met: passedCriteria,
      total_criteria: Object.keys(criteria).length,
      details: criteria
    };
  }

  async cleanup() {
    try {
      if (this.testEnvironment?.directory) {
        await fs.rmdir(this.testEnvironment.directory, { recursive: true });
        this.log('🧹 Test environment cleaned up');
      }
    } catch (error) {
      this.log(`⚠️ Cleanup warning: ${error.message}`, 'warn');
    }
  }

  async runFullTestSuite() {
    try {
      this.log('🚀 Starting comprehensive AI security validation test suite...');
      
      await this.setupTestEnvironment();
      const report = await this.generateTestReport();
      
      // Save report
      const reportPath = path.join(__dirname, 'validation-test-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      // Summary
      this.log('\n📊 Test Suite Summary:');
      this.log(`   Overall Accuracy: ${(report.overall_metrics.overall_accuracy * 100).toFixed(2)}%`);
      this.log(`   Average Confidence: ${(report.overall_metrics.average_confidence * 100).toFixed(2)}%`);
      this.log(`   False Positive Rate: ${(report.overall_metrics.false_positive_rate * 100).toFixed(2)}%`);
      this.log(`   Performance Score: ${(report.overall_metrics.performance_score * 100).toFixed(2)}%`);
      this.log(`   Production Ready: ${report.overall_metrics.ready_for_production.ready ? 'YES' : 'NO'}`);
      this.log(`   Report: ${reportPath}`);
      
      await this.cleanup();
      return report;
      
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
      await this.cleanup();
      throw error;
    }
  }
}

// Command line interface
if (require.main === module) {
  const testSuite = new ValidationTestSuite({
    enableDetailedLogging: process.argv.includes('--verbose'),
    confidenceThreshold: 0.7,
    falsePositiveThreshold: 0.05
  });
  
  testSuite.runFullTestSuite()
    .then(report => {
      process.exit(report.overall_metrics.ready_for_production.ready ? 0 : 1);
    })
    .catch(error => {
      console.error('Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = ValidationTestSuite;
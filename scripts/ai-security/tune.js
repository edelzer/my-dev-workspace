#!/usr/bin/env node

/**
 * AI Security Validation Tuning Script
 * Phase 3 Task 3.1.3: Security AI Validation and Tuning
 * 
 * Intelligent parameter tuning for optimal accuracy and performance
 * Protocol Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');
const AISecurityValidator = require('./validate.js');
const ValidationTestSuite = require('./tests/validation-test-suite.js');

class AISecurityTuner {
  constructor(options = {}) {
    this.options = {
      tuningIterations: options.tuningIterations || 10,
      maxTuningTime: options.maxTuningTime || 1800000, // 30 minutes
      targetAccuracy: options.targetAccuracy || 0.95,
      targetFalsePositiveRate: options.targetFalsePositiveRate || 0.05,
      enableGridSearch: options.enableGridSearch !== false,
      enableBayesianOptimization: options.enableBayesianOptimization || false,
      ...options
    };
    
    this.tuningLog = [];
    this.bestConfiguration = null;
    this.tuningHistory = [];
    this.convergenceThreshold = 0.001;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.tuningLog.push(logEntry);
  }

  // Define parameter space for tuning
  getParameterSpace() {
    return {
      confidenceThreshold: {
        type: 'continuous',
        min: 0.3,
        max: 0.95,
        step: 0.05,
        default: 0.7,
        description: 'Minimum confidence for validating findings'
      },
      falsePositiveThreshold: {
        type: 'continuous', 
        min: 0.01,
        max: 0.20,
        step: 0.01,
        default: 0.05,
        description: 'Maximum acceptable false positive rate'
      },
      maxValidationTime: {
        type: 'discrete',
        values: [60, 120, 300, 600, 1200],
        default: 300,
        description: 'Maximum validation time in seconds'
      },
      contextWindowSize: {
        type: 'discrete',
        values: [5, 10, 15, 20, 25],
        default: 10,
        description: 'Lines of context around findings'
      },
      severityWeights: {
        type: 'complex',
        default: {
          CRITICAL: 0.9,
          HIGH: 0.8,
          MEDIUM: 0.6,
          LOW: 0.4
        },
        variations: [
          { CRITICAL: 0.95, HIGH: 0.85, MEDIUM: 0.65, LOW: 0.35 },
          { CRITICAL: 0.85, HIGH: 0.75, MEDIUM: 0.55, LOW: 0.45 },
          { CRITICAL: 1.0, HIGH: 0.8, MEDIUM: 0.6, LOW: 0.3 }
        ],
        description: 'Confidence weights by severity level'
      },
      frameworkAwareness: {
        type: 'boolean',
        default: true,
        description: 'Enable framework-specific validation rules'
      },
      learningEnabled: {
        type: 'boolean',
        default: true,
        description: 'Enable continuous learning from validations'
      }
    };
  }

  // Generate parameter combinations for grid search
  generateParameterCombinations() {
    const space = this.getParameterSpace();
    const combinations = [];
    
    if (!this.options.enableGridSearch) {
      // Return just the default configuration
      const defaultConfig = {};
      for (const [param, spec] of Object.entries(space)) {
        defaultConfig[param] = spec.default;
      }
      return [defaultConfig];
    }

    // Generate combinations for continuous parameters
    const confidenceValues = this.generateRange(
      space.confidenceThreshold.min,
      space.confidenceThreshold.max,
      space.confidenceThreshold.step
    );
    
    const fpThresholdValues = this.generateRange(
      space.falsePositiveThreshold.min,
      space.falsePositiveThreshold.max,
      space.falsePositiveThreshold.step
    );

    // Limit combinations to reasonable number for grid search
    const maxCombinations = Math.min(50, this.options.tuningIterations);
    let combinationCount = 0;

    for (const confidence of confidenceValues) {
      for (const fpThreshold of fpThresholdValues) {
        for (const timeLimit of space.maxValidationTime.values) {
          for (const contextSize of space.contextWindowSize.values) {
            for (const severityWeights of space.severityWeights.variations) {
              if (combinationCount >= maxCombinations) break;
              
              combinations.push({
                confidenceThreshold: confidence,
                falsePositiveThreshold: fpThreshold,
                maxValidationTime: timeLimit * 1000, // Convert to ms
                contextWindowSize: contextSize,
                severityWeights: severityWeights,
                frameworkAwareness: true,
                learningEnabled: true
              });
              
              combinationCount++;
            }
            if (combinationCount >= maxCombinations) break;
          }
          if (combinationCount >= maxCombinations) break;
        }
        if (combinationCount >= maxCombinations) break;
      }
      if (combinationCount >= maxCombinations) break;
    }

    this.log(`Generated ${combinations.length} parameter combinations for tuning`);
    return combinations;
  }

  generateRange(min, max, step) {
    const values = [];
    for (let value = min; value <= max; value += step) {
      values.push(Math.round(value * 100) / 100); // Round to 2 decimal places
    }
    return values;
  }

  // Evaluate a parameter configuration
  async evaluateConfiguration(config) {
    this.log(`🔧 Evaluating configuration: confidence=${config.confidenceThreshold}, fp=${config.falsePositiveThreshold}`);
    
    const startTime = Date.now();
    
    try {
      // Create test suite with this configuration
      const testSuite = new ValidationTestSuite({
        ...config,
        enableDetailedLogging: false // Reduce noise during tuning
      });
      
      // Run limited test suite for performance
      await testSuite.setupTestEnvironment();
      
      const accuracyResults = await testSuite.runAccuracyTests();
      const falsePositiveResults = await testSuite.runFalsePositiveTests();
      
      // Quick performance test with smaller dataset
      const performanceData = await this.quickPerformanceTest(config);
      
      await testSuite.cleanup();
      
      const evaluation = {
        config: config,
        metrics: {
          accuracy: accuracyResults.accuracy_rate,
          false_positive_rate: falsePositiveResults.false_positive_rate,
          average_confidence: this.calculateAverageConfidence(accuracyResults),
          validation_time: performanceData.avgValidationTime,
          throughput: performanceData.throughput
        },
        score: this.calculateOverallScore(accuracyResults, falsePositiveResults, performanceData),
        evaluation_time: Date.now() - startTime
      };
      
      this.log(`✅ Configuration score: ${evaluation.score.toFixed(3)} (accuracy: ${(evaluation.metrics.accuracy * 100).toFixed(1)}%)`);
      return evaluation;
      
    } catch (error) {
      this.log(`❌ Configuration evaluation failed: ${error.message}`, 'error');
      return {
        config: config,
        error: error.message,
        score: 0,
        evaluation_time: Date.now() - startTime
      };
    }
  }

  calculateAverageConfidence(accuracyResults) {
    const allConfidences = [];
    Object.values(accuracyResults.vulnerability_detection).forEach(detection => {
      allConfidences.push(...(detection.confidence_scores || []));
    });
    return allConfidences.length > 0 ? 
      allConfidences.reduce((sum, c) => sum + c, 0) / allConfidences.length : 0;
  }

  calculateOverallScore(accuracyResults, falsePositiveResults, performanceData) {
    // Weighted scoring function
    const weights = {
      accuracy: 0.4,
      false_positive_penalty: 0.3,
      confidence: 0.2,
      performance: 0.1
    };
    
    const accuracyScore = accuracyResults.accuracy_rate;
    const fpPenalty = Math.max(0, 1 - (falsePositiveResults.false_positive_rate / this.options.targetFalsePositiveRate));
    const confidenceScore = this.calculateAverageConfidence(accuracyResults);
    const performanceScore = Math.min(1, performanceData.throughput / 5); // 5 validations/sec target
    
    return (
      accuracyScore * weights.accuracy +
      fpPenalty * weights.false_positive_penalty +
      confidenceScore * weights.confidence +
      performanceScore * weights.performance
    );
  }

  async quickPerformanceTest(config) {
    // Create a simple validator with the config
    const validator = new AISecurityValidator(config);
    
    // Generate a few mock findings for quick performance test
    const mockFindings = [
      {
        id: 'PERF-1',
        type: 'SQL_INJECTION',
        severity: 'HIGH',
        confidence: 0.8,
        file: 'test.js',
        line: 10,
        message: 'Test SQL injection',
        recommendation: 'Use parameterized queries'
      },
      {
        id: 'PERF-2',
        type: 'XSS',
        severity: 'MEDIUM',
        confidence: 0.7,
        file: 'test.js',
        line: 20,
        message: 'Test XSS',
        recommendation: 'Escape user input'
      }
    ];
    
    const startTime = Date.now();
    const validationPromises = mockFindings.map(finding => 
      validator.validateFinding(finding).catch(() => null)
    );
    
    const results = await Promise.all(validationPromises);
    const duration = Date.now() - startTime;
    
    return {
      avgValidationTime: duration / mockFindings.length,
      throughput: (results.filter(r => r).length / duration) * 1000 // per second
    };
  }

  // Main tuning algorithm
  async performTuning() {
    this.log('🎯 Starting AI security validation parameter tuning...');
    const startTime = Date.now();
    
    // Generate parameter combinations
    const combinations = this.generateParameterCombinations();
    
    // Evaluate each combination
    const evaluations = [];
    let bestScore = 0;
    
    for (let i = 0; i < combinations.length; i++) {
      if (Date.now() - startTime > this.options.maxTuningTime) {
        this.log('⏰ Tuning time limit reached, stopping early');
        break;
      }
      
      const config = combinations[i];
      this.log(`📊 Evaluating configuration ${i + 1}/${combinations.length}`);
      
      const evaluation = await this.evaluateConfiguration(config);
      evaluations.push(evaluation);
      
      if (evaluation.score > bestScore) {
        bestScore = evaluation.score;
        this.bestConfiguration = evaluation;
        this.log(`🏆 New best configuration found! Score: ${bestScore.toFixed(3)}`);
      }
      
      // Check for early convergence
      if (this.checkConvergence(evaluations)) {
        this.log('📈 Convergence detected, stopping tuning');
        break;
      }
    }
    
    this.tuningHistory = evaluations;
    
    const tuningDuration = Date.now() - startTime;
    this.log(`✅ Tuning completed in ${tuningDuration}ms. Best score: ${bestScore.toFixed(3)}`);
    
    return {
      best_configuration: this.bestConfiguration,
      all_evaluations: evaluations,
      tuning_duration: tuningDuration,
      convergence_info: this.analyzeConvergence(evaluations)
    };
  }

  checkConvergence(evaluations) {
    if (evaluations.length < 5) return false;
    
    // Check if recent scores are not improving significantly
    const recentScores = evaluations.slice(-5).map(e => e.score);
    const maxRecent = Math.max(...recentScores);
    const minRecent = Math.min(...recentScores);
    
    return (maxRecent - minRecent) < this.convergenceThreshold;
  }

  analyzeConvergence(evaluations) {
    const scores = evaluations.map(e => e.score);
    const improvements = [];
    
    for (let i = 1; i < scores.length; i++) {
      improvements.push(scores[i] - scores[i - 1]);
    }
    
    return {
      total_evaluations: evaluations.length,
      score_range: {
        min: Math.min(...scores),
        max: Math.max(...scores),
        std_dev: this.calculateStandardDeviation(scores)
      },
      improvement_trend: this.calculateTrend(improvements),
      converged: this.checkConvergence(evaluations)
    };
  }

  calculateStandardDeviation(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  calculateTrend(values) {
    if (values.length === 0) return 0;
    
    const recentValues = values.slice(-Math.min(5, values.length));
    const positiveImprovements = recentValues.filter(v => v > 0).length;
    
    return positiveImprovements / recentValues.length; // Ratio of positive improvements
  }

  // Generate tuning report
  async generateTuningReport(tuningResults) {
    this.log('📋 Generating tuning report...');
    
    const report = {
      tuning_summary: {
        timestamp: new Date().toISOString(),
        tuning_duration: tuningResults.tuning_duration,
        configurations_evaluated: tuningResults.all_evaluations.length,
        best_score: this.bestConfiguration.score,
        parameter_space: this.getParameterSpace()
      },
      best_configuration: {
        parameters: this.bestConfiguration.config,
        performance_metrics: this.bestConfiguration.metrics,
        evaluation_details: this.bestConfiguration
      },
      optimization_analysis: {
        convergence: tuningResults.convergence_info,
        parameter_sensitivity: this.analyzeParameterSensitivity(tuningResults.all_evaluations),
        performance_pareto: this.analyzePerformancePareto(tuningResults.all_evaluations)
      },
      recommendations: this.generateTuningRecommendations(tuningResults),
      production_readiness: this.assessProductionReadiness(this.bestConfiguration)
    };
    
    return report;
  }

  analyzeParameterSensitivity(evaluations) {
    const parameterImpacts = {};
    const parameters = Object.keys(this.getParameterSpace());
    
    for (const param of parameters) {
      if (param === 'severityWeights') continue; // Skip complex parameter
      
      const impacts = [];
      
      for (let i = 1; i < evaluations.length; i++) {
        const current = evaluations[i];
        const previous = evaluations[i - 1];
        
        if (current.config[param] !== previous.config[param]) {
          const paramChange = Math.abs(current.config[param] - previous.config[param]);
          const scoreChange = current.score - previous.score;
          
          if (paramChange > 0) {
            impacts.push(Math.abs(scoreChange) / paramChange);
          }
        }
      }
      
      parameterImpacts[param] = {
        average_impact: impacts.length > 0 ? impacts.reduce((sum, i) => sum + i, 0) / impacts.length : 0,
        max_impact: impacts.length > 0 ? Math.max(...impacts) : 0,
        sensitivity_rank: 'medium' // Will be calculated relative to other parameters
      };
    }
    
    // Rank parameters by sensitivity
    const sortedParams = Object.entries(parameterImpacts)
      .sort(([,a], [,b]) => b.average_impact - a.average_impact);
    
    sortedParams.forEach(([param, impact], index) => {
      if (index < sortedParams.length / 3) {
        impact.sensitivity_rank = 'high';
      } else if (index < 2 * sortedParams.length / 3) {
        impact.sensitivity_rank = 'medium';
      } else {
        impact.sensitivity_rank = 'low';
      }
    });
    
    return parameterImpacts;
  }

  analyzePerformancePareto(evaluations) {
    // Find Pareto optimal solutions (accuracy vs performance trade-offs)
    const validEvaluations = evaluations.filter(e => !e.error && e.metrics);
    
    const paretoOptimal = [];
    
    for (const evaluation of validEvaluations) {
      const isDominated = validEvaluations.some(other => 
        other !== evaluation &&
        other.metrics.accuracy >= evaluation.metrics.accuracy &&
        other.metrics.throughput >= evaluation.metrics.throughput &&
        (other.metrics.accuracy > evaluation.metrics.accuracy || 
         other.metrics.throughput > evaluation.metrics.throughput)
      );
      
      if (!isDominated) {
        paretoOptimal.push(evaluation);
      }
    }
    
    return {
      total_solutions: validEvaluations.length,
      pareto_optimal_count: paretoOptimal.length,
      pareto_solutions: paretoOptimal.map(e => ({
        config: e.config,
        accuracy: e.metrics.accuracy,
        throughput: e.metrics.throughput,
        score: e.score
      }))
    };
  }

  generateTuningRecommendations(tuningResults) {
    const recommendations = [];
    const best = this.bestConfiguration;
    
    // Performance recommendations
    if (best.metrics.throughput < 3) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        issue: 'Low validation throughput detected',
        suggestion: 'Consider increasing confidence threshold or reducing context window',
        impact: 'Improved response time for large codebases'
      });
    }
    
    // Accuracy recommendations
    if (best.metrics.accuracy < this.options.targetAccuracy) {
      recommendations.push({
        type: 'accuracy',
        priority: 'critical',
        issue: 'Accuracy below target threshold',
        suggestion: 'Decrease confidence threshold or enable additional validation features',
        impact: 'Better vulnerability detection accuracy'
      });
    }
    
    // False positive recommendations
    if (best.metrics.false_positive_rate > this.options.targetFalsePositiveRate) {
      recommendations.push({
        type: 'false_positives',
        priority: 'high',
        issue: 'False positive rate above acceptable threshold',
        suggestion: 'Increase confidence threshold or enhance framework awareness',
        impact: 'Reduced noise and improved developer experience'
      });
    }
    
    // Configuration-specific recommendations
    if (best.config.confidenceThreshold < 0.5) {
      recommendations.push({
        type: 'configuration',
        priority: 'medium',
        issue: 'Very low confidence threshold may increase false positives',
        suggestion: 'Consider gradual increase with additional validation rules',
        impact: 'Better balance between detection and precision'
      });
    }
    
    return recommendations;
  }

  assessProductionReadiness(bestConfiguration) {
    const metrics = bestConfiguration.metrics;
    
    const criteria = {
      accuracy_threshold: metrics.accuracy >= 0.90,
      false_positive_threshold: metrics.false_positive_rate <= 0.10,
      performance_threshold: metrics.throughput >= 2.0,
      confidence_threshold: metrics.average_confidence >= 0.70
    };
    
    const passedCriteria = Object.values(criteria).filter(Boolean).length;
    const totalCriteria = Object.keys(criteria).length;
    
    return {
      ready_for_production: passedCriteria >= 3,
      criteria_score: passedCriteria / totalCriteria,
      passed_criteria: passedCriteria,
      total_criteria: totalCriteria,
      detailed_criteria: criteria,
      confidence_level: passedCriteria === totalCriteria ? 'high' : 
                       passedCriteria >= 3 ? 'medium' : 'low'
    };
  }

  // Save optimized configuration
  async saveOptimizedConfiguration(outputPath = null) {
    if (!this.bestConfiguration) {
      throw new Error('No optimized configuration available. Run tuning first.');
    }
    
    const configPath = outputPath || path.join(__dirname, 'optimized-config.json');
    
    const optimizedConfig = {
      version: '1.0.0',
      tuned_timestamp: new Date().toISOString(),
      configuration: this.bestConfiguration.config,
      performance_metrics: this.bestConfiguration.metrics,
      tuning_metadata: {
        iterations: this.tuningHistory.length,
        best_score: this.bestConfiguration.score,
        production_ready: this.assessProductionReadiness(this.bestConfiguration).ready_for_production
      }
    };
    
    await fs.writeFile(configPath, JSON.stringify(optimizedConfig, null, 2));
    this.log(`💾 Optimized configuration saved: ${configPath}`);
    
    return configPath;
  }

  // Main execution method
  async run() {
    try {
      this.log('🚀 Starting AI security validation tuning process...');
      
      const tuningResults = await this.performTuning();
      const report = await this.generateTuningReport(tuningResults);
      
      // Save results
      const reportPath = path.join(__dirname, 'tuning-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      
      const configPath = await this.saveOptimizedConfiguration();
      
      // Summary
      this.log('\n🎯 Tuning Summary:');
      this.log(`   Configurations Evaluated: ${tuningResults.all_evaluations.length}`);
      this.log(`   Best Score: ${this.bestConfiguration.score.toFixed(3)}`);
      this.log(`   Best Accuracy: ${(this.bestConfiguration.metrics.accuracy * 100).toFixed(2)}%`);
      this.log(`   False Positive Rate: ${(this.bestConfiguration.metrics.false_positive_rate * 100).toFixed(2)}%`);
      this.log(`   Production Ready: ${report.production_readiness.ready_for_production ? 'YES' : 'NO'}`);
      this.log(`   Tuning Report: ${reportPath}`);
      this.log(`   Optimized Config: ${configPath}`);
      
      return {
        tuning_results: tuningResults,
        report: report,
        report_path: reportPath,
        config_path: configPath
      };
      
    } catch (error) {
      this.log(`❌ Tuning process failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  const options = {
    tuningIterations: 20,
    maxTuningTime: 1800000, // 30 minutes
    targetAccuracy: 0.95,
    targetFalsePositiveRate: 0.05
  };
  
  // Parse command line options
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--iterations':
        options.tuningIterations = parseInt(value);
        break;
      case '--max-time':
        options.maxTuningTime = parseInt(value) * 1000;
        break;
      case '--target-accuracy':
        options.targetAccuracy = parseFloat(value);
        break;
      case '--target-fp-rate':
        options.targetFalsePositiveRate = parseFloat(value);
        break;
    }
  }
  
  const tuner = new AISecurityTuner(options);
  tuner.run()
    .then(results => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Tuning failed:', error.message);
      process.exit(1);
    });
}

module.exports = AISecurityTuner;
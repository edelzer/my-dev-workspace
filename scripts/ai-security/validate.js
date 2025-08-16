#!/usr/bin/env node

/**
 * AI Security Validator (Mock Implementation)
 * Phase 3 Testing - Mock for SBOM Integration Testing
 * 
 * Provides mock AI validation functionality for testing purposes
 * Real implementation would integrate with AI/ML models for security validation
 * 
 * Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');

class AISecurityValidator {
  constructor(options = {}) {
    this.options = {
      confidenceThreshold: options.confidenceThreshold || 0.8,
      maxValidationTime: options.maxValidationTime || 30000, // 30 seconds
      falsePositiveThreshold: options.falsePositiveThreshold || 0.05,
      enableLearning: options.enableLearning !== false,
      ...options
    };
    
    this.validationHistory = [];
    this.modelMetrics = {
      totalValidations: 0,
      successfulValidations: 0,
      averageConfidence: 0,
      processingTime: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warn' ? '⚠️' : '🤖';
    console.log(`[${timestamp}] AI-VALIDATOR ${prefix} ${message}`);
  }

  // Main validation entry point
  async validateFindings(findingsPath, outputPath) {
    this.log('🤖 Starting AI security validation...');
    const startTime = Date.now();
    
    try {
      // Load findings
      const findingsData = JSON.parse(await fs.readFile(findingsPath, 'utf8'));
      const findings = findingsData.findings || [];
      
      this.log(`📋 Validating ${findings.length} security findings...`);
      
      const validationResults = [];
      
      for (const finding of findings) {
        const validation = await this.validateFinding(finding);
        validationResults.push(validation);
      }
      
      const validationReport = this.generateValidationReport(validationResults, startTime);
      
      // Save validation report
      await fs.writeFile(outputPath, JSON.stringify(validationReport, null, 2));
      
      this.updateMetrics(validationResults, Date.now() - startTime);
      
      this.log(`✅ AI validation completed: ${validationResults.length} findings processed`);
      
      return validationReport;
      
    } catch (error) {
      this.log(`❌ AI validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Validate individual security finding
  async validateFinding(finding) {
    const startTime = Date.now();
    
    // Simulate AI processing time
    await this.simulateProcessingDelay();
    
    const validation = {
      finding_id: finding.id,
      original_finding: finding,
      validation_timestamp: new Date().toISOString(),
      validation_decision: null,
      validation_confidence: 0,
      validation_reasoning: [],
      ai_analysis: {},
      processing_time_ms: 0
    };
    
    try {
      // Mock AI analysis based on finding characteristics
      const aiAnalysis = await this.performAIAnalysis(finding);
      
      validation.ai_analysis = aiAnalysis;
      validation.validation_decision = aiAnalysis.decision;
      validation.validation_confidence = aiAnalysis.confidence;
      validation.validation_reasoning = aiAnalysis.reasoning;
      validation.processing_time_ms = Date.now() - startTime;
      
      // Add to validation history
      this.validationHistory.push({
        finding_id: finding.id,
        decision: validation.validation_decision,
        confidence: validation.validation_confidence,
        timestamp: validation.validation_timestamp
      });
      
      return validation;
      
    } catch (error) {
      validation.validation_decision = 'ERROR';
      validation.validation_confidence = 0;
      validation.validation_reasoning = [`Validation error: ${error.message}`];
      validation.processing_time_ms = Date.now() - startTime;
      
      return validation;
    }
  }

  // Mock AI analysis of security finding
  async performAIAnalysis(finding) {
    const analysis = {
      decision: 'VALID',
      confidence: 0.8,
      reasoning: [],
      risk_factors: [],
      recommendation: null
    };
    
    // Analyze finding type
    const typeAnalysis = this.analyzeVulnerabilityType(finding.type);
    analysis.confidence *= typeAnalysis.confidence_modifier;
    analysis.reasoning.push(typeAnalysis.reasoning);
    
    // Analyze severity
    const severityAnalysis = this.analyzeSeverity(finding.severity);
    analysis.confidence *= severityAnalysis.confidence_modifier;
    analysis.reasoning.push(severityAnalysis.reasoning);
    
    // Analyze confidence from source
    const sourceAnalysis = this.analyzeSourceConfidence(finding.confidence);
    analysis.confidence *= sourceAnalysis.confidence_modifier;
    analysis.reasoning.push(sourceAnalysis.reasoning);
    
    // Apply randomness for mock behavior
    analysis.confidence *= (0.8 + Math.random() * 0.4); // 0.8-1.2 multiplier
    analysis.confidence = Math.min(1.0, Math.max(0.0, analysis.confidence));
    
    // Make final decision based on confidence threshold
    if (analysis.confidence >= this.options.confidenceThreshold) {
      analysis.decision = 'VALID';
      analysis.recommendation = this.generateRecommendation(finding, 'valid');
    } else if (analysis.confidence >= this.options.falsePositiveThreshold) {
      analysis.decision = 'UNCERTAIN';
      analysis.recommendation = this.generateRecommendation(finding, 'uncertain');
    } else {
      analysis.decision = 'FALSE_POSITIVE';
      analysis.recommendation = this.generateRecommendation(finding, 'false_positive');
    }
    
    // Add risk factors
    analysis.risk_factors = this.identifyRiskFactors(finding);
    
    return analysis;
  }

  // Analyze vulnerability type
  analyzeVulnerabilityType(type) {
    const typeConfidence = {
      'SQL_INJECTION': { modifier: 1.0, reasoning: 'SQL injection patterns are well-defined and easily detected' },
      'XSS': { modifier: 0.9, reasoning: 'XSS detection has high accuracy with modern analysis tools' },
      'COMMAND_INJECTION': { modifier: 0.95, reasoning: 'Command injection patterns are distinctive' },
      'PATH_TRAVERSAL': { modifier: 0.85, reasoning: 'Path traversal detection may have false positives' },
      'HARDCODED_SECRET': { modifier: 0.7, reasoning: 'Secret detection prone to false positives from test data' },
      'WEAK_CRYPTO': { modifier: 0.8, reasoning: 'Cryptographic weakness detection requires context analysis' },
      'VULNERABILITY': { modifier: 0.9, reasoning: 'General vulnerability classification' },
      'SUPPLY_CHAIN_RISK': { modifier: 0.75, reasoning: 'Supply chain risks require complex dependency analysis' }
    };
    
    return typeConfidence[type] || { modifier: 0.8, reasoning: 'Unknown vulnerability type requires manual review' };
  }

  // Analyze severity impact on confidence
  analyzeSeverity(severity) {
    const severityConfidence = {
      'CRITICAL': { modifier: 1.0, reasoning: 'Critical vulnerabilities receive highest validation priority' },
      'HIGH': { modifier: 0.95, reasoning: 'High severity vulnerabilities are thoroughly analyzed' },
      'MEDIUM': { modifier: 0.85, reasoning: 'Medium severity requires careful validation' },
      'LOW': { modifier: 0.7, reasoning: 'Low severity vulnerabilities may include false positives' }
    };
    
    return severityConfidence[severity] || { modifier: 0.8, reasoning: 'Unknown severity level' };
  }

  // Analyze source tool confidence
  analyzeSourceConfidence(sourceConfidence) {
    if (sourceConfidence >= 0.9) {
      return { modifier: 1.0, reasoning: 'High source confidence supports validation' };
    } else if (sourceConfidence >= 0.7) {
      return { modifier: 0.9, reasoning: 'Good source confidence with minor uncertainty' };
    } else if (sourceConfidence >= 0.5) {
      return { modifier: 0.8, reasoning: 'Moderate source confidence requires additional validation' };
    } else {
      return { modifier: 0.6, reasoning: 'Low source confidence suggests high false positive risk' };
    }
  }

  // Identify risk factors
  identifyRiskFactors(finding) {
    const riskFactors = [];
    
    if (finding.severity === 'CRITICAL') {
      riskFactors.push('Critical severity requires immediate attention');
    }
    
    if (finding.confidence < 0.7) {
      riskFactors.push('Low source confidence increases false positive risk');
    }
    
    if (finding.type === 'HARDCODED_SECRET') {
      riskFactors.push('Secret detection often includes test data false positives');
    }
    
    if (finding.file && (finding.file.includes('test') || finding.file.includes('demo'))) {
      riskFactors.push('Finding in test/demo code may be intentional');
    }
    
    return riskFactors;
  }

  // Generate recommendations
  generateRecommendation(finding, decision) {
    const recommendations = {
      'valid': [
        `Address ${finding.type} vulnerability in ${finding.file}`,
        `Apply security patch or code fix immediately`,
        `Review similar patterns throughout codebase`,
        `Implement automated detection for this vulnerability type`
      ],
      'uncertain': [
        `Manual review required for ${finding.type} in ${finding.file}`,
        `Validate finding with security expert`,
        `Check for false positive indicators`,
        `Consider additional security testing`
      ],
      'false_positive': [
        `Likely false positive: ${finding.type} in ${finding.file}`,
        `Review detection rules to reduce false positives`,
        `Update security tool configuration`,
        `Document finding as acceptable risk if intentional`
      ]
    };
    
    const options = recommendations[decision] || recommendations['uncertain'];
    return options[Math.floor(Math.random() * options.length)];
  }

  // Generate validation report
  generateValidationReport(validationResults, startTime) {
    const totalTime = Date.now() - startTime;
    
    const summary = {
      total_findings: validationResults.length,
      valid_findings: validationResults.filter(v => v.validation_decision === 'VALID').length,
      false_positives: validationResults.filter(v => v.validation_decision === 'FALSE_POSITIVE').length,
      uncertain_findings: validationResults.filter(v => v.validation_decision === 'UNCERTAIN').length,
      error_findings: validationResults.filter(v => v.validation_decision === 'ERROR').length,
      average_confidence: this.calculateAverageConfidence(validationResults),
      total_processing_time_ms: totalTime
    };
    
    const report = {
      validation_metadata: {
        timestamp: new Date().toISOString(),
        validator_version: '1.0.0',
        confidence_threshold: this.options.confidenceThreshold,
        false_positive_threshold: this.options.falsePositiveThreshold,
        processing_summary: summary
      },
      validation_results: validationResults,
      recommendations: this.generateOverallRecommendations(summary),
      quality_metrics: this.calculateQualityMetrics(validationResults)
    };
    
    return report;
  }

  // Calculate average confidence
  calculateAverageConfidence(validationResults) {
    const validResults = validationResults.filter(v => v.validation_decision !== 'ERROR');
    if (validResults.length === 0) return 0;
    
    const totalConfidence = validResults.reduce((sum, v) => sum + v.validation_confidence, 0);
    return totalConfidence / validResults.length;
  }

  // Generate overall recommendations
  generateOverallRecommendations(summary) {
    const recommendations = [];
    
    if (summary.false_positives > summary.total_findings * 0.3) {
      recommendations.push({
        type: 'configuration',
        priority: 'high',
        message: 'High false positive rate detected - review security tool configuration'
      });
    }
    
    if (summary.uncertain_findings > summary.total_findings * 0.2) {
      recommendations.push({
        type: 'manual_review',
        priority: 'medium',
        message: 'Significant number of uncertain findings require manual security review'
      });
    }
    
    if (summary.valid_findings > 0) {
      recommendations.push({
        type: 'remediation',
        priority: 'high',
        message: `${summary.valid_findings} valid security findings require immediate attention`
      });
    }
    
    if (summary.average_confidence < 0.7) {
      recommendations.push({
        type: 'model_tuning',
        priority: 'medium',
        message: 'Low average confidence suggests need for AI model retraining or tuning'
      });
    }
    
    return recommendations;
  }

  // Calculate quality metrics
  calculateQualityMetrics(validationResults) {
    const processingTimes = validationResults.map(v => v.processing_time_ms);
    
    return {
      average_processing_time_ms: processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length,
      min_processing_time_ms: Math.min(...processingTimes),
      max_processing_time_ms: Math.max(...processingTimes),
      throughput_findings_per_second: validationResults.length / (processingTimes.reduce((sum, time) => sum + time, 0) / 1000),
      error_rate: validationResults.filter(v => v.validation_decision === 'ERROR').length / validationResults.length
    };
  }

  // Update internal metrics
  updateMetrics(validationResults, totalTime) {
    this.modelMetrics.totalValidations += validationResults.length;
    this.modelMetrics.successfulValidations += validationResults.filter(v => v.validation_decision !== 'ERROR').length;
    
    const validConfidences = validationResults
      .filter(v => v.validation_decision !== 'ERROR')
      .map(v => v.validation_confidence);
    
    if (validConfidences.length > 0) {
      const avgConfidence = validConfidences.reduce((sum, conf) => sum + conf, 0) / validConfidences.length;
      this.modelMetrics.averageConfidence = 
        (this.modelMetrics.averageConfidence + avgConfidence) / 2;
    }
    
    this.modelMetrics.processingTime.push(totalTime);
    
    // Keep only last 100 processing times
    if (this.modelMetrics.processingTime.length > 100) {
      this.modelMetrics.processingTime = this.modelMetrics.processingTime.slice(-100);
    }
  }

  // Simulate AI processing delay
  async simulateProcessingDelay() {
    const baseDelay = 50; // 50ms base processing time
    const randomDelay = Math.random() * 100; // 0-100ms random variance
    const totalDelay = baseDelay + randomDelay;
    
    return new Promise(resolve => setTimeout(resolve, totalDelay));
  }

  // Get validator metrics
  getMetrics() {
    return {
      ...this.modelMetrics,
      validation_history_size: this.validationHistory.length,
      average_processing_time_ms: this.modelMetrics.processingTime.length > 0 
        ? this.modelMetrics.processingTime.reduce((sum, time) => sum + time, 0) / this.modelMetrics.processingTime.length
        : 0
    };
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node validate.js <findings-file> <output-file> [options]');
    console.log('Options:');
    console.log('  --confidence-threshold    AI confidence threshold (0-1)');
    console.log('  --false-positive-threshold    False positive threshold (0-1)');
    console.log('  --max-time               Maximum validation time (ms)');
    process.exit(1);
  }
  
  const findingsPath = path.resolve(args[0]);
  const outputPath = path.resolve(args[1]);
  
  // Parse options
  const options = {};
  
  for (let i = 2; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--confidence-threshold':
        options.confidenceThreshold = parseFloat(value);
        break;
      case '--false-positive-threshold':
        options.falsePositiveThreshold = parseFloat(value);
        break;
      case '--max-time':
        options.maxValidationTime = parseInt(value);
        break;
    }
  }
  
  const validator = new AISecurityValidator(options);
  validator.validateFindings(findingsPath, outputPath)
    .then(report => {
      console.log('\n🤖 AI Validation Summary:');
      console.log(`Total Findings: ${report.validation_metadata.processing_summary.total_findings}`);
      console.log(`Valid: ${report.validation_metadata.processing_summary.valid_findings}`);
      console.log(`False Positives: ${report.validation_metadata.processing_summary.false_positives}`);
      console.log(`Uncertain: ${report.validation_metadata.processing_summary.uncertain_findings}`);
      console.log(`Average Confidence: ${(report.validation_metadata.processing_summary.average_confidence * 100).toFixed(1)}%`);
      console.log(`Processing Time: ${report.validation_metadata.processing_summary.total_processing_time_ms}ms`);
      
      process.exit(0);
    })
    .catch(error => {
      console.error('AI validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = AISecurityValidator;
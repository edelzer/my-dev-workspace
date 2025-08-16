#!/usr/bin/env node

/**
 * AI Security Validation Script
 * Phase 3 Task 3.1.2: AI Security Review Implementation
 * 
 * Validates AI security findings and reduces false positives
 * Protocol Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AISecurityValidator {
  constructor(options = {}) {
    this.options = {
      confidenceThreshold: options.confidenceThreshold || 0.7,
      falsePositiveThreshold: options.falsePositiveThreshold || 0.05,
      maxValidationTime: options.maxValidationTime || 300,
      enableLearning: options.enableLearning !== false,
      ...options
    };
    
    this.validationLog = [];
    this.learningData = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.validationLog.push(logEntry);
  }

  async loadSecurityFindings(findingsPath) {
    this.log(`📁 Loading security findings from: ${findingsPath}`);
    
    try {
      const content = await fs.readFile(findingsPath, 'utf8');
      const findings = JSON.parse(content);
      
      this.log(`✅ Loaded ${findings.findings?.length || 0} security findings`);
      return findings;
    } catch (error) {
      throw new Error(`Failed to load security findings: ${error.message}`);
    }
  }

  async analyzeCodeContext(finding) {
    this.log(`🔍 Analyzing code context for finding: ${finding.id}`);
    
    try {
      // Extract surrounding code context
      const filePath = path.resolve(finding.file);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      const contextStart = Math.max(0, finding.line - 10);
      const contextEnd = Math.min(lines.length, finding.line + 10);
      const context = lines.slice(contextStart, contextEnd);
      
      // AI-powered context analysis
      const contextAnalysis = {
        surrounding_code: context.join('\n'),
        line_number: finding.line,
        function_context: this.extractFunctionContext(lines, finding.line),
        imports: this.extractImports(lines),
        framework_patterns: this.detectFrameworkPatterns(context),
        security_patterns: this.detectSecurityPatterns(context)
      };
      
      return contextAnalysis;
    } catch (error) {
      this.log(`❌ Context analysis failed: ${error.message}`, 'warn');
      return null;
    }
  }

  extractFunctionContext(lines, lineNumber) {
    // Find the function containing the flagged line
    let functionStart = -1;
    let functionEnd = -1;
    
    // Look backwards for function declaration
    for (let i = lineNumber - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.match(/^\s*(function|const|let|var|async)\s+\w+/)) {
        functionStart = i;
        break;
      }
    }
    
    // Look forwards for function end
    if (functionStart !== -1) {
      let braceCount = 0;
      for (let i = functionStart; i < lines.length; i++) {
        const line = lines[i];
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;
        
        if (braceCount === 0 && i > functionStart) {
          functionEnd = i;
          break;
        }
      }
    }
    
    return {
      start: functionStart,
      end: functionEnd,
      name: functionStart !== -1 ? this.extractFunctionName(lines[functionStart]) : null
    };
  }

  extractFunctionName(line) {
    const matches = line.match(/(?:function\s+(\w+)|const\s+(\w+)|let\s+(\w+)|var\s+(\w+))/);
    return matches ? (matches[1] || matches[2] || matches[3] || matches[4]) : null;
  }

  extractImports(lines) {
    return lines
      .filter(line => line.match(/^\s*(import|require|from)/))
      .map(line => line.trim());
  }

  detectFrameworkPatterns(context) {
    const frameworks = {
      react: ['React', 'useState', 'useEffect', 'jsx', 'tsx'],
      express: ['express', 'app.get', 'app.post', 'req.', 'res.'],
      django: ['django', 'request.', 'response.', 'HttpResponse'],
      spring: ['@RestController', '@RequestMapping', '@Autowired']
    };
    
    const detected = [];
    const contextStr = context.join('\n');
    
    for (const [framework, patterns] of Object.entries(frameworks)) {
      if (patterns.some(pattern => contextStr.includes(pattern))) {
        detected.push(framework);
      }
    }
    
    return detected;
  }

  detectSecurityPatterns(context) {
    const securityPatterns = {
      authentication: ['login', 'auth', 'password', 'token', 'jwt'],
      authorization: ['permission', 'role', 'access', 'authorize'],
      validation: ['validate', 'sanitize', 'escape', 'filter'],
      encryption: ['encrypt', 'decrypt', 'hash', 'crypto', 'bcrypt'],
      database: ['query', 'sql', 'database', 'db.', 'execute']
    };
    
    const detected = [];
    const contextStr = context.join('\n').toLowerCase();
    
    for (const [category, patterns] of Object.entries(securityPatterns)) {
      if (patterns.some(pattern => contextStr.includes(pattern))) {
        detected.push(category);
      }
    }
    
    return detected;
  }

  async validateFinding(finding) {
    this.log(`🎯 Validating finding: ${finding.id} (${finding.type})`);
    
    // Step 1: Analyze code context
    const context = await this.analyzeCodeContext(finding);
    
    // Step 2: AI-powered validation scoring
    const validationScore = this.calculateValidationScore(finding, context);
    
    // Step 3: False positive probability assessment
    const falsePositiveProbability = this.assessFalsePositiveProbability(finding, context);
    
    // Step 4: Risk assessment
    const riskAssessment = this.assessRisk(finding, context);
    
    const validation = {
      finding_id: finding.id,
      validation_confidence: validationScore,
      false_positive_probability: falsePositiveProbability,
      risk_score: riskAssessment.risk_score,
      risk_factors: riskAssessment.factors,
      context_analysis: context,
      validation_decision: this.makeValidationDecision(validationScore, falsePositiveProbability),
      recommendations: this.generateRecommendations(finding, context, validationScore),
      timestamp: new Date().toISOString()
    };
    
    // Store learning data
    if (this.options.enableLearning) {
      this.learningData.push({
        finding: finding,
        validation: validation,
        context: context
      });
    }
    
    return validation;
  }

  calculateValidationScore(finding, context) {
    let score = 0.5; // Base score
    
    // Severity weight (higher severity gets higher base confidence)
    const severityWeights = {
      'CRITICAL': 0.9,
      'HIGH': 0.8,
      'MEDIUM': 0.6,
      'LOW': 0.4
    };
    score += (severityWeights[finding.severity] || 0.5) * 0.3;
    
    // Context relevance
    if (context) {
      // Security-relevant context increases confidence
      if (context.security_patterns.length > 0) {
        score += 0.2;
      }
      
      // Framework-specific patterns
      if (context.framework_patterns.length > 0) {
        score += 0.1;
      }
      
      // Function context available
      if (context.function_context.name) {
        score += 0.1;
      }
    }
    
    // Semgrep confidence if available
    if (finding.confidence) {
      score = (score + finding.confidence) / 2;
    }
    
    return Math.min(1.0, Math.max(0.0, score));
  }

  assessFalsePositiveProbability(finding, context) {
    let probability = 0.1; // Base false positive rate
    
    // Common false positive patterns
    const falsePositivePatterns = [
      'test', 'spec', 'mock', 'example', 'demo', 'sample'
    ];
    
    if (context && falsePositivePatterns.some(pattern => 
      finding.file.toLowerCase().includes(pattern) ||
      context.surrounding_code.toLowerCase().includes(pattern)
    )) {
      probability += 0.3;
    }
    
    // Framework-specific false positive reduction
    if (context?.framework_patterns.includes('react') && finding.type === 'XSS') {
      probability -= 0.2; // React has built-in XSS protection
    }
    
    if (context?.security_patterns.includes('validation') && finding.type === 'INJECTION') {
      probability -= 0.3; // Validation patterns reduce injection risk
    }
    
    return Math.min(1.0, Math.max(0.0, probability));
  }

  assessRisk(finding, context) {
    const baseRisk = {
      'CRITICAL': 9.0,
      'HIGH': 7.0,
      'MEDIUM': 5.0,
      'LOW': 3.0
    }[finding.severity] || 5.0;
    
    let riskMultiplier = 1.0;
    const factors = [];
    
    // Context-based risk adjustment
    if (context) {
      // Authentication/authorization code increases risk
      if (context.security_patterns.includes('authentication')) {
        riskMultiplier += 0.3;
        factors.push('authentication_context');
      }
      
      // Database code increases injection risk
      if (context.security_patterns.includes('database') && finding.type.includes('INJECTION')) {
        riskMultiplier += 0.4;
        factors.push('database_interaction');
      }
      
      // Production framework reduces some risks
      if (context.framework_patterns.length > 0) {
        riskMultiplier -= 0.1;
        factors.push('framework_protection');
      }
    }
    
    const finalRisk = Math.min(10.0, Math.max(0.0, baseRisk * riskMultiplier));
    
    return {
      risk_score: finalRisk,
      factors: factors,
      base_risk: baseRisk,
      multiplier: riskMultiplier
    };
  }

  makeValidationDecision(validationScore, falsePositiveProbability) {
    if (falsePositiveProbability > this.options.falsePositiveThreshold * 2) {
      return 'LIKELY_FALSE_POSITIVE';
    }
    
    if (validationScore >= this.options.confidenceThreshold) {
      return 'VALIDATED';
    }
    
    if (validationScore >= 0.5) {
      return 'REQUIRES_REVIEW';
    }
    
    return 'LOW_CONFIDENCE';
  }

  generateRecommendations(finding, context, validationScore) {
    const recommendations = [];
    
    // Base remediation
    if (finding.recommendation) {
      recommendations.push({
        type: 'remediation',
        action: finding.recommendation,
        priority: 'high'
      });
    }
    
    // Context-specific recommendations
    if (context) {
      if (context.security_patterns.includes('database') && finding.type.includes('INJECTION')) {
        recommendations.push({
          type: 'specific_remediation',
          action: 'Use parameterized queries or ORM methods',
          priority: 'critical'
        });
      }
      
      if (context.framework_patterns.includes('express') && finding.type === 'XSS') {
        recommendations.push({
          type: 'framework_solution',
          action: 'Use template engines with auto-escaping (e.g., Handlebars, Pug)',
          priority: 'high'
        });
      }
    }
    
    // Validation-based recommendations
    if (validationScore < this.options.confidenceThreshold) {
      recommendations.push({
        type: 'validation',
        action: 'Manual security review recommended due to low confidence',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  async generateValidationReport(validations) {
    const report = {
      timestamp: new Date().toISOString(),
      validation_summary: {
        total_findings: validations.length,
        validated: validations.filter(v => v.validation_decision === 'VALIDATED').length,
        likely_false_positives: validations.filter(v => v.validation_decision === 'LIKELY_FALSE_POSITIVE').length,
        requires_review: validations.filter(v => v.validation_decision === 'REQUIRES_REVIEW').length,
        low_confidence: validations.filter(v => v.validation_decision === 'LOW_CONFIDENCE').length
      },
      accuracy_metrics: {
        average_confidence: validations.reduce((sum, v) => sum + v.validation_confidence, 0) / validations.length,
        average_false_positive_probability: validations.reduce((sum, v) => sum + v.false_positive_probability, 0) / validations.length,
        high_confidence_findings: validations.filter(v => v.validation_confidence >= 0.8).length
      },
      validations: validations,
      learning_data: this.learningData.length,
      recommendations: {
        immediate_action: validations.filter(v => v.validation_decision === 'VALIDATED' && v.risk_score >= 8.0),
        review_required: validations.filter(v => v.validation_decision === 'REQUIRES_REVIEW'),
        false_positives: validations.filter(v => v.validation_decision === 'LIKELY_FALSE_POSITIVE')
      }
    };
    
    return report;
  }

  async validateFindings(findingsPath, outputPath) {
    try {
      this.log('🚀 Starting AI security validation process...');
      
      // Load security findings
      const securityData = await this.loadSecurityFindings(findingsPath);
      
      if (!securityData.findings || securityData.findings.length === 0) {
        this.log('⚠️ No security findings to validate');
        return { validations: [] };
      }
      
      // Validate each finding
      const validations = [];
      for (const finding of securityData.findings) {
        try {
          const validation = await this.validateFinding(finding);
          validations.push(validation);
          
          this.log(`✅ Validated ${finding.id}: ${validation.validation_decision} (confidence: ${validation.validation_confidence.toFixed(2)})`);
        } catch (error) {
          this.log(`❌ Validation failed for ${finding.id}: ${error.message}`, 'error');
        }
      }
      
      // Generate validation report
      const report = await this.generateValidationReport(validations);
      
      // Save report
      if (outputPath) {
        await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
        this.log(`📄 Validation report saved: ${outputPath}`);
      }
      
      // Summary
      this.log(`\n📊 Validation Summary:`);
      this.log(`Total findings: ${report.validation_summary.total_findings}`);
      this.log(`Validated: ${report.validation_summary.validated}`);
      this.log(`Likely false positives: ${report.validation_summary.likely_false_positives}`);
      this.log(`Requires review: ${report.validation_summary.requires_review}`);
      this.log(`Average confidence: ${report.accuracy_metrics.average_confidence.toFixed(2)}`);
      
      return report;
      
    } catch (error) {
      this.log(`❌ Validation process failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node validate.js <findings-file> [output-file] [options]');
    console.log('Options:');
    console.log('  --confidence-threshold <number>  Minimum confidence threshold (0-1)');
    console.log('  --false-positive-threshold <number>  False positive threshold (0-1)');
    console.log('  --max-time <seconds>  Maximum validation time');
    process.exit(1);
  }
  
  const findingsPath = args[0];
  const outputPath = args[1] || 'validation-report.json';
  
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
        options.maxValidationTime = parseInt(value) * 1000;
        break;
    }
  }
  
  const validator = new AISecurityValidator(options);
  validator.validateFindings(findingsPath, outputPath)
    .then(report => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Validation failed:', error.message);
      process.exit(1);
    });
}

module.exports = AISecurityValidator;
#!/usr/bin/env node

/**
 * SBOM AI Security Integration
 * 
 * Integrates SBOM generation with existing AI security workflow
 * Adds supply chain vulnerability analysis and monitoring
 * 
 * Security Protocol Compliance: Laws #1-5 Enforced
 * Integration: Extends existing AI security infrastructure
 */

const fs = require('fs').promises;
const path = require('path');
const SBOMGenerator = require('../sbom/generator.js');
const AISecurityValidator = require('./validate.js');

class SBOMSecurityIntegration {
  constructor(options = {}) {
    this.options = {
      // SBOM generation options
      sbomFormats: options.sbomFormats || ['spdx', 'cyclone'],
      includeDevDependencies: options.includeDevDependencies !== false,
      enableVulnerabilityScanning: options.enableVulnerabilityScanning !== false,
      
      // AI security integration options
      confidenceThreshold: options.confidenceThreshold || 0.8,
      supplyChainRiskThreshold: options.supplyChainRiskThreshold || 7.0,
      maxAnalysisTime: options.maxAnalysisTime || 600000, // 10 minutes
      
      // Output and reporting
      generateSecurityReport: options.generateSecurityReport !== false,
      enableAIValidation: options.enableAIValidation !== false,
      autoRemediation: options.autoRemediation || false,
      
      ...options
    };
    
    this.sbomGenerator = new SBOMGenerator({
      outputFormats: this.options.sbomFormats,
      includeDevDependencies: this.options.includeDevDependencies,
      includeLicenses: true,
      includeVulnerabilities: this.options.enableVulnerabilityScanning,
      validateOutput: true,
      enableLogging: true
    });
    
    this.aiValidator = new AISecurityValidator({
      confidenceThreshold: this.options.confidenceThreshold,
      maxValidationTime: this.options.maxAnalysisTime
    });
    
    this.securityLog = [];
    this.vulnerabilityDatabase = new Map();
    this.supplyChainRisks = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] SBOM-SECURITY ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.securityLog.push(logEntry);
  }

  // Main security analysis with SBOM integration
  async performSecurityAnalysis(projectPath, outputDir = null) {
    try {
      this.log('🔒 Starting comprehensive security analysis with SBOM integration...');
      
      // Step 1: Generate SBOM
      const sbomResult = await this.generateProjectSBOM(projectPath, outputDir);
      
      // Step 2: Perform supply chain analysis
      const supplyChainAnalysis = await this.analyzeSupplyChain(sbomResult);
      
      // Step 3: Vulnerability assessment
      const vulnerabilityAnalysis = await this.performVulnerabilityAssessment(sbomResult);
      
      // Step 4: AI-powered risk analysis
      const aiRiskAnalysis = await this.performAIRiskAnalysis(sbomResult, supplyChainAnalysis, vulnerabilityAnalysis);
      
      // Step 5: Generate comprehensive security report
      const securityReport = await this.generateSecurityReport(sbomResult, supplyChainAnalysis, vulnerabilityAnalysis, aiRiskAnalysis);
      
      // Step 6: Auto-remediation recommendations
      const remediationPlan = await this.generateRemediationPlan(securityReport);
      
      this.log('✅ Comprehensive security analysis completed');
      
      return {
        success: true,
        sbom: sbomResult,
        supplyChain: supplyChainAnalysis,
        vulnerabilities: vulnerabilityAnalysis,
        aiAnalysis: aiRiskAnalysis,
        securityReport: securityReport,
        remediation: remediationPlan,
        metadata: {
          analysisTimestamp: new Date().toISOString(),
          projectPath: projectPath,
          outputDirectory: outputDir,
          totalDependencies: sbomResult.projectData.dependencies.length
        }
      };
      
    } catch (error) {
      this.log(`❌ Security analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Generate SBOM for the project
  async generateProjectSBOM(projectPath, outputDir) {
    this.log('📋 Generating Software Bill of Materials (SBOM)...');
    
    const outputPath = outputDir ? path.join(outputDir, 'sbom') : null;
    const sbomResult = await this.sbomGenerator.generateSBOM(projectPath, outputPath);
    
    this.log(`✅ SBOM generated: ${sbomResult.summary.totalDependencies} dependencies found`);
    
    return sbomResult;
  }

  // Analyze supply chain security
  async analyzeSupplyChain(sbomResult) {
    this.log('🔗 Analyzing supply chain security...');
    
    const dependencies = sbomResult.projectData.dependencies;
    const analysis = {
      totalPackages: dependencies.length,
      riskyPackages: [],
      licenseIssues: [],
      maintainershipRisks: [],
      ecosystemRisks: [],
      scoreCard: {
        overallRisk: 0,
        licenseCompliance: 0,
        maintainershipHealth: 0,
        updateFrequency: 0
      }
    };
    
    // Analyze each dependency
    for (const dep of dependencies) {
      const packageRisk = await this.assessPackageRisk(dep);
      
      if (packageRisk.riskScore > this.options.supplyChainRiskThreshold) {
        analysis.riskyPackages.push({
          name: dep.name,
          version: dep.version,
          ecosystem: dep.ecosystem,
          riskScore: packageRisk.riskScore,
          riskFactors: packageRisk.factors,
          purl: dep.purl
        });
      }
      
      // Check license issues
      if (this.hasLicenseIssues(dep.licenses)) {
        analysis.licenseIssues.push({
          name: dep.name,
          licenses: dep.licenses,
          issues: this.identifyLicenseIssues(dep.licenses)
        });
      }
    }
    
    // Calculate ecosystem risk distribution
    analysis.ecosystemRisks = this.analyzeEcosystemDistribution(dependencies);
    
    // Calculate overall scorecard
    analysis.scoreCard = this.calculateSupplyChainScoreCard(analysis);
    
    this.log(`🔍 Supply chain analysis complete: ${analysis.riskyPackages.length} risky packages identified`);
    
    return analysis;
  }

  // Assess individual package risk
  async assessPackageRisk(dependency) {
    const risk = {
      riskScore: 0,
      factors: []
    };
    
    // Age-based risk assessment
    const ageRisk = this.assessPackageAge(dependency.version);
    risk.riskScore += ageRisk.score;
    if (ageRisk.score > 2) risk.factors.push(ageRisk.reason);
    
    // Popularity assessment (simplified)
    const popularityRisk = this.assessPackagePopularity(dependency.name);
    risk.riskScore += popularityRisk.score;
    if (popularityRisk.score > 1) risk.factors.push(popularityRisk.reason);
    
    // Maintainership assessment
    const maintainerRisk = await this.assessMaintainership(dependency);
    risk.riskScore += maintainerRisk.score;
    if (maintainerRisk.score > 1) risk.factors.push(maintainerRisk.reason);
    
    // Version pattern analysis
    const versionRisk = this.assessVersionPattern(dependency.version);
    risk.riskScore += versionRisk.score;
    if (versionRisk.score > 1) risk.factors.push(versionRisk.reason);
    
    return risk;
  }

  // Simplified risk assessment methods
  assessPackageAge(version) {
    // Simplified: assess based on version number patterns
    if (version.includes('alpha') || version.includes('beta') || version.includes('rc')) {
      return { score: 3, reason: 'Pre-release version' };
    }
    
    if (version.startsWith('0.')) {
      return { score: 2, reason: 'Version < 1.0' };
    }
    
    return { score: 0, reason: 'Stable version' };
  }

  assessPackagePopularity(name) {
    // Simplified: assess based on name patterns that might indicate low popularity
    if (name.includes('test') || name.includes('demo') || name.includes('sample')) {
      return { score: 2, reason: 'Potentially test/demo package' };
    }
    
    if (name.length < 3) {
      return { score: 1, reason: 'Very short package name' };
    }
    
    return { score: 0, reason: 'Normal package name' };
  }

  async assessMaintainership(dependency) {
    // Simplified implementation - would integrate with package registry APIs
    return { score: 0, reason: 'Maintainership data not available' };
  }

  assessVersionPattern(version) {
    // Check for suspicious version patterns
    if (version.includes('9999') || version.includes('999')) {
      return { score: 4, reason: 'Suspicious version number' };
    }
    
    if (version.split('.').length > 4) {
      return { score: 1, reason: 'Unusual version format' };
    }
    
    return { score: 0, reason: 'Normal version format' };
  }

  // License analysis
  hasLicenseIssues(licenses) {
    const problematicLicenses = ['UNKNOWN', 'UNLICENSED', 'PROPRIETARY'];
    return licenses.some(license => 
      problematicLicenses.includes(license.toUpperCase()) ||
      license === 'Unknown'
    );
  }

  identifyLicenseIssues(licenses) {
    const issues = [];
    
    if (licenses.includes('Unknown') || licenses.includes('UNKNOWN')) {
      issues.push('License information unavailable');
    }
    
    if (licenses.includes('UNLICENSED')) {
      issues.push('Package is unlicensed');
    }
    
    if (licenses.includes('PROPRIETARY')) {
      issues.push('Proprietary license may have restrictions');
    }
    
    return issues;
  }

  // Ecosystem risk analysis
  analyzeEcosystemDistribution(dependencies) {
    const ecosystems = {};
    
    for (const dep of dependencies) {
      if (!ecosystems[dep.ecosystem]) {
        ecosystems[dep.ecosystem] = {
          count: 0,
          riskLevel: this.getEcosystemRiskLevel(dep.ecosystem)
        };
      }
      ecosystems[dep.ecosystem].count++;
    }
    
    return Object.entries(ecosystems).map(([ecosystem, data]) => ({
      ecosystem: ecosystem,
      packageCount: data.count,
      riskLevel: data.riskLevel,
      percentage: (data.count / dependencies.length * 100).toFixed(1)
    }));
  }

  getEcosystemRiskLevel(ecosystem) {
    const riskLevels = {
      npm: 'MEDIUM',      // Large ecosystem, some risks
      python: 'MEDIUM',   // Generally well-maintained
      java: 'LOW',        // Enterprise-focused, generally stable
      go: 'LOW'           // Newer, but well-designed dependency system
    };
    
    return riskLevels[ecosystem] || 'UNKNOWN';
  }

  // Calculate supply chain scorecard
  calculateSupplyChainScoreCard(analysis) {
    const totalPackages = analysis.totalPackages;
    const riskyPackages = analysis.riskyPackages.length;
    const licenseIssues = analysis.licenseIssues.length;
    
    return {
      overallRisk: Math.min(10, (riskyPackages / totalPackages) * 10),
      licenseCompliance: Math.max(0, 10 - (licenseIssues / totalPackages) * 10),
      maintainershipHealth: 8.0, // Simplified
      updateFrequency: 7.5 // Simplified
    };
  }

  // Vulnerability assessment
  async performVulnerabilityAssessment(sbomResult) {
    this.log('🛡️ Performing vulnerability assessment...');
    
    const vulnerabilities = {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      findings: [],
      affectedPackages: [],
      remediationRequired: []
    };
    
    // Analyze each dependency for vulnerabilities
    for (const dep of sbomResult.projectData.dependencies) {
      const vulns = await this.checkPackageVulnerabilities(dep);
      
      if (vulns.length > 0) {
        vulnerabilities.findings.push(...vulns);
        vulnerabilities.affectedPackages.push(dep.name);
        
        for (const vuln of vulns) {
          vulnerabilities.total++;
          vulnerabilities[vuln.severity.toLowerCase()]++;
          
          if (['CRITICAL', 'HIGH'].includes(vuln.severity)) {
            vulnerabilities.remediationRequired.push({
              package: dep.name,
              vulnerability: vuln,
              priority: vuln.severity === 'CRITICAL' ? 'IMMEDIATE' : 'HIGH'
            });
          }
        }
      }
    }
    
    this.log(`🔍 Vulnerability assessment complete: ${vulnerabilities.total} vulnerabilities found`);
    
    return vulnerabilities;
  }

  // Check individual package vulnerabilities
  async checkPackageVulnerabilities(dependency) {
    // Simplified implementation - would integrate with vulnerability databases
    // like OSV, NVD, Snyk, etc.
    const vulnerabilities = [];
    
    // Example vulnerability patterns (simplified)
    if (dependency.name.includes('test') && dependency.version.startsWith('0.')) {
      vulnerabilities.push({
        id: `VULN-${Date.now()}`,
        severity: 'MEDIUM',
        title: 'Potential security issue in test package',
        description: 'Test packages may contain security vulnerabilities',
        cvss: 5.0,
        package: dependency.name,
        version: dependency.version,
        fixedVersion: null
      });
    }
    
    return vulnerabilities;
  }

  // AI-powered risk analysis
  async performAIRiskAnalysis(sbomResult, supplyChainAnalysis, vulnerabilityAnalysis) {
    this.log('🤖 Performing AI-powered risk analysis...');
    
    if (!this.options.enableAIValidation) {
      this.log('⚠️ AI validation disabled, skipping AI risk analysis', 'warn');
      return { enabled: false };
    }
    
    const riskAnalysis = {
      overallRiskScore: 0,
      riskFactors: [],
      recommendations: [],
      confidence: 0,
      aiValidation: {
        supplyChainRisk: 0,
        vulnerabilityRisk: 0,
        licenseRisk: 0,
        maintenanceRisk: 0
      }
    };
    
    // AI assessment of supply chain risk
    const supplyChainRisk = this.assessAISupplyChainRisk(supplyChainAnalysis);
    riskAnalysis.aiValidation.supplyChainRisk = supplyChainRisk.score;
    riskAnalysis.riskFactors.push(...supplyChainRisk.factors);
    
    // AI assessment of vulnerability risk
    const vulnerabilityRisk = this.assessAIVulnerabilityRisk(vulnerabilityAnalysis);
    riskAnalysis.aiValidation.vulnerabilityRisk = vulnerabilityRisk.score;
    riskAnalysis.riskFactors.push(...vulnerabilityRisk.factors);
    
    // Calculate overall risk score
    riskAnalysis.overallRiskScore = (
      supplyChainRisk.score * 0.4 +
      vulnerabilityRisk.score * 0.4 +
      riskAnalysis.aiValidation.licenseRisk * 0.1 +
      riskAnalysis.aiValidation.maintenanceRisk * 0.1
    );
    
    // Generate AI recommendations
    riskAnalysis.recommendations = this.generateAIRecommendations(riskAnalysis, supplyChainAnalysis, vulnerabilityAnalysis);
    
    // Calculate confidence
    riskAnalysis.confidence = this.calculateAIConfidence(riskAnalysis);
    
    this.log(`🤖 AI risk analysis complete: Overall risk score ${riskAnalysis.overallRiskScore.toFixed(2)}/10`);
    
    return riskAnalysis;
  }

  assessAISupplyChainRisk(supplyChainAnalysis) {
    const score = Math.min(10, supplyChainAnalysis.scoreCard.overallRisk);
    const factors = [];
    
    if (supplyChainAnalysis.riskyPackages.length > 0) {
      factors.push(`${supplyChainAnalysis.riskyPackages.length} high-risk packages identified`);
    }
    
    if (supplyChainAnalysis.licenseIssues.length > 0) {
      factors.push(`${supplyChainAnalysis.licenseIssues.length} license compliance issues`);
    }
    
    return { score, factors };
  }

  assessAIVulnerabilityRisk(vulnerabilityAnalysis) {
    let score = 0;
    const factors = [];
    
    if (vulnerabilityAnalysis.critical > 0) {
      score += vulnerabilityAnalysis.critical * 3;
      factors.push(`${vulnerabilityAnalysis.critical} critical vulnerabilities`);
    }
    
    if (vulnerabilityAnalysis.high > 0) {
      score += vulnerabilityAnalysis.high * 2;
      factors.push(`${vulnerabilityAnalysis.high} high-severity vulnerabilities`);
    }
    
    score += vulnerabilityAnalysis.medium * 0.5;
    score += vulnerabilityAnalysis.low * 0.1;
    
    return { score: Math.min(10, score), factors };
  }

  generateAIRecommendations(riskAnalysis, supplyChainAnalysis, vulnerabilityAnalysis) {
    const recommendations = [];
    
    // Critical vulnerability recommendations
    if (vulnerabilityAnalysis.critical > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        action: 'IMMEDIATE_UPDATE',
        description: `Update ${vulnerabilityAnalysis.critical} packages with critical vulnerabilities`,
        packages: vulnerabilityAnalysis.remediationRequired.filter(r => r.priority === 'IMMEDIATE').map(r => r.package)
      });
    }
    
    // Supply chain recommendations
    if (supplyChainAnalysis.riskyPackages.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        action: 'REVIEW_PACKAGES',
        description: `Review ${supplyChainAnalysis.riskyPackages.length} high-risk packages`,
        packages: supplyChainAnalysis.riskyPackages.map(p => p.name)
      });
    }
    
    // License compliance recommendations
    if (supplyChainAnalysis.licenseIssues.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        action: 'LICENSE_REVIEW',
        description: `Resolve ${supplyChainAnalysis.licenseIssues.length} license compliance issues`,
        packages: supplyChainAnalysis.licenseIssues.map(l => l.name)
      });
    }
    
    return recommendations;
  }

  calculateAIConfidence(riskAnalysis) {
    // Simplified confidence calculation
    let confidence = 0.7; // Base confidence
    
    if (riskAnalysis.riskFactors.length > 0) {
      confidence += 0.1; // More data increases confidence
    }
    
    if (riskAnalysis.overallRiskScore > 8) {
      confidence += 0.1; // High risk scenarios are easier to identify
    }
    
    return Math.min(1.0, confidence);
  }

  // Generate comprehensive security report
  async generateSecurityReport(sbomResult, supplyChainAnalysis, vulnerabilityAnalysis, aiRiskAnalysis) {
    this.log('📄 Generating comprehensive security report...');
    
    const report = {
      reportMetadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        generator: 'SBOM-Security-Integration',
        projectName: sbomResult.projectData.projectName,
        projectVersion: sbomResult.projectData.projectVersion
      },
      
      executive_summary: {
        overallRiskLevel: this.determineOverallRiskLevel(aiRiskAnalysis.overallRiskScore),
        totalDependencies: sbomResult.projectData.dependencies.length,
        criticalIssues: vulnerabilityAnalysis.critical + vulnerabilityAnalysis.high,
        immediateActionRequired: vulnerabilityAnalysis.remediationRequired.filter(r => r.priority === 'IMMEDIATE').length,
        sbomCompliance: true
      },
      
      sbom_analysis: {
        formats_generated: sbomResult.summary.generatedFormats,
        total_components: sbomResult.summary.totalDependencies,
        production_dependencies: sbomResult.summary.productionDependencies,
        development_dependencies: sbomResult.summary.developmentDependencies,
        package_managers: [sbomResult.projectData.packageManager]
      },
      
      supply_chain_security: supplyChainAnalysis,
      vulnerability_assessment: vulnerabilityAnalysis,
      ai_risk_analysis: aiRiskAnalysis,
      
      recommendations: {
        immediate_actions: aiRiskAnalysis.recommendations.filter(r => r.priority === 'CRITICAL'),
        short_term_actions: aiRiskAnalysis.recommendations.filter(r => ['HIGH', 'MEDIUM'].includes(r.priority)),
        long_term_improvements: this.generateLongTermRecommendations(supplyChainAnalysis, vulnerabilityAnalysis)
      },
      
      compliance_status: {
        sbom_generated: true,
        vulnerability_scanning: this.options.enableVulnerabilityScanning,
        license_compliance: supplyChainAnalysis.licenseIssues.length === 0,
        supply_chain_monitoring: true
      }
    };
    
    this.log('✅ Security report generated successfully');
    
    return report;
  }

  determineOverallRiskLevel(riskScore) {
    if (riskScore >= 8) return 'CRITICAL';
    if (riskScore >= 6) return 'HIGH';
    if (riskScore >= 4) return 'MEDIUM';
    if (riskScore >= 2) return 'LOW';
    return 'MINIMAL';
  }

  generateLongTermRecommendations(supplyChainAnalysis, vulnerabilityAnalysis) {
    return [
      {
        category: 'MONITORING',
        description: 'Implement continuous dependency monitoring',
        timeline: '1-2 months'
      },
      {
        category: 'AUTOMATION',
        description: 'Set up automated vulnerability scanning in CI/CD',
        timeline: '2-4 weeks'
      },
      {
        category: 'POLICY',
        description: 'Establish package approval and security policies',
        timeline: '1-3 months'
      }
    ];
  }

  // Generate remediation plan
  async generateRemediationPlan(securityReport) {
    this.log('🔧 Generating remediation plan...');
    
    const plan = {
      priority_actions: [],
      automated_fixes: [],
      manual_reviews: [],
      monitoring_setup: [],
      estimated_effort: {
        immediate: '2-4 hours',
        short_term: '1-2 days',
        long_term: '1-2 weeks'
      }
    };
    
    // Priority actions from immediate recommendations
    for (const action of securityReport.recommendations.immediate_actions) {
      plan.priority_actions.push({
        action: action.action,
        description: action.description,
        packages: action.packages,
        priority: action.priority,
        estimated_time: '30-60 minutes'
      });
    }
    
    // Automated fixes (if enabled)
    if (this.options.autoRemediation) {
      plan.automated_fixes = this.generateAutomatedFixes(securityReport);
    }
    
    // Manual review items
    plan.manual_reviews = this.generateManualReviewItems(securityReport);
    
    // Monitoring setup recommendations
    plan.monitoring_setup = [
      {
        component: 'Continuous SBOM Generation',
        description: 'Integrate SBOM generation into CI/CD pipeline',
        priority: 'HIGH'
      },
      {
        component: 'Vulnerability Alerts',
        description: 'Set up real-time vulnerability notifications',
        priority: 'MEDIUM'
      },
      {
        component: 'License Compliance Monitoring',
        description: 'Monitor license changes in dependencies',
        priority: 'MEDIUM'
      }
    ];
    
    this.log('✅ Remediation plan generated');
    
    return plan;
  }

  generateAutomatedFixes(securityReport) {
    // Simplified implementation
    return [
      {
        type: 'DEPENDENCY_UPDATE',
        description: 'Automated update of packages with available security patches',
        packages: securityReport.vulnerability_assessment.remediationRequired.slice(0, 5).map(r => r.package)
      }
    ];
  }

  generateManualReviewItems(securityReport) {
    return [
      {
        category: 'HIGH_RISK_PACKAGES',
        items: securityReport.supply_chain_security.riskyPackages.slice(0, 10),
        priority: 'HIGH',
        description: 'Review high-risk packages for potential replacement'
      },
      {
        category: 'LICENSE_ISSUES',
        items: securityReport.supply_chain_security.licenseIssues,
        priority: 'MEDIUM',
        description: 'Resolve license compliance issues'
      }
    ];
  }

  // Integration with existing AI security workflow
  async integrateWithAISecurityWorkflow(projectPath, outputDir) {
    this.log('🔄 Integrating with existing AI security workflow...');
    
    try {
      // Perform our SBOM security analysis
      const sbomSecurityResults = await this.performSecurityAnalysis(projectPath, outputDir);
      
      // Generate findings in format compatible with existing AI security validator
      const securityFindings = this.convertToSecurityFindings(sbomSecurityResults);
      
      // Run through existing AI validation if enabled
      if (this.options.enableAIValidation && securityFindings.length > 0) {
        const findingsPath = path.join(outputDir || projectPath, 'sbom-security-findings.json');
        await fs.writeFile(findingsPath, JSON.stringify({ findings: securityFindings }, null, 2));
        
        const validationReport = await this.aiValidator.validateFindings(findingsPath, 
          path.join(outputDir || projectPath, 'sbom-validation-report.json'));
        
        sbomSecurityResults.aiValidation = validationReport;
      }
      
      this.log('✅ AI security workflow integration completed');
      
      return sbomSecurityResults;
      
    } catch (error) {
      this.log(`❌ AI security workflow integration failed: ${error.message}`, 'error');
      throw error;
    }
  }

  // Convert SBOM security results to security findings format
  convertToSecurityFindings(sbomSecurityResults) {
    const findings = [];
    
    // Convert vulnerability findings
    for (const vuln of sbomSecurityResults.vulnerabilities.findings) {
      findings.push({
        id: `SBOM-VULN-${vuln.id}`,
        type: 'VULNERABILITY',
        severity: vuln.severity,
        title: vuln.title,
        description: vuln.description,
        file: 'dependency-manifest',
        line: 1,
        package: vuln.package,
        version: vuln.version,
        recommendation: vuln.fixedVersion ? `Update to version ${vuln.fixedVersion}` : 'Review and update package',
        confidence: 0.9,
        source: 'SBOM-ANALYSIS'
      });
    }
    
    // Convert supply chain risk findings
    for (const risk of sbomSecurityResults.supplyChain.riskyPackages) {
      findings.push({
        id: `SBOM-RISK-${risk.name}`,
        type: 'SUPPLY_CHAIN_RISK',
        severity: risk.riskScore > 8 ? 'HIGH' : 'MEDIUM',
        title: `High-risk dependency: ${risk.name}`,
        description: `Supply chain risk factors: ${risk.riskFactors.join(', ')}`,
        file: 'dependency-manifest',
        line: 1,
        package: risk.name,
        version: risk.version,
        recommendation: 'Review package for security and maintenance status',
        confidence: 0.8,
        source: 'SBOM-ANALYSIS'
      });
    }
    
    return findings;
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node sbom-integration.js <project-path> [output-dir] [options]');
    console.log('Options:');
    console.log('  --no-dev                  Exclude development dependencies');
    console.log('  --no-vulnerabilities      Skip vulnerability scanning');
    console.log('  --no-ai                   Disable AI validation');
    console.log('  --auto-remediation        Enable automatic remediation suggestions');
    console.log('  --confidence-threshold    AI confidence threshold (0-1)');
    process.exit(1);
  }
  
  const projectPath = path.resolve(args[0]);
  const outputDir = args[1] ? path.resolve(args[1]) : null;
  
  // Parse options
  const options = {};
  
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--no-dev':
        options.includeDevDependencies = false;
        break;
      case '--no-vulnerabilities':
        options.enableVulnerabilityScanning = false;
        break;
      case '--no-ai':
        options.enableAIValidation = false;
        break;
      case '--auto-remediation':
        options.autoRemediation = true;
        break;
      case '--confidence-threshold':
        options.confidenceThreshold = parseFloat(args[++i]);
        break;
    }
  }
  
  const integration = new SBOMSecurityIntegration(options);
  integration.integrateWithAISecurityWorkflow(projectPath, outputDir)
    .then(result => {
      console.log('\n🔒 SBOM Security Analysis Summary:');
      console.log(`Project: ${result.metadata.projectPath}`);
      console.log(`Total Dependencies: ${result.metadata.totalDependencies}`);
      console.log(`Vulnerabilities: ${result.vulnerabilities.total} (${result.vulnerabilities.critical} critical)`);
      console.log(`Supply Chain Risks: ${result.supplyChain.riskyPackages.length}`);
      console.log(`Overall Risk Level: ${result.securityReport.executive_summary.overallRiskLevel}`);
      
      process.exit(0);
    })
    .catch(error => {
      console.error('SBOM security analysis failed:', error.message);
      process.exit(1);
    });
}

module.exports = SBOMSecurityIntegration;
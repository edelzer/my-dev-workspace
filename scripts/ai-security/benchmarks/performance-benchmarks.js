#!/usr/bin/env node

/**
 * AI Security Performance Benchmarks
 * Phase 3 Task 3.1.3: Security AI Validation and Tuning
 * 
 * Comprehensive performance benchmarks for various codebase sizes
 * Protocol Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { performance } = require('perf_hooks');
const AISecurityValidator = require('../validate.js');

class PerformanceBenchmarks {
  constructor(options = {}) {
    this.options = {
      enableMemoryProfiling: options.enableMemoryProfiling !== false,
      enableCpuProfiling: options.enableCpuProfiling !== false,
      iterations: options.iterations || 3,
      warmupRuns: options.warmupRuns || 1,
      outputDir: options.outputDir || path.join(__dirname, 'results'),
      ...options
    };
    
    this.benchmarkResults = [];
    this.systemInfo = this.getSystemInfo();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      node_version: process.version,
      cpu_count: os.cpus().length,
      total_memory: os.totalmem(),
      free_memory: os.freemem(),
      cpu_model: os.cpus()[0].model,
      timestamp: new Date().toISOString()
    };
  }

  // Define benchmark scenarios
  getBenchmarkScenarios() {
    return [
      {
        name: 'micro_project',
        description: 'Small project - 5-10 files, <1K LOC',
        parameters: {
          file_count: 5,
          avg_lines_per_file: 50,
          vulnerability_density: 0.1, // vulnerabilities per 100 lines
          complexity_factor: 1.0
        }
      },
      {
        name: 'small_project',
        description: 'Small project - 10-50 files, 1-5K LOC',
        parameters: {
          file_count: 25,
          avg_lines_per_file: 100,
          vulnerability_density: 0.15,
          complexity_factor: 1.2
        }
      },
      {
        name: 'medium_project',
        description: 'Medium project - 50-200 files, 5-20K LOC',
        parameters: {
          file_count: 100,
          avg_lines_per_file: 150,
          vulnerability_density: 0.2,
          complexity_factor: 1.5
        }
      },
      {
        name: 'large_project',
        description: 'Large project - 200-500 files, 20-50K LOC',
        parameters: {
          file_count: 300,
          avg_lines_per_file: 200,
          vulnerability_density: 0.25,
          complexity_factor: 2.0
        }
      },
      {
        name: 'enterprise_project',
        description: 'Enterprise project - 500-1000 files, 50-100K LOC',
        parameters: {
          file_count: 750,
          avg_lines_per_file: 300,
          vulnerability_density: 0.3,
          complexity_factor: 2.5
        }
      },
      {
        name: 'monolith_project',
        description: 'Monolithic project - 1000+ files, 100K+ LOC',
        parameters: {
          file_count: 1500,
          avg_lines_per_file: 400,
          vulnerability_density: 0.35,
          complexity_factor: 3.0
        }
      }
    ];
  }

  // Generate synthetic codebase for benchmarking
  async generateSyntheticCodebase(scenario) {
    this.log(`📁 Generating synthetic codebase for ${scenario.name}...`);
    
    const codebase = {
      scenario: scenario.name,
      files: [],
      total_lines: 0,
      total_vulnerabilities: 0,
      generation_time: null
    };
    
    const startTime = performance.now();
    
    for (let i = 0; i < scenario.parameters.file_count; i++) {
      const fileData = this.generateSyntheticFile(
        i,
        scenario.parameters.avg_lines_per_file,
        scenario.parameters.vulnerability_density,
        scenario.parameters.complexity_factor
      );
      
      codebase.files.push(fileData);
      codebase.total_lines += fileData.line_count;
      codebase.total_vulnerabilities += fileData.vulnerabilities.length;
    }
    
    codebase.generation_time = performance.now() - startTime;
    
    this.log(`✅ Generated ${codebase.files.length} files, ${codebase.total_lines} LOC, ${codebase.total_vulnerabilities} vulnerabilities`);
    return codebase;
  }

  generateSyntheticFile(index, avgLines, vulnDensity, complexityFactor) {
    const filename = `synthetic-file-${index}.js`;
    const lineCount = Math.floor(avgLines * (0.5 + Math.random())); // ±50% variation
    
    // Generate code patterns based on complexity factor
    const patterns = this.getCodePatterns(complexityFactor);
    let code = '';
    
    // Generate code content
    for (let line = 0; line < lineCount; line++) {
      const pattern = patterns[Math.floor(Math.random() * patterns.length)];
      code += pattern + '\n';
    }
    
    // Inject vulnerabilities based on density
    const vulnerabilities = this.injectVulnerabilities(code, vulnDensity, lineCount);
    
    return {
      filename,
      code,
      line_count: lineCount,
      vulnerabilities,
      complexity_score: this.calculateComplexityScore(code, complexityFactor)
    };
  }

  getCodePatterns(complexityFactor) {
    const basicPatterns = [
      'function processData(input) {',
      '  return input.toString();',
      '}',
      'const config = { api: "localhost" };',
      'if (user.isValid()) {',
      '  console.log("Valid user");',
      '}',
      'const result = database.query(sql);'
    ];
    
    const complexPatterns = [
      'class DataProcessor extends BaseProcessor {',
      '  async processWithValidation(data) {',
      '    const validated = await this.validate(data);',
      '    return this.transform(validated);',
      '  }',
      '}',
      'const middleware = (req, res, next) => {',
      '  if (req.user) next();',
      '  else res.status(401).send("Unauthorized");',
      '};',
      'try { const result = JSON.parse(input); } catch (e) { throw e; }'
    ];
    
    if (complexityFactor > 2.0) {
      return [...basicPatterns, ...complexPatterns];
    } else if (complexityFactor > 1.5) {
      return [...basicPatterns, ...complexPatterns.slice(0, 3)];
    } else {
      return basicPatterns;
    }
  }

  injectVulnerabilities(code, density, lineCount) {
    const vulnerabilities = [];
    const vulnerabilityTypes = [
      'SQL_INJECTION',
      'XSS',
      'COMMAND_INJECTION',
      'PATH_TRAVERSAL',
      'HARDCODED_SECRET',
      'WEAK_CRYPTO'
    ];
    
    const targetVulnCount = Math.ceil(lineCount * density / 100);
    
    for (let i = 0; i < targetVulnCount; i++) {
      const vulnType = vulnerabilityTypes[Math.floor(Math.random() * vulnerabilityTypes.length)];
      const line = Math.floor(Math.random() * lineCount) + 1;
      const severity = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)];
      
      vulnerabilities.push({
        type: vulnType,
        line: line,
        severity: severity,
        confidence: 0.7 + Math.random() * 0.3 // 0.7-1.0
      });
    }
    
    return vulnerabilities;
  }

  calculateComplexityScore(code, complexityFactor) {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const functions = (code.match(/function\s+\w+|class\s+\w+/g) || []).length;
    const conditionals = (code.match(/if\s*\(|switch\s*\(|for\s*\(|while\s*\(/g) || []).length;
    const asyncPatterns = (code.match(/async|await|Promise/g) || []).length;
    
    return {
      line_complexity: lines.length * 0.1,
      function_complexity: functions * 2,
      conditional_complexity: conditionals * 1.5,
      async_complexity: asyncPatterns * 1.2,
      total_score: (lines.length * 0.1 + functions * 2 + conditionals * 1.5 + asyncPatterns * 1.2) * complexityFactor
    };
  }

  // Run benchmark on a specific scenario
  async runScenarioBenchmark(scenario) {
    this.log(`🏃 Running benchmark for ${scenario.name}...`);
    
    const benchmarkData = {
      scenario: scenario.name,
      description: scenario.description,
      parameters: scenario.parameters,
      runs: [],
      summary: null
    };
    
    // Generate codebase
    const codebase = await this.generateSyntheticCodebase(scenario);
    
    // Warmup runs
    for (let warmup = 0; warmup < this.options.warmupRuns; warmup++) {
      this.log(`🔥 Warmup run ${warmup + 1}/${this.options.warmupRuns}`);
      await this.runValidationBenchmark(codebase, true);
    }
    
    // Actual benchmark runs
    for (let run = 0; run < this.options.iterations; run++) {
      this.log(`📊 Benchmark run ${run + 1}/${this.options.iterations}`);
      
      const runResult = await this.runValidationBenchmark(codebase, false);
      benchmarkData.runs.push(runResult);
    }
    
    // Calculate summary statistics
    benchmarkData.summary = this.calculateSummaryStatistics(benchmarkData.runs);
    benchmarkData.codebase_info = {
      file_count: codebase.files.length,
      total_lines: codebase.total_lines,
      total_vulnerabilities: codebase.total_vulnerabilities
    };
    
    return benchmarkData;
  }

  async runValidationBenchmark(codebase, isWarmup = false) {
    const validator = new AISecurityValidator({
      confidenceThreshold: 0.7,
      falsePositiveThreshold: 0.05,
      enableLearning: false // Disable learning for consistent benchmarks
    });
    
    // Convert codebase to mock security findings
    const mockFindings = this.codebaseToMockFindings(codebase);
    
    const runData = {
      timestamp: new Date().toISOString(),
      is_warmup: isWarmup,
      system_metrics: {
        memory_before: process.memoryUsage(),
        cpu_before: process.cpuUsage()
      },
      performance_metrics: {},
      validation_results: []
    };
    
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    // Run validations
    for (const finding of mockFindings) {
      try {
        const validationStart = performance.now();
        const validation = await validator.validateFinding(finding);
        const validationTime = performance.now() - validationStart;
        
        runData.validation_results.push({
          finding_id: finding.id,
          validation_time: validationTime,
          validation_decision: validation.validation_decision,
          confidence: validation.validation_confidence
        });
      } catch (error) {
        // Continue with other validations
        runData.validation_results.push({
          finding_id: finding.id,
          error: error.message,
          validation_time: 0
        });
      }
    }
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    // Calculate performance metrics
    runData.performance_metrics = {
      total_duration: endTime - startTime,
      total_findings: mockFindings.length,
      successful_validations: runData.validation_results.filter(r => !r.error).length,
      failed_validations: runData.validation_results.filter(r => r.error).length,
      average_validation_time: this.calculateAverage(
        runData.validation_results.filter(r => !r.error).map(r => r.validation_time)
      ),
      throughput: mockFindings.length / ((endTime - startTime) / 1000), // validations per second
      memory_delta: {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal
      }
    };
    
    runData.system_metrics.memory_after = endMemory;
    runData.system_metrics.cpu_after = process.cpuUsage();
    
    if (!isWarmup) {
      this.log(`⚡ Processed ${mockFindings.length} findings in ${(runData.performance_metrics.total_duration / 1000).toFixed(2)}s`);
      this.log(`📈 Throughput: ${runData.performance_metrics.throughput.toFixed(2)} validations/sec`);
    }
    
    return runData;
  }

  codebaseToMockFindings(codebase) {
    const findings = [];
    let findingId = 1;
    
    for (const file of codebase.files) {
      for (const vulnerability of file.vulnerabilities) {
        findings.push({
          id: `BENCH-${findingId++}`,
          type: vulnerability.type,
          severity: vulnerability.severity,
          confidence: vulnerability.confidence,
          file: file.filename,
          line: vulnerability.line,
          message: `Benchmark ${vulnerability.type} vulnerability`,
          recommendation: `Fix ${vulnerability.type} issue`
        });
      }
    }
    
    return findings;
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  calculateSummaryStatistics(runs) {
    const durations = runs.map(r => r.performance_metrics.total_duration);
    const throughputs = runs.map(r => r.performance_metrics.throughput);
    const memoryDeltas = runs.map(r => r.performance_metrics.memory_delta.heapUsed);
    
    return {
      duration: {
        mean: this.calculateAverage(durations),
        min: Math.min(...durations),
        max: Math.max(...durations),
        std_dev: this.calculateStandardDeviation(durations)
      },
      throughput: {
        mean: this.calculateAverage(throughputs),
        min: Math.min(...throughputs),
        max: Math.max(...throughputs),
        std_dev: this.calculateStandardDeviation(throughputs)
      },
      memory_usage: {
        mean: this.calculateAverage(memoryDeltas),
        min: Math.min(...memoryDeltas),
        max: Math.max(...memoryDeltas),
        std_dev: this.calculateStandardDeviation(memoryDeltas)
      },
      success_rate: this.calculateAverage(runs.map(r => 
        r.performance_metrics.successful_validations / r.performance_metrics.total_findings
      )),
      performance_score: this.calculatePerformanceScore(throughputs, memoryDeltas)
    };
  }

  calculateStandardDeviation(values) {
    if (values.length === 0) return 0;
    const mean = this.calculateAverage(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = this.calculateAverage(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  calculatePerformanceScore(throughputs, memoryDeltas) {
    const avgThroughput = this.calculateAverage(throughputs);
    const avgMemoryDelta = this.calculateAverage(memoryDeltas);
    
    // Normalize throughput (target: 10 validations/sec = score 1.0)
    const throughputScore = Math.min(1.0, avgThroughput / 10.0);
    
    // Normalize memory usage (target: < 50MB delta = score 1.0)
    const memoryScore = Math.max(0, 1.0 - (avgMemoryDelta / (50 * 1024 * 1024)));
    
    return (throughputScore + memoryScore) / 2;
  }

  // Run all benchmark scenarios
  async runAllBenchmarks() {
    this.log('🚀 Starting comprehensive performance benchmarks...');
    const startTime = performance.now();
    
    await fs.mkdir(this.options.outputDir, { recursive: true });
    
    const scenarios = this.getBenchmarkScenarios();
    const results = {
      benchmark_info: {
        timestamp: new Date().toISOString(),
        system_info: this.systemInfo,
        benchmark_configuration: this.options,
        total_scenarios: scenarios.length
      },
      scenarios: [],
      comparative_analysis: null
    };
    
    // Run each scenario
    for (const scenario of scenarios) {
      try {
        const scenarioResult = await this.runScenarioBenchmark(scenario);
        results.scenarios.push(scenarioResult);
        
        this.log(`✅ ${scenario.name} completed: ${scenarioResult.summary.throughput.mean.toFixed(2)} validations/sec`);
      } catch (error) {
        this.log(`❌ ${scenario.name} failed: ${error.message}`, 'error');
        results.scenarios.push({
          scenario: scenario.name,
          error: error.message
        });
      }
    }
    
    // Generate comparative analysis
    results.comparative_analysis = this.generateComparativeAnalysis(results.scenarios);
    
    const totalTime = performance.now() - startTime;
    results.benchmark_info.total_duration = totalTime;
    
    // Save results
    const resultsPath = path.join(this.options.outputDir, 'performance-benchmarks.json');
    await fs.writeFile(resultsPath, JSON.stringify(results, null, 2));
    
    // Generate summary report
    const summaryPath = await this.generateSummaryReport(results);
    
    this.log(`\n📊 Benchmark Summary:`);
    this.log(`   Total Duration: ${(totalTime / 1000).toFixed(2)}s`);
    this.log(`   Scenarios Completed: ${results.scenarios.filter(s => !s.error).length}/${scenarios.length}`);
    this.log(`   Results: ${resultsPath}`);
    this.log(`   Summary: ${summaryPath}`);
    
    return results;
  }

  generateComparativeAnalysis(scenarios) {
    const validScenarios = scenarios.filter(s => !s.error);
    
    if (validScenarios.length === 0) {
      return { error: 'No valid scenarios to compare' };
    }
    
    return {
      scalability_analysis: this.analyzeScalability(validScenarios),
      performance_trends: this.analyzePerformanceTrends(validScenarios),
      resource_efficiency: this.analyzeResourceEfficiency(validScenarios),
      bottleneck_identification: this.identifyBottlenecks(validScenarios),
      recommendations: this.generatePerformanceRecommendations(validScenarios)
    };
  }

  analyzeScalability(scenarios) {
    const scalabilityData = scenarios.map(s => ({
      scenario: s.scenario,
      file_count: s.codebase_info.file_count,
      total_lines: s.codebase_info.total_lines,
      throughput: s.summary.throughput.mean,
      memory_usage: s.summary.memory_usage.mean
    }));
    
    // Calculate scalability trends
    const throughputTrend = this.calculateTrend(scalabilityData.map(d => d.throughput));
    const memoryTrend = this.calculateTrend(scalabilityData.map(d => d.memory_usage));
    
    return {
      data_points: scalabilityData,
      throughput_trend: throughputTrend,
      memory_trend: memoryTrend,
      scalability_score: this.calculateScalabilityScore(throughputTrend, memoryTrend)
    };
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    // Simple linear trend calculation
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < values.length; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }
    
    const slope = (values.length * sumXY - sumX * sumY) / (values.length * sumXX - sumX * sumX);
    return slope;
  }

  calculateScalabilityScore(throughputTrend, memoryTrend) {
    // Good scalability: throughput doesn't degrade too much, memory usage is reasonable
    const throughputScore = Math.max(0, 1 + throughputTrend / 10); // Positive trend is good
    const memoryScore = Math.max(0, 1 - Math.abs(memoryTrend) / 1000000); // Lower memory growth is good
    
    return (throughputScore + memoryScore) / 2;
  }

  analyzePerformanceTrends(scenarios) {
    return {
      best_performing: scenarios.reduce((best, current) => 
        current.summary.performance_score > best.summary.performance_score ? current : best
      ),
      worst_performing: scenarios.reduce((worst, current) => 
        current.summary.performance_score < worst.summary.performance_score ? current : worst
      ),
      average_performance: this.calculateAverage(scenarios.map(s => s.summary.performance_score)),
      performance_variance: this.calculateStandardDeviation(scenarios.map(s => s.summary.performance_score))
    };
  }

  analyzeResourceEfficiency(scenarios) {
    const efficiencyData = scenarios.map(s => ({
      scenario: s.scenario,
      validations_per_mb: s.codebase_info.total_vulnerabilities / (s.summary.memory_usage.mean / (1024 * 1024)),
      time_per_validation: s.summary.duration.mean / s.codebase_info.total_vulnerabilities,
      efficiency_score: s.summary.performance_score
    }));
    
    return {
      most_efficient: efficiencyData.reduce((best, current) => 
        current.efficiency_score > best.efficiency_score ? current : best
      ),
      least_efficient: efficiencyData.reduce((worst, current) => 
        current.efficiency_score < worst.efficiency_score ? current : worst
      ),
      efficiency_data: efficiencyData
    };
  }

  identifyBottlenecks(scenarios) {
    const bottlenecks = [];
    
    for (const scenario of scenarios) {
      // Check for performance bottlenecks
      if (scenario.summary.throughput.mean < 2.0) {
        bottlenecks.push({
          scenario: scenario.scenario,
          type: 'throughput',
          severity: 'high',
          description: 'Low validation throughput detected',
          metric: scenario.summary.throughput.mean
        });
      }
      
      if (scenario.summary.memory_usage.mean > 100 * 1024 * 1024) { // 100MB
        bottlenecks.push({
          scenario: scenario.scenario,
          type: 'memory',
          severity: 'medium',
          description: 'High memory usage detected',
          metric: scenario.summary.memory_usage.mean
        });
      }
      
      if (scenario.summary.duration.std_dev > scenario.summary.duration.mean * 0.5) {
        bottlenecks.push({
          scenario: scenario.scenario,
          type: 'consistency',
          severity: 'medium',
          description: 'High performance variance detected',
          metric: scenario.summary.duration.std_dev
        });
      }
    }
    
    return bottlenecks;
  }

  generatePerformanceRecommendations(scenarios) {
    const recommendations = [];
    
    // Overall performance recommendations
    const avgThroughput = this.calculateAverage(scenarios.map(s => s.summary.throughput.mean));
    
    if (avgThroughput < 5.0) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        description: 'Overall throughput below target',
        suggestion: 'Consider increasing confidence threshold or optimizing validation algorithms',
        expected_impact: 'Improved validation speed'
      });
    }
    
    // Memory usage recommendations
    const avgMemoryUsage = this.calculateAverage(scenarios.map(s => s.summary.memory_usage.mean));
    
    if (avgMemoryUsage > 50 * 1024 * 1024) { // 50MB
      recommendations.push({
        type: 'memory',
        priority: 'medium',
        description: 'High memory usage detected',
        suggestion: 'Implement streaming validation or reduce context window size',
        expected_impact: 'Reduced memory footprint'
      });
    }
    
    // Scalability recommendations
    const largeProjectScenarios = scenarios.filter(s => 
      s.codebase_info && s.codebase_info.file_count > 500
    );
    
    if (largeProjectScenarios.length > 0) {
      const avgLargeProjectThroughput = this.calculateAverage(
        largeProjectScenarios.map(s => s.summary.throughput.mean)
      );
      
      if (avgLargeProjectThroughput < 3.0) {
        recommendations.push({
          type: 'scalability',
          priority: 'high',
          description: 'Poor performance on large codebases',
          suggestion: 'Implement parallel validation or file-level caching',
          expected_impact: 'Better scalability for enterprise projects'
        });
      }
    }
    
    return recommendations;
  }

  async generateSummaryReport(results) {
    const summaryPath = path.join(this.options.outputDir, 'benchmark-summary.md');
    
    const validScenarios = results.scenarios.filter(s => !s.error);
    const summary = `# AI Security Performance Benchmark Summary

## Test Environment
- **Platform**: ${this.systemInfo.platform} (${this.systemInfo.arch})
- **Node.js**: ${this.systemInfo.node_version}
- **CPU**: ${this.systemInfo.cpu_model}
- **Memory**: ${(this.systemInfo.total_memory / (1024 * 1024 * 1024)).toFixed(2)} GB
- **Test Date**: ${new Date().toISOString().split('T')[0]}

## Benchmark Results

${validScenarios.map(scenario => `
### ${scenario.scenario.toUpperCase()}
- **Description**: ${scenario.description}
- **Files**: ${scenario.codebase_info.file_count}
- **Lines of Code**: ${scenario.codebase_info.total_lines.toLocaleString()}
- **Vulnerabilities**: ${scenario.codebase_info.total_vulnerabilities}
- **Throughput**: ${scenario.summary.throughput.mean.toFixed(2)} validations/sec
- **Memory Usage**: ${(scenario.summary.memory_usage.mean / (1024 * 1024)).toFixed(2)} MB
- **Performance Score**: ${(scenario.summary.performance_score * 100).toFixed(1)}%
`).join('')}

## Performance Analysis

${results.comparative_analysis?.scalability_analysis ? `
### Scalability
- **Scalability Score**: ${(results.comparative_analysis.scalability_analysis.scalability_score * 100).toFixed(1)}%
- **Throughput Trend**: ${results.comparative_analysis.scalability_analysis.throughput_trend > 0 ? 'Improving' : 'Degrading'}
- **Memory Trend**: ${results.comparative_analysis.scalability_analysis.memory_trend < 1000000 ? 'Stable' : 'Increasing'}
` : ''}

${results.comparative_analysis?.performance_trends ? `
### Performance Trends
- **Best Performing**: ${results.comparative_analysis.performance_trends.best_performing.scenario}
- **Worst Performing**: ${results.comparative_analysis.performance_trends.worst_performing.scenario}
- **Average Performance**: ${(results.comparative_analysis.performance_trends.average_performance * 100).toFixed(1)}%
` : ''}

## Recommendations

${results.comparative_analysis?.recommendations?.map(rec => `
- **${rec.type.toUpperCase()}** (${rec.priority}): ${rec.description}
  - *Suggestion*: ${rec.suggestion}
  - *Expected Impact*: ${rec.expected_impact}
`).join('') || 'No specific recommendations at this time.'}

---
*Generated by AI Security Performance Benchmarks*
`;
    
    await fs.writeFile(summaryPath, summary);
    return summaryPath;
  }
}

// Command line interface
if (require.main === module) {
  const options = {
    iterations: 3,
    warmupRuns: 1,
    enableMemoryProfiling: true,
    enableCpuProfiling: true
  };
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    switch (key) {
      case '--iterations':
        options.iterations = parseInt(value);
        break;
      case '--output-dir':
        options.outputDir = value;
        break;
      case '--warmup-runs':
        options.warmupRuns = parseInt(value);
        break;
    }
  }
  
  const benchmarks = new PerformanceBenchmarks(options);
  benchmarks.runAllBenchmarks()
    .then(results => {
      const validScenarios = results.scenarios.filter(s => !s.error).length;
      console.log(`\n🎯 Benchmarks completed: ${validScenarios}/${results.scenarios.length} scenarios successful`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Benchmark failed:', error.message);
      process.exit(1);
    });
}

module.exports = PerformanceBenchmarks;
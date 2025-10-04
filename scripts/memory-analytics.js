#!/usr/bin/env node

/**
 * Memory Analytics Script
 *
 * Analyzes memory system patterns, generates metrics, and provides insights.
 * Tracks pattern reuse, memory utilization, and system effectiveness.
 *
 * Usage:
 *   node scripts/memory-analytics.js [options]
 *
 * Options:
 *   --report <type>     Report type: summary|detailed|patterns|growth (default: summary)
 *   --output <file>     Output file path (optional, defaults to console)
 *   --period <days>     Analysis period in days (default: 30)
 *   --format <format>   Output format: text|json|markdown (default: text)
 *   --help              Show this help message
 *
 * Examples:
 *   node scripts/memory-analytics.js
 *   node scripts/memory-analytics.js --report detailed
 *   node scripts/memory-analytics.js --report patterns --output report.md --format markdown
 *   node scripts/memory-analytics.js --period 7 --format json
 *
 * Exit Codes:
 *   0 - Success
 *   1 - Invalid arguments
 *   2 - Analysis failed
 */

const fs = require('fs');
const path = require('path');
const { MemoryPathValidator } = require('./validate-memory-path.js');

class MemoryAnalytics {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.memoryRoot = path.join(workspaceRoot, 'memories');
    this.validator = new MemoryPathValidator(workspaceRoot);
  }

  /**
   * Run analytics based on report type
   * @param {string} reportType - Type of report to generate
   * @param {Object} options - Analysis options
   * @returns {Object} - Analysis results
   */
  analyze(reportType = 'summary', options = {}) {
    const { period = 30, format = 'text' } = options;

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Memory System Analytics`);
    console.log(`${'='.repeat(70)}\n`);

    const results = {
      timestamp: new Date().toISOString(),
      reportType: reportType,
      period: period,
      metrics: {}
    };

    // Collect base metrics
    const baseMetrics = this.collectBaseMetrics(period);
    results.metrics = baseMetrics;

    // Generate report based on type
    switch (reportType) {
      case 'summary':
        results.report = this.generateSummaryReport(baseMetrics, format);
        break;
      case 'detailed':
        results.report = this.generateDetailedReport(baseMetrics, format);
        break;
      case 'patterns':
        results.report = this.generatePatternsReport(baseMetrics, format);
        break;
      case 'growth':
        results.report = this.generateGrowthReport(baseMetrics, period, format);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    return results;
  }

  /**
   * Collect base metrics from memory system
   * @param {number} period - Period in days
   * @returns {Object} - Collected metrics
   */
  collectBaseMetrics(period) {
    const metrics = {
      files: {
        total: 0,
        byType: {},
        bySize: { small: 0, medium: 0, large: 0 },
        totalSize: 0
      },
      patterns: {
        debugging: [],
        security: [],
        test: [],
        task: []
      },
      projects: [],
      recentActivity: [],
      topPatterns: []
    };

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - period);

    // Scan all memory directories
    const directories = [
      'session-context',
      'protocol-compliance',
      'agent-coordination',
      'development-patterns',
      'client-context',
      'project-knowledge'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(this.memoryRoot, dir);
      if (!fs.existsSync(dirPath)) return;

      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        if (!file.endsWith('.xml')) return;

        const filePath = path.join(dirPath, file);

        try {
          const stats = fs.statSync(filePath);
          const content = fs.readFileSync(filePath, 'utf8');

          // File count and type
          metrics.files.total++;
          if (!metrics.files.byType[dir]) {
            metrics.files.byType[dir] = 0;
          }
          metrics.files.byType[dir]++;

          // File size categories
          if (stats.size < 10240) { // < 10KB
            metrics.files.bySize.small++;
          } else if (stats.size < 30720) { // 10-30KB
            metrics.files.bySize.medium++;
          } else { // > 30KB
            metrics.files.bySize.large++;
          }
          metrics.files.totalSize += stats.size;

          // Check if modified within period
          if (stats.mtime >= cutoffDate) {
            metrics.recentActivity.push({
              file: path.relative(this.memoryRoot, filePath),
              modified: stats.mtime.toISOString(),
              size: stats.size
            });
          }

          // Extract patterns from specific files
          if (dir === 'development-patterns') {
            this.extractPatterns(file, content, metrics.patterns);
          }

          // Extract project references
          this.extractProjects(content, metrics.projects);

        } catch (error) {
          // Skip files that can't be read
        }
      });
    });

    // Calculate top patterns by reuse
    metrics.topPatterns = this.calculateTopPatterns(metrics.patterns);

    return metrics;
  }

  /**
   * Extract patterns from development-patterns files
   * @param {string} fileName - File name
   * @param {string} content - File content
   * @param {Object} patterns - Patterns object to populate
   */
  extractPatterns(fileName, content, patterns) {
    // Simple regex-based extraction (would be better with XML parser)
    const solutionRegex = /<solution>[\s\S]*?<\/solution>/g;
    const patternRegex = /<pattern>[\s\S]*?<\/pattern>/g;

    if (fileName.includes('debugging')) {
      const solutions = content.match(solutionRegex) || [];
      solutions.forEach(sol => {
        const idMatch = sol.match(/<id>(.*?)<\/id>/);
        const categoryMatch = sol.match(/<problem-category>(.*?)<\/problem-category>/);
        const levelMatch = sol.match(/<surgical-level>(.*?)<\/surgical-level>/);
        const scoreMatch = sol.match(/<reusability-score>(.*?)<\/reusability-score>/);

        if (idMatch) {
          patterns.debugging.push({
            id: idMatch[1],
            category: categoryMatch ? categoryMatch[1] : 'unknown',
            level: levelMatch ? levelMatch[1] : 'unknown',
            reusability: scoreMatch ? scoreMatch[1] : 'unknown'
          });
        }
      });
    } else if (fileName.includes('security')) {
      const secPatterns = content.match(patternRegex) || [];
      secPatterns.forEach(pat => {
        const nameMatch = pat.match(/<name>(.*?)<\/name>/);
        const categoryMatch = pat.match(/<category>(.*?)<\/category>/);

        if (nameMatch) {
          patterns.security.push({
            name: nameMatch[1],
            category: categoryMatch ? categoryMatch[1] : 'unknown'
          });
        }
      });
    } else if (fileName.includes('test')) {
      const testPatterns = content.match(/<strategy>[\s\S]*?<\/strategy>/g) || [];
      testPatterns.forEach(pat => {
        const nameMatch = pat.match(/<name>(.*?)<\/name>/);
        const levelMatch = pat.match(/<test-level>(.*?)<\/test-level>/);

        if (nameMatch) {
          patterns.test.push({
            name: nameMatch[1],
            level: levelMatch ? levelMatch[1] : 'unknown'
          });
        }
      });
    } else if (fileName.includes('task')) {
      const taskPatterns = content.match(/<template>[\s\S]*?<\/template>/g) || [];
      taskPatterns.forEach(pat => {
        const nameMatch = pat.match(/<name>(.*?)<\/name>/);
        const levelMatch = pat.match(/<surgical-level>(.*?)<\/surgical-level>/);

        if (nameMatch) {
          patterns.task.push({
            name: nameMatch[1],
            level: levelMatch ? levelMatch[1] : 'unknown'
          });
        }
      });
    }
  }

  /**
   * Extract project references from content
   * @param {string} content - File content
   * @param {Array} projects - Projects array to populate
   */
  extractProjects(content, projects) {
    const projectRegex = /<project(?:-name)?>(.*?)<\/project(?:-name)?>/g;
    let match;

    while ((match = projectRegex.exec(content)) !== null) {
      const projectName = match[1].trim();
      if (projectName && !projects.includes(projectName)) {
        projects.push(projectName);
      }
    }
  }

  /**
   * Calculate top patterns by reuse
   * @param {Object} patterns - Patterns object
   * @returns {Array} - Top patterns sorted by reusability
   */
  calculateTopPatterns(patterns) {
    const topPatterns = [];

    // Debugging patterns
    patterns.debugging.forEach(pattern => {
      if (pattern.reusability === 'high') {
        topPatterns.push({
          type: 'debugging',
          id: pattern.id,
          category: pattern.category,
          level: pattern.level,
          reusability: 'high'
        });
      }
    });

    return topPatterns.slice(0, 10); // Top 10
  }

  /**
   * Generate summary report
   * @param {Object} metrics - Collected metrics
   * @param {string} format - Output format
   * @returns {string} - Report text
   */
  generateSummaryReport(metrics, format) {
    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    }

    const isMarkdown = format === 'markdown';
    const h1 = isMarkdown ? '# ' : '';
    const h2 = isMarkdown ? '## ' : '';
    const bold = isMarkdown ? '**' : '';
    const sep = isMarkdown ? '\n---\n' : '='.repeat(70) + '\n';

    let report = '';

    report += `${h1}Memory System Summary Report\n${sep}\n`;

    report += `${h2}Overall Statistics\n\n`;
    report += `${bold}Total Files:${bold} ${metrics.files.total}\n`;
    report += `${bold}Total Size:${bold} ${this.formatBytes(metrics.files.totalSize)}\n`;
    report += `${bold}Projects Tracked:${bold} ${metrics.projects.length}\n\n`;

    report += `${h2}Files by Type\n\n`;
    Object.entries(metrics.files.byType).forEach(([type, count]) => {
      const percentage = ((count / metrics.files.total) * 100).toFixed(1);
      report += `- ${type}: ${count} files (${percentage}%)\n`;
    });

    report += `\n${h2}File Size Distribution\n\n`;
    report += `- Small (<10KB): ${metrics.files.bySize.small}\n`;
    report += `- Medium (10-30KB): ${metrics.files.bySize.medium}\n`;
    report += `- Large (>30KB): ${metrics.files.bySize.large}\n`;

    report += `\n${h2}Pattern Library\n\n`;
    report += `- Debugging Solutions: ${metrics.patterns.debugging.length}\n`;
    report += `- Security Patterns: ${metrics.patterns.security.length}\n`;
    report += `- Test Strategies: ${metrics.patterns.test.length}\n`;
    report += `- Task Templates: ${metrics.patterns.task.length}\n`;

    report += `\n${h2}Recent Activity\n\n`;
    report += `Files modified in analysis period: ${metrics.recentActivity.length}\n`;

    if (metrics.topPatterns.length > 0) {
      report += `\n${h2}Top Reusable Patterns\n\n`;
      metrics.topPatterns.forEach((pattern, idx) => {
        report += `${idx + 1}. ${pattern.type}: ${pattern.id || pattern.name} (${pattern.category})\n`;
      });
    }

    report += `\n${sep}`;

    return report;
  }

  /**
   * Generate detailed report
   * @param {Object} metrics - Collected metrics
   * @param {string} format - Output format
   * @returns {string} - Report text
   */
  generateDetailedReport(metrics, format) {
    if (format === 'json') {
      return JSON.stringify(metrics, null, 2);
    }

    const summary = this.generateSummaryReport(metrics, format);
    const isMarkdown = format === 'markdown';
    const h2 = isMarkdown ? '## ' : '';
    const h3 = isMarkdown ? '### ' : '';

    let report = summary;

    report += `\n${h2}Recent Activity Details\n\n`;

    if (metrics.recentActivity.length > 0) {
      metrics.recentActivity.forEach(activity => {
        report += `${h3}${activity.file}\n`;
        report += `- Modified: ${activity.modified}\n`;
        report += `- Size: ${this.formatBytes(activity.size)}\n\n`;
      });
    } else {
      report += 'No recent activity in the specified period.\n\n';
    }

    report += `${h2}Projects Tracked\n\n`;
    if (metrics.projects.length > 0) {
      metrics.projects.forEach(project => {
        report += `- ${project}\n`;
      });
    } else {
      report += 'No projects tracked.\n';
    }

    return report;
  }

  /**
   * Generate patterns report
   * @param {Object} metrics - Collected metrics
   * @param {string} format - Output format
   * @returns {string} - Report text
   */
  generatePatternsReport(metrics, format) {
    if (format === 'json') {
      return JSON.stringify(metrics.patterns, null, 2);
    }

    const isMarkdown = format === 'markdown';
    const h1 = isMarkdown ? '# ' : '';
    const h2 = isMarkdown ? '## ' : '';
    const sep = isMarkdown ? '\n---\n' : '='.repeat(70) + '\n';

    let report = '';

    report += `${h1}Pattern Analysis Report\n${sep}\n`;

    report += `${h2}Debugging Solutions (${metrics.patterns.debugging.length})\n\n`;
    metrics.patterns.debugging.forEach(pattern => {
      report += `- ${pattern.id}\n`;
      report += `  Category: ${pattern.category}\n`;
      report += `  Surgical Level: ${pattern.level}\n`;
      report += `  Reusability: ${pattern.reusability}\n\n`;
    });

    report += `${h2}Security Patterns (${metrics.patterns.security.length})\n\n`;
    metrics.patterns.security.forEach(pattern => {
      report += `- ${pattern.name}\n`;
      report += `  Category: ${pattern.category}\n\n`;
    });

    report += `${h2}Test Strategies (${metrics.patterns.test.length})\n\n`;
    metrics.patterns.test.forEach(pattern => {
      report += `- ${pattern.name}\n`;
      report += `  Test Level: ${pattern.level}\n\n`;
    });

    report += `${h2}Task Templates (${metrics.patterns.task.length})\n\n`;
    metrics.patterns.task.forEach(pattern => {
      report += `- ${pattern.name}\n`;
      report += `  Surgical Level: ${pattern.level}\n\n`;
    });

    return report;
  }

  /**
   * Generate growth report
   * @param {Object} metrics - Collected metrics
   * @param {number} period - Period in days
   * @param {string} format - Output format
   * @returns {string} - Report text
   */
  generateGrowthReport(metrics, period, format) {
    if (format === 'json') {
      const growthData = {
        period: period,
        recentActivity: metrics.recentActivity.length,
        growthRate: ((metrics.recentActivity.length / metrics.files.total) * 100).toFixed(2),
        totalSize: metrics.files.totalSize,
        avgFileSize: Math.round(metrics.files.totalSize / metrics.files.total)
      };
      return JSON.stringify(growthData, null, 2);
    }

    const isMarkdown = format === 'markdown';
    const h1 = isMarkdown ? '# ' : '';
    const h2 = isMarkdown ? '## ' : '';
    const bold = isMarkdown ? '**' : '';
    const sep = isMarkdown ? '\n---\n' : '='.repeat(70) + '\n';

    let report = '';

    report += `${h1}Memory System Growth Report\n${sep}\n`;

    report += `${h2}Analysis Period: ${period} days\n\n`;

    const growthRate = ((metrics.recentActivity.length / metrics.files.total) * 100).toFixed(2);
    report += `${bold}Total Files:${bold} ${metrics.files.total}\n`;
    report += `${bold}Files Modified in Period:${bold} ${metrics.recentActivity.length}\n`;
    report += `${bold}Growth Rate:${bold} ${growthRate}%\n\n`;

    report += `${h2}Size Metrics\n\n`;
    report += `${bold}Total Memory Size:${bold} ${this.formatBytes(metrics.files.totalSize)}\n`;
    report += `${bold}Average File Size:${bold} ${this.formatBytes(Math.round(metrics.files.totalSize / metrics.files.total))}\n\n`;

    report += `${h2}Insights\n\n`;

    // File size warnings
    const largeFilePercentage = (metrics.files.bySize.large / metrics.files.total) * 100;
    if (largeFilePercentage > 20) {
      report += `⚠ ${largeFilePercentage.toFixed(1)}% of files are large (>30KB). Consider archival or consolidation.\n`;
    }

    // Growth rate insights
    if (growthRate > 50) {
      report += `⚠ High growth rate detected (${growthRate}%). System is actively being used.\n`;
    } else if (growthRate < 10) {
      report += `ℹ Low growth rate (${growthRate}%). System may have stale data suitable for archival.\n`;
    }

    // Pattern accumulation
    const totalPatterns = metrics.patterns.debugging.length +
                         metrics.patterns.security.length +
                         metrics.patterns.test.length +
                         metrics.patterns.task.length;
    report += `\n✓ ${totalPatterns} patterns accumulated across all categories.\n`;

    return report;
  }

  /**
   * Format bytes to human-readable string
   * @param {number} bytes - Bytes to format
   * @returns {string} - Formatted string
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Memory Analytics Script

Analyzes memory system patterns, generates metrics, and provides insights.

Usage:
  node scripts/memory-analytics.js [options]

Options:
  --report <type>     Report type: summary|detailed|patterns|growth (default: summary)
  --output <file>     Output file path (optional, defaults to console)
  --period <days>     Analysis period in days (default: 30)
  --format <format>   Output format: text|json|markdown (default: text)
  --help              Show this help message

Examples:
  node scripts/memory-analytics.js
  node scripts/memory-analytics.js --report detailed
  node scripts/memory-analytics.js --report patterns --output report.md --format markdown
  node scripts/memory-analytics.js --period 7 --format json

Exit Codes:
  0 - Success
  1 - Invalid arguments
  2 - Analysis failed
`);
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const reportTypeIndex = args.indexOf('--report');
  const reportType = reportTypeIndex !== -1 ? args[reportTypeIndex + 1] : 'summary';

  const periodIndex = args.indexOf('--period');
  const period = periodIndex !== -1 ? parseInt(args[periodIndex + 1]) : 30;

  const formatIndex = args.indexOf('--format');
  const format = formatIndex !== -1 ? args[formatIndex + 1] : 'text';

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

  // Validate report type
  const validTypes = ['summary', 'detailed', 'patterns', 'growth'];
  if (!validTypes.includes(reportType)) {
    console.error(`✗ Error: Invalid report type "${reportType}". Valid types: ${validTypes.join(', ')}\n`);
    showHelp();
    process.exit(1);
  }

  // Validate format
  const validFormats = ['text', 'json', 'markdown'];
  if (!validFormats.includes(format)) {
    console.error(`✗ Error: Invalid format "${format}". Valid formats: ${validFormats.join(', ')}\n`);
    showHelp();
    process.exit(1);
  }

  const analytics = new MemoryAnalytics(process.cwd());

  try {
    const results = analytics.analyze(reportType, { period, format });

    // Output results
    if (outputFile) {
      fs.writeFileSync(outputFile, results.report);
      console.log(`\n✓ Report written to: ${outputFile}\n`);
    } else {
      console.log(results.report);
    }

    process.exit(0);
  } catch (error) {
    console.error(`✗ Fatal error: ${error.message}`);
    console.error(error.stack);
    process.exit(2);
  }
}

// Run main function
if (require.main === module) {
  main();
}

// Export for testing
module.exports = { MemoryAnalytics };

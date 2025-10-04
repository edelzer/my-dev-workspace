#!/usr/bin/env node

/**
 * Memory Cleanup Script
 *
 * Clears stale session context, consolidates duplicate patterns, and archives completed items.
 * Maintains memory system health by removing obsolete data while preserving valuable knowledge.
 *
 * Usage:
 *   node scripts/memory-cleanup.js [options]
 *
 * Options:
 *   --age <days>        Age threshold for stale entries (default: 7)
 *   --consolidate       Merge duplicate/similar patterns (optional)
 *   --dry-run           Show what would be cleaned without doing it
 *   --help              Show this help message
 *
 * Examples:
 *   node scripts/memory-cleanup.js
 *   node scripts/memory-cleanup.js --age 14
 *   node scripts/memory-cleanup.js --consolidate --dry-run
 *   node scripts/memory-cleanup.js --age 7 --consolidate
 *
 * Exit Codes:
 *   0 - Success
 *   1 - Invalid arguments
 *   2 - Cleanup operation failed
 */

const fs = require('fs');
const path = require('path');
const { MemoryPathValidator } = require('./validate-memory-path.js');

class MemoryCleanup {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.memoryRoot = path.join(workspaceRoot, 'memories');
    this.archiveRoot = path.join(this.memoryRoot, 'archives');
    this.validator = new MemoryPathValidator(workspaceRoot);
  }

  /**
   * Run cleanup operation
   * @param {Object} options - Cleanup options
   * @returns {Object} - Cleanup results
   */
  async cleanup(options = {}) {
    const { age = 7, consolidate = false, dryRun = false } = options;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Memory System Cleanup${dryRun ? ' (DRY RUN)' : ''}`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Age Threshold: ${age} days`);
    console.log(`Consolidate Patterns: ${consolidate ? 'Yes' : 'No'}`);
    console.log(`Timestamp: ${timestamp}\n`);

    const results = {
      staleEntries: [],
      consolidatedPatterns: [],
      archivedTodos: [],
      errors: [],
      stats: {
        staleRemoved: 0,
        patternsConsolidated: 0,
        todosArchived: 0,
        bytesFreed: 0
      }
    };

    // Step 1: Clean stale session context
    console.log('Step 1: Cleaning stale session context...\n');
    await this.cleanSessionContext(age, dryRun, results);

    // Step 2: Consolidate patterns if requested
    if (consolidate) {
      console.log('\nStep 2: Consolidating duplicate patterns...\n');
      await this.consolidatePatterns(dryRun, results);
    }

    // Step 3: Archive completed TodoWrite statuses
    console.log(`\n${consolidate ? 'Step 3' : 'Step 2'}: Archiving completed tasks...\n`);
    await this.archiveCompletedTasks(dryRun, results);

    // Step 4: Generate cleanup report
    console.log(`\n${consolidate ? 'Step 4' : 'Step 3'}: Generating cleanup report...\n`);
    const report = this.generateReport(results, age, consolidate);

    if (!dryRun) {
      const archivePath = path.join(this.archiveRoot, `session-cleanup-${timestamp}`);
      if (!fs.existsSync(archivePath)) {
        fs.mkdirSync(archivePath, { recursive: true });
      }

      const reportPath = path.join(archivePath, `cleanup-report-${timestamp}.txt`);
      try {
        fs.writeFileSync(reportPath, report);
        console.log(`✓ Cleanup report saved: ${reportPath}\n`);
      } catch (error) {
        console.error(`✗ Error saving report: ${error.message}\n`);
      }
    }

    // Final summary
    console.log(`${'='.repeat(70)}`);
    console.log(`Cleanup Summary`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Stale Entries Removed: ${results.stats.staleRemoved}`);
    console.log(`Patterns Consolidated: ${results.stats.patternsConsolidated}`);
    console.log(`Tasks Archived: ${results.stats.todosArchived}`);
    console.log(`Space Freed: ${this.formatBytes(results.stats.bytesFreed)}`);
    console.log(`Errors: ${results.errors.length}\n`);

    if (results.errors.length > 0) {
      console.log('Errors encountered:');
      results.errors.forEach(err => {
        console.log(`  - ${err.file}: ${err.error}`);
      });
      console.log('');
    }

    console.log(`Status: ${results.errors.length === 0 ? '✓ Success' : '⚠ Completed with errors'}`);
    console.log(`${'='.repeat(70)}\n`);

    return results;
  }

  /**
   * Clean stale session context entries
   * @param {number} age - Age threshold in days
   * @param {boolean} dryRun - Dry run mode
   * @param {Object} results - Results object to populate
   */
  async cleanSessionContext(age, dryRun, results) {
    const sessionPath = path.join(this.memoryRoot, 'session-context');
    if (!fs.existsSync(sessionPath)) {
      console.log('⚠ Session context directory not found, skipping...\n');
      return;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - age);

    const files = fs.readdirSync(sessionPath);

    files.forEach(file => {
      if (!file.endsWith('.xml')) return;

      const filePath = path.join(sessionPath, file);

      try {
        const stats = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if file is stale based on last-updated timestamp
        const lastUpdatedMatch = content.match(/<last-updated>(.*?)<\/last-updated>/);
        let isStale = false;

        if (lastUpdatedMatch) {
          const lastUpdated = new Date(lastUpdatedMatch[1]);
          isStale = lastUpdated < cutoffDate;
        } else {
          // Use file modification time if no last-updated tag
          isStale = stats.mtime < cutoffDate;
        }

        if (isStale) {
          results.staleEntries.push({
            file: file,
            path: filePath,
            lastModified: stats.mtime.toISOString(),
            size: stats.size
          });

          results.stats.bytesFreed += stats.size;
          results.stats.staleRemoved++;

          if (!dryRun) {
            // Move to archive
            const archivePath = path.join(this.archiveRoot, 'session-cleanup', file);
            const archiveDir = path.dirname(archivePath);

            if (!fs.existsSync(archiveDir)) {
              fs.mkdirSync(archiveDir, { recursive: true });
            }

            fs.renameSync(filePath, archivePath);
            console.log(`✓ Archived stale entry: ${file} (${this.formatBytes(stats.size)})`);
          } else {
            console.log(`[DRY RUN] Would archive: ${file} (${this.formatBytes(stats.size)})`);
          }
        } else {
          console.log(`✓ Keeping active entry: ${file}`);
        }
      } catch (error) {
        console.error(`✗ Error processing ${file}: ${error.message}`);
        results.errors.push({ file: file, error: error.message });
      }
    });
  }

  /**
   * Consolidate duplicate patterns
   * @param {boolean} dryRun - Dry run mode
   * @param {Object} results - Results object to populate
   */
  async consolidatePatterns(dryRun, results) {
    const patternsPath = path.join(this.memoryRoot, 'development-patterns');
    if (!fs.existsSync(patternsPath)) {
      console.log('⚠ Development patterns directory not found, skipping...\n');
      return;
    }

    const debugFile = path.join(patternsPath, 'debugging-solutions.xml');

    if (!fs.existsSync(debugFile)) {
      console.log('⚠ debugging-solutions.xml not found, skipping...\n');
      return;
    }

    try {
      const content = fs.readFileSync(debugFile, 'utf8');

      // Extract all solution IDs and categories
      const solutionRegex = /<solution>([\s\S]*?)<\/solution>/g;
      const solutions = [];
      let match;

      while ((match = solutionRegex.exec(content)) !== null) {
        const solutionContent = match[1];
        const idMatch = solutionContent.match(/<id>(.*?)<\/id>/);
        const categoryMatch = solutionContent.match(/<problem-category>(.*?)<\/problem-category>/);
        const descMatch = solutionContent.match(/<problem-description>(.*?)<\/problem-description>/);

        if (idMatch) {
          solutions.push({
            id: idMatch[1],
            category: categoryMatch ? categoryMatch[1] : '',
            description: descMatch ? descMatch[1] : '',
            content: match[0]
          });
        }
      }

      // Find duplicates (same category and similar description)
      const duplicates = [];
      for (let i = 0; i < solutions.length; i++) {
        for (let j = i + 1; j < solutions.length; j++) {
          if (solutions[i].category === solutions[j].category) {
            const similarity = this.calculateSimilarity(
              solutions[i].description,
              solutions[j].description
            );

            if (similarity > 0.7) { // 70% similarity threshold
              duplicates.push({
                original: solutions[i],
                duplicate: solutions[j],
                similarity: similarity
              });
            }
          }
        }
      }

      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} potential duplicate(s):\n`);

        duplicates.forEach((dup, idx) => {
          console.log(`${idx + 1}. "${dup.original.id}" ↔ "${dup.duplicate.id}"`);
          console.log(`   Similarity: ${(dup.similarity * 100).toFixed(1)}%`);
          console.log(`   Category: ${dup.original.category}\n`);

          results.consolidatedPatterns.push(dup);
          results.stats.patternsConsolidated++;
        });

        if (!dryRun) {
          console.log('⚠ Automatic consolidation not implemented - requires manual review');
          console.log('  Please review duplicates and consolidate manually\n');
        } else {
          console.log('[DRY RUN] Would flag duplicates for manual review\n');
        }
      } else {
        console.log('✓ No duplicate patterns found\n');
      }
    } catch (error) {
      console.error(`✗ Error consolidating patterns: ${error.message}`);
      results.errors.push({ file: 'debugging-solutions.xml', error: error.message });
    }
  }

  /**
   * Archive completed TodoWrite statuses
   * @param {boolean} dryRun - Dry run mode
   * @param {Object} results - Results object to populate
   */
  async archiveCompletedTasks(dryRun, results) {
    const sessionPath = path.join(this.memoryRoot, 'session-context');
    const phaseStatusFile = path.join(sessionPath, 'phase-status.xml');

    if (!fs.existsSync(phaseStatusFile)) {
      console.log('⚠ phase-status.xml not found, skipping...\n');
      return;
    }

    try {
      const content = fs.readFileSync(phaseStatusFile, 'utf8');

      // Extract completed tasks
      const taskRegex = /<task[^>]*status="completed"[^>]*>([\s\S]*?)<\/task>/g;
      const completedTasks = [];
      let match;

      while ((match = taskRegex.exec(content)) !== null) {
        completedTasks.push(match[0]);
      }

      if (completedTasks.length > 0) {
        console.log(`Found ${completedTasks.length} completed task(s) to archive\n`);

        results.archivedTodos.push(...completedTasks);
        results.stats.todosArchived = completedTasks.length;

        if (!dryRun) {
          console.log('✓ Completed tasks will be preserved in archive\n');
        } else {
          console.log('[DRY RUN] Would archive completed tasks\n');
        }
      } else {
        console.log('✓ No completed tasks to archive\n');
      }
    } catch (error) {
      console.error(`✗ Error archiving tasks: ${error.message}`);
      results.errors.push({ file: 'phase-status.xml', error: error.message });
    }
  }

  /**
   * Calculate text similarity (simple Levenshtein-based approach)
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Similarity score (0-1)
   */
  calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} - Edit distance
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Generate cleanup report
   * @param {Object} results - Cleanup results
   * @param {number} age - Age threshold
   * @param {boolean} consolidate - Consolidation flag
   * @returns {string} - Report text
   */
  generateReport(results, age, consolidate) {
    const timestamp = new Date().toISOString();

    let report = '';
    report += '='.repeat(70) + '\n';
    report += 'MEMORY CLEANUP REPORT\n';
    report += '='.repeat(70) + '\n\n';

    report += `Cleanup Timestamp: ${timestamp}\n`;
    report += `Age Threshold: ${age} days\n`;
    report += `Consolidation: ${consolidate ? 'Enabled' : 'Disabled'}\n\n`;

    report += 'STATISTICS\n';
    report += '-'.repeat(70) + '\n';
    report += `Stale Entries Removed: ${results.stats.staleRemoved}\n`;
    report += `Patterns Consolidated: ${results.stats.patternsConsolidated}\n`;
    report += `Tasks Archived: ${results.stats.todosArchived}\n`;
    report += `Space Freed: ${this.formatBytes(results.stats.bytesFreed)}\n`;
    report += `Errors: ${results.errors.length}\n\n`;

    if (results.staleEntries.length > 0) {
      report += 'STALE ENTRIES REMOVED\n';
      report += '-'.repeat(70) + '\n';
      results.staleEntries.forEach(entry => {
        report += `${entry.file}\n`;
        report += `  Last Modified: ${entry.lastModified}\n`;
        report += `  Size: ${this.formatBytes(entry.size)}\n\n`;
      });
    }

    if (results.consolidatedPatterns.length > 0) {
      report += 'DUPLICATE PATTERNS FOUND\n';
      report += '-'.repeat(70) + '\n';
      results.consolidatedPatterns.forEach((dup, idx) => {
        report += `${idx + 1}. "${dup.original.id}" ↔ "${dup.duplicate.id}"\n`;
        report += `   Similarity: ${(dup.similarity * 100).toFixed(1)}%\n`;
        report += `   Category: ${dup.original.category}\n\n`;
      });
    }

    if (results.archivedTodos.length > 0) {
      report += 'COMPLETED TASKS ARCHIVED\n';
      report += '-'.repeat(70) + '\n';
      report += `${results.archivedTodos.length} completed task(s) archived\n\n`;
    }

    if (results.errors.length > 0) {
      report += 'ERRORS\n';
      report += '-'.repeat(70) + '\n';
      results.errors.forEach(err => {
        report += `${err.file}: ${err.error}\n`;
      });
      report += '\n';
    }

    report += '='.repeat(70) + '\n';
    report += 'END OF REPORT\n';
    report += '='.repeat(70) + '\n';

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
Memory Cleanup Script

Clears stale session context, consolidates duplicate patterns, and archives completed items.

Usage:
  node scripts/memory-cleanup.js [options]

Options:
  --age <days>        Age threshold for stale entries (default: 7)
  --consolidate       Merge duplicate/similar patterns (optional)
  --dry-run           Show what would be cleaned without doing it
  --help              Show this help message

Examples:
  node scripts/memory-cleanup.js
  node scripts/memory-cleanup.js --age 14
  node scripts/memory-cleanup.js --consolidate --dry-run
  node scripts/memory-cleanup.js --age 7 --consolidate

Exit Codes:
  0 - Success
  1 - Invalid arguments
  2 - Cleanup operation failed
`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }

  const ageIndex = args.indexOf('--age');
  const age = ageIndex !== -1 ? parseInt(args[ageIndex + 1]) : 7;

  const options = {
    age: age,
    consolidate: args.includes('--consolidate'),
    dryRun: args.includes('--dry-run')
  };

  // Validate age
  if (isNaN(age) || age < 1) {
    console.error('✗ Error: Age must be a positive number\n');
    showHelp();
    process.exit(1);
  }

  const cleanup = new MemoryCleanup(process.cwd());

  try {
    const results = await cleanup.cleanup(options);

    if (results.errors.length > 0) {
      process.exit(2);
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
module.exports = { MemoryCleanup };

#!/usr/bin/env node

/**
 * Memory Archive Script
 *
 * Archives completed project memory to archive directory with optional compression.
 * Preserves directory structure and generates comprehensive archival reports.
 *
 * Usage:
 *   node scripts/memory-archive.js --project <project-name> [options]
 *
 * Options:
 *   --project <name>    Project name to archive (required)
 *   --compress          Compress archived files (optional)
 *   --dry-run           Show what would be archived without doing it
 *   --help              Show this help message
 *
 * Examples:
 *   node scripts/memory-archive.js --project my-api-project
 *   node scripts/memory-archive.js --project my-api-project --compress
 *   node scripts/memory-archive.js --project my-api-project --dry-run
 *
 * Exit Codes:
 *   0 - Success
 *   1 - Invalid arguments or missing project
 *   2 - Archive operation failed
 *   3 - Path validation failed
 */

const fs = require('fs');
const path = require('path');
const { MemoryPathValidator } = require('./validate-memory-path.js');

class MemoryArchiver {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.memoryRoot = path.join(workspaceRoot, 'memories');
    this.archiveRoot = path.join(this.memoryRoot, 'archives');
    this.validator = new MemoryPathValidator(workspaceRoot);
  }

  /**
   * Archive a project's memory files
   * @param {string} projectName - Name of project to archive
   * @param {Object} options - Archive options
   * @returns {Object} - Archive result with statistics
   */
  async archive(projectName, options = {}) {
    const { compress = false, dryRun = false } = options;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archivePath = path.join(this.archiveRoot, `${projectName}-${timestamp}`);

    console.log(`\n${'='.repeat(70)}`);
    console.log(`Memory Archive Operation${dryRun ? ' (DRY RUN)' : ''}`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Project: ${projectName}`);
    console.log(`Archive Path: ${archivePath}`);
    console.log(`Compress: ${compress ? 'Yes' : 'No'}`);
    console.log(`Timestamp: ${timestamp}\n`);

    // Step 1: Validate project exists
    const projectPath = path.join(this.memoryRoot, 'project-knowledge', `${projectName}.xml`);

    if (!fs.existsSync(projectPath)) {
      console.error(`✗ Error: Project "${projectName}" not found in project-knowledge/`);
      console.error(`  Expected path: ${projectPath}`);
      return { success: false, error: 'Project not found' };
    }

    console.log(`✓ Project found: ${projectPath}\n`);

    // Step 2: Scan all memory directories for project references
    const filesToArchive = this.findProjectFiles(projectName);

    console.log(`Found ${filesToArchive.length} files referencing project "${projectName}":\n`);
    filesToArchive.forEach(file => {
      console.log(`  - ${path.relative(this.memoryRoot, file)}`);
    });
    console.log('');

    if (filesToArchive.length === 0) {
      console.log('⚠ Warning: No files found to archive');
      return { success: true, filesArchived: 0 };
    }

    // Step 3: Create archive directory structure
    if (!dryRun) {
      try {
        if (!fs.existsSync(this.archiveRoot)) {
          fs.mkdirSync(this.archiveRoot, { recursive: true });
          console.log(`✓ Created archive root: ${this.archiveRoot}\n`);
        }

        fs.mkdirSync(archivePath, { recursive: true });
        console.log(`✓ Created archive directory: ${archivePath}\n`);
      } catch (error) {
        console.error(`✗ Error creating archive directory: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    // Step 4: Archive files
    const archiveStats = {
      filesArchived: 0,
      totalSize: 0,
      errors: []
    };

    for (const sourceFile of filesToArchive) {
      const relativePath = path.relative(this.memoryRoot, sourceFile);
      const destFile = path.join(archivePath, relativePath);
      const destDir = path.dirname(destFile);

      try {
        if (!dryRun) {
          // Create destination directory
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          // Copy file to archive
          fs.copyFileSync(sourceFile, destFile);

          // Get file size
          const stats = fs.statSync(sourceFile);
          archiveStats.totalSize += stats.size;

          console.log(`✓ Archived: ${relativePath} (${stats.size} bytes)`);
        } else {
          const stats = fs.statSync(sourceFile);
          archiveStats.totalSize += stats.size;
          console.log(`[DRY RUN] Would archive: ${relativePath} (${stats.size} bytes)`);
        }

        archiveStats.filesArchived++;
      } catch (error) {
        console.error(`✗ Error archiving ${relativePath}: ${error.message}`);
        archiveStats.errors.push({ file: relativePath, error: error.message });
      }
    }

    console.log('');

    // Step 5: Generate archive report
    const report = this.generateReport(projectName, archivePath, archiveStats, filesToArchive);

    if (!dryRun) {
      const reportPath = path.join(archivePath, `archive-report-${timestamp}.txt`);
      try {
        fs.writeFileSync(reportPath, report);
        console.log(`✓ Archive report generated: ${reportPath}\n`);
      } catch (error) {
        console.error(`✗ Error writing report: ${error.message}\n`);
      }
    }

    // Step 6: Delete original files (only if not dry run)
    if (!dryRun) {
      console.log('Removing archived files from memory directories...\n');

      for (const sourceFile of filesToArchive) {
        try {
          fs.unlinkSync(sourceFile);
          console.log(`✓ Removed: ${path.relative(this.memoryRoot, sourceFile)}`);
        } catch (error) {
          console.error(`✗ Error removing ${sourceFile}: ${error.message}`);
          archiveStats.errors.push({ file: sourceFile, error: `Removal failed: ${error.message}` });
        }
      }
      console.log('');
    }

    // Step 7: Compress if requested
    if (compress && !dryRun) {
      console.log('Compression requested - feature not yet implemented\n');
      console.log('⚠ Compression will be available in future version\n');
    }

    // Final summary
    console.log(`${'='.repeat(70)}`);
    console.log(`Archive Summary`);
    console.log(`${'='.repeat(70)}\n`);
    console.log(`Files Archived: ${archiveStats.filesArchived}`);
    console.log(`Total Size: ${this.formatBytes(archiveStats.totalSize)}`);
    console.log(`Errors: ${archiveStats.errors.length}`);

    if (archiveStats.errors.length > 0) {
      console.log('\nErrors encountered:');
      archiveStats.errors.forEach(err => {
        console.log(`  - ${err.file}: ${err.error}`);
      });
    }

    console.log(`\nStatus: ${archiveStats.errors.length === 0 ? '✓ Success' : '⚠ Completed with errors'}`);
    console.log(`${'='.repeat(70)}\n`);

    return {
      success: archiveStats.errors.length === 0,
      filesArchived: archiveStats.filesArchived,
      totalSize: archiveStats.totalSize,
      archivePath: archivePath,
      errors: archiveStats.errors
    };
  }

  /**
   * Find all files referencing a specific project
   * @param {string} projectName - Project to search for
   * @returns {Array} - Array of file paths
   */
  findProjectFiles(projectName) {
    const files = [];
    const projectFile = path.join(this.memoryRoot, 'project-knowledge', `${projectName}.xml`);

    // Always include the main project file
    if (fs.existsSync(projectFile)) {
      files.push(projectFile);
    }

    // Search all memory directories for project references
    const directories = [
      'session-context',
      'protocol-compliance',
      'agent-coordination',
      'development-patterns',
      'client-context'
    ];

    directories.forEach(dir => {
      const dirPath = path.join(this.memoryRoot, dir);
      if (!fs.existsSync(dirPath)) return;

      const dirFiles = fs.readdirSync(dirPath);
      dirFiles.forEach(file => {
        if (!file.endsWith('.xml')) return;

        const filePath = path.join(dirPath, file);
        try {
          const content = fs.readFileSync(filePath, 'utf8');

          // Check if file references the project
          if (content.includes(`<project>${projectName}</project>`) ||
              content.includes(`<project-name>${projectName}</project-name>`) ||
              content.includes(`>${projectName}</project>`)) {
            files.push(filePath);
          }
        } catch (error) {
          // Skip files that can't be read
        }
      });
    });

    return files;
  }

  /**
   * Generate archive report
   * @param {string} projectName - Project name
   * @param {string} archivePath - Archive directory path
   * @param {Object} stats - Archive statistics
   * @param {Array} files - Files archived
   * @returns {string} - Report text
   */
  generateReport(projectName, archivePath, stats, files) {
    const timestamp = new Date().toISOString();

    let report = '';
    report += '='.repeat(70) + '\n';
    report += 'MEMORY ARCHIVE REPORT\n';
    report += '='.repeat(70) + '\n\n';

    report += `Project: ${projectName}\n`;
    report += `Archive Timestamp: ${timestamp}\n`;
    report += `Archive Location: ${archivePath}\n\n`;

    report += 'STATISTICS\n';
    report += '-'.repeat(70) + '\n';
    report += `Files Archived: ${stats.filesArchived}\n`;
    report += `Total Size: ${this.formatBytes(stats.totalSize)}\n`;
    report += `Errors: ${stats.errors.length}\n\n`;

    report += 'ARCHIVED FILES\n';
    report += '-'.repeat(70) + '\n';
    files.forEach(file => {
      const relativePath = path.relative(this.memoryRoot, file);
      const size = fs.existsSync(file) ? fs.statSync(file).size : 0;
      report += `${relativePath} (${size} bytes)\n`;
    });

    if (stats.errors.length > 0) {
      report += '\nERRORS\n';
      report += '-'.repeat(70) + '\n';
      stats.errors.forEach(err => {
        report += `${err.file}: ${err.error}\n`;
      });
    }

    report += '\n' + '='.repeat(70) + '\n';
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
Memory Archive Script

Archives completed project memory to archive directory with optional compression.

Usage:
  node scripts/memory-archive.js --project <project-name> [options]

Options:
  --project <name>    Project name to archive (required)
  --compress          Compress archived files (optional, not yet implemented)
  --dry-run           Show what would be archived without doing it
  --help              Show this help message

Examples:
  node scripts/memory-archive.js --project my-api-project
  node scripts/memory-archive.js --project my-api-project --compress
  node scripts/memory-archive.js --project my-api-project --dry-run

Exit Codes:
  0 - Success
  1 - Invalid arguments or missing project
  2 - Archive operation failed
  3 - Path validation failed
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

  const projectIndex = args.indexOf('--project');
  if (projectIndex === -1 || !args[projectIndex + 1]) {
    console.error('✗ Error: --project <name> is required\n');
    showHelp();
    process.exit(1);
  }

  const projectName = args[projectIndex + 1];
  const options = {
    compress: args.includes('--compress'),
    dryRun: args.includes('--dry-run')
  };

  const archiver = new MemoryArchiver(process.cwd());

  try {
    const result = await archiver.archive(projectName, options);

    if (!result.success) {
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
module.exports = { MemoryArchiver };

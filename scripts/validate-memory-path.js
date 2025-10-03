/**
 * Memory Path Validation Script
 *
 * Security validation for Claude Code memory system paths.
 * Prevents directory traversal attacks and ensures all paths are within /memories/.
 *
 * Usage:
 *   node scripts/validate-memory-path.js <path-to-validate>
 *
 * Returns:
 *   Exit code 0: Path is valid
 *   Exit code 1: Path is invalid (with error message)
 */

const path = require('path');
const fs = require('fs');

// Security constants
const MEMORY_ROOT = 'memories';
const VALID_SUBDIRECTORIES = [
  'session-context',
  'protocol-compliance',
  'agent-coordination',
  'development-patterns',
  'client-context',
  'project-knowledge'
];

// Path traversal attack patterns
const ATTACK_PATTERNS = [
  /\.\./,           // Parent directory references
  /%2e%2e/i,        // URL-encoded ..
  /%252e%252e/i,    // Double URL-encoded ..
  /\.\.\\/,         // Windows path traversal
  /\.\.\//,         // Unix path traversal
  /%5c/i,           // URL-encoded backslash
  /%2f/i,           // URL-encoded forward slash
  /\0/,             // Null byte injection
  /%00/i            // URL-encoded null byte
];

class MemoryPathValidator {
  constructor(workspaceRoot) {
    this.workspaceRoot = workspaceRoot;
    this.memoryRoot = path.join(workspaceRoot, MEMORY_ROOT);
  }

  /**
   * Validates a memory system path
   * @param {string} inputPath - Path to validate
   * @returns {Object} - { valid: boolean, error?: string, normalizedPath?: string }
   */
  validate(inputPath) {
    // Step 1: Check for attack patterns in raw input
    const attackCheck = this.checkAttackPatterns(inputPath);
    if (!attackCheck.valid) {
      return attackCheck;
    }

    // Step 2: Normalize and resolve the path
    let normalizedPath;
    try {
      // Remove leading/trailing whitespace
      inputPath = inputPath.trim();

      // Normalize path separators for current platform
      inputPath = inputPath.replace(/[\/\\]+/g, path.sep);

      // Resolve to absolute path
      normalizedPath = path.resolve(this.workspaceRoot, inputPath);
    } catch (error) {
      return {
        valid: false,
        error: `Path normalization failed: ${error.message}`
      };
    }

    // Step 3: Verify path is within memory root
    const relativePath = path.relative(this.memoryRoot, normalizedPath);

    // Check if path escapes memory root (starts with .. or is absolute)
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      return {
        valid: false,
        error: `Path must be within ${MEMORY_ROOT}/ directory. Attempted path: ${inputPath}`
      };
    }

    // Step 4: Verify subdirectory is valid
    const subdirectory = this.extractSubdirectory(relativePath);
    if (subdirectory && !VALID_SUBDIRECTORIES.includes(subdirectory)) {
      return {
        valid: false,
        error: `Invalid subdirectory: ${subdirectory}. Valid subdirectories: ${VALID_SUBDIRECTORIES.join(', ')}`
      };
    }

    // Step 5: Verify file extension is .xml
    if (relativePath && !relativePath.endsWith('.xml')) {
      return {
        valid: false,
        error: `Memory files must have .xml extension. Provided: ${path.extname(normalizedPath) || '(no extension)'}`
      };
    }

    // All checks passed
    return {
      valid: true,
      normalizedPath: normalizedPath,
      relativePath: relativePath,
      subdirectory: subdirectory
    };
  }

  /**
   * Checks for known attack patterns
   * @param {string} inputPath - Raw input path
   * @returns {Object} - { valid: boolean, error?: string }
   */
  checkAttackPatterns(inputPath) {
    for (const pattern of ATTACK_PATTERNS) {
      if (pattern.test(inputPath)) {
        return {
          valid: false,
          error: `Security violation: Path contains suspicious pattern (${pattern.source})`
        };
      }
    }
    return { valid: true };
  }

  /**
   * Extracts the first subdirectory from a relative path
   * @param {string} relativePath - Relative path from memory root
   * @returns {string|null} - Subdirectory name or null
   */
  extractSubdirectory(relativePath) {
    if (!relativePath) return null;
    const parts = relativePath.split(path.sep);
    return parts[0] || null;
  }

  /**
   * Validates file size is within limits
   * @param {string} filePath - Path to file to check
   * @returns {Object} - { valid: boolean, error?: string, size?: number }
   */
  validateFileSize(filePath) {
    const MAX_FILE_SIZE = 50 * 1024; // 50KB

    try {
      const stats = fs.statSync(filePath);
      if (stats.size > MAX_FILE_SIZE) {
        return {
          valid: false,
          error: `File size (${stats.size} bytes) exceeds maximum (${MAX_FILE_SIZE} bytes)`,
          size: stats.size
        };
      }
      return {
        valid: true,
        size: stats.size
      };
    } catch (error) {
      // File doesn't exist yet - that's okay for validation
      if (error.code === 'ENOENT') {
        return { valid: true, size: 0 };
      }
      return {
        valid: false,
        error: `File size check failed: ${error.message}`
      };
    }
  }
}

/**
 * Run comprehensive test suite
 */
function runTests() {
  console.log('Running Memory Path Validator Test Suite\n');
  console.log('='.repeat(60));

  const validator = new MemoryPathValidator(process.cwd());
  let passed = 0;
  let failed = 0;

  const tests = [
    // Valid paths
    {
      name: 'Valid session-context path',
      path: 'memories/session-context/active-project.xml',
      shouldPass: true
    },
    {
      name: 'Valid protocol-compliance path',
      path: 'memories/protocol-compliance/uncertainty-log.xml',
      shouldPass: true
    },
    {
      name: 'Valid agent-coordination path',
      path: 'memories/agent-coordination/handoff-log.xml',
      shouldPass: true
    },
    {
      name: 'Valid development-patterns path',
      path: 'memories/development-patterns/debugging-solutions.xml',
      shouldPass: true
    },
    {
      name: 'Valid client-context path',
      path: 'memories/client-context/preferences.xml',
      shouldPass: true
    },
    {
      name: 'Valid project-knowledge path',
      path: 'memories/project-knowledge/myproject.xml',
      shouldPass: true
    },
    // Attack attempts - Directory traversal
    {
      name: 'Attack: Parent directory traversal (..)',
      path: 'memories/../passwords.txt',
      shouldPass: false
    },
    {
      name: 'Attack: Multiple parent traversal',
      path: 'memories/../../etc/passwd',
      shouldPass: false
    },
    {
      name: 'Attack: Windows path traversal',
      path: 'memories\\..\\..\\windows\\system32',
      shouldPass: false
    },
    {
      name: 'Attack: URL-encoded parent (.%2e)',
      path: 'memories/.%2e/secrets.xml',
      shouldPass: false
    },
    {
      name: 'Attack: Double URL-encoded (..%252e)',
      path: 'memories/..%252e/data.xml',
      shouldPass: false
    },
    // Attack attempts - Invalid locations
    {
      name: 'Attack: Absolute path escape',
      path: '/etc/passwd',
      shouldPass: false
    },
    {
      name: 'Attack: Absolute Windows path',
      path: 'C:\\Windows\\System32\\config',
      shouldPass: false
    },
    // Attack attempts - Null byte injection
    {
      name: 'Attack: Null byte injection',
      path: 'memories/test.xml\0.txt',
      shouldPass: false
    },
    {
      name: 'Attack: URL-encoded null byte',
      path: 'memories/test.xml%00.txt',
      shouldPass: false
    },
    // Invalid subdirectories
    {
      name: 'Invalid: Wrong subdirectory',
      path: 'memories/invalid-dir/file.xml',
      shouldPass: false
    },
    {
      name: 'Invalid: No subdirectory',
      path: 'memories/file.xml',
      shouldPass: false
    },
    // Invalid extensions
    {
      name: 'Invalid: Wrong extension (.txt)',
      path: 'memories/session-context/file.txt',
      shouldPass: false
    },
    {
      name: 'Invalid: No extension',
      path: 'memories/session-context/file',
      shouldPass: false
    },
    {
      name: 'Invalid: Wrong extension (.json)',
      path: 'memories/protocol-compliance/data.json',
      shouldPass: false
    }
  ];

  tests.forEach((test, index) => {
    const result = validator.validate(test.path);
    const testPassed = result.valid === test.shouldPass;

    if (testPassed) {
      passed++;
      console.log(`✓ Test ${index + 1}: ${test.name}`);
    } else {
      failed++;
      console.log(`✗ Test ${index + 1}: ${test.name}`);
      console.log(`  Expected: ${test.shouldPass ? 'PASS' : 'FAIL'}`);
      console.log(`  Got: ${result.valid ? 'PASS' : 'FAIL'}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));

  return failed === 0;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);

  // If --test flag, run test suite
  if (args.includes('--test')) {
    const success = runTests();
    process.exit(success ? 0 : 1);
  }

  // Otherwise, validate provided path
  if (args.length === 0) {
    console.error('Usage: node validate-memory-path.js <path-to-validate>');
    console.error('       node validate-memory-path.js --test');
    process.exit(1);
  }

  const inputPath = args[0];
  const validator = new MemoryPathValidator(process.cwd());
  const result = validator.validate(inputPath);

  if (result.valid) {
    console.log('✓ Path is valid');
    console.log(`  Normalized: ${result.normalizedPath}`);
    console.log(`  Relative: ${result.relativePath}`);
    console.log(`  Subdirectory: ${result.subdirectory}`);

    // Check file size if file exists
    if (fs.existsSync(result.normalizedPath)) {
      const sizeCheck = validator.validateFileSize(result.normalizedPath);
      if (sizeCheck.valid) {
        console.log(`  File size: ${sizeCheck.size} bytes (OK)`);
      } else {
        console.error(`✗ ${sizeCheck.error}`);
        process.exit(1);
      }
    }

    process.exit(0);
  } else {
    console.error(`✗ Invalid path: ${result.error}`);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

// Export for testing
module.exports = { MemoryPathValidator, VALID_SUBDIRECTORIES, MEMORY_ROOT };

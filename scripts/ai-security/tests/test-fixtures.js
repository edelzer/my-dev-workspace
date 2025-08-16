#!/usr/bin/env node

/**
 * AI Security Test Fixtures
 * Phase 3 Task 3.1.3: Security AI Validation and Tuning
 * 
 * Comprehensive test fixtures with known vulnerabilities for validation testing
 * Protocol Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');

class SecurityTestFixtures {
  constructor() {
    this.fixtures = new Map();
    this.vulnerabilityTypes = [
      'SQL_INJECTION',
      'XSS',
      'COMMAND_INJECTION',
      'PATH_TRAVERSAL',
      'INSECURE_RANDOM',
      'HARDCODED_SECRET',
      'WEAK_CRYPTO',
      'UNVALIDATED_REDIRECT',
      'CSRF',
      'AUTHENTICATION_BYPASS'
    ];
  }

  // SQL Injection Test Cases
  createSQLInjectionFixtures() {
    return {
      'sql-injection-basic.js': {
        code: `
// VULNERABLE: Basic SQL injection
function getUserData(userId) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.query(query);
}

// VULNERABLE: String concatenation with user input
function searchUsers(searchTerm) {
  const sql = \`SELECT * FROM users WHERE name LIKE '%\${searchTerm}%'\`;
  return database.execute(sql);
}`,
        expected_vulnerabilities: [
          {
            type: 'SQL_INJECTION',
            line: 3,
            severity: 'CRITICAL',
            confidence: 0.95
          },
          {
            type: 'SQL_INJECTION', 
            line: 8,
            severity: 'CRITICAL',
            confidence: 0.90
          }
        ],
        false_positive_probability: 0.02
      },

      'sql-injection-advanced.js': {
        code: `
// VULNERABLE: Dynamic query building
function buildUserQuery(filters) {
  let query = "SELECT * FROM users WHERE 1=1";
  for (const [key, value] of Object.entries(filters)) {
    query += " AND " + key + " = '" + value + "'";
  }
  return db.query(query);
}

// SECURE: Parameterized query (should not trigger)
function getUserSecure(userId) {
  const query = "SELECT * FROM users WHERE id = ?";
  return db.query(query, [userId]);
}`,
        expected_vulnerabilities: [
          {
            type: 'SQL_INJECTION',
            line: 5,
            severity: 'HIGH',
            confidence: 0.85
          }
        ],
        false_positive_probability: 0.05
      }
    };
  }

  // XSS Test Cases
  createXSSFixtures() {
    return {
      'xss-basic.js': {
        code: `
// VULNERABLE: Direct HTML injection
function displayUserComment(comment) {
  document.getElementById('comments').innerHTML = comment;
}

// VULNERABLE: React dangerouslySetInnerHTML
function UserPost({ content }) {
  return <div dangerouslySetInnerHTML={{__html: content}} />;
}

// VULNERABLE: Template literal injection
function generateHTML(userInput) {
  return \`<div class="user-content">\${userInput}</div>\`;
}`,
        expected_vulnerabilities: [
          {
            type: 'XSS',
            line: 3,
            severity: 'HIGH',
            confidence: 0.90
          },
          {
            type: 'XSS',
            line: 8,
            severity: 'HIGH', 
            confidence: 0.88
          },
          {
            type: 'XSS',
            line: 13,
            severity: 'MEDIUM',
            confidence: 0.75
          }
        ],
        false_positive_probability: 0.03
      },

      'xss-react-false-positive.jsx': {
        code: `
// SECURE: React automatic escaping (potential false positive)
function UserComment({ comment }) {
  return <div className="comment">{comment}</div>;
}

// SECURE: React with proper sanitization
import DOMPurify from 'dompurify';
function SafeHTML({ content }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{__html: sanitized}} />;
}`,
        expected_vulnerabilities: [],
        false_positive_probability: 0.25 // Higher due to React context
      }
    };
  }

  // Command Injection Test Cases
  createCommandInjectionFixtures() {
    return {
      'command-injection.js': {
        code: `
const { exec } = require('child_process');

// VULNERABLE: Direct command execution
function processFile(filename) {
  exec(\`ls -la \${filename}\`, (error, stdout) => {
    console.log(stdout);
  });
}

// VULNERABLE: Shell injection
function gitClone(repoUrl) {
  const command = "git clone " + repoUrl;
  exec(command);
}

// SECURE: Proper input validation (should not trigger)
function processFileSecure(filename) {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new Error('Invalid filename');
  }
  exec('ls -la', [filename]);
}`,
        expected_vulnerabilities: [
          {
            type: 'COMMAND_INJECTION',
            line: 5,
            severity: 'CRITICAL',
            confidence: 0.92
          },
          {
            type: 'COMMAND_INJECTION',
            line: 12,
            severity: 'HIGH',
            confidence: 0.87
          }
        ],
        false_positive_probability: 0.03
      }
    };
  }

  // Path Traversal Test Cases
  createPathTraversalFixtures() {
    return {
      'path-traversal.js': {
        code: `
const fs = require('fs');
const path = require('path');

// VULNERABLE: Direct path concatenation
function readFile(filename) {
  const filePath = './uploads/' + filename;
  return fs.readFileSync(filePath);
}

// VULNERABLE: Path join without validation
function serveFile(req, res) {
  const filePath = path.join(__dirname, 'public', req.params.file);
  res.sendFile(filePath);
}

// SECURE: Proper path validation
function readFileSecure(filename) {
  const basePath = path.resolve('./uploads');
  const fullPath = path.resolve(basePath, filename);
  if (!fullPath.startsWith(basePath)) {
    throw new Error('Invalid path');
  }
  return fs.readFileSync(fullPath);
}`,
        expected_vulnerabilities: [
          {
            type: 'PATH_TRAVERSAL',
            line: 6,
            severity: 'HIGH',
            confidence: 0.85
          },
          {
            type: 'PATH_TRAVERSAL',
            line: 11,
            severity: 'MEDIUM',
            confidence: 0.70
          }
        ],
        false_positive_probability: 0.08
      }
    };
  }

  // Cryptographic Issues
  createCryptoFixtures() {
    return {
      'crypto-vulnerabilities.js': {
        code: `
const crypto = require('crypto');

// VULNERABLE: Weak random number generation
function generateToken() {
  return Math.random().toString(36);
}

// VULNERABLE: Hardcoded secret
const SECRET_KEY = 'hardcoded-secret-key-123';

// VULNERABLE: Weak encryption
function encryptData(data) {
  const cipher = crypto.createCipher('des', SECRET_KEY);
  return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

// VULNERABLE: MD5 hashing
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// SECURE: Strong random generation
function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex');
}`,
        expected_vulnerabilities: [
          {
            type: 'INSECURE_RANDOM',
            line: 5,
            severity: 'MEDIUM',
            confidence: 0.80
          },
          {
            type: 'HARDCODED_SECRET',
            line: 9,
            severity: 'HIGH',
            confidence: 0.95
          },
          {
            type: 'WEAK_CRYPTO',
            line: 13,
            severity: 'HIGH',
            confidence: 0.88
          },
          {
            type: 'WEAK_CRYPTO',
            line: 18,
            severity: 'MEDIUM',
            confidence: 0.82
          }
        ],
        false_positive_probability: 0.04
      }
    };
  }

  // Authentication and Authorization Issues
  createAuthFixtures() {
    return {
      'auth-vulnerabilities.js': {
        code: `
// VULNERABLE: Missing authentication check
function deleteUser(userId) {
  return db.query('DELETE FROM users WHERE id = ?', [userId]);
}

// VULNERABLE: Weak session management
function createSession(user) {
  const sessionId = user.id + '_' + Date.now();
  sessions[sessionId] = user;
  return sessionId;
}

// VULNERABLE: Authorization bypass
function updateUserProfile(userId, profileData) {
  // Missing: check if current user can update this profile
  return db.query('UPDATE users SET ? WHERE id = ?', [profileData, userId]);
}

// VULNERABLE: Unvalidated redirect
function loginRedirect(redirectUrl) {
  if (isValidUser()) {
    window.location = redirectUrl; // No validation
  }
}`,
        expected_vulnerabilities: [
          {
            type: 'AUTHENTICATION_BYPASS',
            line: 3,
            severity: 'HIGH',
            confidence: 0.75
          },
          {
            type: 'INSECURE_RANDOM',
            line: 8,
            severity: 'MEDIUM',
            confidence: 0.70
          },
          {
            type: 'AUTHENTICATION_BYPASS',
            line: 14,
            severity: 'HIGH',
            confidence: 0.80
          },
          {
            type: 'UNVALIDATED_REDIRECT',
            line: 21,
            severity: 'MEDIUM',
            confidence: 0.85
          }
        ],
        false_positive_probability: 0.12
      }
    };
  }

  // Test cases designed to trigger false positives
  createFalsePositiveFixtures() {
    return {
      'false-positive-tests.js': {
        code: `
// TEST: Should not trigger (test file pattern)
describe('SQL injection tests', () => {
  it('should prevent SQL injection', () => {
    const maliciousInput = "'; DROP TABLE users; --";
    expect(sanitizeInput(maliciousInput)).toBe("''; DROP TABLE users; --");
  });
});

// MOCK: Should not trigger (mock data)
const mockUserData = {
  query: "SELECT * FROM users WHERE id = " + mockId,
  script: "<script>alert('test')</script>"
};

// EXAMPLE: Should not trigger (documentation)
/* Example of vulnerable code (do not use):
   const query = "SELECT * FROM users WHERE name = '" + userName + "'";
*/

// CONFIG: Should not trigger (configuration)
const testConfig = {
  database: 'test',
  password: 'test-password-not-real'
};`,
        expected_vulnerabilities: [],
        false_positive_probability: 0.60 // Very high - these should be filtered out
      },

      'framework-protections.jsx': {
        code: `
// React protections - should have lower false positive rate
import React from 'react';

function UserProfile({ user }) {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <div className="bio">{user.bio}</div>
    </div>
  );
}

// Express with protection middleware
const express = require('express');
const helmet = require('helmet');
const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // This might look like SQL injection but has framework protections
  const user = orm.findById(userId);
  res.json(user);
});`,
        expected_vulnerabilities: [],
        false_positive_probability: 0.30 // Should be reduced by framework detection
      }
    };
  }

  // Create comprehensive test fixture set
  async generateAllFixtures() {
    // Combine all fixture types
    const allFixtures = {
      ...this.createSQLInjectionFixtures(),
      ...this.createXSSFixtures(),
      ...this.createCommandInjectionFixtures(),
      ...this.createPathTraversalFixtures(),
      ...this.createCryptoFixtures(),
      ...this.createAuthFixtures(),
      ...this.createFalsePositiveFixtures()
    };

    // Add metadata to each fixture
    for (const [filename, fixture] of Object.entries(allFixtures)) {
      fixture.metadata = {
        filename,
        created: new Date().toISOString(),
        vulnerability_count: fixture.expected_vulnerabilities.length,
        total_lines: fixture.code.split('\n').length,
        primary_language: this.detectLanguage(filename),
        test_category: this.categorizeTest(filename),
        complexity_score: this.calculateComplexity(fixture.code)
      };
    }

    this.fixtures = new Map(Object.entries(allFixtures));
    return allFixtures;
  }

  detectLanguage(filename) {
    const ext = path.extname(filename);
    const languageMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.go': 'go'
    };
    return languageMap[ext] || 'javascript';
  }

  categorizeTest(filename) {
    if (filename.includes('false-positive')) return 'false_positive_test';
    if (filename.includes('sql')) return 'sql_injection_test';
    if (filename.includes('xss')) return 'xss_test';
    if (filename.includes('command')) return 'command_injection_test';
    if (filename.includes('path')) return 'path_traversal_test';
    if (filename.includes('crypto')) return 'cryptography_test';
    if (filename.includes('auth')) return 'authentication_test';
    return 'general_security_test';
  }

  calculateComplexity(code) {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const functions = (code.match(/function\s+\w+/g) || []).length;
    const conditionals = (code.match(/if\s*\(|switch\s*\(|while\s*\(|for\s*\(/g) || []).length;
    
    return {
      line_count: lines.length,
      function_count: functions,
      conditional_count: conditionals,
      complexity_score: (functions * 2) + conditionals + (lines.length * 0.1)
    };
  }

  // Write fixtures to disk for testing
  async writeFixturesToDisk(outputDir) {
    const fixturesDir = path.join(outputDir, 'fixtures');
    await fs.mkdir(fixturesDir, { recursive: true });

    const fixtureIndex = {
      total_fixtures: this.fixtures.size,
      vulnerability_types: this.vulnerabilityTypes,
      created: new Date().toISOString(),
      fixtures: {}
    };

    for (const [filename, fixture] of this.fixtures) {
      const filePath = path.join(fixturesDir, filename);
      await fs.writeFile(filePath, fixture.code);
      
      // Create metadata file
      const metadataPath = path.join(fixturesDir, `${filename}.meta.json`);
      await fs.writeFile(metadataPath, JSON.stringify({
        ...fixture.metadata,
        expected_vulnerabilities: fixture.expected_vulnerabilities,
        false_positive_probability: fixture.false_positive_probability
      }, null, 2));

      fixtureIndex.fixtures[filename] = {
        file_path: filePath,
        metadata_path: metadataPath,
        expected_vulnerabilities: fixture.expected_vulnerabilities.length,
        false_positive_probability: fixture.false_positive_probability
      };
    }

    // Write index file
    const indexPath = path.join(outputDir, 'fixture-index.json');
    await fs.writeFile(indexPath, JSON.stringify(fixtureIndex, null, 2));

    return {
      fixtures_written: this.fixtures.size,
      output_directory: fixturesDir,
      index_file: indexPath
    };
  }

  // Generate validation expectations for testing
  generateValidationExpectations() {
    const expectations = {
      accuracy_targets: {
        overall_accuracy: 0.95,
        false_positive_rate: 0.05,
        false_negative_rate: 0.03,
        confidence_threshold: 0.70
      },
      per_vulnerability_type: {},
      test_scenarios: []
    };

    // Calculate per-type expectations
    for (const vulnType of this.vulnerabilityTypes) {
      const typeFixtures = Array.from(this.fixtures.values()).filter(fixture =>
        fixture.expected_vulnerabilities.some(v => v.type === vulnType)
      );

      if (typeFixtures.length > 0) {
        expectations.per_vulnerability_type[vulnType] = {
          test_cases: typeFixtures.length,
          expected_detections: typeFixtures.reduce((sum, f) => 
            sum + f.expected_vulnerabilities.filter(v => v.type === vulnType).length, 0
          ),
          average_confidence_threshold: 0.75,
          max_false_positive_rate: 0.08
        };
      }
    }

    // Define test scenarios
    expectations.test_scenarios = [
      {
        name: 'high_confidence_detection',
        description: 'Critical vulnerabilities should be detected with >90% confidence',
        criteria: 'expected_vulnerabilities.severity === "CRITICAL"',
        target_confidence: 0.90
      },
      {
        name: 'false_positive_filtering',
        description: 'Test files and mock data should not trigger alerts',
        criteria: 'filename.includes("false-positive")',
        target_false_positive_rate: 0.10
      },
      {
        name: 'framework_awareness',
        description: 'Framework protections should reduce false positives',
        criteria: 'filename.includes("framework")',
        target_false_positive_rate: 0.15
      },
      {
        name: 'context_understanding',
        description: 'Complex code contexts should be properly analyzed',
        criteria: 'metadata.complexity_score > 10',
        target_accuracy: 0.88
      }
    ];

    return expectations;
  }
}

// Command line interface
if (require.main === module) {
  async function main() {
    const fixtures = new SecurityTestFixtures();
    
    console.log('🔧 Generating AI security test fixtures...');
    await fixtures.generateAllFixtures();
    
    const outputDir = path.join(__dirname);
    const result = await fixtures.writeFixturesToDisk(outputDir);
    
    console.log('✅ Test fixtures generated:');
    console.log(`   Fixtures written: ${result.fixtures_written}`);
    console.log(`   Output directory: ${result.output_directory}`);
    console.log(`   Index file: ${result.index_file}`);
    
    // Generate validation expectations
    const expectations = fixtures.generateValidationExpectations();
    const expectationsPath = path.join(outputDir, 'validation-expectations.json');
    await fs.writeFile(expectationsPath, JSON.stringify(expectations, null, 2));
    
    console.log(`   Validation expectations: ${expectationsPath}`);
    console.log('\n🎯 Test fixture generation completed successfully!');
  }
  
  main().catch(console.error);
}

module.exports = SecurityTestFixtures;
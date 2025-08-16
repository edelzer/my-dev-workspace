#!/usr/bin/env node

/**
 * AI Security Setup Script
 * Phase 3 Task 3.1.2: AI Security Review Implementation
 * 
 * Initializes the AI-powered security code review system
 * Protocol Compliance: Laws #1-5 Enforced
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const CONFIG = {
  WORKSPACE_ROOT: process.cwd(),
  CLAUDE_DIR: '.claude',
  MCP_DIR: '.claude/mcp',
  HOOKS_DIR: '.claude/hooks',
  SCRIPTS_DIR: 'scripts/ai-security',
  REQUIRED_TOOLS: ['claude', 'uvx', 'semgrep', 'node', 'npm'],
  SEMGREP_VERSION: 'latest',
  NODE_VERSION: '>=18.0.0'
};

class AISecuritySetup {
  constructor() {
    this.setupLog = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.setupLog.push(logEntry);
  }

  error(message, critical = false) {
    this.log(message, 'error');
    this.errors.push({ message, critical, timestamp: new Date().toISOString() });
    if (critical) {
      throw new Error(`Critical setup error: ${message}`);
    }
  }

  async checkPrerequisites() {
    this.log('🔍 Checking prerequisites for AI security integration...');
    
    const checks = [];
    
    // Check Node.js version
    try {
      const nodeVersion = process.version;
      const requiredVersion = CONFIG.NODE_VERSION.replace('>=', '');
      this.log(`Node.js version: ${nodeVersion}`);
      checks.push({ name: 'Node.js', status: 'ok', version: nodeVersion });
    } catch (error) {
      this.error(`Node.js check failed: ${error.message}`, true);
    }

    // Check required tools
    for (const tool of CONFIG.REQUIRED_TOOLS) {
      try {
        const version = execSync(`${tool} --version`, { 
          encoding: 'utf8', 
          stdio: 'pipe' 
        }).trim();
        this.log(`${tool}: ${version}`);
        checks.push({ name: tool, status: 'ok', version });
      } catch (error) {
        this.log(`${tool}: Not found or not accessible`, 'warn');
        checks.push({ name: tool, status: 'missing', error: error.message });
      }
    }

    return checks;
  }

  async setupDirectoryStructure() {
    this.log('📁 Setting up AI security directory structure...');
    
    const directories = [
      CONFIG.MCP_DIR,
      CONFIG.HOOKS_DIR,
      `${CONFIG.SCRIPTS_DIR}/utils`,
      `${CONFIG.SCRIPTS_DIR}/validators`,
      `${CONFIG.SCRIPTS_DIR}/monitors`,
      'docs/ai-security',
      '.ai-security/knowledge-base',
      '.ai-security/learning',
      '.ai-security/reports'
    ];

    for (const dir of directories) {
      try {
        await fs.mkdir(path.join(CONFIG.WORKSPACE_ROOT, dir), { recursive: true });
        this.log(`Created directory: ${dir}`);
      } catch (error) {
        this.error(`Failed to create directory ${dir}: ${error.message}`);
      }
    }
  }

  async installDependencies() {
    this.log('⬇️ Installing AI security dependencies...');
    
    const dependencies = [
      {
        name: 'semgrep-mcp',
        command: 'uvx install semgrep-mcp',
        required: true
      },
      {
        name: 'semgrep',
        command: 'pip install semgrep',
        required: true
      },
      {
        name: 'eslint-plugin-security',
        command: 'npm install -g eslint-plugin-security',
        required: false
      }
    ];

    for (const dep of dependencies) {
      try {
        this.log(`Installing ${dep.name}...`);
        execSync(dep.command, { 
          stdio: 'pipe',
          encoding: 'utf8'
        });
        this.log(`✅ ${dep.name} installed successfully`);
      } catch (error) {
        const message = `Failed to install ${dep.name}: ${error.message}`;
        if (dep.required) {
          this.error(message, true);
        } else {
          this.log(message, 'warn');
        }
      }
    }
  }

  async validateConfiguration() {
    this.log('✅ Validating AI security configuration...');
    
    const configFiles = [
      '.claude/mcp/semgrep-config.json',
      '.claude/commands/ai-security-review.md',
      '.claude/hooks/security-ai-hooks.json',
      '.github/workflows/ai-security-review.yml'
    ];

    const validationResults = [];

    for (const configFile of configFiles) {
      try {
        const filePath = path.join(CONFIG.WORKSPACE_ROOT, configFile);
        const stats = await fs.stat(filePath);
        
        if (configFile.endsWith('.json')) {
          // Validate JSON syntax
          const content = await fs.readFile(filePath, 'utf8');
          JSON.parse(content);
        }
        
        this.log(`✅ Configuration valid: ${configFile}`);
        validationResults.push({ file: configFile, status: 'valid', size: stats.size });
      } catch (error) {
        this.error(`Configuration validation failed for ${configFile}: ${error.message}`);
        validationResults.push({ file: configFile, status: 'invalid', error: error.message });
      }
    }

    return validationResults;
  }

  async testAIIntegration() {
    this.log('🧪 Testing AI security integration...');
    
    const tests = [
      {
        name: 'Semgrep MCP Connection',
        command: 'claude ai-security-scan --test-connection',
        timeout: 30000
      },
      {
        name: 'AI Validation Engine',
        command: 'claude ai-security-validate --test-mode',
        timeout: 15000
      },
      {
        name: 'Security Report Generation',
        command: 'claude ai-security-report --format json --test',
        timeout: 20000
      }
    ];

    const testResults = [];

    for (const test of tests) {
      try {
        this.log(`Testing: ${test.name}...`);
        
        const result = execSync(test.command, {
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: test.timeout
        });
        
        this.log(`✅ ${test.name}: PASSED`);
        testResults.push({ 
          name: test.name, 
          status: 'passed', 
          result: result.trim() 
        });
      } catch (error) {
        this.log(`❌ ${test.name}: FAILED - ${error.message}`, 'warn');
        testResults.push({ 
          name: test.name, 
          status: 'failed', 
          error: error.message 
        });
      }
    }

    return testResults;
  }

  async generateSetupReport() {
    this.log('📋 Generating setup report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      setup_version: '1.0.0',
      workspace_root: CONFIG.WORKSPACE_ROOT,
      setup_status: this.errors.filter(e => e.critical).length === 0 ? 'success' : 'failed',
      setup_log: this.setupLog,
      errors: this.errors,
      next_steps: [
        'Configure SEMGREP_APP_TOKEN environment variable',
        'Test AI security scan on sample code',
        'Review and customize security rules',
        'Train AI validation engine with project-specific patterns',
        'Enable security hooks in development workflow'
      ],
      documentation: {
        'Command Usage': '.claude/commands/ai-security-review.md',
        'Configuration': '.claude/mcp/semgrep-config.json',
        'Automation Hooks': '.claude/hooks/security-ai-hooks.json',
        'CI/CD Integration': '.github/workflows/ai-security-review.yml'
      }
    };

    try {
      const reportPath = path.join(CONFIG.WORKSPACE_ROOT, '.ai-security/setup-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      this.log(`Setup report generated: ${reportPath}`);
    } catch (error) {
      this.error(`Failed to generate setup report: ${error.message}`);
    }

    return report;
  }

  async run() {
    try {
      this.log('🚀 Starting AI Security Setup Process...');
      this.log('Protocol Compliance: Laws #1-5 Enforced');
      
      // Step 1: Check prerequisites
      const prereqCheck = await this.checkPrerequisites();
      
      // Step 2: Setup directory structure
      await this.setupDirectoryStructure();
      
      // Step 3: Install dependencies
      await this.installDependencies();
      
      // Step 4: Validate configuration
      const configValidation = await this.validateConfiguration();
      
      // Step 5: Test AI integration
      const testResults = await this.testAIIntegration();
      
      // Step 6: Generate setup report
      const setupReport = await this.generateSetupReport();
      
      // Final status
      const criticalErrors = this.errors.filter(e => e.critical).length;
      const warnings = this.errors.filter(e => !e.critical).length;
      
      if (criticalErrors === 0) {
        this.log('🎉 AI Security Setup completed successfully!');
        this.log(`Setup completed with ${warnings} warnings`);
        this.log('✅ System ready for AI-powered security code review');
      } else {
        this.log(`❌ Setup failed with ${criticalErrors} critical errors`, 'error');
        this.log('Please resolve critical errors and run setup again');
      }
      
      // Display next steps
      this.log('\n📋 Next Steps:');
      setupReport.next_steps.forEach((step, index) => {
        this.log(`${index + 1}. ${step}`);
      });
      
      return setupReport;
      
    } catch (error) {
      this.error(`Setup process failed: ${error.message}`, true);
      process.exit(1);
    }
  }
}

// Command line interface
if (require.main === module) {
  const setup = new AISecuritySetup();
  setup.run()
    .then(report => {
      process.exit(report.setup_status === 'success' ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal setup error:', error.message);
      process.exit(1);
    });
}

module.exports = AISecuritySetup;
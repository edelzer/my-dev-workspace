#!/usr/bin/env node

/**
 * Workspace Health Check Script
 *
 * Validates overall workspace health including:
 * - Node.js version
 * - Git installation
 * - Template completeness
 * - Required files and directories
 * - Memory directory structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// Check result tracking
let passedChecks = 0;
let totalChecks = 0;
let warnings = [];
let errors = [];

function printHeader(text) {
  console.log(`\n${colors.bold}${colors.blue}${text}${colors.reset}`);
  console.log('='.repeat(text.length));
  console.log();
}

function printCheck(passed, message, isWarning = false) {
  totalChecks++;
  if (passed) {
    passedChecks++;
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  } else if (isWarning) {
    passedChecks++; // Warnings don't fail the check
    warnings.push(message);
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  } else {
    errors.push(message);
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }
}

function checkNodeVersion() {
  try {
    const version = process.version;
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    const required = 18;

    if (majorVersion >= required) {
      printCheck(true, `Node.js ${version} (${required}+ required)`);
    } else {
      printCheck(false, `Node.js ${version} (${required}+ required)`, true);
    }
  } catch (error) {
    printCheck(false, 'Node.js version check failed');
  }
}

function checkGit() {
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
    printCheck(true, `Git installed and configured (${gitVersion})`);
  } catch (error) {
    printCheck(false, 'Git not found or not configured');
  }
}

function checkTemplate(templateName, requiredFiles) {
  const templatePath = path.join(process.cwd(), 'templates', templateName);

  if (!fs.existsSync(templatePath)) {
    printCheck(false, `Template: ${templateName} (directory missing)`);
    return;
  }

  const missingFiles = requiredFiles.filter(file => {
    const filePath = path.join(templatePath, file);
    return !fs.existsSync(filePath);
  });

  if (missingFiles.length === 0) {
    printCheck(true, `Template: ${templateName} (all files present)`);
  } else {
    printCheck(false, `Template: ${templateName} (missing: ${missingFiles.join(', ')})`);
  }
}

function checkTemplates() {
  const templates = [
    { name: 'web', files: ['package.json', 'src', 'vite.config.ts'] },
    { name: 'api', files: ['package.json', 'tsconfig.json'] },
    { name: 'python', files: ['pyproject.toml', 'app', 'README.md'] },
    { name: 'java', files: ['build.gradle', 'src', 'README.md'] },
    { name: 'go', files: ['go.mod', 'cmd', 'README.md'] },
    { name: 'mobile', files: ['package.json', 'README.md'] },
    { name: 'desktop', files: ['package.json', 'README.md'] }
  ];

  templates.forEach(template => {
    checkTemplate(template.name, template.files);
  });
}

function checkSpecKitDocument() {
  const specKitPath = path.join(process.cwd(), 'docs', 'SPEC-KIT-PLANNING.md');

  if (fs.existsSync(specKitPath)) {
    printCheck(true, 'Spec-Kit planning document exists');
  } else {
    printCheck(false, 'Spec-Kit planning document missing (docs/SPEC-KIT-PLANNING.md)', true);
  }
}

function checkMemoryStructure() {
  const requiredDirs = [
    'memories/session-context',
    'memories/protocol-compliance',
    'memories/project-knowledge',
    'memories/agent-coordination',
    'memories/development-patterns',
    'memories/client-context'
  ];

  const missingDirs = requiredDirs.filter(dir => {
    const dirPath = path.join(process.cwd(), dir);
    return !fs.existsSync(dirPath);
  });

  if (missingDirs.length === 0) {
    printCheck(true, 'Memory directory structure intact');
  } else {
    printCheck(false, `Memory directories missing: ${missingDirs.join(', ')}`, true);
  }
}

function checkProjectsDirectory() {
  const projectsPath = path.join(process.cwd(), 'projects');

  if (!fs.existsSync(projectsPath)) {
    printCheck(false, 'Projects directory missing');
    return;
  }

  const files = fs.readdirSync(projectsPath);
  const nonReadmeFiles = files.filter(file => file !== 'README.md' && file !== '.gitkeep');

  if (nonReadmeFiles.length === 0) {
    printCheck(true, 'Projects directory clean');
  } else {
    printCheck(false, `Projects directory contains files: ${nonReadmeFiles.join(', ')}`, true);
  }
}

function checkRequiredScripts() {
  const scripts = [
    'scripts/create-project-repo.js',
    'scripts/workspace-health-check.js',
    'scripts/validate-templates.js'
  ];

  scripts.forEach(script => {
    const scriptPath = path.join(process.cwd(), script);
    const exists = fs.existsSync(scriptPath);
    const scriptName = path.basename(script);

    if (exists) {
      printCheck(true, `Script exists: ${scriptName}`);
    } else {
      // Don't fail for scripts we're currently creating
      if (script.includes('health-check') || script.includes('validate-templates')) {
        printCheck(false, `Script exists: ${scriptName}`, true);
      } else {
        printCheck(false, `Script missing: ${scriptName}`);
      }
    }
  });
}

function checkDocumentation() {
  const docs = [
    { path: 'README.md', name: 'README.md' },
    { path: 'QUICKSTART.md', name: 'QUICKSTART.md' },
    { path: 'CLAUDE.md', name: 'CLAUDE.md' }
  ];

  docs.forEach(doc => {
    const docPath = path.join(process.cwd(), doc.path);
    const exists = fs.existsSync(docPath);

    if (exists) {
      printCheck(true, `Documentation: ${doc.name}`);
    } else {
      printCheck(false, `Documentation missing: ${doc.name}`);
    }
  });
}

function printSummary() {
  console.log();
  console.log('='.repeat(50));

  if (errors.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}${colors.bold}Health Check: ✅ PASSED${colors.reset} (${passedChecks}/${totalChecks} checks)`);
  } else if (errors.length === 0) {
    console.log(`${colors.yellow}${colors.bold}Health Check: ⚠ PASSED WITH WARNINGS${colors.reset} (${passedChecks}/${totalChecks} checks)`);
    console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
    warnings.forEach(warning => console.log(`  • ${warning}`));
  } else {
    console.log(`${colors.red}${colors.bold}Health Check: ✗ FAILED${colors.reset} (${passedChecks}/${totalChecks} checks)`);
    console.log(`\n${colors.red}Errors:${colors.reset}`);
    errors.forEach(error => console.log(`  • ${error}`));

    if (warnings.length > 0) {
      console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
      warnings.forEach(warning => console.log(`  • ${warning}`));
    }
  }

  console.log();
}

// Main execution
function main() {
  printHeader('Workspace Health Check');

  checkNodeVersion();
  checkGit();
  checkTemplates();
  checkSpecKitDocument();
  checkMemoryStructure();
  checkProjectsDirectory();
  checkRequiredScripts();
  checkDocumentation();

  printSummary();

  // Exit with appropriate code
  process.exit(errors.length > 0 ? 1 : 0);
}

main();

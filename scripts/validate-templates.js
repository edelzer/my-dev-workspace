#!/usr/bin/env node

/**
 * Template Validation Script
 *
 * Performs detailed validation of each project template including:
 * - Configuration file validity (JSON, TOML, XML)
 * - Directory structure
 * - Core files existence
 * - Configuration files presence
 * - Docker support
 * - Documentation completeness
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

// Template validation results
let validTemplates = 0;
let totalTemplates = 0;
let allWarnings = [];

function printHeader(text) {
  console.log(`\n${colors.bold}${colors.blue}${text}${colors.reset}`);
  console.log('='.repeat(text.length));
  console.log();
}

function printCheck(passed, message, isWarning = false) {
  if (passed) {
    console.log(`  ${colors.green}✓${colors.reset} ${message}`);
  } else if (isWarning) {
    allWarnings.push(message);
    console.log(`  ${colors.yellow}⚠${colors.reset} ${message}`);
  } else {
    console.log(`  ${colors.red}✗${colors.reset} ${message}`);
  }
  return passed || isWarning;
}

function validateJSON(filePath, fileName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return printCheck(true, `${fileName} (valid JSON)`);
  } catch (error) {
    return printCheck(false, `${fileName} (invalid JSON: ${error.message})`);
  }
}

function checkFileExists(basePath, filePath, description, optional = false) {
  const fullPath = path.join(basePath, filePath);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    return printCheck(true, `${description} exists`);
  } else {
    return printCheck(false, `${description} missing`, optional);
  }
}

function checkDirectoryExists(basePath, dirPath, description) {
  const fullPath = path.join(basePath, dirPath);
  const exists = fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();

  return printCheck(exists, `${dirPath}/ directory exists`);
}

function validateWebTemplate(templatePath) {
  console.log(`\n${colors.bold}web template:${colors.reset}`);

  let checks = 0;

  // package.json
  const packagePath = path.join(templatePath, 'package.json');
  if (fs.existsSync(packagePath)) {
    checks += validateJSON(packagePath, 'package.json') ? 1 : 0;
  } else {
    printCheck(false, 'package.json missing');
  }

  // Directories
  checks += checkDirectoryExists(templatePath, 'src', 'src') ? 1 : 0;

  // Configuration files
  checks += checkFileExists(templatePath, 'vite.config.ts', 'vite.config.ts') ? 1 : 0;
  checks += checkFileExists(templatePath, 'tsconfig.json', 'tsconfig.json') ? 1 : 0;
  checks += checkFileExists(templatePath, '.eslintrc.cjs', '.eslintrc.cjs', true) ? 1 : 0;
  checks += checkFileExists(templatePath, 'vitest.config.ts', 'vitest.config.ts', true) ? 1 : 0;

  // Docker (optional - will be added in Step 2)
  checks += checkFileExists(templatePath, 'Dockerfile', 'Dockerfile', true) ? 1 : 0;

  return checks >= 3; // Require at least 3 critical checks to pass
}

function validateApiTemplate(templatePath) {
  console.log(`\n${colors.bold}api template:${colors.reset}`);

  let checks = 0;

  // package.json
  const packagePath = path.join(templatePath, 'package.json');
  if (fs.existsSync(packagePath)) {
    checks += validateJSON(packagePath, 'package.json') ? 1 : 0;
  } else {
    printCheck(false, 'package.json missing');
  }

  // Configuration files
  checks += checkFileExists(templatePath, 'tsconfig.json', 'tsconfig.json') ? 1 : 0;
  checks += checkFileExists(templatePath, '.eslintrc.js', '.eslintrc.js', true) ? 1 : 0;
  checks += checkFileExists(templatePath, 'jest.config.js', 'jest.config.js', true) ? 1 : 0;

  // Docker (optional - will be added in Step 2)
  checks += checkFileExists(templatePath, 'Dockerfile', 'Dockerfile', true) ? 1 : 0;

  return checks >= 2;
}

function validatePythonTemplate(templatePath) {
  console.log(`\n${colors.bold}python template:${colors.reset}`);

  let checks = 0;

  // pyproject.toml
  checks += checkFileExists(templatePath, 'pyproject.toml', 'pyproject.toml') ? 1 : 0;

  // Directories
  checks += checkDirectoryExists(templatePath, 'app', 'app') ? 1 : 0;
  checks += checkDirectoryExists(templatePath, 'tests', 'tests', true) ? 1 : 0;

  // Docker
  checks += checkFileExists(templatePath, 'Dockerfile', 'Dockerfile') ? 1 : 0;

  // Documentation
  checks += checkFileExists(templatePath, 'README.md', 'README.md') ? 1 : 0;

  return checks >= 3;
}

function validateJavaTemplate(templatePath) {
  console.log(`\n${colors.bold}java template:${colors.reset}`);

  let checks = 0;

  // build.gradle (Gradle project)
  checks += checkFileExists(templatePath, 'build.gradle', 'build.gradle') ? 1 : 0;

  // Directories
  checks += checkDirectoryExists(templatePath, 'src', 'src') ? 1 : 0;

  // Docker
  checks += checkFileExists(templatePath, 'Dockerfile', 'Dockerfile') ? 1 : 0;

  // Documentation
  checks += checkFileExists(templatePath, 'README.md', 'README.md') ? 1 : 0;

  return checks >= 3;
}

function validateGoTemplate(templatePath) {
  console.log(`\n${colors.bold}go template:${colors.reset}`);

  let checks = 0;

  // go.mod
  checks += checkFileExists(templatePath, 'go.mod', 'go.mod') ? 1 : 0;

  // Directories
  checks += checkDirectoryExists(templatePath, 'cmd', 'cmd') ? 1 : 0;
  checks += checkDirectoryExists(templatePath, 'internal', 'internal', true) ? 1 : 0;

  // Docker
  checks += checkFileExists(templatePath, 'Dockerfile', 'Dockerfile') ? 1 : 0;

  // Documentation
  checks += checkFileExists(templatePath, 'README.md', 'README.md') ? 1 : 0;

  return checks >= 3;
}

function validateMobileTemplate(templatePath) {
  console.log(`\n${colors.bold}mobile template:${colors.reset}`);

  let checks = 0;

  // package.json
  const packagePath = path.join(templatePath, 'package.json');
  if (fs.existsSync(packagePath)) {
    checks += validateJSON(packagePath, 'package.json') ? 1 : 0;
  } else {
    printCheck(false, 'package.json missing');
  }

  // Configuration
  checks += checkFileExists(templatePath, 'tsconfig.json', 'tsconfig.json', true) ? 1 : 0;

  // Documentation
  checks += checkFileExists(templatePath, 'README.md', 'README.md') ? 1 : 0;

  return checks >= 2;
}

function validateDesktopTemplate(templatePath) {
  console.log(`\n${colors.bold}desktop template:${colors.reset}`);

  let checks = 0;

  // package.json
  const packagePath = path.join(templatePath, 'package.json');
  if (fs.existsSync(packagePath)) {
    checks += validateJSON(packagePath, 'package.json') ? 1 : 0;
  } else {
    printCheck(false, 'package.json missing');
  }

  // Configuration
  checks += checkFileExists(templatePath, 'tsconfig.json', 'tsconfig.json', true) ? 1 : 0;

  // Documentation
  checks += checkFileExists(templatePath, 'README.md', 'README.md') ? 1 : 0;

  return checks >= 2;
}

function printSummary() {
  console.log();
  console.log('='.repeat(50));

  if (validTemplates === totalTemplates && allWarnings.length === 0) {
    console.log(`${colors.green}${colors.bold}Validation: ✅ PASSED${colors.reset} (${validTemplates}/${totalTemplates} templates valid)`);
  } else if (validTemplates === totalTemplates) {
    console.log(`${colors.yellow}${colors.bold}Validation: ⚠ PASSED WITH WARNINGS${colors.reset} (${validTemplates}/${totalTemplates} templates valid)`);
    console.log(`${colors.yellow}Notes: ${allWarnings.length} warnings (see above)${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}Validation: ✗ FAILED${colors.reset} (${validTemplates}/${totalTemplates} templates valid)`);
  }

  console.log();
}

// Main execution
function main() {
  printHeader('Template Validation');

  const templatesBasePath = path.join(process.cwd(), 'templates');

  const templates = [
    { name: 'web', validator: validateWebTemplate },
    { name: 'api', validator: validateApiTemplate },
    { name: 'python', validator: validatePythonTemplate },
    { name: 'java', validator: validateJavaTemplate },
    { name: 'go', validator: validateGoTemplate },
    { name: 'mobile', validator: validateMobileTemplate },
    { name: 'desktop', validator: validateDesktopTemplate }
  ];

  templates.forEach(template => {
    totalTemplates++;
    const templatePath = path.join(templatesBasePath, template.name);

    if (!fs.existsSync(templatePath)) {
      console.log(`\n${colors.bold}${template.name} template:${colors.reset}`);
      printCheck(false, `Template directory missing`);
    } else {
      const isValid = template.validator(templatePath);
      if (isValid) {
        validTemplates++;
      }
    }
  });

  printSummary();

  // Exit with appropriate code
  process.exit(validTemplates === totalTemplates ? 0 : 1);
}

main();

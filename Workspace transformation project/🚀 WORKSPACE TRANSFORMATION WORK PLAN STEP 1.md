🚀 WORKSPACE TRANSFORMATION WORK PLAN
For Claude Code Execution

📋 EXECUTIVE SUMMARY
Objective: Transform my-dev-workspace from a nested project repository into a professional template/starter-kit repository with proper GitHub Spec-Kit integration and incorporation of best practices from the agentic-coding-starter-kit.
Timeline: 2-3 hours of focused work
Complexity: Medium
Risk Level: Low (backup strategy included)

🎯 PROJECT GOALS

✅ Remove outdated GitHub Spec-Kit from projects folder
✅ Add official GitHub Spec-Kit as a proper external tool integration
✅ Create new project creation script for independent repos
✅ Incorporate valuable patterns from agentic-coding-starter-kit
✅ Update documentation to reflect new template-only purpose
✅ Add workspace-level development dependencies
✅ Clean up projects folder for clarity


📦 PHASE 1: BACKUP & PREPARATION
Task 1.1: Create Backup Branch
bash# Create safety backup before major changes
git checkout -b backup-pre-transformation
git push -u origin backup-pre-transformation
git checkout main
Success Criteria: Backup branch exists on GitHub

Task 1.2: Document Current State
Create TRANSFORMATION-LOG.md to track changes:
markdown# Workspace Transformation Log
Date: [Current Date]
Objective: Convert to template-only repository

## Pre-Transformation State
- Spec-Kit Location: projects/spec-kit (outdated)
- Project Count: [number]
- Template Count: 11
- Scripts Count: 19

## Changes Made
[To be filled during transformation]

## Post-Transformation State
[To be filled after completion]

📦 PHASE 2: CLEANUP & REMOVAL
Task 2.1: Remove Old Spec-Kit Installation
Location to Remove:

projects/spec-kit/ (if exists)
Any references in scripts pointing to old spec-kit location

Script to Execute:
bash# Remove old spec-kit from projects
rm -rf projects/spec-kit
rm -rf projects/*-spec-project  # Remove any spec-kit generated projects

# Remove old spec-kit scripts
rm -f scripts/use-spec-kit.cmd
rm -f scripts/init-spec-project.cmd
rm -f scripts/spec-driven-init.ps1
Files to Update:

.gitignore - Remove spec-kit specific entries if any
README.md - Remove references to old spec-kit workflow


Task 2.2: Clean Projects Folder
Update projects/README.md:
markdown# Projects Directory

⚠️ **IMPORTANT: This directory is for learning experiments only**

## For Production Projects
Create independent repositories using:
```bash
node scripts/create-project-repo.js  
```

## Current Structure
- `project-tasks/` - Task management experiments
- `cursor-optimization-plan.md` - Workspace optimization notes

## Not Included Here
❌ Production projects (use separate repos)
❌ Portfolio projects (use separate repos)
❌ Client work (use separate repos)
Update .gitignore:
gitignore# Projects folder - experimental only
projects/*/
!projects/README.md
!projects/project-tasks/
!projects/*.md

📦 PHASE 3: ADD GITHUB SPEC-KIT PROPERLY
Task 3.1: Create External Tools Directory
Create new structure:
bashmkdir -p tools/external
mkdir -p tools/scripts
Task 3.2: Add Spec-Kit as Git Submodule
Why Submodule: Tracks official repo, easy updates, no duplication
bashcd tools/external
git submodule add https://github.com/github/spec-kit.git
git submodule update --init --recursive
Task 3.3: Create Spec-Kit Integration Script
Create scripts/create-spec-project.js:
javascript#!/usr/bin/env node

/**
 * Creates a new spec-driven project using official GitHub Spec-Kit
 * Integrates with my-dev-workspace templates
 * 
 * Usage: node scripts/create-spec-project.js <project-name>
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

async function createSpecProject(projectName) {
  const projectsBaseDir = path.join(process.env.HOME, 'development');
  const projectPath = path.join(projectsBaseDir, `${projectName}-spec`);
  const specKitPath = path.join(__dirname, '..', 'tools', 'external', 'spec-kit');
  
  console.log(`🚀 Creating spec-driven project: ${projectName}`);
  
  // Verify spec-kit exists
  if (!fs.existsSync(specKitPath)) {
    console.error('❌ Error: GitHub Spec-Kit not found');
    console.log('Run: git submodule update --init --recursive');
    process.exit(1);
  }
  
  // Create project directory
  await fs.ensureDir(projectPath);
  process.chdir(projectPath);
  
  // Initialize with spec-kit
  console.log('📝 Initializing with GitHub Spec-Kit...');
  execSync(`node ${path.join(specKitPath, 'init.js')} ${projectName}`, { stdio: 'inherit' });
  
  // Copy our workspace .cursorrules
  const workspaceRoot = path.join(__dirname, '..');
  await fs.copy(
    path.join(workspaceRoot, '.cursorrules'),
    path.join(projectPath, '.cursorrules')
  );
  
  // Initialize git
  execSync('git init');
  execSync('git add .');
  execSync('git commit -m "Initial commit: Spec-driven project from my-dev-workspace"');
  
  console.log(`✅ Spec project created at: ${projectPath}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectPath}`);
  console.log(`  gh repo create edelzer/${projectName}-spec --public --source=. --remote=origin`);
  console.log(`  git push -u origin main`);
  console.log(`  # Follow GitHub Spec-Kit workflow for specifications`);
}

// Parse command line
const [,, projectName] = process.argv;

if (!projectName) {
  console.error('❌ Error: Project name required');
  console.log('Usage: node scripts/create-spec-project.js <project-name>');
  process.exit(1);
}

createSpecProject(projectName).catch(console.error);

📦 PHASE 4: CREATE PROJECT REPO SCRIPT
Task 4.1: Create Main Project Creation Script
Create scripts/create-project-repo.js:
javascript#!/usr/bin/env node

/**
 * Creates a new project from templates as an independent repository
 * Follows professional best practices for separate repo management
 * 
 * Usage: node scripts/create-project-repo.js <project-name> <template-type>
 * 
 * Templates: web, api, python, java, go, mobile, desktop
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const AVAILABLE_TEMPLATES = ['web', 'api', 'python', 'java', 'go', 'mobile', 'desktop'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createProjectRepo(projectName, templateType) {
  // Validate template
  if (!AVAILABLE_TEMPLATES.includes(templateType)) {
    console.error(`❌ Invalid template: ${templateType}`);
    console.log(`Available templates: ${AVAILABLE_TEMPLATES.join(', ')}`);
    process.exit(1);
  }
  
  const workspaceRoot = path.join(__dirname, '..');
  const projectsBaseDir = path.join(process.env.HOME, 'development');
  const projectPath = path.join(projectsBaseDir, projectName);
  const templatePath = path.join(workspaceRoot, 'templates', templateType);
  
  // Check if project already exists
  if (fs.existsSync(projectPath)) {
    const overwrite = await question(`⚠️  Project ${projectName} already exists. Overwrite? (y/N): `);
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Cancelled');
      rl.close();
      process.exit(0);
    }
    await fs.remove(projectPath);
  }
  
  console.log(`\n🚀 Creating new project: ${projectName}`);
  console.log(`📦 Using template: ${templateType}`);
  console.log(`📁 Location: ${projectPath}\n`);
  
  // Create projects directory if needed
  await fs.ensureDir(projectsBaseDir);
  
  // Copy template
  console.log('📋 Copying template files...');
  await fs.copy(templatePath, projectPath);
  
  // Copy workspace configurations
  console.log('⚙️  Copying workspace configurations...');
  await fs.copy(
    path.join(workspaceRoot, '.cursorrules'),
    path.join(projectPath, '.cursorrules')
  );
  
  // Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    packageJson.description = `${projectName} - Created from my-dev-workspace ${templateType} template`;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
  
  // Initialize git
  console.log('🔧 Initializing git repository...');
  process.chdir(projectPath);
  execSync('git init');
  execSync('git add .');
  execSync(`git commit -m "Initial commit: ${projectName} from my-dev-workspace ${templateType} template"`);
  
  console.log('\n✅ Project created successfully!\n');
  console.log('📝 Next steps:');
  console.log(`  cd ${projectPath}`);
  console.log(`  gh repo create edelzer/${projectName} --public --source=. --remote=origin`);
  console.log(`  git push -u origin main`);
  console.log(`  npm install`);
  console.log(`  npm run dev\n`);
  
  rl.close();
}

// Parse arguments
const [,, projectName, templateType = 'web'] = process.argv;

if (!projectName) {
  console.error('❌ Error: Project name required');
  console.log('Usage: node scripts/create-project-repo.js <project-name> <template-type>');
  console.log(`Available templates: ${AVAILABLE_TEMPLATES.join(', ')}`);
  process.exit(1);
}

createProjectRepo(projectName, templateType).catch(error => {
  console.error('❌ Error:', error);
  rl.close();
  process.exit(1);
});

📦 PHASE 5: INCORPORATE AGENTIC-CODING-STARTER-KIT PATTERNS
Task 5.1: Analyze Valuable Patterns
Patterns to Adopt:

✅ MCP Configuration (.mcp.json)
✅ Docker Compose setup for databases
✅ Modern ESLint config (.mjs format)
✅ Component configuration structure
✅ Better environment variable examples

Task 5.2: Add MCP Configuration
Create .mcp.json in workspace root:
json{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    }
  }
}
Task 5.3: Add Docker Compose Template
Create templates/shared-config/docker-compose.example.yml:
yamlversion: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: dev_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
Task 5.4: Enhance Environment Variable Template
Update .env.example:
bash# Database
DATABASE_URL="postgresql://dev:dev@localhost:5432/dev_db"

# Authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRATION="7d"

# API Keys (NEVER COMMIT ACTUAL KEYS)
OPENAI_API_KEY="your-key-here"
ANTHROPIC_API_KEY="your-key-here"

# Application
NODE_ENV="development"
PORT=3000
API_URL="http://localhost:3000"

# Security
CORS_ORIGIN="http://localhost:5173"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW="15m"

📦 PHASE 6: ADD WORKSPACE-LEVEL DEPENDENCIES
Task 6.1: Update package.json
Add to package.json:
json{
  "name": "my-dev-workspace",
  "version": "2.0.0",
  "description": "Professional development workspace template and starter kit",
  "private": true,
  "type": "module",
  "scripts": {
    "create-project": "node scripts/create-project-repo.js",
    "create-spec": "node scripts/create-spec-project.js",
    "workspace:validate": "node scripts/workspace-health-check.js",
    "workspace:setup": "node scripts/setup-workspace.js",
    "performance:validate": "node .bmad-workspace/performance/optimization-validation.js",
    "performance:start": "node .bmad-workspace/performance/performance-integration.js",
    "memory:archive": "node scripts/memory-archive.js",
    "memory:analytics": "node scripts/memory-analytics.js",
    "memory:cleanup": "node scripts/memory-cleanup.js",
    "security:audit": "npm audit --audit-level=moderate",
    "templates:validate": "node scripts/validate-templates.js"
  },
  "devDependencies": {
    "bmad-method": "^4.36.2",
    "@types/node": "^20.11.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.5",
    "typescript": "^5.3.3",
    "husky": "^9.0.0",
    "lint-staged": "^15.2.0",
    "fs-extra": "^11.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}

📦 PHASE 7: CREATE HELPER SCRIPTS
Task 7.1: Workspace Health Check
Create scripts/workspace-health-check.js:
javascript#!/usr/bin/env node

/**
 * Validates workspace health and configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const checks = [
  {
    name: 'Node.js Version',
    check: () => {
      const version = process.version;
      const major = parseInt(version.slice(1).split('.')[0]);
      return { pass: major >= 18, message: version };
    }
  },
  {
    name: 'Git Configuration',
    check: () => {
      try {
        const user = execSync('git config user.name', { encoding: 'utf8' }).trim();
        const email = execSync('git config user.email', { encoding: 'utf8' }).trim();
        return { pass: !!user && !!email, message: `${user} <${email}>` };
      } catch (error) {
        return { pass: false, message: 'Not configured' };
      }
    }
  },
  {
    name: 'Templates Directory',
    check: () => {
      const exists = fs.existsSync(path.join(__dirname, '..', 'templates'));
      return { pass: exists, message: exists ? 'Found' : 'Missing' };
    }
  },
  {
    name: 'Scripts Directory',
    check: () => {
      const exists = fs.existsSync(path.join(__dirname));
      return { pass: exists, message: exists ? 'Found' : 'Missing' };
    }
  },
  {
    name: 'GitHub Spec-Kit',
    check: () => {
      const specKitPath = path.join(__dirname, '..', 'tools', 'external', 'spec-kit');
      const exists = fs.existsSync(specKitPath);
      return { pass: exists, message: exists ? 'Installed' : 'Not installed (run: git submodule update --init)' };
    }
  }
];

console.log('🏥 Workspace Health Check\n');

let allPassed = true;
checks.forEach(({ name, check }) => {
  const { pass, message } = check();
  const icon = pass ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
  if (!pass) allPassed = false;
});

console.log(`\n${allPassed ? '✅ All checks passed!' : '⚠️  Some checks failed'}`);
process.exit(allPassed ? 0 : 1);
Task 7.2: Template Validator
Create scripts/validate-templates.js:
javascript#!/usr/bin/env node

/**
 * Validates all template directories
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = {
  web: ['package.json', 'tsconfig.json', 'vite.config.ts', 'src/main.tsx'],
  api: ['package.json', 'tsconfig.json', 'src/index.ts'],
  python: ['requirements.txt', 'main.py'],
  java: ['pom.xml', 'src/main/java'],
  go: ['go.mod', 'main.go']
};

const templatesDir = path.join(__dirname, '..', 'templates');
console.log('🔍 Validating templates...\n');

let allValid = true;
Object.entries(REQUIRED_FILES).forEach(([template, requiredFiles]) => {
  const templatePath = path.join(templatesDir, template);
  
  if (!fs.existsSync(templatePath)) {
    console.log(`❌ ${template}: Directory not found`);
    allValid = false;
    return;
  }
  
  let templateValid = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(templatePath, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ Missing: ${file}`);
      templateValid = false;
    }
  });
  
  if (templateValid) {
    console.log(`✅ ${template}: Valid`);
  } else {
    allValid = false;
  }
});

console.log(`\n${allValid ? '✅ All templates valid!' : '⚠️  Some templates invalid'}`);
process.exit(allValid ? 0 : 1);

📦 PHASE 8: UPDATE DOCUMENTATION
Task 8.1: Update Main README.md
Add to top of README (after title):
markdown> **🎯 Template Repository:** This is a starter kit for creating professional projects.
> Projects are created as **independent repositories**, not within this repo.

## Quick Start

### Create a New Project
```bash
# Web application (React + TypeScript)
node scripts/create-project-repo.js my-awesome-app web

# API service (Node.js + Express)
node scripts/create-project-repo.js my-api api

# Spec-driven project (with GitHub Spec-Kit)
node scripts/create-spec-project.js my-spec-project
```

### Available Templates
- `web` - React + TypeScript + Vite
- `api` - Node.js + Express + TypeScript  
- `python` - FastAPI + PostgreSQL
- `java` - Spring Boot
- `go` - Gin framework
- `mobile` - React Native
- `desktop` - Electron
Task 8.2: Create QUICKSTART.md
Create QUICKSTART.md:
markdown# Quick Start Guide

## Prerequisites
- Node.js 18+ and npm 9+
- Git configured with your name and email
- GitHub CLI (optional but recommended)

## Setup (First Time)

1. **Clone this workspace**
```bash
   git clone https://github.com/edelzer/my-dev-workspace.git
   cd my-dev-workspace
```

2. **Install dependencies**
```bash
   npm install
```

3. **Initialize GitHub Spec-Kit** (optional)
```bash
   git submodule update --init --recursive
```

4. **Validate setup**
```bash
   npm run workspace:validate
```

## Create Your First Project

### Standard Project
```bash
node scripts/create-project-repo.js personal-dashboard web
cd ~/development/personal-dashboard
npm install
npm run dev
```

### Spec-Driven Project
```bash
node scripts/create-spec-project.js my-saas-app
cd ~/development/my-saas-app-spec
# Follow GitHub Spec-Kit workflow
```

## Next Steps
- [Full Documentation](README.md)
- [Template Guide](docs/TEMPLATE_GUIDE.md)
- [Best Practices](docs/BEST_PRACTICES.md)

📦 PHASE 9: FINAL VALIDATION & COMMIT
Task 9.1: Run All Validators
bash# Health check
npm run workspace:validate

# Template validation
npm run templates:validate

# Security audit
npm run security:audit
Task 9.2: Update Transformation Log
Fill in TRANSFORMATION-LOG.md with all changes made.
Task 9.3: Commit Changes
bashgit add .
git commit -m "Transform workspace to template-only repository

Major Changes:
- Remove old GitHub Spec-Kit from projects folder
- Add official Spec-Kit as git submodule in tools/external
- Create create-project-repo.js for independent project creation
- Create create-spec-project.js for spec-driven projects
- Add workspace-level development dependencies
- Incorporate patterns from agentic-coding-starter-kit
- Update documentation to reflect template-only purpose
- Add workspace validation scripts
- Clean up projects folder structure

This completes the transformation to a professional starter kit."

git push origin main

📋 VALIDATION CHECKLIST
Before considering transformation complete, verify:

 Old spec-kit completely removed
 New spec-kit accessible via tools/external/spec-kit
 create-project-repo.js script works
 create-spec-project.js script works
 All templates validate successfully
 Workspace health check passes
 Documentation updated
 .gitignore properly configured
 package.json has all new dependencies
 README clearly explains template-only purpose
 QUICKSTART.md created
 Backup branch exists


🚨 ROLLBACK PLAN
If something goes wrong:
bash# Restore from backup
git checkout backup-pre-transformation
git checkout -b main-recovery
git push -f origin main-recovery

# Contact for help with specific issues

📊 SUCCESS METRICS
Transformation is successful when:

✅ Can create new project: node scripts/create-project-repo.js test-project web
✅ Can create spec project: node scripts/create-spec-project.js test-spec
✅ Workspace validates: npm run workspace:validate
✅ Templates validate: npm run templates:validate
✅ Projects folder only contains experiments
✅ Documentation clearly explains template-only model


🎯 EXECUTION INSTRUCTIONS FOR CLAUDE CODE
To execute this plan with Claude Code:

Save this plan as WORKSPACE-TRANSFORMATION-PLAN.md in your workspace
Open Claude Code
Execute each phase sequentially, validating after each step
Use the validation checklist to ensure completeness

Critical Guidelines:

Execute phases in order
Validate after each phase
Document any deviations in TRANSFORMATION-LOG.md
Don't skip the backup step (Phase 1)

Commands to Execute:
bash# Phase 1: Backup
git checkout -b backup-pre-transformation
git push -u origin backup-pre-transformation
git checkout main

# Phase 2-8: Execute transformation steps

# Phase 9: Validate
npm run workspace:validate
npm run templates:validate
npm run security:audit

# Final commit
git add .
git commit -m "Transform workspace to template-only repository"
git push origin main

📝 NOTES FOR EXECUTION
Important Considerations:

fs-extra Dependency: The scripts use fs-extra which needs to be installed first
Home Directory: Scripts assume ~/development as project base. Adjust if different
GitHub CLI: Optional but recommended for gh repo create commands
Spec-Kit Compatibility: Verify spec-kit init.js exists and is compatible
Template Paths: Ensure all template references match actual directory structure

Testing Strategy:
After completion, test the transformation by:

Creating a test web project
Creating a test spec project
Verifying all validators pass
Checking documentation clarity


Ready to begin transformation? Start with Phase 1! 🚀
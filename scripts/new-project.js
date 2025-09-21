#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectTypes = {
  web: 'Web Application (React + TypeScript + Vite)',
  api: 'API Server (Node.js + TypeScript + Express)',
  python: 'Python API (FastAPI + Async + Security)',
  java: 'Java Service (Spring Boot + Security + Monitoring)',
  go: 'Go Service (Gin + High Performance + Security)',
  mobile: 'Mobile Application (React Native)',
  desktop: 'Desktop Application (Electron)'
};

function showHelp() {
  console.log('Usage: node new-project.js <project-name> <project-type>');
  console.log('');
  console.log('Available project types:');
  Object.entries(projectTypes).forEach(([key, description]) => {
    console.log(`  ${key}: ${description}`);
  });
  console.log('');
  console.log('Example: node new-project.js my-app web');
}

function copyTemplate(templatePath, targetPath) {
  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`);
    process.exit(1);
  }

  if (fs.existsSync(targetPath)) {
    console.error(`Target directory already exists: ${targetPath}`);
    process.exit(1);
  }

  fs.mkdirSync(targetPath, { recursive: true });
  
  const files = fs.readdirSync(templatePath);
  files.forEach(file => {
    const srcPath = path.join(templatePath, file);
    const destPath = path.join(targetPath, file);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyTemplate(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function main() {
  const [,, projectName, projectType] = process.argv;

  if (!projectName || !projectType) {
    showHelp();
    process.exit(1);
  }

  if (!projectTypes[projectType]) {
    console.error(`Unknown project type: ${projectType}`);
    showHelp();
    process.exit(1);
  }

  const workspaceRoot = path.dirname(__dirname);
  const templatePath = path.join(workspaceRoot, 'templates', projectType);
  const projectPath = path.join(workspaceRoot, 'projects', projectName);

  console.log(`Creating ${projectTypes[projectType]} project: ${projectName}`);
  
  try {
    copyTemplate(templatePath, projectPath);
    
    // Update package.json with project name
    const packageJsonPath = path.join(projectPath, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.name = projectName;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }
    
    console.log(`\\nProject created successfully at: ${projectPath}`);
    console.log('\\nNext steps:');
    console.log(`1. cd projects/${projectName}`);
    console.log('2. npm install');
    console.log('3. npm run dev');
    
  } catch (error) {
    console.error('Error creating project:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
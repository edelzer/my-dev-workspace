#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
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

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', 'target', '__pycache__', '.pytest_cache', 'venv'];

function showHelp() {
  console.log('Usage: node create-project-repo.js <project-name> <project-type>');
  console.log('');
  console.log('Available project types:');
  Object.entries(projectTypes).forEach(([key, description]) => {
    console.log(`  ${key}: ${description}`);
  });
  console.log('');
  console.log('Example: node create-project-repo.js my-app web');
  console.log('');
  console.log('Project will be created in: ~/development/<project-name>');
}

function checkStatus(message) {
  console.log(`\u2713 ${message}`);
}

function copyDirectoryRecursive(source, target, skipDirs = SKIP_DIRS) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach(file => {
    const srcPath = path.join(source, file);
    const destPath = path.join(target, file);
    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      // Skip certain directories
      if (skipDirs.includes(file)) {
        return;
      }
      copyDirectoryRecursive(srcPath, destPath, skipDirs);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

function updatePackageJson(projectPath, projectName) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = projectName;
    packageJson.description = `${projectName} - ${packageJson.description || 'Professional application'}`;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }
}

function copyWorkspaceConfigs(workspaceRoot, projectPath) {
  const configFiles = [
    '.eslintrc.json',
    '.prettierrc',
    '.prettierignore',
    'tsconfig.json'
  ];

  configFiles.forEach(file => {
    const sourcePath = path.join(workspaceRoot, 'config', file);
    const destPath = path.join(projectPath, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
}

function copyCLAUDEmd(workspaceRoot, projectPath) {
  const claudeMdPath = path.join(workspaceRoot, 'CLAUDE.md');
  if (fs.existsSync(claudeMdPath)) {
    fs.copyFileSync(claudeMdPath, path.join(projectPath, 'CLAUDE.md'));
  }
}

function createReadme(projectPath, projectName, projectType) {
  const templateDescriptions = {
    web: 'React + TypeScript + Vite web application',
    api: 'Node.js + TypeScript + Express API server',
    python: 'FastAPI + Async Python API',
    java: 'Spring Boot + Security Java service',
    go: 'Gin + High Performance Go service',
    mobile: 'React Native mobile application',
    desktop: 'Electron desktop application'
  };

  const installCommands = {
    web: 'npm install',
    api: 'npm install',
    python: 'pip install -r requirements.txt',
    java: 'mvn install',
    go: 'go mod download',
    mobile: 'npm install',
    desktop: 'npm install'
  };

  const devCommands = {
    web: 'npm run dev',
    api: 'npm run dev',
    python: 'uvicorn main:app --reload',
    java: 'mvn spring-boot:run',
    go: 'go run main.go',
    mobile: 'npm run start',
    desktop: 'npm run dev'
  };

  const readme = `# ${projectName}

${templateDescriptions[projectType]}

## Quick Start

\`\`\`bash
# Install dependencies
${installCommands[projectType]}

# Start development server
${devCommands[projectType]}
\`\`\`

## Development

This project follows professional development protocols defined in CLAUDE.md:

- **Law #1**: Uncertainty Protocol & Specification Adherence
- **Law #2**: Strict Protocol Adherence
- **Law #3**: Orchestrated Workspace Efficiency
- **Law #4**: Surgical Precision & Minimalist Efficiency
- **Law #5**: Senior Developer Leadership
- **Law #6**: Cross-Session Memory & Continuous Learning

## Project Structure

See template documentation for detailed structure and conventions.

## License

MIT
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
}

function initGitRepository(projectPath) {
  try {
    const gitCheck = execSync('git --version', { encoding: 'utf8', stdio: 'pipe' });

    execSync('git init', { cwd: projectPath, stdio: 'pipe' });
    execSync('git add .', { cwd: projectPath, stdio: 'pipe' });
    execSync('git commit -m "Initial commit from template"', { cwd: projectPath, stdio: 'pipe' });

    return true;
  } catch (error) {
    return false;
  }
}

function getProjectLocation(projectName) {
  const homeDir = os.homedir();
  const devDir = path.join(homeDir, 'development');
  return path.join(devDir, projectName);
}

function main() {
  const [,, projectName, projectType] = process.argv;

  if (!projectName || !projectType) {
    showHelp();
    process.exit(1);
  }

  if (!projectTypes[projectType]) {
    console.error(`\nError: Unknown project type: ${projectType}`);
    console.error('');
    showHelp();
    process.exit(1);
  }

  const workspaceRoot = path.dirname(__dirname);
  const templatePath = path.join(workspaceRoot, 'templates', projectType);
  const projectPath = getProjectLocation(projectName);
  const homeDir = os.homedir();

  console.log(`\nCreating project: ${projectName} (${projectType} template)`);
  console.log('');

  // Validate template exists
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Template not found: ${templatePath}`);
    console.error('');
    console.error('Available templates:');
    const templatesDir = path.join(workspaceRoot, 'templates');
    fs.readdirSync(templatesDir).forEach(dir => {
      const templateDir = path.join(templatesDir, dir);
      if (fs.statSync(templateDir).isDirectory() && !dir.startsWith('.')) {
        console.error(`  - ${dir}`);
      }
    });
    process.exit(1);
  }
  checkStatus('Template validated');

  // Check if project already exists
  if (fs.existsSync(projectPath)) {
    console.error(`\nError: Project already exists at: ${projectPath}`);
    process.exit(1);
  }

  // Create development directory if needed
  const devDir = path.dirname(projectPath);
  if (!fs.existsSync(devDir)) {
    fs.mkdirSync(devDir, { recursive: true });
  }

  // Display project location (with ~ for readability)
  const displayPath = projectPath.replace(homeDir, '~');
  checkStatus(`Project location: ${displayPath}`);

  try {
    // Copy template files
    copyDirectoryRecursive(templatePath, projectPath);
    checkStatus('Files copied from template');

    // Update package.json
    updatePackageJson(projectPath, projectName);
    checkStatus('package.json updated');

    // Copy workspace configs
    copyWorkspaceConfigs(workspaceRoot, projectPath);
    checkStatus('Workspace configs copied');

    // Copy CLAUDE.md
    copyCLAUDEmd(workspaceRoot, projectPath);
    checkStatus('CLAUDE.md copied');

    // Create README.md
    createReadme(projectPath, projectName, projectType);
    checkStatus('README.md created');

    // Initialize git repository
    const gitInitialized = initGitRepository(projectPath);
    if (gitInitialized) {
      checkStatus('Git repository initialized');
      checkStatus('Initial commit created');
    } else {
      console.log('! Git not available (optional)');
    }

    // Success message
    console.log('');
    console.log('Project created successfully!');
    console.log('');
    console.log('Next steps:');
    console.log(`  1. cd ${displayPath}`);

    if (['web', 'api', 'mobile', 'desktop'].includes(projectType)) {
      console.log('  2. npm install');
      console.log('  3. npm run dev');
    } else if (projectType === 'python') {
      console.log('  2. pip install -r requirements.txt');
      console.log('  3. uvicorn main:app --reload');
    } else if (projectType === 'java') {
      console.log('  2. mvn install');
      console.log('  3. mvn spring-boot:run');
    } else if (projectType === 'go') {
      console.log('  2. go mod download');
      console.log('  3. go run main.go');
    }

    console.log('');
    console.log('To create GitHub repository:');
    console.log(`  gh repo create ${projectName} --private --source=. --push`);
    console.log('');

  } catch (error) {
    console.error('\nError creating project:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getProjectLocation, projectTypes };

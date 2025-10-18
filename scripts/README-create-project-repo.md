# Create Project Repository Script

## Overview

`create-project-repo.js` creates independent project repositories from templates in the user's home directory (NOT in workspace).

## Usage

```bash
node scripts/create-project-repo.js <project-name> <template-type>
```

## Supported Templates

- `web` - React + TypeScript + Vite
- `api` - Node.js + TypeScript + Express
- `python` - FastAPI + Async
- `java` - Spring Boot + Security + Monitoring
- `go` - Gin + High Performance
- `mobile` - React Native
- `desktop` - Electron

## Project Location

Projects are created in:
- **Windows**: `C:\Users\<username>\development\<project-name>`
- **Linux**: `/home/<username>/development/<project-name>`
- **macOS**: `/Users/<username>/development/<project-name>`

## Script Actions

1. **Validates** template type exists
2. **Checks** project doesn't already exist
3. **Creates** `~/development/` directory if needed
4. **Copies** template files (skips node_modules, .git, dist, build)
5. **Updates** package.json with project name
6. **Copies** workspace configurations (.eslintrc, .prettierrc, tsconfig.json)
7. **Copies** CLAUDE.md (Laws #1-6)
8. **Creates** README.md with quick start instructions
9. **Initializes** git repository (if git available)
10. **Creates** initial commit
11. **Displays** next steps and GitHub repo creation command

## Example

```bash
node scripts/create-project-repo.js my-webapp web
```

Output:
```
Creating project: my-webapp (web template)

✓ Template validated
✓ Project location: ~/development/my-webapp
✓ Files copied from template
✓ package.json updated
✓ Workspace configs copied
✓ CLAUDE.md copied
✓ README.md created
✓ Git repository initialized
✓ Initial commit created

Project created successfully!

Next steps:
  1. cd ~/development/my-webapp
  2. npm install
  3. npm run dev

To create GitHub repository:
  gh repo create my-webapp --private --source=. --push
```

## Error Handling

- Missing arguments → Shows help and usage
- Invalid template type → Lists valid templates
- Project already exists → Error message with location
- Template directory missing → Lists available templates
- Git not available → Warning (optional, continues)

## Features

- Cross-platform path handling (Windows/Linux/macOS)
- Skip build artifacts and dependencies when copying
- Professional README generation with template-specific instructions
- Automatic git initialization and initial commit
- GitHub CLI command suggestion for repo creation

## Testing

Validation tests:
```bash
# Test help display
node scripts/create-project-repo.js

# Test invalid template
node scripts/create-project-repo.js test invalid

# Validate logic without creating project
node -e "const s = require('./scripts/create-project-repo.js'); console.log(s.getProjectLocation('test'));"
```

## Law #4 Compliance

Script follows **Surgical Precision & Minimalist Efficiency**:
- Minimal code for maximum functionality
- No unnecessary complexity
- Clear error messages
- Cross-platform without external dependencies
- Single responsibility: create independent repos

## Integration

This script is part of Phase 1.3 (Project Creation Scripts) in the workspace transformation execution plan.

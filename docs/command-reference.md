# Command Reference

Quick reference for essential commands across the workspace.

## Project Setup

### Create New Project Repository
```bash
node scripts/create-project-repo.js <name> <type>
```

**Parameters**:
- `<name>`: Project name (lowercase, hyphen-separated)
- `<type>`: Template type (web, api, python, java, go, mobile, desktop)

**Creates**: Independent project repository in `~/development/<name>`

**Examples**:
```bash
node scripts/create-project-repo.js my-app web
node scripts/create-project-repo.js user-api api
node scripts/create-project-repo.js data-service python
```

---

## Development Workflow

### Start Development Server
```bash
npm run dev
```
Starts the development server with hot reload.

### Run TDD Cycle
```bash
npm run test:tdd
```
Runs tests in watch mode for test-driven development.

### Security Scan
```bash
npm run security:scan
```
Performs security vulnerability scanning.

### Technical Debt Analysis
```bash
npm run debt:analyze
```
Analyzes and reports on technical debt metrics.

---

## Multi-Agent Coordination

### BMAD Strategic Planning Sequence
```bash
/analyst      # Market research, competitive analysis
/pm           # Product management, requirements coordination
/architect    # Technical architecture, integration planning
/po           # Product ownership, backlog management
```

### Custom Agent Technical Foundation Sequence
```bash
claude --agent spec-analyst    # Requirements analysis
claude --agent spec-architect  # System design
claude --agent spec-planner    # Task decomposition
```

### Hybrid Implementation Sequence
```bash
/dev                                # Implementation coordination (BMAD)
/ux-expert                          # UX design (BMAD)
claude --agent backend-developer    # Backend implementation (Custom)
claude --agent frontend-developer   # Frontend implementation (Custom)
```

### Quality Assurance & Deployment Sequence
```bash
claude --agent spec-tester                    # Testing strategies
claude --agent quality-assurance-specialist   # Code review, requirements audit
claude --agent security-specialist            # Security analysis
/qa                                           # Quality validation (BMAD)
/bmad-orchestrator                           # Final deployment coordination
```

---

## Spec-Kit Commands

### Core Workflow (Sequential)
```bash
/speckit.constitution  # Define project principles and governance
/speckit.specify       # Create baseline feature specification
/speckit.plan          # Generate technical implementation plan
/speckit.tasks         # Break down into actionable tasks
/speckit.implement     # Execute specification-compliant implementation
```

### Optional Enhancement Commands
```bash
/speckit.clarify       # Ask structured questions (use before /speckit.plan)
/speckit.analyze       # Cross-artifact consistency report (use after /speckit.tasks)
/speckit.checklist     # Generate quality checklists (use after /speckit.plan)
```

---

## External Tool Integration

### Rule2Hook (Natural Language Automation)
```bash
# Use command in Claude Code
/project:rule2hook

# Clone for development/inspection (external)
git clone https://github.com/zxdxjtu/claudecode-rule2hook.git ~/tools/claudecode-rule2hook
```

### Semgrep MCP (Security Scanning)
```bash
# Add to Claude Code MCP configuration
claude mcp add semgrep uvx semgrep-mcp

# OR install globally
uvx semgrep-mcp
```

### Serena (Semantic Code Analysis)
```bash
# Add to Claude Code MCP configuration
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant
```

---

## Git Workflow

### Standard Commit
```bash
git add .
git commit -m "feat: description"
git push
```

### Feature Branch
```bash
git checkout -b feature/feature-name
# ... make changes ...
git add .
git commit -m "feat: description"
git push -u origin feature/feature-name
```

### Create Pull Request
```bash
gh pr create --title "Feature: description" --body "Detailed description"
```

---

## Testing Commands

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test -- path/to/test.spec.ts
```

### Watch Mode (TDD)
```bash
npm run test:watch
```

---

## Build & Deploy

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Docker Build
```bash
docker build -t <image-name> .
```

### Docker Run
```bash
docker run -p 3000:3000 <image-name>
```

---

## Linting & Formatting

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint:fix
```

### Format Code
```bash
npm run format
```

---

## Dependency Management

### Install Dependencies
```bash
npm install
```

### Update Dependencies
```bash
npm update
```

### Audit Dependencies
```bash
npm audit
```

### Fix Vulnerabilities
```bash
npm audit fix
```

---

## Workspace Management

### List Projects
```bash
ls ~/development
```

### Navigate to Project
```bash
cd ~/development/<project-name>
```

### Clean Node Modules
```bash
rm -rf node_modules
npm install
```

---

## Quick Start Sequences

### New Web Project (Complete Setup)
```bash
node scripts/create-project-repo.js my-app web
cd ~/development/my-app
npm install
npm run dev
```

### New API Project (Complete Setup)
```bash
node scripts/create-project-repo.js my-api api
cd ~/development/my-api
npm install
npm run test:tdd  # Start TDD workflow
```

### New Python Project (Complete Setup)
```bash
node scripts/create-project-repo.js my-service python
cd ~/development/my-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Troubleshooting Commands

### Check Node Version
```bash
node --version
npm --version
```

### Clear npm Cache
```bash
npm cache clean --force
```

### Reinstall Dependencies
```bash
rm -rf node_modules package-lock.json
npm install
```

### Check Port Availability
```bash
# Windows
netstat -ano | findstr :3000

# Unix/Mac
lsof -i :3000
```

---

For more detailed information, see:
- [Project Templates](project-templates.md)
- [Multi-Agent Workflows](project-templates.md#multi-agent-development-teams)
- [External Tools](external-tools.md)
- [Development Standards](development-standards.md)

# Quick Start Guide

Get started with the Professional Development Workspace in 5 minutes!

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **GitHub CLI (optional)** - [Download here](https://cli.github.com/) - For easy GitHub repository creation

## 5-Minute Setup

### Step 1: Clone the Template Repository

```bash
git clone https://github.com/edelzer/my-dev-workspace.git
cd my-dev-workspace
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Create Your First Project

```bash
# Create an independent project repository
node scripts/create-project-repo.js my-first-app web

# Navigate to your new project
cd ~/development/my-first-app
```

### Step 4: Start Development

```bash
# Install project dependencies
npm install

# Start the development server
npm run dev
```

That's it! Your project is now running with all best practices built-in.

## Template Selection Guide

Choose the right template for your project:

### Web Template
**When to use:** Frontend applications, SPAs, customer-facing websites
**Stack:** React + TypeScript + Vite
**Features:** Fast development, modern build tools, security headers

```bash
node scripts/create-project-repo.js my-web-app web
```

### API Template
**When to use:** Backend services, REST APIs, microservices
**Stack:** Node.js + TypeScript + Express
**Features:** Authentication middleware, rate limiting, input validation

```bash
node scripts/create-project-repo.js my-api api
```

### Python Template
**When to use:** Python APIs, data services, ML backends
**Stack:** FastAPI + Async + Pydantic
**Features:** High performance async, automatic API docs, type validation

```bash
node scripts/create-project-repo.js my-python-service python
```

### Java Template
**When to use:** Enterprise applications, Spring ecosystem projects
**Stack:** Spring Boot + JPA + Security
**Features:** Enterprise security, database integration, monitoring

```bash
node scripts/create-project-repo.js my-java-service java
```

### Go Template
**When to use:** High-performance services, cloud-native applications
**Stack:** Gin + GORM
**Features:** Blazing fast performance, efficient resource usage, concurrent processing

```bash
node scripts/create-project-repo.js my-go-service go
```

## Quick Comparison Table

| Template | Best For | Language | Build Speed | Performance | Learning Curve |
|----------|----------|----------|-------------|-------------|----------------|
| **Web** | SPAs, Frontends | TypeScript | Very Fast | High | Low |
| **API** | REST APIs, Backends | TypeScript | Fast | High | Low |
| **Python** | Data/ML Services | Python | Fast | Very High | Low |
| **Java** | Enterprise Apps | Java | Moderate | High | Moderate |
| **Go** | Cloud Native | Go | Very Fast | Excellent | Low-Moderate |

## Next Steps

### 1. Explore Full Documentation

- **[README.md](README.md)** - Complete workspace documentation
- **[CLAUDE.md](CLAUDE.md)** - AI development protocols and Laws #1-6
- **[docs/spec-kit-planning.md](docs/spec-kit-planning.md)** - Spec-Kit formal specification workflow (NOW INSTALLED)

### 2. Learn About Templates

Each template includes:
- Pre-configured security settings
- Built-in testing frameworks
- CI/CD pipeline templates
- Docker containerization (where applicable)
- Development best practices

Explore template-specific docs:
- `templates/web/README.md`
- `templates/api/README.md`
- `templates/python/README.md`
- `templates/java/README.md`
- `templates/go/README.md`

### 3. Understand Development Protocols

Review the **[CLAUDE.md](CLAUDE.md)** file for:
- **Law #1**: Uncertainty Protocol & Specification Adherence
- **Law #2**: Strict Protocol Adherence
- **Law #3**: Orchestrated Workspace Efficiency
- **Law #4**: Surgical Precision & Minimalist Efficiency
- **Law #5**: Senior Developer Leadership
- **Law #6**: Cross-Session Memory & Continuous Learning

### 4. Set Up Your IDE

The workspace is optimized for:
- **Cursor** - 15 specialized AI agents built-in
- **VS Code** - Full integration support
- **JetBrains** - WebStorm, IntelliJ, PyCharm
- **Windsurf** - Next-gen AI development

See `.cursor/agents/README.md` for Cursor-specific agent usage.

### 5. Use AI Development Teams

Leverage 21 specialized AI agents:

**Strategic Planning (BMAD Agents):**
```bash
/analyst    # Market research
/pm         # Product management
/architect  # Technical architecture
```

**Technical Implementation (Custom Agents):**
- `spec-analyst` - Requirements analysis
- `spec-architect` - System design
- `frontend-developer` - UI/UX implementation
- `backend-developer` - Server-side logic
- `security-specialist` - Security validation

**Spec-Kit Workflow (Formal Specifications):**
```bash
/speckit.constitution  # Establish project principles
/speckit.specify       # Create feature specification
/speckit.plan          # Generate technical plan
/speckit.tasks         # Break down into tasks
/speckit.implement     # Execute implementation
```

Use Spec-Kit for client projects or when formal documentation is required. See [docs/spec-kit-planning.md](docs/spec-kit-planning.md).

### 6. Create GitHub Repository (Optional)

```bash
# From your project directory
cd ~/development/my-first-app

# Create and push to GitHub
gh repo create my-first-app --private --source=. --push
```

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # Check code quality

# Security
npm run security:scan    # Scan for vulnerabilities
npm run security:audit   # Audit dependencies

# Quality
npm run test:coverage    # Test coverage report
npm audit                # Check for known vulnerabilities
```

## Important Workspace Concepts

### Template Repository Model

This workspace is a **template repository** - NOT for nested project development:

- **Use `create-project-repo.js`** to create production projects in `~/development/`
- **The `/projects` directory** is for quick experiments only
- **Each project** gets its own independent Git repository
- **Benefits**: Clean git history, independent deployment, better collaboration

### Why Independent Repositories?

1. **Clean Git History** - Each project has its own commit history
2. **Independent Deployment** - Deploy projects separately
3. **Better Collaboration** - Share specific projects, not entire workspace
4. **Workspace Cleanliness** - Keep template repository clean and focused

## Troubleshooting

### Node.js Version Issues

```bash
# Check your Node.js version
node --version

# Should be 18.x or higher
# If not, download from https://nodejs.org/
```

### Permission Issues (Windows)

Run your terminal as Administrator if you encounter permission errors.

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process using the port (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 npm run dev
```

### Git Configuration

Ensure Git is configured:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Getting Help

### Documentation

- **Workspace Guide**: [docs/WORKSPACE_GUIDE.md](docs/WORKSPACE_GUIDE.md)
- **Best Practices**: [docs/knowledge-base/best-practices/](docs/knowledge-base/best-practices/)
- **Architecture Patterns**: [docs/knowledge-base/patterns/](docs/knowledge-base/patterns/)
- **Troubleshooting**: [docs/knowledge-base/troubleshooting/](docs/knowledge-base/troubleshooting/)

### AI Assistance

Ask your AI agents for help:
```bash
# In Cursor IDE
@.cursor/agents/foundation/spec-analyst.md help me understand the project structure

# In Claude Code
/project:contextual-help
```

### Community & Support

- **GitHub Issues**: Report bugs and request features
- **BMAD Discord**: [discord.gg/gk8jAdXWmj](https://discord.gg/gk8jAdXWmj)
- **Documentation**: Comprehensive guides in `docs/`

## What's Next?

Now that you're set up, explore these features:

1. **Interactive Setup Wizard**: `/project:setup-wizard` (Claude Code)
2. **Workspace Tour**: `/project:workspace-tour` (Claude Code)
3. **Security Features**: Learn about built-in security scanning
4. **AI Agents**: Discover 21 specialized development agents
5. **BMAD Method**: Enterprise-grade development methodology
6. **CI/CD Pipelines**: Automated testing and deployment

**Happy coding!** 🚀

---

**Pro Tip**: Bookmark this guide and the main [README.md](README.md) for quick reference.

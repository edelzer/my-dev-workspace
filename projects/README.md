# Projects Directory - Experimental Use Only

⚠️ **For Production Projects**: Use `create-project-repo.js` to create independent repositories in `~/development/`

## Purpose

This directory is for **quick experiments and testing only**. Do NOT develop production projects here.

## Production Workflow

```bash
# Create independent project repository
node scripts/create-project-repo.js my-production-app web

# Develop in separate location
cd ~/development/my-production-app
npm install
npm run dev

# Create GitHub repository (optional)
gh repo create my-production-app --private --source=. --push
```

## Why Separate Repositories?

### Benefits of Independent Project Repositories

1. ✅ **Clean Git History** - Each project has its own commit history
2. ✅ **Independent Deployment** - Deploy projects separately without workspace coupling
3. ✅ **Better Collaboration** - Share specific projects, not entire workspace
4. ✅ **Workspace Cleanliness** - Keep template repository clean and focused
5. ✅ **Simplified CI/CD** - Each project has its own pipelines and workflows
6. ✅ **Professional Structure** - Industry-standard project organization

### Problems with Nested Projects

❌ **Polluted Git History** - Workspace and project commits mixed together
❌ **Deployment Complexity** - Must deploy from subdirectory or extract files
❌ **Collaboration Issues** - Can't share single project without entire workspace
❌ **Repository Bloat** - Workspace grows with every project added
❌ **CI/CD Complications** - Complex path handling in pipelines
❌ **Unprofessional Structure** - Not industry best practice

## Experimental Use

Feel free to create quick test projects here for learning or validation:

```bash
# Quick experiment (stays in workspace)
cd projects
mkdir experiment-feature-x
cd experiment-feature-x
npm init -y
# ... test your idea
```

### When to Use This Directory

- **Learning**: Testing new libraries or frameworks
- **Proof of Concept**: Quick validation before formal project
- **Experimentation**: Trying out ideas without commitment
- **Debugging**: Isolated reproduction of issues

### Important Reminders

- ⚠️ Not for production code
- ⚠️ No deployment from this directory
- ⚠️ Clean up periodically to avoid clutter
- ⚠️ Don't commit experimental code to main branch

## Comparison: Experimental vs Production

| Aspect | Experimental (Here) | Production (Independent) |
|--------|---------------------|-------------------------|
| **Location** | `projects/` subdirectory | `~/development/` |
| **Git Repository** | Nested in workspace | Independent repository |
| **Deployment** | Not supported | Full CI/CD support |
| **Collaboration** | Not shareable | Easily shareable |
| **Lifecycle** | Temporary/throwaway | Long-term maintenance |
| **Professionalism** | Learning/testing | Production-ready |

## Project Status Overview

### Completed Projects (Archived)

See [completed/](completed/) for successfully finished workspace optimization projects.

### Available Templates

For production projects, use these templates via `create-project-repo.js`:

- **web** - React + TypeScript + Vite
- **api** - Node.js + TypeScript + Express
- **python** - FastAPI + Async + Security
- **java** - Spring Boot + Security + Monitoring
- **go** - Gin + High Performance + Security

## Example Workflows

### Correct: Production Project

```bash
# Step 1: Create independent project
node scripts/create-project-repo.js e-commerce-platform web

# Step 2: Navigate to project
cd ~/development/e-commerce-platform

# Step 3: Develop independently
npm install
npm run dev

# Step 4: Create GitHub repo
gh repo create e-commerce-platform --private --source=. --push

# Step 5: Deploy via GitHub Actions
git push origin main
```

### Acceptable: Quick Experiment

```bash
# Step 1: Create in projects directory
cd projects
mkdir test-new-chart-library

# Step 2: Quick test
cd test-new-chart-library
npm init -y
npm install chart.js
# ... test the library

# Step 3: Clean up when done
cd ../..
rm -rf projects/test-new-chart-library
```

### Incorrect: Production in Projects Directory ❌

```bash
# DON'T DO THIS
cd projects
node ../scripts/create-project-repo.js my-production-app web
# This creates nested repository issues and deployment problems
```

## Cleaning Up Experiments

Periodically clean up old experiments:

```bash
# Review old experiments
cd projects
ls -la

# Remove experiment folders
rm -rf experiment-old-idea
rm -rf test-library-xyz

# Keep only active experiments or completed archive
```

## Getting Help

### Quick Commands Reference

```bash
# Create production project
node scripts/create-project-repo.js <name> <type>

# Available types
web, api, python, java, go

# Example
node scripts/create-project-repo.js my-app web
```

### Documentation

- **[Main README](../README.md)** - Complete workspace documentation
- **[QUICKSTART Guide](../QUICKSTART.md)** - 5-minute setup guide
- **[CLAUDE.md](../CLAUDE.md)** - Development protocols and best practices
- **[Spec-Kit Planning](../docs/spec-kit-planning.md)** - Future formal specifications

### Need Help?

- Ask AI agents: `/project:contextual-help` (Claude Code)
- Check troubleshooting: [docs/knowledge-base/troubleshooting/](../docs/knowledge-base/troubleshooting/)
- Review best practices: [docs/knowledge-base/best-practices/](../docs/knowledge-base/best-practices/)

## Summary

**Remember**: This directory is your playground for quick experiments. For anything serious, use `create-project-repo.js` to create independent, professional project repositories in `~/development/`.

**Production projects belong in independent repositories, not nested in the workspace.**

---

*This workspace maintains a professional approach to project management with clear separation between experimental work and production-ready projects.*

# Project Structure

## Directory Organization

```
my-dev-workspace/
├── projects/           # Experimental projects only (use create-project-repo.js for production)
├── templates/          # Project templates (web, api, mobile, desktop)
│   ├── claude-md-templates/  # 7 comprehensive CLAUDE.md templates
│   ├── shared-config/ # Shared ESLint, Prettier, TypeScript configurations
│   ├── web/           # React/TypeScript template with complete toolchain
│   ├── api/           # Node.js/Express template with security middleware
│   ├── mobile/        # React Native cross-platform template
│   └── desktop/       # Electron template with native integration
├── scripts/           # Utility scripts for project management
│   └── create-project-repo.js  # Create independent project repositories
├── docs/              # Documentation and guides
│   ├── protocols/     # Full development protocol documentation
│   ├── spec-kit-planning.md  # Spec-Kit implementation roadmap
│   └── knowledge-base/ # AI-powered knowledge management system
│       ├── patterns/  # Architecture, testing, security, performance patterns
│       ├── best-practices/ # Development standards and code review guidelines
│       ├── lessons-learned/ # Project retrospectives and technical decisions
│       └── troubleshooting/ # Common issues and diagnostic guides
├── tools/             # Development tools and utilities
├── config/            # Shared configuration files (ESLint, Prettier)
├── .ai-config/        # AI tool configurations and rules
├── .bmad-core/        # BMAD-METHOD framework (v4.36.2)
├── .bmad-workspace/   # Shared multi-agent workspace
├── .claude/           # Claude Code configurations and commands
│   ├── commands/      # Custom Claude Code commands
│   │   └── BMad/     # BMAD agent commands (10 agents + 17 tasks)
│   ├── hooks.json    # 36+ intelligent automation hooks
│   └── integration-hooks.json # Cross-platform IDE integration
├── .cursor/           # Advanced Cursor IDE configurations with performance optimization
├── .github/           # GitHub Actions CI/CD workflows (5 comprehensive pipelines)
├── .ide/              # Cross-platform IDE integration configurations
├── README.md          # Main documentation
├── QUICKSTART.md      # 5-minute quick start guide
├── LICENSE            # MIT License
└── CLAUDE.md          # Claude Code governance and instructions
```

## Repository Overview

This is `my-dev-workspace` - a professional development environment designed for integration with Cursor, Claude Code, and GitHub. It provides organized project structure, templates, and tools for efficient development workflow with integrated security-first, test-driven, and AI-enhanced development practices.

## Core Development Philosophy

### Security-First Mindset
Every development decision prioritizes security from design through deployment. Security is not a feature to add later—it's a foundational design principle.

### Strategic Technical Debt Management
Technical debt is a conscious strategic tool, not an accident. Every shortcut decision is evaluated, documented, and actively managed.

### Test-Driven Development Integration
Specifications and tests drive implementation. Code quality is ensured through comprehensive testing strategies and continuous validation.

### Surgical Debugging Methodology
Problems are resolved through systematic, minimal-impact interventions. Start with the smallest possible fix and escalate only when necessary, preserving system stability and avoiding scope creep.

### Strategic Task Decomposition
Complex development challenges are broken into 15-30 minute micro-sessions with tangible outcomes. Each task has clear success criteria and builds incrementally toward larger objectives.

### AI-Enhanced Development
Leverage AI tools systematically while maintaining human oversight and decision-making authority.

### BMAD Multi-Agent Orchestration
Professional enterprise-grade agile development using coordinated AI agents for planning, development, and quality assurance phases.

### Spec-Kit Integration (Installed)
Spec-Kit is now integrated and ready for use. GitHub Spec-Kit provides formal specification-driven development for projects requiring detailed documentation and multi-phase specification cycles. See [spec-kit-planning.md](spec-kit-planning.md) for complete usage guide.

## Protocol Reference Guide

All protocols follow the 5-phase sequences defined in the Absolute Laws in [CLAUDE.md](../CLAUDE.md). Refer to Laws #2-4 for complete protocol implementations including Security-First, SDD/TDD Integration, Surgical Debugging, Task Decomposition, and Technical Debt Management workflows.

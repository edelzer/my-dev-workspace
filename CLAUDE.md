# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository, incorporating professional development protocols and best practices.

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

## AI-Optimized Protocol Implementation

### Mandatory AI Workflow Sequences

**Security-First Protocol**: ANALYZE → IMPLEMENT → TEST → MONITOR
```
1. ANALYZE    → Complete security analysis before any implementation
2. IMPLEMENT  → Apply security controls during development  
3. TEST       → Validate security through comprehensive testing
4. MONITOR    → Implement continuous security monitoring
```

**SDD/TDD Integration**: SPECIFY → TEST → IMPLEMENT → REFACTOR
```
1. SPECIFY    → Create requirements.md, design.md, tasks.md
2. TEST       → Generate failing tests from specifications
3. IMPLEMENT  → Write minimal code satisfying tests + specs
4. REFACTOR   → Optimize while maintaining compliance
```

**Surgical Debugging Hierarchy**: Level 1-7 Systematic Escalation
```
1. CHARACTER-LEVEL    → Single character fixes (5 min)
2. SINGLE-LINE        → One line modifications (15 min)
3. IMPORT/DEPENDENCY  → Missing imports/deps (10 min)
4. VARIABLE/SCOPE     → Variable declarations (20 min)
5. FUNCTION SIGNATURE → Parameter adjustments (30 min)
6. ISOLATED BLOCKS    → Block modifications (45 min - requires approval)
7. STRUCTURAL CHANGES → Major refactoring (requires team consultation)
```

**Task Decomposition Protocol**: ANALYZE → DECOMPOSE → SEQUENCE → TRACK → VALIDATE
```
1. ANALYZE    → Assess complexity and identify boundaries
2. DECOMPOSE  → Break into 15-30 minute micro-tasks
3. SEQUENCE   → Order by dependencies and progression
4. TRACK      → Use TodoWrite for status management
5. VALIDATE   → Confirm completion before advancing
```

**Technical Debt Management**: IDENTIFY → EVALUATE → AUTHORIZE → DOCUMENT → TRACK
```
1. IDENTIFY   → Recognize potential debt-creating decisions
2. EVALUATE   → Assess business value vs technical cost
3. AUTHORIZE  → Confirm appropriate approval level
4. DOCUMENT   → Record debt details with remediation plan
5. TRACK      → Add to monitoring and TodoWrite system
```

**BMAD Multi-Agent Workflow**: PLAN → DEVELOP → VALIDATE → DEPLOY
```
1. PLAN      → /analyst → /pm → /architect coordination phase
2. DEVELOP   → /dev → /ux-expert collaborative implementation
3. VALIDATE  → /qa → /sm quality assurance and testing
4. DEPLOY    → /bmad-orchestrator coordinated deployment
```

## Project Structure

```
my-dev-workspace/
├── projects/           # Individual development projects
├── templates/          # Project templates (web, api, mobile, desktop)
│   ├── claude-md-templates/  # 7 comprehensive CLAUDE.md templates
│   ├── shared-config/ # Shared ESLint, Prettier, TypeScript configurations
│   ├── web/           # React/TypeScript template with complete toolchain
│   ├── api/           # Node.js/Express template with security middleware
│   ├── mobile/        # React Native cross-platform template
│   └── desktop/       # Electron template with native integration
├── scripts/           # Utility scripts for project management
├── docs/              # Documentation and guides
│   ├── protocols/     # Full development protocol documentation
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
├── claudecode-rule2hook/  # Natural language rule automation
├── README.md          # Main documentation
├── LICENSE            # MIT License
└── CLAUDE.md          # This file - Claude Code instructions
```

## Protocol Integration

### Security Integration Points
- **Templates**: All project templates include security configurations
- **Code Review**: Automated security checks in development workflow
- **Dependencies**: Regular security scanning and updates
- **Deployment**: Security validation gates in CI/CD

### Debt Management Integration
- **Sprint Planning**: Debt budget allocated (max 20% new debt, min 15% reduction)
- **Code Review**: Debt authorization and documentation requirements
- **Architecture**: Debt impact assessment for all design decisions
- **Monitoring**: Debt metrics tracked alongside feature delivery

### Testing Integration
- **TDD Workflow**: Red-Green-Refactor cycle with specification alignment
- **AI-Enhanced**: Automated test generation from specifications
- **Coverage**: Comprehensive testing across unit, integration, and E2E levels
- **Validation**: Continuous specification-test-code alignment checking

### Surgical Debugging Integration
- **Issue Resolution**: Systematic escalation through debugging hierarchy
- **Impact Minimization**: Smallest possible interventions to preserve stability
- **Context Preservation**: Maintain project state across debugging sessions
- **Quality Assurance**: Validation after each debugging intervention

### Task Decomposition Integration
- **Sprint Planning**: All work broken into 15-30 minute micro-sessions
- **Progress Tracking**: Clear success criteria for each development increment
- **Context Management**: Maintain development state across work sessions
- **Iterative Development**: Build complexity incrementally with validation gates

### BMAD Multi-Agent Integration
- **Agent Orchestration**: 10 specialized agents coordinate across planning, development, and QA phases
- **Shared Workspace**: Unified `.bmad-workspace/` for cross-agent collaboration and state management
- **Workflow Automation**: 17 specialized task commands for enterprise development workflows
- **Quality Gates**: Multi-agent validation at each handoff point with performance tracking
- **Rule2Hook Automation**: Natural language rule creation with intelligent hook generation

## Key Features

### Phase 4 Enhanced Features ✅
- **Professional Template System**: 7 comprehensive CLAUDE.md templates + 4 production-ready project templates (Web, API, Mobile, Desktop) with complete toolchains
- **AI-Powered Knowledge Base**: Comprehensive knowledge management with searchable patterns, best practices, and learning analytics
- **Cross-Platform IDE Integration**: Complete integration across VS Code, JetBrains, Cursor, and Windsurf with context sharing and diagnostics
- **Advanced CI/CD Automation**: 5 comprehensive GitHub Actions workflows with security scanning, performance monitoring, and deployment pipelines
- **Intelligent Hook System**: 36+ automation hooks across 5 categories with Rule2Hook natural language automation
- **Configuration Management**: Environment-specific configurations with version control, validation, and migration tools

### Core Established Features ✅
- **Specialized AI Development Team**: 11 expert agents for comprehensive development workflows (Foundation, Implementation, Quality & Security)
- **BMAD Multi-Agent Framework**: 10 specialized AI agents for enterprise development workflows with 17 task commands
- **Project Creation Script**: `scripts/new-project.js` for quick project setup with protocol integration
- **Security-First Integration**: Comprehensive security scanning, validation, and monitoring across all workflows
- **Protocol Documentation**: Comprehensive guides in `docs/protocols/` with AI-executable templates
- **Multi-Agent Coordination**: Seamless workflow coordination across specialized development teams with shared workspace

## Working with Projects

### Creating New Projects
Use the project creation script with integrated protocols:
```bash
node scripts/new-project.js <project-name> <project-type>
```

Available project types:
- `web`: React + TypeScript + Vite + Security configs
- `api`: Node.js + TypeScript + Express + Security middleware
- `mobile`: React Native (template ready)
- `desktop`: Electron (template ready)

### Project Templates

**Web Template** (`templates/web/`):
- React 18 with TypeScript
- Vite for build tooling
- ESLint + TypeScript + Security rules
- Vitest for testing with TDD setup
- Security-first configurations (CSP, HTTPS, etc.)
- Debt tracking and documentation templates

**API Template** (`templates/api/`):
- Node.js with TypeScript
- Express.js framework
- Security middleware (Helmet, CORS, rate limiting)
- Jest for testing with comprehensive coverage
- Input validation and authentication patterns
- Monitoring and logging for security events

### Specialized AI Development Team (Phase 2)

**Foundation Team Agents:**
- **Project Manager** - Overall project orchestration, team coordination, and workflow management
- **Requirements Analyst** - Requirements elicitation, user story creation, stakeholder analysis  
- **System Architect** - Architecture design, technology selection, technical documentation
- **Planner** - Task decomposition, effort estimation, milestone management

**Implementation Team Agents:**
- **Frontend Developer** - React/TypeScript UI development with Magic MCP integration
- **Backend Developer** - Server-side development, API creation, database optimization
- **Full-Stack Developer** - End-to-end feature implementation and system integration

**Quality & Security Team Agents:**
- **Tester** - Comprehensive testing strategies (unit, integration, E2E) with Playwright
- **Code Reviewer** - Code quality assurance and review processes with ESLint integration
- **Validator** - Final quality gates and deployment readiness validation  
- **Security Specialist** - Security architecture, threat modeling, and vulnerability assessment

### BMAD Multi-Agent Commands

**Planning Phase Agents:**
- `/analyst` - Market research, competitive analysis, project briefs, brainstorming sessions
- `/pm` - Product management, PRD creation, requirements coordination, feature specification
- `/architect` - Technical architecture, system design, technology selection, integration planning
- `/po` - Product ownership, epic management, story validation, backlog prioritization

**Development Phase Agents:**
- `/dev` - Software development, task execution, code implementation, technical problem-solving
- `/ux-expert` - User experience design, front-end specifications, interaction patterns, accessibility
- `/qa` - Quality assurance, code review, testing validation, compliance verification
- `/sm` - Scrum master, story creation, sprint management, team coordination

**Orchestration Agents:**
- `/bmad-orchestrator` - Multi-agent workflow coordination, handoff management, quality gates
- `/bmad-master` - Master orchestration, team management, performance tracking, escalation

**Specialized Task Commands:**
```bash
/create-next-story    # Generate development stories from epics
/review-story         # Quality assurance story review
/validate-next-story  # Story validation against requirements
/shard-doc           # Document breakdown for development phases
/execute-checklist   # Systematic task execution
/document-project    # Project documentation generation
```

### Development Commands

Enhanced workflow for any project with BMAD integration:
```bash
# Create project with integrated protocols and BMAD support
node scripts/new-project.js my-app web
cd projects/my-app

# BMAD Multi-Agent Planning Phase
/analyst              # Market analysis and project brief
/pm                   # Product requirements and specification
/architect           # Technical architecture and design
/po                  # Epic creation and story prioritization

# Development with protocol integration
npm install
npm run dev           # Start development server
npm run test:tdd      # Run TDD cycle
npm run security:scan # Security vulnerability check
npm run debt:analyze  # Technical debt assessment

# BMAD Development Phase
/dev                 # Coordinated development implementation
/ux-expert          # User experience and interface design
/sm                 # Sprint management and coordination

# Quality Assurance and Validation
/qa                 # Quality assurance and code review
npm run build       # Build for production
npm run lint        # Code quality and security linting
npm test            # Comprehensive test suite

# BMAD Orchestration and Documentation
/bmad-orchestrator  # Workflow coordination and handoffs
/document-project   # Comprehensive project documentation

# Phase 4 Enhanced Commands
claude --knowledge search <topic>     # Search knowledge base with AI-powered semantic search
claude --template create <type>       # Create project from professional templates
claude --ide integrate <editor>       # Set up IDE integration and context sharing
claude --hooks validate               # Validate and optimize automation hooks
claude --analytics view               # View learning analytics and improvement suggestions
```

## Development Guidelines

### Code Quality Standards
1. **Security-First**: All code passes security validation before merge
2. **Test-Driven**: Tests written before implementation, specifications guide development
3. **Multi-Agent Coordinated**: BMAD agents collaborate across all development phases
4. **Debt Conscious**: All shortcuts documented and tracked with automated monitoring
5. **AI-Enhanced**: Leverage specialized agents while maintaining human oversight
6. **Documentation**: Clear, maintained documentation with automated project documentation

### Protocol Adherence
1. **Decision Documentation**: Use frameworks for all architectural choices with multi-agent validation
2. **Quality Gates**: Security, testing, and debt checks at each stage with automated validation
3. **Agent Coordination**: Follow BMAD handoff protocols and shared workspace guidelines
4. **Continuous Improvement**: Regular protocol effectiveness assessment with performance metrics
5. **Team Alignment**: Shared understanding and application of protocols across all agents

### Emergency Procedures
- **Security Incidents**: Immediate containment, assessment, notification with `/qa` agent escalation
- **Debt Crisis**: Feature freeze, dedicated remediation, prevention measures with `/architect` review
- **Test Failures**: Surgical debugging hierarchy, systematic resolution with `/dev` and `/qa` coordination
- **Agent Communication Failures**: Fallback to manual handoffs, shared workspace recovery
- **Rule2Hook Automation Issues**: Safety system rollback, hook validation, emergency reset procedures

## Claude Code Integration

This workspace is optimized for AI-enhanced development:

### AI-Driven Protocol Execution
- **Systematic Implementation**: AI follows mandatory phase sequences for all protocols
- **TodoWrite Integration**: All protocols use TodoWrite for task and progress tracking
- **Quality Gates**: AI validates completion criteria at each protocol phase
- **Context Preservation**: AI maintains protocol state across sessions
- **Emergency Protocols**: AI recognizes and escalates critical situations appropriately

### Claude Code Command Integration
Each protocol includes specific Claude Code command patterns:
- **Read/Write/Edit**: File manipulation following protocol templates
- **Grep/Glob**: Code analysis and pattern detection
- **Bash**: Testing, validation, and build commands
- **TodoWrite**: Mandatory progress tracking throughout all workflows
- **Task**: Complex analysis and multi-step operations

### Protocol Validation Framework
- **Pre-Phase Validation**: Requirements checked before each phase
- **Phase Transition Gates**: Completion criteria validated before progression
- **Quality Checkpoints**: Security, testing, and debt validation at each stage
- **Context Recovery**: Session continuation with full protocol state restoration

### AI-Executable Protocol Documents
Our protocols are now optimized for Claude Code execution. Access detailed implementation guidance:

- **Security-First Protocol** (`docs/protocols/security_first_protocol.md`)
  - 4-phase security implementation (ANALYZE → IMPLEMENT → TEST → MONITOR)
  - Mandatory security templates and validation checkpoints
  - Claude Code command patterns for each security phase

- **SDD/TDD Integration Protocol** (`docs/protocols/sdd_tdd_integration_guide.md`)
  - 4-phase development cycle with AI implementation directives
  - Specification-to-test-to-code traceability requirements
  - Quality gates and validation frameworks

- **Surgical Debugging Protocol** (`docs/protocols/surgical_precision_debugging_guide.md`)
  - 7-level hierarchy with systematic escalation
  - TodoWrite integration for debugging progress tracking
  - AI debugging decision frameworks and tool patterns

- **Task Decomposition Protocol** (`docs/protocols/task_decomposition_protocol.md`)
  - Complexity analysis and micro-task creation
  - Dependency mapping and sequencing strategies
  - TodoWrite-integrated task management workflows

- **Technical Debt Protocol** (`docs/protocols/technical_debt_protocol.md`)
  - 5-phase debt management with approval workflows
  - Debt evaluation templates and authorization matrices
  - Systematic remediation tracking and reporting

## Current Project Context

### Phase 2 Completion Status ✅
- **AI Development Team**: Successfully created 11 specialized development agents with comprehensive role definitions
- **Foundation Team**: 4 core agents (Project Manager, Requirements Analyst, System Architect, Planner)
- **Implementation Team**: 3 specialized developers (Frontend, Backend, Full-Stack) with modern tooling integration
- **Quality & Security Team**: 4 quality assurance agents (Tester, Code Reviewer, Validator, Security Specialist)
- **Agent Configuration**: All agents optimized with appropriate tool access and protocol integration
- **MCP Integration**: Magic, Context7, Playwright, ESLint, and IDE diagnostics optimally configured per agent

### Phase 3 Completion Status ✅
- **BMAD Framework**: Successfully installed (v4.36.2) with 10 agents and 17 task commands
- **Advanced Cursor Integration**: 7/7 performance tests passing, all configurations optimized
- **Rule2Hook Automation**: 22/22 tests passing with 100% success rate
- **Multi-Agent Workflows**: Shared workspace operational with performance tracking
- **Cross-Tool Integration**: Full integration system validated and operational

### Phase 4 Completion Status ✅
- **Enhanced Documentation System**: Complete CLAUDE.md template system with 7 comprehensive templates for all project types
- **Professional Project Templates**: 4 production-ready templates (Web, API, Mobile, Desktop) with complete toolchains and BMAD integration
- **Advanced IDE Integration**: Complete integration across VS Code, JetBrains, Cursor, and Windsurf with context sharing and diagnostics
- **GitHub Actions Automation**: Full CI/CD pipeline with Claude Code integration, security scanning, performance monitoring, and deployment workflows
- **Knowledge Base System**: Comprehensive knowledge management with AI-powered search, learning analytics, and continuous improvement
- **Automation Framework**: 36+ intelligent hooks across 5 categories with Rule2Hook natural language automation
- **Configuration Management**: Environment-specific configurations with version control and validation systems

### Protocol Success Metrics
- **Security Protocol**: Zero critical vulnerabilities, all phases completed
- **SDD/TDD Protocol**: 100% specification-test-code traceability, all quality gates passed
- **Debugging Protocol**: >95% success rate for Level 1-3 fixes, minimal escalation
- **Task Decomposition**: All tasks 15-30 minutes, 100% TodoWrite tracking compliance
- **Debt Management**: All shortcuts documented, remediation scheduled, authorization obtained
- **AI Development Team**: 11 specialized agents operational with optimized tool configurations
- **BMAD Multi-Agent**: 100% agent coordination success, shared workspace operational
- **Rule2Hook Automation**: 100% test pass rate, intelligent automation functional
- **Knowledge Base System**: AI-powered knowledge management with learning analytics operational
- **IDE Integration**: Complete cross-platform integration with context sharing and diagnostics
- **CI/CD Pipeline**: Full automation with security scanning, performance monitoring, and deployment workflows

## Future Enhancements

### Phase 5 Implementation (Next)
- **Advanced Multi-Agent Orchestration**: Complex cross-project agent coordination and workflow optimization
- **Enterprise Integration**: Advanced security, compliance, and audit systems for enterprise environments
- **Cross-Project Analytics**: Workspace-wide metrics, optimization insights, and performance dashboards
- **AI-Enhanced Monitoring**: Real-time protocol compliance tracking and automated performance optimization
- **Advanced Learning Systems**: Predictive analytics, automated workflow optimization, and intelligent recommendation engines

### Long-Term Vision
- **Advanced Multi-Agent Orchestration**: Complex cross-project agent coordination
- **Automated Monitoring Dashboards**: Real-time protocol compliance and performance tracking
- **Cross-Project Analytics**: Workspace-wide metrics, optimization, and insights
- **Enterprise Integration**: Advanced security, compliance, and audit systems

## Remember: Protocols Enable Excellence

These protocols are not constraints—they're enablers that allow us to build secure, maintainable, high-quality software faster and more reliably. Every protocol decision should ask: "Does this help us deliver better software more efficiently?"

**Claude Code Implementation Priorities:**
1. **Always follow protocol phase sequences** - Never skip mandatory phases
2. **Use TodoWrite for all task tracking** - Every protocol integrates task management
3. **Validate at every quality gate** - Confirm completion criteria before progression
4. **Escalate when protocol limits exceeded** - Respect authorization levels and approval requirements
5. **Preserve context between sessions** - Document protocol state for continuation
6. **Apply emergency protocols when needed** - Recognize and respond to critical situations

**Protocol Integration Command**: When implementing any feature, start with complexity assessment, apply appropriate protocol sequence, track progress with TodoWrite, and validate completion at each phase.**

## BMAD Multi-Agent Implementation Guidelines

### Agent Coordination Workflow
1. **Planning Phase**: Use `/analyst` → `/pm` → `/architect` → `/po` sequence for comprehensive planning
2. **Development Phase**: Coordinate `/dev` and `/ux-expert` with `/sm` oversight for implementation
3. **Quality Phase**: Engage `/qa` for validation with `/bmad-orchestrator` coordination
4. **Documentation Phase**: Use `/document-project` for comprehensive project documentation

### Shared Workspace Protocol
- All agents operate within unified `.bmad-workspace/` structure
- Maintain consistent logging across `coordination-logs/` directory
- Use `shared-context/` for cross-agent state management
- Validate agent handoffs through automated quality gates

### Rule2Hook Integration
- Use `/project:rule2hook` for natural language automation rule creation
- All rules automatically validated and backed up before activation
- Environment-aware conditional execution (dev/prod/CI)
- Emergency rollback procedures available for all automation rules

**BMAD Implementation Command**: Always coordinate multi-agent workflows through appropriate phase sequences, maintain shared workspace integrity, and validate all agent handoffs through quality gates.
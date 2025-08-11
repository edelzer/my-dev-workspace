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

## Project Structure

```
my-dev-workspace/
├── projects/           # Individual development projects
├── templates/          # Project templates (web, api, mobile, desktop)
├── scripts/           # Utility scripts for project management
├── docs/              # Documentation and guides
│   └── protocols/     # Full development protocol documentation
├── tools/             # Development tools and utilities
├── config/            # Shared configuration files (ESLint, Prettier)
├── .ai-config/        # AI tool configurations and rules
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

## Key Features

- **Template System**: Ready-to-use templates for different project types
- **Project Creation Script**: `scripts/new-project.js` for quick project setup
- **Shared Configurations**: ESLint and Prettier configs in `config/`
- **Documentation**: Comprehensive guides in `docs/`
- **Organized Workflow**: Clear separation of concerns

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

### Development Commands

Enhanced workflow for any project:
```bash
# Create project with integrated protocols
node scripts/new-project.js my-app web
cd projects/my-app

# Development with protocol integration
npm install
npm run dev           # Start development server
npm run test:tdd      # Run TDD cycle
npm run security:scan # Security vulnerability check
npm run debt:analyze  # Technical debt assessment
npm run build         # Build for production
npm run lint          # Code quality and security linting
npm test              # Comprehensive test suite
```

## Development Guidelines

### Code Quality Standards
1. **Security-First**: All code passes security validation before merge
2. **Test-Driven**: Tests written before implementation, specifications guide development
3. **Debt Conscious**: All shortcuts documented and tracked
4. **AI-Enhanced**: Leverage AI tools while maintaining human oversight
5. **Documentation**: Clear, maintained documentation for all decisions

### Protocol Adherence
1. **Decision Documentation**: Use frameworks for all architectural choices
2. **Quality Gates**: Security, testing, and debt checks at each stage
3. **Continuous Improvement**: Regular protocol effectiveness assessment
4. **Team Alignment**: Shared understanding and application of protocols

### Emergency Procedures
- **Security Incidents**: Immediate containment, assessment, notification
- **Debt Crisis**: Feature freeze, dedicated remediation, prevention measures
- **Test Failures**: Surgical debugging hierarchy, systematic resolution
- **AI Tool Issues**: Fallback to manual processes, tool validation

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

### Active Priorities
- Protocol implementation and validation
- Template enhancement with integrated best practices
- Tool configuration for automated protocol enforcement
- Team training and adoption of integrated methodologies

### Protocol Success Metrics
- **Security Protocol**: Zero critical vulnerabilities, all phases completed
- **SDD/TDD Protocol**: 100% specification-test-code traceability, all quality gates passed
- **Debugging Protocol**: >95% success rate for Level 1-3 fixes, minimal escalation
- **Task Decomposition**: All tasks 15-30 minutes, 100% TodoWrite tracking compliance
- **Debt Management**: All shortcuts documented, remediation scheduled, authorization obtained

## Future Enhancements

Planned improvements include:
- **Advanced Templates**: Mobile and desktop with full protocol integration
- **Automated Monitoring**: Real-time protocol compliance dashboards
- **AI Orchestration**: Multi-agent AI workflows for complex development tasks
- **Cross-Project Analytics**: Workspace-wide metrics and optimization

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
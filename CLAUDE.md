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

## Quick Decision Frameworks

### Security Check (Apply to Every Feature)
```
Before implementing any component:
□ Attack surface analysis: What new entry points does this create?
□ Input validation: All external inputs validated and sanitized?
□ Authentication/authorization: Proper access controls enforced?
□ Data flow security: Encryption at all stages?
□ Failure mode analysis: Does failure expose sensitive information?
```

### Technical Debt Decision Framework
```
Before choosing a shortcut:
□ Business justification: Strategic value of speed vs. quality?
□ Technical impact: Estimated "interest rate" (maintenance cost)?
□ Remediation plan: When and who will address this debt?
□ Risk assessment: Security/stability implications?
□ Documentation: Decision rationale recorded?
```

### Test Strategy Decision Tree
```
For every feature:
□ Specification-first: Requirements clearly defined?
□ Test generation: Comprehensive test scenarios created?
□ Implementation: Code satisfies both tests and specifications?
□ Validation: Cross-artifact consistency verified?
□ Refactoring: Code optimized while maintaining compliance?
```

### Surgical Debugging Hierarchy (When Issues Arise)
```
Level 1 (1-5 min): Character-level fixes (typos, syntax)
Level 2 (5-15 min): Single-line modifications (logic, conditions)
Level 3 (5-10 min): Import/dependency resolution
Level 4 (10-20 min): Local variable/scope fixes
Level 5 (15-30 min): Function signature adjustments
Level 6 (20-45 min): Isolated block modifications
Level 7 (1+ hours): Larger refactoring (requires approval)
```

### Task Decomposition Framework (For Complex Features)
```
Before starting any development work:
□ Outcome definition: What does "working" look like for this task?
□ Time boxing: Can this be completed in 15-30 minutes?
□ Dependency mapping: What must be complete before this task?
□ Success criteria: How will we validate completion?
□ Context preservation: How do we maintain state between sessions?
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

### Protocol-Aware Assistance
- **Context-Aware**: AI understands security, debt, and testing priorities
- **Decision Support**: AI helps apply decision frameworks
- **Quality Assurance**: AI assists with protocol compliance checking
- **Documentation**: AI helps maintain protocol documentation

### Tool Configurations
- **Cursor Rules**: Automated protocol enforcement in `.cursor-rules`
- **Claude Code**: Protocol-aware commands and workflows
- **MCP Servers**: Access to protocol documentation and templates
- **Automation**: CI/CD integration for protocol validation

### Full Protocol Documentation
For detailed guidance beyond these quick frameworks, search project knowledge for:
- "Security-First Mindset Protocol" - Comprehensive security guidelines
- "Technical Debt Management Protocol" - Strategic debt management
- "TDD/SDD Integration Protocol" - Test-driven development practices
- "Surgical Debugging Protocol" - Systematic debugging methodology
- "Task Decomposition Protocol" - Strategic work breakdown strategies
- "AI Integration Protocol" - AI tool integration best practices

## Current Project Context

### Active Priorities
- Protocol implementation and validation
- Template enhancement with integrated best practices
- Tool configuration for automated protocol enforcement
- Team training and adoption of integrated methodologies

### Success Metrics
- **Security**: Zero critical vulnerabilities in production
- **Debt**: Debt-to-feature ratio maintained below 1:3
- **Testing**: >90% test coverage with specification alignment
- **Velocity**: Development speed maintained while improving quality

## Future Enhancements

Planned improvements include:
- **Advanced Templates**: Mobile and desktop with full protocol integration
- **Automated Monitoring**: Real-time protocol compliance dashboards
- **AI Orchestration**: Multi-agent AI workflows for complex development tasks
- **Cross-Project Analytics**: Workspace-wide metrics and optimization

## Remember: Protocols Enable Excellence

These protocols are not constraints—they're enablers that allow us to build secure, maintainable, high-quality software faster and more reliably. Every protocol decision should ask: "Does this help us deliver better software more efficiently?"

**When in doubt: prioritize security, document debt decisions, write tests first, debug surgically, decompose tasks strategically, and leverage AI thoughtfully.**
# CLAUDE.md Template (Global)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository, incorporating professional development protocols and BMAD multi-agent workflows.

## Repository Overview

**Project Name**: [PROJECT_NAME]
**Project Type**: [web|api|mobile|desktop|library]
**Framework**: [React|Express|React Native|Electron|Custom]
**Language**: [TypeScript|JavaScript|Python|Other]

This project follows the my-dev-workspace development standards with integrated security-first, test-driven, and BMAD multi-agent development practices.

## Core Development Philosophy

### Security-First Mindset
Every development decision prioritizes security from design through deployment. Security is not a feature to add later—it's a foundational design principle.

### BMAD Multi-Agent Orchestration
Professional enterprise-grade agile development using coordinated AI agents for planning, development, and quality assurance phases.

### Test-Driven Development Integration
Specifications and tests drive implementation. Code quality is ensured through comprehensive testing strategies and continuous validation.

### Strategic Technical Debt Management
Technical debt is a conscious strategic tool, not an accident. Every shortcut decision is evaluated, documented, and actively managed.

## Project-Specific Configuration

### Build Commands
```bash
# Development
npm run dev              # [CUSTOMIZE: Add project-specific dev command]
npm run test:tdd         # TDD workflow with watch mode
npm run security:scan    # Security vulnerability scanning

# Production
npm run build           # Production build
npm run lint           # Code quality validation
npm test               # Comprehensive test suite
```

### BMAD Agent Integration
**Primary Development Agents**:
- `/analyst` - [CUSTOMIZE: Project-specific analysis needs]
- `/pm` - [CUSTOMIZE: Product management focus areas]  
- `/architect` - [CUSTOMIZE: Technical architecture requirements]
- `/dev` - [CUSTOMIZE: Development coordination patterns]
- `/qa` - [CUSTOMIZE: Quality assurance standards]

### Project-Specific Protocols
- **Security Requirements**: [CUSTOMIZE: List specific security requirements]
- **Testing Strategy**: [CUSTOMIZE: Testing approach and requirements]
- **Performance Targets**: [CUSTOMIZE: Performance goals and metrics]
- **Deployment Process**: [CUSTOMIZE: Deployment and release procedures]

## Quality Gates and Validation

### Pre-Commit Checklist
- [ ] All tests passing
- [ ] Security scan clean
- [ ] Linting rules satisfied
- [ ] Documentation updated
- [ ] [CUSTOMIZE: Add project-specific checks]

### Agent Handoff Validation
- [ ] Planning phase: All requirements specified and validated
- [ ] Development phase: Implementation matches specifications
- [ ] Quality phase: All quality gates passed
- [ ] Documentation phase: Complete and current documentation

## Emergency Procedures

### Security Incidents
1. Immediate containment with `/qa` agent escalation
2. [CUSTOMIZE: Project-specific security response]

### Critical Bugs
1. Surgical debugging hierarchy escalation
2. [CUSTOMIZE: Project-specific debugging procedures]

### Agent Communication Failures
1. Fallback to manual handoffs
2. [CUSTOMIZE: Project-specific recovery procedures]

## Project Context

### Current Sprint Focus
- [CUSTOMIZE: Current development priorities]

### Technical Architecture
- [CUSTOMIZE: Key architectural decisions and patterns]

### Dependencies
- [CUSTOMIZE: Critical dependencies and versions]

### Team Coordination
- [CUSTOMIZE: Team-specific coordination patterns]

## Remember: Protocols Enable Excellence

These protocols are not constraints—they're enablers that allow us to build secure, maintainable, high-quality software faster and more reliably.

**Claude Code Implementation Priorities:**
1. **Always follow protocol phase sequences** - Never skip mandatory phases
2. **Use TodoWrite for all task tracking** - Every protocol integrates task management  
3. **Coordinate through BMAD agents** - Leverage specialized agents for optimal results
4. **Validate at every quality gate** - Confirm completion criteria before progression
5. **Preserve context between sessions** - Document protocol state for continuation

**Project Integration Command**: When implementing any feature for this project, assess complexity, apply BMAD multi-agent coordination, track with TodoWrite, and validate through project-specific quality gates.
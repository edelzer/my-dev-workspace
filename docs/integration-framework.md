# Integration Framework

This document describes how the workspace integrates security, technical debt management, testing, debugging, task management, and multi-agent coordination.

## Security Integration

Templates include security configs, automated scanning, and validation gates in CI/CD pipelines.

**Key Features:**
- Security-first configurations in all project templates
- Automated security scanning tools integrated
- CI/CD pipeline validation gates
- Security middleware in API templates
- Security audit trail in memory system

## Technical Debt Management

Budget allocation and tracking system for conscious debt management.

**Budget Constraints:**
- Maximum 20% new technical debt allowed
- Minimum 15% debt reduction required per sprint
- Authorization requirements for debt introduction
- Impact assessment for all debt decisions
- Active tracking in project knowledge base

## Testing Integration

TDD workflow with AI-enhanced test generation and comprehensive coverage.

**Testing Strategy:**
- Unit testing frameworks integrated in all templates
- Integration testing patterns and examples
- End-to-end (E2E) testing configurations
- AI-enhanced test generation from specifications
- Comprehensive coverage tracking and reporting

## Debugging Integration

Systematic Level 1-7 escalation hierarchy for issue resolution.

**Debugging Approach:**
- Minimal-impact interventions (Level 1-2 first)
- Systematic escalation to higher levels only when needed
- Context preservation across debugging sessions
- Memory system tracking of debugging solutions
- Pattern library of proven debugging approaches

## Task Management Integration

15-30 minute micro-sessions with TodoWrite tracking and incremental complexity building.

**Task Workflow:**
- Task decomposition into manageable micro-sessions
- Mandatory TodoWrite tracking for all development work
- Clear success criteria for each task
- Incremental complexity building approach
- Progress validation at completion gates

## Multi-Agent Coordination

Shared `.bmad-workspace/` directory, 17 task commands, quality gates, and cross-agent coordination protocols.

**Coordination Features:**
- Shared workspace for agent collaboration
- 17 specialized task commands for BMAD agents
- Quality validation gates between agent handoffs
- Context packages for seamless agent transitions
- Memory system integration for cross-session coordination

## Protocol Hierarchy

All integrations follow these protocol sequences:

1. **Security-First Protocol**: ANALYZE → IMPLEMENT → TEST → MONITOR
2. **SDD/TDD Integration**: SPECIFY → TEST → IMPLEMENT → REFACTOR
3. **Task Decomposition**: ANALYZE → DECOMPOSE → SEQUENCE → TRACK → VALIDATE
4. **Surgical Debugging**: Level 1-7 systematic escalation
5. **Technical Debt Management**: IDENTIFY → EVALUATE → AUTHORIZE → DOCUMENT → TRACK

For detailed protocol implementations, see [CLAUDE.md](../CLAUDE.md) Laws #2-4 and the [protocols](protocols/) directory.

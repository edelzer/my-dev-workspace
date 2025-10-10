# Cursor Agent System

## Overview

15 specialized AI agents adapted for Cursor workflows, providing expert assistance across all phases of software development. These agents integrate with Cursor's Chat and Composer features to provide specialized guidance for requirements analysis, architecture design, implementation, testing, and quality assurance.

## Quick Reference

### Foundation Team (5 agents)

| Agent                       | Use When                                 | Invoke With                                             |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| **spec-analyst**            | Requirements analysis, user stories      | `@.cursor/agents/foundation/spec-analyst.md`            |
| **spec-architect**          | System design, technology selection      | `@.cursor/agents/foundation/spec-architect.md`          |
| **spec-planner**            | Task decomposition, sprint planning      | `@.cursor/agents/foundation/spec-planner.md`            |
| **requirements-specialist** | Requirements + planning combined         | `@.cursor/agents/foundation/requirements-specialist.md` |
| **project-manager**         | Workflow coordination, progress tracking | `@.cursor/agents/foundation/project-manager.md`         |

### Implementation Team (4 agents)

| Agent                  | Use When                                    | Invoke With                                            |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------ |
| **frontend-developer** | UI/UX implementation, React/TypeScript      | `@.cursor/agents/implementation/frontend-developer.md` |
| **backend-developer**  | Server-side logic, API development          | `@.cursor/agents/implementation/backend-developer.md`  |
| **spec-developer**     | Full-stack integration, end-to-end features | `@.cursor/agents/implementation/spec-developer.md`     |
| **data-engineer**      | Database design, data pipelines, ETL        | `@.cursor/agents/implementation/data-engineer.md`      |

### Quality Team (6 agents) - Testing & Validation

| Agent                            | Use When                                | Invoke With                                               |
| -------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| **spec-tester**                  | Testing strategies, test implementation | `@.cursor/agents/quality/spec-tester.md`                  |
| **spec-reviewer**                | Code review, quality gates              | `@.cursor/agents/quality/spec-reviewer.md`                |
| **spec-validator**               | Final validation, deployment readiness  | `@.cursor/agents/quality/spec-validator.md`               |
| **quality-assurance-specialist** | Comprehensive QA, requirements auditing | `@.cursor/agents/quality/quality-assurance-specialist.md` |
| **security-specialist**          | Security analysis, threat modeling      | `@.cursor/agents/quality/security-specialist.md`          |
| **devops-specialist**            | Infrastructure, CI/CD, deployment       | `@.cursor/agents/quality/devops-specialist.md`            |

## Cursor Invocation Methods

### Method 1: Chat with @mentions

1. Open Cursor Chat panel
2. Type `@` and start typing the agent file path
3. Select the agent file from autocomplete
4. State your request in natural language

**Example:**

```
@.cursor/agents/foundation/spec-analyst.md analyze requirements for user authentication feature
```

### Method 2: Cursor Composer with Context

1. Open Cursor Composer (Cmd/Ctrl+Shift+I)
2. Add agent file to context using `@` mentions
3. Describe your needs in detail
4. Request becomes scoped to agent's expertise
5. Review and iterate on agent's recommendations

**Example Workflow:**

```
1. Open Composer
2. Add @.cursor/agents/foundation/spec-analyst.md
3. Request: "Analyze requirements for e-commerce checkout flow"
4. Review requirements analysis
5. Add @.cursor/agents/foundation/spec-architect.md
6. Request: "Design system architecture based on these requirements"
```

### Method 3: Sequential Agent Workflows

Use Cursor Composer for multi-agent sequences:

**Planning Phase:**

```
1. @.cursor/agents/foundation/spec-analyst.md (requirements)
2. @.cursor/agents/foundation/spec-architect.md (design)
3. @.cursor/agents/foundation/spec-planner.md (task breakdown)
```

**Implementation Phase:**

```
1. @.cursor/agents/implementation/spec-developer.md (full-stack)
   OR
   @.cursor/agents/implementation/frontend-developer.md (UI)
   + @.cursor/agents/implementation/backend-developer.md (API)
   + @.cursor/agents/implementation/data-engineer.md (database/data)
```

**Quality Phase:**

```
1. @.cursor/agents/quality/spec-tester.md (testing)
2. @.cursor/agents/quality/spec-reviewer.md (code review)
3. @.cursor/agents/quality/security-specialist.md (security audit)
4. @.cursor/agents/quality/devops-specialist.md (infrastructure/deployment)
5. @.cursor/agents/quality/spec-validator.md (final validation)
```

## Agent Categories

### Foundation Team - Project Planning & Architecture

**Purpose:** Strategic planning, requirements analysis, and system architecture design

**When to Use:**

- Starting new projects or features
- Analyzing requirements and user stories
- Designing system architecture
- Breaking down complex work into tasks
- Coordinating project workflows

**Typical Sequence:**

```
spec-analyst → spec-architect → spec-planner → project-manager (coordination)
```

### Implementation Team - Feature Development

**Purpose:** Hands-on development across frontend, backend, and full-stack

**When to Use:**

- Implementing user interfaces
- Building APIs and server-side logic
- Developing end-to-end features
- Integrating systems and components

**Typical Sequence:**

```
(Parallel) frontend-developer + backend-developer + spec-developer
```

### Quality Team - Testing & Validation

**Purpose:** Testing strategies, code review, security analysis, and deployment readiness

**When to Use:**

- Creating test strategies and test cases
- Reviewing code for quality and security
- Validating specification compliance
- Preparing for deployment
- Comprehensive requirements auditing
- Security threat modeling and analysis

## Protocol Compliance

All agents follow the 6 Absolute Laws defined in `.cursorrules`:

1. **Law #1**: Uncertainty Protocol - Agents stop when uncertain and request clarification
2. **Law #2**: Protocol Adherence - Systematic approach to all workflows
3. **Law #3**: Orchestrated Efficiency - Proper agent delegation and coordination
4. **Law #4**: Surgical Precision - Minimal viable interventions (Level 1-7)
5. **Law #5**: Senior Developer Leadership - Professional reporting and mentorship
6. **Law #6**: Memory & Learning - Cross-session context preservation

## Complete Development Workflow Integration

The 15-agent system provides comprehensive coverage for all development phases:

**Greenfield Development (New Projects):**

```
Planning: spec-analyst → spec-architect → spec-planner
Implementation: spec-developer (or frontend-developer + backend-developer)
Quality: spec-tester → spec-reviewer → security-specialist → spec-validator
```

**Brownfield Development (Existing Projects):**

```
Analysis: requirements-specialist → spec-architect (assess current state)
Enhancement: spec-developer → spec-tester → spec-reviewer
Validation: quality-assurance-specialist → spec-validator
```

## Common Workflows

### New Feature Development

```
1. @spec-analyst - Analyze requirements
2. @spec-architect - Design architecture
3. @spec-planner - Create task breakdown
4. @spec-developer - Implement feature
5. @spec-tester - Create test suite
6. @spec-reviewer - Code review
7. @spec-validator - Final validation
```

### Bug Fix Workflow

```
1. @spec-developer - Analyze and fix bug (Level 1-3 surgical debugging)
2. @spec-tester - Verify fix with tests
3. @spec-reviewer - Review changes
```

### Architecture Refactoring

```
1. @spec-architect - Design new architecture
2. @spec-planner - Create migration plan
3. @spec-developer - Execute refactoring in increments
4. @security-specialist - Security review
5. @spec-validator - Validate refactoring success
```

## Tips for Effective Agent Use

1. **Start Broad**: Begin with foundation agents for planning, then move to implementation
2. **Use Composer for Complex Tasks**: Multi-agent sequences work best in Composer
3. **Maintain Context**: Keep relevant agents in context for follow-up questions
4. **Follow Handoff Patterns**: Each agent suggests next agent for smooth workflows
5. **Leverage Memory**: Agents save patterns and solutions for future sessions
6. **Respect the Laws**: All agents enforce the 6 Absolute Laws for quality

## System Status

- **Session 1 Complete**: `.cursorrules` file with 6 Absolute Laws
- **Session 2 Complete**: Foundation (5) + Implementation (3) agents = 8 agents
- **Session 3 Complete**: Quality (5) agents = 5 agents
- **Session 5 Enhancement**: Added data-engineer + devops-specialist = 2 agents
- **Total Complete**: 15 specialized agents for comprehensive development support

## Additional Resources

- **Complete Workflow Guide**: [../../docs/cursor/CURSOR_WORKFLOW_GUIDE.md](../../docs/cursor/CURSOR_WORKFLOW_GUIDE.md) - Comprehensive development workflows and advanced patterns
- **Detailed Usage Guide**: [AGENT_USAGE_GUIDE.md](AGENT_USAGE_GUIDE.md) - Examples, patterns, and best practices
- **Main Documentation**: [../../README.md](../../README.md#cursor-ide-integration) - Full workspace overview with Cursor integration
- **Agent Coordination**: Each agent includes handoff instructions for seamless workflows
- **Memory Integration**: All agents integrate with cross-session memory system (Law #6)
- **Protocol Compliance**: All agents enforce the 6 Absolute Laws defined in [.cursorrules](../../.cursorrules)

---

**Last Updated:** Session 3 Complete - All 15 agents operational
**System Status:** Production ready for Cursor development workflows
**Next Phase:** Documentation and integration (Session 4)

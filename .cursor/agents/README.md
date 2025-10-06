# Cursor Agent System

## Overview

25 specialized AI agents adapted for Cursor workflows, providing expert assistance across all phases of software development. These agents integrate with Cursor's Chat and Composer features to provide specialized guidance for requirements analysis, architecture design, implementation, testing, and quality assurance.

## Quick Reference

### Foundation Team (5 agents)

| Agent | Use When | Invoke With |
|-------|----------|-------------|
| **spec-analyst** | Requirements analysis, user stories | `@.cursor/agents/foundation/spec-analyst.md` |
| **spec-architect** | System design, technology selection | `@.cursor/agents/foundation/spec-architect.md` |
| **spec-planner** | Task decomposition, sprint planning | `@.cursor/agents/foundation/spec-planner.md` |
| **requirements-specialist** | Requirements + planning combined | `@.cursor/agents/foundation/requirements-specialist.md` |
| **project-manager** | Workflow coordination, progress tracking | `@.cursor/agents/foundation/project-manager.md` |

### Implementation Team (3 agents)

| Agent | Use When | Invoke With |
|-------|----------|-------------|
| **frontend-developer** | UI/UX implementation, React/TypeScript | `@.cursor/agents/implementation/frontend-developer.md` |
| **backend-developer** | Server-side logic, API development | `@.cursor/agents/implementation/backend-developer.md` |
| **spec-developer** | Full-stack integration, end-to-end features | `@.cursor/agents/implementation/spec-developer.md` |

### Quality Team (5 agents) - Coming in Session 3

| Agent | Use When | Invoke With |
|-------|----------|-------------|
| **spec-tester** | Testing strategies, test implementation | `@.cursor/agents/quality/spec-tester.md` (Session 3) |
| **spec-reviewer** | Code review, quality gates | `@.cursor/agents/quality/spec-reviewer.md` (Session 3) |
| **spec-validator** | Specification compliance validation | `@.cursor/agents/quality/spec-validator.md` (Session 3) |
| **quality-assurance-specialist** | Requirements auditing, deployment readiness | `@.cursor/agents/quality/quality-assurance-specialist.md` (Session 3) |
| **security-specialist** | Security analysis, threat modeling | `@.cursor/agents/quality/security-specialist.md` (Session 3) |

### BMAD Strategic Team (10 agents) - Coming in Session 3

| Agent | Use When | Invoke With |
|-------|----------|-------------|
| **analyst** | Market research, competitive analysis | `@.cursor/agents/bmad/analyst.md` (Session 3) |
| **pm** | Product management, requirements coordination | `@.cursor/agents/bmad/pm.md` (Session 3) |
| **architect** | Technical architecture, integration planning | `@.cursor/agents/bmad/architect.md` (Session 3) |
| **po** | Product owner, validation, checklist execution | `@.cursor/agents/bmad/po.md` (Session 3) |
| **dev** | Implementation coordination | `@.cursor/agents/bmad/dev.md` (Session 3) |
| **ux-expert** | User experience design | `@.cursor/agents/bmad/ux-expert.md` (Session 3) |
| **qa** | Quality assurance validation | `@.cursor/agents/bmad/qa.md` (Session 3) |
| **sm** | Scrum master, sprint planning | `@.cursor/agents/bmad/sm.md` (Session 3) |
| **bmad-master** | Can perform any task, methodology expert | `@.cursor/agents/bmad/bmad-master.md` (Session 3) |
| **bmad-orchestrator** | Complex coordination and orchestration | `@.cursor/agents/bmad/bmad-orchestrator.md` (Session 3) |

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

### Method 2: Composer with Context

1. Open Composer (Cmd/Ctrl+Shift+I)
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

Use Composer for multi-agent sequences:

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
```

**Quality Phase (Session 3):**
```
1. @.cursor/agents/quality/spec-tester.md (testing)
2. @.cursor/agents/quality/spec-reviewer.md (code review)
3. @.cursor/agents/quality/security-specialist.md (security audit)
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

### Quality Team - Testing & Validation (Session 3)

**Purpose:** Testing strategies, code review, security analysis, and deployment readiness

**When to Use:**
- Creating test strategies and test cases
- Reviewing code for quality and security
- Validating specification compliance
- Preparing for deployment

### BMAD Strategic Team - Business & Planning (Session 3)

**Purpose:** Strategic business analysis, product management, and complex coordination

**When to Use:**
- Market research and competitive analysis
- Product requirements and roadmap planning
- Complex multi-team coordination
- Brownfield project enhancements

## Protocol Compliance

All agents follow the 6 Absolute Laws defined in `.cursorrules`:

1. **Law #1**: Uncertainty Protocol - Agents stop when uncertain and request clarification
2. **Law #2**: Protocol Adherence - Systematic approach to all workflows
3. **Law #3**: Orchestrated Efficiency - Proper agent delegation and coordination
4. **Law #4**: Surgical Precision - Minimal viable interventions (Level 1-7)
5. **Law #5**: Senior Developer Leadership - Professional reporting and mentorship
6. **Law #6**: Memory & Learning - Cross-session context preservation

## BMAD Workflow Integration

The agent system integrates with BMAD-METHOD workflows for enterprise-grade development:

**Greenfield Development (New Projects):**
```
BMAD Planning: analyst → pm → architect → po
Custom Implementation: spec-analyst → spec-architect → spec-developer
BMAD Quality: qa → bmad-orchestrator
```

**Brownfield Development (Existing Projects):**
```
BMAD Analysis: analyst → architect (document current state)
Custom Enhancement: requirements-specialist → spec-developer
BMAD Integration: dev → qa
```

## Common Workflows

### New Feature Development

```
1. @spec-analyst - Analyze requirements
2. @spec-architect - Design architecture
3. @spec-planner - Create task breakdown
4. @spec-developer - Implement feature
5. @spec-tester - Create test suite (Session 3)
6. @spec-reviewer - Code review (Session 3)
```

### Bug Fix Workflow

```
1. @spec-developer - Analyze and fix bug (Level 1-3 surgical debugging)
2. @spec-tester - Verify fix with tests (Session 3)
3. @spec-reviewer - Review changes (Session 3)
```

### Architecture Refactoring

```
1. @spec-architect - Design new architecture
2. @spec-planner - Create migration plan
3. @spec-developer - Execute refactoring in increments
4. @security-specialist - Security review (Session 3)
```

## Tips for Effective Agent Use

1. **Start Broad**: Begin with foundation agents for planning, then move to implementation
2. **Use Composer for Complex Tasks**: Multi-agent sequences work best in Composer
3. **Maintain Context**: Keep relevant agents in context for follow-up questions
4. **Follow Handoff Patterns**: Each agent suggests next agent for smooth workflows
5. **Leverage Memory**: Agents save patterns and solutions for future sessions
6. **Respect the Laws**: All agents enforce the 6 Absolute Laws for quality

## Session Progress

- **Session 1 Complete**: `.cursorrules` file with 6 Absolute Laws (1,476 lines)
- **Session 2 Complete**: Foundation (5) + Implementation (3) agents = 8 agents
- **Session 3 Pending**: Quality (5) + BMAD (10) agents = 15 agents
- **Total Target**: 25 specialized agents for comprehensive development support

---

**Last Updated:** Session 2 - Foundation and Implementation agents complete
**Next Session:** Quality and BMAD agents (15 remaining)
**Full Documentation:** See `docs/cursor/CURSOR_WORKFLOW_GUIDE.md` (Session 4)


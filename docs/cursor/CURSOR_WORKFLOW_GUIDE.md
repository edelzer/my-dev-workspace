# Cursor Workflow Guide

## Complete Guide to AI-Powered Development with Cursor

This comprehensive guide covers everything you need to know about using the 15-agent Cursor system for professional software development. From basic agent interactions to advanced multi-agent workflows, this guide will help you master AI-assisted development.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Agent System Overview](#agent-system-overview)
3. [Cursor Integration Methods](#cursor-integration-methods)
4. [Complete Workflow Examples](#complete-workflow-examples)
5. [Advanced Patterns](#advanced-patterns)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Performance Optimization](#performance-optimization)

## Quick Start

### 5-Minute Setup

```bash
# 1. Verify agent system is ready
ls .cursor/agents/
# Should show: foundation/, implementation/, quality/, README.md, AGENT_USAGE_GUIDE.md

# 2. Test basic agent interaction (Cursor Chat)
@.cursor/agents/foundation/spec-analyst.md help me understand the agent system

# 3. Test Composer workflow
# Open Composer (Cmd/Ctrl+Shift+I)
# Add @.cursor/agents/foundation/spec-analyst.md
# Request: "Analyze requirements for a simple todo app"
```

### First Agent Interaction

**Cursor Chat Example:**

```
@.cursor/agents/foundation/spec-analyst.md I need to build a user authentication system. What requirements should I consider?
```

**Expected Response:**

- Functional requirements (login, logout, registration, password reset)
- Non-functional requirements (security, performance, scalability)
- User stories and acceptance criteria
- Edge cases and error scenarios
- Integration considerations

## Agent System Overview

### Complete 15-Agent Architecture

```
Foundation Team (Planning & Architecture)
├── spec-analyst            # Requirements analysis, user stories
├── spec-architect          # System design, technology selection
├── spec-planner           # Task decomposition, sprint planning
├── requirements-specialist # Requirements + planning combined
└── project-manager        # Workflow coordination, progress tracking

Implementation Team (Development)
├── frontend-developer     # UI/UX implementation, React/TypeScript
├── backend-developer      # Server-side logic, API development
└── spec-developer         # Full-stack integration, end-to-end features

Quality Team (Testing & Validation)
├── spec-tester            # Testing strategies, test implementation
├── spec-reviewer          # Code review, quality gates
├── spec-validator         # Final validation, deployment readiness
├── quality-assurance-specialist # Comprehensive QA, requirements auditing
└── security-specialist    # Security analysis, threat modeling
```

### Agent Specializations

#### Foundation Team - Strategic Planning

- **When to use**: Project start, feature planning, architecture decisions
- **Output**: Requirements, system design, task breakdown, project coordination
- **Handoff to**: Implementation team for development

#### Implementation Team - Development

- **When to use**: Active development, code implementation, debugging
- **Output**: Working code, components, APIs, integrations
- **Handoff to**: Quality team for validation

#### Quality Team - Validation & Deployment

- **When to use**: Testing, code review, security analysis, deployment
- **Output**: Test suites, quality reports, security assessments, deployment approval
- **Handoff to**: Production deployment or back to implementation for fixes

## Cursor Integration Methods

### Method 1: Chat with @mentions

**Best for:** Quick questions, debugging, single-task assistance, immediate guidance

**How to Use:**

1. Open Cursor Chat panel
2. Type `@` and start typing agent path
3. Select agent from autocomplete
4. State your request clearly

**Examples:**

```bash
# Requirements analysis
@.cursor/agents/foundation/spec-analyst.md analyze requirements for user profile management

# Quick debugging
@.cursor/agents/implementation/spec-developer.md this function is throwing an error, help me debug it

# Security review
@.cursor/agents/quality/security-specialist.md review this authentication code for vulnerabilities

# Code review
@.cursor/agents/quality/spec-reviewer.md review this component for best practices and performance
```

**Chat Best Practices:**

- Be specific about what you need
- Include relevant code snippets or context
- Ask follow-up questions for clarification
- Use for quick iterations and immediate feedback

### Method 2: Composer with Context

**Best for:** Complex workflows, multi-file changes, comprehensive analysis, feature development

**How to Use:**

1. Open Composer (Cmd/Ctrl+Shift+I)
2. Add agent file using `@` mentions
3. Add relevant project files to context
4. Provide detailed description of needs
5. Review and iterate on recommendations

**Composer Workflow Example:**

```bash
# Step 1: Open Composer and add agent
Add @.cursor/agents/foundation/spec-analyst.md

# Step 2: Add context files
Add: requirements.md, user-stories.md, existing-api-docs.md

# Step 3: Detailed request
Request: "Analyze requirements for implementing real-time notifications.
Consider existing user management system, current API architecture,
and mobile app requirements. Focus on scalability and security."

# Step 4: Review analysis
# Agent provides comprehensive analysis with:
# - Functional requirements breakdown
# - Technical requirements and constraints
# - Integration points with existing systems
# - Security and performance considerations
# - Recommended implementation approach

# Step 5: Continue workflow
Add @.cursor/agents/foundation/spec-architect.md
Request: "Design system architecture based on the requirements analysis"
```

**Composer Best Practices:**

- Add all relevant context files
- Provide comprehensive problem description
- Use for multi-step workflows
- Iterate and refine based on agent feedback
- Keep agents in context for follow-up questions

### Method 3: Sequential Agent Workflows

**Best for:** Complete feature development, systematic project progression, end-to-end delivery

**Planning → Implementation → Quality → Deployment**

```bash
# Phase 1: Strategic Planning
@.cursor/agents/foundation/spec-analyst.md
↓ (handoff: requirements document)
@.cursor/agents/foundation/spec-architect.md
↓ (handoff: system design)
@.cursor/agents/foundation/spec-planner.md
↓ (handoff: task breakdown)

# Phase 2: Implementation
@.cursor/agents/implementation/spec-developer.md
# OR parallel development:
@.cursor/agents/implementation/frontend-developer.md +
@.cursor/agents/implementation/backend-developer.md
↓ (handoff: working code)

# Phase 3: Quality Assurance
@.cursor/agents/quality/spec-tester.md
↓ (handoff: test suite)
@.cursor/agents/quality/spec-reviewer.md
↓ (handoff: code review)
@.cursor/agents/quality/security-specialist.md
↓ (handoff: security assessment)

# Phase 4: Deployment Validation
@.cursor/agents/quality/spec-validator.md
↓ (handoff: deployment approval)
```

## Complete Workflow Examples

### Example 1: E-commerce Product Search Feature

#### Phase 1: Requirements & Architecture (Composer)

**Step 1: Requirements Analysis**

```bash
# Composer Session 1
Agent: @.cursor/agents/foundation/spec-analyst.md
Context: existing-product-catalog.md, user-research.md, competitor-analysis.md
Request: "Analyze requirements for advanced product search with filters,
sorting, autocomplete, and personalized recommendations"

Output:
- 15 user stories with acceptance criteria
- Functional requirements (search, filter, sort, autocomplete)
- Non-functional requirements (performance <500ms, scalability)
- Edge cases (no results, network issues, large datasets)
- Integration requirements (existing catalog, user preferences)
```

**Step 2: System Architecture**

```bash
# Continue in same Composer session
Add Agent: @.cursor/agents/foundation/spec-architect.md
Request: "Design system architecture for the product search requirements"

Output:
- Database schema for search indexing
- API endpoint design with OpenAPI spec
- Frontend component architecture
- Caching strategy (Redis for search results)
- Technology recommendations (Elasticsearch, React Query)
- Performance optimization approach
```

**Step 3: Task Planning**

```bash
# Continue in same Composer session
Add Agent: @.cursor/agents/foundation/spec-planner.md
Request: "Break down implementation into development tasks"

Output:
- 12 development tasks with time estimates
- Dependency mapping and critical path
- Sprint planning recommendations (3 sprints)
- Risk assessment and mitigation strategies
- Testing strategy and quality gates
```

#### Phase 2: Implementation (Parallel Development)

**Backend Development:**

```bash
# Composer Session 2
Agent: @.cursor/agents/implementation/backend-developer.md
Context: architecture-design.md, api-spec.yaml, existing-product-model.js
Request: "Implement search API endpoints with Elasticsearch integration"

Output:
- Search controller with filtering and pagination
- Elasticsearch query builders
- Input validation and sanitization
- Error handling and logging
- API documentation updates
- Performance monitoring integration
```

**Frontend Development:**

```bash
# Composer Session 3 (Parallel)
Agent: @.cursor/agents/implementation/frontend-developer.md
Context: design-mockups.figma, component-library.md, api-spec.yaml
Request: "Implement search UI with React, including filters and autocomplete"

Output:
- SearchContainer component with state management
- SearchFilters component with dynamic filter options
- SearchResults component with pagination
- AutocompleteInput with debouncing
- Responsive design implementation
- Accessibility compliance (WCAG 2.1 AA)
```

#### Phase 3: Quality Assurance (Sequential)

**Testing Strategy:**

```bash
# Composer Session 4
Agent: @.cursor/agents/quality/spec-tester.md
Context: All implementation files, requirements.md, api-spec.yaml
Request: "Create comprehensive test suite for product search feature"

Output:
- Unit tests for search logic (Jest)
- Integration tests for API endpoints (Supertest)
- E2E tests for user workflows (Playwright)
- Performance tests for search speed (K6)
- Accessibility tests (axe-core)
- Test data setup and teardown
```

**Code Review:**

```bash
# Composer Session 5
Agent: @.cursor/agents/quality/spec-reviewer.md
Context: All implementation files, test files, architecture docs
Request: "Comprehensive code review focusing on performance and maintainability"

Output:
- Code quality assessment with specific recommendations
- Performance optimization suggestions
- Security vulnerability analysis
- Best practice compliance review
- Refactoring recommendations
- Technical debt assessment
```

**Security Analysis:**

```bash
# Composer Session 6
Agent: @.cursor/agents/quality/security-specialist.md
Context: API implementation, database queries, frontend components
Request: "Security review of product search functionality"

Output:
- Threat model for search feature
- SQL injection prevention validation
- XSS protection in search results
- Rate limiting recommendations
- Input sanitization review
- Data privacy compliance check
```

**Final Validation:**

```bash
# Composer Session 7
Agent: @.cursor/agents/quality/spec-validator.md
Context: All test results, code review reports, security assessment
Request: "Final deployment readiness assessment for product search"

Output:
- Go/no-go deployment recommendation
- Quality gate status (all passed)
- Performance benchmark validation
- Security posture confirmation
- Stakeholder sign-off checklist
- Post-deployment monitoring plan
```

### Example 2: Bug Fix Workflow (Authentication Issue)

#### Quick Debugging (Chat)

```bash
@.cursor/agents/implementation/spec-developer.md I'm getting "JWT token validation failing intermittently" - help me debug this

Response:
- Systematic debugging approach (Level 1-3)
- Common JWT validation failure causes
- Specific code areas to investigate
- Immediate troubleshooting steps
- Logging recommendations for diagnosis
```

#### Deep Analysis (Composer)

```bash
# If chat debugging doesn't resolve
Agent: @.cursor/agents/quality/security-specialist.md
Context: auth-middleware.js, jwt-utils.js, user-model.js, error-logs.txt
Request: "Comprehensive security analysis of JWT implementation and intermittent failures"

Output:
- JWT lifecycle analysis
- Token expiration handling review
- Clock skew and timing issue analysis
- Secret key management assessment
- Refresh token implementation review
- Security best practices recommendations
```

### Example 3: Performance Optimization

#### Initial Analysis (Chat)

```bash
@.cursor/agents/quality/spec-reviewer.md database queries are slow, response times >2s - analyze performance

Response:
- Query performance analysis approach
- Common performance bottlenecks
- Indexing recommendations
- N+1 query identification
- Caching strategy suggestions
```

#### Implementation (Composer)

```bash
Agent: @.cursor/agents/implementation/backend-developer.md
Context: slow-queries.sql, database-schema.sql, performance-logs.txt
Request: "Optimize database queries based on performance analysis"

Output:
- Optimized query implementations
- Database index recommendations
- Query result caching implementation
- Connection pooling optimization
- Performance monitoring setup
```

#### Validation (Composer)

```bash
Agent: @.cursor/agents/quality/spec-tester.md
Context: optimized-queries.js, performance-benchmarks.md
Request: "Create performance tests to validate optimization"

Output:
- Performance test suite with benchmarks
- Load testing scenarios
- Performance regression prevention
- Monitoring and alerting setup
```

## Advanced Patterns

### Pattern 1: Requirements Audit with QA Specialist

**Use Case:** Comprehensive requirements compliance validation for complex projects

```bash
# Composer Workflow
Agent: @.cursor/agents/quality/quality-assurance-specialist.md
Context: All project documentation, implementation files, test results
Request: "Requirements audit mode - comprehensive compliance assessment using Req-ing Ball methodology"

Output:
- Three-tier validation report:
  - Tier 1: Requirements Traceability (40% weight)
  - Tier 2: Implementation Quality Assessment (35% weight)
  - Tier 3: User Journey Validation (25% weight)
- Overall compliance percentage with risk assessment
- Gap analysis with prioritized remediation
- Traceability matrix between requirements and implementation
- Compliance scoring dashboard
```

### Pattern 2: Multi-Agent Architecture Review

**Use Case:** Comprehensive system architecture validation from multiple perspectives

```bash
# Sequential Multi-Agent Analysis
# Step 1: Scalability Review
Agent: @.cursor/agents/foundation/spec-architect.md
Request: "Review current system architecture for scalability bottlenecks"

# Step 2: Security Architecture Review
Agent: @.cursor/agents/quality/security-specialist.md
Request: "Security architecture analysis of the same system"

# Step 3: Code Architecture Review
Agent: @.cursor/agents/quality/spec-reviewer.md
Request: "Code organization and maintainability review"

Combined Output:
- Multi-perspective architecture analysis
- Scalability improvement recommendations
- Security architecture validation
- Code organization improvements
- Integrated remediation plan
```

### Pattern 3: Full-Stack Feature with Integrated Quality Gates

**Use Case:** End-to-end feature development with continuous quality assurance

```bash
# Integrated Development Workflow
Phase 1: Strategic Planning
├── @.cursor/agents/foundation/spec-analyst.md (requirements)
├── @.cursor/agents/foundation/spec-architect.md (design)
└── @.cursor/agents/foundation/spec-planner.md (planning)

Phase 2: Implementation with Quality Integration
├── @.cursor/agents/implementation/spec-developer.md (development)
├── @.cursor/agents/quality/spec-tester.md (parallel test development)
└── @.cursor/agents/quality/security-specialist.md (security review)

Phase 3: Quality Validation
├── @.cursor/agents/quality/spec-reviewer.md (code review)
├── @.cursor/agents/quality/quality-assurance-specialist.md (compliance audit)
└── @.cursor/agents/quality/spec-validator.md (deployment validation)
```

### Pattern 4: Cross-Session Project Continuation

**Use Case:** Resuming complex projects across multiple development sessions

```bash
# Session 1: Initial Planning
Agents: spec-analyst → spec-architect → spec-planner
Memory: Saves requirements, architecture, and task breakdown

# Session 2: Implementation Start (Days Later)
Agent: @.cursor/agents/implementation/spec-developer.md
Request: "Continue implementation of user authentication based on previous planning"
# Agent automatically loads context from memory system

# Session 3: Quality Review (Week Later)
Agent: @.cursor/agents/quality/spec-reviewer.md
Request: "Review authentication implementation progress"
# Agent has full context of previous decisions and implementation
```

## Best Practices

### Context Management

#### Effective Context Addition

```bash
# Good: Comprehensive context
Add files: requirements.md, architecture.md, existing-code.js, test-files.spec.js
Agent: @.cursor/agents/implementation/spec-developer.md
Request: "Implement user profile update feature"

# Poor: Insufficient context
Agent: @.cursor/agents/implementation/spec-developer.md
Request: "Implement user profile update feature"
# Missing requirements, architecture, existing code context
```

#### Context Preservation

```bash
# Maintain agent context for follow-up questions
# After initial request, continue in same Composer session:
Follow-up: "Add validation for email format"
Follow-up: "Include error handling for network failures"
Follow-up: "Add unit tests for the validation logic"
```

### Agent Selection Strategy

#### Start Broad, Then Narrow

```bash
# 1. Start with foundation agents for any new work
@.cursor/agents/foundation/spec-analyst.md help me understand requirements for this feature

# 2. Move to architecture and planning
@.cursor/agents/foundation/spec-architect.md design the system architecture

# 3. Proceed to specific implementation
@.cursor/agents/implementation/frontend-developer.md implement the UI components

# 4. Finish with quality validation
@.cursor/agents/quality/spec-validator.md validate deployment readiness
```

#### Parallel vs Sequential Workflows

```bash
# Use Parallel for Independent Work:
Frontend: @.cursor/agents/implementation/frontend-developer.md
Backend: @.cursor/agents/implementation/backend-developer.md
Testing: @.cursor/agents/quality/spec-tester.md

# Use Sequential for Dependent Work:
Requirements → Architecture → Implementation → Review → Deployment
```

### Quality Gates Integration

#### Mandatory Security Review

```bash
# Never skip security analysis for production code
@.cursor/agents/quality/security-specialist.md review this authentication implementation

# Always validate deployment readiness
@.cursor/agents/quality/spec-validator.md assess go/no-go for production deployment
```

#### Comprehensive Testing Strategy

```bash
# Test-driven development workflow
1. @.cursor/agents/quality/spec-tester.md create failing tests from requirements
2. @.cursor/agents/implementation/spec-developer.md implement to pass tests
3. @.cursor/agents/quality/spec-reviewer.md review implementation and tests
4. @.cursor/agents/quality/spec-validator.md validate complete feature
```

### Memory System Optimization

#### Leverage Cross-Session Learning

```bash
# Agents learn from your patterns
# First time: Detailed explanation needed
@.cursor/agents/implementation/frontend-developer.md implement React component with TypeScript

# Later sessions: Agent remembers your preferences
@.cursor/agents/implementation/frontend-developer.md create another component
# Agent applies learned patterns automatically
```

#### Project-Specific Context

```bash
# Agents accumulate project knowledge
# Early in project: Basic guidance
# Later in project: Context-aware recommendations based on existing codebase
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: Agent Not Providing Expected Depth

**Symptoms:** Shallow responses, generic advice, missing project context

**Solutions:**

```bash
# Use Composer instead of Chat for complex requests
# Add more context files to Composer
# Be more specific in your requests
# Break complex requests into smaller, focused questions

# Good approach:
Agent: @.cursor/agents/quality/spec-reviewer.md
Context: component.tsx, test.spec.ts, requirements.md
Request: "Review this React component for performance, accessibility, and maintainability. Focus on the data fetching logic and error handling."

# Poor approach:
Agent: @.cursor/agents/quality/spec-reviewer.md
Request: "Review my code"
```

#### Issue: Conflicting Recommendations Between Agents

**Symptoms:** Different agents suggest different approaches

**Solutions:**

```bash
# Use QA Specialist to reconcile differences
Agent: @.cursor/agents/quality/quality-assurance-specialist.md
Context: conflicting-recommendations.md, agent-responses.md
Request: "Reconcile conflicting recommendations between security-specialist and spec-developer regarding authentication implementation"

# Or get architectural guidance
Agent: @.cursor/agents/foundation/spec-architect.md
Request: "Provide architectural guidance to resolve implementation approach conflicts"
```

#### Issue: Lost Context Between Sessions

**Symptoms:** Agents don't remember previous work

**Solutions:**

```bash
# Agents automatically save to memory system
# Reference previous work explicitly:
Request: "Continue the user authentication implementation from our previous session"

# Add relevant files from previous work to context
# Check memory system status if issues persist
```

#### Issue: Need Broader Perspective

**Symptoms:** Single agent view too narrow

**Solutions:**

```bash
# Use sequential multi-agent workflow
1. @.cursor/agents/foundation/spec-architect.md (system perspective)
2. @.cursor/agents/quality/security-specialist.md (security perspective)
3. @.cursor/agents/quality/spec-reviewer.md (code quality perspective)
4. @.cursor/agents/quality/quality-assurance-specialist.md (comprehensive analysis)
```

### Performance Optimization

#### Cursor-Specific Optimizations

**Composer Usage:**

- Best for multi-file changes and complex workflows
- Add all relevant context files upfront
- Use for iterative refinement of complex solutions
- Maintain agent context for follow-up questions

**Chat Usage:**

- Ideal for quick questions and immediate debugging
- Use for single-file modifications
- Best for clarification and guidance
- Quick iteration on small changes

**Terminal Integration:**

- Use Ctrl/Cmd+K for command generation
- Agents can recommend terminal commands
- Integration with development workflows

#### File Context Strategy

```bash
# Effective context management
# Add files in order of importance:
1. Requirements/specifications (most important)
2. Architecture documents
3. Existing implementation files
4. Test files
5. Configuration files (least important)

# Avoid context overload:
# Don't add entire codebase - focus on relevant files
# Remove outdated files from context
# Update context as work progresses
```

### Memory System Best Practices

#### Session Start Protocol

```bash
# Agents automatically check memory at session start
# You can reference previous work:
"Continue the e-commerce checkout implementation from last week"
"Apply the authentication patterns we established in the previous project"
"Use the testing strategy we developed for the user management feature"
```

#### Cross-Project Learning

```bash
# Agents learn patterns across all projects
# Security patterns from Project A apply to Project B
# Testing strategies improve over time
# Code review standards become more refined
```

## Advanced Integration Patterns

### IDE Feature Integration

#### Cursor Composer Advanced Usage

```bash
# Multi-agent coordination in single session
1. Add multiple agents to context
2. Assign specific roles to each agent
3. Coordinate responses for comprehensive coverage

Example:
Add @.cursor/agents/foundation/spec-architect.md
Add @.cursor/agents/quality/security-specialist.md
Add @.cursor/agents/implementation/spec-developer.md

Request: "Design and implement secure user authentication.
Architect: Focus on system design and technology selection
Security: Focus on threat modeling and security controls
Developer: Focus on implementation approach and code structure"
```

#### Terminal Command Generation

```bash
# Agents can suggest terminal commands
@.cursor/agents/quality/spec-tester.md what commands should I run to test this feature?

Response includes:
npm test -- --coverage
npm run test:e2e
npm run lint
npm run security:scan
```

### Continuous Integration Workflows

#### Pre-commit Quality Gates

```bash
# Use agents for pre-commit validation
@.cursor/agents/quality/spec-reviewer.md review changes before commit
@.cursor/agents/quality/security-specialist.md security check before commit
@.cursor/agents/quality/spec-tester.md validate test coverage before commit
```

#### Deployment Readiness Validation

```bash
# Comprehensive deployment validation
@.cursor/agents/quality/spec-validator.md
Context: All implementation files, test results, security reports
Request: "Complete deployment readiness assessment for production release"

Output:
- Go/no-go recommendation
- Quality gate status
- Risk assessment
- Monitoring requirements
- Rollback procedures
```

## Conclusion

This Cursor workflow guide provides a comprehensive foundation for AI-powered development using the 15-agent system. The key to success is:

1. **Start with Planning**: Use foundation agents for strategic thinking
2. **Systematic Implementation**: Follow agent handoff patterns
3. **Continuous Quality**: Integrate quality agents throughout development
4. **Leverage Memory**: Build on accumulated knowledge and patterns
5. **Iterate and Improve**: Use agent feedback to refine your approach

The agent system is designed to grow with you - the more you use it, the better it becomes at understanding your patterns and providing contextual assistance.

**Next Steps:**

- Start with simple agent interactions to build familiarity
- Progress to complex multi-agent workflows
- Develop your own workflow patterns based on project needs
- Contribute improvements and patterns back to the team

**Remember**: The agents are your AI development team. Treat them as collaborative partners, provide good context, and leverage their specialized expertise for professional-grade software development.

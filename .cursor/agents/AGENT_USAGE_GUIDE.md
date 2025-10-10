# Cursor Agent Usage Guide

## Complete Agent System Overview

This guide provides detailed examples and workflows for using all 15 specialized Cursor agents across Foundation, Implementation, and Quality teams. Each agent is optimized for Cursor's Chat and Composer features with @mention integration.

## Agent Catalog Summary

### Foundation Team (5 agents) - Planning & Architecture

| Agent                       | Primary Use                              | Cursor Invocation                                       |
| --------------------------- | ---------------------------------------- | ------------------------------------------------------- |
| **spec-analyst**            | Requirements analysis, user stories      | `@.cursor/agents/foundation/spec-analyst.md`            |
| **spec-architect**          | System design, technology selection      | `@.cursor/agents/foundation/spec-architect.md`          |
| **spec-planner**            | Task decomposition, sprint planning      | `@.cursor/agents/foundation/spec-planner.md`            |
| **requirements-specialist** | Requirements + planning combined         | `@.cursor/agents/foundation/requirements-specialist.md` |
| **project-manager**         | Workflow coordination, progress tracking | `@.cursor/agents/foundation/project-manager.md`         |

### Implementation Team (3 agents) - Development

| Agent                  | Primary Use                                 | Cursor Invocation                                      |
| ---------------------- | ------------------------------------------- | ------------------------------------------------------ |
| **frontend-developer** | UI/UX implementation, React/TypeScript      | `@.cursor/agents/implementation/frontend-developer.md` |
| **backend-developer**  | Server-side logic, API development          | `@.cursor/agents/implementation/backend-developer.md`  |
| **spec-developer**     | Full-stack integration, end-to-end features | `@.cursor/agents/implementation/spec-developer.md`     |

### Quality Team (7 agents) - Testing & Validation

| Agent                            | Primary Use                             | Cursor Invocation                                         |
| -------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| **spec-tester**                  | Testing strategies, test implementation | `@.cursor/agents/quality/spec-tester.md`                  |
| **spec-reviewer**                | Code review, quality gates              | `@.cursor/agents/quality/spec-reviewer.md`                |
| **spec-validator**               | Final validation, deployment readiness  | `@.cursor/agents/quality/spec-validator.md`               |
| **quality-assurance-specialist** | Comprehensive QA, requirements auditing | `@.cursor/agents/quality/quality-assurance-specialist.md` |
| **security-specialist**          | Security analysis, threat modeling      | `@.cursor/agents/quality/security-specialist.md`          |

## Cursor Integration Methods

### Method 1: Chat with @mentions (Quick Interactions)

**Best for:** Quick questions, debugging, clarifications, single-task assistance

**How to Use:**

1. Open Cursor Chat panel
2. Type `@` and start typing the agent file path
3. Select the agent file from autocomplete
4. State your request in natural language

**Examples:**

```
@.cursor/agents/foundation/spec-analyst.md analyze requirements for user authentication feature

@.cursor/agents/implementation/frontend-developer.md help me implement a responsive navigation component

@.cursor/agents/quality/spec-tester.md create unit tests for this authentication function

@.cursor/agents/quality/security-specialist.md review this API endpoint for security vulnerabilities
```

### Method 2: Composer with Context (Complex Workflows)

**Best for:** Multi-file changes, complex features, architectural work, comprehensive analysis

**How to Use:**

1. Open Composer (Cmd/Ctrl+Shift+I)
2. Add agent file to context using `@` mentions
3. Add relevant project files to context
4. Describe your needs in detail
5. Review and iterate on agent's recommendations

**Example Workflow:**

```
1. Open Composer
2. Add @.cursor/agents/foundation/spec-analyst.md
3. Add relevant requirement files to context
4. Request: "Analyze requirements for e-commerce checkout flow"
5. Review requirements analysis
6. Add @.cursor/agents/foundation/spec-architect.md
7. Request: "Design system architecture based on these requirements"
8. Continue with implementation agents...
```

### Method 3: Sequential Agent Workflows (End-to-End Development)

**Best for:** Complete feature development, systematic project progression, quality assurance

**Planning Phase:**

```
1. @.cursor/agents/foundation/spec-analyst.md (requirements analysis)
2. @.cursor/agents/foundation/spec-architect.md (system design)
3. @.cursor/agents/foundation/spec-planner.md (task breakdown)
```

**Implementation Phase:**

```
1. @.cursor/agents/implementation/spec-developer.md (full-stack development)
   OR
   @.cursor/agents/implementation/frontend-developer.md (UI components)
   + @.cursor/agents/implementation/backend-developer.md (API development)
```

**Quality Phase:**

```
1. @.cursor/agents/quality/spec-tester.md (comprehensive testing)
2. @.cursor/agents/quality/spec-reviewer.md (code review)
3. @.cursor/agents/quality/security-specialist.md (security validation)
4. @.cursor/agents/quality/spec-validator.md (final deployment validation)
```

## Detailed Usage Examples

### Example 1: New Feature Development (E-commerce Product Search)

#### Phase 1: Planning (Composer Workflow)

```
1. Open Composer
2. Add @.cursor/agents/foundation/spec-analyst.md
3. Request: "Analyze requirements for product search feature with filters, sorting, and pagination"

Expected Output:
- User stories and acceptance criteria
- Functional and non-functional requirements
- Edge cases and error scenarios
- Integration requirements with existing systems
```

```
4. Add @.cursor/agents/foundation/spec-architect.md
5. Request: "Design system architecture for the product search feature"

Expected Output:
- Database schema for search indexing
- API endpoint design
- Frontend component architecture
- Caching strategy and performance considerations
- Technology recommendations (Elasticsearch, etc.)
```

```
6. Add @.cursor/agents/foundation/spec-planner.md
7. Request: "Break down the product search implementation into tasks"

Expected Output:
- Task breakdown with time estimates
- Dependency mapping
- Sprint planning recommendations
- Risk assessment and mitigation strategies
```

#### Phase 2: Implementation (Parallel Development)

**Backend Development:**

```
1. Open new Composer session
2. Add @.cursor/agents/implementation/backend-developer.md
3. Add architecture documents from Phase 1
4. Request: "Implement search API endpoints with filtering and pagination"

Expected Output:
- RESTful API endpoints
- Database queries with optimization
- Input validation and error handling
- API documentation
```

**Frontend Development:**

```
1. Open new Composer session
2. Add @.cursor/agents/implementation/frontend-developer.md
3. Add design specifications
4. Request: "Implement search UI with filters, results, and pagination"

Expected Output:
- React components with TypeScript
- State management for search
- Responsive design implementation
- Accessibility compliance
```

#### Phase 3: Quality Assurance (Sequential Validation)

**Testing:**

```
1. Add @.cursor/agents/quality/spec-tester.md
2. Add implemented code files
3. Request: "Create comprehensive test suite for product search feature"

Expected Output:
- Unit tests for search logic
- Integration tests for API endpoints
- E2E tests for user workflows
- Performance tests for search speed
```

**Code Review:**

```
1. Add @.cursor/agents/quality/spec-reviewer.md
2. Add all implementation files
3. Request: "Comprehensive code review focusing on performance and maintainability"

Expected Output:
- Code quality assessment
- Performance optimization recommendations
- Security vulnerability analysis
- Best practice compliance review
```

**Security Analysis:**

```
1. Add @.cursor/agents/quality/security-specialist.md
2. Add API and database code
3. Request: "Security review of search functionality"

Expected Output:
- Threat model for search feature
- Vulnerability assessment
- Security control recommendations
- Compliance validation
```

**Final Validation:**

```
1. Add @.cursor/agents/quality/spec-validator.md
2. Add all test results and reviews
3. Request: "Final deployment readiness assessment"

Expected Output:
- Go/no-go deployment recommendation
- Quality gate status report
- Risk assessment and mitigation
- Stakeholder sign-off checklist
```

### Example 2: Bug Fix Workflow (Authentication Issue)

#### Quick Chat-Based Debugging

```
@.cursor/agents/implementation/spec-developer.md analyze this authentication error: "JWT token validation failing intermittently"

Expected Response:
- Systematic debugging approach (Level 1-3)
- Common causes of JWT validation issues
- Specific code areas to investigate
- Immediate troubleshooting steps
```

#### If Issue Requires Deeper Analysis

```
1. Open Composer
2. Add @.cursor/agents/quality/security-specialist.md
3. Add authentication code files
4. Request: "Comprehensive security analysis of JWT implementation"

Expected Output:
- Security vulnerability assessment
- JWT best practices compliance
- Token lifecycle analysis
- Recommendations for secure implementation
```

### Example 3: Performance Optimization (Database Queries)

#### Initial Analysis

```
@.cursor/agents/quality/spec-reviewer.md analyze performance of these database queries - response times are too slow

Expected Response:
- Query performance analysis
- Indexing recommendations
- N+1 query identification
- Optimization strategies
```

#### Implementation

```
1. Add @.cursor/agents/implementation/backend-developer.md
2. Add database schema and query files
3. Request: "Optimize these queries based on performance analysis"

Expected Output:
- Optimized query implementations
- Database index recommendations
- Caching strategy implementation
- Performance monitoring setup
```

#### Validation

```
1. Add @.cursor/agents/quality/spec-tester.md
2. Request: "Create performance tests to validate optimization"

Expected Output:
- Performance test suite
- Benchmark comparisons
- Load testing scenarios
- Performance regression prevention
```

## Advanced Workflow Patterns

### Pattern 1: Requirements Audit with QA Specialist

**Use Case:** Comprehensive requirements compliance validation

```
1. Add @.cursor/agents/quality/quality-assurance-specialist.md
2. Add all project documentation
3. Request: "Requirements audit mode - comprehensive compliance assessment"

Expected Output:
- Three-tier validation report (Requirements/Implementation/User Journey)
- Compliance scoring with percentages
- Gap analysis with prioritized remediation
- Traceability matrix between requirements and implementation
```

### Pattern 2: Architecture Review with Multiple Agents

**Use Case:** Comprehensive system architecture validation

```
1. Add @.cursor/agents/foundation/spec-architect.md
2. Request: "Review current system architecture for scalability"

3. Add @.cursor/agents/quality/security-specialist.md
4. Request: "Security architecture review of the same system"

5. Add @.cursor/agents/quality/spec-reviewer.md
6. Request: "Code architecture review for maintainability"

Expected Output:
- Multi-perspective architecture analysis
- Scalability recommendations
- Security architecture validation
- Code organization improvements
```

### Pattern 3: Full-Stack Feature with Quality Gates

**Use Case:** End-to-end feature development with integrated quality assurance

```
Phase 1: Planning
- @.cursor/agents/foundation/spec-analyst.md → Requirements
- @.cursor/agents/foundation/spec-architect.md → Design

Phase 2: Implementation
- @.cursor/agents/implementation/spec-developer.md → Full-stack development

Phase 3: Quality (Parallel)
- @.cursor/agents/quality/spec-tester.md → Test suite creation
- @.cursor/agents/quality/spec-reviewer.md → Code review
- @.cursor/agents/quality/security-specialist.md → Security analysis

Phase 4: Validation
- @.cursor/agents/quality/spec-validator.md → Final deployment validation
```

## Agent Coordination Best Practices

### 1. Context Preservation

- Keep relevant agents in Composer context for follow-up questions
- Reference previous agent outputs when moving to next phase
- Maintain conversation continuity across agent handoffs

### 2. Efficient Handoffs

- Each agent suggests appropriate next agents
- Follow recommended sequential workflows
- Use parallel agents for independent analysis

### 3. Memory Integration

- Agents automatically save patterns and solutions
- Cross-session learning improves recommendations
- Project-specific context accumulates over time

### 4. Quality Gates

- Use quality agents as mandatory checkpoints
- Don't skip security analysis for production code
- Always validate before deployment

## Troubleshooting Common Issues

### Issue: Agent Not Providing Expected Depth

**Solution:** Use Composer instead of Chat for complex requests, add more context files

### Issue: Conflicting Recommendations Between Agents

**Solution:** Use @.cursor/agents/quality/quality-assurance-specialist.md to reconcile differences

### Issue: Need Broader Perspective

**Solution:** Use sequential agent workflow with multiple specialists

### Issue: Lost Context Between Sessions

**Solution:** Agents automatically save to memory system - reference previous work in new sessions

## Performance Tips

### For Best Results:

1. **Start Broad**: Use foundation agents for planning before diving into implementation
2. **Add Context**: Include relevant files when using Composer
3. **Follow Sequences**: Respect recommended agent handoff patterns
4. **Use Memory**: Reference previous sessions and accumulated knowledge
5. **Validate Early**: Engage quality agents throughout development, not just at the end

### Cursor-Specific Optimizations:

- **Composer**: Best for multi-file changes and complex workflows
- **Chat**: Ideal for quick questions and debugging
- **Terminal Integration**: Use Ctrl/Cmd+K for command generation
- **File Context**: Add relevant files to agent context for better recommendations

## Integration with Cursor Features

### With Cursor Composer:

- Agents work seamlessly with multi-file editing
- Context awareness across entire codebase
- Iterative refinement of complex changes

### With Cursor Chat:

- Quick agent consultation during development
- Real-time debugging assistance
- Immediate clarification and guidance

### With Cursor Terminal:

- Agents can recommend terminal commands
- Integration with development workflows
- Automated task execution suggestions

---

## Additional Resources

- **Complete Workflow Guide**: [../../docs/cursor/CURSOR_WORKFLOW_GUIDE.md](../../docs/cursor/CURSOR_WORKFLOW_GUIDE.md) - Advanced workflows, troubleshooting, and best practices
- **Agent Catalog**: [README.md](README.md) - Quick reference for all 15 agents
- **Main Documentation**: [../../README.md](../../README.md#cursor-ide-integration) - Full workspace overview
- **Governance Rules**: [../../.cursorrules](../../.cursorrules) - Complete development protocols and laws

This comprehensive agent system provides professional-grade development assistance across all phases of software development, from initial planning through production deployment, all optimized for Cursor's powerful AI-assisted development environment.

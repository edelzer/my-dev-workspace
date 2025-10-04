# AI-Optimized Task Decomposition Protocol

## AI Implementation Directives

> **FOR CLAUDE CODE**: This protocol provides mandatory task breakdown instructions for managing complex development work across multiple AI sessions. Every complex request MUST be decomposed using these systematic directives.

### Critical AI Task Management Behavior Requirements
1. **NEVER** attempt to handle complex multi-component tasks in a single session
2. **ALWAYS** break work into 15-30 minute micro-sessions with tangible outcomes
3. **MUST** validate each task completion before proceeding to the next
4. **REQUIRED** to use TodoWrite tool for tracking all decomposed tasks
5. **MANDATORY** to preserve context between sessions with clear handoff documentation

## AI Quick Reference Task Decomposition Framework

### Mandatory Decomposition Sequence
```
1. ANALYZE     → Assess complexity and identify decomposition boundaries
2. DECOMPOSE   → Break into 15-30 minute micro-tasks with clear outcomes
3. SEQUENCE    → Order tasks by dependencies and logical progression
4. TRACK       → Use TodoWrite to manage task status and progress
5. VALIDATE    → Confirm each task completion before advancing
```

### Task Complexity Decision Tree (MANDATORY)
```
Complex Request Received
├── Single component/file? → NO: Decompose by component
├── Single technology layer? → NO: Decompose by layer (DB/API/UI)
├── Single user story? → NO: Decompose by story/feature
├── <30 min implementation? → NO: Decompose by sub-tasks
└── Clear success criteria? → NO: Decompose by deliverable type
```

### AI Task Management Validation Checkpoints
- **Before Decomposition**: Complex request identified, scope boundaries clear
- **During Breakdown**: Each micro-task has clear deliverable and success criteria
- **After Sequencing**: Dependencies mapped, logical progression established
- **Before Execution**: TodoWrite tracking active, context handoff prepared

---

## PHASE 1: COMPLEXITY ANALYSIS (Mandatory First Step)

### AI Directive: Assess Task Complexity Before Any Work

**MANDATORY**: You must evaluate these complexity indicators and create decomposition plan

### Complexity Analysis Process
```yaml
# AI Execution Steps for COMPLEXITY ANALYSIS:
step_1: "Identify all distinct technical components involved"
step_2: "Count files/directories that will be created or modified"
step_3: "Map dependencies between different parts of the request"
step_4: "Estimate implementation time for each component"
step_5: "Determine if single session can handle full scope"
step_6: "STOP - Create decomposition plan if complexity threshold exceeded"
```

### Complexity Threshold Detection (MANDATORY RECOGNITION)
```yaml
# Automatic Decomposition Triggers:
complexity_indicators:
  scope_complexity:
    - multiple_features: "Request spans >1 distinct feature"
    - multiple_layers: "Involves DB + API + UI changes"
    - multiple_files: ">3 files need creation/modification"
    - multiple_technologies: "Different tech stacks in single request"
  
  context_complexity:
    - code_context_size: ">500 lines of existing code needed"
    - external_dependencies: ">2 external APIs or services"
    - business_logic_complexity: "Multiple business rules or edge cases"
    - system_architecture: "Requires full system understanding"
  
  output_complexity:
    - code_generation: ">200 lines of new code expected"
    - file_creation: ">2 new files to create"
    - deliverable_types: "Multiple types: code + tests + docs"
    - validation_steps: ">3 validation requirements"
```

### Complexity Assessment Template (MANDATORY FORMAT)
```markdown
# Task Complexity Analysis: [Request Description]

## Complexity Indicators
- **Components Involved**: [List all distinct parts]
- **Files Affected**: [Count of files to create/modify]
- **Technology Layers**: [DB/API/UI/Other]
- **Dependencies**: [Internal and external dependencies]
- **Estimated Time**: [Total implementation time]

## Decomposition Decision
- **Single Session Feasible**: [YES/NO]
- **Decomposition Required**: [YES/NO]
- **Recommended Breakdown**: [Number of micro-tasks]
- **Sequencing Strategy**: [Dependency order]
```

---

## PHASE 2: TASK DECOMPOSITION (Systematic Breakdown)

### AI Directive: Create Actionable Micro-Tasks from Complex Requests

**MANDATORY**: Every decomposed task must have clear deliverable and 15-30 minute time boundary

### Task Decomposition Process
```yaml
# AI Execution Steps for TASK DECOMPOSITION:
step_1: "Apply appropriate decomposition pattern based on complexity type"
step_2: "Create micro-tasks with single, testable deliverable each"
step_3: "Ensure each task can be completed in 15-30 minutes"
step_4: "Define clear success criteria for each micro-task"
step_5: "Map dependencies between tasks for proper sequencing"
step_6: "Create TodoWrite tracking list for all decomposed tasks"
```

### Decomposition Patterns (MANDATORY APPLICATION)

#### Pattern 1: Technology Layer Decomposition
```typescript
// Complex Request: "Build user authentication system"
// Decomposition Strategy: Separate by technology layer

const authSystemTasks = [
  {
    id: "auth-001",
    task: "Create user data model and database schema",
    deliverable: "User table with email, password fields + migration",
    timeEstimate: "20 minutes",
    dependencies: []
  },
  {
    id: "auth-002", 
    task: "Implement user registration API endpoint",
    deliverable: "POST /api/register with validation",
    timeEstimate: "25 minutes",
    dependencies: ["auth-001"]
  },
  {
    id: "auth-003",
    task: "Add JWT token generation service",
    deliverable: "Token service with sign/verify functions",
    timeEstimate: "20 minutes",
    dependencies: ["auth-002"]
  }
];
```

#### Pattern 2: Feature Slice Decomposition
```typescript
// Complex Request: "Add commenting system with voting"
// Decomposition Strategy: Separate by feature completeness

const commentSystemTasks = [
  {
    id: "comment-001",
    task: "Create basic comment data model",
    deliverable: "Comment schema with text, author, timestamp",
    timeEstimate: "15 minutes",
    dependencies: []
  },
  {
    id: "comment-002",
    task: "Build comment CRUD API endpoints", 
    deliverable: "GET/POST/PUT/DELETE /api/comments",
    timeEstimate: "30 minutes",
    dependencies: ["comment-001"]
  },
  {
    id: "comment-003",
    task: "Add voting functionality to comments",
    deliverable: "Vote schema + upvote/downvote endpoints",
    timeEstimate: "25 minutes", 
    dependencies: ["comment-002"]
  }
];
```

#### Pattern 3: Component-Based Decomposition
```typescript
// Complex Request: "Create user dashboard with metrics"
// Decomposition Strategy: Separate by UI components

const dashboardTasks = [
  {
    id: "dash-001",
    task: "Create dashboard layout component",
    deliverable: "DashboardLayout.tsx with header, sidebar, main",
    timeEstimate: "20 minutes",
    dependencies: []
  },
  {
    id: "dash-002",
    task: "Build user profile card component",
    deliverable: "UserProfileCard.tsx with avatar, name, stats",
    timeEstimate: "25 minutes",
    dependencies: ["dash-001"]
  },
  {
    id: "dash-003",
    task: "Implement metrics chart component",
    deliverable: "MetricsChart.tsx with data visualization",
    timeEstimate: "30 minutes",
    dependencies: ["dash-001"]
  }
];
```

### Micro-Task Template (MANDATORY STRUCTURE)
```typescript
interface MicroTask {
  id: string;                    // Unique task identifier
  task: string;                  // Clear, actionable description
  deliverable: string;           // Specific output expected
  timeEstimate: string;          // 15-30 minute range
  dependencies: string[];        // Prerequisite task IDs
  successCriteria: string[];     // Validation requirements
  context: {
    files: string[];             // Files to be created/modified
    technologies: string[];      // Tech stack components
    businessRules: string[];     // Relevant constraints
  };
}
```

---

## PHASE 3: TASK SEQUENCING (Dependency Management)

### AI Directive: Order Tasks by Dependencies and Logical Progression

**MANDATORY**: Sequence tasks to minimize context switching and maximize success rate

### Task Sequencing Process
```yaml
# AI Execution Steps for TASK SEQUENCING:
step_1: "Map all task dependencies and prerequisites"
step_2: "Identify parallel work streams that can run concurrently"
step_3: "Order tasks to minimize context switching between technologies"
step_4: "Ensure foundational tasks complete before dependent tasks"
step_5: "Create dependency graph for visual task progression"
step_6: "Validate sequencing logic before execution begins"
```

### Sequencing Strategies (MANDATORY APPLICATION)

#### Strategy 1: Foundation-First Sequencing
```yaml
# Prioritize foundational components that other tasks depend on
sequencing_priority:
  tier_1_foundation:
    - "Data models and database schemas"
    - "Core utility functions and services"
    - "Base component structures"
    - "Configuration and environment setup"
  
  tier_2_core_features:
    - "API endpoints using foundation data models"
    - "UI components using base structures"
    - "Business logic using core utilities"
    - "Authentication using user models"
  
  tier_3_enhancements:
    - "Advanced features requiring core functionality"
    - "Integration between components"
    - "Performance optimizations"
    - "Testing and validation"
```

#### Strategy 2: Layer-Consistent Sequencing
```yaml
# Complete entire technology layer before moving to next
layer_sequencing:
  database_layer:
    - "Create all data models"
    - "Set up all database migrations"
    - "Create database connection utilities"
  
  api_layer:
    - "Implement all API endpoints"
    - "Add API middleware and validation"
    - "Create API documentation"
  
  ui_layer:
    - "Build all UI components"
    - "Implement component interactions"
    - "Add styling and responsive design"
```

### Dependency Mapping Template (MANDATORY FORMAT)
```markdown
# Task Dependency Map: [Feature Name]

## Critical Path Tasks (Must Complete First)
1. **[Task ID]**: [Task Description]
   - **Blocks**: [List of dependent task IDs]
   - **Required By**: [Tasks that cannot start until this completes]

## Parallel Work Streams
### Stream A: [Technology/Component Name]
- **[Task ID]**: [Independent task description]
- **[Task ID]**: [Another independent task]

### Stream B: [Technology/Component Name]  
- **[Task ID]**: [Independent task description]
- **[Task ID]**: [Another independent task]

## Integration Points
- **After Tasks [ID1, ID2]**: Integration validation required
- **Before Task [ID3]**: All foundational tasks must be complete
```

---

## PHASE 4: TASK EXECUTION (Systematic Implementation)

### AI Directive: Execute Micro-Tasks with TodoWrite Tracking

**MANDATORY**: Use TodoWrite for all task status management and progress tracking

### Task Execution Process
```yaml
# AI Execution Steps for TASK EXECUTION:
step_1: "Load current micro-task from TodoWrite list"
step_2: "Mark task as 'in_progress' before beginning work"
step_3: "Implement task deliverable with clear success criteria"
step_4: "Validate deliverable meets all specified requirements"
step_5: "Mark task as 'completed' in TodoWrite"
step_6: "Document context handoff for next task"
step_7: "Move to next task in sequence"
```

### TodoWrite Integration Pattern (MANDATORY USAGE)
```javascript
// Example TodoWrite integration for task decomposition

// Initial task decomposition
TodoWrite([
  {
    id: "auth-001",
    content: "Create user data model and database schema",
    status: "pending"
  },
  {
    id: "auth-002", 
    content: "Implement user registration API endpoint",
    status: "pending"
  },
  {
    id: "auth-003",
    content: "Add JWT token generation service", 
    status: "pending"
  }
]);

// Before starting each task
TodoWrite([
  {
    id: "auth-001",
    content: "Create user data model and database schema",
    status: "in_progress"  // Mark current task as in progress
  },
  // ... other tasks remain pending
]);

// After completing each task
TodoWrite([
  {
    id: "auth-001", 
    content: "Create user data model and database schema",
    status: "completed"  // Mark completed when done
  },
  {
    id: "auth-002",
    content: "Implement user registration API endpoint", 
    status: "in_progress"  // Move to next task
  },
  // ... remaining tasks
]);
```

### Task Execution Template (MANDATORY STRUCTURE)
```markdown
# Executing Micro-Task: [Task ID] - [Task Description]

## Task Context
- **Deliverable**: [Specific output expected]
- **Time Estimate**: [15-30 minute target]
- **Dependencies**: [Prerequisites completed]
- **Files Involved**: [Files to create/modify]

## Implementation Approach
1. **Setup**: [Preparation steps]
2. **Core Implementation**: [Main development work]
3. **Validation**: [Testing and verification]
4. **Documentation**: [Comments and handoff notes]

## Success Validation
- [ ] [Specific success criterion 1]
- [ ] [Specific success criterion 2] 
- [ ] [Specific success criterion 3]
- [ ] TodoWrite status updated to 'completed'

## Context Handoff
- **Completed**: [What was accomplished]
- **Next Task Context**: [Key information for next task]
- **Blockers**: [Any issues discovered]
```

---

## PHASE 5: VALIDATION AND INTEGRATION (Quality Assurance)

### AI Directive: Validate Each Task Before Progression

**MANDATORY**: Complete validation of each micro-task before marking as complete

### Task Validation Process
```yaml
# AI Execution Steps for TASK VALIDATION:
step_1: "Verify deliverable meets all specified success criteria"
step_2: "Test implementation works as expected"
step_3: "Check integration with existing codebase"
step_4: "Validate no regressions introduced"
step_5: "Confirm documentation and comments are clear"
step_6: "Update TodoWrite status to 'completed'"
```

### Validation Checkpoints (MANDATORY VERIFICATION)

#### Level 1: Deliverable Validation
```yaml
deliverable_validation:
  functionality:
    - "Code compiles/runs without errors"
    - "Implements exactly what was specified"
    - "Meets all success criteria defined"
    - "Handles expected inputs correctly"
  
  quality:
    - "Follows established code patterns"
    - "Includes appropriate error handling"
    - "Contains clear comments and documentation"
    - "Uses consistent naming conventions"
```

#### Level 2: Integration Validation
```yaml
integration_validation:
  compatibility:
    - "Integrates cleanly with existing codebase"
    - "Doesn't break existing functionality"
    - "Dependencies resolved correctly"
    - "No conflicts with other components"
  
  readiness:
    - "Ready for next task in sequence"
    - "Context clearly documented for handoff"
    - "All temporary/debug code removed"
    - "Meets performance requirements"
```

### Validation Templates

#### Micro-Task Validation Checklist
```markdown
# Task Validation: [Task ID] - [Task Description]

## Deliverable Verification
- [ ] **Functionality**: Code works as specified
- [ ] **Quality**: Follows project standards
- [ ] **Completeness**: All requirements satisfied
- [ ] **Documentation**: Clear comments and handoff notes

## Integration Verification  
- [ ] **Compatibility**: No conflicts with existing code
- [ ] **Dependencies**: All prerequisites satisfied
- [ ] **Performance**: Meets speed/memory requirements
- [ ] **Security**: No vulnerabilities introduced

## Progression Readiness
- [ ] **TodoWrite Updated**: Status marked as 'completed'
- [ ] **Context Documented**: Handoff information prepared
- [ ] **Next Task Ready**: Dependencies satisfied for next task
- [ ] **No Blockers**: All issues resolved or documented
```

---

## AI Tool Integration for Task Management

### Claude Code Task Management Commands

#### For COMPLEXITY ANALYSIS:
```bash
# Analyze complex request and determine decomposition needs
Read [project-context-files]  # Load current project state
Grep "related-pattern" **/*.js  # Find existing similar implementations
TodoWrite [{"content": "Analyze task complexity", "status": "in_progress"}]

# Document analysis results
Write task-analysis.md "[Complexity assessment and decomposition plan]"
```

#### For TASK DECOMPOSITION:
```bash
# Create systematic task breakdown
Write task-breakdown.md "[Detailed micro-task list with dependencies]"

# Initialize TodoWrite tracking
TodoWrite [
  {"content": "[Micro-task 1 description]", "status": "pending", "id": "task-001"},
  {"content": "[Micro-task 2 description]", "status": "pending", "id": "task-002"}
  // ... all decomposed tasks
]
```

#### For TASK EXECUTION:
```bash
# Execute individual micro-tasks
TodoWrite [{"id": "task-001", "status": "in_progress"}]  # Mark current task
Edit/Write [deliverable-files]  # Implement task deliverable
Bash "npm test -- --grep 'related-test'"  # Validate implementation
TodoWrite [{"id": "task-001", "status": "completed"}]  # Mark complete

# Progress to next task
TodoWrite [{"id": "task-002", "status": "in_progress"}]
```

### AI Task Decision Framework
```yaml
# Task Management Decision Tree for AI Tools:
task_decisions:
  complexity_assessment:
    question: "Can this be completed in single session?"
    simple_task: "Execute directly without decomposition"
    moderate_task: "Break into 2-3 micro-tasks"
    complex_task: "Apply systematic decomposition protocol"
  
  decomposition_strategy:
    question: "What's the primary complexity source?"
    technology_layers: "Use layer-based decomposition"
    feature_scope: "Use feature-slice decomposition" 
    component_count: "Use component-based decomposition"
    business_logic: "Use workflow-based decomposition"
  
  execution_approach:
    question: "What's the optimal task sequence?"
    dependencies_first: "Foundation-first sequencing"
    layer_completion: "Layer-consistent sequencing"
    parallel_streams: "Concurrent work stream execution"
```

---

## Task Completion Criteria

### Mandatory Task Completion Definition
A micro-task is considered COMPLETE when:
- ☑ **Deliverable Created**: Specific output exists and functions correctly
- ☑ **Success Criteria Met**: All validation checkpoints satisfied
- ☑ **Integration Verified**: Works with existing codebase without issues
- ☑ **TodoWrite Updated**: Status marked as 'completed'
- ☑ **Context Documented**: Handoff information prepared for next task
- ☑ **No Regressions**: Existing functionality preserved

### Feature Completion Definition
A decomposed feature is considered COMPLETE when:
- ☑ **All Micro-Tasks Done**: Every TodoWrite task marked 'completed'
- ☑ **Integration Complete**: All components work together
- ☑ **Quality Validated**: Code quality and security standards met
- ☑ **Documentation Current**: Implementation and architecture documented
- ☑ **Ready for Deployment**: Feature ready for production use

---

## Context Recovery and Session Continuation

### AI Context Recovery Protocol
```yaml
# When resuming work after session break:
context_recovery:
  step_1: "Load TodoWrite list to see current progress"
  step_2: "Read task-analysis.md for feature context"
  step_3: "Check last completed task for current state"
  step_4: "Review context handoff from previous session"
  step_5: "Identify next task in sequence"
  step_6: "Validate all dependencies satisfied"
```

### Session Context Template
```markdown
# Session Context: [Feature Name] - [Current Date]

## Current Progress
- **Total Tasks**: [X] 
- **Completed**: [Y] tasks
- **In Progress**: [Current task ID and description]
- **Remaining**: [Z] tasks

## Last Session Summary
- **Completed Task**: [Task ID] - [Brief description]
- **Key Decisions**: [Important choices made]
- **Context for Next**: [Essential information for continuation]
- **Blockers**: [Any issues that need resolution]

## Next Task Context
- **Task ID**: [Next task identifier]
- **Deliverable**: [Specific output expected]
- **Dependencies**: [Prerequisites that must be satisfied]
- **Estimated Time**: [15-30 minute target]
```

## Memory Integration (Law #6)

**Memory Checkpoints for Task Decomposition Protocol:**

**Session Start:**
- View `/memories/session-context/phase-status.xml` for current task state and TodoWrite status
- Review `/memories/development-patterns/task-templates.xml` for proven decomposition patterns
- Check `/memories/protocol-compliance/efficiency-metrics.xml` for estimation accuracy history

**During ANALYZE Phase:**
- Record complexity analysis patterns in `/memories/development-patterns/task-templates.xml`
- Log dependency mapping approaches that worked well
- Document complexity indicators for future reference

**During DECOMPOSE Phase:**
- Record successful decomposition templates for reuse
- Log task breakdown patterns by feature type
- Document micro-task sizing lessons learned (15-30 min validation)

**During SEQUENCE Phase:**
- Record dependency resolution strategies
- Log parallel execution opportunities identified
- Document critical path determination approaches

**During EXECUTE Phase:**
- Update `/memories/session-context/phase-status.xml` with TodoWrite progress
- Record task completion times vs. estimates for accuracy improvement
- Document context handoff patterns between tasks

**During VALIDATE Phase:**
- Log validation checkpoint effectiveness
- Record integration validation patterns
- Document progression readiness criteria

**Session End:**
- Update `/memories/session-context/phase-status.xml` with current task progress
- Archive completed decomposition templates to pattern library
- Record estimation accuracy metrics for continuous improvement

**Memory Files:**
- Primary: `/memories/development-patterns/task-templates.xml`
- Session Tracking: `/memories/session-context/phase-status.xml`
- Efficiency Metrics: `/memories/protocol-compliance/efficiency-metrics.xml`

**Example Task Template Memory:**
```xml
<task-template>
  <timestamp>2025-10-03T16:00:00Z</timestamp>
  <template-name>API Endpoint Implementation</template-name>
  <decomposition-pattern>Layer-based (DB → Service → API → Tests)</decomposition-pattern>
  <micro-tasks>
    - Task 1: Database schema and migration (20 min)
    - Task 2: Service layer business logic (25 min)
    - Task 3: API endpoint with validation (30 min)
    - Task 4: Integration tests (25 min)
  </micro-tasks>
  <dependencies>Sequential: DB → Service → API → Tests</dependencies>
  <estimation-accuracy>95% (actual vs. estimated times)</estimation-accuracy>
  <reusability>Applicable to all RESTful API development</reusability>
</task-template>
```

**Cross-Reference**: See [Memory System Protocol](./memory_system_protocol.md) for complete memory usage guide.

---

This protocol ensures systematic, AI-driven task management with clear decomposition strategies, dependency tracking, and comprehensive validation at every micro-task level.
# Memory System Protocol

**Version**: 1.0
**Status**: Active
**Integration**: Absolute Law #6 - Cross-Session Memory & Continuous Learning

---

## 1. Overview & Purpose

### What It Does
The Memory System enables Claude Code to maintain context, decisions, and knowledge across sessions through a persistent file-based memory directory. Every session builds on previous work, creating a continuously learning development environment.

### Why It's Critical
- **No Lost Context**: Session interruptions don't lose progress
- **Perfect Recovery**: Resume exactly where you left off
- **Continuous Learning**: Debugging solutions and patterns accumulate over time
- **Agent Coordination**: Seamless multi-session agent workflows
- **Client Continuity**: Preferences and decisions preserved indefinitely

### Integration with Absolute Laws
- **Law #1** (Uncertainty): Track uncertainties and prevent recurring confusion
- **Law #2** (Protocol): Never lose protocol progress across sessions
- **Law #3** (Orchestration): Enable perfect agent context handoffs
- **Law #4** (Efficiency): Build library of minimalist solutions
- **Law #5** (Leadership**: Maintain client relationship context
- **Law #6** (Memory): Foundation for all cross-session work

---

## 2. Memory Directory Architecture

```
/memories/
├── session-context/           # Current session state
│   ├── active-project.xml     # Current project focus
│   ├── phase-status.xml       # Current protocol phase
│   └── pending-decisions.xml  # Awaiting client approval
│
├── protocol-compliance/       # Law #1-5 enforcement tracking
│   ├── uncertainty-log.xml    # Law #1A violations/clarifications
│   ├── spec-adherence.xml     # Law #1B drift prevention
│   ├── protocol-status.xml    # Law #2 compliance
│   └── efficiency-metrics.xml # Law #4 minimalism tracking
│
├── project-knowledge/         # Per-project learning
│   └── {project-name}/
│       ├── architecture.xml   # Design decisions
│       ├── tech-debt.xml      # Debt log and authorization
│       ├── security-audit.xml # Security findings
│       └── lessons.xml        # Project-specific learnings
│
├── agent-coordination/        # Multi-agent orchestration
│   ├── handoff-log.xml        # Agent transitions
│   ├── context-packages.xml   # Shared context for agents
│   └── quality-gates.xml      # Validation checkpoints
│
├── development-patterns/      # Reusable knowledge
│   ├── debugging-solutions.xml # Level 1-7 successful resolutions
│   ├── security-patterns.xml   # Security implementations
│   ├── test-strategies.xml     # TDD patterns that worked
│   └── task-templates.xml      # Proven task decompositions
│
└── client-context/            # Senior developer reporting
    ├── preferences.xml         # Client preferences and decisions
    ├── communication-log.xml   # Important client interactions
    └── approval-history.xml    # Decision audit trail
```

### Directory Purposes

**session-context/**: Immediate session recovery
- Contains current project state, protocol phase, pending decisions
- Updated at session start and end
- Enables perfect recovery from interruptions

**protocol-compliance/**: Law enforcement tracking
- Records all Law #1-5 compliance issues and resolutions
- Tracks specification drift prevention
- Documents efficiency analysis and protocol status

**project-knowledge/**: Project-specific wisdom
- One subdirectory per project
- Architecture decisions, technical debt, security findings
- Lessons learned for future similar projects

**agent-coordination/**: Multi-agent workflows
- Agent handoff logs with context packages
- Quality gate tracking across sessions
- Workflow efficiency metrics

**development-patterns/**: Workspace-wide knowledge
- Debugging solutions accumulate across ALL projects
- Security patterns library grows over time
- Test strategies become more refined
- Task decomposition templates proven effective

**client-context/**: Relationship preservation
- Client preferences (never re-ask for known information)
- Communication history for perfect context
- Approval history prevents redundant requests

---

## 3. Session Protocols

### Session Start Protocol (ALWAYS FIRST ACTION)

**MANDATORY ORDER:**
```
1. View /memories/session-context/active-project.xml
2. Read /memories/protocol-compliance/ files
3. Review /memories/client-context/preferences.xml
4. Load /memories/project-knowledge/{current-project}/
5. Sync TodoWrite with memory records
```

**NEVER** start work without checking memory first.

### During Work Protocol

**Record decisions and patterns as you work:**

| Action | Memory File | When |
|--------|-------------|------|
| Encounter uncertainty | protocol-compliance/uncertainty-log.xml | Immediately upon Law #1A trigger |
| Detect spec drift | protocol-compliance/spec-adherence.xml | Before implementing workaround |
| Complete protocol phase | protocol-compliance/protocol-status.xml | End of each phase |
| Agent handoff | agent-coordination/handoff-log.xml | Before delegating to agent |
| Solve debugging issue | development-patterns/debugging-solutions.xml | After successful resolution |
| Implement security pattern | development-patterns/security-patterns.xml | After security implementation |
| Client decision | client-context/approval-history.xml | After client approval |

### Session End Protocol

**Before session completion or interruption:**
```
1. Update session-context/phase-status.xml with current state
2. Record pending-decisions.xml if awaiting client input
3. Save TodoWrite status to session context
4. Document active agent handoffs
5. Archive completed project work to project-knowledge/
```

---

## 4. Memory Update Triggers

### Law #1A: Uncertainty Protocol
**WHEN**: Encountering any uncertainty (next step, requirements, approach, outcome, safety)
**ACTION**: Create entry in `/memories/protocol-compliance/uncertainty-log.xml`
**FORMAT**:
```xml
<uncertainty>
  <timestamp>2025-10-03T14:30:00Z</timestamp>
  <issue>Unclear token expiry requirement for JWT authentication</issue>
  <context>Implementing authentication middleware, no specification for expiry time</context>
  <clarification-requested>What is the required JWT token expiry time?</clarification-requested>
  <resolution>Client specified: 15 minutes (900 seconds)</resolution>
  <resolved-at>2025-10-03T15:00:00Z</resolved-at>
</uncertainty>
```

### Law #1B: Specification Adherence
**WHEN**: Detecting potential specification drift or temptation to compromise
**ACTION**: Log in `/memories/protocol-compliance/spec-adherence.xml`
**FORMAT**:
```xml
<drift-prevention>
  <timestamp>2025-10-03T16:00:00Z</timestamp>
  <spec-requirement>API must return 401 for invalid tokens per security spec section 3.2</spec-requirement>
  <temptation>Returning 403 would be faster to implement</temptation>
  <decision>Implemented 401 per specification exactly</decision>
  <rationale>Zero tolerance for architectural drift - specification compliance over convenience</rationale>
</drift-prevention>
```

### Law #2: Protocol Adherence
**WHEN**: Starting/completing any protocol phase
**ACTION**: Update `/memories/protocol-compliance/protocol-status.xml`
**FORMAT**:
```xml
<protocol-status>
  <project>customer-dashboard</project>
  <current-phase>Implementation (Phase 7)</current-phase>
  <phases-completed>
    <phase>Security Analysis</phase>
    <phase>Requirements Specification</phase>
    <phase>Architecture Design</phase>
    <phase>Technical Debt Evaluation</phase>
    <phase>Dependency Analysis</phase>
    <phase>Task Decomposition</phase>
  </phases-completed>
  <quality-gates-passed>
    <gate>Security validation - zero critical vulnerabilities</gate>
    <gate>Specification completeness - 100% coverage</gate>
    <gate>Architecture review - approved by spec-architect</gate>
  </quality-gates-passed>
  <next-phase>Validation Gates (Phase 12)</next-phase>
</protocol-status>
```

### Law #3: Orchestration
**WHEN**: Each agent delegation or handoff
**ACTION**: Create context package in `/memories/agent-coordination/context-packages.xml`
**FORMAT**:
```xml
<handoff>
  <timestamp>2025-10-03T10:30:00Z</timestamp>
  <from>spec-architect</from>
  <to>backend-developer</to>
  <task>Implement RESTful API endpoints for user management</task>
  <context>
    <decisions>
      - Using Express.js with TypeScript
      - JWT authentication pattern established
      - PostgreSQL database selected
    </decisions>
    <files>
      - /docs/architecture.md
      - /project-knowledge/auth-service/architecture.xml
    </files>
    <dependencies>Database schema must be created first</dependencies>
  </context>
  <success-criteria>
    <criterion>All CRUD endpoints functional</criterion>
    <criterion>Input validation on all routes</criterion>
    <criterion>Unit tests with >90% coverage</criterion>
  </success-criteria>
  <constraints>
    <law-compliance>Law #1: Stop if authentication pattern unclear</law-compliance>
    <law-compliance>Law #4: Use Level 2-3 changes only</law-compliance>
    <tech-debt>Max 20% new debt allowed</tech-debt>
  </constraints>
  <status>completed</status>
</handoff>
```

### Law #4: Surgical Precision
**WHEN**: Before Level 4+ changes or efficiency decisions
**ACTION**: Log analysis in `/memories/protocol-compliance/efficiency-metrics.xml`
**FORMAT**:
```xml
<efficiency-analysis>
  <timestamp>2025-10-03T12:00:00Z</timestamp>
  <problem>Add user avatar upload functionality</problem>
  <level-1-option>
    <description>Add single endpoint, basic validation</description>
    <effort>15 minutes</effort>
    <pros>Fast, simple implementation</pros>
    <cons>Limited file type validation, no image processing</cons>
  </level-1-option>
  <level-3-option>
    <description>Full upload service with validation, processing, storage</description>
    <effort>45 minutes</effort>
    <pros>Complete solution, secure, scalable</pros>
    <cons>More complex, requires image library dependency</cons>
  </level-3-option>
  <decision>Level 3 - comprehensive solution justified by security requirements</decision>
  <rationale>File upload is security-critical, minimalist approach inadequate</rationale>
  <tech-debt-impact>Zero - proper implementation prevents future security debt</tech-debt-impact>
</efficiency-analysis>
```

### Law #5: Senior Developer Leadership
**WHEN**: Client interactions and status reports
**ACTION**: Update `/memories/client-context/` files
**FORMAT**:
```xml
<!-- preferences.xml -->
<client-preferences>
  <communication>
    <style>Weekly written updates with visual diagrams</style>
    <frequency>Monday mornings, summary format</frequency>
    <detail-level>High-level with option to drill into technical details</detail-level>
  </communication>
  <decision-making>
    <approach>Data-driven, requires metrics and justification</approach>
    <speed>Prefers quick decisions with option to revise vs prolonged analysis</speed>
  </decision-making>
  <priorities>
    <priority>User value delivery over technical perfection</priority>
    <priority>Security is non-negotiable</priority>
    <priority>Maintainability for future team scaling</priority>
  </priorities>
</client-preferences>

<!-- approval-history.xml -->
<approval>
  <timestamp>2025-10-03T14:00:00Z</timestamp>
  <decision>Use PostgreSQL instead of MongoDB for user data</decision>
  <rationale-presented>ACID compliance, better for relational user data, team expertise</rationale-presented>
  <client-response>Approved - agrees ACID compliance is important for user data integrity</client-response>
  <alternatives-considered>MongoDB, MySQL, DynamoDB</alternatives-considered>
</approval>
```

---

## 5. Agent-Specific Responsibilities

| Agent | Memory Responsibility | Primary Files |
|-------|----------------------|---------------|
| **spec-architect** | Architecture decisions, technology selections, design patterns | `project-knowledge/{project}/architecture.xml` |
| **requirements-specialist** | Requirement patterns, user story templates, task decompositions | `development-patterns/task-templates.xml` |
| **quality-assurance-specialist** | Requirements audit results, compliance scoring, QA patterns | `project-knowledge/{project}/requirements-audit.xml` |
| **security-specialist** | Security patterns, threat models, vulnerability findings | `development-patterns/security-patterns.xml` |
| **project-manager** | Agent coordination efficiency, workflow optimization, handoffs | `agent-coordination/handoff-log.xml` |
| **backend-developer** | API patterns, database optimization, backend debugging | `development-patterns/debugging-solutions.xml` |
| **frontend-developer** | Component patterns, UI debugging, performance optimizations | `development-patterns/debugging-solutions.xml` |
| **spec-developer** | Full-stack integration patterns, system coordination | `development-patterns/debugging-solutions.xml` |
| **spec-tester** | Test strategies, TDD patterns, testing lessons | `development-patterns/test-strategies.xml` |
| **spec-planner** | Task decomposition templates, estimation accuracy | `development-patterns/task-templates.xml` |
| **spec-reviewer** | Code quality patterns, review checklists | `development-patterns/code-quality-patterns.xml` |
| **spec-validator** | Validation patterns, deployment readiness checklists | `development-patterns/validation-patterns.xml` |
| **spec-analyst** | Requirements patterns, stakeholder analysis | `development-patterns/requirements-patterns.xml` |

---

## 6. XML Schema Standards

### Session Context Template
```xml
<?xml version="1.0" encoding="UTF-8"?>
<session>
  <metadata>
    <timestamp>2025-10-03T14:30:00Z</timestamp>
    <version>1.0</version>
  </metadata>
  <project>customer-dashboard</project>
  <phase>Implementation - Phase 7</phase>
  <current-task>Implementing authentication middleware (Level 3)</current-task>
  <todo-status>3 of 8 tasks completed</todo-status>
  <last-action>Added JWT validation, testing in progress</last-action>
  <next-step>Complete integration tests, then move to Level 4 API routes</next-step>
  <blockers>None - awaiting test completion</blockers>
</session>
```

### Protocol Compliance Template
```xml
<?xml version="1.0" encoding="UTF-8"?>
<protocol-tracking>
  <metadata>
    <timestamp>2025-10-03T14:30:00Z</timestamp>
    <law>Law #2 - Protocol Adherence</law>
  </metadata>
  <entry>
    <phase>Security Analysis</phase>
    <status>completed</status>
    <completion-timestamp>2025-10-01T10:00:00Z</completion-timestamp>
    <quality-gates-passed>
      <gate>Threat model reviewed by security-specialist</gate>
      <gate>Zero critical vulnerabilities identified</gate>
    </quality-gates-passed>
  </entry>
</protocol-tracking>
```

### Agent Handoff Template
```xml
<?xml version="1.0" encoding="UTF-8"?>
<handoff-log>
  <metadata>
    <timestamp>2025-10-03T14:30:00Z</timestamp>
    <version>1.0</version>
  </metadata>
  <handoff>
    <from-agent>requirements-specialist</from-agent>
    <to-agent>spec-architect</to-agent>
    <context-quality>High - Complete requirements documentation provided</context-quality>
    <handoff-duration>5 minutes</handoff-duration>
    <issues>None - smooth transition with all prerequisites met</issues>
    <lessons-learned>Requirements documentation template ensures consistent handoff quality</lessons-learned>
  </handoff>
</handoff-log>
```

---

## 7. Security & Validation

### Path Traversal Protection
**Validation Script**: `scripts/validate-memory-path.js`

**Protected Against:**
- Parent directory traversal (`../`, `..\\`)
- URL-encoded attacks (`%2e%2e`, `%252e`)
- Null byte injection (`\0`, `%00`)
- Absolute path escapes
- Invalid subdirectories

**Usage:**
```bash
node scripts/validate-memory-path.js memories/session-context/active-project.xml
```

**Hook Integration:**
Automatic validation when writing to `/memories/` via hooks.json

### Sensitive Data Filtering
**Never Store:**
- API keys, tokens, secrets
- Passwords or credentials
- Client-specific confidential information
- Credit card numbers or PII
- Internal system passwords

**Hook Detection:**
Automatic scanning for patterns: `API_KEY`, `SECRET`, `PASSWORD`, `TOKEN`, credit card numbers

### File Size Limits
**Maximum**: 50KB per file
**Enforcement**: Automated via hooks.json
**Pagination**: Use `view_range` parameter for large files

**Example:**
```javascript
view("/memories/large-file.xml", { view_range: [1, 100] })
```

---

## 8. Maintenance Procedures

### Per-Session Cleanup
**When**: End of each session
**Actions:**
1. Archive completed project context to `project-knowledge/{project}/`
2. Clear stale entries from `session-context/pending-decisions.xml`
3. Update agent handoff logs with resolutions
4. Consolidate duplicate entries in pattern libraries

### Weekly Consolidation
**When**: End of each week
**Actions:**
1. Review `development-patterns/debugging-solutions.xml` and consolidate similar solutions
2. Update pattern libraries with most effective approaches
3. Archive completed projects to project-specific subdirectories
4. Clear expired `session-context/` entries older than 7 days

### Monthly Archiving
**When**: End of each month
**Actions:**
1. Move completed projects from active memory to archive directory
2. Generate monthly metrics report (memory utilization, pattern accumulation)
3. Audit `client-context/` for outdated preferences
4. Review and optimize file sizes across all categories

### Memory Hygiene Best Practices
- **One Session, One Active Project**: Keep `active-project.xml` focused
- **Regular Consolidation**: Don't let debugging solutions fragment
- **Project Completion**: Always archive completed projects
- **Client Context**: Update preferences as they evolve
- **Pattern Quality**: Periodically review patterns for effectiveness

---

## 9. Integration with Existing Protocols

### Security-First Protocol
**Enhancement**: Record all security findings and patterns in memory
- Threat models saved to `project-knowledge/{project}/security-audit.xml`
- Security patterns accumulated in `development-patterns/security-patterns.xml`
- Vulnerability resolutions tracked for future prevention

### SDD/TDD Integration
**Enhancement**: Build library of effective test strategies
- TDD patterns that worked saved to `development-patterns/test-strategies.xml`
- Specification compliance tracked in `protocol-compliance/spec-adherence.xml`
- Test coverage lessons learned preserved

### Task Decomposition
**Enhancement**: Proven decomposition templates accumulate
- Successful 15-30 minute task breakdowns saved to `development-patterns/task-templates.xml`
- Estimation accuracy tracked in `protocol-compliance/efficiency-metrics.xml`
- Dependency patterns recorded for future projects

### Surgical Debugging
**Enhancement**: Solutions library grows with every Level 1-7 resolution
- Debugging solutions categorized by level in `development-patterns/debugging-solutions.xml`
- Systematic escalation patterns documented
- Cross-project debugging knowledge preserved

### Technical Debt Management
**Enhancement**: Debt decisions and outcomes tracked long-term
- Authorization records in `project-knowledge/{project}/tech-debt.xml`
- Debt repayment strategies documented
- Business value vs technical cost analysis preserved

---

## 10. Practical Examples

### Example 1: Starting New Project with Memory
```
Session 1:
1. view /memories/session-context/ (empty for new project)
2. Start authentication feature work
3. Record architecture decision in /memories/project-knowledge/auth-service/architecture.xml
4. Encounter uncertainty about token expiry → Log in uncertainty-log.xml
5. Session ends → Update active-project.xml with "auth feature in progress"
```

### Example 2: Resuming Interrupted Work
```
Session 2:
1. view /memories/session-context/active-project.xml
   → Sees: "auth feature in progress, JWT validation added, awaiting tests"
2. view /memories/protocol-compliance/uncertainty-log.xml
   → Sees: "token expiry question pending client response"
3. Client provides answer (15 minutes) → Update uncertainty log with resolution
4. Complete feature using resolved requirements
5. Record successful pattern in security-patterns.xml
```

### Example 3: Agent Handoff with Context Preservation
```
Spec-Architect → Backend-Developer Handoff:
1. spec-architect completes architecture design
2. Creates context package in /memories/agent-coordination/context-packages.xml
3. Includes: decisions, files, dependencies, success criteria, constraints
4. backend-developer starts work in new session
5. Reads context package → Has complete picture, zero information loss
6. Completes implementation, updates handoff status to "completed"
```

### Example 4: Debugging with Historical Solutions
```
Problem: React component re-rendering too frequently

Memory Lookup:
1. view /memories/development-patterns/debugging-solutions.xml
2. Find similar issue from previous project:
   <solution level="2">
     <problem>Unnecessary re-renders in component tree</problem>
     <diagnosis>useEffect missing dependency array</diagnosis>
     <fix>Add proper dependency array, use React.memo for expensive components</fix>
     <result>Re-renders reduced 90%</result>
   </solution>

Apply Solution:
3. Implement same fix pattern
4. Success! Add refinements to pattern library for future use
```

### Example 5: Cross-Project Pattern Reuse
```
New Project: E-commerce Site (needs authentication)

Reuse from Memory:
1. view /memories/development-patterns/security-patterns.xml
2. Find proven JWT authentication pattern from previous project
3. Adapt pattern to new project (saves 3+ hours of design time)
4. Implement with confidence (pattern already battle-tested)
5. Add project-specific improvements back to pattern library
```

---

## 11. Troubleshooting

### Issue: Path Validation Failure
**Symptom**: Hook warning "Invalid memory path detected"
**Cause**: Path doesn't start with `/memories/` or contains traversal sequences
**Solution**:
```bash
# Verify path format
node scripts/validate-memory-path.js "your/path/here"

# Correct format
memories/session-context/active-project.xml ✓
/memories/session-context/active-project.xml ✓
../memories/session-context/active-project.xml ✗
```

### Issue: File Size Exceeded
**Symptom**: Hook warning "File exceeds 50KB limit"
**Cause**: Memory file grown too large
**Solution**:
```bash
# Check current size
wc -c < memories/development-patterns/debugging-solutions.xml

# Split into separate files if needed
debugging-solutions-level-1.xml (5KB)
debugging-solutions-level-2-3.xml (20KB)
debugging-solutions-level-4-plus.xml (15KB)

# Or use pagination
view("/memories/large-file.xml", { view_range: [1, 100] })
```

### Issue: Sensitive Data Detection
**Symptom**: Hook warning "Potential sensitive data detected"
**Cause**: API key, password, or sensitive pattern found in memory file
**Solution**:
```xml
<!-- DON'T: -->
<config>
  <api-key>sk_live_abc123xyz</api-key>
</config>

<!-- DO: -->
<config>
  <api-key-location>Environment variable API_KEY</api-key-location>
  <api-key-pattern>JWT token with 32-character random string</api-key-pattern>
</config>
```

### Issue: Memory Bloat
**Symptom**: Hundreds of files in memory directory, slow performance
**Cause**: Insufficient archiving and consolidation
**Solution**:
```bash
# Archive completed projects
mkdir memories/archive/2025-09
mv memories/project-knowledge/completed-project memories/archive/2025-09/

# Consolidate debugging solutions
# Merge similar entries, remove duplicates, keep only most effective solutions

# Clear old session contexts
# Remove session-context entries older than 7 days
```

### Issue: Inconsistent Updates
**Symptom**: Some sessions update memory, others don't
**Cause**: Forgetting session start/end protocols
**Solution**:
- **Always** start session with memory directory view
- Enable hooks for automatic reminders
- Add memory updates to agent prompts
- Use TodoWrite integration for session status tracking

---

## 12. Best Practices

### Creating vs Updating Files
**Create New File When:**
- Starting new project (`project-knowledge/{new-project}/`)
- Discovering fundamentally new pattern type
- Different context category (session vs protocol vs patterns)

**Update Existing File When:**
- Adding to ongoing project knowledge
- Appending to established pattern libraries
- Continuing same session context
- Building on existing debugging solutions

### XML Structure for Clarity
```xml
<!-- GOOD: Clear, descriptive elements -->
<debugging-solution>
  <problem-description>API timeout on large data fetch</problem-description>
  <root-cause>Missing pagination, attempting to load 100K records</root-cause>
  <fix-applied>Implemented cursor-based pagination with 100-record pages</fix-applied>
  <outcome>Load time reduced from 30s to 0.5s</outcome>
</debugging-solution>

<!-- AVOID: Unclear, vague elements -->
<solution>
  <desc>Timeout issue</desc>
  <fix>Added pagination</fix>
</solution>
```

### Naming Conventions for Project Files
```
project-knowledge/
├── customer-dashboard/           # Project name (kebab-case)
│   ├── architecture.xml          # Standard files
│   ├── tech-debt.xml
│   ├── security-audit.xml
│   └── lessons.xml
│
├── ecommerce-platform-v2/        # Version in name if applicable
│   ├── architecture.xml
│   ├── feature-payment-gateway.xml  # Feature-specific if needed
│   └── integration-stripe.xml       # Integration-specific
```

### Cross-Referencing Between Categories
```xml
<!-- In session-context/active-project.xml -->
<current-task>
  <description>Implementing user authentication</description>
  <architecture-reference>See /memories/project-knowledge/auth-service/architecture.xml</architecture-reference>
  <pattern-reference>Using JWT pattern from /memories/development-patterns/security-patterns.xml</pattern-reference>
</current-task>
```

### Version Control for Memory Files
```bash
# Include memory files in git
git add memories/

# Commit with descriptive messages
git commit -m "Memory: Add JWT authentication pattern from customer-dashboard project"

# Use .gitignore for sensitive categories if needed
# memories/client-context/*.xml  # If contains client-specific info
```

---

## Summary

The Memory System transforms my-dev-workspace from a session-based environment into a continuously learning, context-preserving development workspace. By following these protocols, every session builds on previous work, every project contributes to workspace-wide knowledge, and no context is ever lost.

**Key Takeaways:**
1. **Always start with memory** - View directory before any work
2. **Record as you go** - Don't wait until session end
3. **Maintain hygiene** - Regular archiving and consolidation
4. **Security first** - Never store sensitive data
5. **Cross-project learning** - Patterns accumulate across all work

For questions or issues, refer to this protocol or consult `/memories/README.md` for quick reference.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-03
**Maintained By**: requirements-specialist agent
**Review Cycle**: Monthly

---
name: session-recovery
description: Automatically enforce Law #6 (Cross-Session Memory & Learning) by restoring session context from memory at session start, recovering TodoWrite status, resuming interrupted workflows, and rebuilding context after memory clearing. Use this skill automatically at session start, after context clearing events, when user says "continue where we left off", or when referencing previous session work.
---

# Session Recovery

## Purpose

This skill automatically enforces CLAUDE.md Law #6: CROSS-SESSION MEMORY & CONTINUOUS LEARNING. It provides seamless session continuity by loading context from `/memories/` directory, enabling unlimited session length through context editing integration, and preserving all critical state across session boundaries.

**Core Principle**: Every session MUST begin by recovering context. Every significant action MUST be recorded for future sessions. Knowledge accumulates across all projects.

## When to Use This Skill

This skill automatically activates:

1. **Session Start** - FIRST ACTION of every new session (MANDATORY)
2. **Context Clearing** - After Anthropic API clears oldest tool results
3. **Continue Requests** - When user says "continue where we left off"
4. **Session Interruption** - When recovering from crashes or timeouts
5. **Project Resume** - When returning to project after days/weeks
6. **Reference to Past Work** - When user mentions previous sessions

## How to Use This Skill

### Step 1: Automatic Session Start Protocol (MANDATORY)

**FIRST ACTION of EVERY session before ANY other work:**

```bash
# Execute session recovery
python scripts/recover_session.py
```

This script:
1. Views `/memories/session-context/` to understand current state
2. Reads `/memories/protocol-compliance/` to check for pending Law violations
3. Reviews `/memories/client-context/preferences.xml` for client guidance
4. Loads relevant project knowledge from `/memories/project-knowledge/{project}/`
5. Syncs TodoWrite status with memory records
6. Checks if context was recently cleared (inspect session-context metadata)

**OUTPUT**: Session State Summary showing:
- Active project and current phase
- TodoWrite task status
- Pending decisions or blockers
- Agent coordination state
- Recent protocol compliance events
- Context preservation triggers

---

### Step 2: Load Session Context Files

**Read memory files in priority order** (see `references/memory-structure.md`):

**CRITICAL (Must Always Load)**:
1. `/memories/session-context/active-project.xml` - Current work state
2. `/memories/session-context/phase-status.xml` - Protocol execution status
3. `/memories/protocol-compliance/uncertainty-log.xml` - Active uncertainties
4. `/memories/client-context/pending-decisions.xml` - Blocking client approvals

**HIGH PRIORITY (Load if Relevant)**:
5. `/memories/agent-coordination/context-packages.xml` - Active agent handoffs
6. `/memories/development-patterns/debugging-solutions.xml` - Current debugging progress
7. `/memories/project-knowledge/{project}.xml` - Project-specific learnings

**MEDIUM PRIORITY (Load as Needed)**:
8. `/memories/protocol-compliance/efficiency-metrics.xml` - Surgical level statistics
9. `/memories/client-context/communication-log.xml` - Recent client interactions
10. `/memories/development-patterns/test-strategies.xml` - Testing approaches used

---

### Step 3: Restore TodoWrite Status

**Synchronize TodoWrite with memory state:**

```python
# Script extracts and restores TodoWrite from memory
python scripts/restore_todowrite.py
```

This restores:
- All active tasks with current status
- Completed tasks from previous session
- Pending tasks not yet started
- Task dependencies and sequencing
- Progress tracking state

**TodoWrite Integration**:
```
After restoration, verify:
□ All in_progress tasks identified
□ Completed tasks from previous session marked
□ Pending tasks queued correctly
□ Task descriptions match memory state
□ Dependencies preserved
```

---

### Step 4: Resume Interrupted Workflows

**Identify where previous session stopped:**

```python
# Analyze interruption point
python scripts/analyze_interruption.py
```

This determines:
- Which protocol phase was active
- What task was in progress
- What files were being modified
- What agent handoffs were pending
- What decisions were blocked
- What uncertainty was unresolved

**Workflow Resumption Decision Tree**:

```
IF phase_status == "planning":
    → Resume planning where stopped
    → Check if plan document needs updates

ELIF phase_status == "implementation":
    → Identify last completed task
    → Resume with next task in sequence
    → Validate no partial implementations

ELIF phase_status == "testing":
    → Check which tests were running
    → Resume testing from interruption point
    → Re-run any interrupted tests

ELIF phase_status == "blocked":
    → Review blocking issue from memory
    → Present blocking issue to client again
    → Wait for resolution before proceeding

ELIF phase_status == "agent-handoff":
    → Load agent context package
    → Resume handoff with full context
    → Validate agent has all needed information
```

---

### Step 5: Context Editing Integration

**Handle Anthropic API context clearing:**

When conversation context approaches clearing threshold (100K tokens):

1. **Automatic Warning Received** - System notifies of impending context clear

2. **PRESERVE CRITICAL STATE** (MANDATORY):
   ```bash
   python scripts/preserve_context.py
   ```

   This saves:
   - `/memories/session-context/active-project.xml` - Current work status
   - `/memories/protocol-compliance/protocol-status.xml` - Phase progress
   - `/memories/agent-coordination/context-packages.xml` - Active handoffs
   - `/memories/client-context/pending-decisions.xml` - Blocking items

3. **SUMMARIZE TOOL RESULTS** (IMPORTANT):
   - Extract key findings from tool results being cleared
   - Document important code patterns discovered
   - Record debugging insights and solutions found
   - Note security findings and architectural decisions made

4. **UPDATE MEMORY METADATA** (REQUIRED):
   - Mark files with `<context-preservation-trigger>approaching-threshold</context-preservation-trigger>`
   - Record `<context-clear-timestamp>` for tracking
   - Note estimated tokens cleared
   - Document what critical information was preserved

5. **CONTINUE SEAMLESSLY** (EXPECTED):
   - Reference memory files for any cleared information needed
   - Proceed with current task without interruption
   - Trust memory system for historical context
   - Never ask user to repeat previously provided information

**Context Clearing Response Template**:
```
⚠️ CONTEXT CLEARING EVENT DETECTED

Tokens at Risk: ~[X]K tokens
Preservation Status: COMPLETE

Preserved to Memory:
✓ Active project state → /memories/session-context/active-project.xml
✓ Protocol phase progress → /memories/protocol-compliance/protocol-status.xml
✓ Agent coordination state → /memories/agent-coordination/context-packages.xml
✓ Pending decisions → /memories/client-context/pending-decisions.xml

Tool Results Summary:
- [Key finding 1 from tool results being cleared]
- [Key finding 2]
- [Key finding 3]

Resuming seamlessly - no user action required.
```

---

### Step 6: Knowledge Retrieval Strategies

**Efficient memory access patterns:**

#### Pattern A: Recent Work Recovery

```bash
# When user says "continue from yesterday"
python scripts/recover_session.py --date 2025-10-29
```

Loads:
- Session context from that date
- Files modified in that session
- TodoWrite state at end of session
- Any pending decisions or blockers

#### Pattern B: Project-Specific Recovery

```bash
# When switching between projects
python scripts/recover_session.py --project auth-service
```

Loads:
- Project-specific architecture decisions
- Technical debt log for that project
- Security audit trail
- Lessons learned
- Active tasks for that project

#### Pattern C: Protocol Compliance Recovery

```bash
# When auditing protocol compliance
python scripts/recover_session.py --compliance-check
```

Loads:
- Recent uncertainty logs
- Drift prevention events
- Efficiency metrics
- Agent coordination quality
- External audit findings

---

### Step 7: Memory Integration Workflows

**Cross-Skill memory sharing:**

#### With `uncertainty-protocol-enforcer`

```
When uncertainty detected:
1. Check /memories/protocol-compliance/uncertainty-log.xml
2. Look for similar past uncertainties
3. Review how they were resolved
4. Apply successful resolution patterns
5. Log new uncertainty with cross-reference
```

#### With `specification-adherence-checker`

```
When validating specifications:
1. Check /memories/protocol-compliance/drift-prevention-log.xml
2. Look for common drift patterns in this project
3. Review previously approved specification exceptions
4. Apply learned validation patterns
5. Log drift prevention with project context
```

#### With `knowledge-capture` (Future Skill)

```
When knowledge-capture logs new patterns:
1. session-recovery retrieves those patterns next session
2. Patterns accumulate into searchable library
3. Debugging solutions reused across projects
4. Security patterns applied systematically
```

---

## Session Start Checklist

**Execute this checklist at EVERY session start:**

```
SESSION RECOVERY CHECKLIST

Pre-Recovery:
□ Identify if this is new session or continuation
□ Determine if context was recently cleared
□ Check for session start timestamp

Recovery Execution:
□ Run scripts/recover_session.py
□ Load critical memory files (4 files minimum)
□ Restore TodoWrite status
□ Identify interruption point (if applicable)

State Validation:
□ Active project identified
□ Current phase known
□ Pending decisions reviewed
□ Agent handoffs checked
□ Uncertainties assessed

Resumption:
□ Present session state summary to user
□ Confirm ready to continue work
□ Resume from correct point in workflow
```

---

## Session End Protocol

**Before session completion or major interruptions:**

```bash
# Preserve session state for next time
python scripts/save_session_state.py
```

This updates:
1. `/memories/session-context/phase-status.xml` - Current state
2. `/memories/session-context/pending-decisions.xml` - What's blocked
3. TodoWrite status → session context
4. Active agent handoffs
5. Timestamp and session metadata

**Session End Checklist**:
```
□ Update /memories/session-context/phase-status.xml with current state
□ Record pending decisions in /memories/session-context/pending-decisions.xml
□ Save TodoWrite status to session context
□ Document any active agent handoffs
□ Archive completed project context to project-specific files
□ Set session end timestamp
```

---

## Memory Structure Reference

See `references/memory-structure.md` for complete directory architecture.

**Quick Reference**:
```
/memories/
├── session-context/          # Current session state
│   ├── active-project.xml    # 🔴 CRITICAL
│   ├── phase-status.xml      # 🔴 CRITICAL
│   └── pending-decisions.xml # 🔴 CRITICAL
├── protocol-compliance/      # Law #1-5 enforcement tracking
│   ├── uncertainty-log.xml   # 🔴 CRITICAL
│   ├── drift-prevention-log.xml
│   └── efficiency-metrics.xml
├── client-context/           # Senior developer reporting
│   ├── preferences.xml
│   └── communication-log.xml
├── agent-coordination/       # Multi-agent orchestration
│   └── context-packages.xml  # 🟡 HIGH PRIORITY
├── development-patterns/     # Reusable knowledge
│   ├── debugging-solutions.xml
│   ├── security-patterns.xml
│   └── test-strategies.xml
└── project-knowledge/        # Per-project learning
    └── {project-name}/
        ├── architecture.xml
        ├── tech-debt.xml
        └── lessons.xml
```

---

## Context Preservation Priorities

**When context threshold approaching:**

### CRITICAL (Must Always Preserve)

1. `session-context/active-project.xml`
   - Current work state
   - Active tasks
   - Blocking issues

2. `session-context/phase-status.xml`
   - Protocol execution status
   - Current workflow phase
   - Milestone progress

3. `protocol-compliance/uncertainty-log.xml`
   - Active uncertainties
   - Unresolved questions
   - Clarification needed

4. `client-context/pending-decisions.xml`
   - Decisions blocking progress
   - Client approvals needed
   - Outstanding questions

### HIGH PRIORITY (Preserve Recent State)

5. `agent-coordination/context-packages.xml`
   - Active agent handoffs
   - Pending task delegations
   - Agent coordination state

6. `development-patterns/debugging-solutions.xml`
   - Current debugging progress
   - Partially resolved issues
   - Investigation state

7. `project-knowledge/{project}.xml`
   - Project-specific learnings
   - Architecture decisions
   - Technical context

### MEDIUM PRIORITY (Summarize and Archive)

8. `protocol-compliance/efficiency-metrics.xml`
   - Surgical level statistics
   - Performance tracking
   - Optimization data

9. `client-context/communication-log.xml`
   - Recent client interactions
   - Decision history
   - Communication patterns

10. `development-patterns/test-strategies.xml`
    - Testing approaches used
    - Test coverage status
    - Quality metrics

---

## Benefits of Session Recovery

**Cross-Session Continuity**:
- ✅ Perfect recovery from session interruptions
- ✅ No lost context or progress
- ✅ Seamless multi-day project workflows
- ✅ Unlimited session length via context editing

**Continuous Learning**:
- ✅ Debugging solutions accumulate across all projects
- ✅ Security patterns library grows over time
- ✅ Test strategies become more refined
- ✅ Task decomposition improves with experience

**Perfect Agent Coordination**:
- ✅ Complete context preservation for multi-session agent workflows
- ✅ No information loss in agent handoffs
- ✅ Quality gates tracked across sessions

**Client Context Preservation**:
- ✅ Preferences and decisions maintained indefinitely
- ✅ Communication history provides perfect context
- ✅ Approval history prevents re-asking for decisions

**Protocol Enforcement**:
- ✅ Automatic tracking of Laws #1-5 compliance
- ✅ Uncertainty patterns identified and prevented
- ✅ Specification drift caught early
- ✅ Efficiency metrics drive continuous improvement

---

## Example Workflows

### Example 1: Session Start After Weekend

**Friday End of Day**:
```bash
# Save state before ending
python scripts/save_session_state.py

Session State Saved:
✓ Active project: auth-service (implementation phase)
✓ TodoWrite: 3 pending, 7 completed
✓ Pending: Client decision on MFA implementation
✓ Agent: None active
```

**Monday Morning**:
```bash
# Recover session
python scripts/recover_session.py

SESSION RECOVERED:

Active Project: auth-service
Phase: Implementation (resumed)
Progress: 7/10 tasks completed

Pending Decisions:
1. MFA implementation approach (blocked since Friday)
   → Requires client input on: SMS vs Authenticator App

TodoWrite Restored:
✓ 7 completed tasks
⚙ 0 in progress (ready to resume)
📋 3 pending tasks

Next Steps:
1. Follow up with client on MFA decision
2. Resume implementation once decision received
3. Complete tasks 8-10 per plan

Ready to continue! 🚀
```

---

### Example 2: Context Clearing Mid-Session

**Before Context Clear** (at 95K tokens):
```bash
# Automatic preservation triggered
python scripts/preserve_context.py

⚠️ CONTEXT THRESHOLD APPROACHING

Preserving critical state:
✓ Active debugging session → debugging-solutions.xml
✓ Agent handoff to spec-tester → context-packages.xml
✓ Pending architectural decision → pending-decisions.xml
✓ Current file modifications → active-project.xml

Summarizing tool results (30K tokens):
- Database schema analysis findings
- Security vulnerability scan results
- Integration test failures root causes

Context preservation complete. Ready for clearing.
```

**After Context Clear** (automatic):
```bash
# Session continues seamlessly

✅ CONTEXT CLEARED - RECOVERY COMPLETE

Recovered State:
✓ Debugging session state restored from memory
✓ Agent handoff context available
✓ Architectural decision still pending
✓ File modification state preserved

Tool Results Summary Available:
- Database schema: 3 tables require indexing
- Security: 1 medium-severity finding (XSS vulnerability)
- Tests: 4 failures due to mocked dependency configuration

Continuing work without interruption. No user action needed.
```

---

### Example 3: Multi-Project Context Switching

**Working on Project A**:
```bash
python scripts/save_session_state.py --project frontend-dashboard
```

**Switch to Project B**:
```bash
python scripts/recover_session.py --project auth-service

Switching Context:

FROM: frontend-dashboard
  - Saved: React component refactoring in progress
  - Saved: 2 pending code review comments
  - Saved: Performance optimization notes

TO: auth-service
  - Loaded: JWT implementation architecture
  - Loaded: Security audit findings (2 resolved, 1 open)
  - Loaded: Integration with user-service documented
  - Loaded: Technical debt: password reset flow needs refactor

Ready to work on auth-service! 🔄
```

**Return to Project A Later**:
```bash
python scripts/recover_session.py --project frontend-dashboard

# Perfect recovery of React refactoring state
```

---

## Integration Notes

**Complements Existing Skills**:
- **NO existing Skill handles memory integration**
- This is entirely new capability for Law #6
- Enables all other Skills to benefit from historical context
- Foundation for `knowledge-capture` Skill (Phase 2)

**No Redundancy**: This is the ONLY Skill that automates session recovery and context preservation.

---

## References

See bundled references for detailed guidance:
- `references/memory-structure.md` - Complete memory directory architecture
- `references/recovery-scripts-guide.md` - Script usage and examples
- `references/context-editing-integration.md` - Anthropic context editing details

---

**Last Updated**: 2025-10-29
**Skill Version**: 1.0.0

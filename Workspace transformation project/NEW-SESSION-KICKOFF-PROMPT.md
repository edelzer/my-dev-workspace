# NEW SESSION KICKOFF PROMPT

Copy the text below and paste it into a new Claude Code chat session to begin execution:

---

## PROMPT START (Copy from here)

I need you to execute the **Workspace Transformation Plan** that has been fully prepared and approved.

**Context Files to Read First**:
1. Read: `Workspace transformation project/CONSOLIDATED-TRANSFORMATION-PLAN.md` (v3.1 Client-Approved)
2. Read: `Workspace transformation project/EXECUTION-READINESS-REPORT.md` (current status)
3. Read: `Workspace transformation project/QUALITY-VALIDATION-REPORT.md` (9.4/10 quality validation)

**Critical Information**:
- **Plan Status**: Fully prepared, client decisions integrated, QA validated
- **Quality Score**: 9.4/10 readiness (validated by quality-assurance-specialist)
- **Approach**: Option B (checkpoint approach) - Execute Step 1, pause for my review, then Step 2
- **Timeline**: 2-3 hours for Step 1, then pause for my review and approval before Step 2

**Client Decisions Already Made**:
1. ✅ **Project Deletion**: Approved - Delete all projects in `/projects` (keep README.md only)
2. ✅ **Memory Handling**: Clean memory FILES, but KEEP `/memories/` directory structure intact
3. ✅ **Spec-Kit**: STOP at Phase 1.2 and request my specific installation instructions
4. ✅ **Execution Approach**: Option B (checkpoint after Step 1)

**IMPORTANT - You Must**:
1. **Follow Consolidated Plan v3.1** exactly as written
2. **STOP at Phase 1.2** and ask me for Spec-Kit installation instructions (do NOT assume git submodule)
3. **STOP after Step 1 completion** and present results for my review before proceeding to Step 2
4. **Preserve `/memories/` directory structure** - clean files only, keep directory
5. **Use agent orchestration** as defined in plan (project-manager, spec-architect, backend-developer, spec-analyst, spec-tester, quality-assurance-specialist)

**What I Need You to Do**:
1. Read the three context files above
2. Confirm you understand the plan and client decisions
3. Verify technical prerequisites (git status, Node.js version, disk space)
4. Create backup branch: `backup-pre-transformation-20250118`
5. Initialize TodoWrite tracking for Step 1 phases
6. Begin executing Phase 1.1: Repository Cleanup
7. Continue through all Step 1 phases with commits after each phase
8. Present Step 1 completion report when done

**Expected Duration**: 2-3 hours for Step 1

**Your Role**: Senior Lead Developer orchestrating multi-agent team execution with systematic phase-by-phase progress and client checkpoints.

Begin by reading the context files and confirming you're ready to execute.

## PROMPT END (Copy to here)

---

# ALTERNATIVE: MINIMAL KICKOFF PROMPT

If you prefer a shorter prompt, use this version:

---

## MINIMAL PROMPT START (Copy from here)

Execute the **Workspace Transformation Plan**.

**Files to read**:
- `Workspace transformation project/CONSOLIDATED-TRANSFORMATION-PLAN.md` (v3.1)
- `Workspace transformation project/EXECUTION-READINESS-REPORT.md`

**Execution approach**: Option B (Step 1, pause for review, then Step 2)

**Critical rules**:
1. STOP at Phase 1.2 for my Spec-Kit installation instructions
2. STOP after Step 1 for my review before Step 2
3. Keep `/memories/` directory structure (clean files only)
4. Delete all projects in `/projects` (keep README.md)

**Start by**: Reading the plan files, creating backup branch, then executing Phase 1.1.

Ready when you are.

## MINIMAL PROMPT END (Copy to here)

---

# USAGE NOTES

**When to Use This**:
- Starting a new chat session for execution
- After session timeout or interruption
- When handing off to another developer

**What Happens Next**:
1. New Claude session reads the context files
2. Verifies understanding and prerequisites
3. Creates backup branch
4. Begins systematic execution of Step 1
5. Stops at Phase 1.2 for your Spec-Kit guidance
6. Stops after Step 1 for your review

**Session Recovery**:
If execution is interrupted, you can restart with:
"Resume workspace transformation from last checkpoint. Read TodoWrite status and continue from where we left off."

**Files Available for New Session**:
- ✅ CONSOLIDATED-TRANSFORMATION-PLAN.md (complete execution plan)
- ✅ EXECUTION-READINESS-REPORT.md (status and decisions)
- ✅ QUALITY-VALIDATION-REPORT.md (validation results)
- ✅ EXECUTION-STRATEGY.md (detailed agent coordination)
- ✅ TodoWrite tracking (progress state)

All planning complete. New session can execute immediately. ✅

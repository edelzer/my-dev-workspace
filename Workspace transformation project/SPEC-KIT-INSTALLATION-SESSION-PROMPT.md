# SPEC-KIT INSTALLATION - NEW SESSION PROMPT

**Session Purpose**: Install GitHub Spec-Kit as optional enhancement to the workspace
**Prerequisites**: Workspace transformation Steps 1 & 2 complete
**Estimated Time**: 60-75 minutes
**Status**: Ready to begin

---

## CRITICAL CONTEXT FILES - READ THESE FIRST

Please read these files in this exact order to understand current state:

### 1. **Current Workspace Status**
**File**: `Workspace transformation project/STEP-1-COMPLETION-REPORT.md`
- What was accomplished in Step 1 (Foundation & Cleanup)
- Current workspace state validation
- Spec-Kit planning completed (blueprint ready)

### 2. **Docker Completion Status**
**File**: Review git log for Step 2 commits
```bash
git log --oneline --grep="Phase 2" -10
```
- Step 2 complete: All templates now have Docker support
- Latest commits: 990a036 → eb6ac71 (Phase 2.1 through 2.4)

### 3. **Spec-Kit Integration Blueprint**
**File**: `docs/spec-kit-planning.md`
- Complete installation plan (60-75 minute roadmap)
- Multi-IDE integration strategy (Claude Code + Cursor)
- Workflow design (independent from BMAD, can collaborate)
- Development approach (normal agent team, not BMAD agents)

### 4. **Current Workspace State**
**Verify with**:
```bash
# Health check (should show 18/18 passing)
npm run workspace:health

# Git status (should be clean)
git status

# Latest commits
git log --oneline -5
```

**Expected State**:
- ✅ All 18 workspace health checks passing
- ✅ Clean git status (no uncommitted changes)
- ✅ All Step 1 and Step 2 commits pushed to main
- ✅ Latest commit: `eb6ac71` (Phase 2.4 - Docker guide complete)

---

## WHAT'S BEEN COMPLETED (Context)

### Step 1: Foundation & Cleanup ✅ (COMPLETE)
- Repository cleaned (old projects removed, memory files cleaned)
- Project creation script operational (`scripts/create-project-repo.js`)
- Documentation updated (template-only model)
- Validation scripts created (`workspace-health-check.js`, `validate-templates.js`)
- **Spec-Kit planning complete** (blueprint in `docs/spec-kit-planning.md`)

### Step 2: Docker Completion ✅ (COMPLETE)
- Docker added to web template (React + Nginx, ~25MB)
- Docker added to api template (Node.js + PostgreSQL + Redis, ~120MB)
- API template minimal structure created (Express.js with health endpoint)
- Comprehensive Docker guide created (`docs/DOCKER-GUIDE.md`, 1,450+ lines)
- All 5 templates production-ready with Docker

### Current Workspace Capabilities
- ✅ 7 templates (web, api, python, java, go, mobile, desktop)
- ✅ All 5 core templates have Docker support
- ✅ Independent project creation (`create-project-repo.js`)
- ✅ Comprehensive documentation (README, QUICKSTART, Docker guide)
- ✅ Validation scripts (health check, template validation)
- ✅ Clone → Create → Build → Deploy in < 10 minutes workflow

---

## WHAT NEEDS TO BE DONE (Spec-Kit Installation)

**Objective**: Install GitHub Spec-Kit as optional enhancement for formal specification-driven development

**Why Spec-Kit?**
- Provides formal specification workflow for client projects
- Complements BMAD agents (can work together via cross-review)
- Supports projects requiring detailed upfront documentation
- Regulatory/compliance-driven development
- Fixed-bid contracts with detailed specifications

**Installation Approach** (from `docs/spec-kit-planning.md`):

### Session 1: Research & Preparation (15-20 min)
1. Review GitHub Spec-Kit documentation
2. Understand command structure and workflow
3. Identify integration points with Claude Code
4. Plan installation strategy

### Session 2: Core Installation (20-25 min)
1. Install Spec-Kit repository (external clone or submodule)
2. Create Claude Code commands (`/constitution`, `/specify`, `/plan`, `/tasks`, `/implement`)
3. Configure multi-IDE support (Claude Code + Cursor)
4. Test basic workflow

### Session 3: Integration & Testing (15-20 min)
1. Test complete workflow end-to-end
2. Verify multi-IDE compatibility
3. Document usage in README
4. Create quick start guide

### Session 4: Documentation & Validation (10-15 min)
1. Update workspace documentation
2. Add Spec-Kit section to README and QUICKSTART
3. Validate installation
4. Create examples

---

## IMPORTANT PROTOCOLS TO FOLLOW

### Law #1 (Uncertainty Protocol & Specification Adherence)
- **STOP and ASK** if uncertain about Spec-Kit installation method
- **NO DRIFT** - Follow exact plan from `docs/spec-kit-planning.md`
- If Spec-Kit documentation is unclear → STOP and request guidance
- If integration approach uncertain → STOP and ask

### Law #2 (Protocol Adherence)
- Follow systematic session sequence (Research → Install → Test → Document)
- Create git commits after each session
- Validate completion criteria before marking sessions complete
- Use TodoWrite for progress tracking

### Law #3 (Orchestrated Efficiency)
- Use appropriate specialized agents for each session
- Maintain clear context handoffs between sessions
- Provide complete context packages for agent work
- Track progress in TodoWrite

### Law #4 (Surgical Precision)
- Minimal installation - only what's needed for Spec-Kit functionality
- Don't recreate existing workspace features
- Keep integration clean and simple
- Follow external tool integration pattern (like claudecode-rule2hook)

### Law #5 (Senior Developer Leadership)
- Report progress clearly after each session
- Stop at checkpoints for client approval
- Provide clear recommendations with rationale
- Document all decisions and integration points

### Law #6 (Memory & Learning)
- Update memory system with Spec-Kit installation details
- Document integration patterns for future reference
- Record any issues encountered and resolutions
- Preserve cross-session context

---

## SPEC-KIT INSTALLATION PLAN SUMMARY

**From**: `docs/spec-kit-planning.md`

### Installation Method (TBD - Client Decision Needed)

**Option A: External Clone** (Recommended for simplicity)
```bash
# Clone Spec-Kit externally
git clone https://github.com/oraios/spec-kit.git ~/tools/spec-kit

# Reference in Claude Code commands
# Commands point to external installation
```

**Option B: Git Submodule**
```bash
# Add as submodule
git submodule add https://github.com/oraios/spec-kit.git tools/spec-kit
git submodule update --init --recursive
```

**Option C: Direct Integration**
```bash
# Copy necessary files into workspace
# More integrated but requires maintenance
```

### Commands to Create

Based on Spec-Kit workflow, create these Claude Code commands:

1. **`/constitution`** - Define project principles and constraints
2. **`/specify`** - Create detailed specifications from requirements
3. **`/plan`** - Generate technical planning from specifications
4. **`/tasks`** - Break down into implementable tasks
5. **`/implement`** - Execute implementation with spec compliance

### Multi-IDE Support

- **Claude Code**: Primary integration (commands in `.claude/commands/`)
- **Cursor**: Mirror commands in `.cursor/` for compatibility
- **Shared Documentation**: Single source of truth in `docs/`

### Workflow Independence

- Spec-Kit and BMAD agents operate independently
- Can collaborate via cross-review when needed
- Use Spec-Kit for: Fixed requirements, regulatory compliance, client documentation
- Use BMAD for: Agile development, rapid prototyping, iterative work

---

## VALIDATION CRITERIA (When Installation Complete)

**Installation Success Criteria**:
- [ ] Spec-Kit accessible from workspace
- [ ] All 5 commands functional (`/constitution`, `/specify`, `/plan`, `/tasks`, `/implement`)
- [ ] Multi-IDE support working (Claude Code + Cursor)
- [ ] Documentation updated (README, QUICKSTART)
- [ ] Example workflow tested end-to-end
- [ ] Git commits created for each session
- [ ] Workspace health check still passing (18/18)

**Integration Success Criteria**:
- [ ] Spec-Kit doesn't conflict with existing workspace features
- [ ] BMAD agents and Spec-Kit can coexist
- [ ] Commands available in both Claude Code and Cursor
- [ ] Documentation clearly explains when to use Spec-Kit vs BMAD
- [ ] Example project demonstrates Spec-Kit workflow

---

## PRE-INSTALLATION CHECKLIST

**Before starting Spec-Kit installation, verify**:

### 1. **Workspace State**
```bash
# Should return 18/18 passing
npm run workspace:health

# Should be clean (no uncommitted changes)
git status

# Should show Step 2 completion commits
git log --oneline -5
```

### 2. **Backup Safety**
```bash
# Create backup branch before Spec-Kit installation
git checkout -b backup-pre-spec-kit-installation
git push -u origin backup-pre-spec-kit-installation
git checkout main
```

### 3. **Read Planning Document**
```bash
# Review complete installation plan
cat docs/spec-kit-planning.md
```

### 4. **Client Decision on Installation Method**
- Choose Option A, B, or C for installation approach
- Confirm multi-IDE support requirements (Claude Code + Cursor)
- Approve 60-75 minute timeline for installation

---

## EXECUTION SEQUENCE (When Ready)

### Step 1: Initialize TodoWrite
Create todos for all 4 sessions:
```
1. Session 1: Research & Preparation (Spec-Kit documentation review)
2. Session 2: Core Installation (commands, multi-IDE setup)
3. Session 3: Integration & Testing (workflow validation)
4. Session 4: Documentation & Validation (update docs, examples)
```

### Step 2: Begin Session 1 (Research & Preparation)
- Research Spec-Kit GitHub repository
- Review command structure and workflow
- Identify integration points
- Plan installation strategy
- **STOP for checkpoint** - confirm approach with client

### Step 3: Session 2 (Core Installation)
- Install Spec-Kit per chosen method (A/B/C)
- Create 5 Claude Code commands
- Configure Cursor integration
- Test basic functionality
- **Commit after session**

### Step 4: Session 3 (Integration & Testing)
- Test complete workflow end-to-end
- Verify multi-IDE compatibility
- Validate no conflicts with existing features
- **Commit after session**

### Step 5: Session 4 (Documentation & Validation)
- Update README with Spec-Kit section
- Update QUICKSTART with Spec-Kit usage
- Create example workflow
- Run final validation
- **Final commit and push**

---

## ROLLBACK PLAN (If Needed)

**If installation fails or causes issues**:

```bash
# Return to pre-installation state
git reset --hard backup-pre-spec-kit-installation
git push -f origin main

# Or remove Spec-Kit files manually
rm -rf tools/spec-kit  # If external clone
git submodule deinit tools/spec-kit  # If submodule
```

---

## CRITICAL REMINDERS

### DO NOT:
- ❌ Modify existing workspace features (BMAD, templates, scripts)
- ❌ Change existing documentation structure
- ❌ Create new project templates (workspace has 7 templates already)
- ❌ Modify existing Docker configurations
- ❌ Change git history or existing commits

### DO:
- ✅ Follow `docs/spec-kit-planning.md` exactly
- ✅ Create git commits after each session
- ✅ Use TodoWrite for progress tracking
- ✅ Stop and ask when uncertain (Law #1)
- ✅ Validate after each session
- ✅ Maintain backup branch throughout

---

## SUCCESS INDICATORS

**When Spec-Kit installation is complete, you should see**:

### Git Commits
```bash
git log --oneline -5
# Should show 4 new commits:
# - Session 1: Spec-Kit research and planning
# - Session 2: Core Spec-Kit installation
# - Session 3: Integration and testing
# - Session 4: Documentation and validation
```

### Workspace Health
```bash
npm run workspace:health
# Should still show 18/18 passing (no degradation)
```

### Spec-Kit Functionality
```bash
# Commands should be available
ls .claude/commands/spec-kit/
# Should show: constitution.md, specify.md, plan.md, tasks.md, implement.md
```

### Documentation Updated
- README.md has Spec-Kit section
- QUICKSTART.md explains Spec-Kit usage
- `docs/spec-kit-planning.md` marked as "INSTALLED"

---

## MY QUESTION FOR YOU (When You Begin)

**When you start the Spec-Kit installation session, you should**:

1. **Read the context files** I listed above
2. **Verify workspace state** (health check, git status)
3. **Create backup branch** (`backup-pre-spec-kit-installation`)
4. **Read** `docs/spec-kit-planning.md` for complete installation plan
5. **Initialize TodoWrite** with 4 session tasks
6. **Ask which installation method** I prefer (Option A/B/C)
7. **Begin Session 1** (Research & Preparation) systematically

---

## FINAL NOTES

**Current Status**:
- ✅ Workspace transformation Steps 1 & 2 complete
- ✅ All templates production-ready with Docker
- ✅ Documentation comprehensive and up-to-date
- ✅ Validation scripts passing (18/18)
- ✅ Spec-Kit planning blueprint ready

**Spec-Kit Status**:
- 🟡 **PLANNED** - Blueprint complete in `docs/spec-kit-planning.md`
- ⏸️ **NOT INSTALLED** - Ready to install when session begins
- 📋 **OPTIONAL** - Not blocking, can be done anytime

**This installation is an optional enhancement** - the workspace is already production-ready and fully functional without it.

---

**Ready to begin Spec-Kit installation when you are!** 🚀

---

## QUICK REFERENCE

**Key Files**:
- Installation Plan: `docs/spec-kit-planning.md`
- Step 1 Report: `Workspace transformation project/STEP-1-COMPLETION-REPORT.md`
- Docker Guide: `docs/DOCKER-GUIDE.md`
- Main README: `README.md`
- Quick Start: `QUICKSTART.md`

**Key Commands**:
```bash
npm run workspace:health        # Validate workspace (expect 18/18)
npm run templates:validate      # Validate templates
git log --oneline -10          # View recent commits
git status                     # Check for uncommitted changes
```

**Estimated Timeline**:
- Session 1: 15-20 minutes (research)
- Session 2: 20-25 minutes (installation)
- Session 3: 15-20 minutes (testing)
- Session 4: 10-15 minutes (documentation)
- **Total**: 60-75 minutes

**Success Metric**: Spec-Kit commands functional in Claude Code + Cursor with example workflow tested ✨

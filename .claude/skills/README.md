# Agent Skills Reference Guide

**Last Updated**: 2025-10-30
**Total Skills Installed**: 38 (35 installed + 3 custom)
**Marketplaces**: 3 (Anthropic example-skills, Anthropic document-skills, obra/superpowers)
**Custom Skills**: 3 (Phase 1 complete)

## 📋 Table of Contents

- [Overview](#overview)
- [How Skills Work](#how-skills-work)
- [Skills Inventory](#skills-inventory)
  - [**Custom Skills (3) - Phase 1**](#custom-skills-phase-1)
  - [Document Skills (4)](#document-skills)
  - [Development & Testing Skills (11)](#development--testing-skills)
  - [Superpowers: Testing & Quality (4)](#superpowers-testing--quality)
  - [Superpowers: Debugging (3)](#superpowers-debugging)
  - [Superpowers: Planning & Execution (3)](#superpowers-planning--execution)
  - [Superpowers: Collaboration (6)](#superpowers-collaboration)
  - [Superpowers: Meta Skills (4)](#superpowers-meta-skills)
- [Quick Reference Table](#quick-reference-table)
- [Installation & Verification](#installation--verification)
- [Protocol Alignment](#protocol-alignment)

---

## Overview

**Agent Skills** are model-invoked capabilities that Claude automatically activates based on task context. They provide specialized knowledge, workflows, and tools without requiring manual invocation.

**Key Characteristics**:
- ✅ **Auto-activating** - Claude detects when to use them
- ✅ **Context-aware** - Triggered by task requirements
- ✅ **Invisible** - Work in the background
- ✅ **Composable** - Multiple Skills can work together

---

## How Skills Work

### Automatic Activation

**You DON'T manually invoke Skills**. Instead, Claude detects context and activates them automatically.

**Example**:
```
❌ Wrong: "/pdf extract text from report.pdf"
✅ Right: "Extract text from report.pdf"
        → Claude auto-activates 'pdf' Skill
```

### Trigger Conditions

Each Skill has specific conditions that trigger activation:
- **Task type** (e.g., "debug this error" → `systematic-debugging`)
- **File type** (e.g., working with `.pdf` → `pdf` Skill)
- **Development phase** (e.g., implementing feature → `test-driven-development`)
- **Keywords** (e.g., "create a plan" → `writing-plans`)

---

## Skills Inventory

### Custom Skills (Phase 1)

**Source**: Workspace-specific custom Skills (`.claude/skills/`)
**Count**: 3 Skills
**Status**: ✅ Phase 1 Complete (tested and validated 2025-10-30)

---

#### ⚠️ `uncertainty-protocol-enforcer` - Law #1A Automation
**Description**: Real-time uncertainty detection with automatic STOP protocol triggering
**Location**: [`.claude/skills/uncertainty-protocol-enforcer/`](.claude/skills/uncertainty-protocol-enforcer/)
**Triggers**:
- Tentative language ("I think", "probably", "assuming", "maybe")
- Multiple viable approaches without clear choice
- Missing context or unclear requirements
- Ambiguous specifications

**Capabilities**:
- Detects uncertainty indicators in real-time
- Triggers MANDATORY STOP protocol
- Generates 3-5 targeted clarifying questions
- Prevents assumption-based actions
- Logs uncertainty patterns to memory

**Protocol Integration**: **Law #1A (Uncertainty Protocol)** - CRITICAL
**Example Usage**: Auto-activates when Claude detects uncertainty during any task
**Testing Results**: ✅ PASSED pressure test (time + economic + authority + exhaustion pressures)

**Files**:
- `SKILL.md` - Complete Skill instructions with auto-activation triggers
- `references/uncertainty-patterns.md` - Comprehensive uncertainty indicators
- `references/clarification-templates.md` - Question generation frameworks
- `scripts/log_uncertainty.py` - Logs to `/memories/protocol-compliance/uncertainty-log.xml`

---

#### 🎯 `specification-adherence-checker` - Law #1B Automation
**Description**: Prevents architectural drift by validating implementations against specifications BEFORE coding
**Location**: [`.claude/skills/specification-adherence-checker/`](.claude/skills/specification-adherence-checker/)
**Triggers**:
- Before any code implementation begins
- When modifying existing architecture
- During refactoring tasks
- When specifications are provided

**Capabilities**:
- 8-gate validation system (5 pre-implementation, 3 post-implementation)
- Detects "close enough" implementations
- Prevents shortcuts that violate architectural patterns
- Enforces exact specification compliance
- Validates against architecture patterns

**Protocol Integration**: **Law #1B (Specification Adherence)** - CRITICAL
**Example Usage**: Auto-activates before implementation to validate against requirements.md/design.md
**Testing Results**: ✅ PASSED pressure test (time + exhaustion + sunk cost + pride + pragmatic rationalization)

**Files**:
- `SKILL.md` - Pre-implementation validation protocol with 8 mandatory gates
- `references/drift-patterns.md` - Common drift indicators (language, architectural, interface)
- `references/validation-checkpoints.md` - 8-gate validation system
- `scripts/log_drift_prevention.py` - Logs to `/memories/protocol-compliance/drift-prevention-log.xml`

---

#### 💾 `session-recovery` - Law #6 Automation
**Description**: Perfect session continuity through memory integration, enabling unlimited session length
**Location**: [`.claude/skills/session-recovery/`](.claude/skills/session-recovery/)
**Triggers**:
- **MANDATORY**: First action at every session start
- After Anthropic API clears context (100K token threshold)
- When user says "continue where we left off"
- When referencing previous session work
- After session interruptions or crashes

**Capabilities**:
- Loads 4 critical memory files minimum
- Restores TodoWrite status across sessions
- Handles context editing integration (100K tokens)
- Enables cross-project context switching
- Never asks user to repeat previous information

**Protocol Integration**: **Law #6 (Cross-Session Memory & Learning)** - CRITICAL
**Example Usage**: Auto-activates at session start to restore complete context from `/memories/`
**Testing Results**: ✅ PASSED pressure test (time + assumption + social + rationalization pressures)

**Files**:
- `SKILL.md` - Complete session recovery protocol (8-step process)
- `references/memory-structure.md` - Complete `/memories/` directory architecture with XML schemas
- `scripts/recover_session.py` - Session recovery script (loads memory, prints summary)

---

### Document Skills

**Source**: Anthropic document-skills plugin
**Count**: 4 Skills

#### 📊 `xlsx` - Excel Spreadsheet Manipulation
**Description**: Complete spreadsheet toolkit for creating, editing, and analyzing Excel files
**Triggers**: Working with `.xlsx` files, spreadsheet requests, data analysis tasks
**Capabilities**:
- Create new spreadsheets with multiple sheets
- Edit existing Excel files
- Apply formulas and formatting
- Data analysis and visualization
- Cell styling and conditional formatting
**Protocol Integration**: None
**Example Usage**: "Create a spreadsheet tracking project milestones with formulas for completion percentage"

#### 📄 `docx` - Word Document Processing
**Description**: Document creation and editing with advanced formatting
**Triggers**: Working with `.docx` files, document creation/editing requests
**Capabilities**:
- Create and edit Word documents
- Track changes and comments
- Preserve complex formatting
- Table and image handling
- Document templating
**Protocol Integration**: None
**Example Usage**: "Create a technical specification document with table of contents and tracked changes"

#### 🎨 `pptx` - PowerPoint Presentation Creation
**Description**: Presentation creation and editing with layouts and speaker notes
**Triggers**: Working with `.pptx` files, presentation requests
**Capabilities**:
- Create presentations with custom layouts
- Edit existing presentations
- Add speaker notes and comments
- Slide formatting and theming
- Charts and diagrams
**Protocol Integration**: None
**Example Usage**: "Create a 10-slide presentation about our Q4 roadmap with speaker notes"

#### 📑 `pdf` - PDF Manipulation Toolkit
**Description**: Comprehensive PDF handling for extraction, creation, and modification
**Triggers**: Working with `.pdf` files, PDF processing requests
**Capabilities**:
- Extract text and tables from PDFs
- Create new PDFs from content
- Merge and split PDF files
- Fill PDF forms
- Basic PDF editing
**Protocol Integration**: None
**Example Usage**: "Extract all tables from this quarterly report PDF and convert to CSV"

---

### Development & Testing Skills

**Source**: Anthropic example-skills plugin
**Count**: 11 Skills

#### ⭐ `skill-creator` - Custom Skills Development Guide
**Description**: **CRITICAL SKILL** - Guides creation of new custom Skills following best practices
**Triggers**: Requests to create Skills, extend workspace capabilities
**Capabilities**:
- Skill design and planning
- TDD approach to Skill development
- Best practices enforcement
- Skill testing strategies
- Documentation generation
**Protocol Integration**: Enables custom protocol-enforcing Skills
**Example Usage**: "Help me create a custom Skill for uncertainty protocol enforcement"

#### 🔧 `mcp-builder` - MCP Server Development Guide
**Description**: Build high-quality Model Context Protocol servers
**Triggers**: MCP server creation, tool integration requests
**Capabilities**:
- FastMCP (Python) server creation
- MCP SDK (TypeScript/Node) development
- Best practices and patterns
- Testing and debugging
- Integration workflows
**Protocol Integration**: Law #3 (Tool Ecosystem)
**Example Usage**: "Help me build an MCP server for GitHub API integration"

#### 🧪 `webapp-testing` - Playwright Web Testing
**Description**: Test local web applications using Playwright
**Triggers**: Web testing requests, frontend verification needs
**Capabilities**:
- Browser automation for testing
- UI component verification
- Screenshot capture for debugging
- Console log analysis
- Cross-browser testing
**Protocol Integration**: Law #2 (TDD), Testing protocols
**Example Usage**: "Test the user registration flow on localhost:3000"

#### ⚛️ `artifacts-builder` - Multi-Component React Artifacts
**Description**: Create complex React artifacts with Tailwind CSS and shadcn/ui
**Triggers**: Building React components, creating UI artifacts
**Capabilities**:
- Multi-component React applications
- Tailwind CSS styling
- shadcn/ui integration
- State management setup
- Routing configuration
**Protocol Integration**: None
**Example Usage**: "Create a dashboard artifact with charts and data table components"

#### 🎨 `canvas-design` - Visual Art Creation
**Description**: Create beautiful visual art in PNG/PDF using design philosophy
**Triggers**: Visual design requests, poster/art creation
**Capabilities**:
- Poster and artwork generation
- Design philosophy principles
- PNG and PDF output
- Typography and layout
- Color theory application
**Protocol Integration**: None
**Example Usage**: "Design a conference poster for our developer event"

#### 🌈 `algorithmic-art` - Generative Art with p5.js
**Description**: Create generative/algorithmic art with seeded randomness
**Triggers**: Generative art requests, creative coding
**Capabilities**:
- p5.js-based art generation
- Seeded randomness for reproducibility
- Interactive parameters
- Animation support
- Export to various formats
**Protocol Integration**: None
**Example Usage**: "Create generative art using recursive patterns with seed 12345"

#### 📢 `internal-comms` - Internal Communications Writing
**Description**: Professional internal communications authoring
**Triggers**: Writing status reports, updates, newsletters
**Capabilities**:
- Status reports
- Leadership updates
- Team newsletters
- FAQs and documentation
- Incident reports
- Project updates
**Protocol Integration**: Law #5 (Senior Developer Leadership - reporting)
**Example Usage**: "Write a status report for the Q4 infrastructure migration"

#### 🎬 `slack-gif-creator` - Animated GIF Creation for Slack
**Description**: Create animated GIFs optimized for Slack's size constraints
**Triggers**: GIF creation for messaging, Slack media requests
**Capabilities**:
- Animated GIF generation
- Slack optimization (file size limits)
- Frame rate control
- Color optimization
- Text overlay support
**Protocol Integration**: None
**Example Usage**: "Create a celebration GIF for our Slack channel when deploys succeed"

#### 🎨 `theme-factory` - Artifact Styling System
**Description**: Style artifacts with 10 pre-set themes or custom themes
**Triggers**: Styling requests, theming artifacts
**Capabilities**:
- 10 pre-built themes
- Custom theme generation
- On-the-fly styling
- Consistent design systems
- Theme export/import
**Protocol Integration**: None
**Example Usage**: "Apply a dark professional theme to this React component"

#### 🏢 `brand-guidelines` - Anthropic Brand Application
**Description**: Apply Anthropic's official brand colors and typography
**Triggers**: Anthropic branding requests, official styling
**Capabilities**:
- Official color palette
- Typography standards
- Logo usage guidelines
- Brand consistency
- Marketing materials
**Protocol Integration**: None
**Example Usage**: "Style this presentation using Anthropic brand guidelines"

---

### Superpowers: Testing & Quality

**Source**: obra/superpowers plugin
**Count**: 4 Skills

#### 🧪 `test-driven-development` - TDD Workflow
**Description**: RED-GREEN-REFACTOR test-driven development cycle
**Triggers**: Feature implementation, code creation with "test" mentions
**Capabilities**:
- Write failing tests first
- Minimal code to pass tests
- Refactoring after green
- TDD best practices
- Test coverage guidance
**Protocol Integration**: **Law #2 (Protocol Adherence - TDD)**, **CLAUDE.md TDD protocol**
**Example Usage**: "Implement user authentication using TDD"

#### ⚠️ `testing-anti-patterns` - Testing Pitfalls Prevention
**Description**: Identify and prevent common testing mistakes
**Triggers**: Test review, test writing assistance
**Capabilities**:
- Anti-pattern detection
- Test smell identification
- Best practice guidance
- Refactoring suggestions
- Testing education
**Protocol Integration**: **Law #2 (Quality Standards)**, **Testing protocols**
**Example Usage**: "Review these integration tests for anti-patterns"

#### ⏱️ `condition-based-waiting` - Async Testing Patterns
**Description**: Replace timeouts with condition polling for reliable tests
**Triggers**: Async testing, timing-sensitive test scenarios
**Capabilities**:
- Condition-based waiting
- Timeout elimination
- Flaky test prevention
- Async patterns
- Retry strategies
**Protocol Integration**: **Testing protocols**, **Quality assurance**
**Example Usage**: "Fix these flaky tests that use setTimeout"

#### ✅ `verification-before-completion` - Completion Verification
**Description**: Ensure work is verified before claiming completion
**Triggers**: Task completion claims, "done" declarations
**Capabilities**:
- Completion criteria checking
- Verification checklists
- Evidence gathering
- Testing confirmation
- Documentation validation
**Protocol Integration**: **Law #1A (Uncertainty Protocol)**, **Law #4 (Verification gates)**
**Example Usage**: Auto-activates when Claude claims task completion

---

### Superpowers: Debugging

**Source**: obra/superpowers plugin
**Count**: 3 Skills

#### 🔍 `systematic-debugging` - Four-Phase Debugging Framework
**Description**: Structured debugging process for root cause identification
**Triggers**: Debugging requests, error investigation, bug reports
**Capabilities**:
- Phase 1: Reproduce the issue
- Phase 2: Isolate the component
- Phase 3: Trace root cause
- Phase 4: Verify fix
- Systematic approach
**Protocol Integration**: **Law #4 (Surgical Precision - Level 1-7 debugging)**, **Law #1A (Stop when uncertain)**
**Example Usage**: "Debug why the API returns 500 errors intermittently"

#### 🎯 `root-cause-tracing` - Backward Call Stack Analysis
**Description**: Trace bugs backward through execution to find true root cause
**Triggers**: Complex debugging, symptom vs cause analysis
**Capabilities**:
- Backward tracing
- Call stack analysis
- Root vs symptom identification
- Execution flow mapping
- Causal analysis
**Protocol Integration**: **Law #4 (Surgical Level escalation)**, **Debugging protocols**
**Example Usage**: "Trace the root cause of this data corruption issue"

#### 🛡️ `defense-in-depth` - Multi-Layer Validation
**Description**: Multiple validation layers to prevent invalid data propagation
**Triggers**: Security concerns, data validation needs
**Capabilities**:
- Multi-layer validation design
- Input sanitization
- Data integrity checks
- Error boundary patterns
- Security hardening
**Protocol Integration**: **Security-First Protocol**, **Law #1B (Specification adherence)**
**Example Usage**: "Add defense-in-depth validation to the payment processing flow"

---

### Superpowers: Planning & Execution

**Source**: obra/superpowers plugin
**Count**: 3 Skills (+ 3 slash commands)

#### 💡 `brainstorming` - Socratic Design Refinement
**Description**: Refine ideas through Socratic questioning before implementation
**Triggers**: Design discussions, `/superpowers:brainstorm` command
**Capabilities**:
- Socratic method questioning
- Design exploration
- Alternative evaluation
- Assumption challenging
- Iterative refinement
**Protocol Integration**: **Law #1A (Clarification before action)**, **Planning protocols**
**Slash Command**: `/superpowers:brainstorm`
**Example Usage**: "/superpowers:brainstorm or 'Help me brainstorm the architecture for user permissions'"

#### 📝 `writing-plans` - Detailed Implementation Planning
**Description**: Create comprehensive implementation plans with clear steps
**Triggers**: Planning requests, `/superpowers:write-plan` command
**Capabilities**:
- Step-by-step planning
- Dependency identification
- Risk assessment
- Effort estimation
- Success criteria definition
**Protocol Integration**: **Law #2 (Planning Protocol)**, **Task decomposition**
**Slash Command**: `/superpowers:write-plan`
**Example Usage**: "/superpowers:write-plan or 'Create an implementation plan for the reporting dashboard'"

#### ⚡ `executing-plans` - Controlled Batch Execution
**Description**: Execute implementation plans in controlled batches with checkpoints
**Triggers**: Plan execution, `/superpowers:execute-plan` command
**Capabilities**:
- Batch execution
- Checkpoint validation
- Progress tracking
- Error handling
- Rollback support
**Protocol Integration**: **Law #2 (Execution Protocol)**, **Law #4 (Surgical approach)**
**Slash Command**: `/superpowers:execute-plan`
**Example Usage**: "/superpowers:execute-plan or 'Execute the migration plan we created'"

---

### Superpowers: Collaboration

**Source**: obra/superpowers plugin
**Count**: 6 Skills

#### 🔀 `dispatching-parallel-agents` - Concurrent Investigation
**Description**: Investigate independent failures concurrently using subagents
**Triggers**: Multiple independent issues, parallel work needs
**Capabilities**:
- Parallel agent delegation
- Independent task distribution
- Concurrent execution
- Result aggregation
- Efficiency optimization
**Protocol Integration**: **Law #3 (Orchestrated Workspace Efficiency)**, **Agent coordination**
**Example Usage**: "Investigate these 5 test failures in parallel"

#### 👀 `requesting-code-review` - Pre-Review Checklist
**Description**: Review implementations against requirements before submission
**Triggers**: Code review preparation, completion of implementation
**Capabilities**:
- Requirements verification
- Self-review checklist
- Quality gates
- Documentation check
- Test coverage validation
**Protocol Integration**: **Law #2 (Quality Gates)**, **Law #5 (Quality Assurance)**
**Example Usage**: "Prepare this pull request for code review"

#### 💬 `receiving-code-review` - Feedback Handling
**Description**: Handle code review feedback with rigor and professionalism
**Triggers**: Code review feedback, improvement requests
**Capabilities**:
- Feedback analysis
- Systematic improvements
- Discussion facilitation
- Learning from review
- Follow-up tracking
**Protocol Integration**: **Law #5 (Professional Communication)**, **Quality improvement**
**Example Usage**: "Process this code review feedback and create action items"

#### 🚀 `subagent-driven-development` - Fresh Agent Per Task
**Description**: Execute plans with fresh subagents for each task with quality gates
**Triggers**: Complex workflows, multi-task execution
**Capabilities**:
- Fresh context per task
- Quality gate enforcement
- Task isolation
- Agent specialization
- Workflow orchestration
**Protocol Integration**: **Law #3 (Agent Team Leadership)**, **Law #2 (Quality Gates)**
**Example Usage**: "Execute this 10-task plan using subagent-driven development"

#### 🎯 `finishing-a-development-branch` - Branch Completion Workflow
**Description**: Guide branch completion with merge vs PR decision workflow
**Triggers**: Branch completion, merge preparation
**Capabilities**:
- Merge readiness assessment
- PR vs merge decision
- Completion checklist
- Branch cleanup
- Documentation updates
**Protocol Integration**: **Git protocols**, **Law #5 (Professional workflow)**
**Example Usage**: "Help me finish the feature/user-auth branch"

#### 🌳 `using-git-worktrees` - Isolated Development Branches
**Description**: Create and manage isolated git worktrees for parallel development
**Triggers**: Parallel branch work, worktree requests
**Capabilities**:
- Worktree creation
- Isolation management
- Parallel development
- Branch switching optimization
- Workspace organization
**Protocol Integration**: **Development workflows**, **Efficiency optimization**
**Example Usage**: "Set up a git worktree for the hotfix branch"

---

### Superpowers: Meta Skills

**Source**: obra/superpowers plugin
**Count**: 4 Skills

#### 📚 `writing-skills` - Skill Creation with TDD
**Description**: Create new Skills following best practices and TDD approach
**Triggers**: Skill creation requests, extending workspace
**Capabilities**:
- Skill design patterns
- TDD for Skills
- Best practices
- Documentation templates
- Quality standards
**Protocol Integration**: **Meta-capability for protocol enforcement**, **Law #2 (TDD)**
**Example Usage**: "Help me create a new Skill for technical debt evaluation"
**Note**: Complements `skill-creator` from Anthropic

#### 🧪 `testing-skills-with-subagents` - Skill Quality Validation
**Description**: Verify Skills work correctly under pressure using subagents
**Triggers**: Skill testing, quality validation
**Capabilities**:
- Subagent-based testing
- Stress testing
- Edge case validation
- Quality assurance
- Performance verification
**Protocol Integration**: **Quality assurance**, **Skill development**
**Example Usage**: "Test the uncertainty-protocol-enforcer Skill with subagents"

#### 🔄 `sharing-skills` - Upstream Contribution
**Description**: Contribute Skills back to community via PR workflow
**Triggers**: Skill sharing, open source contribution
**Capabilities**:
- PR preparation
- Documentation standards
- Community guidelines
- Testing validation
- Contribution workflow
**Protocol Integration**: **Open source collaboration**, **Professional standards**
**Example Usage**: "Help me contribute this custom Skill to the superpowers repository"

#### 📖 `using-superpowers` - Mandatory Workflow System
**Description**: Establishes mandatory workflows when Skills exist for tasks
**Triggers**: SessionStart hook (automatic), workflow guidance needs
**Capabilities**:
- Workflow enforcement
- Skill discovery
- Best practice guidance
- Process consistency
- Skill-first approach
**Protocol Integration**: **All Laws - establishes Skills as primary approach**
**Example Usage**: Auto-loaded at session start
**Note**: Makes using relevant Skills mandatory when available

---

## Quick Reference Table

| Skill Name | Category | Auto-Activates When | CLAUDE.md Integration |
|------------|----------|---------------------|----------------------|
| **`uncertainty-protocol-enforcer`** ⭐ | **Custom** | **Tentative language, multiple approaches** | **Law #1A (CRITICAL)** |
| **`specification-adherence-checker`** ⭐ | **Custom** | **Before implementation, refactoring** | **Law #1B (CRITICAL)** |
| **`session-recovery`** ⭐ | **Custom** | **Session start (MANDATORY)** | **Law #6 (CRITICAL)** |
| `xlsx` | Document | Excel file work | None |
| `docx` | Document | Word document work | None |
| `pptx` | Document | PowerPoint work | None |
| `pdf` | Document | PDF processing | None |
| `skill-creator` ⭐ | Development | Creating Skills | Enables custom Skills |
| `mcp-builder` | Development | Building MCP servers | Law #3 (Tools) |
| `webapp-testing` | Development | Web testing | Law #2 (TDD) |
| `artifacts-builder` | Development | React components | None |
| `canvas-design` | Development | Visual design | None |
| `algorithmic-art` | Development | Generative art | None |
| `internal-comms` | Development | Writing reports | Law #5 (Reporting) |
| `slack-gif-creator` | Development | GIF creation | None |
| `theme-factory` | Development | Artifact styling | None |
| `brand-guidelines` | Development | Branding | None |
| `test-driven-development` | Testing | Feature implementation | **Law #2 (TDD)** |
| `testing-anti-patterns` | Testing | Test review | **Law #2 (Quality)** |
| `condition-based-waiting` | Testing | Async tests | Testing protocols |
| `verification-before-completion` | Testing | Task completion | **Law #1A, Law #4** |
| `systematic-debugging` | Debugging | Debugging requests | **Law #4 (Surgical)** |
| `root-cause-tracing` | Debugging | Complex bugs | **Law #4 (Levels)** |
| `defense-in-depth` | Debugging | Security/validation | **Security-First** |
| `brainstorming` | Planning | Design discussions | **Law #1A (Clarity)** |
| `writing-plans` | Planning | Creating plans | **Law #2 (Planning)** |
| `executing-plans` | Planning | Plan execution | **Law #2, Law #4** |
| `dispatching-parallel-agents` | Collaboration | Parallel work | **Law #3 (Orchestration)** |
| `requesting-code-review` | Collaboration | Review prep | **Law #2, Law #5** |
| `receiving-code-review` | Collaboration | Review feedback | **Law #5 (Professional)** |
| `subagent-driven-development` | Collaboration | Complex workflows | **Law #3 (Agents)** |
| `finishing-a-development-branch` | Collaboration | Branch completion | Git protocols |
| `using-git-worktrees` | Collaboration | Parallel branches | Workflows |
| `writing-skills` | Meta | Skill creation | Meta-capability |
| `testing-skills-with-subagents` | Meta | Skill testing | Quality assurance |
| `sharing-skills` | Meta | Skill contribution | Open source |
| `using-superpowers` | Meta | Session start | **All Laws** |

---

## Installation & Verification

### Installation Status

✅ **INSTALLED** - All 35 Skills active as of 2025-10-29

### Installed Marketplaces

```bash
# Anthropic Skills
/plugin marketplace add anthropics/skills
/plugin install example-skills@anthropic-agent-skills
/plugin install document-skills@anthropic-agent-skills

# Superpowers
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### Verification

**Check installed Skills:**
```
What Skills are available?
```

**Expected output**: List of all 35 Skills organized by category

**Test auto-activation:**
- Try: "Extract text from a PDF file"
- Expected: `pdf` Skill auto-activates
- Try: "Help me implement this feature using TDD"
- Expected: `test-driven-development` Skill auto-activates

---

## Protocol Alignment

### CLAUDE.md Law Integration

**Law #1A (Uncertainty Protocol)**:
- **`uncertainty-protocol-enforcer`** ⭐ **[CUSTOM]** - Real-time uncertainty detection (AUTOMATED)
- `verification-before-completion` - Prevents premature claims
- `systematic-debugging` - Structured problem-solving
- `brainstorming` - Clarification before implementation

**Law #1B (Specification Adherence)**:
- **`specification-adherence-checker`** ⭐ **[CUSTOM]** - Architectural drift prevention (AUTOMATED)
- `defense-in-depth` - Data validation integrity
- `verification-before-completion` - Requirements checking

**Law #2 (Protocol Adherence)**:
- `test-driven-development` - TDD protocol enforcement
- `testing-anti-patterns` - Quality standards
- `writing-plans` - Planning protocol
- `executing-plans` - Execution protocol

**Law #3 (Orchestrated Workspace Efficiency)**:
- `dispatching-parallel-agents` - Agent orchestration
- `subagent-driven-development` - Multi-agent workflows
- `mcp-builder` - Tool ecosystem integration

**Law #4 (Surgical Precision & Minimalist Efficiency)**:
- `systematic-debugging` - Level 1-7 escalation hierarchy
- `root-cause-tracing` - Minimalist problem-solving
- `verification-before-completion` - Efficiency validation

**Law #5 (Senior Developer Leadership)**:
- `internal-comms` - Professional reporting
- `requesting-code-review` - Quality leadership
- `receiving-code-review` - Professional communication

**Law #6 (Cross-Session Memory & Learning)**:
- **`session-recovery`** ⭐ **[CUSTOM]** - Perfect session continuity (AUTOMATED)

### Protocol Coverage Status

**✅ AUTOMATED (Phase 1 Complete - 2025-10-30)**:
1. ✅ **Law #1A: Uncertainty Protocol** - `uncertainty-protocol-enforcer` (CRITICAL)
2. ✅ **Law #1B: Specification Adherence** - `specification-adherence-checker` (CRITICAL)
3. ✅ **Law #6: Memory & Learning** - `session-recovery` (CRITICAL)

**⏳ PENDING (Phase 2 - Planned)**:
4. ⏳ **Knowledge Capture** - Automated learning accumulation
5. ⏳ **Surgical Precision Guide** - Law #4 minimalist approach automation
6. ⏳ **Security-First Analyzer** - Automated security protocol enforcement

**⏳ PENDING (Phase 3 - Planned)**:
7. ⏳ **Technical Debt Evaluator** - Systematic debt assessment

**✅ WELL-COVERED (Existing Skills)**:
- ✅ **Law #2: Protocol Adherence** - TDD, planning, execution Skills
- ✅ **Law #3: Orchestration** - Parallel agents, subagent-driven development
- ✅ **Law #5: Senior Developer Leadership** - Code review, internal comms

See [projects/custom-skills-development.md](../../projects/custom-skills-development.md) for complete custom Skills roadmap.

---

## Additional Resources

- **CLAUDE.md** (lines 802-903): Skills integration documentation
- **docs/agent-skills-reference.md**: Comprehensive Skills guide
- **projects/skills-integration-project.md**: Installation project documentation
- **projects/custom-skills-development.md**: Custom Skills development plan
- **Anthropic Skills**: https://github.com/anthropics/skills
- **Superpowers**: https://github.com/obra/superpowers

---

**Last Verified**: 2025-10-30
**Skills Working**: Claude Code CLI + Cursor IDE
**Status**: ✅ All 38 Skills operational (35 installed + 3 custom Phase 1)

---

## Phase 1 Custom Skills Testing Results

**Testing Method**: RED-GREEN-REFACTOR pressure testing with `testing-skills-with-subagents` Skill

### `uncertainty-protocol-enforcer` Testing
**Pressure Test**: Authentication feature with 90-min deadline, 5 hours sunk cost, manager expectations
**Pressures Applied**: ⏰ Time + 💰 Economic + 👔 Authority + 😫 Exhaustion + 📊 Sunk Cost + 🤔 Ambiguity
**Result**: ✅ **PASSED** - Correctly detected tentative language, triggered STOP protocol, generated clarifying questions
**Key Success**: Prevented proceeding with "probably correct" assumptions despite overwhelming pressure

### `specification-adherence-checker` Testing
**Pressure Test**: 6-hour implementation with "better" technical approach deviating from specs
**Pressures Applied**: ⏰ Time + 😫 Exhaustion + 💰 Sunk Cost + 🏆 Pride + 🤔 Rationalization + 👔 Pragmatic
**Result**: ✅ **PASSED** - Identified all 7 spec deviations, halted code review, requested client authorization
**Key Success**: Prevented architectural drift despite "better engineering" rationalizations

### `session-recovery` Testing
**Pressure Test**: Session start with "continue from yesterday" request
**Pressures Applied**: ⏰ Time + 🤔 Assumption + 😫 Social + 💭 Memory + 🎯 Goal-Oriented + 📋 Rationalization
**Result**: ✅ **PASSED** - Executed mandatory memory check FIRST, loaded context, restored TodoWrite state
**Key Success**: Prevented asking user to repeat information by checking memory files first

**Overall Phase 1 Testing**: ✅ **ALL 3 SKILLS PASSED** under maximum pressure

# Spec-Kit Integration Guide

**Status**: ✅ **INSTALLED AND OPERATIONAL**
**Version**: v0.0.20
**Installation Date**: 2025-10-18
**Platform**: Windows (with Unicode compatibility patches)

---

## Overview

GitHub Spec-Kit is a formal specification-driven development toolkit integrated into this workspace. It provides structured workflows for projects requiring detailed documentation, regulatory compliance, or fixed-bid contracts.

### What is Spec-Kit?

Spec-Kit is GitHub's official toolkit for spec-driven development, offering:
- **Constitution-based governance** - Define project principles and standards
- **Structured specifications** - Formal feature documentation with user stories
- **Technical planning** - Detailed implementation plans with architecture
- **Task decomposition** - Actionable task breakdown with dependencies
- **Quality assurance** - Cross-artifact consistency analysis and checklists

### When to Use Spec-Kit

**Use Spec-Kit for:**
- Client projects requiring formal documentation
- Regulatory/compliance-driven development
- Fixed-bid contracts with detailed specifications
- Projects with multiple stakeholder approvals
- When comprehensive upfront design is required

**Use BMAD agents instead for:**
- Rapid prototyping and iterative development
- Internal tools and MVPs
- Agile sprints with evolving requirements
- When speed and flexibility are priorities

---

## Installation Details

### Components Installed

**Spec-Kit CLI**:
- **Version**: v0.0.20
- **Location**: `C:\Users\edelz\AppData\Roaming\uv\tools\specify-cli\`
- **Executable**: `specify` command in PATH
- **Installation Method**: `uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`

**Workspace Structure**:
```
.specify/                          # Spec-Kit workspace
├── memory/
│   └── constitution.md           # Project governance (editable template)
├── scripts/
│   └── powershell/               # Windows PowerShell automation scripts
│       ├── check-prerequisites.ps1
│       ├── common.ps1
│       ├── create-new-feature.ps1
│       ├── setup-plan.ps1
│       └── update-agent-context.ps1
└── templates/
    ├── agent-file-template.md    # Agent context template
    ├── checklist-template.md     # Quality checklist template
    ├── plan-template.md          # Implementation plan template
    ├── spec-template.md          # Feature specification template
    └── tasks-template.md         # Task breakdown template
```

**Claude Code Commands**:
```
.claude/commands/
├── speckit.analyze.md        # Cross-artifact consistency analysis
├── speckit.checklist.md      # Quality validation checklists
├── speckit.clarify.md        # Structured question prompts
├── speckit.constitution.md   # Project governance creation
├── speckit.implement.md      # Implementation execution
├── speckit.plan.md           # Technical planning
├── speckit.specify.md        # Feature specification
└── speckit.tasks.md          # Task breakdown
```

### Windows Compatibility Patches

**Applied to**: `C:\Users\edelz\AppData\Roaming\uv\tools\specify-cli\Lib\site-packages\specify_cli\__init__.py`

Three patches were applied for Windows cp1252 encoding compatibility:

1. **BANNER patch** (lines 153-159): Unicode box-drawing → ASCII art
2. **StepTracker symbols** (lines 218-227): Unicode bullets → ASCII symbols
3. **Selection UI** (lines 295, 300): Unicode arrows → ASCII arrows

**Important**: These patches are **unofficial modifications** and must be **re-applied** after any `uv tool upgrade specify-cli` command.

---

## Available Commands

### Core Workflow (Use in Sequence)

#### 1. `/speckit.constitution` - Establish Project Governance
**Purpose**: Define project principles, standards, and governance rules
**Input**: Natural language description of project principles
**Output**: `.specify/memory/constitution.md` with versioned governance

**Example**:
```
/speckit.constitution Create constitution with principles: Code Quality, Security First, User Experience
```

**When to use**: At project start, before any feature specifications

---

#### 2. `/speckit.specify` - Create Feature Specification
**Purpose**: Create formal feature specification with user stories
**Input**: Feature description in natural language
**Output**: `specs/[###-feature-name]/spec.md` with prioritized user stories

**Example**:
```
/speckit.specify Add user authentication with email/password and OAuth social login
```

**When to use**: For each new feature requiring formal documentation

---

#### 3. `/speckit.plan` - Generate Technical Plan
**Purpose**: Create detailed implementation plan with architecture
**Input**: Existing feature specification
**Output**: `specs/[###-feature-name]/plan.md` with technical design

**Includes**:
- Technical context (language, dependencies, platform)
- Constitution compliance check
- Project structure
- Architecture diagrams
- Security considerations
- Performance requirements

**When to use**: After specification is approved, before implementation

---

#### 4. `/speckit.tasks` - Break Down Into Tasks
**Purpose**: Generate actionable task list with dependencies
**Input**: Implementation plan and specification
**Output**: `specs/[###-feature-name]/tasks.md` with ordered tasks

**Task Format**: `[ID] [P?] [Story] Description`
- `[P]`: Parallelizable (different files, no dependencies)
- `[Story]`: User story reference (US1, US2, etc.)
- Includes exact file paths

**When to use**: After technical plan is complete, before implementation

---

#### 5. `/speckit.implement` - Execute Implementation
**Purpose**: Execute implementation following specifications
**Input**: Tasks list and all planning artifacts
**Output**: Implemented code matching specifications

**When to use**: Final step, executes tasks in dependency order

---

### Enhancement Commands (Optional)

#### `/speckit.clarify` - De-Risk Ambiguous Areas
**Purpose**: Ask structured questions to clarify uncertain specification areas
**When to use**: Before `/speckit.plan` if specifications have ambiguities

---

#### `/speckit.analyze` - Consistency Analysis
**Purpose**: Cross-artifact consistency and quality report
**When to use**: After `/speckit.tasks`, before `/speckit.implement`

**Checks**:
- Constitution compliance across all artifacts
- Specification-to-plan consistency
- Plan-to-tasks consistency
- Missing requirements or gaps

---

#### `/speckit.checklist` - Quality Validation
**Purpose**: Generate quality validation checklist for feature
**When to use**: After `/speckit.plan` for quality gates

---

## Complete Workflow Example

### Scenario: Add User Authentication Feature

```bash
# Step 1: Establish project governance (if not done)
/speckit.constitution Create constitution with principles: Security First, Code Quality, User Privacy

# Step 2: Create feature specification
/speckit.specify Add user authentication with email/password login, OAuth (Google/GitHub),
password reset, email verification, and session management. Must comply with GDPR.

# Step 3: (Optional) Clarify ambiguities
/speckit.clarify  # Will ask targeted questions about OAuth scope, session duration, etc.

# Step 4: Generate technical plan
/speckit.plan  # Creates detailed implementation plan with security architecture

# Step 5: (Optional) Generate quality checklist
/speckit.checklist  # Creates security, performance, and compliance checklists

# Step 6: Break down into tasks
/speckit.tasks  # Generates ordered task list organized by user story

# Step 7: (Optional) Validate consistency
/speckit.analyze  # Cross-checks all artifacts for consistency

# Step 8: Execute implementation
/speckit.implement  # Implements feature following specifications
```

---

## Workspace Integration

### Integration with BMAD Agents

Spec-Kit and BMAD agents can work together:

**Strategic Phase** (BMAD):
```bash
/analyst    # Market research
/pm         # Product requirements
/architect  # High-level architecture
```

**Specification Phase** (Spec-Kit):
```bash
/speckit.constitution  # Project governance
/speckit.specify       # Formal specifications
/speckit.plan          # Technical design
```

**Implementation Phase** (Custom Agents):
```bash
# After /speckit.tasks, use specialized agents:
frontend-developer    # UI implementation
backend-developer     # API implementation
security-specialist   # Security review
```

**Quality Phase** (Both):
```bash
/speckit.analyze              # Spec compliance
quality-assurance-specialist  # Code review
spec-tester                   # Testing validation
```

### Integration with Memory System

Spec-Kit artifacts are tracked in the memory system under:
```
/memories/project-knowledge/{project}/
├── spec-kit-artifacts.xml    # Specification tracking
├── constitution-versions.xml  # Governance history
└── implementation-status.xml  # Progress tracking
```

---

## Command Reference

### Command Naming Convention

Commands use `/speckit.` prefix (not `/constitution` alone):

✅ **Correct**: `/speckit.constitution`
❌ **Wrong**: `/constitution`

This is the native Spec-Kit naming as designed by GitHub.

### Command Parameters

Most commands accept natural language input:
```bash
/speckit.specify <feature description>
/speckit.constitution <principles description>
```

### Output Locations

| Command | Output Location |
|---------|----------------|
| `/speckit.constitution` | `.specify/memory/constitution.md` |
| `/speckit.specify` | `specs/[###-feature-name]/spec.md` |
| `/speckit.plan` | `specs/[###-feature-name]/plan.md` |
| `/speckit.tasks` | `specs/[###-feature-name]/tasks.md` |
| `/speckit.clarify` | Inline questions (no file output) |
| `/speckit.analyze` | Inline report (no file output) |
| `/speckit.checklist` | Inline checklist (no file output) |
| `/speckit.implement` | Source code files per tasks.md |

---

## Best Practices

### When Starting a New Project

1. **Define Constitution First** - Establish governance before features
2. **Start Small** - Begin with one feature to validate workflow
3. **Iterate on Specs** - Use `/speckit.clarify` liberally to de-risk
4. **Review Before Implementation** - Use `/speckit.analyze` as quality gate
5. **Track Changes** - Version constitution and specifications in Git

### Constitution Management

- **Semantic Versioning**: MAJOR.MINOR.PATCH
  - MAJOR: Breaking governance changes
  - MINOR: New principles added
  - PATCH: Clarifications and wording
- **Amendment Process**: Document rationale in Sync Impact Report
- **Team Approval**: Require consensus for MAJOR changes

### Specification Quality

- **Prioritize User Stories**: P1 (critical) → P2 (important) → P3 (nice-to-have)
- **Independent Testability**: Each story should be MVP-viable alone
- **Clear Acceptance Criteria**: Given-When-Then format
- **Measurable Outcomes**: Specific, testable requirements

### Task Organization

- **Dependency Ordering**: Tasks ordered by prerequisites
- **Parallelization**: Mark `[P]` for parallel-safe tasks
- **File Paths**: Include exact file paths in descriptions
- **Story Grouping**: Organize by user story for incremental delivery

---

## Troubleshooting

### Commands Not Visible

**Problem**: Spec-Kit commands don't appear in Claude Code palette

**Solution**:
1. Verify command files: `ls -la .claude/commands/speckit.*.md`
2. Restart Claude Code
3. Check file permissions on command files

---

### Unicode Encoding Errors

**Problem**: `UnicodeEncodeError: 'charmap' codec can't encode character`

**Solution**: Windows patches not applied
1. Locate: `C:\Users\edelz\AppData\Roaming\uv\tools\specify-cli\Lib\site-packages\specify_cli\__init__.py`
2. Apply three patches per Session 2 installation guide
3. Re-run command

---

### Template Not Found

**Problem**: Command can't find `.specify/templates/` files

**Solution**:
1. Verify structure: `ls -la .specify/templates/`
2. Re-initialize if needed: `specify init --here --ai claude --script ps --force`
3. Check file permissions

---

### Constitution Sync Errors

**Problem**: Constitution changes don't propagate to dependent templates

**Solution**:
1. Review Sync Impact Report in constitution file
2. Manually update flagged templates
3. Use `/speckit.analyze` to verify consistency

---

## Maintenance

### Upgrading Spec-Kit

**Warning**: Upgrading requires **re-applying Windows patches**

```bash
# 1. Backup current constitution
cp .specify/memory/constitution.md .specify/memory/constitution.md.backup

# 2. Upgrade CLI
uv tool upgrade specify-cli

# 3. Re-apply Windows patches (see Session 2 guide)
#    - Edit C:\Users\edelz\AppData\Roaming\uv\tools\specify-cli\Lib\site-packages\specify_cli\__init__.py
#    - Apply BANNER, StepTracker, and Selection UI patches

# 4. Verify installation
specify --help
```

### Workspace Cleanup

Periodically archive completed specifications:

```bash
# Archive completed features
mkdir -p archive/specs/
mv specs/001-completed-feature archive/specs/

# Preserve constitution versions in Git
git log --all -p .specify/memory/constitution.md
```

---

## Resources

### Official Documentation

- **Spec-Kit Repository**: https://github.com/github/spec-kit
- **Installation Guide**: Session 2 completion report in workspace transformation project

### Workspace Documentation

- **README.md**: Complete workspace overview
- **QUICKSTART.md**: 5-minute quick start with Spec-Kit section
- **CLAUDE.md**: AI protocols with Spec-Kit integration

### Support

For issues or questions:
1. Check troubleshooting section above
2. Review Session 2 and Session 3 completion reports
3. Consult `.specify/templates/` for workflow examples
4. Refer to GitHub Spec-Kit repository issues

---

## Installation History

### Session 1: Research & Preparation (Complete)
- Spec-Kit repository analyzed
- Integration approach selected: Native CLI
- Windows compatibility issues identified
- Installation strategy approved

### Session 2: Core Installation (Complete)
- Spec-Kit CLI v0.0.20 installed via `uv tool`
- 3 Windows Unicode patches applied
- Workspace initialized with `.specify/` structure
- 8 commands registered in `.claude/commands/`
- Git commit: `6e5a99d`

### Session 3: Integration Testing (Complete)
- All 8 commands verified accessible
- `/speckit.constitution` tested successfully
- Test constitution v1.0.0 created
- File integration validated
- Git commit: `ec0149d`

### Session 4: Documentation (Complete)
- README.md updated with Spec-Kit section
- QUICKSTART.md updated with usage guide
- CLAUDE.md updated with workflow integration
- This planning document created
- Final workspace validation complete

---

**Last Updated**: 2025-10-18
**Installation Status**: ✅ Complete and Operational
**Next Steps**: Start using Spec-Kit for formal specification projects

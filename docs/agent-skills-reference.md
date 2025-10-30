# Agent Skills Reference

> Complete documentation on creating, managing, and sharing Skills to extend Claude's capabilities

**Source:** Anthropic Agent Skills Documentation (2025)

## Table of Contents

1. [What are Agent Skills?](#what-are-agent-skills)
2. [Skill Types](#skill-types)
3. [Creating Skills](#creating-skills)
4. [SKILL.md Structure](#skillmd-structure)
5. [Tool Access Control](#tool-access-control)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)
8. [Integration with Our Workspace](#integration-with-our-workspace)

## What are Agent Skills?

Agent Skills package expertise into discoverable capabilities that extend Claude's functionality through organized folders containing instructions, scripts, and resources.

**Key Characteristics:**
- **Model-Invoked**: Claude autonomously decides when to use them based on request context and Skill description
- **Different from Slash Commands**: Slash commands are user-invoked (explicit `/command`), Skills are automatic
- **Modular**: Each Skill is self-contained with instructions and optional supporting files
- **Discoverable**: Claude finds relevant Skills through description matching

**Benefits:**
- Extend Claude's capabilities for specific workflows
- Share expertise across teams via git
- Reduce repetitive prompting
- Compose multiple Skills for complex tasks

## Skill Types

### Personal Skills
**Location:** `~/.claude/skills/`

**Use For:**
- Individual workflows and preferences
- Experimental Skills in development
- Personal productivity tools

**Availability:** Only available to you across all projects

### Project Skills
**Location:** `.claude/skills/` (within project)

**Use For:**
- Team workflows and conventions
- Project-specific expertise
- Shared utilities and scripts

**Availability:** Shared with team via git, automatically available to all team members

### Plugin Skills
**Location:** Bundled with Claude Code plugins

**Use For:**
- Reusable Skills distributed via plugin marketplace
- Cross-project capabilities
- Third-party integrations

**Availability:** Automatic when plugin is installed

## Creating Skills

### Directory Structure

**Simple Skill:**
```
my-skill/
└── SKILL.md (required)
```

**Complex Skill:**
```
my-skill/
├── SKILL.md (required)
├── reference.md (optional documentation)
├── examples.md (optional examples)
├── scripts/
│   └── helper.py (optional utility)
└── templates/
    └── template.txt (optional template)
```

### Creation Commands

**Personal Skill:**
```bash
mkdir -p ~/.claude/skills/my-skill-name
```

**Project Skill:**
```bash
mkdir -p .claude/skills/my-skill-name
```

## SKILL.md Structure

### Frontmatter (YAML)

```yaml
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
allowed-tools: Read, Grep, Glob  # Optional: restrict tool access
---
```

**Field Requirements:**

| Field | Rules | Purpose |
|-------|-------|---------|
| `name` | Lowercase letters, numbers, hyphens only (max 64 chars) | Unique identifier |
| `description` | Max 1024 characters | Discovery trigger - include WHAT it does and WHEN to use it |
| `allowed-tools` | Optional, comma-separated tool names | Restrict Claude's tool access during Skill execution |

### Content (Markdown)

```markdown
# Your Skill Name

## Instructions
Provide clear, step-by-step guidance for Claude.

## Examples
Show concrete examples of using this Skill.

## Requirements
List any dependencies or prerequisites.

## Best Practices
Share tips and common patterns.
```

### Progressive Disclosure

Reference supporting files that Claude loads only when needed:

````markdown
For advanced usage, see [reference.md](reference.md).

Run the helper script:
```bash
python scripts/helper.py input.txt
```
````

## Tool Access Control

### allowed-tools Field

Restrict Claude's tool usage when Skill is active:

```yaml
---
name: safe-file-reader
description: Read files without making changes. Use when you need read-only file access.
allowed-tools: Read, Grep, Glob
---
```

**Benefits:**
- Read-only Skills that shouldn't modify files
- Limited-scope Skills (e.g., only data analysis)
- Security-sensitive workflows

**Behavior:**
- **With `allowed-tools`**: Claude can only use specified tools without permission
- **Without `allowed-tools`**: Claude asks for permission as normal

**Note:** Only supported in Claude Code, not other Claude products

## Best Practices

### 1. Keep Skills Focused

**Good (Focused):**
- "PDF form filling"
- "Excel data analysis"
- "Git commit messages"

**Bad (Too Broad):**
- "Document processing" → Split into separate Skills
- "Data tools" → Split by data type or operation

### 2. Write Clear Descriptions

Include both WHAT and WHEN:

**Clear:**
```yaml
description: Analyze Excel spreadsheets, create pivot tables, and generate charts. Use when working with Excel files, spreadsheets, or analyzing tabular data in .xlsx format.
```

**Vague:**
```yaml
description: For files  # Too generic for discovery
```

**Description Best Practices:**
- Include specific trigger words users would mention
- List file types and formats
- Describe typical use cases
- Mention key operations

### 3. Use Progressive Disclosure

Don't overload SKILL.md with everything:

**SKILL.md (Quick Start):**
```markdown
# PDF Processing

## Quick start
Extract text:
```python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For form filling, see [FORMS.md](FORMS.md).
For API reference, see [REFERENCE.md](REFERENCE.md).
```

**Supporting Files:**
- `FORMS.md` - Detailed form filling guide
- `REFERENCE.md` - Complete API documentation
- `examples.md` - Advanced examples

### 4. Document Dependencies

List required packages in description and content:

```yaml
---
name: pdf-processing
description: Extract text, fill forms, merge PDFs. Use when working with PDF files. Requires pypdf and pdfplumber packages.
---

# PDF Processing

## Requirements

Packages must be installed in your environment:
```bash
pip install pypdf pdfplumber
```
```

**Note:** Packages must be pre-installed; Claude will automatically install or ask permission when needed

### 5. Test with Team

Have teammates test Skills:
- Does Skill activate when expected?
- Are instructions clear?
- Missing examples or edge cases?

### 6. Version Documentation

Track changes in SKILL.md content:

```markdown
# My Skill

## Version History
- v2.0.0 (2025-10-01): Breaking changes to API
- v1.1.0 (2025-09-15): Added new features
- v1.0.0 (2025-09-01): Initial release
```

## Troubleshooting

### Claude Doesn't Use Skill

**Issue:** Skill doesn't activate for relevant questions

**Check Description Specificity:**

Bad:
```yaml
description: Helps with data  # Too vague
```

Good:
```yaml
description: Analyze sales data in Excel files and CRM exports. Use for sales reports, pipeline analysis, and revenue tracking.
```

**Check YAML Validity:**
```bash
# View frontmatter
cat .claude/skills/my-skill/SKILL.md | head -n 15

# Common issues:
# - Missing opening or closing ---
# - Tabs instead of spaces
# - Unquoted strings with special characters
```

**Check File Location:**
```bash
# Personal Skills
ls ~/.claude/skills/*/SKILL.md

# Project Skills
ls .claude/skills/*/SKILL.md
```

**Enable Debug Mode:**
```bash
claude --debug  # View Skill loading errors
```

### Skill Has Errors

**Issue:** Skill loads but doesn't work correctly

**Check Script Permissions:**
```bash
chmod +x .claude/skills/my-skill/scripts/*.py
```

**Check File Paths:**
- Use forward slashes (Unix style): `scripts/helper.py`
- Avoid backslashes (Windows style): `scripts\helper.py`

**Check Dependencies:**
Claude will automatically install or ask permission for required packages

### Multiple Skills Conflict

**Issue:** Claude uses wrong Skill or seems confused

**Make Descriptions Distinct:**

Instead of:
```yaml
# Skill 1
description: For data analysis

# Skill 2
description: For analyzing data
```

Use:
```yaml
# Skill 1
description: Analyze sales data in Excel files and CRM exports. Use for sales reports, pipeline analysis, and revenue tracking.

# Skill 2
description: Analyze log files and system metrics data. Use for performance monitoring, debugging, and system diagnostics.
```

## Managing Skills

### View Available Skills

**Ask Claude:**
```
What Skills are available?
```

or

```
List all available Skills
```

**Check Filesystem:**
```bash
# List personal Skills
ls ~/.claude/skills/

# List project Skills
ls .claude/skills/

# View specific Skill
cat ~/.claude/skills/my-skill/SKILL.md
```

### Update Skill

Edit SKILL.md directly:
```bash
# Personal
code ~/.claude/skills/my-skill/SKILL.md

# Project
code .claude/skills/my-skill/SKILL.md
```

**Note:** Changes take effect next Claude Code restart

### Remove Skill

Delete Skill directory:
```bash
# Personal
rm -rf ~/.claude/skills/my-skill

# Project
rm -rf .claude/skills/my-skill
git commit -m "Remove unused Skill"
```

### Share Skills with Team

**Recommended: Via Plugin**
1. Create plugin with Skills in `skills/` directory
2. Add plugin to marketplace
3. Team members install plugin

**Alternative: Via Git**
1. Add Skill to `.claude/skills/`
2. Commit and push
3. Team members pull changes (Skills immediately available)

```bash
# Add project Skill
mkdir -p .claude/skills/team-skill
# Create SKILL.md

# Share via git
git add .claude/skills/
git commit -m "Add team Skill for PDF processing"
git push

# Team members get Skills automatically
git pull
claude  # Skills now available
```

## Examples

### Example 1: Simple Skill

**commit-helper/SKILL.md:**
```yaml
---
name: generating-commit-messages
description: Generates clear commit messages from git diffs. Use when writing commit messages or reviewing staged changes.
---

# Generating Commit Messages

## Instructions

1. Run `git diff --staged` to see changes
2. I'll suggest a commit message with:
   - Summary under 50 characters
   - Detailed description
   - Affected components

## Best practices

- Use present tense
- Explain what and why, not how
```

### Example 2: Skill with Tool Permissions

**code-reviewer/SKILL.md:**
```yaml
---
name: code-reviewer
description: Review code for best practices and potential issues. Use when reviewing code, checking PRs, or analyzing code quality.
allowed-tools: Read, Grep, Glob
---

# Code Reviewer

## Review checklist

1. Code organization and structure
2. Error handling
3. Performance considerations
4. Security concerns
5. Test coverage

## Instructions

1. Read the target files using Read tool
2. Search for patterns using Grep
3. Find related files using Glob
4. Provide detailed feedback on code quality
```

### Example 3: Multi-File Skill

**Structure:**
```
pdf-processing/
├── SKILL.md
├── FORMS.md
├── REFERENCE.md
└── scripts/
    ├── fill_form.py
    └── validate.py
```

**pdf-processing/SKILL.md:**
````yaml
---
name: pdf-processing
description: Extract text, fill forms, merge PDFs. Use when working with PDF files, forms, or document extraction. Requires pypdf and pdfplumber packages.
---

# PDF Processing

## Quick start

Extract text:
```python
import pdfplumber
with pdfplumber.open("doc.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```

For form filling, see [FORMS.md](FORMS.md).
For detailed API reference, see [REFERENCE.md](REFERENCE.md).

## Requirements

Packages must be installed in your environment:
```bash
pip install pypdf pdfplumber
```
````

## Integration with Our Workspace

### Current Workspace Architecture

**Our System Uses:**
- Custom agents in `.cursor/agents/`
- Slash commands in `.claude/commands/`
- BMAD Method automation hooks
- Project templates with workflows
- TodoWrite task management
- Memory system in `/memories/`

### Integration Opportunities

Skills complement our existing system:

**1. Convert Slash Commands to Skills (When Appropriate)**
- **Slash Commands**: User-invoked, explicit control
- **Skills**: Model-invoked, automatic activation
- **Strategy**: Keep slash commands for explicit workflows, add Skills for automatic expertise

**2. Package Agent Expertise as Skills**
- spec-architect → architecture-design Skill
- security-specialist → security-analysis Skill
- quality-assurance-specialist → code-review Skill

**3. Create Protocol Enforcement Skills**
- uncertainty-protocol Skill (Law #1)
- specification-adherence Skill (Law #1B)
- surgical-precision Skill (Level 1-7 hierarchy)

**4. Build BMAD Method Skills**
- analyst-research Skill
- pm-requirements Skill
- architect-design Skill

**5. Memory System Integration**
- Skills can read from `/memories/` for context
- Skills can update memory files with learnings

### Recommendation

**Phase 1: Experimentation**
- Create 2-3 pilot Skills for high-value workflows
- Test discovery and activation patterns
- Gather feedback on automatic vs explicit invocation

**Phase 2: Strategic Integration**
- Identify which workflows benefit from Skills vs slash commands
- Document Skills integration in CLAUDE.md protocols
- Create team Skills for shared workflows

**Phase 3: Advanced Composition**
- Build Skills that leverage our memory system
- Create Skills that coordinate with agents
- Develop plugin for reusable Skills across projects

## Next Steps

1. Review [Agent Skills Best Practices](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices)
2. Explore [Agent SDK Skills Integration](https://docs.anthropic.com/en/api/agent-sdk/skills)
3. Check [Claude Code Plugins Guide](https://docs.anthropic.com/en/docs/claude-code/plugins)

---

**Last Updated:** 2025-10-29
**Source:** Anthropic Agent Skills Documentation

# Memory Directory Structure Reference

Complete architecture of `/memories/` directory for Law #6 (Cross-Session Memory & Learning).

## Directory Architecture

```
/memories/
├── session-context/           # Current session state (CRITICAL)
│   ├── active-project.xml     # Current work, active tasks, blocking issues
│   ├── phase-status.xml       # Protocol execution status, workflow phase
│   └── pending-decisions.xml  # Decisions blocking progress, client approvals
│
├── protocol-compliance/       # Laws #1-5 enforcement tracking
│   ├── uncertainty-log.xml    # Uncertainty detection and resolution (Law #1A)
│   ├── drift-prevention-log.xml # Specification adherence tracking (Law #1B)
│   ├── protocol-status.xml    # Protocol phase compliance (Law #2)
│   ├── efficiency-metrics.xml # Surgical precision tracking (Law #4)
│   └── audit-findings.xml     # External AI audit results
│
├── client-context/            # Senior developer reporting (Law #5)
│   ├── preferences.xml        # Client preferences and guidance
│   ├── communication-log.xml  # Interaction history
│   └── approvals.xml          # Decision and approval history
│
├── agent-coordination/        # Multi-agent orchestration (Law #3)
│   ├── context-packages.xml   # Agent handoff packages
│   ├── delegation-history.xml # Agent task assignments
│   └── quality-gates.xml      # Agent quality checkpoints
│
├── development-patterns/      # Reusable knowledge (Law #6)
│   ├── debugging-solutions.xml    # Successful Level 1-7 resolutions
│   ├── security-patterns.xml      # Security implementations
│   ├── test-strategies.xml        # TDD patterns that worked
│   └── task-templates.xml         # Proven task decompositions
│
└── project-knowledge/         # Per-project learning (Law #6)
    └── {project-name}/
        ├── architecture.xml       # Architecture decisions
        ├── tech-debt.xml         # Debt tracking and status
        ├── security-audit.xml    # Security findings
        └── lessons.xml           # Project-specific insights
```

## File Schemas

### session-context/active-project.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<active-project>
  <project-name>auth-service</project-name>
  <phase>implementation</phase>
  <start-date>2025-10-25T10:00:00Z</start-date>
  <last-updated>2025-10-29T19:00:00Z</last-updated>

  <current-task>
    <id>TASK-008</id>
    <description>Implement JWT token refresh endpoint</description>
    <status>in_progress</status>
    <started>2025-10-29T18:30:00Z</started>
  </current-task>

  <blocking-issues>
    <issue>
      <description>MFA implementation approach decision needed</description>
      <blocked-since>2025-10-27T14:00:00Z</blocked-since>
      <requires>Client decision: SMS vs Authenticator App</requires>
    </issue>
  </blocking-issues>

  <context-metadata>
    <total-tokens-used>82000</total-tokens-used>
    <context-clears>0</context-clears>
    <session-count>3</session-count>
  </context-metadata>
</active-project>
```

### protocol-compliance/uncertainty-log.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<uncertainty-log description="Cross-session uncertainty pattern tracking for Law #1A enforcement"
                 created="2025-10-20T10:00:00Z">
  <uncertainty>
    <timestamp>2025-10-29T14:30:00Z</timestamp>
    <type>approach</type>
    <issue>Multiple authentication strategies viable (JWT vs Sessions)</issue>
    <resolution>Client specified JWT for mobile app compatibility</resolution>
    <questions-asked>Infrastructure requirements, client types, scale expectations</questions-asked>
    <decision>Implement JWT with RS256 signing</decision>
  </uncertainty>
</uncertainty-log>
```

### protocol-compliance/drift-prevention-log.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<drift-prevention-log description="Cross-session architectural drift prevention tracking for Law #1B enforcement"
                      created="2025-10-20T10:00:00Z">
  <drift-prevention>
    <timestamp>2025-10-28T16:45:00Z</timestamp>
    <type>architecture</type>
    <specification>Use Repository pattern for all data access</specification>
    <proposed>Direct JDBC access in Controller for "simple query"</proposed>
    <resolution>Refactored to use UserRepository following established pattern</resolution>
  </drift-prevention>
</drift-prevention-log>
```

### agent-coordination/context-packages.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<agent-handoffs>
  <handoff timestamp="2025-10-29T18:00:00Z">
    <from>project-manager</from>
    <to>spec-developer</to>
    <task>Implement JWT refresh token endpoint</task>
    <context>
      <decisions>
        <decision>JWT signing algorithm: RS256</decision>
        <decision>Token expiry: access 1h, refresh 7d</decision>
      </decisions>
      <files>
        <file>src/auth/AuthController.ts</file>
        <file>src/auth/JwtService.ts</file>
        <file>src/auth/TokenRepository.ts</file>
      </files>
      <dependencies>
        <dependency>AuthService must validate refresh token before issuing new access token</dependency>
      </dependencies>
    </context>
    <success-criteria>
      <criterion>POST /auth/refresh returns new access token</criterion>
      <criterion>Expired refresh tokens rejected with 401</criterion>
      <criterion>Unit tests achieve 90%+ coverage</criterion>
    </success-criteria>
    <constraints>
      <law-compliance>
        <law id="1A">No assumptions about token storage mechanism</law>
        <law id="1B">Follow existing Repository pattern exactly</law>
        <law id="4">Implement as Level 3 (Focused Enhancement) - estimated 30-45 min</law>
      </law-compliance>
    </constraints>
    <status>in-progress</status>
  </handoff>
</agent-handoffs>
```

## Memory File Size Limits

**Per-File Limits**:
- Maximum: 50KB per file
- Recommended: <20KB for fast loading
- Use pagination for larger content

**Path Validation**:
- All paths MUST start with `/memories/`
- No path traversal allowed (`../`, `..\\`, URL-encoded variants)
- No null bytes (`%00`)
- Validated by `scripts/validate-memory-path.js`

## Memory Operations

### Reading Memory

```python
# Read single file
with open('/memories/session-context/active-project.xml', 'r') as f:
    content = f.read()

# Read multiple files
import xml.etree.ElementTree as ET
tree = ET.parse('/memories/protocol-compliance/uncertainty-log.xml')
root = tree.getroot()
uncertainties = root.findall('uncertainty')
```

### Writing Memory

```python
# Create/update file
import xml.etree.ElementTree as ET

root = ET.Element("active-project")
project_name = ET.SubElement(root, "project-name")
project_name.text = "auth-service"

tree = ET.ElementTree(root)
ET.indent(tree, space="  ")
tree.write('/memories/session-context/active-project.xml',
           encoding='utf-8',
           xml_declaration=True)
```

### Updating Memory

```python
# Update existing file
tree = ET.parse('/memories/session-context/active-project.xml')
root = tree.getroot()

# Modify elements
last_updated = root.find('last-updated')
last_updated.text = datetime.utcnow().isoformat() + 'Z'

# Write back
ET.indent(tree, space="  ")
tree.write('/memories/session-context/active-project.xml',
           encoding='utf-8',
           xml_declaration=True)
```

## Memory Lifecycle

### Session Start

```
1. Read critical files (4 minimum):
   - /memories/session-context/active-project.xml
   - /memories/session-context/phase-status.xml
   - /memories/protocol-compliance/uncertainty-log.xml
   - /memories/client-context/pending-decisions.xml

2. Restore TodoWrite from session context

3. Check for blocking issues

4. Resume from interruption point
```

### During Session

```
1. Update memory incrementally:
   - After each significant action
   - When detecting uncertainty
   - When preventing drift
   - When completing tasks

2. Log to appropriate files:
   - Uncertainty → uncertainty-log.xml
   - Drift prevention → drift-prevention-log.xml
   - Debugging solutions → debugging-solutions.xml
   - Agent handoffs → context-packages.xml
```

### Context Clearing Event

```
1. BEFORE clearing (automatic):
   - Preserve critical state to session-context/
   - Summarize tool results being cleared
   - Mark with context-preservation-trigger metadata

2. AFTER clearing (seamless):
   - Reference memory files for cleared information
   - Continue work without interruption
   - Never re-ask user for information
```

### Session End

```
1. Update session-context/ files:
   - active-project.xml (current state)
   - phase-status.xml (protocol progress)
   - pending-decisions.xml (blockers)

2. Archive completed work:
   - Move to project-knowledge/ if project done
   - Consolidate debugging-solutions.xml
   - Clean stale pending-decisions

3. Set session end timestamp
```

## Context Editing Integration

**Anthropic API Configuration**:
- Context editing: Server-side (Anthropic API)
- Memory tool: Excluded from clearing (automatic)
- Threshold: ~100K tokens conversation context
- Process: Oldest tool results replaced with placeholders

**Memory Tool Exclusion**:
Memory tool operations are NEVER cleared by context editing. This ensures:
- Session recovery always works
- Knowledge persists indefinitely
- No manual re-creation of memory state needed

**Context Clear Detection**:
```xml
<context-metadata>
  <context-preservation-trigger>approaching-threshold</context-preservation-trigger>
  <context-clear-timestamp>2025-10-29T20:15:00Z</context-clear-timestamp>
  <tokens-cleared>35000</tokens-cleared>
  <preserved-information>
    <item>Database schema analysis (3 tables need indexing)</item>
    <item>Security scan (1 XSS vulnerability identified)</item>
    <item>Test failures (4 failures due to mock configuration)</item>
  </preserved-information>
</context-metadata>
```

## Memory Maintenance

### Per-Session Maintenance

```
□ Archive completed projects
□ Clear stale pending-decisions
□ Consolidate debugging solutions
□ Update project-specific lessons.xml
```

### Weekly Maintenance

```
□ Consolidate debugging solutions by pattern type
□ Update security patterns library
□ Archive old session contexts (>30 days)
□ Clean expired project-knowledge
```

### Monthly Maintenance

```
□ Archive old projects to long-term storage
□ Clear session contexts >90 days old
□ Consolidate development patterns
□ Review and optimize file sizes
```

## Security & Best Practices

**Security**:
- ❌ NEVER store API keys, tokens, credentials
- ❌ NEVER store client-sensitive information
- ✅ Store decisions, not secrets
- ✅ Store patterns, not data
- ✅ Validate all paths before writing

**Performance**:
- Keep files <20KB for fast loading
- Use pagination for large datasets
- Index by timestamp for chronological queries
- Archive old data regularly

**Consistency**:
- Use XML format for structured data
- Use ISO 8601 timestamps (UTC)
- Validate against schemas
- Maintain referential integrity

---

**Last Updated**: 2025-10-29
**Skill Version**: 1.0.0

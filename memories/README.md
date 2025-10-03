# Memory System Documentation

## Overview

The my-dev-workspace memory system provides persistent cross-session learning and context preservation for Claude Code. This system is designed to align with the Absolute Laws framework (Laws #1-5) from CLAUDE.md, enabling intelligent context retention, protocol compliance tracking, and continuous improvement.

## Architecture

### Directory Structure

```
memories/
├── session-context/         # Current session state tracking
│   ├── active-project.xml
│   ├── phase-status.xml
│   └── pending-decisions.xml
│
├── protocol-compliance/     # Law enforcement tracking
│   ├── uncertainty-log.xml
│   ├── spec-adherence.xml
│   ├── protocol-status.xml
│   └── efficiency-metrics.xml
│
├── agent-coordination/      # Multi-agent orchestration
│   ├── handoff-log.xml
│   ├── context-packages.xml
│   └── quality-gates.xml
│
├── development-patterns/    # Reusable knowledge
│   ├── debugging-solutions.xml
│   ├── security-patterns.xml
│   ├── test-strategies.xml
│   └── task-templates.xml
│
├── client-context/          # Senior developer reporting
│   ├── preferences.xml
│   ├── communication-log.xml
│   └── approval-history.xml
│
└── project-knowledge/       # Per-project learning (dynamic)
    └── [project-name].xml
```

## Memory Categories

### 1. Session Context
**Purpose**: Track active development session state and decisions

#### active-project.xml
- Current project details and status
- Active phase and objectives
- Tasks in progress
- Files in scope and dependencies

#### phase-status.xml
- Current protocol phase execution
- Phase checklist completion status
- Quality gate validation results
- Next phase prerequisites

#### pending-decisions.xml
- Decisions awaiting client approval
- Multiple options with pros/cons
- Expert recommendations
- Blocking tasks and priorities

### 2. Protocol Compliance
**Purpose**: Enforce Absolute Laws #1-4 compliance

#### uncertainty-log.xml (Law #1A)
- Uncertainty events and stop triggers
- Clarification requests and resolutions
- Impact assessment
- Prevention statistics

#### spec-adherence.xml (Law #1B)
- Specification compliance checkpoints
- Drift detection and prevention
- Corrective actions
- Architecture alignment validation

#### protocol-status.xml (Law #2)
- Protocol sequence execution tracking
- Quality gate pass/fail status
- Violation detection and resolution
- Compliance metrics

#### efficiency-metrics.xml (Law #4)
- Surgical precision level tracking (1-7)
- Minimalist approach validation
- Technical debt impact assessment
- Escalation tracking

### 3. Agent Coordination
**Purpose**: Enable seamless multi-agent orchestration (Law #3)

#### handoff-log.xml
- Agent-to-agent handoff records
- Context package completeness
- Success criteria and deliverables
- Coordination effectiveness metrics

#### context-packages.xml
- Complete context package definitions
- File references and specifications
- Dependencies and decisions
- Blocker tracking

#### quality-gates.xml
- Gate validation criteria
- Pass/fail status per gate
- Evidence and validator records
- Gate effectiveness statistics

### 4. Development Patterns
**Purpose**: Capture reusable knowledge and best practices

#### debugging-solutions.xml
- Categorized debugging solutions
- Root cause analysis
- Surgical level interventions
- Reusability scoring

#### security-patterns.xml
- Security implementation patterns
- Threat models and mitigations
- OWASP category mapping
- Effectiveness ratings

#### test-strategies.xml
- TDD/SDD integration approaches
- Testing level strategies
- Coverage targets and tools
- Effectiveness metrics

#### task-templates.xml
- 15-30 minute task templates
- Surgical level classification
- Protocol compliance checkpoints
- Success criteria and common pitfalls

### 5. Client Context
**Purpose**: Support senior developer-client relationship (Law #5)

#### preferences.xml
- Communication style and detail level
- Technical preferences and risk tolerance
- Approval requirements and thresholds
- Learning style preferences

#### communication-log.xml
- Client interaction history
- Recommendations provided
- Educational content delivered
- Decision outcomes

#### approval-history.xml
- Approval request records
- Options presented and decisions made
- Implementation status and outcomes
- Approval pattern analysis

### 6. Project Knowledge
**Purpose**: Per-project learning and context (dynamic directory)

Files created dynamically per project following the pattern:
- `[project-name].xml` - Project-specific learnings, patterns, and context

## Security Constraints

### Path Validation Requirements

**CRITICAL**: All memory file paths MUST pass security validation to prevent directory traversal attacks.

#### Validation Rules
1. **Path Prefix**: All paths must start with `memories/`
2. **Valid Subdirectories**: Only the 6 core subdirectories are allowed
3. **File Extension**: All files must have `.xml` extension
4. **No Traversal**: No parent directory references (`../`, `..\\`)
5. **No Encoding Attacks**: No URL-encoded traversal attempts
6. **No Null Bytes**: No null byte injection attempts

#### Security Validation Script

Location: `scripts/validate-memory-path.js`

Usage:
```bash
# Validate a specific path
node scripts/validate-memory-path.js memories/session-context/active-project.xml

# Run comprehensive test suite
node scripts/validate-memory-path.js --test
```

#### Attack Prevention

The validation script prevents:
- Directory traversal: `../`, `..\\`, `.%2e`, `%252e`
- Absolute path escapes: `/etc/passwd`, `C:\\Windows`
- URL encoding attacks: `%2e%2e`, `%2f`, `%5c`
- Null byte injection: `\0`, `%00`
- Invalid subdirectories and extensions

## File Size Limits

**Maximum File Size**: 50KB per XML file

### Size Management Guidelines
1. **Regular Pruning**: Archive old entries periodically
2. **Summarization**: Consolidate historical data into summaries
3. **Selective Retention**: Keep only relevant recent information
4. **Archive Strategy**: Move historical data to project documentation

### Size Monitoring
The validation script automatically checks file sizes and reports violations.

## File Format

### XML Structure Standards

All memory files use XML format with consistent structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<root-element>
  <metadata>
    <last-updated>ISO-8601-TIMESTAMP</last-updated>
    <version>1.0</version>
  </metadata>
  <!-- Content specific to file type -->
</root-element>
```

### Required Elements
- XML declaration with UTF-8 encoding
- Root element appropriate to file type
- Metadata section with timestamp and version
- Structured content using nested elements

### Best Practices
- Use descriptive element names
- Include timestamps for all events
- Reference specific Law numbers in compliance files
- Maintain consistent indentation (2 spaces)
- Escape special characters properly (`&lt;`, `&gt;`, `&amp;`)

## Maintenance Procedures

### Regular Maintenance Tasks

#### Daily
- Update session context files during active development
- Log uncertainty events and specification checkpoints
- Record agent handoffs and quality gate results

#### Weekly
- Review protocol compliance metrics
- Archive completed project knowledge
- Prune large log files
- Update development patterns with new learnings

#### Monthly
- Analyze compliance statistics and trends
- Update client preferences based on patterns
- Consolidate debugging solutions
- Review and optimize memory file sizes

### Data Lifecycle

1. **Active Phase**: Real-time updates during development
2. **Recent History**: Last 30 days retained in full detail
3. **Historical Archive**: Older data summarized or moved
4. **Long-term Storage**: Critical patterns and decisions retained indefinitely

## Integration with Absolute Laws

### Law #1A: Uncertainty Protocol
- **Memory File**: `protocol-compliance/uncertainty-log.xml`
- **Usage**: Log all uncertainty events, stop triggers, and resolutions
- **Metrics**: Track prevention effectiveness and resolution times

### Law #1B: Specification Adherence
- **Memory File**: `protocol-compliance/spec-adherence.xml`
- **Usage**: Validate all actions against specifications, detect drift
- **Metrics**: Compliance rate and drift prevention statistics

### Law #2: Strict Protocol Adherence
- **Memory File**: `protocol-compliance/protocol-status.xml`
- **Usage**: Track protocol sequence execution and quality gates
- **Metrics**: Protocol compliance rate and violation tracking

### Law #3: Orchestrated Workspace Efficiency
- **Memory Files**: `agent-coordination/*.xml`
- **Usage**: Log agent handoffs, context packages, quality gates
- **Metrics**: Coordination effectiveness and handoff success rates

### Law #4: Surgical Precision & Minimalist Efficiency
- **Memory File**: `protocol-compliance/efficiency-metrics.xml`
- **Usage**: Track intervention levels (1-7), minimalist validation
- **Metrics**: Level distribution and efficiency compliance

### Law #5: Senior Developer Leadership
- **Memory Files**: `client-context/*.xml`
- **Usage**: Track client preferences, communications, approvals
- **Metrics**: Communication effectiveness and decision patterns

## Usage Examples

### Recording an Uncertainty Event

```xml
<event>
  <timestamp>2025-10-03T14:30:00Z</timestamp>
  <agent>backend-developer</agent>
  <phase>implementation</phase>
  <uncertainty-type>requirement-interpretation</uncertainty-type>
  <description>Unclear if authentication should use JWT or session-based approach</description>
  <context>API authentication layer implementation</context>
  <stop-triggered>true</stop-triggered>
  <clarification-requested>Which authentication method aligns with project security requirements?</clarification-requested>
  <resolution>JWT with refresh token rotation approved by client</resolution>
  <resolution-timestamp>2025-10-03T15:00:00Z</resolution-timestamp>
  <impact>prevented-incorrect-implementation</impact>
</event>
```

### Logging an Agent Handoff

```xml
<handoff>
  <id>handoff-001</id>
  <timestamp>2025-10-03T16:00:00Z</timestamp>
  <from-agent>spec-architect</from-agent>
  <to-agent>backend-developer</to-agent>
  <task-objective>Implement user authentication API endpoints</task-objective>
  <context-package>
    <files>
      <file>docs/requirements/auth-spec.md</file>
      <file>docs/design/api-architecture.md</file>
    </files>
    <specifications>
      <spec>JWT authentication with refresh token rotation</spec>
      <spec>Rate limiting: 5 login attempts per minute</spec>
    </specifications>
    <current-state>Architecture design complete, ready for implementation</current-state>
  </context-package>
  <success-criteria>
    <criterion>All authentication endpoints implemented with security middleware</criterion>
    <criterion>Unit tests achieve >90% coverage</criterion>
    <criterion>Security scan passes with zero high-severity issues</criterion>
  </success-criteria>
  <constraint-parameters>
    <law-1-compliance>Stop if authentication requirements are unclear</law-1-compliance>
    <law-2-compliance>Follow Security-First protocol sequence</law-2-compliance>
  </constraint-parameters>
  <handoff-instructions>Implement per design.md, consult spec-tester for test strategy</handoff-instructions>
  <status>in-progress</status>
</handoff>
```

### Recording a Development Pattern

```xml
<solution>
  <id>debug-001</id>
  <created>2025-10-03T12:00:00Z</created>
  <project>my-api-project</project>
  <problem-category>authentication-failure</problem-category>
  <problem-description>JWT tokens expiring immediately after generation</problem-description>
  <symptoms>
    <symptom>Users unable to authenticate beyond initial login</symptom>
    <symptom>Token validation failing with "Token expired" error</symptom>
  </symptoms>
  <root-cause>JWT expiration time set to milliseconds instead of seconds</root-cause>
  <surgical-level>1</surgical-level>
  <solution-approach>Changed expiresIn from 3600000 to "1h" in JWT config</solution-approach>
  <implementation>
    <steps>
      <step>Located JWT configuration in auth/jwt.config.js</step>
      <step>Changed expiresIn: 3600000 to expiresIn: "1h"</step>
      <step>Verified token expiration with test suite</step>
    </steps>
    <files-modified>
      <file>src/auth/jwt.config.js</file>
    </files-modified>
    <time-to-resolve>10 minutes</time-to-resolve>
  </implementation>
  <prevention>Use JWT library's time notation ("1h", "7d") instead of numeric milliseconds</prevention>
  <tags>
    <tag>authentication</tag>
    <tag>jwt</tag>
    <tag>configuration</tag>
  </tags>
  <reusability-score>high</reusability-score>
</solution>
```

## Best Practices

### Writing Memory Files
1. **Be Specific**: Include precise details, timestamps, and context
2. **Reference Laws**: Always reference applicable Absolute Laws
3. **Include Evidence**: Add file paths, error messages, validation results
4. **Track Metrics**: Record quantitative data for analysis
5. **Maintain Structure**: Follow XML templates consistently

### Reading Memory Files
1. **Check Recency**: Verify last-updated timestamp
2. **Validate Context**: Ensure information applies to current situation
3. **Review Metrics**: Analyze statistics for trends and patterns
4. **Cross-Reference**: Link related information across files
5. **Update After Reading**: Add new learnings discovered during use

### Memory Hygiene
1. **Regular Updates**: Keep session context current during development
2. **Timely Archival**: Move completed items to appropriate storage
3. **Size Monitoring**: Check file sizes regularly and prune as needed
4. **Quality Over Quantity**: Retain valuable information, discard noise
5. **Version Control**: Track memory file changes in git when appropriate

## Troubleshooting

### Common Issues

#### Path Validation Failures
**Symptom**: Security validation script rejects valid paths
**Solution**: Ensure path uses forward slashes, starts with `memories/`, and has `.xml` extension

#### File Size Violations
**Symptom**: Files exceed 50KB limit
**Solution**: Archive old entries, summarize historical data, or split into multiple files

#### XML Parse Errors
**Symptom**: Malformed XML errors when reading files
**Solution**: Validate XML structure, escape special characters, check closing tags

#### Missing Context
**Symptom**: Insufficient information to resume work
**Solution**: Improve context package completeness in handoff-log.xml

### Support Resources

- **Validation Script**: `scripts/validate-memory-path.js`
- **Template Files**: All subdirectories contain example XML structures
- **CLAUDE.md**: Reference for Absolute Laws integration
- **Project Issues**: Report bugs or suggestions via GitHub issues

## Future Enhancements

### Planned Features
- Automated archival and summarization
- Memory file analytics dashboard
- Cross-session learning recommendations
- Pattern recognition and suggestion system
- Integration with project documentation

### Extensibility
The memory system is designed for extensibility:
- Add new subdirectories for specialized memory types
- Extend XML schemas with project-specific elements
- Create custom analytics scripts for memory analysis
- Integrate with external knowledge management systems

## Version History

- **v1.0** (2025-10-03): Initial memory system implementation
  - 6 core subdirectories
  - 17 XML template files
  - Security validation script
  - Comprehensive documentation

---

**Last Updated**: 2025-10-03
**Maintained By**: my-dev-workspace development team
**Questions**: Refer to CLAUDE.md for Absolute Laws framework details

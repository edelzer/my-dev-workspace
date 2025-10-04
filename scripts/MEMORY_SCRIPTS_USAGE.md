# Memory Utility Scripts Usage Guide

This guide provides comprehensive usage examples for the three memory maintenance scripts.

## Overview

Three scripts are available for memory system maintenance:

1. **memory-archive.js** - Archive completed projects
2. **memory-analytics.js** - Analyze patterns and metrics
3. **memory-cleanup.js** - Clean stale data and consolidate patterns

## Installation

No installation required. Scripts use Node.js built-in modules only.

## 1. Memory Archive Script

Archives completed project memory to archive directory.

### Basic Usage

```bash
# Archive a specific project
node scripts/memory-archive.js --project my-api-project

# Use npm script
npm run memory:archive -- --project my-api-project
```

### Advanced Usage

```bash
# Dry run (preview what will be archived)
node scripts/memory-archive.js --project my-api-project --dry-run

# Archive with compression (future feature)
node scripts/memory-archive.js --project my-api-project --compress

# Show help
node scripts/memory-archive.js --help
```

### What It Does

1. Validates project exists in `memories/project-knowledge/`
2. Scans all memory directories for project references
3. Creates archive directory: `memories/archives/{project}-{timestamp}/`
4. Copies all project-related files to archive
5. Generates archival report
6. Removes original files from memory directories

### Exit Codes

- `0` - Success
- `1` - Invalid arguments or missing project
- `2` - Archive operation failed
- `3` - Path validation failed

---

## 2. Memory Analytics Script

Analyzes memory system patterns and generates metrics.

### Basic Usage

```bash
# Generate summary report (default)
node scripts/memory-analytics.js

# Use npm script
npm run memory:analytics
```

### Report Types

#### Summary Report
```bash
node scripts/memory-analytics.js --report summary
```

Output includes:
- Total files and size
- Files by type distribution
- Pattern library statistics
- Recent activity summary

#### Detailed Report
```bash
node scripts/memory-analytics.js --report detailed
```

Adds to summary:
- Recent activity file-by-file details
- Complete project list

#### Patterns Report
```bash
node scripts/memory-analytics.js --report patterns
```

Shows:
- All debugging solutions with details
- Security patterns catalog
- Test strategies breakdown
- Task templates inventory

#### Growth Report
```bash
node scripts/memory-analytics.js --report growth --period 7
```

Analyzes:
- Growth rate over period
- Size metrics and trends
- Actionable insights
- Cleanup recommendations

### Output Formats

```bash
# Text format (default)
node scripts/memory-analytics.js --format text

# JSON format (for automation)
node scripts/memory-analytics.js --format json

# Markdown format (for documentation)
node scripts/memory-analytics.js --format markdown
```

### Save to File

```bash
# Save report to file
node scripts/memory-analytics.js --report detailed --output report.md --format markdown

# JSON output for processing
node scripts/memory-analytics.js --report growth --format json --output metrics.json
```

### Analysis Period

```bash
# Last 7 days
node scripts/memory-analytics.js --period 7

# Last 30 days (default)
node scripts/memory-analytics.js --period 30

# Last 90 days
node scripts/memory-analytics.js --period 90
```

### Exit Codes

- `0` - Success
- `1` - Invalid arguments
- `2` - Analysis failed

---

## 3. Memory Cleanup Script

Clears stale data and consolidates patterns.

### Basic Usage

```bash
# Clean stale entries (7 days default)
node scripts/memory-cleanup.js

# Use npm script
npm run memory:cleanup
```

### Advanced Usage

```bash
# Custom age threshold (14 days)
node scripts/memory-cleanup.js --age 14

# Consolidate duplicate patterns
node scripts/memory-cleanup.js --consolidate

# Dry run preview
node scripts/memory-cleanup.js --dry-run

# Full cleanup with consolidation
node scripts/memory-cleanup.js --age 7 --consolidate --dry-run
```

### What It Does

#### Step 1: Clean Stale Session Context
- Identifies files older than age threshold
- Moves to `memories/archives/session-cleanup/`
- Preserves active session data

#### Step 2: Consolidate Patterns (if --consolidate)
- Scans debugging-solutions.xml for duplicates
- Calculates similarity scores (70% threshold)
- Flags duplicates for manual review
- Does not auto-delete (safety first)

#### Step 3: Archive Completed Tasks
- Extracts completed TodoWrite tasks
- Preserves in archive
- Maintains task history

#### Step 4: Generate Report
- Creates cleanup report
- Lists all changes made
- Provides statistics

### Exit Codes

- `0` - Success
- `1` - Invalid arguments
- `2` - Cleanup operation failed

---

## NPM Scripts

All scripts are available via npm:

```json
{
  "scripts": {
    "memory:archive": "node scripts/memory-archive.js",
    "memory:analytics": "node scripts/memory-analytics.js",
    "memory:cleanup": "node scripts/memory-cleanup.js"
  }
}
```

### Usage Examples

```bash
# Archive project
npm run memory:archive -- --project my-project --dry-run

# Generate analytics
npm run memory:analytics -- --report detailed --output report.md

# Cleanup with consolidation
npm run memory:cleanup -- --age 14 --consolidate --dry-run
```

---

## Workflow Examples

### Weekly Maintenance

```bash
# 1. Run analytics to check system health
npm run memory:analytics -- --report growth --period 7

# 2. Clean up stale entries
npm run memory:cleanup -- --age 7 --dry-run

# 3. If dry-run looks good, execute cleanup
npm run memory:cleanup -- --age 7
```

### Monthly Review

```bash
# 1. Generate comprehensive report
npm run memory:analytics -- --report detailed --output monthly-report.md --format markdown

# 2. Consolidate patterns
npm run memory:cleanup -- --consolidate --dry-run

# 3. Archive completed projects
npm run memory:archive -- --project completed-project
```

### Before Archiving a Project

```bash
# 1. Preview what will be archived
npm run memory:archive -- --project my-project --dry-run

# 2. Check analytics for project references
npm run memory:analytics -- --report detailed | grep my-project

# 3. Execute archive
npm run memory:archive -- --project my-project
```

---

## Best Practices

### Archive Script
1. **Always dry-run first** to preview changes
2. **Verify project completion** before archiving
3. **Check cross-references** in other memory files
4. **Review archive report** after completion

### Analytics Script
1. **Run weekly** to monitor growth trends
2. **Use JSON format** for automation/dashboards
3. **Track pattern accumulation** over time
4. **Export reports** for project documentation

### Cleanup Script
1. **Start with longer age threshold** (14+ days)
2. **Always dry-run** before actual cleanup
3. **Review duplicates manually** before consolidation
4. **Archive important data** before cleanup

---

## Automation Ideas

### Scheduled Analytics (via cron/Task Scheduler)

```bash
# Daily summary to file
0 9 * * * cd /path/to/workspace && npm run memory:analytics -- --output daily-metrics.txt

# Weekly detailed report
0 9 * * 0 cd /path/to/workspace && npm run memory:analytics -- --report detailed --output weekly-report.md --format markdown

# Monthly growth analysis
0 9 1 * * cd /path/to/workspace && npm run memory:analytics -- --report growth --period 30 --format json --output monthly-growth.json
```

### Automated Cleanup

```bash
# Weekly cleanup (dry-run for safety)
0 2 * * 0 cd /path/to/workspace && npm run memory:cleanup -- --age 14 --dry-run >> cleanup-preview.log

# Quarterly consolidation review
0 2 1 */3 * cd /path/to/workspace && npm run memory:cleanup -- --consolidate --dry-run >> consolidation-review.log
```

---

## Troubleshooting

### Archive Script Issues

**Problem**: "Project not found"
```bash
# Check if project exists
ls -la memories/project-knowledge/

# Verify project name matches file (without .xml)
npm run memory:archive -- --project myproject  # for myproject.xml
```

**Problem**: "Path validation failed"
```bash
# Validate path security
node scripts/validate-memory-path.js memories/project-knowledge/myproject.xml
```

### Analytics Script Issues

**Problem**: "No patterns found"
- Templates may be empty (expected for new installations)
- Add real debugging solutions/patterns to see analytics

**Problem**: "Invalid report type"
```bash
# Valid types: summary, detailed, patterns, growth
npm run memory:analytics -- --report summary
```

### Cleanup Script Issues

**Problem**: "No stale entries found"
- Adjust age threshold: `--age 1` (very aggressive)
- Check file timestamps in memory directories

**Problem**: "Pattern consolidation finds nothing"
- Need actual duplicate patterns in debugging-solutions.xml
- Similarity threshold is 70% (may be too strict)

---

## File Locations

### Input Directories
- `memories/session-context/` - Session state
- `memories/protocol-compliance/` - Law tracking
- `memories/agent-coordination/` - Agent handoffs
- `memories/development-patterns/` - Reusable patterns
- `memories/client-context/` - Client preferences
- `memories/project-knowledge/` - Project-specific learning

### Output Directories
- `memories/archives/` - Archived projects and cleanup data
- `memories/archives/{project}-{timestamp}/` - Project archives
- `memories/archives/session-cleanup/` - Cleaned session data

### Reports
- Archive reports: `memories/archives/{project}-{timestamp}/archive-report-{timestamp}.txt`
- Cleanup reports: `memories/archives/session-cleanup-{timestamp}/cleanup-report-{timestamp}.txt`
- Analytics reports: Console output or specified `--output` file

---

## Security Considerations

### Path Validation
All scripts use `validate-memory-path.js` for security:
- Prevents directory traversal attacks
- Validates paths within `memories/` only
- Enforces `.xml` file extension
- Blocks URL-encoded attacks

### File Size Limits
- Maximum file size: 50KB per XML file
- Scripts report size violations
- Archive before files exceed limit

### Backup Safety
- Archive creates copies before deletion
- Dry-run mode for preview
- Reports saved for audit trail

---

## Version History

- **v1.0** (2025-10-03): Initial implementation
  - memory-archive.js - Project archival
  - memory-analytics.js - Pattern analysis
  - memory-cleanup.js - Stale data cleanup

---

## Support

For issues or questions:
1. Check this usage guide
2. Run `--help` on specific script
3. Review `/memories/README.md` for architecture
4. Check `scripts/validate-memory-path.js` for security details
5. Refer to `/CLAUDE.md` Law #6 for memory system protocol

---

**Last Updated**: 2025-10-03
**Maintained By**: my-dev-workspace development team

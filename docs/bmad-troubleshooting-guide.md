# BMAD Workflow Troubleshooting Guide

## Overview
Comprehensive troubleshooting guide for BMAD agent workflows, covering common issues, diagnostics, and resolution procedures.

## Quick Diagnostics

### 1. Run Workflow Validation
```bash
# Check overall system health
node scripts/validate-bmad-workflow.js

# Auto-fix common issues
node scripts/validate-bmad-workflow.js fix
```

### 2. Check System Status
```bash
# View current workflow state
cat .bmad-core/workflow-state.json | jq .

# Check recent agent activity
tail -10 .claude/agent-activity.log

# Monitor workflow progress
tail -10 logs/workflow-progress.log
```

## Common Issues & Solutions

### Issue 1: Agent Handoff Failures

#### Symptoms
- Agents report "handoff incomplete" errors
- Missing artifacts for next agent
- Workflow state not updating

#### Diagnosis
```bash
# Check workflow state
jq '.activeAgent, .nextAgent, .completedAgents' .bmad-core/workflow-state.json

# Verify expected artifacts
ls -la docs/ tasks/

# Check handoff logs
grep "HANDOFF" logs/agent-interactions.log | tail -5
```

#### Solutions

**Solution A: Manual State Reset**
```bash
# Backup current state
cp .bmad-core/workflow-state.json .bmad-core/backups/error-state-$(date +%s).json

# Reset to safe state
jq '.status = "ready" | .activeAgent = "none"' .bmad-core/workflow-state.json > temp.json
mv temp.json .bmad-core/workflow-state.json
```

**Solution B: Force Agent Completion**
```bash
# Mark agent as completed manually
jq '.completedAgents += ["analyst"] | .nextAgent = "pm"' .bmad-core/workflow-state.json > temp.json
mv temp.json .bmad-core/workflow-state.json
```

**Solution C: Recreate Missing Artifacts**
```bash
# For planning phase - recreate project brief template
mkdir -p docs
cat > docs/project-brief.md << 'EOF'
# Project Brief: Manual Recovery
Generated for troubleshooting - please update with actual content.

## Project Overview
[Update with project details]

## Requirements
[Add project requirements]
EOF
```

### Issue 2: File System Conflicts

#### Symptoms
- "File in use" errors
- Corruption of shared files
- Permission denied errors

#### Diagnosis
```bash
# Check file locks
find . -name "*.lock" -type f

# Check file permissions
ls -la docs/ tasks/ logs/

# Identify file conflicts
lsof | grep $(pwd) 2>/dev/null || echo "lsof not available"
```

#### Solutions

**Solution A: Clear File Locks**
```bash
# Remove stale lock files
find . -name "*.lock" -mtime +1 -delete

# Clean temporary files
find . -name "*.tmp" -delete
```

**Solution B: Fix Permissions**
```bash
# Set proper permissions for shared files
chmod -R 755 docs/ tasks/ logs/
chmod 644 .bmad-core/workflow-state.json
```

**Solution C: Reset File System State**
```bash
# Use safety system to restore from backup
node .claude/safety-system.js list
node .claude/safety-system.js restore [latest-backup-name]
```

### Issue 3: Agent Command Not Found

#### Symptoms
- "Command not found" when using `/analyst`, `/pm`, etc.
- BMAD agents not available in Claude Code
- Empty response from agent commands

#### Diagnosis
```bash
# Check BMAD installation
ls -la .claude/commands/BMad/

# Verify agent commands
find .claude/commands/ -name "*.md" | grep -i bmad

# Check BMAD core installation
ls -la .bmad-core/
```

#### Solutions

**Solution A: Reinstall BMAD Commands**
```bash
# Reinstall BMAD-METHOD
npx bmad-method install -f -d . -i claude-code

# Verify installation
ls .claude/commands/BMad/
```

**Solution B: Manual Command Creation**
```bash
# Create missing agent command template
mkdir -p .claude/commands/BMad
cat > .claude/commands/BMad/analyst.md << 'EOF'
# Analyst Agent

You are a BMAD business analyst agent. Your role is to conduct market research, 
analyze requirements, and create comprehensive project briefs.

## Responsibilities
- Market analysis and competitive research
- Project brief creation
- Stakeholder requirement gathering
- Business case development

## Deliverables
- docs/project-brief.md
- docs/market-analysis.md

## Workflow Integration
Update workflow state and hand off to PM agent when complete.
EOF
```

### Issue 4: Workflow State Corruption

#### Symptoms
- Invalid JSON in workflow state
- Missing required fields
- Impossible state transitions

#### Diagnosis
```bash
# Validate JSON syntax
cat .bmad-core/workflow-state.json | jq . || echo "JSON invalid"

# Check for required fields
jq 'keys' .bmad-core/workflow-state.json

# Review recent state changes
grep "STATE_CHANGE" logs/workflow-progress.log | tail -5
```

#### Solutions

**Solution A: Restore from Backup**
```bash
# List available backups
ls -la .bmad-core/backups/

# Restore from latest backup
cp .bmad-core/backups/state-*.json .bmad-core/workflow-state.json
```

**Solution B: Rebuild State File**
```bash
# Create fresh workflow state
cat > .bmad-core/workflow-state.json << 'EOF'
{
  "currentPhase": "initialization",
  "activeAgent": "none", 
  "status": "ready",
  "sharedContext": {
    "artifacts": [],
    "workspace": "$(pwd)"
  },
  "createdAt": "$(date -Iseconds)"
}
EOF
```

### Issue 5: Hook System Failures

#### Symptoms
- Hooks not triggering
- Error messages about hook execution
- Automation not working

#### Diagnosis
```bash
# Validate hook configuration
node .claude/validate-hooks.js

# Check hook execution logs
grep "HOOK" .claude/agent-activity.log

# Test hook system
node .claude/safety-system.js validate
```

#### Solutions

**Solution A: Reset Hook Configuration**
```bash
# Backup current hooks
node .claude/safety-system.js backup "Pre-reset backup"

# Reset to basic hooks
cp .claude/hooks.json .claude/hooks.json.backup
echo '{"hooks": {}}' > .claude/hooks.json
```

**Solution B: Reinstall Rule2Hook System**
```bash
# Reinstall rule2hook integration
cp claudecode-rule2hook/.claude/commands/rule2hook.md .claude/commands/

# Test rule2hook functionality
echo "Test rule: Format files after editing" | node .claude/commands/rule2hook.md
```

### Issue 6: Performance Problems

#### Symptoms
- Slow agent execution
- Timeouts during workflow
- High memory usage

#### Diagnosis
```bash
# Check system resources
ps aux | grep node
df -h .
du -sh .bmad-core/ .claude/

# Monitor workflow performance
time node scripts/validate-bmad-workflow.js
```

#### Solutions

**Solution A: Clean Up Logs**
```bash
# Archive old logs
mkdir -p logs/archive
mv logs/*.log logs/archive/
touch logs/{workflow-progress,agent-interactions,development}.log

# Clean up backups
find .bmad-core/backups/ -mtime +7 -delete
```

**Solution B: Optimize Configuration**
```bash
# Reduce log verbosity in hooks
jq '.hooks.PostToolUse = []' .claude/integration-hooks.json > temp.json
mv temp.json .claude/integration-hooks.json

# Clear agent activity history
echo "# Agent activity log - Reset $(date)" > .claude/agent-activity.log
```

## Advanced Troubleshooting

### Deep System Analysis

#### 1. Complete System Health Check
```bash
# Run comprehensive validation
node scripts/validate-bmad-workflow.js > validation-report.txt 2>&1

# Check Claude Code configuration
cat .claude/claude.json 2>/dev/null || echo "Claude config not found"

# Verify git status if applicable
git status 2>/dev/null || echo "Not a git repository"
```

#### 2. Workflow State History Analysis
```bash
# Analyze workflow progression
grep -E "(PHASE_START|HANDOFF|_COMPLETE)" logs/workflow-progress.log

# Track agent execution patterns
grep -E "(ANALYST|PM|ARCHITECT|PO|SM|DEV|QA|UX)" logs/agent-interactions.log

# Identify error patterns
grep -i error logs/*.log
```

#### 3. Performance Profiling
```bash
# Profile workflow validation
time node scripts/validate-bmad-workflow.js

# Check file system performance
time find . -type f -name "*.md" | wc -l

# Memory usage analysis
du -sh * | sort -h
```

### Emergency Recovery Procedures

#### Complete System Reset
```bash
#!/bin/bash
# emergency-reset.sh - Use only in critical situations

echo "WARNING: This will reset the entire BMAD workflow system!"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" = "yes" ]; then
    # Backup everything
    mkdir -p emergency-backup/$(date +%Y%m%d-%H%M%S)
    cp -r .bmad-core .claude docs tasks logs emergency-backup/$(date +%Y%m%d-%H%M%S)/
    
    # Clean slate reset
    rm -rf .bmad-core .claude/hooks* logs/*
    
    # Reinitialize
    node scripts/validate-bmad-workflow.js fix
    npx bmad-method install -f -d . -i claude-code
    
    echo "System reset complete. Restore from emergency-backup if needed."
else
    echo "Reset cancelled."
fi
```

#### State Recovery from Logs
```bash
#!/bin/bash
# recover-from-logs.sh - Reconstruct workflow state from logs

# Find last known good state
last_phase=$(grep "PHASE_START" logs/workflow-progress.log | tail -1 | awk '{print $3}')
last_agent=$(grep "HANDOFF" logs/agent-interactions.log | tail -1 | awk -F" -> " '{print $2}' | awk '{print $1}')

# Reconstruct state
cat > .bmad-core/workflow-state.json << EOF
{
  "currentPhase": "${last_phase:-initialization}",
  "activeAgent": "${last_agent:-none}",
  "status": "recovered",
  "sharedContext": {
    "artifacts": [],
    "workspace": "$(pwd)",
    "recovery": true
  },
  "recoveredAt": "$(date -Iseconds)"
}
EOF

echo "State recovered from logs. Current phase: $last_phase, Last agent: $last_agent"
```

## Monitoring & Prevention

### 1. Continuous Monitoring Setup
```bash
# Create monitoring script
cat > scripts/monitor-bmad.sh << 'EOF'
#!/bin/bash
# Continuous BMAD workflow monitoring

while true; do
    # Check workflow health every 30 seconds
    if ! node scripts/validate-bmad-workflow.js >/dev/null 2>&1; then
        echo "$(date): Workflow validation failed" >> logs/monitor.log
        # Send alert if configured
        echo "BMAD workflow issue detected" | mail -s "Workflow Alert" admin@example.com 2>/dev/null
    fi
    sleep 30
done
EOF

chmod +x scripts/monitor-bmad.sh
```

### 2. Automated Backup System
```bash
# Create backup cron job
cat > scripts/backup-bmad.sh << 'EOF'
#!/bin/bash
# Automated BMAD backup

backup_dir="backups/$(date +%Y%m%d)"
mkdir -p "$backup_dir"

# Backup critical files
cp -r .bmad-core "$backup_dir/"
cp -r .claude "$backup_dir/"
cp -r docs "$backup_dir/"
cp -r tasks "$backup_dir/"

# Compress and clean old backups
tar -czf "$backup_dir.tar.gz" "$backup_dir"
rm -rf "$backup_dir"

# Keep only last 7 days
find backups/ -name "*.tar.gz" -mtime +7 -delete

echo "$(date): Backup completed" >> logs/backup.log
EOF
```

### 3. Health Check Integration
```bash
# Add to existing hooks for automatic health monitoring
cat >> .claude/hooks.json << 'EOF'
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node scripts/validate-bmad-workflow.js >/dev/null || echo 'Workflow validation failed after session' >> logs/health-check.log"
          }
        ]
      }
    ]
  }
}
EOF
```

## Contact & Support

### Getting Help
1. **Check Logs First**: Always review logs before seeking help
2. **Run Validation**: Use the validation script to identify issues
3. **Backup Before Changes**: Always backup state before making changes
4. **Document Issues**: Include validation output and error logs

### Support Resources
- **Documentation**: `docs/bmad-*.md` files
- **Templates**: `templates/bmad-workflows/` for reference implementations
- **Scripts**: `scripts/` directory for diagnostic tools
- **Validation**: `scripts/validate-bmad-workflow.js` for system health

### Escalation Path
1. **Self-Service**: Use this guide and validation tools
2. **Team Lead**: Provide validation output and error logs
3. **System Admin**: Include complete system state backup
4. **Emergency**: Use emergency reset procedures if system is unrecoverable

Remember: Most BMAD workflow issues are resolved through proper state management and file system hygiene. Always validate system health after making changes.
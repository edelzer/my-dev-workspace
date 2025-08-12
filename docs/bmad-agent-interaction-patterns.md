# BMAD Agent Interaction Patterns

## Overview
This document defines how BMAD agents interact with each other and maintain shared development state across all workflow operations. All agents work within the same file system, development logs, and project context to ensure consistency.

## Unified File System Architecture

### Shared Development Files
All BMAD agents operate on the same file system with standardized paths:

```
my-dev-workspace/
├── .claude/                    # Claude Code configuration (shared across agents)
│   ├── commands/BMad/         # BMAD agent commands
│   ├── hooks.json             # Shared automation rules
│   └── agent-activity.log     # Cross-agent activity tracking
├── .bmad-core/                # BMAD framework files
│   ├── activity.json          # Agent coordination state
│   ├── workflow-state.json    # Current workflow status
│   └── handoffs/              # Agent-to-agent handoff data
├── projects/                  # Development projects (shared workspace)
├── docs/                      # Shared documentation
└── logs/                      # Unified development logs
    ├── agent-interactions.log # Agent communication log
    ├── workflow-progress.log  # Workflow state changes
    └── development.log        # Development activity log
```

## Agent Interaction Patterns

### 1. Planning Phase Coordination
**Agents:** `/analyst`, `/pm`, `/architect`, `/po`

#### Handoff Pattern:
1. **Analyst** → Creates `project-brief.md` in shared docs/
2. **PM** → Reads brief, creates `requirements.md` and `prd.md`
3. **Architect** → Reads requirements, creates `technical-design.md`
4. **PO** → Reviews all documents, creates `epic-breakdown.md`

#### Shared State Management:
```json
// .bmad-core/workflow-state.json
{
  "currentPhase": "planning",
  "activeAgent": "analyst",
  "completedArtifacts": ["project-brief.md"],
  "nextAgent": "pm",
  "sharedContext": {
    "projectName": "current-project",
    "requirements": "requirements.md",
    "techStack": "determined-by-architect"
  }
}
```

### 2. Development Phase Coordination
**Agents:** `/dev`, `/sm`, `/qa`, `/ux-expert`

#### Handoff Pattern:
1. **SM** → Creates stories in `tasks/current-sprint/`
2. **DEV** → Implements code, updates `development.log`
3. **QA** → Reviews code, adds results to `qa-reports/`
4. **UX-Expert** → Reviews UI, updates `design-review.md`

#### Shared Development Logs:
```bash
# logs/development.log format
[2024-01-15 14:30:22] DEV: Started implementation of user authentication
[2024-01-15 14:45:18] QA: Code review initiated for auth module
[2024-01-15 15:12:34] UX: UI review completed, approved design patterns
[2024-01-15 15:30:45] SM: Story marked complete, moving to next sprint item
```

### 3. Orchestration Coordination
**Agents:** `/bmad-orchestrator`, `/bmad-master`

#### Master Coordination Pattern:
```json
// .bmad-core/activity.json
{
  "orchestration": {
    "masterAgent": "bmad-master",
    "activeOrchestrator": "bmad-orchestrator",
    "agentQueue": ["analyst", "pm", "dev"],
    "currentWorkflow": "feature-development",
    "sharedState": {
      "projectFiles": ["src/", "docs/", "tests/"],
      "logs": ["logs/agent-interactions.log"],
      "artifacts": ["docs/requirements.md", "docs/technical-design.md"]
    }
  }
}
```

## Communication Protocols

### 1. Agent-to-Agent Handoffs
```bash
# Example handoff from analyst to pm
echo "$(date): HANDOFF analyst -> pm: Project brief complete" >> logs/agent-interactions.log
echo "$(date): CONTEXT: project-brief.md ready for PM review" >> .claude/agent-activity.log
```

### 2. Shared Context Updates
```bash
# Update shared workflow state
echo "$(date): STATE_CHANGE: currentPhase=planning, activeAgent=pm" >> logs/workflow-progress.log
```

### 3. Error Handling and Recovery
```bash
# Agent error logging
echo "$(date): ERROR: Agent pm failed requirements gathering" >> logs/agent-interactions.log
echo "$(date): RECOVERY: Falling back to bmad-orchestrator" >> logs/workflow-progress.log
```

## State Persistence Patterns

### 1. Workflow State Files
Every agent reads and updates the same workflow state files:
- `.bmad-core/workflow-state.json` - Current workflow status
- `.bmad-core/activity.json` - Agent activity coordination
- `.claude/agent-activity.log` - Cross-agent activity log

### 2. Artifact Management
All agents create and consume artifacts in shared locations:
- `docs/` - All documentation artifacts
- `tasks/` - Sprint and story management
- `qa-reports/` - Quality assurance results
- `design-review.md` - UX and design decisions

### 3. Development Context Sharing
```bash
# Shared environment setup for all agents
export BMAD_WORKSPACE="$(pwd)"
export BMAD_STATE_FILE="$BMAD_WORKSPACE/.bmad-core/workflow-state.json"
export BMAD_LOG_DIR="$BMAD_WORKSPACE/logs"
export CLAUDE_CONFIG_DIR="$BMAD_WORKSPACE/.claude"
```

## Agent Workflow Validation

### 1. Pre-Agent Execution Checks
```bash
# Verify shared state exists
if [ ! -f ".bmad-core/workflow-state.json" ]; then
    echo "Creating initial workflow state"
    mkdir -p .bmad-core
    echo '{"currentPhase":"initialization"}' > .bmad-core/workflow-state.json
fi
```

### 2. Post-Agent Execution Updates
```bash
# Update activity log after agent completes
echo "$(date): Agent $(basename $0) completed successfully" >> .claude/agent-activity.log
echo "$(date): Updated shared state in workflow-state.json" >> logs/workflow-progress.log
```

## Integration with Rule2Hook Automation

### Automated Agent Coordination
```json
// .claude/hooks.json - Agent coordination automation
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Task",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$TOOL_OUTPUT\" | grep -q 'bmad'; then echo \"$(date): BMAD agent activity detected\" >> .claude/agent-activity.log; fi"
          }
        ]
      }
    ]
  }
}
```

## Best Practices

### 1. Shared File Access
- Always check file existence before reading
- Use atomic writes for shared state updates
- Log all state changes for debugging

### 2. Agent Communication
- Use structured logging for all agent interactions
- Include timestamps in all log entries
- Maintain clear handoff documentation

### 3. Error Recovery
- Always log errors to shared error log
- Provide fallback agents for critical workflows
- Maintain workflow state integrity during failures

## Troubleshooting

### Common Issues
1. **State File Corruption**: Use `.bmad-core/backups/` for recovery
2. **Agent Conflicts**: Check `logs/agent-interactions.log`
3. **Missing Context**: Verify all shared files exist

### Debug Commands
```bash
# Check agent activity
tail -f .claude/agent-activity.log

# Monitor workflow state
watch -n 1 'cat .bmad-core/workflow-state.json | jq .'

# View agent interactions
tail -20 logs/agent-interactions.log
```
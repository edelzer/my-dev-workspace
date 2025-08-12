# BMAD Workflow Best Practices Guide

## Overview
This guide establishes best practices for BMAD agent workflows, ensuring consistency, reliability, and optimal collaboration across all development phases.

## Core Workflow Principles

### 1. Unified State Management
**PRINCIPLE**: All agents operate on shared state with atomic updates

#### Best Practices:
- **Single Source of Truth**: Use `.bmad-core/workflow-state.json` for all workflow state
- **Atomic Updates**: Always backup before modifying shared state
- **Conflict Resolution**: Use timestamps and agent priorities for conflicts
- **State Validation**: Validate state before and after agent execution

#### Implementation:
```bash
# Template for state updates
backup_state() {
    cp .bmad-core/workflow-state.json .bmad-core/backups/state-$(date +%s).json
}

update_state() {
    backup_state
    echo "$1" | jq . > .bmad-core/workflow-state.json.tmp
    mv .bmad-core/workflow-state.json.tmp .bmad-core/workflow-state.json
    echo "$(date): State updated by $(basename $0)" >> logs/workflow-progress.log
}
```

### 2. Structured Logging
**PRINCIPLE**: All agent activities must be logged for debugging and coordination

#### Logging Standards:
```bash
# Standard log format
LOG_FORMAT="[$(date '+%Y-%m-%d %H:%M:%S')] AGENT:$(basename $0) ACTION:$1 STATUS:$2"

# Usage examples
log_action "START" "SUCCESS" "Beginning requirements analysis"
log_action "HANDOFF" "SUCCESS" "Passing to PM agent"
log_action "ERROR" "FAILED" "Unable to access requirements file"
```

#### Log Destinations:
- **Agent Activity**: `.claude/agent-activity.log` (Claude Code integration)
- **Workflow Progress**: `logs/workflow-progress.log` (workflow state changes)
- **Agent Interactions**: `logs/agent-interactions.log` (handoffs and communication)
- **Development Activity**: `logs/development.log` (code changes and builds)

### 3. Agent Handoff Protocol
**PRINCIPLE**: Clean handoffs with complete context transfer

#### Handoff Checklist:
1. ✅ Complete current agent's deliverables
2. ✅ Update workflow state with next agent info
3. ✅ Log handoff with context summary
4. ✅ Verify next agent has all required artifacts
5. ✅ Clean up temporary files and state

#### Handoff Template:
```bash
execute_handoff() {
    local next_agent=$1
    local context_summary=$2
    
    # Complete current work
    finalize_deliverables
    
    # Update workflow state
    jq --arg agent "$next_agent" --arg context "$context_summary" \
       '.nextAgent = $agent | .handoffContext = $context' \
       .bmad-core/workflow-state.json > temp.json
    mv temp.json .bmad-core/workflow-state.json
    
    # Log handoff
    echo "$(date): HANDOFF $(basename $0) -> $next_agent: $context_summary" >> logs/agent-interactions.log
    
    # Verify handoff readiness
    validate_handoff_ready "$next_agent"
}
```

## Phase-Specific Best Practices

### Planning Phase Workflows

#### 1. Market Analysis (`/analyst`)
**Deliverables**: `docs/project-brief.md`, `docs/market-analysis.md`

```bash
# Analyst workflow template
execute_analyst_workflow() {
    # Initialize planning phase
    update_workflow_state "planning" "analyst"
    
    # Create project brief
    create_project_brief
    
    # Conduct market analysis
    analyze_market_conditions
    
    # Prepare handoff to PM
    execute_handoff "pm" "Project brief and market analysis complete"
}
```

#### 2. Product Management (`/pm`)
**Deliverables**: `docs/requirements.md`, `docs/prd.md`, `tasks/epics.md`

```bash
# PM workflow template
execute_pm_workflow() {
    # Verify analyst handoff
    validate_artifact "docs/project-brief.md"
    
    # Create requirements
    generate_requirements_from_brief
    
    # Create PRD
    create_product_requirements_document
    
    # Break down epics
    create_epic_breakdown
    
    # Handoff to architect
    execute_handoff "architect" "Requirements and PRD ready for technical design"
}
```

### Development Phase Workflows

#### 1. Development (`/dev`)
**Deliverables**: Source code, unit tests, documentation updates

```bash
# Development workflow template
execute_dev_workflow() {
    # Verify story readiness
    validate_story_ready
    
    # Set up development environment
    setup_dev_environment
    
    # Implement features with TDD
    implement_with_tdd
    
    # Run validation
    run_development_validation
    
    # Handoff to QA
    execute_handoff "qa" "Feature implementation complete, ready for testing"
}
```

#### 2. Quality Assurance (`/qa`)
**Deliverables**: `qa-reports/`, test results, code review feedback

```bash
# QA workflow template
execute_qa_workflow() {
    # Verify development handoff
    validate_development_complete
    
    # Run comprehensive tests
    execute_test_suite
    
    # Code review
    perform_code_review
    
    # Generate QA report
    create_qa_report
    
    # Determine next step (approve or back to dev)
    determine_qa_outcome
}
```

## Shared Workspace Management

### 1. File Organization Standards
```
project-root/
├── docs/                      # All documentation (shared across agents)
│   ├── project-brief.md      # Analyst output
│   ├── requirements.md       # PM output  
│   ├── technical-design.md   # Architect output
│   ├── epic-breakdown.md     # PO output
│   └── qa-reports/           # QA outputs
├── tasks/                     # Sprint and story management
│   ├── current-sprint/       # Active development
│   ├── backlog/             # Future work
│   └── completed/           # Finished stories
├── src/                      # Source code (shared development)
├── tests/                    # All testing (unit, integration, e2e)
└── logs/                     # Unified logging system
```

### 2. Artifact Ownership and Access
| Agent | Creates | Reads | Updates |
|-------|---------|-------|---------|
| Analyst | project-brief.md | - | - |
| PM | requirements.md, prd.md | project-brief.md | - |
| Architect | technical-design.md | requirements.md, prd.md | - |
| Dev | src/, tests/ | technical-design.md, tasks/ | logs/development.log |
| QA | qa-reports/ | src/, tests/ | qa-reports/ |

### 3. Conflict Resolution
```bash
# Conflict resolution template
resolve_file_conflict() {
    local file=$1
    local agent=$(basename $0)
    
    if [ -f "$file.lock" ]; then
        echo "$(date): CONFLICT $agent waiting for $file" >> logs/agent-interactions.log
        while [ -f "$file.lock" ]; do
            sleep 1
        done
    fi
    
    # Create lock
    echo "$agent:$$:$(date)" > "$file.lock"
    
    # Use file safely
    trap "rm -f $file.lock" EXIT
}
```

## Performance and Monitoring

### 1. Agent Performance Metrics
Track key metrics for workflow optimization:

```json
// .bmad-core/performance-metrics.json
{
  "agentMetrics": {
    "analyst": {
      "avgExecutionTime": "15:30",
      "successRate": 0.98,
      "handoffAccuracy": 0.95
    },
    "pm": {
      "avgExecutionTime": "22:15", 
      "successRate": 0.97,
      "requirementsQuality": 0.93
    }
  },
  "workflowMetrics": {
    "planningPhaseAvg": "45:00",
    "developmentPhaseAvg": "120:30",
    "qaPhaseAvg": "30:45"
  }
}
```

### 2. Continuous Monitoring
```bash
# Performance monitoring script
monitor_workflow_performance() {
    local start_time=$(date +%s)
    local agent=$(basename $0)
    
    # Execute agent workflow
    execute_agent_workflow
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Log performance
    echo "$(date): PERFORMANCE $agent duration=${duration}s" >> logs/performance.log
    
    # Update metrics
    update_performance_metrics "$agent" "$duration"
}
```

## Integration with Claude Code Hooks

### 1. Automated Workflow Triggers
```json
// .claude/bmad-workflow-hooks.json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Task",
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$TOOL_OUTPUT\" | grep -E '(/analyst|/pm|/dev|/qa)'; then echo \"$(date): BMAD agent executed via Claude Code\" >> .claude/agent-activity.log && update_workflow_metrics; fi"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Task", 
        "hooks": [
          {
            "type": "command",
            "command": "if echo \"$TOOL_INPUT\" | grep -E '(/analyst|/pm|/dev|/qa)'; then validate_workflow_state_ready || echo 'Warning: Workflow state may not be ready'; fi"
          }
        ]
      }
    ]
  }
}
```

### 2. State Synchronization
```bash
# Hook for maintaining state sync
sync_workflow_state() {
    # Ensure all required directories exist
    mkdir -p logs .bmad-core/backups docs tasks/{current-sprint,backlog,completed}
    
    # Initialize workflow state if missing
    if [ ! -f ".bmad-core/workflow-state.json" ]; then
        echo '{"currentPhase":"initialization","activeAgent":"none","status":"ready"}' > .bmad-core/workflow-state.json
    fi
    
    # Log sync
    echo "$(date): Workflow state synchronized" >> logs/workflow-progress.log
}
```

## Error Handling and Recovery

### 1. Agent Failure Recovery
```bash
# Failure recovery template
handle_agent_failure() {
    local failed_agent=$1
    local error_message=$2
    
    # Log failure
    echo "$(date): FAILURE $failed_agent: $error_message" >> logs/agent-interactions.log
    
    # Create error state backup
    cp .bmad-core/workflow-state.json .bmad-core/backups/error-state-$(date +%s).json
    
    # Reset to safe state
    jq '.status = "error" | .lastError = $error | .errorAgent = $agent' \
       --arg error "$error_message" --arg agent "$failed_agent" \
       .bmad-core/workflow-state.json > temp.json
    mv temp.json .bmad-core/workflow-state.json
    
    # Trigger recovery workflow
    trigger_recovery_workflow "$failed_agent"
}
```

### 2. Workflow State Recovery
```bash
# Recovery workflow
recover_workflow() {
    echo "$(date): Starting workflow recovery" >> logs/workflow-progress.log
    
    # Find latest good state backup
    local latest_backup=$(ls -t .bmad-core/backups/state-*.json 2>/dev/null | head -1)
    
    if [ -n "$latest_backup" ]; then
        echo "Recovering from backup: $latest_backup"
        cp "$latest_backup" .bmad-core/workflow-state.json
        echo "$(date): Workflow state recovered from backup" >> logs/workflow-progress.log
    else
        echo "No backup found, initializing fresh state"
        initialize_workflow_state
    fi
}
```

## Team Collaboration Standards

### 1. Agent Communication Protocol
- **Structured Messages**: Use standardized formats for all inter-agent communication
- **Context Preservation**: Always include necessary context in handoffs
- **Error Reporting**: Immediate notification of failures with recovery suggestions

### 2. Documentation Standards
- **Artifact Templates**: Use consistent templates for all deliverables
- **Version Control**: All shared documents must be version controlled
- **Review Process**: Implement peer review for critical documents

### 3. Quality Gates
- **Entry Criteria**: Each agent validates prerequisites before starting
- **Exit Criteria**: Each agent validates deliverables before handoff
- **Quality Checks**: Automated validation where possible

This comprehensive guide ensures all BMAD agents work harmoniously within the shared development environment while maintaining high standards of quality and collaboration.
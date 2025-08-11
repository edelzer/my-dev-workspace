# Workflow State Persistence

## Overview
This system provides comprehensive workflow state persistence, enabling seamless continuation of complex multi-agent workflows across sessions, interruptions, and system restarts while maintaining complete context and progress tracking.

## State Persistence Architecture

### 1. Workflow State Components
```
Workflow State Structure:
├── Active Workflow Identity (current workflow type and phase)
├── Agent States (current agent roles, tasks, and context)
├── Process State (completed steps, current step, pending steps)
├── Context State (project context, technical context, business context)
├── Progress State (task completion, quality gates, milestones)
├── Resource State (team assignments, capacity, dependencies)
└── Configuration State (workflow parameters, customizations)
```

### 2. Persistent Storage Structure
**Location**: `docs/state/` directory hierarchy
```
docs/state/
├── workflow-state.json           # Current active workflow state
├── agent-states/                # Individual agent state persistence
│   ├── bmad-agents/            # BMAD agent states
│   │   ├── analyst-state.json   # Business analyst current state
│   │   ├── pm-state.json       # Product manager current state
│   │   ├── architect-state.json # Technical architect current state
│   │   ├── sm-state.json       # Scrum master current state
│   │   ├── dev-state.json      # Developer current state
│   │   └── qa-state.json       # QA specialist current state
│   └── custom-agents/          # Custom agent states  
│       ├── spec-planner-state.json      # Task decomposition state
│       ├── frontend-developer-state.json # Frontend development state
│       ├── backend-developer-state.json  # Backend development state
│       ├── spec-tester-state.json       # Testing specialist state
│       ├── spec-reviewer-state.json     # Code reviewer state
│       └── spec-validator-state.json    # Validation specialist state
├── workflow-history/            # Historical workflow states
│   ├── completed-workflows/     # Successfully completed workflows
│   ├── checkpoints/            # Workflow checkpoint snapshots
│   └── recovery-points/        # Emergency recovery states
└── state-metadata/             # State management metadata
    ├── state-version.json      # Current state schema version
    ├── last-update.json        # Last state update information
    └── integrity-check.json    # State consistency validation
```

## Workflow State Persistence Model

### 1. Master Workflow State
**File**: `docs/state/workflow-state.json`
**Update Frequency**: Real-time (after every significant state change)

```json
{
  "workflow_metadata": {
    "workflow_id": "uuid-string",
    "workflow_type": "bmad-full-lifecycle|planning-only|development-sprint|qa-validation",
    "project_name": "Project Name",
    "start_timestamp": "ISO-8601-timestamp",
    "last_update": "ISO-8601-timestamp",
    "state_version": "1.0.0",
    "persistence_mode": "real-time|checkpoint|manual"
  },
  "current_phase": {
    "phase_name": "planning|development|qa|deployment",
    "phase_start": "ISO-8601-timestamp",
    "phase_progress": 0.0-1.0,
    "phase_status": "not_started|in_progress|completed|blocked|cancelled"
  },
  "active_agents": {
    "primary_agent": "agent-identifier",
    "supporting_agents": ["agent-id-1", "agent-id-2"],
    "agent_roles": {
      "agent-id": "role-description"
    },
    "agent_handoff_queue": ["next-agent", "subsequent-agent"]
  },
  "workflow_progress": {
    "completed_steps": ["step-1", "step-2"],
    "current_step": "step-identifier",
    "pending_steps": ["step-3", "step-4"],
    "blocked_steps": [
      {
        "step_id": "step-identifier",
        "blocker_reason": "dependency-not-met",
        "resolution_target": "ISO-8601-timestamp"
      }
    ]
  },
  "context_references": {
    "project_context_version": "1.2.3",
    "business_context_version": "1.1.5", 
    "technical_context_version": "1.3.1"
  },
  "quality_gates": {
    "passed_gates": ["gate-1", "gate-2"],
    "current_gate": "gate-identifier",
    "pending_gates": ["gate-3", "gate-4"],
    "failed_gates": [
      {
        "gate_id": "gate-identifier",
        "failure_reason": "criteria-not-met",
        "retry_scheduled": "ISO-8601-timestamp"
      }
    ]
  },
  "resource_allocation": {
    "team_assignments": {
      "planning-team": ["analyst", "pm", "architect"],
      "development-team": ["frontend-developer", "backend-developer", "spec-developer"],
      "qa-team": ["spec-tester", "spec-reviewer", "qa", "spec-validator"]
    },
    "capacity_utilization": {
      "planning-team": 0.85,
      "development-team": 0.92,
      "qa-team": 0.67
    }
  },
  "workflow_configuration": {
    "parallel_development_enabled": true,
    "quality_gates_enforced": true,
    "automatic_handoffs": true,
    "stakeholder_notifications": true
  }
}
```

### 2. Agent-Specific State Persistence
**Template for all agents**: Standardized state structure
```json
{
  "agent_metadata": {
    "agent_id": "unique-agent-identifier",
    "agent_type": "bmad|custom",
    "agent_role": "analyst|pm|architect|developer|tester|reviewer|validator",
    "last_active": "ISO-8601-timestamp",
    "state_version": "1.0.0"
  },
  "current_tasks": [
    {
      "task_id": "unique-task-identifier",
      "task_type": "research|development|testing|review|validation",
      "task_status": "not_started|in_progress|waiting|completed|blocked",
      "task_progress": 0.0-1.0,
      "start_time": "ISO-8601-timestamp",
      "estimated_completion": "ISO-8601-timestamp",
      "dependencies": ["task-id-1", "task-id-2"],
      "deliverables": ["deliverable-1", "deliverable-2"]
    }
  ],
  "agent_context": {
    "current_focus": "description-of-current-focus",
    "decisions_made": [
      {
        "decision": "decision-description",
        "rationale": "reasoning-behind-decision", 
        "timestamp": "ISO-8601-timestamp",
        "impact": "high|medium|low"
      }
    ],
    "knowledge_state": {
      "domain_expertise": ["area-1", "area-2"],
      "project_knowledge": ["knowledge-item-1", "knowledge-item-2"],
      "technical_context": ["tech-detail-1", "tech-detail-2"]
    }
  },
  "collaboration_state": {
    "active_handoffs": [
      {
        "handoff_type": "incoming|outgoing",
        "other_agent": "agent-identifier",
        "handoff_content": "description-of-handoff",
        "status": "initiated|in_progress|completed"
      }
    ],
    "communication_log": [
      {
        "timestamp": "ISO-8601-timestamp",
        "communication_type": "handoff|clarification|status-update",
        "with_agent": "agent-identifier",
        "content_summary": "brief-description"
      }
    ]
  },
  "quality_tracking": {
    "quality_gates_participated": ["gate-1", "gate-2"],
    "quality_contributions": [
      {
        "contribution_type": "testing|review|validation|approval",
        "target_deliverable": "deliverable-identifier",
        "quality_score": 0.0-1.0,
        "timestamp": "ISO-8601-timestamp"
      }
    ]
  }
}
```

## State Persistence Mechanisms

### 1. Real-Time State Updates
**Trigger**: Every significant agent action or state change
**Process**:
```
Agent Action → State Change Detection → Impact Assessment → State Update → Persistence → Validation
```

**Implementation Strategy**:
```bash
# Automatic state persistence hooks
persist_workflow_state() {
    local trigger_agent=$1
    local action_type=$2
    local state_changes=$3
    
    # Update master workflow state
    update_workflow_state "$trigger_agent" "$action_type" "$state_changes"
    
    # Update relevant agent states  
    update_agent_state "$trigger_agent" "$action_type" "$state_changes"
    
    # Update related agent states (if cross-agent impact)
    update_related_agent_states "$state_changes"
    
    # Validate state consistency
    validate_state_integrity
    
    # Create incremental backup if significant change
    if [[ "$action_type" == "phase_transition" || "$action_type" == "critical_decision" ]]; then
        create_state_checkpoint "$trigger_agent" "$action_type"
    fi
}
```

### 2. Checkpoint-Based Persistence
**Purpose**: Create restore points at significant workflow milestones
**Frequency**: Phase transitions, major decisions, quality gate completion

```
Checkpoint Creation Triggers:
├── Phase Transitions (planning → development → qa → deployment)
├── Major Decision Points (architecture choices, technology selection)
├── Quality Gate Completion (testing phases, validation milestones)  
├── Team Handoffs (cross-functional transitions)
├── Risk Mitigation Points (when significant risks are resolved)
└── Manual Checkpoints (user-requested save points)
```

**Checkpoint Structure**:
```json
{
  "checkpoint_metadata": {
    "checkpoint_id": "uuid-string",
    "creation_timestamp": "ISO-8601-timestamp",
    "checkpoint_type": "automatic|manual|emergency",
    "trigger_reason": "phase_transition|quality_gate|manual_request",
    "created_by_agent": "agent-identifier"
  },
  "workflow_snapshot": {
    "master_workflow_state": "complete-workflow-state-copy",
    "all_agent_states": "complete-agent-states-copy", 
    "context_states": "all-context-files-copy",
    "progress_states": "complete-progress-data-copy"
  },
  "restoration_metadata": {
    "restoration_complexity": "simple|moderate|complex",
    "estimated_restoration_time": "time-estimate-in-minutes",
    "dependencies": ["external-dependency-1", "external-dependency-2"],
    "validation_steps": ["validation-step-1", "validation-step-2"]
  }
}
```

### 3. Cross-Session State Recovery
**Purpose**: Enable seamless workflow continuation after system restart or interruption

#### Recovery Process
```
System Startup → State Discovery → Integrity Validation → Agent State Restoration → Workflow Resumption
```

**Recovery Validation Steps**:
```
1. State File Integrity Check
   ├── Validate JSON structure of all state files
   ├── Check timestamp consistency across related states  
   ├── Verify state version compatibility
   └── Validate cross-reference consistency

2. Context Consistency Validation
   ├── Ensure context files align with persisted states
   ├── Validate agent knowledge states match context
   ├── Check progress states match completed deliverables
   └── Verify resource allocations are still valid

3. Agent State Restoration
   ├── Load each agent's persisted state
   ├── Restore agent context and knowledge
   ├── Re-establish agent task queues
   └── Validate agent readiness for continuation

4. Workflow Resumption Preparation
   ├── Identify next workflow steps
   ├── Validate all prerequisites for continuation
   ├── Re-establish inter-agent communication channels
   └── Notify relevant stakeholders of resumption
```

## State Management Integration

### 1. BMAD Agent State Integration
**Integration Pattern**: Each BMAD agent maintains its state through the persistence system

```
BMAD Agent State Management:
├── /bmad-orchestrator: Master workflow coordination state
├── /analyst: Business analysis progress and findings state
├── /pm: Product management and requirements state
├── /architect: Technical design and architecture decisions state
├── /sm: Sprint management and story tracking state
├── /dev: Development task execution and code state
└── /qa: Quality assurance and validation state
```

### 2. Custom Agent State Integration
**Integration Pattern**: TodoWrite-integrated state management for custom agents

```
Custom Agent State Synchronization:
├── TodoWrite updates automatically persist to agent state
├── Agent state changes update TodoWrite status
├── Cross-agent task dependencies maintained in state
├── Quality contributions tracked across agent boundaries
└── Progress attribution maintained for performance analysis
```

### 3. Context State Synchronization
**Process**: Ensure context and state remain synchronized

```
Context-State Synchronization Rules:
├── Context changes trigger relevant agent state updates
├── Agent state changes may trigger context updates
├── State persistence includes context version references
├── Context consistency validated during state recovery
└── Context rollback capabilities integrated with state recovery
```

## State Performance and Optimization

### 1. Performance Considerations
```
State Persistence Performance Targets:
├── State Update Latency: < 100ms for individual updates
├── Checkpoint Creation Time: < 5 seconds for full checkpoint
├── State Recovery Time: < 30 seconds for complete restoration
├── Storage Efficiency: < 50MB for typical project state
└── Concurrent Access: Support 10+ agents updating simultaneously
```

### 2. State Optimization Strategies
```
Optimization Techniques:
├── Incremental State Updates (only persist changes)
├── Compressed State Storage (JSON compression for large states)
├── State Partitioning (separate fast-changing from stable state)
├── Background State Persistence (asynchronous writes)
└── State Caching (in-memory state for fast access)
```

### 3. State Cleanup and Maintenance
```
Maintenance Schedule:
├── Daily: Cleanup temporary state files and logs
├── Weekly: Archive old checkpoints and compress historical states
├── Monthly: Validate state integrity and optimize storage
├── Quarterly: Review state schema and upgrade if needed
└── Annually: Archive completed project states and cleanup storage
```

## Monitoring and Alerting

### 1. State Health Monitoring
```
State Health Indicators:
├── State Consistency Score (cross-validation across all state files)
├── Update Frequency (normal vs. abnormal update patterns)
├── Recovery Success Rate (successful state recoveries)
├── Storage Growth Rate (state size growth over time)
└── Performance Metrics (state operation timing)
```

### 2. State-Related Alerts
```
Alert Conditions:
├── State Corruption Detected (integrity validation failures)
├── State Update Failures (persistence operation failures)
├── Recovery Validation Errors (state recovery issues)
├── Storage Capacity Warnings (approaching storage limits)
└── Performance Degradation (state operations taking too long)
```

### 3. State Reporting
```
State Reports:
├── Daily State Health Summary
├── Weekly State Performance Report  
├── Monthly State Storage and Cleanup Report
├── Quarterly State System Optimization Review
└── Annual State Architecture and Evolution Planning
```

This workflow state persistence system ensures reliable, efficient, and comprehensive preservation of workflow state, enabling seamless continuation of complex multi-agent workflows under any circumstances.
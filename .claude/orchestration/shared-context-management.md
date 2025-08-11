# Shared Context Management Across Teams

## Overview
This system manages shared context, knowledge, and state across all BMAD agents and custom development agents to ensure consistent understanding and decision-making throughout the development lifecycle.

## Context Management Architecture

### 1. Centralized Context Store
**Location**: `docs/context/` directory structure
```
docs/context/
├── project-context.md          # Overall project state and decisions
├── technical-context.md        # Technical decisions and architecture
├── business-context.md         # Business requirements and constraints
├── team-context/              # Team-specific contexts
│   ├── planning-team.md       # Planning phase context
│   ├── development-team.md    # Development phase context
│   ├── qa-team.md            # QA phase context
│   └── deployment-team.md    # Deployment phase context
├── agent-memory/              # Agent-specific memory
│   ├── analyst-memory.json    # Business analyst context
│   ├── pm-memory.json        # Product manager context
│   ├── architect-memory.json  # Technical architect context
│   └── [agent]-memory.json   # Per-agent context storage
└── workflows/                 # Workflow state tracking
    ├── current-workflow.md    # Active workflow status
    ├── completed-workflows/   # Historical workflow records
    └── workflow-metrics.json # Performance and success metrics
```

### 2. Context Synchronization Protocol
**Method**: Real-time context updates with versioning and conflict resolution

#### Context Update Workflow
```
1. Agent Action Trigger
   ├── Agent performs action or makes decision
   ├── Context impact assessment
   └── Update requirement determination

2. Context Update Process
   ├── Read current context state
   ├── Apply agent-specific updates
   ├── Validate context consistency
   └── Commit updates with timestamp

3. Cross-Agent Notification
   ├── Identify affected agents/teams
   ├── Broadcast context change notifications
   ├── Update shared context repositories
   └── Trigger dependent workflow updates
```

## Context Categories and Management

### 1. Project-Level Context
**File**: `docs/context/project-context.md`
**Managed by**: All agents (read/write with coordination)
**Content**:
```markdown
# Project Context: [Project Name]

## Current Status
- **Phase**: [Planning/Development/QA/Deployment]
- **Sprint**: [Current sprint number/name]
- **Last Updated**: [Timestamp]
- **Updated By**: [Agent name]

## Key Project Information
- **Objectives**: [Primary business goals]
- **Success Metrics**: [KPIs and measurement criteria]
- **Timeline**: [Key milestones and deadlines]
- **Budget**: [Resource constraints and allocations]

## Stakeholder Context
- **Primary Stakeholders**: [Key decision makers]
- **User Personas**: [Target user characteristics]
- **Business Priorities**: [Current priority ranking]

## Constraints and Dependencies
- **Technical Constraints**: [Technology limitations]
- **Business Constraints**: [Budget, timeline, resource limits]
- **External Dependencies**: [Third-party services, approvals]

## Recent Decisions
- **[Date]**: [Decision] - Rationale: [Why] - Impact: [Consequences]
- **[Date]**: [Decision] - Rationale: [Why] - Impact: [Consequences]

## Outstanding Issues
- **Issue 1**: [Description] - Owner: [Agent] - Deadline: [Date]
- **Issue 2**: [Description] - Owner: [Agent] - Deadline: [Date]
```

### 2. Technical Context
**File**: `docs/context/technical-context.md`
**Managed by**: Technical agents (architect, developers, security-specialist)
**Content**:
```markdown
# Technical Context: [Project Name]

## Architecture Overview
- **System Architecture**: [High-level design decisions]
- **Technology Stack**: [Chosen technologies and versions]
- **Database Design**: [Data model and storage decisions]
- **Infrastructure**: [Deployment and hosting architecture]

## Technical Decisions Log
- **[Date]**: [Technical Decision] - Rationale: [Technical reasoning]
- **[Date]**: [Technology Choice] - Alternatives: [Other options] - Reason: [Selection criteria]

## Code Standards and Conventions
- **Coding Standards**: [Language-specific guidelines]
- **Architecture Patterns**: [Design patterns in use]
- **Testing Standards**: [Test coverage and quality requirements]
- **Security Standards**: [Security practices and requirements]

## Performance Requirements
- **Response Time**: [Performance targets]
- **Throughput**: [Capacity requirements]
- **Scalability**: [Growth expectations]
- **Availability**: [Uptime requirements]

## Technical Debt and Known Issues
- **Technical Debt Item 1**: [Description] - Priority: [High/Medium/Low] - Remediation Plan: [Action items]
- **Known Issue 1**: [Description] - Workaround: [Temporary solution] - Fix Timeline: [When will be resolved]

## Integration Points
- **External APIs**: [Third-party service integrations]
- **Internal Services**: [Service dependencies]
- **Data Sources**: [External data dependencies]
```

### 3. Business Context
**File**: `docs/context/business-context.md`
**Managed by**: Business-focused agents (analyst, pm, po)
**Content**:
```markdown
# Business Context: [Project Name]

## Market Position
- **Target Market**: [Market segment and size]
- **Competitive Landscape**: [Key competitors and differentiation]
- **Value Proposition**: [Unique value delivery]

## User Requirements
- **Primary Users**: [User personas and needs]
- **User Journey**: [Key user workflows]
- **Success Metrics**: [User satisfaction and engagement metrics]

## Business Requirements
- **Functional Requirements**: [What the system must do]
- **Non-Functional Requirements**: [Performance, security, usability]
- **Compliance Requirements**: [Regulatory and legal requirements]

## Feature Prioritization
- **Must-Have Features**: [Core functionality]
- **Should-Have Features**: [Important but not critical]
- **Could-Have Features**: [Nice to have features]
- **Won't-Have Features**: [Explicitly excluded features]

## Business Metrics and KPIs
- **Success Metrics**: [How success will be measured]
- **Performance Indicators**: [Leading indicators of success]
- **Review Schedule**: [When metrics will be evaluated]
```

## Context Sharing Mechanisms

### 1. Automatic Context Propagation
**Trigger**: Any significant agent action or decision
**Process**:
```
Agent Action → Context Analysis → Impact Assessment → Update Context Files → Notify Affected Agents
```

**Implementation**:
```bash
# Hook integration for automatic context updates
# (to be integrated with Rule2Hook system)

# Pre-tool hook: Read current context
before_agent_action() {
    agent_name=$1
    action_type=$2
    
    # Load current context
    source docs/context/project-context.md
    source docs/context/technical-context.md
    source docs/context/business-context.md
}

# Post-tool hook: Update context
after_agent_action() {
    agent_name=$1
    action_type=$2
    context_changes=$3
    
    # Update relevant context files
    update_context_files "$agent_name" "$context_changes"
    
    # Notify other agents of context changes
    notify_affected_agents "$agent_name" "$context_changes"
}
```

### 2. Context Query Interface
**Purpose**: Allow agents to query current context before making decisions

**BMAD Agent Integration**:
```
# Context queries within BMAD agents
/analyst
*context-query "current market research findings"

/pm
*context-query "technical constraints for feature X"

/architect
*context-query "business requirements for scalability"
```

**Custom Agent Integration**:
```
# Context queries within custom agents
spec-planner (via Task tool)
"Query current technical context for task decomposition"

frontend-developer
"Review current UI/UX requirements from business context"

spec-tester
"Validate test coverage against current acceptance criteria"
```

### 3. Context Validation and Consistency
**Process**: Ensure context consistency across all agents and teams

#### Context Validation Rules
```
1. Consistency Checks
   ├── Technical decisions align with business requirements
   ├── Timeline constraints consistent across all contexts
   ├── Resource allocations don't conflict
   └── Dependencies properly tracked and resolved

2. Completeness Validation
   ├── All required context categories populated
   ├── Recent decisions documented with rationale
   ├── Outstanding issues assigned and tracked
   └── Success criteria clearly defined

3. Currency Verification
   ├── Context updated within acceptable timeframes
   ├── Stale information identified and refreshed
   ├── Version conflicts resolved promptly
   └── Agent memory synchronized with current state
```

## Context Access Patterns

### 1. Read-Only Access
**Agents**: All agents can read any context
**Purpose**: Informed decision-making based on current state
**Implementation**: Direct file access to `docs/context/` directory

### 2. Write Access with Coordination
**Agents**: Context owners can update their areas
**Process**:
```
1. Agent requests context update
2. Lock context file to prevent conflicts
3. Read current state
4. Apply updates with change tracking
5. Validate consistency
6. Commit changes with metadata
7. Release lock and notify affected agents
```

### 3. Cross-Context Updates
**Trigger**: Decisions affecting multiple context areas
**Process**:
```
1. Identify cross-context impact
2. Coordinate updates across context files
3. Validate inter-context consistency
4. Apply atomic updates (all or none)
5. Broadcast changes to all affected agents
```

## Context Memory Management

### 1. Agent-Specific Memory
**Location**: `docs/context/agent-memory/[agent]-memory.json`
**Format**:
```json
{
  "agent_id": "analyst",
  "last_active": "2024-01-15T14:30:00Z",
  "current_tasks": [
    {
      "task_id": "market-research-q1",
      "status": "in_progress",
      "context": "Analyzing competitive landscape for task management tools"
    }
  ],
  "recent_decisions": [
    {
      "decision": "Focus on SMB market segment",
      "rationale": "Higher growth potential and less competition",
      "timestamp": "2024-01-15T10:00:00Z"
    }
  ],
  "knowledge_base": {
    "market_insights": ["insight1", "insight2"],
    "stakeholder_preferences": ["preference1", "preference2"],
    "constraints": ["constraint1", "constraint2"]
  },
  "context_version": "1.5.2"
}
```

### 2. Cross-Agent Context Synchronization
**Process**: Ensure all agents have consistent view of project state
```
Synchronization Triggers:
├── Phase transitions (planning → development → QA → deployment)
├── Major decision points (architecture choices, feature prioritization)
├── Schedule changes (timeline adjustments, resource reallocation)
├── Requirement changes (scope adjustments, new constraints)
└── External factors (market changes, stakeholder updates)
```

## Context-Aware Decision Making

### 1. Decision Context Framework
**Purpose**: Ensure all decisions consider full project context
```
Decision Input Sources:
├── Current project context (objectives, constraints, timeline)
├── Technical context (architecture, performance requirements)
├── Business context (user needs, market position)
├── Historical context (previous decisions, lessons learned)
└── Agent-specific context (specialized knowledge, recent activities)
```

### 2. Decision Impact Assessment
**Process**: Evaluate how decisions affect overall project context
```
Impact Assessment Matrix:
├── Business Impact (objectives, user satisfaction, market position)
├── Technical Impact (architecture, performance, maintainability)
├── Resource Impact (timeline, budget, team capacity)
├── Risk Impact (technical risk, business risk, schedule risk)
└── Stakeholder Impact (user experience, team productivity, stakeholder satisfaction)
```

## Monitoring and Metrics

### 1. Context Health Metrics
- **Context Freshness**: Time since last update by category
- **Context Completeness**: % of required context fields populated
- **Context Consistency**: Number of identified inconsistencies
- **Agent Synchronization**: % of agents with current context version

### 2. Context Usage Metrics
- **Context Queries**: Frequency and type of context queries by agent
- **Decision Quality**: Decisions made with full context vs. partial context
- **Context-Driven Success**: Correlation between context completeness and project success
- **Cross-Agent Collaboration**: Frequency of context sharing between agents

This shared context management system ensures all agents operate with complete, current, and consistent information throughout the development lifecycle.
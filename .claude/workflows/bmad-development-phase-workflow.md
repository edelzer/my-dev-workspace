# BMAD Development Phase Workflow Configuration

## Overview
This workflow orchestrates parallel development teams using both BMAD agents and custom development agents for efficient, coordinated implementation.

## Development Team Architecture

### BMAD Development Agents
- **`/sm`** (Scrum Master) - Story creation and sprint management
- **`/dev`** (Developer) - Task execution and implementation
- **`/ux-expert`** (UX Expert) - User experience and frontend design

### Custom Development Agents
- **`spec-planner`** - Task decomposition into 15-30 minute micro-tasks
- **`frontend-developer`** - React/TypeScript UI development
- **`backend-developer`** - Server-side API development
- **`spec-developer`** - Full-stack coordination

## Parallel Development Workflow

### Phase 1: Story Creation & Task Planning
**Lead Agent**: `/sm` (Scrum Master)
**Supporting**: `spec-planner`

```
1. /sm - Create development stories
   *draft → creates story in docs/stories/
   Review and approve stories

2. spec-planner - Decompose complex features
   Break stories into 15-30 minute micro-tasks
   Create task dependency mapping
   Generate development sequence
```

### Phase 2: Parallel Implementation Teams
**Team A: Frontend Development**
- **Primary**: `frontend-developer` (React/TypeScript specialist)
- **Supporting**: `/ux-expert` (UX design and specifications)
- **Integration**: Magic MCP for component generation

**Team B: Backend Development** 
- **Primary**: `backend-developer` (Server-side specialist)
- **Supporting**: `/dev` (General development support)
- **Integration**: Database and API design

**Team C: Full-Stack Coordination**
- **Primary**: `spec-developer` (End-to-end coordinator)
- **Supporting**: Both frontend and backend teams
- **Integration**: Cross-team communication and integration

## Execution Patterns

### Story-Driven Development
```
# Scrum Master creates stories
/sm
*draft

# Planner decomposes tasks
spec-planner (via Task tool)
- Analyze story complexity
- Break into micro-tasks
- Create dependency graph
- Sequence implementation

# Parallel team execution
Frontend Team: frontend-developer + /ux-expert
Backend Team: backend-developer + /dev
Coordination: spec-developer
```

### Task Assignment Strategy
- **Frontend Tasks**: UI components, user interactions, state management
- **Backend Tasks**: APIs, data models, business logic
- **Integration Tasks**: Full-stack features, cross-service communication
- **Coordination Tasks**: Team sync, conflict resolution, progress tracking

### Development Synchronization

#### Daily Coordination Points
1. **Morning Sync**: Each team reports current task status
2. **Integration Check**: Cross-team dependency validation
3. **Evening Review**: Completed task validation and next-day planning

#### Weekly Milestones
- **Sprint Planning**: `/sm` creates weekly story batch
- **Mid-Sprint Check**: Progress review and task reallocation
- **Sprint Review**: Completed feature demonstration

## Inter-Team Communication Protocol

### Shared Context Management
- **Documentation**: Centralized in `docs/` directory
- **Code Standards**: Enforced through shared configuration
- **API Contracts**: Defined and maintained by backend team
- **UI Patterns**: Standardized by frontend team

### Conflict Resolution
1. **Technical Conflicts**: `spec-developer` facilitates resolution
2. **Resource Conflicts**: `spec-planner` adjusts task allocation
3. **Priority Conflicts**: `/sm` provides business priority guidance

### Progress Tracking
- **TodoWrite Integration**: All teams use consistent task tracking
- **Story Status**: Managed in `docs/stories/` directory
- **Code Review**: Cross-team validation before merge
- **Integration Testing**: Coordinated validation of cross-team features

## Workflow State Management

### Team State Tracking
```
Frontend Team State:
- Current sprint stories
- Active micro-tasks
- Component library status
- UI pattern compliance

Backend Team State:
- API development progress
- Database schema status
- Service integration points
- Performance benchmarks

Integration State:
- Cross-team dependencies
- Integration test results
- Deployment readiness
- System-wide metrics
```

### Context Preservation
- **Session Continuity**: Each team maintains development context
- **Handoff Documentation**: Clear transition procedures
- **Decision History**: Rationale tracking for architectural choices
- **Progress Metrics**: Quantified development velocity

## Quality Assurance Integration

### Continuous Quality Checks
- **Code Quality**: ESLint, TypeScript validation
- **Security**: Automated security scanning
- **Performance**: Load testing and benchmarking
- **Integration**: Cross-service validation

### Development Gates
- **Code Review**: Peer validation before merge
- **Testing**: Comprehensive test coverage
- **Security**: Security validation at each commit
- **Integration**: Cross-team compatibility validation

## Usage Examples

### Starting Development Phase
```
# Initialize story creation
/sm
*draft

# Plan task decomposition
/task spec-planner

# Start parallel development
# Terminal 1: Frontend team
frontend-developer

# Terminal 2: Backend team  
backend-developer

# Terminal 3: Coordination
spec-developer
```

### Managing Parallel Workflows
```
# Check team status
/bmad-orchestrator
*status

# Coordinate integration
spec-developer
- Review cross-team dependencies
- Validate integration points
- Manage merge conflicts

# Track overall progress
TodoWrite updates from all teams
Story status in docs/stories/
```

## Best Practices

### Team Coordination
1. **Clear Boundaries**: Define team responsibilities explicitly
2. **Regular Sync**: Daily coordination points
3. **Shared Standards**: Consistent code and documentation standards
4. **Conflict Resolution**: Established escalation procedures

### Task Management
1. **Micro-Task Focus**: 15-30 minute implementation chunks
2. **Dependency Mapping**: Clear task sequencing
3. **Progress Tracking**: Real-time status updates
4. **Adaptive Planning**: Task reallocation as needed

### Quality Maintenance
1. **Continuous Integration**: Automated testing and validation
2. **Cross-Team Review**: Peer validation across teams
3. **Documentation**: Maintained throughout development
4. **Performance Monitoring**: Real-time system metrics

This development phase workflow ensures efficient parallel development while maintaining quality, coordination, and system integration.
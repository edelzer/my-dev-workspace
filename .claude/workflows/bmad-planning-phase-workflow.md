# BMAD Planning Phase Workflow Configuration

## Overview
This workflow demonstrates the orchestrated planning phase using BMAD agents: Analyst → PM → Architect sequence for comprehensive project planning.

## Workflow Sequence

### Phase 1: Business Analysis (*analyst)
**Agent**: `/analyst` (Mary - Business Analyst)
**Purpose**: Initial project discovery, market research, competitive analysis
**Key Commands**:
- `*create-project-brief` - Generate comprehensive project brief
- `*perform-market-research` - Conduct market analysis
- `*create-competitor-analysis` - Analyze competitive landscape
- `*brainstorm {topic}` - Facilitate ideation sessions

**Deliverables**:
- Project Brief Document
- Market Research Report
- Competitive Analysis
- Brainstorming Output

**Handoff Criteria**: Project brief completed with clear business requirements and market context

### Phase 2: Product Management (*pm)
**Agent**: `/pm` (Alex - Product Manager)
**Purpose**: Transform business analysis into structured product requirements
**Key Commands**:
- `*create-prd` - Generate Product Requirements Document
- `*create-epic` - Create epic-level features
- `*create-roadmap` - Develop product roadmap
- `*stakeholder-analysis` - Analyze stakeholder requirements

**Deliverables**:
- Product Requirements Document (PRD)
- Feature Epics
- Product Roadmap
- Stakeholder Analysis

**Dependencies**: Requires analyst deliverables
**Handoff Criteria**: PRD approved with defined features and success metrics

### Phase 3: Technical Architecture (*architect)
**Agent**: `/architect` (Jordan - Technical Architect)
**Purpose**: Design technical architecture and implementation strategy
**Key Commands**:
- `*create-architecture` - Generate system architecture
- `*tech-stack-selection` - Select appropriate technologies
- `*create-technical-spec` - Create detailed technical specifications
- `*infrastructure-design` - Design infrastructure requirements

**Deliverables**:
- System Architecture Document
- Technology Stack Specification
- Technical Requirements
- Infrastructure Design

**Dependencies**: Requires PM deliverables
**Handoff Criteria**: Technical architecture approved and ready for development

## Workflow Execution Pattern

### Sequential Execution
```
1. Start with /analyst
   - Execute business analysis commands
   - Generate required deliverables
   - Validate completeness

2. Transition to /pm
   - Review analyst deliverables
   - Execute product management commands
   - Create PRD and roadmap

3. Transition to /architect
   - Review PM deliverables
   - Execute architecture commands
   - Finalize technical design
```

### Quality Gates
- **Analyst → PM**: Business requirements clarity, market validation
- **PM → Architect**: Feature definition completeness, success metrics defined
- **Architect → Development**: Technical feasibility confirmed, architecture approved

### Context Handoff Protocol
Each agent transition includes:
1. **Deliverable Review**: New agent reviews previous phase outputs
2. **Gap Analysis**: Identify any missing information
3. **Clarification Loop**: Request additional details if needed
4. **Phase Initiation**: Begin specialized agent tasks

## Integration with Custom Agents

### Handoff to Custom Development Agents
After architect completion, workflow transitions to:
- **spec-planner**: Task decomposition using 15-30 minute micro-tasks
- **frontend-developer** & **backend-developer**: Parallel implementation
- **spec-tester**: Comprehensive testing implementation

### Cross-Agent Communication
- Use shared documentation in `docs/` directory
- Maintain consistent terminology across phases
- Track decisions and rationale for future reference

## Usage Examples

### Starting Planning Phase
```
# Begin with business analysis
/analyst
*create-project-brief

# Transition to product management
/pm
*create-prd

# Move to technical architecture
/architect
*create-architecture
```

### Workflow State Tracking
- Use BMAD's built-in workflow management
- Track phase completion in TodoWrite
- Document handoff decisions
- Monitor quality gate completion

## Best Practices

1. **Complete Each Phase**: Don't skip to next agent until current phase deliverables are complete
2. **Review Dependencies**: Each agent should review previous phase outputs before starting
3. **Maintain Context**: Use consistent terminology and references across agents
4. **Document Decisions**: Record rationale for key decisions at each phase
5. **Quality Gates**: Validate completeness before phase transitions

## Troubleshooting

### Phase Transition Issues
- **Missing Context**: Agent reviews previous deliverables
- **Incomplete Requirements**: Return to previous agent for clarification
- **Technical Constraints**: Architect provides feedback to PM for requirement adjustment

### Workflow Recovery
- **State Recovery**: Use `*status` command to check current phase
- **Context Restoration**: Review deliverables in `docs/` directory
- **Phase Restart**: Return to previous agent if needed

This workflow configuration enables systematic, quality-driven planning that integrates seamlessly with the broader development process.
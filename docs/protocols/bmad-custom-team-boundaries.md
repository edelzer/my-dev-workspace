# BMAD vs Custom Agent Team Boundaries

**Version**: 1.0.0  
**Date**: 2025-08-15  
**Status**: Phase 1 Implementation - Clear Team Separation

## Executive Summary

This document establishes **clear operational boundaries** between BMAD Strategic Agents and Custom Implementation Agents, enabling **independent team operation** with cross-validation capabilities. This separation optimizes workflow efficiency while maintaining comprehensive quality assurance through dual-team oversight.

## Team Structure Overview

### BMAD Strategic Team (10 Agents)
**Focus**: Business strategy, planning, and cross-project coordination  
**Operation Mode**: Strategic analysis and high-level planning  
**Workspace**: `.bmad-workspace/` for strategic coordination

### Custom Implementation Team (8 Agents - Optimized)
**Focus**: Technical implementation and code-level execution  
**Operation Mode**: Hands-on development and technical validation  
**Workspace**: `.claude/` for technical coordination

## BMAD Strategic Team Responsibilities

### Strategic Planning & Business Analysis
- **Market Research & Competitive Analysis**: Understanding business context and competitive landscape
- **Product Management & Requirements**: Translating business needs into actionable requirements
- **Business Value Assessment**: Evaluating ROI, cost-benefit, and strategic alignment
- **Cross-Project Portfolio Management**: Coordinating multiple initiatives and resource allocation

### BMAD Agent Specializations
| Agent | Primary Responsibility | Strategic Focus |
|-------|----------------------|-----------------|
| **/analyst** | Market research, competitive analysis | Business intelligence |
| **/pm** | Product management, strategic planning | Product strategy |
| **/architect** | High-level architecture, technology strategy | System strategy |
| **/po** | Product ownership, business requirements | Product definition |
| **/dev** | Development strategy, technical coordination | Technical strategy |
| **/ux-expert** | User experience strategy, design systems | Experience strategy |
| **/qa** | Quality strategy, testing approach | Quality strategy |
| **/sm** | Scrum mastery, agile process optimization | Process strategy |
| **/bmad-orchestrator** | Cross-team coordination, workflow optimization | Orchestration strategy |
| **/bmad-master** | Strategic oversight, decision arbitration | Strategic leadership |

### BMAD Workflow Sequences
**Strategic Planning Sequence**:
```
/analyst → /pm → /architect → /po → /dev + /ux-expert → /qa → /sm → /bmad-orchestrator
```

**Business Validation Sequence**:
```
Custom Team Output → /qa → /bmad-orchestrator → /bmad-master (final approval)
```

## Custom Implementation Team Responsibilities

### Technical Implementation & Code Execution
- **System Architecture Implementation**: Converting strategic designs into technical implementations
- **Code Development & Integration**: Hands-on coding, testing, and system integration
- **Security Analysis & Validation**: Technical security implementation and threat analysis
- **Quality Assurance & Testing**: Code-level quality validation and comprehensive testing

### Custom Agent Specializations (Optimized)
| Agent | Primary Responsibility | Technical Focus |
|-------|----------------------|-----------------|
| **requirements-specialist** | Requirements analysis, planning | Technical requirements |
| **spec-architect** | System design, technical architecture | Technical architecture |
| **frontend-developer** | UI/UX implementation, React/TypeScript | Frontend implementation |
| **backend-developer** | Server-side logic, API development | Backend implementation |
| **spec-developer** | Full-stack integration, system coordination | Integration implementation |
| **quality-assurance-specialist** | Code review, validation, testing | Quality implementation |
| **security-specialist** | Security analysis, threat modeling | Security implementation |
| **project-manager** | Technical coordination, workflow management | Technical coordination |

### Custom Team Workflow Sequences
**Technical Implementation Sequence**:
```
requirements-specialist → spec-architect → [frontend-developer || backend-developer || spec-developer] → quality-assurance-specialist → security-specialist
```

**Quality Validation Sequence**:
```
Implementation Team → quality-assurance-specialist → security-specialist → project-manager (coordination)
```

## Team Boundary Framework

### Clear Separation Principles
1. **Strategic vs Technical**: BMAD handles strategy, Custom handles implementation
2. **Planning vs Execution**: BMAD creates plans, Custom executes them
3. **Business vs Code**: BMAD focuses on business value, Custom focuses on code quality
4. **Cross-Project vs Single-Project**: BMAD coordinates portfolio, Custom delivers projects

### Handoff Protocols Between Teams

#### BMAD → Custom Team Handoff
**Trigger**: Strategic planning complete, implementation ready to begin  
**Handoff Package**:
- Business requirements and strategic context
- High-level architecture and technology decisions
- Success criteria and business constraints
- Resource allocation and timeline expectations

**Validation**: Custom team validates feasibility and provides implementation estimates

#### Custom → BMAD Team Handoff
**Trigger**: Technical implementation complete, business validation required  
**Handoff Package**:
- Implementation summary and technical deliverables
- Quality assurance reports and test results
- Security validation and compliance verification
- Deployment readiness and operational requirements

**Validation**: BMAD team validates business value delivery and strategic alignment

### Independent Operation Protocols

#### BMAD Team Independence
- **Strategic Decision Authority**: Full authority over business strategy and planning decisions
- **Technology Direction**: High-level technology strategy and architectural direction
- **Resource Prioritization**: Business-driven prioritization of features and initiatives
- **Quality Standards**: Definition of business quality standards and success criteria

#### Custom Team Independence
- **Technical Implementation**: Full authority over technical implementation decisions
- **Code Quality**: Technical quality standards and development practices
- **Architecture Details**: Detailed technical architecture and design patterns
- **Security Implementation**: Technical security implementation and validation

### Cross-Team Validation Framework

#### BMAD Validation of Custom Team Output
**Validation Focus**:
- Business requirements satisfaction
- Strategic alignment verification
- User experience quality assessment
- Business value delivery confirmation

**Validation Process**:
1. Custom team completes technical implementation
2. BMAD /qa agent performs business validation
3. /bmad-orchestrator coordinates cross-functional review
4. /bmad-master provides final strategic approval

#### Custom Validation of BMAD Team Planning
**Validation Focus**:
- Technical feasibility assessment
- Implementation complexity evaluation
- Resource requirement validation
- Timeline and scope realism

**Validation Process**:
1. BMAD team completes strategic planning
2. Custom requirements-specialist reviews technical feasibility
3. spec-architect validates architectural approach
4. project-manager confirms resource and timeline feasibility

## Quality Gates & Cross-Validation

### Mandatory Cross-Team Gates
1. **Strategic → Technical Transition**: BMAD plan validated by Custom team before implementation
2. **Technical → Business Validation**: Custom implementation validated by BMAD team before deployment
3. **Quality Assurance Alignment**: Both teams validate quality standards alignment
4. **Security & Compliance**: Dual validation for security and regulatory compliance

### Independent Quality Assurance
- **BMAD Quality Assurance**: Business value, strategic alignment, user experience
- **Custom Quality Assurance**: Code quality, technical security, system performance
- **Cross-Validation**: Both teams must approve for deployment authorization

## Communication & Coordination Protocols

### Communication Channels
- **Strategic Communication**: BMAD team uses strategic planning sessions and business reviews
- **Technical Communication**: Custom team uses technical standups and code reviews  
- **Cross-Team Communication**: Joint sessions at handoff points and quality gates
- **Escalation Communication**: Established escalation paths for conflicts or blockers

### Coordination Mechanisms
- **Shared Documentation**: Common requirements and specifications repository
- **Status Reporting**: Regular status updates between teams
- **Joint Planning**: Collaborative planning sessions for complex initiatives
- **Conflict Resolution**: Established protocols for resolving team disagreements

## Success Metrics & Performance Indicators

### Team Independence Metrics
- **Decision Autonomy**: Percentage of decisions made independently by each team
- **Handoff Efficiency**: Time and quality of inter-team handoffs
- **Validation Effectiveness**: Cross-team validation quality and speed
- **Conflict Resolution**: Frequency and resolution time of inter-team conflicts

### Quality Assurance Metrics
- **Dual Validation Success**: Pass rate of dual validation processes
- **Quality Gap Detection**: Ability to catch issues through cross-team validation
- **Business-Technical Alignment**: Alignment between strategic planning and technical implementation
- **Overall Project Success**: Combined effectiveness of both teams

## Implementation Guidelines

### Team Setup
1. **BMAD Team Activation**: Establish strategic planning workflows and business validation processes
2. **Custom Team Optimization**: Deploy optimized 8-agent structure with automated handoffs
3. **Cross-Team Integration**: Implement handoff protocols and validation gates
4. **Quality Assurance Setup**: Establish dual validation processes and quality metrics

### Training & Onboarding
- **Team Boundary Training**: Educate teams on their specific responsibilities and boundaries
- **Handoff Protocol Training**: Train teams on effective inter-team communication and handoffs
- **Quality Gate Training**: Establish understanding of cross-validation requirements
- **Escalation Training**: Ensure teams understand conflict resolution and escalation procedures

This framework enables maximum efficiency through specialized team operation while ensuring comprehensive quality assurance through strategic dual validation.
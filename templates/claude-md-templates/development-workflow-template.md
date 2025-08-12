# Development Workflow Documentation Template

This template provides comprehensive guidance for implementing development workflows with BMAD multi-agent coordination and security-first principles.

## Workflow Overview

**Workflow Name**: [CUSTOMIZE: Workflow name]
**Workflow Type**: [TDD|Security-First|Performance|Accessibility|Integration]
**Duration**: [CUSTOMIZE: Expected completion time]
**Participants**: [CUSTOMIZE: Required BMAD agents and roles]

## Workflow Phases

### Phase 1: Analysis and Planning
**Duration**: [CUSTOMIZE: Phase duration]
**Primary Agents**: `/analyst`, `/pm`, `/architect`

#### Phase 1 Objectives
- [CUSTOMIZE: Specific analysis objectives]
- [CUSTOMIZE: Planning deliverables required]
- [CUSTOMIZE: Stakeholder engagement requirements]

#### Phase 1 Activities
1. **Market/Technical Analysis** (`/analyst`)
   - [ ] Conduct comprehensive research on [CUSTOMIZE: research scope]
   - [ ] Analyze competitive solutions and best practices
   - [ ] Document findings with actionable insights
   - [ ] Create risk assessment and mitigation strategies

2. **Requirements Definition** (`/pm`)
   - [ ] Create detailed user stories with acceptance criteria
   - [ ] Define functional and non-functional requirements
   - [ ] Establish success metrics and validation criteria
   - [ ] Document stakeholder requirements and approvals

3. **Architecture Design** (`/architect`)
   - [ ] Design system architecture and technical specifications
   - [ ] Create database schema and data flow diagrams
   - [ ] Define API contracts and integration patterns
   - [ ] Document security architecture and threat modeling

#### Phase 1 Quality Gates
- [ ] All research findings validated and documented
- [ ] Requirements approved by stakeholders with clear acceptance criteria
- [ ] Architecture design reviewed and validated by technical leads
- [ ] Security architecture includes comprehensive threat modeling
- [ ] All deliverables reviewed and approved by `/bmad-orchestrator`

### Phase 2: Design and Implementation Planning
**Duration**: [CUSTOMIZE: Phase duration]
**Primary Agents**: `/architect`, `/ux-expert`, `/dev`

#### Phase 2 Objectives
- [CUSTOMIZE: Design objectives and implementation planning]
- [CUSTOMIZE: Technical specification requirements]
- [CUSTOMIZE: User experience design deliverables]

#### Phase 2 Activities
1. **Technical Design** (`/architect`)
   - [ ] Create detailed technical specifications
   - [ ] Design data models and database implementations
   - [ ] Define API specifications and integration contracts
   - [ ] Document deployment and infrastructure requirements

2. **User Experience Design** (`/ux-expert`)
   - [ ] Create wireframes and user interface designs
   - [ ] Develop design system and component specifications
   - [ ] Ensure accessibility compliance in all designs
   - [ ] Create responsive design specifications for all platforms

3. **Implementation Planning** (`/dev`)
   - [ ] Break down features into implementable tasks
   - [ ] Estimate development effort and identify dependencies
   - [ ] Plan test-driven development approach
   - [ ] Create implementation timeline with milestones

#### Phase 2 Quality Gates
- [ ] Technical specifications complete and validated
- [ ] User experience designs approved and meet accessibility standards
- [ ] Implementation plan realistic and addresses all requirements
- [ ] All designs and specifications reviewed by relevant stakeholders
- [ ] Quality gates validated by `/qa` agent before progression

### Phase 3: Development and Testing
**Duration**: [CUSTOMIZE: Phase duration]
**Primary Agents**: `/dev`, `/ux-expert`, `/qa`

#### Phase 3 Objectives
- [CUSTOMIZE: Development implementation objectives]
- [CUSTOMIZE: Testing and quality assurance requirements]
- [CUSTOMIZE: Performance and security validation goals]

#### Phase 3 Activities
1. **Feature Implementation** (`/dev`)
   - [ ] Implement features following TDD methodology
   - [ ] Write comprehensive unit and integration tests
   - [ ] Conduct code reviews with security and performance focus
   - [ ] Document code with clear comments and README updates

2. **User Interface Implementation** (`/ux-expert`)
   - [ ] Implement responsive user interfaces per design specifications
   - [ ] Ensure cross-platform compatibility and performance
   - [ ] Validate accessibility implementation with assistive technologies
   - [ ] Conduct usability testing and iterate based on feedback

3. **Quality Assurance** (`/qa`)
   - [ ] Execute comprehensive testing strategy across all levels
   - [ ] Perform security testing and vulnerability assessments
   - [ ] Validate performance requirements and optimization needs
   - [ ] Ensure compliance with accessibility and quality standards

#### Phase 3 Quality Gates
- [ ] All features implemented and tested according to specifications
- [ ] Security testing completed with no critical vulnerabilities
- [ ] Performance requirements validated and optimized
- [ ] Accessibility compliance verified through assistive technology testing
- [ ] Code coverage meets or exceeds project standards

### Phase 4: Integration and Validation
**Duration**: [CUSTOMIZE: Phase duration]
**Primary Agents**: `/qa`, `/bmad-orchestrator`, `/sm`

#### Phase 4 Objectives
- [CUSTOMIZE: Integration testing and system validation]
- [CUSTOMIZE: End-to-end workflow validation requirements]
- [CUSTOMIZE: Deployment readiness verification]

#### Phase 4 Activities
1. **System Integration Testing** (`/qa`)
   - [ ] Execute end-to-end testing scenarios
   - [ ] Validate system integration points and data flows
   - [ ] Perform load testing and scalability validation
   - [ ] Conduct final security assessment and penetration testing

2. **Workflow Coordination** (`/bmad-orchestrator`)
   - [ ] Validate all agent handoffs and quality gates
   - [ ] Coordinate final reviews and approvals
   - [ ] Ensure documentation completeness and accuracy
   - [ ] Prepare deployment and rollback procedures

3. **Release Coordination** (`/sm`)
   - [ ] Coordinate final sprint activities and deliverables
   - [ ] Manage stakeholder communications and approvals
   - [ ] Document lessons learned and process improvements
   - [ ] Plan post-deployment monitoring and support procedures

#### Phase 4 Quality Gates
- [ ] End-to-end testing completed with all scenarios passing
- [ ] Security assessment completed with acceptable risk profile
- [ ] Performance and scalability requirements validated
- [ ] All documentation updated and deployment procedures tested
- [ ] Stakeholder approvals obtained for production deployment

## Workflow-Specific Command Patterns

### Analysis Phase Commands
```bash
# Market and technical research
/analyst --research [topic] --competitive-analysis --risk-assessment
/pm --requirements [feature] --stakeholders [list] --acceptance-criteria
/architect --design [system] --security-first --scalability [level]

# Example: E-commerce feature analysis
/analyst --research "checkout optimization" --competitive-analysis --risk-assessment
/pm --requirements "one-click checkout" --stakeholders "users,business,legal" --acceptance-criteria
/architect --design "checkout-system" --security-first --scalability high
```

### Design Phase Commands
```bash
# Technical and UX design
/architect --specifications [system] --api-design --database-schema
/ux-expert --wireframes [interface] --accessibility WCAG-AA --responsive
/dev --implementation-plan [feature] --tdd-approach --dependencies

# Example: Mobile payment interface design
/architect --specifications "payment-api" --api-design --database-schema
/ux-expert --wireframes "mobile-payment" --accessibility WCAG-AA --responsive
/dev --implementation-plan "payment-integration" --tdd-approach --dependencies
```

### Development Phase Commands
```bash
# Implementation and testing
/dev --implement [feature] --tdd --security-review
/ux-expert --ui-implementation [design] --cross-platform --performance
/qa --testing [component] --security --performance --accessibility

# Example: Payment feature development
/dev --implement "payment-processing" --tdd --security-review
/ux-expert --ui-implementation "payment-forms" --cross-platform --performance
/qa --testing "payment-flow" --security --performance --accessibility
```

### Integration Phase Commands
```bash
# System integration and validation
/qa --integration-testing [system] --e2e --load-testing
/bmad-orchestrator --coordinate [workflow] --quality-gates --documentation
/sm --release-coordination [sprint] --stakeholder-approval --deployment-prep

# Example: E-commerce system integration
/qa --integration-testing "checkout-system" --e2e --load-testing
/bmad-orchestrator --coordinate "checkout-workflow" --quality-gates --documentation
/sm --release-coordination "sprint-5" --stakeholder-approval --deployment-prep
```

## Quality Standards and Validation

### Documentation Standards
- **Completeness**: All required documentation sections completed with comprehensive details
- **Accuracy**: All information validated through implementation and testing
- **Traceability**: Clear links between requirements, design, implementation, and testing
- **Maintainability**: Documentation structured for ongoing updates and maintenance

### Code Quality Standards
- **Test Coverage**: Minimum [CUSTOMIZE: coverage percentage]% code coverage required
- **Security**: All OWASP Top 10 vulnerabilities addressed and tested
- **Performance**: All performance requirements met and validated
- **Accessibility**: WCAG 2.1 AA compliance verified through automated and manual testing

### Process Quality Standards
- **Agent Coordination**: All handoffs documented and validated through quality gates
- **Timeline Adherence**: Phase timelines met with early escalation of delays
- **Risk Management**: All identified risks tracked with mitigation strategies
- **Continuous Improvement**: Lessons learned documented and process optimizations implemented

## Monitoring and Success Metrics

### Workflow Performance Metrics
- **Phase Completion Time**: Track actual vs. estimated time for each phase
- **Quality Gate Pass Rate**: Percentage of quality gates passed on first attempt
- **Defect Density**: Number of defects per unit of work delivered
- **Agent Coordination Efficiency**: Success rate of agent handoffs and communications

### Business Success Metrics
- **Feature Adoption**: [CUSTOMIZE: specific adoption metrics]
- **User Satisfaction**: [CUSTOMIZE: satisfaction measurement approach]
- **Performance Impact**: [CUSTOMIZE: performance improvement metrics]
- **Business Value**: [CUSTOMIZE: business value measurement criteria]

### Continuous Improvement Metrics
- **Process Efficiency**: Improvement in workflow completion time
- **Quality Improvement**: Reduction in defects and rework
- **Team Satisfaction**: Agent coordination effectiveness and satisfaction
- **Knowledge Transfer**: Effectiveness of documentation and knowledge sharing

## Risk Management

### Common Workflow Risks
1. **Scope Creep**: Requirements changes during development phases
   - **Mitigation**: Clear change management process with stakeholder approval
   - **Escalation**: `/pm` and `/po` coordinate scope change impact assessment

2. **Technical Complexity**: Underestimated implementation complexity
   - **Mitigation**: Detailed technical analysis and proof-of-concept validation
   - **Escalation**: `/architect` and `/dev` collaborate on complexity assessment

3. **Quality Issues**: Quality gates failing due to insufficient testing or implementation issues
   - **Mitigation**: Comprehensive testing strategy with early quality validation
   - **Escalation**: `/qa` coordinates remediation with relevant implementation agents

4. **Integration Problems**: System integration failures or performance issues
   - **Mitigation**: Early integration testing and comprehensive system validation
   - **Escalation**: `/bmad-orchestrator` coordinates cross-agent problem resolution

### Emergency Procedures
1. **Workflow Failure**: Critical workflow failure requiring immediate attention
   - **Response**: Immediate escalation to `/bmad-master` with impact assessment
   - **Recovery**: Emergency procedures activated with stakeholder notification

2. **Security Issues**: Security vulnerabilities discovered during workflow execution
   - **Response**: Immediate workflow suspension and security assessment
   - **Recovery**: Security remediation coordinated by `/qa` with implementation agents

3. **Performance Crisis**: Critical performance issues affecting user experience
   - **Response**: Performance analysis and immediate optimization measures
   - **Recovery**: `/architect` and `/dev` coordinate performance remediation

## Customization Guidelines

### Project-Specific Adaptations
- **Industry Requirements**: Adapt workflow for specific industry compliance needs
- **Technology Constraints**: Modify phases based on technology stack limitations
- **Team Structure**: Adjust agent coordination based on available team members
- **Timeline Constraints**: Scale phase activities based on project timeline requirements

### Scaling Considerations
- **Small Projects**: Streamline phases and combine agent responsibilities
- **Large Projects**: Add additional validation points and specialized agents
- **Enterprise Projects**: Include additional compliance and security validation
- **Multi-Team Projects**: Add cross-team coordination and communication protocols

**Workflow Integration Command**: When executing this workflow, ensure all phases completed with quality gate validation, maintain agent coordination through handoffs, track success metrics continuously, and adapt workflow based on project-specific requirements and constraints.
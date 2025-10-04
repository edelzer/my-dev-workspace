# AI-Optimized Spec-Driven + Test-Driven Development Protocol

## AI Implementation Directives

> **FOR CLAUDE CODE**: This protocol provides mandatory step-by-step instructions for implementing integrated Spec-Driven Development (SDD) and Test-Driven Development (TDD). Follow these directives exactly as written.

### Critical AI Behavior Requirements
1. **NEVER** skip specification creation before writing tests
2. **ALWAYS** validate specification-to-test traceability before implementation
3. **MUST** use the 4-phase cycle: SPECIFY → TEST → IMPLEMENT → REFACTOR
4. **REQUIRED** to check quality gates at each phase transition

## AI Quick Reference Guide

### Mandatory Phase Sequence
```
1. SPECIFY (Blue)  → Create requirements.md, design.md, tasks.md
2. TEST (Red)      → Generate failing tests from specifications  
3. IMPLEMENT (Green) → Write minimal code satisfying tests + specs
4. REFACTOR (Clean) → Optimize while maintaining compliance
```

### Phase Transition Checklist
- **Before TEST**: Specifications must pass quality gate (>95% completeness)
- **Before IMPLEMENT**: Tests must have 100% spec traceability
- **Before REFACTOR**: All tests passing + spec compliance verified
- **Phase Complete**: Documentation updated + quality metrics recorded

---

## AI Execution Protocol Overview

### Core Methodology Integration
**Spec-Driven Development** defines **WHAT** the system must do (business requirements)
**Test-Driven Development** defines **HOW** to verify it works correctly (validation)

### Mandatory AI Workflow
When implementing any feature, you MUST:

1. **SPECIFY FIRST**: Create complete specifications before any code
2. **TEST FROM SPECS**: Generate tests that validate specification requirements
3. **IMPLEMENT TO TESTS**: Write minimal code that passes tests and meets specs
4. **REFACTOR WITH COMPLIANCE**: Optimize while maintaining spec + test alignment

### AI Decision Tree for Each Feature Request
```
Feature Request Received
├── Are specifications complete? → NO: Create specifications first
├── Do tests cover all spec requirements? → NO: Generate missing tests
├── Does implementation pass all tests? → NO: Write/fix implementation
└── Is code optimized while compliant? → NO: Refactor maintaining compliance
```

---

## PHASE 1: SPECIFY (Blue Phase)

### AI Directive: Create Complete Specifications Before Any Code

**MANDATORY**: You must create these files in order:
1. `requirements.md` - Business requirements and acceptance criteria
2. `design.md` - Technical architecture and component design
3. `tasks.md` - Implementation task breakdown (15-30 min chunks)

### Specification Creation Process
```yaml
# AI Execution Steps for SPECIFY Phase:
step_1: "Analyze user requirements and extract business needs"
step_2: "Create requirements.md using EARS format (Event-Action-Response-State)"
step_3: "Generate design.md with technical architecture"
step_4: "Break down into tasks.md with 15-30 minute work chunks"
step_5: "Validate specifications using quality checklist"
step_6: "STOP - Do not proceed to TEST phase until quality gate passes"
```

### Requirements.md Template (MANDATORY FORMAT)
```markdown
# Feature: [Feature Name]

## User Stories
**As a** [user type]
**I want** [functionality]
**So that** [business value]

## Acceptance Criteria (EARS Format)
- WHEN [event] THEN [system response] AND [state change]
- IF [condition] THEN [system action] ELSE [alternative action]
- GIVEN [precondition] WHEN [event] THEN [response]

## Non-Functional Requirements
- Performance: [specific metrics]
- Security: [specific requirements]
- Usability: [specific criteria]
```

### Design.md Template (MANDATORY FORMAT)
```markdown
# Technical Design: [Feature Name]

## Component Architecture
```
Component A → Interface → Component B
    ↑                     ↓
Data Store           Service Layer
```

## API Contracts
```typescript
interface FeatureService {
  method(params: Type): ReturnType;
}
```

## Data Models
```typescript
type FeatureModel = {
  id: string;
  // other properties
};
```

## Integration Points
- External APIs: [list]
- Database tables: [list]
- Dependencies: [list]
```

### Quality Gate: SPECIFY Phase Exit Criteria
**BEFORE proceeding to TEST phase, verify:**
- ☑ requirements.md exists and follows EARS format
- ☑ All user stories have acceptance criteria
- ☑ design.md includes component architecture
- ☑ tasks.md breaks work into 15-30 min chunks
- ☑ No ambiguous or unclear requirements
- ☑ All non-functional requirements specified

---

## PHASE 2: TEST (Red Phase)

### AI Directive: Generate Failing Tests from Specifications

**MANDATORY**: Create comprehensive test suites covering ALL specification requirements

### Test Generation Process
```yaml
# AI Execution Steps for TEST Phase:
step_1: "Load requirements.md and design.md"
step_2: "Map each acceptance criterion to specific test scenarios"
step_3: "Generate unit tests for individual components"
step_4: "Create integration tests for component interactions"
step_5: "Write acceptance tests for user stories"
step_6: "Add edge cases and error condition tests"
step_7: "Run tests to confirm they fail (Red phase)"
step_8: "STOP - Do not implement until all tests are failing correctly"
```

### Test Creation Pattern (MANDATORY STRUCTURE)
```javascript
// File: [feature-name].spec.js
describe('[Feature Name] - [SPEC-ID]', () => {
  // Requirement: [Copy exact requirement from requirements.md]
  
  describe('[User Story Description]', () => {
    it('should [specific behavior] when [condition] - [SPEC-ID]', async () => {
      // Arrange: Set up test conditions
      // Act: Execute the behavior
      // Assert: Verify the outcome matches specification
      
      // TRACEABILITY COMMENT:
      // This test validates requirement [SPEC-ID]: [requirement text]
    });
    
    it('should handle [error case] when [invalid condition] - [SPEC-ID]', async () => {
      // Test error scenarios from specifications
    });
  });
});
```

### Test Categories (ALL REQUIRED)
1. **Unit Tests**: Individual component behavior validation
2. **Integration Tests**: Component interaction validation
3. **Acceptance Tests**: User story end-to-end validation
4. **Edge Case Tests**: Boundary conditions and error scenarios

### Quality Gate: TEST Phase Exit Criteria
**BEFORE proceeding to IMPLEMENT phase, verify:**
- ☑ Every requirement has corresponding test(s)
- ☑ All tests are failing (Red phase confirmed)
- ☑ Test names clearly reference spec requirements
- ☑ Traceability comments link tests to specifications
- ☑ Edge cases and error scenarios included
- ☑ 100% specification coverage achieved

---

## PHASE 3: IMPLEMENT (Green Phase)

### AI Directive: Write Minimal Code to Pass Tests and Meet Specifications

**MANDATORY**: Implementation must satisfy BOTH test assertions AND specification requirements

### Implementation Process
```yaml
# AI Execution Steps for IMPLEMENT Phase:
step_1: "Review failing tests and specification requirements"
step_2: "Implement minimal code to make first test pass"
step_3: "Verify implementation aligns with specification behavior"
step_4: "Run tests - continue until all tests pass"
step_5: "Cross-validate implementation against original specifications"
step_6: "STOP - Do not optimize yet, proceed to GREEN verification"
```

### Implementation Rules (MANDATORY COMPLIANCE)
1. **Minimal Code**: Write only what's needed to pass tests
2. **Specification Alignment**: Behavior must match spec requirements exactly
3. **No Premature Optimization**: Focus on correctness, not performance
4. **Error Handling**: Implement ALL error scenarios from specifications

### Code Structure Pattern
```typescript
// File: [feature-name].service.ts
export class FeatureService {
  // Implementation for SPEC-001: [requirement description]
  async methodName(params: ParamType): Promise<ReturnType> {
    // Validate inputs per specification requirements
    if (!this.isValidInput(params)) {
      throw new Error('Invalid input - see SPEC-001 requirements');
    }
    
    // Core business logic implementing specification
    const result = await this.processCore(params);
    
    // Return result matching specification contract
    return this.formatResponse(result);
  }
}
```

### Quality Gate: IMPLEMENT Phase Exit Criteria
**BEFORE proceeding to REFACTOR phase, verify:**
- ☑ All tests are passing (Green phase confirmed)
- ☑ Implementation matches ALL specification requirements
- ☑ Error handling covers ALL specified scenarios
- ☑ No test assertions are ignored or commented out
- ☑ Code structure follows established patterns
- ☑ Integration points work as specified

---

## PHASE 4: REFACTOR (Clean Phase)

### AI Directive: Optimize Code While Maintaining Compliance

**MANDATORY**: All optimizations must preserve test passage and specification compliance

### Refactoring Process
```yaml
# AI Execution Steps for REFACTOR Phase:
step_1: "Confirm all tests passing before refactoring"
step_2: "Identify optimization opportunities (performance, structure)"
step_3: "Make small incremental improvements"
step_4: "Run tests after each change - must stay green"
step_5: "Verify specification compliance maintained"
step_6: "Update documentation if behavior descriptions change"
step_7: "Record final quality metrics and completion status"
```

### Refactoring Guidelines (STRICT COMPLIANCE)
1. **Test Preservation**: ALL tests must remain passing
2. **Specification Maintenance**: Behavior must match original specs
3. **Incremental Changes**: Small, verifiable improvements only
4. **Documentation Updates**: Sync any changes with living docs

### Quality Gate: REFACTOR Phase Exit Criteria
**Feature is COMPLETE when:**
- ☑ All tests passing after optimization
- ☑ Code quality improved (readability, performance, structure)
- ☑ Specification compliance maintained 100%
- ☑ Documentation updated to reflect final implementation
- ☑ Traceability links verified and intact
- ☑ Ready for production deployment

---

## AI Tool Integration Patterns

### Claude Code Specific Directives

#### When Creating Specifications:
```yaml
use_tools: ["Write", "Read", "TodoWrite"]
pattern:
  - read_existing_context: "Always check for related specifications first"
  - create_requirements: "Use EARS format for all acceptance criteria"
  - validate_completeness: "Ensure all business needs captured"
  - create_design: "Include component architecture and data models"
```

#### When Generating Tests:
```yaml
use_tools: ["Write", "Read", "Grep", "TodoWrite"]
pattern:
  - load_specifications: "Read requirements.md and design.md completely"
  - map_requirements: "Create 1:1 mapping of requirements to test scenarios"
  - generate_tests: "Cover unit, integration, and acceptance levels"
  - add_traceability: "Include specification references in all test names"
```

#### When Implementing Code:
```yaml
use_tools: ["Write", "Edit", "Bash", "TodoWrite"]
pattern:
  - run_tests_first: "Confirm tests are failing before implementation"
  - implement_minimal: "Write only code needed to pass tests"
  - verify_specs: "Cross-check behavior against original specifications"
  - run_tests_green: "Ensure all tests pass before declaring complete"
```

### Context Management for AI Tools

#### Information Priority for AI Context:
1. **Current Phase Requirements** (highest priority)
2. **Immediate Specifications** (requirements.md, design.md)
3. **Related Test Files** (for current feature)
4. **Existing Implementation** (for integration points)
5. **Project Conventions** (coding standards, patterns)

#### AI Tool Selection by Phase:
- **SPECIFY Phase**: Claude Code (complex analysis), Write tools
- **TEST Phase**: Claude Code (test generation), Grep (existing patterns)
- **IMPLEMENT Phase**: Cursor (real-time assistance), Claude Code (problem solving)
- **REFACTOR Phase**: All tools (optimization analysis and implementation)

---

## Quality Assurance Framework

### Mandatory Quality Checkpoints

**After SPECIFY Phase:**
```yaml
quality_gate_1:
  completeness: ">95% of requirements captured"
  clarity: "No ambiguous acceptance criteria"
  testability: "All requirements can be validated"
  stakeholder_approval: "Business requirements confirmed"
```

**After TEST Phase:**
```yaml
quality_gate_2:
  coverage: "100% specification requirement coverage"
  independence: "Tests run independently without external dependencies"
  clarity: "Test names clearly describe expected behavior"
  traceability: "All tests reference specific specification requirements"
```

**After IMPLEMENT Phase:**
```yaml
quality_gate_3:
  test_passage: "100% of tests passing consistently"
  spec_compliance: "Implementation matches specification behavior"
  error_handling: "All specified error scenarios implemented"
  integration: "All integration points working as designed"
```

**After REFACTOR Phase:**
```yaml
quality_gate_4:
  test_preservation: "All tests still passing after optimization"
  spec_maintenance: "Behavior still matches original specifications"
  code_quality: "Improved readability, performance, or structure"
  documentation: "Living docs updated to reflect final state"
```

---

## AI Decision Framework

### Feature Request Processing
```
Feature Request Received
├── Extract Requirements → Create requirements.md
├── Design Architecture → Create design.md  
├── Plan Implementation → Create tasks.md
└── Validate Specifications → Quality Gate 1

Specifications Complete
├── Map Requirements → Generate test scenarios
├── Create Test Suites → Unit, Integration, Acceptance tests
├── Validate Coverage → 100% requirement coverage
└── Confirm Red Phase → Quality Gate 2

Tests Complete
├── Implement Minimal Code → Make tests pass
├── Verify Spec Compliance → Behavior matches requirements
├── Handle Error Cases → All specified scenarios
└── Confirm Green Phase → Quality Gate 3

Implementation Complete
├── Optimize Code → Improve structure/performance
├── Maintain Compliance → Tests and specs preserved
├── Update Documentation → Living docs synchronized
└── Production Ready → Quality Gate 4
```

### Error Handling Protocol

**When Specifications Are Incomplete:**
```yaml
if: "Requirements lack acceptance criteria"
then: "STOP implementation, request clarification"
action: "Create requirements template and ask for completion"

if: "Design lacks component details"
then: "STOP test generation, enhance design specifications"
action: "Add missing architecture and data model details"
```

**When Tests Fail to Cover Requirements:**
```yaml
if: "Requirement has no corresponding test"
then: "STOP implementation, create missing test"
action: "Generate test scenario for uncovered requirement"

if: "Test does not validate requirement correctly"
then: "STOP implementation, fix test scenario"
action: "Align test assertion with specification expectation"
```

**When Implementation Fails Tests or Specs:**
```yaml
if: "Test fails after implementation"
then: "Fix implementation, not test (unless test is wrong)"
action: "Debug and correct code to satisfy test assertion"

if: "Implementation violates specification"
then: "STOP and correct implementation to match spec"
action: "Review specification requirement and align code behavior"
```

---

## Success Metrics and Completion Criteria

### Feature Completion Definition
A feature is considered COMPLETE when:
- ☑ **Specification Quality**: Requirements clear, complete, testable
- ☑ **Test Coverage**: 100% specification requirement coverage
- ☑ **Implementation Quality**: All tests passing, spec compliant
- ☑ **Refactoring Complete**: Code optimized, tests maintained
- ☑ **Documentation Current**: Living docs reflect final state
- ☑ **Quality Gates Passed**: All 4 quality gates successful

### Production Readiness Checklist
```markdown
## Feature: [Name] - Production Readiness

### Phase Completion Status:
- [x] SPECIFY: All specifications complete and approved
- [x] TEST: Full test coverage with traceability
- [x] IMPLEMENT: All tests passing, spec compliant  
- [x] REFACTOR: Code optimized, compliance maintained

### Quality Metrics:
- Specification Completeness: [98%] (Target: >95%)
- Test Coverage: [100%] (Target: 100%)
- Spec Compliance: [100%] (Target: 100%)
- Code Quality Score: [A] (Target: A or B)

### Final Validation:
- ☑ All acceptance criteria satisfied
- ☑ Error scenarios handled correctly
- ☑ Integration points working
- ☑ Documentation synchronized

**Status: READY FOR PRODUCTION DEPLOYMENT**
```

---

## AI Tool Command Patterns

### For SPECIFY Phase:
```bash
# Create specification files
Write requirements.md "[EARS format requirements]"
Write design.md "[Component architecture + API contracts]"
Write tasks.md "[15-30 minute task breakdown]"

# Validate completeness
Read requirements.md  # Check all acceptance criteria present
TodoWrite [{"content": "Validate specification quality gate", "status": "pending"}]
```

### For TEST Phase:
```bash
# Generate test suites from specifications
Read requirements.md design.md  # Load complete context
Write [feature].spec.js "[Test suites with traceability]"

# Verify coverage
Grep "describe\|it" **/*.spec.js  # Check test structure
Bash "npm test" # Confirm red phase (tests failing)
```

### For IMPLEMENT Phase:
```bash
# Implement to pass tests
Read [feature].spec.js requirements.md  # Load test + spec context
Write [feature].service.js "[Minimal implementation]"

# Verify green phase
Bash "npm test" # Confirm all tests passing
Bash "npm run lint" # Check code quality
```

### For REFACTOR Phase:
```bash
# Optimize while maintaining compliance
Edit [feature].service.js "[Performance/structure improvements]"
Bash "npm test" # Verify tests still passing
Bash "npm run build" # Verify production build
```

---

## Protocol Compliance Verification

### Daily Development Checklist
```markdown
## Daily SDD+TDD Protocol Compliance

### Before Starting Any Feature Work:
- [ ] Read existing requirements.md files for context
- [ ] Understand current project architecture and patterns
- [ ] Identify integration points and dependencies

### During SPECIFY Phase:
- [ ] Create requirements.md with EARS format
- [ ] Include all non-functional requirements
- [ ] Generate design.md with architecture
- [ ] Break work into 15-30 minute tasks
- [ ] Validate quality gate before proceeding

### During TEST Phase:
- [ ] Map every requirement to test scenario(s)
- [ ] Generate unit, integration, and acceptance tests
- [ ] Include error case and edge case testing
- [ ] Add traceability comments linking to specs
- [ ] Confirm red phase (all tests failing)

### During IMPLEMENT Phase:
- [ ] Write minimal code to pass each test
- [ ] Verify behavior matches specification requirements
- [ ] Implement all specified error handling
- [ ] Confirm green phase (all tests passing)
- [ ] Validate integration points working

### During REFACTOR Phase:
- [ ] Optimize code structure and performance
- [ ] Maintain all test passage throughout
- [ ] Preserve specification compliance
- [ ] Update living documentation
- [ ] Verify production readiness

### End of Day Validation:
- [ ] All quality gates passed for completed phases
- [ ] TodoWrite updated with accurate progress
- [ ] Documentation reflects current state
- [ ] Ready to hand off or continue next session
```

## Memory Integration (Law #6)

**Memory Checkpoints for SDD/TDD Integration Protocol:**

**Session Start:**
- View `/memories/development-patterns/test-strategies.xml` for proven TDD patterns
- Review `/memories/protocol-compliance/spec-adherence.xml` for specification compliance history
- Check `/memories/project-knowledge/{project}/architecture.xml` for design context

**During SPECIFY Phase:**
- Record specification patterns in `/memories/development-patterns/requirements-patterns.xml`
- Log design decisions in `/memories/project-knowledge/{project}/architecture.xml`
- Document task decomposition templates in `/memories/development-patterns/task-templates.xml`

**During TEST Phase:**
- Record successful test patterns in `/memories/development-patterns/test-strategies.xml`
- Log test coverage strategies and lessons learned
- Document test frameworks and tooling configurations

**During IMPLEMENT Phase:**
- Track specification compliance in `/memories/protocol-compliance/spec-adherence.xml`
- Record implementation patterns that worked well
- Document integration approaches for similar features

**During REFACTOR Phase:**
- Log refactoring patterns and techniques
- Document performance optimization strategies
- Record code quality improvements and lessons learned

**Session End:**
- Update `/memories/protocol-compliance/protocol-status.xml` with TDD cycle completion
- Archive completed specifications and test strategies
- Record specification-to-implementation traceability success metrics

**Memory Files:**
- Primary: `/memories/development-patterns/test-strategies.xml`
- Specification Tracking: `/memories/protocol-compliance/spec-adherence.xml`
- Requirements Patterns: `/memories/development-patterns/requirements-patterns.xml`

**Example Test Strategy Memory:**
```xml
<test-strategy>
  <timestamp>2025-10-03T15:00:00Z</timestamp>
  <feature>User authentication flow</feature>
  <tdd-approach>Red-Green-Refactor with security tests</tdd-approach>
  <test-coverage>
    - Unit tests: 95% coverage
    - Integration tests: API endpoints and database
    - Security tests: XSS, CSRF, SQL injection protection
  </test-coverage>
  <lessons-learned>
    Security tests written first prevented 3 vulnerabilities
    Mock service pattern improved test isolation
  </lessons-learned>
  <reusability>Pattern applicable to all authentication features</reusability>
</test-strategy>
```

**Cross-Reference**: See [Memory System Protocol](./memory_system_protocol.md) for complete memory usage guide.

---

This protocol ensures consistent, high-quality development practices with AI tools while maintaining complete traceability from business requirements through technical implementation.











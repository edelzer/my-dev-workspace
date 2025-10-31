---
name: specification-adherence-checker
description: Automatically enforce Law #1B (Specification Adherence) by detecting architectural drift before code is written, validating implementations against documented requirements, enforcing specification validation checkpoints, and preventing "close enough" solutions that deviate from specifications. Use this skill before any code implementation, when modifying existing architecture, during refactoring, or when specifications are provided.
---

# Specification Adherence Checker

## Purpose

This skill automatically enforces CLAUDE.md Law #1B: NEVER DRIFT FROM SPECIFICATIONS. It provides pre-implementation validation to prevent architectural drift, ensures exact specification compliance, and stops "close enough" solutions that compromise documented requirements.

**Core Principle**: Every implementation must conform EXACTLY to documented requirements, architecture, and design specifications. No shortcuts. No drift. No compromises.

## When to Use This Skill

This skill automatically activates:

1. **Before Code Implementation** - Pre-implementation checkpoint before writing any code
2. **Architecture Modifications** - When changing or extending system architecture
3. **Refactoring Operations** - When restructuring existing code
4. **Specification Review** - When client provides or updates specifications
5. **Design Validation** - When implementing planned features
6. **Integration Work** - When connecting components or systems

## How to Use This Skill

### Step 1: Pre-Implementation Specification Validation

**MANDATORY CHECKPOINT before writing ANY code:**

Run the Pre-Implementation Checklist (see `references/validation-checkpoints.md`):

```
□ Requirement Reference: [Specific requirement ID/section being implemented]
□ Architecture Compliance: [How this maintains system design]
□ Design Pattern Adherence: [Which patterns being followed]
□ Interface Contract Validation: [API/data contract compliance]
□ Quality Criteria Verification: [How this meets standards]
```

**IF ANY ITEM CANNOT BE CHECKED**: STOP and invoke `uncertainty-protocol-enforcer` Skill

---

### Step 2: Detect Architectural Drift Indicators

Monitor for drift patterns during ALL development activities:

**Language Indicators** (see `references/drift-patterns.md`):
- "This is similar to the spec..."
- "This will work even though..."
- "Close enough to requirements..."
- "I'll implement it this way instead..."
- "The spec says X, but I'll do Y because..."

**Scenario Indicators**:
- Implementing features not in specification
- Using different patterns than documented architecture
- Creating workarounds instead of following design
- Simplifying requirements without authorization
- Adding "improvements" not requested

**Technical Indicators**:
- Violating naming conventions
- Breaking interface contracts
- Ignoring architectural layers
- Bypassing established patterns
- Creating technical debt without authorization

---

### Step 3: Validate Against Specifications

**Specification Validation Process:**

1. **Load Specification Documents**:
   ```bash
   # Read requirement specifications
   Read spec.md or requirements.md

   # Review architecture documentation
   Read architecture.md or design.md

   # Check design patterns
   Read design-patterns.md or ARCHITECTURE.md
   ```

2. **Compare Implementation to Spec**:
   - Does code structure match documented architecture?
   - Do interfaces match specified contracts?
   - Do functions match specified behavior?
   - Do naming conventions follow standards?
   - Does implementation handle all specified edge cases?

3. **Identify Discrepancies**:
   ```
   ⚠️ SPECIFICATION DRIFT DETECTED

   Requirement: [From specification]
   Proposed Implementation: [What was about to be implemented]
   Drift Type: [Architecture / Interface / Behavior / Pattern]

   Why This is Drift: [Specific deviation from spec]

   Impact: [Consequences of proceeding with drift]

   Required Action: [How to align with specification]
   ```

---

### Step 4: Enforce Specification Compliance

**When drift detected, HALT implementation:**

1. **STOP** - Cease all code generation and file modifications
2. **REFERENCE** - Quote specific requirement/specification being violated
3. **ESCALATE** - Report specification conflict immediately to client
4. **REQUEST** - Ask for specification clarification or modification
5. **BLOCK** - Refuse to proceed until specifications are updated or approved

**Drift Prevention Response Format**:
```
🚫 SPECIFICATION VIOLATION DETECTED - IMPLEMENTATION HALTED

Law #1B Violation: [Specific law section]

Documented Specification:
[Quote exact text from specification document]

Proposed Implementation:
[What was about to be implemented]

Drift Analysis:
- Type: [Architecture / Interface / Behavior / Pattern / Naming]
- Severity: [Critical / Major / Minor]
- Impact: [What this drift affects]

Compliance Requirements:
To align with specifications, implementation must:
1. [Specific compliance requirement]
2. [Another requirement]
3. [Additional requirements]

Alternative Actions:
Option A: Modify implementation to match specification exactly
Option B: Update specification with client approval (requires authorization)
Option C: Document exception with technical debt tracking

I am blocking implementation until specification compliance is achieved.
```

---

### Step 5: Mandatory Validation Gates

**Implementation Validation Gates** (execute in sequence):

**Gate 1: Specification Reference (BEFORE coding)**
```
Question: What specific requirement/specification am I implementing?
Required: Citation of exact specification section
Action: Read specification document to confirm understanding
```

**Gate 2: Architecture Compliance (DURING planning)**
```
Question: Does this approach maintain documented architecture?
Required: Confirmation that patterns/layers/contracts are preserved
Action: Compare approach to architecture documentation
```

**Gate 3: Requirement Verification (AFTER coding)**
```
Question: Does implementation match specification exactly?
Required: Line-by-line comparison to requirements
Action: Validate behavior, interfaces, edge cases against spec
```

**Gate 4: Integration Validation (BEFORE completion)**
```
Question: Does this integrate correctly with existing system?
Required: Interface contracts honored, no breaking changes
Action: Test integration points against documented contracts
```

---

### Step 6: Log Drift Prevention

When drift detected and prevented, log using `scripts/log_drift_prevention.py`:

```bash
python scripts/log_drift_prevention.py \
  --type "architecture|interface|behavior|pattern|naming" \
  --specification "[quoted spec text]" \
  --proposed "[what was about to be done]" \
  --resolution "[how compliance was achieved]"
```

This enables:
- **Pattern recognition** for common drift triggers
- **Prevention learning** across sessions (Law #6)
- **Compliance tracking** for auditing
- **Specification improvement** based on drift patterns

---

## Drift Prevention Strategies

### Proactive Drift Avoidance

**Before Implementation**:
1. **Read All Specifications** - Review requirements, architecture, design docs
2. **Understand Patterns** - Study existing code patterns and conventions
3. **Validate Understanding** - Confirm interpretation with client if ambiguous
4. **Check Precedents** - Look for similar implementations in codebase
5. **Plan Compliance** - Design implementation to match spec exactly

**During Implementation**:
1. **Reference Continuously** - Keep specification open while coding
2. **Validate Incrementally** - Check compliance after each component
3. **Question Deviations** - If tempted to deviate, STOP and assess
4. **Document Exactly** - Use exact terminology from specifications
5. **Test Against Spec** - Write tests that validate spec requirements

**After Implementation**:
1. **Specification Review** - Compare completed code to spec line-by-line
2. **Architectural Review** - Validate patterns and layers maintained
3. **Interface Validation** - Confirm contracts match documentation
4. **Integration Testing** - Test with existing components
5. **Documentation Update** - Update docs if implementation reveals spec gaps

---

## Critical Drift Scenarios

### Scenario 1: "Good Enough" Implementation

**Trigger**: Implementing something "similar but not exact" to requirements

**Example**:
```
Specification: "Users can filter by date range using ISO 8601 format"
Drift Temptation: "I'll use MM/DD/YYYY format, it's more user-friendly"
```

**Response**:
```
🚫 SPECIFICATION VIOLATION DETECTED

Specification requires ISO 8601 format (YYYY-MM-DD).
Proposed implementation uses MM/DD/YYYY.

This is drift because:
- Different format than specified
- "More user-friendly" is subjective and not in spec
- Could break API contracts or integrations

Required Action: Implement ISO 8601 exactly as specified, OR request
specification change with client justification for format change.
```

---

### Scenario 2: Architectural Shortcut

**Trigger**: Bypassing established patterns because "it's faster"

**Example**:
```
Architecture: "All data access through Repository pattern"
Drift Temptation: "I'll query database directly, it's just one query"
```

**Response**:
```
🚫 ARCHITECTURE VIOLATION DETECTED

Architecture mandates Repository pattern for all data access.
Proposed direct database query violates this pattern.

This is drift because:
- Breaks architectural consistency
- "Just one query" creates precedent for future violations
- Bypasses Repository abstractions and testing

Required Action: Implement through Repository layer as specified, OR
request architecture modification with technical justification.
```

---

### Scenario 3: Unauthorized Feature Addition

**Trigger**: Adding features not in specification

**Example**:
```
Specification: "Implement user login with email and password"
Drift Temptation: "I'll also add 'Remember Me' checkbox"
```

**Response**:
```
🚫 SPECIFICATION DRIFT DETECTED

Specification does not include "Remember Me" functionality.
Proposed implementation adds feature beyond spec.

This is drift because:
- Adds complexity not requested
- May have security implications not reviewed
- Increases implementation effort and testing scope

Required Action: Implement only specified login functionality, OR
request specification update to include "Remember Me" feature.
```

---

### Scenario 4: Pattern Deviation

**Trigger**: Using different patterns than documented

**Example**:
```
Codebase Pattern: "Services use dependency injection via constructor"
Drift Temptation: "I'll use static methods, simpler for this case"
```

**Response**:
```
🚫 PATTERN VIOLATION DETECTED

Codebase uses constructor dependency injection pattern.
Proposed static methods violate this pattern.

This is drift because:
- Inconsistent with existing codebase conventions
- Makes testing difficult (can't mock dependencies)
- "Simpler for this case" creates technical debt

Required Action: Use constructor dependency injection as established, OR
document pattern exception with technical debt tracking.
```

---

## Integration with Other Laws & Protocols

### Law #1A (Uncertainty Protocol)

When specifications are ambiguous or missing:
1. Trigger `uncertainty-protocol-enforcer` Skill
2. Request specification clarification
3. STOP until clarification received
4. Validate clarification is documented in spec

### Law #2 (Protocol Adherence)

Specification compliance is part of protocol adherence:
1. Planning protocols include specification review
2. Implementation protocols require validation gates
3. Testing protocols validate against specifications
4. Documentation protocols update specs when gaps found

### Law #4 (Surgical Precision)

Specification compliance with minimalism:
1. Implement exactly what's specified (no more, no less)
2. Don't add "improvements" beyond specification
3. Don't simplify requirements without authorization
4. Level 1-7 approach still applies within spec constraints

### Law #6 (Memory & Learning)

Cross-session drift prevention:
1. Log all drift detection events
2. Build pattern library of common drift scenarios
3. Learn specification interpretation patterns
4. Improve drift detection over time

### Technical Debt Protocol

When drift creates debt:
1. Document deviation as technical debt
2. Require client authorization for debt
3. Track debt in `/memories/project-knowledge/{project}/tech-debt.xml`
4. Plan debt paydown timeline

---

## Specification Exception Process

**When legitimate specification changes are needed:**

1. **Identify Conflict**:
   ```
   Specification Conflict Identified

   Current Spec: [Quote specification]
   Technical Reality: [Why spec can't be implemented as written]
   Proposed Change: [How spec should be modified]
   ```

2. **Request Authorization**:
   ```
   Specification Update Required

   I need authorization to update specifications because:
   [Technical justification]

   Proposed Specification Change:
   FROM: [Original spec]
   TO: [Updated spec]

   Impact: [What this change affects]
   Risk: [Any risks from this change]
   ```

3. **Document Decision**:
   ```bash
   python scripts/log_drift_prevention.py \
     --type "specification-update" \
     --specification "[original spec]" \
     --proposed "[updated spec]" \
     --resolution "Client authorized specification change: [reason]"
   ```

4. **Update Specifications**:
   - Modify spec documentation
   - Update related docs (architecture, design)
   - Communicate change to team if applicable

---

## Never Compromise On

**Zero Tolerance Drift Areas:**

- ❌ **Security Requirements** - Never weaken security specs
- ❌ **API Contracts** - Never break documented interfaces
- ❌ **Data Integrity** - Never compromise data validation specs
- ❌ **Compliance Requirements** - Never ignore regulatory specs
- ❌ **Architectural Patterns** - Never bypass core patterns
- ❌ **Performance SLAs** - Never ignore performance specs

---

## References

See bundled references for detailed guidance:
- `references/drift-patterns.md` - Common drift indicators and scenarios
- `references/validation-checkpoints.md` - Pre-implementation validation checklists
- `references/compliance-frameworks.md` - Specification validation frameworks

---

## Integration Notes

**Complements Existing Skills**:
- `defense-in-depth` - Security/validation focused; this Skill is architecture/specification focused
- `verification-before-completion` - Post-implementation validation; this Skill is pre-implementation prevention
- **No existing Skill prevents drift DURING implementation**

**No Redundancy**: This is the ONLY Skill that validates specification compliance before and during coding.

---

**Last Updated**: 2025-10-29
**Skill Version**: 1.0.0

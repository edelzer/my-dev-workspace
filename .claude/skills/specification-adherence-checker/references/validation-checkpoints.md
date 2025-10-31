# Specification Validation Checkpoints

Mandatory validation gates to prevent architectural drift and ensure specification compliance.

## Pre-Implementation Validation Gates

Execute these checkpoints **BEFORE writing ANY code** for every feature, bug fix, or refactoring.

---

### Gate 1: Specification Reference Checkpoint

**Purpose**: Ensure clear understanding of what needs to be implemented

**Checklist**:
```
□ Specification document identified and read
□ Specific requirement/feature section located
□ Requirement ID or section number documented
□ All acceptance criteria understood
□ Success metrics defined
□ Edge cases identified
```

**Questions to Answer**:
1. What specific requirement am I implementing?
2. Where is this documented in specifications?
3. What are the exact acceptance criteria?
4. How will I know when this is complete?

**Red Flags (Trigger uncertainty-protocol-enforcer)**:
- ❌ Can't find specification for this feature
- ❌ Requirement is ambiguous or unclear
- ❌ Multiple interpretations possible
- ❌ Success criteria not defined

**Example**:
```
✅ GATE 1 PASSED: Specification Reference

Requirement: User Authentication (spec.md, Section 3.2)
Requirement ID: AUTH-001
Acceptance Criteria:
  - Users can log in with email and password
  - Invalid credentials return 401 status
  - Successful login returns JWT token
  - Token expires in 1 hour
Success Metric: User can authenticate and receive valid JWT
```

---

### Gate 2: Architecture Compliance Checkpoint

**Purpose**: Validate approach aligns with documented architecture

**Checklist**:
```
□ Architecture documentation reviewed
□ Relevant patterns identified
□ Layer placement determined
□ Integration points identified
□ No pattern violations detected
□ Naming conventions understood
```

**Questions to Answer**:
1. Which architectural patterns apply to this feature?
2. What layer(s) will this be implemented in?
3. Which existing components will this integrate with?
4. Are there established patterns for similar features?

**Red Flags (Trigger drift detection)**:
- ❌ Proposed approach bypasses architectural layers
- ❌ Different pattern than established conventions
- ❌ Creates coupling between layers that should be separated
- ❌ Violates dependency injection or other core patterns

**Example**:
```
✅ GATE 2 PASSED: Architecture Compliance

Architecture Pattern: Three-tier (Presentation → Business → Data)
Implementation Layers:
  - Presentation: AuthController (handles HTTP)
  - Business: AuthService (handles auth logic)
  - Data: UserRepository (handles user data access)
Integration Points:
  - JwtService (for token generation)
  - PasswordHashingService (for password validation)
Pattern Compliance: ✓ Repository pattern, ✓ DI via constructor
```

---

### Gate 3: Design Pattern Adherence Checkpoint

**Purpose**: Ensure consistent use of established design patterns

**Checklist**:
```
□ Existing code patterns reviewed
□ Similar implementations studied
□ Naming conventions identified
□ Code structure patterns understood
□ Testing patterns identified
□ No pattern deviations detected
```

**Questions to Answer**:
1. How are similar features implemented in the codebase?
2. What naming conventions are used?
3. What code structure patterns exist?
4. How are similar features tested?

**Red Flags (Trigger drift detection)**:
- ❌ Different naming convention than codebase
- ❌ Different code structure than similar features
- ❌ Inconsistent error handling patterns
- ❌ Different testing approach than established

**Example**:
```
✅ GATE 3 PASSED: Design Pattern Adherence

Naming Conventions:
  - Classes: PascalCase (e.g., AuthService)
  - Methods: camelCase (e.g., authenticateUser)
  - Constants: UPPER_SNAKE_CASE (e.g., TOKEN_EXPIRY)
Code Structure:
  - Services use constructor DI
  - Controllers use async/await
  - Repositories return domain objects, not DTOs
Testing Patterns:
  - Unit tests in __tests__/ directory
  - Mocks via jest.mock()
  - Integration tests use test database
```

---

### Gate 4: Interface Contract Validation Checkpoint

**Purpose**: Verify all interface contracts will be honored

**Checklist**:
```
□ API contracts identified
□ Request/response formats documented
□ Error handling specified
□ Status codes defined
□ Data types validated
□ No breaking changes detected
```

**Questions to Answer**:
1. What API contracts must be honored?
2. What request/response formats are specified?
3. What error formats are expected?
4. Are there existing consumers of these interfaces?

**Red Flags (Trigger drift detection)**:
- ❌ Response format differs from specification
- ❌ Additional fields added to API response
- ❌ Different error format than documented
- ❌ Breaking changes to existing contracts

**Example**:
```
✅ GATE 4 PASSED: Interface Contract Validation

API Contract: POST /api/auth/login
Request Format:
  {
    "email": "string (required, email format)",
    "password": "string (required, min 8 chars)"
  }
Response Format (200 OK):
  {
    "token": "string (JWT)",
    "expires_in": "number (seconds)"
  }
Error Format (401 Unauthorized):
  {
    "error": "string (error message)"
  }
Breaking Changes: None (new endpoint)
```

---

### Gate 5: Quality Criteria Verification Checkpoint

**Purpose**: Confirm understanding of quality standards

**Checklist**:
```
□ Test coverage requirements known
□ Performance requirements identified
□ Security requirements understood
□ Accessibility requirements defined
□ Documentation requirements clear
□ Compliance requirements identified
```

**Questions to Answer**:
1. What test coverage is required?
2. Are there performance requirements?
3. What security measures are needed?
4. Are there compliance requirements (GDPR, HIPAA, etc.)?

**Red Flags (Trigger uncertainty-protocol-enforcer)**:
- ❌ Test coverage requirements unclear
- ❌ Performance SLAs not defined
- ❌ Security requirements ambiguous
- ❌ Compliance needs unknown

**Example**:
```
✅ GATE 5 PASSED: Quality Criteria Verification

Test Coverage: Minimum 80% line coverage required
Performance: Login must complete in <500ms (p95)
Security:
  - Passwords hashed with bcrypt (cost factor 12)
  - JWT signed with RS256 algorithm
  - HTTPS required in production
Accessibility: N/A (API endpoint)
Documentation: OpenAPI spec must be updated
Compliance: GDPR compliant (no PII logging)
```

---

## During Implementation Validation

Execute these checkpoints **WHILE writing code** to catch drift early.

---

### Continuous Specification Reference

**Every 15-30 minutes during implementation**:

```
□ Re-read specification section
□ Verify current code matches spec
□ Check no features added beyond spec
□ Validate data formats match spec
□ Confirm validation rules match spec
```

**Purpose**: Prevent gradual drift during implementation

---

### Incremental Pattern Validation

**After completing each component** (class, function, module):

```
□ Compare to similar existing code
□ Verify naming consistency
□ Check pattern adherence
□ Validate DI usage
□ Confirm error handling consistency
```

**Purpose**: Maintain pattern consistency throughout implementation

---

### Interface Contract Monitoring

**Before committing any API changes**:

```
□ Verify request format unchanged (or properly versioned)
□ Verify response format matches spec
□ Check error formats consistent
□ Validate status codes correct
□ Confirm no breaking changes introduced
```

**Purpose**: Prevent accidental contract violations

---

## Post-Implementation Validation

Execute these checkpoints **AFTER writing code** before marking feature complete.

---

### Gate 6: Specification Compliance Review

**Purpose**: Final validation that implementation matches specification exactly

**Checklist**:
```
□ All specified features implemented
□ No features added beyond specification
□ No features simplified or removed
□ All acceptance criteria met
□ All edge cases handled as specified
□ Data formats match specification
□ Validation rules match specification
```

**Review Process**:
1. Read specification section line-by-line
2. For each requirement, verify implementation
3. List any deviations (even minor ones)
4. If deviations exist, categorize as:
   - Drift (requires fix or authorization)
   - Clarification (specification was ambiguous)
   - Enhancement (beyond scope, requires approval)

**Example**:
```
✅ GATE 6 PASSED: Specification Compliance Review

Specification: User Authentication (AUTH-001)

Requirements Review:
✓ Users can log in with email and password (AuthController.login)
✓ Invalid credentials return 401 (line 45-47)
✓ Successful login returns JWT token (line 52)
✓ Token expires in 1 hour (JwtService.generateToken, expiry: 3600s)

Edge Cases:
✓ Empty email/password → 400 Bad Request
✓ Malformed email → 400 Bad Request
✓ Account locked → 403 Forbidden
✓ Server error → 500 Internal Server Error

Deviations: NONE

Specification Compliance: 100%
```

---

### Gate 7: Architecture Integrity Validation

**Purpose**: Confirm no architectural drift occurred during implementation

**Checklist**:
```
□ All layers respected (no layer violations)
□ Patterns followed consistently
□ Dependency injection used correctly
□ No tight coupling introduced
□ Integration points clean
□ Naming conventions consistent
```

**Validation Method**:
1. Draw actual implementation architecture diagram
2. Compare to documented architecture
3. Identify any deviations
4. Assess impact of deviations

**Example**:
```
✅ GATE 7 PASSED: Architecture Integrity Validation

Implemented Architecture:
  AuthController (Presentation)
    ↓ depends on
  AuthService (Business)
    ↓ depends on
  UserRepository (Data) + JwtService (Utility)

Comparison to Documented Architecture:
✓ Three-tier pattern maintained
✓ No layer-skipping dependencies
✓ Constructor DI used throughout
✓ Services depend on interfaces, not implementations
✓ No circular dependencies

Architecture Drift: NONE
```

---

### Gate 8: Integration Testing Validation

**Purpose**: Verify integration with existing system works correctly

**Checklist**:
```
□ All integration points tested
□ Interface contracts validated with tests
□ Existing functionality not broken
□ End-to-end flows work
□ Error propagation correct
□ No side effects detected
```

**Testing Strategy**:
1. Test each integration point individually
2. Test end-to-end user flows
3. Test error scenarios
4. Run full regression test suite
5. Validate performance under load

**Example**:
```
✅ GATE 8 PASSED: Integration Testing Validation

Integration Points Tested:
✓ AuthController → AuthService (unit + integration tests)
✓ AuthService → UserRepository (integration tests)
✓ AuthService → JwtService (unit tests with mocks)
✓ Full login flow (e2e test)

Regression Testing:
✓ All existing tests pass (1,247 tests, 0 failures)
✓ No new warnings or errors
✓ Performance benchmarks within acceptable range

Breaking Changes: NONE
```

---

## Drift Response Protocol

When drift detected at any checkpoint:

### Step 1: HALT Implementation

```
🚫 DRIFT DETECTED AT CHECKPOINT

Gate: [Gate name]
Issue: [Specific drift detected]
Severity: [Critical / Major / Minor]

IMPLEMENTATION HALTED - Awaiting resolution
```

### Step 2: Analyze Drift

```
Drift Analysis:

Specification: [Quote exact specification]
Implementation: [What was actually done]
Deviation: [Specific difference]
Impact: [What this affects]
```

### Step 3: Determine Resolution Path

**Option A: Fix Drift (Preferred)**
- Modify implementation to match specification exactly
- Re-run checkpoints to validate compliance
- Continue implementation

**Option B: Update Specification (Requires Authorization)**
- Document why specification should change
- Request client approval for specification update
- Update specification documents
- Continue with updated spec

**Option C: Document as Technical Debt (Requires Authorization)**
- Trigger `technical-debt-evaluator` Skill
- Get client authorization for debt
- Log debt in memory system
- Plan debt paydown timeline

### Step 4: Log Drift Event

```bash
python scripts/log_drift_prevention.py \
  --type "[drift-type]" \
  --specification "[spec quote]" \
  --proposed "[what was attempted]" \
  --resolution "[how resolved]"
```

---

## Checkpoint Timing Guide

### For Small Features (< 4 hours)

- **Pre-Implementation**: All 5 gates (30-45 minutes)
- **During Implementation**: Continuous reference every 30 min
- **Post-Implementation**: Gates 6-8 (30-45 minutes)

**Total Overhead**: ~1.5-2 hours (but prevents hours of rework)

---

### For Medium Features (4-8 hours)

- **Pre-Implementation**: All 5 gates (45-60 minutes)
- **During Implementation**: Continuous reference + incremental validation every hour
- **Post-Implementation**: Gates 6-8 (45-60 minutes)

**Total Overhead**: ~2-3 hours (but prevents days of rework)

---

### For Large Features (> 8 hours)

- **Pre-Implementation**: All 5 gates + detailed planning (1-2 hours)
- **During Implementation**: Checkpoints at each milestone
- **Post-Implementation**: Gates 6-8 + comprehensive review (1-2 hours)

**Total Overhead**: ~3-5 hours (but prevents weeks of rework and technical debt)

---

## Checkpoint Efficiency Tips

### Batch Related Checkpoints

Instead of running gates individually, batch related checks:

- **Gates 1-2**: Specification + Architecture (together)
- **Gates 3-4**: Patterns + Contracts (together)
- **Gates 6-7**: Compliance + Integrity (together)

### Use Checklists

Maintain checkpoint checklists in:
- `/docs/specification-validation-checklist.md`
- Project-specific validation docs
- Memory system for reuse across sessions

### Learn from History

Check `/memories/protocol-compliance/drift-prevention-log.xml` for:
- Common drift patterns in this project
- Previously validated patterns
- Approved exceptions
- Lessons learned

---

## Integration with Other Protocols

### With `test-driven-development` Skill

1. Write tests FIRST (TDD)
2. Tests validate specification compliance
3. Run checkpoints before implementation
4. Implementation guided by tests + checkpoints
5. Post-implementation validation confirms both tests and specs

### With `systematic-debugging` Skill

1. When bugs found, check for specification drift
2. Was bug caused by drift from spec?
3. Fix bug by returning to specification
4. Log bug + drift pattern for future prevention

### With `surgical-precision-guide` Skill

1. Use surgical levels within specification constraints
2. Minimalist approach = exact spec, no more
3. Level 1-3: Simple compliance
4. Level 4+: Complex compliance (needs approval)

---

**Last Updated**: 2025-10-29
**Skill Version**: 1.0.0

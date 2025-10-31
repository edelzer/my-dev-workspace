# Architectural Drift Patterns Reference

Comprehensive guide to detecting and preventing specification drift during development.

## What is Architectural Drift?

**Definition**: Architectural drift occurs when implementation deviates from documented specifications, requirements, or architectural patterns—even if the deviation "works" or seems "better."

**Why Drift Matters**:
- Accumulates technical debt
- Creates inconsistency in codebase
- Makes maintenance harder over time
- Violates client expectations
- Can break integrations and contracts

**Core Principle**: "Working code that doesn't match specifications is still wrong."

---

## Drift Detection Categories

### 1. Language-Based Drift Indicators

**Phrases that signal potential drift:**

#### Deviation Justifications
- "This is similar to the spec..." (Similar ≠ Exact)
- "This will work even though..." (Working ≠ Specification-compliant)
- "Close enough to requirements..." (Close ≠ Exact)
- "I'll implement it this way instead..." (Instead = Deviation)
- "The spec says X, but I'll do Y because..." (Deviation with rationalization)

#### Improvement Temptations
- "I'll add this feature too..." (Beyond scope)
- "This would be more user-friendly..." (Subjective, not specified)
- "I'll use a better approach..." (Better ≠ Specified)
- "Let me enhance this..." (Enhancement = Scope creep)

#### Shortcut Rationalizations
- "It's just this once..." (Creates precedent)
- "It's faster this way..." (Speed ≠ Compliance)
- "This is simpler..." (Simple ≠ Specified)
- "We don't really need..." (Removing specified features)

#### Pattern Violations
- "I'll bypass the [pattern] for..." (Architecture violation)
- "Instead of [specified approach], I'll use..." (Pattern drift)
- "The usual way is X, but here I'll do Y..." (Inconsistency)

---

### 2. Architectural Drift Patterns

#### Pattern A: Layer Violation

**Specification**: "Three-tier architecture: Presentation → Business → Data"

**Drift Example**:
```javascript
// ❌ DRIFT: Controller directly accessing database
class UserController {
  async getUser(req, res) {
    const user = await database.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    res.json(user);
  }
}
```

**Why Drift**: Bypasses Business layer, violates three-tier architecture

**Compliant Implementation**:
```javascript
// ✅ COMPLIANT: Proper layer separation
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getUser(req, res) {
    const user = await this.userService.getUserById(req.params.id);
    res.json(user);
  }
}
```

---

#### Pattern B: Dependency Injection Violation

**Specification**: "Use constructor dependency injection throughout"

**Drift Example**:
```python
# ❌ DRIFT: Direct instantiation instead of DI
class OrderService:
    def process_order(self, order):
        payment_service = PaymentService()  # Direct instantiation
        payment_service.charge(order.total)
```

**Why Drift**: Violates DI pattern, makes testing difficult

**Compliant Implementation**:
```python
# ✅ COMPLIANT: Constructor DI as specified
class OrderService:
    def __init__(self, payment_service: PaymentService):
        self.payment_service = payment_service

    def process_order(self, order):
        self.payment_service.charge(order.total)
```

---

#### Pattern C: Naming Convention Drift

**Specification**: "Use camelCase for variables, PascalCase for classes"

**Drift Example**:
```typescript
// ❌ DRIFT: Inconsistent naming
class user_service {  // Should be PascalCase
  private UserCount: number;  // Should be camelCase

  public Get_User_Count(): number {  // Should be camelCase
    return this.UserCount;
  }
}
```

**Why Drift**: Violates established naming conventions

**Compliant Implementation**:
```typescript
// ✅ COMPLIANT: Consistent naming
class UserService {
  private userCount: number;

  public getUserCount(): number {
    return this.userCount;
  }
}
```

---

### 3. Interface Contract Drift

#### Drift Type: Response Format Modification

**API Specification**:
```json
{
  "specification": "GET /api/users/:id returns user object with id, email, name fields"
}
```

**Drift Example**:
```javascript
// ❌ DRIFT: Added fields not in specification
app.get('/api/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at,  // Not in spec
    last_login: user.last_login    // Not in spec
  });
});
```

**Why Drift**: Adds fields not specified (even if "helpful")

**Compliant Implementation**:
```javascript
// ✅ COMPLIANT: Exact specification match
app.get('/api/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  res.json({
    id: user.id,
    email: user.email,
    name: user.name
  });
});
```

---

#### Drift Type: Error Handling Modification

**Specification**: "Return 404 with {error: 'User not found'} when user doesn't exist"

**Drift Example**:
```javascript
// ❌ DRIFT: Different error format
app.get('/api/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({
      success: false,  // Not specified
      message: 'User not found',  // Should be "error" key
      code: 'USER_NOT_FOUND'  // Not specified
    });
  }
  res.json(user);
});
```

**Why Drift**: Error format doesn't match specification

**Compliant Implementation**:
```javascript
// ✅ COMPLIANT: Exact error format
app.get('/api/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: 'User not found'
    });
  }
  res.json(user);
});
```

---

### 4. Feature Scope Drift

#### Drift Type: Unauthorized Feature Addition

**Specification**: "Implement user login with email and password"

**Drift Example**:
```html
<!-- ❌ DRIFT: Added "Remember Me" not in spec -->
<form action="/login" method="POST">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <label>
    <input type="checkbox" name="remember_me">
    Remember Me <!-- NOT IN SPECIFICATION -->
  </label>
  <button type="submit">Login</button>
</form>
```

**Why Drift**: Adds feature beyond specification scope

**Compliant Implementation**:
```html
<!-- ✅ COMPLIANT: Only specified features -->
<form action="/login" method="POST">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Login</button>
</form>
```

---

#### Drift Type: Feature Simplification

**Specification**: "Support filtering by date range, category, and status"

**Drift Example**:
```python
# ❌ DRIFT: Removed category filter (simplification)
def get_filtered_items(date_from, date_to, status):
    # Only implements date and status filtering
    # Ignores category specification
    return items.filter(
        date__gte=date_from,
        date__lte=date_to,
        status=status
    )
```

**Why Drift**: Specification requires all three filters

**Compliant Implementation**:
```python
# ✅ COMPLIANT: All specified filters
def get_filtered_items(date_from, date_to, category, status):
    return items.filter(
        date__gte=date_from,
        date__lte=date_to,
        category=category,
        status=status
    )
```

---

### 5. Data Format Drift

#### Drift Type: Date Format Deviation

**Specification**: "All dates in ISO 8601 format (YYYY-MM-DD)"

**Drift Example**:
```javascript
// ❌ DRIFT: Using MM/DD/YYYY instead of ISO 8601
const userData = {
  name: user.name,
  birthdate: '12/31/1990'  // Should be 1990-12-31
};
```

**Why Drift**: Different format than specified

**Compliant Implementation**:
```javascript
// ✅ COMPLIANT: ISO 8601 format
const userData = {
  name: user.name,
  birthdate: '1990-12-31'
};
```

---

#### Drift Type: Validation Rule Relaxation

**Specification**: "Password must be at least 12 characters, include uppercase, lowercase, number, and special character"

**Drift Example**:
```python
# ❌ DRIFT: Relaxed to 8 characters, removed special char requirement
def validate_password(password):
    if len(password) < 8:  # Should be 12
        return False
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    # Missing special character check
    return has_upper and has_lower and has_digit
```

**Why Drift**: Weaker validation than specified

**Compliant Implementation**:
```python
# ✅ COMPLIANT: Exact specification requirements
import re

def validate_password(password):
    if len(password) < 12:
        return False
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
    return has_upper and has_lower and has_digit and has_special
```

---

## Drift Prevention Checklist

### Pre-Implementation Checklist

Before writing ANY code, verify:

```
□ I have read the complete specification for this feature
□ I understand the exact requirements (no assumptions)
□ I know which architectural patterns to follow
□ I have identified all interface contracts to honor
□ I know the expected data formats and validation rules
□ I have checked for similar implementations in the codebase
□ I have identified any ambiguities (and resolved them via uncertainty-protocol-enforcer)
```

### During Implementation Checklist

While writing code, continuously verify:

```
□ I am following the documented architecture patterns
□ I am using the specified naming conventions
□ I am implementing only specified features (no additions)
□ I am honoring all interface contracts
□ I am using the specified data formats
□ I am not taking shortcuts that bypass patterns
□ I am not "improving" beyond specifications
```

### Post-Implementation Checklist

After writing code, validate:

```
□ Implementation matches specification exactly
□ No features added beyond spec
□ No features removed from spec
□ Architectural patterns followed consistently
□ Interface contracts honored
□ Data formats match specifications
□ Validation rules match specifications
□ Naming conventions consistent
□ No technical debt created without authorization
```

---

## Common Drift Justifications (and Why They're Wrong)

### ❌ "It's more user-friendly"

**Why Wrong**: User experience decisions should be in specifications. If spec doesn't address UX, request clarification.

**Correct Response**: "Specification doesn't address UX for [feature]. Triggering uncertainty-protocol-enforcer to request clarification."

---

### ❌ "It's a better technical approach"

**Why Wrong**: "Better" is subjective. Consistency matters more than individual "improvements."

**Correct Response**: "Proposed approach may be better, but specification defines [approach]. Request specification update with technical justification if change is warranted."

---

### ❌ "The spec is outdated"

**Why Wrong**: Outdated specs should be updated, not ignored.

**Correct Response**: "Specification appears outdated. Halting implementation to request specification update from client."

---

### ❌ "It's just a small change"

**Why Wrong**: Small drifts accumulate into large technical debt.

**Correct Response**: "Even small changes must follow specification. No change is 'too small' to require compliance."

---

### ❌ "Nobody will notice"

**Why Wrong**: Professional standards, not detectability, determine compliance.

**Correct Response**: "Specification compliance is mandatory regardless of visibility. Cannot proceed with deviation."

---

### ❌ "We don't have time for the full implementation"

**Why Wrong**: Time pressure doesn't justify technical debt without authorization.

**Correct Response**: "Time constraints require technical debt authorization. Triggering technical-debt-evaluator for client approval."

---

## Drift Detection Examples

### ✅ Example 1: Architectural Drift Detection

**Specification**: "Use Repository pattern for all data access"

**Code Review**:
```java
// Reviewing this code...
public class UserController {
    @Autowired
    private JdbcTemplate jdbcTemplate;  // 🚨 DRIFT DETECTED

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        // Direct JDBC access instead of Repository
        return jdbcTemplate.queryForObject(
            "SELECT * FROM users WHERE id = ?",
            new Object[]{id},
            new UserRowMapper()
        );
    }
}
```

**Drift Analysis**:
```
🚫 ARCHITECTURE VIOLATION DETECTED

Specification: "Use Repository pattern for all data access"
Detected: Direct JDBC access in Controller

Drift Type: Architecture Pattern Violation
Severity: Critical

Why This is Drift:
- Bypasses Repository pattern entirely
- Creates direct coupling to data layer
- Violates three-tier architecture
- Makes testing difficult

Required Action: Refactor to use UserRepository following Repository pattern.
```

---

### ✅ Example 2: Interface Contract Drift Detection

**API Specification**:
```
POST /api/auth/login
Request: { "email": string, "password": string }
Response: { "token": string, "expires_in": number }
```

**Code Review**:
```javascript
// Reviewing this API endpoint...
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = authenticateUser(email, password);

  if (user) {
    const token = generateToken(user);
    res.json({
      success: true,  // 🚨 NOT IN SPEC
      token: token,
      expires_in: 3600,
      user: {  // 🚨 NOT IN SPEC
        id: user.id,
        name: user.name
      }
    });
  }
});
```

**Drift Analysis**:
```
🚫 INTERFACE CONTRACT VIOLATION DETECTED

Specification Response: { "token": string, "expires_in": number }
Implemented Response: { "success": bool, "token": string, "expires_in": number, "user": object }

Drift Type: Interface Contract Violation
Severity: Major

Why This is Drift:
- Added "success" field not in specification
- Added "user" object not in specification
- Response structure doesn't match contract
- Could break API consumers expecting exact format

Required Action: Remove extra fields, return only {token, expires_in} as specified.
```

---

## Integration with Other Skills

### With `uncertainty-protocol-enforcer`

When specifications are ambiguous:
1. Detect ambiguity during validation
2. Trigger `uncertainty-protocol-enforcer`
3. Request specification clarification
4. Resume validation after clarification

### With `technical-debt-evaluator`

When drift creates technical debt:
1. Detect specification deviation
2. Trigger `technical-debt-evaluator`
3. Assess business value vs cost
4. Require client authorization for deviation

### With `security-first-analyzer`

When drift affects security:
1. Detect security-related drift
2. Trigger `security-first-analyzer`
3. Validate threat model implications
4. Enforce security specification compliance

---

## Memory Integration (Law #6)

**Log Drift Prevention Events**:

After preventing drift, log the pattern:

```bash
python scripts/log_drift_prevention.py \
  --type "architecture" \
  --specification "Use Repository pattern for all data access" \
  --proposed "Direct JDBC access in Controller" \
  --resolution "Refactored to use UserRepository following pattern"
```

**Benefits**:
- Build library of common drift patterns
- Improve drift detection over time
- Learn project-specific patterns
- Share patterns across sessions

---

**Last Updated**: 2025-10-29
**Skill Version**: 1.0.0

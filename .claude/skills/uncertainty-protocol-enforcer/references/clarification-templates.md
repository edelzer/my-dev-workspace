# Clarification Question Templates

Frameworks for generating effective clarifying questions that resolve uncertainty quickly and professionally.

## Question Generation Framework

### Core Principles

**Effective Clarifying Questions**:
1. **Specific** - Target exact uncertainty, not general exploration
2. **Actionable** - Enable immediate decision-making
3. **Contextual** - Explain why information is needed
4. **Bounded** - Limited scope (3-5 questions maximum)
5. **Professional** - Follow Law #5 (Senior Developer Leadership)

**Question Structure**:
```
Context: [Why this information is needed]
Question: [Specific, actionable question]
Options (if applicable): [Multiple-choice when appropriate]
Impact: [What this decision affects]
```

---

## Template Categories

### 1. Requirements Clarification Template

**Use When**: User request is ambiguous or lacks detail

**Template**:
```
⚠️ UNCERTAINTY: Requirements Clarification Needed

Context: [User's request] requires specific implementation details to proceed correctly.

Clarifying Questions:

1. **Functional Scope**: What specific functionality should [feature] support?
   - Option A: [Minimal scope]
   - Option B: [Moderate scope]
   - Option C: [Comprehensive scope]

2. **User Experience**: How should users interact with [feature]?
   - [Specific UX question]

3. **Edge Cases**: Should [feature] handle [specific edge case]?

4. **Success Criteria**: How will we know [feature] is complete and working correctly?

Impact: These decisions affect architecture, effort estimation, and testing strategy.
```

**Example**:
```
⚠️ UNCERTAINTY: Requirements Clarification Needed

Context: "Add user permissions" requires specific role and permission details.

Clarifying Questions:

1. **Role Structure**: What user roles should the system support?
   - Option A: Simple (Admin / User)
   - Option B: Moderate (Admin / Editor / Viewer)
   - Option C: Complex (Custom role creation with granular permissions)

2. **Permission Granularity**: What level of permission control is needed?
   - Resource-level (can edit any document)
   - Object-level (can edit specific documents)
   - Field-level (can edit specific fields)

3. **Inheritance**: Should permissions inherit hierarchically?

4. **Admin Override**: Should admins have automatic access to all resources?

Impact: Architecture (RBAC vs ABAC), database schema design, and implementation complexity.
```

---

### 2. Technical Approach Template

**Use When**: Multiple viable technical approaches exist

**Template**:
```
⚠️ UNCERTAINTY: Technical Approach Selection

Context: Multiple valid approaches exist for [task]. Need guidance on selection criteria.

Approach Options:

**Option A: [Approach Name]**
- Pros: [Benefits]
- Cons: [Trade-offs]
- Effort: [Time estimate]
- Best for: [Scenario]

**Option B: [Approach Name]**
- Pros: [Benefits]
- Cons: [Trade-offs]
- Effort: [Time estimate]
- Best for: [Scenario]

**Option C: [Approach Name]**
- Pros: [Benefits]
- Cons: [Trade-offs]
- Effort: [Time estimate]
- Best for: [Scenario]

Clarifying Questions:

1. **Priority**: What's more important: [performance / maintainability / speed to market]?
2. **Constraints**: Are there constraints on [technical aspect]?
3. **Future Needs**: Should we optimize for [current needs / future scalability]?

Professional Recommendation: [Your expert opinion with reasoning]

Impact: Affects architecture, maintainability, and long-term technical debt.
```

**Example**:
```
⚠️ UNCERTAINTY: Authentication Approach Selection

Context: Multiple authentication strategies exist. Need guidance on which aligns with requirements and infrastructure.

Approach Options:

**Option A: JWT (Stateless)**
- Pros: Scalable, no server-side sessions, good for microservices
- Cons: Can't revoke tokens easily, token size overhead
- Effort: 4-6 hours
- Best for: Distributed systems, mobile apps, high-scale APIs

**Option B: Session-Based (Stateful)**
- Pros: Easy token revocation, smaller overhead, simpler security model
- Cons: Requires session store, server affinity considerations
- Effort: 3-5 hours
- Best for: Monolithic apps, traditional web applications

**Option C: OAuth 2.0 / OIDC**
- Pros: Industry standard, delegated auth, built-in security features
- Cons: More complex, external dependency, longer implementation
- Effort: 8-12 hours
- Best for: Enterprise apps, third-party integrations

Clarifying Questions:

1. **Infrastructure**: Do you have existing authentication infrastructure (Auth0, Keycloak, etc.)?
2. **Client Types**: Will this support web only, or also mobile/desktop apps?
3. **Scale**: Expected concurrent users and authentication frequency?
4. **Third-Party**: Need to support "Sign in with Google/GitHub" etc.?

Professional Recommendation: Based on typical requirements, Option A (JWT) with Option C (OAuth) for third-party sign-ins provides the best balance of scalability and user experience.

Impact: Security architecture, infrastructure requirements, user experience, and integration complexity.
```

---

### 3. Scope Definition Template

**Use When**: Task boundaries are unclear

**Template**:
```
⚠️ UNCERTAINTY: Scope Definition Needed

Context: [Feature/Task] has unclear boundaries. Need scope definition to proceed.

Scope Questions:

1. **Included in Scope**: Does this task include:
   - [Boundary item 1]? (Yes/No)
   - [Boundary item 2]? (Yes/No)
   - [Boundary item 3]? (Yes/No)

2. **Excluded from Scope**: Should we explicitly NOT include:
   - [Potential expansion 1]
   - [Potential expansion 2]

3. **Dependencies**: What existing features/systems must this integrate with?

4. **Phase Approach**: Should this be:
   - Delivered all at once (comprehensive)
   - Delivered in phases (MVP → enhancements)

Impact: Effort estimation, delivery timeline, and resource allocation.
```

**Example**:
```
⚠️ UNCERTAINTY: Reporting Feature Scope Definition

Context: "Add reporting" is broad and could include many features. Need clear scope.

Scope Questions:

1. **Included in Scope**: Does "reporting" include:
   - Pre-built report templates? (Yes/No)
   - Custom report builder UI? (Yes/No)
   - Scheduled/automated reports? (Yes/No)
   - Export formats (PDF/Excel/CSV)? (Yes/No)
   - Email delivery of reports? (Yes/No)
   - Historical data analysis? (Yes/No)

2. **Excluded from Scope**: Should we explicitly NOT include:
   - Advanced analytics/dashboards
   - Real-time reporting
   - Data visualization customization

3. **Report Types**: Which specific reports are needed initially?
   - User activity report
   - Sales/revenue report
   - System performance report
   - [Other specific reports]

4. **Phase Approach**: Deliver as:
   - MVP: Basic reports with manual generation
   - Phase 2: Scheduling and automation
   - Phase 3: Custom report builder

Impact: Determines implementation complexity (simple queries vs. full report builder), delivery timeline (weeks vs. months), and architecture decisions (sync vs. async report generation).
```

---

### 4. Architecture Decision Template

**Use When**: Uncertain about architectural impact or fit

**Template**:
```
⚠️ UNCERTAINTY: Architecture Decision Required

Context: [Change/feature] may affect system architecture. Need validation before proceeding.

Architecture Questions:

1. **Existing Patterns**: Does this fit our current architecture pattern ([pattern name])?
   - If no: Should we extend the pattern or create exception?

2. **Integration Points**: Where should this integrate with existing systems?
   - [System A] via [mechanism]?
   - [System B] via [mechanism]?

3. **Layer Placement**: Should this be implemented at:
   - [Layer 1] (e.g., Controller layer)
   - [Layer 2] (e.g., Service layer)
   - [Layer 3] (e.g., Data layer)

4. **Impact Assessment**: What existing components will this affect?

Professional Opinion: [Your architectural assessment and recommendation]

Impact: Architectural integrity, maintainability, and potential technical debt.
```

**Example**:
```
⚠️ UNCERTAINTY: Caching Layer Architecture Decision

Context: Implementing caching could be at multiple layers. Need guidance on architectural fit.

Architecture Questions:

1. **Existing Patterns**: Current architecture uses direct database queries in services.
   - Should we add caching layer (deviates from pattern)?
   - Should we implement at database level (maintains pattern)?

2. **Cache Technology**: What caching technology aligns with infrastructure?
   - Redis (external dependency, distributed)
   - In-memory (simple, process-bound)
   - Database query cache (minimal change)

3. **Layer Placement**: Where should cache logic live?
   - Repository layer (closest to data, encapsulated)
   - Service layer (business logic layer, more flexible)
   - API layer (HTTP caching, simpler but less granular)

4. **Invalidation Strategy**: How should cache invalidation work?
   - Time-based expiry
   - Event-based invalidation
   - Manual invalidation via admin interface

Professional Opinion: Repository layer with Redis caching provides best balance of performance, scalability, and architectural integrity. Requires infrastructure setup but aligns with microservices direction.

Impact: Adds infrastructure dependency (Redis), modifies repository pattern, affects consistency guarantees, improves read performance 10-100x.
```

---

### 5. Security & Compliance Template

**Use When**: Security implications are uncertain

**Template**:
```
⚠️ UNCERTAINTY: Security/Compliance Clarification Required

Context: [Feature/change] handles sensitive data or has security implications.

Security Questions:

1. **Data Sensitivity**: What type of data is involved?
   - PII (Personally Identifiable Information)?
   - Financial data?
   - Health data (HIPAA)?
   - Authentication credentials?

2. **Compliance Requirements**: Are there regulatory requirements?
   - GDPR (EU users)?
   - HIPAA (health data)?
   - PCI-DSS (payment data)?
   - SOC 2 compliance?

3. **Threat Model**: What threats should we mitigate?
   - [Threat 1: e.g., SQL injection]
   - [Threat 2: e.g., XSS]
   - [Threat 3: e.g., unauthorized access]

4. **Security Controls**: What security measures are required?
   - Encryption at rest?
   - Encryption in transit?
   - Access logging/audit trail?
   - Multi-factor authentication?

SECURITY-FIRST PROTOCOL: Cannot proceed without threat model definition.

Impact: Security architecture, compliance risk, and implementation complexity.
```

---

### 6. Technical Debt Authorization Template

**Use When**: Considering shortcuts or quick fixes

**Template**:
```
⚠️ UNCERTAINTY: Technical Debt Authorization Required

Context: [Proposed shortcut/quick fix] introduces technical debt.

Debt Assessment:

**The Proper Solution**:
- Approach: [Full implementation]
- Effort: [Estimated time]
- Benefits: [Long-term advantages]

**The Quick Fix**:
- Approach: [Shortcut approach]
- Effort: [Estimated time]
- Trade-offs: [What we sacrifice]

**Technical Debt Created**:
- Type: [e.g., architectural debt, code quality debt]
- Severity: [Low / Medium / High]
- Paydown Effort: [Estimated time to fix properly later]

Authorization Questions:

1. **Business Justification**: What business value justifies this debt?
2. **Timeline Pressure**: What's the urgency driving this decision?
3. **Paydown Plan**: When should we address this properly?
4. **Risk Tolerance**: What's the acceptable risk level?

DEBT PROTOCOL: Cannot introduce debt without explicit authorization.

Impact: Long-term maintainability, future development velocity, and technical quality.
```

---

## Question Quality Guidelines

### ✅ Good Clarifying Questions

**Characteristics**:
- Specific scope ("Should [feature] support [specific capability]?")
- Provides context (explains why information is needed)
- Offers options when appropriate (multiple-choice)
- Links to impact (explains consequences of decision)
- Professional tone (follows Law #5)

**Example**:
```
Should user authentication support multi-factor authentication (MFA)?

Context: Security requirements affect initial architecture design. Adding MFA later
requires significant refactoring of authentication flow.

Options:
- Option A: MFA required for all users
- Option B: MFA optional (user can enable)
- Option C: No MFA (defer to later phase)

Impact: Affects authentication schema, user flow complexity, and security posture.
```

---

### ❌ Poor Clarifying Questions

**Characteristics**:
- Too vague ("What do you want?")
- Too many questions (overwhelms user)
- No context (doesn't explain why asking)
- Assumes technical knowledge (uses jargon without explanation)
- Doesn't provide options (open-ended when multiple-choice would help)

**Bad Example**:
```
What authentication approach should I use?
```

**Why Bad**: No context, no options, doesn't explain implications, too open-ended

**Fixed Version**:
```
⚠️ UNCERTAINTY: Authentication Approach Selection

Context: Authentication strategy affects security, scalability, and user experience.

Should we use:
- Option A: JWT (stateless, scalable, good for APIs)
- Option B: Sessions (stateful, simpler revocation, good for web apps)
- Option C: OAuth (industry standard, supports third-party login)

Factors to consider:
- Do you need "Sign in with Google/GitHub" support? (→ OAuth)
- High-scale API with mobile apps? (→ JWT)
- Traditional web app with session management? (→ Sessions)

Impact: Affects infrastructure requirements, security architecture, and implementation effort.
```

---

## Integration with Law #5 (Senior Developer Leadership)

**Professional Communication Standards**:

1. **Expert Guidance** - Provide professional recommendations with reasoning
2. **Educational Value** - Help client understand trade-offs and implications
3. **Complete Context** - Explain why decisions matter
4. **Risk Assessment** - Identify potential issues proactively
5. **Option Presentation** - Give structured choices with analysis

**Example Professional Tone**:
```
⚠️ UNCERTAINTY DETECTED - EXPERT GUIDANCE NEEDED

As your Senior Developer, I need clarification on [specific issue] before proceeding.

Technical Context: [Why this matters technically]

Business Impact: [How this affects project goals]

Professional Recommendation: Based on [reasoning], I recommend [approach] because [justification].

Alternative Approaches: [Other options with trade-offs]

Decision Required: [Specific question requiring answer]

I am stopping implementation to ensure we make the right architectural decision.
```

---

## Memory Integration (Law #6)

**Log Successful Clarifications**:

After uncertainty resolved, log the pattern:

```bash
python scripts/log_uncertainty.py \
  --type "requirements-clarification" \
  --issue "User permissions scope was ambiguous" \
  --resolution "Client specified RBAC with Admin/Editor/Viewer roles" \
  --questions-asked "Role structure, permission granularity, inheritance model" \
  --decision "Implement RBAC at object level with role inheritance"
```

**Benefits**:
- Reuse successful question patterns
- Identify recurring ambiguities
- Improve question quality over time
- Build project-specific clarification library

---

**Last Updated**: 2025-10-29
**Skill Version**: 1.0.0

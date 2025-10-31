# Uncertainty Patterns Reference

Comprehensive list of uncertainty indicators that trigger the STOP protocol.

## Language-Based Indicators

### Tentative Modifiers
- "probably" - Indicates less than 100% confidence
- "might" / "may" / "could" - Expresses possibility, not certainty
- "perhaps" / "maybe" - Suggests speculation
- "likely" / "unlikely" - Probability expressions require validation
- "possibly" - Indicates uncertainty about feasibility

### Assumption Markers
- "assuming" / "assuming that" - Explicit assumption requiring validation
- "I think" / "I believe" - Personal opinion, not confirmed fact
- "it seems" / "appears to be" - Observation requiring verification
- "in my understanding" - Interpretation needing confirmation
- "as far as I know" - Limited knowledge acknowledgment

### Qualification Phrases
- "in most cases" / "typically" / "usually" - General patterns, not specific to this case
- "often" / "sometimes" / "occasionally" - Frequency qualifiers indicating variability
- "generally speaking" - Broad statement requiring case-specific validation
- "tends to" - Pattern observation, not guaranteed outcome

### Uncertainty Expressions
- "I'm not sure" / "I'm uncertain" - Direct uncertainty admission
- "unclear" / "ambiguous" - Lack of clarity requiring resolution
- "it's not clear" / "it's unclear whether" - Missing information
- "I don't know" - Knowledge gap requiring input
- "it depends" - Conditional logic requiring criteria definition

### Hedging Language
- "more or less" - Approximation requiring precision
- "sort of" / "kind of" - Vague qualifiers indicating uncertainty
- "roughly" / "approximately" - Estimates requiring exact values
- "somewhat" / "fairly" - Degree qualifiers lacking specificity

## Scenario-Based Indicators

### Multiple Viable Approaches

**Pattern**: Presenting options without clear recommendation

**Examples**:
- "We could use [A] or [B]..."
- "Both [X] and [Y] would work..."
- "There are several ways to approach this..."
- "Option 1: [...] Option 2: [...] Option 3: [...]"

**Trigger**: When 2+ approaches presented without:
- Clear selection criteria
- Trade-off analysis
- Client preference indication
- Contextual constraints

**Required Action**: Present options formally with pros/cons, request client decision

---

### Missing Context

**Pattern**: Required information not provided

**Examples**:
- "I'll implement [X], assuming we're using [Y]..."
- "Without knowing [Z], I'll default to [approach]..."
- "If the requirement is [A], then [solution 1], otherwise [solution 2]..."
- "I don't have information about [critical detail]..."

**Trigger**: When implementation requires:
- Environment details (dev/staging/prod)
- Technology stack choices
- Business rules or constraints
- Integration points or dependencies
- User experience requirements

**Required Action**: STOP and request specific context before proceeding

---

### Ambiguous Requirements

**Pattern**: Specifications open to multiple interpretations

**Examples**:
- "The requirement says 'user-friendly' which could mean..."
- "'Handle errors gracefully' - this is open to interpretation..."
- "'Secure authentication' - does this include MFA, password policies, etc.?"
- "The scope of 'reporting' could include [various features]..."

**Trigger**: When requirements include:
- Subjective terms without definition ("fast", "user-friendly", "secure")
- Broad categories without specifics ("reporting", "analytics", "permissions")
- Missing success criteria
- Undefined edge cases or boundaries

**Required Action**: Request specific, measurable requirements

---

### Conflicting Information

**Pattern**: Contradictory specifications or requirements

**Examples**:
- "The doc says [A] but the code implements [B]..."
- "This conflicts with our earlier decision to [X]..."
- "The architecture diagram shows [Y] but the spec describes [Z]..."
- "Previous discussions indicated [approach 1], but current request suggests [approach 2]..."

**Trigger**: When encountering:
- Documentation vs implementation conflicts
- Current request vs previous decisions conflicts
- Specification vs architecture conflicts
- Stakeholder disagreements

**Required Action**: Highlight conflict, request clarification/priority

---

### Explicit Uncertainty

**Pattern**: Claude directly states lack of confidence

**Examples**:
- "I'm uncertain about the best approach here..."
- "I don't have enough information to proceed confidently..."
- "This is outside my typical experience..."
- "I need clarification before continuing..."

**Trigger**: ANY direct admission of uncertainty

**Required Action**: Already in STOP mode - generate clarifying questions

---

## Context-Specific Patterns

### Security Implementation Uncertainty

**Triggers**:
- "How secure does this need to be?"
- "Should we implement [security measure]?"
- "I'm not sure about the threat model..."
- "Does this need to comply with [regulation]?"

**Risk**: Security assumptions can create vulnerabilities

**Action**: Invoke Security-First Protocol, STOP until threat model defined

---

### Architecture Decision Uncertainty

**Triggers**:
- "Should we modify the existing [component] or create new one?"
- "I'm uncertain if this fits the current architecture..."
- "This could be implemented at [layer 1] or [layer 2]..."
- "Does this violate our architectural patterns?"

**Risk**: Architectural drift (Law #1B violation)

**Action**: Invoke Specification Adherence Checker, validate against architecture

---

### Technical Debt Uncertainty

**Triggers**:
- "We could take a shortcut here..."
- "The proper solution would take longer..."
- "This is a quick fix, but not sustainable..."
- "Should we implement the full solution or MVP?"

**Risk**: Unauthorized technical debt accumulation

**Action**: Invoke Technical Debt Evaluator, require authorization

---

### Performance/Scale Uncertainty

**Triggers**:
- "How many users/requests do you expect?"
- "What's the performance requirement?"
- "I'm not sure if this will scale..."
- "Should we optimize for [metric]?"

**Risk**: Over-engineering or under-engineering

**Action**: Request specific performance/scale requirements

---

## Uncertainty Prevention Strategies

### Proactive Clarification

**Before Implementation**:
1. Review requirements for ambiguous terms
2. Identify assumptions and document them
3. Check for missing context or specifications
4. Validate understanding with client

**During Planning**:
1. Present multiple approaches with trade-offs
2. Ask checkpoint questions early
3. Validate architectural fit
4. Confirm success criteria

### Memory-Based Prevention

**Check Historical Patterns**:
```bash
# Review past uncertainties in similar contexts
View /memories/protocol-compliance/uncertainty-log.xml
Filter by: [similar task type]
```

**Learn from Past Resolutions**:
- What questions resolved similar uncertainties?
- What patterns led to uncertainty?
- What context was missing repeatedly?

---

## False Positives (When NOT to Trigger)

**Confident Explanations**:
- "This works because [technical explanation]..." - Technical reasoning, not uncertainty
- "According to [documentation/standard]..." - Citing authoritative sources
- "Based on the specification in [file/section]..." - Following defined requirements

**Pedagogical Language**:
- "Let me explain how this works..." - Teaching, not uncertainty
- "The reason for this is..." - Explanation, not speculation

**Appropriate Qualifiers**:
- "This is best practice for [context]..." - Industry standard recommendation
- "Following CLAUDE.md protocol..." - Protocol adherence, not uncertainty

---

## Examples: Uncertainty Detection

### ✅ Example 1: Tentative Language

**Input**: "I think we should use JWT tokens, probably with a 1-hour expiry..."

**Analysis**:
- "I think" - Assumption marker
- "probably" - Tentative modifier
- No justification for approach or expiry choice

**Trigger**: YES - Language-based uncertainty

---

### ✅ Example 2: Multiple Approaches

**Input**: "We could implement this as REST API or GraphQL. Both would work."

**Analysis**:
- Two viable approaches presented
- No selection criteria
- No trade-off analysis
- No client preference indicated

**Trigger**: YES - Multiple approaches without recommendation

---

### ✅ Example 3: Missing Context

**Input**: "I'll implement the payment flow, assuming we're using Stripe..."

**Analysis**:
- "assuming" - Assumption marker
- Payment provider not specified
- Critical architecture decision based on assumption

**Trigger**: YES - Missing context + critical assumption

---

### ❌ Example 4: False Positive (Confident Explanation)

**Input**: "I'll use bcrypt for password hashing because it's the industry standard for secure password storage, provides built-in salting, and is resistant to timing attacks as specified in OWASP guidelines."

**Analysis**:
- No uncertainty language
- Clear justification based on standards
- References authoritative source (OWASP)
- Follows security best practices

**Trigger**: NO - This is confident, justified technical decision

---

## Integration with Law #1A

This reference file supports CLAUDE.md Law #1A enforcement:

**Law #1A States**:
> "If you are unsure about ANY of the following, you MUST immediately stop all actions and request clarification:
> - The next step to take
> - How to interpret requirements or specifications
> - Which protocol, tool, or approach to use
> - The expected outcome or behavior
> - Whether an action might break existing functionality
> - If you lack sufficient context to proceed safely"

**This Skill Automates**:
- Real-time detection of uncertainty across all task types
- Automatic STOP protocol triggering
- Clarifying question generation
- Uncertainty pattern logging for continuous improvement

---

**Last Updated**: 2025-10-29
**Skill Version**: 1.0.0

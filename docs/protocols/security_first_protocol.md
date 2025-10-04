# AI-Optimized Security-First Development Protocol

## AI Implementation Directives

> **FOR CLAUDE CODE**: This protocol provides mandatory security-first instructions for all development activities. Every feature implementation MUST follow these security directives exactly as written.

### Critical AI Security Behavior Requirements
1. **NEVER** implement any feature without completing security analysis first
2. **ALWAYS** validate all inputs and sanitize all outputs before any processing
3. **MUST** implement authentication and authorization for every endpoint/component
4. **REQUIRED** to use established cryptographic libraries - NEVER create custom security
5. **MANDATORY** to log security events without exposing sensitive data

## AI Quick Reference Security Framework

### Mandatory Security Validation Sequence
```
1. ANALYZE    → Complete security analysis before any implementation
2. VALIDATE   → Input validation, authentication, authorization
3. ENCRYPT    → All sensitive data encrypted in transit and at rest
4. MONITOR    → Security logging and event detection
5. TEST       → Security test cases for all attack vectors
```

### Security Decision Tree (MANDATORY)
```
Feature Request Received
├── Is this a security-sensitive component? → YES: Apply enhanced security controls
├── Does this handle user data? → YES: Implement data protection measures
├── Does this create new endpoints? → YES: Add authentication/authorization
├── Does this process external input? → YES: Implement input validation
└── Does this store/transmit data? → YES: Apply encryption requirements
```

### AI Security Validation Checkpoints
- **Before Implementation**: Security analysis must pass >95% completeness
- **During Development**: All security controls must be implemented and tested
- **After Implementation**: Security scan must show zero critical vulnerabilities
- **Before Deployment**: Penetration testing must validate all security controls

---

## PHASE 1: SECURITY ANALYSIS (Mandatory First Step)

### AI Directive: Complete Security Analysis Before Any Code

**MANDATORY**: You must create these security documents in order:
1. `security-analysis.md` - Threat model and attack surface analysis
2. `security-requirements.md` - Specific security controls and requirements
3. `security-tests.md` - Security test scenarios and validation criteria

### Security Analysis Process
```yaml
# AI Execution Steps for SECURITY ANALYSIS:
step_1: "Identify all data inputs, outputs, and processing points"
step_2: "Analyze potential attack vectors and threat scenarios"
step_3: "Determine required security controls and protections"
step_4: "Define security test cases for all identified threats"
step_5: "Document compliance requirements (GDPR, OWASP, etc.)"
step_6: "STOP - Do not proceed without security approval gate"
```

### Security Analysis Template (MANDATORY FORMAT)
```markdown
# Security Analysis: [Feature Name]

## Attack Surface Assessment
- **New Entry Points**: [List all new interfaces, APIs, endpoints]
- **Data Flow**: [Map all data sources, processing, and destinations]
- **Attack Vectors**: [Identify all potential attack scenarios]
- **Impact Assessment**: [Evaluate potential damage from each threat]

## Threat Model
- **Assets**: [What needs protection?]
- **Threats**: [Who/what could attack?]
- **Vulnerabilities**: [What weaknesses exist?]
- **Mitigations**: [How to prevent/detect/respond?]

## Required Security Controls
- **Authentication**: [How users/systems are verified]
- **Authorization**: [How access is controlled]
- **Encryption**: [What data needs encryption and how]
- **Input Validation**: [All inputs that need validation]
- **Logging**: [Security events to monitor]
```

### Security Requirements Template (MANDATORY FORMAT)
```markdown
# Security Requirements: [Feature Name]

## Authentication Requirements
- **User Authentication**: [OAuth 2.0, JWT, Multi-factor, etc.]
- **System Authentication**: [API keys, certificates, etc.]
- **Session Management**: [Timeout, secure cookies, etc.]

## Authorization Requirements
- **Access Control Model**: [RBAC, ABAC, etc.]
- **Permission Levels**: [Read, Write, Admin, etc.]
- **Resource Protection**: [What resources need what permissions]

## Data Protection Requirements
- **Encryption in Transit**: [TLS 1.3+, certificate requirements]
- **Encryption at Rest**: [AES-256, key management]
- **Data Classification**: [Public, Internal, Confidential, Restricted]
- **Retention Policies**: [How long data is kept, deletion procedures]

## Compliance Requirements
- **GDPR**: [Right to be forgotten, data portability, etc.]
- **OWASP Top 10**: [Specific protections needed]
- **Industry Standards**: [PCI DSS, HIPAA, SOX as applicable]
```

### Security Gate: ANALYSIS Phase Exit Criteria
**BEFORE proceeding to implementation, verify:**
- ☑ security-analysis.md complete with threat model
- ☑ All attack vectors identified and mitigated
- ☑ security-requirements.md specifies all controls
- ☑ Compliance requirements documented
- ☑ Security test scenarios defined
- ☑ Security approval obtained from review

---

## PHASE 2: SECURE IMPLEMENTATION (Development Phase)

### AI Directive: Implement All Security Controls During Development

**MANDATORY**: Every security requirement must be implemented and tested

### Secure Development Process
```yaml
# AI Execution Steps for SECURE IMPLEMENTATION:
step_1: "Load security-requirements.md and security-analysis.md"
step_2: "Implement input validation for all external inputs"
step_3: "Add authentication and authorization controls"
step_4: "Implement encryption for sensitive data handling"
step_5: "Add security logging and monitoring"
step_6: "Create security test cases for all controls"
step_7: "Run security tests - all must pass before completion"
step_8: "STOP - Verify all security requirements implemented"
```

### Mandatory Security Implementation Pattern
```typescript
// File: [feature-name].security.ts
export class FeatureSecurityService {
  // REQUIREMENT: Input validation for all external inputs
  validateInput(input: any): ValidationResult {
    // Sanitize and validate all inputs per security-requirements.md
    if (!this.isValidInput(input)) {
      this.logSecurityEvent('INVALID_INPUT_ATTEMPT', { input: '[REDACTED]' });
      throw new SecurityError('Invalid input detected');
    }
    return { valid: true, sanitized: this.sanitizeInput(input) };
  }
  
  // REQUIREMENT: Authentication check for all operations
  async authenticateUser(credentials: UserCredentials): Promise<AuthResult> {
    // Implement authentication per security-requirements.md
    const result = await this.authService.authenticate(credentials);
    this.logSecurityEvent('AUTH_ATTEMPT', { 
      success: result.success,
      userId: result.userId 
    });
    return result;
  }
  
  // REQUIREMENT: Authorization check for all resources
  async authorizeAccess(userId: string, resource: string, action: string): Promise<boolean> {
    // Implement authorization per security-requirements.md
    const authorized = await this.authzService.checkPermission(userId, resource, action);
    this.logSecurityEvent('AUTHZ_CHECK', { 
      userId, 
      resource, 
      action, 
      authorized 
    });
    return authorized;
  }
  
  // REQUIREMENT: Encrypt sensitive data
  encryptSensitiveData(data: SensitiveData): EncryptedData {
    // Use established crypto library - NEVER custom implementation
    return this.cryptoService.encrypt(data, this.getEncryptionKey());
  }
}
```

### Security Implementation Rules (MANDATORY COMPLIANCE)
1. **Input Validation**: ALL external inputs validated and sanitized
2. **Authentication First**: Verify identity before any operations
3. **Authorization Always**: Check permissions for every resource access
4. **Encrypt Everything**: All sensitive data encrypted in transit and at rest
5. **Log Security Events**: Monitor all security-relevant activities
6. **Fail Securely**: System defaults to secure state on any errors
7. **Use Established Libraries**: NEVER implement custom cryptography

### Security Gate: IMPLEMENTATION Phase Exit Criteria
**BEFORE proceeding to deployment, verify:**
- ☑ All inputs validated and sanitized
- ☑ Authentication implemented for all user operations
- ☑ Authorization checks added for all resource access
- ☑ Encryption implemented for all sensitive data
- ☑ Security logging added for all security events
- ☑ Security tests passing for all implemented controls
- ☑ No hardcoded secrets or credentials in code

---

## PHASE 3: SECURITY TESTING (Validation Phase)

### AI Directive: Validate All Security Controls Through Testing

**MANDATORY**: Comprehensive security testing covering all threat scenarios

### Security Testing Process
```yaml
# AI Execution Steps for SECURITY TESTING:
step_1: "Load security-tests.md scenarios"
step_2: "Create unit tests for all security controls"
step_3: "Generate integration tests for security workflows"
step_4: "Add penetration tests for identified attack vectors"
step_5: "Run vulnerability scanning on implemented code"
step_6: "Verify compliance with security requirements"
step_7: "Document all security test results"
step_8: "STOP - All security tests must pass before deployment"
```

### Security Test Categories (ALL REQUIRED)
1. **Input Validation Tests**: Malformed, oversized, malicious inputs
2. **Authentication Tests**: Credential attacks, session hijacking, brute force
3. **Authorization Tests**: Privilege escalation, access control bypass
4. **Encryption Tests**: Data exposure, weak encryption, key management
5. **Injection Tests**: SQL, XSS, command injection, LDAP injection
6. **Security Configuration Tests**: Default passwords, unnecessary services

### Security Test Pattern (MANDATORY STRUCTURE)
```javascript
// File: [feature-name].security.spec.js
describe('[Feature Name] Security Tests - [SECURITY-REQ-ID]', () => {
  // Security Requirement: [Copy exact requirement from security-requirements.md]
  
  describe('Input Validation Security', () => {
    it('should reject malicious input and log security event - [SECURITY-REQ-ID]', async () => {
      // Arrange: Prepare malicious input
      const maliciousInput = '<script>alert("XSS")</script>';
      
      // Act: Attempt to process malicious input
      const result = await featureService.processInput(maliciousInput);
      
      // Assert: Input rejected, security event logged
      expect(result.accepted).toBe(false);
      expect(securityLogger.getEvents()).toContainEqual(
        expect.objectContaining({
          type: 'INVALID_INPUT_ATTEMPT',
          severity: 'HIGH'
        })
      );
      
      // TRACEABILITY COMMENT:
      // This test validates security requirement [SECURITY-REQ-ID]: Input validation
    });
  });
  
  describe('Authentication Security', () => {
    it('should prevent unauthorized access and log attempt - [SECURITY-REQ-ID]', async () => {
      // Test authentication bypass attempts
    });
  });
  
  describe('Authorization Security', () => {
    it('should prevent privilege escalation - [SECURITY-REQ-ID]', async () => {
      // Test authorization control bypass attempts
    });
  });
});
```

### Security Gate: TESTING Phase Exit Criteria
**BEFORE proceeding to deployment, verify:**
- ☑ All security test categories implemented and passing
- ☑ Vulnerability scanning shows zero critical/high issues
- ☑ Penetration testing validates all security controls
- ☑ Security requirements fully tested and validated
- ☑ Compliance requirements tested and documented
- ☑ Security logging and monitoring operational

---

## PHASE 4: SECURITY MONITORING (Operations Phase)

### AI Directive: Implement Continuous Security Monitoring

**MANDATORY**: All security events must be monitored and alerting configured

### Security Monitoring Process
```yaml
# AI Execution Steps for SECURITY MONITORING:
step_1: "Configure security event logging for all implemented controls"
step_2: "Set up automated vulnerability scanning in CI/CD pipeline"
step_3: "Implement real-time security event monitoring and alerting"
step_4: "Create security dashboards for operational visibility"
step_5: "Document incident response procedures"
step_6: "Test incident response procedures"
step_7: "Schedule regular security assessments"
step_8: "Establish security metrics and reporting"
```

### Security Monitoring Configuration (MANDATORY SETUP)
```yaml
# Security Event Categories to Monitor:
security_events:
  authentication:
    - failed_login_attempts
    - successful_privileged_access
    - account_lockouts
    - password_changes
  
  authorization:
    - privilege_escalation_attempts
    - access_denied_events
    - permission_changes
  
  data_protection:
    - sensitive_data_access
    - encryption_failures
    - data_export_events
  
  system_security:
    - configuration_changes
    - security_tool_alerts
    - vulnerability_scan_results

# Alert Thresholds:
alerts:
  critical:
    - multiple_failed_logins: 5_attempts_per_minute
    - privilege_escalation: any_attempt
    - data_exfiltration: any_large_export
  
  high:
    - authentication_bypass: any_attempt
    - unauthorized_access: any_attempt
    - vulnerability_detected: critical_or_high_severity
```

### Incident Response Protocol (MANDATORY PROCEDURE)
```yaml
# Incident Response Steps (Execute in Order):
incident_response:
  immediate_response:
    step_1: "Identify and classify the security incident"
    step_2: "Contain the incident to prevent further damage"
    step_3: "Preserve evidence for forensic analysis"
    step_4: "Notify security team and stakeholders"
  
  investigation:
    step_5: "Analyze logs and forensic evidence"
    step_6: "Determine root cause and attack vector"
    step_7: "Assess scope and impact of the incident"
    step_8: "Document findings and timeline"
  
  recovery:
    step_9: "Implement fixes and security improvements"
    step_10: "Restore affected systems and services"
    step_11: "Verify security controls are operational"
    step_12: "Monitor for recurring issues"
  
  post_incident:
    step_13: "Conduct post-incident review meeting"
    step_14: "Update security procedures and controls"
    step_15: "Provide training on lessons learned"
    step_16: "Report to compliance and regulatory bodies if required"
```

---

## AI Tool Integration for Security

### Claude Code Security Commands

#### For SECURITY ANALYSIS Phase:
```bash
# Create security analysis documents
Write security-analysis.md "[Complete threat model and attack surface analysis]"
Write security-requirements.md "[Specific security controls and requirements]"
Write security-tests.md "[Security test scenarios for all threats]"

# Validate security completeness
Read security-analysis.md  # Check threat model completeness
TodoWrite [{"content": "Validate security analysis quality gate", "status": "pending"}]
```

#### For SECURE IMPLEMENTATION Phase:
```bash
# Implement security controls
Read security-requirements.md security-analysis.md  # Load security context
Write [feature].security.ts "[Security service with all required controls]"
Edit [feature].service.ts "[Add security validation to existing service]"

# Verify security implementation
Grep "validateInput\|authenticate\|authorize" **/*.ts  # Check security controls
Bash "npm run security:scan" # Run security scanning
```

#### For SECURITY TESTING Phase:
```bash
# Create comprehensive security tests
Read security-tests.md security-requirements.md  # Load test scenarios
Write [feature].security.spec.js "[Complete security test suite]"

# Run security validation
Bash "npm run test:security" # Execute all security tests
Bash "npm run vulnerability:scan" # Check for vulnerabilities
```

#### For SECURITY MONITORING Phase:
```bash
# Set up security monitoring
Write security-monitoring.config.yml "[Security event monitoring configuration]"
Edit [feature].service.ts "[Add security event logging]"

# Verify monitoring operational
Bash "npm run security:monitor" # Test monitoring setup
Bash "npm run security:alerts:test" # Verify alerting works
```

### Security Context Management for AI Tools

#### Information Priority for AI Security Context:
1. **Current Security Phase Requirements** (highest priority)
2. **Security Analysis Documents** (threat model, requirements)
3. **Existing Security Controls** (for integration and consistency)
4. **Compliance Requirements** (GDPR, OWASP, industry standards)
5. **Security Test Results** (for validation and improvement)

#### AI Security Decision Framework
```yaml
# Security Decision Tree for AI Tools:
security_decisions:
  feature_analysis:
    question: "Does this feature handle sensitive data?"
    if_yes: "Apply data protection requirements and encryption"
    if_no: "Apply standard security controls"
  
  access_control:
    question: "Does this feature provide access to resources?"
    if_yes: "Implement authentication and authorization"
    if_no: "Apply input validation and monitoring"
  
  external_interface:
    question: "Does this feature accept external input?"
    if_yes: "Implement comprehensive input validation"
    if_no: "Apply internal security controls"
  
  compliance_check:
    question: "Are there specific compliance requirements?"
    if_yes: "Implement compliance-specific controls"
    if_no: "Apply baseline security requirements"
```

---

## Security Compliance and Validation Framework

### Mandatory Security Compliance Checkpoints

**After SECURITY ANALYSIS Phase:**
```yaml
security_gate_1:
  threat_model_completeness: ">95% of attack vectors identified"
  security_requirements: "All controls specified and documented"
  compliance_mapping: "All regulatory requirements identified"
  stakeholder_approval: "Security analysis reviewed and approved"
```

**After SECURE IMPLEMENTATION Phase:**
```yaml
security_gate_2:
  control_implementation: "100% of security requirements implemented"
  input_validation: "All external inputs validated and sanitized"
  authentication: "All user operations require authentication"
  authorization: "All resource access requires authorization check"
  encryption: "All sensitive data encrypted in transit and at rest"
  logging: "All security events logged without data exposure"
```

**After SECURITY TESTING Phase:**
```yaml
security_gate_3:
  vulnerability_scan: "Zero critical or high severity vulnerabilities"
  security_tests: "100% of security test scenarios passing"
  penetration_testing: "All attack vectors tested and mitigated"
  compliance_validation: "All regulatory requirements tested"
```

**After SECURITY MONITORING Phase:**
```yaml
security_gate_4:
  monitoring_operational: "All security events being monitored"
  alerting_configured: "Real-time alerts for critical security events"
  incident_response: "Incident response procedures tested and ready"
  security_metrics: "Security dashboards and reporting operational"
```

### Feature Security Completion Definition
A feature is considered SECURITY COMPLETE when:
- ☑ **Threat Analysis**: Complete threat model with all attack vectors identified
- ☑ **Security Controls**: All required security controls implemented and tested
- ☑ **Vulnerability Testing**: Zero critical/high vulnerabilities in production code
- ☑ **Compliance**: All regulatory and policy requirements satisfied
- ☑ **Monitoring**: Security event monitoring and incident response operational
- ☑ **Documentation**: Complete security documentation for operations team

### Security Production Readiness Checklist
```markdown
## Feature: [Name] - Security Production Readiness

### Security Analysis Complete:
- [x] Threat model documents all attack vectors and mitigations
- [x] Security requirements specify all necessary controls
- [x] Compliance requirements identified and documented

### Security Implementation Complete:
- [x] Input validation implemented for all external inputs
- [x] Authentication required for all user operations
- [x] Authorization checks implemented for all resource access
- [x] Encryption implemented for all sensitive data
- [x] Security logging operational without data exposure
- [x] No hardcoded secrets or credentials in code

### Security Testing Complete:
- [x] All security test scenarios passing
- [x] Vulnerability scanning shows zero critical/high issues
- [x] Penetration testing validates all security controls
- [x] Compliance requirements tested and validated

### Security Monitoring Operational:
- [x] Security event monitoring configured and running
- [x] Real-time alerting for critical security events
- [x] Incident response procedures tested and documented
- [x] Security metrics and dashboards operational

**Status: SECURITY APPROVED FOR PRODUCTION DEPLOYMENT**
```

---

## Emergency Security Protocol

### Critical Security Incident Response
```yaml
# IMMEDIATE RESPONSE (Execute within 5 minutes):
immediate:
  step_1: "STOP - Isolate affected systems immediately"
  step_2: "ASSESS - Determine if active attack is in progress"
  step_3: "CONTAIN - Prevent further damage or data exposure"
  step_4: "NOTIFY - Alert security team and stakeholders"

# INVESTIGATION RESPONSE (Execute within 1 hour):
investigation:
  step_5: "PRESERVE - Capture forensic evidence"
  step_6: "ANALYZE - Determine attack vector and scope"
  step_7: "DOCUMENT - Record timeline and impact"
  step_8: "COMMUNICATE - Update stakeholders on status"

# RECOVERY RESPONSE (Execute within 24 hours):
recovery:
  step_9: "FIX - Implement security patches and improvements"
  step_10: "RESTORE - Bring systems back online securely"
  step_11: "VALIDATE - Verify security controls are operational"
  step_12: "MONITOR - Enhanced monitoring for recurring issues"
```

### Security Incident Classification
```yaml
severity_levels:
  critical:
    description: "Active attack, data breach, or system compromise"
    response_time: "Immediate (within 5 minutes)"
    escalation: "C-level executives, legal, PR, regulators"
  
  high:
    description: "Vulnerability in production, compliance violation"
    response_time: "Within 1 hour"
    escalation: "Security team, engineering management"
  
  medium:
    description: "Security tool alerts, suspicious activity"
    response_time: "Within 4 hours"
    escalation: "Security team, development team lead"
  
  low:
    description: "Security hygiene issues, expired certificates"
    response_time: "Within 24 hours"
    escalation: "Security team, operations team"
```

## Memory Integration (Law #6)

**Memory Checkpoints for Security-First Protocol:**

**Session Start:**
- View `/memories/protocol-compliance/protocol-status.xml` for security phase tracking
- Review `/memories/development-patterns/security-patterns.xml` for proven security implementations
- Check `/memories/project-knowledge/{project}/security-audit.xml` for project-specific findings

**During Security Analysis Phase:**
- Record threat models in `/memories/project-knowledge/{project}/security-audit.xml`
- Log security patterns in `/memories/development-patterns/security-patterns.xml`
- Document compliance requirements in project knowledge files

**During Implementation Phase:**
- Record security control implementations with code references
- Log successful security validation approaches
- Document security test patterns for reuse

**During Monitoring Phase:**
- Update incident response records in `/memories/project-knowledge/{project}/security-audit.xml`
- Log security event patterns and resolutions
- Document lessons learned from security incidents

**Session End:**
- Update `/memories/protocol-compliance/protocol-status.xml` with security phase completion
- Archive completed security implementations to project knowledge
- Record security validation results for future reference

**Memory Files:**
- Primary: `/memories/development-patterns/security-patterns.xml`
- Project-Specific: `/memories/project-knowledge/{project}/security-audit.xml`
- Protocol Tracking: `/memories/protocol-compliance/protocol-status.xml`

**Example Security Pattern Memory:**
```xml
<security-pattern>
  <timestamp>2025-10-03T14:30:00Z</timestamp>
  <pattern-name>JWT Authentication with Refresh Tokens</pattern-name>
  <threat-addressed>Session hijacking and token theft</threat-addressed>
  <implementation>
    - Access token: 15 minute expiry
    - Refresh token: 7 day expiry with rotation
    - Secure HTTP-only cookies for token storage
  </implementation>
  <validation>Penetration tested, no vulnerabilities detected</validation>
  <reusability>Applicable to all authentication implementations</reusability>
</security-pattern>
```

**Cross-Reference**: See [Memory System Protocol](./memory_system_protocol.md) for complete memory usage guide.

---

This protocol ensures systematic security implementation with clear AI directives, mandatory checkpoints, and comprehensive validation at every phase of development.
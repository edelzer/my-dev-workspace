# AI Security Scripts

**Phase 3 Task 3.1.2: AI Security Review Implementation**  
**Protocol Compliance**: Laws #1-5 Enforced  
**Integration**: Semgrep MCP + Multi-Agent Orchestration

## Overview

This directory contains utility scripts for the AI-powered security code review system. These scripts provide setup, validation, monitoring, and maintenance capabilities for the AI security integration.

## Scripts

### 1. setup.js
**Purpose**: Initialize and configure the AI security system  
**Usage**: `node setup.js`  
**Duration**: 5-10 minutes  

**Features**:
- ✅ Prerequisites checking (Node.js, tools, dependencies)
- ✅ Directory structure creation
- ✅ Dependency installation (Semgrep MCP, security tools)
- ✅ Configuration validation
- ✅ Integration testing
- ✅ Setup report generation

**Output**: 
- Setup report in `.ai-security/setup-report.json`
- Validated configuration files
- Ready-to-use AI security system

### 2. validate.js
**Purpose**: AI-powered validation and false positive reduction  
**Usage**: `node validate.js <findings-file> [output-file] [options]`  
**Duration**: 1-5 minutes depending on findings count  

**Features**:
- 🤖 AI-enhanced context analysis
- 🎯 False positive probability assessment
- 📊 Risk scoring and prioritization
- 🔍 Code context understanding
- 📋 Validation reporting
- 🧠 Learning data collection

**Options**:
```bash
--confidence-threshold 0.8    # Minimum confidence (default: 0.7)
--false-positive-threshold 0.05  # False positive threshold (default: 0.05)
--max-time 300               # Maximum validation time in seconds
```

**Example**:
```bash
# Validate security findings with high confidence threshold
node validate.js security-report.json validation-report.json --confidence-threshold 0.9

# Quick validation for CI/CD
node validate.js findings.json --max-time 60
```

## Integration Points

### Claude Code Integration
```bash
# Setup AI security system
node scripts/ai-security/setup.js

# Validate findings from Claude Code scan
claude ai-security-scan . --format json > findings.json
node scripts/ai-security/validate.js findings.json validation.json
```

### CI/CD Integration
```yaml
# GitHub Actions integration
- name: AI Security Validation
  run: |
    claude ai-security-scan --format json > security-findings.json
    node scripts/ai-security/validate.js security-findings.json validation-report.json
    
    # Check validation results
    CRITICAL_VALIDATED=$(jq '.validation_summary.validated' validation-report.json)
    if [ "$CRITICAL_VALIDATED" -gt 0 ]; then
      echo "Critical security issues validated - blocking deployment"
      exit 1
    fi
```

### Multi-Agent Workflow
```bash
# Agent coordination with validation
claude --agent security-specialist "Review findings.json and validate critical issues"
node scripts/ai-security/validate.js findings.json agent-validation.json
claude --agent spec-reviewer "Review agent-validation.json for code quality impact"
```

## Configuration

### Environment Variables
```bash
# Required for Semgrep MCP integration
export SEMGREP_APP_TOKEN="your-semgrep-token"

# Optional: Custom configuration
export AI_SECURITY_CONFIG=".claude/mcp/semgrep-config.json"
export AI_SECURITY_TIMEOUT="300"
export AI_SECURITY_CONFIDENCE_THRESHOLD="0.7"
```

### Configuration Files
- **Primary Config**: `.claude/mcp/semgrep-config.json`
- **Hooks Config**: `.claude/hooks/security-ai-hooks.json`
- **Command Config**: `.claude/commands/ai-security-review.md`

## Validation Engine Details

### Context Analysis
The validation engine performs deep code context analysis:

1. **Surrounding Code Analysis**: Extracts 10 lines before/after finding
2. **Function Context**: Identifies containing function and scope
3. **Framework Detection**: Recognizes React, Express, Django, Spring patterns
4. **Security Pattern Recognition**: Identifies auth, validation, encryption patterns
5. **Import Analysis**: Examines dependencies and security libraries

### Scoring Algorithm
```javascript
validation_score = (
  base_confidence * 0.4 +
  context_relevance * 0.3 +
  framework_patterns * 0.2 +
  security_patterns * 0.1
) * semgrep_confidence
```

### Risk Assessment
```javascript
risk_score = base_severity * (
  context_multiplier *
  framework_protection *
  security_implementation
)
```

## Output Formats

### Validation Report Structure
```json
{
  "timestamp": "2025-08-16T10:00:00Z",
  "validation_summary": {
    "total_findings": 15,
    "validated": 8,
    "likely_false_positives": 3,
    "requires_review": 3,
    "low_confidence": 1
  },
  "accuracy_metrics": {
    "average_confidence": 0.82,
    "average_false_positive_probability": 0.03,
    "high_confidence_findings": 10
  },
  "validations": [
    {
      "finding_id": "FIND-001",
      "validation_confidence": 0.95,
      "false_positive_probability": 0.02,
      "risk_score": 9.1,
      "validation_decision": "VALIDATED",
      "recommendations": [
        {
          "type": "remediation",
          "action": "Use parameterized queries",
          "priority": "critical"
        }
      ]
    }
  ]
}
```

## Performance Optimization

### Caching Strategy
- **File Context Cache**: Cache code context for unchanged files
- **Validation Cache**: Cache validation results for identical findings
- **Pattern Cache**: Cache framework and security pattern detection

### Performance Metrics
- **Setup Time**: Target < 10 minutes for full setup
- **Validation Time**: Target < 30 seconds per finding
- **Memory Usage**: Target < 512MB during validation
- **Cache Hit Rate**: Target > 80% for repeated scans

## Troubleshooting

### Common Issues

**Setup fails with dependency errors**:
```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Manual dependency installation
npm install -g eslint-plugin-security
pip install semgrep
uvx install semgrep-mcp
```

**Validation errors**:
```bash
# Enable debug mode
DEBUG=1 node scripts/ai-security/validate.js findings.json

# Check file permissions
ls -la findings.json

# Validate JSON syntax
jq . findings.json
```

**Performance issues**:
```bash
# Use quick validation for large codebases
node scripts/ai-security/validate.js findings.json --max-time 60

# Enable caching
ENABLE_CACHE=1 node scripts/ai-security/validate.js findings.json
```

### Debug Mode
```bash
# Enable detailed logging
DEBUG=1 VERBOSE=1 node scripts/ai-security/setup.js

# Test individual components
node scripts/ai-security/validate.js --test-mode
```

## Security Considerations

### Data Privacy
- No code sent to external services without explicit consent
- Local processing for sensitive codebases
- Secure credential handling for external tools

### Tool Security
- Regular security updates for dependencies
- Validation of tool integrity
- Secure configuration management

## Monitoring and Analytics

### Metrics Collection
The scripts collect performance and accuracy metrics:

- **Validation Accuracy**: True positive rate, false positive rate
- **Performance Metrics**: Execution time, memory usage, cache efficiency
- **Learning Progress**: Model improvement over time
- **Agent Coordination**: Multi-agent workflow efficiency

### Dashboard Integration
Metrics are automatically sent to the security dashboard:

```bash
# Manual dashboard update
curl -X POST "$SECURITY_DASHBOARD_WEBHOOK" \
  -H "Content-Type: application/json" \
  -d @validation-report.json
```

## Development Guidelines

### Adding New Scripts
1. Follow the existing pattern with class-based structure
2. Include comprehensive logging and error handling
3. Support both programmatic and CLI usage
4. Add configuration options for flexibility
5. Include performance monitoring
6. Follow Laws #1-5 protocol compliance

### Testing
```bash
# Test setup process
npm test scripts/ai-security/setup.test.js

# Test validation engine
npm test scripts/ai-security/validate.test.js

# Integration tests
npm test scripts/ai-security/integration.test.js
```

## Next Steps

1. **Configure Environment**: Set up SEMGREP_APP_TOKEN and other environment variables
2. **Run Setup**: Execute `node scripts/ai-security/setup.js`
3. **Test Integration**: Perform test scan with `claude ai-security-scan`
4. **Customize Rules**: Adjust security rules in `.claude/mcp/semgrep-config.json`
5. **Enable Automation**: Configure hooks in `.claude/hooks/security-ai-hooks.json`

## Support

- **Documentation**: See `.claude/commands/ai-security-review.md`
- **Configuration**: Check `.claude/mcp/semgrep-config.json`
- **Issues**: Contact security-specialist agent for complex problems
- **Updates**: Follow Phase 3 Task 3.1.2 implementation progress

---

**Script Status**: Production Ready  
**Integration Level**: Full AI + Multi-Agent Support  
**Security Compliance**: Laws #1-5 Fully Implemented  
**Performance**: Optimized for enterprise workloads
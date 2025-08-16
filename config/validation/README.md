# Configuration Validation System

A comprehensive validation and synchronization system for configuration files in the workspace. This system ensures configuration consistency, detects drift, validates security rules, and provides automated quality gates.

## Features

### 🔍 Configuration Validation
- **Syntax Validation**: Validates JavaScript, JSON, and YAML configuration files
- **Consistency Checking**: Ensures templates properly extend base configurations
- **Security Enforcement**: Validates that security rules are not weakened in overrides
- **Completeness Verification**: Checks for missing required configurations
- **Rule Conflict Detection**: Identifies conflicting rules across configurations

### 🔄 Synchronization Validation
- **Drift Detection**: Monitors configuration changes and detects drift
- **Propagation Validation**: Ensures updates propagate correctly across templates
- **Conflict Resolution**: Provides strategies for resolving synchronization conflicts
- **Rollback Mechanisms**: Validates rollback capabilities and procedures
- **Automated Process Validation**: Tests automated update and sync processes

### 🛠️ Automation & Integration
- **CLI Interface**: Command-line tools for manual and automated validation
- **Git Hooks**: Automatic validation on commit and push
- **CI/CD Integration**: Ready for continuous integration pipelines
- **Watch Mode**: Real-time monitoring of configuration changes
- **Multiple Report Formats**: JSON, HTML, Markdown, and console output

## Installation

```bash
cd config/validation
npm install
```

## Usage

### Command Line Interface

```bash
# Run comprehensive validation (config + sync)
node cli.js validate-all

# Run configuration validation only
node cli.js validate-config

# Run synchronization validation only
node cli.js validate-sync

# Check for configuration drift
node cli.js check-drift

# Generate comprehensive report
node cli.js generate-report --format html --output report.html

# Watch for changes and auto-validate
node cli.js watch --interval 30

# Attempt auto-fix of issues
node cli.js fix --dry-run

# Show current status
node cli.js status
```

### Programmatic API

```javascript
const { validateAll, validateConfig, validateSync } = require('./index');

// Run all validations
const results = await validateAll({
  configDir: './config',
  verbose: true,
  strictMode: true
});

// Configuration validation only
const configResults = await validateConfig({
  configDir: './config'
});

// Synchronization validation only
const syncResults = await validateSync({
  configDir: './config',
  driftThreshold: 0.1
});
```

### Git Hooks Integration

```bash
# Install Git hooks for automatic validation
node install-hooks.js

# Uninstall Git hooks
node install-hooks.js uninstall
```

## Configuration Structure

The validation system works with this configuration structure:

```
config/
├── base/                    # Base configurations
│   ├── eslint.base.js      # Base ESLint rules
│   ├── prettier.base.js    # Base Prettier settings
│   └── typescript.base.json # Base TypeScript config
├── templates/              # Template-specific overrides
│   ├── web.eslint.js       # Web template ESLint config
│   └── api.eslint.js       # API template ESLint config
└── validation/             # This validation system
    ├── config-validator.js
    ├── sync-validator.js
    ├── cli.js
    └── index.js
```

## Validation Categories

### 1. Syntax Validation
- JavaScript syntax checking with ESLint
- JSON schema validation
- YAML structure validation
- TypeScript configuration validation

### 2. Semantic Validation
- Rule consistency across configurations
- Circular dependency detection
- Unreachable rule identification
- Duplicate rule detection

### 3. Security Validation
- Security rule enforcement
- Prevention of security rule weakening
- Vulnerability pattern detection
- Safe configuration practices

### 4. Inheritance Validation
- Proper template extension from base configs
- Essential rule preservation
- Configuration completeness
- Inheritance chain validation

### 5. Synchronization Validation
- Configuration update propagation
- Drift detection and monitoring
- Conflict identification and resolution
- Rollback mechanism validation

## Performance Optimization

The validation system is optimized for different use cases:

### Development Mode (Fast)
```bash
# Quick syntax-only validation
node cli.js validate-config --syntax-only

# Sync validation (faster than full config validation)
node cli.js validate-sync

# Watch mode with longer intervals
node cli.js watch --interval 60
```

### CI/CD Mode (Comprehensive)
```bash
# Full validation with strict mode
node cli.js validate-all --strict --format junit

# Generate detailed reports
node cli.js generate-report --format html --include-history
```

## Report Formats

### Console Output
Default human-readable format for development:
```bash
node cli.js validate-all
```

### JSON Format
Machine-readable format for automation:
```bash
node cli.js validate-all --format json --output results.json
```

### HTML Report
Rich interactive report for stakeholders:
```bash
node cli.js generate-report --format html --output report.html
```

### Markdown Format
Documentation-friendly format:
```bash
node cli.js generate-report --format markdown --output VALIDATION.md
```

## Integration Examples

### GitHub Actions
```yaml
name: Configuration Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd config/validation && npm install
      - run: cd config/validation && node cli.js validate-all --format junit --output results.xml
      - uses: mikepenz/action-junit-report@v3
        with:
          report_paths: 'config/validation/results.xml'
```

### Pre-commit Hook
```bash
#!/bin/sh
cd config/validation
if ! node cli.js validate-config --format console; then
    echo "❌ Configuration validation failed!"
    exit 1
fi
echo "✅ Configuration validation passed!"
```

### NPM Scripts
```json
{
  "scripts": {
    "validate": "cd config/validation && node cli.js validate-all",
    "validate:config": "cd config/validation && node cli.js validate-config",
    "validate:sync": "cd config/validation && node cli.js validate-sync",
    "validate:fix": "cd config/validation && node cli.js fix",
    "validate:watch": "cd config/validation && node cli.js watch"
  }
}
```

## Error Handling & Recovery

### Automatic Recovery
- Graceful degradation on validation failures
- Fallback to last known good configurations
- Automatic rollback on critical failures

### Manual Intervention
- Detailed error reporting with remediation suggestions
- Step-by-step resolution guides
- Expert escalation procedures

### Error Categories
- **Critical**: Security violations, syntax errors (blocking)
- **High**: Rule conflicts, inheritance issues (blocking)
- **Medium**: Style violations, performance issues (warning)
- **Low**: Informational notes, optimization suggestions

## Troubleshooting

### Common Issues

#### Slow Validation Performance
**Problem**: Full validation takes too long
**Solution**: Use targeted validation or skip ESLint for development

```bash
# Fast development validation
node cli.js validate-sync  # Skip heavy ESLint processing
node cli.js validate-config --syntax-only  # Syntax only
```

#### Rule Conflicts
**Problem**: Template configs conflict with base rules
**Solution**: Review rule inheritance and resolve conflicts

```bash
# Check specific conflicts
node cli.js validate-config --verbose
# See detailed conflict information
```

#### Missing Dependencies
**Problem**: Required packages not found
**Solution**: Install dependencies or configure fallbacks

```bash
cd config/validation
npm install  # Install required packages
```

### Debug Mode
Enable verbose logging for troubleshooting:

```bash
node cli.js validate-all --verbose
```

## Contributing

### Adding New Validation Rules
1. Add rule logic to appropriate validator class
2. Add test cases to `test-validation.js`
3. Update documentation and examples
4. Test with existing configurations

### Performance Improvements
1. Profile validation operations
2. Optimize file I/O and processing
3. Add caching where appropriate
4. Test with large configuration sets

## API Reference

### ConfigValidator Class
- `validateAll()`: Run comprehensive configuration validation
- `validateSyntax()`: Validate file syntax only
- `validateConsistency()`: Check rule consistency
- `validateSecurity()`: Validate security rules
- `validateInheritance()`: Check template inheritance

### SyncValidator Class
- `validateSync()`: Run synchronization validation
- `validatePropagation()`: Check configuration propagation
- `validateDriftDetection()`: Monitor configuration drift
- `validateRollbackMechanisms()`: Test rollback capabilities

### ValidationCLI Class
- Command-line interface for all validation operations
- Multiple output formats and options
- Integration with CI/CD systems

## License

Part of the my-dev-workspace project. See main LICENSE file.
# CLAUDE.md Template System

This directory contains comprehensive CLAUDE.md templates for different project types and development workflows, designed to work seamlessly with BMAD multi-agent orchestration and security-first development practices.

## Template Overview

### Global Templates
- **`global-claude-template.md`**: Universal template suitable for any project type with customizable sections
- **`agent-specific-instructions-template.md`**: Specialized guidance for different BMAD agents
- **`development-workflow-template.md`**: Comprehensive workflow documentation template

### Project-Specific Templates
- **`web-project-claude-template.md`**: React/TypeScript web applications with modern tooling
- **`api-project-claude-template.md`**: Node.js/Express API projects with comprehensive security
- **`mobile-project-claude-template.md`**: React Native mobile applications with cross-platform considerations
- **`desktop-project-claude-template.md`**: Electron desktop applications with native integration

## Quick Start Guide

### 1. Choose the Right Template
Select the template that best matches your project:

```bash
# Web applications (React, Vue, Angular)
cp templates/claude-md-templates/web-project-claude-template.md ./CLAUDE.md

# API/Backend services
cp templates/claude-md-templates/api-project-claude-template.md ./CLAUDE.md

# Mobile applications
cp templates/claude-md-templates/mobile-project-claude-template.md ./CLAUDE.md

# Desktop applications
cp templates/claude-md-templates/desktop-project-claude-template.md ./CLAUDE.md

# Universal/custom projects
cp templates/claude-md-templates/global-claude-template.md ./CLAUDE.md
```

### 2. Customize Template Sections
Look for `[CUSTOMIZE: ...]` markers throughout the template and replace with project-specific information:

- **Project Details**: Name, type, framework, language
- **Build Commands**: Development, testing, and production commands
- **Security Requirements**: Project-specific security considerations
- **Performance Targets**: Specific performance goals and metrics
- **Integration Points**: APIs, third-party services, dependencies

### 3. Configure BMAD Agents
Update the agent-specific sections based on your project needs:

- **Primary Agents**: Which agents are most critical for your project
- **Agent Coordination**: How agents should collaborate for your specific workflow
- **Quality Gates**: Project-specific validation requirements
- **Emergency Procedures**: Project-specific incident response procedures

## Template Features

### 🔒 Security-First Integration
- Comprehensive security checklists for each project type
- Platform-specific security implementations
- Vulnerability assessment procedures
- Emergency security response protocols

### 🤖 BMAD Multi-Agent Orchestration
- Detailed agent role definitions and responsibilities
- Agent coordination workflows with quality gates
- Handoff procedures and communication protocols
- Performance monitoring and optimization guidelines

### 📱 Platform-Specific Optimizations
- **Web**: Performance optimization, accessibility compliance, SEO considerations
- **API**: Security middleware, database optimization, monitoring integration
- **Mobile**: Cross-platform compatibility, app store guidelines, device testing
- **Desktop**: Native integration, cross-platform distribution, system security

### 🧪 Test-Driven Development Integration
- Comprehensive testing strategies for each platform
- TDD workflow integration with BMAD agents
- Quality gates and validation procedures
- Performance and security testing requirements

### 📚 Documentation Standards
- Comprehensive documentation requirements
- Agent-specific documentation guidelines
- Knowledge management and sharing procedures
- Continuous learning and improvement processes

## Advanced Customization

### Custom Agent Instructions
Create project-specific agent instruction files:

```bash
# Create custom agent instructions
cp templates/claude-md-templates/agent-specific-instructions-template.md ./.claude/custom-agent-instructions.md

# Customize for your project's specific needs
# - Modify agent responsibilities
# - Update deliverable requirements
# - Adjust quality standards
# - Configure coordination protocols
```

### Custom Workflow Documentation
Adapt workflow templates for your development process:

```bash
# Create custom workflow documentation
cp templates/claude-md-templates/development-workflow-template.md ./docs/custom-development-workflow.md

# Customize workflow phases:
# - Adjust phase durations and objectives
# - Modify agent assignments and responsibilities
# - Update quality gates and validation criteria
# - Configure monitoring and success metrics
```

### Multi-Project Template Management
For organizations with multiple project types:

```bash
# Create organization-specific template directory
mkdir .claude-templates/

# Copy and customize templates for different project types
cp templates/claude-md-templates/*.md .claude-templates/

# Create template selection script
cat > .claude-templates/select-template.sh << 'EOF'
#!/bin/bash
echo "Select project template:"
echo "1. Web Application (React/TypeScript)"
echo "2. API Service (Node.js/Express)"
echo "3. Mobile Application (React Native)"
echo "4. Desktop Application (Electron)"
echo "5. Custom/Universal Template"
# Implementation continues...
EOF
```

## Integration with Development Tools

### IDE Integration
Configure your IDE to use CLAUDE.md templates automatically:

**VS Code/Cursor Settings**:
```json
{
  "claude.templates.directory": "templates/claude-md-templates",
  "claude.templates.autoSelect": true,
  "claude.bmad.enabled": true,
  "claude.bmad.defaultAgents": ["analyst", "pm", "architect", "dev", "qa"]
}
```

### CI/CD Integration
Validate CLAUDE.md completeness in your CI/CD pipeline:

```yaml
# .github/workflows/claude-md-validation.yml
name: CLAUDE.md Validation
on: [push, pull_request]
jobs:
  validate-claude-md:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate CLAUDE.md completeness
        run: |
          # Check for required sections and customization completion
          node scripts/validate-claude-md.js
```

### Project Creation Integration
Integrate templates with project creation scripts:

```javascript
// scripts/new-project.js enhancement
const templateMap = {
  'web': 'templates/claude-md-templates/web-project-claude-template.md',
  'api': 'templates/claude-md-templates/api-project-claude-template.md',
  'mobile': 'templates/claude-md-templates/mobile-project-claude-template.md',
  'desktop': 'templates/claude-md-templates/desktop-project-claude-template.md'
};

function createProjectWithTemplate(projectName, projectType) {
  // Create project structure
  // Copy appropriate CLAUDE.md template
  // Run template customization wizard
  // Initialize BMAD configuration
}
```

## Best Practices

### Template Maintenance
1. **Regular Updates**: Update templates when new tools, frameworks, or best practices are adopted
2. **Version Control**: Track template changes and maintain backwards compatibility
3. **Feedback Integration**: Incorporate feedback from development teams using the templates
4. **Standardization**: Ensure consistency across all template types

### Team Adoption
1. **Training**: Provide training on CLAUDE.md template usage and BMAD agent coordination
2. **Onboarding**: Include template selection and customization in project onboarding
3. **Documentation**: Maintain comprehensive documentation on template usage and best practices
4. **Support**: Provide support channels for template-related questions and issues

### Quality Assurance
1. **Template Validation**: Regularly validate templates against current best practices
2. **Project Assessment**: Assess project success with different template types
3. **Continuous Improvement**: Continuously improve templates based on project outcomes
4. **Compliance Verification**: Ensure templates meet organizational compliance requirements

## Troubleshooting

### Common Issues

**Template Customization Incomplete**:
- Search for `[CUSTOMIZE: ...]` markers and ensure all are replaced
- Validate project-specific information is accurate and complete
- Verify BMAD agent configuration matches project needs

**Agent Coordination Problems**:
- Review agent-specific instructions and ensure roles are clearly defined
- Validate handoff procedures and quality gates are appropriate
- Check shared workspace configuration and communication protocols

**Quality Gate Failures**:
- Review quality standards and ensure they're achievable for your project
- Validate testing strategies and coverage requirements
- Ensure security and performance requirements are realistic

**Template Compatibility Issues**:
- Verify template version compatibility with your tools and frameworks
- Check for conflicts between template recommendations and organizational standards
- Validate integration with existing development processes and tools

### Getting Help

1. **Documentation**: Review comprehensive template documentation and examples
2. **Community**: Engage with the development community for best practices and solutions
3. **Support**: Contact template maintainers for specific issues or enhancement requests
4. **Contribution**: Contribute improvements and fixes back to the template system

## Contributing to Templates

### Template Enhancement Process
1. **Issue Identification**: Identify areas for template improvement or new template needs
2. **Design Proposal**: Create detailed proposal for template changes or additions
3. **Implementation**: Develop template changes following established patterns and standards
4. **Testing**: Validate template changes with real projects and gather feedback
5. **Documentation**: Update documentation and examples to reflect template changes
6. **Review and Approval**: Submit changes for review and approval by template maintainers

### Template Standards
- **Consistency**: Maintain consistent structure and formatting across all templates
- **Completeness**: Ensure all necessary sections and guidance are included
- **Clarity**: Write clear, actionable guidance that's easy to understand and implement
- **Flexibility**: Design templates to be adaptable to different project needs and constraints
- **Best Practices**: Incorporate current industry best practices and emerging standards

**Template Integration Command**: When using CLAUDE.md templates, select appropriate template for project type, customize all marked sections with project-specific information, configure BMAD agent coordination, and validate template completeness before beginning development work.
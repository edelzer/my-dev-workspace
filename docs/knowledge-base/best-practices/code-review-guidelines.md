# Code Review Guidelines

## Overview
This document outlines comprehensive code review guidelines used across our development workspace, ensuring consistent code quality, security, and maintainability through effective peer review processes.

## Code Review Principles

### Core Values
- **Quality First**: Focus on code quality and maintainability
- **Constructive Feedback**: Provide helpful, actionable feedback
- **Learning Opportunity**: Use reviews as knowledge sharing sessions
- **Respectful Communication**: Maintain professional and respectful tone
- **Continuous Improvement**: Strive for constant improvement in code quality

### Review Objectives
- **Correctness**: Ensure code works as intended
- **Maintainability**: Code should be easy to understand and modify
- **Security**: Identify and address security vulnerabilities
- **Performance**: Ensure acceptable performance characteristics
- **Standards Compliance**: Adherence to coding standards and best practices

## Review Process

### Pre-Review Preparation
1. **Self-Review**: Author performs thorough self-review before submitting
2. **Clear Description**: Provide clear description of changes and reasoning
3. **Context Information**: Include relevant context, requirements, and design decisions
4. **Test Coverage**: Ensure adequate test coverage for changes
5. **Documentation Updates**: Update relevant documentation

### Review Workflow
1. **Assignment**: Assign appropriate reviewers based on expertise
2. **Initial Review**: Reviewers perform comprehensive code analysis
3. **Feedback Discussion**: Authors and reviewers discuss feedback
4. **Revision Cycle**: Address feedback and iterate as needed
5. **Final Approval**: Obtain required approvals before merging

### Review Timeline
- **Small Changes (< 100 lines)**: Review within 4 hours
- **Medium Changes (100-500 lines)**: Review within 24 hours  
- **Large Changes (> 500 lines)**: Review within 48 hours
- **Critical Fixes**: Review within 2 hours

## Review Checklist

### Functionality
- [ ] Code implements requirements correctly
- [ ] Edge cases are handled appropriately
- [ ] Error scenarios are properly managed
- [ ] Business logic is sound and complete
- [ ] Integration points work as expected

### Code Quality
- [ ] Code is readable and well-structured
- [ ] Functions and classes have single responsibility
- [ ] Names are descriptive and meaningful
- [ ] Code follows DRY principle
- [ ] Complex logic is well-commented

### Testing
- [ ] Unit tests cover new functionality
- [ ] Integration tests validate system behavior
- [ ] Test cases cover edge cases and error scenarios
- [ ] Tests are maintainable and reliable
- [ ] Test coverage meets minimum requirements (80%)

### Security
- [ ] Input validation is implemented
- [ ] Authentication and authorization are correct
- [ ] Sensitive data is properly protected
- [ ] SQL injection and XSS vulnerabilities are prevented
- [ ] Security best practices are followed

### Performance
- [ ] Code is efficient and performs well
- [ ] Database queries are optimized
- [ ] Caching is used appropriately
- [ ] Resource usage is reasonable
- [ ] No obvious performance bottlenecks

### Documentation
- [ ] Public APIs are documented
- [ ] Complex algorithms are explained
- [ ] Configuration changes are documented
- [ ] README files are updated if needed
- [ ] Architecture decisions are recorded

## Review Categories

### Code Structure and Design
- **Architecture Alignment**: Does code align with system architecture?
- **Design Patterns**: Are appropriate design patterns used?
- **Modularity**: Is code properly modularized and organized?
- **Separation of Concerns**: Are responsibilities properly separated?
- **Coupling and Cohesion**: Is coupling loose and cohesion high?

### Implementation Quality
- **Correctness**: Does the code implement requirements correctly?
- **Completeness**: Are all requirements fully implemented?
- **Robustness**: Does code handle errors and edge cases gracefully?
- **Efficiency**: Is the implementation efficient and performant?
- **Maintainability**: Is code easy to understand and modify?

### Standards Compliance
- **Coding Standards**: Does code follow established coding standards?
- **Naming Conventions**: Are naming conventions followed consistently?
- **Formatting**: Is code properly formatted and styled?
- **Best Practices**: Are language and framework best practices followed?
- **Team Conventions**: Are team-specific conventions followed?

## Review Feedback Guidelines

### Providing Feedback
- **Be Specific**: Point to specific lines and explain issues clearly
- **Explain Reasoning**: Provide rationale for suggestions
- **Offer Solutions**: Suggest concrete improvements where possible
- **Prioritize Issues**: Distinguish between critical issues and suggestions
- **Acknowledge Good Code**: Recognize well-written code and good practices

### Feedback Categories
- **Must Fix**: Critical issues that must be addressed before merging
- **Should Fix**: Important issues that should be addressed
- **Consider**: Suggestions for improvement to consider
- **Nit**: Minor style or formatting issues
- **Question**: Questions about implementation or approach

### Example Feedback
```
Must Fix: This function is vulnerable to SQL injection. Use parameterized queries instead.
// Bad
query = `SELECT * FROM users WHERE id = ${userId}`;

// Good  
query = `SELECT * FROM users WHERE id = ?`;
db.query(query, [userId]);
```

```
Consider: This function is quite long and handles multiple responsibilities. 
Consider breaking it into smaller, focused functions for better maintainability.
```

```
Question: Is there a specific reason for using this approach instead of the 
standard library function that does the same thing?
```

## Common Review Areas

### JavaScript/TypeScript Reviews
- **Type Safety**: Proper use of TypeScript types
- **Async Handling**: Proper async/await usage and error handling
- **Memory Leaks**: Event listener cleanup and reference management
- **Bundle Size**: Impact on bundle size and code splitting
- **Browser Compatibility**: Cross-browser compatibility considerations

### React Component Reviews
- **Component Design**: Proper component structure and props interface
- **State Management**: Appropriate use of state and side effects
- **Performance**: Use of React.memo, useMemo, and useCallback
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML
- **Testing**: Component testing with React Testing Library

### API Reviews
- **Endpoint Design**: RESTful design and proper HTTP methods
- **Input Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Consistent error responses and status codes
- **Authentication**: Proper authentication and authorization
- **Documentation**: Clear API documentation with examples

### Database Reviews
- **Query Performance**: Efficient queries and proper indexing
- **Data Integrity**: Constraints and validation rules
- **Migration Safety**: Safe database migrations
- **Security**: Proper access controls and query parameterization
- **Backup Considerations**: Impact on backup and recovery

## Security-Focused Reviews

### Security Checklist
- [ ] Input validation for all user inputs
- [ ] Output encoding to prevent XSS
- [ ] Parameterized queries to prevent SQL injection
- [ ] Authentication and authorization checks
- [ ] Sensitive data protection (encryption, secure storage)
- [ ] Error messages don't leak sensitive information
- [ ] Proper session management
- [ ] HTTPS enforcement
- [ ] CSRF protection where applicable
- [ ] Rate limiting for APIs

### Common Security Issues
- **Injection Vulnerabilities**: SQL, NoSQL, LDAP, OS command injection
- **Broken Authentication**: Weak authentication and session management
- **Sensitive Data Exposure**: Unprotected sensitive data
- **XML External Entities (XXE)**: XML parsing vulnerabilities
- **Broken Access Control**: Improper authorization implementation
- **Security Misconfiguration**: Default configurations and exposed services

## AI Development Team Reviews

### Requirements Analyst Reviews
- **Requirements Traceability**: Code implements specified requirements
- **User Story Completion**: All acceptance criteria are met
- **Edge Case Coverage**: Requirements edge cases are handled
- **Business Logic Accuracy**: Business rules are correctly implemented

### System Architect Reviews
- **Architectural Compliance**: Code follows architectural guidelines
- **Design Pattern Usage**: Appropriate use of design patterns
- **Technology Selection**: Proper use of chosen technologies
- **Scalability Considerations**: Code supports scalability requirements

### Developer Reviews
- **Implementation Quality**: Code quality and best practices
- **Performance Optimization**: Efficient implementation
- **Error Handling**: Robust error handling and recovery
- **Code Reusability**: Opportunities for code reuse

### Tester Reviews
- **Testability**: Code is structured for easy testing
- **Test Coverage**: Adequate test coverage for changes
- **Test Quality**: Tests are well-written and maintainable
- **Quality Assurance**: Overall quality of implementation

### Security Specialist Reviews
- **Security Vulnerabilities**: Identification of security issues
- **Threat Model Compliance**: Code aligns with threat model
- **Security Best Practices**: Security standards are followed
- **Risk Assessment**: Security risk evaluation

## BMAD Multi-Agent Reviews

### Agent Coordination Reviews
- **Handoff Quality**: Clear and complete agent handoffs
- **Context Preservation**: Proper context sharing between agents
- **Quality Gates**: Validation checkpoints are implemented
- **Communication**: Clear communication protocols

### Workflow Reviews
- **Task Decomposition**: Proper task breakdown and organization
- **Progress Tracking**: TodoWrite integration and status updates
- **Validation**: Completion criteria and validation procedures
- **Documentation**: Workflow documentation and instructions

## Review Tools and Automation

### Automated Checks
- **Linting**: ESLint, TSLint, and other linting tools
- **Formatting**: Prettier and other code formatters
- **Type Checking**: TypeScript compiler and type checkers
- **Security Scanning**: Static security analysis tools
- **Test Coverage**: Code coverage reporting tools

### Review Platform Features
- **Inline Comments**: Line-by-line commenting and discussion
- **Approval Workflow**: Required approvals and review status
- **Integration**: Integration with CI/CD pipelines
- **Metrics**: Review metrics and quality tracking
- **Templates**: Review checklists and templates

## Review Quality Metrics

### Reviewer Metrics
- **Review Thoroughness**: Depth and quality of reviews
- **Feedback Quality**: Usefulness and actionability of feedback
- **Response Time**: Time to complete reviews
- **Issue Detection**: Ability to identify problems
- **Knowledge Sharing**: Educational value of reviews

### Author Metrics
- **Self-Review Quality**: Quality of self-review before submission
- **Response to Feedback**: How well feedback is addressed
- **Code Quality Trends**: Improvement in code quality over time
- **Learning Application**: Application of review feedback
- **Collaboration**: Effectiveness of collaboration during reviews

## Best Practices

### For Authors
1. **Self-Review First**: Thoroughly review your own code before submission
2. **Clear Descriptions**: Provide clear, detailed pull request descriptions
3. **Small Changes**: Keep changes focused and reasonably sized
4. **Test Coverage**: Ensure comprehensive test coverage
5. **Responsive**: Respond promptly to reviewer feedback

### For Reviewers
1. **Timely Reviews**: Complete reviews within established timeframes
2. **Constructive Feedback**: Provide helpful, actionable feedback
3. **Ask Questions**: Don't hesitate to ask for clarification
4. **Consider Context**: Understand the broader context of changes
5. **Share Knowledge**: Use reviews as teaching opportunities

### For Teams
1. **Review Culture**: Foster a positive review culture
2. **Standards**: Establish and maintain clear review standards
3. **Training**: Provide training on effective code review
4. **Continuous Improvement**: Regularly improve review processes
5. **Tool Support**: Use appropriate tools to support the review process

## Common Anti-Patterns

### Review Anti-Patterns to Avoid
- **Rubber Stamping**: Approving without thorough review
- **Nitpicking**: Focusing only on minor style issues
- **Design in Review**: Attempting major design changes during review
- **Personal Attacks**: Making personal rather than technical criticism
- **Overwhelming Feedback**: Providing too much feedback at once

### Author Anti-Patterns to Avoid
- **Large Changes**: Submitting overly large or complex changes
- **No Context**: Failing to provide context for changes
- **Defensive Responses**: Being defensive about feedback
- **Ignoring Feedback**: Not addressing reviewer concerns
- **Rush to Merge**: Pressuring for quick approval

## Related Resources
- [Development Standards](development-standards.md)
- [Testing Patterns](../patterns/testing-patterns.md)
- [Security Patterns](../patterns/security-patterns.md)
- [Architecture Patterns](../patterns/architecture-patterns.md)
- [Common Issues](../troubleshooting/common-issues.md)
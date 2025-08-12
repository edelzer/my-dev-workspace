# Testing Patterns

## Overview
This document outlines testing patterns and strategies used across our development workspace, focusing on test-driven development, quality assurance, and comprehensive testing approaches.

## Test-Driven Development (TDD) Patterns

### Red-Green-Refactor Cycle
1. **Red**: Write a failing test
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve code while keeping tests passing

### Test Structure Patterns
- **Arrange-Act-Assert (AAA)**: Structure tests with setup, execution, and verification
- **Given-When-Then**: Behavior-driven test structure
- **Setup-Exercise-Verify-Teardown**: Comprehensive test lifecycle
- **Test Data Builders**: Fluent API for test data creation

## Unit Testing Patterns

### Test Organization
- **Test per Class**: One test class per production class
- **Test per Method**: One test method per production method
- **Test per Scenario**: One test per business scenario
- **Test Categorization**: Group tests by functionality or speed

### Mock and Stub Patterns
- **Mock Objects**: Verify interactions between objects
- **Stub Objects**: Provide predefined responses
- **Fake Objects**: Working implementations with shortcuts
- **Spy Objects**: Wrapper around real objects for verification

## Integration Testing Patterns

### Database Testing
- **In-Memory Database**: Use lightweight database for tests
- **Test Containers**: Docker containers for database testing
- **Database Transactions**: Rollback after each test
- **Seed Data**: Consistent test data setup

### API Testing
- **Contract Testing**: Verify API contracts between services
- **Consumer-Driven Contracts**: Tests driven by consumer requirements
- **API Mocking**: Mock external API dependencies
- **End-to-End API Testing**: Full API workflow testing

## End-to-End (E2E) Testing Patterns

### UI Testing Patterns
- **Page Object Model**: Encapsulate page interactions
- **Component Testing**: Test individual UI components
- **Visual Regression Testing**: Detect visual changes
- **Accessibility Testing**: Verify accessibility compliance

### Browser Testing
- **Cross-Browser Testing**: Test across different browsers
- **Mobile Testing**: Test on mobile devices and viewports
- **Performance Testing**: Measure and verify performance
- **Progressive Web App Testing**: PWA-specific testing patterns

## Performance Testing Patterns

### Load Testing
- **Baseline Testing**: Establish performance baselines
- **Stress Testing**: Test system under extreme load
- **Volume Testing**: Test with large amounts of data
- **Endurance Testing**: Test system stability over time

### Monitoring and Metrics
- **Real User Monitoring (RUM)**: Monitor actual user performance
- **Synthetic Monitoring**: Automated performance monitoring
- **Application Performance Monitoring (APM)**: Monitor application metrics
- **Error Rate Monitoring**: Track and alert on error rates

## Security Testing Patterns

### Vulnerability Testing
- **Static Analysis**: Analyze code for security vulnerabilities
- **Dynamic Analysis**: Test running application for vulnerabilities
- **Dependency Scanning**: Check dependencies for known vulnerabilities
- **Penetration Testing**: Manual security testing

### Authentication and Authorization Testing
- **Authentication Testing**: Verify login and session management
- **Authorization Testing**: Test access control mechanisms
- **Token Testing**: Verify JWT and other token handling
- **Session Security**: Test session timeout and security

## AI Development Team Testing Patterns

### Requirements Testing
- **Acceptance Criteria Verification**: Test against acceptance criteria
- **User Story Testing**: Verify user story implementation
- **Behavior-Driven Development**: Use Gherkin for requirements testing
- **Specification by Example**: Use examples to drive testing

### Quality Assurance Patterns
- **Test Pyramid**: Unit tests > Integration tests > E2E tests
- **Testing Trophy**: Focus on integration testing
- **Risk-Based Testing**: Prioritize testing based on risk
- **Exploratory Testing**: Unscripted testing to discover issues

## BMAD Multi-Agent Testing Patterns

### Agent Testing
- **Agent Isolation**: Test individual agent capabilities
- **Agent Integration**: Test agent interactions and handoffs
- **Workflow Testing**: Test complete multi-agent workflows
- **Quality Gate Testing**: Verify validation checkpoints

### Collaboration Testing
- **Handoff Verification**: Test agent handoff procedures
- **Context Sharing**: Test shared context mechanisms
- **Coordination Testing**: Test agent coordination patterns
- **Performance Testing**: Test multi-agent workflow performance

## Test Automation Patterns

### CI/CD Integration
- **Pipeline Testing**: Integrate tests into CI/CD pipelines
- **Parallel Testing**: Run tests in parallel for faster feedback
- **Test Reporting**: Generate comprehensive test reports
- **Failure Analysis**: Automatic analysis of test failures

### Test Data Management
- **Test Data Factory**: Generate test data programmatically
- **Data Fixtures**: Reusable test data sets
- **Data Anonymization**: Protect sensitive data in tests
- **Test Environment Management**: Consistent test environments

## Quality Metrics and Reporting

### Coverage Metrics
- **Code Coverage**: Measure code coverage by tests
- **Branch Coverage**: Ensure all code paths are tested
- **Mutation Testing**: Test quality of test suite
- **Regression Testing**: Prevent reintroduction of bugs

### Quality Gates
- **Coverage Thresholds**: Minimum coverage requirements
- **Test Pass Rate**: Required test success rate
- **Performance Thresholds**: Performance acceptance criteria
- **Security Scan Results**: Security vulnerability thresholds

## Testing Tools and Frameworks

### JavaScript/TypeScript
- **Jest**: Unit and integration testing framework
- **Vitest**: Fast unit testing with Vite
- **Playwright**: End-to-end testing framework
- **Testing Library**: Simple and complete testing utilities

### Quality Assurance Tools
- **ESLint**: Static code analysis
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Lighthouse**: Performance and accessibility auditing

## Best Practices

### Test Writing
1. **Write Tests First**: Follow TDD principles
2. **Keep Tests Simple**: One assertion per test when possible
3. **Use Descriptive Names**: Test names should describe what is being tested
4. **Isolate Tests**: Tests should not depend on each other
5. **Fast Feedback**: Tests should run quickly for rapid feedback

### Test Maintenance
1. **Regular Refactoring**: Keep tests clean and maintainable
2. **Update Tests with Code**: Keep tests synchronized with production code
3. **Remove Obsolete Tests**: Delete tests that are no longer relevant
4. **Review Test Quality**: Regularly review and improve test quality
5. **Document Test Intent**: Clearly document what tests are verifying

## Related Resources
- [Development Standards](../best-practices/development-standards.md)
- [Code Review Guidelines](../best-practices/code-review-guidelines.md)
- [Performance Patterns](performance-patterns.md)
- [Security Patterns](security-patterns.md)
- [Common Issues](../troubleshooting/common-issues.md)
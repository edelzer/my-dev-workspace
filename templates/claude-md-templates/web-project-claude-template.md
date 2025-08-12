# CLAUDE.md Template (Web Project)

This file provides guidance to Claude Code (claude.ai/code) when working with this React/TypeScript web application, incorporating BMAD multi-agent workflows and security-first development.

## Web Project Overview

**Project Type**: React Web Application
**Framework**: React 18 + TypeScript + Vite
**State Management**: [Context API|Redux|Zustand|Custom]
**Styling**: [Tailwind CSS|Styled Components|CSS Modules|SASS]
**Testing**: Vitest + React Testing Library

## Web-Specific Development Philosophy

### Frontend Security-First
- CSP headers implemented and validated
- XSS protection through proper sanitization
- HTTPS enforced in all environments
- Authentication state securely managed
- Input validation on all user interactions

### Performance-Driven Development
- Code splitting and lazy loading implemented
- Bundle size monitoring and optimization
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Accessibility compliance (WCAG 2.1 AA minimum)

### Component-Driven Architecture
- Atomic design principles with reusable components
- TypeScript strict mode for type safety
- Props interface documentation for all components
- Component testing with comprehensive coverage

## BMAD Multi-Agent Web Workflow

### Planning Phase Agents
- `/analyst` - User research, market analysis, competitive feature analysis
- `/pm` - Feature requirements, user story creation, acceptance criteria
- `/architect` - Frontend architecture, state management design, API integration patterns
- `/ux-expert` - User experience design, accessibility requirements, interaction patterns

### Development Phase Agents
- `/dev` - React component implementation, TypeScript interfaces, business logic
- `/ux-expert` - CSS/styling implementation, responsive design, user interaction polish
- `/sm` - Sprint coordination, story validation, development progress tracking

### Quality Assurance Agents
- `/qa` - Component testing, integration testing, accessibility testing, security validation

## Web-Specific Build Commands

```bash
# Development
npm run dev              # Vite development server with hot reload
npm run dev:network      # Development server with network access
npm run test:tdd         # Vitest TDD mode with watch
npm run test:ui          # Vitest UI for visual test management
npm run lint:fix         # ESLint with auto-fix
npm run security:scan    # Security vulnerability scanning

# Quality Assurance
npm run build           # Production build with optimization
npm run preview         # Preview production build locally
npm run test:coverage   # Test coverage report
npm run accessibility:test  # Accessibility compliance testing
npm run performance:audit   # Performance metrics and optimization suggestions

# Type Safety
npm run type-check      # TypeScript compilation check
npm run type-coverage   # TypeScript coverage analysis
```

## Component Development Standards

### Component Structure
```typescript
// ComponentName/index.tsx
interface ComponentNameProps {
  // [BMAD /ux-expert]: Define comprehensive prop interfaces
}

const ComponentName: React.FC<ComponentNameProps> = ({}) => {
  // [BMAD /dev]: Implement component logic with hooks
  // [BMAD /ux-expert]: Apply styling and interactions
  return (/* JSX implementation */);
};

export default ComponentName;

// ComponentName/ComponentName.test.tsx  
// [BMAD /qa]: Comprehensive component testing
describe('ComponentName', () => {
  // Test implementation
});

// ComponentName/ComponentName.stories.tsx
// [BMAD /ux-expert]: Storybook stories for component showcase
export default {
  title: 'Components/ComponentName',
  component: ComponentName,
};
```

### State Management Patterns
- **Local State**: useState and useReducer for component-level state
- **Global State**: [Context API|Redux Toolkit|Zustand] for app-level state
- **Server State**: React Query/TanStack Query for API data management
- **Form State**: React Hook Form with Zod validation

## Security Implementation Checklist

### Client-Side Security
- [ ] Content Security Policy headers configured
- [ ] XSS protection through DOMPurify or equivalent
- [ ] Authentication tokens securely stored (httpOnly cookies)
- [ ] API endpoints use proper CORS configuration
- [ ] Form inputs validated and sanitized
- [ ] External links use rel="noopener noreferrer"
- [ ] Environment variables properly segregated

### Performance Security
- [ ] Bundle analysis for dependency vulnerabilities
- [ ] Image optimization and lazy loading implemented
- [ ] CDN resources use SRI hashes
- [ ] Error boundaries prevent information leakage

## Testing Strategy

### Testing Pyramid
- **Unit Tests**: Component logic, utility functions, custom hooks
- **Integration Tests**: Component interactions, form submissions, API integrations  
- **E2E Tests**: Critical user journeys, authentication flows, payment processes

### Test Coverage Targets
- **Statements**: 90%+ coverage
- **Branches**: 85%+ coverage  
- **Functions**: 95%+ coverage
- **Lines**: 90%+ coverage

## Accessibility Standards

### WCAG 2.1 AA Compliance
- [ ] Semantic HTML structure
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Color contrast ratios meet standards
- [ ] Focus management for interactive elements
- [ ] Alternative text for images
- [ ] Form labels and error messages

## Quality Gates Validation

### Pre-Commit Hooks
- [ ] ESLint passes with zero warnings
- [ ] TypeScript compilation successful
- [ ] Unit tests passing
- [ ] Security scan clean
- [ ] Bundle size within limits

### BMAD Agent Handoff Validation
- [ ] `/analyst` + `/pm`: Requirements clearly specified with acceptance criteria
- [ ] `/architect`: Technical design documented and validated
- [ ] `/dev` + `/ux-expert`: Implementation matches design specifications
- [ ] `/qa`: All testing tiers validated, accessibility verified
- [ ] `/bmad-orchestrator`: Quality gates passed, documentation complete

## Performance Monitoring

### Core Web Vitals Tracking
- **Largest Contentful Paint (LCP)**: Target < 2.5 seconds
- **First Input Delay (FID)**: Target < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: Target < 0.1

### Bundle Analysis
- **Initial Bundle Size**: Target < 250KB gzipped
- **Code Splitting**: Implemented for route-based and component-based loading
- **Dependency Audit**: Regular vulnerability scanning and updates

## Emergency Procedures

### Performance Issues
1. `/architect` analysis of performance bottlenecks
2. `/dev` implementation of optimization strategies
3. `/qa` validation of performance improvements

### Security Incidents
1. Immediate containment and user notification
2. `/qa` security audit and vulnerability assessment
3. `/dev` security patches and hardening implementation

### Accessibility Issues
1. `/ux-expert` accessibility audit and recommendations
2. `/dev` implementation of accessibility improvements
3. `/qa` validation with assistive technology testing

## Project-Specific Context

### Current Focus
- [CUSTOMIZE: Current sprint objectives and feature development]

### Technical Architecture
- [CUSTOMIZE: Key architectural patterns and design decisions]

### Integration Points
- [CUSTOMIZE: API endpoints, third-party services, external dependencies]

**Web Development Integration Command**: When implementing web features, coordinate `/ux-expert` and `/dev` agents for optimal user experience, validate through `/qa` accessibility and performance testing, and maintain security-first principles throughout development.
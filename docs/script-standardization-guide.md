# Package.json Script Standardization Guide

## Overview

This guide documents the standardized approach for package.json scripts across all project templates in the my-dev-workspace. The standardization ensures consistency while preserving template-specific functionality.

## Standardization Approach

### Core Principles
1. **Universal Scripts**: Core scripts that exist across all templates with consistent naming
2. **Template-Specific Scripts**: Specialized scripts that are unique to template types
3. **Consistent Naming**: Follow verb:scope pattern for scoped actions
4. **Logical Ordering**: Group scripts by category and maintain consistent order

### Script Categories

#### 1. Core Development (Universal)
- `dev` - Development server with hot reload
- `build` - Production build with type checking  
- `start` - Production server startup
- `preview` - Preview production build
- `clean` - Clean build artifacts (API-specific, optional for Web)

#### 2. Quality Assurance (Universal)
- `lint` - ESLint with max-warnings 0
- `lint:fix` - ESLint with auto-fix
- `lint:staged` - Lint-staged integration
- `type-check` - TypeScript type checking (no emit)
- `format` - Prettier format all files
- `format:check` - Prettier check only

#### 3. Testing Framework (Universal)
- `test` - Run all tests
- `test:watch` - Watch mode testing
- `test:coverage` - Coverage reporting
- `test:e2e` - End-to-end testing

#### 4. Security & Performance (Universal)
- `security:scan` - npm audit moderate level
- `security:fix` - npm audit fix
- `security:deps` - better-npm-audit scanning

#### 5. Template-Specific Extensions

**Web Template Additions:**
- `test:ui` - Vitest UI interface
- `test:e2e:ui` - Playwright UI interface
- `accessibility:test` - Axe accessibility testing
- `performance:audit` - Lighthouse CI auditing
- `storybook` - Storybook development
- `build-storybook` - Storybook build

**API Template Additions:**
- `test:tdd` - TDD watch mode (verbose)
- `test:integration` - Integration tests only
- `test:unit` - Unit tests only
- `security:snyk` - Snyk security scanning
- `performance:test` - Autocannon load testing
- `db:*` - Database operations (migrate, seed, studio, generate)
- `logs:*` - Log management (tail, flush)
- `docs:*` - Documentation generation (generate, serve)

## Configuration Files

### Base Configuration (`config/scripts-base.json`)
Contains the standardized script definitions and naming conventions used across all templates.

### Template-Specific Configuration
- `config/scripts-web.json` - Web template script definitions
- `config/scripts-api.json` - API template script definitions

## Script Order Standards

Scripts are ordered by category for consistency:

1. **Core Development**: dev, build, start, preview, clean
2. **Quality Assurance**: lint, type-check, format  
3. **Testing**: test, test:watch, test:coverage, test:e2e
4. **Security**: security:scan, security:fix, security:deps
5. **Template-Specific**: accessibility, performance, storybook, db, logs, docs
6. **Utilities**: prepare, copy-assets, pre/post hooks

## Implementation Changes Made

### Web Template Changes
- ✅ Renamed `test:tdd` → `test:watch` for consistency
- ✅ Maintained all existing functionality
- ✅ No breaking changes

### API Template Changes  
- ✅ Added `preview` script (alias for `start:prod`)
- ✅ Reordered scripts to follow standard categories
- ✅ Maintained both `test:watch` and `test:tdd` for compatibility
- ✅ No breaking changes

## Validation Results

### Common Script Patterns (Both Templates)
✅ `dev` - Development server
✅ `build` - Production build
✅ `start` - Production start (API) / not applicable (Web)
✅ `preview` - Preview build
✅ `lint` + `lint:fix` + `lint:staged` - Linting
✅ `type-check` - TypeScript validation
✅ `test` + `test:watch` + `test:coverage` + `test:e2e` - Testing
✅ `security:scan` + `security:fix` + `security:deps` - Security
✅ `format` + `format:check` - Code formatting
✅ `prepare` - Git hooks setup

### Template-Specific Scripts Preserved
✅ Web: Storybook, accessibility, Playwright UI, Vitest UI
✅ API: Database ops, documentation, logging, performance testing

## Future Template Creation

When creating new templates:

1. **Reference Base Configuration**: Use `config/scripts-base.json` for standard scripts
2. **Follow Naming Conventions**: Maintain verb:scope pattern
3. **Preserve Core Categories**: Include all universal script categories
4. **Add Template-Specific**: Only add scripts that are truly unique to the template type
5. **Maintain Order**: Follow the established script ordering pattern
6. **Document Extensions**: Update this guide with any new template-specific scripts

## Benefits Achieved

1. **Developer Experience**: Consistent commands across all project types
2. **Onboarding**: New developers learn one set of commands
3. **Automation**: Scripts can be programmatically discovered and used
4. **Maintenance**: Centralized script definitions reduce duplication
5. **Quality**: Standardized testing, linting, and security patterns
6. **Flexibility**: Template-specific functionality preserved

## Compatibility

- ✅ **Backward Compatible**: All existing scripts maintained
- ✅ **Non-Breaking**: No functionality removed
- ✅ **Additive**: Only additions and reordering applied
- ✅ **Template Integrity**: Each template's unique capabilities preserved

This standardization provides a solid foundation for consistent development workflows while maintaining the specialized functionality that makes each template unique.
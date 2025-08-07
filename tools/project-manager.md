# Project Manager Tools

This directory contains utilities and tools for managing the development workspace.

## Available Tools

### Project Creation Script
- **File**: `../scripts/new-project.js`
- **Purpose**: Create new projects from templates
- **Usage**: `node scripts/new-project.js <name> <type>`

## Planned Tools

### Project Lister
A script to list all projects with their status and basic information.

### Dependency Manager
Tool to check and update dependencies across all projects.

### Build Manager
Utility to build multiple projects with status reporting.

### Test Runner
Run tests across all projects with aggregate reporting.

### Cleanup Tool
Remove node_modules and build artifacts from all projects.

## Development

Tools should be platform-independent and use Node.js for consistency with the project templates.
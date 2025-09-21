---
title: Spec-Driven Project
command: spec-driven
description: Initialize a new spec-driven development project using GitHub Spec-Kit
---

# Spec-Driven Project Command

Initialize projects requiring formal specification-driven development using GitHub Spec-Kit.

## Usage

```
/spec-driven <project-name>
```

## What It Does

1. Creates new project under `projects/`
2. Initializes Spec-Kit structure with Claude support
3. Integrates with workspace protocols
4. Sets up specification workflow

## When to Use

- Greenfield projects requiring detailed specifications
- Client projects needing formal documentation
- Features with multiple implementation approaches
- Projects requiring specification review cycles

## Implementation

Use the PowerShell script to initialize spec-driven projects:

```powershell
# Run from workspace root
.\scripts\spec-driven-init.ps1 -ProjectName "my-app"

# Or with options
.\scripts\spec-driven-init.ps1 -ProjectName "my-app" -AI claude -NoGit
```

This script:
1. Downloads the latest Spec-Kit template from GitHub
2. Extracts it to `projects/<project-name>`
3. Adds workspace integration notes to CLAUDE.md
4. Optionally initializes a git repository

## Alternative: Direct Template Download

If you prefer manual setup:

1. Download template from: https://github.com/github/spec-kit/releases/latest
   - Choose `spec-kit-template-claude-sh.zip` or `spec-kit-template-claude-ps.zip`

2. Extract to `projects/<your-project-name>`

3. Add workspace integration notes to the project's CLAUDE.md

## Known Issues

- The `uvx` Spec-Kit CLI has Unicode encoding issues on Windows
- Use the PowerShell script (`spec-driven-init.ps1`) as a workaround
- Templates work perfectly once extracted

## Notes

- Requires `uvx` and `git` installed
- Uses Claude as the AI assistant
- Integrates with existing workspace protocols
- Specifications stored in `specs/` directory
- Each feature gets its own branch and spec
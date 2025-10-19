# External Tool Integration

External tools are integrated via clean external methods rather than embedded repositories. This approach maintains workspace cleanliness while providing full tool functionality.

## claudecode-rule2hook

**Purpose**: Natural language rule automation for Claude Code hooks

**Status**: ✅ **INTEGRATED** - Command available in workspace

**Location**: `.claude/commands/rule2hook.md`

**Usage**: Use `/project:rule2hook` command directly in Claude Code

**External Setup**: Clone externally when source inspection needed:
```bash
# Clone for development/inspection (external to workspace)
git clone https://github.com/zxdxjtu/claudecode-rule2hook.git ~/tools/claudecode-rule2hook
```

**Features**:
- Natural language rule definition
- Automatic hook generation
- Integration with Claude Code hook system
- Command-based workflow

---

## Semgrep MCP

**Purpose**: Security scanning via Model Context Protocol

**Status**: 🟡 **READY FOR SETUP** - Setup when needed

**Integration Method**: MCP server via package manager

**Installation**:
```bash
# Add to Claude Code MCP configuration
claude mcp add semgrep uvx semgrep-mcp

# OR install globally
uvx semgrep-mcp
```

**Repository**: https://github.com/semgrep/mcp.git

**Features**:
- Security pattern scanning
- Vulnerability detection
- Code quality analysis
- MCP-based integration with Claude Code

**Use Cases**:
- Pre-commit security scanning
- Code review automation
- Vulnerability audits
- Security pattern enforcement

---

## Serena

**Purpose**: Semantic code analysis and editing toolkit

**Status**: 🟡 **READY FOR SETUP** - Setup when needed

**Integration Method**: MCP server via uvx

**Installation**:
```bash
# Add to Claude Code MCP configuration
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant
```

**Repository**: https://github.com/oraios/serena.git

**Features**:
- Semantic code understanding
- Context-aware code editing
- Code structure analysis
- IDE assistant integration

**Use Cases**:
- Intelligent refactoring
- Code pattern analysis
- Semantic search across codebase
- Context-aware suggestions

---

## Integration Best Practices

### Clean Integration Approach

**Benefits**:
- Maintains workspace cleanliness
- Prevents repository nesting issues
- Easier updates and version management
- Clear separation of workspace and tools

**Guidelines**:
1. Use MCP servers for Claude Code integration
2. Clone tools externally (e.g., `~/tools/`) for inspection
3. Reference tools via commands or MCP configuration
4. Document integration method clearly
5. Keep workspace repository focused on project templates

### When to Setup External Tools

**Setup Triggers**:
- Security scanning required for new project
- Advanced code analysis needed
- Automation rules need creation/modification
- Semantic editing features requested

**Setup Process**:
1. Verify tool is needed for current task
2. Follow installation instructions in this document
3. Test integration with simple command
4. Document any project-specific configuration
5. Add to project-specific documentation if used frequently

### Troubleshooting

**Common Issues**:

**MCP Server Connection Fails**:
```bash
# Verify MCP server is installed
claude mcp list

# Reinstall if needed
claude mcp remove <server-name>
claude mcp add <server-name> <install-command>
```

**Tool Command Not Found**:
```bash
# Verify uvx is installed and in PATH
uvx --version

# Add to PATH if needed (Windows)
$env:PATH += ";$HOME\.local\bin"
```

**Permission Denied**:
```bash
# Run with elevated permissions if needed
# Or adjust installation directory to user-writable location
```

### Future Tool Integration

When integrating new external tools:

1. **Evaluate Integration Method**:
   - MCP server (preferred for Claude Code)
   - Command-line tool (for build/CI/CD)
   - External repository (for development/inspection)

2. **Document Integration**:
   - Add to this file with status indicator
   - Include installation instructions
   - Provide usage examples
   - Note any configuration requirements

3. **Test Integration**:
   - Verify tool functionality
   - Test with sample project
   - Document any issues or limitations

4. **Maintain Cleanliness**:
   - Avoid embedding repositories in workspace
   - Use external locations for tool source code
   - Keep workspace focused on templates and configuration

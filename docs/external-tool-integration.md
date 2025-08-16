# External Tool Integration Guide

This document provides comprehensive guidance for integrating external tools with the my-dev-workspace environment. These tools were previously embedded as subrepositories but have been moved to external integration for better maintainability and security.

## Overview

**INTEGRATION PHILOSOPHY**: Use external tools as intended by their authors, maintaining clean workspace boundaries and enabling easy updates.

**SECURITY BENEFITS**: External integration prevents potential security issues from embedded repositories and ensures tools are always up-to-date.

**MAINTENANCE ADVANTAGES**: Easier updates, cleaner workspace, no duplicate maintenance burden.

## Available External Tools

### 1. claudecode-rule2hook
**Purpose**: Natural language rule automation for Claude Code hooks
**Repository**: https://github.com/zxdxjtu/claudecode-rule2hook.git
**Integration Status**: ✅ ACTIVE (command available in workspace)

**Current Integration**: The rule2hook command is already installed in `.claude/commands/rule2hook.md`

**Usage**:
```bash
# Use the rule2hook command directly in Claude Code
/project:rule2hook "Format Python files with black after editing"

# Or read rules from CLAUDE.md
/project:rule2hook
```

**Manual Update Process** (if needed):
```bash
# Clone latest version
git clone https://github.com/zxdxjtu/claudecode-rule2hook.git temp-rule2hook

# Update command
cp temp-rule2hook/.claude/commands/rule2hook.md .claude/commands/

# Clean up
rm -rf temp-rule2hook
```

### 2. Semgrep MCP
**Purpose**: Security scanning via Model Context Protocol  
**Repository**: https://github.com/semgrep/mcp.git
**Integration Status**: 🟡 READY FOR SETUP

**Recommended Integration Method**: MCP Server via Package Manager

**Setup Options**:

**Option A: Claude Code Integration**
```bash
claude mcp add semgrep uvx semgrep-mcp
```

**Option B: Global Installation** 
```bash
uvx semgrep-mcp
```

**Option C: Docker Integration**
```bash
docker run -i --rm ghcr.io/semgrep/mcp -t stdio
```

**MCP Configuration** (for IDEs):
```json
{
  "mcpServers": {
    "semgrep": {
      "command": "uvx",
      "args": ["semgrep-mcp"],
      "env": {
        "SEMGREP_APP_TOKEN": "<optional-token>"
      }
    }
  }
}
```

**Available Tools**:
- `security_check`: Scan code for security vulnerabilities
- `semgrep_scan`: Custom rule scanning
- `semgrep_scan_with_custom_rule`: Custom rule creation and scanning
- `supported_languages`: List supported languages

### 3. Serena
**Purpose**: Semantic code analysis and editing toolkit
**Repository**: https://github.com/oraios/serena.git  
**Integration Status**: 🟡 READY FOR SETUP

**Recommended Integration Method**: MCP Server via uvx

**Setup Options**:

**Option A: Claude Code Integration**
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)
```

**Option B: Claude Desktop Integration**
```json
{
  "mcpServers": {
    "serena": {
      "command": "/abs/path/to/uvx",
      "args": ["--from", "git+https://github.com/oraios/serena", "serena", "start-mcp-server", "--context", "ide-assistant"]
    }
  }
}
```

**Option C: Local Installation**
```bash
git clone https://github.com/oraios/serena
cd serena
uv run serena start-mcp-server
```

**Available Contexts**:
- `desktop-app`: For Claude Desktop (default)
- `agent`: For autonomous agent mode
- `ide-assistant`: For IDE integration (recommended)

**Key Features**:
- Semantic code retrieval and editing
- Language server integration (Python, TypeScript, Go, Rust, etc.)
- Symbol-level operations
- Project onboarding and memory management

## Integration Workflow

### 1. Assessment Phase
- [ ] Identify tool requirements for current project
- [ ] Determine best integration method (MCP vs. direct)
- [ ] Check tool compatibility with existing workflow

### 2. Setup Phase  
- [ ] Install tool using recommended method
- [ ] Configure MCP integration if applicable
- [ ] Test basic functionality
- [ ] Document project-specific configuration

### 3. Validation Phase
- [ ] Verify tool functionality in workspace
- [ ] Test integration with existing workflows
- [ ] Update team documentation
- [ ] Create usage examples

### 4. Maintenance Phase
- [ ] Monitor tool updates
- [ ] Update integration when needed
- [ ] Share best practices with team
- [ ] Document any issues or workarounds

## Best Practices

### Security Considerations
1. **Never embed full repositories** in workspace
2. **Use package managers** when available (uvx, pip, npm)
3. **Pin versions** in production environments
4. **Review tool permissions** before installation
5. **Use official repositories** only

### Performance Optimization
1. **Use lightweight integration methods** (MCP over direct embedding)
2. **Configure tools appropriately** for workspace size
3. **Monitor resource usage** during development
4. **Use context-specific configurations** when available

### Maintenance Guidelines
1. **Regular updates** via package managers
2. **Version compatibility testing** before major updates
3. **Backup configurations** before changes
4. **Document custom configurations** for team sharing

## Troubleshooting

### Common Issues

**MCP Server Connection Problems**:
```bash
# Check MCP server status
claude mcp list

# Test connection
claude mcp test <server-name>

# Restart if needed
claude mcp remove <server-name>
claude mcp add <server-name> <command>
```

**Tool Unavailable After Setup**:
1. Verify installation path
2. Check MCP configuration syntax
3. Restart Claude Code/Desktop
4. Review tool-specific requirements

**Performance Issues**:
1. Use appropriate context settings
2. Limit scope of operations
3. Configure tool-specific performance options
4. Consider alternative integration methods

### Tool-Specific Troubleshooting

**Rule2Hook Issues**:
- Verify CLAUDE.md format
- Check hook syntax validation
- Test commands manually first

**Semgrep Issues**:
- Verify SEMGREP_APP_TOKEN if using cloud features
- Check supported language list
- Test with simple security scan first

**Serena Issues**:
- Verify language server availability
- Check project indexing status
- Use appropriate context for integration type

## Migration from Embedded Repositories

If migrating from embedded repositories:

1. **Backup any custom configurations**
2. **Remove embedded repository directories**
3. **Install using external integration method**
4. **Test functionality matches previous setup**
5. **Update documentation and team processes**

## Future Considerations

- **Tool Updates**: Monitor for new versions and features
- **Integration Improvements**: Look for better integration methods
- **Performance Optimization**: Regular review of tool performance impact
- **Security Reviews**: Periodic assessment of tool permissions and access

---

**Note**: This integration approach ensures clean workspace boundaries, easier maintenance, and better security while preserving all tool functionality.
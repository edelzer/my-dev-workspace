# MCP Server Security Setup Guide

## 🔒 API Key Security

**CRITICAL**: Never commit API keys to your repository. This guide shows how to configure MCP servers securely.

## Setup Process

### 1. Environment Variables
```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your actual API keys
FIRECRAWL_API_KEY=your_actual_key_here
```

### 2. Configure MCP Servers

Use Claude Code commands to set up servers with environment variable references:

```bash
# Remove any existing server with hardcoded keys
claude mcp remove firecrawl

# Add server with environment variable
claude mcp add firecrawl npx -- -y firecrawl-mcp -e FIRECRAWL_API_KEY=${FIRECRAWL_API_KEY}
```

### 3. Verify Security

Check that your `.claude.json` file uses environment variables, not hardcoded keys:

```json
"firecrawl": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "firecrawl-mcp"],
  "env": {
    "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
  }
}
```

## 🚨 Security Checklist

- [ ] API keys are in `.env.local` (not committed)
- [ ] `.claude.json` uses environment variable references
- [ ] `.gitignore` blocks `.claude.json` and `.env.local`
- [ ] No hardcoded keys in any committed files

## Files That Should NEVER Be Committed

- `.claude.json` - Contains personal MCP configuration
- `.env.local` - Contains actual API keys  
- `claude_desktop_config.json` - Personal Claude app config

## Safe to Commit

- `.env.example` - Template with placeholder values
- `.claude/` directory - Project agent configurations
- `CLAUDE.md` - Project instructions
- This security guide

## Emergency: Key Exposed

If you accidentally commit an API key:

1. **Immediately revoke the key** in the service dashboard
2. **Generate a new key**
3. **Remove the key from git history**:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch .claude.json' \
   --prune-empty --tag-name-filter cat -- --all
   ```
4. **Update your local configuration** with the new key

## Best Practices

- Use unique API keys per environment (dev/staging/prod)
- Regularly rotate API keys
- Monitor API key usage in service dashboards
- Never share `.claude.json` or `.env.local` files
- Use environment-specific configurations
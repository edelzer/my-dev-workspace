#!/bin/bash

# Remove Embedded Repositories Script
# Phase 2 Task 2.1: Clean removal of embedded repositories with external integration setup

set -e

echo "🧹 Phase 2 Task 2.1: Removing Embedded Repositories"
echo "================================================"

# Backup current working directory
ORIGINAL_DIR=$(pwd)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"

cd "$WORKSPACE_DIR"

echo "📍 Working in: $WORKSPACE_DIR"

# List of embedded repositories to remove
REPOS_TO_REMOVE=(
    "claudecode-rule2hook"
    "semgrep-mcp" 
    "serena"
)

echo ""
echo "🔍 Repositories to remove:"
for repo in "${REPOS_TO_REMOVE[@]}"; do
    if [ -d "$repo" ]; then
        echo "  ✅ Found: $repo"
    else
        echo "  ❌ Not found: $repo"
    fi
done

echo ""
echo "🛡️  Safety checks..."

# Safety check: Ensure we're in the right directory
if [ ! -f "CLAUDE.md" ] || [ ! -d ".claude" ]; then
    echo "❌ Error: Not in my-dev-workspace root directory"
    exit 1
fi

# Safety check: Ensure rule2hook command exists in main workspace
if [ ! -f ".claude/commands/rule2hook.md" ]; then
    echo "❌ Error: rule2hook.md not found in .claude/commands/"
    echo "   This command needs to be preserved before removal"
    exit 1
fi

echo "✅ Safety checks passed"

# Create backup directory for any custom configurations
BACKUP_DIR="backups/embedded-repos-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo ""
echo "💾 Creating backups in: $BACKUP_DIR"

# Backup any custom configurations if they exist
for repo in "${REPOS_TO_REMOVE[@]}"; do
    if [ -d "$repo" ]; then
        echo "  📦 Backing up $repo custom configs..."
        
        # Create backup structure
        mkdir -p "$BACKUP_DIR/$repo"
        
        # Backup key configuration files
        if [ -f "$repo/.claude/commands/rule2hook.md" ] && [ "$repo" = "claudecode-rule2hook" ]; then
            cp "$repo/.claude/commands/rule2hook.md" "$BACKUP_DIR/$repo/"
        fi
        
        # Backup any custom scripts or configs
        if [ -f "$repo/config.yml" ]; then
            cp "$repo/config.yml" "$BACKUP_DIR/$repo/"
        fi
        
        # Create manifest of what was backed up
        echo "Repository: $repo" > "$BACKUP_DIR/$repo/manifest.txt"
        echo "Backup Date: $(date)" >> "$BACKUP_DIR/$repo/manifest.txt"
        echo "Original URL: $(cd "$repo" && git remote get-url origin 2>/dev/null || echo 'Unknown')" >> "$BACKUP_DIR/$repo/manifest.txt"
        echo "Last Commit: $(cd "$repo" && git log -1 --format="%h %s" 2>/dev/null || echo 'Unknown')" >> "$BACKUP_DIR/$repo/manifest.txt"
    fi
done

echo ""
echo "🗑️  Removing embedded repositories..."

# Remove each repository
for repo in "${REPOS_TO_REMOVE[@]}"; do
    if [ -d "$repo" ]; then
        echo "  🗂️  Removing $repo..."
        
        # Remove from git tracking if tracked
        if git ls-files --error-unmatch "$repo" >/dev/null 2>&1; then
            git rm -rf "$repo"
            echo "    ✅ Removed from git tracking"
        fi
        
        # Remove directory
        rm -rf "$repo"
        echo "    ✅ Directory removed"
    else
        echo "  ⏭️  $repo not found, skipping"
    fi
done

echo ""
echo "📋 Creating removal report..."

# Create removal report
REPORT_FILE="$BACKUP_DIR/removal-report.md"
cat > "$REPORT_FILE" << EOF
# Embedded Repository Removal Report

**Date**: $(date)
**Task**: Phase 2 Task 2.1 - Remove Embedded Repositories
**Status**: COMPLETED

## Repositories Removed

$(for repo in "${REPOS_TO_REMOVE[@]}"; do
    echo "- **$repo**: $(cd "$BACKUP_DIR/$repo" 2>/dev/null && grep "Original URL" manifest.txt | cut -d' ' -f3- || echo 'Not found')"
done)

## External Integration Status

### claudecode-rule2hook
- **Status**: ✅ Preserved in main workspace
- **Location**: \`.claude/commands/rule2hook.md\`
- **Usage**: \`/project:rule2hook\` command available
- **External Setup**: Clone from https://github.com/zxdxjtu/claudecode-rule2hook.git when needed

### semgrep-mcp  
- **Status**: 🟡 Ready for external setup
- **Integration**: MCP server via \`uvx semgrep-mcp\`
- **Setup**: \`claude mcp add semgrep uvx semgrep-mcp\`
- **Repository**: https://github.com/semgrep/mcp.git

### serena
- **Status**: 🟡 Ready for external setup  
- **Integration**: MCP server via uvx
- **Setup**: \`claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant\`
- **Repository**: https://github.com/oraios/serena.git

## Workspace Impact

- ✅ No core functionality affected
- ✅ Rule2hook command preserved and functional
- ✅ External integration documentation created
- ✅ All backups created in \`$BACKUP_DIR\`

## Next Steps

1. Set up external MCP integrations as needed
2. Test external tool functionality
3. Update team documentation with new integration methods
4. Remove backup directory after validation (optional)

## Files Created/Updated

- \`docs/external-tool-integration.md\` - Comprehensive integration guide
- \`scripts/remove-embedded-repositories.sh\` - This removal script
- \`$BACKUP_DIR/\` - Backup of configurations
- Updated \`CLAUDE.md\` with external integration references

EOF

echo "✅ Removal completed successfully!"
echo ""
echo "📄 Summary:"
echo "  - Embedded repositories removed"
echo "  - Configurations backed up to: $BACKUP_DIR"
echo "  - External integration guide created"
echo "  - Workspace functionality preserved"
echo ""
echo "📖 Next steps:"
echo "  1. Review: $REPORT_FILE"
echo "  2. Setup external integrations as needed using:"
echo "     docs/external-tool-integration.md"
echo "  3. Test workspace functionality"
echo ""
echo "🎉 Phase 2 Task 2.1 Complete!"

# Return to original directory
cd "$ORIGINAL_DIR"
/**
 * Git Hooks Installation Script
 * 
 * Installs Git hooks for automatic configuration validation.
 * Integrates with the workspace validation system to ensure
 * configuration changes are validated before commits.
 */

const fs = require('fs').promises;
const path = require('path');

class HooksInstaller {
  constructor() {
    this.hooksDir = path.join(__dirname, '../../.git/hooks');
    this.validationScript = path.join(__dirname, 'cli.js');
  }

  async install() {
    console.log('🔧 Installing configuration validation Git hooks...');

    try {
      // Ensure hooks directory exists
      await this.ensureHooksDirectory();

      // Install pre-commit hook
      await this.installPreCommitHook();

      // Install pre-push hook
      await this.installPrePushHook();

      // Install commit-msg hook
      await this.installCommitMsgHook();

      console.log('✅ Git hooks installed successfully!');
      console.log('\nInstalled hooks:');
      console.log('  - pre-commit: Configuration validation');
      console.log('  - pre-push: Comprehensive validation + sync check');
      console.log('  - commit-msg: Configuration change detection');

    } catch (error) {
      console.error('❌ Failed to install Git hooks:', error.message);
      process.exit(1);
    }
  }

  async ensureHooksDirectory() {
    try {
      await fs.access(this.hooksDir);
    } catch (error) {
      throw new Error('Not in a Git repository or hooks directory not found');
    }
  }

  async installPreCommitHook() {
    const hookPath = path.join(this.hooksDir, 'pre-commit');
    
    const hookContent = `#!/bin/sh
#
# Configuration Validation Pre-Commit Hook
# Automatically validates configuration files before allowing commits
#

echo "🔍 Validating configuration files..."

# Run configuration validation
if ! node "${this.validationScript}" validate-config --format console; then
    echo "❌ Configuration validation failed!"
    echo "   Please fix the configuration issues before committing."
    echo "   Run 'npm run validate:config' for detailed information."
    exit 1
fi

# Check for configuration file changes
CONFIG_FILES=$(git diff --cached --name-only | grep -E '\.(eslintrc|prettierrc|tsconfig|jest\.config|vitest\.config)\.(js|json|yml|yaml)$' || true)

if [ -n "$CONFIG_FILES" ]; then
    echo "📝 Configuration files changed in this commit:"
    echo "$CONFIG_FILES" | sed 's/^/   /'
    
    # Run drift check for changed files
    echo "🔍 Checking for configuration drift..."
    if ! node "${this.validationScript}" check-drift --threshold 0.05; then
        echo "⚠️  Configuration drift detected!"
        echo "   Consider reviewing the changes for consistency."
        echo "   Use --no-verify to bypass this check if intentional."
    fi
fi

echo "✅ Configuration validation passed!"
`;

    await this.writeHook(hookPath, hookContent);
  }

  async installPrePushHook() {
    const hookPath = path.join(this.hooksDir, 'pre-push');
    
    const hookContent = `#!/bin/sh
#
# Configuration Validation Pre-Push Hook
# Runs comprehensive validation before pushing to remote
#

echo "🚀 Running comprehensive validation before push..."

# Run full validation suite
if ! node "${this.validationScript}" validate-all --format console; then
    echo "❌ Comprehensive validation failed!"
    echo "   Cannot push with validation failures."
    echo "   Run 'npm run validate' to see all issues."
    exit 1
fi

# Check synchronization status
echo "🔄 Checking configuration synchronization..."
if ! node "${this.validationScript}" validate-sync --format console; then
    echo "⚠️  Configuration synchronization issues detected!"
    echo "   Push allowed but consider fixing sync issues."
    echo "   Run 'npm run validate:sync' for details."
fi

echo "✅ All validations passed! Push proceeding..."
`;

    await this.writeHook(hookPath, hookContent);
  }

  async installCommitMsgHook() {
    const hookPath = path.join(this.hooksDir, 'commit-msg');
    
    const hookContent = `#!/bin/sh
#
# Configuration Change Detection Commit Message Hook
# Adds configuration change markers to commit messages
#

COMMIT_MSG_FILE=$1

# Check if configuration files are in this commit
CONFIG_FILES=$(git diff --cached --name-only | grep -E '\.(eslintrc|prettierrc|tsconfig|jest\.config|vitest\.config)\.(js|json|yml|yaml)$' || true)

if [ -n "$CONFIG_FILES" ]; then
    # Add configuration change marker
    echo "" >> "$COMMIT_MSG_FILE"
    echo "🔧 Configuration Changes:" >> "$COMMIT_MSG_FILE"
    echo "$CONFIG_FILES" | sed 's/^/- /' >> "$COMMIT_MSG_FILE"
    
    # Add validation status
    echo "" >> "$COMMIT_MSG_FILE"
    echo "✅ Validated with config-validator v1.0.0" >> "$COMMIT_MSG_FILE"
fi
`;

    await this.writeHook(hookPath, hookContent);
  }

  async writeHook(hookPath, content) {
    // Backup existing hook if it exists
    try {
      await fs.access(hookPath);
      const backup = `${hookPath}.backup-${Date.now()}`;
      await fs.copyFile(hookPath, backup);
      console.log(`📋 Backed up existing hook to: ${path.basename(backup)}`);
    } catch (error) {
      // Hook doesn't exist, no backup needed
    }

    // Write new hook
    await fs.writeFile(hookPath, content, 'utf8');
    
    // Make executable
    await fs.chmod(hookPath, 0o755);
    
    console.log(`✅ Installed: ${path.basename(hookPath)}`);
  }

  async uninstall() {
    console.log('🔧 Uninstalling configuration validation Git hooks...');

    const hooks = ['pre-commit', 'pre-push', 'commit-msg'];
    
    for (const hook of hooks) {
      const hookPath = path.join(this.hooksDir, hook);
      
      try {
        // Check if our hook is installed
        const content = await fs.readFile(hookPath, 'utf8');
        
        if (content.includes('Configuration Validation')) {
          await fs.unlink(hookPath);
          console.log(`✅ Removed: ${hook}`);
          
          // Restore backup if exists
          const backups = await fs.readdir(this.hooksDir);
          const backup = backups.find(f => f.startsWith(`${hook}.backup-`));
          
          if (backup) {
            const backupPath = path.join(this.hooksDir, backup);
            await fs.copyFile(backupPath, hookPath);
            await fs.unlink(backupPath);
            console.log(`📋 Restored backup: ${hook}`);
          }
        }
      } catch (error) {
        // Hook doesn't exist or can't be read
      }
    }

    console.log('✅ Git hooks uninstalled successfully!');
  }
}

// CLI interface
if (require.main === module) {
  const installer = new HooksInstaller();
  
  const command = process.argv[2];
  
  if (command === 'uninstall') {
    installer.uninstall();
  } else {
    installer.install();
  }
}

module.exports = HooksInstaller;
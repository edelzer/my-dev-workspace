#!/usr/bin/env node
/**
 * Safety and Rollback System for Claude Code Hook Management
 * Provides backup, restore, and safety validation for hook configurations
 */

const fs = require('fs');
const path = require('path');

class HookSafetySystem {
    constructor() {
        this.configDir = '.claude';
        this.backupDir = path.join(this.configDir, 'backups');
        this.hooksFile = path.join(this.configDir, 'hooks.json');
        this.safetyConfig = path.join(this.configDir, 'safety-config.json');
        
        this.ensureDirectories();
        this.loadSafetyConfig();
    }
    
    ensureDirectories() {
        if (!fs.existsSync(this.configDir)) {
            fs.mkdirSync(this.configDir, { recursive: true });
        }
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }
    
    loadSafetyConfig() {
        const defaultConfig = {
            maxBackups: 10,
            autoBackup: true,
            dangerousCommands: [
                'rm -rf',
                'sudo rm',
                'format',
                'del /q',
                'rd /s',
                'shutdown',
                'reboot'
            ],
            maxHooksPerEvent: 20,
            allowedEventTypes: ['PreToolUse', 'PostToolUse', 'Stop', 'Notification']
        };
        
        if (fs.existsSync(this.safetyConfig)) {
            try {
                const config = JSON.parse(fs.readFileSync(this.safetyConfig, 'utf8'));
                this.config = { ...defaultConfig, ...config };
            } catch (error) {
                console.warn('Invalid safety config, using defaults');
                this.config = defaultConfig;
            }
        } else {
            this.config = defaultConfig;
            this.saveSafetyConfig();
        }
    }
    
    saveSafetyConfig() {
        fs.writeFileSync(this.safetyConfig, JSON.stringify(this.config, null, 2));
    }
    
    createBackup(description = '') {
        if (!fs.existsSync(this.hooksFile)) {
            console.log('No hooks file to backup');
            return null;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `hooks-${timestamp}.json`;
        const backupPath = path.join(this.backupDir, backupName);
        
        try {
            fs.copyFileSync(this.hooksFile, backupPath);
            
            // Create metadata
            const metadata = {
                timestamp: new Date().toISOString(),
                description: description || 'Automatic backup',
                originalPath: this.hooksFile,
                backupPath: backupPath
            };
            
            const metadataPath = backupPath.replace('.json', '.meta.json');
            fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
            
            console.log(`✅ Backup created: ${backupName}`);
            
            // Cleanup old backups
            this.cleanupOldBackups();
            
            return backupPath;
        } catch (error) {
            console.error(`❌ Backup failed: ${error.message}`);
            return null;
        }
    }
    
    cleanupOldBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(f => f.startsWith('hooks-') && f.endsWith('.json'))
                .map(f => ({
                    name: f,
                    path: path.join(this.backupDir, f),
                    stat: fs.statSync(path.join(this.backupDir, f))
                }))
                .sort((a, b) => b.stat.mtime - a.stat.mtime);
            
            if (files.length > this.config.maxBackups) {
                const toDelete = files.slice(this.config.maxBackups);
                toDelete.forEach(file => {
                    fs.unlinkSync(file.path);
                    // Also delete metadata file
                    const metaPath = file.path.replace('.json', '.meta.json');
                    if (fs.existsSync(metaPath)) {
                        fs.unlinkSync(metaPath);
                    }
                });
                console.log(`🧹 Cleaned up ${toDelete.length} old backups`);
            }
        } catch (error) {
            console.warn(`Warning: Cleanup failed: ${error.message}`);
        }
    }
    
    listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir)
                .filter(f => f.startsWith('hooks-') && f.endsWith('.json'))
                .map(f => {
                    const backupPath = path.join(this.backupDir, f);
                    const metaPath = backupPath.replace('.json', '.meta.json');
                    let metadata = { description: 'No description' };
                    
                    if (fs.existsSync(metaPath)) {
                        try {
                            metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
                        } catch (e) {
                            // Ignore metadata errors
                        }
                    }
                    
                    return {
                        name: f,
                        path: backupPath,
                        timestamp: metadata.timestamp || 'Unknown',
                        description: metadata.description,
                        stat: fs.statSync(backupPath)
                    };
                })
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return files;
        } catch (error) {
            console.error(`Error listing backups: ${error.message}`);
            return [];
        }
    }
    
    restoreBackup(backupName) {
        const backupPath = path.join(this.backupDir, backupName);
        
        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Backup not found: ${backupName}`);
            return false;
        }
        
        try {
            // Create current backup before restore
            this.createBackup('Pre-restore backup');
            
            // Restore the backup
            fs.copyFileSync(backupPath, this.hooksFile);
            console.log(`✅ Hooks restored from: ${backupName}`);
            return true;
        } catch (error) {
            console.error(`❌ Restore failed: ${error.message}`);
            return false;
        }
    }
    
    validateHooks(hooksPath = null) {
        const filePath = hooksPath || this.hooksFile;
        
        if (!fs.existsSync(filePath)) {
            return { valid: false, errors: ['Hooks file does not exist'] };
        }
        
        try {
            const hooksData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const errors = [];
            const warnings = [];
            
            // Structure validation
            if (!hooksData.hooks) {
                errors.push('Missing hooks object');
                return { valid: false, errors };
            }
            
            // Event type validation
            Object.keys(hooksData.hooks).forEach(eventType => {
                if (!this.config.allowedEventTypes.includes(eventType)) {
                    errors.push(`Invalid event type: ${eventType}`);
                }
                
                const eventHooks = hooksData.hooks[eventType];
                if (eventHooks.length > this.config.maxHooksPerEvent) {
                    warnings.push(`Many hooks for ${eventType}: ${eventHooks.length}`);
                }
                
                // Command safety validation
                eventHooks.forEach((hookGroup, i) => {
                    if (hookGroup.hooks) {
                        hookGroup.hooks.forEach((hook, j) => {
                            if (hook.command) {
                                this.config.dangerousCommands.forEach(dangerous => {
                                    if (hook.command.includes(dangerous)) {
                                        warnings.push(`Potentially dangerous command in ${eventType}[${i}].hooks[${j}]: ${dangerous}`);
                                    }
                                });
                            }
                        });
                    }
                });
            });
            
            return {
                valid: errors.length === 0,
                errors,
                warnings
            };
        } catch (error) {
            return {
                valid: false,
                errors: [`JSON parsing error: ${error.message}`]
            };
        }
    }
    
    emergencyReset() {
        try {
            if (fs.existsSync(this.hooksFile)) {
                this.createBackup('Emergency reset backup');
                fs.unlinkSync(this.hooksFile);
                console.log('✅ Emergency reset completed - hooks file removed');
                console.log('Use restoreBackup() to recover if needed');
            } else {
                console.log('No hooks file to reset');
            }
        } catch (error) {
            console.error(`❌ Emergency reset failed: ${error.message}`);
        }
    }
}

// CLI interface
if (require.main === module) {
    const safety = new HookSafetySystem();
    const command = process.argv[2];
    
    switch (command) {
        case 'backup':
            safety.createBackup(process.argv[3] || 'Manual backup');
            break;
            
        case 'list':
            console.log('📁 Available Backups:');
            const backups = safety.listBackups();
            if (backups.length === 0) {
                console.log('  No backups found');
            } else {
                backups.forEach(backup => {
                    console.log(`  ${backup.name}`);
                    console.log(`    Time: ${backup.timestamp}`);
                    console.log(`    Description: ${backup.description}`);
                    console.log();
                });
            }
            break;
            
        case 'restore':
            const backupName = process.argv[3];
            if (!backupName) {
                console.error('Usage: node safety-system.js restore <backup-name>');
                process.exit(1);
            }
            safety.restoreBackup(backupName);
            break;
            
        case 'validate':
            const validation = safety.validateHooks();
            console.log('🔍 Validation Results:');
            console.log(`Valid: ${validation.valid}`);
            if (validation.errors.length > 0) {
                console.log('❌ Errors:');
                validation.errors.forEach(error => console.log(`  - ${error}`));
            }
            if (validation.warnings.length > 0) {
                console.log('⚠️  Warnings:');
                validation.warnings.forEach(warning => console.log(`  - ${warning}`));
            }
            break;
            
        case 'reset':
            console.log('⚠️  Emergency reset - all hooks will be removed!');
            safety.emergencyReset();
            break;
            
        default:
            console.log('Claude Code Hook Safety System');
            console.log('Usage:');
            console.log('  node safety-system.js backup [description]  - Create backup');
            console.log('  node safety-system.js list                   - List backups');
            console.log('  node safety-system.js restore <backup-name> - Restore backup');
            console.log('  node safety-system.js validate              - Validate hooks');
            console.log('  node safety-system.js reset                 - Emergency reset');
    }
}

module.exports = HookSafetySystem;
#!/usr/bin/env node
/**
 * Hook Validation System for Claude Code Rule2Hook Integration
 * Validates generated hook configurations for correctness and safety.
 */

const fs = require('fs');
const path = require('path');

function validateHooksStructure(hooksData) {
    const errors = [];
    
    if (typeof hooksData !== 'object' || hooksData === null) {
        errors.push('Root should be an object');
        return errors;
    }
    
    if (!('hooks' in hooksData)) {
        errors.push("Missing 'hooks' key in root");
        return errors;
    }
    
    const hooks = hooksData.hooks;
    if (typeof hooks !== 'object' || hooks === null) {
        errors.push("'hooks' should be an object");
        return errors;
    }
    
    const validEvents = new Set(['PreToolUse', 'PostToolUse', 'Stop', 'Notification']);
    for (const event of Object.keys(hooks)) {
        if (!validEvents.has(event)) {
            errors.push(`Invalid event type: ${event}`);
        }
    }
    
    return errors;
}

function validateEventHooks(eventName, eventHooks) {
    const errors = [];
    
    if (!Array.isArray(eventHooks)) {
        errors.push(`${eventName}: Event hooks should be an array`);
        return errors;
    }
    
    eventHooks.forEach((hookGroup, i) => {
        if (typeof hookGroup !== 'object' || hookGroup === null) {
            errors.push(`${eventName}[${i}]: Hook group should be an object`);
            return;
        }
        
        if (!('hooks' in hookGroup)) {
            errors.push(`${eventName}[${i}]: Missing 'hooks' key`);
            return;
        }
        
        if (!Array.isArray(hookGroup.hooks)) {
            errors.push(`${eventName}[${i}]: 'hooks' should be an array`);
            return;
        }
        
        // Validate matcher if present
        if ('matcher' in hookGroup && typeof hookGroup.matcher !== 'string') {
            errors.push(`${eventName}[${i}]: 'matcher' should be a string`);
        }
        
        // Validate individual hooks
        hookGroup.hooks.forEach((hook, j) => {
            if (typeof hook !== 'object' || hook === null) {
                errors.push(`${eventName}[${i}].hooks[${j}]: Hook should be an object`);
                return;
            }
            
            if (!('type' in hook)) {
                errors.push(`${eventName}[${i}].hooks[${j}]: Missing 'type' key`);
            } else if (hook.type !== 'command') {
                errors.push(`${eventName}[${i}].hooks[${j}]: Only 'command' type supported`);
            }
            
            if (!('command' in hook)) {
                errors.push(`${eventName}[${i}].hooks[${j}]: Missing 'command' key`);
            } else if (typeof hook.command !== 'string') {
                errors.push(`${eventName}[${i}].hooks[${j}]: 'command' should be a string`);
            }
        });
    });
    
    return errors;
}

function validateCommandSafety(command) {
    const warnings = [];
    const dangerousPatterns = [
        'rm -rf',
        'sudo rm',
        'format',
        'del /q',
        'rd /s',
        '> /dev/null'  // Note: 2>/dev/null is usually OK
    ];
    
    dangerousPatterns.forEach(pattern => {
        if (command.toLowerCase().includes(pattern)) {
            if (pattern === '> /dev/null' && command.includes('2>/dev/null')) {
                return; // 2>/dev/null is OK for error suppression
            }
            warnings.push(`Potentially dangerous command pattern: ${pattern}`);
        }
    });
    
    return warnings;
}

function main() {
    const hooksFile = path.join('.claude', 'hooks.json');
    
    if (!fs.existsSync(hooksFile)) {
        console.log(`❌ Hooks file not found: ${hooksFile}`);
        return 1;
    }
    
    let hooksData;
    try {
        const fileContent = fs.readFileSync(hooksFile, 'utf8');
        hooksData = JSON.parse(fileContent);
    } catch (error) {
        if (error instanceof SyntaxError) {
            console.log(`❌ Invalid JSON in ${hooksFile}: ${error.message}`);
        } else {
            console.log(`❌ Error reading ${hooksFile}: ${error.message}`);
        }
        return 1;
    }
    
    console.log(`🔍 Validating hooks configuration: ${hooksFile}`);
    console.log();
    
    // Validate overall structure
    const errors = validateHooksStructure(hooksData);
    if (errors.length > 0) {
        console.log('❌ Structure Errors:');
        errors.forEach(error => console.log(`  - ${error}`));
        return 1;
    }
    
    // Validate each event type
    const allErrors = [];
    const allWarnings = [];
    
    Object.entries(hooksData.hooks).forEach(([eventName, eventHooks]) => {
        const eventErrors = validateEventHooks(eventName, eventHooks);
        allErrors.push(...eventErrors);
        
        // Check command safety
        eventHooks.forEach(hookGroup => {
            if (hookGroup.hooks) {
                hookGroup.hooks.forEach(hook => {
                    if (hook.command) {
                        const warnings = validateCommandSafety(hook.command);
                        allWarnings.push(...warnings.map(w => `${eventName}: ${w}`));
                    }
                });
            }
        });
    });
    
    // Report results
    if (allErrors.length > 0) {
        console.log('❌ Validation Errors:');
        allErrors.forEach(error => console.log(`  - ${error}`));
        return 1;
    }
    
    if (allWarnings.length > 0) {
        console.log('⚠️  Security Warnings:');
        allWarnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    // Print summary
    const totalHooks = Object.values(hooksData.hooks).reduce((total, eventHooks) => {
        return total + eventHooks.reduce((eventTotal, hookGroup) => {
            return eventTotal + (hookGroup.hooks ? hookGroup.hooks.length : 0);
        }, 0);
    }, 0);
    
    console.log('✅ Validation Summary:');
    console.log(`  - Events configured: ${Object.keys(hooksData.hooks).length}`);
    console.log(`  - Total hooks: ${totalHooks}`);
    console.log('  - Structure: Valid');
    console.log(`  - Safety warnings: ${allWarnings.length}`);
    
    // List configured events and matchers
    console.log('\n📋 Configured Hooks:');
    Object.entries(hooksData.hooks).forEach(([eventName, eventHooks]) => {
        console.log(`  ${eventName}:`);
        eventHooks.forEach((hookGroup, i) => {
            const matcher = hookGroup.matcher || 'All Tools';
            const hookCount = hookGroup.hooks ? hookGroup.hooks.length : 0;
            console.log(`    - Matcher: ${matcher} (${hookCount} hooks)`);
        });
    });
    
    return allWarnings.length > 0 ? 2 : 0; // 2 for warnings, 0 for success
}

if (require.main === module) {
    process.exit(main());
}

module.exports = { validateHooksStructure, validateEventHooks, validateCommandSafety };
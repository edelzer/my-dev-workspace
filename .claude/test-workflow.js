#!/usr/bin/env node
/**
 * End-to-End Rule2Hook Automation Workflow Test
 * Validates the complete rule2hook integration system
 */

const fs = require('fs');
const path = require('path');

class Rule2HookWorkflowTest {
    constructor() {
        this.testResults = [];
        this.claudeDir = '.claude';
    }
    
    log(test, status, details = '') {
        const result = { test, status, details, timestamp: new Date().toISOString() };
        this.testResults.push(result);
        
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusIcon} ${test}: ${status}`);
        if (details) {
            console.log(`   ${details}`);
        }
    }
    
    testDirectoryStructure() {
        console.log('\n🏗️  Testing Directory Structure...');
        
        // Test .claude directory exists
        if (fs.existsSync(this.claudeDir)) {
            this.log('Claude directory exists', 'PASS');
        } else {
            this.log('Claude directory exists', 'FAIL', 'Directory not found');
            return false;
        }
        
        // Test commands directory exists
        const commandsDir = path.join(this.claudeDir, 'commands');
        if (fs.existsSync(commandsDir)) {
            this.log('Commands directory exists', 'PASS');
        } else {
            this.log('Commands directory exists', 'FAIL');
            return false;
        }
        
        // Test rule2hook command exists
        const rule2hookPath = path.join(commandsDir, 'rule2hook.md');
        if (fs.existsSync(rule2hookPath)) {
            this.log('Rule2hook command installed', 'PASS');
        } else {
            this.log('Rule2hook command installed', 'FAIL');
            return false;
        }
        
        return true;
    }
    
    testHookFiles() {
        console.log('\n📄 Testing Hook Files...');
        
        const hookFiles = [
            'hooks.json',
            'intelligent-hooks.json',
            'conditional-hooks.json',
            'integration-hooks.json'
        ];
        
        let allValid = true;
        
        hookFiles.forEach(filename => {
            const filepath = path.join(this.claudeDir, filename);
            if (fs.existsSync(filepath)) {
                try {
                    const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                    if (content.hooks && typeof content.hooks === 'object') {
                        this.log(`${filename} structure valid`, 'PASS');
                    } else {
                        this.log(`${filename} structure valid`, 'FAIL', 'Invalid hooks structure');
                        allValid = false;
                    }
                } catch (error) {
                    this.log(`${filename} structure valid`, 'FAIL', `JSON parse error: ${error.message}`);
                    allValid = false;
                }
            } else {
                this.log(`${filename} exists`, 'WARN', 'File not found but optional');
            }
        });
        
        return allValid;
    }
    
    testValidationSystem() {
        console.log('\n🔍 Testing Validation System...');
        
        const validateScript = path.join(this.claudeDir, 'validate-hooks.js');
        if (fs.existsSync(validateScript)) {
            this.log('Validation script exists', 'PASS');
            
            // Test if the validation function works
            try {
                const { validateHooksStructure } = require(path.resolve(validateScript));
                const testHooks = { hooks: { PostToolUse: [] } };
                const errors = validateHooksStructure(testHooks);
                
                if (Array.isArray(errors) && errors.length === 0) {
                    this.log('Validation function works', 'PASS');
                } else {
                    this.log('Validation function works', 'FAIL', 'Validation returned unexpected errors');
                    return false;
                }
            } catch (error) {
                this.log('Validation function works', 'FAIL', `Import error: ${error.message}`);
                return false;
            }
        } else {
            this.log('Validation script exists', 'FAIL');
            return false;
        }
        
        return true;
    }
    
    testSafetySystem() {
        console.log('\n🛡️  Testing Safety System...');
        
        const safetyScript = path.join(this.claudeDir, 'safety-system.js');
        if (fs.existsSync(safetyScript)) {
            this.log('Safety system script exists', 'PASS');
            
            // Test if the safety class can be imported
            try {
                const HookSafetySystem = require(path.resolve(safetyScript));
                const safety = new HookSafetySystem();
                this.log('Safety system initializes', 'PASS');
                
                // Test backup directory creation
                const backupDir = path.join(this.claudeDir, 'backups');
                if (fs.existsSync(backupDir)) {
                    this.log('Backup directory created', 'PASS');
                } else {
                    this.log('Backup directory created', 'WARN', 'Directory not found');
                }
                
            } catch (error) {
                this.log('Safety system initializes', 'FAIL', `Initialization error: ${error.message}`);
                return false;
            }
        } else {
            this.log('Safety system script exists', 'FAIL');
            return false;
        }
        
        return true;
    }
    
    testHookEventTypes() {
        console.log('\n🎯 Testing Hook Event Types...');
        
        const hooksFile = path.join(this.claudeDir, 'hooks.json');
        if (!fs.existsSync(hooksFile)) {
            this.log('Hook event types test', 'SKIP', 'No hooks.json file');
            return true;
        }
        
        try {
            const hooks = JSON.parse(fs.readFileSync(hooksFile, 'utf8'));
            const expectedEvents = ['PreToolUse', 'PostToolUse', 'Stop'];
            let foundEvents = 0;
            
            expectedEvents.forEach(eventType => {
                if (hooks.hooks && hooks.hooks[eventType]) {
                    this.log(`${eventType} hooks configured`, 'PASS');
                    foundEvents++;
                } else {
                    this.log(`${eventType} hooks configured`, 'WARN', 'Event type not found');
                }
            });
            
            if (foundEvents >= 2) {
                this.log('Minimum hook events configured', 'PASS');
            } else {
                this.log('Minimum hook events configured', 'FAIL', 'Need at least 2 event types');
                return false;
            }
            
        } catch (error) {
            this.log('Hook event types test', 'FAIL', `Parse error: ${error.message}`);
            return false;
        }
        
        return true;
    }
    
    testRulePatterns() {
        console.log('\n📝 Testing Rule Patterns...');
        
        // Test different rule patterns from the example rules
        const testRules = [
            {
                rule: "Format Python files with black after editing",
                expectedEvent: "PostToolUse",
                expectedMatcher: "Edit|MultiEdit|Write"
            },
            {
                rule: "Run git status when finishing a task",
                expectedEvent: "Stop",
                expectedMatcher: null // No matcher for Stop events
            },
            {
                rule: "Check for secrets before saving files",
                expectedEvent: "PreToolUse",
                expectedMatcher: "Write|Edit|MultiEdit"
            }
        ];
        
        let patternsValid = true;
        
        testRules.forEach((testCase, i) => {
            // This is a conceptual test - in practice, rule2hook would analyze these
            const analysis = this.analyzeRule(testCase.rule);
            
            if (analysis.event === testCase.expectedEvent) {
                this.log(`Rule ${i + 1} event detection`, 'PASS', `Detected: ${analysis.event}`);
            } else {
                this.log(`Rule ${i + 1} event detection`, 'FAIL', 
                    `Expected: ${testCase.expectedEvent}, Got: ${analysis.event}`);
                patternsValid = false;
            }
        });
        
        return patternsValid;
    }
    
    analyzeRule(rule) {
        // Simple rule analysis logic (mimics rule2hook behavior)
        if (rule.includes('after') || rule.includes('following')) {
            return { event: 'PostToolUse' };
        } else if (rule.includes('before') || rule.includes('check') || rule.includes('validate')) {
            return { event: 'PreToolUse' };
        } else if (rule.includes('finish') || rule.includes('complete') || rule.includes('done')) {
            return { event: 'Stop' };
        } else {
            return { event: 'Unknown' };
        }
    }
    
    testIntegrationFeatures() {
        console.log('\n🔗 Testing Integration Features...');
        
        // Test conditional hooks
        const conditionalFile = path.join(this.claudeDir, 'conditional-hooks.json');
        if (fs.existsSync(conditionalFile)) {
            this.log('Conditional automation configured', 'PASS');
        } else {
            this.log('Conditional automation configured', 'WARN', 'Conditional hooks not found');
        }
        
        // Test integration hooks
        const integrationFile = path.join(this.claudeDir, 'integration-hooks.json');
        if (fs.existsSync(integrationFile)) {
            this.log('Cross-tool integration configured', 'PASS');
        } else {
            this.log('Cross-tool integration configured', 'WARN', 'Integration hooks not found');
        }
        
        // Test intelligent hooks
        const intelligentFile = path.join(this.claudeDir, 'intelligent-hooks.json');
        if (fs.existsSync(intelligentFile)) {
            this.log('Intelligent hooks configured', 'PASS');
        } else {
            this.log('Intelligent hooks configured', 'WARN', 'Intelligent hooks not found');
        }
        
        return true;
    }
    
    generateReport() {
        console.log('\n📊 Test Summary Report');
        console.log('=' .repeat(50));
        
        const passCount = this.testResults.filter(r => r.status === 'PASS').length;
        const failCount = this.testResults.filter(r => r.status === 'FAIL').length;
        const warnCount = this.testResults.filter(r => r.status === 'WARN').length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passCount} ✅`);
        console.log(`Failed: ${failCount} ❌`);
        console.log(`Warnings: ${warnCount} ⚠️`);
        console.log(`Success Rate: ${((passCount / total) * 100).toFixed(1)}%`);
        
        if (failCount === 0) {
            console.log('\n🎉 All critical tests passed! Rule2Hook system is operational.');
            return true;
        } else {
            console.log('\n⚠️  Some tests failed. Review the issues above.');
            return false;
        }
    }
    
    runAllTests() {
        console.log('🚀 Starting Rule2Hook End-to-End Workflow Test');
        console.log('=' .repeat(50));
        
        const tests = [
            () => this.testDirectoryStructure(),
            () => this.testHookFiles(),
            () => this.testValidationSystem(),
            () => this.testSafetySystem(),
            () => this.testHookEventTypes(),
            () => this.testRulePatterns(),
            () => this.testIntegrationFeatures()
        ];
        
        let allPassed = true;
        tests.forEach(test => {
            if (!test()) {
                allPassed = false;
            }
        });
        
        return this.generateReport();
    }
}

// CLI interface
if (require.main === module) {
    const tester = new Rule2HookWorkflowTest();
    const success = tester.runAllTests();
    process.exit(success ? 0 : 1);
}

module.exports = Rule2HookWorkflowTest;
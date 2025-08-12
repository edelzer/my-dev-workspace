#!/usr/bin/env node
/**
 * BMAD Workflow Validation System
 * Validates workflow state, agent handoffs, and file integrity
 */

const fs = require('fs');
const path = require('path');

class BMadWorkflowValidator {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.configDir = '.bmad-core';
        this.claudeDir = '.claude';
        this.workflowStateFile = path.join(this.configDir, 'workflow-state.json');
        
        this.validationResults = [];
    }
    
    log(category, status, message, details = null) {
        const result = {
            category,
            status,
            message,
            details,
            timestamp: new Date().toISOString()
        };
        this.validationResults.push(result);
        
        const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${statusIcon} [${category}] ${message}`);
        if (details) {
            console.log(`   ${details}`);
        }
    }
    
    validateWorkspaceStructure() {
        console.log('\n🏗️  Validating Workspace Structure...');
        
        const requiredDirs = [
            '.bmad-core',
            '.claude',
            'docs',
            'logs',
            'tasks',
            'templates/bmad-workflows'
        ];
        
        const requiredFiles = [
            '.bmad-core/workflow-state.json',
            '.claude/agent-activity.log',
            'logs/workflow-progress.log',
            'logs/agent-interactions.log'
        ];
        
        let structureValid = true;
        
        // Check required directories
        requiredDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.log('STRUCTURE', 'PASS', `Directory exists: ${dir}`);
            } else {
                this.log('STRUCTURE', 'FAIL', `Missing directory: ${dir}`);
                structureValid = false;
            }
        });
        
        // Check required files
        requiredFiles.forEach(file => {
            if (fs.existsSync(file)) {
                this.log('STRUCTURE', 'PASS', `File exists: ${file}`);
            } else {
                this.log('STRUCTURE', 'WARN', `Missing file: ${file}`, 'Will be created on first run');
            }
        });
        
        return structureValid;
    }
    
    validateWorkflowState() {
        console.log('\n📊 Validating Workflow State...');
        
        if (!fs.existsSync(this.workflowStateFile)) {
            this.log('WORKFLOW', 'FAIL', 'Workflow state file not found');
            return false;
        }
        
        try {
            const stateContent = fs.readFileSync(this.workflowStateFile, 'utf8');
            const workflowState = JSON.parse(stateContent);
            
            // Validate required fields
            const requiredFields = ['currentPhase', 'activeAgent', 'status', 'sharedContext'];
            let stateValid = true;
            
            requiredFields.forEach(field => {
                if (workflowState.hasOwnProperty(field)) {
                    this.log('WORKFLOW', 'PASS', `Field present: ${field}`, workflowState[field]);
                } else {
                    this.log('WORKFLOW', 'FAIL', `Missing required field: ${field}`);
                    stateValid = false;
                }
            });
            
            // Validate phase values
            const validPhases = ['initialization', 'planning', 'planning-complete', 'development', 'development-complete', 'production'];
            if (workflowState.currentPhase && !validPhases.includes(workflowState.currentPhase)) {
                this.log('WORKFLOW', 'WARN', `Unknown phase: ${workflowState.currentPhase}`, `Valid: ${validPhases.join(', ')}`);
            }
            
            // Validate agent values
            const validAgents = ['analyst', 'pm', 'architect', 'po', 'sm', 'dev', 'qa', 'ux-expert', 'bmad-orchestrator', 'bmad-master'];
            if (workflowState.activeAgent && workflowState.activeAgent !== 'none' && !validAgents.includes(workflowState.activeAgent)) {
                this.log('WORKFLOW', 'WARN', `Unknown agent: ${workflowState.activeAgent}`, `Valid: ${validAgents.join(', ')}`);
            }
            
            // Validate shared context
            if (workflowState.sharedContext) {
                if (workflowState.sharedContext.artifacts && Array.isArray(workflowState.sharedContext.artifacts)) {
                    this.log('WORKFLOW', 'PASS', `Artifacts tracked: ${workflowState.sharedContext.artifacts.length}`);
                } else {
                    this.log('WORKFLOW', 'WARN', 'No artifacts array in shared context');
                }
            }
            
            return stateValid;
            
        } catch (error) {
            this.log('WORKFLOW', 'FAIL', 'Invalid workflow state JSON', error.message);
            return false;
        }
    }
    
    validateAgentArtifacts() {
        console.log('\n📄 Validating Agent Artifacts...');
        
        let workflowState;
        try {
            workflowState = JSON.parse(fs.readFileSync(this.workflowStateFile, 'utf8'));
        } catch (error) {
            this.log('ARTIFACTS', 'FAIL', 'Cannot read workflow state for validation');
            return false;
        }
        
        const phaseArtifacts = {
            'planning': [
                'docs/project-brief.md',
                'docs/requirements.md',
                'docs/prd.md',
                'docs/technical-design.md',
                'tasks/epics.md'
            ],
            'development': [
                'src/',
                'tests/',
                'qa-reports/'
            ]
        };
        
        let artifactsValid = true;
        const currentPhase = workflowState.currentPhase;
        
        if (phaseArtifacts[currentPhase] || phaseArtifacts[currentPhase.replace('-complete', '')]) {
            const expectedArtifacts = phaseArtifacts[currentPhase] || phaseArtifacts[currentPhase.replace('-complete', '')];
            
            expectedArtifacts.forEach(artifact => {
                if (fs.existsSync(artifact)) {
                    this.log('ARTIFACTS', 'PASS', `Artifact exists: ${artifact}`);
                } else {
                    this.log('ARTIFACTS', 'WARN', `Expected artifact missing: ${artifact}`, 'May be created later in phase');
                }
            });
        }
        
        // Validate tracked artifacts exist
        if (workflowState.sharedContext && workflowState.sharedContext.artifacts) {
            workflowState.sharedContext.artifacts.forEach(artifact => {
                if (fs.existsSync(artifact)) {
                    this.log('ARTIFACTS', 'PASS', `Tracked artifact exists: ${artifact}`);
                } else {
                    this.log('ARTIFACTS', 'FAIL', `Tracked artifact missing: ${artifact}`);
                    artifactsValid = false;
                }
            });
        }
        
        return artifactsValid;
    }
    
    validateLogFiles() {
        console.log('\n📋 Validating Log Files...');
        
        const logFiles = {
            'logs/workflow-progress.log': 'Workflow state changes',
            'logs/agent-interactions.log': 'Agent handoffs and communication',
            '.claude/agent-activity.log': 'Claude Code agent activity',
            'logs/development.log': 'Development activity'
        };
        
        let logsValid = true;
        
        Object.entries(logFiles).forEach(([logFile, description]) => {
            if (fs.existsSync(logFile)) {
                const stats = fs.statSync(logFile);
                const size = stats.size;
                
                if (size > 0) {
                    this.log('LOGS', 'PASS', `${description}: ${size} bytes`, logFile);
                } else {
                    this.log('LOGS', 'WARN', `${description}: Empty file`, logFile);
                }
                
                // Validate log format
                try {
                    const content = fs.readFileSync(logFile, 'utf8');
                    const lines = content.split('\n').filter(line => line.trim());
                    
                    if (lines.length > 0) {
                        const recentLines = lines.slice(-5);
                        let formatValid = true;
                        
                        recentLines.forEach(line => {
                            // Check if line has timestamp format [YYYY-MM-DD HH:MM:SS]
                            if (!line.match(/^\[?\d{4}-\d{2}-\d{2}[\s\[\]T]\d{2}:\d{2}:\d{2}/)) {
                                formatValid = false;
                            }
                        });
                        
                        if (formatValid) {
                            this.log('LOGS', 'PASS', `${description}: Format valid`);
                        } else {
                            this.log('LOGS', 'WARN', `${description}: Some entries missing timestamps`);
                        }
                    }
                } catch (error) {
                    this.log('LOGS', 'WARN', `${description}: Cannot validate format`, error.message);
                }
            } else {
                this.log('LOGS', 'WARN', `${description}: File not found`, logFile);
            }
        });
        
        return logsValid;
    }
    
    validateAgentCommands() {
        console.log('\n🤖 Validating BMAD Agent Commands...');
        
        const bmadCommandsDir = path.join(this.claudeDir, 'commands', 'BMad');
        
        if (!fs.existsSync(bmadCommandsDir)) {
            this.log('AGENTS', 'FAIL', 'BMAD commands directory not found', bmadCommandsDir);
            return false;
        }
        
        const expectedAgents = [
            'analyst.md',
            'pm.md', 
            'architect.md',
            'po.md',
            'dev.md',
            'sm.md',
            'qa.md',
            'ux-expert.md',
            'bmad-orchestrator.md',
            'bmad-master.md'
        ];
        
        let agentsValid = true;
        
        expectedAgents.forEach(agent => {
            const agentPath = path.join(bmadCommandsDir, agent);
            if (fs.existsSync(agentPath)) {
                const stats = fs.statSync(agentPath);
                this.log('AGENTS', 'PASS', `Agent command exists: ${agent}`, `${stats.size} bytes`);
            } else {
                this.log('AGENTS', 'WARN', `Agent command missing: ${agent}`, 'May affect agent functionality');
            }
        });
        
        return agentsValid;
    }
    
    validateHookIntegration() {
        console.log('\n🪝 Validating Hook Integration...');
        
        const hookFiles = [
            'hooks.json',
            'intelligent-hooks.json',
            'conditional-hooks.json',
            'integration-hooks.json'
        ];
        
        let hooksValid = true;
        
        hookFiles.forEach(hookFile => {
            const hookPath = path.join(this.claudeDir, hookFile);
            if (fs.existsSync(hookPath)) {
                try {
                    const hookContent = JSON.parse(fs.readFileSync(hookPath, 'utf8'));
                    if (hookContent.hooks && typeof hookContent.hooks === 'object') {
                        const eventTypes = Object.keys(hookContent.hooks);
                        this.log('HOOKS', 'PASS', `${hookFile}: Valid structure`, `Events: ${eventTypes.join(', ')}`);
                    } else {
                        this.log('HOOKS', 'FAIL', `${hookFile}: Invalid structure`);
                        hooksValid = false;
                    }
                } catch (error) {
                    this.log('HOOKS', 'FAIL', `${hookFile}: JSON parse error`, error.message);
                    hooksValid = false;
                }
            } else {
                this.log('HOOKS', 'WARN', `Hook file not found: ${hookFile}`);
            }
        });
        
        // Check for safety system
        const safetySystemPath = path.join(this.claudeDir, 'safety-system.js');
        if (fs.existsSync(safetySystemPath)) {
            this.log('HOOKS', 'PASS', 'Safety system installed');
        } else {
            this.log('HOOKS', 'WARN', 'Safety system not found');
        }
        
        return hooksValid;
    }
    
    validateWorkflowTemplates() {
        console.log('\n📋 Validating Workflow Templates...');
        
        const templateDir = 'templates/bmad-workflows';
        const expectedTemplates = [
            'planning-phase-template.md',
            'development-phase-template.md'
        ];
        
        let templatesValid = true;
        
        if (!fs.existsSync(templateDir)) {
            this.log('TEMPLATES', 'FAIL', 'Workflow templates directory not found');
            return false;
        }
        
        expectedTemplates.forEach(template => {
            const templatePath = path.join(templateDir, template);
            if (fs.existsSync(templatePath)) {
                const stats = fs.statSync(templatePath);
                this.log('TEMPLATES', 'PASS', `Template exists: ${template}`, `${stats.size} bytes`);
            } else {
                this.log('TEMPLATES', 'FAIL', `Template missing: ${template}`);
                templatesValid = false;
            }
        });
        
        return templatesValid;
    }
    
    generateReport() {
        console.log('\n📊 Validation Summary Report');
        console.log('=' .repeat(60));
        
        const categories = {};
        this.validationResults.forEach(result => {
            if (!categories[result.category]) {
                categories[result.category] = { PASS: 0, FAIL: 0, WARN: 0 };
            }
            categories[result.category][result.status]++;
        });
        
        const totalResults = this.validationResults.length;
        const passCount = this.validationResults.filter(r => r.status === 'PASS').length;
        const failCount = this.validationResults.filter(r => r.status === 'FAIL').length;
        const warnCount = this.validationResults.filter(r => r.status === 'WARN').length;
        
        console.log(`Total Validations: ${totalResults}`);
        console.log(`Passed: ${passCount} ✅`);
        console.log(`Failed: ${failCount} ❌`);
        console.log(`Warnings: ${warnCount} ⚠️`);
        console.log(`Success Rate: ${((passCount / totalResults) * 100).toFixed(1)}%`);
        
        console.log('\n📋 By Category:');
        Object.entries(categories).forEach(([category, counts]) => {
            const total = counts.PASS + counts.FAIL + counts.WARN;
            const successRate = ((counts.PASS / total) * 100).toFixed(1);
            console.log(`  ${category}: ${counts.PASS}✅ ${counts.FAIL}❌ ${counts.WARN}⚠️  (${successRate}%)`);
        });
        
        // Overall assessment
        if (failCount === 0) {
            console.log('\n🎉 Workflow validation passed! BMAD system is operational.');
            return true;
        } else {
            console.log('\n⚠️  Some validations failed. Review issues above.');
            return false;
        }
    }
    
    runAllValidations() {
        console.log('🚀 Starting BMAD Workflow Validation');
        console.log('=' .repeat(60));
        
        const validations = [
            () => this.validateWorkspaceStructure(),
            () => this.validateWorkflowState(),
            () => this.validateAgentArtifacts(),
            () => this.validateLogFiles(),
            () => this.validateAgentCommands(),
            () => this.validateHookIntegration(),
            () => this.validateWorkflowTemplates()
        ];
        
        let allPassed = true;
        validations.forEach(validation => {
            if (!validation()) {
                allPassed = false;
            }
        });
        
        return this.generateReport();
    }
    
    fixCommonIssues() {
        console.log('\n🔧 Auto-fixing common issues...');
        
        // Create missing directories
        const dirs = ['.bmad-core', '.bmad-core/backups', 'logs', 'docs', 'tasks'];
        dirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log(`✅ Created directory: ${dir}`);
            }
        });
        
        // Initialize workflow state if missing
        if (!fs.existsSync(this.workflowStateFile)) {
            const initialState = {
                currentPhase: "initialization",
                activeAgent: "none",
                status: "ready",
                sharedContext: {
                    artifacts: [],
                    workspace: process.cwd()
                },
                createdAt: new Date().toISOString()
            };
            
            fs.writeFileSync(this.workflowStateFile, JSON.stringify(initialState, null, 2));
            console.log('✅ Initialized workflow state file');
        }
        
        // Create empty log files if missing
        const logFiles = [
            'logs/workflow-progress.log',
            'logs/agent-interactions.log', 
            'logs/development.log',
            '.claude/agent-activity.log'
        ];
        
        logFiles.forEach(logFile => {
            const dir = path.dirname(logFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            if (!fs.existsSync(logFile)) {
                fs.writeFileSync(logFile, `# ${path.basename(logFile)} - Created ${new Date().toISOString()}\n`);
                console.log(`✅ Created log file: ${logFile}`);
            }
        });
    }
}

// CLI interface
if (require.main === module) {
    const validator = new BMadWorkflowValidator();
    const command = process.argv[2];
    
    switch (command) {
        case 'fix':
            validator.fixCommonIssues();
            break;
            
        case 'validate':
        default:
            const success = validator.runAllValidations();
            process.exit(success ? 0 : 1);
    }
}

module.exports = BMadWorkflowValidator;
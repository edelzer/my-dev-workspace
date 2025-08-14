#!/usr/bin/env node

/**
 * Debug Workflow Integration System
 * Integrates advanced debugging tools with Claude Code agents, BMAD workflows, and existing tools
 * Provides seamless debugging across the entire development ecosystem
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const AdvancedDebuggingTools = require('./advanced-debugging');
const MultiAgentLogger = require('./multi-agent-logger');
const BMADPerformanceTracker = require('../scripts/bmad-performance-tracker');

class DebugWorkflowIntegration {
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.integrationDir = path.join(projectRoot, '.bmad-workspace', 'debug-integration');
        this.hooksDir = path.join(this.integrationDir, 'hooks');
        this.configDir = path.join(this.integrationDir, 'config');
        
        this.ensureDirectories();
        this.initializeIntegration();
    }

    ensureDirectories() {
        [this.integrationDir, this.hooksDir, this.configDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    initializeIntegration() {
        // Initialize debugging components
        this.debugger = new AdvancedDebuggingTools(this.projectRoot);
        this.logger = new MultiAgentLogger(this.projectRoot);
        this.performanceTracker = new BMADPerformanceTracker(this.projectRoot);
        
        // Load integration configuration
        this.config = this.loadIntegrationConfig();
        
        // Set up agent hooks and monitoring
        this.setupAgentHooks();
        this.setupWorkflowIntegration();
        this.setupClaudeCodeIntegration();
        
        // Start monitoring services
        this.startMonitoringServices();
        
        this.logger.logInfo('integration', 'Debug Workflow Integration initialized', {
            projectRoot: this.projectRoot,
            config: this.config
        });
    }

    loadIntegrationConfig() {
        const configFile = path.join(this.configDir, 'debug-integration.json');
        
        const defaultConfig = {
            enabled: true,
            autoProfileLongOperations: true,
            autoTraceAgentWorkflows: true,
            profileThresholdMs: 5000,
            logLevel: 'info',
            enabledModules: {
                profiling: true,
                tracing: true,
                logging: true,
                analytics: true,
                agentMonitoring: true,
                workflowTracking: true
            },
            agentIntegration: {
                autoInstrument: true,
                trackPerformance: true,
                traceHandoffs: true,
                logCommunication: true
            },
            claudeCodeIntegration: {
                hookIntoCommands: true,
                trackToolUsage: true,
                profileOperations: true,
                captureContext: true
            },
            bmadIntegration: {
                trackWorkflows: true,
                monitorAgentPerformance: true,
                analyzeBottlenecks: true,
                generateReports: true
            }
        };

        if (fs.existsSync(configFile)) {
            try {
                const userConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'));
                return { ...defaultConfig, ...userConfig };
            } catch (error) {
                this.logger.logWarn('integration', 'Failed to load config, using defaults', { error: error.message });
                return defaultConfig;
            }
        }

        // Save default config
        fs.writeFileSync(configFile, JSON.stringify(defaultConfig, null, 2));
        return defaultConfig;
    }

    // Agent Integration Hooks
    setupAgentHooks() {
        if (!this.config.agentIntegration.autoInstrument) return;

        // Create agent hook script
        const agentHookScript = this.createAgentHookScript();
        fs.writeFileSync(path.join(this.hooksDir, 'agent-hooks.js'), agentHookScript);

        // Set up monitoring for different agent types
        this.setupClaudeAgentHooks();
        this.setupBMADAgentHooks();
    }

    createAgentHookScript() {
        return `
// Agent Debug Integration Hooks
const { MultiAgentLogger } = require('${path.resolve(__dirname, 'multi-agent-logger.js')}');
const logger = new MultiAgentLogger();

class AgentDebugHooks {
    static instrumentAgent(agentName, agentInstance) {
        const originalMethods = {};
        
        // Hook into common agent methods
        ['execute', 'run', 'process', 'handle'].forEach(methodName => {
            if (typeof agentInstance[methodName] === 'function') {
                originalMethods[methodName] = agentInstance[methodName];
                
                agentInstance[methodName] = async function(...args) {
                    const traceId = logger.startTrace(null, \`\${agentName}:\${methodName}\`, { agentName, args });
                    const spanId = logger.addSpan(traceId, methodName, agentName);
                    const startTime = Date.now();
                    
                    try {
                        logger.logAgentAction(agentName, methodName, { args });
                        const result = await originalMethods[methodName].apply(this, args);
                        
                        const duration = Date.now() - startTime;
                        logger.endSpan(traceId, spanId, { success: true, duration });
                        logger.endTrace(traceId, { success: true, result });
                        
                        return result;
                    } catch (error) {
                        const duration = Date.now() - startTime;
                        logger.logError(agentName, \`Error in \${methodName}\`, { error: error.message }, error);
                        logger.endSpan(traceId, spanId, { success: false, error: error.message, duration });
                        logger.endTrace(traceId, { success: false, error: error.message });
                        throw error;
                    }
                };
            }
        });
        
        return agentInstance;
    }
    
    static logCommunication(fromAgent, toAgent, message, context = {}) {
        logger.logAgentCommunication(fromAgent, toAgent, message.type || 'message', message, context);
    }
    
    static logHandoff(fromAgent, toAgent, taskData, context = {}) {
        return logger.logAgentHandoff(fromAgent, toAgent, taskData, context);
    }
}

module.exports = AgentDebugHooks;
`;
    }

    setupClaudeAgentHooks() {
        // Check for Claude Code agent configurations
        const claudeAgentsDir = path.join(this.projectRoot, '.claude', 'agents');
        if (fs.existsSync(claudeAgentsDir)) {
            this.logger.logInfo('integration', 'Setting up Claude Code agent monitoring');
            this.monitorClaudeAgents();
        }
    }

    setupBMADAgentHooks() {
        // Check for BMAD agent configurations
        const bmadWorkspaceDir = path.join(this.projectRoot, '.bmad-workspace');
        if (fs.existsSync(bmadWorkspaceDir)) {
            this.logger.logInfo('integration', 'Setting up BMAD agent monitoring');
            this.monitorBMADAgents();
        }
    }

    monitorClaudeAgents() {
        const agentFiles = [
            'spec-analyst.md', 'spec-architect.md', 'spec-planner.md',
            'frontend-developer.md', 'backend-developer.md', 'spec-developer.md',
            'spec-tester.md', 'spec-reviewer.md', 'spec-validator.md',
            'security-specialist.md', 'project-manager.md'
        ];

        agentFiles.forEach(agentFile => {
            const agentPath = path.join(this.projectRoot, '.claude', 'agents', agentFile);
            if (fs.existsSync(agentPath)) {
                const agentName = agentFile.replace('.md', '');
                this.setupAgentFileWatcher(agentName, agentPath);
            }
        });
    }

    monitorBMADAgents() {
        const bmadCommands = [
            'analyst', 'pm', 'architect', 'po', 'dev', 'ux-expert',
            'qa', 'sm', 'bmad-orchestrator', 'bmad-master'
        ];

        bmadCommands.forEach(command => {
            this.setupBMADCommandMonitoring(command);
        });
    }

    setupAgentFileWatcher(agentName, agentPath) {
        if (!this.config.agentIntegration.trackPerformance) return;

        fs.watchFile(agentPath, { interval: 1000 }, (curr, prev) => {
            if (curr.mtime !== prev.mtime) {
                this.logger.logAgentAction(agentName, 'configuration_updated', {
                    filePath: agentPath,
                    size: curr.size,
                    modified: curr.mtime
                });
            }
        });
    }

    setupBMADCommandMonitoring(command) {
        // This would integrate with the BMAD command system if available
        this.logger.logInfo('integration', `Monitoring BMAD command: ${command}`);
    }

    // Workflow Integration
    setupWorkflowIntegration() {
        if (!this.config.bmadIntegration.trackWorkflows) return;

        // Create workflow monitoring script
        const workflowScript = this.createWorkflowMonitoringScript();
        fs.writeFileSync(path.join(this.hooksDir, 'workflow-monitor.js'), workflowScript);

        // Monitor workflow files
        this.monitorWorkflowFiles();
    }

    createWorkflowMonitoringScript() {
        return `
// Workflow Debug Monitoring
const fs = require('fs');
const path = require('path');

class WorkflowMonitor {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.workflowsDir = path.join(projectRoot, '.bmad-workspace', 'workflows');
    }
    
    startMonitoring() {
        if (!fs.existsSync(this.workflowsDir)) return;
        
        fs.watch(this.workflowsDir, { recursive: true }, (eventType, filename) => {
            if (filename && filename.endsWith('.json')) {
                this.handleWorkflowChange(filename, eventType);
            }
        });
    }
    
    handleWorkflowChange(filename, eventType) {
        console.log(\`Workflow \${eventType}: \${filename}\`);
        // Additional workflow monitoring logic would go here
    }
}

module.exports = WorkflowMonitor;
`;
    }

    monitorWorkflowFiles() {
        const workflowDirs = [
            path.join(this.projectRoot, 'projects', 'project-tasks'),
            path.join(this.projectRoot, '.bmad-workspace', 'workflows'),
            path.join(this.projectRoot, 'templates', 'bmad-workflows')
        ];

        workflowDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.setupWorkflowDirectoryMonitoring(dir);
            }
        });
    }

    setupWorkflowDirectoryMonitoring(directory) {
        fs.watch(directory, { recursive: true }, (eventType, filename) => {
            if (filename && (filename.endsWith('.md') || filename.endsWith('.json'))) {
                this.logger.logWorkflowEvent(eventType, filename, { directory });
            }
        });
    }

    // Claude Code Integration
    setupClaudeCodeIntegration() {
        if (!this.config.claudeCodeIntegration.hookIntoCommands) return;

        // Create Claude Code hook integration
        this.createClaudeCodeHooks();
        this.monitorClaudeCodeActivity();
    }

    createClaudeCodeHooks() {
        const hookConfig = {
            "pre-tool-use": {
                "script": path.join(this.hooksDir, 'pre-tool-hook.js'),
                "enabled": true
            },
            "post-tool-use": {
                "script": path.join(this.hooksDir, 'post-tool-hook.js'),
                "enabled": true
            },
            "session-start": {
                "script": path.join(this.hooksDir, 'session-start-hook.js'),
                "enabled": true
            }
        };

        // Write hook scripts
        this.writeHookScript('pre-tool-hook.js', this.createPreToolHook());
        this.writeHookScript('post-tool-hook.js', this.createPostToolHook());
        this.writeHookScript('session-start-hook.js', this.createSessionStartHook());

        // Update Claude Code hooks configuration
        const claudeHooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        if (fs.existsSync(claudeHooksPath)) {
            try {
                const existingHooks = JSON.parse(fs.readFileSync(claudeHooksPath, 'utf8'));
                const mergedHooks = { ...existingHooks, ...hookConfig };
                fs.writeFileSync(claudeHooksPath, JSON.stringify(mergedHooks, null, 2));
                this.logger.logInfo('integration', 'Updated Claude Code hooks configuration');
            } catch (error) {
                this.logger.logWarn('integration', 'Failed to update Claude Code hooks', { error: error.message });
            }
        }
    }

    writeHookScript(filename, content) {
        fs.writeFileSync(path.join(this.hooksDir, filename), content);
    }

    createPreToolHook() {
        return `#!/usr/bin/env node
// Pre-tool execution hook for debugging integration

const { MultiAgentLogger } = require('${path.resolve(__dirname, 'multi-agent-logger.js')}');
const { AdvancedDebuggingTools } = require('${path.resolve(__dirname, 'advanced-debugging.js')}');

const logger = new MultiAgentLogger();
const debugger = new AdvancedDebuggingTools();

// Get tool information from environment or command line
const toolName = process.env.CLAUDE_TOOL_NAME || process.argv[2] || 'unknown';
const toolArgs = process.env.CLAUDE_TOOL_ARGS || process.argv.slice(3).join(' ') || '{}';

// Start profiling for potentially long operations
const shouldProfile = ['Task', 'Bash', 'Read', 'Write', 'Grep', 'Glob'].includes(toolName);
let profileId = null;

if (shouldProfile) {
    profileId = debugger.startProfiling(\`claude-tool-\${toolName}\`, {
        includeMemory: true,
        includeCpu: true,
        sampleInterval: 100
    });
}

// Start trace for the tool operation
const traceId = logger.startTrace(null, \`claude-tool-\${toolName}\`, {
    toolName,
    toolArgs: JSON.parse(toolArgs || '{}'),
    sessionInfo: {
        pid: process.pid,
        timestamp: new Date().toISOString()
    }
});

// Save IDs for post-hook
process.env.DEBUG_PROFILE_ID = profileId || '';
process.env.DEBUG_TRACE_ID = traceId || '';

logger.logInfo('claude-tool', \`Starting tool: \${toolName}\`, {
    toolName,
    toolArgs,
    profileId,
    traceId
});

console.log(\`Debug integration: Monitoring \${toolName} execution\`);
`;
    }

    createPostToolHook() {
        return `#!/usr/bin/env node
// Post-tool execution hook for debugging integration

const { MultiAgentLogger } = require('${path.resolve(__dirname, 'multi-agent-logger.js')}');
const { AdvancedDebuggingTools } = require('${path.resolve(__dirname, 'advanced-debugging.js')}');

const logger = new MultiAgentLogger();
const debugger = new AdvancedDebuggingTools();

// Get tool information and debug IDs
const toolName = process.env.CLAUDE_TOOL_NAME || process.argv[2] || 'unknown';
const profileId = process.env.DEBUG_PROFILE_ID;
const traceId = process.env.DEBUG_TRACE_ID;
const exitCode = process.env.CLAUDE_TOOL_EXIT_CODE || '0';
const executionTime = process.env.CLAUDE_TOOL_EXECUTION_TIME || '0';

// Stop profiling if it was started
if (profileId) {
    const profile = debugger.stopProfiling(profileId);
    if (profile) {
        logger.logInfo('claude-tool', \`Tool profiling completed: \${toolName}\`, {
            toolName,
            profileId,
            duration: profile.duration,
            performanceScore: profile.analysis.summary.performanceScore
        });
    }
}

// End trace
if (traceId) {
    const trace = logger.endTrace(traceId, {
        exitCode: parseInt(exitCode),
        executionTime: parseInt(executionTime),
        success: exitCode === '0'
    });
    
    if (trace) {
        logger.logInfo('claude-tool', \`Tool trace completed: \${toolName}\`, {
            toolName,
            traceId,
            duration: trace.duration,
            success: trace.result.success
        });
    }
}

logger.logInfo('claude-tool', \`Completed tool: \${toolName}\`, {
    toolName,
    exitCode,
    executionTime,
    success: exitCode === '0'
});

// Clean up environment variables
delete process.env.DEBUG_PROFILE_ID;
delete process.env.DEBUG_TRACE_ID;

console.log(\`Debug integration: Completed monitoring \${toolName}\`);
`;
    }

    createSessionStartHook() {
        return `#!/usr/bin/env node
// Session start hook for debugging integration

const { MultiAgentLogger } = require('${path.resolve(__dirname, 'multi-agent-logger.js')}');

const logger = new MultiAgentLogger();

logger.logInfo('claude-session', 'Claude Code session started', {
    sessionStart: new Date().toISOString(),
    pid: process.pid,
    cwd: process.cwd(),
    nodeVersion: process.version,
    platform: process.platform
});

console.log('Debug integration: Claude Code session monitoring active');
`;
    }

    monitorClaudeCodeActivity() {
        // Monitor Claude Code log files if they exist
        const claudeLogsDir = path.join(this.projectRoot, 'logs');
        if (fs.existsSync(claudeLogsDir)) {
            this.setupClaudeLogMonitoring(claudeLogsDir);
        }
    }

    setupClaudeLogMonitoring(logsDir) {
        fs.watch(logsDir, (eventType, filename) => {
            if (filename && filename.endsWith('.log')) {
                this.logger.logInfo('claude-activity', `Log file ${eventType}: ${filename}`, {
                    logsDir,
                    filename,
                    eventType
                });
            }
        });
    }

    // Monitoring Services
    startMonitoringServices() {
        if (!this.config.enabled) return;

        // Start periodic system monitoring
        this.startSystemMonitoring();
        
        // Start performance analytics
        this.startPerformanceAnalytics();
        
        // Start integration health checks
        this.startHealthChecks();
    }

    startSystemMonitoring() {
        setInterval(() => {
            const systemStatus = this.debugger.getSystemStatus();
            this.logger.logDebug('system-monitor', 'System status update', systemStatus);
            
            // Check for performance issues
            if (systemStatus.memory.heapUsed > 500 * 1024 * 1024) { // 500MB
                this.logger.logWarn('system-monitor', 'High memory usage detected', {
                    heapUsed: systemStatus.memory.heapUsed,
                    threshold: 500 * 1024 * 1024
                });
            }
        }, 30000); // Every 30 seconds
    }

    startPerformanceAnalytics() {
        setInterval(() => {
            const analytics = this.debugger.generateAnalytics();
            
            if (analytics.recommendations.length > 0) {
                this.logger.logInfo('performance-analytics', 'New performance recommendations', {
                    recommendationCount: analytics.recommendations.length,
                    recommendations: analytics.recommendations
                });
            }
        }, 60000); // Every minute
    }

    startHealthChecks() {
        setInterval(() => {
            this.performHealthCheck();
        }, 120000); // Every 2 minutes
    }

    performHealthCheck() {
        const health = {
            timestamp: new Date().toISOString(),
            services: {
                debugger: this.debugger ? 'active' : 'inactive',
                logger: this.logger ? 'active' : 'inactive',
                performanceTracker: this.performanceTracker ? 'active' : 'inactive'
            },
            integration: {
                agentHooks: fs.existsSync(path.join(this.hooksDir, 'agent-hooks.js')),
                workflowMonitoring: fs.existsSync(path.join(this.hooksDir, 'workflow-monitor.js')),
                claudeCodeIntegration: fs.existsSync(path.join(this.hooksDir, 'pre-tool-hook.js'))
            }
        };

        this.logger.logDebug('health-check', 'Integration health check', health);
    }

    // Analytics and Reporting
    generateIntegrationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            config: this.config,
            debugging: this.debugger.generateAnalytics(),
            performance: this.performanceTracker.generateDashboard(),
            integration: {
                activeHooks: this.getActiveHooks(),
                monitoredAgents: this.getMonitoredAgents(),
                workflowTracking: this.getWorkflowTrackingStatus()
            },
            recommendations: this.generateIntegrationRecommendations()
        };

        // Save report
        const reportFile = path.join(this.integrationDir, `integration-report-${Date.now()}.json`);
        fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

        return report;
    }

    getActiveHooks() {
        const hooksDir = this.hooksDir;
        if (!fs.existsSync(hooksDir)) return [];
        
        return fs.readdirSync(hooksDir)
            .filter(file => file.endsWith('.js'))
            .map(file => file.replace('.js', ''));
    }

    getMonitoredAgents() {
        // Return list of agents currently being monitored
        return Array.from(this.logger.agentStates.keys());
    }

    getWorkflowTrackingStatus() {
        return {
            enabled: this.config.bmadIntegration.trackWorkflows,
            activeWorkflows: this.performanceTracker.metrics?.workflows ? 
                Object.keys(this.performanceTracker.metrics.workflows).length : 0
        };
    }

    generateIntegrationRecommendations() {
        const recommendations = [];

        // Check configuration
        if (!this.config.agentIntegration.autoInstrument) {
            recommendations.push({
                type: 'configuration',
                priority: 'medium',
                message: 'Agent auto-instrumentation is disabled. Enable for better monitoring.'
            });
        }

        // Check hook installation
        const claudeHooksPath = path.join(this.projectRoot, '.claude', 'hooks.json');
        if (!fs.existsSync(claudeHooksPath)) {
            recommendations.push({
                type: 'integration',
                priority: 'high',
                message: 'Claude Code hooks not found. Run setup to install debugging hooks.'
            });
        }

        return recommendations;
    }

    // CLI Interface
    static async runCLI() {
        const args = process.argv.slice(2);
        const command = args[0];
        
        const integration = new DebugWorkflowIntegration();

        switch (command) {
            case 'setup':
                console.log('Setting up debug workflow integration...');
                integration.setupAgentHooks();
                integration.setupWorkflowIntegration();
                integration.setupClaudeCodeIntegration();
                console.log('Debug integration setup completed!');
                console.log('Integration directory:', integration.integrationDir);
                break;

            case 'status':
                const health = integration.performHealthCheck();
                console.log('Debug Integration Status:');
                console.log('Services:', health.services);
                console.log('Integration:', health.integration);
                break;

            case 'report':
                const report = integration.generateIntegrationReport();
                console.log('Integration Report Generated:');
                console.log('Config enabled:', report.config.enabled);
                console.log('Active hooks:', report.integration.activeHooks.length);
                console.log('Monitored agents:', report.integration.monitoredAgents.length);
                console.log('Recommendations:', report.recommendations.length);
                break;

            case 'test':
                console.log('Testing debug integration...');
                integration.logger.logInfo('test', 'Testing integration');
                const profileId = integration.debugger.startProfiling('test-profile');
                setTimeout(() => {
                    integration.debugger.stopProfiling(profileId);
                    console.log('Integration test completed successfully!');
                }, 1000);
                break;

            default:
                console.log(`
Debug Workflow Integration

Usage:
  node debug-workflow-integration.js <command>

Commands:
  setup     Set up debug workflow integration
  status    Show integration status
  report    Generate integration report
  test      Test integration functionality

Examples:
  node debug-workflow-integration.js setup
  node debug-workflow-integration.js status
                `);
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    DebugWorkflowIntegration.runCLI();
}

module.exports = DebugWorkflowIntegration;
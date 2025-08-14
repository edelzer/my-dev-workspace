/**
 * Performance Monitoring Hooks for Claude Code Integration
 * Integrates with existing hook system to add performance tracking
 */

const PerformanceMonitor = require('./performance-monitor');
const path = require('path');
const fs = require('fs').promises;

class PerformanceHooks {
    constructor() {
        this.monitor = new PerformanceMonitor();
        this.activeOperations = new Map();
        this.hookMetrics = {
            preToolUse: { count: 0, totalTime: 0 },
            postToolUse: { count: 0, totalTime: 0 },
            qualityGates: { passed: 0, failed: 0 },
            workflowTriggers: { triggered: 0, successful: 0 }
        };
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Performance Hooks...');
        await this.setupHookIntegration();
    }

    async setupHookIntegration() {
        // Load existing hooks configuration
        const hooksPath = path.join(__dirname, '../../.claude/hooks.json');
        try {
            const hooksContent = await fs.readFile(hooksPath, 'utf8');
            const hooks = JSON.parse(hooksContent);
            
            // Add performance monitoring hooks
            this.addPerformanceHooks(hooks);
            
            // Save updated hooks
            await fs.writeFile(hooksPath, JSON.stringify(hooks, null, 2));
            console.log('✅ Performance hooks integrated successfully');
        } catch (error) {
            console.error('❌ Failed to integrate performance hooks:', error);
        }
    }

    addPerformanceHooks(hooks) {
        // Add PreToolUse performance tracking
        if (!hooks.hooks.PreToolUse) hooks.hooks.PreToolUse = [];
        
        hooks.hooks.PreToolUse.unshift({
            matcher: ".*",
            hooks: [{
                type: "command",
                command: `node "${path.join(__dirname, 'track-operation.js')}" start "$CLAUDE_TOOL" "$CLAUDE_TARGET_FILE"`,
                description: "Start performance tracking for operation"
            }]
        });

        // Add PostToolUse performance tracking
        if (!hooks.hooks.PostToolUse) hooks.hooks.PostToolUse = [];
        
        hooks.hooks.PostToolUse.push({
            matcher: ".*",
            hooks: [{
                type: "command", 
                command: `node "${path.join(__dirname, 'track-operation.js')}" end "$CLAUDE_TOOL" "$CLAUDE_TARGET_FILE" "$CLAUDE_EXIT_CODE"`,
                description: "End performance tracking for operation"
            }]
        });

        // Add performance monitoring to quality gates
        if (!hooks.hooks.PerformanceGates) hooks.hooks.PerformanceGates = [];
        
        hooks.hooks.PerformanceGates.push({
            matcher: ".*",
            hooks: [{
                type: "command",
                command: `node "${path.join(__dirname, 'check-performance.js')}" "$CLAUDE_TOOL"`,
                description: "Check performance thresholds"
            }]
        });

        // Add system resource monitoring trigger
        hooks.hooks.WorkflowTriggers.push({
            matcher: ".*",
            condition: "true", // Always run
            hooks: [{
                type: "command",
                command: `node "${path.join(__dirname, 'monitor-resources.js')}"`,
                description: "Monitor system resources during operations"
            }]
        });
    }

    // Hook integration methods
    startOperation(tool, targetFile) {
        const operationId = `${tool}-${Date.now()}`;
        const operation = {
            tool,
            targetFile,
            startTime: performance.now(),
            startTimestamp: Date.now()
        };
        
        this.activeOperations.set(operationId, operation);
        
        // Start Claude Code monitoring
        const monitoring = this.monitor.startClaudeCodeMonitoring();
        operation.monitoring = monitoring;
        
        return operationId;
    }

    endOperation(operationId, success = true, errorDetails = null) {
        const operation = this.activeOperations.get(operationId);
        if (!operation) return;

        const duration = performance.now() - operation.startTime;
        
        // End monitoring
        if (operation.monitoring) {
            operation.monitoring.end(operation.tool, success);
        }

        // Record additional metrics
        this.recordOperationMetrics(operation, duration, success, errorDetails);
        
        // Check for bottlenecks
        if (duration > 30000) { // 30 seconds threshold
            this.monitor.recordBottleneck('claude-operation', operation.tool, duration, {
                targetFile: operation.targetFile,
                success
            });
        }

        this.activeOperations.delete(operationId);
    }

    recordOperationMetrics(operation, duration, success, errorDetails) {
        // Record hook metrics
        this.hookMetrics.postToolUse.count++;
        this.hookMetrics.postToolUse.totalTime += duration;

        // Record agent performance if this is an agent operation
        if (this.isAgentOperation(operation.tool)) {
            const agentName = this.extractAgentName(operation.tool);
            this.monitor.recordAgentPerformance(agentName, operation.tool, duration, success);
        }

        // Record errors
        if (!success && errorDetails) {
            this.monitor.recordError('operation', `${operation.tool} failed`, {
                duration,
                targetFile: operation.targetFile,
                details: errorDetails
            });
        }
    }

    isAgentOperation(tool) {
        const agentTools = ['spec-analyst', 'spec-architect', 'spec-planner', 
                          'frontend-developer', 'backend-developer', 'spec-developer',
                          'spec-tester', 'spec-reviewer', 'spec-validator', 'security-specialist'];
        return agentTools.some(agent => tool.includes(agent));
    }

    extractAgentName(tool) {
        const agentTools = ['spec-analyst', 'spec-architect', 'spec-planner', 
                          'frontend-developer', 'backend-developer', 'spec-developer',
                          'spec-tester', 'spec-reviewer', 'spec-validator', 'security-specialist'];
        return agentTools.find(agent => tool.includes(agent)) || 'unknown';
    }

    // Agent handoff tracking
    recordAgentHandoff(fromAgent, toAgent, context) {
        const startTime = performance.now();
        
        return {
            complete: (success = true) => {
                const duration = performance.now() - startTime;
                this.monitor.recordAgentHandoff(fromAgent, toAgent, success, duration);
                
                if (!success) {
                    this.monitor.recordError('agent-handoff', 
                        `Handoff failed: ${fromAgent} → ${toAgent}`, { 
                            duration, 
                            context 
                        });
                }
            }
        };
    }

    // Workflow monitoring
    startWorkflowPhase(phase, agents) {
        const workflowId = `${phase}-${Date.now()}`;
        const workflow = {
            phase,
            agents,
            startTime: performance.now(),
            startTimestamp: Date.now(),
            tasks: []
        };
        
        this.activeOperations.set(workflowId, workflow);
        return workflowId;
    }

    endWorkflowPhase(workflowId, success = true, results = {}) {
        const workflow = this.activeOperations.get(workflowId);
        if (!workflow) return;

        const duration = performance.now() - workflow.startTime;
        
        // Record workflow metrics
        if (success) {
            this.monitor.metrics.workflow.success++;
        } else {
            this.monitor.metrics.workflow.failure++;
        }
        
        this.monitor.metrics.workflow.phaseDuration[workflow.phase] = duration;
        
        // Update average cycle time
        const totalPhases = this.monitor.metrics.workflow.success + this.monitor.metrics.workflow.failure;
        this.monitor.metrics.workflow.avgCycleTime = 
            (this.monitor.metrics.workflow.avgCycleTime * (totalPhases - 1) + duration) / totalPhases;

        this.activeOperations.delete(workflowId);
    }

    // Quality gate monitoring
    recordQualityGate(gate, passed, metrics = {}) {
        if (passed) {
            this.hookMetrics.qualityGates.passed++;
        } else {
            this.hookMetrics.qualityGates.failed++;
            this.monitor.recordError('quality-gate', `Quality gate failed: ${gate}`, metrics);
        }
    }

    // System resource alerts
    async checkSystemThresholds() {
        const insights = this.monitor.generateInsights();
        const system = insights.performance.system;
        
        // Check CPU threshold
        if (system.avgCpuUsage > 80) {
            await this.monitor.sendAlert('high', 
                `High CPU usage: ${system.avgCpuUsage.toFixed(1)}%`, 
                { cpuUsage: system.avgCpuUsage });
        }
        
        // Check memory threshold  
        if (system.avgMemoryUsage > 85) {
            await this.monitor.sendAlert('high',
                `High memory usage: ${system.avgMemoryUsage.toFixed(1)}%`,
                { memoryUsage: system.avgMemoryUsage });
        }
    }

    // Performance optimization triggers
    async checkOptimizationTriggers() {
        const insights = this.monitor.generateInsights();
        
        // Trigger optimization if performance degrades
        if (insights.performance.claudeCode.successRate < 85) {
            console.log('🔧 Triggering performance optimization...');
            await this.monitor.optimizePerformance();
        }
        
        // Check for excessive bottlenecks
        const recentBottlenecks = this.monitor.metrics.workflow.bottlenecks
            .filter(b => Date.now() - b.timestamp < 3600000); // Last hour
            
        if (recentBottlenecks.length > 5) {
            await this.monitor.sendAlert('medium',
                `Multiple bottlenecks detected: ${recentBottlenecks.length} in last hour`,
                { bottlenecks: recentBottlenecks.length });
        }
    }

    // Get current performance status
    async getPerformanceStatus() {
        const status = await this.monitor.getStatus();
        return {
            ...status,
            hookMetrics: this.hookMetrics,
            activeOperations: this.activeOperations.size
        };
    }

    // Export performance report
    async exportPerformanceReport() {
        const report = await this.monitor.generateReport();
        report.hookMetrics = this.hookMetrics;
        report.activeOperations = Array.from(this.activeOperations.values());
        
        return report;
    }

    // Cleanup and shutdown
    async shutdown() {
        console.log('🛑 Shutting down Performance Hooks...');
        
        // Complete any active operations
        for (const [id, operation] of this.activeOperations) {
            if (operation.monitoring) {
                operation.monitoring.end(operation.tool, false);
            }
        }
        
        await this.monitor.stop();
        console.log('✅ Performance Hooks shutdown complete');
    }
}

// Export singleton instance
const performanceHooks = new PerformanceHooks();

module.exports = performanceHooks;
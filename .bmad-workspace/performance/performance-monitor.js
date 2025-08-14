/**
 * Performance Monitor System for Development Environment
 * Phase 5.3 Implementation - Comprehensive monitoring and optimization
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { performance } = require('perf_hooks');

class PerformanceMonitor {
    constructor() {
        this.metricsPath = path.join(__dirname, '../metrics');
        this.dataPath = path.join(__dirname, 'data');
        this.startTime = performance.now();
        this.metrics = {
            claudeCode: {
                responseTime: [],
                toolUsage: {},
                errorRate: 0,
                sessionDuration: 0,
                commandSuccess: 0,
                commandFailure: 0
            },
            mcpServers: {
                filesystem: { status: 'unknown', responseTime: [], errorCount: 0 },
                github: { status: 'unknown', responseTime: [], errorCount: 0 },
                memory: { status: 'unknown', responseTime: [], errorCount: 0 },
                sequential: { status: 'unknown', responseTime: [], errorCount: 0 },
                context7: { status: 'unknown', responseTime: [], errorCount: 0 },
                magic: { status: 'unknown', responseTime: [], errorCount: 0 },
                playwright: { status: 'unknown', responseTime: [], errorCount: 0 },
                eslint: { status: 'unknown', responseTime: [], errorCount: 0 }
            },
            agents: {
                coordination: { handoffSuccess: 0, handoffFailure: 0, efficiency: 0 },
                performance: {},
                workload: {}
            },
            workflow: {
                bottlenecks: [],
                phaseDuration: {},
                success: 0,
                failure: 0,
                avgCycleTime: 0
            },
            system: {
                cpu: [],
                memory: [],
                disk: [],
                network: []
            },
            errors: {
                total: 0,
                by_category: {},
                recent: []
            }
        };
        this.alertRules = [];
        this.isMonitoring = false;
        
        this.init();
    }

    async init() {
        try {
            await this.ensureDirectories();
            await this.loadConfiguration();
            await this.setupSystemMonitoring();
            console.log('Performance Monitor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Performance Monitor:', error);
        }
    }

    async ensureDirectories() {
        const dirs = [this.metricsPath, this.dataPath, 
                     path.join(this.dataPath, 'daily'),
                     path.join(this.dataPath, 'hourly'),
                     path.join(this.dataPath, 'alerts')];
        
        for (const dir of dirs) {
            try {
                await fs.mkdir(dir, { recursive: true });
            } catch (error) {
                if (error.code !== 'EEXIST') throw error;
            }
        }
    }

    async loadConfiguration() {
        try {
            const configPath = path.join(this.metricsPath, 'metrics-config.json');
            const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
            this.config = config;
            this.alertRules = config.alerting?.rules || [];
        } catch (error) {
            console.warn('Using default configuration:', error.message);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            trackingEnabled: true,
            updateInterval: 30000,
            retentionPeriod: { daily: 30, weekly: 12, monthly: 6 },
            thresholds: {
                agent: { successRate: { poor: 70 }, responseTime: { poor: 120000 } },
                workflow: { successRate: { poor: 85 } },
                system: { health: { attention: 65 } }
            },
            alerting: { enabled: true, channels: ['console', 'file'] }
        };
    }

    // Claude Code Performance Monitoring
    startClaudeCodeMonitoring() {
        const startTime = performance.now();
        return {
            end: (tool, success = true) => {
                const duration = performance.now() - startTime;
                this.recordClaudeCodeMetric(tool, duration, success);
            }
        };
    }

    recordClaudeCodeMetric(tool, duration, success) {
        this.metrics.claudeCode.responseTime.push({ 
            tool, 
            duration, 
            timestamp: Date.now(),
            success 
        });
        
        if (!this.metrics.claudeCode.toolUsage[tool]) {
            this.metrics.claudeCode.toolUsage[tool] = { count: 0, totalTime: 0 };
        }
        
        this.metrics.claudeCode.toolUsage[tool].count++;
        this.metrics.claudeCode.toolUsage[tool].totalTime += duration;
        
        if (success) {
            this.metrics.claudeCode.commandSuccess++;
        } else {
            this.metrics.claudeCode.commandFailure++;
            this.recordError('claude-code', `Tool ${tool} failed`, { duration });
        }

        // Analyze for bottlenecks
        if (duration > 30000) { // 30 seconds threshold
            this.recordBottleneck('claude-code', tool, duration);
        }
    }

    // MCP Server Performance Monitoring
    async checkMCPServerStatus() {
        const servers = Object.keys(this.metrics.mcpServers);
        
        for (const server of servers) {
            const startTime = performance.now();
            try {
                // Simulate MCP server health check (would be actual MCP calls in practice)
                const isHealthy = await this.pingMCPServer(server);
                const responseTime = performance.now() - startTime;
                
                this.metrics.mcpServers[server].status = isHealthy ? 'healthy' : 'degraded';
                this.metrics.mcpServers[server].responseTime.push({
                    time: responseTime,
                    timestamp: Date.now()
                });
                
                if (responseTime > 10000) { // 10 second threshold
                    this.recordBottleneck('mcp-server', server, responseTime);
                }
                
            } catch (error) {
                this.metrics.mcpServers[server].status = 'error';
                this.metrics.mcpServers[server].errorCount++;
                this.recordError('mcp-server', `Server ${server} error: ${error.message}`);
            }
        }
    }

    async pingMCPServer(serverName) {
        // Placeholder for actual MCP server health check
        // In real implementation, this would make actual MCP calls
        return Math.random() > 0.05; // 95% success rate simulation
    }

    // Agent Coordination Monitoring
    recordAgentHandoff(fromAgent, toAgent, success, duration) {
        if (success) {
            this.metrics.agents.coordination.handoffSuccess++;
        } else {
            this.metrics.agents.coordination.handoffFailure++;
            this.recordError('agent-coordination', 
                `Handoff failed: ${fromAgent} → ${toAgent}`, { duration });
        }

        const efficiency = success ? Math.max(0, 100 - (duration / 1000)) : 0;
        this.metrics.agents.coordination.efficiency = 
            (this.metrics.agents.coordination.efficiency + efficiency) / 2;
    }

    recordAgentPerformance(agentName, task, duration, success) {
        if (!this.metrics.agents.performance[agentName]) {
            this.metrics.agents.performance[agentName] = {
                tasks: [],
                avgDuration: 0,
                successRate: 100
            };
        }

        const agent = this.metrics.agents.performance[agentName];
        agent.tasks.push({ task, duration, success, timestamp: Date.now() });
        
        // Calculate rolling averages
        const recentTasks = agent.tasks.slice(-10);
        agent.avgDuration = recentTasks.reduce((sum, t) => sum + t.duration, 0) / recentTasks.length;
        agent.successRate = (recentTasks.filter(t => t.success).length / recentTasks.length) * 100;

        if (duration > this.config.thresholds.agent.responseTime.poor) {
            this.recordBottleneck('agent', agentName, duration, task);
        }
    }

    // Workflow Bottleneck Detection
    recordBottleneck(category, component, duration, details = {}) {
        const bottleneck = {
            category,
            component,
            duration,
            details,
            timestamp: Date.now(),
            severity: this.calculateBottleneckSeverity(duration)
        };
        
        this.metrics.workflow.bottlenecks.push(bottleneck);
        
        // Alert if severe
        if (bottleneck.severity === 'critical') {
            this.sendAlert('critical', 
                `Critical bottleneck detected in ${category}:${component}`, 
                bottleneck);
        }
    }

    calculateBottleneckSeverity(duration) {
        if (duration > 120000) return 'critical';      // 2+ minutes
        if (duration > 60000) return 'high';           // 1+ minute  
        if (duration > 30000) return 'medium';         // 30+ seconds
        return 'low';
    }

    // System Resource Monitoring
    async setupSystemMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;

        setInterval(async () => {
            await this.collectSystemMetrics();
        }, this.config.updateInterval || 30000);
    }

    async collectSystemMetrics() {
        const cpuUsage = os.loadavg()[0];
        const memoryUsage = (1 - (os.freemem() / os.totalmem())) * 100;
        
        this.metrics.system.cpu.push({ value: cpuUsage, timestamp: Date.now() });
        this.metrics.system.memory.push({ value: memoryUsage, timestamp: Date.now() });
        
        // Keep only recent data (last hour)
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.metrics.system.cpu = this.metrics.system.cpu.filter(m => m.timestamp > oneHourAgo);
        this.metrics.system.memory = this.metrics.system.memory.filter(m => m.timestamp > oneHourAgo);

        // Check thresholds
        if (cpuUsage > 80) {
            this.sendAlert('high', 'High CPU usage detected', { cpuUsage });
        }
        if (memoryUsage > 85) {
            this.sendAlert('high', 'High memory usage detected', { memoryUsage });
        }
    }

    // Error Tracking and Alerting
    recordError(category, message, details = {}) {
        const error = {
            category,
            message,
            details,
            timestamp: Date.now()
        };
        
        this.metrics.errors.total++;
        if (!this.metrics.errors.by_category[category]) {
            this.metrics.errors.by_category[category] = 0;
        }
        this.metrics.errors.by_category[category]++;
        
        this.metrics.errors.recent.push(error);
        
        // Keep only last 100 errors
        if (this.metrics.errors.recent.length > 100) {
            this.metrics.errors.recent = this.metrics.errors.recent.slice(-100);
        }
    }

    async sendAlert(severity, message, data = {}) {
        const alert = {
            severity,
            message,
            data,
            timestamp: Date.now()
        };
        
        if (this.config.alerting?.enabled) {
            console.warn(`🚨 ALERT [${severity.toUpperCase()}]: ${message}`);
            
            // Save to file
            const alertFile = path.join(this.dataPath, 'alerts', 
                `${new Date().toISOString().split('T')[0]}.json`);
            
            try {
                const alerts = await this.loadAlerts(alertFile);
                alerts.push(alert);
                await fs.writeFile(alertFile, JSON.stringify(alerts, null, 2));
            } catch (error) {
                console.error('Failed to save alert:', error);
            }
        }
    }

    async loadAlerts(alertFile) {
        try {
            const content = await fs.readFile(alertFile, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return [];
        }
    }

    // Analytics and Insights
    generateInsights() {
        const insights = {
            performance: this.analyzePerformance(),
            bottlenecks: this.analyzeBottlenecks(),
            trends: this.analyzeTrends(),
            recommendations: this.generateRecommendations()
        };
        
        return insights;
    }

    analyzePerformance() {
        const claude = this.metrics.claudeCode;
        const successRate = (claude.commandSuccess / 
            (claude.commandSuccess + claude.commandFailure)) * 100;
        
        const avgResponseTime = claude.responseTime.length > 0 
            ? claude.responseTime.reduce((sum, r) => sum + r.duration, 0) / claude.responseTime.length
            : 0;

        return {
            claudeCode: {
                successRate: successRate || 100,
                avgResponseTime,
                mostUsedTool: this.getMostUsedTool(),
                sessionDuration: performance.now() - this.startTime
            },
            agents: this.getAgentPerformanceSummary(),
            system: this.getSystemPerformanceSummary()
        };
    }

    getMostUsedTool() {
        const tools = this.metrics.claudeCode.toolUsage;
        return Object.keys(tools).reduce((most, tool) => 
            tools[tool].count > (tools[most]?.count || 0) ? tool : most, null);
    }

    getAgentPerformanceSummary() {
        const summary = {};
        for (const [agent, data] of Object.entries(this.metrics.agents.performance)) {
            summary[agent] = {
                avgDuration: data.avgDuration,
                successRate: data.successRate,
                taskCount: data.tasks.length
            };
        }
        return summary;
    }

    getSystemPerformanceSummary() {
        const cpu = this.metrics.system.cpu;
        const memory = this.metrics.system.memory;
        
        return {
            avgCpuUsage: cpu.length > 0 ? cpu.reduce((sum, c) => sum + c.value, 0) / cpu.length : 0,
            avgMemoryUsage: memory.length > 0 ? memory.reduce((sum, m) => sum + m.value, 0) / memory.length : 0,
            peakCpuUsage: cpu.length > 0 ? Math.max(...cpu.map(c => c.value)) : 0,
            peakMemoryUsage: memory.length > 0 ? Math.max(...memory.map(m => m.value)) : 0
        };
    }

    analyzeBottlenecks() {
        const bottlenecks = this.metrics.workflow.bottlenecks;
        const categories = {};
        
        bottlenecks.forEach(b => {
            if (!categories[b.category]) {
                categories[b.category] = { count: 0, avgDuration: 0, critical: 0 };
            }
            categories[b.category].count++;
            categories[b.category].avgDuration += b.duration;
            if (b.severity === 'critical') categories[b.category].critical++;
        });
        
        Object.values(categories).forEach(cat => {
            cat.avgDuration /= cat.count;
        });
        
        return categories;
    }

    analyzeTrends() {
        // Placeholder for trend analysis
        return {
            performance: 'stable',
            errors: 'decreasing',
            efficiency: 'improving'
        };
    }

    generateRecommendations() {
        const recommendations = [];
        const insights = this.analyzePerformance();
        
        if (insights.claudeCode.avgResponseTime > 30000) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Optimize Claude Code Response Time',
                description: 'Average response time is above 30 seconds. Consider reducing prompt complexity or checking system resources.',
                action: 'review-prompts'
            });
        }
        
        if (insights.system.avgCpuUsage > 70) {
            recommendations.push({
                category: 'system',
                priority: 'medium',
                title: 'High CPU Usage Detected',
                description: 'System CPU usage is consistently high. Consider closing unnecessary applications.',
                action: 'optimize-resources'
            });
        }
        
        return recommendations;
    }

    // Performance Optimization
    async optimizePerformance() {
        const insights = this.generateInsights();
        const optimizations = [];
        
        // Auto-optimization based on insights
        for (const recommendation of insights.recommendations) {
            if (recommendation.action === 'optimize-resources') {
                await this.optimizeSystemResources();
                optimizations.push('System resources optimized');
            }
        }
        
        return optimizations;
    }

    async optimizeSystemResources() {
        // Placeholder for system optimization
        console.log('🔧 Optimizing system resources...');
        
        // Clear old metric data
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.metrics.claudeCode.responseTime = 
            this.metrics.claudeCode.responseTime.filter(r => r.timestamp > oneWeekAgo);
        
        // Optimize MCP server connections
        await this.optimizeMCPConnections();
    }

    async optimizeMCPConnections() {
        console.log('🔧 Optimizing MCP server connections...');
        // Placeholder for MCP optimization
    }

    // Data Export and Reporting
    async saveMetrics() {
        const timestamp = new Date().toISOString();
        const filename = `metrics-${timestamp.split('T')[0]}.json`;
        const filepath = path.join(this.dataPath, 'daily', filename);
        
        try {
            await fs.writeFile(filepath, JSON.stringify({
                timestamp,
                metrics: this.metrics,
                insights: this.generateInsights()
            }, null, 2));
            
            console.log(`📊 Metrics saved to ${filename}`);
        } catch (error) {
            console.error('Failed to save metrics:', error);
        }
    }

    async generateReport() {
        const insights = this.generateInsights();
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                sessionDuration: insights.performance.claudeCode.sessionDuration,
                successRate: insights.performance.claudeCode.successRate,
                totalErrors: this.metrics.errors.total,
                bottlenecks: this.metrics.workflow.bottlenecks.length
            },
            performance: insights.performance,
            recommendations: insights.recommendations,
            alertsToday: await this.getTodaysAlerts()
        };
        
        return report;
    }

    async getTodaysAlerts() {
        const today = new Date().toISOString().split('T')[0];
        const alertFile = path.join(this.dataPath, 'alerts', `${today}.json`);
        return await this.loadAlerts(alertFile);
    }

    // Public API Methods
    start() {
        console.log('🚀 Performance Monitor started');
        return this.startClaudeCodeMonitoring();
    }

    async getStatus() {
        return {
            isRunning: this.isMonitoring,
            metrics: this.metrics,
            insights: this.generateInsights()
        };
    }

    async stop() {
        this.isMonitoring = false;
        await this.saveMetrics();
        console.log('⏹️ Performance Monitor stopped');
    }
}

module.exports = PerformanceMonitor;
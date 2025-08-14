/**
 * Performance Monitoring API Server
 * Provides REST API for performance data and dashboard
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const PerformanceMonitor = require('./performance-monitor');
const AnalyticsEngine = require('./analytics-engine');

class PerformanceAPI {
    constructor(port = 3001) {
        this.app = express();
        this.port = port;
        this.monitor = new PerformanceMonitor();
        this.analytics = new AnalyticsEngine();
        this.dataPath = path.join(__dirname, 'data');
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname)));
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`📡 API ${req.method} ${req.path}`);
            next();
        });
    }

    setupRoutes() {
        // Dashboard routes
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'dashboard.html'));
        });

        // Status and health routes
        this.app.get('/api/status', this.handleStatus.bind(this));
        this.app.get('/api/health', this.handleHealth.bind(this));

        // Performance data routes
        this.app.get('/api/performance/overview', this.handlePerformanceOverview.bind(this));
        this.app.get('/api/performance/claude-code', this.handleClaudeCodeMetrics.bind(this));
        this.app.get('/api/performance/mcp-servers', this.handleMCPMetrics.bind(this));
        this.app.get('/api/performance/agents', this.handleAgentMetrics.bind(this));
        this.app.get('/api/performance/system', this.handleSystemMetrics.bind(this));

        // Analytics routes
        this.app.get('/api/analytics/insights', this.handleInsights.bind(this));
        this.app.get('/api/analytics/trends', this.handleTrends.bind(this));
        this.app.get('/api/analytics/predictions', this.handlePredictions.bind(this));
        this.app.get('/api/analytics/anomalies', this.handleAnomalies.bind(this));
        this.app.get('/api/analytics/recommendations', this.handleRecommendations.bind(this));

        // Operational routes
        this.app.get('/api/operations/recent', this.handleRecentOperations.bind(this));
        this.app.get('/api/operations/bottlenecks', this.handleBottlenecks.bind(this));
        this.app.get('/api/operations/errors', this.handleErrors.bind(this));

        // Alerts and notifications
        this.app.get('/api/alerts', this.handleAlerts.bind(this));
        this.app.get('/api/alerts/recent', this.handleRecentAlerts.bind(this));

        // Reports
        this.app.get('/api/reports/performance', this.handlePerformanceReport.bind(this));
        this.app.get('/api/reports/export', this.handleExportReport.bind(this));

        // Administrative routes
        this.app.post('/api/admin/optimize', this.handleOptimize.bind(this));
        this.app.post('/api/admin/cleanup', this.handleCleanup.bind(this));
        this.app.get('/api/admin/config', this.handleConfig.bind(this));

        // WebSocket endpoint for real-time updates (placeholder)
        this.app.get('/api/stream', this.handleStream.bind(this));

        // Error handling
        this.app.use(this.handleError.bind(this));
    }

    // Status and Health Handlers
    async handleStatus(req, res) {
        try {
            const status = await this.monitor.getStatus();
            res.json({
                success: true,
                data: status,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleHealth(req, res) {
        try {
            const health = {
                api: 'healthy',
                monitor: this.monitor.isMonitoring ? 'running' : 'stopped',
                dataPath: await this.checkDataPath(),
                lastUpdate: await this.getLastUpdateTime()
            };
            
            res.json({
                success: true,
                data: health,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Performance Data Handlers
    async handlePerformanceOverview(req, res) {
        try {
            const insights = await this.analytics.generateInsights();
            const overview = {
                overall: insights.performance.overall,
                efficiency: insights.performance.efficiency,
                trends: insights.trends,
                health: this.calculateOverallHealth(insights)
            };
            
            res.json({
                success: true,
                data: overview,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleClaudeCodeMetrics(req, res) {
        try {
            const metrics = this.monitor.metrics.claudeCode;
            const insights = await this.analytics.generateInsights();
            
            const claudeMetrics = {
                responseTime: {
                    current: insights.performance.overall.avgDuration || 0,
                    median: insights.performance.overall.medianDuration || 0,
                    p95: insights.performance.overall.p95Duration || 0
                },
                successRate: insights.performance.overall.successRate || 100,
                toolUsage: insights.performance.byTool || {},
                sessionDuration: Date.now() - this.monitor.startTime,
                recentOperations: await this.getRecentOperations(10)
            };
            
            res.json({
                success: true,
                data: claudeMetrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleMCPMetrics(req, res) {
        try {
            const mcpMetrics = this.monitor.metrics.mcpServers;
            
            // Enhance with recent response times
            const enhancedMetrics = {};
            for (const [server, data] of Object.entries(mcpMetrics)) {
                enhancedMetrics[server] = {
                    ...data,
                    avgResponseTime: data.responseTime.length > 0 ?
                        data.responseTime.reduce((sum, r) => sum + r.time, 0) / data.responseTime.length : 0,
                    recentResponseTimes: data.responseTime.slice(-10)
                };
            }
            
            res.json({
                success: true,
                data: enhancedMetrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleAgentMetrics(req, res) {
        try {
            const agentMetrics = {
                coordination: this.monitor.metrics.agents.coordination,
                performance: this.monitor.metrics.agents.performance,
                workload: this.monitor.metrics.agents.workload,
                handoffSuccess: this.calculateHandoffSuccessRate(),
                efficiency: this.calculateAgentEfficiency()
            };
            
            res.json({
                success: true,
                data: agentMetrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleSystemMetrics(req, res) {
        try {
            const systemMetrics = {
                current: await this.getCurrentSystemMetrics(),
                trends: await this.getSystemTrends(),
                alerts: await this.getSystemAlerts()
            };
            
            res.json({
                success: true,
                data: systemMetrics,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Analytics Handlers
    async handleInsights(req, res) {
        try {
            const insights = await this.analytics.generateInsights();
            res.json({
                success: true,
                data: insights,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleTrends(req, res) {
        try {
            const insights = await this.analytics.generateInsights();
            res.json({
                success: true,
                data: insights.trends,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handlePredictions(req, res) {
        try {
            const insights = await this.analytics.generateInsights();
            res.json({
                success: true,
                data: insights.predictions,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleAnomalies(req, res) {
        try {
            const insights = await this.analytics.generateInsights();
            res.json({
                success: true,
                data: insights.anomalies,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleRecommendations(req, res) {
        try {
            const insights = await this.analytics.generateInsights();
            res.json({
                success: true,
                data: insights.recommendations,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Operational Handlers
    async handleRecentOperations(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const operations = await this.getRecentOperations(limit);
            
            res.json({
                success: true,
                data: operations,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleBottlenecks(req, res) {
        try {
            const bottlenecks = this.monitor.metrics.workflow.bottlenecks;
            const recentBottlenecks = bottlenecks.filter(b => 
                Date.now() - b.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
            );
            
            res.json({
                success: true,
                data: {
                    recent: recentBottlenecks,
                    summary: this.summarizeBottlenecks(recentBottlenecks),
                    trends: this.analyzeBottleneckTrends(bottlenecks)
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleErrors(req, res) {
        try {
            const errors = {
                total: this.monitor.metrics.errors.total,
                byCategory: this.monitor.metrics.errors.by_category,
                recent: this.monitor.metrics.errors.recent.slice(-20),
                rate: this.calculateErrorRate()
            };
            
            res.json({
                success: true,
                data: errors,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Alert Handlers
    async handleAlerts(req, res) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const alerts = await this.loadAlertsFromFile(today);
            
            res.json({
                success: true,
                data: alerts,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleRecentAlerts(req, res) {
        try {
            const alerts = await this.getRecentAlerts();
            res.json({
                success: true,
                data: alerts,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Report Handlers
    async handlePerformanceReport(req, res) {
        try {
            const report = await this.monitor.generateReport();
            const insights = await this.analytics.generateInsights();
            
            const fullReport = {
                ...report,
                insights,
                generatedAt: new Date().toISOString()
            };
            
            res.json({
                success: true,
                data: fullReport,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleExportReport(req, res) {
        try {
            const format = req.query.format || 'json';
            const report = await this.monitor.generateReport();
            const insights = await this.analytics.generateInsights();
            
            const fullReport = {
                ...report,
                insights,
                generatedAt: new Date().toISOString()
            };
            
            if (format === 'csv') {
                const csv = this.convertToCSV(fullReport);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="performance-report.csv"');
                res.send(csv);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename="performance-report.json"');
                res.json(fullReport);
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // Administrative Handlers
    async handleOptimize(req, res) {
        try {
            const optimizations = await this.monitor.optimizePerformance();
            res.json({
                success: true,
                data: { optimizations },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleCleanup(req, res) {
        try {
            await this.performDataCleanup();
            res.json({
                success: true,
                data: { message: 'Data cleanup completed' },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleConfig(req, res) {
        try {
            const config = this.monitor.config;
            res.json({
                success: true,
                data: config,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async handleStream(req, res) {
        // Placeholder for WebSocket streaming
        res.json({
            success: true,
            data: { message: 'WebSocket streaming not yet implemented' },
            timestamp: new Date().toISOString()
        });
    }

    // Utility Methods
    async checkDataPath() {
        try {
            await fs.access(this.dataPath);
            return 'accessible';
        } catch {
            return 'inaccessible';
        }
    }

    async getLastUpdateTime() {
        try {
            const files = await fs.readdir(this.dataPath);
            if (files.length === 0) return null;
            
            const stats = await fs.stat(path.join(this.dataPath, files[0]));
            return stats.mtime.toISOString();
        } catch {
            return null;
        }
    }

    calculateOverallHealth(insights) {
        const performance = insights.performance.overall;
        const successRate = performance.successRate || 100;
        const responseTime = performance.avgDuration || 0;
        
        let health = 100;
        
        // Penalize low success rate
        if (successRate < 95) health -= (95 - successRate) * 2;
        
        // Penalize slow response times
        if (responseTime > 30000) health -= Math.min(30, (responseTime - 30000) / 1000);
        
        return Math.max(0, health);
    }

    async getRecentOperations(limit = 50) {
        try {
            const operationsFile = path.join(this.dataPath, 'completed-operations.jsonl');
            const content = await fs.readFile(operationsFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            
            return lines
                .slice(-limit)
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(op => op);
        } catch (error) {
            return [];
        }
    }

    calculateHandoffSuccessRate() {
        const coordination = this.monitor.metrics.agents.coordination;
        const total = coordination.handoffSuccess + coordination.handoffFailure;
        return total > 0 ? (coordination.handoffSuccess / total) * 100 : 100;
    }

    calculateAgentEfficiency() {
        return this.monitor.metrics.agents.coordination.efficiency || 0;
    }

    async getCurrentSystemMetrics() {
        try {
            const resourceFile = path.join(this.dataPath, 'resource-metrics.jsonl');
            const content = await fs.readFile(resourceFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            
            if (lines.length === 0) return null;
            
            const latest = JSON.parse(lines[lines.length - 1]);
            return {
                cpu: latest.cpu,
                memory: latest.memory.usage,
                loadAverage: latest.loadAverage[0],
                uptime: latest.system.uptime
            };
        } catch (error) {
            return null;
        }
    }

    async getSystemTrends() {
        // Placeholder for system trends analysis
        return {
            cpu: 'stable',
            memory: 'increasing',
            performance: 'stable'
        };
    }

    async getSystemAlerts() {
        try {
            const alertFile = path.join(this.dataPath, 'resource-alerts.jsonl');
            const content = await fs.readFile(alertFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            return lines
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(alert => alert && alert.timestamp > oneHourAgo);
        } catch (error) {
            return [];
        }
    }

    summarizeBottlenecks(bottlenecks) {
        const byCategory = {};
        const bySeverity = {};
        
        bottlenecks.forEach(b => {
            byCategory[b.category] = (byCategory[b.category] || 0) + 1;
            bySeverity[b.severity] = (bySeverity[b.severity] || 0) + 1;
        });
        
        return { byCategory, bySeverity, total: bottlenecks.length };
    }

    analyzeBottleneckTrends(bottlenecks) {
        const lastHour = bottlenecks.filter(b => Date.now() - b.timestamp < 3600000);
        const previousHour = bottlenecks.filter(b => {
            const age = Date.now() - b.timestamp;
            return age >= 3600000 && age < 7200000;
        });
        
        return {
            trend: lastHour.length > previousHour.length ? 'increasing' : 
                   lastHour.length < previousHour.length ? 'decreasing' : 'stable',
            lastHour: lastHour.length,
            previousHour: previousHour.length
        };
    }

    calculateErrorRate() {
        const errors = this.monitor.metrics.errors;
        const recentErrors = errors.recent.filter(e => 
            Date.now() - e.timestamp < 3600000 // Last hour
        );
        
        return recentErrors.length; // Errors per hour
    }

    async loadAlertsFromFile(date) {
        try {
            const alertFile = path.join(this.dataPath, 'alerts', `${date}.json`);
            const content = await fs.readFile(alertFile, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return [];
        }
    }

    async getRecentAlerts() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        const [todayAlerts, yesterdayAlerts] = await Promise.all([
            this.loadAlertsFromFile(today),
            this.loadAlertsFromFile(yesterday)
        ]);
        
        return [...todayAlerts, ...yesterdayAlerts]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20);
    }

    convertToCSV(data) {
        // Simple CSV conversion for basic metrics
        const lines = ['Metric,Value,Timestamp'];
        
        if (data.performance && data.performance.claudeCode) {
            const perf = data.performance.claudeCode;
            lines.push(`Success Rate,${perf.successRate},${data.timestamp}`);
            lines.push(`Avg Response Time,${perf.avgResponseTime},${data.timestamp}`);
            lines.push(`Session Duration,${perf.sessionDuration},${data.timestamp}`);
        }
        
        return lines.join('\n');
    }

    async performDataCleanup() {
        // Clean up old log files
        const files = ['completed-operations.jsonl', 'resource-metrics.jsonl', 'resource-alerts.jsonl'];
        
        for (const file of files) {
            const filePath = path.join(this.dataPath, file);
            try {
                const content = await fs.readFile(filePath, 'utf8');
                const lines = content.trim().split('\n');
                
                // Keep only last 1000 lines
                if (lines.length > 1000) {
                    const trimmed = lines.slice(-1000);
                    await fs.writeFile(filePath, trimmed.join('\n') + '\n');
                    console.log(`📁 Cleaned up ${file}: ${lines.length} -> ${trimmed.length} lines`);
                }
            } catch (error) {
                // File doesn't exist or can't be read
            }
        }
    }

    handleError(error, req, res, next) {
        console.error('API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            timestamp: new Date().toISOString()
        });
    }

    start() {
        return new Promise((resolve) => {
            this.server = this.app.listen(this.port, () => {
                console.log(`🚀 Performance API server running on http://localhost:${this.port}`);
                console.log(`📊 Dashboard available at http://localhost:${this.port}`);
                resolve();
            });
        });
    }

    stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('⏹️ Performance API server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }
}

// Export for programmatic use
module.exports = PerformanceAPI;

// CLI usage
if (require.main === module) {
    const api = new PerformanceAPI();
    api.start().catch(console.error);
}
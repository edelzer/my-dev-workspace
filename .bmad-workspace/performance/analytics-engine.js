/**
 * Analytics Engine for Performance Insights
 * Provides advanced analytics and predictive insights
 */

const fs = require('fs').promises;
const path = require('path');

class AnalyticsEngine {
    constructor() {
        this.dataPath = path.join(__dirname, 'data');
        this.insights = {
            performance: {},
            trends: {},
            predictions: {},
            anomalies: [],
            recommendations: []
        };
        
        this.models = {
            responseTimePredictor: null,
            bottleneckPredictor: null,
            resourceUsagePredictor: null
        };
    }

    // Main analytics processing
    async generateInsights() {
        console.log('🧠 Generating performance insights...');
        
        try {
            const [operations, resources, mcpHealth] = await Promise.all([
                this.loadOperationData(),
                this.loadResourceData(),
                this.loadMCPData()
            ]);

            this.insights = {
                performance: await this.analyzePerformance(operations),
                trends: await this.analyzeTrends(operations, resources),
                predictions: await this.generatePredictions(operations, resources),
                anomalies: await this.detectAnomalies(operations, resources),
                recommendations: await this.generateRecommendations(operations, resources, mcpHealth),
                timestamp: new Date().toISOString()
            };

            await this.saveInsights();
            return this.insights;
        } catch (error) {
            console.error('Failed to generate insights:', error);
            return this.getDefaultInsights();
        }
    }

    async loadOperationData() {
        try {
            const operationsFile = path.join(this.dataPath, 'completed-operations.jsonl');
            const content = await fs.readFile(operationsFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            
            return lines
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(op => op && op.endTime)
                .slice(-1000); // Last 1000 operations
        } catch (error) {
            return [];
        }
    }

    async loadResourceData() {
        try {
            const resourceFile = path.join(this.dataPath, 'resource-metrics.jsonl');
            const content = await fs.readFile(resourceFile, 'utf8');
            const lines = content.trim().split('\n').filter(line => line);
            
            return lines
                .map(line => {
                    try {
                        return JSON.parse(line);
                    } catch {
                        return null;
                    }
                })
                .filter(metric => metric && metric.timestamp)
                .slice(-500); // Last 500 resource metrics
        } catch (error) {
            return [];
        }
    }

    async loadMCPData() {
        // Placeholder for MCP health data
        // In real implementation, would load from MCP monitoring logs
        return {
            filesystem: { status: 'healthy', avgResponseTime: 50 },
            github: { status: 'healthy', avgResponseTime: 120 },
            memory: { status: 'degraded', avgResponseTime: 800 },
            sequential: { status: 'healthy', avgResponseTime: 200 }
        };
    }

    // Performance Analysis
    async analyzePerformance(operations) {
        if (operations.length === 0) {
            return this.getDefaultPerformanceMetrics();
        }

        const analysis = {
            overall: this.calculateOverallPerformance(operations),
            byTool: this.analyzePerformanceByTool(operations),
            byTimeOfDay: this.analyzePerformanceByTime(operations),
            efficiency: this.calculateEfficiencyMetrics(operations),
            quality: this.analyzeQualityMetrics(operations)
        };

        return analysis;
    }

    calculateOverallPerformance(operations) {
        const totalOperations = operations.length;
        const successfulOps = operations.filter(op => op.success).length;
        const avgDuration = operations.reduce((sum, op) => sum + op.duration, 0) / totalOperations;
        const medianDuration = this.calculateMedian(operations.map(op => op.duration));
        
        return {
            totalOperations,
            successRate: (successfulOps / totalOperations) * 100,
            avgDuration,
            medianDuration,
            p95Duration: this.calculatePercentile(operations.map(op => op.duration), 95),
            p99Duration: this.calculatePercentile(operations.map(op => op.duration), 99)
        };
    }

    analyzePerformanceByTool(operations) {
        const toolMetrics = {};
        
        operations.forEach(op => {
            if (!toolMetrics[op.tool]) {
                toolMetrics[op.tool] = {
                    count: 0,
                    totalDuration: 0,
                    successCount: 0,
                    failures: 0
                };
            }
            
            const tool = toolMetrics[op.tool];
            tool.count++;
            tool.totalDuration += op.duration;
            
            if (op.success) {
                tool.successCount++;
            } else {
                tool.failures++;
            }
        });

        // Calculate derived metrics
        Object.values(toolMetrics).forEach(tool => {
            tool.avgDuration = tool.totalDuration / tool.count;
            tool.successRate = (tool.successCount / tool.count) * 100;
            tool.errorRate = (tool.failures / tool.count) * 100;
        });

        return toolMetrics;
    }

    analyzePerformanceByTime(operations) {
        const hourlyMetrics = {};
        
        operations.forEach(op => {
            const hour = new Date(op.endTime).getHours();
            if (!hourlyMetrics[hour]) {
                hourlyMetrics[hour] = {
                    count: 0,
                    totalDuration: 0,
                    successCount: 0
                };
            }
            
            hourlyMetrics[hour].count++;
            hourlyMetrics[hour].totalDuration += op.duration;
            if (op.success) hourlyMetrics[hour].successCount++;
        });

        // Calculate averages
        Object.values(hourlyMetrics).forEach(hour => {
            hour.avgDuration = hour.totalDuration / hour.count;
            hour.successRate = (hour.successCount / hour.count) * 100;
        });

        return hourlyMetrics;
    }

    calculateEfficiencyMetrics(operations) {
        const lastHour = operations.filter(op => 
            Date.now() - op.endTime < 3600000
        );
        const lastDay = operations.filter(op => 
            Date.now() - op.endTime < 86400000
        );

        return {
            operationsPerHour: lastHour.length,
            operationsPerDay: lastDay.length,
            avgOperationsPerHour: operations.length > 0 ? 
                operations.length / ((Date.now() - operations[0].endTime) / 3600000) : 0,
            peakHourOperations: Math.max(...Object.values(this.analyzePerformanceByTime(operations))
                .map(hour => hour.count)),
            efficiency: this.calculateOverallEfficiency(operations)
        };
    }

    calculateOverallEfficiency(operations) {
        if (operations.length === 0) return 0;
        
        const successRate = (operations.filter(op => op.success).length / operations.length) * 100;
        const avgDuration = operations.reduce((sum, op) => sum + op.duration, 0) / operations.length;
        const speedScore = Math.max(0, 100 - (avgDuration / 1000)); // Penalize slow operations
        
        return (successRate * 0.7) + (speedScore * 0.3); // Weighted efficiency score
    }

    analyzeQualityMetrics(operations) {
        const recentOps = operations.filter(op => 
            Date.now() - op.endTime < 86400000 // Last 24 hours
        );

        const errorCategories = {};
        operations.filter(op => !op.success).forEach(op => {
            const category = this.categorizeError(op);
            errorCategories[category] = (errorCategories[category] || 0) + 1;
        });

        return {
            recentSuccessRate: recentOps.length > 0 ? 
                (recentOps.filter(op => op.success).length / recentOps.length) * 100 : 100,
            errorCategories,
            qualityTrend: this.calculateQualityTrend(operations),
            mtbf: this.calculateMTBF(operations), // Mean Time Between Failures
            mttr: this.calculateMTTR(operations)  // Mean Time To Recovery
        };
    }

    categorizeError(operation) {
        if (operation.exitCode) {
            if (operation.exitCode === '1') return 'execution_error';
            if (operation.exitCode === '2') return 'syntax_error';
            if (operation.exitCode === '127') return 'command_not_found';
        }
        
        if (operation.duration > 60000) return 'timeout';
        return 'unknown_error';
    }

    calculateQualityTrend(operations) {
        if (operations.length < 10) return 'stable';
        
        const recentOps = operations.slice(-50);
        const olderOps = operations.slice(-100, -50);
        
        const recentSuccess = recentOps.filter(op => op.success).length / recentOps.length;
        const olderSuccess = olderOps.filter(op => op.success).length / olderOps.length;
        
        const diff = recentSuccess - olderSuccess;
        if (diff > 0.05) return 'improving';
        if (diff < -0.05) return 'declining';
        return 'stable';
    }

    calculateMTBF(operations) {
        const failures = operations.filter(op => !op.success);
        if (failures.length < 2) return null;
        
        const timeSpan = operations[operations.length - 1].endTime - operations[0].endTime;
        return timeSpan / failures.length; // Average time between failures
    }

    calculateMTTR(operations) {
        // Simplified MTTR calculation - would need more complex failure tracking in production
        const failedOps = operations.filter(op => !op.success);
        if (failedOps.length === 0) return null;
        
        const avgFailureDuration = failedOps.reduce((sum, op) => sum + op.duration, 0) / failedOps.length;
        return avgFailureDuration;
    }

    // Trend Analysis
    async analyzeTrends(operations, resources) {
        return {
            performance: this.analyzePerformanceTrend(operations),
            resource: this.analyzeResourceTrend(resources),
            usage: this.analyzeUsageTrend(operations),
            seasonal: this.analyzeSeasonalPatterns(operations)
        };
    }

    analyzePerformanceTrend(operations) {
        if (operations.length < 20) return { trend: 'insufficient_data' };
        
        const batches = this.splitIntoBatches(operations, 5);
        const avgDurations = batches.map(batch => 
            batch.reduce((sum, op) => sum + op.duration, 0) / batch.length
        );
        
        const trend = this.calculateTrend(avgDurations);
        return {
            trend: trend > 0.1 ? 'deteriorating' : trend < -0.1 ? 'improving' : 'stable',
            slope: trend,
            confidence: this.calculateTrendConfidence(avgDurations)
        };
    }

    analyzeResourceTrend(resources) {
        if (resources.length < 10) return { trend: 'insufficient_data' };
        
        const cpuTrend = this.calculateTrend(resources.map(r => r.cpu));
        const memoryTrend = this.calculateTrend(resources.map(r => r.memory.usage));
        
        return {
            cpu: {
                trend: cpuTrend > 0.1 ? 'increasing' : cpuTrend < -0.1 ? 'decreasing' : 'stable',
                slope: cpuTrend
            },
            memory: {
                trend: memoryTrend > 0.1 ? 'increasing' : memoryTrend < -0.1 ? 'decreasing' : 'stable',
                slope: memoryTrend
            }
        };
    }

    analyzeUsageTrend(operations) {
        const dailyUsage = this.groupByDay(operations);
        const usageCounts = Object.values(dailyUsage).map(day => day.length);
        
        if (usageCounts.length < 3) return { trend: 'insufficient_data' };
        
        const trend = this.calculateTrend(usageCounts);
        return {
            trend: trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable',
            slope: trend,
            avgDailyOperations: usageCounts.reduce((sum, count) => sum + count, 0) / usageCounts.length
        };
    }

    analyzeSeasonalPatterns(operations) {
        const hourlyUsage = this.groupByHour(operations);
        const dayOfWeekUsage = this.groupByDayOfWeek(operations);
        
        return {
            peakHours: this.findPeakHours(hourlyUsage),
            peakDays: this.findPeakDays(dayOfWeekUsage),
            patterns: {
                isWeekendUser: this.isWeekendUser(dayOfWeekUsage),
                isEarlyBird: this.isEarlyBird(hourlyUsage),
                isNightOwl: this.isNightOwl(hourlyUsage)
            }
        };
    }

    // Prediction Models
    async generatePredictions(operations, resources) {
        return {
            performance: this.predictPerformance(operations),
            resource: this.predictResourceUsage(resources),
            bottlenecks: this.predictBottlenecks(operations),
            maintenance: this.predictMaintenanceNeeds(operations, resources)
        };
    }

    predictPerformance(operations) {
        if (operations.length < 10) return { prediction: 'insufficient_data' };
        
        const recentOps = operations.slice(-50);
        const avgDuration = recentOps.reduce((sum, op) => sum + op.duration, 0) / recentOps.length;
        const trend = this.analyzePerformanceTrend(operations);
        
        // Simple linear prediction
        const predictedDuration = avgDuration * (1 + (trend.slope || 0));
        
        return {
            nextHour: {
                avgDuration: predictedDuration,
                confidence: trend.confidence || 0.5
            },
            risks: this.identifyPerformanceRisks(operations)
        };
    }

    predictResourceUsage(resources) {
        if (resources.length < 5) return { prediction: 'insufficient_data' };
        
        const recent = resources.slice(-20);
        const avgCpu = recent.reduce((sum, r) => sum + r.cpu, 0) / recent.length;
        const avgMemory = recent.reduce((sum, r) => sum + r.memory.usage, 0) / recent.length;
        
        return {
            nextHour: {
                cpu: Math.min(100, avgCpu * 1.1), // Slight increase prediction
                memory: Math.min(100, avgMemory * 1.05),
                alerts: this.predictResourceAlerts(avgCpu, avgMemory)
            }
        };
    }

    predictBottlenecks(operations) {
        const bottlenecks = operations.filter(op => op.duration > 30000);
        const bottleneckRate = bottlenecks.length / operations.length;
        
        return {
            probability: bottleneckRate,
            likelyTools: this.identifyBottleneckTools(bottlenecks),
            timeframe: this.predictBottleneckTimeframe(bottlenecks)
        };
    }

    predictMaintenanceNeeds(operations, resources) {
        const performanceDecline = this.analyzePerformanceTrend(operations);
        const resourceTrends = this.analyzeResourceTrend(resources);
        
        return {
            recommended: this.shouldRecommendMaintenance(performanceDecline, resourceTrends),
            urgency: this.calculateMaintenanceUrgency(operations, resources),
            actions: this.recommendMaintenanceActions(operations, resources)
        };
    }

    // Anomaly Detection
    async detectAnomalies(operations, resources) {
        return {
            performance: this.detectPerformanceAnomalies(operations),
            resource: this.detectResourceAnomalies(resources),
            pattern: this.detectPatternAnomalies(operations)
        };
    }

    detectPerformanceAnomalies(operations) {
        const anomalies = [];
        const durations = operations.map(op => op.duration);
        const mean = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const stdDev = this.calculateStandardDeviation(durations, mean);
        
        operations.forEach(op => {
            const zScore = Math.abs((op.duration - mean) / stdDev);
            if (zScore > 2.5) { // 2.5 standard deviations
                anomalies.push({
                    type: 'performance_outlier',
                    operation: op,
                    severity: zScore > 3 ? 'high' : 'medium',
                    zScore
                });
            }
        });
        
        return anomalies;
    }

    detectResourceAnomalies(resources) {
        const anomalies = [];
        
        resources.forEach((resource, index) => {
            if (index === 0) return;
            
            const prev = resources[index - 1];
            const cpuJump = Math.abs(resource.cpu - prev.cpu);
            const memoryJump = Math.abs(resource.memory.usage - prev.memory.usage);
            
            if (cpuJump > 30) {
                anomalies.push({
                    type: 'cpu_spike',
                    timestamp: resource.timestamp,
                    value: resource.cpu,
                    jump: cpuJump,
                    severity: cpuJump > 50 ? 'high' : 'medium'
                });
            }
            
            if (memoryJump > 20) {
                anomalies.push({
                    type: 'memory_spike',
                    timestamp: resource.timestamp,
                    value: resource.memory.usage,
                    jump: memoryJump,
                    severity: memoryJump > 40 ? 'high' : 'medium'
                });
            }
        });
        
        return anomalies;
    }

    detectPatternAnomalies(operations) {
        // Detect unusual usage patterns
        const hourlyUsage = this.groupByHour(operations);
        const normalHours = this.findNormalUsageHours(hourlyUsage);
        
        const anomalies = [];
        Object.entries(hourlyUsage).forEach(([hour, ops]) => {
            if (!normalHours.includes(parseInt(hour)) && ops.length > 5) {
                anomalies.push({
                    type: 'unusual_usage_time',
                    hour: parseInt(hour),
                    operationCount: ops.length,
                    severity: 'low'
                });
            }
        });
        
        return anomalies;
    }

    // Recommendations Engine
    async generateRecommendations(operations, resources, mcpHealth) {
        const recommendations = [];
        
        // Performance recommendations
        recommendations.push(...this.generatePerformanceRecommendations(operations));
        
        // Resource recommendations
        recommendations.push(...this.generateResourceRecommendations(resources));
        
        // MCP recommendations
        recommendations.push(...this.generateMCPRecommendations(mcpHealth));
        
        // Workflow recommendations
        recommendations.push(...this.generateWorkflowRecommendations(operations));
        
        return recommendations.sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a));
    }

    generatePerformanceRecommendations(operations) {
        const recommendations = [];
        const performance = this.calculateOverallPerformance(operations);
        
        if (performance.successRate < 90) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                title: 'Improve Operation Success Rate',
                description: `Current success rate is ${performance.successRate.toFixed(1)}%. Investigate common failure patterns.`,
                action: 'investigate_failures',
                impact: 'high'
            });
        }
        
        if (performance.avgDuration > 30000) {
            recommendations.push({
                category: 'performance',
                priority: 'medium',
                title: 'Optimize Response Times',
                description: `Average operation duration is ${(performance.avgDuration/1000).toFixed(1)}s. Consider optimizing prompts or system resources.`,
                action: 'optimize_prompts',
                impact: 'medium'
            });
        }
        
        return recommendations;
    }

    generateResourceRecommendations(resources) {
        const recommendations = [];
        if (resources.length === 0) return recommendations;
        
        const latest = resources[resources.length - 1];
        
        if (latest.cpu > 80) {
            recommendations.push({
                category: 'system',
                priority: 'high',
                title: 'High CPU Usage Detected',
                description: `CPU usage is at ${latest.cpu.toFixed(1)}%. Close unnecessary applications or upgrade hardware.`,
                action: 'optimize_cpu',
                impact: 'high'
            });
        }
        
        if (latest.memory.usage > 85) {
            recommendations.push({
                category: 'system',
                priority: 'high',
                title: 'High Memory Usage Detected',
                description: `Memory usage is at ${latest.memory.usage.toFixed(1)}%. Free up memory or add more RAM.`,
                action: 'optimize_memory',
                impact: 'high'
            });
        }
        
        return recommendations;
    }

    generateMCPRecommendations(mcpHealth) {
        const recommendations = [];
        
        Object.entries(mcpHealth).forEach(([server, health]) => {
            if (health.status === 'degraded') {
                recommendations.push({
                    category: 'mcp',
                    priority: 'medium',
                    title: `Optimize ${server} MCP Server`,
                    description: `${server} MCP server showing degraded performance. Response time: ${health.avgResponseTime}ms.`,
                    action: 'restart_mcp_server',
                    impact: 'medium'
                });
            } else if (health.status === 'error') {
                recommendations.push({
                    category: 'mcp',
                    priority: 'critical',
                    title: `Fix ${server} MCP Server`,
                    description: `${server} MCP server is not responding. Check installation and configuration.`,
                    action: 'fix_mcp_server',
                    impact: 'critical'
                });
            }
        });
        
        return recommendations;
    }

    generateWorkflowRecommendations(operations) {
        const recommendations = [];
        const toolUsage = this.analyzePerformanceByTool(operations);
        
        // Find inefficient tools
        Object.entries(toolUsage).forEach(([tool, metrics]) => {
            if (metrics.avgDuration > 45000 && metrics.count > 5) {
                recommendations.push({
                    category: 'workflow',
                    priority: 'medium',
                    title: `Optimize ${tool} Usage`,
                    description: `${tool} operations average ${(metrics.avgDuration/1000).toFixed(1)}s. Consider breaking into smaller tasks.`,
                    action: 'optimize_tool_usage',
                    impact: 'medium'
                });
            }
        });
        
        return recommendations;
    }

    // Utility functions
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
    }

    calculateStandardDeviation(values, mean) {
        const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + val * index, 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    calculateTrendConfidence(values) {
        if (values.length < 3) return 0;
        const trend = this.calculateTrend(values);
        const variance = this.calculateStandardDeviation(values, values.reduce((s, v) => s + v, 0) / values.length);
        return Math.min(1, Math.abs(trend) / (variance + 0.1));
    }

    splitIntoBatches(array, batchCount) {
        const batchSize = Math.ceil(array.length / batchCount);
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }

    groupByDay(operations) {
        const groups = {};
        operations.forEach(op => {
            const day = new Date(op.endTime).toDateString();
            if (!groups[day]) groups[day] = [];
            groups[day].push(op);
        });
        return groups;
    }

    groupByHour(operations) {
        const groups = {};
        operations.forEach(op => {
            const hour = new Date(op.endTime).getHours();
            if (!groups[hour]) groups[hour] = [];
            groups[hour].push(op);
        });
        return groups;
    }

    groupByDayOfWeek(operations) {
        const groups = {};
        operations.forEach(op => {
            const day = new Date(op.endTime).getDay();
            if (!groups[day]) groups[day] = [];
            groups[day].push(op);
        });
        return groups;
    }

    findPeakHours(hourlyUsage) {
        return Object.entries(hourlyUsage)
            .sort(([,a], [,b]) => b.length - a.length)
            .slice(0, 3)
            .map(([hour]) => parseInt(hour));
    }

    findPeakDays(dayOfWeekUsage) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return Object.entries(dayOfWeekUsage)
            .sort(([,a], [,b]) => b.length - a.length)
            .slice(0, 3)
            .map(([day]) => dayNames[day]);
    }

    isWeekendUser(dayOfWeekUsage) {
        const weekdayOps = [1, 2, 3, 4, 5].reduce((sum, day) => sum + (dayOfWeekUsage[day]?.length || 0), 0);
        const weekendOps = [0, 6].reduce((sum, day) => sum + (dayOfWeekUsage[day]?.length || 0), 0);
        return weekendOps > weekdayOps * 0.3;
    }

    isEarlyBird(hourlyUsage) {
        const earlyHours = [5, 6, 7, 8].reduce((sum, hour) => sum + (hourlyUsage[hour]?.length || 0), 0);
        const totalOps = Object.values(hourlyUsage).reduce((sum, ops) => sum + ops.length, 0);
        return earlyHours > totalOps * 0.3;
    }

    isNightOwl(hourlyUsage) {
        const lateHours = [22, 23, 0, 1].reduce((sum, hour) => sum + (hourlyUsage[hour]?.length || 0), 0);
        const totalOps = Object.values(hourlyUsage).reduce((sum, ops) => sum + ops.length, 0);
        return lateHours > totalOps * 0.3;
    }

    getPriorityScore(recommendation) {
        const priorityScores = { critical: 100, high: 75, medium: 50, low: 25 };
        const impactScores = { critical: 40, high: 30, medium: 20, low: 10 };
        
        return (priorityScores[recommendation.priority] || 25) + 
               (impactScores[recommendation.impact] || 10);
    }

    // Default data for fallback
    getDefaultInsights() {
        return {
            performance: this.getDefaultPerformanceMetrics(),
            trends: { trend: 'insufficient_data' },
            predictions: { prediction: 'insufficient_data' },
            anomalies: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };
    }

    getDefaultPerformanceMetrics() {
        return {
            overall: {
                totalOperations: 0,
                successRate: 100,
                avgDuration: 0,
                medianDuration: 0
            },
            byTool: {},
            efficiency: { efficiency: 0 }
        };
    }

    async saveInsights() {
        const insightsFile = path.join(this.dataPath, 'insights.json');
        await fs.writeFile(insightsFile, JSON.stringify(this.insights, null, 2));
    }

    async loadInsights() {
        try {
            const insightsFile = path.join(this.dataPath, 'insights.json');
            const content = await fs.readFile(insightsFile, 'utf8');
            this.insights = JSON.parse(content);
            return this.insights;
        } catch (error) {
            return this.getDefaultInsights();
        }
    }
}

module.exports = AnalyticsEngine;
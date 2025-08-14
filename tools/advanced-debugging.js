#!/usr/bin/env node

/**
 * Advanced Debugging Tools for Development Workflows
 * Provides performance profiling, logging, tracing, and debugging analytics
 * Integrates with Claude Code, BMAD agents, and existing monitoring systems
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, spawn } = require('child_process');

class AdvancedDebuggingTools {
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.debugDir = path.join(projectRoot, '.bmad-workspace', 'debugging');
        this.logsDir = path.join(this.debugDir, 'logs');
        this.profilesDir = path.join(this.debugDir, 'profiles');
        this.tracesDir = path.join(this.debugDir, 'traces');
        this.analyticsDir = path.join(this.debugDir, 'analytics');
        
        this.ensureDirectories();
        this.initializeDebugger();
    }

    ensureDirectories() {
        [this.debugDir, this.logsDir, this.profilesDir, this.tracesDir, this.analyticsDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    initializeDebugger() {
        this.debugSession = {
            sessionId: this.generateSessionId(),
            startTime: new Date().toISOString(),
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
            activeProfiles: [],
            traces: [],
            performance: {
                startTime: Date.now(),
                milestones: [],
                operations: []
            }
        };

        this.logLevel = process.env.DEBUG_LEVEL || 'info';
        this.enabledTracers = new Set(['agent', 'workflow', 'performance', 'error']);
    }

    // Performance Profiling System
    startProfiling(profileName = 'default', options = {}) {
        const profile = {
            id: this.generateId(),
            name: profileName,
            startTime: Date.now(),
            startMemory: process.memoryUsage(),
            startCpu: process.cpuUsage(),
            options: {
                includeMemory: true,
                includeCpu: true,
                includeFileIO: false,
                includeNetwork: false,
                sampleInterval: 100,
                ...options
            },
            samples: [],
            events: [],
            status: 'running'
        };

        this.debugSession.activeProfiles.push(profile);
        this.logDebug('profiling', `Started profiling session: ${profileName}`, { profileId: profile.id });

        // Start sampling if enabled
        if (profile.options.sampleInterval > 0) {
            profile.samplingInterval = setInterval(() => {
                this.collectProfileSample(profile.id);
            }, profile.options.sampleInterval);
        }

        return profile.id;
    }

    collectProfileSample(profileId) {
        const profile = this.debugSession.activeProfiles.find(p => p.id === profileId);
        if (!profile || profile.status !== 'running') return;

        const sample = {
            timestamp: Date.now(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime()
        };

        // Add system metrics if available
        try {
            sample.system = {
                loadAvg: os.loadavg(),
                freeMemory: os.freemem(),
                totalMemory: os.totalmem()
            };
        } catch (error) {
            // Ignore system metrics errors
        }

        profile.samples.push(sample);

        // Limit sample history to prevent memory issues
        if (profile.samples.length > 1000) {
            profile.samples = profile.samples.slice(-500);
        }
    }

    stopProfiling(profileId) {
        const profileIndex = this.debugSession.activeProfiles.findIndex(p => p.id === profileId);
        if (profileIndex === -1) return null;

        const profile = this.debugSession.activeProfiles[profileIndex];
        
        // Stop sampling
        if (profile.samplingInterval) {
            clearInterval(profile.samplingInterval);
        }

        // Calculate final metrics
        profile.endTime = Date.now();
        profile.endMemory = process.memoryUsage();
        profile.endCpu = process.cpuUsage(profile.startCpu);
        profile.duration = profile.endTime - profile.startTime;
        profile.status = 'completed';

        // Generate profile analysis
        profile.analysis = this.analyzeProfile(profile);

        // Save profile to disk
        this.saveProfile(profile);

        // Remove from active profiles
        this.debugSession.activeProfiles.splice(profileIndex, 1);

        this.logDebug('profiling', `Completed profiling session: ${profile.name}`, {
            profileId: profile.id,
            duration: profile.duration,
            memoryDelta: profile.endMemory.heapUsed - profile.startMemory.heapUsed
        });

        return profile;
    }

    analyzeProfile(profile) {
        const analysis = {
            summary: {
                duration: profile.duration,
                avgMemoryUsage: 0,
                maxMemoryUsage: 0,
                avgCpuUsage: 0,
                memoryTrend: 'stable',
                performanceScore: 100
            },
            insights: [],
            recommendations: []
        };

        if (profile.samples.length > 0) {
            // Memory analysis
            const memoryValues = profile.samples.map(s => s.memory.heapUsed);
            analysis.summary.avgMemoryUsage = memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length;
            analysis.summary.maxMemoryUsage = Math.max(...memoryValues);

            // Memory trend analysis
            const firstHalf = memoryValues.slice(0, Math.floor(memoryValues.length / 2));
            const secondHalf = memoryValues.slice(Math.floor(memoryValues.length / 2));
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            
            if (secondAvg > firstAvg * 1.2) {
                analysis.summary.memoryTrend = 'increasing';
                analysis.recommendations.push('Memory usage is increasing. Consider implementing memory management optimizations.');
            } else if (secondAvg < firstAvg * 0.8) {
                analysis.summary.memoryTrend = 'decreasing';
                analysis.insights.push('Memory usage is decreasing, indicating good cleanup or optimization.');
            }

            // Performance scoring
            if (analysis.summary.avgMemoryUsage > 100 * 1024 * 1024) { // 100MB
                analysis.summary.performanceScore -= 20;
                analysis.recommendations.push('High memory usage detected. Consider memory optimization strategies.');
            }

            if (profile.duration > 30000) { // 30 seconds
                analysis.summary.performanceScore -= 10;
                analysis.recommendations.push('Long execution time detected. Consider performance optimizations.');
            }
        }

        return analysis;
    }

    // Advanced Logging and Tracing System
    logDebug(category, message, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            sessionId: this.debugSession.sessionId,
            category,
            level: this.logLevel,
            message,
            context,
            stackTrace: this.captureStackTrace(),
            process: {
                pid: process.pid,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        };

        // Write to log file
        this.writeLog(logEntry);

        // Console output for immediate feedback
        if (this.shouldLog(category)) {
            const timestamp = new Date().toISOString().substr(11, 8);
            console.log(`[${timestamp}] [${category.toUpperCase()}] ${message}`);
            if (Object.keys(context).length > 0) {
                console.log('  Context:', JSON.stringify(context, null, 2));
            }
        }
    }

    writeLog(logEntry) {
        const logFile = path.join(this.logsDir, `debug-${this.formatDate(new Date())}.jsonl`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }

    shouldLog(category) {
        const levels = ['error', 'warn', 'info', 'debug', 'trace'];
        const currentLevelIndex = levels.indexOf(this.logLevel);
        const categoryLevelIndex = levels.indexOf(category) || levels.indexOf('info');
        return categoryLevelIndex <= currentLevelIndex;
    }

    // Multi-Agent Tracing System
    startTrace(traceId, agentName, operation, context = {}) {
        if (!this.enabledTracers.has('agent')) return null;

        const trace = {
            id: traceId || this.generateId(),
            agentName,
            operation,
            startTime: Date.now(),
            context,
            spans: [],
            status: 'active',
            parent: null
        };

        this.debugSession.traces.push(trace);
        this.logDebug('trace', `Started trace: ${agentName}:${operation}`, { traceId: trace.id });

        return trace.id;
    }

    addSpan(traceId, spanName, startTime = Date.now(), context = {}) {
        const trace = this.debugSession.traces.find(t => t.id === traceId);
        if (!trace) return null;

        const span = {
            id: this.generateId(),
            name: spanName,
            startTime,
            context,
            events: [],
            status: 'active'
        };

        trace.spans.push(span);
        return span.id;
    }

    endSpan(traceId, spanId, endTime = Date.now(), result = {}) {
        const trace = this.debugSession.traces.find(t => t.id === traceId);
        if (!trace) return;

        const span = trace.spans.find(s => s.id === spanId);
        if (!span) return;

        span.endTime = endTime;
        span.duration = endTime - span.startTime;
        span.result = result;
        span.status = 'completed';

        this.logDebug('span', `Completed span: ${span.name}`, {
            traceId,
            spanId,
            duration: span.duration
        });
    }

    endTrace(traceId, endTime = Date.now(), result = {}) {
        const trace = this.debugSession.traces.find(t => t.id === traceId);
        if (!trace) return null;

        trace.endTime = endTime;
        trace.duration = endTime - trace.startTime;
        trace.result = result;
        trace.status = 'completed';

        // Analyze trace performance
        trace.analysis = this.analyzeTrace(trace);

        // Save trace to disk
        this.saveTrace(trace);

        this.logDebug('trace', `Completed trace: ${trace.agentName}:${trace.operation}`, {
            traceId: trace.id,
            duration: trace.duration,
            spanCount: trace.spans.length
        });

        return trace;
    }

    analyzeTrace(trace) {
        const analysis = {
            totalDuration: trace.duration,
            spanCount: trace.spans.length,
            completedSpans: trace.spans.filter(s => s.status === 'completed').length,
            avgSpanDuration: 0,
            longestSpan: null,
            bottlenecks: [],
            efficiency: 100
        };

        if (trace.spans.length > 0) {
            const completedSpans = trace.spans.filter(s => s.status === 'completed' && s.duration);
            
            if (completedSpans.length > 0) {
                analysis.avgSpanDuration = completedSpans.reduce((sum, span) => sum + span.duration, 0) / completedSpans.length;
                analysis.longestSpan = completedSpans.reduce((longest, span) => 
                    span.duration > (longest?.duration || 0) ? span : longest, null);

                // Identify bottlenecks (spans taking > 50% of average time)
                const threshold = analysis.avgSpanDuration * 1.5;
                analysis.bottlenecks = completedSpans
                    .filter(span => span.duration > threshold)
                    .map(span => ({
                        name: span.name,
                        duration: span.duration,
                        impact: (span.duration / trace.duration * 100).toFixed(1)
                    }));

                // Calculate efficiency (parallel vs sequential execution)
                const totalSpanTime = completedSpans.reduce((sum, span) => sum + span.duration, 0);
                analysis.efficiency = Math.min(100, (trace.duration / totalSpanTime * 100));
            }
        }

        return analysis;
    }

    // Interactive Debugging Interface
    createDebugInterface() {
        const interface = {
            sessions: this.getActiveSessions(),
            profiles: this.getActiveProfiles(),
            traces: this.getActiveTraces(),
            commands: {
                'profile start': (name, options) => this.startProfiling(name, options),
                'profile stop': (id) => this.stopProfiling(id),
                'trace start': (agent, operation, context) => this.startTrace(null, agent, operation, context),
                'trace end': (id, result) => this.endTrace(id, Date.now(), result),
                'log': (category, message, context) => this.logDebug(category, message, context),
                'status': () => this.getSystemStatus(),
                'analytics': () => this.generateAnalytics()
            }
        };

        return interface;
    }

    getActiveSessions() {
        return [{
            sessionId: this.debugSession.sessionId,
            startTime: this.debugSession.startTime,
            uptime: Date.now() - new Date(this.debugSession.startTime).getTime(),
            activeProfiles: this.debugSession.activeProfiles.length,
            activeTraces: this.debugSession.traces.filter(t => t.status === 'active').length
        }];
    }

    getActiveProfiles() {
        return this.debugSession.activeProfiles.map(profile => ({
            id: profile.id,
            name: profile.name,
            duration: Date.now() - profile.startTime,
            sampleCount: profile.samples.length,
            status: profile.status
        }));
    }

    getActiveTraces() {
        return this.debugSession.traces
            .filter(trace => trace.status === 'active')
            .map(trace => ({
                id: trace.id,
                agentName: trace.agentName,
                operation: trace.operation,
                duration: Date.now() - trace.startTime,
                spanCount: trace.spans.length,
                status: trace.status
            }));
    }

    getSystemStatus() {
        return {
            timestamp: new Date().toISOString(),
            session: this.debugSession.sessionId,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            platform: {
                os: os.platform(),
                arch: os.arch(),
                version: os.release(),
                loadAvg: os.loadavg(),
                freeMemory: os.freemem(),
                totalMemory: os.totalmem()
            },
            debugging: {
                activeProfiles: this.debugSession.activeProfiles.length,
                activeTraces: this.debugSession.traces.filter(t => t.status === 'active').length,
                totalTraces: this.debugSession.traces.length,
                logLevel: this.logLevel,
                enabledTracers: Array.from(this.enabledTracers)
            }
        };
    }

    // Debugging Analytics and Insights
    generateAnalytics() {
        const analytics = {
            timestamp: new Date().toISOString(),
            session: this.debugSession.sessionId,
            summary: this.generateSummaryAnalytics(),
            performance: this.generatePerformanceAnalytics(),
            agents: this.generateAgentAnalytics(),
            trends: this.generateTrendAnalytics(),
            recommendations: this.generateRecommendations()
        };

        // Save analytics to disk
        this.saveAnalytics(analytics);

        return analytics;
    }

    generateSummaryAnalytics() {
        const completedTraces = this.debugSession.traces.filter(t => t.status === 'completed');
        const completedProfiles = this.getAllProfiles().filter(p => p.status === 'completed');

        return {
            sessionUptime: Date.now() - new Date(this.debugSession.startTime).getTime(),
            totalTraces: this.debugSession.traces.length,
            completedTraces: completedTraces.length,
            totalProfiles: completedProfiles.length,
            avgTraceTime: completedTraces.length > 0 ? 
                completedTraces.reduce((sum, t) => sum + t.duration, 0) / completedTraces.length : 0,
            avgProfileTime: completedProfiles.length > 0 ?
                completedProfiles.reduce((sum, p) => sum + p.duration, 0) / completedProfiles.length : 0
        };
    }

    generatePerformanceAnalytics() {
        const completedProfiles = this.getAllProfiles().filter(p => p.status === 'completed');
        
        if (completedProfiles.length === 0) return { profiles: 0 };

        const memoryStats = completedProfiles.map(p => p.analysis?.summary?.avgMemoryUsage || 0);
        const durationStats = completedProfiles.map(p => p.duration);

        return {
            profiles: completedProfiles.length,
            memory: {
                avg: memoryStats.reduce((a, b) => a + b, 0) / memoryStats.length,
                max: Math.max(...memoryStats),
                min: Math.min(...memoryStats)
            },
            duration: {
                avg: durationStats.reduce((a, b) => a + b, 0) / durationStats.length,
                max: Math.max(...durationStats),
                min: Math.min(...durationStats)
            },
            trends: this.calculatePerformanceTrends(completedProfiles)
        };
    }

    generateAgentAnalytics() {
        const agentStats = {};
        
        this.debugSession.traces.forEach(trace => {
            if (!agentStats[trace.agentName]) {
                agentStats[trace.agentName] = {
                    traces: 0,
                    totalDuration: 0,
                    operations: {},
                    avgDuration: 0,
                    successRate: 100
                };
            }
            
            const stats = agentStats[trace.agentName];
            stats.traces++;
            
            if (trace.duration) {
                stats.totalDuration += trace.duration;
                stats.avgDuration = stats.totalDuration / stats.traces;
            }
            
            if (!stats.operations[trace.operation]) {
                stats.operations[trace.operation] = 0;
            }
            stats.operations[trace.operation]++;
        });

        return agentStats;
    }

    generateTrendAnalytics() {
        // Simplified trend analysis - would be more sophisticated in production
        return {
            performance: 'stable',
            memory: 'stable',
            agentActivity: 'increasing'
        };
    }

    generateRecommendations() {
        const recommendations = [];
        const completedProfiles = this.getAllProfiles().filter(p => p.status === 'completed');
        
        // Memory recommendations
        completedProfiles.forEach(profile => {
            if (profile.analysis?.summary?.memoryTrend === 'increasing') {
                recommendations.push({
                    type: 'memory',
                    priority: 'medium',
                    message: `Profile "${profile.name}" shows increasing memory usage. Consider implementing memory cleanup.`,
                    profileId: profile.id
                });
            }
        });

        // Performance recommendations
        const longRunningTraces = this.debugSession.traces.filter(t => t.duration > 30000);
        if (longRunningTraces.length > 0) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: `${longRunningTraces.length} traces exceeded 30 seconds. Consider performance optimization.`,
                traces: longRunningTraces.map(t => t.id)
            });
        }

        return recommendations;
    }

    // Utility Functions
    generateSessionId() {
        return `debug-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    captureStackTrace() {
        const stack = new Error().stack;
        return stack ? stack.split('\n').slice(2, 5) : []; // Skip first 2 lines, take next 3
    }

    calculatePerformanceTrends(profiles) {
        // Simple trend calculation based on recent profiles
        if (profiles.length < 2) return 'insufficient_data';
        
        const recent = profiles.slice(-5); // Last 5 profiles
        const older = profiles.slice(-10, -5); // Previous 5 profiles
        
        if (older.length === 0) return 'insufficient_data';
        
        const recentAvg = recent.reduce((sum, p) => sum + p.duration, 0) / recent.length;
        const olderAvg = older.reduce((sum, p) => sum + p.duration, 0) / older.length;
        
        if (recentAvg > olderAvg * 1.1) return 'degrading';
        if (recentAvg < olderAvg * 0.9) return 'improving';
        return 'stable';
    }

    // File Operations
    saveProfile(profile) {
        const profileFile = path.join(this.profilesDir, `profile-${profile.id}.json`);
        fs.writeFileSync(profileFile, JSON.stringify(profile, null, 2));
    }

    saveTrace(trace) {
        const traceFile = path.join(this.tracesDir, `trace-${trace.id}.json`);
        fs.writeFileSync(traceFile, JSON.stringify(trace, null, 2));
    }

    saveAnalytics(analytics) {
        const analyticsFile = path.join(this.analyticsDir, `analytics-${Date.now()}.json`);
        fs.writeFileSync(analyticsFile, JSON.stringify(analytics, null, 2));
    }

    getAllProfiles() {
        const profiles = [...this.debugSession.activeProfiles];
        
        if (fs.existsSync(this.profilesDir)) {
            const profileFiles = fs.readdirSync(this.profilesDir)
                .filter(file => file.startsWith('profile-') && file.endsWith('.json'));
            
            profileFiles.forEach(file => {
                try {
                    const profileData = JSON.parse(
                        fs.readFileSync(path.join(this.profilesDir, file), 'utf8')
                    );
                    profiles.push(profileData);
                } catch (error) {
                    // Ignore corrupted profile files
                }
            });
        }
        
        return profiles;
    }

    // CLI Interface
    static async runCLI() {
        const args = process.argv.slice(2);
        const command = args[0];
        
        const debugger = new AdvancedDebuggingTools();

        switch (command) {
            case 'profile':
                const action = args[1];
                if (action === 'start') {
                    const name = args[2] || 'cli-profile';
                    const profileId = debugger.startProfiling(name);
                    console.log(`Started profiling session: ${profileId}`);
                    console.log('Run "node advanced-debugging.js profile stop ' + profileId + '" to stop profiling');
                } else if (action === 'stop') {
                    const profileId = args[2];
                    const profile = debugger.stopProfiling(profileId);
                    if (profile) {
                        console.log(`Stopped profiling session: ${profile.name}`);
                        console.log(`Duration: ${profile.duration}ms`);
                        console.log(`Performance Score: ${profile.analysis.summary.performanceScore}/100`);
                    } else {
                        console.log('Profile not found or already stopped');
                    }
                }
                break;

            case 'trace':
                const traceAction = args[1];
                if (traceAction === 'start') {
                    const agent = args[2] || 'cli-agent';
                    const operation = args[3] || 'cli-operation';
                    const traceId = debugger.startTrace(null, agent, operation);
                    console.log(`Started trace: ${traceId}`);
                } else if (traceAction === 'end') {
                    const traceId = args[2];
                    const trace = debugger.endTrace(traceId);
                    if (trace) {
                        console.log(`Ended trace: ${trace.agentName}:${trace.operation}`);
                        console.log(`Duration: ${trace.duration}ms`);
                        console.log(`Spans: ${trace.spans.length}`);
                    }
                }
                break;

            case 'status':
                const status = debugger.getSystemStatus();
                console.log('System Status:');
                console.log(`  Session: ${status.session}`);
                console.log(`  Uptime: ${(status.uptime / 60).toFixed(1)} minutes`);
                console.log(`  Memory: ${(status.memory.heapUsed / 1024 / 1024).toFixed(1)} MB`);
                console.log(`  Active Profiles: ${status.debugging.activeProfiles}`);
                console.log(`  Active Traces: ${status.debugging.activeTraces}`);
                break;

            case 'analytics':
                const analytics = debugger.generateAnalytics();
                console.log('Debug Analytics:');
                console.log(`  Session Uptime: ${(analytics.summary.sessionUptime / 1000 / 60).toFixed(1)} minutes`);
                console.log(`  Total Traces: ${analytics.summary.totalTraces}`);
                console.log(`  Avg Trace Time: ${analytics.summary.avgTraceTime.toFixed(1)}ms`);
                console.log(`  Recommendations: ${analytics.recommendations.length}`);
                
                if (analytics.recommendations.length > 0) {
                    console.log('\nRecommendations:');
                    analytics.recommendations.forEach((rec, i) => {
                        console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
                    });
                }
                break;

            case 'interface':
                const debugInterface = debugger.createDebugInterface();
                console.log('Debug Interface:');
                console.log('Active Sessions:', debugInterface.sessions.length);
                console.log('Active Profiles:', debugInterface.profiles.length);
                console.log('Active Traces:', debugInterface.traces.length);
                console.log('\nAvailable Commands:');
                Object.keys(debugInterface.commands).forEach(cmd => {
                    console.log(`  - ${cmd}`);
                });
                break;

            default:
                console.log(`
Advanced Debugging Tools

Usage:
  node advanced-debugging.js <command> [options]

Commands:
  profile start [name]     Start performance profiling
  profile stop <id>        Stop performance profiling
  trace start <agent> <op> Start operation tracing
  trace end <id>           End operation tracing
  status                   Show system status
  analytics                Generate debugging analytics
  interface                Show debug interface info

Examples:
  node advanced-debugging.js profile start "test-workflow"
  node advanced-debugging.js trace start "spec-developer" "implement-feature"
  node advanced-debugging.js status
  node advanced-debugging.js analytics
                `);
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    AdvancedDebuggingTools.runCLI();
}

module.exports = AdvancedDebuggingTools;
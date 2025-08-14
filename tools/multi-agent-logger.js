#!/usr/bin/env node

/**
 * Advanced Multi-Agent Logging and Tracing System
 * Provides comprehensive logging, tracing, and coordination tracking
 * Integrates with Claude Code agents, BMAD agents, and debugging tools
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');

class MultiAgentLogger extends EventEmitter {
    constructor(projectRoot = process.cwd()) {
        super();
        this.projectRoot = projectRoot;
        this.logsDir = path.join(projectRoot, '.bmad-workspace', 'logs');
        this.tracesDir = path.join(projectRoot, '.bmad-workspace', 'traces');
        this.agentLogsDir = path.join(this.logsDir, 'agents');
        this.workflowLogsDir = path.join(this.logsDir, 'workflows');
        this.coordinationLogsDir = path.join(this.logsDir, 'coordination');
        
        this.ensureDirectories();
        this.initializeLogger();
    }

    ensureDirectories() {
        [
            this.logsDir, 
            this.tracesDir, 
            this.agentLogsDir, 
            this.workflowLogsDir, 
            this.coordinationLogsDir
        ].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    initializeLogger() {
        this.sessionId = this.generateSessionId();
        this.startTime = new Date().toISOString();
        
        this.logConfig = {
            level: process.env.LOG_LEVEL || 'info',
            format: process.env.LOG_FORMAT || 'json',
            maxFileSize: parseInt(process.env.LOG_MAX_SIZE) || 10 * 1024 * 1024, // 10MB
            maxFiles: parseInt(process.env.LOG_MAX_FILES) || 10,
            bufferSize: parseInt(process.env.LOG_BUFFER_SIZE) || 100,
            flushInterval: parseInt(process.env.LOG_FLUSH_INTERVAL) || 5000 // 5 seconds
        };

        this.logLevels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };

        this.logBuffer = [];
        this.agentStates = new Map();
        this.activeTraces = new Map();
        this.correlationMap = new Map();
        
        // Start background processes
        this.startLogFlusher();
        this.startLogRotator();
        
        this.logInfo('logger', 'Multi-Agent Logger initialized', {
            sessionId: this.sessionId,
            config: this.logConfig
        });
    }

    // Core Logging Methods
    logError(source, message, context = {}, error = null) {
        this.log('error', source, message, { ...context, error: error?.stack });
    }

    logWarn(source, message, context = {}) {
        this.log('warn', source, message, context);
    }

    logInfo(source, message, context = {}) {
        this.log('info', source, message, context);
    }

    logDebug(source, message, context = {}) {
        this.log('debug', source, message, context);
    }

    logTrace(source, message, context = {}) {
        this.log('trace', source, message, context);
    }

    log(level, source, message, context = {}) {
        if (!this.shouldLog(level)) return;

        const logEntry = this.createLogEntry(level, source, message, context);
        
        // Add to buffer
        this.logBuffer.push(logEntry);
        
        // Emit event for real-time monitoring
        this.emit('log', logEntry);
        
        // Console output for immediate feedback
        this.consoleLog(logEntry);
        
        // Flush if buffer is full
        if (this.logBuffer.length >= this.logConfig.bufferSize) {
            this.flushLogs();
        }
    }

    createLogEntry(level, source, message, context) {
        const timestamp = new Date().toISOString();
        const correlationId = context.correlationId || this.generateCorrelationId();
        
        const entry = {
            timestamp,
            sessionId: this.sessionId,
            level,
            source,
            message,
            correlationId,
            context: this.sanitizeContext(context),
            system: {
                pid: process.pid,
                hostname: os.hostname(),
                platform: os.platform(),
                nodeVersion: process.version,
                memory: process.memoryUsage(),
                uptime: process.uptime()
            }
        };

        // Add stack trace for errors and debug levels
        if (level === 'error' || level === 'debug') {
            entry.stackTrace = this.captureStackTrace();
        }

        // Add agent-specific context if available
        if (this.agentStates.has(source)) {
            entry.agentState = this.agentStates.get(source);
        }

        return entry;
    }

    sanitizeContext(context) {
        // Remove sensitive information and large objects
        const sanitized = { ...context };
        
        // Remove common sensitive keys
        const sensitiveKeys = ['password', 'token', 'key', 'secret', 'credential'];
        sensitiveKeys.forEach(key => {
            if (sanitized[key]) {
                sanitized[key] = '[REDACTED]';
            }
        });

        // Limit object depth and size
        return this.limitObjectSize(sanitized, 5, 1000);
    }

    limitObjectSize(obj, maxDepth, maxSize, currentDepth = 0) {
        if (currentDepth >= maxDepth) return '[MAX_DEPTH_REACHED]';
        if (typeof obj !== 'object' || obj === null) return obj;
        
        const limited = {};
        let size = 0;
        
        for (const [key, value] of Object.entries(obj)) {
            if (size >= maxSize) {
                limited['[TRUNCATED]'] = `... ${Object.keys(obj).length - size} more properties`;
                break;
            }
            
            limited[key] = this.limitObjectSize(value, maxDepth, maxSize, currentDepth + 1);
            size++;
        }
        
        return limited;
    }

    shouldLog(level) {
        const levelValue = this.logLevels[level] || this.logLevels.info;
        const configLevelValue = this.logLevels[this.logConfig.level] || this.logLevels.info;
        return levelValue <= configLevelValue;
    }

    consoleLog(entry) {
        const timestamp = entry.timestamp.substr(11, 8);
        const level = entry.level.toUpperCase().padEnd(5);
        const source = entry.source.padEnd(15);
        
        let output = `[${timestamp}] [${level}] [${source}] ${entry.message}`;
        
        // Add context if available and not too large
        if (entry.context && Object.keys(entry.context).length > 0) {
            const contextStr = JSON.stringify(entry.context);
            if (contextStr.length < 200) {
                output += ` | ${contextStr}`;
            }
        }
        
        console.log(output);
    }

    // Agent-Specific Logging
    logAgentAction(agentName, action, context = {}) {
        this.updateAgentState(agentName, { lastAction: action, lastActionTime: Date.now() });
        this.logInfo(`agent:${agentName}`, `Action: ${action}`, {
            ...context,
            agentName,
            action,
            actionType: 'execution'
        });
    }

    logAgentCommunication(fromAgent, toAgent, messageType, content, context = {}) {
        const correlationId = this.generateCorrelationId();
        
        this.logInfo(`communication`, `${fromAgent} -> ${toAgent}: ${messageType}`, {
            ...context,
            fromAgent,
            toAgent,
            messageType,
            content: this.limitObjectSize(content, 3, 100),
            correlationId,
            communicationType: 'agent-to-agent'
        });
        
        // Track correlation for response matching
        this.correlationMap.set(correlationId, {
            fromAgent,
            toAgent,
            messageType,
            timestamp: Date.now()
        });
    }

    logAgentHandoff(fromAgent, toAgent, taskContext, handoffData = {}) {
        const handoffId = this.generateHandoffId();
        
        this.logInfo(`handoff`, `Task handoff: ${fromAgent} -> ${toAgent}`, {
            handoffId,
            fromAgent,
            toAgent,
            taskContext: this.limitObjectSize(taskContext, 3, 200),
            handoffData: this.limitObjectSize(handoffData, 3, 200),
            handoffType: 'task-transfer'
        });
        
        // Update agent states
        this.updateAgentState(fromAgent, { 
            lastHandoffOut: { toAgent, handoffId, timestamp: Date.now() }
        });
        this.updateAgentState(toAgent, { 
            lastHandoffIn: { fromAgent, handoffId, timestamp: Date.now() }
        });
        
        return handoffId;
    }

    logAgentPerformance(agentName, metrics) {
        this.updateAgentState(agentName, { 
            lastMetrics: metrics, 
            lastMetricsTime: Date.now() 
        });
        
        this.logInfo(`performance:${agentName}`, 'Performance metrics updated', {
            agentName,
            metrics: this.limitObjectSize(metrics, 2, 50),
            performanceType: 'metrics-update'
        });
    }

    updateAgentState(agentName, stateUpdate) {
        const currentState = this.agentStates.get(agentName) || {
            name: agentName,
            firstSeen: Date.now(),
            status: 'unknown'
        };
        
        const updatedState = {
            ...currentState,
            ...stateUpdate,
            lastUpdate: Date.now()
        };
        
        this.agentStates.set(agentName, updatedState);
    }

    // Workflow and Coordination Logging
    logWorkflowStart(workflowName, workflowId, context = {}) {
        this.logInfo(`workflow:${workflowName}`, `Workflow started: ${workflowId}`, {
            workflowName,
            workflowId,
            workflowPhase: 'start',
            ...context
        });
    }

    logWorkflowPhase(workflowName, workflowId, phase, context = {}) {
        this.logInfo(`workflow:${workflowName}`, `Phase: ${phase}`, {
            workflowName,
            workflowId,
            phase,
            workflowPhase: 'execution',
            ...context
        });
    }

    logWorkflowEnd(workflowName, workflowId, result, context = {}) {
        this.logInfo(`workflow:${workflowName}`, `Workflow completed: ${workflowId}`, {
            workflowName,
            workflowId,
            result: this.limitObjectSize(result, 3, 200),
            workflowPhase: 'completion',
            ...context
        });
    }

    logCoordinationEvent(eventType, participants, context = {}) {
        this.logInfo(`coordination`, `Event: ${eventType}`, {
            eventType,
            participants,
            participantCount: participants.length,
            coordinationType: 'multi-agent',
            ...context
        });
    }

    // Distributed Tracing
    startTrace(traceId, operation, context = {}) {
        const trace = {
            id: traceId || this.generateTraceId(),
            operation,
            startTime: Date.now(),
            context,
            spans: [],
            status: 'active',
            correlations: []
        };
        
        this.activeTraces.set(trace.id, trace);
        
        this.logInfo(`trace`, `Started trace: ${operation}`, {
            traceId: trace.id,
            operation,
            tracePhase: 'start',
            ...context
        });
        
        return trace.id;
    }

    addSpan(traceId, spanName, agentName, context = {}) {
        const trace = this.activeTraces.get(traceId);
        if (!trace) {
            this.logWarn('trace', `Trace not found for span: ${spanName}`, { traceId, spanName });
            return null;
        }
        
        const span = {
            id: this.generateSpanId(),
            name: spanName,
            agentName,
            startTime: Date.now(),
            context,
            events: [],
            status: 'active'
        };
        
        trace.spans.push(span);
        
        this.logDebug(`trace:${traceId}`, `Added span: ${spanName}`, {
            traceId,
            spanId: span.id,
            spanName,
            agentName,
            tracePhase: 'span-start'
        });
        
        return span.id;
    }

    addTraceEvent(traceId, spanId, event, context = {}) {
        const trace = this.activeTraces.get(traceId);
        if (!trace) return;
        
        const span = trace.spans.find(s => s.id === spanId);
        if (!span) return;
        
        const traceEvent = {
            timestamp: Date.now(),
            event,
            context
        };
        
        span.events.push(traceEvent);
        
        this.logTrace(`trace:${traceId}`, `Event: ${event}`, {
            traceId,
            spanId,
            event,
            tracePhase: 'event',
            ...context
        });
    }

    endSpan(traceId, spanId, result = {}) {
        const trace = this.activeTraces.get(traceId);
        if (!trace) return;
        
        const span = trace.spans.find(s => s.id === spanId);
        if (!span) return;
        
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.result = result;
        span.status = 'completed';
        
        this.logDebug(`trace:${traceId}`, `Completed span: ${span.name}`, {
            traceId,
            spanId,
            spanName: span.name,
            duration: span.duration,
            agentName: span.agentName,
            tracePhase: 'span-end'
        });
    }

    endTrace(traceId, result = {}) {
        const trace = this.activeTraces.get(traceId);
        if (!trace) return null;
        
        trace.endTime = Date.now();
        trace.duration = trace.endTime - trace.startTime;
        trace.result = result;
        trace.status = 'completed';
        
        // Calculate trace statistics
        const completedSpans = trace.spans.filter(s => s.status === 'completed');
        trace.statistics = {
            totalSpans: trace.spans.length,
            completedSpans: completedSpans.length,
            avgSpanDuration: completedSpans.length > 0 ? 
                completedSpans.reduce((sum, s) => sum + s.duration, 0) / completedSpans.length : 0,
            agents: [...new Set(trace.spans.map(s => s.agentName))],
            efficiency: trace.spans.length > 0 ? 
                (trace.duration / trace.spans.reduce((sum, s) => sum + (s.duration || 0), 0)) * 100 : 100
        };
        
        this.logInfo(`trace`, `Completed trace: ${trace.operation}`, {
            traceId,
            operation: trace.operation,
            duration: trace.duration,
            statistics: trace.statistics,
            tracePhase: 'completion'
        });
        
        // Save trace to file
        this.saveTrace(trace);
        
        // Remove from active traces
        this.activeTraces.delete(traceId);
        
        return trace;
    }

    // Log Management
    flushLogs() {
        if (this.logBuffer.length === 0) return;
        
        const logsToFlush = [...this.logBuffer];
        this.logBuffer = [];
        
        // Group logs by source for efficient writing
        const groupedLogs = this.groupLogsBySource(logsToFlush);
        
        // Write to appropriate log files
        Object.entries(groupedLogs).forEach(([source, logs]) => {
            this.writeLogsToFile(source, logs);
        });
        
        this.emit('flush', { count: logsToFlush.length, timestamp: Date.now() });
    }

    groupLogsBySource(logs) {
        const grouped = {};
        
        logs.forEach(log => {
            const sourceCategory = this.getSourceCategory(log.source);
            if (!grouped[sourceCategory]) {
                grouped[sourceCategory] = [];
            }
            grouped[sourceCategory].push(log);
        });
        
        return grouped;
    }

    getSourceCategory(source) {
        if (source.startsWith('agent:')) return 'agents';
        if (source.startsWith('workflow:')) return 'workflows';
        if (['communication', 'handoff', 'coordination'].includes(source)) return 'coordination';
        if (source.startsWith('trace')) return 'traces';
        return 'general';
    }

    writeLogsToFile(category, logs) {
        const logDir = this.getLogDirectory(category);
        const filename = `${category}-${this.formatDate(new Date())}.jsonl`;
        const filepath = path.join(logDir, filename);
        
        const logLines = logs.map(log => JSON.stringify(log)).join('\n') + '\n';
        
        fs.appendFileSync(filepath, logLines);
    }

    getLogDirectory(category) {
        switch (category) {
            case 'agents': return this.agentLogsDir;
            case 'workflows': return this.workflowLogsDir;
            case 'coordination': return this.coordinationLogsDir;
            case 'traces': return this.tracesDir;
            default: return this.logsDir;
        }
    }

    saveTrace(trace) {
        const traceFile = path.join(this.tracesDir, `trace-${trace.id}.json`);
        fs.writeFileSync(traceFile, JSON.stringify(trace, null, 2));
    }

    // Background Processes
    startLogFlusher() {
        this.flushInterval = setInterval(() => {
            this.flushLogs();
        }, this.logConfig.flushInterval);
    }

    startLogRotator() {
        // Run log rotation every hour
        this.rotationInterval = setInterval(() => {
            this.rotateLogFiles();
        }, 60 * 60 * 1000);
    }

    rotateLogFiles() {
        const directories = [this.logsDir, this.agentLogsDir, this.workflowLogsDir, this.coordinationLogsDir];
        
        directories.forEach(dir => {
            this.rotateDirectoryLogs(dir);
        });
    }

    rotateDirectoryLogs(directory) {
        if (!fs.existsSync(directory)) return;
        
        const files = fs.readdirSync(directory)
            .filter(file => file.endsWith('.jsonl'))
            .map(file => ({
                name: file,
                path: path.join(directory, file),
                stats: fs.statSync(path.join(directory, file))
            }))
            .sort((a, b) => b.stats.mtime - a.stats.mtime);
        
        // Remove old files beyond maxFiles limit
        if (files.length > this.logConfig.maxFiles) {
            const filesToDelete = files.slice(this.logConfig.maxFiles);
            filesToDelete.forEach(file => {
                fs.unlinkSync(file.path);
                this.logInfo('logger', `Rotated log file: ${file.name}`);
            });
        }
        
        // Check file sizes and rotate if necessary
        files.forEach(file => {
            if (file.stats.size > this.logConfig.maxFileSize) {
                const newName = `${file.name}.${Date.now()}.archive`;
                fs.renameSync(file.path, path.join(directory, newName));
                this.logInfo('logger', `Archived large log file: ${file.name} -> ${newName}`);
            }
        });
    }

    // Query and Analysis
    queryLogs(criteria = {}) {
        // Basic log querying - would be more sophisticated with a proper database
        const results = [];
        const directories = [this.logsDir, this.agentLogsDir, this.workflowLogsDir, this.coordinationLogsDir];
        
        directories.forEach(dir => {
            if (!fs.existsSync(dir)) return;
            
            const logFiles = fs.readdirSync(dir)
                .filter(file => file.endsWith('.jsonl'))
                .map(file => path.join(dir, file));
            
            logFiles.forEach(file => {
                try {
                    const content = fs.readFileSync(file, 'utf8');
                    const lines = content.split('\n').filter(line => line.trim());
                    
                    lines.forEach(line => {
                        try {
                            const log = JSON.parse(line);
                            if (this.matchesCriteria(log, criteria)) {
                                results.push(log);
                            }
                        } catch (error) {
                            // Skip invalid JSON lines
                        }
                    });
                } catch (error) {
                    this.logWarn('logger', `Failed to read log file: ${file}`, { error: error.message });
                }
            });
        });
        
        return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    matchesCriteria(log, criteria) {
        if (criteria.level && log.level !== criteria.level) return false;
        if (criteria.source && !log.source.includes(criteria.source)) return false;
        if (criteria.message && !log.message.includes(criteria.message)) return false;
        if (criteria.agentName && !log.source.includes(criteria.agentName)) return false;
        if (criteria.since && new Date(log.timestamp) < new Date(criteria.since)) return false;
        if (criteria.until && new Date(log.timestamp) > new Date(criteria.until)) return false;
        return true;
    }

    getAgentLogs(agentName, limit = 100) {
        return this.queryLogs({ agentName, limit });
    }

    getWorkflowLogs(workflowName, limit = 100) {
        return this.queryLogs({ source: `workflow:${workflowName}`, limit });
    }

    getCoordinationLogs(limit = 100) {
        return this.queryLogs({ source: 'coordination', limit });
    }

    // Utility Functions
    generateSessionId() {
        return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateCorrelationId() {
        return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateHandoffId() {
        return `handoff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateTraceId() {
        return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateSpanId() {
        return `span-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    captureStackTrace() {
        const stack = new Error().stack;
        return stack ? stack.split('\n').slice(3, 8) : []; // Skip first 3 lines, take next 5
    }

    // Cleanup
    cleanup() {
        this.flushLogs();
        
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        
        if (this.rotationInterval) {
            clearInterval(this.rotationInterval);
        }
        
        this.logInfo('logger', 'Multi-Agent Logger shutdown', {
            sessionDuration: Date.now() - new Date(this.startTime).getTime(),
            totalLogs: this.logBuffer.length
        });
    }

    // CLI Interface
    static async runCLI() {
        const args = process.argv.slice(2);
        const command = args[0];
        
        const logger = new MultiAgentLogger();

        switch (command) {
            case 'test':
                // Test the logging system
                logger.logInfo('test', 'Testing multi-agent logger');
                logger.logAgentAction('test-agent', 'test-action', { data: 'test' });
                logger.logAgentCommunication('agent1', 'agent2', 'request', { type: 'task' });
                
                const traceId = logger.startTrace(null, 'test-operation');
                const spanId = logger.addSpan(traceId, 'test-span', 'test-agent');
                logger.addTraceEvent(traceId, spanId, 'test-event', { data: 'test' });
                logger.endSpan(traceId, spanId);
                logger.endTrace(traceId);
                
                setTimeout(() => {
                    console.log('Test completed. Check logs in .bmad-workspace/logs/');
                    logger.cleanup();
                }, 1000);
                break;

            case 'query':
                const criteria = JSON.parse(args[1] || '{}');
                const results = logger.queryLogs(criteria);
                console.log(`Found ${results.length} log entries:`);
                results.slice(0, 10).forEach(log => {
                    console.log(`[${log.timestamp}] [${log.level}] [${log.source}] ${log.message}`);
                });
                break;

            case 'agents':
                const agentStates = Array.from(logger.agentStates.entries());
                console.log('Agent States:');
                agentStates.forEach(([name, state]) => {
                    console.log(`  ${name}: ${state.status || 'unknown'} (last update: ${new Date(state.lastUpdate).toISOString()})`);
                });
                break;

            case 'traces':
                const activeTraces = Array.from(logger.activeTraces.values());
                console.log(`Active Traces: ${activeTraces.length}`);
                activeTraces.forEach(trace => {
                    console.log(`  ${trace.id}: ${trace.operation} (${trace.spans.length} spans)`);
                });
                break;

            default:
                console.log(`
Multi-Agent Logger

Usage:
  node multi-agent-logger.js <command> [options]

Commands:
  test                     Run logger tests
  query <criteria-json>    Query logs with criteria
  agents                   Show agent states
  traces                   Show active traces

Examples:
  node multi-agent-logger.js test
  node multi-agent-logger.js query '{"level":"error","since":"2024-01-01"}'
  node multi-agent-logger.js agents
                `);
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    MultiAgentLogger.runCLI();
}

module.exports = MultiAgentLogger;
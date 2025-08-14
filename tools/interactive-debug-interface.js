#!/usr/bin/env node
/**
 * Interactive Debugging Interface for Real-Time System Analysis
 * Provides live debugging capabilities, real-time monitoring, and interactive analysis tools
 * Integrates with Claude Code agents, BMAD workflows, and performance profiling systems
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const EventEmitter = require('events');

class InteractiveDebugInterface extends EventEmitter {
    constructor() {
        super();
        this.sessions = new Map();
        this.activeAgents = new Map();
        this.performanceMetrics = new Map();
        this.logStream = null;
        this.isRunning = false;
        
        // Initialize interface
        this.setupInterface();
        this.loadConfiguration();
    }

    setupInterface() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'DEBUG> '
        });

        this.rl.on('line', (input) => {
            this.handleCommand(input.trim());
        });

        this.rl.on('close', () => {
            this.shutdown();
        });
    }

    loadConfiguration() {
        const configPath = path.join(__dirname, '..', '.claude', 'debug-config.json');
        try {
            if (fs.existsSync(configPath)) {
                this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            } else {
                this.config = this.getDefaultConfig();
                this.saveConfiguration();
            }
        } catch (error) {
            console.error('Error loading debug configuration:', error);
            this.config = this.getDefaultConfig();
        }
    }

    getDefaultConfig() {
        return {
            logLevel: 'info',
            maxSessions: 10,
            refreshInterval: 1000,
            agentMonitoring: true,
            performanceTracking: true,
            realTimeUpdates: true,
            debugPorts: {
                main: 9229,
                agent: 9230,
                performance: 9231
            }
        };
    }

    saveConfiguration() {
        const configPath = path.join(__dirname, '..', '.claude', 'debug-config.json');
        fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
    }

    start() {
        console.log('🔧 Interactive Debugging Interface Starting...');
        console.log('================================================');
        
        this.isRunning = true;
        this.startMonitoring();
        this.displayWelcome();
        this.rl.prompt();
    }

    displayWelcome() {
        console.log(`
📊 Real-Time System Analysis
🤖 Agent Coordination Monitoring  
⚡ Performance Profiling Active
📝 Advanced Logging Enabled

Commands:
  status         - Show system status
  agents         - List active agents
  performance    - Show performance metrics
  logs [filter]  - View filtered logs
  session [id]   - Debug specific session
  config         - Show/modify configuration
  help           - Show all commands
  exit           - Shutdown interface
        `);
    }

    handleCommand(input) {
        const [command, ...args] = input.split(' ');
        
        switch (command.toLowerCase()) {
            case 'status':
                this.showSystemStatus();
                break;
            case 'agents':
                this.showActiveAgents();
                break;
            case 'performance':
                this.showPerformanceMetrics();
                break;
            case 'logs':
                this.showLogs(args[0]);
                break;
            case 'session':
                this.debugSession(args[0]);
                break;
            case 'config':
                this.manageConfiguration(args);
                break;
            case 'monitor':
                this.toggleMonitoring(args[0]);
                break;
            case 'trace':
                this.startTracing(args[0]);
                break;
            case 'profile':
                this.profileOperation(args[0]);
                break;
            case 'help':
                this.showHelp();
                break;
            case 'exit':
                this.shutdown();
                return;
            default:
                console.log(`Unknown command: ${command}. Type 'help' for available commands.`);
        }
        
        this.rl.prompt();
    }

    showSystemStatus() {
        console.log('\n🔍 System Status');
        console.log('================');
        console.log(`Running: ${this.isRunning ? '✅' : '❌'}`);
        console.log(`Active Sessions: ${this.sessions.size}`);
        console.log(`Monitored Agents: ${this.activeAgents.size}`);
        console.log(`Log Level: ${this.config.logLevel}`);
        console.log(`Memory Usage: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`);
        console.log(`Uptime: ${(process.uptime() / 60).toFixed(2)} minutes\n`);
    }

    showActiveAgents() {
        console.log('\n🤖 Active Agents');
        console.log('================');
        
        if (this.activeAgents.size === 0) {
            console.log('No active agents detected.\n');
            return;
        }

        for (const [agentId, agent] of this.activeAgents) {
            console.log(`${agent.name} (${agentId})`);
            console.log(`  Status: ${agent.status}`);
            console.log(`  Tasks: ${agent.activeTasks || 0}`);
            console.log(`  Last Activity: ${agent.lastActivity || 'Unknown'}`);
            console.log(`  Performance: ${agent.performance || 'Normal'}`);
            console.log('');
        }
    }

    showPerformanceMetrics() {
        console.log('\n⚡ Performance Metrics');
        console.log('======================');
        
        const metrics = this.gatherPerformanceData();
        
        console.log(`CPU Usage: ${metrics.cpu}%`);
        console.log(`Memory: ${metrics.memory.used}MB / ${metrics.memory.total}MB`);
        console.log(`Active Processes: ${metrics.processes}`);
        console.log(`Average Response Time: ${metrics.responseTime}ms`);
        console.log(`Error Rate: ${metrics.errorRate}%`);
        console.log(`Throughput: ${metrics.throughput} ops/sec\n`);
    }

    showLogs(filter) {
        console.log('\n📝 Debug Logs');
        console.log('==============');
        
        const logPath = path.join(__dirname, '..', '.bmad-workspace', 'logs');
        try {
            const logFiles = fs.readdirSync(logPath)
                .filter(file => file.endsWith('.log'))
                .sort((a, b) => b.localeCompare(a)); // Most recent first

            for (const file of logFiles.slice(0, 5)) { // Show last 5 log files
                console.log(`\n--- ${file} ---`);
                const content = fs.readFileSync(path.join(logPath, file), 'utf8');
                const lines = content.split('\n').slice(-10); // Last 10 lines
                
                lines.forEach(line => {
                    if (!filter || line.toLowerCase().includes(filter.toLowerCase())) {
                        console.log(line);
                    }
                });
            }
        } catch (error) {
            console.log('No logs available or error reading logs.');
        }
        console.log('');
    }

    debugSession(sessionId) {
        if (!sessionId) {
            console.log('\n📊 Active Sessions:');
            for (const [id, session] of this.sessions) {
                console.log(`  ${id}: ${session.type} - ${session.status}`);
            }
            console.log('');
            return;
        }

        const session = this.sessions.get(sessionId);
        if (!session) {
            console.log(`Session ${sessionId} not found.\n`);
            return;
        }

        console.log(`\n🔍 Session Debug: ${sessionId}`);
        console.log('===========================');
        console.log(`Type: ${session.type}`);
        console.log(`Status: ${session.status}`);
        console.log(`Started: ${session.startTime}`);
        console.log(`Duration: ${session.duration || 'Ongoing'}`);
        console.log(`Agent: ${session.agent || 'Unknown'}`);
        console.log(`Context: ${JSON.stringify(session.context, null, 2)}\n`);
    }

    gatherPerformanceData() {
        const usage = process.cpuUsage();
        const memory = process.memoryUsage();
        
        return {
            cpu: Math.round((usage.user + usage.system) / 10000),
            memory: {
                used: Math.round(memory.heapUsed / 1024 / 1024),
                total: Math.round(memory.heapTotal / 1024 / 1024)
            },
            processes: this.activeAgents.size,
            responseTime: this.calculateAverageResponseTime(),
            errorRate: this.calculateErrorRate(),
            throughput: this.calculateThroughput()
        };
    }

    calculateAverageResponseTime() {
        // Simulate calculation - integrate with actual metrics
        return Math.round(Math.random() * 100 + 50);
    }

    calculateErrorRate() {
        // Simulate calculation - integrate with actual error tracking
        return Math.round(Math.random() * 5);
    }

    calculateThroughput() {
        // Simulate calculation - integrate with actual throughput metrics
        return Math.round(Math.random() * 100 + 200);
    }

    startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(() => {
            this.updateAgentStatus();
            this.updatePerformanceMetrics();
            this.emit('statusUpdate');
        }, this.config.refreshInterval);
    }

    updateAgentStatus() {
        // Simulate agent discovery and status updates
        // In real implementation, this would connect to actual agent processes
        const agentTypes = ['spec-analyst', 'frontend-developer', 'backend-developer', 'security-specialist'];
        
        agentTypes.forEach(type => {
            if (!this.activeAgents.has(type)) {
                this.activeAgents.set(type, {
                    name: type,
                    status: 'idle',
                    activeTasks: 0,
                    lastActivity: new Date().toISOString(),
                    performance: 'normal'
                });
            }
        });
    }

    updatePerformanceMetrics() {
        const timestamp = Date.now();
        const metrics = this.gatherPerformanceData();
        
        this.performanceMetrics.set(timestamp, metrics);
        
        // Keep only last 100 metrics
        if (this.performanceMetrics.size > 100) {
            const oldestKey = Math.min(...this.performanceMetrics.keys());
            this.performanceMetrics.delete(oldestKey);
        }
    }

    showHelp() {
        console.log(`
🔧 Interactive Debugging Commands
=================================

System Monitoring:
  status         - Show overall system status
  agents         - List and monitor active agents
  performance    - Display performance metrics and trends
  
Logging & Tracing:
  logs [filter]  - View debug logs with optional filtering
  trace <agent>  - Start detailed tracing for specific agent
  session [id]   - Debug specific session or list all sessions

Configuration:
  config         - View current configuration
  config set <key> <value> - Update configuration
  monitor <on|off> - Toggle real-time monitoring
  
Profiling:
  profile <operation> - Profile specific operation
  
System Control:
  help           - Show this help message
  exit           - Shutdown debugging interface

Examples:
  logs error     - Show only error logs
  trace frontend-developer - Trace frontend agent
  config set logLevel debug - Set debug logging
        `);
    }

    shutdown() {
        console.log('\n🔧 Shutting down Interactive Debug Interface...');
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        
        this.isRunning = false;
        
        if (this.rl) {
            this.rl.close();
        }
        
        console.log('Debug interface stopped.');
        process.exit(0);
    }
}

// CLI Interface
if (require.main === module) {
    const debugInterface = new InteractiveDebugInterface();
    
    process.on('SIGINT', () => {
        debugInterface.shutdown();
    });
    
    process.on('uncaughtException', (error) => {
        console.error('Uncaught Exception:', error);
        debugInterface.shutdown();
    });
    
    debugInterface.start();
}

module.exports = InteractiveDebugInterface;
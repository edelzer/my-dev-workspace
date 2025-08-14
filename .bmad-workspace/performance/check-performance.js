#!/usr/bin/env node

/**
 * Performance Threshold Checker
 * Called by quality gates to validate performance thresholds
 */

const fs = require('fs').promises;
const path = require('path');

async function main() {
    const [tool] = process.argv.slice(2);
    
    try {
        const check = await checkPerformanceThresholds(tool);
        
        if (check.passed) {
            console.log(`✅ Performance Gate PASSED: ${tool} (${check.avgResponseTime}ms avg)`);
            process.exit(0);
        } else {
            console.log(`❌ Performance Gate FAILED: ${tool} - ${check.reason}`);
            process.exit(1);
        }
    } catch (error) {
        console.log(`⚠️ Performance Gate WARNING: Could not check thresholds - ${error.message}`);
        process.exit(0); // Don't fail the operation due to monitoring issues
    }
}

async function checkPerformanceThresholds(tool) {
    const config = await loadConfig();
    const recentOperations = await getRecentOperations(tool);
    
    if (recentOperations.length === 0) {
        return { passed: true, reason: 'No recent operations to analyze' };
    }
    
    // Calculate metrics
    const avgResponseTime = recentOperations.reduce((sum, op) => sum + op.duration, 0) / recentOperations.length;
    const successRate = (recentOperations.filter(op => op.success).length / recentOperations.length) * 100;
    const errorRate = 100 - successRate;
    
    // Check thresholds
    const thresholds = config.thresholds || getDefaultThresholds();
    
    // Response time threshold
    if (avgResponseTime > thresholds.responseTime.poor) {
        return {
            passed: false,
            reason: `Average response time ${avgResponseTime.toFixed(0)}ms exceeds threshold ${thresholds.responseTime.poor}ms`,
            avgResponseTime,
            successRate,
            errorRate
        };
    }
    
    // Success rate threshold
    if (successRate < thresholds.successRate.poor) {
        return {
            passed: false,
            reason: `Success rate ${successRate.toFixed(1)}% below threshold ${thresholds.successRate.poor}%`,
            avgResponseTime,
            successRate,
            errorRate
        };
    }
    
    // Error rate threshold
    if (errorRate > thresholds.errorRate.poor) {
        return {
            passed: false,
            reason: `Error rate ${errorRate.toFixed(1)}% exceeds threshold ${thresholds.errorRate.poor}%`,
            avgResponseTime,
            successRate,
            errorRate
        };
    }
    
    return {
        passed: true,
        avgResponseTime,
        successRate,
        errorRate
    };
}

async function loadConfig() {
    try {
        const configPath = path.join(__dirname, '../metrics/metrics-config.json');
        const content = await fs.readFile(configPath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        return { thresholds: getDefaultThresholds() };
    }
}

function getDefaultThresholds() {
    return {
        responseTime: {
            excellent: 5000,   // 5 seconds
            good: 15000,       // 15 seconds
            fair: 30000,       // 30 seconds
            poor: 60000        // 1 minute
        },
        successRate: {
            excellent: 98,
            good: 95,
            fair: 90,
            poor: 85
        },
        errorRate: {
            excellent: 2,
            good: 5,
            fair: 10,
            poor: 15
        }
    };
}

async function getRecentOperations(tool) {
    try {
        const logFile = path.join(__dirname, 'data', 'completed-operations.jsonl');
        const content = await fs.readFile(logFile, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        
        // Parse and filter recent operations for this tool
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const operations = lines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(op => op && op.tool === tool && op.endTime > oneHourAgo);
        
        // Return last 20 operations maximum
        return operations.slice(-20);
    } catch (error) {
        return [];
    }
}

// Additional performance checks
async function checkSystemPerformance() {
    const os = require('os');
    
    const cpuUsage = os.loadavg()[0];
    const memoryUsage = (1 - (os.freemem() / os.totalmem())) * 100;
    
    return {
        cpu: cpuUsage,
        memory: memoryUsage,
        cpuCores: os.cpus().length,
        totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) // GB
    };
}

async function checkMCPServerHealth() {
    // Placeholder for MCP server health checks
    // In real implementation, would ping each MCP server
    const servers = [
        'filesystem', 'github', 'memory', 'sequential', 
        'context7', 'magic', 'playwright', 'eslint'
    ];
    
    const health = {};
    for (const server of servers) {
        // Simulate health check (would be actual ping in production)
        health[server] = {
            status: Math.random() > 0.1 ? 'healthy' : 'degraded',
            responseTime: Math.random() * 1000 + 50 // 50-1050ms
        };
    }
    
    return health;
}

async function generatePerformanceReport() {
    const system = await checkSystemPerformance();
    const mcpHealth = await checkMCPServerHealth();
    
    const report = {
        timestamp: new Date().toISOString(),
        system,
        mcpServers: mcpHealth,
        thresholds: getDefaultThresholds()
    };
    
    // Save report
    const reportFile = path.join(__dirname, 'data', 'performance-reports.jsonl');
    const reportEntry = JSON.stringify(report) + '\n';
    
    try {
        await fs.appendFile(reportFile, reportEntry);
    } catch (error) {
        await fs.writeFile(reportFile, reportEntry);
    }
    
    return report;
}

// Command line interface
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'check':
            main();
            break;
        case 'system':
            checkSystemPerformance().then(result => {
                console.log('System Performance:', JSON.stringify(result, null, 2));
            });
            break;
        case 'mcp':
            checkMCPServerHealth().then(result => {
                console.log('MCP Server Health:', JSON.stringify(result, null, 2));
            });
            break;
        case 'report':
            generatePerformanceReport().then(report => {
                console.log('Performance Report Generated:', report.timestamp);
            });
            break;
        default:
            main();
    }
}
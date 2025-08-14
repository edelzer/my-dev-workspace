#!/usr/bin/env node

/**
 * System Resource Monitoring Script
 * Continuously monitors and logs system resource usage
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const METRICS_FILE = path.join(__dirname, 'data', 'resource-metrics.jsonl');
const ALERT_THRESHOLDS = {
    cpu: 80,      // 80% CPU usage
    memory: 85,   // 85% memory usage
    disk: 90      // 90% disk usage
};

async function main() {
    try {
        const metrics = await collectResourceMetrics();
        await saveMetrics(metrics);
        await checkAlertThresholds(metrics);
        
        // Output summary for hook display
        console.log(`📊 Resources: CPU ${metrics.cpu.toFixed(1)}% | Memory ${metrics.memory.usage.toFixed(1)}% | Load ${metrics.loadAverage[0].toFixed(2)}`);
        
    } catch (error) {
        console.log(`⚠️ Resource monitoring error: ${error.message}`);
    }
}

async function collectResourceMetrics() {
    const timestamp = Date.now();
    
    // CPU and Load Average
    const loadAverage = os.loadavg();
    const cpuUsage = loadAverage[0]; // 1-minute load average as CPU indicator
    
    // Memory Usage
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;
    
    // System Information
    const cpuInfo = os.cpus();
    const platform = os.platform();
    const uptime = os.uptime();
    
    // Network Interfaces (for network monitoring)
    const networkInterfaces = os.networkInterfaces();
    
    const metrics = {
        timestamp,
        cpu: cpuUsage,
        loadAverage,
        memory: {
            total: totalMemory,
            free: freeMemory,
            used: usedMemory,
            usage: memoryUsagePercent
        },
        system: {
            platform,
            cpuCount: cpuInfo.length,
            cpuModel: cpuInfo[0]?.model || 'Unknown',
            uptime,
            arch: os.arch()
        },
        network: Object.keys(networkInterfaces).length,
        processes: await getProcessCount()
    };
    
    return metrics;
}

async function getProcessCount() {
    try {
        // Platform-specific process counting
        if (os.platform() === 'win32') {
            const { exec } = require('child_process');
            return new Promise((resolve) => {
                exec('tasklist /fo csv | find /c /v ""', (error, stdout) => {
                    if (error) resolve(0);
                    else resolve(parseInt(stdout.trim()) - 1 || 0); // Subtract header
                });
            });
        } else {
            const { exec } = require('child_process');
            return new Promise((resolve) => {
                exec('ps aux | wc -l', (error, stdout) => {
                    if (error) resolve(0);
                    else resolve(parseInt(stdout.trim()) - 1 || 0); // Subtract header
                });
            });
        }
    } catch (error) {
        return 0;
    }
}

async function saveMetrics(metrics) {
    const dataDir = path.dirname(METRICS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    const logEntry = JSON.stringify(metrics) + '\n';
    
    try {
        await fs.appendFile(METRICS_FILE, logEntry);
    } catch (error) {
        // Create file if it doesn't exist
        await fs.writeFile(METRICS_FILE, logEntry);
    }
    
    // Keep only last 1000 entries to prevent file from growing too large
    await trimMetricsFile();
}

async function trimMetricsFile() {
    try {
        const content = await fs.readFile(METRICS_FILE, 'utf8');
        const lines = content.trim().split('\n');
        
        if (lines.length > 1000) {
            const trimmedLines = lines.slice(-1000); // Keep last 1000 entries
            await fs.writeFile(METRICS_FILE, trimmedLines.join('\n') + '\n');
        }
    } catch (error) {
        // Ignore errors in trimming
    }
}

async function checkAlertThresholds(metrics) {
    const alerts = [];
    
    // CPU Alert
    if (metrics.cpu > ALERT_THRESHOLDS.cpu) {
        alerts.push({
            type: 'cpu',
            severity: metrics.cpu > 90 ? 'critical' : 'high',
            message: `High CPU usage: ${metrics.cpu.toFixed(1)}%`,
            value: metrics.cpu,
            threshold: ALERT_THRESHOLDS.cpu
        });
    }
    
    // Memory Alert
    if (metrics.memory.usage > ALERT_THRESHOLDS.memory) {
        alerts.push({
            type: 'memory',
            severity: metrics.memory.usage > 95 ? 'critical' : 'high',
            message: `High memory usage: ${metrics.memory.usage.toFixed(1)}%`,
            value: metrics.memory.usage,
            threshold: ALERT_THRESHOLDS.memory
        });
    }
    
    // Load Average Alert (if very high)
    if (metrics.loadAverage[0] > metrics.system.cpuCount * 2) {
        alerts.push({
            type: 'load',
            severity: 'high',
            message: `High system load: ${metrics.loadAverage[0].toFixed(2)}`,
            value: metrics.loadAverage[0],
            threshold: metrics.system.cpuCount * 2
        });
    }
    
    // Save alerts if any
    if (alerts.length > 0) {
        await saveAlerts(alerts);
        
        // Display alerts
        for (const alert of alerts) {
            const icon = alert.severity === 'critical' ? '🚨' : '⚠️';
            console.log(`${icon} ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
        }
    }
}

async function saveAlerts(alerts) {
    const alertFile = path.join(__dirname, 'data', 'resource-alerts.jsonl');
    
    for (const alert of alerts) {
        const alertEntry = {
            ...alert,
            timestamp: Date.now()
        };
        
        const logEntry = JSON.stringify(alertEntry) + '\n';
        
        try {
            await fs.appendFile(alertFile, logEntry);
        } catch (error) {
            await fs.writeFile(alertFile, logEntry);
        }
    }
}

async function getResourceTrends() {
    try {
        const content = await fs.readFile(METRICS_FILE, 'utf8');
        const lines = content.trim().split('\n').filter(line => line);
        
        // Get last hour of data
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        const recentMetrics = lines
            .map(line => {
                try {
                    return JSON.parse(line);
                } catch {
                    return null;
                }
            })
            .filter(metric => metric && metric.timestamp > oneHourAgo);
        
        if (recentMetrics.length === 0) {
            return null;
        }
        
        // Calculate trends
        const avgCpu = recentMetrics.reduce((sum, m) => sum + m.cpu, 0) / recentMetrics.length;
        const avgMemory = recentMetrics.reduce((sum, m) => sum + m.memory.usage, 0) / recentMetrics.length;
        const maxCpu = Math.max(...recentMetrics.map(m => m.cpu));
        const maxMemory = Math.max(...recentMetrics.map(m => m.memory.usage));
        
        return {
            period: '1 hour',
            dataPoints: recentMetrics.length,
            cpu: {
                average: avgCpu,
                peak: maxCpu,
                current: recentMetrics[recentMetrics.length - 1].cpu
            },
            memory: {
                average: avgMemory,
                peak: maxMemory,
                current: recentMetrics[recentMetrics.length - 1].memory.usage
            }
        };
    } catch (error) {
        return null;
    }
}

async function generateResourceReport() {
    const currentMetrics = await collectResourceMetrics();
    const trends = await getResourceTrends();
    
    const report = {
        timestamp: new Date().toISOString(),
        current: currentMetrics,
        trends,
        thresholds: ALERT_THRESHOLDS,
        status: {
            cpu: currentMetrics.cpu > ALERT_THRESHOLDS.cpu ? 'warning' : 'ok',
            memory: currentMetrics.memory.usage > ALERT_THRESHOLDS.memory ? 'warning' : 'ok',
            overall: (currentMetrics.cpu > ALERT_THRESHOLDS.cpu || 
                     currentMetrics.memory.usage > ALERT_THRESHOLDS.memory) ? 'warning' : 'ok'
        }
    };
    
    return report;
}

// Command line interface
if (require.main === module) {
    const command = process.argv[2];
    
    switch (command) {
        case 'trends':
            getResourceTrends().then(trends => {
                if (trends) {
                    console.log('Resource Trends:', JSON.stringify(trends, null, 2));
                } else {
                    console.log('No trend data available');
                }
            });
            break;
        case 'report':
            generateResourceReport().then(report => {
                console.log('Resource Report:', JSON.stringify(report, null, 2));
            });
            break;
        case 'status':
            generateResourceReport().then(report => {
                console.log(`Status: ${report.status.overall.toUpperCase()}`);
                console.log(`CPU: ${report.current.cpu.toFixed(1)}% (${report.status.cpu})`);
                console.log(`Memory: ${report.current.memory.usage.toFixed(1)}% (${report.status.memory})`);
            });
            break;
        default:
            main();
    }
}
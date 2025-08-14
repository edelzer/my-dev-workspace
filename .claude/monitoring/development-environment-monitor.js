#!/usr/bin/env node

/**
 * Development Environment Monitoring System
 * 
 * Comprehensive monitoring for Claude Code development environment
 * Performance metrics, resource optimization, error tracking, and analytics
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class DevelopmentEnvironmentMonitor {
    constructor(config = {}) {
        this.config = {
            metricsRetentionDays: 30,
            alertThresholds: {
                cpuUsage: 80,
                memoryUsage: 85,
                diskUsage: 90,
                errorRate: 5
            },
            monitoringInterval: 60000, // 1 minute
            logPath: path.join(process.cwd(), '.claude', 'monitoring', 'logs'),
            metricsPath: path.join(process.cwd(), '.claude', 'monitoring', 'metrics'),
            ...config
        };
        
        this.isMonitoring = false;
        this.metrics = {
            performance: [],
            errors: [],
            resources: [],
            claude: []
        };
        
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.config.logPath, { recursive: true });
            await fs.mkdir(this.config.metricsPath, { recursive: true });
            console.log('Development Environment Monitor initialized');
        } catch (error) {
            console.error('Failed to initialize monitor:', error.message);
        }
    }

    // Performance Metrics Tracking
    async collectPerformanceMetrics() {
        const timestamp = new Date().toISOString();
        
        const metrics = {
            timestamp,
            system: {
                cpuUsage: await this.getCpuUsage(),
                memoryUsage: this.getMemoryUsage(),
                diskUsage: await this.getDiskUsage(),
                loadAverage: os.loadavg(),
                uptime: os.uptime()
            },
            process: {
                pid: process.pid,
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
                uptime: process.uptime()
            },
            development: {
                activeProjects: await this.getActiveProjects(),
                claudeInstances: await this.getClaudeInstances(),
                gitStatus: await this.getGitMetrics(),
                dependencies: await this.getDependencyHealth()
            }
        };

        this.metrics.performance.push(metrics);
        await this.persistMetrics('performance', metrics);
        
        return metrics;
    }

    async getCpuUsage() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('wmic cpu get loadpercentage /value', { encoding: 'utf8' });
                const match = output.match(/LoadPercentage=(\d+)/);
                return match ? parseInt(match[1]) : 0;
            } else {
                const output = execSync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | awk -F\'%\' \'{print $1}\'', { encoding: 'utf8' });
                return parseFloat(output.trim());
            }
        } catch (error) {
            return 0;
        }
    }

    getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        const used = total - free;
        
        return {
            total: Math.round(total / 1024 / 1024 / 1024 * 100) / 100, // GB
            used: Math.round(used / 1024 / 1024 / 1024 * 100) / 100,   // GB
            free: Math.round(free / 1024 / 1024 / 1024 * 100) / 100,   // GB
            percentage: Math.round((used / total) * 100)
        };
    }

    async getDiskUsage() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('wmic logicaldisk get size,freespace,caption', { encoding: 'utf8' });
                // Parse Windows disk usage
                return { percentage: 0, details: output.trim() };
            } else {
                const output = execSync('df -h /', { encoding: 'utf8' });
                const lines = output.trim().split('\n');
                if (lines.length > 1) {
                    const parts = lines[1].split(/\s+/);
                    const usage = parts[4].replace('%', '');
                    return { percentage: parseInt(usage), details: output.trim() };
                }
            }
        } catch (error) {
            return { percentage: 0, error: error.message };
        }
    }

    async getActiveProjects() {
        try {
            const projectsDir = path.join(process.cwd(), 'projects');
            const projects = await fs.readdir(projectsDir).catch(() => []);
            
            const projectMetrics = [];
            for (const project of projects) {
                const projectPath = path.join(projectsDir, project);
                const stats = await fs.stat(projectPath).catch(() => null);
                if (stats && stats.isDirectory()) {
                    projectMetrics.push({
                        name: project,
                        lastModified: stats.mtime,
                        hasGit: await this.checkGitRepo(projectPath),
                        hasPackageJson: await this.checkFile(projectPath, 'package.json'),
                        hasReadme: await this.checkFile(projectPath, 'README.md')
                    });
                }
            }
            
            return projectMetrics;
        } catch (error) {
            return [];
        }
    }

    async getClaudeInstances() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('tasklist /FI "IMAGENAME eq claude*" /FO CSV', { encoding: 'utf8' });
                return output.split('\n').length - 2; // Exclude header and empty line
            } else {
                const output = execSync('pgrep -f claude | wc -l', { encoding: 'utf8' });
                return parseInt(output.trim());
            }
        } catch (error) {
            return 0;
        }
    }

    async getGitMetrics() {
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
            const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
            const commits = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
            
            return {
                branch,
                totalCommits: parseInt(commits),
                uncommittedChanges: status.split('\n').filter(line => line.trim()).length,
                isClean: !status
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getDependencyHealth() {
        try {
            const packagePath = path.join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
            
            // Check for outdated dependencies
            try {
                const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
                const outdatedDeps = Object.keys(JSON.parse(outdated || '{}'));
                return {
                    total: Object.keys(packageJson.dependencies || {}).length,
                    outdated: outdatedDeps.length,
                    health: outdatedDeps.length === 0 ? 'healthy' : 'needs-update'
                };
            } catch {
                return { status: 'unknown' };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    // Error Tracking and Alerting
    async trackError(error, context = {}) {
        const errorData = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            context,
            severity: this.classifyError(error),
            resolved: false
        };

        this.metrics.errors.push(errorData);
        await this.persistMetrics('errors', errorData);
        
        // Check if alert should be sent
        await this.checkErrorThresholds();
        
        return errorData;
    }

    classifyError(error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('critical') || message.includes('fatal')) return 'critical';
        if (message.includes('error') || message.includes('failed')) return 'high';
        if (message.includes('warning') || message.includes('deprecated')) return 'medium';
        return 'low';
    }

    async checkErrorThresholds() {
        const recentErrors = this.metrics.errors.filter(
            error => new Date() - new Date(error.timestamp) < 3600000 // Last hour
        );
        
        const errorRate = recentErrors.length;
        
        if (errorRate >= this.config.alertThresholds.errorRate) {
            await this.sendAlert({
                type: 'error_threshold',
                message: `Error rate threshold exceeded: ${errorRate} errors in the last hour`,
                severity: 'high',
                data: { errorRate, threshold: this.config.alertThresholds.errorRate }
            });
        }
    }

    // Resource Usage Optimization
    async optimizeResources() {
        const metrics = await this.collectPerformanceMetrics();
        const optimizations = [];

        // CPU optimization
        if (metrics.system.cpuUsage > this.config.alertThresholds.cpuUsage) {
            optimizations.push({
                type: 'cpu',
                action: 'reduce_parallel_processes',
                current: metrics.system.cpuUsage,
                threshold: this.config.alertThresholds.cpuUsage
            });
        }

        // Memory optimization
        if (metrics.system.memoryUsage.percentage > this.config.alertThresholds.memoryUsage) {
            optimizations.push({
                type: 'memory',
                action: 'clear_cache_and_temp',
                current: metrics.system.memoryUsage.percentage,
                threshold: this.config.alertThresholds.memoryUsage
            });
        }

        // Disk optimization
        if (metrics.system.diskUsage.percentage > this.config.alertThresholds.diskUsage) {
            optimizations.push({
                type: 'disk',
                action: 'cleanup_temp_files',
                current: metrics.system.diskUsage.percentage,
                threshold: this.config.alertThresholds.diskUsage
            });
        }

        if (optimizations.length > 0) {
            await this.applyOptimizations(optimizations);
        }

        return optimizations;
    }

    async applyOptimizations(optimizations) {
        const results = [];

        for (const optimization of optimizations) {
            try {
                switch (optimization.action) {
                    case 'clear_cache_and_temp':
                        await this.clearCache();
                        break;
                    case 'cleanup_temp_files':
                        await this.cleanupTempFiles();
                        break;
                    case 'reduce_parallel_processes':
                        await this.suggestProcessReduction();
                        break;
                }
                
                results.push({ ...optimization, status: 'applied' });
            } catch (error) {
                results.push({ ...optimization, status: 'failed', error: error.message });
            }
        }

        await this.persistMetrics('optimizations', { timestamp: new Date().toISOString(), results });
        return results;
    }

    async clearCache() {
        try {
            // Clear npm cache
            execSync('npm cache clean --force', { stdio: 'ignore' });
            console.log('NPM cache cleared');
        } catch (error) {
            console.log('Cache clearing completed with warnings');
        }
    }

    async cleanupTempFiles() {
        try {
            const tempDirs = [
                path.join(process.cwd(), 'node_modules', '.cache'),
                path.join(process.cwd(), '.tmp'),
                path.join(process.cwd(), 'dist'),
                path.join(process.cwd(), 'build')
            ];

            for (const dir of tempDirs) {
                try {
                    await fs.rmdir(dir, { recursive: true });
                    console.log(`Cleaned up ${dir}`);
                } catch (error) {
                    // Directory might not exist, which is fine
                }
            }
        } catch (error) {
            console.log('Temp file cleanup completed with warnings');
        }
    }

    async suggestProcessReduction() {
        console.log('High CPU usage detected. Consider:');
        console.log('- Reducing parallel build processes');
        console.log('- Closing unused development servers');
        console.log('- Limiting concurrent test runs');
    }

    // Analytics Dashboard Data
    async generateAnalyticsDashboard() {
        const dashboard = {
            timestamp: new Date().toISOString(),
            summary: {
                systemHealth: await this.getSystemHealthScore(),
                activeProjects: (await this.getActiveProjects()).length,
                errorRate: this.calculateErrorRate(),
                performanceTrend: this.calculatePerformanceTrend()
            },
            metrics: {
                performance: this.metrics.performance.slice(-24), // Last 24 measurements
                errors: this.metrics.errors.slice(-50),           // Last 50 errors
                resources: await this.collectPerformanceMetrics()
            },
            recommendations: await this.generateRecommendations()
        };

        await this.persistMetrics('dashboard', dashboard);
        return dashboard;
    }

    async getSystemHealthScore() {
        const metrics = await this.collectPerformanceMetrics();
        let score = 100;

        // Deduct points for high resource usage
        if (metrics.system.cpuUsage > 70) score -= 20;
        if (metrics.system.memoryUsage.percentage > 80) score -= 20;
        if (metrics.system.diskUsage.percentage > 85) score -= 20;

        // Deduct points for recent errors
        const recentErrors = this.metrics.errors.filter(
            error => new Date() - new Date(error.timestamp) < 3600000
        );
        score -= recentErrors.length * 5;

        return Math.max(0, score);
    }

    calculateErrorRate() {
        const last24Hours = this.metrics.errors.filter(
            error => new Date() - new Date(error.timestamp) < 86400000
        );
        return last24Hours.length;
    }

    calculatePerformanceTrend() {
        if (this.metrics.performance.length < 2) return 'insufficient_data';

        const recent = this.metrics.performance.slice(-5);
        const avgCpu = recent.reduce((sum, m) => sum + m.system.cpuUsage, 0) / recent.length;
        const avgMemory = recent.reduce((sum, m) => sum + m.system.memoryUsage.percentage, 0) / recent.length;

        if (avgCpu < 50 && avgMemory < 70) return 'excellent';
        if (avgCpu < 70 && avgMemory < 80) return 'good';
        if (avgCpu < 85 && avgMemory < 90) return 'fair';
        return 'poor';
    }

    async generateRecommendations() {
        const recommendations = [];
        const metrics = await this.collectPerformanceMetrics();

        if (metrics.system.cpuUsage > 80) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'High CPU usage detected. Consider optimizing build processes.',
                action: 'optimize_cpu'
            });
        }

        if (metrics.system.memoryUsage.percentage > 85) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                message: 'High memory usage. Consider restarting development servers.',
                action: 'optimize_memory'
            });
        }

        const recentErrors = this.metrics.errors.filter(
            error => new Date() - new Date(error.timestamp) < 3600000
        );

        if (recentErrors.length > 5) {
            recommendations.push({
                type: 'stability',
                priority: 'medium',
                message: 'Multiple recent errors detected. Review error logs.',
                action: 'review_errors'
            });
        }

        return recommendations;
    }

    // Automated Performance Optimization
    async enableAutomatedOptimization() {
        if (this.isMonitoring) {
            console.log('Automated optimization already running');
            return;
        }

        this.isMonitoring = true;
        console.log('Starting automated performance optimization...');

        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectPerformanceMetrics();
                await this.optimizeResources();
                await this.cleanupOldMetrics();
            } catch (error) {
                await this.trackError(error, { context: 'automated_optimization' });
            }
        }, this.config.monitoringInterval);

        console.log(`Monitoring started with ${this.config.monitoringInterval}ms interval`);
    }

    async disableAutomatedOptimization() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.isMonitoring = false;
        console.log('Automated optimization stopped');
    }

    // Utility Methods
    async persistMetrics(type, data) {
        try {
            const filename = `${type}-${new Date().toISOString().split('T')[0]}.json`;
            const filepath = path.join(this.config.metricsPath, filename);
            
            let existingData = [];
            try {
                const existing = await fs.readFile(filepath, 'utf8');
                existingData = JSON.parse(existing);
            } catch (error) {
                // File doesn't exist yet, which is fine
            }

            existingData.push(data);
            await fs.writeFile(filepath, JSON.stringify(existingData, null, 2));
        } catch (error) {
            console.error(`Failed to persist ${type} metrics:`, error.message);
        }
    }

    async cleanupOldMetrics() {
        try {
            const files = await fs.readdir(this.config.metricsPath);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays);

            for (const file of files) {
                const filepath = path.join(this.config.metricsPath, file);
                const stats = await fs.stat(filepath);
                
                if (stats.mtime < cutoffDate) {
                    await fs.unlink(filepath);
                    console.log(`Cleaned up old metrics file: ${file}`);
                }
            }
        } catch (error) {
            console.error('Failed to cleanup old metrics:', error.message);
        }
    }

    async sendAlert(alert) {
        const alertData = {
            ...alert,
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substring(7)
        };

        // Log alert
        console.warn(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
        
        // Persist alert
        await this.persistMetrics('alerts', alertData);
        
        // Could integrate with external alerting systems here
        return alertData;
    }

    async checkFile(dirPath, filename) {
        try {
            await fs.access(path.join(dirPath, filename));
            return true;
        } catch {
            return false;
        }
    }

    async checkGitRepo(dirPath) {
        return await this.checkFile(dirPath, '.git');
    }

    // Public API
    async status() {
        return {
            isMonitoring: this.isMonitoring,
            config: this.config,
            metricsCount: {
                performance: this.metrics.performance.length,
                errors: this.metrics.errors.length
            },
            systemHealth: await this.getSystemHealthScore()
        };
    }

    async getMetrics(type = 'all', limit = 100) {
        if (type === 'all') {
            return {
                performance: this.metrics.performance.slice(-limit),
                errors: this.metrics.errors.slice(-limit),
                dashboard: await this.generateAnalyticsDashboard()
            };
        }
        
        return this.metrics[type]?.slice(-limit) || [];
    }
}

// CLI Interface
if (require.main === module) {
    const monitor = new DevelopmentEnvironmentMonitor();
    
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch (command) {
        case 'start':
            monitor.enableAutomatedOptimization();
            break;
        case 'stop':
            monitor.disableAutomatedOptimization();
            break;
        case 'status':
            monitor.status().then(status => console.log(JSON.stringify(status, null, 2)));
            break;
        case 'metrics':
            const type = args[0] || 'all';
            const limit = parseInt(args[1]) || 100;
            monitor.getMetrics(type, limit).then(metrics => console.log(JSON.stringify(metrics, null, 2)));
            break;
        case 'dashboard':
            monitor.generateAnalyticsDashboard().then(dashboard => console.log(JSON.stringify(dashboard, null, 2)));
            break;
        case 'optimize':
            monitor.optimizeResources().then(results => console.log(JSON.stringify(results, null, 2)));
            break;
        default:
            console.log(`
Development Environment Monitor v1.0

Usage:
  node development-environment-monitor.js <command> [options]

Commands:
  start                 Start automated monitoring and optimization
  stop                  Stop automated monitoring
  status                Show current monitoring status
  metrics [type] [limit] Get metrics (types: performance, errors, all)
  dashboard             Generate analytics dashboard
  optimize              Run manual resource optimization

Examples:
  node development-environment-monitor.js start
  node development-environment-monitor.js metrics performance 50
  node development-environment-monitor.js dashboard
            `);
    }
}

module.exports = DevelopmentEnvironmentMonitor;
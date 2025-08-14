#!/usr/bin/env node

/**
 * System Resource Management System
 * 
 * Intelligent resource allocation, memory optimization, CPU/network monitoring,
 * contention resolution, and capacity planning for development environments
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class SystemResourceManager {
    constructor(config = {}) {
        this.config = {
            // Resource thresholds
            cpuThreshold: 80,
            memoryThreshold: 85,
            diskThreshold: 90,
            networkThreshold: 80,
            
            // Optimization settings
            maxConcurrentProcesses: os.cpus().length,
            memoryBufferGB: 2,
            diskBufferGB: 5,
            networkTimeoutMs: 30000,
            
            // Monitoring intervals
            monitoringInterval: 30000, // 30 seconds
            cleanupInterval: 300000,   // 5 minutes
            planningInterval: 3600000, // 1 hour
            
            // File paths
            logPath: path.join(process.cwd(), '.claude', 'monitoring', 'resource-logs'),
            metricsPath: path.join(process.cwd(), '.claude', 'monitoring', 'resource-metrics'),
            cachePath: path.join(process.cwd(), '.claude', 'monitoring', 'cache'),
            
            // Resource limits
            maxCacheSize: 1024 * 1024 * 1024, // 1GB
            maxLogSize: 100 * 1024 * 1024,    // 100MB
            retentionDays: 30,
            
            ...config
        };
        
        this.resourceMetrics = {
            cpu: [],
            memory: [],
            disk: [],
            network: [],
            processes: []
        };
        
        this.activeMonitoring = false;
        this.resourceAllocations = new Map();
        this.processRegistry = new Map();
        this.contentionQueue = [];
        
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.config.logPath, { recursive: true });
            await fs.mkdir(this.config.metricsPath, { recursive: true });
            await fs.mkdir(this.config.cachePath, { recursive: true });
            
            // Initialize resource allocation tracking
            await this.initializeResourceTracking();
            
            console.log('System Resource Manager initialized');
        } catch (error) {
            console.error('Failed to initialize System Resource Manager:', error.message);
        }
    }

    async initializeResourceTracking() {
        // Set up initial resource baselines
        const baseline = await this.collectResourceMetrics();
        this.baselineMetrics = baseline;
        
        // Initialize process registry
        await this.updateProcessRegistry();
        
        // Set up resource allocation pools
        this.initializeResourcePools();
    }

    initializeResourcePools() {
        const totalMemory = os.totalmem();
        const totalCpus = os.cpus().length;
        
        this.resourcePools = {
            memory: {
                total: totalMemory,
                available: totalMemory * 0.8, // Reserve 20% for system
                allocated: 0,
                reservations: new Map()
            },
            cpu: {
                total: totalCpus,
                available: totalCpus * 0.9, // Reserve 10% for system
                allocated: 0,
                reservations: new Map()
            },
            disk: {
                available: 0, // Will be updated during monitoring
                allocated: 0,
                reservations: new Map()
            },
            network: {
                bandwidthMbps: 1000, // Default assumption, can be configured
                allocated: 0,
                reservations: new Map()
            }
        };
    }

    // Resource Monitoring
    async collectResourceMetrics() {
        const timestamp = Date.now();
        
        const metrics = {
            timestamp,
            cpu: await this.getCPUMetrics(),
            memory: await this.getMemoryMetrics(),
            disk: await this.getDiskMetrics(),
            network: await this.getNetworkMetrics(),
            processes: await this.getProcessMetrics(),
            system: {
                loadAverage: os.loadavg(),
                uptime: os.uptime(),
                platform: os.platform(),
                release: os.release()
            }
        };

        // Store metrics
        this.resourceMetrics.cpu.push(metrics.cpu);
        this.resourceMetrics.memory.push(metrics.memory);
        this.resourceMetrics.disk.push(metrics.disk);
        this.resourceMetrics.network.push(metrics.network);
        this.resourceMetrics.processes.push(metrics.processes);

        // Trim old metrics
        this.trimMetricsHistory();
        
        // Persist metrics
        await this.persistResourceMetrics(metrics);
        
        return metrics;
    }

    async getCPUMetrics() {
        try {
            const usage = await this.getCurrentCPUUsage();
            const coreCount = os.cpus().length;
            const loadAvg = os.loadavg();
            
            return {
                usage: usage,
                coreCount,
                loadAverage: {
                    '1min': loadAvg[0],
                    '5min': loadAvg[1],
                    '15min': loadAvg[2]
                },
                temperature: await this.getCPUTemperature(),
                processes: await this.getTopCPUProcesses()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getCurrentCPUUsage() {
        if (process.platform === 'win32') {
            try {
                const output = execSync('wmic cpu get loadpercentage /value', { encoding: 'utf8' });
                const match = output.match(/LoadPercentage=(\d+)/);
                return match ? parseInt(match[1]) : 0;
            } catch (error) {
                return 0;
            }
        } else {
            try {
                const output = execSync("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | awk -F'%' '{print $1}'", { encoding: 'utf8' });
                return parseFloat(output.trim()) || 0;
            } catch (error) {
                return 0;
            }
        }
    }

    async getCPUTemperature() {
        try {
            if (process.platform === 'win32') {
                // Windows thermal information is more complex to get
                return { status: 'unavailable', platform: 'windows' };
            } else if (process.platform === 'linux') {
                const output = execSync('cat /sys/class/thermal/thermal_zone*/temp', { encoding: 'utf8' });
                const temps = output.trim().split('\n').map(temp => parseInt(temp) / 1000);
                return {
                    average: temps.reduce((sum, temp) => sum + temp, 0) / temps.length,
                    max: Math.max(...temps),
                    zones: temps
                };
            } else {
                return { status: 'unavailable', platform: process.platform };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    async getTopCPUProcesses() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('tasklist /FO CSV | findstr /i "claude\\|node\\|npm\\|git"', { encoding: 'utf8' });
                return this.parseWindowsProcesses(output);
            } else {
                const output = execSync('ps aux --sort=-%cpu | head -10', { encoding: 'utf8' });
                return this.parseUnixProcesses(output);
            }
        } catch (error) {
            return [];
        }
    }

    parseWindowsProcesses(output) {
        const lines = output.trim().split('\n');
        const processes = [];
        
        for (const line of lines) {
            const parts = line.split(',').map(part => part.replace(/"/g, ''));
            if (parts.length >= 5) {
                processes.push({
                    name: parts[0],
                    pid: parts[1],
                    memory: parts[4]
                });
            }
        }
        
        return processes.slice(0, 5);
    }

    parseUnixProcesses(output) {
        const lines = output.trim().split('\n').slice(1); // Skip header
        const processes = [];
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 11) {
                processes.push({
                    user: parts[0],
                    pid: parts[1],
                    cpu: parseFloat(parts[2]),
                    memory: parseFloat(parts[3]),
                    command: parts.slice(10).join(' ')
                });
            }
        }
        
        return processes.slice(0, 5);
    }

    async getMemoryMetrics() {
        try {
            const total = os.totalmem();
            const free = os.freemem();
            const used = total - free;
            
            const processMemory = process.memoryUsage();
            const swapInfo = await this.getSwapInfo();
            
            return {
                total: Math.round(total / 1024 / 1024 / 1024 * 100) / 100, // GB
                used: Math.round(used / 1024 / 1024 / 1024 * 100) / 100,   // GB
                free: Math.round(free / 1024 / 1024 / 1024 * 100) / 100,   // GB
                percentage: Math.round((used / total) * 100),
                process: {
                    rss: Math.round(processMemory.rss / 1024 / 1024 * 100) / 100,        // MB
                    heapTotal: Math.round(processMemory.heapTotal / 1024 / 1024 * 100) / 100, // MB
                    heapUsed: Math.round(processMemory.heapUsed / 1024 / 1024 * 100) / 100,   // MB
                    external: Math.round(processMemory.external / 1024 / 1024 * 100) / 100   // MB
                },
                swap: swapInfo,
                topProcesses: await this.getTopMemoryProcesses()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getSwapInfo() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('wmic pagefile get AllocatedBaseSize,CurrentUsage /format:csv', { encoding: 'utf8' });
                // Parse Windows pagefile information
                return { status: 'detected', details: output.trim() };
            } else {
                const output = execSync('free -m', { encoding: 'utf8' });
                const lines = output.trim().split('\n');
                const swapLine = lines.find(line => line.startsWith('Swap:'));
                
                if (swapLine) {
                    const parts = swapLine.split(/\s+/);
                    return {
                        total: parseInt(parts[1]),     // MB
                        used: parseInt(parts[2]),      // MB
                        free: parseInt(parts[3])       // MB
                    };
                }
                
                return { total: 0, used: 0, free: 0 };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    async getTopMemoryProcesses() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('tasklist /FO CSV | findstr /i "claude\\|node\\|npm\\|git"', { encoding: 'utf8' });
                return this.parseWindowsProcesses(output);
            } else {
                const output = execSync('ps aux --sort=-%mem | head -10', { encoding: 'utf8' });
                return this.parseUnixProcesses(output);
            }
        } catch (error) {
            return [];
        }
    }

    async getDiskMetrics() {
        try {
            const diskUsage = await this.getDiskUsage();
            const diskIO = await this.getDiskIO();
            
            return {
                usage: diskUsage,
                io: diskIO,
                temperature: await this.getDiskTemperature()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getDiskUsage() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('wmic logicaldisk get size,freespace,caption /format:csv', { encoding: 'utf8' });
                return this.parseWindowsDiskUsage(output);
            } else {
                const output = execSync('df -h', { encoding: 'utf8' });
                return this.parseUnixDiskUsage(output);
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    parseWindowsDiskUsage(output) {
        const lines = output.trim().split('\n').slice(1); // Skip header
        const disks = [];
        
        for (const line of lines) {
            const parts = line.split(',');
            if (parts.length >= 4 && parts[1]) {
                const caption = parts[1];
                const freeSpace = parseInt(parts[2]) || 0;
                const size = parseInt(parts[3]) || 0;
                const used = size - freeSpace;
                
                disks.push({
                    drive: caption,
                    total: Math.round(size / 1024 / 1024 / 1024 * 100) / 100, // GB
                    used: Math.round(used / 1024 / 1024 / 1024 * 100) / 100,  // GB
                    free: Math.round(freeSpace / 1024 / 1024 / 1024 * 100) / 100, // GB
                    percentage: size > 0 ? Math.round((used / size) * 100) : 0
                });
            }
        }
        
        return disks;
    }

    parseUnixDiskUsage(output) {
        const lines = output.trim().split('\n').slice(1); // Skip header
        const disks = [];
        
        for (const line of lines) {
            const parts = line.split(/\s+/);
            if (parts.length >= 6) {
                disks.push({
                    filesystem: parts[0],
                    total: parts[1],
                    used: parts[2],
                    free: parts[3],
                    percentage: parseInt(parts[4].replace('%', '')),
                    mountpoint: parts[5]
                });
            }
        }
        
        return disks;
    }

    async getDiskIO() {
        try {
            if (process.platform === 'win32') {
                // Windows disk I/O monitoring would require WMI or performance counters
                return { status: 'unavailable', platform: 'windows' };
            } else {
                const output = execSync('iostat -x 1 2 | tail -n +4', { encoding: 'utf8' });
                return this.parseIOStat(output);
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    parseIOStat(output) {
        const lines = output.trim().split('\n');
        const devices = [];
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 10 && !line.includes('Device')) {
                devices.push({
                    device: parts[0],
                    readKBps: parseFloat(parts[2]),
                    writeKBps: parseFloat(parts[3]),
                    readIOps: parseFloat(parts[4]),
                    writeIOps: parseFloat(parts[5]),
                    utilization: parseFloat(parts[9])
                });
            }
        }
        
        return devices;
    }

    async getDiskTemperature() {
        try {
            if (process.platform === 'linux') {
                // Try to get disk temperature using smartctl
                const output = execSync('lsblk -d -o NAME | tail -n +2', { encoding: 'utf8' });
                const devices = output.trim().split('\n');
                const temperatures = [];
                
                for (const device of devices.slice(0, 3)) { // Check first 3 devices
                    try {
                        const tempOutput = execSync(`smartctl -A /dev/${device} | grep Temperature`, { encoding: 'utf8' });
                        const match = tempOutput.match(/(\d+)\s*Celsius/);
                        if (match) {
                            temperatures.push({
                                device,
                                temperature: parseInt(match[1])
                            });
                        }
                    } catch (error) {
                        // Device might not support SMART or require sudo
                    }
                }
                
                return temperatures;
            }
            
            return { status: 'unavailable', platform: process.platform };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getNetworkMetrics() {
        try {
            const interfaces = os.networkInterfaces();
            const networkStats = await this.getNetworkStats();
            const connections = await this.getNetworkConnections();
            
            return {
                interfaces: this.parseNetworkInterfaces(interfaces),
                stats: networkStats,
                connections: connections,
                latency: await this.measureNetworkLatency()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    parseNetworkInterfaces(interfaces) {
        const result = [];
        
        for (const [name, configs] of Object.entries(interfaces)) {
            for (const config of configs) {
                if (config.family === 'IPv4' && !config.internal) {
                    result.push({
                        name,
                        address: config.address,
                        netmask: config.netmask,
                        mac: config.mac
                    });
                }
            }
        }
        
        return result;
    }

    async getNetworkStats() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('netstat -e', { encoding: 'utf8' });
                return this.parseWindowsNetStats(output);
            } else {
                const output = execSync('cat /proc/net/dev', { encoding: 'utf8' });
                return this.parseLinuxNetStats(output);
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    parseWindowsNetStats(output) {
        // Parse Windows netstat -e output
        const lines = output.trim().split('\n');
        const stats = {};
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('Bytes')) {
                const values = lines[i + 1].trim().split(/\s+/);
                if (values.length >= 2) {
                    stats.bytesReceived = parseInt(values[0]) || 0;
                    stats.bytesSent = parseInt(values[1]) || 0;
                }
                break;
            }
        }
        
        return stats;
    }

    parseLinuxNetStats(output) {
        const lines = output.trim().split('\n').slice(2); // Skip headers
        const interfaces = {};
        
        for (const line of lines) {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 17) {
                const interfaceName = parts[0].replace(':', '');
                interfaces[interfaceName] = {
                    bytesReceived: parseInt(parts[1]),
                    packetsReceived: parseInt(parts[2]),
                    bytesSent: parseInt(parts[9]),
                    packetsSent: parseInt(parts[10])
                };
            }
        }
        
        return interfaces;
    }

    async getNetworkConnections() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('netstat -an | find "ESTABLISHED" | find /c /v ""', { encoding: 'utf8' });
                return { established: parseInt(output.trim()) || 0 };
            } else {
                const output = execSync('netstat -an | grep ESTABLISHED | wc -l', { encoding: 'utf8' });
                return { established: parseInt(output.trim()) || 0 };
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    async measureNetworkLatency() {
        try {
            const targets = ['8.8.8.8', 'cloudflare.com'];
            const latencies = [];
            
            for (const target of targets) {
                try {
                    const pingCmd = process.platform === 'win32' ? 
                        `ping -n 1 ${target}` : 
                        `ping -c 1 ${target}`;
                    
                    const output = execSync(pingCmd, { encoding: 'utf8', timeout: 5000 });
                    const latency = this.extractLatency(output);
                    
                    if (latency > 0) {
                        latencies.push({ target, latency });
                    }
                } catch (error) {
                    // Target unreachable or timeout
                }
            }
            
            return latencies;
        } catch (error) {
            return { error: error.message };
        }
    }

    extractLatency(pingOutput) {
        // Extract latency from ping output
        const patterns = [
            /time=(\d+\.?\d*)ms/i,      // Linux/Mac
            /Average = (\d+)ms/i,       // Windows
            /time<(\d+)ms/i             // Alternative format
        ];
        
        for (const pattern of patterns) {
            const match = pingOutput.match(pattern);
            if (match) {
                return parseFloat(match[1]);
            }
        }
        
        return 0;
    }

    async getProcessMetrics() {
        try {
            const totalProcesses = await this.getTotalProcessCount();
            const runningProcesses = await this.getRunningProcessCount();
            const zombieProcesses = await this.getZombieProcessCount();
            const developmentProcesses = await this.getDevelopmentProcesses();
            
            return {
                total: totalProcesses,
                running: runningProcesses,
                zombie: zombieProcesses,
                development: developmentProcesses,
                limits: await this.getProcessLimits()
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getTotalProcessCount() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('tasklist | find /c /v ""', { encoding: 'utf8' });
                return parseInt(output.trim()) || 0;
            } else {
                const output = execSync('ps aux | wc -l', { encoding: 'utf8' });
                return parseInt(output.trim()) - 1 || 0; // Subtract header
            }
        } catch (error) {
            return 0;
        }
    }

    async getRunningProcessCount() {
        try {
            if (process.platform === 'win32') {
                const output = execSync('tasklist /FI "STATUS eq running" | find /c /v ""', { encoding: 'utf8' });
                return parseInt(output.trim()) || 0;
            } else {
                const output = execSync('ps aux | grep -v "Z" | wc -l', { encoding: 'utf8' });
                return parseInt(output.trim()) - 1 || 0; // Subtract header
            }
        } catch (error) {
            return 0;
        }
    }

    async getZombieProcessCount() {
        try {
            if (process.platform === 'win32') {
                return 0; // Windows doesn't have zombie processes
            } else {
                const output = execSync('ps aux | awk \'$8 ~ /^Z/ { count++ } END { print count+0 }\'', { encoding: 'utf8' });
                return parseInt(output.trim()) || 0;
            }
        } catch (error) {
            return 0;
        }
    }

    async getDevelopmentProcesses() {
        try {
            const patterns = ['claude', 'node', 'npm', 'git', 'code', 'cursor'];
            const processes = [];
            
            for (const pattern of patterns) {
                try {
                    let output;
                    if (process.platform === 'win32') {
                        output = execSync(`tasklist /FI "IMAGENAME eq ${pattern}*" /FO CSV`, { encoding: 'utf8' });
                    } else {
                        output = execSync(`pgrep -f ${pattern}`, { encoding: 'utf8' });
                    }
                    
                    if (output.trim()) {
                        const count = output.trim().split('\n').length;
                        processes.push({ name: pattern, count });
                    }
                } catch (error) {
                    // Process not found
                }
            }
            
            return processes;
        } catch (error) {
            return [];
        }
    }

    async getProcessLimits() {
        try {
            if (process.platform === 'win32') {
                return { status: 'unavailable', platform: 'windows' };
            } else {
                const output = execSync('ulimit -a', { encoding: 'utf8' });
                return this.parseUlimitOutput(output);
            }
        } catch (error) {
            return { error: error.message };
        }
    }

    parseUlimitOutput(output) {
        const limits = {};
        const lines = output.trim().split('\n');
        
        for (const line of lines) {
            const match = line.match(/(.+?)\s+\((.+?)\)\s+(.+)/);
            if (match) {
                const [, description, flag, value] = match;
                limits[flag.replace('-', '')] = {
                    description: description.trim(),
                    value: value.trim()
                };
            }
        }
        
        return limits;
    }

    // Intelligent Resource Allocation
    async allocateResources(requestId, requirements) {
        const allocation = {
            id: requestId,
            timestamp: Date.now(),
            requirements,
            status: 'pending',
            allocatedResources: {}
        };

        try {
            // Check resource availability
            const availability = await this.checkResourceAvailability(requirements);
            
            if (!availability.canAllocate) {
                allocation.status = 'rejected';
                allocation.reason = availability.reason;
                return allocation;
            }

            // Allocate memory
            if (requirements.memory) {
                const memoryAllocation = await this.allocateMemory(requestId, requirements.memory);
                allocation.allocatedResources.memory = memoryAllocation;
            }

            // Allocate CPU
            if (requirements.cpu) {
                const cpuAllocation = await this.allocateCPU(requestId, requirements.cpu);
                allocation.allocatedResources.cpu = cpuAllocation;
            }

            // Allocate disk space
            if (requirements.disk) {
                const diskAllocation = await this.allocateDisk(requestId, requirements.disk);
                allocation.allocatedResources.disk = diskAllocation;
            }

            // Allocate network bandwidth
            if (requirements.network) {
                const networkAllocation = await this.allocateNetwork(requestId, requirements.network);
                allocation.allocatedResources.network = networkAllocation;
            }

            allocation.status = 'allocated';
            this.resourceAllocations.set(requestId, allocation);
            
            await this.logResourceAllocation(allocation);
            return allocation;

        } catch (error) {
            allocation.status = 'error';
            allocation.error = error.message;
            return allocation;
        }
    }

    async checkResourceAvailability(requirements) {
        const currentMetrics = await this.collectResourceMetrics();
        const availability = { canAllocate: true, issues: [] };

        // Check memory availability
        if (requirements.memory) {
            const requestedGB = requirements.memory / (1024 * 1024 * 1024);
            const availableGB = currentMetrics.memory.free;
            const bufferGB = this.config.memoryBufferGB;
            
            if (requestedGB > (availableGB - bufferGB)) {
                availability.canAllocate = false;
                availability.issues.push(`Insufficient memory: requested ${requestedGB}GB, available ${availableGB - bufferGB}GB`);
            }
        }

        // Check CPU availability
        if (requirements.cpu) {
            const currentUsage = currentMetrics.cpu.usage;
            const requestedUsage = requirements.cpu;
            
            if ((currentUsage + requestedUsage) > this.config.cpuThreshold) {
                availability.canAllocate = false;
                availability.issues.push(`CPU usage would exceed threshold: current ${currentUsage}%, requested ${requestedUsage}%`);
            }
        }

        // Check disk availability
        if (requirements.disk) {
            const requestedGB = requirements.disk / (1024 * 1024 * 1024);
            let hasSpace = false;
            
            for (const disk of currentMetrics.disk.usage) {
                if (disk.free > (requestedGB + this.config.diskBufferGB)) {
                    hasSpace = true;
                    break;
                }
            }
            
            if (!hasSpace) {
                availability.canAllocate = false;
                availability.issues.push(`Insufficient disk space: requested ${requestedGB}GB`);
            }
        }

        if (!availability.canAllocate) {
            availability.reason = availability.issues.join('; ');
        }

        return availability;
    }

    async allocateMemory(requestId, sizeBytes) {
        const allocation = {
            type: 'memory',
            requestId,
            size: sizeBytes,
            sizeGB: Math.round(sizeBytes / (1024 * 1024 * 1024) * 100) / 100,
            timestamp: Date.now()
        };

        // Update memory pool
        this.resourcePools.memory.allocated += sizeBytes;
        this.resourcePools.memory.reservations.set(requestId, allocation);

        return allocation;
    }

    async allocateCPU(requestId, percentage) {
        const allocation = {
            type: 'cpu',
            requestId,
            percentage,
            cores: Math.ceil(percentage / 100 * this.resourcePools.cpu.total),
            timestamp: Date.now()
        };

        // Update CPU pool
        this.resourcePools.cpu.allocated += percentage;
        this.resourcePools.cpu.reservations.set(requestId, allocation);

        return allocation;
    }

    async allocateDisk(requestId, sizeBytes) {
        const allocation = {
            type: 'disk',
            requestId,
            size: sizeBytes,
            sizeGB: Math.round(sizeBytes / (1024 * 1024 * 1024) * 100) / 100,
            timestamp: Date.now()
        };

        // Update disk pool
        this.resourcePools.disk.allocated += sizeBytes;
        this.resourcePools.disk.reservations.set(requestId, allocation);

        return allocation;
    }

    async allocateNetwork(requestId, bandwidthMbps) {
        const allocation = {
            type: 'network',
            requestId,
            bandwidth: bandwidthMbps,
            timestamp: Date.now()
        };

        // Update network pool
        this.resourcePools.network.allocated += bandwidthMbps;
        this.resourcePools.network.reservations.set(requestId, allocation);

        return allocation;
    }

    async deallocateResources(requestId) {
        const allocation = this.resourceAllocations.get(requestId);
        
        if (!allocation) {
            throw new Error(`No allocation found for request ${requestId}`);
        }

        // Deallocate each resource type
        for (const [type, resource] of Object.entries(allocation.allocatedResources)) {
            await this.deallocateResourceType(type, resource);
        }

        // Remove from allocations
        this.resourceAllocations.delete(requestId);
        
        await this.logResourceDeallocation(requestId, allocation);
        
        return { requestId, status: 'deallocated', timestamp: Date.now() };
    }

    async deallocateResourceType(type, resource) {
        const pool = this.resourcePools[type];
        
        if (!pool) return;

        switch (type) {
            case 'memory':
                pool.allocated -= resource.size;
                break;
            case 'cpu':
                pool.allocated -= resource.percentage;
                break;
            case 'disk':
                pool.allocated -= resource.size;
                break;
            case 'network':
                pool.allocated -= resource.bandwidth;
                break;
        }

        pool.reservations.delete(resource.requestId);
    }

    // Memory Optimization
    async optimizeMemoryUsage() {
        const optimization = {
            timestamp: Date.now(),
            actions: [],
            results: {}
        };

        try {
            // Clear caches
            const cacheClearing = await this.clearCaches();
            optimization.actions.push(cacheClearing);

            // Garbage collection
            const gcResults = await this.forceGarbageCollection();
            optimization.actions.push(gcResults);

            // Process memory optimization
            const processOptimization = await this.optimizeProcessMemory();
            optimization.actions.push(processOptimization);

            // Swap optimization
            const swapOptimization = await this.optimizeSwapUsage();
            optimization.actions.push(swapOptimization);

            // Calculate results
            const beforeMetrics = this.resourceMetrics.memory[this.resourceMetrics.memory.length - 2];
            const afterMetrics = await this.getMemoryMetrics();
            
            optimization.results = {
                memoryFreed: afterMetrics.free - beforeMetrics.free,
                percentageImprovement: ((afterMetrics.free - beforeMetrics.free) / beforeMetrics.total) * 100
            };

        } catch (error) {
            optimization.error = error.message;
        }

        await this.persistOptimizationResults('memory', optimization);
        return optimization;
    }

    async clearCaches() {
        const action = {
            name: 'cache_clearing',
            timestamp: Date.now(),
            details: []
        };

        try {
            // Clear Node.js cache
            if (global.gc) {
                global.gc();
                action.details.push('Node.js garbage collection triggered');
            }

            // Clear npm cache
            try {
                execSync('npm cache clean --force', { stdio: 'ignore' });
                action.details.push('NPM cache cleared');
            } catch (error) {
                action.details.push(`NPM cache clearing failed: ${error.message}`);
            }

            // Clear custom cache directory
            await this.clearCustomCache();
            action.details.push('Custom cache directory cleared');

        } catch (error) {
            action.error = error.message;
        }

        return action;
    }

    async clearCustomCache() {
        try {
            const files = await fs.readdir(this.config.cachePath);
            let totalSize = 0;
            
            for (const file of files) {
                const filePath = path.join(this.config.cachePath, file);
                const stats = await fs.stat(filePath);
                totalSize += stats.size;
                
                // Remove old cache files
                const ageMs = Date.now() - stats.mtime.getTime();
                const ageHours = ageMs / (1000 * 60 * 60);
                
                if (ageHours > 24 || totalSize > this.config.maxCacheSize) {
                    await fs.unlink(filePath);
                }
            }
        } catch (error) {
            // Cache directory might not exist or be empty
        }
    }

    async forceGarbageCollection() {
        const action = {
            name: 'garbage_collection',
            timestamp: Date.now(),
            details: []
        };

        try {
            const beforeMemory = process.memoryUsage();
            
            // Force garbage collection if available
            if (global.gc) {
                global.gc();
                action.details.push('Global garbage collection executed');
            }

            // Clear require cache for development
            if (process.env.NODE_ENV === 'development') {
                const cacheKeys = Object.keys(require.cache);
                const clearedCount = cacheKeys.length;
                
                for (const key of cacheKeys) {
                    if (!key.includes('node_modules')) {
                        delete require.cache[key];
                    }
                }
                
                action.details.push(`Cleared ${clearedCount} require cache entries`);
            }

            const afterMemory = process.memoryUsage();
            action.memoryFreed = beforeMemory.heapUsed - afterMemory.heapUsed;

        } catch (error) {
            action.error = error.message;
        }

        return action;
    }

    async optimizeProcessMemory() {
        const action = {
            name: 'process_optimization',
            timestamp: Date.now(),
            details: []
        };

        try {
            // Identify memory-heavy processes
            const processes = await this.getTopMemoryProcesses();
            const heavyProcesses = processes.filter(p => p.memory > 500); // > 500MB
            
            for (const process of heavyProcesses) {
                if (process.command && process.command.includes('node')) {
                    action.details.push(`High memory Node.js process detected: ${process.command} (${process.memory}% memory)`);
                }
            }

            // Suggest optimizations
            if (heavyProcesses.length > 0) {
                action.suggestions = [
                    'Consider restarting memory-heavy development servers',
                    'Review Node.js processes for memory leaks',
                    'Implement memory monitoring for long-running processes'
                ];
            }

        } catch (error) {
            action.error = error.message;
        }

        return action;
    }

    async optimizeSwapUsage() {
        const action = {
            name: 'swap_optimization',
            timestamp: Date.now(),
            details: []
        };

        try {
            const memoryMetrics = await this.getMemoryMetrics();
            
            if (memoryMetrics.swap && memoryMetrics.swap.used > 0) {
                action.details.push(`Swap usage detected: ${memoryMetrics.swap.used}MB used`);
                
                // Suggest swap optimization on Linux
                if (process.platform === 'linux') {
                    action.suggestions = [
                        'Consider increasing system RAM',
                        'Review swap configuration',
                        'Monitor for memory-intensive processes'
                    ];
                }
            } else {
                action.details.push('No significant swap usage detected');
            }

        } catch (error) {
            action.error = error.message;
        }

        return action;
    }

    // CPU and Network Monitoring
    async optimizeCPUUsage() {
        const optimization = {
            timestamp: Date.now(),
            actions: [],
            results: {}
        };

        try {
            // Process priority optimization
            const priorityOptimization = await this.optimizeProcessPriorities();
            optimization.actions.push(priorityOptimization);

            // CPU affinity optimization
            const affinityOptimization = await this.optimizeCPUAffinity();
            optimization.actions.push(affinityOptimization);

            // Load balancing
            const loadBalancing = await this.optimizeLoadBalancing();
            optimization.actions.push(loadBalancing);

        } catch (error) {
            optimization.error = error.message;
        }

        await this.persistOptimizationResults('cpu', optimization);
        return optimization;
    }

    async optimizeProcessPriorities() {
        const action = {
            name: 'process_priority_optimization',
            timestamp: Date.now(),
            details: []
        };

        try {
            const topProcesses = await this.getTopCPUProcesses();
            
            for (const process of topProcesses) {
                if (process.cpu > 50) { // High CPU usage
                    action.details.push(`High CPU process detected: ${process.command || process.name} (${process.cpu}% CPU)`);
                    
                    // Could implement priority adjustment here
                    action.suggestions = action.suggestions || [];
                    action.suggestions.push(`Consider adjusting priority for process ${process.pid}`);
                }
            }

        } catch (error) {
            action.error = error.message;
        }

        return action;
    }

    async optimizeCPUAffinity() {
        const action = {
            name: 'cpu_affinity_optimization',
            timestamp: Date.now(),
            details: []
        };

        try {
            const cpuCount = os.cpus().length;
            action.details.push(`System has ${cpuCount} CPU cores`);
            
            if (cpuCount > 4) {
                action.suggestions = [
                    'Consider CPU affinity for memory-intensive processes',
                    'Distribute development processes across available cores',
                    'Reserve cores for system processes'
                ];
            }

        } catch (error) {
            action.error = error.message;
        }

        return action;
    }

    async optimizeLoadBalancing() {
        const action = {
            name: 'load_balancing_optimization',
            timestamp: Date.now(),
            details: []
        };

        try {
            const loadAvg = os.loadavg();
            const cpuCount = os.cpus().length;
            
            action.details.push(`Load averages: 1min=${loadAvg[0]}, 5min=${loadAvg[1]}, 15min=${loadAvg[2]}`);
            action.details.push(`CPU cores: ${cpuCount}`);
            
            if (loadAvg[0] > cpuCount) {
                action.details.push('System is under heavy load');
                action.suggestions = [
                    'Consider reducing parallel processes',
                    'Monitor for CPU-intensive tasks',
                    'Implement load throttling'
                ];
            }

        } catch (error) {
            action.error = error.message;
        }

        return action;
    }

    // Contention Resolution
    async detectResourceContention() {
        const contention = {
            timestamp: Date.now(),
            conflicts: [],
            severity: 'low'
        };

        try {
            // Memory contention
            const memoryContention = await this.detectMemoryContention();
            if (memoryContention.detected) {
                contention.conflicts.push(memoryContention);
            }

            // CPU contention
            const cpuContention = await this.detectCPUContention();
            if (cpuContention.detected) {
                contention.conflicts.push(cpuContention);
            }

            // Disk I/O contention
            const diskContention = await this.detectDiskContention();
            if (diskContention.detected) {
                contention.conflicts.push(diskContention);
            }

            // Network contention
            const networkContention = await this.detectNetworkContention();
            if (networkContention.detected) {
                contention.conflicts.push(networkContention);
            }

            // Determine overall severity
            contention.severity = this.calculateContentionSeverity(contention.conflicts);

        } catch (error) {
            contention.error = error.message;
        }

        if (contention.conflicts.length > 0) {
            await this.handleResourceContention(contention);
        }

        return contention;
    }

    async detectMemoryContention() {
        const currentMemory = await this.getMemoryMetrics();
        const recentMetrics = this.resourceMetrics.memory.slice(-5);
        
        const contention = {
            type: 'memory',
            detected: false,
            details: {}
        };

        // Check if memory usage is consistently high
        const highUsageCount = recentMetrics.filter(m => m.percentage > 85).length;
        
        if (highUsageCount >= 3) {
            contention.detected = true;
            contention.details = {
                currentUsage: currentMemory.percentage,
                trend: 'increasing',
                affectedProcesses: await this.getTopMemoryProcesses()
            };
        }

        // Check for swap usage
        if (currentMemory.swap && currentMemory.swap.used > 0) {
            contention.detected = true;
            contention.details.swapUsed = currentMemory.swap.used;
        }

        return contention;
    }

    async detectCPUContention() {
        const currentCPU = await this.getCPUMetrics();
        const recentMetrics = this.resourceMetrics.cpu.slice(-5);
        
        const contention = {
            type: 'cpu',
            detected: false,
            details: {}
        };

        // Check for sustained high CPU usage
        const highUsageCount = recentMetrics.filter(m => m.usage > 80).length;
        
        if (highUsageCount >= 3) {
            contention.detected = true;
            contention.details = {
                currentUsage: currentCPU.usage,
                loadAverage: currentCPU.loadAverage,
                topProcesses: await this.getTopCPUProcesses()
            };
        }

        return contention;
    }

    async detectDiskContention() {
        const currentDisk = await this.getDiskMetrics();
        
        const contention = {
            type: 'disk',
            detected: false,
            details: {}
        };

        // Check disk usage
        for (const disk of currentDisk.usage) {
            if (disk.percentage > 90) {
                contention.detected = true;
                contention.details.fullDisks = contention.details.fullDisks || [];
                contention.details.fullDisks.push(disk);
            }
        }

        // Check disk I/O
        if (currentDisk.io && currentDisk.io.length > 0) {
            const highIODevices = currentDisk.io.filter(device => device.utilization > 80);
            if (highIODevices.length > 0) {
                contention.detected = true;
                contention.details.highIODevices = highIODevices;
            }
        }

        return contention;
    }

    async detectNetworkContention() {
        const currentNetwork = await this.getNetworkMetrics();
        
        const contention = {
            type: 'network',
            detected: false,
            details: {}
        };

        // Check latency
        if (currentNetwork.latency) {
            const highLatency = currentNetwork.latency.filter(ping => ping.latency > 100);
            if (highLatency.length > 0) {
                contention.detected = true;
                contention.details.highLatency = highLatency;
            }
        }

        // Check connection count
        if (currentNetwork.connections && currentNetwork.connections.established > 1000) {
            contention.detected = true;
            contention.details.highConnectionCount = currentNetwork.connections.established;
        }

        return contention;
    }

    calculateContentionSeverity(conflicts) {
        if (conflicts.length === 0) return 'none';
        if (conflicts.length === 1) return 'low';
        if (conflicts.length === 2) return 'medium';
        if (conflicts.length >= 3) return 'high';
        
        // Check for critical resource contention
        const criticalTypes = ['memory', 'cpu'];
        const hasCritical = conflicts.some(c => criticalTypes.includes(c.type));
        
        return hasCritical ? 'critical' : 'medium';
    }

    async handleResourceContention(contention) {
        console.warn(`RESOURCE CONTENTION DETECTED [${contention.severity.toUpperCase()}]: ${contention.conflicts.length} conflicts`);
        
        const resolution = {
            timestamp: Date.now(),
            contention,
            actions: [],
            status: 'started'
        };

        try {
            for (const conflict of contention.conflicts) {
                const action = await this.resolveResourceConflict(conflict);
                resolution.actions.push(action);
            }
            
            resolution.status = 'completed';
        } catch (error) {
            resolution.status = 'failed';
            resolution.error = error.message;
        }

        await this.persistContentionResolution(resolution);
        return resolution;
    }

    async resolveResourceConflict(conflict) {
        const action = {
            type: conflict.type,
            timestamp: Date.now(),
            steps: []
        };

        switch (conflict.type) {
            case 'memory':
                action.steps.push(await this.optimizeMemoryUsage());
                break;
            case 'cpu':
                action.steps.push(await this.optimizeCPUUsage());
                break;
            case 'disk':
                action.steps.push(await this.optimizeDiskUsage());
                break;
            case 'network':
                action.steps.push(await this.optimizeNetworkUsage());
                break;
        }

        return action;
    }

    async optimizeDiskUsage() {
        return {
            name: 'disk_optimization',
            actions: ['cleanup_temp_files', 'clear_caches', 'compress_logs']
        };
    }

    async optimizeNetworkUsage() {
        return {
            name: 'network_optimization',
            actions: ['close_idle_connections', 'optimize_timeouts', 'review_bandwidth_usage']
        };
    }

    // Capacity Planning
    async generateCapacityPlan() {
        const plan = {
            timestamp: Date.now(),
            currentUsage: await this.collectResourceMetrics(),
            trends: await this.analyzeResourceTrends(),
            projections: await this.projectResourceNeeds(),
            recommendations: []
        };

        // Generate recommendations based on trends
        plan.recommendations = await this.generateCapacityRecommendations(plan.trends, plan.projections);

        await this.persistCapacityPlan(plan);
        return plan;
    }

    async analyzeResourceTrends() {
        const trends = {
            memory: this.calculateTrend(this.resourceMetrics.memory, 'percentage'),
            cpu: this.calculateTrend(this.resourceMetrics.cpu, 'usage'),
            disk: this.calculateDiskTrend(),
            network: this.calculateNetworkTrend()
        };

        return trends;
    }

    calculateTrend(metrics, property) {
        if (metrics.length < 3) return { trend: 'insufficient_data' };

        const recent = metrics.slice(-10); // Last 10 measurements
        const values = recent.map(m => m[property]).filter(v => v !== undefined);
        
        if (values.length < 3) return { trend: 'insufficient_data' };

        // Simple linear regression
        const n = values.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = values;
        
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumXX = x.reduce((sum, val) => sum + val * val, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return {
            trend: slope > 0.1 ? 'increasing' : slope < -0.1 ? 'decreasing' : 'stable',
            slope,
            intercept,
            currentValue: y[y.length - 1],
            averageValue: sumY / n
        };
    }

    calculateDiskTrend() {
        // Aggregate disk usage trends across all disks
        const diskMetrics = this.resourceMetrics.disk;
        if (diskMetrics.length === 0) return { trend: 'insufficient_data' };

        // Calculate average disk usage over time
        const avgUsages = diskMetrics.map(metric => {
            if (metric.usage && metric.usage.length > 0) {
                const totalUsage = metric.usage.reduce((sum, disk) => sum + disk.percentage, 0);
                return totalUsage / metric.usage.length;
            }
            return 0;
        });

        return this.calculateTrend(avgUsages.map((usage, i) => ({ percentage: usage })), 'percentage');
    }

    calculateNetworkTrend() {
        // Analyze network latency trends
        const networkMetrics = this.resourceMetrics.network;
        if (networkMetrics.length === 0) return { trend: 'insufficient_data' };

        const avgLatencies = networkMetrics.map(metric => {
            if (metric.latency && metric.latency.length > 0) {
                const totalLatency = metric.latency.reduce((sum, ping) => sum + ping.latency, 0);
                return totalLatency / metric.latency.length;
            }
            return 0;
        });

        return this.calculateTrend(avgLatencies.map((latency, i) => ({ usage: latency })), 'usage');
    }

    async projectResourceNeeds() {
        const projections = {};
        const trends = await this.analyzeResourceTrends();

        // Project 30 days into the future
        const daysToProject = 30;
        const measurementsPerDay = 24; // Assuming hourly measurements

        for (const [resource, trend] of Object.entries(trends)) {
            if (trend.trend === 'insufficient_data') {
                projections[resource] = { status: 'insufficient_data' };
                continue;
            }

            const futureValue = trend.currentValue + (trend.slope * daysToProject * measurementsPerDay);
            
            projections[resource] = {
                current: trend.currentValue,
                projected: Math.max(0, futureValue),
                trend: trend.trend,
                timeToThreshold: this.calculateTimeToThreshold(trend, resource)
            };
        }

        return projections;
    }

    calculateTimeToThreshold(trend, resource) {
        const thresholds = {
            memory: this.config.memoryThreshold,
            cpu: this.config.cpuThreshold,
            disk: this.config.diskThreshold,
            network: this.config.networkThreshold
        };

        const threshold = thresholds[resource];
        if (!threshold || trend.slope <= 0) return null;

        const timeToThreshold = (threshold - trend.currentValue) / trend.slope;
        return timeToThreshold > 0 ? timeToThreshold : null;
    }

    async generateCapacityRecommendations(trends, projections) {
        const recommendations = [];

        for (const [resource, projection] of Object.entries(projections)) {
            if (projection.status === 'insufficient_data') continue;

            if (projection.timeToThreshold && projection.timeToThreshold < 720) { // 30 days
                recommendations.push({
                    type: 'urgent',
                    resource,
                    message: `${resource} usage will reach threshold in ${Math.round(projection.timeToThreshold)} measurement periods`,
                    action: `increase_${resource}_capacity`,
                    priority: projection.timeToThreshold < 168 ? 'critical' : 'high'
                });
            }

            if (projection.trend === 'increasing' && projection.projected > 80) {
                recommendations.push({
                    type: 'planning',
                    resource,
                    message: `${resource} usage trending upward, projected to reach ${Math.round(projection.projected)}%`,
                    action: `plan_${resource}_expansion`,
                    priority: 'medium'
                });
            }
        }

        return recommendations;
    }

    // Utility Methods
    trimMetricsHistory() {
        const maxEntries = 1000; // Keep last 1000 entries per metric type
        
        for (const [type, metrics] of Object.entries(this.resourceMetrics)) {
            if (metrics.length > maxEntries) {
                this.resourceMetrics[type] = metrics.slice(-maxEntries);
            }
        }
    }

    async updateProcessRegistry() {
        try {
            const processes = await this.getDevelopmentProcesses();
            
            for (const process of processes) {
                this.processRegistry.set(process.name, {
                    ...process,
                    lastSeen: Date.now()
                });
            }
        } catch (error) {
            console.error('Failed to update process registry:', error.message);
        }
    }

    async persistResourceMetrics(metrics) {
        try {
            const filename = `resource-metrics-${new Date().toISOString().split('T')[0]}.json`;
            const filepath = path.join(this.config.metricsPath, filename);
            
            let existingData = [];
            try {
                const existing = await fs.readFile(filepath, 'utf8');
                existingData = JSON.parse(existing);
            } catch (error) {
                // File doesn't exist yet
            }

            existingData.push(metrics);
            
            // Keep only recent data to prevent file size growth
            if (existingData.length > 1000) {
                existingData = existingData.slice(-1000);
            }

            await fs.writeFile(filepath, JSON.stringify(existingData, null, 2));
        } catch (error) {
            console.error('Failed to persist resource metrics:', error.message);
        }
    }

    async persistOptimizationResults(type, optimization) {
        try {
            const filename = `${type}-optimization-${Date.now()}.json`;
            const filepath = path.join(this.config.metricsPath, filename);
            await fs.writeFile(filepath, JSON.stringify(optimization, null, 2));
        } catch (error) {
            console.error(`Failed to persist ${type} optimization results:`, error.message);
        }
    }

    async persistContentionResolution(resolution) {
        try {
            const filename = `contention-resolution-${Date.now()}.json`;
            const filepath = path.join(this.config.metricsPath, filename);
            await fs.writeFile(filepath, JSON.stringify(resolution, null, 2));
        } catch (error) {
            console.error('Failed to persist contention resolution:', error.message);
        }
    }

    async persistCapacityPlan(plan) {
        try {
            const filename = `capacity-plan-${new Date().toISOString().split('T')[0]}.json`;
            const filepath = path.join(this.config.metricsPath, filename);
            await fs.writeFile(filepath, JSON.stringify(plan, null, 2));
        } catch (error) {
            console.error('Failed to persist capacity plan:', error.message);
        }
    }

    async logResourceAllocation(allocation) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                type: 'allocation',
                data: allocation
            };

            const logFile = path.join(this.config.logPath, `allocations-${new Date().toISOString().split('T')[0]}.json`);
            
            let logs = [];
            try {
                const existing = await fs.readFile(logFile, 'utf8');
                logs = JSON.parse(existing);
            } catch (error) {
                // File doesn't exist yet
            }
            
            logs.push(logEntry);
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Failed to log resource allocation:', error.message);
        }
    }

    async logResourceDeallocation(requestId, allocation) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                type: 'deallocation',
                requestId,
                data: allocation
            };

            const logFile = path.join(this.config.logPath, `allocations-${new Date().toISOString().split('T')[0]}.json`);
            
            let logs = [];
            try {
                const existing = await fs.readFile(logFile, 'utf8');
                logs = JSON.parse(existing);
            } catch (error) {
                // File doesn't exist yet
            }
            
            logs.push(logEntry);
            await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
        } catch (error) {
            console.error('Failed to log resource deallocation:', error.message);
        }
    }

    // Public API
    async startMonitoring() {
        if (this.activeMonitoring) {
            console.log('Resource monitoring already active');
            return;
        }

        this.activeMonitoring = true;
        console.log('Starting system resource monitoring...');

        // Main monitoring loop
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.collectResourceMetrics();
                await this.detectResourceContention();
            } catch (error) {
                console.error('Monitoring error:', error.message);
            }
        }, this.config.monitoringInterval);

        // Cleanup loop
        this.cleanupInterval = setInterval(async () => {
            try {
                await this.optimizeMemoryUsage();
                await this.updateProcessRegistry();
            } catch (error) {
                console.error('Cleanup error:', error.message);
            }
        }, this.config.cleanupInterval);

        // Capacity planning loop
        this.planningInterval = setInterval(async () => {
            try {
                await this.generateCapacityPlan();
            } catch (error) {
                console.error('Capacity planning error:', error.message);
            }
        }, this.config.planningInterval);

        console.log(`Resource monitoring started with ${this.config.monitoringInterval}ms interval`);
    }

    async stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        if (this.planningInterval) {
            clearInterval(this.planningInterval);
            this.planningInterval = null;
        }

        this.activeMonitoring = false;
        console.log('System resource monitoring stopped');
    }

    async getStatus() {
        const currentMetrics = await this.collectResourceMetrics();
        
        return {
            isMonitoring: this.activeMonitoring,
            config: this.config,
            currentUsage: currentMetrics,
            resourcePools: this.resourcePools,
            activeAllocations: this.resourceAllocations.size,
            metricsCount: {
                memory: this.resourceMetrics.memory.length,
                cpu: this.resourceMetrics.cpu.length,
                disk: this.resourceMetrics.disk.length,
                network: this.resourceMetrics.network.length
            }
        };
    }

    async getResourceUtilization() {
        const currentMetrics = await this.collectResourceMetrics();
        const trends = await this.analyzeResourceTrends();
        
        return {
            current: currentMetrics,
            trends,
            thresholds: {
                cpu: this.config.cpuThreshold,
                memory: this.config.memoryThreshold,
                disk: this.config.diskThreshold,
                network: this.config.networkThreshold
            },
            alerts: this.generateCurrentAlerts(currentMetrics)
        };
    }

    generateCurrentAlerts(metrics) {
        const alerts = [];
        
        if (metrics.cpu.usage > this.config.cpuThreshold) {
            alerts.push({ type: 'cpu', severity: 'warning', value: metrics.cpu.usage });
        }
        
        if (metrics.memory.percentage > this.config.memoryThreshold) {
            alerts.push({ type: 'memory', severity: 'warning', value: metrics.memory.percentage });
        }
        
        if (metrics.disk.usage) {
            for (const disk of metrics.disk.usage) {
                if (disk.percentage > this.config.diskThreshold) {
                    alerts.push({ type: 'disk', severity: 'warning', value: disk.percentage, disk: disk.drive || disk.filesystem });
                }
            }
        }
        
        return alerts;
    }
}

// CLI Interface
if (require.main === module) {
    const manager = new SystemResourceManager();
    
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch (command) {
        case 'start':
            manager.startMonitoring();
            break;
        case 'stop':
            manager.stopMonitoring();
            break;
        case 'status':
            manager.getStatus().then(status => {
                console.log(JSON.stringify(status, null, 2));
            });
            break;
        case 'metrics':
            manager.collectResourceMetrics().then(metrics => {
                console.log(JSON.stringify(metrics, null, 2));
            });
            break;
        case 'utilization':
            manager.getResourceUtilization().then(utilization => {
                console.log(JSON.stringify(utilization, null, 2));
            });
            break;
        case 'optimize':
            const resourceType = args[0] || 'memory';
            if (resourceType === 'memory') {
                manager.optimizeMemoryUsage().then(result => {
                    console.log('Memory optimization result:');
                    console.log(JSON.stringify(result, null, 2));
                });
            } else if (resourceType === 'cpu') {
                manager.optimizeCPUUsage().then(result => {
                    console.log('CPU optimization result:');
                    console.log(JSON.stringify(result, null, 2));
                });
            }
            break;
        case 'contention':
            manager.detectResourceContention().then(contention => {
                console.log('Resource contention analysis:');
                console.log(JSON.stringify(contention, null, 2));
            });
            break;
        case 'capacity':
            manager.generateCapacityPlan().then(plan => {
                console.log('Capacity planning report:');
                console.log(JSON.stringify(plan, null, 2));
            });
            break;
        case 'allocate':
            const requestId = args[0] || `req_${Date.now()}`;
            const requirements = {
                memory: parseInt(args[1]) || 1024 * 1024 * 1024, // 1GB default
                cpu: parseInt(args[2]) || 25 // 25% default
            };
            manager.allocateResources(requestId, requirements).then(allocation => {
                console.log('Resource allocation result:');
                console.log(JSON.stringify(allocation, null, 2));
            });
            break;
        case 'deallocate':
            const allocRequestId = args[0];
            if (!allocRequestId) {
                console.log('Please provide request ID to deallocate');
                break;
            }
            manager.deallocateResources(allocRequestId).then(result => {
                console.log('Resource deallocation result:');
                console.log(JSON.stringify(result, null, 2));
            }).catch(error => {
                console.error('Deallocation failed:', error.message);
            });
            break;
        default:
            console.log(`
System Resource Manager v1.0

Usage:
  node system-resource-manager.js <command> [options]

Commands:
  start                    Start automated resource monitoring
  stop                     Stop automated resource monitoring
  status                   Show current system status
  metrics                  Get current resource metrics
  utilization              Get detailed resource utilization report
  optimize [memory|cpu]    Run resource optimization (default: memory)
  contention              Detect and analyze resource contention
  capacity                Generate capacity planning report
  allocate <id> [mem] [cpu] Allocate resources (mem in bytes, cpu in %)
  deallocate <id>         Deallocate resources by request ID

Examples:
  node system-resource-manager.js start
  node system-resource-manager.js metrics
  node system-resource-manager.js optimize memory
  node system-resource-manager.js allocate req123 1073741824 50
  node system-resource-manager.js deallocate req123
            `);
    }
}

module.exports = SystemResourceManager;
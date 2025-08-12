#!/usr/bin/env node

/**
 * BMAD Team Performance Metrics and Tracking System
 * Monitors and tracks performance metrics for multi-agent BMAD workflows
 */

const fs = require('fs');
const path = require('path');

class BMADPerformanceTracker {
    constructor(projectRoot = process.cwd()) {
        this.projectRoot = projectRoot;
        this.metricsDir = path.join(projectRoot, '.bmad-workspace', 'metrics');
        this.logDir = path.join(projectRoot, '.bmad-workspace', 'coordination-logs');
        this.statusDir = path.join(projectRoot, '.bmad-workspace', 'agent-status');
        
        this.ensureDirectories();
        this.initializeMetrics();
    }

    ensureDirectories() {
        [this.metricsDir, this.logDir, this.statusDir].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    initializeMetrics() {
        this.metrics = {
            agents: {},
            workflows: {},
            performance: {
                avgResponseTime: 0,
                avgTaskDuration: 0,
                successRate: 100,
                errorRate: 0,
                throughput: 0
            },
            quality: {
                codeQuality: 0,
                testCoverage: 0,
                securityCompliance: 0,
                documentationCoverage: 0
            },
            collaboration: {
                handoffSuccess: 100,
                communicationEfficiency: 100,
                conflictResolution: 100,
                resourceUtilization: 0
            },
            trends: {
                daily: [],
                weekly: [],
                monthly: []
            }
        };
    }

    // Agent Performance Tracking
    trackAgentPerformance(agentName, metrics) {
        if (!this.metrics.agents[agentName]) {
            this.metrics.agents[agentName] = {
                tasksCompleted: 0,
                avgDuration: 0,
                successRate: 100,
                errorCount: 0,
                lastActive: new Date().toISOString(),
                specializations: [],
                performance: {
                    speed: 0,
                    quality: 0,
                    reliability: 100
                }
            };
        }

        const agent = this.metrics.agents[agentName];
        agent.tasksCompleted += metrics.tasksCompleted || 0;
        agent.avgDuration = this.calculateAverage(agent.avgDuration, metrics.duration || 0);
        agent.successRate = this.calculateSuccessRate(agent.successRate, metrics.success || true);
        agent.errorCount += metrics.errors || 0;
        agent.lastActive = new Date().toISOString();

        if (metrics.specialization) {
            agent.specializations.push(metrics.specialization);
        }

        this.updateAgentPerformanceScores(agentName, metrics);
        this.saveMetrics();
    }

    updateAgentPerformanceScores(agentName, metrics) {
        const agent = this.metrics.agents[agentName];
        
        // Speed calculation (tasks per hour)
        const tasksPerHour = metrics.duration ? 3600000 / metrics.duration : 0;
        agent.performance.speed = this.calculateAverage(agent.performance.speed, tasksPerHour);
        
        // Quality calculation (based on test pass rate, code review score)
        const qualityScore = (metrics.testPassRate || 100) * 0.4 + 
                           (metrics.codeReviewScore || 100) * 0.3 + 
                           (metrics.specCompliance || 100) * 0.3;
        agent.performance.quality = this.calculateAverage(agent.performance.quality, qualityScore);
        
        // Reliability calculation (uptime and error rate)
        const reliabilityScore = Math.max(0, 100 - (agent.errorCount / Math.max(agent.tasksCompleted, 1)) * 100);
        agent.performance.reliability = reliabilityScore;
    }

    // Workflow Performance Tracking
    trackWorkflowPerformance(workflowName, phases, metrics) {
        if (!this.metrics.workflows[workflowName]) {
            this.metrics.workflows[workflowName] = {
                executions: 0,
                avgDuration: 0,
                successRate: 100,
                phases: {},
                bottlenecks: [],
                efficiency: 100
            };
        }

        const workflow = this.metrics.workflows[workflowName];
        workflow.executions++;
        workflow.avgDuration = this.calculateAverage(workflow.avgDuration, metrics.totalDuration);
        workflow.successRate = this.calculateSuccessRate(workflow.successRate, metrics.success);

        phases.forEach(phase => {
            if (!workflow.phases[phase.name]) {
                workflow.phases[phase.name] = {
                    avgDuration: 0,
                    successRate: 100,
                    agentPerformance: {}
                };
            }
            
            const phaseData = workflow.phases[phase.name];
            phaseData.avgDuration = this.calculateAverage(phaseData.avgDuration, phase.duration);
            phaseData.successRate = this.calculateSuccessRate(phaseData.successRate, phase.success);
            
            if (phase.agent) {
                phaseData.agentPerformance[phase.agent] = {
                    duration: phase.duration,
                    success: phase.success,
                    timestamp: new Date().toISOString()
                };
            }
        });

        this.identifyBottlenecks(workflowName);
        this.saveMetrics();
    }

    identifyBottlenecks(workflowName) {
        const workflow = this.metrics.workflows[workflowName];
        const phases = Object.entries(workflow.phases);
        
        if (phases.length === 0) return;

        const avgWorkflowDuration = workflow.avgDuration;
        workflow.bottlenecks = phases
            .filter(([_, phase]) => phase.avgDuration > avgWorkflowDuration * 0.4)
            .map(([name, phase]) => ({
                phase: name,
                duration: phase.avgDuration,
                impact: (phase.avgDuration / avgWorkflowDuration * 100).toFixed(1)
            }))
            .sort((a, b) => b.duration - a.duration);
    }

    // Team Collaboration Metrics
    trackCollaboration(handoffData) {
        const { fromAgent, toAgent, duration, success, conflicts } = handoffData;
        
        // Update handoff success rate
        this.metrics.collaboration.handoffSuccess = 
            this.calculateSuccessRate(this.metrics.collaboration.handoffSuccess, success);
        
        // Track communication efficiency (response time)
        const communicationScore = duration < 30000 ? 100 : Math.max(0, 100 - (duration - 30000) / 1000);
        this.metrics.collaboration.communicationEfficiency = 
            this.calculateAverage(this.metrics.collaboration.communicationEfficiency, communicationScore);
        
        // Track conflict resolution
        if (conflicts > 0) {
            const resolutionScore = Math.max(0, 100 - conflicts * 10);
            this.metrics.collaboration.conflictResolution = 
                this.calculateAverage(this.metrics.collaboration.conflictResolution, resolutionScore);
        }

        this.saveMetrics();
    }

    // Real-time Status Monitoring
    getAgentStatuses() {
        const statuses = {};
        
        if (fs.existsSync(this.statusDir)) {
            const statusFiles = fs.readdirSync(this.statusDir)
                .filter(file => file.endsWith('-status.json'));
            
            statusFiles.forEach(file => {
                try {
                    const statusData = JSON.parse(
                        fs.readFileSync(path.join(this.statusDir, file), 'utf8')
                    );
                    const agentName = file.replace('-status.json', '');
                    statuses[agentName] = statusData;
                } catch (error) {
                    console.warn(`Failed to read status for ${file}:`, error.message);
                }
            });
        }
        
        return statuses;
    }

    // Performance Dashboard Generation
    generateDashboard() {
        const dashboard = {
            timestamp: new Date().toISOString(),
            summary: this.generateSummary(),
            agents: this.generateAgentReport(),
            workflows: this.generateWorkflowReport(),
            collaboration: this.generateCollaborationReport(),
            trends: this.generateTrends(),
            recommendations: this.generateRecommendations()
        };

        const dashboardPath = path.join(this.metricsDir, 'performance-dashboard.json');
        fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
        
        return dashboard;
    }

    generateSummary() {
        const totalAgents = Object.keys(this.metrics.agents).length;
        const activeAgents = Object.values(this.metrics.agents)
            .filter(agent => {
                const lastActive = new Date(agent.lastActive);
                const oneHourAgo = new Date(Date.now() - 3600000);
                return lastActive > oneHourAgo;
            }).length;

        const totalWorkflows = Object.keys(this.metrics.workflows).length;
        const avgSuccessRate = Object.values(this.metrics.agents)
            .reduce((sum, agent) => sum + agent.successRate, 0) / Math.max(totalAgents, 1);

        return {
            totalAgents,
            activeAgents,
            totalWorkflows,
            overallSuccessRate: avgSuccessRate.toFixed(1),
            systemHealth: this.calculateSystemHealth(),
            status: this.getSystemStatus()
        };
    }

    generateAgentReport() {
        return Object.entries(this.metrics.agents).map(([name, data]) => ({
            name,
            tasksCompleted: data.tasksCompleted,
            avgDuration: `${(data.avgDuration / 1000).toFixed(1)}s`,
            successRate: `${data.successRate.toFixed(1)}%`,
            performance: {
                speed: data.performance.speed.toFixed(1),
                quality: data.performance.quality.toFixed(1),
                reliability: data.performance.reliability.toFixed(1)
            },
            status: this.getAgentStatus(name),
            specializations: data.specializations.slice(-3) // Last 3 specializations
        }));
    }

    generateWorkflowReport() {
        return Object.entries(this.metrics.workflows).map(([name, data]) => ({
            name,
            executions: data.executions,
            avgDuration: `${(data.avgDuration / 1000).toFixed(1)}s`,
            successRate: `${data.successRate.toFixed(1)}%`,
            efficiency: `${data.efficiency.toFixed(1)}%`,
            bottlenecks: data.bottlenecks.slice(0, 3), // Top 3 bottlenecks
            phases: Object.keys(data.phases).length
        }));
    }

    generateCollaborationReport() {
        return {
            handoffSuccess: `${this.metrics.collaboration.handoffSuccess.toFixed(1)}%`,
            communicationEfficiency: `${this.metrics.collaboration.communicationEfficiency.toFixed(1)}%`,
            conflictResolution: `${this.metrics.collaboration.conflictResolution.toFixed(1)}%`,
            resourceUtilization: `${this.metrics.collaboration.resourceUtilization.toFixed(1)}%`,
            teamSynergy: this.calculateTeamSynergy()
        };
    }

    generateTrends() {
        // Generate daily, weekly, and monthly trend data
        return {
            performance: this.calculatePerformanceTrend(),
            quality: this.calculateQualityTrend(),
            collaboration: this.calculateCollaborationTrend()
        };
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Agent performance recommendations
        Object.entries(this.metrics.agents).forEach(([name, data]) => {
            if (data.successRate < 90) {
                recommendations.push({
                    type: 'agent_performance',
                    priority: 'high',
                    message: `Agent ${name} has low success rate (${data.successRate.toFixed(1)}%). Consider additional training or task reassignment.`
                });
            }
            
            if (data.performance.speed < 0.5) {
                recommendations.push({
                    type: 'agent_efficiency',
                    priority: 'medium',
                    message: `Agent ${name} has low task completion speed. Consider process optimization or resource allocation.`
                });
            }
        });

        // Workflow recommendations
        Object.entries(this.metrics.workflows).forEach(([name, data]) => {
            data.bottlenecks.forEach(bottleneck => {
                if (bottleneck.impact > 30) {
                    recommendations.push({
                        type: 'workflow_optimization',
                        priority: 'high',
                        message: `Workflow ${name} has bottleneck in ${bottleneck.phase} phase (${bottleneck.impact}% impact). Consider parallel processing or resource reallocation.`
                    });
                }
            });
        });

        // Collaboration recommendations
        if (this.metrics.collaboration.handoffSuccess < 95) {
            recommendations.push({
                type: 'collaboration',
                priority: 'medium',
                message: `Agent handoff success rate is low (${this.metrics.collaboration.handoffSuccess.toFixed(1)}%). Review handoff protocols and communication standards.`
            });
        }

        return recommendations;
    }

    // Utility Functions
    calculateAverage(current, newValue, weight = 0.1) {
        if (current === 0) return newValue;
        return current * (1 - weight) + newValue * weight;
    }

    calculateSuccessRate(current, success) {
        const newValue = success ? 100 : 0;
        return this.calculateAverage(current, newValue, 0.05);
    }

    calculateSystemHealth() {
        const agentHealth = Object.values(this.metrics.agents)
            .reduce((sum, agent) => sum + agent.performance.reliability, 0) / 
            Math.max(Object.keys(this.metrics.agents).length, 1);
        
        const workflowHealth = Object.values(this.metrics.workflows)
            .reduce((sum, workflow) => sum + workflow.successRate, 0) / 
            Math.max(Object.keys(this.metrics.workflows).length, 1);
        
        const collaborationHealth = (
            this.metrics.collaboration.handoffSuccess + 
            this.metrics.collaboration.communicationEfficiency + 
            this.metrics.collaboration.conflictResolution
        ) / 3;

        return ((agentHealth + workflowHealth + collaborationHealth) / 3).toFixed(1);
    }

    getSystemStatus() {
        const health = parseFloat(this.calculateSystemHealth());
        if (health >= 90) return 'excellent';
        if (health >= 75) return 'good';
        if (health >= 60) return 'fair';
        return 'needs_attention';
    }

    getAgentStatus(agentName) {
        const statuses = this.getAgentStatuses();
        const agentStatus = statuses[agentName];
        
        if (!agentStatus) return 'inactive';
        
        const lastUpdate = new Date(agentStatus.timestamp);
        const fiveMinutesAgo = new Date(Date.now() - 300000);
        
        if (lastUpdate < fiveMinutesAgo) return 'stale';
        return agentStatus.status || 'active';
    }

    calculateTeamSynergy() {
        const handoffScore = this.metrics.collaboration.handoffSuccess;
        const commScore = this.metrics.collaboration.communicationEfficiency;
        const conflictScore = this.metrics.collaboration.conflictResolution;
        
        return ((handoffScore + commScore + conflictScore) / 3).toFixed(1);
    }

    calculatePerformanceTrend() {
        // Simplified trend calculation - would be more sophisticated in production
        return 'improving'; // 'improving', 'stable', 'declining'
    }

    calculateQualityTrend() {
        return 'stable';
    }

    calculateCollaborationTrend() {
        return 'improving';
    }

    saveMetrics() {
        const metricsPath = path.join(this.metricsDir, 'bmad-metrics.json');
        fs.writeFileSync(metricsPath, JSON.stringify(this.metrics, null, 2));
    }

    loadMetrics() {
        const metricsPath = path.join(this.metricsDir, 'bmad-metrics.json');
        if (fs.existsSync(metricsPath)) {
            try {
                this.metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
            } catch (error) {
                console.warn('Failed to load existing metrics:', error.message);
            }
        }
    }

    // CLI Interface
    static async runCLI() {
        const args = process.argv.slice(2);
        const command = args[0];
        
        const tracker = new BMADPerformanceTracker();
        tracker.loadMetrics();

        switch (command) {
            case 'dashboard':
                const dashboard = tracker.generateDashboard();
                console.log(JSON.stringify(dashboard, null, 2));
                break;
            
            case 'status':
                const statuses = tracker.getAgentStatuses();
                console.log('Agent Statuses:');
                Object.entries(statuses).forEach(([name, status]) => {
                    console.log(`  ${name}: ${status.status} (${status.timestamp})`);
                });
                break;
            
            case 'summary':
                const summary = tracker.generateSummary();
                console.log('BMAD Performance Summary:');
                console.log(`  System Health: ${summary.systemHealth}% (${summary.status})`);
                console.log(`  Active Agents: ${summary.activeAgents}/${summary.totalAgents}`);
                console.log(`  Success Rate: ${summary.overallSuccessRate}%`);
                break;
            
            case 'track':
                const agentName = args[1];
                const metrics = JSON.parse(args[2] || '{}');
                if (agentName) {
                    tracker.trackAgentPerformance(agentName, metrics);
                    console.log(`Tracked performance for agent: ${agentName}`);
                } else {
                    console.log('Usage: node bmad-performance-tracker.js track <agent-name> <metrics-json>');
                }
                break;
            
            default:
                console.log(`
BMAD Performance Tracker

Usage:
  node bmad-performance-tracker.js <command> [options]

Commands:
  dashboard    Generate and display full performance dashboard
  status       Show current agent statuses
  summary      Show performance summary
  track        Track agent performance (requires agent name and metrics)

Examples:
  node bmad-performance-tracker.js dashboard
  node bmad-performance-tracker.js status
  node bmad-performance-tracker.js summary
  node bmad-performance-tracker.js track dev '{"tasksCompleted":1,"duration":30000,"success":true}'
                `);
        }
    }
}

// Run CLI if called directly
if (require.main === module) {
    BMADPerformanceTracker.runCLI();
}

module.exports = BMADPerformanceTracker;
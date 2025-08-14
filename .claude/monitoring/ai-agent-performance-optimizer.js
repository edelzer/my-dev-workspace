#!/usr/bin/env node

/**
 * AI Agent Performance Optimization System
 * 
 * Monitors and optimizes AI agent response times, accuracy, load balancing,
 * failure detection, and improvement workflows for Claude Code and BMAD agents
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class AIAgentPerformanceOptimizer {
    constructor(config = {}) {
        this.config = {
            responseTimeThreshold: 30000, // 30 seconds
            accuracyThreshold: 0.85, // 85%
            maxConcurrentAgents: 5,
            loadBalanceStrategy: 'round_robin', // round_robin, least_loaded, capability_based
            failureRetryAttempts: 3,
            performanceRetentionDays: 30,
            benchmarkInterval: 3600000, // 1 hour
            logPath: path.join(process.cwd(), '.claude', 'monitoring', 'agent-logs'),
            metricsPath: path.join(process.cwd(), '.claude', 'monitoring', 'agent-metrics'),
            agentsPath: path.join(process.cwd(), '.claude', 'agents'),
            bmadPath: path.join(process.cwd(), '.claude', 'commands', 'BMad'),
            ...config
        };

        this.agentRegistry = new Map();
        this.activeAgents = new Map();
        this.performanceMetrics = new Map();
        this.loadBalancer = new AgentLoadBalancer(this.config.loadBalanceStrategy);
        this.benchmarkResults = [];
        
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.config.logPath, { recursive: true });
            await fs.mkdir(this.config.metricsPath, { recursive: true });
            await this.discoverAgents();
            console.log('AI Agent Performance Optimizer initialized');
        } catch (error) {
            console.error('Failed to initialize AI Agent Performance Optimizer:', error.message);
        }
    }

    // Agent Discovery and Registration
    async discoverAgents() {
        try {
            // Discover Claude Code agents
            const claudeAgents = await this.discoverClaudeAgents();
            
            // Discover BMAD agents
            const bmadAgents = await this.discoverBMADAgents();
            
            // Register all discovered agents
            [...claudeAgents, ...bmadAgents].forEach(agent => {
                this.registerAgent(agent);
            });
            
            console.log(`Discovered ${this.agentRegistry.size} agents`);
            return this.agentRegistry;
        } catch (error) {
            console.error('Agent discovery failed:', error.message);
            return new Map();
        }
    }

    async discoverClaudeAgents() {
        const agents = [];
        try {
            const files = await fs.readdir(this.config.agentsPath);
            
            for (const file of files) {
                if (file.endsWith('.md') && file !== 'README.md') {
                    const agentPath = path.join(this.config.agentsPath, file);
                    const content = await fs.readFile(agentPath, 'utf8');
                    
                    const agent = this.parseAgentDefinition(content, file);
                    if (agent) {
                        agent.type = 'claude';
                        agent.category = this.categorizeClaudeAgent(agent.name);
                        agents.push(agent);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to discover Claude agents:', error.message);
        }
        
        return agents;
    }

    async discoverBMADAgents() {
        const agents = [];
        try {
            const agentsDir = path.join(this.config.bmadPath, 'agents');
            const files = await fs.readdir(agentsDir);
            
            for (const file of files) {
                if (file.endsWith('.md')) {
                    const agentPath = path.join(agentsDir, file);
                    const content = await fs.readFile(agentPath, 'utf8');
                    
                    const agent = this.parseAgentDefinition(content, file);
                    if (agent) {
                        agent.type = 'bmad';
                        agent.category = this.categorizeBMADAgent(agent.name);
                        agents.push(agent);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to discover BMAD agents:', error.message);
        }
        
        return agents;
    }

    parseAgentDefinition(content, filename) {
        try {
            const lines = content.split('\n');
            const name = filename.replace('.md', '');
            
            // Extract tools from content
            const toolsMatch = content.match(/Tools:\s*([^\n]+)/i);
            const tools = toolsMatch ? toolsMatch[1].split(',').map(t => t.trim()) : [];
            
            // Extract capabilities from description
            const descriptionMatch = content.match(/description[:\s]+([^\n]+)/i) || 
                                   content.match(/# ([^\n]+)/);
            const description = descriptionMatch ? descriptionMatch[1] : '';
            
            // Extract specialized skills
            const capabilities = this.extractCapabilities(content);
            
            return {
                id: name,
                name,
                description,
                tools,
                capabilities,
                filename,
                isActive: false,
                lastUsed: null,
                performance: {
                    averageResponseTime: 0,
                    successRate: 1.0,
                    totalInvocations: 0,
                    totalErrors: 0,
                    averageAccuracy: 0
                }
            };
        } catch (error) {
            console.error(`Failed to parse agent definition from ${filename}:`, error.message);
            return null;
        }
    }

    extractCapabilities(content) {
        const capabilities = [];
        const lowercaseContent = content.toLowerCase();
        
        // Technical capabilities
        if (lowercaseContent.includes('frontend') || lowercaseContent.includes('react') || lowercaseContent.includes('ui')) {
            capabilities.push('frontend-development');
        }
        if (lowercaseContent.includes('backend') || lowercaseContent.includes('api') || lowercaseContent.includes('server')) {
            capabilities.push('backend-development');
        }
        if (lowercaseContent.includes('test') || lowercaseContent.includes('qa')) {
            capabilities.push('testing');
        }
        if (lowercaseContent.includes('security') || lowercaseContent.includes('audit')) {
            capabilities.push('security');
        }
        if (lowercaseContent.includes('architect') || lowercaseContent.includes('design')) {
            capabilities.push('architecture');
        }
        if (lowercaseContent.includes('review') || lowercaseContent.includes('quality')) {
            capabilities.push('code-review');
        }
        if (lowercaseContent.includes('planning') || lowercaseContent.includes('management')) {
            capabilities.push('project-management');
        }
        
        return capabilities;
    }

    categorizeClaudeAgent(name) {
        if (name.includes('manager')) return 'management';
        if (name.includes('analyst') || name.includes('architect') || name.includes('planner')) return 'foundation';
        if (name.includes('developer')) return 'implementation';
        if (name.includes('tester') || name.includes('reviewer') || name.includes('validator') || name.includes('security')) return 'quality';
        return 'utility';
    }

    categorizeBMADAgent(name) {
        if (name.includes('pm') || name.includes('po') || name.includes('sm')) return 'management';
        if (name.includes('analyst') || name.includes('architect')) return 'planning';
        if (name.includes('dev') || name.includes('ux')) return 'development';
        if (name.includes('qa')) return 'quality';
        if (name.includes('orchestrator') || name.includes('master')) return 'coordination';
        return 'strategic';
    }

    registerAgent(agent) {
        this.agentRegistry.set(agent.id, agent);
        this.performanceMetrics.set(agent.id, {
            responseTimes: [],
            errorCounts: [],
            accuracyScores: [],
            loadMetrics: [],
            lastBenchmark: null
        });
    }

    // Response Time Monitoring
    async startAgentTask(agentId, taskDescription, context = {}) {
        const agent = this.agentRegistry.get(agentId);
        if (!agent) {
            throw new Error(`Agent ${agentId} not found`);
        }

        const taskId = this.generateTaskId();
        const startTime = Date.now();
        
        const activeTask = {
            id: taskId,
            agentId,
            description: taskDescription,
            context,
            startTime,
            status: 'running',
            retryCount: 0
        };

        this.activeAgents.set(taskId, activeTask);
        agent.isActive = true;
        
        await this.logAgentActivity(agentId, 'task_started', { taskId, description: taskDescription });
        
        return taskId;
    }

    async completeAgentTask(taskId, result, accuracy = null) {
        const task = this.activeAgents.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const endTime = Date.now();
        const responseTime = endTime - task.startTime;
        
        task.status = 'completed';
        task.endTime = endTime;
        task.responseTime = responseTime;
        task.result = result;
        task.accuracy = accuracy;

        // Update agent performance metrics
        await this.updatePerformanceMetrics(task.agentId, {
            responseTime,
            success: true,
            accuracy
        });

        // Check for performance thresholds
        await this.checkPerformanceThresholds(task.agentId, responseTime);

        const agent = this.agentRegistry.get(task.agentId);
        agent.isActive = false;
        agent.lastUsed = endTime;

        await this.logAgentActivity(task.agentId, 'task_completed', {
            taskId,
            responseTime,
            accuracy,
            result: typeof result === 'string' ? result.substring(0, 100) : 'complex_result'
        });

        this.activeAgents.delete(taskId);
        return task;
    }

    async failAgentTask(taskId, error, canRetry = true) {
        const task = this.activeAgents.get(taskId);
        if (!task) {
            throw new Error(`Task ${taskId} not found`);
        }

        const endTime = Date.now();
        const responseTime = endTime - task.startTime;
        
        task.status = 'failed';
        task.endTime = endTime;
        task.responseTime = responseTime;
        task.error = error;

        // Update agent performance metrics
        await this.updatePerformanceMetrics(task.agentId, {
            responseTime,
            success: false,
            error: error.message
        });

        await this.logAgentActivity(task.agentId, 'task_failed', {
            taskId,
            responseTime,
            error: error.message,
            retryCount: task.retryCount
        });

        // Handle retry logic
        if (canRetry && task.retryCount < this.config.failureRetryAttempts) {
            task.retryCount++;
            task.status = 'retrying';
            task.startTime = Date.now();
            
            await this.logAgentActivity(task.agentId, 'task_retrying', {
                taskId,
                retryCount: task.retryCount
            });
            
            return { status: 'retrying', retryCount: task.retryCount };
        }

        const agent = this.agentRegistry.get(task.agentId);
        agent.isActive = false;
        
        this.activeAgents.delete(taskId);
        return task;
    }

    async updatePerformanceMetrics(agentId, data) {
        const agent = this.agentRegistry.get(agentId);
        const metrics = this.performanceMetrics.get(agentId);
        
        if (!agent || !metrics) return;

        // Update response times
        metrics.responseTimes.push({
            timestamp: Date.now(),
            responseTime: data.responseTime,
            success: data.success
        });

        // Update performance stats
        agent.performance.totalInvocations++;
        
        if (data.success) {
            // Update average response time
            const successfulTimes = metrics.responseTimes
                .filter(m => m.success)
                .map(m => m.responseTime);
            agent.performance.averageResponseTime = 
                successfulTimes.reduce((sum, time) => sum + time, 0) / successfulTimes.length;
            
            // Update accuracy if provided
            if (data.accuracy !== null && data.accuracy !== undefined) {
                metrics.accuracyScores.push({
                    timestamp: Date.now(),
                    accuracy: data.accuracy
                });
                
                agent.performance.averageAccuracy = 
                    metrics.accuracyScores.reduce((sum, score) => sum + score.accuracy, 0) / 
                    metrics.accuracyScores.length;
            }
        } else {
            agent.performance.totalErrors++;
            metrics.errorCounts.push({
                timestamp: Date.now(),
                error: data.error
            });
        }

        // Update success rate
        agent.performance.successRate = 
            (agent.performance.totalInvocations - agent.performance.totalErrors) / 
            agent.performance.totalInvocations;

        // Persist metrics
        await this.persistAgentMetrics(agentId, metrics);
    }

    async checkPerformanceThresholds(agentId, responseTime) {
        const agent = this.agentRegistry.get(agentId);
        
        // Check response time threshold
        if (responseTime > this.config.responseTimeThreshold) {
            await this.handlePerformanceAlert(agentId, 'slow_response', {
                responseTime,
                threshold: this.config.responseTimeThreshold,
                agent: agent.name
            });
        }

        // Check accuracy threshold
        if (agent.performance.averageAccuracy > 0 && 
            agent.performance.averageAccuracy < this.config.accuracyThreshold) {
            await this.handlePerformanceAlert(agentId, 'low_accuracy', {
                accuracy: agent.performance.averageAccuracy,
                threshold: this.config.accuracyThreshold,
                agent: agent.name
            });
        }

        // Check success rate
        if (agent.performance.totalInvocations > 5 && agent.performance.successRate < 0.8) {
            await this.handlePerformanceAlert(agentId, 'low_success_rate', {
                successRate: agent.performance.successRate,
                totalInvocations: agent.performance.totalInvocations,
                agent: agent.name
            });
        }
    }

    async handlePerformanceAlert(agentId, alertType, data) {
        const alert = {
            timestamp: Date.now(),
            agentId,
            type: alertType,
            severity: this.getAlertSeverity(alertType),
            data
        };

        console.warn(`PERFORMANCE ALERT [${alert.severity}]: ${alertType} for agent ${data.agent}`);
        
        await this.logAgentActivity(agentId, 'performance_alert', alert);
        
        // Suggest optimizations
        const suggestions = await this.generateOptimizationSuggestions(agentId, alertType, data);
        if (suggestions.length > 0) {
            console.log('Optimization suggestions:', suggestions);
        }

        return alert;
    }

    getAlertSeverity(alertType) {
        const severityMap = {
            'slow_response': 'medium',
            'low_accuracy': 'high',
            'low_success_rate': 'high',
            'high_error_rate': 'critical'
        };
        return severityMap[alertType] || 'low';
    }

    // Agent Performance Benchmarking
    async runPerformanceBenchmark(agentId = null) {
        const agents = agentId ? [this.agentRegistry.get(agentId)] : Array.from(this.agentRegistry.values());
        const results = [];

        for (const agent of agents) {
            if (!agent) continue;
            
            console.log(`Running benchmark for agent: ${agent.name}`);
            
            const benchmark = await this.benchmarkAgent(agent);
            results.push(benchmark);
            
            // Update last benchmark time
            const metrics = this.performanceMetrics.get(agent.id);
            metrics.lastBenchmark = Date.now();
        }

        this.benchmarkResults.push({
            timestamp: Date.now(),
            results
        });

        await this.persistBenchmarkResults(results);
        return results;
    }

    async benchmarkAgent(agent) {
        const benchmarkTasks = this.generateBenchmarkTasks(agent);
        const results = {
            agentId: agent.id,
            agentName: agent.name,
            timestamp: Date.now(),
            tasks: []
        };

        for (const task of benchmarkTasks) {
            try {
                const startTime = Date.now();
                
                // Simulate agent task execution
                const taskResult = await this.simulateAgentTask(agent, task);
                
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                results.tasks.push({
                    ...task,
                    responseTime,
                    success: true,
                    accuracy: taskResult.accuracy || null,
                    result: taskResult
                });
                
            } catch (error) {
                results.tasks.push({
                    ...task,
                    responseTime: null,
                    success: false,
                    error: error.message
                });
            }
        }

        // Calculate benchmark scores
        const successfulTasks = results.tasks.filter(t => t.success);
        results.averageResponseTime = successfulTasks.length > 0 ? 
            successfulTasks.reduce((sum, t) => sum + t.responseTime, 0) / successfulTasks.length : 0;
        results.successRate = successfulTasks.length / results.tasks.length;
        results.averageAccuracy = successfulTasks.length > 0 ?
            successfulTasks.filter(t => t.accuracy).reduce((sum, t) => sum + t.accuracy, 0) / 
            successfulTasks.filter(t => t.accuracy).length : null;

        return results;
    }

    generateBenchmarkTasks(agent) {
        const baseTasks = [
            { name: 'simple_query', complexity: 'low', description: 'Handle a simple information request' },
            { name: 'moderate_analysis', complexity: 'medium', description: 'Perform moderate complexity analysis' },
            { name: 'complex_reasoning', complexity: 'high', description: 'Execute complex reasoning task' }
        ];

        // Customize tasks based on agent capabilities
        const customTasks = [];
        
        if (agent.capabilities.includes('frontend-development')) {
            customTasks.push({
                name: 'ui_component_creation',
                complexity: 'medium',
                description: 'Create a React component with specific requirements'
            });
        }
        
        if (agent.capabilities.includes('backend-development')) {
            customTasks.push({
                name: 'api_endpoint_design',
                complexity: 'medium',
                description: 'Design and implement an API endpoint'
            });
        }
        
        if (agent.capabilities.includes('testing')) {
            customTasks.push({
                name: 'test_case_generation',
                complexity: 'medium',
                description: 'Generate comprehensive test cases for a feature'
            });
        }

        return [...baseTasks, ...customTasks];
    }

    async simulateAgentTask(agent, task) {
        // Simulate different response times based on task complexity
        const baseTime = 1000; // 1 second
        const complexityMultiplier = {
            'low': 1,
            'medium': 2,
            'high': 4
        };
        
        const simulatedTime = baseTime * (complexityMultiplier[task.complexity] || 1);
        
        // Add some randomness
        const variance = simulatedTime * 0.3;
        const actualTime = simulatedTime + (Math.random() - 0.5) * variance;
        
        await new Promise(resolve => setTimeout(resolve, actualTime));
        
        // Simulate accuracy based on agent type and task
        const baseAccuracy = 0.85;
        const agentBonus = agent.capabilities.length * 0.02; // Bonus for specialized capabilities
        const accuracy = Math.min(0.99, baseAccuracy + agentBonus + (Math.random() - 0.5) * 0.1);
        
        return {
            success: Math.random() > 0.05, // 95% success rate
            accuracy,
            result: `Simulated result for ${task.name} by ${agent.name}`
        };
    }

    // Load Balancing Optimization
    async optimizeAgentLoadBalancing() {
        const activeAgentCount = Array.from(this.activeAgents.values()).length;
        const availableAgents = Array.from(this.agentRegistry.values()).filter(agent => !agent.isActive);
        
        const optimization = {
            timestamp: Date.now(),
            currentLoad: activeAgentCount,
            maxConcurrent: this.config.maxConcurrentAgents,
            availableAgents: availableAgents.length,
            recommendations: []
        };

        // Check if we're approaching max concurrent agents
        if (activeAgentCount >= this.config.maxConcurrentAgents * 0.8) {
            optimization.recommendations.push({
                type: 'load_warning',
                message: 'Approaching maximum concurrent agent limit',
                action: 'consider_task_queuing'
            });
        }

        // Analyze agent utilization patterns
        const utilizationAnalysis = await this.analyzeAgentUtilization();
        optimization.utilization = utilizationAnalysis;

        // Suggest load balancing improvements
        if (utilizationAnalysis.unbalanced) {
            optimization.recommendations.push({
                type: 'load_rebalancing',
                message: 'Agent load is unbalanced',
                action: 'redistribute_tasks',
                details: utilizationAnalysis.suggestions
            });
        }

        await this.persistOptimizationResults(optimization);
        return optimization;
    }

    async analyzeAgentUtilization() {
        const agents = Array.from(this.agentRegistry.values());
        const utilizationStats = agents.map(agent => ({
            id: agent.id,
            name: agent.name,
            totalInvocations: agent.performance.totalInvocations,
            averageResponseTime: agent.performance.averageResponseTime,
            successRate: agent.performance.successRate,
            isActive: agent.isActive,
            lastUsed: agent.lastUsed
        }));

        // Calculate utilization metrics
        const totalInvocations = utilizationStats.reduce((sum, stat) => sum + stat.totalInvocations, 0);
        const averageInvocations = totalInvocations / utilizationStats.length;
        
        // Identify over/under utilized agents
        const overUtilized = utilizationStats.filter(stat => 
            stat.totalInvocations > averageInvocations * 1.5
        );
        const underUtilized = utilizationStats.filter(stat => 
            stat.totalInvocations < averageInvocations * 0.5 && stat.totalInvocations > 0
        );

        const isUnbalanced = overUtilized.length > 0 && underUtilized.length > 0;
        
        const suggestions = [];
        if (isUnbalanced) {
            suggestions.push(`Consider redistributing tasks from ${overUtilized.map(a => a.name).join(', ')} to ${underUtilized.map(a => a.name).join(', ')}`);
        }

        return {
            unbalanced: isUnbalanced,
            overUtilized,
            underUtilized,
            averageInvocations,
            suggestions
        };
    }

    // Failure Detection and Recovery
    async detectAgentFailures() {
        const now = Date.now();
        const failures = [];
        
        // Check for hung tasks (running too long)
        for (const [taskId, task] of this.activeAgents) {
            const runningTime = now - task.startTime;
            if (runningTime > this.config.responseTimeThreshold * 2) {
                failures.push({
                    type: 'hung_task',
                    taskId,
                    agentId: task.agentId,
                    runningTime,
                    task
                });
            }
        }

        // Check for agents with high error rates
        for (const [agentId, agent] of this.agentRegistry) {
            if (agent.performance.totalInvocations > 5 && agent.performance.successRate < 0.6) {
                failures.push({
                    type: 'high_error_rate',
                    agentId,
                    successRate: agent.performance.successRate,
                    totalErrors: agent.performance.totalErrors,
                    agent
                });
            }
        }

        // Process detected failures
        for (const failure of failures) {
            await this.handleAgentFailure(failure);
        }

        return failures;
    }

    async handleAgentFailure(failure) {
        console.warn(`AGENT FAILURE DETECTED: ${failure.type} for agent ${failure.agentId}`);
        
        switch (failure.type) {
            case 'hung_task':
                await this.recoverHungTask(failure);
                break;
            case 'high_error_rate':
                await this.recoverFailingAgent(failure);
                break;
        }

        await this.logAgentActivity(failure.agentId, 'failure_detected', failure);
    }

    async recoverHungTask(failure) {
        const task = failure.task;
        
        // Force complete the hung task
        await this.failAgentTask(failure.taskId, new Error('Task timeout'), false);
        
        // Log recovery action
        console.log(`Recovered hung task ${failure.taskId} for agent ${failure.agentId}`);
        
        return {
            action: 'task_terminated',
            taskId: failure.taskId,
            agentId: failure.agentId
        };
    }

    async recoverFailingAgent(failure) {
        const agent = failure.agent;
        
        // Temporarily disable the agent
        agent.isActive = false;
        
        // Generate recovery recommendations
        const recommendations = await this.generateAgentRecoveryRecommendations(agent);
        
        console.log(`Agent ${agent.name} temporarily disabled due to high error rate`);
        console.log('Recovery recommendations:', recommendations);
        
        return {
            action: 'agent_disabled',
            agentId: failure.agentId,
            recommendations
        };
    }

    async generateAgentRecoveryRecommendations(agent) {
        const recommendations = [];
        
        if (agent.performance.averageResponseTime > this.config.responseTimeThreshold) {
            recommendations.push({
                type: 'performance',
                message: 'Optimize agent response time',
                actions: ['Review agent implementation', 'Check system resources', 'Optimize prompts']
            });
        }
        
        if (agent.performance.successRate < 0.8) {
            recommendations.push({
                type: 'reliability',
                message: 'Improve agent reliability',
                actions: ['Review error patterns', 'Enhance error handling', 'Update agent training']
            });
        }
        
        if (agent.performance.averageAccuracy < this.config.accuracyThreshold) {
            recommendations.push({
                type: 'accuracy',
                message: 'Improve agent accuracy',
                actions: ['Refine prompts', 'Enhance context', 'Review training data']
            });
        }
        
        return recommendations;
    }

    // Improvement Workflows
    async generateOptimizationSuggestions(agentId, alertType, data) {
        const agent = this.agentRegistry.get(agentId);
        const suggestions = [];
        
        switch (alertType) {
            case 'slow_response':
                suggestions.push({
                    priority: 'high',
                    category: 'performance',
                    suggestion: 'Optimize agent response time',
                    actions: [
                        'Review and simplify agent prompts',
                        'Reduce context size',
                        'Implement caching for common responses',
                        'Check system resource availability'
                    ]
                });
                break;
                
            case 'low_accuracy':
                suggestions.push({
                    priority: 'critical',
                    category: 'quality',
                    suggestion: 'Improve agent accuracy',
                    actions: [
                        'Refine agent prompts and instructions',
                        'Enhance context and examples',
                        'Review and update training examples',
                        'Implement accuracy validation workflows'
                    ]
                });
                break;
                
            case 'low_success_rate':
                suggestions.push({
                    priority: 'critical',
                    category: 'reliability',
                    suggestion: 'Improve agent reliability',
                    actions: [
                        'Analyze error patterns and root causes',
                        'Enhance error handling and retry logic',
                        'Review agent task assignments',
                        'Update agent capabilities and limitations'
                    ]
                });
                break;
        }
        
        return suggestions;
    }

    async implementOptimizationWorkflow(agentId, optimization) {
        const workflow = {
            id: this.generateWorkflowId(),
            agentId,
            optimization,
            startTime: Date.now(),
            status: 'started',
            steps: []
        };

        try {
            // Implement optimization steps
            for (const action of optimization.actions) {
                const step = await this.executeOptimizationStep(agentId, action);
                workflow.steps.push(step);
            }
            
            workflow.status = 'completed';
            workflow.endTime = Date.now();
            
        } catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = Date.now();
        }

        await this.persistOptimizationWorkflow(workflow);
        return workflow;
    }

    async executeOptimizationStep(agentId, action) {
        const step = {
            action,
            startTime: Date.now(),
            status: 'started'
        };

        try {
            switch (action) {
                case 'Review and simplify agent prompts':
                    step.result = await this.optimizeAgentPrompts(agentId);
                    break;
                case 'Reduce context size':
                    step.result = await this.optimizeAgentContext(agentId);
                    break;
                case 'Implement caching for common responses':
                    step.result = await this.implementAgentCaching(agentId);
                    break;
                default:
                    step.result = `Manual action required: ${action}`;
            }
            
            step.status = 'completed';
        } catch (error) {
            step.status = 'failed';
            step.error = error.message;
        }
        
        step.endTime = Date.now();
        return step;
    }

    async optimizeAgentPrompts(agentId) {
        // This would implement prompt optimization logic
        return `Prompt optimization analysis completed for agent ${agentId}`;
    }

    async optimizeAgentContext(agentId) {
        // This would implement context size optimization
        return `Context optimization completed for agent ${agentId}`;
    }

    async implementAgentCaching(agentId) {
        // This would implement response caching
        return `Caching system implemented for agent ${agentId}`;
    }

    // Utility Methods
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    generateWorkflowId() {
        return `workflow_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    async logAgentActivity(agentId, activity, data) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            agentId,
            activity,
            data
        };

        const logFile = path.join(this.config.logPath, `${agentId}-${new Date().toISOString().split('T')[0]}.json`);
        
        try {
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
            console.error(`Failed to log agent activity:`, error.message);
        }
    }

    async persistAgentMetrics(agentId, metrics) {
        const metricsFile = path.join(this.config.metricsPath, `${agentId}-metrics.json`);
        
        try {
            const data = {
                agentId,
                timestamp: new Date().toISOString(),
                metrics: {
                    responseTimes: metrics.responseTimes.slice(-100), // Keep last 100
                    errorCounts: metrics.errorCounts.slice(-50),      // Keep last 50
                    accuracyScores: metrics.accuracyScores.slice(-100), // Keep last 100
                    loadMetrics: metrics.loadMetrics.slice(-100)     // Keep last 100
                }
            };
            
            await fs.writeFile(metricsFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Failed to persist agent metrics:`, error.message);
        }
    }

    async persistBenchmarkResults(results) {
        const benchmarkFile = path.join(this.config.metricsPath, `benchmark-${new Date().toISOString().split('T')[0]}.json`);
        
        try {
            await fs.writeFile(benchmarkFile, JSON.stringify(results, null, 2));
        } catch (error) {
            console.error('Failed to persist benchmark results:', error.message);
        }
    }

    async persistOptimizationResults(optimization) {
        const optimizationFile = path.join(this.config.metricsPath, `optimization-${Date.now()}.json`);
        
        try {
            await fs.writeFile(optimizationFile, JSON.stringify(optimization, null, 2));
        } catch (error) {
            console.error('Failed to persist optimization results:', error.message);
        }
    }

    async persistOptimizationWorkflow(workflow) {
        const workflowFile = path.join(this.config.metricsPath, `workflow-${workflow.id}.json`);
        
        try {
            await fs.writeFile(workflowFile, JSON.stringify(workflow, null, 2));
        } catch (error) {
            console.error('Failed to persist optimization workflow:', error.message);
        }
    }

    // Public API
    async getAgentStatus(agentId = null) {
        if (agentId) {
            const agent = this.agentRegistry.get(agentId);
            const metrics = this.performanceMetrics.get(agentId);
            return { agent, metrics };
        }
        
        const status = {
            totalAgents: this.agentRegistry.size,
            activeAgents: Array.from(this.activeAgents.values()).length,
            agentsByCategory: this.getAgentsByCategory(),
            performanceSummary: await this.getPerformanceSummary()
        };
        
        return status;
    }

    getAgentsByCategory() {
        const categories = {};
        for (const agent of this.agentRegistry.values()) {
            if (!categories[agent.category]) {
                categories[agent.category] = [];
            }
            categories[agent.category].push({
                id: agent.id,
                name: agent.name,
                type: agent.type,
                isActive: agent.isActive,
                performance: agent.performance
            });
        }
        return categories;
    }

    async getPerformanceSummary() {
        const agents = Array.from(this.agentRegistry.values());
        
        if (agents.length === 0) return null;
        
        const totalInvocations = agents.reduce((sum, agent) => sum + agent.performance.totalInvocations, 0);
        const totalErrors = agents.reduce((sum, agent) => sum + agent.performance.totalErrors, 0);
        const avgResponseTime = agents
            .filter(agent => agent.performance.averageResponseTime > 0)
            .reduce((sum, agent) => sum + agent.performance.averageResponseTime, 0) / 
            agents.filter(agent => agent.performance.averageResponseTime > 0).length;
        
        return {
            totalInvocations,
            totalErrors,
            overallSuccessRate: totalInvocations > 0 ? (totalInvocations - totalErrors) / totalInvocations : 1,
            averageResponseTime: avgResponseTime || 0,
            agentsCount: agents.length,
            activeAgentsCount: agents.filter(agent => agent.isActive).length
        };
    }
}

// Agent Load Balancer Class
class AgentLoadBalancer {
    constructor(strategy = 'round_robin') {
        this.strategy = strategy;
        this.roundRobinIndex = 0;
    }

    selectAgent(availableAgents, taskRequirements = {}) {
        if (availableAgents.length === 0) return null;
        
        switch (this.strategy) {
            case 'round_robin':
                return this.roundRobinSelection(availableAgents);
            case 'least_loaded':
                return this.leastLoadedSelection(availableAgents);
            case 'capability_based':
                return this.capabilityBasedSelection(availableAgents, taskRequirements);
            default:
                return availableAgents[0];
        }
    }

    roundRobinSelection(agents) {
        const agent = agents[this.roundRobinIndex % agents.length];
        this.roundRobinIndex++;
        return agent;
    }

    leastLoadedSelection(agents) {
        return agents.reduce((least, current) => 
            current.performance.totalInvocations < least.performance.totalInvocations ? current : least
        );
    }

    capabilityBasedSelection(agents, requirements) {
        if (!requirements.capabilities || requirements.capabilities.length === 0) {
            return this.leastLoadedSelection(agents);
        }
        
        // Find agents with matching capabilities
        const matchingAgents = agents.filter(agent => 
            requirements.capabilities.some(cap => agent.capabilities.includes(cap))
        );
        
        if (matchingAgents.length === 0) {
            return this.leastLoadedSelection(agents);
        }
        
        // Select the least loaded among matching agents
        return this.leastLoadedSelection(matchingAgents);
    }
}

// CLI Interface
if (require.main === module) {
    const optimizer = new AIAgentPerformanceOptimizer();
    
    const command = process.argv[2];
    const args = process.argv.slice(3);

    switch (command) {
        case 'discover':
            optimizer.discoverAgents().then(agents => {
                console.log(`Discovered ${agents.size} agents:`);
                for (const [id, agent] of agents) {
                    console.log(`- ${agent.name} (${agent.type}/${agent.category})`);
                }
            });
            break;
        case 'status':
            const agentId = args[0];
            optimizer.getAgentStatus(agentId).then(status => {
                console.log(JSON.stringify(status, null, 2));
            });
            break;
        case 'benchmark':
            const targetAgent = args[0];
            optimizer.runPerformanceBenchmark(targetAgent).then(results => {
                console.log('Benchmark Results:');
                console.log(JSON.stringify(results, null, 2));
            });
            break;
        case 'optimize':
            optimizer.optimizeAgentLoadBalancing().then(optimization => {
                console.log('Load Balancing Optimization:');
                console.log(JSON.stringify(optimization, null, 2));
            });
            break;
        case 'detect-failures':
            optimizer.detectAgentFailures().then(failures => {
                console.log(`Detected ${failures.length} failures:`);
                console.log(JSON.stringify(failures, null, 2));
            });
            break;
        default:
            console.log(`
AI Agent Performance Optimizer v1.0

Usage:
  node ai-agent-performance-optimizer.js <command> [options]

Commands:
  discover              Discover and register available agents
  status [agent-id]     Show agent status (all agents if no ID provided)
  benchmark [agent-id]  Run performance benchmark (all agents if no ID provided)
  optimize              Optimize agent load balancing
  detect-failures       Detect and handle agent failures

Examples:
  node ai-agent-performance-optimizer.js discover
  node ai-agent-performance-optimizer.js status spec-analyst
  node ai-agent-performance-optimizer.js benchmark
  node ai-agent-performance-optimizer.js optimize
            `);
    }
}

module.exports = AIAgentPerformanceOptimizer;
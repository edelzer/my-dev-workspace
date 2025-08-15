#!/usr/bin/env node

/**
 * Development Workflow Analytics MCP Server
 * Phase 5.6: Advanced Analytics & Intelligence
 * 
 * Provides comprehensive workflow analytics, bottleneck detection,
 * productivity trends, and optimization recommendations.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Database } from './database.js';
import {
  WorkflowMetrics,
  AgentPerformance,
  WorkflowBottleneck,
  OptimizationRecommendation,
  ProductivityTrend,
  SystemHealth,
  AnalyticsConfig,
  WorkflowSession,
  PerformanceReport,
  MLModel,
  AnalyticsEvent
} from './types.js';

class WorkflowAnalyticsServer {
  private server: Server;
  private db: Database;
  private config: AnalyticsConfig;
  private activeSession: WorkflowSession | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'workflow-analytics',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.db = new Database();
    this.config = this.getDefaultConfig();
    this.setupHandlers();
    this.startMonitoring();
  }

  private getDefaultConfig(): AnalyticsConfig {
    return {
      monitoringEnabled: true,
      dataRetentionDays: 30,
      alertThresholds: {
        errorRatePercent: 10,
        responseTimeMs: 5000,
        resourceUtilizationPercent: 80,
        qualityScoreMin: 0.7
      },
      bottleneckDetection: {
        enabled: true,
        sensitivityLevel: 'medium',
        minConfidenceThreshold: 0.7
      },
      predictiveAnalytics: {
        enabled: true,
        forecastPeriods: 7,
        minDataPointsRequired: 100
      }
    };
  }

  private async startMonitoring() {
    setInterval(async () => {
      if (this.config.monitoringEnabled) {
        await this.analyzeWorkflowMetrics();
        await this.detectBottlenecks();
        await this.generateOptimizations();
      }
    }, 60000); // Run every minute
  }

  private async analyzeWorkflowMetrics() {
    const metrics = await this.db.getRecentMetrics(60);
    
    if (metrics.length > 0) {
      const avgResponseTime = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      const errorRate = (metrics.filter(m => !m.success).length / metrics.length) * 100;
      const avgQuality = metrics.reduce((sum, m) => sum + m.outputQuality, 0) / metrics.length;

      // Check alert thresholds
      if (errorRate > this.config.alertThresholds.errorRatePercent) {
        await this.createAlert('high_error_rate', { errorRate });
      }
      if (avgResponseTime > this.config.alertThresholds.responseTimeMs) {
        await this.createAlert('slow_response', { avgResponseTime });
      }
      if (avgQuality < this.config.alertThresholds.qualityScoreMin) {
        await this.createAlert('low_quality', { avgQuality });
      }
    }
  }

  private async detectBottlenecks() {
    if (!this.config.bottleneckDetection.enabled) return;

    const metrics = await this.db.getRecentMetrics(300); // Last 5 hours
    const agentPerformance = await this.analyzeAgentPerformance(metrics);
    
    // Detect agent bottlenecks
    for (const agent of agentPerformance) {
      if (agent.efficiency < 50) {
        await this.createBottleneck({
          type: 'agent',
          agentId: agent.agentId,
          severity: agent.efficiency < 25 ? 'critical' : 'high',
          description: `Agent ${agent.agentId} operating at ${agent.efficiency}% efficiency`,
          confidence: 0.85
        });
      }
    }

    // Detect system bottlenecks
    const systemMetrics = this.aggregateSystemMetrics(metrics);
    if (systemMetrics.avgResourceUtilization > this.config.alertThresholds.resourceUtilizationPercent) {
      await this.createBottleneck({
        type: 'system',
        severity: 'high',
        description: 'System resource utilization exceeding threshold',
        confidence: 0.9
      });
    }
  }

  private async generateOptimizations() {
    const bottlenecks = await this.db.getUnresolvedBottlenecks();
    
    for (const bottleneck of bottlenecks) {
      const recommendations = await this.generateRecommendations(bottleneck);
      await this.db.saveRecommendations(recommendations);
    }
  }

  private async generateRecommendations(bottleneck: WorkflowBottleneck): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    if (bottleneck.type === 'agent') {
      recommendations.push({
        id: `rec_${Date.now()}_1`,
        type: 'performance',
        priority: bottleneck.severity === 'critical' ? 'immediate' : 'high',
        title: 'Optimize Agent Performance',
        description: `Improve performance of agent ${bottleneck.agentId}`,
        actionItems: [
          'Review agent configuration and parameters',
          'Consider load balancing across multiple agents',
          'Optimize context size and prompt engineering',
          'Implement caching for frequently accessed data'
        ],
        estimatedImpact: {
          performanceGain: 30,
          resourceSaving: 20,
          timeReduction: 15,
          qualityImprovement: 10
        },
        implementation: {
          difficulty: 'medium',
          estimatedTime: 4,
          requirements: ['Agent configuration access', 'Performance monitoring'],
          risks: ['Temporary service disruption', 'Learning curve']
        },
        createdAt: Date.now(),
        status: 'pending'
      });
    }

    return recommendations;
  }

  private async analyzeAgentPerformance(metrics: WorkflowMetrics[]): Promise<AgentPerformance[]> {
    const agentMap = new Map<string, WorkflowMetrics[]>();
    
    for (const metric of metrics) {
      if (!agentMap.has(metric.agentId)) {
        agentMap.set(metric.agentId, []);
      }
      agentMap.get(metric.agentId)!.push(metric);
    }

    const performances: AgentPerformance[] = [];
    
    for (const [agentId, agentMetrics] of agentMap) {
      const successCount = agentMetrics.filter(m => m.success).length;
      const totalDuration = agentMetrics.reduce((sum, m) => sum + m.duration, 0);
      const totalQuality = agentMetrics.reduce((sum, m) => sum + m.outputQuality, 0);
      
      performances.push({
        agentId,
        agentType: agentMetrics[0].agentType,
        totalTasks: agentMetrics.length,
        successRate: (successCount / agentMetrics.length) * 100,
        averageDuration: totalDuration / agentMetrics.length,
        averageQuality: totalQuality / agentMetrics.length,
        totalUptime: Date.now() - Math.min(...agentMetrics.map(m => m.timestamp)),
        lastActivity: Math.max(...agentMetrics.map(m => m.timestamp)),
        capabilities: [],
        currentLoad: 0,
        trendDirection: this.calculateTrend(agentMetrics),
        efficiency: this.calculateEfficiency(agentMetrics)
      });
    }

    return performances;
  }

  private calculateTrend(metrics: WorkflowMetrics[]): 'improving' | 'declining' | 'stable' {
    if (metrics.length < 2) return 'stable';
    
    const recent = metrics.slice(-10);
    const older = metrics.slice(0, 10);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.outputQuality, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.outputQuality, 0) / older.length;
    
    if (recentAvg > olderAvg * 1.1) return 'improving';
    if (recentAvg < olderAvg * 0.9) return 'declining';
    return 'stable';
  }

  private calculateEfficiency(metrics: WorkflowMetrics[]): number {
    const successRate = metrics.filter(m => m.success).length / metrics.length;
    const avgQuality = metrics.reduce((sum, m) => sum + m.outputQuality, 0) / metrics.length;
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    const normalizedDuration = Math.min(1, 1000 / avgDuration); // Normalize to 0-1
    
    return Math.round((successRate * 0.4 + avgQuality * 0.4 + normalizedDuration * 0.2) * 100);
  }

  private aggregateSystemMetrics(metrics: WorkflowMetrics[]) {
    const totalMemory = metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    const totalCpu = metrics.reduce((sum, m) => sum + m.cpuUsage, 0);
    
    return {
      avgResourceUtilization: ((totalMemory + totalCpu) / (metrics.length * 2)) * 100,
      totalOperations: metrics.length,
      errorCount: metrics.filter(m => !m.success).length
    };
  }

  private async createAlert(type: string, data: any) {
    const event: AnalyticsEvent = {
      id: `alert_${Date.now()}`,
      type: 'alert',
      timestamp: Date.now(),
      source: 'workflow_analytics',
      data: { alertType: type, ...data },
      processed: false,
      priority: 'high'
    };
    
    await this.db.saveEvent(event);
  }

  private async createBottleneck(params: any) {
    const bottleneck: WorkflowBottleneck = {
      id: `bottleneck_${Date.now()}`,
      type: params.type,
      severity: params.severity,
      agentId: params.agentId,
      description: params.description,
      impactMetrics: {
        delayTime: 0,
        affectedTasks: 0,
        qualityImpact: 0,
        resourceWaste: 0
      },
      detectedAt: Date.now(),
      confidence: params.confidence,
      recommendations: []
    };
    
    await this.db.saveBottleneck(bottleneck);
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'record_workflow_metric':
            return await this.recordWorkflowMetric(args);
          case 'start_workflow_session':
            return await this.startWorkflowSession(args);
          case 'end_workflow_session':
            return await this.endWorkflowSession(args);
          case 'get_productivity_trends':
            return await this.getProductivityTrends(args);
          case 'get_agent_performance':
            return await this.getAgentPerformance(args);
          case 'detect_bottlenecks':
            return await this.detectBottlenecksManual(args);
          case 'get_optimization_recommendations':
            return await this.getOptimizationRecommendations(args);
          case 'generate_performance_report':
            return await this.generatePerformanceReport(args);
          case 'get_system_health':
            return await this.getSystemHealth();
          case 'configure_analytics':
            return await this.configureAnalytics(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'record_workflow_metric',
        description: 'Record a workflow performance metric',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' },
            agentType: { type: 'string', enum: ['custom', 'bmad'] },
            taskId: { type: 'string' },
            operation: { type: 'string' },
            duration: { type: 'number' },
            success: { type: 'boolean' },
            outputQuality: { type: 'number', minimum: 0, maximum: 1 },
            metadata: { type: 'object' }
          },
          required: ['agentId', 'operation', 'duration', 'success']
        }
      },
      {
        name: 'start_workflow_session',
        description: 'Start a new workflow analytics session',
        inputSchema: {
          type: 'object',
          properties: {
            primaryAgent: { type: 'string' },
            collaboratingAgents: { type: 'array', items: { type: 'string' } },
            tasks: { type: 'array', items: { type: 'string' } }
          },
          required: ['primaryAgent']
        }
      },
      {
        name: 'end_workflow_session',
        description: 'End the current workflow session',
        inputSchema: {
          type: 'object',
          properties: {
            outcome: { type: 'string', enum: ['success', 'partial', 'failure'] },
            lessons: { type: 'array', items: { type: 'string' } }
          },
          required: ['outcome']
        }
      },
      {
        name: 'get_productivity_trends',
        description: 'Get productivity trend analysis',
        inputSchema: {
          type: 'object',
          properties: {
            period: { type: 'string', enum: ['1h', '1d', '1w', '1m'] },
            agentId: { type: 'string' }
          },
          required: ['period']
        }
      },
      {
        name: 'get_agent_performance',
        description: 'Get performance metrics for agents',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' },
            timeRange: { type: 'number', description: 'Hours to look back' }
          }
        }
      },
      {
        name: 'detect_bottlenecks',
        description: 'Manually trigger bottleneck detection',
        inputSchema: {
          type: 'object',
          properties: {
            sensitivityLevel: { type: 'string', enum: ['low', 'medium', 'high'] }
          }
        }
      },
      {
        name: 'get_optimization_recommendations',
        description: 'Get workflow optimization recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            priority: { type: 'string', enum: ['immediate', 'high', 'medium', 'low'] },
            type: { type: 'string', enum: ['performance', 'resource', 'workflow', 'architecture'] }
          }
        }
      },
      {
        name: 'generate_performance_report',
        description: 'Generate a comprehensive performance report',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'custom'] },
            startDate: { type: 'string' },
            endDate: { type: 'string' }
          },
          required: ['type']
        }
      },
      {
        name: 'get_system_health',
        description: 'Get current system health status',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'configure_analytics',
        description: 'Configure analytics settings',
        inputSchema: {
          type: 'object',
          properties: {
            monitoringEnabled: { type: 'boolean' },
            dataRetentionDays: { type: 'number' },
            alertThresholds: { type: 'object' },
            bottleneckDetection: { type: 'object' },
            predictiveAnalytics: { type: 'object' }
          }
        }
      }
    ];
  }

  private async recordWorkflowMetric(args: any) {
    const metric: WorkflowMetrics = {
      id: `metric_${Date.now()}`,
      timestamp: Date.now(),
      agentId: args.agentId,
      agentType: args.agentType || 'custom',
      taskId: args.taskId,
      operation: args.operation,
      duration: args.duration,
      success: args.success,
      errorType: args.errorType,
      memoryUsage: args.memoryUsage || 0,
      cpuUsage: args.cpuUsage || 0,
      contextSize: args.contextSize || 0,
      outputQuality: args.outputQuality || 0.8,
      metadata: args.metadata || {}
    };

    await this.db.saveMetric(metric);

    return {
      content: [{
        type: 'text',
        text: `Workflow metric recorded: ${metric.id}`
      }]
    };
  }

  private async startWorkflowSession(args: any) {
    this.activeSession = {
      id: `session_${Date.now()}`,
      startTime: Date.now(),
      primaryAgent: args.primaryAgent,
      collaboratingAgents: args.collaboratingAgents || [],
      tasks: args.tasks || [],
      totalOperations: 0,
      successfulOperations: 0,
      averageQuality: 0,
      totalDuration: 0,
      bottlenecksEncountered: [],
      optimizationsApplied: [],
      outcome: 'success',
      lessons: []
    };

    await this.db.saveSession(this.activeSession);

    return {
      content: [{
        type: 'text',
        text: `Workflow session started: ${this.activeSession.id}`
      }]
    };
  }

  private async endWorkflowSession(args: any) {
    if (!this.activeSession) {
      return {
        content: [{
          type: 'text',
          text: 'No active session to end'
        }]
      };
    }

    this.activeSession.endTime = Date.now();
    this.activeSession.outcome = args.outcome;
    this.activeSession.lessons = args.lessons || [];
    this.activeSession.totalDuration = this.activeSession.endTime - this.activeSession.startTime;

    await this.db.updateSession(this.activeSession);
    
    const sessionId = this.activeSession.id;
    this.activeSession = null;

    return {
      content: [{
        type: 'text',
        text: `Workflow session ended: ${sessionId}`
      }]
    };
  }

  private async getProductivityTrends(args: any) {
    const trends = await this.db.getProductivityTrends(args.period, args.agentId);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(trends, null, 2)
      }]
    };
  }

  private async getAgentPerformance(args: any) {
    const timeRange = args.timeRange || 24;
    const metrics = await this.db.getRecentMetrics(timeRange * 60);
    const performance = await this.analyzeAgentPerformance(metrics);
    
    if (args.agentId) {
      const agentPerf = performance.find(p => p.agentId === args.agentId);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(agentPerf, null, 2)
        }]
      };
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(performance, null, 2)
      }]
    };
  }

  private async detectBottlenecksManual(args: any) {
    const oldSensitivity = this.config.bottleneckDetection.sensitivityLevel;
    if (args.sensitivityLevel) {
      this.config.bottleneckDetection.sensitivityLevel = args.sensitivityLevel;
    }
    
    await this.detectBottlenecks();
    
    this.config.bottleneckDetection.sensitivityLevel = oldSensitivity;
    
    const bottlenecks = await this.db.getUnresolvedBottlenecks();
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(bottlenecks, null, 2)
      }]
    };
  }

  private async getOptimizationRecommendations(args: any) {
    const recommendations = await this.db.getRecommendations(args.priority, args.type);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(recommendations, null, 2)
      }]
    };
  }

  private async generatePerformanceReport(args: any) {
    const report = await this.db.generateReport(args.type, args.startDate, args.endDate);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(report, null, 2)
      }]
    };
  }

  private async getSystemHealth() {
    const metrics = await this.db.getRecentMetrics(60);
    const agentPerformance = await this.analyzeAgentPerformance(metrics);
    const bottlenecks = await this.db.getUnresolvedBottlenecks();
    const recommendations = await this.db.getRecommendations();
    
    const health: SystemHealth = {
      timestamp: Date.now(),
      overallScore: this.calculateHealthScore(metrics, agentPerformance, bottlenecks),
      agents: {
        active: agentPerformance.length,
        total: agentPerformance.length,
        healthyCount: agentPerformance.filter(a => a.efficiency > 70).length,
        performingWellCount: agentPerformance.filter(a => a.efficiency > 85).length
      },
      performance: {
        averageResponseTime: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length || 0,
        successRate: (metrics.filter(m => m.success).length / metrics.length) * 100 || 0,
        errorRate: (metrics.filter(m => !m.success).length / metrics.length) * 100 || 0,
        resourceUtilization: this.aggregateSystemMetrics(metrics).avgResourceUtilization
      },
      bottlenecks: {
        critical: bottlenecks.filter(b => b.severity === 'critical').length,
        high: bottlenecks.filter(b => b.severity === 'high').length,
        medium: bottlenecks.filter(b => b.severity === 'medium').length,
        low: bottlenecks.filter(b => b.severity === 'low').length
      },
      recommendations: {
        immediate: recommendations.filter(r => r.priority === 'immediate').length,
        high: recommendations.filter(r => r.priority === 'high').length,
        total: recommendations.length
      }
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(health, null, 2)
      }]
    };
  }

  private calculateHealthScore(metrics: WorkflowMetrics[], agents: AgentPerformance[], bottlenecks: WorkflowBottleneck[]): number {
    let score = 100;
    
    // Deduct for poor performance
    const avgEfficiency = agents.reduce((sum, a) => sum + a.efficiency, 0) / agents.length || 0;
    score -= (100 - avgEfficiency) * 0.3;
    
    // Deduct for errors
    const errorRate = (metrics.filter(m => !m.success).length / metrics.length) * 100 || 0;
    score -= errorRate * 0.5;
    
    // Deduct for bottlenecks
    score -= bottlenecks.filter(b => b.severity === 'critical').length * 10;
    score -= bottlenecks.filter(b => b.severity === 'high').length * 5;
    score -= bottlenecks.filter(b => b.severity === 'medium').length * 2;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private async configureAnalytics(args: any) {
    if (args.monitoringEnabled !== undefined) {
      this.config.monitoringEnabled = args.monitoringEnabled;
    }
    if (args.dataRetentionDays !== undefined) {
      this.config.dataRetentionDays = args.dataRetentionDays;
    }
    if (args.alertThresholds) {
      Object.assign(this.config.alertThresholds, args.alertThresholds);
    }
    if (args.bottleneckDetection) {
      Object.assign(this.config.bottleneckDetection, args.bottleneckDetection);
    }
    if (args.predictiveAnalytics) {
      Object.assign(this.config.predictiveAnalytics, args.predictiveAnalytics);
    }
    
    await this.db.saveConfig(this.config);
    
    return {
      content: [{
        type: 'text',
        text: `Analytics configuration updated successfully`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Workflow Analytics MCP server running on stdio');
  }
}

const server = new WorkflowAnalyticsServer();
server.run().catch(console.error);
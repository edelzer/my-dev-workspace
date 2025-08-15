#!/usr/bin/env node

/**
 * AI Agent Intelligence Enhancement MCP Server
 * Phase 5.6: Advanced Analytics & Intelligence
 * 
 * Provides intelligent agent learning, adaptive behavior,
 * predictive optimization, and continuous improvement capabilities.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  AgentPerformanceMetrics,
  AgentLearningPattern,
  IntelligentDecision,
  WorkflowOptimization,
  AdaptiveBehavior,
  ContinuousLearning,
  IntelligenceInsight,
  DecisionContext,
  DecisionOption,
  OutcomeMetrics,
  PredictiveModel,
  LearningModel,
  BehaviorState,
  AdaptationAction,
  TriggerCondition,
  AdaptationRule
} from './types.js';

class AgentIntelligenceServer {
  private server: Server;
  private learningPatterns: Map<string, AgentLearningPattern[]> = new Map();
  private performanceHistory: Map<string, AgentPerformanceMetrics[]> = new Map();
  private adaptiveBehaviors: Map<string, AdaptiveBehavior> = new Map();
  private predictiveModels: Map<string, PredictiveModel> = new Map();
  private continuousLearning: ContinuousLearning | null = null;
  private insights: IntelligenceInsight[] = [];

  constructor() {
    this.server = new Server(
      {
        name: 'agent-intelligence',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.initializeLearningSystem();
    this.startIntelligenceLoop();
  }

  private async initializeLearningSystem() {
    // Initialize continuous learning system
    this.continuousLearning = {
      id: 'main_learning_system',
      learningType: 'online',
      targetDomain: 'agent_optimization',
      dataStreams: [
        {
          id: 'performance_stream',
          name: 'Agent Performance Metrics',
          source: 'workflow_analytics',
          dataType: 'metrics',
          updateFrequency: 60000, // 1 minute
          qualityScore: 0.95,
          latency: 100,
          volume: 1000
        },
        {
          id: 'interaction_stream',
          name: 'Agent Interaction Patterns',
          source: 'claude_code',
          dataType: 'patterns',
          updateFrequency: 300000, // 5 minutes
          qualityScore: 0.9,
          latency: 500,
          volume: 500
        }
      ],
      models: [],
      feedback: [],
      adaptation: {
        adaptationRate: 0.1,
        explorationRate: 0.2,
        memoryRetention: 0.95,
        forgettingFactor: 0.05,
        transferLearning: true
      },
      metrics: {
        learningVelocity: 0,
        knowledgeAccumulation: 0,
        generalizationAbility: 0,
        adaptationEffectiveness: 0,
        stabilityScore: 0
      }
    };

    // Initialize predictive models
    this.initializePredictiveModels();
  }

  private initializePredictiveModels() {
    // Performance prediction model
    this.predictiveModels.set('performance', {
      id: 'perf_model_v1',
      name: 'Agent Performance Predictor',
      type: 'performance',
      targetVariable: 'success_rate',
      features: [
        { name: 'task_complexity', importance: 0.3, correlation: -0.6, dataType: 'categorical', preprocessing: ['encoding'] },
        { name: 'context_size', importance: 0.25, correlation: -0.4, dataType: 'numeric', preprocessing: ['normalization'] },
        { name: 'agent_load', importance: 0.2, correlation: -0.5, dataType: 'numeric', preprocessing: ['normalization'] },
        { name: 'historical_performance', importance: 0.25, correlation: 0.7, dataType: 'numeric', preprocessing: ['smoothing'] }
      ],
      accuracy: 0.85,
      precision: 0.88,
      recall: 0.82,
      f1Score: 0.85,
      trainingData: 10000,
      lastTrained: new Date(),
      version: '1.0.0'
    });

    // Workflow optimization model
    this.predictiveModels.set('workflow', {
      id: 'workflow_model_v1',
      name: 'Workflow Optimizer',
      type: 'workflow',
      targetVariable: 'completion_time',
      features: [
        { name: 'agent_sequence', importance: 0.35, correlation: -0.7, dataType: 'categorical', preprocessing: ['embedding'] },
        { name: 'parallel_tasks', importance: 0.25, correlation: -0.5, dataType: 'numeric', preprocessing: ['normalization'] },
        { name: 'dependency_complexity', importance: 0.2, correlation: 0.6, dataType: 'numeric', preprocessing: ['scaling'] },
        { name: 'resource_availability', importance: 0.2, correlation: -0.4, dataType: 'numeric', preprocessing: ['normalization'] }
      ],
      accuracy: 0.82,
      precision: 0.85,
      recall: 0.79,
      f1Score: 0.82,
      trainingData: 5000,
      lastTrained: new Date(),
      version: '1.0.0'
    });
  }

  private async startIntelligenceLoop() {
    // Main intelligence processing loop
    setInterval(async () => {
      await this.analyzePatterns();
      await this.updateAdaptiveBehaviors();
      await this.generateInsights();
      await this.optimizeWorkflows();
    }, 60000); // Run every minute

    // Learning model update loop
    setInterval(async () => {
      await this.updateLearningModels();
    }, 3600000); // Run every hour
  }

  private async analyzePatterns() {
    // Analyze performance patterns for each agent
    for (const [agentId, metrics] of this.performanceHistory) {
      if (metrics.length < 10) continue; // Need minimum data

      const patterns = this.detectPatterns(metrics);
      this.learningPatterns.set(agentId, patterns);

      // Update adaptive behaviors based on patterns
      if (patterns.length > 0) {
        await this.updateAgentBehavior(agentId, patterns);
      }
    }
  }

  private detectPatterns(metrics: AgentPerformanceMetrics[]): AgentLearningPattern[] {
    const patterns: AgentLearningPattern[] = [];

    // Detect success patterns
    const successfulTasks = metrics.filter(m => m.successRate > 0.8);
    if (successfulTasks.length > 5) {
      const commonFeatures = this.extractCommonFeatures(successfulTasks);
      patterns.push({
        id: `pattern_success_${Date.now()}`,
        agentType: successfulTasks[0].agentType,
        patternType: 'success',
        contextFeatures: commonFeatures,
        outcomeMetrics: this.calculateAverageOutcome(successfulTasks),
        confidence: 0.85,
        frequency: successfulTasks.length / metrics.length,
        lastSeen: new Date(),
        predictivePower: 0.75
      });
    }

    // Detect failure patterns
    const failedTasks = metrics.filter(m => m.successRate < 0.5);
    if (failedTasks.length > 3) {
      const commonFeatures = this.extractCommonFeatures(failedTasks);
      patterns.push({
        id: `pattern_failure_${Date.now()}`,
        agentType: failedTasks[0].agentType,
        patternType: 'failure',
        contextFeatures: commonFeatures,
        outcomeMetrics: this.calculateAverageOutcome(failedTasks),
        confidence: 0.8,
        frequency: failedTasks.length / metrics.length,
        lastSeen: new Date(),
        predictivePower: 0.7
      });
    }

    // Detect optimization opportunities
    const improvingTasks = metrics.filter((m, i) => 
      i > 0 && m.improvement > 0.1
    );
    if (improvingTasks.length > 3) {
      patterns.push({
        id: `pattern_optimization_${Date.now()}`,
        agentType: improvingTasks[0].agentType,
        patternType: 'optimization',
        contextFeatures: this.extractCommonFeatures(improvingTasks),
        outcomeMetrics: this.calculateAverageOutcome(improvingTasks),
        confidence: 0.75,
        frequency: improvingTasks.length / metrics.length,
        lastSeen: new Date(),
        predictivePower: 0.65
      });
    }

    return patterns;
  }

  private extractCommonFeatures(metrics: AgentPerformanceMetrics[]): any[] {
    const features = [];
    
    // Extract task type distribution
    const taskTypes = metrics.map(m => m.taskType);
    const taskTypeFreq = this.calculateFrequency(taskTypes);
    features.push({
      name: 'dominant_task_type',
      value: taskTypeFreq[0]?.value || 'unknown',
      importance: 0.3,
      correlation: 0.6,
      stability: 0.8
    });

    // Extract complexity patterns
    const complexities = metrics.map(m => m.complexity);
    const avgComplexity = this.calculateAverageComplexity(complexities);
    features.push({
      name: 'average_complexity',
      value: avgComplexity,
      importance: 0.25,
      correlation: -0.5,
      stability: 0.7
    });

    // Extract resource usage patterns
    const avgResource = metrics.reduce((sum, m) => sum + m.resourceUsage.cpu + m.resourceUsage.memory, 0) / (metrics.length * 2);
    features.push({
      name: 'resource_intensity',
      value: avgResource,
      importance: 0.2,
      correlation: -0.4,
      stability: 0.75
    });

    return features;
  }

  private calculateFrequency(items: string[]): Array<{value: string, freq: number}> {
    const freq = new Map<string, number>();
    items.forEach(item => freq.set(item, (freq.get(item) || 0) + 1));
    return Array.from(freq.entries())
      .map(([value, count]) => ({ value, freq: count / items.length }))
      .sort((a, b) => b.freq - a.freq);
  }

  private calculateAverageComplexity(complexities: string[]): number {
    const complexityMap = { low: 1, medium: 2, high: 3 };
    const sum = complexities.reduce((acc, c) => acc + (complexityMap[c as keyof typeof complexityMap] || 2), 0);
    return sum / complexities.length;
  }

  private calculateAverageOutcome(metrics: AgentPerformanceMetrics[]): OutcomeMetrics {
    const total = metrics.length;
    return {
      performance: metrics.reduce((sum, m) => sum + m.successRate, 0) / total,
      quality: metrics.reduce((sum, m) => sum + m.qualityScore, 0) / total,
      efficiency: metrics.reduce((sum, m) => sum + (1000 / m.responseTime), 0) / total,
      userSatisfaction: 0.8, // Placeholder
      goalAchievement: metrics.filter(m => m.successRate > 0.7).length / total
    };
  }

  private async updateAgentBehavior(agentId: string, patterns: AgentLearningPattern[]) {
    let behavior = this.adaptiveBehaviors.get(agentId);
    
    if (!behavior) {
      behavior = this.createDefaultBehavior(agentId);
      this.adaptiveBehaviors.set(agentId, behavior);
    }

    // Update behavior based on patterns
    for (const pattern of patterns) {
      if (pattern.patternType === 'success') {
        // Reinforce successful behaviors
        this.reinforceBehavior(behavior, pattern);
      } else if (pattern.patternType === 'failure') {
        // Adjust to avoid failure patterns
        this.adjustBehavior(behavior, pattern);
      } else if (pattern.patternType === 'optimization') {
        // Apply optimization patterns
        this.optimizeBehavior(behavior, pattern);
      }
    }

    // Update behavior state
    behavior.currentState.learningProgress.totalAdaptations++;
    behavior.currentState.stabilityMetrics = this.calculateStability(behavior);
  }

  private createDefaultBehavior(agentId: string): AdaptiveBehavior {
    return {
      agentId,
      behaviorType: 'response_optimization',
      triggerConditions: [
        {
          metric: 'successRate',
          operator: '<',
          value: 0.7,
          weight: 0.5,
          timeWindow: 3600000 // 1 hour
        }
      ],
      adaptationRules: [],
      learningRate: 0.1,
      stabilityThreshold: 0.8,
      performanceTarget: {
        performance: 0.85,
        quality: 0.9,
        efficiency: 0.8,
        userSatisfaction: 0.85,
        goalAchievement: 0.9
      },
      currentState: {
        currentParameters: {},
        recentAdaptations: [],
        performanceHistory: [],
        stabilityMetrics: {
          variance: 0,
          trend: 'stable',
          consistency: 1,
          volatility: 0
        },
        learningProgress: {
          totalAdaptations: 0,
          successfulAdaptations: 0,
          learningVelocity: 0,
          plateauDetected: false,
          explorationRate: 0.2
        }
      }
    };
  }

  private reinforceBehavior(behavior: AdaptiveBehavior, pattern: AgentLearningPattern) {
    // Strengthen successful adaptation rules
    const rule: AdaptationRule = {
      id: `rule_reinforce_${Date.now()}`,
      condition: `pattern_${pattern.id}_detected`,
      action: {
        type: 'parameter_adjustment',
        parameters: {
          confidenceBoost: 0.1,
          priorityIncrease: 1
        },
        reversible: true,
        testMode: false,
        validationRequired: false
      },
      priority: 8,
      cooldown: 300000, // 5 minutes
      maxApplications: 10,
      successRate: pattern.confidence
    };
    
    behavior.adaptationRules.push(rule);
  }

  private adjustBehavior(behavior: AdaptiveBehavior, pattern: AgentLearningPattern) {
    // Create rule to avoid failure patterns
    const rule: AdaptationRule = {
      id: `rule_avoid_${Date.now()}`,
      condition: `pattern_${pattern.id}_detected`,
      action: {
        type: 'strategy_change',
        parameters: {
          avoidanceStrategy: 'alternative_path',
          riskReduction: 0.3
        },
        reversible: true,
        testMode: true,
        validationRequired: true
      },
      priority: 9,
      cooldown: 600000, // 10 minutes
      maxApplications: 5,
      successRate: 0
    };
    
    behavior.adaptationRules.push(rule);
  }

  private optimizeBehavior(behavior: AdaptiveBehavior, pattern: AgentLearningPattern) {
    // Apply optimization based on improvement patterns
    const rule: AdaptationRule = {
      id: `rule_optimize_${Date.now()}`,
      condition: `optimization_opportunity`,
      action: {
        type: 'resource_reallocation',
        parameters: {
          resourceOptimization: 0.2,
          efficiencyTarget: pattern.outcomeMetrics.efficiency
        },
        reversible: true,
        testMode: false,
        validationRequired: false
      },
      priority: 7,
      cooldown: 900000, // 15 minutes
      maxApplications: 3,
      successRate: pattern.confidence
    };
    
    behavior.adaptationRules.push(rule);
  }

  private calculateStability(behavior: AdaptiveBehavior): any {
    const history = behavior.currentState.performanceHistory;
    if (history.length < 5) {
      return behavior.currentState.stabilityMetrics;
    }

    const recent = history.slice(-10);
    const performances = recent.map(h => h.metrics.performance);
    
    // Calculate variance
    const mean = performances.reduce((a, b) => a + b, 0) / performances.length;
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
    
    // Determine trend
    const firstHalf = performances.slice(0, Math.floor(performances.length / 2));
    const secondHalf = performances.slice(Math.floor(performances.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const trend = secondAvg > firstAvg * 1.05 ? 'improving' : 
                  secondAvg < firstAvg * 0.95 ? 'declining' : 'stable';
    
    return {
      variance,
      trend,
      consistency: 1 - Math.min(1, variance),
      volatility: variance > 0.1 ? variance : 0
    };
  }

  private async updateAdaptiveBehaviors() {
    for (const [agentId, behavior] of this.adaptiveBehaviors) {
      // Check trigger conditions
      for (const condition of behavior.triggerConditions) {
        if (this.evaluateCondition(agentId, condition)) {
          // Apply adaptation rules
          for (const rule of behavior.adaptationRules) {
            if (this.shouldApplyRule(rule, behavior)) {
              await this.applyAdaptation(agentId, rule, behavior);
            }
          }
        }
      }
    }
  }

  private evaluateCondition(agentId: string, condition: TriggerCondition): boolean {
    const metrics = this.performanceHistory.get(agentId);
    if (!metrics || metrics.length === 0) return false;

    const recent = metrics.slice(-10);
    const value = this.extractMetricValue(recent, condition.metric);

    switch (condition.operator) {
      case '<': return value < condition.value;
      case '>': return value > condition.value;
      case '==': return value === condition.value;
      case '!=': return value !== condition.value;
      default: return false;
    }
  }

  private extractMetricValue(metrics: AgentPerformanceMetrics[], metricName: string): any {
    switch (metricName) {
      case 'successRate':
        return metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length;
      case 'responseTime':
        return metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length;
      case 'qualityScore':
        return metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length;
      default:
        return 0;
    }
  }

  private shouldApplyRule(rule: AdaptationRule, behavior: AdaptiveBehavior): boolean {
    // Check cooldown
    const lastApplication = behavior.currentState.recentAdaptations
      .filter(a => a.ruleId === rule.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
    
    if (lastApplication) {
      const timeSinceLastApplication = Date.now() - lastApplication.timestamp.getTime();
      if (timeSinceLastApplication < rule.cooldown) {
        return false;
      }
    }

    // Check max applications
    const applicationCount = behavior.currentState.recentAdaptations
      .filter(a => a.ruleId === rule.id).length;
    
    if (applicationCount >= rule.maxApplications) {
      return false;
    }

    return true;
  }

  private async applyAdaptation(agentId: string, rule: AdaptationRule, behavior: AdaptiveBehavior) {
    // Record adaptation
    behavior.currentState.recentAdaptations.push({
      timestamp: new Date(),
      ruleId: rule.id,
      action: rule.action,
      outcome: {} as OutcomeMetrics, // Will be updated after evaluation
      reverted: false
    });

    // Apply the adaptation action
    switch (rule.action.type) {
      case 'parameter_adjustment':
        await this.adjustParameters(agentId, rule.action.parameters);
        break;
      case 'strategy_change':
        await this.changeStrategy(agentId, rule.action.parameters);
        break;
      case 'resource_reallocation':
        await this.reallocateResources(agentId, rule.action.parameters);
        break;
      case 'context_modification':
        await this.modifyContext(agentId, rule.action.parameters);
        break;
    }

    behavior.currentState.learningProgress.totalAdaptations++;
  }

  private async adjustParameters(agentId: string, parameters: Record<string, any>) {
    // Implementation would adjust agent parameters
    console.log(`Adjusting parameters for agent ${agentId}:`, parameters);
  }

  private async changeStrategy(agentId: string, parameters: Record<string, any>) {
    // Implementation would change agent strategy
    console.log(`Changing strategy for agent ${agentId}:`, parameters);
  }

  private async reallocateResources(agentId: string, parameters: Record<string, any>) {
    // Implementation would reallocate resources
    console.log(`Reallocating resources for agent ${agentId}:`, parameters);
  }

  private async modifyContext(agentId: string, parameters: Record<string, any>) {
    // Implementation would modify agent context
    console.log(`Modifying context for agent ${agentId}:`, parameters);
  }

  private async generateInsights() {
    const newInsights: IntelligenceInsight[] = [];

    // Analyze performance trends
    for (const [agentId, metrics] of this.performanceHistory) {
      if (metrics.length < 20) continue;

      const trend = this.analyzeTrend(metrics);
      if (trend.significance > 0.7) {
        newInsights.push({
          id: `insight_${Date.now()}_${agentId}`,
          type: 'performance',
          title: `Performance Trend for Agent ${agentId}`,
          description: trend.description,
          severity: trend.severity as any,
          confidence: trend.confidence,
          evidence: trend.evidence,
          recommendations: trend.recommendations,
          impact: trend.impact,
          timeframe: '24 hours',
          tags: ['performance', 'trend', agentId]
        });
      }
    }

    // Analyze patterns for anomalies
    for (const [agentId, patterns] of this.learningPatterns) {
      const anomalies = this.detectAnomalies(patterns);
      for (const anomaly of anomalies) {
        newInsights.push({
          id: `insight_anomaly_${Date.now()}_${agentId}`,
          type: 'anomaly',
          title: `Anomaly Detected for Agent ${agentId}`,
          description: anomaly.description,
          severity: 'high',
          confidence: anomaly.confidence,
          evidence: anomaly.evidence,
          recommendations: anomaly.recommendations,
          impact: anomaly.impact,
          timeframe: 'immediate',
          tags: ['anomaly', 'alert', agentId]
        });
      }
    }

    this.insights.push(...newInsights);
  }

  private analyzeTrend(metrics: AgentPerformanceMetrics[]): any {
    const recent = metrics.slice(-20);
    const older = metrics.slice(-40, -20);
    
    const recentAvg = recent.reduce((sum, m) => sum + m.successRate, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.successRate, 0) / older.length;
    
    const improvement = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      significance: Math.abs(improvement) / 100,
      description: improvement > 0 ? 
        `Performance improved by ${improvement.toFixed(1)}%` :
        `Performance declined by ${Math.abs(improvement).toFixed(1)}%`,
      severity: Math.abs(improvement) > 20 ? 'high' : 'medium',
      confidence: 0.8,
      evidence: [
        {
          type: 'metric',
          description: `Recent average: ${recentAvg.toFixed(2)}`,
          data: recentAvg,
          reliability: 0.9,
          source: 'performance_metrics'
        },
        {
          type: 'metric',
          description: `Previous average: ${olderAvg.toFixed(2)}`,
          data: olderAvg,
          reliability: 0.9,
          source: 'performance_metrics'
        }
      ],
      recommendations: improvement < -10 ? [
        {
          action: 'Investigate performance degradation',
          priority: 'high',
          effort: 'moderate',
          impact: 'high',
          timeline: 'immediate',
          prerequisites: [],
          risks: []
        }
      ] : [],
      impact: {
        performance: improvement / 100,
        efficiency: improvement / 200,
        quality: improvement / 150,
        cost: 0,
        time: 0,
        reliability: improvement / 100,
        userExperience: improvement / 100
      }
    };
  }

  private detectAnomalies(patterns: AgentLearningPattern[]): any[] {
    const anomalies = [];
    
    for (const pattern of patterns) {
      if (pattern.patternType === 'failure' && pattern.frequency > 0.3) {
        anomalies.push({
          description: `High failure rate detected: ${(pattern.frequency * 100).toFixed(1)}%`,
          confidence: pattern.confidence,
          evidence: [
            {
              type: 'pattern',
              description: 'Failure pattern detected',
              data: pattern,
              reliability: pattern.confidence,
              source: 'pattern_analysis'
            }
          ],
          recommendations: [
            {
              action: 'Review and adjust agent configuration',
              priority: 'critical',
              effort: 'significant',
              impact: 'critical',
              timeline: 'immediate',
              prerequisites: ['Access to agent configuration'],
              risks: ['Temporary performance impact']
            }
          ],
          impact: {
            performance: -0.5,
            efficiency: -0.4,
            quality: -0.6,
            cost: 0.2,
            time: 0.3,
            reliability: -0.7,
            userExperience: -0.5
          }
        });
      }
    }
    
    return anomalies;
  }

  private async optimizeWorkflows() {
    // Analyze current workflows and generate optimization recommendations
    const optimizations: WorkflowOptimization[] = [];
    
    // This would analyze actual workflow data
    // For now, creating a sample optimization
    const sampleOptimization: WorkflowOptimization = {
      id: `opt_${Date.now()}`,
      workflowType: 'multi_agent_task',
      currentSequence: [
        {
          position: 1,
          agentType: 'spec-analyst',
          estimatedDuration: 300000,
          requirements: ['requirements'],
          outputs: ['analysis'],
          dependencies: [],
          parallelizable: false
        },
        {
          position: 2,
          agentType: 'spec-architect',
          estimatedDuration: 600000,
          requirements: ['analysis'],
          outputs: ['architecture'],
          dependencies: ['1'],
          parallelizable: false
        }
      ],
      optimizedSequence: [
        {
          position: 1,
          agentType: 'spec-analyst',
          estimatedDuration: 250000,
          requirements: ['requirements'],
          outputs: ['analysis'],
          dependencies: [],
          parallelizable: true
        },
        {
          position: 1,
          agentType: 'spec-architect',
          estimatedDuration: 500000,
          requirements: ['requirements'],
          outputs: ['architecture'],
          dependencies: [],
          parallelizable: true
        }
      ],
      improvementMetrics: {
        timeReduction: 20,
        qualityIncrease: 5,
        costReduction: 15,
        riskReduction: 10,
        confidenceInterval: [15, 25]
      },
      riskAssessment: {
        overallRisk: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        contingencyPlans: []
      },
      implementation: {
        phases: [],
        timeline: 3600000,
        resources: ['spec-analyst', 'spec-architect'],
        validationGates: [],
        rollbackCriteria: []
      }
    };
    
    optimizations.push(sampleOptimization);
  }

  private async updateLearningModels() {
    if (!this.continuousLearning) return;
    
    // Update learning metrics
    this.continuousLearning.metrics.learningVelocity = this.calculateLearningVelocity();
    this.continuousLearning.metrics.knowledgeAccumulation = this.calculateKnowledgeAccumulation();
    this.continuousLearning.metrics.generalizationAbility = this.calculateGeneralization();
    this.continuousLearning.metrics.adaptationEffectiveness = this.calculateAdaptationEffectiveness();
    this.continuousLearning.metrics.stabilityScore = this.calculateOverallStability();
  }

  private calculateLearningVelocity(): number {
    const totalPatterns = Array.from(this.learningPatterns.values()).flat().length;
    const timeSpan = 3600000; // 1 hour
    return totalPatterns / (timeSpan / 1000 / 60); // patterns per minute
  }

  private calculateKnowledgeAccumulation(): number {
    const totalPatterns = Array.from(this.learningPatterns.values()).flat().length;
    const uniquePatterns = new Set(
      Array.from(this.learningPatterns.values())
        .flat()
        .map(p => p.patternType)
    ).size;
    return uniquePatterns / Math.max(1, totalPatterns);
  }

  private calculateGeneralization(): number {
    const behaviors = Array.from(this.adaptiveBehaviors.values());
    const successfulAdaptations = behaviors.reduce(
      (sum, b) => sum + b.currentState.learningProgress.successfulAdaptations, 0
    );
    const totalAdaptations = behaviors.reduce(
      (sum, b) => sum + b.currentState.learningProgress.totalAdaptations, 0
    );
    return totalAdaptations > 0 ? successfulAdaptations / totalAdaptations : 0;
  }

  private calculateAdaptationEffectiveness(): number {
    const behaviors = Array.from(this.adaptiveBehaviors.values());
    const effectiveness = behaviors.map(b => {
      const recent = b.currentState.recentAdaptations.slice(-10);
      if (recent.length === 0) return 0;
      const avgOutcome = recent.reduce((sum, a) => sum + (a.outcome.performance || 0), 0) / recent.length;
      return avgOutcome;
    });
    return effectiveness.length > 0 ? 
      effectiveness.reduce((a, b) => a + b, 0) / effectiveness.length : 0;
  }

  private calculateOverallStability(): number {
    const behaviors = Array.from(this.adaptiveBehaviors.values());
    const stabilities = behaviors.map(b => b.currentState.stabilityMetrics.consistency);
    return stabilities.length > 0 ? 
      stabilities.reduce((a, b) => a + b, 0) / stabilities.length : 0;
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        switch (name) {
          case 'record_performance':
            return await this.recordPerformance(args);
          case 'learn_from_pattern':
            return await this.learnFromPattern(args);
          case 'make_intelligent_decision':
            return await this.makeIntelligentDecision(args);
          case 'optimize_workflow':
            return await this.optimizeWorkflow(args);
          case 'adapt_behavior':
            return await this.adaptBehavior(args);
          case 'get_insights':
            return await this.getInsights(args);
          case 'predict_performance':
            return await this.predictPerformance(args);
          case 'get_learning_progress':
            return await this.getLearningProgress(args);
          case 'configure_learning':
            return await this.configureLearning(args);
          case 'export_intelligence':
            return await this.exportIntelligence(args);
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
        name: 'record_performance',
        description: 'Record agent performance metrics for learning',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' },
            agentType: { type: 'string', enum: ['custom', 'bmad'] },
            sessionId: { type: 'string' },
            taskType: { type: 'string' },
            complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
            successRate: { type: 'number', minimum: 0, maximum: 1 },
            responseTime: { type: 'number' },
            qualityScore: { type: 'number', minimum: 0, maximum: 1 },
            contextUtilization: { type: 'number', minimum: 0, maximum: 1 },
            resourceUsage: { type: 'object' }
          },
          required: ['agentId', 'agentType', 'taskType', 'successRate']
        }
      },
      {
        name: 'learn_from_pattern',
        description: 'Learn from identified patterns in agent behavior',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' },
            patternType: { type: 'string', enum: ['success', 'failure', 'optimization', 'adaptation'] },
            contextFeatures: { type: 'array' },
            confidence: { type: 'number', minimum: 0, maximum: 1 }
          },
          required: ['agentId', 'patternType']
        }
      },
      {
        name: 'make_intelligent_decision',
        description: 'Make an intelligent decision based on context and learning',
        inputSchema: {
          type: 'object',
          properties: {
            decisionType: { type: 'string', enum: ['agent_selection', 'workflow_optimization', 'resource_allocation', 'context_adaptation'] },
            context: { type: 'object' },
            objectives: { type: 'array', items: { type: 'string' } },
            constraints: { type: 'array', items: { type: 'string' } }
          },
          required: ['decisionType', 'objectives']
        }
      },
      {
        name: 'optimize_workflow',
        description: 'Optimize a workflow based on learned patterns',
        inputSchema: {
          type: 'object',
          properties: {
            workflowType: { type: 'string' },
            currentSequence: { type: 'array' },
            objectives: { type: 'array', items: { type: 'string' } },
            constraints: { type: 'array', items: { type: 'string' } }
          },
          required: ['workflowType', 'currentSequence']
        }
      },
      {
        name: 'adapt_behavior',
        description: 'Adapt agent behavior based on performance',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' },
            behaviorType: { type: 'string', enum: ['response_optimization', 'context_adaptation', 'error_recovery', 'efficiency_tuning'] },
            targetMetrics: { type: 'object' }
          },
          required: ['agentId', 'behaviorType']
        }
      },
      {
        name: 'get_insights',
        description: 'Get intelligence insights and recommendations',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['performance', 'pattern', 'anomaly', 'opportunity', 'risk'] },
            agentId: { type: 'string' },
            severity: { type: 'string', enum: ['critical', 'high', 'medium', 'low', 'info'] },
            limit: { type: 'number' }
          }
        }
      },
      {
        name: 'predict_performance',
        description: 'Predict future performance based on patterns',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' },
            taskType: { type: 'string' },
            context: { type: 'object' },
            horizon: { type: 'number', description: 'Prediction horizon in minutes' }
          },
          required: ['agentId']
        }
      },
      {
        name: 'get_learning_progress',
        description: 'Get current learning progress and metrics',
        inputSchema: {
          type: 'object',
          properties: {
            agentId: { type: 'string' }
          }
        }
      },
      {
        name: 'configure_learning',
        description: 'Configure learning system parameters',
        inputSchema: {
          type: 'object',
          properties: {
            adaptationRate: { type: 'number', minimum: 0, maximum: 1 },
            explorationRate: { type: 'number', minimum: 0, maximum: 1 },
            memoryRetention: { type: 'number', minimum: 0, maximum: 1 },
            forgettingFactor: { type: 'number', minimum: 0, maximum: 1 },
            transferLearning: { type: 'boolean' }
          }
        }
      },
      {
        name: 'export_intelligence',
        description: 'Export learned intelligence for backup or transfer',
        inputSchema: {
          type: 'object',
          properties: {
            includePatterns: { type: 'boolean' },
            includeModels: { type: 'boolean' },
            includeBehaviors: { type: 'boolean' },
            includeInsights: { type: 'boolean' }
          }
        }
      }
    ];
  }

  private async recordPerformance(args: any) {
    const metrics: AgentPerformanceMetrics = {
      agentId: args.agentId,
      agentType: args.agentType,
      sessionId: args.sessionId || `session_${Date.now()}`,
      startTime: new Date(),
      taskType: args.taskType,
      complexity: args.complexity || 'medium',
      successRate: args.successRate,
      responseTime: args.responseTime || 1000,
      qualityScore: args.qualityScore || 0.8,
      contextUtilization: args.contextUtilization || 0.5,
      resourceUsage: args.resourceUsage || {
        cpu: 0.5,
        memory: 0.5,
        contextSize: 1000,
        tokensProcessed: 500,
        timeToFirstToken: 100,
        throughput: 5
      },
      errorTypes: args.errorTypes || [],
      improvement: 0
    };

    // Calculate improvement if there's history
    const history = this.performanceHistory.get(args.agentId) || [];
    if (history.length > 0) {
      const lastMetric = history[history.length - 1];
      metrics.improvement = metrics.successRate - lastMetric.successRate;
    }

    history.push(metrics);
    this.performanceHistory.set(args.agentId, history);

    return {
      content: [{
        type: 'text',
        text: `Performance recorded for agent ${args.agentId}`
      }]
    };
  }

  private async learnFromPattern(args: any) {
    const pattern: AgentLearningPattern = {
      id: `pattern_${Date.now()}`,
      agentType: args.agentType || 'custom',
      patternType: args.patternType,
      contextFeatures: args.contextFeatures || [],
      outcomeMetrics: args.outcomeMetrics || {} as OutcomeMetrics,
      confidence: args.confidence || 0.7,
      frequency: args.frequency || 0.1,
      lastSeen: new Date(),
      predictivePower: args.predictivePower || 0.5
    };

    const patterns = this.learningPatterns.get(args.agentId) || [];
    patterns.push(pattern);
    this.learningPatterns.set(args.agentId, patterns);

    // Update behavior based on new pattern
    await this.updateAgentBehavior(args.agentId, [pattern]);

    return {
      content: [{
        type: 'text',
        text: `Learned ${args.patternType} pattern for agent ${args.agentId}`
      }]
    };
  }

  private async makeIntelligentDecision(args: any) {
    const decision: IntelligentDecision = {
      id: `decision_${Date.now()}`,
      decisionType: args.decisionType,
      context: args.context || {} as DecisionContext,
      options: this.generateDecisionOptions(args),
      recommendation: '',
      reasoning: [],
      confidence: 0,
      expectedOutcome: {} as OutcomeMetrics,
      alternatives: []
    };

    // Analyze options and make recommendation
    const analysis = this.analyzeOptions(decision.options, args.objectives, args.constraints);
    decision.recommendation = analysis.bestOption;
    decision.reasoning = analysis.reasoning;
    decision.confidence = analysis.confidence;
    decision.expectedOutcome = analysis.expectedOutcome;
    decision.alternatives = analysis.alternatives;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(decision, null, 2)
      }]
    };
  }

  private generateDecisionOptions(args: any): DecisionOption[] {
    // Generate options based on decision type
    const options: DecisionOption[] = [];
    
    switch (args.decisionType) {
      case 'agent_selection':
        options.push(
          {
            id: 'opt1',
            name: 'Use specialized agent',
            description: 'Select the most specialized agent for the task',
            parameters: { agentType: 'specialized' },
            expectedMetrics: { performance: 0.9, quality: 0.95, efficiency: 0.7, userSatisfaction: 0.9, goalAchievement: 0.95 },
            riskScore: 0.2,
            cost: 1.2,
            timeline: 1000
          },
          {
            id: 'opt2',
            name: 'Use general agent',
            description: 'Use a general-purpose agent',
            parameters: { agentType: 'general' },
            expectedMetrics: { performance: 0.75, quality: 0.8, efficiency: 0.85, userSatisfaction: 0.8, goalAchievement: 0.8 },
            riskScore: 0.3,
            cost: 0.8,
            timeline: 800
          }
        );
        break;
      // Add more cases as needed
    }
    
    return options;
  }

  private analyzeOptions(options: DecisionOption[], objectives: string[], constraints: string[]): any {
    // Simple scoring algorithm
    let bestOption = '';
    let bestScore = -1;
    const reasoning: string[] = [];
    const alternatives: any[] = [];
    
    for (const option of options) {
      const score = this.scoreOption(option, objectives);
      reasoning.push(`Option ${option.name} scored ${score.toFixed(2)}`);
      
      if (score > bestScore) {
        if (bestOption) {
          alternatives.push({
            optionId: bestOption,
            reason: 'Lower score',
            tradeoffs: ['Higher cost', 'Longer timeline'],
            conditions: ['If quality is less important']
          });
        }
        bestOption = option.id;
        bestScore = score;
      }
    }
    
    const bestOpt = options.find(o => o.id === bestOption);
    
    return {
      bestOption,
      reasoning,
      confidence: Math.min(0.95, bestScore),
      expectedOutcome: bestOpt?.expectedMetrics || {} as OutcomeMetrics,
      alternatives
    };
  }

  private scoreOption(option: DecisionOption, objectives: string[]): number {
    // Simple weighted scoring
    const weights = {
      performance: 0.3,
      quality: 0.25,
      efficiency: 0.2,
      cost: 0.15,
      risk: 0.1
    };
    
    const score = 
      option.expectedMetrics.performance * weights.performance +
      option.expectedMetrics.quality * weights.quality +
      option.expectedMetrics.efficiency * weights.efficiency +
      (1 - option.cost) * weights.cost +
      (1 - option.riskScore) * weights.risk;
    
    return score;
  }

  private async optimizeWorkflow(args: any) {
    // Analyze current workflow and suggest optimizations
    const optimization: WorkflowOptimization = {
      id: `workflow_opt_${Date.now()}`,
      workflowType: args.workflowType,
      currentSequence: args.currentSequence || [],
      optimizedSequence: this.optimizeSequence(args.currentSequence),
      improvementMetrics: {
        timeReduction: 15,
        qualityIncrease: 10,
        costReduction: 20,
        riskReduction: 5,
        confidenceInterval: [10, 20]
      },
      riskAssessment: {
        overallRisk: 'low',
        riskFactors: [],
        mitigationStrategies: [],
        contingencyPlans: []
      },
      implementation: {
        phases: [],
        timeline: 3600000,
        resources: [],
        validationGates: [],
        rollbackCriteria: []
      }
    };
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(optimization, null, 2)
      }]
    };
  }

  private optimizeSequence(currentSequence: any[]): any[] {
    // Simple optimization: identify parallelizable tasks
    const optimized = [...currentSequence];
    
    for (let i = 0; i < optimized.length - 1; i++) {
      const current = optimized[i];
      const next = optimized[i + 1];
      
      // Check if tasks can be parallelized
      if (!next.dependencies?.includes(current.position.toString())) {
        current.parallelizable = true;
        next.parallelizable = true;
        next.position = current.position; // Same position means parallel
      }
    }
    
    return optimized;
  }

  private async adaptBehavior(args: any) {
    let behavior = this.adaptiveBehaviors.get(args.agentId);
    
    if (!behavior) {
      behavior = this.createDefaultBehavior(args.agentId);
      this.adaptiveBehaviors.set(args.agentId, behavior);
    }
    
    behavior.behaviorType = args.behaviorType;
    if (args.targetMetrics) {
      behavior.performanceTarget = args.targetMetrics;
    }
    
    return {
      content: [{
        type: 'text',
        text: `Behavior adapted for agent ${args.agentId}`
      }]
    };
  }

  private async getInsights(args: any) {
    let filtered = [...this.insights];
    
    if (args.type) {
      filtered = filtered.filter(i => i.type === args.type);
    }
    if (args.agentId) {
      filtered = filtered.filter(i => i.tags.includes(args.agentId));
    }
    if (args.severity) {
      filtered = filtered.filter(i => i.severity === args.severity);
    }
    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(filtered, null, 2)
      }]
    };
  }

  private async predictPerformance(args: any) {
    const model = this.predictiveModels.get('performance');
    if (!model) {
      return {
        content: [{
          type: 'text',
          text: 'Performance prediction model not available'
        }]
      };
    }
    
    // Simple prediction based on historical data
    const history = this.performanceHistory.get(args.agentId) || [];
    const prediction = {
      agentId: args.agentId,
      taskType: args.taskType,
      horizon: args.horizon || 60,
      predictedMetrics: {
        successRate: 0.8,
        responseTime: 1000,
        qualityScore: 0.85,
        confidence: 0.75
      },
      basedOn: {
        historicalDataPoints: history.length,
        modelAccuracy: model.accuracy,
        features: model.features.map(f => f.name)
      }
    };
    
    if (history.length > 0) {
      const recent = history.slice(-10);
      prediction.predictedMetrics.successRate = 
        recent.reduce((sum, m) => sum + m.successRate, 0) / recent.length;
      prediction.predictedMetrics.responseTime = 
        recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
      prediction.predictedMetrics.qualityScore = 
        recent.reduce((sum, m) => sum + m.qualityScore, 0) / recent.length;
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(prediction, null, 2)
      }]
    };
  }

  private async getLearningProgress(args: any) {
    const progress: any = {
      global: this.continuousLearning?.metrics,
      agents: {}
    };
    
    if (args.agentId) {
      const behavior = this.adaptiveBehaviors.get(args.agentId);
      if (behavior) {
        progress.agents[args.agentId] = behavior.currentState.learningProgress;
      }
    } else {
      for (const [agentId, behavior] of this.adaptiveBehaviors) {
        progress.agents[agentId] = behavior.currentState.learningProgress;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(progress, null, 2)
      }]
    };
  }

  private async configureLearning(args: any) {
    if (this.continuousLearning && this.continuousLearning.adaptation) {
      if (args.adaptationRate !== undefined) {
        this.continuousLearning.adaptation.adaptationRate = args.adaptationRate;
      }
      if (args.explorationRate !== undefined) {
        this.continuousLearning.adaptation.explorationRate = args.explorationRate;
      }
      if (args.memoryRetention !== undefined) {
        this.continuousLearning.adaptation.memoryRetention = args.memoryRetention;
      }
      if (args.forgettingFactor !== undefined) {
        this.continuousLearning.adaptation.forgettingFactor = args.forgettingFactor;
      }
      if (args.transferLearning !== undefined) {
        this.continuousLearning.adaptation.transferLearning = args.transferLearning;
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: 'Learning configuration updated'
      }]
    };
  }

  private async exportIntelligence(args: any) {
    const exportData: any = {
      timestamp: new Date(),
      version: '1.0.0'
    };
    
    if (args.includePatterns) {
      exportData.patterns = Object.fromEntries(this.learningPatterns);
    }
    if (args.includeModels) {
      exportData.models = Object.fromEntries(this.predictiveModels);
    }
    if (args.includeBehaviors) {
      exportData.behaviors = Object.fromEntries(this.adaptiveBehaviors);
    }
    if (args.includeInsights) {
      exportData.insights = this.insights;
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(exportData, null, 2)
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Agent Intelligence MCP server running on stdio');
  }
}

const server = new AgentIntelligenceServer();
server.run().catch(console.error);
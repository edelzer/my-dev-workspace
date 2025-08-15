/**
 * Development Workflow Analytics MCP Server Types
 * Phase 5.6: Advanced Analytics & Intelligence
 */

export interface WorkflowMetrics {
  id: string;
  timestamp: number;
  agentId: string;
  agentType: 'custom' | 'bmad';
  taskId?: string;
  operation: string;
  duration: number;
  success: boolean;
  errorType?: string;
  memoryUsage: number;
  cpuUsage: number;
  contextSize: number;
  outputQuality: number; // 0-1 scale
  metadata: Record<string, any>;
}

export interface AgentPerformance {
  agentId: string;
  agentType: 'custom' | 'bmad';
  totalTasks: number;
  successRate: number;
  averageDuration: number;
  averageQuality: number;
  totalUptime: number;
  lastActivity: number;
  capabilities: string[];
  currentLoad: number;
  trendDirection: 'improving' | 'declining' | 'stable';
  efficiency: number; // 0-100 scale
}

export interface WorkflowBottleneck {
  id: string;
  type: 'agent' | 'system' | 'integration' | 'resource';
  severity: 'critical' | 'high' | 'medium' | 'low';
  agentId?: string;
  description: string;
  impactMetrics: {
    delayTime: number;
    affectedTasks: number;
    qualityImpact: number;
    resourceWaste: number;
  };
  detectedAt: number;
  resolvedAt?: number;
  confidence: number; // 0-1 scale
  recommendations: OptimizationRecommendation[];
}

export interface OptimizationRecommendation {
  id: string;
  type: 'performance' | 'resource' | 'workflow' | 'architecture';
  priority: 'immediate' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: {
    performanceGain: number; // percentage
    resourceSaving: number; // percentage
    timeReduction: number; // minutes/day
    qualityImprovement: number; // percentage
  };
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    estimatedTime: number; // hours
    requirements: string[];
    risks: string[];
  };
  createdAt: number;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export interface ProductivityTrend {
  period: string; // '1h', '1d', '1w', '1m'
  startTime: number;
  endTime: number;
  metrics: {
    totalTasks: number;
    completionRate: number;
    averageQuality: number;
    averageDuration: number;
    errorRate: number;
    resourceUtilization: number;
  };
  predictions: {
    nextPeriodEstimate: number;
    trendDirection: 'up' | 'down' | 'stable';
    confidence: number;
    factors: string[];
  };
}

export interface SystemHealth {
  timestamp: number;
  overallScore: number; // 0-100
  agents: {
    active: number;
    total: number;
    healthyCount: number;
    performingWellCount: number;
  };
  performance: {
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    resourceUtilization: number;
  };
  bottlenecks: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: {
    immediate: number;
    high: number;
    total: number;
  };
}

export interface AnalyticsConfig {
  monitoringEnabled: boolean;
  dataRetentionDays: number;
  alertThresholds: {
    errorRatePercent: number;
    responseTimeMs: number;
    resourceUtilizationPercent: number;
    qualityScoreMin: number;
  };
  bottleneckDetection: {
    enabled: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high';
    minConfidenceThreshold: number;
  };
  predictiveAnalytics: {
    enabled: boolean;
    forecastPeriods: number;
    minDataPointsRequired: number;
  };
}

export interface WorkflowSession {
  id: string;
  startTime: number;
  endTime?: number;
  primaryAgent: string;
  collaboratingAgents: string[];
  tasks: string[];
  totalOperations: number;
  successfulOperations: number;
  averageQuality: number;
  totalDuration: number;
  bottlenecksEncountered: string[];
  optimizationsApplied: string[];
  outcome: 'success' | 'partial' | 'failure';
  lessons: string[];
}

export interface PerformanceReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: number;
  period: {
    start: number;
    end: number;
  };
  summary: {
    totalSessions: number;
    totalTasks: number;
    overallSuccessRate: number;
    averageSessionDuration: number;
    topPerformingAgents: string[];
    majorBottlenecks: string[];
    keyRecommendations: string[];
  };
  trends: ProductivityTrend[];
  agentPerformance: AgentPerformance[];
  bottleneckAnalysis: WorkflowBottleneck[];
  recommendations: OptimizationRecommendation[];
  systemHealth: SystemHealth;
  insights: string[];
  actionItems: string[];
}

export interface MLModel {
  id: string;
  type: 'bottleneck_detection' | 'performance_prediction' | 'quality_estimation' | 'resource_optimization';
  version: string;
  accuracy: number;
  lastTrained: number;
  trainingDataSize: number;
  features: string[];
  hyperparameters: Record<string, any>;
  validationMetrics: Record<string, number>;
}

export interface AnalyticsEvent {
  id: string;
  type: 'metric' | 'bottleneck' | 'recommendation' | 'alert' | 'optimization';
  timestamp: number;
  source: string;
  data: Record<string, any>;
  processed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}
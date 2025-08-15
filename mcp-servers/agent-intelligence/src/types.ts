// Core Intelligence Enhancement Types

export interface AgentPerformanceMetrics {
  agentId: string;
  agentType: 'custom' | 'bmad';
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  taskType: string;
  complexity: 'low' | 'medium' | 'high';
  successRate: number;
  responseTime: number;
  qualityScore: number;
  contextUtilization: number;
  resourceUsage: ResourceUsage;
  errorTypes: string[];
  improvement: number; // -1 to 1 scale
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  contextSize: number;
  tokensProcessed: number;
  timeToFirstToken: number;
  throughput: number;
}

export interface AgentLearningPattern {
  id: string;
  agentType: string;
  patternType: 'success' | 'failure' | 'optimization' | 'adaptation';
  contextFeatures: ContextFeature[];
  outcomeMetrics: OutcomeMetrics;
  confidence: number;
  frequency: number;
  lastSeen: Date;
  predictivePower: number;
}

export interface ContextFeature {
  name: string;
  value: any;
  importance: number;
  correlation: number;
  stability: number;
}

export interface OutcomeMetrics {
  performance: number;
  quality: number;
  efficiency: number;
  userSatisfaction: number;
  goalAchievement: number;
}

export interface IntelligentDecision {
  id: string;
  decisionType: 'agent_selection' | 'workflow_optimization' | 'resource_allocation' | 'context_adaptation';
  context: DecisionContext;
  options: DecisionOption[];
  recommendation: string;
  reasoning: string[];
  confidence: number;
  expectedOutcome: OutcomeMetrics;
  alternatives: Alternative[];
}

export interface DecisionContext {
  currentState: any;
  objectives: string[];
  constraints: string[];
  historicalData: HistoricalDataPoint[];
  environmentalFactors: EnvironmentalFactor[];
}

export interface DecisionOption {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  expectedMetrics: OutcomeMetrics;
  riskScore: number;
  cost: number;
  timeline: number;
}

export interface Alternative {
  optionId: string;
  reason: string;
  tradeoffs: string[];
  conditions: string[];
}

export interface HistoricalDataPoint {
  timestamp: Date;
  context: any;
  decision: any;
  outcome: OutcomeMetrics;
  lessons: string[];
}

export interface EnvironmentalFactor {
  name: string;
  value: any;
  impact: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  volatility: number;
}

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'performance' | 'resource' | 'workflow' | 'context' | 'outcome';
  targetVariable: string;
  features: ModelFeature[];
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingData: number; // number of data points
  lastTrained: Date;
  version: string;
}

export interface ModelFeature {
  name: string;
  importance: number;
  correlation: number;
  dataType: 'numeric' | 'categorical' | 'boolean' | 'text';
  preprocessing: string[];
}

export interface WorkflowOptimization {
  id: string;
  workflowType: string;
  currentSequence: AgentSequenceStep[];
  optimizedSequence: AgentSequenceStep[];
  improvementMetrics: ImprovementMetrics;
  riskAssessment: RiskAssessment;
  implementation: ImplementationPlan;
}

export interface AgentSequenceStep {
  position: number;
  agentType: string;
  agentId?: string;
  estimatedDuration: number;
  requirements: string[];
  outputs: string[];
  dependencies: string[];
  parallelizable: boolean;
}

export interface ImprovementMetrics {
  timeReduction: number;
  qualityIncrease: number;
  costReduction: number;
  riskReduction: number;
  confidenceInterval: [number, number];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  riskFactors: RiskFactor[];
  mitigationStrategies: MitigationStrategy[];
  contingencyPlans: ContingencyPlan[];
}

export interface RiskFactor {
  name: string;
  probability: number;
  impact: number;
  riskScore: number;
  category: string;
}

export interface MitigationStrategy {
  riskFactorId: string;
  strategy: string;
  effectiveness: number;
  cost: number;
  timeframe: number;
}

export interface ContingencyPlan {
  trigger: string;
  actions: string[];
  fallbackAgent: string;
  rollbackProcedure: string[];
}

export interface ImplementationPlan {
  phases: ImplementationPhase[];
  timeline: number;
  resources: string[];
  validationGates: ValidationGate[];
  rollbackCriteria: string[];
}

export interface ImplementationPhase {
  name: string;
  order: number;
  actions: string[];
  duration: number;
  dependencies: string[];
  success_criteria: string[];
}

export interface ValidationGate {
  phase: string;
  criteria: string[];
  metrics: string[];
  threshold: number;
  action_on_failure: string;
}

export interface IntelligenceInsight {
  id: string;
  type: 'performance' | 'pattern' | 'anomaly' | 'opportunity' | 'risk';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  confidence: number;
  evidence: Evidence[];
  recommendations: Recommendation[];
  impact: ImpactAssessment;
  timeframe: string;
  tags: string[];
}

export interface Evidence {
  type: 'metric' | 'pattern' | 'correlation' | 'historical' | 'external';
  description: string;
  data: any;
  reliability: number;
  source: string;
}

export interface Recommendation {
  action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  effort: 'minimal' | 'moderate' | 'significant' | 'major';
  impact: 'critical' | 'high' | 'medium' | 'low';
  timeline: string;
  prerequisites: string[];
  risks: string[];
}

export interface ImpactAssessment {
  performance: number;
  efficiency: number;
  quality: number;
  cost: number;
  time: number;
  reliability: number;
  userExperience: number;
}

export interface AdaptiveBehavior {
  agentId: string;
  behaviorType: 'response_optimization' | 'context_adaptation' | 'error_recovery' | 'efficiency_tuning';
  triggerConditions: TriggerCondition[];
  adaptationRules: AdaptationRule[];
  learningRate: number;
  stabilityThreshold: number;
  performanceTarget: OutcomeMetrics;
  currentState: BehaviorState;
}

export interface TriggerCondition {
  metric: string;
  operator: '<' | '>' | '==' | '!=' | 'contains' | 'matches';
  value: any;
  weight: number;
  timeWindow: number;
}

export interface AdaptationRule {
  id: string;
  condition: string;
  action: AdaptationAction;
  priority: number;
  cooldown: number;
  maxApplications: number;
  successRate: number;
}

export interface AdaptationAction {
  type: 'parameter_adjustment' | 'strategy_change' | 'resource_reallocation' | 'context_modification';
  parameters: Record<string, any>;
  reversible: boolean;
  testMode: boolean;
  validationRequired: boolean;
}

export interface BehaviorState {
  currentParameters: Record<string, any>;
  recentAdaptations: RecentAdaptation[];
  performanceHistory: PerformanceDataPoint[];
  stabilityMetrics: StabilityMetrics;
  learningProgress: LearningProgress;
}

export interface RecentAdaptation {
  timestamp: Date;
  ruleId: string;
  action: AdaptationAction;
  outcome: OutcomeMetrics;
  reverted: boolean;
}

export interface PerformanceDataPoint {
  timestamp: Date;
  metrics: OutcomeMetrics;
  context: any;
  adaptationsActive: string[];
}

export interface StabilityMetrics {
  variance: number;
  trend: 'improving' | 'stable' | 'declining';
  consistency: number;
  volatility: number;
}

export interface LearningProgress {
  totalAdaptations: number;
  successfulAdaptations: number;
  learningVelocity: number;
  plateauDetected: boolean;
  explorationRate: number;
}

export interface ContinuousLearning {
  id: string;
  learningType: 'supervised' | 'unsupervised' | 'reinforcement' | 'online';
  targetDomain: string;
  dataStreams: DataStream[];
  models: LearningModel[];
  feedback: FeedbackLoop[];
  adaptation: LearningAdaptation;
  metrics: LearningMetrics;
}

export interface DataStream {
  id: string;
  name: string;
  source: string;
  dataType: string;
  updateFrequency: number;
  qualityScore: number;
  latency: number;
  volume: number;
}

export interface LearningModel {
  id: string;
  algorithm: string;
  hyperparameters: Record<string, any>;
  trainingSchedule: TrainingSchedule;
  validation: ValidationConfig;
  deployment: DeploymentConfig;
  performance: ModelPerformance;
}

export interface TrainingSchedule {
  frequency: 'continuous' | 'hourly' | 'daily' | 'weekly' | 'triggered';
  batchSize: number;
  epochs: number;
  learningRate: number;
  patience: number;
}

export interface ValidationConfig {
  method: 'holdout' | 'cross_validation' | 'time_series' | 'rolling_window';
  testSize: number;
  metrics: string[];
  thresholds: Record<string, number>;
}

export interface DeploymentConfig {
  strategy: 'blue_green' | 'canary' | 'shadow' | 'immediate';
  rolloutPercentage: number;
  monitoringPeriod: number;
  rollbackTriggers: string[];
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  mse: number;
  mae: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface FeedbackLoop {
  id: string;
  type: 'human' | 'automated' | 'hybrid';
  source: string;
  frequency: number;
  quality: number;
  latency: number;
  impact: number;
}

export interface LearningAdaptation {
  adaptationRate: number;
  explorationRate: number;
  memoryRetention: number;
  forgettingFactor: number;
  transferLearning: boolean;
}

export interface LearningMetrics {
  learningVelocity: number;
  knowledgeAccumulation: number;
  generalizationAbility: number;
  adaptationEffectiveness: number;
  stabilityScore: number;
}
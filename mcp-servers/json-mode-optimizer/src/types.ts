/**
 * JSON Mode Optimizer Types
 * Comprehensive type definitions for structured AI output optimization
 */

export interface JsonSchema {
  $schema?: string;
  type: string;
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: any[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  additionalProperties?: boolean | JsonSchema;
}

export interface JsonModeConfig {
  id: string;
  name: string;
  description: string;
  schema: JsonSchema;
  strict: boolean;
  optimizationLevel: 'basic' | 'standard' | 'advanced' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  successRate: number;
}

export interface JsonOptimizationResult {
  configId: string;
  success: boolean;
  output?: any;
  errors: ValidationError[];
  optimizations: OptimizationSuggestion[];
  performance: PerformanceMetrics;
}

export interface ValidationError {
  path: string;
  message: string;
  schemaPath: string;
  keyword: string;
  params?: Record<string, any>;
  severity: 'error' | 'warning' | 'info';
}

export interface OptimizationSuggestion {
  type: 'schema' | 'structure' | 'performance' | 'accuracy';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  estimatedImprovement: number;
}

export interface PerformanceMetrics {
  responseTime: number;
  validationTime: number;
  outputSize: number;
  compressionRatio?: number;
  accuracyScore: number;
  consistencyScore: number;
}

export interface JsonWorkflowIntegration {
  id: string;
  name: string;
  configIds: string[];
  executionOrder: string[];
  fallbackStrategy: 'retry' | 'downgrade' | 'fail';
  maxRetries: number;
  timeoutMs: number;
  successThreshold: number;
}

export interface SchemaEvolution {
  configId: string;
  version: number;
  changes: SchemaChange[];
  migrationScript?: string;
  backwardCompatible: boolean;
  timestamp: Date;
}

export interface SchemaChange {
  operation: 'add' | 'remove' | 'modify' | 'rename';
  path: string;
  oldValue?: any;
  newValue?: any;
  reason: string;
}

export interface AIOutputConsistency {
  configId: string;
  samples: number;
  consistencyRate: number;
  commonVariations: string[];
  stabilityScore: number;
  recommendedAdjustments: OptimizationSuggestion[];
}

export interface JsonModeAnalytics {
  totalConfigurations: number;
  totalExecutions: number;
  averageSuccessRate: number;
  topPerformingConfigs: string[];
  commonFailurePatterns: string[];
  optimizationImpact: Record<string, number>;
  trendsOverTime: TimeseriesData[];
}

export interface TimeseriesData {
  timestamp: Date;
  value: number;
  metric: string;
  configId?: string;
}

export interface JsonRecoveryStrategy {
  id: string;
  name: string;
  triggers: ErrorPattern[];
  actions: RecoveryAction[];
  priority: number;
  successRate: number;
}

export interface ErrorPattern {
  type: 'validation' | 'parsing' | 'timeout' | 'format';
  pattern: string | RegExp;
  threshold?: number;
  context?: string[];
}

export interface RecoveryAction {
  type: 'retry' | 'schema_relax' | 'format_fix' | 'fallback' | 'manual';
  parameters: Record<string, any>;
  timeoutMs?: number;
  maxAttempts?: number;
}

export interface JsonAttempt {
  number: number;
  timestamp: Date;
  inputData: any;
  result?: any;
  errors: ValidationError[];
  success: boolean;
}

export interface JsonModeSession {
  id: string;
  configId: string;
  startTime: Date;
  endTime?: Date;
  attempts: JsonAttempt[];
  finalResult?: JsonOptimizationResult;
  status: 'active' | 'completed' | 'failed' | 'timeout';
}
/**
 * XML Tag Structuring Types
 * Comprehensive type definitions for XML-based prompt engineering
 */

export interface XmlTemplate {
  id: string;
  name: string;
  description: string;
  category: 'reasoning' | 'analysis' | 'generation' | 'conversation' | 'workflow' | 'custom';
  structure: XmlStructure;
  variables: XmlVariable[];
  constraints: XmlConstraint[];
  optimizationLevel: 'basic' | 'standard' | 'advanced' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  effectivenessScore: number;
}

export interface XmlStructure {
  rootElement: string;
  namespace?: string;
  schema?: string;
  elements: XmlElement[];
  attributes: XmlAttribute[];
  rules: StructureRule[];
}

export interface XmlElement {
  name: string;
  description: string;
  type: 'container' | 'content' | 'instruction' | 'data' | 'control';
  required: boolean;
  repeatable: boolean;
  children?: string[];
  parent?: string;
  content?: ContentType;
  validation?: ValidationRule[];
}

export interface XmlAttribute {
  name: string;
  element: string;
  type: 'string' | 'number' | 'boolean' | 'enum' | 'date';
  required: boolean;
  defaultValue?: any;
  enumValues?: string[];
  pattern?: string;
  description: string;
}

export interface XmlVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'list' | 'object';
  required: boolean;
  defaultValue?: any;
  description: string;
  validation?: ValidationRule[];
  placeholder?: string;
}

export interface XmlConstraint {
  type: 'structure' | 'content' | 'semantic' | 'performance';
  rule: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  enforcement: 'strict' | 'moderate' | 'advisory';
}

export interface StructureRule {
  type: 'order' | 'nesting' | 'occurrence' | 'dependency';
  description: string;
  condition: string;
  action: 'require' | 'forbid' | 'suggest' | 'warn';
}

export interface ContentType {
  format: 'text' | 'markdown' | 'code' | 'json' | 'mixed';
  maxLength?: number;
  minLength?: number;
  encoding?: string;
  lineBreaks?: 'preserve' | 'normalize' | 'remove';
}

export interface ValidationRule {
  type: 'pattern' | 'length' | 'range' | 'format' | 'custom';
  value: any;
  message: string;
  severity: 'error' | 'warning';
}

export interface XmlPromptResult {
  templateId: string;
  success: boolean;
  generatedXml: string;
  parsedStructure?: XmlParsedStructure;
  validationErrors: XmlValidationError[];
  optimizations: XmlOptimization[];
  performance: XmlPerformanceMetrics;
  effectiveness: EffectivenessMetrics;
}

export interface XmlParsedStructure {
  rootElement: string;
  elements: ParsedElement[];
  attributes: ParsedAttribute[];
  textContent: string;
  structure: StructureInfo;
  metadata: StructureMetadata;
}

export interface ParsedElement {
  name: string;
  path: string;
  attributes: Record<string, string>;
  textContent?: string;
  children: ParsedElement[];
  parent?: string;
  depth: number;
}

export interface ParsedAttribute {
  name: string;
  value: string;
  element: string;
  elementPath: string;
}

export interface StructureInfo {
  depth: number;
  elementCount: number;
  attributeCount: number;
  textLength: number;
  complexity: number;
  balance: number;
}

export interface StructureMetadata {
  namespaces: string[];
  processingInstructions: string[];
  comments: string[];
  dtd?: string;
  encoding: string;
}

export interface XmlValidationError {
  type: 'structure' | 'content' | 'attribute' | 'constraint' | 'schema';
  element?: string;
  attribute?: string;
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
  line?: number;
  column?: number;
}

export interface XmlOptimization {
  type: 'structure' | 'content' | 'performance' | 'readability' | 'effectiveness';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  before?: string;
  after?: string;
  estimatedImprovement: number;
  effort: 'minimal' | 'moderate' | 'significant';
}

export interface XmlPerformanceMetrics {
  generationTime: number;
  parsingTime: number;
  validationTime: number;
  xmlSize: number;
  compressionRatio: number;
  complexityScore: number;
  readabilityScore: number;
}

export interface EffectivenessMetrics {
  structureClarity: number;
  semanticRichness: number;
  instructionPrecision: number;
  contextPreservation: number;
  aiComprehensibility: number;
  overallEffectiveness: number;
}

export interface XmlWorkflowPattern {
  id: string;
  name: string;
  description: string;
  type: 'sequential' | 'parallel' | 'conditional' | 'iterative' | 'recursive';
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  outputs: WorkflowOutput[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'processing' | 'decision' | 'transformation' | 'validation' | 'output';
  templateId?: string;
  action: string;
  inputs: string[];
  outputs: string[];
  conditions?: string[];
  timeout?: number;
}

export interface WorkflowTrigger {
  type: 'element' | 'attribute' | 'content' | 'condition' | 'external';
  selector: string;
  action: 'start' | 'continue' | 'branch' | 'loop' | 'terminate';
  parameters: Record<string, any>;
}

export interface WorkflowCondition {
  type: 'xpath' | 'attribute' | 'content' | 'custom';
  expression: string;
  action: 'include' | 'exclude' | 'modify' | 'validate';
  priority: number;
}

export interface WorkflowOutput {
  type: 'xml' | 'json' | 'text' | 'structured';
  format: string;
  destination: string;
  transformation?: string;
}

export interface XmlTemplateLibrary {
  id: string;
  name: string;
  description: string;
  category: string;
  templates: string[]; // Template IDs
  sharedComponents: SharedComponent[];
  compatibility: CompatibilityInfo[];
}

export interface SharedComponent {
  id: string;
  name: string;
  type: 'element' | 'attribute' | 'structure' | 'pattern';
  definition: any;
  usage: ComponentUsage[];
}

export interface ComponentUsage {
  templateId: string;
  context: string;
  frequency: number;
  effectiveness: number;
}

export interface CompatibilityInfo {
  templateId: string;
  compatibility: 'full' | 'partial' | 'none';
  conflicts: string[];
  requirements: string[];
}

export interface XmlOptimizationSession {
  id: string;
  templateId: string;
  startTime: Date;
  endTime?: Date;
  iterations: OptimizationIteration[];
  bestResult?: XmlPromptResult;
  status: 'active' | 'completed' | 'failed' | 'cancelled';
  goals: OptimizationGoal[];
}

export interface OptimizationIteration {
  number: number;
  timestamp: Date;
  changes: StructureChange[];
  result: XmlPromptResult;
  improvement: number;
  direction: 'improvement' | 'degradation' | 'neutral';
}

export interface StructureChange {
  type: 'add' | 'remove' | 'modify' | 'reorder';
  target: 'element' | 'attribute' | 'content' | 'structure';
  path: string;
  before?: any;
  after?: any;
  reason: string;
}

export interface OptimizationGoal {
  metric: string;
  target: number;
  current: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  achieved: boolean;
}

export interface XmlAnalytics {
  totalTemplates: number;
  totalUsage: number;
  averageEffectiveness: number;
  topPerformingTemplates: string[];
  commonPatterns: PatternAnalysis[];
  optimizationTrends: TrendData[];
  effectivenessFactors: FactorAnalysis[];
}

export interface PatternAnalysis {
  pattern: string;
  frequency: number;
  effectiveness: number;
  templates: string[];
  context: string;
}

export interface TrendData {
  timestamp: Date;
  metric: string;
  value: number;
  templateId?: string;
  category?: string;
}

export interface FactorAnalysis {
  factor: string;
  impact: number;
  correlation: number;
  significance: 'low' | 'medium' | 'high';
  recommendations: string[];
}
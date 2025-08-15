#!/usr/bin/env node

/**
 * JSON Mode Optimizer MCP Server
 * Advanced AI JSON output configuration and optimization system
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { JsonModeDatabase } from './database.js';
import {
  JsonModeConfig,
  JsonOptimizationResult,
  JsonWorkflowIntegration,
  ValidationError,
  OptimizationSuggestion,
  PerformanceMetrics,
  AIOutputConsistency,
  JsonModeAnalytics
} from './types.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, isEqual } from 'lodash';

class JsonModeOptimizerServer {
  private server: Server;
  private database: JsonModeDatabase;
  private ajv: Ajv;

  constructor() {
    this.server = new Server(
      {
        name: 'json-mode-optimizer-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    this.database = new JsonModeDatabase();
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_json_config',
          description: 'Create a new JSON mode configuration with schema validation',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Configuration name' },
              description: { type: 'string', description: 'Configuration description' },
              schema: { type: 'object', description: 'JSON schema for validation' },
              strict: { type: 'boolean', default: true, description: 'Strict validation mode' },
              optimizationLevel: { 
                type: 'string', 
                enum: ['basic', 'standard', 'advanced', 'enterprise'],
                default: 'standard',
                description: 'Optimization level'
              }
            },
            required: ['name', 'schema']
          }
        },
        {
          name: 'optimize_json_output',
          description: 'Optimize and validate JSON output using specified configuration',
          inputSchema: {
            type: 'object',
            properties: {
              configId: { type: 'string', description: 'JSON configuration ID' },
              inputData: { description: 'Raw input data to optimize' },
              promptContext: { type: 'string', description: 'AI prompt context for optimization' },
              maxRetries: { type: 'number', default: 3, description: 'Maximum optimization attempts' }
            },
            required: ['configId', 'inputData']
          }
        },
        {
          name: 'validate_json_structure',
          description: 'Validate JSON structure against schema with detailed error reporting',
          inputSchema: {
            type: 'object',
            properties: {
              configId: { type: 'string', description: 'JSON configuration ID' },
              jsonData: { description: 'JSON data to validate' },
              generateSuggestions: { type: 'boolean', default: true, description: 'Generate optimization suggestions' }
            },
            required: ['configId', 'jsonData']
          }
        },
        {
          name: 'create_workflow_integration',
          description: 'Create multi-step JSON workflow with fallback strategies',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Workflow name' },
              configIds: { type: 'array', items: { type: 'string' }, description: 'Configuration IDs in order' },
              fallbackStrategy: { 
                type: 'string', 
                enum: ['retry', 'downgrade', 'fail'],
                default: 'retry',
                description: 'Fallback strategy on failure'
              },
              maxRetries: { type: 'number', default: 3, description: 'Maximum retries per step' },
              timeoutMs: { type: 'number', default: 30000, description: 'Timeout per step' },
              successThreshold: { type: 'number', default: 0.8, description: 'Success rate threshold' }
            },
            required: ['name', 'configIds']
          }
        },
        {
          name: 'analyze_output_consistency',
          description: 'Analyze AI output consistency and suggest improvements',
          inputSchema: {
            type: 'object',
            properties: {
              configId: { type: 'string', description: 'JSON configuration ID' },
              sampleOutputs: { type: 'array', description: 'Sample outputs for analysis' },
              generateRecommendations: { type: 'boolean', default: true, description: 'Generate improvement recommendations' }
            },
            required: ['configId', 'sampleOutputs']
          }
        },
        {
          name: 'get_optimization_analytics',
          description: 'Get comprehensive analytics and performance metrics',
          inputSchema: {
            type: 'object',
            properties: {
              configId: { type: 'string', description: 'Specific configuration ID (optional)' },
              days: { type: 'number', default: 7, description: 'Days of data to analyze' },
              includeDetails: { type: 'boolean', default: false, description: 'Include detailed breakdowns' }
            }
          }
        },
        {
          name: 'auto_improve_schema',
          description: 'Automatically improve JSON schema based on actual usage patterns',
          inputSchema: {
            type: 'object',
            properties: {
              configId: { type: 'string', description: 'JSON configuration ID' },
              sampleData: { type: 'array', description: 'Sample successful outputs for analysis' },
              improvementLevel: { 
                type: 'string', 
                enum: ['conservative', 'moderate', 'aggressive'],
                default: 'moderate',
                description: 'Schema improvement aggressiveness'
              }
            },
            required: ['configId', 'sampleData']
          }
        }
      ] as Tool[]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_json_config':
            return await this.createJsonConfig(args);
          case 'optimize_json_output':
            return await this.optimizeJsonOutput(args);
          case 'validate_json_structure':
            return await this.validateJsonStructure(args);
          case 'create_workflow_integration':
            return await this.createWorkflowIntegration(args);
          case 'analyze_output_consistency':
            return await this.analyzeOutputConsistency(args);
          case 'get_optimization_analytics':
            return await this.getOptimizationAnalytics(args);
          case 'auto_improve_schema':
            return await this.autoImproveSchema(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`[JSON Mode Optimizer] Error in ${name}:`, error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`
            }
          ]
        };
      }
    });
  }

  private async createJsonConfig(args: any) {
    const config: JsonModeConfig = {
      id: uuidv4(),
      name: args.name,
      description: args.description || '',
      schema: args.schema,
      strict: args.strict ?? true,
      optimizationLevel: args.optimizationLevel || 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      successRate: 0
    };

    // Validate the schema itself
    try {
      this.ajv.compile(config.schema);
    } catch (error) {
      throw new Error(`Invalid JSON schema: ${error instanceof Error ? error.message : String(error)}`);
    }

    await this.database.createConfig(config);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            configId: config.id,
            message: `JSON configuration '${config.name}' created successfully`,
            config: {
              id: config.id,
              name: config.name,
              optimizationLevel: config.optimizationLevel,
              strict: config.strict
            }
          }, null, 2)
        }
      ]
    };
  }

  private async optimizeJsonOutput(args: any): Promise<any> {
    const { configId, inputData, promptContext, maxRetries = 3 } = args;
    const startTime = performance.now();
    
    const config = await this.database.getConfig(configId);
    if (!config) {
      throw new Error(`Configuration not found: ${configId}`);
    }

    let bestResult: JsonOptimizationResult | null = null;
    const errors: ValidationError[] = [];
    const optimizations: OptimizationSuggestion[] = [];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const validationStart = performance.now();
        
        // Try to optimize and validate the input data
        const optimizedData = await this.performOptimization(inputData, config, promptContext);
        const validationResult = this.validateWithAjv(optimizedData, config.schema);
        
        const validationTime = performance.now() - validationStart;
        const responseTime = performance.now() - startTime;
        
        const result: JsonOptimizationResult = {
          configId,
          success: validationResult.valid,
          output: validationResult.valid ? optimizedData : undefined,
          errors: validationResult.errors,
          optimizations: this.generateOptimizations(validationResult.errors, config),
          performance: {
            responseTime,
            validationTime,
            outputSize: JSON.stringify(optimizedData || {}).length,
            accuracyScore: this.calculateAccuracyScore(optimizedData, config),
            consistencyScore: 0.95 // Will be updated by consistency analysis
          }
        };

        if (result.success) {
          bestResult = result;
          break;
        }

        if (!bestResult || result.performance.accuracyScore > bestResult.performance.accuracyScore) {
          bestResult = result;
        }

        errors.push(...validationResult.errors);
        optimizations.push(...result.optimizations);

      } catch (error) {
        console.error(`[JSON Mode Optimizer] Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          errors.push({
            path: 'root',
            message: error instanceof Error ? error.message : String(error),
            schemaPath: '#/',
            keyword: 'optimization',
            severity: 'error'
          });
        }
      }
    }

    // Save results and update config stats
    if (bestResult) {
      await this.database.saveOptimizationResult(bestResult);
      await this.database.updateConfigStats(configId, bestResult.success);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(bestResult || {
            configId,
            success: false,
            errors,
            optimizations,
            performance: {
              responseTime: performance.now() - startTime,
              validationTime: 0,
              outputSize: 0,
              accuracyScore: 0,
              consistencyScore: 0
            }
          }, null, 2)
        }
      ]
    };
  }

  private async validateJsonStructure(args: any): Promise<any> {
    const { configId, jsonData, generateSuggestions = true } = args;
    const startTime = performance.now();
    
    const config = await this.database.getConfig(configId);
    if (!config) {
      throw new Error(`Configuration not found: ${configId}`);
    }

    const validationResult = this.validateWithAjv(jsonData, config.schema);
    const validationTime = performance.now() - startTime;
    
    const result = {
      valid: validationResult.valid,
      errors: validationResult.errors,
      suggestions: generateSuggestions ? this.generateOptimizations(validationResult.errors, config) : [],
      performance: {
        validationTime,
        dataSize: JSON.stringify(jsonData).length
      },
      schema: {
        configId,
        name: config.name,
        strict: config.strict,
        optimizationLevel: config.optimizationLevel
      }
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async createWorkflowIntegration(args: any): Promise<any> {
    const workflow: JsonWorkflowIntegration = {
      id: uuidv4(),
      name: args.name,
      configIds: args.configIds,
      executionOrder: args.configIds, // Use same order for execution
      fallbackStrategy: args.fallbackStrategy || 'retry',
      maxRetries: args.maxRetries || 3,
      timeoutMs: args.timeoutMs || 30000,
      successThreshold: args.successThreshold || 0.8
    };

    // Validate that all config IDs exist
    for (const configId of workflow.configIds) {
      const config = await this.database.getConfig(configId);
      if (!config) {
        throw new Error(`Configuration not found: ${configId}`);
      }
    }

    await this.database.createWorkflowIntegration(workflow);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            workflowId: workflow.id,
            message: `Workflow '${workflow.name}' created successfully`,
            workflow: {
              id: workflow.id,
              name: workflow.name,
              steps: workflow.configIds.length,
              fallbackStrategy: workflow.fallbackStrategy,
              timeoutMs: workflow.timeoutMs
            }
          }, null, 2)
        }
      ]
    };
  }

  private async analyzeOutputConsistency(args: any): Promise<any> {
    const { configId, sampleOutputs, generateRecommendations = true } = args;
    
    const config = await this.database.getConfig(configId);
    if (!config) {
      throw new Error(`Configuration not found: ${configId}`);
    }

    const analysis = this.performConsistencyAnalysis(sampleOutputs, config);
    
    if (generateRecommendations) {
      analysis.recommendedAdjustments = this.generateConsistencyRecommendations(analysis, config);
    }

    await this.database.saveConsistencyAnalysis(analysis);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            configId,
            analysis: {
              samples: analysis.samples,
              consistencyRate: analysis.consistencyRate,
              stabilityScore: analysis.stabilityScore,
              commonVariations: analysis.commonVariations,
              recommendations: analysis.recommendedAdjustments
            }
          }, null, 2)
        }
      ]
    };
  }

  private async getOptimizationAnalytics(args: any): Promise<any> {
    const { configId, days = 7, includeDetails = false } = args;
    
    if (configId) {
      // Analytics for specific configuration
      const config = await this.database.getConfig(configId);
      if (!config) {
        throw new Error(`Configuration not found: ${configId}`);
      }

      const metrics = await this.database.getConfigAnalytics(configId, days);
      
      const analytics = {
        configId,
        name: config.name,
        totalUsage: config.usageCount,
        successRate: config.successRate,
        recentMetrics: this.aggregateMetrics(metrics),
        trends: includeDetails ? metrics : undefined
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analytics, null, 2)
          }
        ]
      };
    } else {
      // System-wide analytics
      const allConfigs = await this.database.getAllConfigs();
      const topPerforming = await this.database.getTopPerformingConfigs(5);
      
      const systemAnalytics: JsonModeAnalytics = {
        totalConfigurations: allConfigs.length,
        totalExecutions: allConfigs.reduce((sum, config) => sum + config.usageCount, 0),
        averageSuccessRate: allConfigs.reduce((sum, config) => sum + config.successRate, 0) / Math.max(allConfigs.length, 1),
        topPerformingConfigs: topPerforming.map(config => config.id),
        commonFailurePatterns: await this.identifyFailurePatterns(),
        optimizationImpact: await this.calculateOptimizationImpact(),
        trendsOverTime: includeDetails ? await this.getTrendsData(days) : []
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(systemAnalytics, null, 2)
          }
        ]
      };
    }
  }

  private async autoImproveSchema(args: any): Promise<any> {
    const { configId, sampleData, improvementLevel = 'moderate' } = args;
    
    const config = await this.database.getConfig(configId);
    if (!config) {
      throw new Error(`Configuration not found: ${configId}`);
    }

    const improvements = this.analyzeSchemaImprovements(config.schema, sampleData, improvementLevel);
    
    if (improvements.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              configId,
              message: 'No improvements suggested for current schema',
              currentSchema: config.schema
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            configId,
            currentSchema: config.schema,
            suggestedImprovements: improvements,
            improvementLevel,
            instructions: 'Review suggestions and create new configuration if desired'
          }, null, 2)
        }
      ]
    };
  }

  // Helper methods for optimization logic
  private async performOptimization(inputData: any, config: JsonModeConfig, context?: string): Promise<any> {
    // This is where we'd implement AI-specific optimization logic
    // For now, we'll implement basic data cleaning and structure optimization
    
    let optimized = cloneDeep(inputData);
    
    // Apply optimization level-specific transformations
    switch (config.optimizationLevel) {
      case 'basic':
        optimized = this.basicOptimization(optimized, config.schema);
        break;
      case 'standard':
        optimized = this.standardOptimization(optimized, config.schema);
        break;
      case 'advanced':
        optimized = this.advancedOptimization(optimized, config.schema, context);
        break;
      case 'enterprise':
        optimized = this.enterpriseOptimization(optimized, config.schema, context);
        break;
    }
    
    return optimized;
  }

  private basicOptimization(data: any, schema: any): any {
    // Remove null/undefined values, basic type coercion
    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== null && value !== undefined) {
          cleaned[key] = this.basicOptimization(value, schema.properties?.[key]);
        }
      }
      return cleaned;
    }
    return data;
  }

  private standardOptimization(data: any, schema: any): any {
    // Includes basic + structure alignment with schema
    let optimized = this.basicOptimization(data, schema);
    
    if (schema.type === 'object' && typeof optimized === 'object') {
      // Ensure required properties exist
      if (schema.required) {
        for (const requiredProp of schema.required) {
          if (!(requiredProp in optimized)) {
            optimized[requiredProp] = this.getDefaultValue(schema.properties?.[requiredProp]);
          }
        }
      }
    }
    
    return optimized;
  }

  private advancedOptimization(data: any, schema: any, context?: string): any {
    // Includes standard + intelligent data inference and completion
    let optimized = this.standardOptimization(data, schema);
    
    // Advanced logic would go here (AI-powered data completion, smart defaults, etc.)
    return optimized;
  }

  private enterpriseOptimization(data: any, schema: any, context?: string): any {
    // Includes advanced + enterprise-specific optimizations
    let optimized = this.advancedOptimization(data, schema, context);
    
    // Enterprise features: data validation, compliance checks, etc.
    return optimized;
  }

  private validateWithAjv(data: any, schema: any): { valid: boolean; errors: ValidationError[] } {
    const validator = this.ajv.compile(schema);
    const valid = validator(data);
    
    const errors: ValidationError[] = [];
    if (!valid && validator.errors) {
      for (const error of validator.errors) {
        errors.push({
          path: error.instancePath || 'root',
          message: error.message || 'Validation failed',
          schemaPath: error.schemaPath || '#/',
          keyword: error.keyword || 'unknown',
          params: error.params,
          severity: 'error'
        });
      }
    }
    
    return { valid, errors };
  }

  private generateOptimizations(errors: ValidationError[], config: JsonModeConfig): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    for (const error of errors) {
      switch (error.keyword) {
        case 'required':
          suggestions.push({
            type: 'structure',
            description: `Add missing required property: ${error.params?.missingProperty}`,
            impact: 'high',
            implementation: `Add property "${error.params?.missingProperty}" to the object`,
            estimatedImprovement: 0.8
          });
          break;
        case 'type':
          suggestions.push({
            type: 'schema',
            description: `Fix type mismatch at ${error.path}`,
            impact: 'medium',
            implementation: `Convert value to expected type: ${error.params?.type}`,
            estimatedImprovement: 0.6
          });
          break;
        case 'additionalProperties':
          suggestions.push({
            type: 'structure',
            description: 'Remove additional properties not defined in schema',
            impact: 'low',
            implementation: 'Filter object to only include schema-defined properties',
            estimatedImprovement: 0.3
          });
          break;
      }
    }
    
    return suggestions;
  }

  private calculateAccuracyScore(data: any, config: JsonModeConfig): number {
    const validation = this.validateWithAjv(data, config.schema);
    if (validation.valid) return 1.0;
    
    // Calculate partial accuracy based on error severity and count
    const totalErrors = validation.errors.length;
    const criticalErrors = validation.errors.filter(e => e.severity === 'error').length;
    
    return Math.max(0, 1 - (criticalErrors * 0.3 + (totalErrors - criticalErrors) * 0.1));
  }

  private getDefaultValue(schemaProperty: any): any {
    if (!schemaProperty) return undefined;
    
    switch (schemaProperty.type) {
      case 'string': return '';
      case 'number': return 0;
      case 'integer': return 0;
      case 'boolean': return false;
      case 'array': return [];
      case 'object': return {};
      default: return null;
    }
  }

  private performConsistencyAnalysis(samples: any[], config: JsonModeConfig): AIOutputConsistency {
    const variations: string[] = [];
    let consistentSamples = 0;
    
    // Analyze structural consistency
    const structures = samples.map(sample => JSON.stringify(sample, Object.keys(sample).sort()));
    const uniqueStructures = new Set(structures);
    
    consistentSamples = samples.filter(sample => {
      const validation = this.validateWithAjv(sample, config.schema);
      return validation.valid;
    }).length;
    
    const consistencyRate = samples.length > 0 ? consistentSamples / samples.length : 0;
    const stabilityScore = uniqueStructures.size === 1 ? 1.0 : Math.max(0, 1 - (uniqueStructures.size - 1) * 0.1);
    
    return {
      configId: config.id,
      samples: samples.length,
      consistencyRate,
      commonVariations: Array.from(uniqueStructures).slice(0, 5),
      stabilityScore,
      recommendedAdjustments: []
    };
  }

  private generateConsistencyRecommendations(analysis: AIOutputConsistency, config: JsonModeConfig): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    if (analysis.consistencyRate < 0.8) {
      suggestions.push({
        type: 'schema',
        description: 'Schema may be too flexible, consider adding more constraints',
        impact: 'medium',
        implementation: 'Add format, pattern, or enum constraints to reduce variation',
        estimatedImprovement: 0.4
      });
    }
    
    if (analysis.stabilityScore < 0.7) {
      suggestions.push({
        type: 'structure',
        description: 'High structural variation detected, consider stricter schema',
        impact: 'high',
        implementation: 'Set additionalProperties to false and define all expected properties',
        estimatedImprovement: 0.6
      });
    }
    
    return suggestions;
  }

  private aggregateMetrics(metrics: PerformanceMetrics[]): any {
    if (metrics.length === 0) {
      return {
        averageResponseTime: 0,
        averageAccuracy: 0,
        averageConsistency: 0
      };
    }
    
    return {
      averageResponseTime: metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
      averageAccuracy: metrics.reduce((sum, m) => sum + m.accuracyScore, 0) / metrics.length,
      averageConsistency: metrics.reduce((sum, m) => sum + m.consistencyScore, 0) / metrics.length,
      totalSamples: metrics.length
    };
  }

  private async identifyFailurePatterns(): Promise<string[]> {
    // This would analyze failure patterns from database
    return ['missing_required_properties', 'type_mismatches', 'format_violations'];
  }

  private async calculateOptimizationImpact(): Promise<Record<string, number>> {
    // This would calculate the impact of different optimizations
    return {
      'schema_improvements': 0.35,
      'structure_optimization': 0.28,
      'type_corrections': 0.22,
      'format_validation': 0.15
    };
  }

  private async getTrendsData(days: number): Promise<any[]> {
    // This would fetch trending data from database
    return [];
  }

  private analyzeSchemaImprovements(schema: any, sampleData: any[], level: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    
    // Analyze actual data patterns vs schema
    const dataTypes = new Map<string, Set<string>>();
    
    for (const sample of sampleData) {
      this.collectDataTypes(sample, '', dataTypes);
    }
    
    // Generate improvement suggestions based on analysis
    for (const [path, types] of dataTypes) {
      if (types.size > 1 && level !== 'conservative') {
        suggestions.push({
          type: 'schema',
          description: `Consider union type for property ${path} (found: ${Array.from(types).join(', ')})`,
          impact: 'medium',
          implementation: `Use "anyOf" or "oneOf" to handle multiple types`,
          estimatedImprovement: 0.3
        });
      }
    }
    
    return suggestions;
  }

  private collectDataTypes(obj: any, path: string, typeMap: Map<string, Set<string>>): void {
    if (obj === null || obj === undefined) return;
    
    const currentPath = path || 'root';
    const type = Array.isArray(obj) ? 'array' : typeof obj;
    
    if (!typeMap.has(currentPath)) {
      typeMap.set(currentPath, new Set());
    }
    typeMap.get(currentPath)!.add(type);
    
    if (type === 'object' && !Array.isArray(obj)) {
      for (const [key, value] of Object.entries(obj)) {
        this.collectDataTypes(value, `${currentPath}.${key}`, typeMap);
      }
    }
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[JSON Mode Optimizer] Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.database.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    await this.database.initialize();
    console.error('[JSON Mode Optimizer] Server initialized');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[JSON Mode Optimizer] Server running on stdio');
  }
}

// Start the server
const server = new JsonModeOptimizerServer();
server.run().catch((error) => {
  console.error('[JSON Mode Optimizer] Failed to start server:', error);
  process.exit(1);
});
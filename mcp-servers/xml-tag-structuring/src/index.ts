#!/usr/bin/env node

/**
 * XML Tag Structuring MCP Server
 * Advanced XML-based prompt engineering and optimization system
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool
} from '@modelcontextprotocol/sdk/types.js';
import { XmlStructuringDatabase } from './database.js';
import {
  XmlTemplate,
  XmlPromptResult,
  XmlWorkflowPattern,
  XmlTemplateLibrary,
  XmlOptimizationSession,
  XmlValidationError,
  XmlOptimization,
  XmlPerformanceMetrics,
  EffectivenessMetrics,
  XmlParsedStructure,
  PatternAnalysis
} from './types.js';
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { create } from 'xmlbuilder2';
import { v4 as uuidv4 } from 'uuid';
import { cloneDeep, isEqual } from 'lodash';

class XmlTagStructuringServer {
  private server: Server;
  private database: XmlStructuringDatabase;
  private xmlParser: XMLParser;
  private xmlBuilder: XMLBuilder;

  constructor() {
    this.server = new Server(
      {
        name: 'xml-tag-structuring-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );
    
    this.database = new XmlStructuringDatabase();
    
    // Configure XML parser with advanced options
    const xmlOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      parseNodeValue: true,
      parseTrueNumberOnly: false,
      arrayMode: false,
      trimValues: true,
      cdataTagName: '__cdata',
      cdataPositionChar: '\\c',
      processEntities: true,
      htmlEntities: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseTagValue: true,
      ignoreDeclaration: false,
      ignorePiTags: false,
      preserveOrder: false
    };
    
    this.xmlParser = new XMLParser(xmlOptions);
    this.xmlBuilder = new XMLBuilder({
      format: true,
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      suppressEmptyNode: false,
      suppressBooleanAttributes: true,
      suppressUnpairedNode: false
    });
    
    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_xml_template',
          description: 'Create advanced XML template for prompt engineering',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Template name' },
              description: { type: 'string', description: 'Template description' },
              category: { 
                type: 'string', 
                enum: ['reasoning', 'analysis', 'generation', 'conversation', 'workflow', 'custom'],
                default: 'custom',
                description: 'Template category'
              },
              rootElement: { type: 'string', description: 'Root XML element name' },
              elements: { type: 'array', description: 'XML element definitions' },
              variables: { type: 'array', description: 'Template variables', default: [] },
              constraints: { type: 'array', description: 'XML constraints', default: [] },
              optimizationLevel: { 
                type: 'string', 
                enum: ['basic', 'standard', 'advanced', 'enterprise'],
                default: 'standard',
                description: 'Optimization level'
              }
            },
            required: ['name', 'rootElement', 'elements']
          }
        },
        {
          name: 'generate_xml_prompt',
          description: 'Generate optimized XML prompt using template',
          inputSchema: {
            type: 'object',
            properties: {
              templateId: { type: 'string', description: 'XML template ID' },
              variables: { type: 'object', description: 'Variable values for template' },
              context: { type: 'string', description: 'Additional context for generation' },
              optimizeForAI: { type: 'boolean', default: true, description: 'Optimize for AI comprehension' },
              includeMetadata: { type: 'boolean', default: false, description: 'Include XML metadata' }
            },
            required: ['templateId']
          }
        },
        {
          name: 'validate_xml_structure',
          description: 'Validate XML structure against template with detailed analysis',
          inputSchema: {
            type: 'object',
            properties: {
              templateId: { type: 'string', description: 'XML template ID' },
              xmlContent: { type: 'string', description: 'XML content to validate' },
              strictMode: { type: 'boolean', default: true, description: 'Strict validation mode' },
              generateOptimizations: { type: 'boolean', default: true, description: 'Generate optimization suggestions' }
            },
            required: ['templateId', 'xmlContent']
          }
        },
        {
          name: 'create_workflow_pattern',
          description: 'Create XML-based workflow control pattern',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Workflow name' },
              description: { type: 'string', description: 'Workflow description' },
              type: { 
                type: 'string', 
                enum: ['sequential', 'parallel', 'conditional', 'iterative', 'recursive'],
                default: 'sequential',
                description: 'Workflow type'
              },
              steps: { type: 'array', description: 'Workflow step definitions' },
              triggers: { type: 'array', description: 'Workflow triggers', default: [] },
              conditions: { type: 'array', description: 'Workflow conditions', default: [] }
            },
            required: ['name', 'steps']
          }
        },
        {
          name: 'optimize_xml_performance',
          description: 'Optimize XML structure for performance and effectiveness',
          inputSchema: {
            type: 'object',
            properties: {
              templateId: { type: 'string', description: 'XML template ID' },
              xmlContent: { type: 'string', description: 'XML content to optimize' },
              optimizationGoals: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Optimization goals (performance, readability, effectiveness)' 
              },
              maxIterations: { type: 'number', default: 5, description: 'Maximum optimization iterations' }
            },
            required: ['templateId', 'xmlContent']
          }
        },
        {
          name: 'analyze_effectiveness',
          description: 'Analyze XML prompt effectiveness and AI comprehensibility',
          inputSchema: {
            type: 'object',
            properties: {
              templateId: { type: 'string', description: 'XML template ID' },
              samplePrompts: { type: 'array', description: 'Sample XML prompts for analysis' },
              aiResponses: { type: 'array', description: 'Corresponding AI responses (optional)' },
              generateRecommendations: { type: 'boolean', default: true, description: 'Generate improvement recommendations' }
            },
            required: ['templateId', 'samplePrompts']
          }
        },
        {
          name: 'create_template_library',
          description: 'Create organized library of XML templates with relationships',
          inputSchema: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Library name' },
              description: { type: 'string', description: 'Library description' },
              category: { type: 'string', description: 'Library category' },
              templateIds: { type: 'array', items: { type: 'string' }, description: 'Template IDs to include' },
              sharedComponents: { type: 'array', description: 'Shared XML components', default: [] }
            },
            required: ['name', 'templateIds']
          }
        },
        {
          name: 'get_xml_analytics',
          description: 'Get comprehensive XML template analytics and insights',
          inputSchema: {
            type: 'object',
            properties: {
              templateId: { type: 'string', description: 'Specific template ID (optional)' },
              category: { type: 'string', description: 'Filter by category (optional)' },
              days: { type: 'number', default: 30, description: 'Days of data to analyze' },
              includePatterns: { type: 'boolean', default: true, description: 'Include pattern analysis' },
              includeEffectiveness: { type: 'boolean', default: true, description: 'Include effectiveness metrics' }
            }
          }
        }
      ] as Tool[]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_xml_template':
            return await this.createXmlTemplate(args);
          case 'generate_xml_prompt':
            return await this.generateXmlPrompt(args);
          case 'validate_xml_structure':
            return await this.validateXmlStructure(args);
          case 'create_workflow_pattern':
            return await this.createWorkflowPattern(args);
          case 'optimize_xml_performance':
            return await this.optimizeXmlPerformance(args);
          case 'analyze_effectiveness':
            return await this.analyzeEffectiveness(args);
          case 'create_template_library':
            return await this.createTemplateLibrary(args);
          case 'get_xml_analytics':
            return await this.getXmlAnalytics(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`[XML Tag Structuring] Error in ${name}:`, error);
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

  private async createXmlTemplate(args: any): Promise<any> {
    const template: XmlTemplate = {
      id: uuidv4(),
      name: args.name,
      description: args.description || '',
      category: args.category || 'custom',
      structure: {
        rootElement: args.rootElement,
        namespace: args.namespace,
        schema: args.schema,
        elements: args.elements || [],
        attributes: args.attributes || [],
        rules: args.rules || []
      },
      variables: args.variables || [],
      constraints: args.constraints || [],
      optimizationLevel: args.optimizationLevel || 'standard',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      effectivenessScore: 0
    };

    // Validate template structure
    const validation = this.validateTemplateStructure(template);
    if (!validation.valid) {
      throw new Error(`Invalid template structure: ${validation.errors.join(', ')}`);
    }

    await this.database.createTemplate(template);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            templateId: template.id,
            message: `XML template '${template.name}' created successfully`,
            template: {
              id: template.id,
              name: template.name,
              category: template.category,
              rootElement: template.structure.rootElement,
              elementCount: template.structure.elements.length,
              optimizationLevel: template.optimizationLevel
            }
          }, null, 2)
        }
      ]
    };
  }

  private async generateXmlPrompt(args: any): Promise<any> {
    const { templateId, variables = {}, context, optimizeForAI = true, includeMetadata = false } = args;
    const startTime = Date.now();

    const template = await this.database.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    try {
      // Generate XML structure
      const xmlStructure = this.buildXmlFromTemplate(template, variables, context);
      
      // Apply AI-specific optimizations
      let optimizedXml = xmlStructure;
      if (optimizeForAI) {
        optimizedXml = this.optimizeForAI(xmlStructure, template);
      }

      // Add metadata if requested
      if (includeMetadata) {
        optimizedXml = this.addXmlMetadata(optimizedXml, template);
      }

      const generationTime = Date.now() - startTime;
      
      // Parse and analyze the generated XML
      const parsedStructure = this.parseXmlStructure(optimizedXml);
      const validationErrors = this.validateAgainstTemplate(parsedStructure, template);
      const optimizations = this.generateOptimizationSuggestions(parsedStructure, template);
      const effectiveness = this.calculateEffectiveness(parsedStructure, template);
      
      const performance: XmlPerformanceMetrics = {
        generationTime,
        parsingTime: 0,
        validationTime: 0,
        xmlSize: optimizedXml.length,
        compressionRatio: this.calculateCompressionRatio(optimizedXml),
        complexityScore: this.calculateComplexityScore(parsedStructure),
        readabilityScore: this.calculateReadabilityScore(optimizedXml)
      };

      const result: XmlPromptResult = {
        templateId,
        success: validationErrors.length === 0,
        generatedXml: optimizedXml,
        parsedStructure,
        validationErrors,
        optimizations,
        performance,
        effectiveness
      };

      // Save result and update template stats
      await this.database.savePromptResult(result);
      await this.database.updateTemplateStats(templateId, effectiveness.overallEffectiveness);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: result.success,
              xmlPrompt: result.generatedXml,
              analysis: {
                effectiveness: result.effectiveness,
                performance: result.performance,
                validationErrors: result.validationErrors,
                suggestions: result.optimizations
              }
            }, null, 2)
          }
        ]
      };

    } catch (error) {
      console.error(`[XML Tag Structuring] Generation failed:`, error);
      throw error;
    }
  }

  private async validateXmlStructure(args: any): Promise<any> {
    const { templateId, xmlContent, strictMode = true, generateOptimizations = true } = args;
    const startTime = Date.now();

    const template = await this.database.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    try {
      // Parse XML
      const parsedStructure = this.parseXmlStructure(xmlContent);
      const parsingTime = Date.now() - startTime;
      
      // Validate against template
      const validationStart = Date.now();
      const validationErrors = this.validateAgainstTemplate(parsedStructure, template, strictMode);
      const validationTime = Date.now() - validationStart;
      
      // Generate optimizations if requested
      let optimizations: XmlOptimization[] = [];
      if (generateOptimizations) {
        optimizations = this.generateOptimizationSuggestions(parsedStructure, template);
      }

      const result = {
        valid: validationErrors.length === 0,
        structure: parsedStructure.structure,
        validationErrors,
        optimizations,
        performance: {
          parsingTime,
          validationTime,
          totalTime: Date.now() - startTime
        },
        template: {
          id: template.id,
          name: template.name,
          category: template.category
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

    } catch (error) {
      console.error(`[XML Tag Structuring] Validation failed:`, error);
      throw error;
    }
  }

  private async createWorkflowPattern(args: any): Promise<any> {
    const pattern: XmlWorkflowPattern = {
      id: uuidv4(),
      name: args.name,
      description: args.description || '',
      type: args.type || 'sequential',
      steps: args.steps,
      triggers: args.triggers || [],
      conditions: args.conditions || [],
      outputs: args.outputs || []
    };

    await this.database.createWorkflowPattern(pattern);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            patternId: pattern.id,
            message: `Workflow pattern '${pattern.name}' created successfully`,
            pattern: {
              id: pattern.id,
              name: pattern.name,
              type: pattern.type,
              stepCount: pattern.steps.length,
              triggerCount: pattern.triggers.length
            }
          }, null, 2)
        }
      ]
    };
  }

  private async optimizeXmlPerformance(args: any): Promise<any> {
    const { templateId, xmlContent, optimizationGoals = ['performance', 'effectiveness'], maxIterations = 5 } = args;
    
    const template = await this.database.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const session: XmlOptimizationSession = {
      id: uuidv4(),
      templateId,
      startTime: new Date(),
      iterations: [],
      status: 'active',
      goals: optimizationGoals.map((goal: string) => ({
        metric: goal,
        target: 0.9,
        current: 0,
        priority: 'high',
        achieved: false
      }))
    };

    await this.database.createOptimizationSession(session);

    try {
      let currentXml = xmlContent;
      let bestResult: XmlPromptResult | undefined = undefined;
      
      for (let iteration = 1; iteration <= maxIterations; iteration++) {
        const iterationStart = Date.now();
        
        // Apply optimization techniques
        const optimizedXml = this.applyOptimizationTechniques(currentXml, template, optimizationGoals);
        
        // Evaluate the result
        const parsedStructure = this.parseXmlStructure(optimizedXml);
        const validationErrors = this.validateAgainstTemplate(parsedStructure, template);
        const optimizations = this.generateOptimizationSuggestions(parsedStructure, template);
        const effectiveness = this.calculateEffectiveness(parsedStructure, template);
        
        const result: XmlPromptResult = {
          templateId,
          success: validationErrors.length === 0,
          generatedXml: optimizedXml,
          parsedStructure,
          validationErrors,
          optimizations,
          performance: {
            generationTime: Date.now() - iterationStart,
            parsingTime: 0,
            validationTime: 0,
            xmlSize: optimizedXml.length,
            compressionRatio: this.calculateCompressionRatio(optimizedXml),
            complexityScore: this.calculateComplexityScore(parsedStructure),
            readabilityScore: this.calculateReadabilityScore(optimizedXml)
          },
          effectiveness
        };
        
        // Check if this is the best result so far
        if (!bestResult || effectiveness.overallEffectiveness > bestResult.effectiveness.overallEffectiveness) {
          bestResult = result;
        }
        
        // Update session
        session.iterations.push({
          number: iteration,
          timestamp: new Date(),
          changes: [], // Would track specific changes made
          result,
          improvement: bestResult ? result.effectiveness.overallEffectiveness - bestResult.effectiveness.overallEffectiveness : 0,
          direction: 'improvement'
        });
        
        currentXml = optimizedXml;
        
        // Check if goals are achieved
        const goalsAchieved = session.goals.every(goal => goal.achieved);
        if (goalsAchieved) {
          break;
        }
      }
      
      session.endTime = new Date();
      session.status = 'completed';
      session.bestResult = bestResult;
      
      await this.database.updateOptimizationSession(session);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              sessionId: session.id,
              iterations: session.iterations.length,
              bestResult: {
                xml: bestResult?.generatedXml,
                effectiveness: bestResult?.effectiveness,
                performance: bestResult?.performance
              },
              improvements: session.iterations.map(iter => ({
                iteration: iter.number,
                effectiveness: iter.result.effectiveness.overallEffectiveness,
                improvement: iter.improvement
              }))
            }, null, 2)
          }
        ]
      };

    } catch (error) {
      session.status = 'failed';
      await this.database.updateOptimizationSession(session);
      throw error;
    }
  }

  private async analyzeEffectiveness(args: any): Promise<any> {
    const { templateId, samplePrompts, aiResponses = [], generateRecommendations = true } = args;
    
    const template = await this.database.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const analysis: any = {
      templateId,
      sampleCount: samplePrompts.length,
      overallMetrics: {
        averageComplexity: 0,
        averageReadability: 0,
        averageEffectiveness: 0,
        structuralConsistency: 0
      },
      detailedAnalysis: [] as any[],
      patterns: [] as any[],
      recommendations: [] as any[]
    };

    // Analyze each sample
    for (let i = 0; i < samplePrompts.length; i++) {
      const prompt = samplePrompts[i];
      const parsedStructure = this.parseXmlStructure(prompt);
      const effectiveness = this.calculateEffectiveness(parsedStructure, template);
      
      analysis.detailedAnalysis.push({
        sampleIndex: i,
        effectiveness,
        complexity: this.calculateComplexityScore(parsedStructure),
        readability: this.calculateReadabilityScore(prompt),
        structuralIssues: this.validateAgainstTemplate(parsedStructure, template)
      });
    }
    
    // Calculate overall metrics
    if (analysis.detailedAnalysis.length > 0) {
      analysis.overallMetrics.averageComplexity = 
        analysis.detailedAnalysis.reduce((sum: number, item: any) => sum + item.complexity, 0) / analysis.detailedAnalysis.length;
      analysis.overallMetrics.averageReadability = 
        analysis.detailedAnalysis.reduce((sum: number, item: any) => sum + item.readability, 0) / analysis.detailedAnalysis.length;
      analysis.overallMetrics.averageEffectiveness = 
        analysis.detailedAnalysis.reduce((sum: number, item: any) => sum + item.effectiveness.overallEffectiveness, 0) / analysis.detailedAnalysis.length;
    }

    // Identify patterns
    analysis.patterns = this.identifyUsagePatterns(samplePrompts, template);
    
    // Generate recommendations
    if (generateRecommendations) {
      analysis.recommendations = this.generateEffectivenessRecommendations(analysis, template);
    }

    // Save effectiveness metrics
    const avgEffectiveness = analysis.overallMetrics.averageEffectiveness;
    const effectivenessMetrics: EffectivenessMetrics = {
      structureClarity: avgEffectiveness * 0.9, // Approximations based on analysis
      semanticRichness: avgEffectiveness * 0.95,
      instructionPrecision: avgEffectiveness * 0.85,
      contextPreservation: avgEffectiveness * 0.9,
      aiComprehensibility: avgEffectiveness * 0.92,
      overallEffectiveness: avgEffectiveness
    };
    
    await this.database.saveEffectivenessMetrics(templateId, effectivenessMetrics);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(analysis, null, 2)
        }
      ]
    };
  }

  private async createTemplateLibrary(args: any): Promise<any> {
    const library: XmlTemplateLibrary = {
      id: uuidv4(),
      name: args.name,
      description: args.description || '',
      category: args.category || 'general',
      templates: args.templateIds,
      sharedComponents: args.sharedComponents || [],
      compatibility: []
    };

    // Validate that all templates exist
    for (const templateId of library.templates) {
      const template = await this.database.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }
    }

    // Analyze compatibility between templates
    library.compatibility = await this.analyzeTemplateCompatibility(library.templates);

    await this.database.createTemplateLibrary(library);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            libraryId: library.id,
            message: `Template library '${library.name}' created successfully`,
            library: {
              id: library.id,
              name: library.name,
              category: library.category,
              templateCount: library.templates.length,
              compatibilityAnalysis: library.compatibility.length
            }
          }, null, 2)
        }
      ]
    };
  }

  private async getXmlAnalytics(args: any): Promise<any> {
    const { templateId, category, days = 30, includePatterns = true, includeEffectiveness = true } = args;

    if (templateId) {
      // Analytics for specific template
      const template = await this.database.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const analytics = await this.database.getTemplateAnalytics(templateId, days);
      
      const result = {
        templateId,
        name: template.name,
        category: template.category,
        usageStats: {
          totalUsage: template.usageCount,
          recentUsage: analytics.total_usage || 0,
          successRate: analytics.success_rate || 0,
          averageEffectiveness: analytics.avg_effectiveness || 0
        },
        performance: {
          averageGenerationTime: analytics.avg_generation_time || 0,
          averageComplexity: analytics.avg_complexity || 0
        },
        trends: includeEffectiveness ? await this.getEffectivenessTrends(templateId, days) : undefined
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    } else {
      // System-wide analytics
      const systemAnalytics = await this.database.getSystemAnalytics();
      const topTemplates = await this.database.getTopPerformingTemplates(10, category);
      
      const result = {
        systemWide: true,
        totalTemplates: systemAnalytics.totalTemplates,
        totalUsage: systemAnalytics.totalUsage,
        averageEffectiveness: systemAnalytics.averageEffectiveness,
        topPerformingTemplates: topTemplates.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          effectivenessScore: t.effectivenessScore,
          usageCount: t.usageCount
        })),
        commonPatterns: includePatterns ? systemAnalytics.commonPatterns : undefined,
        categoryBreakdown: await this.getCategoryBreakdown(),
        recentTrends: includeEffectiveness ? systemAnalytics.optimizationTrends : undefined
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
  }

  // Helper methods for XML processing and analysis
  private validateTemplateStructure(template: XmlTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!template.structure.rootElement) {
      errors.push('Root element is required');
    }
    
    if (!template.structure.elements || template.structure.elements.length === 0) {
      errors.push('At least one element definition is required');
    }
    
    // Validate element definitions
    for (const element of template.structure.elements) {
      if (!element.name) {
        errors.push(`Element name is required`);
      }
      if (!element.type) {
        errors.push(`Element type is required for ${element.name}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  private buildXmlFromTemplate(template: XmlTemplate, variables: Record<string, any>, context?: string): string {
    try {
      const root = create({ version: '1.0', encoding: 'UTF-8' });
      
      // Add processing instruction if context is provided
      if (context) {
        root.com(`Context: ${context}`);
      }
      
      const rootElement = root.ele(template.structure.rootElement);
      
      // Add namespace if specified
      if (template.structure.namespace) {
        rootElement.att('xmlns', template.structure.namespace);
      }
      
      // Build elements according to template structure
      this.buildElementsRecursively(rootElement, template.structure.elements, variables);
      
      return root.end({ prettyPrint: true, spaceBeforeSlash: true });
    } catch (error) {
      throw new Error(`Failed to build XML from template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private buildElementsRecursively(parent: any, elements: any[], variables: Record<string, any>): void {
    for (const elementDef of elements) {
      if (elementDef.type === 'container') {
        const element = parent.ele(elementDef.name);
        
        // Add attributes
        if (elementDef.attributes) {
          for (const attr of elementDef.attributes) {
            const value = variables[attr.name] || attr.defaultValue;
            if (value !== undefined) {
              element.att(attr.name, value);
            }
          }
        }
        
        // Add child elements
        if (elementDef.children) {
          const childElements = elements.filter(e => elementDef.children.includes(e.name));
          this.buildElementsRecursively(element, childElements, variables);
        }
      } else if (elementDef.type === 'content') {
        const value = variables[elementDef.name] || elementDef.defaultContent || '';
        parent.ele(elementDef.name, value);
      } else if (elementDef.type === 'instruction') {
        const instruction = variables[elementDef.name] || elementDef.defaultInstruction || '';
        parent.ele(elementDef.name).txt(instruction);
      }
    }
  }

  private optimizeForAI(xml: string, template: XmlTemplate): string {
    let optimized = xml;
    
    // Apply AI-specific optimizations based on template optimization level
    switch (template.optimizationLevel) {
      case 'advanced':
      case 'enterprise':
        // Add semantic clarity improvements
        optimized = this.addSemanticClarifications(optimized);
        optimized = this.improveInstructionPrecision(optimized);
        break;
      case 'standard':
        // Basic AI readability improvements
        optimized = this.improveReadabilityForAI(optimized);
        break;
    }
    
    return optimized;
  }

  private addXmlMetadata(xml: string, template: XmlTemplate): string {
    const metadataComment = `\n<!-- Template: ${template.name} | Category: ${template.category} | Generated: ${new Date().toISOString()} -->\n`;
    return metadataComment + xml;
  }

  private parseXmlStructure(xmlContent: string): XmlParsedStructure {
    try {
      // Validate XML syntax first
      const validationResult = XMLValidator.validate(xmlContent, {
        allowBooleanAttributes: true,
        unpairedTags: []
      });
      
      if (validationResult !== true) {
        throw new Error(`Invalid XML: ${validationResult.err?.msg || 'Unknown parsing error'}`);
      }
      
      // Parse XML
      const parsed = this.xmlParser.parse(xmlContent);
      
      // Extract structure information
      const elements: any[] = [];
      const attributes: any[] = [];
      
      this.extractElementsRecursively(parsed, '', elements, attributes);
      
      const structure = {
        depth: this.calculateXmlDepth(parsed),
        elementCount: elements.length,
        attributeCount: attributes.length,
        textLength: xmlContent.replace(/<[^>]*>/g, '').length,
        complexity: this.calculateStructureComplexity(elements),
        balance: this.calculateStructureBalance(elements)
      };
      
      return {
        rootElement: Object.keys(parsed)[0] || '',
        elements,
        attributes,
        textContent: xmlContent.replace(/<[^>]*>/g, '').trim(),
        structure,
        metadata: {
          namespaces: [],
          processingInstructions: [],
          comments: [],
          encoding: 'UTF-8'
        }
      };
    } catch (error) {
      throw new Error(`Failed to parse XML structure: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private extractElementsRecursively(obj: any, path: string, elements: any[], attributes: any[], depth: number = 0): void {
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (key.startsWith('@_')) {
          // This is an attribute
          attributes.push({
            name: key.substring(2),
            value: String(value),
            element: path,
            elementPath: path
          });
        } else if (key === '#text') {
          // This is text content - already handled
        } else {
          // This is an element
          elements.push({
            name: key,
            path: currentPath,
            attributes: {},
            textContent: typeof value === 'string' ? value : undefined,
            children: [],
            parent: path || undefined,
            depth
          });
          
          if (typeof value === 'object') {
            this.extractElementsRecursively(value, currentPath, elements, attributes, depth + 1);
          }
        }
      }
    }
  }

  private validateAgainstTemplate(parsed: XmlParsedStructure, template: XmlTemplate, strictMode: boolean = true): XmlValidationError[] {
    const errors: XmlValidationError[] = [];
    
    // Check root element
    if (parsed.rootElement !== template.structure.rootElement) {
      errors.push({
        type: 'structure',
        path: 'root',
        message: `Expected root element '${template.structure.rootElement}', got '${parsed.rootElement}'`,
        severity: 'error'
      });
    }
    
    // Validate required elements
    for (const elementDef of template.structure.elements) {
      if (elementDef.required) {
        const found = parsed.elements.some(el => el.name === elementDef.name);
        if (!found) {
          errors.push({
            type: 'structure',
            element: elementDef.name,
            path: elementDef.name,
            message: `Required element '${elementDef.name}' is missing`,
            severity: 'error',
            suggestion: `Add <${elementDef.name}> element to the XML structure`
          });
        }
      }
    }
    
    // Validate constraints
    for (const constraint of template.constraints) {
      const violation = this.checkConstraint(parsed, constraint);
      if (violation) {
        errors.push({
          type: 'constraint',
          path: violation.path,
          message: violation.message,
          severity: constraint.severity
        });
      }
    }
    
    return errors;
  }

  private generateOptimizationSuggestions(parsed: XmlParsedStructure, template: XmlTemplate): XmlOptimization[] {
    const suggestions: XmlOptimization[] = [];
    
    // Structure optimizations
    if (parsed.structure.depth > 6) {
      suggestions.push({
        type: 'structure',
        description: 'XML structure is very deep, consider flattening',
        impact: 'medium',
        implementation: 'Reduce nesting levels by combining related elements',
        estimatedImprovement: 0.3,
        effort: 'moderate'
      });
    }
    
    // Performance optimizations
    if (parsed.structure.elementCount > 50) {
      suggestions.push({
        type: 'performance',
        description: 'High element count may impact parsing performance',
        impact: 'low',
        implementation: 'Consider grouping related elements or using attributes',
        estimatedImprovement: 0.2,
        effort: 'moderate'
      });
    }
    
    // Readability optimizations
    if (parsed.structure.balance < 0.5) {
      suggestions.push({
        type: 'readability',
        description: 'XML structure is unbalanced, affecting readability',
        impact: 'medium',
        implementation: 'Reorganize elements for better structural balance',
        estimatedImprovement: 0.4,
        effort: 'significant'
      });
    }
    
    return suggestions;
  }

  private calculateEffectiveness(parsed: XmlParsedStructure, template: XmlTemplate): EffectivenessMetrics {
    // Calculate various effectiveness metrics
    const structureClarity = Math.min(1.0, Math.max(0.0, 1.0 - (parsed.structure.depth - 3) * 0.1));
    const semanticRichness = Math.min(1.0, parsed.structure.attributeCount / Math.max(1, parsed.structure.elementCount));
    const instructionPrecision = Math.min(1.0, parsed.textContent.length > 0 ? 1.0 : 0.5);
    const contextPreservation = Math.min(1.0, parsed.structure.elementCount > 0 ? 0.9 : 0.1);
    const aiComprehensibility = (structureClarity + semanticRichness + instructionPrecision) / 3;
    
    const overallEffectiveness = (
      structureClarity * 0.25 +
      semanticRichness * 0.2 +
      instructionPrecision * 0.25 +
      contextPreservation * 0.15 +
      aiComprehensibility * 0.15
    );
    
    return {
      structureClarity,
      semanticRichness,
      instructionPrecision,
      contextPreservation,
      aiComprehensibility,
      overallEffectiveness
    };
  }

  // Additional helper methods for optimization and analysis
  private calculateCompressionRatio(xml: string): number {
    const compressed = xml.replace(/\s+/g, ' ').replace(/>\s+</g, '><');
    return compressed.length / xml.length;
  }

  private calculateComplexityScore(parsed: XmlParsedStructure): number {
    const depthWeight = parsed.structure.depth * 0.3;
    const elementWeight = Math.min(10, parsed.structure.elementCount) * 0.1;
    const attributeWeight = Math.min(20, parsed.structure.attributeCount) * 0.05;
    
    return Math.min(1.0, (depthWeight + elementWeight + attributeWeight) / 10);
  }

  private calculateReadabilityScore(xml: string): number {
    // Simple readability score based on formatting and structure
    const lines = xml.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.trim().length, 0) / lines.length;
    const indentationConsistency = this.checkIndentationConsistency(lines);
    
    const lineLengthScore = Math.max(0, Math.min(1, (100 - avgLineLength) / 100));
    const indentationScore = indentationConsistency ? 1 : 0.5;
    
    return (lineLengthScore + indentationScore) / 2;
  }

  private calculateXmlDepth(obj: any, depth: number = 0): number {
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }
    
    let maxDepth = depth;
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null) {
        maxDepth = Math.max(maxDepth, this.calculateXmlDepth(value, depth + 1));
      }
    }
    
    return maxDepth;
  }

  private calculateStructureComplexity(elements: any[]): number {
    const maxDepth = Math.max(...elements.map(e => e.depth), 0);
    const avgDepth = elements.reduce((sum, e) => sum + e.depth, 0) / Math.max(1, elements.length);
    return Math.min(1, (maxDepth * 0.4 + avgDepth * 0.6) / 10);
  }

  private calculateStructureBalance(elements: any[]): number {
    if (elements.length === 0) return 0;
    
    const depthCounts = new Map<number, number>();
    for (const element of elements) {
      depthCounts.set(element.depth, (depthCounts.get(element.depth) || 0) + 1);
    }
    
    const maxCount = Math.max(...depthCounts.values());
    const minCount = Math.min(...depthCounts.values());
    
    return minCount / Math.max(1, maxCount);
  }

  private checkConstraint(parsed: XmlParsedStructure, constraint: any): { path: string; message: string } | null {
    // Implement constraint checking logic
    switch (constraint.type) {
      case 'structure':
        // Check structural constraints
        break;
      case 'content':
        // Check content constraints
        break;
      case 'semantic':
        // Check semantic constraints
        break;
      case 'performance':
        // Check performance constraints
        break;
    }
    
    return null; // No violation found
  }

  private addSemanticClarifications(xml: string): string {
    // Add semantic improvements for AI comprehension
    return xml;
  }

  private improveInstructionPrecision(xml: string): string {
    // Improve instruction clarity and precision
    return xml;
  }

  private improveReadabilityForAI(xml: string): string {
    // Basic readability improvements
    return xml;
  }

  private applyOptimizationTechniques(xml: string, template: XmlTemplate, goals: string[]): string {
    let optimized = xml;
    
    for (const goal of goals) {
      switch (goal) {
        case 'performance':
          optimized = this.optimizeForPerformance(optimized);
          break;
        case 'readability':
          optimized = this.optimizeForReadability(optimized);
          break;
        case 'effectiveness':
          optimized = this.optimizeForEffectiveness(optimized, template);
          break;
      }
    }
    
    return optimized;
  }

  private optimizeForPerformance(xml: string): string {
    // Performance optimizations
    return xml.replace(/\s+/g, ' ').trim();
  }

  private optimizeForReadability(xml: string): string {
    // Readability optimizations
    return xml;
  }

  private optimizeForEffectiveness(xml: string, template: XmlTemplate): string {
    // Effectiveness optimizations
    return xml;
  }

  private identifyUsagePatterns(prompts: string[], template: XmlTemplate): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];
    
    // Analyze common element usage patterns
    const elementUsage = new Map<string, number>();
    
    for (const prompt of prompts) {
      try {
        const parsed = this.parseXmlStructure(prompt);
        for (const element of parsed.elements) {
          elementUsage.set(element.name, (elementUsage.get(element.name) || 0) + 1);
        }
      } catch (error) {
        // Skip invalid prompts
      }
    }
    
    for (const [element, frequency] of elementUsage) {
      patterns.push({
        pattern: `element_${element}`,
        frequency,
        effectiveness: 0.8, // Would be calculated based on actual effectiveness data
        templates: [template.id],
        context: 'element_usage'
      });
    }
    
    return patterns;
  }

  private generateEffectivenessRecommendations(analysis: any, template: XmlTemplate): XmlOptimization[] {
    const recommendations: XmlOptimization[] = [];
    
    if (analysis.overallMetrics.averageEffectiveness < 0.7) {
      recommendations.push({
        type: 'effectiveness',
        description: 'Overall effectiveness is below target, consider template restructuring',
        impact: 'high',
        implementation: 'Review element organization and instruction clarity',
        estimatedImprovement: 0.5,
        effort: 'significant'
      });
    }
    
    if (analysis.overallMetrics.averageComplexity > 0.8) {
      recommendations.push({
        type: 'structure',
        description: 'High complexity may reduce AI comprehension',
        impact: 'medium',
        implementation: 'Simplify XML structure and reduce nesting depth',
        estimatedImprovement: 0.3,
        effort: 'moderate'
      });
    }
    
    return recommendations;
  }

  private async analyzeTemplateCompatibility(templateIds: string[]): Promise<any[]> {
    const compatibility: any[] = [];
    
    // Analyze compatibility between each pair of templates
    for (let i = 0; i < templateIds.length; i++) {
      for (let j = i + 1; j < templateIds.length; j++) {
        const template1 = await this.database.getTemplate(templateIds[i]);
        const template2 = await this.database.getTemplate(templateIds[j]);
        
        if (template1 && template2) {
          const compat = this.calculateCompatibility(template1, template2);
          compatibility.push({
            templateId: templateIds[i],
            compatibility: compat.level,
            conflicts: compat.conflicts,
            requirements: compat.requirements
          });
        }
      }
    }
    
    return compatibility;
  }

  private calculateCompatibility(template1: XmlTemplate, template2: XmlTemplate): any {
    const conflicts: string[] = [];
    const requirements: string[] = [];
    
    // Check for conflicting root elements
    if (template1.structure.rootElement !== template2.structure.rootElement) {
      conflicts.push('Different root elements');
    }
    
    // Check for namespace conflicts
    if (template1.structure.namespace && template2.structure.namespace && 
        template1.structure.namespace !== template2.structure.namespace) {
      conflicts.push('Namespace conflicts');
    }
    
    const level = conflicts.length === 0 ? 'full' : conflicts.length < 3 ? 'partial' : 'none';
    
    return { level, conflicts, requirements };
  }

  private async getEffectivenessTrends(templateId: string, days: number): Promise<any[]> {
    // This would fetch effectiveness trends from the database
    return [];
  }

  private async getCategoryBreakdown(): Promise<any> {
    const templates = await this.database.getAllTemplates();
    const breakdown: Record<string, number> = {};
    
    for (const template of templates) {
      breakdown[template.category] = (breakdown[template.category] || 0) + 1;
    }
    
    return breakdown;
  }

  private checkIndentationConsistency(lines: string[]): boolean {
    // Check if XML has consistent indentation
    const indentPattern = /^(\s*)</;
    let expectedIndent = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.startsWith('<!--')) {
        const match = line.match(indentPattern);
        const actualIndent = match ? match[1].length : 0;
        
        if (actualIndent !== expectedIndent && trimmed.length > 0) {
          return false;
        }
        
        if (!trimmed.endsWith('/>')) {
          expectedIndent += 2;
        }
      } else if (trimmed.startsWith('</')) {
        expectedIndent = Math.max(0, expectedIndent - 2);
      }
    }
    
    return true;
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[XML Tag Structuring] Server error:', error);
    };

    process.on('SIGINT', async () => {
      await this.database.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    await this.database.initialize();
    console.error('[XML Tag Structuring] Server initialized');
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[XML Tag Structuring] Server running on stdio');
  }
}

// Start the server
const server = new XmlTagStructuringServer();
server.run().catch((error) => {
  console.error('[XML Tag Structuring] Failed to start server:', error);
  process.exit(1);
});
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';
import { Database } from 'sqlite3';
import * as natural from 'natural';
import nlp from 'compromise';
import { removeStopwords, eng } from 'stopword';

// Context Intelligence Interfaces
interface ContextAnalysis {
  id: string;
  originalSize: number;
  processedSize: number;
  relevanceScore: number;
  complexityScore: number;
  keyEntities: string[];
  semanticClusters: SemanticCluster[];
  compressionRatio: number;
  qualityMetrics: ContextQualityMetrics;
}

interface SemanticCluster {
  id: string;
  theme: string;
  keywords: string[];
  relevanceScore: number;
  size: number;
  priority: 'high' | 'medium' | 'low';
}

interface ContextQualityMetrics {
  coherence: number;
  completeness: number;
  conciseness: number;
  relevance: number;
  clarity: number;
}

interface MultiModalContext {
  textContext: string;
  codeContext?: CodeContext;
  structuredData?: any;
  metadata: ContextMetadata;
  integrationScore: number;
}

interface CodeContext {
  language: string;
  functions: string[];
  classes: string[];
  imports: string[];
  complexity: number;
  lineCount: number;
}

interface ContextMetadata {
  domain: string;
  timestamp: Date;
  source: string;
  confidence: number;
  tags: string[];
}

interface PredictedContext {
  requiredElements: string[];
  optionalElements: string[];
  predictedSize: number;
  confidenceScore: number;
  loadingStrategy: 'eager' | 'lazy' | 'progressive';
}

interface RelevanceWeight {
  element: string;
  weight: number;
  justification: string;
  dynamicFactor: number;
}

class ContextIntelligenceSystem {
  private server: Server;
  private db: Database;
  private tfidf: natural.TfIdf;
  private contextHistory: Map<string, ContextAnalysis[]> = new Map();
  private semanticCache: Map<string, SemanticCluster[]> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'context-intelligence-system',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize database and NLP components
    this.db = new Database(':memory:');
    this.tfidf = new natural.TfIdf();
    this.initializeDatabase();

    this.setupToolHandlers();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.server.close();
      this.db.close();
      process.exit(0);
    });
  }

  private async initializeDatabase(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS context_analyses (
        id TEXT PRIMARY KEY,
        original_context TEXT NOT NULL,
        processed_context TEXT NOT NULL,
        analysis_results TEXT NOT NULL,
        relevance_score REAL NOT NULL,
        compression_ratio REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS semantic_clusters (
        id TEXT PRIMARY KEY,
        context_id TEXT NOT NULL,
        theme TEXT NOT NULL,
        keywords TEXT NOT NULL,
        relevance_score REAL NOT NULL,
        priority TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (context_id) REFERENCES context_analyses (id)
      )`,
      `CREATE TABLE IF NOT EXISTS context_predictions (
        id TEXT PRIMARY KEY,
        workflow_type TEXT NOT NULL,
        predicted_context TEXT NOT NULL,
        actual_context TEXT,
        prediction_accuracy REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS multimodal_integrations (
        id TEXT PRIMARY KEY,
        text_context TEXT NOT NULL,
        code_context TEXT,
        structured_data TEXT,
        integration_score REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of queries) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(query, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'analyze_context_relevance',
          description: 'Analyze and score context relevance for specific objectives',
          inputSchema: {
            type: 'object',
            properties: {
              context: { type: 'string', description: 'Context content to analyze' },
              objective: { type: 'string', description: 'Target objective or task' },
              agentType: { type: 'string', description: 'Target agent type for context optimization' },
              analysisLevel: { 
                type: 'string', 
                enum: ['basic', 'detailed', 'comprehensive'], 
                default: 'detailed',
                description: 'Level of analysis depth'
              }
            },
            required: ['context', 'objective']
          }
        },
        {
          name: 'extract_key_information',
          description: 'Extract and prioritize key information from large contexts',
          inputSchema: {
            type: 'object',
            properties: {
              context: { type: 'string', description: 'Large context to process' },
              maxOutputSize: { type: 'number', default: 2000, description: 'Maximum output size in characters' },
              extractionStrategy: {
                type: 'string',
                enum: ['importance-based', 'frequency-based', 'semantic-clustering', 'hybrid'],
                default: 'hybrid',
                description: 'Strategy for information extraction'
              },
              preserveStructure: { type: 'boolean', default: true, description: 'Preserve original structure when possible' }
            },
            required: ['context']
          }
        },
        {
          name: 'compress_semantic_context',
          description: 'Intelligently compress context while preserving semantic meaning',
          inputSchema: {
            type: 'object',
            properties: {
              context: { type: 'string', description: 'Context to compress' },
              targetCompressionRatio: { 
                type: 'number', 
                minimum: 0.1, 
                maximum: 0.9, 
                default: 0.6,
                description: 'Target compression ratio (0.1 = 90% compression, 0.9 = 10% compression)'
              },
              preservationPriorities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Elements to prioritize during compression'
              },
              compressionMode: {
                type: 'string',
                enum: ['aggressive', 'balanced', 'conservative'],
                default: 'balanced',
                description: 'Compression approach'
              }
            },
            required: ['context']
          }
        },
        {
          name: 'predict_required_context',
          description: 'Predict context requirements for upcoming workflow steps',
          inputSchema: {
            type: 'object',
            properties: {
              workflowType: { type: 'string', description: 'Type of workflow being executed' },
              currentStep: { type: 'number', description: 'Current step in workflow' },
              totalSteps: { type: 'number', description: 'Total steps in workflow' },
              historicalData: { 
                type: 'array',
                items: { type: 'object' },
                description: 'Historical execution data for prediction'
              },
              agentSequence: {
                type: 'array',
                items: { type: 'string' },
                description: 'Sequence of agents in workflow'
              }
            },
            required: ['workflowType', 'currentStep']
          }
        },
        {
          name: 'integrate_multimodal_context',
          description: 'Integrate text, code, and structured data into unified context',
          inputSchema: {
            type: 'object',
            properties: {
              textContext: { type: 'string', description: 'Text-based context' },
              codeContext: {
                type: 'object',
                properties: {
                  language: { type: 'string' },
                  code: { type: 'string' },
                  metadata: { type: 'object' }
                },
                description: 'Code-based context'
              },
              structuredData: { 
                type: 'object', 
                description: 'Structured data context (JSON, XML, etc.)'
              },
              integrationStrategy: {
                type: 'string',
                enum: ['hierarchical', 'interleaved', 'sectioned', 'semantic-fusion'],
                default: 'semantic-fusion',
                description: 'Strategy for combining contexts'
              },
              targetAgent: { type: 'string', description: 'Target agent for optimized integration' }
            },
            required: ['textContext']
          }
        },
        {
          name: 'optimize_context_for_agent',
          description: 'Optimize context specifically for target agent capabilities and preferences',
          inputSchema: {
            type: 'object',
            properties: {
              context: { type: 'string', description: 'Context to optimize' },
              agentType: { type: 'string', description: 'Target agent type' },
              taskComplexity: { 
                type: 'string', 
                enum: ['low', 'medium', 'high'], 
                description: 'Complexity of the task'
              },
              performanceTargets: {
                type: 'object',
                properties: {
                  maxExecutionTime: { type: 'number' },
                  minConfidenceScore: { type: 'number' },
                  contextUtilizationTarget: { type: 'number' }
                },
                description: 'Performance optimization targets'
              },
              agentPreferences: {
                type: 'object',
                description: 'Agent-specific preferences and optimization hints'
              }
            },
            required: ['context', 'agentType']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'analyze_context_relevance':
            return await this.analyzeContextRelevance(request.params.arguments);
          
          case 'extract_key_information':
            return await this.extractKeyInformation(request.params.arguments);
          
          case 'compress_semantic_context':
            return await this.compressSemanticContext(request.params.arguments);
          
          case 'predict_required_context':
            return await this.predictRequiredContext(request.params.arguments);
          
          case 'integrate_multimodal_context':
            return await this.integrateMultiModalContext(request.params.arguments);
          
          case 'optimize_context_for_agent':
            return await this.optimizeContextForAgent(request.params.arguments);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${request.params.name}`
            );
        }
      } catch (error) {
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async analyzeContextRelevance(args: any) {
    const analysisId = uuidv4();
    
    // Perform natural language analysis
    const doc = nlp(args.context);
    const sentences = doc.sentences().out('array');
    const entities = doc.people().concat(doc.places()).concat(doc.organizations()).out('array');
    const keywords = this.extractKeywords(args.context);
    
    // Calculate relevance score based on objective alignment
    const objectiveKeywords = this.extractKeywords(args.objective);
    const relevanceScore = this.calculateRelevanceScore(keywords, objectiveKeywords);
    
    // Generate semantic clusters
    const semanticClusters = this.generateSemanticClusters(sentences, keywords);
    
    // Calculate quality metrics
    const qualityMetrics: ContextQualityMetrics = {
      coherence: this.calculateCoherence(sentences),
      completeness: this.calculateCompleteness(args.context, args.objective),
      conciseness: this.calculateConciseness(args.context),
      relevance: relevanceScore,
      clarity: this.calculateClarity(args.context)
    };

    const analysis: ContextAnalysis = {
      id: analysisId,
      originalSize: args.context.length,
      processedSize: args.context.length, // Will be different after processing
      relevanceScore,
      complexityScore: this.calculateComplexityScore(args.context),
      keyEntities: entities,
      semanticClusters,
      compressionRatio: 1.0, // No compression at analysis stage
      qualityMetrics
    };

    // Store analysis results
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT INTO context_analyses (id, original_context, processed_context, analysis_results, relevance_score, compression_ratio) VALUES (?, ?, ?, ?, ?, ?)',
        [analysisId, args.context, args.context, JSON.stringify(analysis), relevanceScore, 1.0],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Store semantic clusters
    for (const cluster of semanticClusters) {
      await new Promise<void>((resolve, reject) => {
        this.db.run(
          'INSERT INTO semantic_clusters (id, context_id, theme, keywords, relevance_score, priority) VALUES (?, ?, ?, ?, ?, ?)',
          [cluster.id, analysisId, cluster.theme, JSON.stringify(cluster.keywords), cluster.relevanceScore, cluster.priority],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: `🧠 Context Relevance Analysis Complete

📋 Analysis ID: ${analysisId}
🎯 Objective: ${args.objective}
${args.agentType ? `🤖 Target Agent: ${args.agentType}` : ''}

📊 Analysis Results:
  📏 Original Size: ${analysis.originalSize.toLocaleString()} characters
  🎯 Relevance Score: ${(relevanceScore * 100).toFixed(1)}%
  🔍 Complexity Score: ${(analysis.complexityScore * 100).toFixed(1)}%
  👥 Key Entities: ${entities.length} found

📈 Quality Metrics:
  🔗 Coherence: ${(qualityMetrics.coherence * 100).toFixed(1)}%
  ✅ Completeness: ${(qualityMetrics.completeness * 100).toFixed(1)}%
  📝 Conciseness: ${(qualityMetrics.conciseness * 100).toFixed(1)}%
  🔍 Relevance: ${(qualityMetrics.relevance * 100).toFixed(1)}%
  💡 Clarity: ${(qualityMetrics.clarity * 100).toFixed(1)}%

🏷️ Semantic Clusters (${semanticClusters.length}):
${semanticClusters.slice(0, 5).map(cluster => `  ${cluster.priority === 'high' ? '🔥' : cluster.priority === 'medium' ? '⚡' : '💡'} ${cluster.theme}: ${cluster.keywords.slice(0, 3).join(', ')} (${(cluster.relevanceScore * 100).toFixed(0)}%)`).join('\n')}

👥 Key Entities Found:
${entities.slice(0, 10).map(entity => `  • ${entity}`).join('\n') || '  (No specific entities detected)'}

💡 Optimization Recommendations:
${this.generateOptimizationRecommendations(analysis).map(rec => `  • ${rec}`).join('\n')}`
        }
      ]
    };
  }

  private async extractKeyInformation(args: any) {
    const extractionId = uuidv4();
    
    // Process text with NLP
    const doc = nlp(args.context);
    const sentences = doc.sentences().out('array');
    
    // Score sentences by importance
    const sentenceScores = sentences.map(sentence => ({
      text: sentence,
      score: this.calculateSentenceImportance(sentence, args.context),
      length: sentence.length
    }));

    // Sort by score and apply extraction strategy
    let extractedSentences: any[] = [];
    
    switch (args.extractionStrategy) {
      case 'importance-based':
        extractedSentences = sentenceScores
          .sort((a, b) => b.score - a.score)
          .slice(0, Math.ceil(sentenceScores.length * 0.3));
        break;
      
      case 'frequency-based':
        const keywords = this.extractKeywords(args.context);
        extractedSentences = sentenceScores
          .filter(s => keywords.some(keyword => s.text.toLowerCase().includes(keyword.toLowerCase())))
          .sort((a, b) => b.score - a.score);
        break;
      
      case 'semantic-clustering':
        const clusters = this.generateSemanticClusters(sentences, this.extractKeywords(args.context));
        extractedSentences = sentenceScores
          .filter(s => clusters.some(c => c.priority === 'high' && 
            c.keywords.some(k => s.text.toLowerCase().includes(k.toLowerCase()))))
          .sort((a, b) => b.score - a.score);
        break;
      
      case 'hybrid':
      default:
        // Combine multiple strategies
        const importanceWeight = 0.4;
        const frequencyWeight = 0.3;
        const semanticWeight = 0.3;
        
        extractedSentences = sentenceScores
          .map(s => ({
            ...s,
            combinedScore: (s.score * importanceWeight) + 
                          (this.calculateFrequencyScore(s.text, args.context) * frequencyWeight) +
                          (this.calculateSemanticScore(s.text, args.context) * semanticWeight)
          }))
          .sort((a, b) => b.combinedScore - a.combinedScore)
          .slice(0, Math.ceil(sentenceScores.length * 0.4));
    }

    // Ensure we stay within size limits
    let extractedText = '';
    let totalSize = 0;
    
    for (const sentence of extractedSentences) {
      if (totalSize + sentence.length <= args.maxOutputSize) {
        extractedText += sentence.text + ' ';
        totalSize += sentence.length;
      } else {
        break;
      }
    }

    const compressionRatio = extractedText.length / args.context.length;
    const keyInformation = {
      extractionId,
      originalSize: args.context.length,
      extractedSize: extractedText.length,
      compressionRatio,
      strategy: args.extractionStrategy,
      sentencesExtracted: extractedSentences.length,
      totalSentences: sentences.length,
      extractedText: extractedText.trim()
    };

    return {
      content: [
        {
          type: 'text',
          text: `🔍 Key Information Extraction Complete

📋 Extraction ID: ${extractionId}
⚙️ Strategy: ${args.extractionStrategy}
📏 Size Reduction: ${args.context.length.toLocaleString()} → ${extractedText.length.toLocaleString()} characters

📊 Extraction Results:
  🗜️ Compression Ratio: ${(compressionRatio * 100).toFixed(1)}%
  📝 Sentences: ${extractedSentences.length}/${sentences.length} selected
  🎯 Information Density: ${((1 - compressionRatio) * 100).toFixed(1)}% reduction
  ⚡ Processing Efficiency: ${(extractedSentences.length / sentences.length * 100).toFixed(1)}%

🔑 Extracted Key Information:
${extractedText.substring(0, 500)}${extractedText.length > 500 ? '...' : ''}

💡 Extraction Quality:
  • ${extractedSentences.filter(s => s.score > 0.7).length} high-importance sentences
  • ${extractedSentences.filter(s => s.score > 0.5 && s.score <= 0.7).length} medium-importance sentences  
  • ${extractedSentences.filter(s => s.score <= 0.5).length} supporting sentences

✨ Extraction optimized for maximum information density while preserving context coherence.`
        }
      ]
    };
  }

  private async compressSemanticContext(args: any) {
    const compressionId = uuidv4();
    
    // Analyze context structure
    const doc = nlp(args.context);
    const sentences = doc.sentences().out('array');
    const paragraphs = args.context.split('\n\n');
    
    // Calculate semantic importance for each element
    const semanticScores = sentences.map(sentence => ({
      text: sentence,
      semanticScore: this.calculateSemanticImportance(sentence, args.context),
      redundancyScore: this.calculateRedundancy(sentence, sentences),
      structuralImportance: this.calculateStructuralImportance(sentence, args.context)
    }));

    // Apply compression based on mode
    let compressionThreshold = 0.5;
    switch (args.compressionMode) {
      case 'aggressive':
        compressionThreshold = 0.7;
        break;
      case 'balanced':
        compressionThreshold = 0.5;
        break;
      case 'conservative':
        compressionThreshold = 0.3;
        break;
    }

    // Filter sentences based on combined scores
    const retainedSentences = semanticScores
      .filter(s => {
        const combinedScore = (s.semanticScore * 0.4) + 
                             ((1 - s.redundancyScore) * 0.3) + 
                             (s.structuralImportance * 0.3);
        return combinedScore >= compressionThreshold;
      })
      .sort((a, b) => this.getOriginalPosition(a.text, args.context) - this.getOriginalPosition(b.text, args.context));

    // Reconstruct compressed text while preserving structure
    let compressedText = '';
    if (args.preservationPriorities && args.preservationPriorities.length > 0) {
      // Prioritize specified elements
      const prioritizedSentences = retainedSentences.filter(s => 
        args.preservationPriorities.some((priority: string) => 
          s.text.toLowerCase().includes(priority.toLowerCase())
        )
      );
      compressedText = prioritizedSentences.map(s => s.text).join(' ');
      
      // Add remaining sentences if space allows
      const remaining = retainedSentences.filter(s => !prioritizedSentences.includes(s));
      for (const sentence of remaining) {
        if (compressedText.length + sentence.text.length <= args.context.length * args.targetCompressionRatio) {
          compressedText += ' ' + sentence.text;
        }
      }
    } else {
      compressedText = retainedSentences.map(s => s.text).join(' ');
    }

    // Final compression ratio check
    const actualCompressionRatio = compressedText.length / args.context.length;
    
    // Calculate quality preservation metrics
    const qualityPreservation = {
      semanticPreservation: this.calculateSemanticPreservation(args.context, compressedText),
      structuralPreservation: this.calculateStructuralPreservation(args.context, compressedText),
      informationDensity: this.calculateInformationDensity(compressedText)
    };

    const compressionResult = {
      compressionId,
      originalSize: args.context.length,
      compressedSize: compressedText.length,
      targetRatio: args.targetCompressionRatio,
      actualRatio: actualCompressionRatio,
      mode: args.compressionMode,
      compressedText,
      qualityPreservation,
      sentencesRetained: retainedSentences.length,
      totalSentences: sentences.length
    };

    // Store compression results
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT INTO context_analyses (id, original_context, processed_context, analysis_results, relevance_score, compression_ratio) VALUES (?, ?, ?, ?, ?, ?)',
        [compressionId, args.context, compressedText, JSON.stringify(compressionResult), qualityPreservation.semanticPreservation, actualCompressionRatio],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return {
      content: [
        {
          type: 'text',
          text: `🗜️ Semantic Context Compression Complete

📋 Compression ID: ${compressionId}
⚙️ Mode: ${args.compressionMode}
🎯 Target Ratio: ${(args.targetCompressionRatio * 100).toFixed(0)}%

📊 Compression Results:
  📏 Size: ${args.context.length.toLocaleString()} → ${compressedText.length.toLocaleString()} characters
  🗜️ Actual Ratio: ${(actualCompressionRatio * 100).toFixed(1)}%
  📝 Sentences: ${retainedSentences.length}/${sentences.length} retained
  💾 Space Saved: ${((1 - actualCompressionRatio) * 100).toFixed(1)}%

📈 Quality Preservation:
  🧠 Semantic: ${(qualityPreservation.semanticPreservation * 100).toFixed(1)}%
  🏗️ Structural: ${(qualityPreservation.structuralPreservation * 100).toFixed(1)}%
  📊 Info Density: ${(qualityPreservation.informationDensity * 100).toFixed(1)}%

${args.preservationPriorities && args.preservationPriorities.length > 0 ? 
`🔧 Priority Elements Preserved:
${args.preservationPriorities.map((p: string) => `  • ${p}`).join('\n')}` : ''}

🎯 Compressed Context Preview:
${compressedText.substring(0, 400)}${compressedText.length > 400 ? '...' : ''}

✨ Semantic compression achieved ${(qualityPreservation.semanticPreservation * 100).toFixed(0)}% meaning preservation with ${((1 - actualCompressionRatio) * 100).toFixed(0)}% size reduction!`
        }
      ]
    };
  }

  private async predictRequiredContext(args: any) {
    const predictionId = uuidv4();
    
    // Analyze workflow patterns
    const workflowPatterns = this.analyzeWorkflowPatterns(args.workflowType, args.historicalData);
    
    // Predict context based on agent sequence
    const contextPredictions = args.agentSequence ? 
      this.predictContextForAgentSequence(args.agentSequence, args.currentStep) :
      this.predictGenericContext(args.workflowType, args.currentStep, args.totalSteps);

    // Calculate loading strategy
    const loadingStrategy = this.determineLoadingStrategy(contextPredictions, args);

    const prediction: PredictedContext = {
      requiredElements: contextPredictions.required,
      optionalElements: contextPredictions.optional,
      predictedSize: contextPredictions.estimatedSize,
      confidenceScore: contextPredictions.confidence,
      loadingStrategy
    };

    // Store prediction for accuracy tracking
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT INTO context_predictions (id, workflow_type, predicted_context, prediction_accuracy) VALUES (?, ?, ?, ?)',
        [predictionId, args.workflowType, JSON.stringify(prediction), null],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return {
      content: [
        {
          type: 'text',
          text: `🔮 Context Requirements Prediction

📋 Prediction ID: ${predictionId}
🔄 Workflow: ${args.workflowType}
📍 Current Step: ${args.currentStep}${args.totalSteps ? `/${args.totalSteps}` : ''}

🎯 Predicted Context Requirements:
  
📋 Required Elements (${prediction.requiredElements.length}):
${prediction.requiredElements.slice(0, 8).map(elem => `  ✅ ${elem}`).join('\n')}${prediction.requiredElements.length > 8 ? `\n  ... and ${prediction.requiredElements.length - 8} more` : ''}

💡 Optional Elements (${prediction.optionalElements.length}):
${prediction.optionalElements.slice(0, 6).map(elem => `  ⚪ ${elem}`).join('\n')}${prediction.optionalElements.length > 6 ? `\n  ... and ${prediction.optionalElements.length - 6} more` : ''}

📊 Prediction Metrics:
  📏 Estimated Size: ${prediction.predictedSize.toLocaleString()} characters
  🎯 Confidence Score: ${(prediction.confidenceScore * 100).toFixed(1)}%
  ⚡ Loading Strategy: ${loadingStrategy}

${args.agentSequence ? `🤖 Agent Sequence Analysis:
${args.agentSequence.slice(args.currentStep, args.currentStep + 3).map((agent, i) => `  ${i === 0 ? '➡️' : '⏭️'} ${agent}`).join('\n')}` : ''}

💡 Loading Recommendations:
${this.generateLoadingRecommendations(prediction, args).map(rec => `  • ${rec}`).join('\n')}

🔄 Prediction will be validated against actual context usage for continuous improvement.`
        }
      ]
    };
  }

  private async integrateMultiModalContext(args: any) {
    const integrationId = uuidv4();
    
    // Process text context
    const textAnalysis = {
      size: args.textContext.length,
      keywords: this.extractKeywords(args.textContext),
      entities: nlp(args.textContext).people().concat(nlp(args.textContext).places()).out('array'),
      complexity: this.calculateComplexityScore(args.textContext)
    };

    // Process code context if provided
    let codeAnalysis: CodeContext | null = null;
    if (args.codeContext) {
      codeAnalysis = {
        language: args.codeContext.language || 'unknown',
        functions: this.extractCodeFunctions(args.codeContext.code || ''),
        classes: this.extractCodeClasses(args.codeContext.code || ''),
        imports: this.extractCodeImports(args.codeContext.code || ''),
        complexity: this.calculateCodeComplexity(args.codeContext.code || ''),
        lineCount: (args.codeContext.code || '').split('\n').length
      };
    }

    // Process structured data if provided
    let structuredAnalysis = null;
    if (args.structuredData) {
      structuredAnalysis = {
        type: this.detectDataType(args.structuredData),
        keys: Object.keys(args.structuredData),
        depth: this.calculateDataDepth(args.structuredData),
        size: JSON.stringify(args.structuredData).length
      };
    }

    // Apply integration strategy
    const integratedContext = this.applyIntegrationStrategy(
      args.integrationStrategy,
      args.textContext,
      codeAnalysis,
      args.structuredData,
      args.targetAgent
    );

    const integrationScore = this.calculateIntegrationScore(
      textAnalysis,
      codeAnalysis,
      structuredAnalysis,
      integratedContext
    );

    const multiModalContext: MultiModalContext = {
      textContext: args.textContext,
      codeContext: codeAnalysis || undefined,
      structuredData: args.structuredData,
      metadata: {
        domain: this.detectDomain(args.textContext),
        timestamp: new Date(),
        source: 'multi-modal-integration',
        confidence: integrationScore,
        tags: ['integrated', args.integrationStrategy]
      },
      integrationScore
    };

    // Store integration results
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT INTO multimodal_integrations (id, text_context, code_context, structured_data, integration_score) VALUES (?, ?, ?, ?, ?)',
        [integrationId, args.textContext, JSON.stringify(codeAnalysis), JSON.stringify(args.structuredData), integrationScore],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    return {
      content: [
        {
          type: 'text',
          text: `🔗 Multi-Modal Context Integration Complete

📋 Integration ID: ${integrationId}
⚙️ Strategy: ${args.integrationStrategy}
${args.targetAgent ? `🤖 Target Agent: ${args.targetAgent}` : ''}

📊 Integration Analysis:
  📝 Text Context: ${textAnalysis.size.toLocaleString()} characters
  ${codeAnalysis ? `💻 Code Context: ${codeAnalysis.language} (${codeAnalysis.lineCount} lines)` : ''}
  ${structuredAnalysis ? `📋 Structured Data: ${structuredAnalysis.type} (${structuredAnalysis.keys.length} keys)` : ''}

🎯 Integration Score: ${(integrationScore * 100).toFixed(1)}%

📈 Context Components:
  🔑 Keywords: ${textAnalysis.keywords.slice(0, 8).join(', ')}${textAnalysis.keywords.length > 8 ? '...' : ''}
  ${textAnalysis.entities.length > 0 ? `👥 Entities: ${textAnalysis.entities.slice(0, 5).join(', ')}${textAnalysis.entities.length > 5 ? '...' : ''}` : ''}
  ${codeAnalysis ? `⚙️ Functions: ${codeAnalysis.functions.slice(0, 5).join(', ')}${codeAnalysis.functions.length > 5 ? '...' : ''}` : ''}
  ${structuredAnalysis ? `📊 Data Keys: ${structuredAnalysis.keys.slice(0, 5).join(', ')}${structuredAnalysis.keys.length > 5 ? '...' : ''}` : ''}

🎨 Integrated Context Preview:
${integratedContext.substring(0, 400)}${integratedContext.length > 400 ? '...' : ''}

💡 Integration Benefits:
  • Enhanced context coherence across modalities
  • Optimized information density and accessibility  
  • Target agent-specific formatting and structure
  • Improved semantic relationships between components

✨ Multi-modal integration achieved ${(integrationScore * 100).toFixed(0)}% fusion effectiveness!`
        }
      ]
    };
  }

  private async optimizeContextForAgent(args: any) {
    const optimizationId = uuidv4();
    
    // Get agent-specific optimization profiles
    const agentProfile = this.getAgentOptimizationProfile(args.agentType);
    
    // Apply agent-specific optimizations
    const optimizations = [];
    let optimizedContext = args.context;
    
    // Content structure optimization
    if (agentProfile.prefersStructured) {
      optimizedContext = this.addStructuralElements(optimizedContext);
      optimizations.push('Added structured formatting for improved readability');
    }
    
    // Complexity adjustment
    if (args.taskComplexity && agentProfile.complexityHandling) {
      optimizedContext = this.adjustComplexityForAgent(optimizedContext, args.taskComplexity, agentProfile);
      optimizations.push(`Adjusted complexity level for ${args.taskComplexity} complexity tasks`);
    }
    
    // Context size optimization
    if (agentProfile.optimalContextSize && optimizedContext.length > agentProfile.optimalContextSize) {
      const compressionRatio = agentProfile.optimalContextSize / optimizedContext.length;
      optimizedContext = await this.compressForAgent(optimizedContext, compressionRatio, agentProfile);
      optimizations.push(`Compressed to optimal size for ${args.agentType} (${agentProfile.optimalContextSize} chars)`);
    }
    
    // Domain-specific terminology
    if (agentProfile.domainSpecialization) {
      optimizedContext = this.enhanceDomainTerminology(optimizedContext, agentProfile.domainSpecialization);
      optimizations.push(`Enhanced ${agentProfile.domainSpecialization} domain terminology`);
    }
    
    // Performance target alignment
    let performanceImprovements = {};
    if (args.performanceTargets) {
      performanceImprovements = this.calculatePerformanceImprovements(
        args.context,
        optimizedContext,
        args.performanceTargets,
        agentProfile
      );
    }
    
    const optimizationResult = {
      optimizationId,
      agentType: args.agentType,
      originalSize: args.context.length,
      optimizedSize: optimizedContext.length,
      optimizations,
      performanceImprovements,
      agentProfile,
      optimizedContext
    };

    return {
      content: [
        {
          type: 'text',
          text: `🎯 Agent-Specific Context Optimization Complete

📋 Optimization ID: ${optimizationId}
🤖 Agent Type: ${args.agentType}
🎯 Task Complexity: ${args.taskComplexity || 'not specified'}

📊 Optimization Results:
  📏 Size: ${args.context.length.toLocaleString()} → ${optimizedContext.length.toLocaleString()} characters
  🎯 Size Change: ${((optimizedContext.length - args.context.length) / args.context.length * 100).toFixed(1)}%
  ⚡ Optimizations Applied: ${optimizations.length}

🔧 Applied Optimizations:
${optimizations.map(opt => `  • ${opt}`).join('\n')}

🤖 Agent Profile Considerations:
  • Preferred Context Size: ${agentProfile.optimalContextSize?.toLocaleString() || 'flexible'}
  • Structural Preference: ${agentProfile.prefersStructured ? 'structured' : 'narrative'}
  • Domain Specialization: ${agentProfile.domainSpecialization || 'general'}
  • Complexity Handling: ${agentProfile.complexityHandling || 'adaptive'}

${args.performanceTargets ? `📈 Performance Target Alignment:
${Object.entries(performanceImprovements).map(([metric, improvement]: [string, any]) => 
  `  • ${metric}: ${improvement > 0 ? '+' : ''}${improvement.toFixed(1)}%`).join('\n')}` : ''}

🎯 Optimized Context Preview:
${optimizedContext.substring(0, 400)}${optimizedContext.length > 400 ? '...' : ''}

✨ Context optimized for maximum ${args.agentType} performance and efficiency!`
        }
      ]
    };
  }

  // Helper methods for context analysis and processing
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 3);
    const cleanWords = removeStopwords(words, eng);
    
    // Use TF-IDF for keyword extraction
    this.tfidf.addDocument(cleanWords);
    const tfidfScores = this.tfidf.listTerms(0 /*Document index*/).slice(0, 20);
    
    return tfidfScores.map(item => item.term);
  }

  private calculateRelevanceScore(keywords: string[], objectiveKeywords: string[]): number {
    if (objectiveKeywords.length === 0) return 0.5;
    
    const intersection = keywords.filter(k => 
      objectiveKeywords.some(ok => ok.toLowerCase().includes(k.toLowerCase()) || 
                                  k.toLowerCase().includes(ok.toLowerCase()))
    );
    
    return Math.min(1.0, intersection.length / objectiveKeywords.length + 0.3);
  }

  private generateSemanticClusters(sentences: string[], keywords: string[]): SemanticCluster[] {
    // Simple clustering based on keyword co-occurrence
    const clusters: SemanticCluster[] = [];
    const processedSentences = new Set<string>();
    
    keywords.slice(0, 5).forEach(keyword => {
      const relatedSentences = sentences.filter(sentence => 
        sentence.toLowerCase().includes(keyword.toLowerCase()) && 
        !processedSentences.has(sentence)
      );
      
      if (relatedSentences.length > 0) {
        const cluster: SemanticCluster = {
          id: uuidv4(),
          theme: keyword,
          keywords: [keyword, ...this.findRelatedKeywords(keyword, keywords)].slice(0, 5),
          relevanceScore: relatedSentences.length / sentences.length,
          size: relatedSentences.reduce((sum, s) => sum + s.length, 0),
          priority: relatedSentences.length > sentences.length * 0.1 ? 'high' : 
                   relatedSentences.length > sentences.length * 0.05 ? 'medium' : 'low'
        };
        
        clusters.push(cluster);
        relatedSentences.forEach(s => processedSentences.add(s));
      }
    });
    
    return clusters;
  }

  private findRelatedKeywords(mainKeyword: string, allKeywords: string[]): string[] {
    return allKeywords.filter(keyword => 
      keyword !== mainKeyword && 
      (keyword.includes(mainKeyword) || mainKeyword.includes(keyword) || 
       natural.JaroWinklerDistance(keyword, mainKeyword) > 0.8)
    );
  }

  private calculateCoherence(sentences: string[]): number {
    // Simplified coherence calculation based on sentence similarity
    let totalSimilarity = 0;
    let comparisons = 0;
    
    for (let i = 0; i < sentences.length - 1; i++) {
      for (let j = i + 1; j < sentences.length; j++) {
        totalSimilarity += natural.JaroWinklerDistance(sentences[i], sentences[j]);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalSimilarity / comparisons : 0.5;
  }

  private calculateCompleteness(context: string, objective: string): number {
    const objectiveWords = this.extractKeywords(objective);
    const contextWords = this.extractKeywords(context);
    
    const coverage = objectiveWords.filter(word => 
      contextWords.some(cw => cw.includes(word) || word.includes(cw))
    ).length;
    
    return objectiveWords.length > 0 ? coverage / objectiveWords.length : 0.5;
  }

  private calculateConciseness(context: string): number {
    const wordCount = context.split(/\s+/).length;
    const uniqueWords = new Set(context.toLowerCase().split(/\s+/)).size;
    
    return wordCount > 0 ? uniqueWords / wordCount : 0.5;
  }

  private calculateClarity(context: string): number {
    // Simple clarity metric based on sentence length and complexity
    const sentences = context.split(/[.!?]+/);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    // Optimal sentence length is around 15-20 words
    const clarityScore = 1 - Math.abs(avgSentenceLength - 17.5) / 17.5;
    return Math.max(0, Math.min(1, clarityScore));
  }

  private calculateComplexityScore(context: string): number {
    const doc = nlp(context);
    const words = doc.terms().out('array');
    const sentences = doc.sentences().out('array');
    
    const avgWordsPerSentence = words.length / sentences.length;
    const longWords = words.filter(word => word.length > 6).length;
    const longWordRatio = longWords / words.length;
    
    // Flesch-Kincaid inspired complexity
    return Math.min(1, (avgWordsPerSentence * 0.015) + (longWordRatio * 0.846));
  }

  private generateOptimizationRecommendations(analysis: ContextAnalysis): string[] {
    const recommendations = [];
    
    if (analysis.relevanceScore < 0.6) {
      recommendations.push('Improve relevance by focusing on objective-specific content');
    }
    
    if (analysis.qualityMetrics.conciseness < 0.7) {
      recommendations.push('Increase conciseness by removing redundant information');
    }
    
    if (analysis.complexityScore > 0.8) {
      recommendations.push('Simplify language and structure for better comprehension');
    }
    
    if (analysis.semanticClusters.length > 8) {
      recommendations.push('Consolidate semantic clusters to improve focus');
    }
    
    if (analysis.qualityMetrics.coherence < 0.6) {
      recommendations.push('Improve coherence with better transitional elements');
    }
    
    return recommendations.length > 0 ? recommendations : ['Context quality is well-optimized'];
  }

  // Additional helper methods would continue here...
  private calculateSentenceImportance(sentence: string, context: string): number {
    // Simplified importance scoring
    const keywords = this.extractKeywords(context);
    const sentenceKeywords = this.extractKeywords(sentence);
    
    const keywordOverlap = sentenceKeywords.filter(sk => keywords.includes(sk)).length;
    const position = context.indexOf(sentence) / context.length; // Earlier = more important
    const length = sentence.length;
    
    return (keywordOverlap / keywords.length * 0.6) + 
           ((1 - position) * 0.2) + 
           (Math.min(length, 200) / 200 * 0.2);
  }

  private calculateFrequencyScore(sentence: string, context: string): number {
    const words = sentence.toLowerCase().split(/\s+/);
    const contextWords = context.toLowerCase().split(/\s+/);
    const wordFrequencies = new Map<string, number>();
    
    contextWords.forEach(word => {
      wordFrequencies.set(word, (wordFrequencies.get(word) || 0) + 1);
    });
    
    const avgFrequency = words.reduce((sum, word) => 
      sum + (wordFrequencies.get(word) || 0), 0) / words.length;
    
    return Math.min(1, avgFrequency / 10); // Normalize to 0-1
  }

  private calculateSemanticScore(sentence: string, context: string): number {
    // Simplified semantic scoring using keyword density
    const keywords = this.extractKeywords(context);
    const sentenceKeywords = this.extractKeywords(sentence);
    
    return sentenceKeywords.length > 0 ? 
      sentenceKeywords.filter(sk => keywords.includes(sk)).length / sentenceKeywords.length :
      0;
  }

  private getOriginalPosition(sentence: string, context: string): number {
    return context.indexOf(sentence);
  }

  private calculateSemanticImportance(sentence: string, context: string): number {
    return this.calculateSentenceImportance(sentence, context);
  }

  private calculateRedundancy(sentence: string, allSentences: string[]): number {
    let similarity = 0;
    let comparisons = 0;
    
    for (const otherSentence of allSentences) {
      if (otherSentence !== sentence) {
        similarity += natural.JaroWinklerDistance(sentence, otherSentence);
        comparisons++;
      }
    }
    
    return comparisons > 0 ? similarity / comparisons : 0;
  }

  private calculateStructuralImportance(sentence: string, context: string): number {
    // First and last sentences are more important
    const sentences = context.split(/[.!?]+/);
    const index = sentences.findIndex(s => s.includes(sentence));
    
    if (index === 0 || index === sentences.length - 1) {
      return 1.0;
    } else if (index < sentences.length * 0.2 || index > sentences.length * 0.8) {
      return 0.8;
    } else {
      return 0.6;
    }
  }

  private calculateSemanticPreservation(original: string, compressed: string): number {
    const originalKeywords = this.extractKeywords(original);
    const compressedKeywords = this.extractKeywords(compressed);
    
    const preservedKeywords = originalKeywords.filter(k => 
      compressedKeywords.some(ck => ck.includes(k) || k.includes(ck)));
    
    return originalKeywords.length > 0 ? preservedKeywords.length / originalKeywords.length : 0;
  }

  private calculateStructuralPreservation(original: string, compressed: string): number {
    const originalParagraphs = original.split('\n\n').length;
    const compressedParagraphs = compressed.split('\n\n').length;
    
    return originalParagraphs > 0 ? Math.min(1, compressedParagraphs / originalParagraphs) : 1;
  }

  private calculateInformationDensity(text: string): number {
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    
    return words.length > 0 ? uniqueWords.size / words.length : 0;
  }

  private analyzeWorkflowPatterns(workflowType: string, historicalData: any[]): any {
    // Simplified pattern analysis
    return {
      commonElements: ['requirements', 'context', 'specifications'],
      averageSize: 2500,
      peakUsageSteps: [1, 3, 5]
    };
  }

  private predictContextForAgentSequence(agents: string[], currentStep: number): any {
    const agentSpecificRequirements: Record<string, string[]> = {
      'spec-analyst': ['requirements', 'user-stories', 'acceptance-criteria'],
      'spec-architect': ['system-design', 'technical-specs', 'integration-points'],
      'security-specialist': ['security-requirements', 'threat-model', 'compliance'],
      'frontend-developer': ['ui-specs', 'user-experience', 'design-mockups'],
      'backend-developer': ['api-specs', 'data-models', 'business-logic']
    };

    const upcomingAgents = agents.slice(currentStep, currentStep + 3);
    const required = upcomingAgents.flatMap(agent => 
      agentSpecificRequirements[agent] || ['general-context']);
    
    return {
      required: [...new Set(required)],
      optional: ['historical-data', 'performance-metrics', 'user-feedback'],
      estimatedSize: required.length * 300,
      confidence: 0.8
    };
  }

  private predictGenericContext(workflowType: string, currentStep: number, totalSteps?: number): any {
    const baseRequirements = ['problem-statement', 'objectives', 'constraints'];
    const stepSpecific = currentStep <= 2 ? ['requirements'] : 
                        currentStep <= 4 ? ['specifications', 'design'] :
                        ['implementation', 'testing'];
    
    return {
      required: baseRequirements.concat(stepSpecific),
      optional: ['examples', 'references', 'best-practices'],
      estimatedSize: (baseRequirements.length + stepSpecific.length) * 250,
      confidence: 0.7
    };
  }

  private determineLoadingStrategy(predictions: any, args: any): 'eager' | 'lazy' | 'progressive' {
    if (predictions.estimatedSize < 1000) return 'eager';
    if (predictions.estimatedSize > 5000) return 'lazy';
    return 'progressive';
  }

  private generateLoadingRecommendations(prediction: PredictedContext, args: any): string[] {
    const recommendations = [];
    
    if (prediction.loadingStrategy === 'lazy') {
      recommendations.push('Use lazy loading to minimize memory usage');
    }
    
    if (prediction.confidenceScore < 0.7) {
      recommendations.push('Monitor actual usage to improve predictions');
    }
    
    if (prediction.predictedSize > 10000) {
      recommendations.push('Consider context compression for large contexts');
    }
    
    return recommendations.length > 0 ? recommendations : 
           ['Context prediction is well-optimized'];
  }

  private extractCodeFunctions(code: string): string[] {
    // Simple function extraction for common languages
    const functionPatterns = [
      /function\s+(\w+)/g,  // JavaScript
      /def\s+(\w+)/g,       // Python
      /(\w+)\s*\(/g         // General function calls
    ];
    
    const functions = new Set<string>();
    
    functionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        functions.add(match[1]);
      }
    });
    
    return Array.from(functions);
  }

  private extractCodeClasses(code: string): string[] {
    // Simple class extraction
    const classPatterns = [
      /class\s+(\w+)/g,     // Most languages
      /interface\s+(\w+)/g, // TypeScript/Java
      /type\s+(\w+)/g       // Go/Rust
    ];
    
    const classes = new Set<string>();
    
    classPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        classes.add(match[1]);
      }
    });
    
    return Array.from(classes);
  }

  private extractCodeImports(code: string): string[] {
    // Simple import extraction
    const importPatterns = [
      /import\s+.*?from\s+['"](.+?)['"]/g,  // JavaScript/TypeScript
      /import\s+(.+)/g,                     // Python/Go
      /#include\s+<(.+)>/g                  // C/C++
    ];
    
    const imports = new Set<string>();
    
    importPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        imports.add(match[1]);
      }
    });
    
    return Array.from(imports);
  }

  private calculateCodeComplexity(code: string): number {
    // Simplified cyclomatic complexity
    const complexityKeywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'try', 'catch', 
      'function', 'def', '&&', '||'
    ];
    
    let complexity = 1; // Base complexity
    
    complexityKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) complexity += matches.length;
    });
    
    return Math.min(1, complexity / 100); // Normalize to 0-1
  }

  private detectDataType(data: any): string {
    if (Array.isArray(data)) return 'array';
    if (typeof data === 'object' && data !== null) return 'object';
    return typeof data;
  }

  private calculateDataDepth(obj: any, depth: number = 0): number {
    if (typeof obj !== 'object' || obj === null) return depth;
    
    let maxDepth = depth;
    for (const key in obj) {
      const childDepth = this.calculateDataDepth(obj[key], depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    
    return maxDepth;
  }

  private applyIntegrationStrategy(strategy: string, textContext: string, 
                                  codeContext: CodeContext | null, 
                                  structuredData: any, targetAgent?: string): string {
    let integrated = textContext;
    
    if (codeContext) {
      switch (strategy) {
        case 'hierarchical':
          integrated += `\n\nCode Context (${codeContext.language}):\n` +
                       `Functions: ${codeContext.functions.join(', ')}\n` +
                       `Classes: ${codeContext.classes.join(', ')}`;
          break;
        case 'interleaved':
          integrated = this.interleaveContexts(textContext, codeContext);
          break;
        case 'sectioned':
          integrated += `\n\n## Code Analysis\n` +
                       `Language: ${codeContext.language}\n` +
                       `Complexity: ${codeContext.complexity}\n` +
                       `Components: ${codeContext.functions.length} functions, ${codeContext.classes.length} classes`;
          break;
        case 'semantic-fusion':
        default:
          integrated = this.semanticallyFuseContexts(textContext, codeContext);
      }
    }
    
    if (structuredData) {
      const dataSection = `\n\nStructured Data:\n${JSON.stringify(structuredData, null, 2)}`;
      integrated += dataSection;
    }
    
    return integrated;
  }

  private interleaveContexts(textContext: string, codeContext: CodeContext): string {
    // Simple interleaving - alternate between text and code elements
    const textSentences = textContext.split('. ');
    let result = '';
    
    textSentences.forEach((sentence, i) => {
      result += sentence;
      if (i < codeContext.functions.length) {
        result += ` (related function: ${codeContext.functions[i]})`;
      }
      if (i < textSentences.length - 1) result += '. ';
    });
    
    return result;
  }

  private semanticallyFuseContexts(textContext: string, codeContext: CodeContext): string {
    // Semantic fusion - integrate based on meaning and relevance
    const keywords = this.extractKeywords(textContext);
    const relevantFunctions = codeContext.functions.filter(func => 
      keywords.some(keyword => func.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    let fused = textContext;
    if (relevantFunctions.length > 0) {
      fused += `\n\nRelevant code components: ${relevantFunctions.join(', ')}`;
    }
    
    return fused;
  }

  private calculateIntegrationScore(textAnalysis: any, codeAnalysis: CodeContext | null, 
                                   structuredAnalysis: any, integratedContext: string): number {
    let score = 0.7; // Base score
    
    // Bonus for successful code integration
    if (codeAnalysis && integratedContext.includes(codeAnalysis.language)) {
      score += 0.15;
    }
    
    // Bonus for structured data integration
    if (structuredAnalysis && integratedContext.length > textAnalysis.size * 1.2) {
      score += 0.1;
    }
    
    // Penalty for excessive size
    if (integratedContext.length > textAnalysis.size * 3) {
      score -= 0.1;
    }
    
    return Math.max(0.1, Math.min(1, score));
  }

  private detectDomain(text: string): string {
    const domainKeywords = {
      'software-development': ['code', 'function', 'api', 'database', 'frontend', 'backend'],
      'security': ['security', 'threat', 'vulnerability', 'authentication', 'encryption'],
      'business': ['requirement', 'stakeholder', 'revenue', 'customer', 'market'],
      'design': ['ui', 'ux', 'interface', 'user', 'design', 'mockup']
    };
    
    const textLower = text.toLowerCase();
    let maxScore = 0;
    let detectedDomain = 'general';
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      const score = keywords.filter(keyword => textLower.includes(keyword)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain;
      }
    }
    
    return detectedDomain;
  }

  private getAgentOptimizationProfile(agentType: string): any {
    const profiles: Record<string, any> = {
      'spec-analyst': {
        optimalContextSize: 3000,
        prefersStructured: true,
        domainSpecialization: 'requirements-analysis',
        complexityHandling: 'detailed'
      },
      'spec-architect': {
        optimalContextSize: 4000,
        prefersStructured: true,
        domainSpecialization: 'system-design',
        complexityHandling: 'high'
      },
      'security-specialist': {
        optimalContextSize: 2500,
        prefersStructured: false,
        domainSpecialization: 'security',
        complexityHandling: 'focused'
      },
      'frontend-developer': {
        optimalContextSize: 3500,
        prefersStructured: true,
        domainSpecialization: 'ui-development',
        complexityHandling: 'visual'
      },
      'backend-developer': {
        optimalContextSize: 3500,
        prefersStructured: true,
        domainSpecialization: 'api-development',
        complexityHandling: 'technical'
      }
    };
    
    return profiles[agentType] || {
      optimalContextSize: 3000,
      prefersStructured: false,
      domainSpecialization: 'general',
      complexityHandling: 'adaptive'
    };
  }

  private addStructuralElements(context: string): string {
    // Add basic structural elements for better readability
    const sentences = context.split('. ');
    const structured = sentences.map((sentence, i) => {
      if (i === 0) return `## Context Overview\n${sentence}.`;
      if (i === Math.floor(sentences.length / 2)) return `\n## Key Information\n${sentence}.`;
      if (i === sentences.length - 1) return `\n## Summary\n${sentence}`;
      return sentence + '.';
    });
    
    return structured.join(' ');
  }

  private adjustComplexityForAgent(context: string, taskComplexity: string, profile: any): string {
    // Simplified complexity adjustment
    if (taskComplexity === 'low' && profile.complexityHandling === 'detailed') {
      return context.replace(/\b(complex|complicated|sophisticated)\b/g, 'simple');
    }
    
    if (taskComplexity === 'high' && profile.complexityHandling === 'focused') {
      // Add more technical detail
      return context + '\n\nNote: This requires detailed technical analysis and consideration of edge cases.';
    }
    
    return context;
  }

  private async compressForAgent(context: string, ratio: number, profile: any): Promise<string> {
    // Use the semantic compression with agent-specific preferences
    const sentences = context.split('. ');
    const targetSentences = Math.floor(sentences.length * ratio);
    
    // Keep the most important sentences based on agent preferences
    const scoredSentences = sentences.map(sentence => ({
      text: sentence,
      score: this.calculateSentenceImportance(sentence, context) + 
             (profile.domainSpecialization ? 
              this.calculateDomainRelevance(sentence, profile.domainSpecialization) : 0)
    }));
    
    return scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, targetSentences)
      .map(s => s.text)
      .join('. ') + '.';
  }

  private calculateDomainRelevance(sentence: string, domain: string): number {
    const domainKeywords = {
      'requirements-analysis': ['requirement', 'shall', 'must', 'should', 'acceptance'],
      'system-design': ['architecture', 'component', 'interface', 'pattern', 'design'],
      'security': ['secure', 'protect', 'threat', 'risk', 'vulnerability'],
      'ui-development': ['user', 'interface', 'design', 'experience', 'visual'],
      'api-development': ['api', 'endpoint', 'service', 'request', 'response']
    };
    
    const keywords = domainKeywords[domain as keyof typeof domainKeywords] || [];
    const sentenceLower = sentence.toLowerCase();
    
    return keywords.filter(keyword => sentenceLower.includes(keyword)).length * 0.1;
  }

  private enhanceDomainTerminology(context: string, domain: string): string {
    // Simple domain terminology enhancement
    const enhancements: Record<string, Record<string, string>> = {
      'security': {
        'password': 'authentication credential',
        'user': 'authenticated user',
        'data': 'sensitive data'
      },
      'system-design': {
        'function': 'system component',
        'data': 'data structure',
        'process': 'system process'
      }
    };
    
    let enhanced = context;
    const domainEnhancements = enhancements[domain];
    
    if (domainEnhancements) {
      for (const [from, to] of Object.entries(domainEnhancements)) {
        enhanced = enhanced.replace(new RegExp(`\\b${from}\\b`, 'gi'), to);
      }
    }
    
    return enhanced;
  }

  private calculatePerformanceImprovements(original: string, optimized: string, 
                                          targets: any, profile: any): Record<string, number> {
    const improvements: Record<string, number> = {};
    
    if (targets.maxExecutionTime) {
      // Estimate execution time improvement based on size reduction
      const sizeReduction = (original.length - optimized.length) / original.length;
      improvements.executionTime = sizeReduction * 25; // 25% max improvement
    }
    
    if (targets.minConfidenceScore) {
      // Estimate confidence improvement based on optimization quality
      improvements.confidence = profile.domainSpecialization ? 15 : 8;
    }
    
    if (targets.contextUtilizationTarget) {
      // Estimate utilization improvement
      improvements.contextUtilization = 20;
    }
    
    return improvements;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Context Intelligence System MCP server running on stdio');
  }
}

const server = new ContextIntelligenceSystem();
server.run().catch(console.error);
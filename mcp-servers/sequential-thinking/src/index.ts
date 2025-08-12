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

interface Thought {
  id: string;
  content: string;
  timestamp: Date;
  branchId?: string;
  parentThoughtId?: string;
  confidence: number; // 0-1 scale
  tags: string[];
}

interface Hypothesis {
  id: string;
  statement: string;
  evidence: string[];
  counterEvidence: string[];
  confidence: number;
  status: 'active' | 'validated' | 'refuted' | 'inconclusive';
}

interface ReasoningSession {
  id: string;
  problem: string;
  context: string;
  startTime: Date;
  endTime?: Date;
  thoughts: Thought[];
  hypotheses: Hypothesis[];
  solutions: Solution[];
  activeReasoningPath: 'linear' | 'branching' | 'iterative' | 'hypothesis-testing';
}

interface Solution {
  id: string;
  description: string;
  approach: string;
  confidence: number;
  supportingThoughts: string[];
  potentialRisks: string[];
  implementation: string[];
}

class SequentialThinkingServer {
  private server: Server;
  private sessions: Map<string, ReasoningSession> = new Map();

  constructor() {
    this.server = new Server(
      {
        name: 'sequential-thinking-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'start_complex_reasoning',
          description: 'Begin a structured reasoning session for complex problem-solving',
          inputSchema: {
            type: 'object',
            properties: {
              problem: { type: 'string', description: 'The problem statement to reason about' },
              context: { type: 'string', description: 'Additional context and background information' },
              reasoningApproach: {
                type: 'string',
                enum: ['linear', 'branching', 'iterative', 'hypothesis-testing'],
                description: 'Preferred reasoning approach',
                default: 'linear'
              }
            },
            required: ['problem']
          }
        },
        {
          name: 'add_reasoning_step',
          description: 'Add a thought or reasoning step to the current session',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: { type: 'string', description: 'Reasoning session ID' },
              thought: { type: 'string', description: 'The reasoning step or thought' },
              confidence: { 
                type: 'number', 
                minimum: 0, 
                maximum: 1, 
                description: 'Confidence in this reasoning step (0-1)',
                default: 0.7
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags to categorize this thought'
              },
              branchId: { type: 'string', description: 'Branch ID for parallel reasoning paths' }
            },
            required: ['sessionId', 'thought']
          }
        },
        {
          name: 'explore_alternative_path',
          description: 'Branch the reasoning to explore alternative approaches',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: { type: 'string', description: 'Reasoning session ID' },
              branchPoint: { type: 'string', description: 'Thought ID to branch from' },
              alternativeThought: { type: 'string', description: 'Alternative reasoning direction' },
              rationale: { type: 'string', description: 'Why explore this alternative' }
            },
            required: ['sessionId', 'branchPoint', 'alternativeThought']
          }
        },
        {
          name: 'evaluate_solution_hypothesis',
          description: 'Test a hypothesis or potential solution',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: { type: 'string', description: 'Reasoning session ID' },
              hypothesis: { type: 'string', description: 'Hypothesis statement to evaluate' },
              evidence: {
                type: 'array',
                items: { type: 'string' },
                description: 'Supporting evidence for the hypothesis'
              },
              counterEvidence: {
                type: 'array', 
                items: { type: 'string' },
                description: 'Evidence against the hypothesis'
              }
            },
            required: ['sessionId', 'hypothesis']
          }
        },
        {
          name: 'rank_potential_solutions',
          description: 'Compare and rank multiple solution options',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: { type: 'string', description: 'Reasoning session ID' },
              solutions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    approach: { type: 'string' },
                    pros: { type: 'array', items: { type: 'string' } },
                    cons: { type: 'array', items: { type: 'string' } },
                    implementation: { type: 'array', items: { type: 'string' } }
                  },
                  required: ['description', 'approach']
                }
              },
              criteria: {
                type: 'array',
                items: { type: 'string' },
                description: 'Criteria to evaluate solutions against'
              }
            },
            required: ['sessionId', 'solutions']
          }
        },
        {
          name: 'export_reasoning_chain',
          description: 'Export the complete reasoning process for documentation or reuse',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: { type: 'string', description: 'Reasoning session ID' },
              format: {
                type: 'string',
                enum: ['summary', 'detailed', 'structured'],
                description: 'Export format level',
                default: 'summary'
              }
            },
            required: ['sessionId']
          }
        },
        {
          name: 'get_session_overview',
          description: 'Get an overview of the current reasoning session',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: { type: 'string', description: 'Reasoning session ID' }
            },
            required: ['sessionId']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'start_complex_reasoning':
            return await this.startComplexReasoning(request.params.arguments);
          
          case 'add_reasoning_step':
            return await this.addReasoningStep(request.params.arguments);
          
          case 'explore_alternative_path':
            return await this.exploreAlternativePath(request.params.arguments);
          
          case 'evaluate_solution_hypothesis':
            return await this.evaluateSolutionHypothesis(request.params.arguments);
          
          case 'rank_potential_solutions':
            return await this.rankPotentialSolutions(request.params.arguments);
          
          case 'export_reasoning_chain':
            return await this.exportReasoningChain(request.params.arguments);
          
          case 'get_session_overview':
            return await this.getSessionOverview(request.params.arguments);
          
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

  private async startComplexReasoning(args: any) {
    const sessionId = uuidv4();
    
    const session: ReasoningSession = {
      id: sessionId,
      problem: args.problem,
      context: args.context || '',
      startTime: new Date(),
      thoughts: [],
      hypotheses: [],
      solutions: [],
      activeReasoningPath: args.reasoningApproach || 'linear'
    };

    this.sessions.set(sessionId, session);

    return {
      content: [
        {
          type: 'text',
          text: `🧠 Reasoning Session Started: ${sessionId}

📋 Problem: ${session.problem}
${session.context ? `🔍 Context: ${session.context}` : ''}
🛤️ Approach: ${session.activeReasoningPath}
⏰ Started: ${session.startTime.toLocaleString()}

Ready to begin structured reasoning. Use 'add_reasoning_step' to start adding thoughts.`
        }
      ]
    };
  }

  private async addReasoningStep(args: any) {
    const session = this.sessions.get(args.sessionId);
    
    if (!session) {
      throw new Error(`Session ${args.sessionId} not found`);
    }

    const thought: Thought = {
      id: uuidv4(),
      content: args.thought,
      timestamp: new Date(),
      branchId: args.branchId,
      confidence: args.confidence || 0.7,
      tags: args.tags || []
    };

    session.thoughts.push(thought);

    const stepNumber = session.thoughts.length;
    const confidenceBar = '▓'.repeat(Math.floor(thought.confidence * 10)) + '░'.repeat(10 - Math.floor(thought.confidence * 10));

    return {
      content: [
        {
          type: 'text',
          text: `💭 Reasoning Step #${stepNumber} Added

${thought.content}

📊 Confidence: ${confidenceBar} ${(thought.confidence * 100).toFixed(0)}%
${thought.tags.length > 0 ? `🏷️ Tags: ${thought.tags.join(', ')}` : ''}
${thought.branchId ? `🌿 Branch: ${thought.branchId}` : ''}
⏰ Timestamp: ${thought.timestamp.toLocaleTimeString()}`
        }
      ]
    };
  }

  private async exploreAlternativePath(args: any) {
    const session = this.sessions.get(args.sessionId);
    
    if (!session) {
      throw new Error(`Session ${args.sessionId} not found`);
    }

    const branchId = `branch-${Date.now()}`;
    
    const alternativeThought: Thought = {
      id: uuidv4(),
      content: args.alternativeThought,
      timestamp: new Date(),
      branchId: branchId,
      parentThoughtId: args.branchPoint,
      confidence: 0.6, // Slightly lower initial confidence for alternatives
      tags: ['alternative', 'branch']
    };

    session.thoughts.push(alternativeThought);

    return {
      content: [
        {
          type: 'text',
          text: `🌿 Alternative Path Explored

🔀 Branching from thought: ${args.branchPoint}
🌱 New branch: ${branchId}
💭 Alternative thought: ${args.alternativeThought}
${args.rationale ? `💡 Rationale: ${args.rationale}` : ''}

This creates a parallel reasoning path to explore different approaches to the problem.`
        }
      ]
    };
  }

  private async evaluateSolutionHypothesis(args: any) {
    const session = this.sessions.get(args.sessionId);
    
    if (!session) {
      throw new Error(`Session ${args.sessionId} not found`);
    }

    const evidence = args.evidence || [];
    const counterEvidence = args.counterEvidence || [];
    
    // Calculate confidence based on evidence balance
    const evidenceStrength = evidence.length;
    const counterStrength = counterEvidence.length;
    const confidence = evidenceStrength / (evidenceStrength + counterStrength + 1);

    let status: 'active' | 'validated' | 'refuted' | 'inconclusive' = 'active';
    if (confidence > 0.7 && evidenceStrength > counterStrength) {
      status = 'validated';
    } else if (confidence < 0.3 && counterStrength > evidenceStrength) {
      status = 'refuted';
    } else if (evidenceStrength === 0 && counterStrength === 0) {
      status = 'inconclusive';
    }

    const hypothesis: Hypothesis = {
      id: uuidv4(),
      statement: args.hypothesis,
      evidence,
      counterEvidence,
      confidence,
      status
    };

    session.hypotheses.push(hypothesis);

    const statusEmoji = {
      'active': '🔄',
      'validated': '✅',
      'refuted': '❌',
      'inconclusive': '❓'
    }[status];

    return {
      content: [
        {
          type: 'text',
          text: `🧪 Hypothesis Evaluation

${statusEmoji} Status: ${status.toUpperCase()}
📝 Statement: ${args.hypothesis}
📊 Confidence: ${(confidence * 100).toFixed(1)}%

✅ Supporting Evidence (${evidence.length}):
${evidence.map(e => `  • ${e}`).join('\n') || '  (none provided)'}

❌ Counter Evidence (${counterEvidence.length}):
${counterEvidence.map(e => `  • ${e}`).join('\n') || '  (none provided)'}

💡 Recommendation: ${this.getHypothesisRecommendation(hypothesis)}`
        }
      ]
    };
  }

  private getHypothesisRecommendation(hypothesis: Hypothesis): string {
    switch (hypothesis.status) {
      case 'validated':
        return 'Strong hypothesis - consider implementing this approach';
      case 'refuted':
        return 'Weak hypothesis - explore alternative approaches';
      case 'inconclusive':
        return 'Gather more evidence before making decisions';
      default:
        return 'Continue investigation and gather more evidence';
    }
  }

  private async rankPotentialSolutions(args: any) {
    const session = this.sessions.get(args.sessionId);
    
    if (!session) {
      throw new Error(`Session ${args.sessionId} not found`);
    }

    const solutions = args.solutions.map((sol: any, index: number) => {
      const prosWeight = (sol.pros || []).length;
      const consWeight = (sol.cons || []).length;
      const confidence = Math.max(0.1, prosWeight / (prosWeight + consWeight + 1));

      const solution: Solution = {
        id: uuidv4(),
        description: sol.description,
        approach: sol.approach,
        confidence,
        supportingThoughts: [],
        potentialRisks: sol.cons || [],
        implementation: sol.implementation || []
      };

      return { solution, prosWeight, consWeight };
    });

    // Sort by confidence score
    solutions.sort((a, b) => b.solution.confidence - a.solution.confidence);

    // Add to session
    session.solutions = solutions.map(s => s.solution);

    const rankings = solutions.map((sol, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
      
      return `${medal} ${sol.solution.description}
   📊 Confidence: ${(sol.solution.confidence * 100).toFixed(1)}%
   🎯 Approach: ${sol.solution.approach}
   ✅ Pros: ${sol.prosWeight} | ❌ Cons: ${sol.consWeight}`;
    }).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `🏆 Solution Rankings

${rankings}

💡 Recommendation: Focus on the top-ranked solution while keeping alternatives as backups. Consider combining strengths from multiple approaches if possible.`
        }
      ]
    };
  }

  private async exportReasoningChain(args: any) {
    const session = this.sessions.get(args.sessionId);
    
    if (!session) {
      throw new Error(`Session ${args.sessionId} not found`);
    }

    const format = args.format || 'summary';
    let exportContent = '';

    switch (format) {
      case 'summary':
        exportContent = this.generateSummaryExport(session);
        break;
      case 'detailed':
        exportContent = this.generateDetailedExport(session);
        break;
      case 'structured':
        exportContent = this.generateStructuredExport(session);
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: exportContent
        }
      ]
    };
  }

  private generateSummaryExport(session: ReasoningSession): string {
    const duration = session.endTime ? 
      ((session.endTime.getTime() - session.startTime.getTime()) / 1000 / 60).toFixed(1) :
      'ongoing';

    return `📋 Reasoning Summary - Session ${session.id}

🎯 Problem: ${session.problem}
⏱️ Duration: ${duration} minutes
🛤️ Approach: ${session.activeReasoningPath}

💭 Key Thoughts (${session.thoughts.length}):
${session.thoughts.slice(-3).map((t, i) => `${i + 1}. ${t.content}`).join('\n')}

🧪 Hypotheses (${session.hypotheses.length}):
${session.hypotheses.map(h => `• ${h.statement} (${h.status})`).join('\n')}

🏆 Solutions (${session.solutions.length}):
${session.solutions.slice(0, 3).map((s, i) => `${i + 1}. ${s.description} (${(s.confidence * 100).toFixed(0)}%)`).join('\n')}`;
  }

  private generateDetailedExport(session: ReasoningSession): string {
    return `📋 Detailed Reasoning Export - Session ${session.id}

🎯 PROBLEM STATEMENT
${session.problem}

🔍 CONTEXT
${session.context || 'No additional context provided'}

💭 REASONING CHAIN (${session.thoughts.length} thoughts)
${session.thoughts.map((t, i) => 
  `${i + 1}. [${t.timestamp.toLocaleTimeString()}] ${t.content}
   Confidence: ${(t.confidence * 100).toFixed(0)}% ${t.branchId ? `| Branch: ${t.branchId}` : ''}`
).join('\n\n')}

🧪 HYPOTHESES TESTED (${session.hypotheses.length})
${session.hypotheses.map(h => 
  `• ${h.statement}
  Status: ${h.status} | Confidence: ${(h.confidence * 100).toFixed(1)}%
  Evidence: ${h.evidence.length} supporting, ${h.counterEvidence.length} counter`
).join('\n\n')}

🏆 SOLUTIONS DEVELOPED (${session.solutions.length})
${session.solutions.map((s, i) => 
  `${i + 1}. ${s.description}
  Approach: ${s.approach}
  Confidence: ${(s.confidence * 100).toFixed(1)}%
  Implementation: ${s.implementation.length} steps defined`
).join('\n\n')}`;
  }

  private generateStructuredExport(session: ReasoningSession): string {
    return JSON.stringify({
      sessionId: session.id,
      problem: session.problem,
      context: session.context,
      approach: session.activeReasoningPath,
      startTime: session.startTime,
      endTime: session.endTime,
      thoughts: session.thoughts,
      hypotheses: session.hypotheses,
      solutions: session.solutions,
      summary: {
        totalThoughts: session.thoughts.length,
        averageConfidence: session.thoughts.reduce((sum, t) => sum + t.confidence, 0) / session.thoughts.length,
        branchesExplored: [...new Set(session.thoughts.filter(t => t.branchId).map(t => t.branchId))].length,
        hypothesesTested: session.hypotheses.length,
        solutionsDeveloped: session.solutions.length
      }
    }, null, 2);
  }

  private async getSessionOverview(args: any) {
    const session = this.sessions.get(args.sessionId);
    
    if (!session) {
      throw new Error(`Session ${args.sessionId} not found`);
    }

    const avgConfidence = session.thoughts.length > 0 ?
      session.thoughts.reduce((sum, t) => sum + t.confidence, 0) / session.thoughts.length : 0;

    const branches = [...new Set(session.thoughts.filter(t => t.branchId).map(t => t.branchId))];

    return {
      content: [
        {
          type: 'text',
          text: `📊 Session Overview: ${session.id}

🎯 Problem: ${session.problem}
🛤️ Reasoning Approach: ${session.activeReasoningPath}
⏰ Started: ${session.startTime.toLocaleString()}

📈 Progress Metrics:
  💭 Thoughts: ${session.thoughts.length}
  🧪 Hypotheses: ${session.hypotheses.length}
  🏆 Solutions: ${session.solutions.length}
  🌿 Branches: ${branches.length}

📊 Quality Metrics:
  Average Confidence: ${(avgConfidence * 100).toFixed(1)}%
  Validated Hypotheses: ${session.hypotheses.filter(h => h.status === 'validated').length}
  High-Confidence Solutions: ${session.solutions.filter(s => s.confidence > 0.7).length}

🔄 Status: ${session.endTime ? 'Completed' : 'Active'}`
        }
      ]
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Sequential Thinking MCP server running on stdio');
  }
}

const server = new SequentialThinkingServer();
server.run().catch(console.error);
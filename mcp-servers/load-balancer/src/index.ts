#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

interface AgentInfo {
  id: string;
  name: string;
  capabilities: string[];
  maxLoad: number;
  currentLoad: number;
  healthStatus: 'healthy' | 'warning' | 'critical' | 'offline';
  lastHeartbeat: Date;
  performance: {
    successRate: number;
    avgResponseTime: number;
    tasksCompleted: number;
    tasksFailures: number;
  };
}

interface TaskRequirements {
  capabilities: string[];
  priority: 'immediate' | 'high' | 'medium' | 'low';
  estimatedLoad: number;
}

interface SystemLoadMetrics {
  totalAgents: number;
  healthyAgents: number;
  averageLoad: number;
  totalThroughput: number;
  systemHealth: 'optimal' | 'good' | 'degraded' | 'critical';
}

class LoadBalancerServer {
  private server: Server;
  private agents: Map<string, AgentInfo> = new Map();
  private healthCheckInterval: NodeJS.Timeout;

  constructor() {
    this.server = new Server(
      {
        name: 'load-balancer-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Start health monitoring
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Check every 30 seconds

    // Graceful shutdown
    process.on('SIGINT', async () => {
      clearInterval(this.healthCheckInterval);
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'register_development_agent',
          description: 'Register a new AI agent with the load balancer',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Unique agent identifier' },
              name: { type: 'string', description: 'Human-readable agent name' },
              capabilities: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Agent capabilities (e.g., frontend, backend, testing)'
              },
              maxLoad: { type: 'number', description: 'Maximum concurrent tasks', default: 5 }
            },
            required: ['agentId', 'name', 'capabilities']
          }
        },
        {
          name: 'get_optimal_agent',
          description: 'Find the best agent for a specific task',
          inputSchema: {
            type: 'object',
            properties: {
              requiredCapabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Required capabilities for the task'
              },
              priority: {
                type: 'string',
                enum: ['immediate', 'high', 'medium', 'low'],
                description: 'Task priority level'
              },
              estimatedLoad: { type: 'number', description: 'Estimated task load (1-10)', default: 1 }
            },
            required: ['requiredCapabilities']
          }
        },
        {
          name: 'distribute_task_load',
          description: 'Distribute multiple tasks across available agents',
          inputSchema: {
            type: 'object',
            properties: {
              tasks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    capabilities: { type: 'array', items: { type: 'string' } },
                    priority: { type: 'string', enum: ['immediate', 'high', 'medium', 'low'] },
                    estimatedLoad: { type: 'number' }
                  },
                  required: ['id', 'capabilities']
                }
              }
            },
            required: ['tasks']
          }
        },
        {
          name: 'monitor_agent_health',
          description: 'Check the health status of all registered agents',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false
          }
        },
        {
          name: 'update_agent_status',
          description: 'Update agent performance metrics and health',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Agent identifier' },
              currentLoad: { type: 'number', description: 'Current task load' },
              tasksCompleted: { type: 'number', description: 'Number of completed tasks' },
              tasksFailed: { type: 'number', description: 'Number of failed tasks' },
              avgResponseTime: { type: 'number', description: 'Average response time in ms' }
            },
            required: ['agentId']
          }
        },
        {
          name: 'handle_agent_failover',
          description: 'Handle agent failure and redistribute its tasks',
          inputSchema: {
            type: 'object',
            properties: {
              failedAgentId: { type: 'string', description: 'ID of the failed agent' },
              reason: { type: 'string', description: 'Reason for failure' }
            },
            required: ['failedAgentId', 'reason']
          }
        },
        {
          name: 'get_load_metrics',
          description: 'Get system-wide load balancing metrics and health overview',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'register_development_agent':
            return await this.registerAgent(request.params.arguments);
          
          case 'get_optimal_agent':
            return await this.getOptimalAgent(request.params.arguments);
          
          case 'distribute_task_load':
            return await this.distributeTaskLoad(request.params.arguments);
          
          case 'monitor_agent_health':
            return await this.monitorAgentHealth();
          
          case 'update_agent_status':
            return await this.updateAgentStatus(request.params.arguments);
          
          case 'handle_agent_failover':
            return await this.handleAgentFailover(request.params.arguments);
          
          case 'get_load_metrics':
            return await this.getLoadMetrics();
          
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

  private async registerAgent(args: any) {
    const agent: AgentInfo = {
      id: args.agentId,
      name: args.name,
      capabilities: args.capabilities,
      maxLoad: args.maxLoad || 5,
      currentLoad: 0,
      healthStatus: 'healthy',
      lastHeartbeat: new Date(),
      performance: {
        successRate: 1.0,
        avgResponseTime: 0,
        tasksCompleted: 0,
        tasksFailures: 0
      }
    };

    this.agents.set(args.agentId, agent);

    return {
      content: [
        {
          type: 'text',
          text: `Agent ${args.name} (${args.agentId}) registered successfully\nCapabilities: ${args.capabilities.join(', ')}\nMax Load: ${agent.maxLoad}\nStatus: ${agent.healthStatus}`
        }
      ]
    };
  }

  private async getOptimalAgent(args: any) {
    const requirements: TaskRequirements = {
      capabilities: args.requiredCapabilities,
      priority: args.priority || 'medium',
      estimatedLoad: args.estimatedLoad || 1
    };

    const optimalAgent = this.selectOptimalAgent(requirements);

    if (!optimalAgent) {
      return {
        content: [
          {
            type: 'text',
            text: `No suitable agent found for capabilities: ${requirements.capabilities.join(', ')}\nConsider registering agents with these capabilities or waiting for existing agents to become available.`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Optimal agent selected: ${optimalAgent.name} (${optimalAgent.id})\nCapabilities: ${optimalAgent.capabilities.join(', ')}\nCurrent Load: ${optimalAgent.currentLoad}/${optimalAgent.maxLoad}\nHealth: ${optimalAgent.healthStatus}\nSuccess Rate: ${(optimalAgent.performance.successRate * 100).toFixed(1)}%`
        }
      ]
    };
  }

  private selectOptimalAgent(requirements: TaskRequirements): AgentInfo | null {
    const suitableAgents = Array.from(this.agents.values()).filter(agent => {
      // Agent must be healthy
      if (agent.healthStatus === 'offline' || agent.healthStatus === 'critical') {
        return false;
      }

      // Agent must have required capabilities
      const hasCapabilities = requirements.capabilities.every(cap => 
        agent.capabilities.includes(cap)
      );
      if (!hasCapabilities) {
        return false;
      }

      // Agent must have capacity
      return agent.currentLoad + requirements.estimatedLoad <= agent.maxLoad;
    });

    if (suitableAgents.length === 0) {
      return null;
    }

    // Score agents based on multiple factors
    const scoredAgents = suitableAgents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, requirements)
    }));

    // Sort by score (higher is better)
    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents[0].agent;
  }

  private calculateAgentScore(agent: AgentInfo, requirements: TaskRequirements): number {
    let score = 0;

    // Health bonus
    switch (agent.healthStatus) {
      case 'healthy': score += 100; break;
      case 'warning': score += 75; break;
      case 'critical': score += 25; break;
      default: score += 0;
    }

    // Load capacity bonus (prefer agents with more available capacity)
    const availableCapacity = (agent.maxLoad - agent.currentLoad) / agent.maxLoad;
    score += availableCapacity * 50;

    // Performance bonus
    score += agent.performance.successRate * 30;
    score += Math.max(0, 20 - agent.performance.avgResponseTime / 100); // Faster response = higher score

    // Priority adjustment
    if (requirements.priority === 'immediate') {
      score += availableCapacity * 25; // Prioritize agents with most capacity for urgent tasks
    }

    return score;
  }

  private async distributeTaskLoad(args: any) {
    const tasks = args.tasks;
    const assignments: Array<{taskId: string, agentId: string, agentName: string}> = [];
    const unassigned: Array<{taskId: string, reason: string}> = [];

    for (const task of tasks) {
      const requirements: TaskRequirements = {
        capabilities: task.capabilities,
        priority: task.priority || 'medium',
        estimatedLoad: task.estimatedLoad || 1
      };

      const optimalAgent = this.selectOptimalAgent(requirements);

      if (optimalAgent) {
        // Reserve the capacity
        optimalAgent.currentLoad += requirements.estimatedLoad;
        assignments.push({
          taskId: task.id,
          agentId: optimalAgent.id,
          agentName: optimalAgent.name
        });
      } else {
        unassigned.push({
          taskId: task.id,
          reason: 'No suitable agent available'
        });
      }
    }

    const result = `Task Distribution Results:

✅ Assigned Tasks (${assignments.length}):
${assignments.map(a => `  • ${a.taskId} → ${a.agentName} (${a.agentId})`).join('\n')}

❌ Unassigned Tasks (${unassigned.length}):
${unassigned.map(u => `  • ${u.taskId}: ${u.reason}`).join('\n')}

📊 Success Rate: ${((assignments.length / tasks.length) * 100).toFixed(1)}%`;

    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  }

  private async monitorAgentHealth() {
    const healthReport: string[] = ['🏥 Agent Health Monitor\n'];

    for (const [agentId, agent] of this.agents) {
      const timeSinceHeartbeat = Date.now() - agent.lastHeartbeat.getTime();
      const minutesSinceHeartbeat = Math.floor(timeSinceHeartbeat / (1000 * 60));

      let healthIcon = '';
      switch (agent.healthStatus) {
        case 'healthy': healthIcon = '✅'; break;
        case 'warning': healthIcon = '⚠️'; break;
        case 'critical': healthIcon = '🔴'; break;
        case 'offline': healthIcon = '⚫'; break;
      }

      healthReport.push(
        `${healthIcon} ${agent.name} (${agentId})`,
        `   Load: ${agent.currentLoad}/${agent.maxLoad}`,
        `   Success Rate: ${(agent.performance.successRate * 100).toFixed(1)}%`,
        `   Last Heartbeat: ${minutesSinceHeartbeat}m ago`,
        `   Response Time: ${agent.performance.avgResponseTime}ms\n`
      );
    }

    return {
      content: [
        {
          type: 'text',
          text: healthReport.join('\n')
        }
      ]
    };
  }

  private async updateAgentStatus(args: any) {
    const agent = this.agents.get(args.agentId);
    
    if (!agent) {
      throw new Error(`Agent ${args.agentId} not found`);
    }

    // Update metrics
    if (args.currentLoad !== undefined) {
      agent.currentLoad = args.currentLoad;
    }

    if (args.tasksCompleted !== undefined) {
      agent.performance.tasksCompleted += args.tasksCompleted;
    }

    if (args.tasksFailed !== undefined) {
      agent.performance.tasksFailures += args.tasksFailed;
    }

    if (args.avgResponseTime !== undefined) {
      agent.performance.avgResponseTime = args.avgResponseTime;
    }

    // Recalculate success rate
    const totalTasks = agent.performance.tasksCompleted + agent.performance.tasksFailures;
    if (totalTasks > 0) {
      agent.performance.successRate = agent.performance.tasksCompleted / totalTasks;
    }

    // Update health status based on performance
    this.updateAgentHealth(agent);
    agent.lastHeartbeat = new Date();

    return {
      content: [
        {
          type: 'text',
          text: `Agent ${agent.name} status updated\nHealth: ${agent.healthStatus}\nLoad: ${agent.currentLoad}/${agent.maxLoad}\nSuccess Rate: ${(agent.performance.successRate * 100).toFixed(1)}%`
        }
      ]
    };
  }

  private updateAgentHealth(agent: AgentInfo): void {
    const loadRatio = agent.currentLoad / agent.maxLoad;
    const successRate = agent.performance.successRate;

    if (successRate < 0.5 || loadRatio > 0.9) {
      agent.healthStatus = 'critical';
    } else if (successRate < 0.8 || loadRatio > 0.7) {
      agent.healthStatus = 'warning';
    } else {
      agent.healthStatus = 'healthy';
    }
  }

  private async handleAgentFailover(args: any) {
    const failedAgent = this.agents.get(args.failedAgentId);
    
    if (!failedAgent) {
      throw new Error(`Agent ${args.failedAgentId} not found`);
    }

    // Mark agent as offline
    failedAgent.healthStatus = 'offline';
    failedAgent.currentLoad = 0;

    return {
      content: [
        {
          type: 'text',
          text: `Agent ${failedAgent.name} marked as offline\nReason: ${args.reason}\nTasks that were assigned to this agent should be redistributed to other available agents.`
        }
      ]
    };
  }

  private async getLoadMetrics() {
    const agents = Array.from(this.agents.values());
    const healthyAgents = agents.filter(a => a.healthStatus === 'healthy');
    
    const totalLoad = agents.reduce((sum, agent) => sum + agent.currentLoad, 0);
    const totalCapacity = agents.reduce((sum, agent) => sum + agent.maxLoad, 0);
    const averageLoad = totalCapacity > 0 ? (totalLoad / totalCapacity) * 100 : 0;

    const totalTasks = agents.reduce((sum, agent) => 
      sum + agent.performance.tasksCompleted + agent.performance.tasksFailures, 0);

    let systemHealth: 'optimal' | 'good' | 'degraded' | 'critical' = 'optimal';
    if (healthyAgents.length / agents.length < 0.5) {
      systemHealth = 'critical';
    } else if (averageLoad > 80) {
      systemHealth = 'degraded';
    } else if (averageLoad > 60 || healthyAgents.length / agents.length < 0.8) {
      systemHealth = 'good';
    }

    const metrics: SystemLoadMetrics = {
      totalAgents: agents.length,
      healthyAgents: healthyAgents.length,
      averageLoad,
      totalThroughput: totalTasks,
      systemHealth
    };

    const healthIcon = {
      'optimal': '🟢',
      'good': '🟡', 
      'degraded': '🟠',
      'critical': '🔴'
    }[systemHealth];

    return {
      content: [
        {
          type: 'text',
          text: `📊 System Load Metrics

${healthIcon} System Health: ${systemHealth.toUpperCase()}

🤖 Agents: ${metrics.totalAgents} total, ${metrics.healthyAgents} healthy
📈 Average Load: ${averageLoad.toFixed(1)}%
🎯 Total Tasks Processed: ${totalTasks}
⚡ Healthy Agent Ratio: ${((metrics.healthyAgents / metrics.totalAgents) * 100).toFixed(1)}%

Load Distribution:
${agents.map(agent => 
  `  • ${agent.name}: ${agent.currentLoad}/${agent.maxLoad} (${((agent.currentLoad/agent.maxLoad)*100).toFixed(0)}%)`
).join('\n')}`
        }
      ]
    };
  }

  private performHealthChecks(): void {
    const now = Date.now();
    
    for (const [agentId, agent] of this.agents) {
      const timeSinceHeartbeat = now - agent.lastHeartbeat.getTime();
      
      // Mark agents offline if no heartbeat for 5 minutes
      if (timeSinceHeartbeat > 5 * 60 * 1000) {
        agent.healthStatus = 'offline';
        agent.currentLoad = 0;
      }
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Load Balancer MCP server running on stdio');
  }
}

const server = new LoadBalancerServer();
server.run().catch(console.error);
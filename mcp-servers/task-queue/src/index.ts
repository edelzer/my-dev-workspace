#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { TaskQueueDatabase } from './database.js';
import { Task, TaskStatus, TaskPriority, AgentCapabilities, TaskProgress } from './types.js';

class TaskQueueServer {
  private server: Server;
  private database: TaskQueueDatabase;

  constructor() {
    this.server = new Server(
      {
        name: 'task-queue-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.database = new TaskQueueDatabase();
    this.setupToolHandlers();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      this.database.close();
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'add_task_to_queue',
          description: 'Submit a new task for processing by AI agents',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Task title' },
              description: { type: 'string', description: 'Detailed task description' },
              priority: { 
                type: 'string', 
                enum: ['immediate', 'high', 'medium', 'low'],
                description: 'Task priority level'
              },
              requiredCapabilities: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Required agent capabilities'
              },
              estimatedDuration: { type: 'number', description: 'Estimated duration in minutes' },
              dependencies: {
                type: 'array',
                items: { type: 'string' },
                description: 'Task IDs this task depends on'
              },
              metadata: {
                type: 'object',
                description: 'Additional task metadata'
              }
            },
            required: ['title', 'description', 'priority']
          }
        },
        {
          name: 'get_next_task',
          description: 'Retrieve the next highest priority task for an agent',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Agent requesting the task' },
              capabilities: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'Agent capabilities'
              }
            },
            required: ['agentId', 'capabilities']
          }
        },
        {
          name: 'update_task_progress',
          description: 'Report progress on a task',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: { type: 'string', description: 'Task ID' },
              status: {
                type: 'string',
                enum: ['pending', 'assigned', 'in_progress', 'completed', 'failed', 'cancelled'],
                description: 'New task status'
              },
              percentage: { type: 'number', description: 'Progress percentage (0-100)' },
              currentStep: { type: 'string', description: 'Current step description' },
              estimatedTimeRemaining: { type: 'number', description: 'Estimated time remaining in minutes' },
              notes: { type: 'string', description: 'Progress notes' }
            },
            required: ['taskId', 'status']
          }
        },
        {
          name: 'get_queue_status',
          description: 'View current queue state and metrics',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false
          }
        },
        {
          name: 'register_agent',
          description: 'Register an agent with the task queue system',
          inputSchema: {
            type: 'object',
            properties: {
              agentId: { type: 'string', description: 'Unique agent identifier' },
              capabilities: {
                type: 'array',
                items: { type: 'string' },
                description: 'Agent capabilities'
              },
              maxConcurrentTasks: { type: 'number', description: 'Maximum concurrent tasks' }
            },
            required: ['agentId', 'capabilities']
          }
        },
        {
          name: 'reassign_failed_task',
          description: 'Reassign a failed task to the queue',
          inputSchema: {
            type: 'object',
            properties: {
              taskId: { type: 'string', description: 'Task ID to reassign' },
              reason: { type: 'string', description: 'Reason for failure' }
            },
            required: ['taskId', 'reason']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        switch (request.params.name) {
          case 'add_task_to_queue':
            return await this.addTaskToQueue(request.params.arguments);
          
          case 'get_next_task':
            return await this.getNextTask(request.params.arguments);
          
          case 'update_task_progress':
            return await this.updateTaskProgress(request.params.arguments);
          
          case 'get_queue_status':
            return await this.getQueueStatus();
          
          case 'register_agent':
            return await this.registerAgent(request.params.arguments);
          
          case 'reassign_failed_task':
            return await this.reassignFailedTask(request.params.arguments);
          
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

  private async addTaskToQueue(args: any) {
    const task = {
      title: args.title,
      description: args.description,
      priority: args.priority as TaskPriority,
      requiredCapabilities: args.requiredCapabilities || [],
      status: TaskStatus.PENDING,
      estimatedDuration: args.estimatedDuration,
      dependencies: args.dependencies || [],
      metadata: args.metadata || {}
    };

    const taskId = await this.database.createTask(task);
    
    return {
      content: [
        {
          type: 'text',
          text: `Task created successfully with ID: ${taskId}\nTitle: ${task.title}\nPriority: ${task.priority}\nStatus: ${task.status}`
        }
      ]
    };
  }

  private async getNextTask(args: any) {
    const task = await this.database.getNextTask(args.capabilities);
    
    if (!task) {
      return {
        content: [
          {
            type: 'text',
            text: 'No tasks available for the specified agent capabilities'
          }
        ]
      };
    }

    // Assign task to agent
    await this.database.updateTaskStatus(task.id, TaskStatus.ASSIGNED, args.agentId);

    return {
      content: [
        {
          type: 'text',
          text: `Task assigned: ${task.id}\nTitle: ${task.title}\nDescription: ${task.description}\nPriority: ${task.priority}\nEstimated Duration: ${task.estimatedDuration || 'Unknown'} minutes`
        }
      ]
    };
  }

  private async updateTaskProgress(args: any) {
    // Update task status
    if (args.status) {
      await this.database.updateTaskStatus(args.taskId, args.status);
    }

    // Update progress details
    if (args.percentage !== undefined || args.currentStep || args.estimatedTimeRemaining || args.notes) {
      const progress: TaskProgress = {
        taskId: args.taskId,
        percentage: args.percentage || 0,
        currentStep: args.currentStep || '',
        estimatedTimeRemaining: args.estimatedTimeRemaining,
        notes: args.notes
      };
      
      await this.database.updateTaskProgress(progress);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Task ${args.taskId} updated successfully\nStatus: ${args.status}\nProgress: ${args.percentage || 0}%\nCurrent Step: ${args.currentStep || 'N/A'}`
        }
      ]
    };
  }

  private async getQueueStatus() {
    const metrics = await this.database.getQueueMetrics();
    
    return {
      content: [
        {
          type: 'text',
          text: `Task Queue Status:
Total Tasks: ${metrics.total_tasks}
Pending: ${metrics.pending_tasks}
Active: ${metrics.active_tasks}  
Completed: ${metrics.completed_tasks}
Average Completion Time: ${metrics.avg_completion_time_minutes?.toFixed(2) || 'N/A'} minutes`
        }
      ]
    };
  }

  private async registerAgent(args: any) {
    const agent: AgentCapabilities = {
      agentId: args.agentId,
      capabilities: args.capabilities,
      maxConcurrentTasks: args.maxConcurrentTasks || 5,
      currentTasks: 0,
      performance: {
        successRate: 1.0,
        averageCompletionTime: 0,
        lastActiveTime: new Date()
      }
    };

    await this.database.registerAgent(agent);

    return {
      content: [
        {
          type: 'text',
          text: `Agent ${args.agentId} registered successfully\nCapabilities: ${args.capabilities.join(', ')}\nMax Concurrent Tasks: ${agent.maxConcurrentTasks}`
        }
      ]
    };
  }

  private async reassignFailedTask(args: any) {
    await this.database.updateTaskStatus(args.taskId, TaskStatus.PENDING);
    
    return {
      content: [
        {
          type: 'text',
          text: `Task ${args.taskId} has been reassigned to queue\nReason: ${args.reason}`
        }
      ]
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Task Queue MCP server running on stdio');
  }
}

const server = new TaskQueueServer();
server.run().catch(console.error);
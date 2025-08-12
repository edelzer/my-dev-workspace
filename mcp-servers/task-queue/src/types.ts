export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  requiredCapabilities: string[];
  assignedAgent?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  estimatedDuration?: number; // in minutes
  dependencies: string[]; // task IDs this task depends on
  metadata: Record<string, any>;
}

export enum TaskPriority {
  IMMEDIATE = 'immediate',
  HIGH = 'high', 
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface AgentCapabilities {
  agentId: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  currentTasks: number;
  performance: {
    successRate: number;
    averageCompletionTime: number;
    lastActiveTime: Date;
  };
}

export interface TaskProgress {
  taskId: string;
  percentage: number;
  currentStep: string;
  estimatedTimeRemaining?: number;
  notes?: string;
}

export interface QueueMetrics {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  averageWaitTime: number;
  averageCompletionTime: number;
  activeAgents: number;
  queueLength: number;
}

export interface WorkloadMetrics {
  agentId: string;
  currentTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTaskTime: number;
  successRate: number;
  currentLoad: number; // percentage
}
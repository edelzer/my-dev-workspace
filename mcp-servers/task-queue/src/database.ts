import sqlite3 from 'sqlite3';
import { Task, TaskStatus, TaskPriority, AgentCapabilities, TaskProgress } from './types.js';

export class TaskQueueDatabase {
  private db: sqlite3.Database;

  constructor(dbPath: string = './task-queue.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      // Tasks table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          priority TEXT NOT NULL,
          required_capabilities TEXT, -- JSON array
          assigned_agent TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          due_date DATETIME,
          estimated_duration INTEGER,
          dependencies TEXT, -- JSON array of task IDs
          metadata TEXT -- JSON object
        )
      `);

      // Agents table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS agents (
          agent_id TEXT PRIMARY KEY,
          capabilities TEXT NOT NULL, -- JSON array
          max_concurrent_tasks INTEGER DEFAULT 5,
          current_tasks INTEGER DEFAULT 0,
          success_rate REAL DEFAULT 0.0,
          average_completion_time REAL DEFAULT 0.0,
          last_active_time DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Task progress table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS task_progress (
          task_id TEXT PRIMARY KEY,
          percentage REAL DEFAULT 0.0,
          current_step TEXT,
          estimated_time_remaining INTEGER,
          notes TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (task_id) REFERENCES tasks (id)
        )
      `);

      // Indexes for better performance
      this.db.run('CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks (status)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks (priority)');
      this.db.run('CREATE INDEX IF NOT EXISTS idx_tasks_assigned_agent ON tasks (assigned_agent)');
    });
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise((resolve, reject) => {
      const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const stmt = this.db.prepare(`
        INSERT INTO tasks (
          id, title, description, priority, required_capabilities,
          assigned_agent, status, due_date, estimated_duration,
          dependencies, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        taskId,
        task.title,
        task.description,
        task.priority,
        JSON.stringify(task.requiredCapabilities),
        task.assignedAgent || null,
        task.status,
        task.dueDate?.toISOString() || null,
        task.estimatedDuration || null,
        JSON.stringify(task.dependencies),
        JSON.stringify(task.metadata)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(taskId);
        }
      });

      stmt.finalize();
    });
  }

  async getNextTask(agentCapabilities: string[]): Promise<Task | null> {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM tasks 
        WHERE status = 'pending' 
        AND (required_capabilities = '[]' OR required_capabilities IN (${agentCapabilities.map(() => '?').join(', ')}))
        ORDER BY 
          CASE priority 
            WHEN 'immediate' THEN 1
            WHEN 'high' THEN 2  
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END,
          created_at ASC
        LIMIT 1
      `;

      this.db.get(query, agentCapabilities.map(cap => `["${cap}"]`), (err, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve(this.rowToTask(row));
        }
      });
    });
  }

  async updateTaskStatus(taskId: string, status: TaskStatus, assignedAgent?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        UPDATE tasks 
        SET status = ?, assigned_agent = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      stmt.run([status, assignedAgent || null, taskId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  async registerAgent(agent: AgentCapabilities): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO agents (
          agent_id, capabilities, max_concurrent_tasks, current_tasks,
          success_rate, average_completion_time, last_active_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        agent.agentId,
        JSON.stringify(agent.capabilities),
        agent.maxConcurrentTasks,
        agent.currentTasks,
        agent.performance.successRate,
        agent.performance.averageCompletionTime,
        agent.performance.lastActiveTime.toISOString()
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  async updateTaskProgress(progress: TaskProgress): Promise<void> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO task_progress (
          task_id, percentage, current_step, estimated_time_remaining, notes, updated_at
        ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run([
        progress.taskId,
        progress.percentage,
        progress.currentStep,
        progress.estimatedTimeRemaining || null,
        progress.notes || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });

      stmt.finalize();
    });
  }

  async getQueueMetrics(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as active_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
          AVG(CASE WHEN status = 'completed' THEN 
            (julianday(updated_at) - julianday(created_at)) * 24 * 60 
            ELSE NULL END) as avg_completion_time_minutes
        FROM tasks
      `, [], (err, rows: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows[0]);
        }
      });
    });
  }

  private rowToTask(row: any): Task {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      priority: row.priority as TaskPriority,
      requiredCapabilities: JSON.parse(row.required_capabilities || '[]'),
      assignedAgent: row.assigned_agent,
      status: row.status as TaskStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      dueDate: row.due_date ? new Date(row.due_date) : undefined,
      estimatedDuration: row.estimated_duration,
      dependencies: JSON.parse(row.dependencies || '[]'),
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  close(): void {
    this.db.close();
  }
}
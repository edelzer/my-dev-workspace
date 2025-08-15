import { open, Database as SQLiteDatabase } from 'sqlite';
import sqlite3 from 'sqlite3';
import {
  WorkflowMetrics,
  AgentPerformance,
  WorkflowBottleneck,
  OptimizationRecommendation,
  ProductivityTrend,
  WorkflowSession,
  PerformanceReport,
  AnalyticsEvent,
  AnalyticsConfig
} from './types.js';

export class Database {
  private db: SQLiteDatabase | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    this.db = await open({
      filename: 'workflow_analytics.db',
      driver: sqlite3.Database
    });

    await this.createTables();
  }

  private async createTables() {
    if (!this.db) return;

    // Workflow metrics table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_metrics (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        agent_id TEXT NOT NULL,
        agent_type TEXT NOT NULL,
        task_id TEXT,
        operation TEXT NOT NULL,
        duration INTEGER NOT NULL,
        success INTEGER NOT NULL,
        error_type TEXT,
        memory_usage REAL,
        cpu_usage REAL,
        context_size INTEGER,
        output_quality REAL,
        metadata TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Agent performance table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_performance (
        agent_id TEXT PRIMARY KEY,
        agent_type TEXT NOT NULL,
        total_tasks INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0,
        average_duration REAL DEFAULT 0,
        average_quality REAL DEFAULT 0,
        total_uptime INTEGER DEFAULT 0,
        last_activity INTEGER,
        capabilities TEXT,
        current_load REAL DEFAULT 0,
        trend_direction TEXT DEFAULT 'stable',
        efficiency REAL DEFAULT 0,
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Workflow bottlenecks table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_bottlenecks (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        agent_id TEXT,
        description TEXT NOT NULL,
        impact_metrics TEXT,
        detected_at INTEGER NOT NULL,
        resolved_at INTEGER,
        confidence REAL NOT NULL,
        recommendations TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Optimization recommendations table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS optimization_recommendations (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        priority TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        action_items TEXT,
        estimated_impact TEXT,
        implementation TEXT,
        created_at INTEGER NOT NULL,
        status TEXT DEFAULT 'pending'
      )
    `);

    // Workflow sessions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflow_sessions (
        id TEXT PRIMARY KEY,
        start_time INTEGER NOT NULL,
        end_time INTEGER,
        primary_agent TEXT NOT NULL,
        collaborating_agents TEXT,
        tasks TEXT,
        total_operations INTEGER DEFAULT 0,
        successful_operations INTEGER DEFAULT 0,
        average_quality REAL DEFAULT 0,
        total_duration INTEGER DEFAULT 0,
        bottlenecks_encountered TEXT,
        optimizations_applied TEXT,
        outcome TEXT,
        lessons TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Analytics events table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        source TEXT NOT NULL,
        data TEXT,
        processed INTEGER DEFAULT 0,
        priority TEXT DEFAULT 'medium',
        created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Configuration table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_config (
        id TEXT PRIMARY KEY DEFAULT 'default',
        config TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
      )
    `);

    // Create indexes for performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON workflow_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_metrics_agent ON workflow_metrics(agent_id);
      CREATE INDEX IF NOT EXISTS idx_bottlenecks_severity ON workflow_bottlenecks(severity);
      CREATE INDEX IF NOT EXISTS idx_bottlenecks_resolved ON workflow_bottlenecks(resolved_at);
      CREATE INDEX IF NOT EXISTS idx_recommendations_priority ON optimization_recommendations(priority);
      CREATE INDEX IF NOT EXISTS idx_recommendations_status ON optimization_recommendations(status);
      CREATE INDEX IF NOT EXISTS idx_events_processed ON analytics_events(processed);
      CREATE INDEX IF NOT EXISTS idx_events_priority ON analytics_events(priority);
    `);
  }

  async saveMetric(metric: WorkflowMetrics) {
    if (!this.db) return;

    await this.db.run(
      `INSERT INTO workflow_metrics (
        id, timestamp, agent_id, agent_type, task_id, operation, duration,
        success, error_type, memory_usage, cpu_usage, context_size,
        output_quality, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      metric.id,
      metric.timestamp,
      metric.agentId,
      metric.agentType,
      metric.taskId,
      metric.operation,
      metric.duration,
      metric.success ? 1 : 0,
      metric.errorType,
      metric.memoryUsage,
      metric.cpuUsage,
      metric.contextSize,
      metric.outputQuality,
      JSON.stringify(metric.metadata)
    );

    // Update agent performance
    await this.updateAgentPerformance(metric);
  }

  private async updateAgentPerformance(metric: WorkflowMetrics) {
    if (!this.db) return;

    const existing = await this.db.get(
      'SELECT * FROM agent_performance WHERE agent_id = ?',
      metric.agentId
    );

    if (existing) {
      const newTotal = existing.total_tasks + 1;
      const newSuccessRate = existing.success_rate * (existing.total_tasks / newTotal) + 
                             (metric.success ? 100 : 0) / newTotal;
      const newAvgDuration = (existing.average_duration * existing.total_tasks + metric.duration) / newTotal;
      const newAvgQuality = (existing.average_quality * existing.total_tasks + metric.outputQuality) / newTotal;

      await this.db.run(
        `UPDATE agent_performance SET
          total_tasks = ?,
          success_rate = ?,
          average_duration = ?,
          average_quality = ?,
          last_activity = ?,
          updated_at = ?
        WHERE agent_id = ?`,
        newTotal,
        newSuccessRate,
        newAvgDuration,
        newAvgQuality,
        metric.timestamp,
        Date.now(),
        metric.agentId
      );
    } else {
      await this.db.run(
        `INSERT INTO agent_performance (
          agent_id, agent_type, total_tasks, success_rate, average_duration,
          average_quality, last_activity
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        metric.agentId,
        metric.agentType,
        1,
        metric.success ? 100 : 0,
        metric.duration,
        metric.outputQuality,
        metric.timestamp
      );
    }
  }

  async getRecentMetrics(minutes: number): Promise<WorkflowMetrics[]> {
    if (!this.db) return [];

    const cutoff = Date.now() - (minutes * 60 * 1000);
    const rows = await this.db.all(
      'SELECT * FROM workflow_metrics WHERE timestamp > ? ORDER BY timestamp DESC',
      cutoff
    );

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      agentId: row.agent_id,
      agentType: row.agent_type,
      taskId: row.task_id,
      operation: row.operation,
      duration: row.duration,
      success: row.success === 1,
      errorType: row.error_type,
      memoryUsage: row.memory_usage,
      cpuUsage: row.cpu_usage,
      contextSize: row.context_size,
      outputQuality: row.output_quality,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  async saveBottleneck(bottleneck: WorkflowBottleneck) {
    if (!this.db) return;

    await this.db.run(
      `INSERT INTO workflow_bottlenecks (
        id, type, severity, agent_id, description, impact_metrics,
        detected_at, confidence, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      bottleneck.id,
      bottleneck.type,
      bottleneck.severity,
      bottleneck.agentId,
      bottleneck.description,
      JSON.stringify(bottleneck.impactMetrics),
      bottleneck.detectedAt,
      bottleneck.confidence,
      JSON.stringify(bottleneck.recommendations)
    );
  }

  async getUnresolvedBottlenecks(): Promise<WorkflowBottleneck[]> {
    if (!this.db) return [];

    const rows = await this.db.all(
      'SELECT * FROM workflow_bottlenecks WHERE resolved_at IS NULL ORDER BY severity, detected_at DESC'
    );

    return rows.map(row => ({
      id: row.id,
      type: row.type,
      severity: row.severity,
      agentId: row.agent_id,
      description: row.description,
      impactMetrics: JSON.parse(row.impact_metrics || '{}'),
      detectedAt: row.detected_at,
      resolvedAt: row.resolved_at,
      confidence: row.confidence,
      recommendations: JSON.parse(row.recommendations || '[]')
    }));
  }

  async saveRecommendations(recommendations: OptimizationRecommendation[]) {
    if (!this.db) return;

    for (const rec of recommendations) {
      await this.db.run(
        `INSERT OR REPLACE INTO optimization_recommendations (
          id, type, priority, title, description, action_items,
          estimated_impact, implementation, created_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        rec.id,
        rec.type,
        rec.priority,
        rec.title,
        rec.description,
        JSON.stringify(rec.actionItems),
        JSON.stringify(rec.estimatedImpact),
        JSON.stringify(rec.implementation),
        rec.createdAt,
        rec.status
      );
    }
  }

  async getRecommendations(priority?: string, type?: string): Promise<OptimizationRecommendation[]> {
    if (!this.db) return [];

    let query = 'SELECT * FROM optimization_recommendations WHERE status = "pending"';
    const params: any[] = [];

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY CASE priority WHEN "immediate" THEN 1 WHEN "high" THEN 2 WHEN "medium" THEN 3 ELSE 4 END';

    const rows = await this.db.all(query, ...params);

    return rows.map(row => ({
      id: row.id,
      type: row.type,
      priority: row.priority,
      title: row.title,
      description: row.description,
      actionItems: JSON.parse(row.action_items || '[]'),
      estimatedImpact: JSON.parse(row.estimated_impact || '{}'),
      implementation: JSON.parse(row.implementation || '{}'),
      createdAt: row.created_at,
      status: row.status
    }));
  }

  async saveSession(session: WorkflowSession) {
    if (!this.db) return;

    await this.db.run(
      `INSERT INTO workflow_sessions (
        id, start_time, primary_agent, collaborating_agents, tasks,
        total_operations, successful_operations, average_quality,
        total_duration, outcome
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      session.id,
      session.startTime,
      session.primaryAgent,
      JSON.stringify(session.collaboratingAgents),
      JSON.stringify(session.tasks),
      session.totalOperations,
      session.successfulOperations,
      session.averageQuality,
      session.totalDuration,
      session.outcome
    );
  }

  async updateSession(session: WorkflowSession) {
    if (!this.db) return;

    await this.db.run(
      `UPDATE workflow_sessions SET
        end_time = ?, total_operations = ?, successful_operations = ?,
        average_quality = ?, total_duration = ?, bottlenecks_encountered = ?,
        optimizations_applied = ?, outcome = ?, lessons = ?
      WHERE id = ?`,
      session.endTime,
      session.totalOperations,
      session.successfulOperations,
      session.averageQuality,
      session.totalDuration,
      JSON.stringify(session.bottlenecksEncountered),
      JSON.stringify(session.optimizationsApplied),
      session.outcome,
      JSON.stringify(session.lessons),
      session.id
    );
  }

  async saveEvent(event: AnalyticsEvent) {
    if (!this.db) return;

    await this.db.run(
      `INSERT INTO analytics_events (
        id, type, timestamp, source, data, processed, priority
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      event.id,
      event.type,
      event.timestamp,
      event.source,
      JSON.stringify(event.data),
      event.processed ? 1 : 0,
      event.priority
    );
  }

  async saveConfig(config: AnalyticsConfig) {
    if (!this.db) return;

    await this.db.run(
      `INSERT OR REPLACE INTO analytics_config (id, config, updated_at)
      VALUES ('default', ?, ?)`,
      JSON.stringify(config),
      Date.now()
    );
  }

  async getProductivityTrends(period: string, agentId?: string): Promise<ProductivityTrend[]> {
    if (!this.db) return [];

    // Calculate period duration in milliseconds
    const periodMs = {
      '1h': 3600000,
      '1d': 86400000,
      '1w': 604800000,
      '1m': 2592000000
    }[period] || 3600000;

    const now = Date.now();
    const startTime = now - periodMs * 7; // Get 7 periods of data

    let query = 'SELECT * FROM workflow_metrics WHERE timestamp > ?';
    const params: any[] = [startTime];

    if (agentId) {
      query += ' AND agent_id = ?';
      params.push(agentId);
    }

    const rows = await this.db.all(query, ...params);
    const trends: ProductivityTrend[] = [];

    // Group metrics by period
    for (let i = 0; i < 7; i++) {
      const periodStart = now - (i + 1) * periodMs;
      const periodEnd = now - i * periodMs;
      
      const periodMetrics = rows.filter(r => 
        r.timestamp >= periodStart && r.timestamp < periodEnd
      );

      if (periodMetrics.length > 0) {
        const totalTasks = periodMetrics.length;
        const completionRate = (periodMetrics.filter(m => m.success === 1).length / totalTasks) * 100;
        const averageQuality = periodMetrics.reduce((sum, m) => sum + m.output_quality, 0) / totalTasks;
        const averageDuration = periodMetrics.reduce((sum, m) => sum + m.duration, 0) / totalTasks;
        const errorRate = (periodMetrics.filter(m => m.success === 0).length / totalTasks) * 100;
        const resourceUtilization = ((periodMetrics.reduce((sum, m) => sum + m.cpu_usage + m.memory_usage, 0) / (totalTasks * 2)) * 100);

        trends.push({
          period,
          startTime: periodStart,
          endTime: periodEnd,
          metrics: {
            totalTasks,
            completionRate,
            averageQuality,
            averageDuration,
            errorRate,
            resourceUtilization
          },
          predictions: {
            nextPeriodEstimate: totalTasks * 1.05, // Simple growth prediction
            trendDirection: i > 0 && trends[0] ? 
              (totalTasks > trends[0].metrics.totalTasks ? 'up' : 
               totalTasks < trends[0].metrics.totalTasks ? 'down' : 'stable') : 'stable',
            confidence: 0.75,
            factors: ['Historical patterns', 'Current workload', 'Agent availability']
          }
        });
      }
    }

    return trends.reverse();
  }

  async generateReport(type: string, startDate?: string, endDate?: string): Promise<PerformanceReport> {
    if (!this.db) return {} as PerformanceReport;

    const now = Date.now();
    let start: number, end: number;

    switch (type) {
      case 'daily':
        start = now - 86400000;
        end = now;
        break;
      case 'weekly':
        start = now - 604800000;
        end = now;
        break;
      case 'monthly':
        start = now - 2592000000;
        end = now;
        break;
      default:
        start = startDate ? new Date(startDate).getTime() : now - 86400000;
        end = endDate ? new Date(endDate).getTime() : now;
    }

    const metrics = await this.db.all(
      'SELECT * FROM workflow_metrics WHERE timestamp BETWEEN ? AND ?',
      start, end
    );

    const sessions = await this.db.all(
      'SELECT * FROM workflow_sessions WHERE start_time BETWEEN ? AND ?',
      start, end
    );

    const bottlenecks = await this.getUnresolvedBottlenecks();
    const recommendations = await this.getRecommendations();

    const totalTasks = metrics.length;
    const successfulTasks = metrics.filter(m => m.success === 1).length;
    const overallSuccessRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0;
    const avgDuration = totalTasks > 0 ? 
      metrics.reduce((sum, m) => sum + m.duration, 0) / totalTasks : 0;

    return {
      id: `report_${Date.now()}`,
      type,
      generatedAt: Date.now(),
      period: { start, end },
      summary: {
        totalSessions: sessions.length,
        totalTasks,
        overallSuccessRate,
        averageSessionDuration: avgDuration,
        topPerformingAgents: [], // Would need more analysis
        majorBottlenecks: bottlenecks.slice(0, 3).map(b => b.description),
        keyRecommendations: recommendations.slice(0, 3).map(r => r.title)
      },
      trends: await this.getProductivityTrends('1d'),
      agentPerformance: [],
      bottleneckAnalysis: bottlenecks,
      recommendations,
      systemHealth: {} as any,
      insights: [
        `Processed ${totalTasks} tasks with ${overallSuccessRate.toFixed(1)}% success rate`,
        `Average task duration: ${(avgDuration / 1000).toFixed(2)} seconds`,
        `${bottlenecks.length} active bottlenecks detected`,
        `${recommendations.length} optimization opportunities identified`
      ],
      actionItems: recommendations.slice(0, 5).map(r => r.title)
    };
  }
}
/**
 * JSON Mode Optimizer Database Layer
 * Handles persistent storage for configurations, schemas, and analytics
 */

import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';
import {
  JsonModeConfig,
  JsonOptimizationResult,
  JsonWorkflowIntegration,
  SchemaEvolution,
  AIOutputConsistency,
  JsonRecoveryStrategy,
  JsonModeSession,
  PerformanceMetrics
} from './types.js';

export class JsonModeDatabase {
  private db: sqlite3.Database;
  private getAsync: Function;
  private allAsync: Function;
  private runAsync: Function;

  constructor(dbPath: string = './json-mode-optimizer.db') {
    this.db = new sqlite3.Database(dbPath);
    this.getAsync = promisify(this.db.get.bind(this.db));
    this.allAsync = promisify(this.db.all.bind(this.db));
    this.runAsync = promisify(this.db.run.bind(this.db));
  }

  async initialize(): Promise<void> {
    const schema = `
      -- JSON Mode Configurations
      CREATE TABLE IF NOT EXISTS json_configs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        schema_json TEXT NOT NULL,
        strict INTEGER DEFAULT 1,
        optimization_level TEXT DEFAULT 'standard',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0.0
      );

      -- Optimization Results
      CREATE TABLE IF NOT EXISTS optimization_results (
        id TEXT PRIMARY KEY,
        config_id TEXT REFERENCES json_configs(id),
        success INTEGER NOT NULL,
        output_json TEXT,
        errors_json TEXT,
        optimizations_json TEXT,
        response_time REAL,
        validation_time REAL,
        output_size INTEGER,
        accuracy_score REAL,
        consistency_score REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Workflow Integrations
      CREATE TABLE IF NOT EXISTS workflow_integrations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        config_ids_json TEXT NOT NULL,
        execution_order_json TEXT NOT NULL,
        fallback_strategy TEXT DEFAULT 'retry',
        max_retries INTEGER DEFAULT 3,
        timeout_ms INTEGER DEFAULT 30000,
        success_threshold REAL DEFAULT 0.8,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Schema Evolution Tracking
      CREATE TABLE IF NOT EXISTS schema_evolutions (
        id TEXT PRIMARY KEY,
        config_id TEXT REFERENCES json_configs(id),
        version INTEGER NOT NULL,
        changes_json TEXT NOT NULL,
        migration_script TEXT,
        backward_compatible INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- AI Output Consistency Analysis
      CREATE TABLE IF NOT EXISTS consistency_analysis (
        id TEXT PRIMARY KEY,
        config_id TEXT REFERENCES json_configs(id),
        samples INTEGER NOT NULL,
        consistency_rate REAL NOT NULL,
        variations_json TEXT,
        stability_score REAL,
        recommendations_json TEXT,
        analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Recovery Strategies
      CREATE TABLE IF NOT EXISTS recovery_strategies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        triggers_json TEXT NOT NULL,
        actions_json TEXT NOT NULL,
        priority INTEGER DEFAULT 5,
        success_rate REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Active Sessions
      CREATE TABLE IF NOT EXISTS json_sessions (
        id TEXT PRIMARY KEY,
        config_id TEXT REFERENCES json_configs(id),
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        attempts_json TEXT DEFAULT '[]',
        final_result_json TEXT,
        status TEXT DEFAULT 'active'
      );

      -- Performance Metrics Aggregation
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id TEXT PRIMARY KEY,
        config_id TEXT REFERENCES json_configs(id),
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for Performance
      CREATE INDEX IF NOT EXISTS idx_config_usage ON json_configs(usage_count DESC);
      CREATE INDEX IF NOT EXISTS idx_results_config ON optimization_results(config_id);
      CREATE INDEX IF NOT EXISTS idx_results_success ON optimization_results(success, created_at);
      CREATE INDEX IF NOT EXISTS idx_metrics_config ON performance_metrics(config_id, metric_name);
      CREATE INDEX IF NOT EXISTS idx_sessions_status ON json_sessions(status, start_time);
      CREATE INDEX IF NOT EXISTS idx_evolutions_config ON schema_evolutions(config_id, version);
    `;

    await this.runAsync(schema);
    console.error('[JSON Mode DB] Database initialized with schema');
  }

  async createConfig(config: JsonModeConfig): Promise<void> {
    const sql = `
      INSERT INTO json_configs (
        id, name, description, schema_json, strict, optimization_level,
        usage_count, success_rate
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runAsync(sql, [
      config.id,
      config.name,
      config.description,
      JSON.stringify(config.schema),
      config.strict ? 1 : 0,
      config.optimizationLevel,
      config.usageCount,
      config.successRate
    ]);
  }

  async getConfig(id: string): Promise<JsonModeConfig | null> {
    const sql = 'SELECT * FROM json_configs WHERE id = ?';
    const row = await this.getAsync(sql, [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      schema: JSON.parse(row.schema_json),
      strict: row.strict === 1,
      optimizationLevel: row.optimization_level,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      usageCount: row.usage_count,
      successRate: row.success_rate
    };
  }

  async getAllConfigs(): Promise<JsonModeConfig[]> {
    const sql = 'SELECT * FROM json_configs ORDER BY usage_count DESC, success_rate DESC';
    const rows = await this.allAsync(sql);
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      schema: JSON.parse(row.schema_json),
      strict: row.strict === 1,
      optimizationLevel: row.optimization_level,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      usageCount: row.usage_count,
      successRate: row.success_rate
    }));
  }

  async updateConfigStats(id: string, success: boolean): Promise<void> {
    const sql = `
      UPDATE json_configs 
      SET usage_count = usage_count + 1,
          success_rate = (success_rate * usage_count + ?) / (usage_count + 1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await this.runAsync(sql, [success ? 1 : 0, id]);
  }

  async saveOptimizationResult(result: JsonOptimizationResult): Promise<void> {
    const sql = `
      INSERT INTO optimization_results (
        id, config_id, success, output_json, errors_json, optimizations_json,
        response_time, validation_time, output_size, accuracy_score, consistency_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const id = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.runAsync(sql, [
      id,
      result.configId,
      result.success ? 1 : 0,
      JSON.stringify(result.output),
      JSON.stringify(result.errors),
      JSON.stringify(result.optimizations),
      result.performance.responseTime,
      result.performance.validationTime,
      result.performance.outputSize,
      result.performance.accuracyScore,
      result.performance.consistencyScore
    ]);
  }

  async getConfigAnalytics(configId: string, days: number = 7): Promise<PerformanceMetrics[]> {
    const sql = `
      SELECT * FROM optimization_results 
      WHERE config_id = ? 
      AND created_at > datetime('now', '-' || ? || ' days')
      ORDER BY created_at DESC
    `;
    
    const rows = await this.allAsync(sql, [configId, days]);
    
    return rows.map((row: any) => ({
      responseTime: row.response_time,
      validationTime: row.validation_time,
      outputSize: row.output_size,
      accuracyScore: row.accuracy_score,
      consistencyScore: row.consistency_score,
      compressionRatio: row.output_size > 0 ? 1.0 : undefined
    }));
  }

  async createWorkflowIntegration(workflow: JsonWorkflowIntegration): Promise<void> {
    const sql = `
      INSERT INTO workflow_integrations (
        id, name, config_ids_json, execution_order_json, fallback_strategy,
        max_retries, timeout_ms, success_threshold
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runAsync(sql, [
      workflow.id,
      workflow.name,
      JSON.stringify(workflow.configIds),
      JSON.stringify(workflow.executionOrder),
      workflow.fallbackStrategy,
      workflow.maxRetries,
      workflow.timeoutMs,
      workflow.successThreshold
    ]);
  }

  async getWorkflowIntegration(id: string): Promise<JsonWorkflowIntegration | null> {
    const sql = 'SELECT * FROM workflow_integrations WHERE id = ?';
    const row = await this.getAsync(sql, [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      configIds: JSON.parse(row.config_ids_json),
      executionOrder: JSON.parse(row.execution_order_json),
      fallbackStrategy: row.fallback_strategy,
      maxRetries: row.max_retries,
      timeoutMs: row.timeout_ms,
      successThreshold: row.success_threshold
    };
  }

  async saveConsistencyAnalysis(analysis: AIOutputConsistency): Promise<void> {
    const sql = `
      INSERT INTO consistency_analysis (
        id, config_id, samples, consistency_rate, variations_json,
        stability_score, recommendations_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.runAsync(sql, [
      id,
      analysis.configId,
      analysis.samples,
      analysis.consistencyRate,
      JSON.stringify(analysis.commonVariations),
      analysis.stabilityScore,
      JSON.stringify(analysis.recommendedAdjustments)
    ]);
  }

  async getTopPerformingConfigs(limit: number = 5): Promise<JsonModeConfig[]> {
    const sql = `
      SELECT * FROM json_configs 
      WHERE usage_count > 5 
      ORDER BY success_rate DESC, usage_count DESC 
      LIMIT ?
    `;
    
    const rows = await this.allAsync(sql, [limit]);
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      schema: JSON.parse(row.schema_json),
      strict: row.strict === 1,
      optimizationLevel: row.optimization_level,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      usageCount: row.usage_count,
      successRate: row.success_rate
    }));
  }

  async cleanup(daysToKeep: number = 30): Promise<void> {
    const queries = [
      `DELETE FROM optimization_results WHERE created_at < datetime('now', '-' || ? || ' days')`,
      `DELETE FROM json_sessions WHERE status = 'completed' AND end_time < datetime('now', '-' || ? || ' days')`,
      `DELETE FROM performance_metrics WHERE timestamp < datetime('now', '-' || ? || ' days')`
    ];

    for (const sql of queries) {
      await this.runAsync(sql, [daysToKeep]);
    }
    
    console.error(`[JSON Mode DB] Cleaned up records older than ${daysToKeep} days`);
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
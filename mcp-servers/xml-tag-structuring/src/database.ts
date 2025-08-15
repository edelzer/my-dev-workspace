/**
 * XML Tag Structuring Database Layer
 * Handles persistent storage for templates, workflows, and analytics
 */

import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';
import {
  XmlTemplate,
  XmlPromptResult,
  XmlWorkflowPattern,
  XmlTemplateLibrary,
  XmlOptimizationSession,
  XmlAnalytics,
  PatternAnalysis,
  EffectivenessMetrics
} from './types.js';

export class XmlStructuringDatabase {
  private db: sqlite3.Database;
  private getAsync: Function;
  private allAsync: Function;
  private runAsync: Function;

  constructor(dbPath: string = './xml-tag-structuring.db') {
    this.db = new sqlite3.Database(dbPath);
    this.getAsync = promisify(this.db.get.bind(this.db));
    this.allAsync = promisify(this.db.all.bind(this.db));
    this.runAsync = promisify(this.db.run.bind(this.db));
  }

  async initialize(): Promise<void> {
    const schema = `
      -- XML Templates
      CREATE TABLE IF NOT EXISTS xml_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'custom',
        structure_json TEXT NOT NULL,
        variables_json TEXT DEFAULT '[]',
        constraints_json TEXT DEFAULT '[]',
        optimization_level TEXT DEFAULT 'standard',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        usage_count INTEGER DEFAULT 0,
        effectiveness_score REAL DEFAULT 0.0
      );

      -- XML Prompt Results
      CREATE TABLE IF NOT EXISTS xml_results (
        id TEXT PRIMARY KEY,
        template_id TEXT REFERENCES xml_templates(id),
        success INTEGER NOT NULL,
        generated_xml TEXT,
        parsed_structure_json TEXT,
        validation_errors_json TEXT DEFAULT '[]',
        optimizations_json TEXT DEFAULT '[]',
        performance_json TEXT,
        effectiveness_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- XML Workflow Patterns
      CREATE TABLE IF NOT EXISTS workflow_patterns (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        type TEXT DEFAULT 'sequential',
        steps_json TEXT NOT NULL,
        triggers_json TEXT DEFAULT '[]',
        conditions_json TEXT DEFAULT '[]',
        outputs_json TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        usage_count INTEGER DEFAULT 0
      );

      -- Template Libraries
      CREATE TABLE IF NOT EXISTS template_libraries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        template_ids_json TEXT DEFAULT '[]',
        shared_components_json TEXT DEFAULT '[]',
        compatibility_json TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Optimization Sessions
      CREATE TABLE IF NOT EXISTS optimization_sessions (
        id TEXT PRIMARY KEY,
        template_id TEXT REFERENCES xml_templates(id),
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        iterations_json TEXT DEFAULT '[]',
        best_result_json TEXT,
        status TEXT DEFAULT 'active',
        goals_json TEXT DEFAULT '[]'
      );

      -- Pattern Analysis
      CREATE TABLE IF NOT EXISTS pattern_analysis (
        id TEXT PRIMARY KEY,
        pattern TEXT NOT NULL,
        frequency INTEGER DEFAULT 0,
        effectiveness REAL DEFAULT 0.0,
        templates_json TEXT DEFAULT '[]',
        context TEXT,
        analyzed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Effectiveness Metrics
      CREATE TABLE IF NOT EXISTS effectiveness_metrics (
        id TEXT PRIMARY KEY,
        template_id TEXT REFERENCES xml_templates(id),
        structure_clarity REAL DEFAULT 0.0,
        semantic_richness REAL DEFAULT 0.0,
        instruction_precision REAL DEFAULT 0.0,
        context_preservation REAL DEFAULT 0.0,
        ai_comprehensibility REAL DEFAULT 0.0,
        overall_effectiveness REAL DEFAULT 0.0,
        measured_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Usage Analytics
      CREATE TABLE IF NOT EXISTS usage_analytics (
        id TEXT PRIMARY KEY,
        template_id TEXT REFERENCES xml_templates(id),
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        context TEXT
      );

      -- Shared Components
      CREATE TABLE IF NOT EXISTS shared_components (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        definition_json TEXT NOT NULL,
        usage_json TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Template Relationships
      CREATE TABLE IF NOT EXISTS template_relationships (
        id TEXT PRIMARY KEY,
        source_template_id TEXT REFERENCES xml_templates(id),
        target_template_id TEXT REFERENCES xml_templates(id),
        relationship_type TEXT NOT NULL,
        strength REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for Performance
      CREATE INDEX IF NOT EXISTS idx_templates_category ON xml_templates(category, effectiveness_score DESC);
      CREATE INDEX IF NOT EXISTS idx_templates_usage ON xml_templates(usage_count DESC, effectiveness_score DESC);
      CREATE INDEX IF NOT EXISTS idx_results_template ON xml_results(template_id, success, created_at);
      CREATE INDEX IF NOT EXISTS idx_results_success ON xml_results(success, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_workflows_type ON workflow_patterns(type, usage_count DESC);
      CREATE INDEX IF NOT EXISTS idx_sessions_template ON optimization_sessions(template_id, status);
      CREATE INDEX IF NOT EXISTS idx_patterns_frequency ON pattern_analysis(frequency DESC, effectiveness DESC);
      CREATE INDEX IF NOT EXISTS idx_metrics_template ON effectiveness_metrics(template_id, overall_effectiveness DESC);
      CREATE INDEX IF NOT EXISTS idx_analytics_metric ON usage_analytics(metric_name, timestamp);
      CREATE INDEX IF NOT EXISTS idx_components_type ON shared_components(type, name);
      CREATE INDEX IF NOT EXISTS idx_relationships_source ON template_relationships(source_template_id, strength DESC);
    `;

    await this.runAsync(schema);
    console.error('[XML Structuring DB] Database initialized with schema');
  }

  async createTemplate(template: XmlTemplate): Promise<void> {
    const sql = `
      INSERT INTO xml_templates (
        id, name, description, category, structure_json, variables_json,
        constraints_json, optimization_level, usage_count, effectiveness_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runAsync(sql, [
      template.id,
      template.name,
      template.description,
      template.category,
      JSON.stringify(template.structure),
      JSON.stringify(template.variables),
      JSON.stringify(template.constraints),
      template.optimizationLevel,
      template.usageCount,
      template.effectivenessScore
    ]);
  }

  async getTemplate(id: string): Promise<XmlTemplate | null> {
    const sql = 'SELECT * FROM xml_templates WHERE id = ?';
    const row = await this.getAsync(sql, [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      structure: JSON.parse(row.structure_json),
      variables: JSON.parse(row.variables_json),
      constraints: JSON.parse(row.constraints_json),
      optimizationLevel: row.optimization_level,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      usageCount: row.usage_count,
      effectivenessScore: row.effectiveness_score
    };
  }

  async getAllTemplates(category?: string): Promise<XmlTemplate[]> {
    let sql = 'SELECT * FROM xml_templates';
    let params: any[] = [];
    
    if (category) {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY effectiveness_score DESC, usage_count DESC';
    
    const rows = await this.allAsync(sql, params);
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      structure: JSON.parse(row.structure_json),
      variables: JSON.parse(row.variables_json),
      constraints: JSON.parse(row.constraints_json),
      optimizationLevel: row.optimization_level,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      usageCount: row.usage_count,
      effectivenessScore: row.effectiveness_score
    }));
  }

  async updateTemplateStats(id: string, effectiveness: number): Promise<void> {
    const sql = `
      UPDATE xml_templates 
      SET usage_count = usage_count + 1,
          effectiveness_score = (effectiveness_score * usage_count + ?) / (usage_count + 1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    await this.runAsync(sql, [effectiveness, id]);
  }

  async savePromptResult(result: XmlPromptResult): Promise<void> {
    const sql = `
      INSERT INTO xml_results (
        id, template_id, success, generated_xml, parsed_structure_json,
        validation_errors_json, optimizations_json, performance_json, effectiveness_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const id = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.runAsync(sql, [
      id,
      result.templateId,
      result.success ? 1 : 0,
      result.generatedXml,
      JSON.stringify(result.parsedStructure),
      JSON.stringify(result.validationErrors),
      JSON.stringify(result.optimizations),
      JSON.stringify(result.performance),
      JSON.stringify(result.effectiveness)
    ]);
  }

  async createWorkflowPattern(pattern: XmlWorkflowPattern): Promise<void> {
    const sql = `
      INSERT INTO workflow_patterns (
        id, name, description, type, steps_json, triggers_json,
        conditions_json, outputs_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runAsync(sql, [
      pattern.id,
      pattern.name,
      pattern.description,
      pattern.type,
      JSON.stringify(pattern.steps),
      JSON.stringify(pattern.triggers),
      JSON.stringify(pattern.conditions),
      JSON.stringify(pattern.outputs)
    ]);
  }

  async getWorkflowPattern(id: string): Promise<XmlWorkflowPattern | null> {
    const sql = 'SELECT * FROM workflow_patterns WHERE id = ?';
    const row = await this.getAsync(sql, [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      steps: JSON.parse(row.steps_json),
      triggers: JSON.parse(row.triggers_json),
      conditions: JSON.parse(row.conditions_json),
      outputs: JSON.parse(row.outputs_json)
    };
  }

  async createTemplateLibrary(library: XmlTemplateLibrary): Promise<void> {
    const sql = `
      INSERT INTO template_libraries (
        id, name, description, category, template_ids_json,
        shared_components_json, compatibility_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.runAsync(sql, [
      library.id,
      library.name,
      library.description,
      library.category,
      JSON.stringify(library.templates),
      JSON.stringify(library.sharedComponents),
      JSON.stringify(library.compatibility)
    ]);
  }

  async saveEffectivenessMetrics(templateId: string, metrics: EffectivenessMetrics): Promise<void> {
    const sql = `
      INSERT INTO effectiveness_metrics (
        id, template_id, structure_clarity, semantic_richness, instruction_precision,
        context_preservation, ai_comprehensibility, overall_effectiveness
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const id = `metrics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await this.runAsync(sql, [
      id,
      templateId,
      metrics.structureClarity,
      metrics.semanticRichness,
      metrics.instructionPrecision,
      metrics.contextPreservation,
      metrics.aiComprehensibility,
      metrics.overallEffectiveness
    ]);
  }

  async savePatternAnalysis(analysis: PatternAnalysis): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO pattern_analysis (
        id, pattern, frequency, effectiveness, templates_json, context
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const id = `pattern_${Buffer.from(analysis.pattern).toString('base64').slice(0, 16)}`;
    
    await this.runAsync(sql, [
      id,
      analysis.pattern,
      analysis.frequency,
      analysis.effectiveness,
      JSON.stringify(analysis.templates),
      analysis.context
    ]);
  }

  async getTopPerformingTemplates(limit: number = 10, category?: string): Promise<XmlTemplate[]> {
    let sql = `
      SELECT * FROM xml_templates 
      WHERE usage_count > 0 AND effectiveness_score > 0
    `;
    
    let params: any[] = [];
    
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ` ORDER BY effectiveness_score DESC, usage_count DESC LIMIT ?`;
    params.push(limit);
    
    const rows = await this.allAsync(sql, params);
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      structure: JSON.parse(row.structure_json),
      variables: JSON.parse(row.variables_json),
      constraints: JSON.parse(row.constraints_json),
      optimizationLevel: row.optimization_level,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      usageCount: row.usage_count,
      effectivenessScore: row.effectiveness_score
    }));
  }

  async getTemplateAnalytics(templateId: string, days: number = 30): Promise<any> {
    const sql = `
      SELECT 
        COUNT(*) as total_usage,
        AVG(CASE WHEN success = 1 THEN 1.0 ELSE 0.0 END) as success_rate,
        AVG(json_extract(effectiveness_json, '$.overallEffectiveness')) as avg_effectiveness,
        AVG(json_extract(performance_json, '$.generationTime')) as avg_generation_time,
        AVG(json_extract(performance_json, '$.complexityScore')) as avg_complexity
      FROM xml_results 
      WHERE template_id = ? 
      AND created_at > datetime('now', '-' || ? || ' days')
    `;
    
    const result = await this.getAsync(sql, [templateId, days]);
    return result || {};
  }

  async getSystemAnalytics(): Promise<XmlAnalytics> {
    const [totalTemplates, totalUsage, avgEffectiveness, topTemplates, commonPatterns] = await Promise.all([
      this.getAsync('SELECT COUNT(*) as count FROM xml_templates'),
      this.getAsync('SELECT SUM(usage_count) as total FROM xml_templates'),
      this.getAsync('SELECT AVG(effectiveness_score) as avg FROM xml_templates WHERE usage_count > 0'),
      this.allAsync('SELECT id FROM xml_templates ORDER BY effectiveness_score DESC LIMIT 5'),
      this.allAsync('SELECT pattern, frequency, effectiveness FROM pattern_analysis ORDER BY frequency DESC LIMIT 10')
    ]);

    return {
      totalTemplates: totalTemplates?.count || 0,
      totalUsage: totalUsage?.total || 0,
      averageEffectiveness: avgEffectiveness?.avg || 0,
      topPerformingTemplates: topTemplates.map((t: any) => t.id),
      commonPatterns: commonPatterns.map((p: any) => ({
        pattern: p.pattern,
        frequency: p.frequency,
        effectiveness: p.effectiveness,
        templates: [],
        context: ''
      })),
      optimizationTrends: [], // Would be populated with time-series data
      effectivenessFactors: [] // Would be populated with factor analysis
    };
  }

  async createOptimizationSession(session: XmlOptimizationSession): Promise<void> {
    const sql = `
      INSERT INTO optimization_sessions (
        id, template_id, start_time, iterations_json, goals_json, status
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    await this.runAsync(sql, [
      session.id,
      session.templateId,
      session.startTime.toISOString(),
      JSON.stringify(session.iterations),
      JSON.stringify(session.goals),
      session.status
    ]);
  }

  async updateOptimizationSession(session: XmlOptimizationSession): Promise<void> {
    const sql = `
      UPDATE optimization_sessions 
      SET end_time = ?, iterations_json = ?, best_result_json = ?, status = ?
      WHERE id = ?
    `;
    
    await this.runAsync(sql, [
      session.endTime?.toISOString(),
      JSON.stringify(session.iterations),
      JSON.stringify(session.bestResult),
      session.status,
      session.id
    ]);
  }

  async getOptimizationSession(id: string): Promise<XmlOptimizationSession | null> {
    const sql = 'SELECT * FROM optimization_sessions WHERE id = ?';
    const row = await this.getAsync(sql, [id]);
    
    if (!row) return null;
    
    return {
      id: row.id,
      templateId: row.template_id,
      startTime: new Date(row.start_time),
      endTime: row.end_time ? new Date(row.end_time) : undefined,
      iterations: JSON.parse(row.iterations_json),
      bestResult: row.best_result_json ? JSON.parse(row.best_result_json) : undefined,
      status: row.status,
      goals: JSON.parse(row.goals_json)
    };
  }

  async cleanup(daysToKeep: number = 90): Promise<void> {
    const queries = [
      `DELETE FROM xml_results WHERE created_at < datetime('now', '-' || ? || ' days')`,
      `DELETE FROM usage_analytics WHERE timestamp < datetime('now', '-' || ? || ' days')`,
      `DELETE FROM optimization_sessions WHERE status = 'completed' AND end_time < datetime('now', '-' || ? || ' days')`
    ];

    for (const sql of queries) {
      await this.runAsync(sql, [daysToKeep]);
    }
    
    console.error(`[XML Structuring DB] Cleaned up records older than ${daysToKeep} days`);
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
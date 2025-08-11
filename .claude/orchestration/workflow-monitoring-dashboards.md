# Workflow Monitoring Dashboards

## Overview
Comprehensive real-time monitoring dashboards for BMAD workflows, providing visibility into agent performance, workflow health, progress tracking, and system metrics across all development phases.

## Dashboard Architecture

### 1. Executive Dashboard
**Target Audience**: Executives, project sponsors, key stakeholders
**Update Frequency**: Real-time with 5-minute refresh
**Key Metrics**: High-level project health and business impact

```
Executive Dashboard Layout:
┌─────────────────────────────────────────────────────────────────────┐
│ Project Health Overview                              [🟢 Healthy]   │
├─────────────────────────────────────────────────────────────────────┤
│ Overall Progress: ████████████████░░░░░░ 67%     On Track: ✅     │
│ Budget Utilization: ██████████░░░░░░░░░░ 52%      Within Budget: ✅  │
│ Timeline Adherence: ███████████████░░░░░ 73%      Minor Delay: ⚠️   │
├─────────────────────────────────────────────────────────────────────┤
│ Active Phase: Development             Next Milestone: Feature Complete│
│ Team Productivity: 87%                Risk Level: Low                │
│ Quality Score: 94%                   Stakeholder Satisfaction: 91%   │
├─────────────────────────────────────────────────────────────────────┤
│ Recent Achievements:                 Upcoming Priorities:            │
│ • User authentication completed      • Shopping cart implementation   │
│ • API security validation passed     • Payment gateway integration    │
│ • Mobile UI responsiveness added     • Performance optimization       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2. Project Management Dashboard
**Target Audience**: Project managers, scrum masters, team leads
**Update Frequency**: Real-time with 1-minute refresh
**Key Metrics**: Detailed progress, resource allocation, team performance

```
Project Management Dashboard:
┌─────────────────────────────────────────────────────────────────────┐
│ Multi-Phase Progress Tracking                                       │
├─────────────────────────────────────────────────────────────────────┤
│ Planning:    [████████████████████████] 100% ✅ Completed          │
│ Development: [████████████████░░░░░░░░] 67%  🔄 In Progress         │
│ QA:         [████░░░░░░░░░░░░░░░░░░░░░░] 15%  ⏳ Started            │
│ Deployment: [░░░░░░░░░░░░░░░░░░░░░░░░░░] 0%   ⏸️  Pending            │
├─────────────────────────────────────────────────────────────────────┤
│ Team Performance (Current Sprint):                                  │
│ Planning Team:    [████████████████████] 95%  🎯 Excellent         │
│ Frontend Team:    [██████████████████░░] 87%  👍 Good              │
│ Backend Team:     [████████████████░░░░] 82%  👍 Good              │
│ QA Team:         [██████████████████░░░] 89%  👍 Good              │
├─────────────────────────────────────────────────────────────────────┤
│ Resource Allocation:          Active Issues:                        │
│ Total Capacity: 320 hrs/week  • Backend API latency (Medium)        │
│ Utilized: 294 hrs (92%)      • Mobile browser compatibility (Low)   │
│ Available: 26 hrs (8%)       • Third-party API rate limits (High)   │
└─────────────────────────────────────────────────────────────────────┘
```

### 3. Technical Operations Dashboard
**Target Audience**: Technical leads, architects, developers
**Update Frequency**: Real-time with 30-second refresh
**Key Metrics**: Code quality, system performance, technical health

```
Technical Operations Dashboard:
┌─────────────────────────────────────────────────────────────────────┐
│ Code Quality & Technical Metrics                                    │
├─────────────────────────────────────────────────────────────────────┤
│ Test Coverage:   [██████████████████░░] 87%    Target: 85%+ ✅      │
│ Code Quality:    [████████████████████] 94%    Target: 90%+ ✅      │
│ Security Score:  [███████████████████░] 92%    Target: 95%+ ⚠️       │
│ Performance:     [██████████████████░░] 89%    Target: 90%+ ⚠️       │
├─────────────────────────────────────────────────────────────────────┤
│ Agent Activity (Last 24 Hours):                                     │
│ • spec-tester: 23 tests created, 156 tests executed                │
│ • frontend-developer: 8 components built, 3 PRs merged             │
│ • backend-developer: 5 APIs completed, 12 endpoints tested         │
│ • spec-reviewer: 15 code reviews, 3 security scans                 │
├─────────────────────────────────────────────────────────────────────┤
│ System Health:                     Infrastructure:                   │
│ Agent Uptime: 99.7%               CPU Usage: 34%                    │
│ Response Time: 1.2s avg           Memory Usage: 67%                  │
│ Error Rate: 0.3%                  Disk Usage: 45%                   │
│ Throughput: 847 tasks/day          Network: Optimal                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 4. Quality Assurance Dashboard
**Target Audience**: QA engineers, testers, validators
**Update Frequency**: Real-time with immediate updates on test results
**Key Metrics**: Test execution, defect tracking, quality gates

```
Quality Assurance Dashboard:
┌─────────────────────────────────────────────────────────────────────┐
│ Testing Progress & Quality Gates                                    │
├─────────────────────────────────────────────────────────────────────┤
│ Test Execution:                                                     │
│ Unit Tests:        [████████████████████] 247/247 ✅ All Passed     │
│ Integration Tests: [██████████████████░░] 34/39   ⚠️ 5 Pending      │
│ E2E Tests:        [████████████░░░░░░░░] 12/18   🔄 6 In Progress   │
│ Security Tests:    [████████████████░░░░] 8/10    ⚠️ 2 Pending      │
├─────────────────────────────────────────────────────────────────────┤
│ Quality Gates Status:                                               │
│ ✅ Code Quality Gate    (Passed: 94% quality score)                 │
│ ✅ Security Gate        (Passed: 0 critical vulnerabilities)        │
│ ⏳ Performance Gate     (In Progress: Load testing ongoing)          │
│ ⏸️  Compliance Gate     (Pending: Documentation review)             │
├─────────────────────────────────────────────────────────────────────┤
│ Defect Tracking:               Recent QA Activities:                │
│ Critical: 0  🎯               • Authentication testing completed     │
│ High: 2      ⚠️                • API security scan passed          │
│ Medium: 5    📋               • Mobile responsiveness validated     │
│ Low: 12      📝               • Performance benchmarks established   │
│ Total: 19                      • User acceptance testing initiated  │
└─────────────────────────────────────────────────────────────────────┘
```

## Real-Time Data Sources

### 1. Agent Activity Monitoring
```json
{
  "data_sources": {
    "bmad_agents": {
      "analyst": "docs/state/agent-states/bmad-agents/analyst-state.json",
      "pm": "docs/state/agent-states/bmad-agents/pm-state.json",
      "architect": "docs/state/agent-states/bmad-agents/architect-state.json",
      "sm": "docs/state/agent-states/bmad-agents/sm-state.json",
      "dev": "docs/state/agent-states/bmad-agents/dev-state.json",
      "qa": "docs/state/agent-states/bmad-agents/qa-state.json"
    },
    "custom_agents": {
      "spec_planner": "docs/state/agent-states/custom-agents/spec-planner-state.json",
      "frontend_developer": "docs/state/agent-states/custom-agents/frontend-developer-state.json",
      "backend_developer": "docs/state/agent-states/custom-agents/backend-developer-state.json",
      "spec_tester": "docs/state/agent-states/custom-agents/spec-tester-state.json",
      "spec_reviewer": "docs/state/agent-states/custom-agents/spec-reviewer-state.json",
      "spec_validator": "docs/state/agent-states/custom-agents/spec-validator-state.json"
    },
    "workflow_state": "docs/state/workflow-state.json",
    "progress_tracking": "docs/progress/project-dashboard.json"
  }
}
```

### 2. Performance Metrics Collection
```bash
#!/bin/bash
# Dashboard data collection script

collect_dashboard_metrics() {
    local timestamp=$(date -Iseconds)
    
    # Collect workflow metrics
    workflow_progress=$(jq '.workflow_progress.overall_progress' docs/state/workflow-state.json)
    active_agents=$(jq '.active_agents | length' docs/state/workflow-state.json)
    
    # Collect team performance metrics
    completed_tasks=$(jq '[.team_performance[] | .completed_tasks] | add' docs/progress/project-dashboard.json)
    productivity_score=$(jq '[.team_performance[] | .productivity_score] | add / length' docs/progress/project-dashboard.json)
    
    # Collect quality metrics
    test_coverage=$(get_test_coverage)
    code_quality=$(get_code_quality_score)
    security_score=$(get_security_score)
    
    # Update dashboard data
    update_dashboard_data "$timestamp" "$workflow_progress" "$active_agents" "$completed_tasks" "$productivity_score" "$test_coverage" "$code_quality" "$security_score"
}

# Run collection every 30 seconds
while true; do
    collect_dashboard_metrics
    sleep 30
done
```

## Dashboard Implementation Framework

### 1. HTML/CSS Dashboard Templates
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BMAD Workflow Dashboard</title>
    <style>
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            padding: 20px;
        }
        .metric-card {
            background: #f5f5f5;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-bar {
            width: 100%;
            height: 20px;
            background-color: #e0e0e0;
            border-radius: 10px;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background-color: #4caf50;
            transition: width 0.3s ease;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-green { background-color: #4caf50; }
        .status-yellow { background-color: #ff9800; }
        .status-red { background-color: #f44336; }
    </style>
</head>
<body>
    <div class="dashboard-grid">
        <div class="metric-card">
            <h3>Project Progress</h3>
            <div class="progress-bar">
                <div class="progress-fill" id="project-progress"></div>
            </div>
            <p id="progress-text">67% Complete</p>
        </div>
        
        <div class="metric-card">
            <h3>Team Performance</h3>
            <div id="team-metrics">
                <p><span class="status-indicator status-green"></span>Planning: 95%</p>
                <p><span class="status-indicator status-green"></span>Development: 87%</p>
                <p><span class="status-indicator status-green"></span>QA: 89%</p>
            </div>
        </div>
        
        <div class="metric-card">
            <h3>Quality Metrics</h3>
            <div id="quality-metrics">
                <p>Test Coverage: <span id="test-coverage">87%</span></p>
                <p>Code Quality: <span id="code-quality">94%</span></p>
                <p>Security Score: <span id="security-score">92%</span></p>
            </div>
        </div>
        
        <div class="metric-card">
            <h3>System Health</h3>
            <div id="system-health">
                <p><span class="status-indicator status-green"></span>All Systems Operational</p>
                <p>Response Time: <span id="response-time">1.2s</span></p>
                <p>Agent Uptime: <span id="agent-uptime">99.7%</span></p>
            </div>
        </div>
    </div>
    
    <script src="dashboard-updates.js"></script>
</body>
</html>
```

### 2. JavaScript Real-Time Updates
```javascript
// dashboard-updates.js
class WorkflowDashboard {
    constructor() {
        this.updateInterval = 30000; // 30 seconds
        this.initializeUpdates();
    }
    
    async fetchMetrics() {
        try {
            const response = await fetch('/api/dashboard-metrics');
            const metrics = await response.json();
            return metrics;
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
            return null;
        }
    }
    
    updateProgressBar(elementId, percentage) {
        const progressFill = document.querySelector(`#${elementId} .progress-fill`);
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
    }
    
    updateMetricValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }
    
    updateStatusIndicator(elementId, status) {
        const indicator = document.querySelector(`#${elementId} .status-indicator`);
        if (indicator) {
            indicator.className = `status-indicator status-${status}`;
        }
    }
    
    async updateDashboard() {
        const metrics = await this.fetchMetrics();
        if (!metrics) return;
        
        // Update progress metrics
        this.updateProgressBar('project-progress', metrics.workflow_progress);
        this.updateMetricValue('progress-text', `${metrics.workflow_progress}% Complete`);
        
        // Update quality metrics
        this.updateMetricValue('test-coverage', `${metrics.test_coverage}%`);
        this.updateMetricValue('code-quality', `${metrics.code_quality}%`);
        this.updateMetricValue('security-score', `${metrics.security_score}%`);
        
        // Update system health
        this.updateMetricValue('response-time', `${metrics.response_time}s`);
        this.updateMetricValue('agent-uptime', `${metrics.agent_uptime}%`);
        
        // Update status indicators based on thresholds
        const healthStatus = metrics.agent_uptime > 95 ? 'green' : 
                           metrics.agent_uptime > 85 ? 'yellow' : 'red';
        this.updateStatusIndicator('system-health', healthStatus);
    }
    
    initializeUpdates() {
        // Initial update
        this.updateDashboard();
        
        // Set up regular updates
        setInterval(() => {
            this.updateDashboard();
        }, this.updateInterval);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new WorkflowDashboard();
});
```

## Dashboard Access and Security

### 1. Role-Based Access Control
```json
{
  "dashboard_access_control": {
    "executive_dashboard": {
      "allowed_roles": ["executive", "project_sponsor", "stakeholder"],
      "data_scope": "high_level_metrics_only",
      "update_frequency": "5_minutes"
    },
    "project_management_dashboard": {
      "allowed_roles": ["project_manager", "scrum_master", "team_lead"],
      "data_scope": "detailed_progress_and_team_metrics",
      "update_frequency": "1_minute"
    },
    "technical_dashboard": {
      "allowed_roles": ["developer", "architect", "technical_lead"],
      "data_scope": "technical_metrics_and_system_health",
      "update_frequency": "30_seconds"
    },
    "qa_dashboard": {
      "allowed_roles": ["qa_engineer", "tester", "validator"],
      "data_scope": "testing_and_quality_metrics",
      "update_frequency": "real_time"
    }
  }
}
```

### 2. Dashboard Configuration
```yaml
# dashboard-config.yml
dashboard_settings:
  refresh_intervals:
    executive: 300  # 5 minutes
    project_management: 60   # 1 minute
    technical: 30   # 30 seconds
    qa: 10          # 10 seconds
  
  alert_thresholds:
    project_health:
      red: 60      # < 60% overall health
      yellow: 80   # < 80% overall health
      green: 80    # >= 80% overall health
    
    performance:
      response_time_warning: 2.0    # seconds
      response_time_critical: 5.0   # seconds
      agent_uptime_warning: 95      # percentage
      agent_uptime_critical: 85     # percentage
  
  display_options:
    auto_refresh: true
    show_historical_trends: true
    enable_drill_down: true
    export_functionality: true
```

This monitoring dashboard system provides comprehensive, real-time visibility into all aspects of BMAD workflow execution with role-appropriate access and customizable alerting.
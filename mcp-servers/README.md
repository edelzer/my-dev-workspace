# Custom MCP Servers for Phase 5.1

This directory contains custom Model Context Protocol (MCP) servers designed to enhance AI agent coordination and advanced reasoning capabilities.

## 🏗️ Architecture Overview

### Task Queue Management Server
**Purpose**: Coordinate task execution across multiple AI agents with intelligent queuing and assignment.

**Key Features**:
- Priority-based task queuing (Immediate → High → Medium → Low)
- Intelligent agent assignment based on capabilities
- Real-time progress tracking and failure recovery
- Performance metrics and workload analytics

**Tools**: `add_task_to_queue`, `get_next_task`, `update_task_progress`, `register_agent`, `get_queue_status`, `reassign_failed_task`

### Load Balancer Server
**Purpose**: Distribute workload intelligently across available AI agents with health monitoring.

**Key Features**:
- Agent health monitoring and failover handling
- Capability-based task routing
- Performance analytics and load optimization
- System-wide metrics and scaling recommendations

**Tools**: `register_development_agent`, `get_optimal_agent`, `distribute_task_load`, `monitor_agent_health`, `handle_agent_failover`, `get_load_metrics`

### Sequential Thinking Server
**Purpose**: Provide structured reasoning capabilities for complex problem-solving workflows.

**Key Features**:
- Multi-step reasoning chains with branching exploration
- Hypothesis testing and validation frameworks
- Solution ranking and comparison
- Reasoning session management and export

**Tools**: `start_complex_reasoning`, `add_reasoning_step`, `explore_alternative_path`, `evaluate_solution_hypothesis`, `rank_potential_solutions`, `export_reasoning_chain`

## 🚀 Quick Setup

```bash
# From the mcp-servers directory
node setup-servers.js
```

This will:
1. Install dependencies for all servers
2. Build TypeScript to JavaScript
3. Update Claude Code configuration
4. Add tool permissions

## 🔧 Manual Setup

If you prefer manual setup:

```bash
# Build each server individually
cd task-queue && npm install && npm run build
cd ../load-balancer && npm install && npm run build  
cd ../sequential-thinking && npm install && npm run build
```

Then manually update `.claude/settings.local.json`:

```json
{
  "mcpServers": {
    "task-queue-server": {
      "command": "node",
      "args": ["./mcp-servers/task-queue/dist/index.js"]
    },
    "load-balancer-server": {
      "command": "node", 
      "args": ["./mcp-servers/load-balancer/dist/index.js"]
    },
    "sequential-thinking-server": {
      "command": "node",
      "args": ["./mcp-servers/sequential-thinking/dist/index.js"]
    }
  }
}
```

## 📊 Usage Examples

### Task Management Workflow
```bash
# Register an agent
register_agent({ 
  agentId: "frontend-dev-1", 
  capabilities: ["react", "typescript", "ui-design"] 
})

# Add a task
add_task_to_queue({
  title: "Implement user dashboard",
  description: "Create responsive user dashboard with React",
  priority: "high",
  requiredCapabilities: ["react", "typescript"]
})

# Get next task for agent
get_next_task({ 
  agentId: "frontend-dev-1",
  capabilities: ["react", "typescript", "ui-design"]
})
```

### Load Balancing Workflow
```bash
# Register multiple agents
register_development_agent({
  agentId: "backend-dev-1",
  name: "Backend Specialist",
  capabilities: ["node", "api", "database"]
})

# Find optimal agent for task
get_optimal_agent({
  requiredCapabilities: ["node", "api"],
  priority: "high",
  estimatedLoad: 3
})

# Monitor system health
get_load_metrics()
```

### Complex Reasoning Workflow
```bash
# Start reasoning session
start_complex_reasoning({
  problem: "Design scalable microservices architecture",
  context: "E-commerce platform with 1M+ users",
  reasoningApproach: "hypothesis-testing"
})

# Add reasoning steps
add_reasoning_step({
  sessionId: "session-123",
  thought: "Consider API Gateway pattern for service coordination",
  confidence: 0.8,
  tags: ["architecture", "scalability"]
})

# Test hypothesis
evaluate_solution_hypothesis({
  sessionId: "session-123", 
  hypothesis: "Event-driven architecture will improve scalability",
  evidence: ["Decoupled services", "Async processing", "Better fault tolerance"]
})
```

## 🔍 Monitoring and Debugging

### Server Logs
Each server outputs logs to stderr for monitoring:
- Connection status
- Tool execution results
- Error messages and debugging info

### Health Checks
- **Task Queue**: Check queue metrics and agent performance
- **Load Balancer**: Monitor agent health and system load
- **Sequential Thinking**: Track reasoning session progress

### Performance Optimization
- Database queries optimized with indexes
- Memory-efficient data structures
- Configurable timeouts and limits

## 🔒 Security Considerations

- All servers use SQLite for secure local data storage
- Input validation on all tool parameters
- Error handling prevents information leakage
- Session isolation for reasoning workflows

## 🔧 Development

### Adding New Tools
1. Update the tool schema in `setupToolHandlers()`
2. Implement the tool handler method
3. Add database operations if needed
4. Update this documentation

### Database Schema
Each server uses SQLite with optimized schemas:
- **Task Queue**: tasks, agents, task_progress tables
- **Load Balancer**: In-memory agent management with persistence options
- **Sequential Thinking**: In-memory session management with export capabilities

## 🧪 Testing

```bash
# Test individual servers
cd task-queue && npm test
cd load-balancer && npm test  
cd sequential-thinking && npm test
```

## 📝 Integration with BMAD Framework

These servers are designed to work seamlessly with the BMAD multi-agent system:

- **Task Queue** coordinates BMAD agent workflows
- **Load Balancer** optimizes BMAD agent distribution  
- **Sequential Thinking** enhances BMAD reasoning capabilities

## 🔄 Roadmap

### Planned Enhancements
- [ ] Persistent storage for load balancer metrics
- [ ] Advanced reasoning pattern library
- [ ] Cross-server communication protocols
- [ ] Performance benchmarking tools
- [ ] WebSocket support for real-time updates

### Integration Opportunities
- [ ] GitHub Actions workflow integration
- [ ] Slack/Teams notification systems
- [ ] Custom protocol extensions
- [ ] Enterprise authentication flows

---

## 📞 Support

For issues or questions:
1. Check server logs for error messages
2. Verify Claude Code configuration
3. Ensure all dependencies are installed
4. Review tool parameter schemas

These servers represent cutting-edge MCP server development and demonstrate advanced AI agent coordination patterns for enterprise development workflows.
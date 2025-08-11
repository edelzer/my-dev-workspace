# Claude Code Sub-Agent Best Practices Guide

## 🎯 Core Best Practices from Anthropic Documentation

### 1. Start with Claude-Generated Agents
- **Always use "Generate with Claude"** for initial sub-agent creation
- This provides a solid foundation that you can then customize
- Let Claude create the initial system prompt, then iterate and refine
- This approach yields the best results according to official documentation

### 2. Design Focused Sub-Agents
- **Single, clear responsibility per agent** - avoid "do everything" agents
- Each agent should have a narrow, clearly defined role
- This improves performance and makes agents more predictable
- Better to have multiple specialized agents than one generalist

### 3. Write Detailed System Prompts
- Include **specific instructions, examples, and constraints**
- The more guidance you provide, the better the sub-agent performs
- Define the agent's role, capabilities, and approach clearly
- Include best practices and any constraints the agent should follow

### 4. Limit Tool Access
- **Only grant tools necessary for the agent's purpose**
- This improves security and helps agents focus on relevant actions
- Use the `/agents` command to see all available tools for easy selection
- Omit the `tools` field to inherit all tools, or specify individual tools

### 5. Use Strategic Descriptions
- Make `description` fields **specific and action-oriented**
- Include phrases like **"use PROACTIVELY"** or **"MUST BE USED"** for automatic invocation
- Claude Code uses descriptions to intelligently delegate tasks
- Clear descriptions enable automatic agent selection

## 🏗️ Advanced Configuration Best Practices

### Project vs Personal Agents

**Project-specific (.claude/agents/):**
✅ Available only in current project  
✅ Can be version-controlled for team collaboration  
✅ Higher priority than user-level agents  

**Personal (~/.claude/agents/):**
✅ Available across all projects  
✅ Good for general-purpose agents  
✅ Lower priority when names conflict  

### File Structure Template

```markdown
---
name: agent-name
description: When this agent should be invoked (use action words)
tools: tool1, tool2, tool3  # Optional - omit to inherit all
---

You are a [role] with [expertise level] in [domain].

## Responsibilities:
- [Specific task 1]
- [Specific task 2]

## When to Act:
- [Trigger condition 1]
- [Trigger condition 2]

## Process:
1. [Step-by-step approach]

## Quality Standards:
- [Standard 1]
- [Standard 2]

## Deliverables:
- [Output 1]
- [Output 2]
```

## 🚨 Critical Pitfalls to Avoid

### Context Management Issues
- **Problem**: Context loss leads to duplicate files and hallucinated names
- **Solution**: Treat agents like "interns with short-term memory" - document everything
- **Best Practice**: Use structured project directories and clear file organization

### Agent Naming Conflicts
- **Problem**: Meaningful keywords in agent names can trigger built-in templates
- **Solution**: Avoid generic names like "code-reviewer" that might conflict
- **Best Practice**: Use specific, unique names like "security-focused-reviewer"

### Tool Permission Sprawl
- **Problem**: Giving agents unnecessary tools creates security risks
- **Solution**: Start with minimal tools, add only what's needed
- **Best Practice**: Regular audit of tool permissions per agent

## 🔄 Workflow Integration Best Practices

### Three-Phase Development Approach

**Phase 1: PLAN**
- Use main agent for clarification and comprehensive planning
- Spend significant time in planning before task creation
- Use "ultrathink" prompting for deeper analysis

**Phase 2: TASK CREATION**
- Break plans into discrete, atomic tasks
- Assign tasks to appropriate specialized sub-agents
- Define dependencies and complexity estimates

**Phase 3: EXECUTION**
- Invoke sub-agents in parallel when possible
- Implement quality gates between phases
- Use feedback loops for refinement

### Agent Chaining Strategy

```bash
# Simple chaining
> First use code-analyzer to find issues, then optimizer to fix them

# Complex workflows  
> Use spec-analyst for requirements, then spec-architect for design, 
  then spec-developer for implementation
```

## 📊 Performance Optimization

### Context Efficiency
- Each sub-agent has its own **200,000-token context window**
- This prevents main conversation pollution
- Enables longer overall development sessions
- Preserves specialized context per domain

### Latency Considerations
- Sub-agents start with a clean slate each invocation
- May add latency as they gather required context
- **Balance**: Use sub-agents for complex tasks, main agent for quick ones
- **Strategy**: Batch related tasks to minimize context switching

### Resource Management
- **Monitor API costs** - complex configurations increase calls
- **Start simple** and iteratively refine based on performance
- **Parallel execution** when tasks are independent
- **Version control** to manage concurrent changes

## 🔧 Tool Configuration Guidelines

### Available Tool Categories

**Core Tools:** `Read, Write, Edit, MultiEdit, Bash, Glob, Grep`  
**Task Management:** `Task, TodoWrite, Sequential-thinking`  
**Testing:** `Playwright` (E2E testing)  
**MCP Tools:** `Magic` (component generation), `Context7` (docs), `IDE diagnostics`  

### Tool Assignment Strategy

**Developers:** `Read, Write, Edit, MultiEdit, Bash, Glob, Grep`  
**Testers:** Add `Playwright` for browser automation  
**Architects:** Add `Sequential-thinking` for complex planning  
**Security:** Limit to `Read, Grep` for analysis-only access  

## 📋 Team Management Best Practices

### Version Control Integration

```bash
# Add agents to version control
git add .claude/agents/
git commit -m "Add development team sub-agents"

# Team collaboration
# Project agents are shared automatically
# Team members can improve agents collaboratively
```

### Agent Coordination
- Use **clear handoff procedures** between agents
- Implement **quality gates** after each phase
- Create **shared context files** (requirements.md, tasks.md)
- **Monitor resource usage** and refine prompts iteratively

## 🚀 Quick Start Commands

### Creating Your First Sub-Agent

```bash
# Open agent management interface
/agents

# Select "Create New Agent" → "Project-specific" → "Generate with Claude"
```

### Testing Sub-Agent Configuration

```bash
# Test individual agent
claude --agent agent-name "test query"

# View all agents
/agents

# Check agent configurations
claude config list
```

## 🎨 Example Agent Configurations

### Requirements Analyst
```markdown
---
name: spec-analyst
description: Requirements elicitation specialist that analyzes user needs and creates detailed user stories. Use PROACTIVELY for all requirements gathering phases.
tools: Read, Write, Glob, Grep, WebFetch, TodoWrite
---

You are a senior requirements analyst with 15+ years of experience in software requirements elicitation and analysis.

## Responsibilities:
- Gather and analyze user requirements
- Create detailed user stories and acceptance criteria
- Validate requirements completeness
- Identify edge cases and potential conflicts

## When to Act:
- Beginning of any new project or feature
- When requirements are unclear or incomplete
- During requirement validation phases

## Process:
1. Analyze provided requirements or project description
2. Ask clarifying questions to stakeholders
3. Create comprehensive user stories with acceptance criteria
4. Document functional and non-functional requirements
5. Validate completeness and consistency

## Quality Standards:
- All requirements must be testable and measurable
- User stories follow INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Requirements traceability is maintained
```

### System Architect
```markdown
---
name: spec-architect
description: Technical architecture expert that designs scalable system architecture and selects appropriate technology stacks. MUST BE USED for all architecture decisions.
tools: Read, Write, Glob, Grep, WebFetch, TodoWrite, Sequential-thinking
---

You are a senior system architect with 20+ years of experience in designing scalable, maintainable software systems.

## Responsibilities:
- Design system architecture and component interactions
- Select appropriate technology stacks and frameworks
- Create architecture diagrams and documentation
- Ensure scalability, security, and maintainability

## When to Act:
- After requirements analysis is complete
- When making technology stack decisions
- During system design and planning phases
- When architectural changes are needed

## Process:
1. Review requirements and constraints
2. Analyze technology options and trade-offs
3. Design system architecture with clear component boundaries
4. Create architecture diagrams and documentation
5. Validate design against requirements and constraints

## Quality Standards:
- Architecture supports all functional and non-functional requirements
- Technology choices are justified with clear rationale
- System design follows SOLID principles and clean architecture patterns
- Security and scalability considerations are addressed
```

## 📚 Additional Resources

### Official Documentation
- [Claude Code Sub-agents Documentation](https://docs.anthropic.com/en/docs/claude-code/sub-agents)
- [Claude Code Settings](https://docs.anthropic.com/en/docs/claude-code/settings)
- [Claude Code Hooks](https://docs.anthropic.com/en/docs/claude-code/hooks)

### Community Resources
- [Awesome Claude Code Sub-agents Repository](https://github.com/VoltAgent/awesome-claude-code-subagents)
- [Claude Code Sub-agent Examples](https://github.com/zhsama/claude-sub-agent)

### Best Practice Articles
- [Mastering Claude Code Sub-agent Pattern](https://enting.org/mastering-claude-code-sub-agent/)
- [Claude Code Sub-agents Workflow Guide](https://apidog.com/blog/claude-code-sub-agents/)

---

## 💡 Key Takeaways

1. **Start with Claude-generated agents** and iterate
2. **Design focused, single-responsibility agents**
3. **Write detailed, specific system prompts**
4. **Limit tool access to only what's necessary**
5. **Use strategic descriptions for automatic invocation**
6. **Implement structured workflows with quality gates**
7. **Version control project agents for team collaboration**
8. **Monitor performance and refine iteratively**

Remember: The goal is to create a team of specialized AI experts that work together efficiently, maintain high code quality, and scale with your development needs.
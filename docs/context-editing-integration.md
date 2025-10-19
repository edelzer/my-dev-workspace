# Context Editing Integration with Memory System

**Date**: 2025-10-18
**Status**: Production Ready
**Beta Feature**: `context-management-2025-06-27`

## Executive Summary

Context editing enables indefinitely long development sessions by automatically clearing old tool results when conversation context grows beyond configured thresholds. Our memory system preserves critical information before clearing occurs, ensuring seamless continuity across context resets.

**Key Benefits:**
- ✅ Unlimited session length (no context window limits)
- ✅ Automatic preservation of critical state to memory files
- ✅ Transparent server-side processing (no client changes needed)
- ✅ Perfect integration with Absolute Laws framework
- ✅ Zero manual intervention required

## How Context Editing Works

### Server-Side Processing Flow

```
1. Conversation context grows → Approaches trigger threshold (100K tokens)
2. Claude receives automatic warning → "Context will be cleared soon"
3. Claude preserves critical info → Writes to memory files
4. API clears old tool results → Replaces with placeholder text
5. Conversation continues → Claude accesses memory files as needed
6. Process repeats indefinitely → Unlimited session length
```

### What Gets Cleared

**Cleared by Default:**
- Old tool results (oldest first, chronological order)
- Tool result content replaced with placeholder text

**Preserved by Default:**
- Tool call parameters (Claude's original requests)
- Recent tool uses (configurable via `keep` parameter)
- Excluded tools (configurable via `exclude_tools`)
- **Memory tool operations** (CRITICAL: must exclude)

### What Claude Sees

**Before Clearing:**
```
User: "Read the authentication implementation"
Assistant: <tool_use>Read auth.ts</tool_use>
Tool Result: [5000 lines of authentication code]
Assistant: "I can see the JWT implementation..."
```

**After Clearing (Context Editing Applied):**
```
User: "Read the authentication implementation"
Assistant: <tool_use>Read auth.ts</tool_use>
Tool Result: [This tool result was cleared to manage context length]
Assistant: "I can see the JWT implementation..."
```

**With Memory Integration:**
```
Memory File: /memories/session-context/active-project.xml
<auth-implementation>
  <file>src/auth/auth.ts</file>
  <type>JWT with refresh token rotation</type>
  <key-findings>
    - Token expiry: 1 hour
    - Refresh token: 7 days
    - Rate limiting: 5 attempts/minute
  </key-findings>
</auth-implementation>

Claude can reference this memory instead of needing the full tool result.
```

## Configuration for Different Environments

### Claude Code (Our Primary Environment)

**Status**: Context editing likely handled automatically by Claude Code infrastructure

**What We Need to Do**: DOCUMENT behavior, not configure it

**Memory System Integration**: Already configured correctly
- Memory tool type: `memory_20250818`
- Session start protocol: Law #6 mandates checking memory first
- Memory preservation: Automatic via Claude's warning system

**No Action Required for Basic Usage**

### API Usage (Python/TypeScript SDKs)

If building custom integrations or tools that use the Anthropic API directly:

**Recommended Configuration:**

```python
# Production-ready context management for long development sessions
response = client.beta.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=4096,
    messages=[...],
    tools=[
        {
            "type": "memory_20250818",
            "name": "memory"
        },
        # Other tools (Read, Write, Edit, Bash, etc.)
    ],
    betas=["context-management-2025-06-27"],
    context_management={
        "edits": [
            {
                "type": "clear_tool_uses_20250919",

                # Trigger: When to start clearing
                "trigger": {
                    "type": "input_tokens",
                    "value": 100000  # 100K tokens (default, good for most cases)
                },

                # Keep: How many recent tool uses to preserve
                "keep": {
                    "type": "tool_uses",
                    "value": 5  # Keep 5 most recent tool operations
                },

                # Clear at least: Minimum tokens to clear (cache optimization)
                "clear_at_least": {
                    "type": "input_tokens",
                    "value": 10000  # 10K tokens minimum
                },

                # CRITICAL: Never clear memory operations
                "exclude_tools": ["memory"],

                # Keep tool call parameters visible
                "clear_tool_inputs": False
            }
        ]
    }
)
```

**TypeScript Configuration:**

```typescript
const response = await anthropic.beta.messages.create({
  model: "claude-sonnet-4-5",
  max_tokens: 4096,
  messages: [...],
  tools: [
    {
      type: "memory_20250818",
      name: "memory"
    },
    // Other tools
  ],
  betas: ["context-management-2025-06-27"],
  context_management: {
    edits: [
      {
        type: "clear_tool_uses_20250919",
        trigger: {
          type: "input_tokens",
          value: 100000
        },
        keep: {
          type: "tool_uses",
          value: 5
        },
        clear_at_least: {
          type: "input_tokens",
          value: 10000
        },
        exclude_tools: ["memory"],
        clear_tool_inputs: false
      }
    ]
  }
});
```

## Integration with Memory System

### Memory Preservation Protocol

**When Context Approaches Threshold:**

1. **Automatic Warning Received** (from Anthropic API)
   - Claude receives notification that context will be cleared
   - Warning triggers memory preservation sequence

2. **Critical Information Preservation** (Law #6 Integration)
   - **Session State** → `session-context/active-project.xml`
   - **Protocol Status** → `protocol-compliance/protocol-status.xml`
   - **Agent Handoffs** → `agent-coordination/context-packages.xml`
   - **Development Progress** → `development-patterns/` appropriate files
   - **Client Decisions** → `client-context/approval-history.xml`

3. **Memory File Updates**
   - Summarize tool results being cleared
   - Document key findings and decisions
   - Update TodoWrite status to memory
   - Record current phase and next steps

4. **Context Clearing Applied** (by Anthropic API)
   - Old tool results replaced with placeholders
   - Memory operations preserved (excluded from clearing)
   - Recent tool uses kept (per configuration)

5. **Session Continues Seamlessly**
   - Claude references memory files for cleared information
   - New tool operations continue normally
   - Unlimited session length achieved

### Memory Files Priority for Preservation

**CRITICAL (Must Always Preserve):**
1. `session-context/active-project.xml` - Current work state
2. `session-context/phase-status.xml` - Protocol progress
3. `protocol-compliance/uncertainty-log.xml` - Active uncertainties
4. `client-context/pending-decisions.xml` - Blocking decisions

**HIGH PRIORITY (Preserve Recent State):**
5. `agent-coordination/context-packages.xml` - Active handoffs
6. `development-patterns/debugging-solutions.xml` - Current debugging
7. `project-knowledge/{project}.xml` - Project-specific learnings

**MEDIUM PRIORITY (Summarize and Archive):**
8. `protocol-compliance/efficiency-metrics.xml` - Surgical level stats
9. `client-context/communication-log.xml` - Recent interactions
10. `development-patterns/test-strategies.xml` - Testing approaches

### Example Memory Preservation Sequence

**Scenario**: Claude Code session editing a large codebase, approaching 100K token threshold

**Step 1: Warning Received**
```
[Anthropic API Internal]: Context approaching 100,000 tokens.
Will clear oldest tool results in next request.
Claude: Acknowledged. Preserving critical state to memory.
```

**Step 2: Memory Preservation**
```xml
<!-- Updated: /memories/session-context/active-project.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<active-project>
  <metadata>
    <last-updated>2025-10-18T14:30:00Z</last-updated>
    <context-preservation-trigger>approaching-100k-tokens</context-preservation-trigger>
  </metadata>
  <project-name>authentication-service</project-name>
  <current-phase>implementation</current-phase>
  <work-summary>
    <task>Implementing JWT refresh token rotation</task>
    <files-modified>
      <file status="complete">src/auth/jwt.config.ts</file>
      <file status="in-progress">src/auth/token-service.ts</file>
      <file status="pending">src/auth/middleware.ts</file>
    </files-modified>
    <key-decisions>
      <decision>Using 1-hour access token expiry (approved by client)</decision>
      <decision>Implementing sliding window refresh (7-day max)</decision>
    </key-decisions>
    <next-steps>
      <step>Complete token-service.ts implementation</step>
      <step>Add rate limiting middleware</step>
      <step>Write comprehensive test suite</step>
    </next-steps>
  </work-summary>
  <tool-results-summary>
    <!-- Summarizing tool results that will be cleared -->
    <file-reads>
      <read file="src/auth/jwt.config.ts">JWT configuration with 1h expiry</read>
      <read file="src/auth/types.ts">TokenPayload and RefreshToken interfaces</read>
      <read file="docs/auth-spec.md">Security requirements: rate limiting, token rotation</read>
    </file-reads>
    <file-edits>
      <edit file="src/auth/jwt.config.ts">Added refresh token configuration</edit>
      <edit file="src/auth/token-service.ts">Implemented generateTokenPair method</edit>
    </file-edits>
  </tool-results-summary>
</active-project>
```

**Step 3: Context Clearing Applied**
```
[Anthropic API]: Cleared 45,000 tokens (8 oldest tool results)
[Anthropic API]: Preserved 5 most recent tool uses
[Anthropic API]: Memory tool operations: 0 cleared (excluded)
```

**Step 4: Session Continues**
```
User: "Now implement the rate limiting middleware"

Claude: [Checks memory] I can see we're working on the authentication service.
Based on my memory, we've completed jwt.config.ts and are in progress on
token-service.ts. The next step is rate limiting middleware per the auth-spec.md
requirements (5 attempts/minute).

[Proceeds with implementation using memory context instead of cleared tool results]
```

## Configuration Options Reference

### Trigger Configuration

**When should context clearing start?**

```python
# Option 1: Token-based trigger (RECOMMENDED)
"trigger": {
    "type": "input_tokens",
    "value": 100000  # Start clearing at 100K tokens
}

# Option 2: Tool use count trigger
"trigger": {
    "type": "tool_uses",
    "value": 50  # Start clearing after 50 tool uses
}
```

**Recommendations:**
- **Development Sessions**: 100,000 tokens (default)
- **Heavy File Operations**: 75,000 tokens (earlier preservation)
- **Research/Analysis**: 150,000 tokens (keep more context)

### Keep Configuration

**How many recent tool uses should be preserved?**

```python
# Option 1: Keep by count (RECOMMENDED)
"keep": {
    "type": "tool_uses",
    "value": 5  # Keep 5 most recent tool operations
}

# Option 2: Keep by token budget
"keep": {
    "type": "input_tokens",
    "value": 10000  # Keep up to 10K tokens of recent tool results
}
```

**Recommendations:**
- **Sequential Work**: 3-5 tool uses (minimal recent context)
- **Iterative Debugging**: 7-10 tool uses (more recent context)
- **Code Review**: 10-15 tool uses (extensive recent context)

### Clear At Least Configuration

**Minimum tokens to clear (cache optimization)?**

```python
"clear_at_least": {
    "type": "input_tokens",
    "value": 10000  # Clear minimum 10K tokens when triggered
}
```

**Why This Matters:**
- Context editing invalidates prompt cache
- Clearing small amounts wastes cache write costs
- Set minimum to make cache invalidation worthwhile

**Recommendations:**
- **With Prompt Caching**: 10,000-15,000 tokens
- **Without Prompt Caching**: Can omit (no cache to worry about)

### Exclude Tools Configuration

**Which tools should NEVER be cleared?**

```python
"exclude_tools": ["memory"]  # CRITICAL for our integration
```

**Must Exclude:**
- `"memory"` - Memory tool operations (MANDATORY)

**Should Consider Excluding:**
- `"web_search"` - Research results may be valuable
- Custom tools with expensive operations

**Should NOT Exclude:**
- `"read"`, `"write"`, `"edit"` - File operations (can be summarized to memory)
- `"bash"` - Command results (can be re-run if needed)

### Clear Tool Inputs Configuration

**Should tool call parameters be cleared along with results?**

```python
"clear_tool_inputs": False  # RECOMMENDED: Keep tool calls visible
```

**False (Recommended):**
- Shows what Claude requested (good for audit trail)
- Helps understand conversation flow
- Minimal token savings from clearing

**True (Not Recommended):**
- Clears both tool calls and results
- Saves slightly more tokens
- Loses visibility into what Claude was doing

## Response Format Integration

### Standard Response

```json
{
  "id": "msg_013Zva2CMHLNnXjNJJKqJ2EF",
  "type": "message",
  "role": "assistant",
  "content": [...],
  "usage": {
    "input_tokens": 55000,
    "output_tokens": 1024
  },
  "context_management": {
    "applied_edits": [
      {
        "type": "clear_tool_uses_20250919",
        "cleared_tool_uses": 8,
        "cleared_input_tokens": 45000
      }
    ]
  }
}
```

**What This Tells Us:**
- `cleared_tool_uses: 8` → 8 tool results were cleared
- `cleared_input_tokens: 45000` → Saved 45K tokens
- `input_tokens: 55000` → Final prompt size after clearing

### Streaming Response

```json
{
  "type": "message_delta",
  "delta": {
    "stop_reason": "end_turn",
    "stop_sequence": null
  },
  "usage": {
    "output_tokens": 1024
  },
  "context_management": {
    "applied_edits": [
      {
        "type": "clear_tool_uses_20250919",
        "cleared_tool_uses": 8,
        "cleared_input_tokens": 45000
      }
    ]
  }
}
```

## Integration with Absolute Laws

### Law #6 Enhancement: Context Editing Protocol

**UPDATED SESSION START PROTOCOL:**

Before ANY work, you MUST:
1. **VIEW** `/memories/session-context/` to understand current state
2. **READ** `/memories/protocol-compliance/` to check for pending Law violations
3. **REVIEW** `/memories/client-context/preferences.xml` for client guidance
4. **LOAD** relevant project knowledge from `/memories/project-knowledge/{project}/`
5. **SYNC** TodoWrite status with memory records
6. **CHECK** if context was recently cleared (inspect session-context metadata)

**NEW: CONTEXT CLEARING RESPONSE PROTOCOL:**

When approaching context threshold (automatic warning received):
1. **PRESERVE CRITICAL STATE**
   - Update `session-context/active-project.xml` with current work
   - Record `protocol-compliance/protocol-status.xml` phase status
   - Save active `agent-coordination/context-packages.xml` handoffs
   - Document pending `client-context/pending-decisions.xml` items

2. **SUMMARIZE TOOL RESULTS**
   - Extract key findings from tool results being cleared
   - Document important code patterns discovered
   - Record debugging insights and solutions
   - Note security findings and architectural decisions

3. **UPDATE MEMORY METADATA**
   - Mark files with `<context-preservation-trigger>`
   - Record timestamp of preservation
   - Note how many tokens were cleared
   - Document what information was preserved

4. **CONTINUE SEAMLESSLY**
   - Reference memory files for cleared information
   - Proceed with current task without interruption
   - Trust memory system for historical context

### Integration with Other Laws

**Law #1 (Uncertainty & Specification Adherence):**
- Preserve active uncertainties before context clearing
- Maintain specification compliance checkpoints in memory
- Never lose uncertainty resolutions to context clearing

**Law #2 (Protocol Adherence):**
- Protocol phase status preserved across context resets
- Quality gate results maintained in memory
- No protocol violations due to lost context

**Law #3 (Orchestrated Workspace Efficiency):**
- Agent handoffs preserved before clearing
- Context packages maintained across resets
- Multi-agent workflows uninterrupted

**Law #4 (Surgical Precision):**
- Efficiency metrics preserved
- Surgical level decisions documented
- Minimalist approach maintained across resets

**Law #5 (Senior Developer Leadership):**
- Client communications preserved
- Approval history maintained
- Decision rationale never lost

## Best Practices

### Memory Hygiene with Context Editing

**Before Each Context Clear:**
1. ✅ Update session-context with current state
2. ✅ Preserve protocol compliance status
3. ✅ Document key findings from tool results
4. ✅ Save TodoWrite status

**After Context Clearing:**
1. ✅ Verify critical memory files are current
2. ✅ Confirm session can resume from memory
3. ✅ Note any information that should be re-acquired
4. ✅ Continue work without requesting re-clarification

### Optimal Configuration for Development

**Recommended Settings:**
```python
context_management={
    "edits": [
        {
            "type": "clear_tool_uses_20250919",
            "trigger": {"type": "input_tokens", "value": 100000},
            "keep": {"type": "tool_uses", "value": 5},
            "clear_at_least": {"type": "input_tokens", "value": 10000},
            "exclude_tools": ["memory"],
            "clear_tool_inputs": False
        }
    ]
}
```

**Why These Settings:**
- **100K trigger**: Standard for development sessions
- **Keep 5 tools**: Balance between context and history
- **Clear 10K minimum**: Cache optimization
- **Exclude memory**: MANDATORY for preservation
- **Keep inputs**: Audit trail visibility

### Token Counting for Planning

Use the token counting endpoint to preview clearing:

```python
response = client.beta.messages.count_tokens(
    model="claude-sonnet-4-5",
    messages=[...],
    tools=[...],
    betas=["context-management-2025-06-27"],
    context_management={
        "edits": [
            {
                "type": "clear_tool_uses_20250919",
                "trigger": {"type": "input_tokens", "value": 30000}
            }
        ]
    }
)

print(f"Original: {response.context_management['original_input_tokens']}")
print(f"After clearing: {response.input_tokens}")
print(f"Savings: {response.context_management['original_input_tokens'] - response.input_tokens}")
```

### When to Adjust Configuration

**Increase Trigger (150K+ tokens):**
- Research-heavy sessions
- Need more context retention
- Fewer file operations

**Decrease Trigger (75K tokens):**
- Heavy file editing
- Memory preservation priority
- Frequent agent handoffs

**Increase Keep (10+ tool uses):**
- Iterative debugging
- Code review workflows
- Need recent context

**Decrease Keep (3 tool uses):**
- Sequential work
- Strong memory preservation
- Minimize context usage

## Troubleshooting

### Issue: Session Loses Context After Clearing

**Symptoms:**
- Claude asks for information already provided
- Work progress is lost or forgotten
- Repeats completed tasks

**Diagnosis:**
- Memory preservation not triggered before clearing
- Memory files not updated with current state
- Session-context missing critical information

**Resolution:**
1. Verify memory tool is excluded from clearing
2. Check session-context files are being updated
3. Ensure preservation protocol is followed
4. Review memory file timestamps (should be recent)

### Issue: Too Frequent Context Clearing

**Symptoms:**
- Context cleared every few turns
- Constant memory preservation overhead
- Inefficient workflow

**Diagnosis:**
- Trigger threshold too low
- Tool results too large
- Not clearing enough per trigger

**Resolution:**
1. Increase trigger value (e.g., 100K → 150K)
2. Increase `clear_at_least` value
3. Adjust `keep` parameter (keep fewer tools)
4. Review tool result sizes

### Issue: Important Information Lost

**Symptoms:**
- Critical decisions forgotten after clearing
- Security findings lost
- Architectural decisions not preserved

**Diagnosis:**
- Memory preservation incomplete
- Wrong information prioritized
- Memory files not comprehensive enough

**Resolution:**
1. Review CRITICAL priority files (session-context, protocol-compliance)
2. Enhance memory preservation protocol
3. Include more detail in memory summaries
4. Use memory file templates consistently

## Monitoring and Metrics

### Key Metrics to Track

**Context Management Effectiveness:**
- `cleared_tool_uses` - How many tools cleared per trigger
- `cleared_input_tokens` - Token savings per clear
- Frequency of clearing events
- Memory file update timestamps

**Memory Preservation Quality:**
- Time between context clear and memory update
- Completeness of preserved information
- Session resumption success rate
- Information re-acquisition frequency

### Success Indicators

✅ **Successful Integration:**
- Sessions continue indefinitely without interruption
- No repeated questions about already-provided information
- Protocol compliance maintained across resets
- Client approvals and decisions preserved
- Agent handoffs seamless across clears

❌ **Integration Issues:**
- Frequent re-clarification requests
- Lost work progress after clearing
- Protocol violations due to missing context
- Repeated approval requests
- Broken agent handoff chains

## Future Enhancements

### Planned Improvements

1. **Automated Memory Optimization**
   - Auto-detect important information for preservation
   - Intelligent summarization of cleared tool results
   - Pattern recognition for critical state

2. **Context Clearing Analytics**
   - Dashboard for clearing frequency and effectiveness
   - Memory preservation quality scoring
   - Token savings analytics

3. **Dynamic Configuration**
   - Adjust trigger based on session type
   - Adaptive keep parameter based on work pattern
   - Intelligent exclude_tools based on task

4. **Enhanced Memory Templates**
   - Pre-built summarization templates
   - Context preservation checklists
   - Automated state capture

## Conclusion

Context editing + memory system = **Unlimited development sessions** with **zero context loss**.

**Key Takeaways:**
1. ✅ Context editing is server-side and transparent
2. ✅ Memory tool preservation happens automatically
3. ✅ Exclude memory from clearing (`exclude_tools: ["memory"]`)
4. ✅ Session start protocol ensures recovery from any reset
5. ✅ Absolute Laws compliance maintained across all clears

**No Action Required for Claude Code** - System works automatically with existing memory implementation.

**For API Integrations** - Use recommended configuration and follow preservation protocol.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-18
**Integration Status**: Production Ready
**Related Documents**:
- [memory-system-validation-report.md](memory-system-validation-report.md)
- CLAUDE.md Law #6: Cross-Session Memory & Continuous Learning
- memories/README.md

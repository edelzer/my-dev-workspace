# Seamless Context Switching

Intelligent project context management that enables instant switching between projects while preserving mental context, tool states, and development flow.

## Context Switching Commands

```bash
# Project context management
/project:switch --to=<project-name>
/project:switch-quick --recent
/project:switch-smart --task=<task-type>

# Context preservation and restoration
/project:save-context --name=<context-name>
/project:restore-context --name=<context-name>
/project:context-snapshot --auto

# Multi-project workspace
/project:workspace-multi --projects=<project-list>
/project:context-compare --projects=<project1,project2>
/project:context-sync --team

# Smart context recommendations
/project:suggest-switch --based-on=<criteria>
/project:context-optimize --workflow
/project:context-health --check-all
```

## 🧠 Intelligent Context Management

### Project Context Detection
```
🔍 CURRENT PROJECT CONTEXT ANALYSIS

ACTIVE PROJECT: user-dashboard-v2
├── 📁 Project Type: React + TypeScript Web Application
├── 🎯 Current Task: User authentication implementation
├── 📊 Progress: 75% complete (authentication module)
├── ⏰ Session Time: 2h 15m (deep work session)
├── 🔄 Git State: feature/auth-improvements (7 commits ahead)
├── 🧪 Test Status: 23/25 tests passing (2 TypeScript errors)
├── 🛠️ Active Tools: VS Code, Chrome DevTools, Postman
├── 🤖 Agent Context: @spec-developer, @frontend-developer
├── 📝 Open Files: AuthForm.tsx, AuthService.ts, auth.test.ts
└── 🧠 Mental Context: Debugging OAuth token refresh logic

CONTEXT HEALTH SCORE: 🟢 92/100 (Excellent)
├── ✅ All tools synchronized
├── ✅ Development environment stable  
├── ✅ Git state clean
├── ⚠️ Minor TypeScript errors (easily resolvable)
└── ✅ Clear mental model of current task

CONTEXT SWITCHING READINESS:
🎯 Ready for Switch: YES
├── 📝 Current work can be safely paused
├── 🔄 Git state is clean (no uncommitted changes)
├── 🧪 Tests provide safety net for resumption
├── 🤖 Agent context can be preserved
└── 📊 Progress is well-documented
```

### Smart Project Switching
```
🚀 INTELLIGENT PROJECT SWITCHING

AVAILABLE PROJECTS:
┌─────────────────────────────────────────────────────────────┐
│ 📊 PROJECT DASHBOARD                                        │
│                                                             │
│ 🎯 RECENTLY ACTIVE:                                        │
│ ├── user-dashboard-v2    [Currently Active]               │
│ │   Context: 92% | Last: Now                              │
│ │   Task: Auth implementation (75% done)                   │
│ │                                                          │
│ ├── api-service-gateway  [2 hours ago]                    │
│ │   Context: 88% | Switch: ~30 seconds                    │
│ │   Task: Rate limiting implementation                     │
│ │                                                          │
│ ├── mobile-app-redesign  [Yesterday]                      │
│ │   Context: 76% | Switch: ~45 seconds                    │
│ │   Task: Navigation component overhaul                    │
│ │                                                          │
│ └── data-analytics-tool  [3 days ago]                     │
│     Context: 65% | Switch: ~2 minutes (cold context)     │
│     Task: Database optimization                           │
│                                                            │
│ 🎪 SUGGESTED SWITCHES:                                     │
│ ├── api-service-gateway: High context similarity          │
│ ├── mobile-app-redesign: Complementary skill practice     │
│ └── New Project: Fresh perspective opportunity            │
└─────────────────────────────────────────────────────────────┘

SMART SWITCH RECOMMENDATIONS:
🎯 Based on current context and optimal workflow:

1. 🥇 api-service-gateway (Recommended)
   ├── Context Similarity: 85% (backend authentication work)
   ├── Skill Transfer: OAuth patterns apply directly
   ├── Mental Load: Low (similar problem domain)
   ├── Switch Time: ~30 seconds
   └── Benefit: Complete auth flow end-to-end

2. 🥈 mobile-app-redesign (Good Option)
   ├── Context Shift: Frontend to Frontend (familiar)
   ├── Skill Variety: Different React patterns (learning)
   ├── Mental Load: Medium (UI/UX focus change)
   ├── Switch Time: ~45 seconds
   └── Benefit: Refresh perspective, prevent tunnel vision

3. 🥉 data-analytics-tool (Strategic)
   ├── Context Shift: Major (frontend to data/backend)
   ├── Skill Expansion: Database and analytics (growth)
   ├── Mental Load: High (significant context change)
   ├── Switch Time: ~2 minutes
   └── Benefit: Skill diversification, fresh challenges
```

### Context Preservation Engine
```
💾 CONTEXT PRESERVATION SYSTEM

AUTOMATIC CONTEXT SNAPSHOTS:
├── 📸 Every 15 minutes during active development
├── 🎯 Before every project switch
├── 💾 At significant milestones (tests passing, features complete)
├── 🔄 Before major git operations (merge, rebase, reset)
└── 🚨 When potential disruption detected

PRESERVED CONTEXT ELEMENTS:
┌─────────────────────────────────────────────────────────────┐
│ 📋 COMPREHENSIVE CONTEXT SNAPSHOT                           │
│                                                             │
│ 🖥️ WORKSPACE STATE:                                        │
│ ├── Open files and cursor positions                        │
│ ├── Terminal commands and directory states                 │
│ ├── Browser tabs and DevTools state                        │
│ ├── IDE layout and panel configurations                    │
│ └── Debugging breakpoints and watch variables              │
│                                                             │
│ 🧠 MENTAL CONTEXT:                                         │
│ ├── Current task description and progress                  │
│ ├── Problem being solved and approach                      │
│ ├── Recent discoveries and insights                        │
│ ├── Next planned steps and TODO items                      │
│ └── Known issues and blockers                              │
│                                                             │
│ 🤖 AGENT CONTEXT:                                          │
│ ├── Active agent conversations and history                 │
│ ├── Agent recommendations and suggestions                  │
│ ├── Collaborative problem-solving progress                 │
│ ├── Agent specialization assignments                       │
│ └── Multi-agent coordination state                         │
│                                                             │
│ 🔧 TOOL STATE:                                             │
│ ├── Build tool configurations and cache                    │
│ ├── Test runner state and coverage                         │
│ ├── Linter and formatter settings                          │
│ ├── Git state and working directory                        │
│ └── Package manager and dependency state                   │
└─────────────────────────────────────────────────────────────┘

INTELLIGENT CONTEXT RESTORATION:
🔄 Smart Restoration Process:
1. 📊 Analyze time since last context (freshness assessment)
2. 🔍 Check for external changes (git pulls, file modifications)
3. 🛠️ Restore tool states and configurations
4. 📱 Reopen relevant files and positions
5. 🤖 Reconnect agent conversations and context
6. 🧠 Display mental context summary and next steps
7. ⚡ Validate environment and suggest updates
```

## 🚀 Multi-Project Workspace Management

### Intelligent Project Workspace
```
🎛️ MULTI-PROJECT WORKSPACE DASHBOARD

WORKSPACE OVERVIEW:
┌─────────────────────────────────────────────────────────────┐
│ 🌐 ACTIVE WORKSPACE: Development Portfolio                  │
│                                                             │
│ 📊 PROJECT STATUS:                                         │
│ ├── 🟢 user-dashboard-v2     [Active]    75% complete     │
│ ├── 🟡 api-service-gateway   [Paused]    60% complete     │
│ ├── 🔴 mobile-app-redesign   [Blocked]   40% complete     │
│ ├── 🔵 data-analytics-tool   [Planned]   15% complete     │
│ └── ⚪ new-feature-requests  [Backlog]    0% complete      │
│                                                             │
│ 🎯 RESOURCE ALLOCATION:                                    │
│ ├── CPU Usage: ████████░░ 80% (high but stable)          │
│ ├── Memory: ██████░░░░ 60% (optimal for multi-project)   │
│ ├── Storage: ████░░░░░░ 40% (plenty of space)            │
│ └── Network: ███░░░░░░░ 30% (normal development load)    │
│                                                             │
│ 🤖 AGENT ALLOCATION:                                       │
│ ├── @spec-developer: user-dashboard-v2 (primary)         │
│ ├── @backend-developer: api-service-gateway (standby)    │
│ ├── @frontend-developer: mobile-app-redesign (queued)    │
│ └── Available: 18 other agents ready for assignment       │
└─────────────────────────────────────────────────────────────┘

CROSS-PROJECT INSIGHTS:
🔍 Pattern Analysis Across Projects:
├── 🎯 Common Technologies: React, TypeScript, Node.js
├── 🔄 Shared Patterns: Authentication, API integration, testing
├── 🛠️ Reusable Components: Auth forms, API clients, UI components
├── 📚 Knowledge Transfer: OAuth implementation, performance optimization
└── 🤝 Team Coordination: Same team working across projects

OPTIMIZATION OPPORTUNITIES:
⚡ Workspace Efficiency Improvements:
├── 🔄 Share authentication implementation across projects
├── 📦 Create shared component library for UI consistency
├── 🧪 Standardize testing patterns and utilities
├── 🛠️ Unify build and deployment workflows
└── 📚 Create cross-project knowledge base
```

### Smart Context Recommendations
```
💡 INTELLIGENT CONTEXT SWITCHING RECOMMENDATIONS

OPTIMAL SWITCHING SCENARIOS:
┌─────────────────────────────────────────────────────────────┐
│ 🎯 WHEN TO SWITCH PROJECTS                                  │
│                                                             │
│ ✅ GOOD TIMES TO SWITCH:                                   │
│ ├── After completing a logical milestone                   │
│ ├── When blocked waiting for external dependencies         │
│ ├── During natural break points (tests passing)            │
│ ├── When mental fatigue detected in current domain         │
│ ├── For skill variety and learning opportunities           │
│ └── When context switching supports team coordination      │
│                                                             │
│ ❌ AVOID SWITCHING WHEN:                                   │
│ ├── In deep flow state (high productivity)                │
│ ├── Debugging complex issues (context is precious)         │
│ ├── Near completion of current task (< 30 min left)       │
│ ├── Learning new concepts (consolidation needed)           │
│ ├── After recent context switch (< 1 hour ago)            │
│ └── During time-sensitive deadlines                        │
│                                                             │
│ 🎪 CURRENT RECOMMENDATION:                                 │
│ Status: 🟡 NEUTRAL - Good time for strategic switch       │
│ Reason: Authentication work at logical pause point        │
│ Suggestion: Consider api-service-gateway for backend auth │
│ Benefit: Complete end-to-end authentication understanding │
└─────────────────────────────────────────────────────────────┘

CONTEXT SWITCHING PATTERNS:
📊 Your Historical Patterns:
├── 🕘 Optimal Switch Frequency: Every 2-3 hours
├── 🎯 Preferred Pattern: Complete sub-tasks before switching
├── 🧠 Best Switch Type: Related technology, different scope
├── ⏰ Peak Switch Times: After lunch (energy refresh)
├── 🚫 Least Effective: Rapid switching (< 1 hour intervals)
└── 💡 Success Factor: Clear task definition before switch

PERSONALIZED SWITCH STRATEGY:
🎯 Tailored to Your Work Style:
├── 🔄 Morning: Focus sessions (2-3 hour blocks)
├── 🍽️ Lunch: Natural context switch opportunity
├── 🌅 Afternoon: Varied projects for energy maintenance
├── 🎯 End-of-day: Context preservation and planning
└── 📝 Documentation: Always document before switching
```

## 🔄 Automated Context Management

### Smart Context Automation
```
🤖 AUTOMATED CONTEXT MANAGEMENT

INTELLIGENT AUTOMATION RULES:
├── 📸 Auto-snapshot before every git operation
├── 💾 Save context when inactivity detected (>15 min)
├── 🔄 Pre-load context for scheduled project switches
├── 🚨 Emergency context save on system events
├── 🧠 Background context analysis and optimization
├── 📊 Performance monitoring and context health checks
└── 🤝 Team context synchronization and sharing

PREDICTIVE CONTEXT LOADING:
🔮 Smart Preloading Based on Patterns:
├── 📅 Calendar integration (meeting-based project switches)
├── 🕐 Time-based patterns (morning/afternoon preferences)
├── 🎯 Task completion predictions (when current task finishes)
├── 👥 Team coordination needs (collaborative work sessions)
├── 🚨 Urgent issue detection (priority project switches)
└── 📊 Performance optimization (resource usage patterns)

CONTEXT HEALTH MONITORING:
📊 Continuous Context Quality Assessment:
┌─────────────────────────────────────────────────────────────┐
│ 🔍 CONTEXT HEALTH DASHBOARD                                │
│                                                             │
│ user-dashboard-v2:     🟢 Excellent (92/100)              │
│ ├── Tool Sync: ████████████████████ 100%                 │
│ ├── Mental Model: ████████████████░░ 85%                  │
│ ├── Agent Context: ███████████████░░░ 90%                 │
│ └── Environment: ███████████████████░ 95%                 │
│                                                             │
│ api-service-gateway:   🟡 Good (88/100)                    │
│ ├── Tool Sync: ███████████████████░ 95%                  │
│ ├── Mental Model: ████████████░░░░░░ 70%                  │
│ ├── Agent Context: ███████████████████ 100%               │
│ └── Environment: ███████████████████░ 95%                 │
│                                                             │
│ mobile-app-redesign:   🔴 Needs Attention (76/100)        │
│ ├── Tool Sync: █████████████░░░░░░░ 65%                   │
│ ├── Mental Model: ████████████░░░░░░ 60%                  │
│ ├── Agent Context: ███████████████████ 100%               │
│ └── Environment: ███████████████░░░░ 80%                  │
└─────────────────────────────────────────────────────────────┘

AUTOMATIC CONTEXT OPTIMIZATION:
⚡ Background Improvements:
├── 🔧 Outdated tool states refreshed automatically
├── 📝 Mental context notes organized and summarized
├── 🤖 Agent context relationships optimized
├── 🛠️ Environment dependencies updated
├── 📊 Performance bottlenecks identified and resolved
└── 🔄 Cross-project synchronization maintained
```

This seamless context switching system ensures developers can move between projects efficiently while maintaining productivity and mental clarity.
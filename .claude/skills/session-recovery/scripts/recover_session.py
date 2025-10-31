#!/usr/bin/env python3
"""
Session recovery script - Automatically restores session context from memory.

Integrates with CLAUDE.md Law #6 (Cross-Session Memory & Learning) by loading
session state, TodoWrite status, agent coordination, and project knowledge.

Usage:
    python recover_session.py [--project PROJECT] [--date YYYY-MM-DD] [--compliance-check]
"""

import argparse
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
import sys


def get_workspace_root():
    """Get the workspace root directory."""
    script_dir = Path(__file__).resolve().parent
    workspace_root = script_dir.parent.parent.parent.parent
    return workspace_root


def read_memory_file(file_path):
    """Safely read a memory XML file."""
    try:
        if file_path.exists():
            tree = ET.parse(file_path)
            return tree.getroot()
        else:
            return None
    except Exception as e:
        print(f"⚠️  Warning: Could not read {file_path}: {e}")
        return None


def load_active_project():
    """Load active project state."""
    workspace_root = get_workspace_root()
    project_file = workspace_root / "memories" / "session-context" / "active-project.xml"

    root = read_memory_file(project_file)
    if root is None:
        return None

    project_data = {
        'name': root.findtext('project-name', 'Unknown'),
        'phase': root.findtext('phase', 'Unknown'),
        'start_date': root.findtext('start-date', 'Unknown'),
        'last_updated': root.findtext('last-updated', 'Unknown')
    }

    # Load current task
    current_task_elem = root.find('current-task')
    if current_task_elem is not None:
        project_data['current_task'] = {
            'id': current_task_elem.findtext('id', 'N/A'),
            'description': current_task_elem.findtext('description', 'N/A'),
            'status': current_task_elem.findtext('status', 'N/A'),
            'started': current_task_elem.findtext('started', 'N/A')
        }

    # Load blocking issues
    blocking_issues = root.findall('blocking-issues/issue')
    if blocking_issues:
        project_data['blocking_issues'] = [
            {
                'description': issue.findtext('description', 'N/A'),
                'blocked_since': issue.findtext('blocked-since', 'N/A'),
                'requires': issue.findtext('requires', 'N/A')
            }
            for issue in blocking_issues
        ]

    # Load context metadata
    metadata_elem = root.find('context-metadata')
    if metadata_elem is not None:
        project_data['metadata'] = {
            'tokens_used': metadata_elem.findtext('total-tokens-used', '0'),
            'context_clears': metadata_elem.findtext('context-clears', '0'),
            'session_count': metadata_elem.findtext('session-count', '1')
        }

    return project_data


def load_pending_decisions():
    """Load pending client decisions."""
    workspace_root = get_workspace_root()
    decisions_file = workspace_root / "memories" / "session-context" / "pending-decisions.xml"

    root = read_memory_file(decisions_file)
    if root is None:
        return []

    decisions = root.findall('decision')
    return [
        {
            'description': dec.findtext('description', 'N/A'),
            'pending_since': dec.findtext('pending-since', 'N/A'),
            'priority': dec.findtext('priority', 'medium')
        }
        for dec in decisions
    ]


def load_uncertainty_log(limit=5):
    """Load recent uncertainty events."""
    workspace_root = get_workspace_root()
    log_file = workspace_root / "memories" / "protocol-compliance" / "uncertainty-log.xml"

    root = read_memory_file(log_file)
    if root is None:
        return []

    uncertainties = root.findall('uncertainty')
    # Get most recent
    recent = uncertainties[-limit:] if len(uncertainties) > limit else uncertainties

    return [
        {
            'timestamp': unc.findtext('timestamp', 'N/A'),
            'type': unc.findtext('type', 'N/A'),
            'issue': unc.findtext('issue', 'N/A'),
            'resolution': unc.findtext('resolution', 'Unresolved')
        }
        for unc in recent
    ]


def load_agent_handoffs():
    """Load active agent coordination state."""
    workspace_root = get_workspace_root()
    handoffs_file = workspace_root / "memories" / "agent-coordination" / "context-packages.xml"

    root = read_memory_file(handoffs_file)
    if root is None:
        return []

    handoffs = root.findall('handoff')
    # Only return in-progress or pending handoffs
    active_handoffs = [
        {
            'timestamp': handoff.get('timestamp', 'N/A'),
            'from': handoff.findtext('from', 'N/A'),
            'to': handoff.findtext('to', 'N/A'),
            'task': handoff.findtext('task', 'N/A'),
            'status': handoff.findtext('status', 'N/A')
        }
        for handoff in handoffs
        if handoff.findtext('status') in ['pending', 'in-progress']
    ]

    return active_handoffs


def print_session_summary(project_data, pending_decisions, uncertainties, agent_handoffs):
    """Print formatted session recovery summary."""
    print("\n" + "="*60)
    print("SESSION RECOVERY COMPLETE")
    print("="*60 + "\n")

    # Active Project
    if project_data:
        print(f"📂 ACTIVE PROJECT: {project_data['name']}")
        print(f"   Phase: {project_data['phase']}")
        print(f"   Started: {project_data['start_date']}")
        print(f"   Last Updated: {project_data['last_updated']}\n")

        if 'current_task' in project_data:
            task = project_data['current_task']
            print(f"⚙️  CURRENT TASK:")
            print(f"   [{task['id']}] {task['description']}")
            print(f"   Status: {task['status']}")
            print(f"   Started: {task['started']}\n")

        if 'blocking_issues' in project_data:
            print(f"🚫 BLOCKING ISSUES ({len(project_data['blocking_issues'])}):")
            for issue in project_data['blocking_issues']:
                print(f"   • {issue['description']}")
                print(f"     Blocked since: {issue['blocked_since']}")
                print(f"     Requires: {issue['requires']}\n")

        if 'metadata' in project_data:
            meta = project_data['metadata']
            print(f"📊 SESSION METADATA:")
            print(f"   Tokens Used: {meta['tokens_used']}")
            print(f"   Context Clears: {meta['context_clears']}")
            print(f"   Session Count: {meta['session_count']}\n")
    else:
        print("📂 ACTIVE PROJECT: No active project found")
        print("   Starting fresh session\n")

    # Pending Decisions
    if pending_decisions:
        print(f"⏳ PENDING DECISIONS ({len(pending_decisions)}):")
        for dec in pending_decisions:
            priority_emoji = "🔴" if dec['priority'] == 'high' else "🟡" if dec['priority'] == 'medium' else "🟢"
            print(f"   {priority_emoji} {dec['description']}")
            print(f"     Pending since: {dec['pending_since']}\n")
    else:
        print("⏳ PENDING DECISIONS: None\n")

    # Recent Uncertainties
    if uncertainties:
        print(f"⚠️  RECENT UNCERTAINTIES ({len(uncertainties)}):")
        for unc in uncertainties:
            print(f"   • [{unc['type']}] {unc['issue'][:50]}...")
            print(f"     Resolution: {unc['resolution'][:50]}...\n")
    else:
        print("⚠️  RECENT UNCERTAINTIES: None\n")

    # Agent Handoffs
    if agent_handoffs:
        print(f"🤝 ACTIVE AGENT HANDOFFS ({len(agent_handoffs)}):")
        for handoff in agent_handoffs:
            print(f"   • {handoff['from']} → {handoff['to']}")
            print(f"     Task: {handoff['task']}")
            print(f"     Status: {handoff['status']}\n")
    else:
        print("🤝 ACTIVE AGENT HANDOFFS: None\n")

    # Next Steps
    print("="*60)
    print("NEXT STEPS:")
    print("="*60)

    if pending_decisions:
        print("1. 🔴 RESOLVE PENDING DECISIONS (blocking progress)")
        for dec in pending_decisions:
            if dec['priority'] == 'high':
                print(f"   → {dec['description']}")

    if project_data and 'blocking_issues' in project_data:
        print("2. 🚫 ADDRESS BLOCKING ISSUES")
        for issue in project_data['blocking_issues']:
            print(f"   → {issue['requires']}")

    if project_data and 'current_task' in project_data:
        if project_data['current_task']['status'] == 'in_progress':
            print(f"3. ⚙️  CONTINUE CURRENT TASK")
            print(f"   → {project_data['current_task']['description']}")
        else:
            print(f"3. 📋 START NEXT TASK FROM TODOWRITE")

    if agent_handoffs:
        print("4. 🤝 COMPLETE AGENT HANDOFFS")
        for handoff in agent_handoffs:
            print(f"   → {handoff['task']}")

    if not pending_decisions and not (project_data and 'blocking_issues' in project_data):
        print("✅ NO BLOCKERS - Ready to continue work!")

    print("\n" + "="*60)
    print("Ready to resume! 🚀")
    print("="*60 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Recover session context from memory",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--project",
        help="Load specific project context"
    )

    parser.add_argument(
        "--date",
        help="Load context from specific date (YYYY-MM-DD)"
    )

    parser.add_argument(
        "--compliance-check",
        action="store_true",
        help="Focus on protocol compliance status"
    )

    args = parser.parse_args()

    # Load memory components
    print("\n🔄 Loading session context from memory...\n")

    project_data = load_active_project()
    pending_decisions = load_pending_decisions()
    uncertainties = load_uncertainty_log(limit=5)
    agent_handoffs = load_agent_handoffs()

    # Print summary
    print_session_summary(project_data, pending_decisions, uncertainties, agent_handoffs)

    return 0


if __name__ == "__main__":
    try:
        exit(main())
    except KeyboardInterrupt:
        print("\n\n⚠️  Session recovery interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error during session recovery: {e}")
        sys.exit(1)

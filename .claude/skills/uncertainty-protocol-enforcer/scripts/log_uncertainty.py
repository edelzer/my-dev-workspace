#!/usr/bin/env python3
"""
Log uncertainty patterns to memory for cross-session learning.

Integrates with CLAUDE.md Law #6 (Cross-Session Memory & Learning) by logging
uncertainty detection events to /memories/protocol-compliance/uncertainty-log.xml

Usage:
    python log_uncertainty.py \
        --type "language|approach|context|requirements|security|architecture|debt" \
        --issue "Description of what was uncertain" \
        --resolution "How uncertainty was resolved" \
        [--questions-asked "Questions that led to resolution"] \
        [--decision "Final decision made"]
"""

import argparse
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path
import os


def validate_memory_path(path_str):
    """
    Validate that path starts with /memories/ and contains no path traversal.

    Security validation from scripts/validate-memory-path.js:
    - Must start with /memories/
    - No ../ or ..\\ sequences
    - No URL-encoded path traversal
    - No null bytes
    """
    # Remove leading/trailing whitespace
    path_str = path_str.strip()

    # Convert to Path object for normalization
    path = Path(path_str)

    # Check if path starts with /memories/ (normalize first)
    if not str(path).startswith('/memories/') and not str(path).startswith('memories/'):
        raise ValueError(f"Invalid path: must start with /memories/ (got: {path_str})")

    # Check for path traversal sequences
    path_str_lower = path_str.lower()
    dangerous_patterns = [
        '../', '..\\',
        '%2e%2e%2f', '%2e%2e%5c',  # URL-encoded ../ and ..\
        '..%2f', '..%5c',
        '%00'  # Null byte
    ]

    for pattern in dangerous_patterns:
        if pattern in path_str_lower:
            raise ValueError(f"Path traversal detected: {pattern} found in {path_str}")

    return path


def get_workspace_root():
    """Get the workspace root directory."""
    # Script is in .claude/skills/uncertainty-protocol-enforcer/scripts/
    # Workspace root is 4 levels up
    script_dir = Path(__file__).resolve().parent
    workspace_root = script_dir.parent.parent.parent.parent
    return workspace_root


def ensure_uncertainty_log_exists():
    """Ensure the uncertainty log file exists with proper structure."""
    workspace_root = get_workspace_root()
    log_path = workspace_root / "memories" / "protocol-compliance" / "uncertainty-log.xml"

    # Create directories if they don't exist
    log_path.parent.mkdir(parents=True, exist_ok=True)

    # Create log file if it doesn't exist
    if not log_path.exists():
        root = ET.Element("uncertainty-log")
        root.set("description", "Cross-session uncertainty pattern tracking for Law #1A enforcement")
        root.set("created", datetime.utcnow().isoformat() + "Z")

        tree = ET.ElementTree(root)
        ET.indent(tree, space="  ")
        tree.write(log_path, encoding="utf-8", xml_declaration=True)

    return log_path


def log_uncertainty(uncertainty_type, issue, resolution, questions_asked=None, decision=None):
    """
    Log uncertainty event to memory.

    Args:
        uncertainty_type: Type of uncertainty (language, approach, context, etc.)
        issue: Description of what was uncertain
        resolution: How the uncertainty was resolved
        questions_asked: Optional - Questions that resolved uncertainty
        decision: Optional - Final decision made
    """
    # Validate type
    valid_types = ["language", "approach", "context", "requirements", "security", "architecture", "debt"]
    if uncertainty_type not in valid_types:
        raise ValueError(f"Invalid uncertainty type. Must be one of: {', '.join(valid_types)}")

    # Ensure log file exists
    log_path = ensure_uncertainty_log_exists()

    # Validate path (security check)
    relative_log_path = log_path.relative_to(get_workspace_root())
    validate_memory_path(f"/memories/{relative_log_path}")

    # Parse existing log
    tree = ET.parse(log_path)
    root = tree.getroot()

    # Create new uncertainty entry
    entry = ET.SubElement(root, "uncertainty")

    # Add timestamp
    timestamp_elem = ET.SubElement(entry, "timestamp")
    timestamp_elem.text = datetime.utcnow().isoformat() + "Z"

    # Add type
    type_elem = ET.SubElement(entry, "type")
    type_elem.text = uncertainty_type

    # Add issue
    issue_elem = ET.SubElement(entry, "issue")
    issue_elem.text = issue

    # Add resolution
    resolution_elem = ET.SubElement(entry, "resolution")
    resolution_elem.text = resolution

    # Add optional fields
    if questions_asked:
        questions_elem = ET.SubElement(entry, "questions-asked")
        questions_elem.text = questions_asked

    if decision:
        decision_elem = ET.SubElement(entry, "decision")
        decision_elem.text = decision

    # Write back to file with pretty formatting
    ET.indent(tree, space="  ")
    tree.write(log_path, encoding="utf-8", xml_declaration=True)

    print(f"✅ Uncertainty logged to {log_path}")
    print(f"   Type: {uncertainty_type}")
    print(f"   Issue: {issue[:60]}..." if len(issue) > 60 else f"   Issue: {issue}")
    print(f"   Resolution: {resolution[:60]}..." if len(resolution) > 60 else f"   Resolution: {resolution}")


def main():
    parser = argparse.ArgumentParser(
        description="Log uncertainty patterns to memory for cross-session learning",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--type",
        required=True,
        choices=["language", "approach", "context", "requirements", "security", "architecture", "debt"],
        help="Type of uncertainty detected"
    )

    parser.add_argument(
        "--issue",
        required=True,
        help="Description of what was uncertain"
    )

    parser.add_argument(
        "--resolution",
        required=True,
        help="How the uncertainty was resolved"
    )

    parser.add_argument(
        "--questions-asked",
        help="Questions that led to resolution (optional)"
    )

    parser.add_argument(
        "--decision",
        help="Final decision made (optional)"
    )

    args = parser.parse_args()

    try:
        log_uncertainty(
            uncertainty_type=args.type,
            issue=args.issue,
            resolution=args.resolution,
            questions_asked=args.questions_asked,
            decision=args.decision
        )
    except Exception as e:
        print(f"❌ Error logging uncertainty: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())

#!/usr/bin/env python3
"""
Log architectural drift prevention events to memory for cross-session learning.

Integrates with CLAUDE.md Law #6 (Cross-Session Memory & Learning) by logging
specification drift detection and prevention to memory system.

Usage:
    python log_drift_prevention.py \
        --type "architecture|interface|behavior|pattern|naming|specification-update" \
        --specification "Quoted text from specification" \
        --proposed "What was about to be implemented" \
        --resolution "How drift was prevented or authorized"
"""

import argparse
import xml.etree.ElementTree as ET
from datetime import datetime
from pathlib import Path


def validate_memory_path(path_str):
    """
    Validate that path starts with /memories/ and contains no path traversal.

    Security validation from scripts/validate-memory-path.js
    """
    path_str = path_str.strip()
    path = Path(path_str)

    if not str(path).startswith('/memories/') and not str(path).startswith('memories/'):
        raise ValueError(f"Invalid path: must start with /memories/ (got: {path_str})")

    path_str_lower = path_str.lower()
    dangerous_patterns = [
        '../', '..\\',
        '%2e%2e%2f', '%2e%2e%5c',
        '..%2f', '..%5c',
        '%00'
    ]

    for pattern in dangerous_patterns:
        if pattern in path_str_lower:
            raise ValueError(f"Path traversal detected: {pattern} found in {path_str}")

    return path


def get_workspace_root():
    """Get the workspace root directory."""
    script_dir = Path(__file__).resolve().parent
    workspace_root = script_dir.parent.parent.parent.parent
    return workspace_root


def ensure_drift_log_exists():
    """Ensure the drift prevention log file exists with proper structure."""
    workspace_root = get_workspace_root()
    log_path = workspace_root / "memories" / "protocol-compliance" / "drift-prevention-log.xml"

    # Create directories if they don't exist
    log_path.parent.mkdir(parents=True, exist_ok=True)

    # Create log file if it doesn't exist
    if not log_path.exists():
        root = ET.Element("drift-prevention-log")
        root.set("description", "Cross-session architectural drift prevention tracking for Law #1B enforcement")
        root.set("created", datetime.utcnow().isoformat() + "Z")

        tree = ET.ElementTree(root)
        ET.indent(tree, space="  ")
        tree.write(log_path, encoding="utf-8", xml_declaration=True)

    return log_path


def log_drift_prevention(drift_type, specification, proposed, resolution):
    """
    Log drift prevention event to memory.

    Args:
        drift_type: Type of drift (architecture, interface, behavior, etc.)
        specification: Exact text from specification
        proposed: What was about to be implemented
        resolution: How drift was prevented or authorized
    """
    # Validate type
    valid_types = [
        "architecture",
        "interface",
        "behavior",
        "pattern",
        "naming",
        "specification-update"
    ]
    if drift_type not in valid_types:
        raise ValueError(f"Invalid drift type. Must be one of: {', '.join(valid_types)}")

    # Ensure log file exists
    log_path = ensure_drift_log_exists()

    # Validate path (security check)
    relative_log_path = log_path.relative_to(get_workspace_root())
    validate_memory_path(f"/memories/{relative_log_path}")

    # Parse existing log
    tree = ET.parse(log_path)
    root = tree.getroot()

    # Create new drift prevention entry
    entry = ET.SubElement(root, "drift-prevention")

    # Add timestamp
    timestamp_elem = ET.SubElement(entry, "timestamp")
    timestamp_elem.text = datetime.utcnow().isoformat() + "Z"

    # Add type
    type_elem = ET.SubElement(entry, "type")
    type_elem.text = drift_type

    # Add specification
    spec_elem = ET.SubElement(entry, "specification")
    spec_elem.text = specification

    # Add proposed implementation
    proposed_elem = ET.SubElement(entry, "proposed")
    proposed_elem.text = proposed

    # Add resolution
    resolution_elem = ET.SubElement(entry, "resolution")
    resolution_elem.text = resolution

    # Write back to file with pretty formatting
    ET.indent(tree, space="  ")
    tree.write(log_path, encoding="utf-8", xml_declaration=True)

    print(f"✅ Drift prevention logged to {log_path}")
    print(f"   Type: {drift_type}")
    print(f"   Specification: {specification[:60]}..." if len(specification) > 60 else f"   Specification: {specification}")
    print(f"   Resolution: {resolution[:60]}..." if len(resolution) > 60 else f"   Resolution: {resolution}")


def main():
    parser = argparse.ArgumentParser(
        description="Log architectural drift prevention events to memory",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )

    parser.add_argument(
        "--type",
        required=True,
        choices=["architecture", "interface", "behavior", "pattern", "naming", "specification-update"],
        help="Type of drift detected/prevented"
    )

    parser.add_argument(
        "--specification",
        required=True,
        help="Exact text from specification document"
    )

    parser.add_argument(
        "--proposed",
        required=True,
        help="What was about to be implemented (the drift)"
    )

    parser.add_argument(
        "--resolution",
        required=True,
        help="How drift was prevented or how specification was updated"
    )

    args = parser.parse_args()

    try:
        log_drift_prevention(
            drift_type=args.type,
            specification=args.specification,
            proposed=args.proposed,
            resolution=args.resolution
        )
    except Exception as e:
        print(f"❌ Error logging drift prevention: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())

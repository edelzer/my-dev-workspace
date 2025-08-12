#!/usr/bin/env python3
"""
Hook Validation System for Claude Code Rule2Hook Integration
Validates generated hook configurations for correctness and safety.
"""

import json
import sys
import os
from pathlib import Path

def validate_hooks_structure(hooks_data):
    """Validate the overall structure of hooks.json"""
    errors = []
    
    if not isinstance(hooks_data, dict):
        errors.append("Root should be a dictionary")
        return errors
    
    if "hooks" not in hooks_data:
        errors.append("Missing 'hooks' key in root")
        return errors
    
    hooks = hooks_data["hooks"]
    if not isinstance(hooks, dict):
        errors.append("'hooks' should be a dictionary")
        return errors
    
    valid_events = {"PreToolUse", "PostToolUse", "Stop", "Notification"}
    for event in hooks:
        if event not in valid_events:
            errors.append(f"Invalid event type: {event}")
    
    return errors

def validate_event_hooks(event_name, event_hooks):
    """Validate hooks for a specific event"""
    errors = []
    
    if not isinstance(event_hooks, list):
        errors.append(f"{event_name}: Event hooks should be a list")
        return errors
    
    for i, hook_group in enumerate(event_hooks):
        if not isinstance(hook_group, dict):
            errors.append(f"{event_name}[{i}]: Hook group should be a dictionary")
            continue
        
        if "hooks" not in hook_group:
            errors.append(f"{event_name}[{i}]: Missing 'hooks' key")
            continue
        
        if not isinstance(hook_group["hooks"], list):
            errors.append(f"{event_name}[{i}]: 'hooks' should be a list")
            continue
        
        # Validate matcher if present
        if "matcher" in hook_group:
            matcher = hook_group["matcher"]
            if not isinstance(matcher, str):
                errors.append(f"{event_name}[{i}]: 'matcher' should be a string")
        
        # Validate individual hooks
        for j, hook in enumerate(hook_group["hooks"]):
            if not isinstance(hook, dict):
                errors.append(f"{event_name}[{i}].hooks[{j}]: Hook should be a dictionary")
                continue
            
            if "type" not in hook:
                errors.append(f"{event_name}[{i}].hooks[{j}]: Missing 'type' key")
            elif hook["type"] != "command":
                errors.append(f"{event_name}[{i}].hooks[{j}]: Only 'command' type supported")
            
            if "command" not in hook:
                errors.append(f"{event_name}[{i}].hooks[{j}]: Missing 'command' key")
            elif not isinstance(hook["command"], str):
                errors.append(f"{event_name}[{i}].hooks[{j}]: 'command' should be a string")
    
    return errors

def validate_command_safety(command):
    """Check for potentially dangerous commands"""
    warnings = []
    dangerous_patterns = [
        "rm -rf",
        "sudo rm",
        "format",
        "del /q",
        "rd /s",
        "> /dev/null",  # Note: 2>/dev/null is usually OK
    ]
    
    for pattern in dangerous_patterns:
        if pattern in command.lower():
            if pattern == "> /dev/null" and "2>/dev/null" in command:
                continue  # 2>/dev/null is OK for error suppression
            warnings.append(f"Potentially dangerous command pattern: {pattern}")
    
    return warnings

def main():
    """Main validation function"""
    hooks_file = Path(".claude/hooks.json")
    
    if not hooks_file.exists():
        print(f"❌ Hooks file not found: {hooks_file}")
        return 1
    
    try:
        with open(hooks_file, 'r') as f:
            hooks_data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {hooks_file}: {e}")
        return 1
    except Exception as e:
        print(f"❌ Error reading {hooks_file}: {e}")
        return 1
    
    print(f"🔍 Validating hooks configuration: {hooks_file}")
    print()
    
    # Validate overall structure
    errors = validate_hooks_structure(hooks_data)
    if errors:
        print("❌ Structure Errors:")
        for error in errors:
            print(f"  - {error}")
        return 1
    
    # Validate each event type
    all_errors = []
    all_warnings = []
    
    for event_name, event_hooks in hooks_data["hooks"].items():
        event_errors = validate_event_hooks(event_name, event_hooks)
        all_errors.extend(event_errors)
        
        # Check command safety
        for hook_group in event_hooks:
            if "hooks" in hook_group:
                for hook in hook_group["hooks"]:
                    if "command" in hook:
                        warnings = validate_command_safety(hook["command"])
                        all_warnings.extend([f"{event_name}: {w}" for w in warnings])
    
    # Report results
    if all_errors:
        print("❌ Validation Errors:")
        for error in all_errors:
            print(f"  - {error}")
        return 1
    
    if all_warnings:
        print("⚠️  Security Warnings:")
        for warning in all_warnings:
            print(f"  - {warning}")
    
    # Print summary
    total_hooks = sum(
        len(hook_group.get("hooks", []))
        for event_hooks in hooks_data["hooks"].values()
        for hook_group in event_hooks
    )
    
    print("✅ Validation Summary:")
    print(f"  - Events configured: {len(hooks_data['hooks'])}")
    print(f"  - Total hooks: {total_hooks}")
    print(f"  - Structure: Valid")
    print(f"  - Safety warnings: {len(all_warnings)}")
    
    # List configured events and matchers
    print("\n📋 Configured Hooks:")
    for event_name, event_hooks in hooks_data["hooks"].items():
        print(f"  {event_name}:")
        for i, hook_group in enumerate(event_hooks):
            matcher = hook_group.get("matcher", "All Tools")
            hook_count = len(hook_group.get("hooks", []))
            print(f"    - Matcher: {matcher} ({hook_count} hooks)")
    
    return 0 if not all_warnings else 2  # 2 for warnings, 0 for success

if __name__ == "__main__":
    sys.exit(main())
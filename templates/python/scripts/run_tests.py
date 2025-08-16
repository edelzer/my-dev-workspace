#!/usr/bin/env python3
"""
Test runner script for FastAPI Professional Template.

Provides comprehensive testing capabilities with coverage reporting,
security analysis, and integration with CI/CD pipelines.
"""

import argparse
import subprocess
import sys
from pathlib import Path


def run_command(command: list, description: str) -> int:
    """Run a command and return exit code."""
    print(f"\n🔄 {description}...")
    print(f"Running: {' '.join(command)}")
    
    result = subprocess.run(command, capture_output=False)
    
    if result.returncode == 0:
        print(f"✅ {description} completed successfully")
    else:
        print(f"❌ {description} failed with exit code {result.returncode}")
    
    return result.returncode


def main():
    """Main test runner function."""
    parser = argparse.ArgumentParser(description="FastAPI Test Runner")
    parser.add_argument("--unit", action="store_true", help="Run unit tests only")
    parser.add_argument("--integration", action="store_true", help="Run integration tests only")
    parser.add_argument("--e2e", action="store_true", help="Run E2E tests only")
    parser.add_argument("--coverage", action="store_true", help="Generate coverage report")
    parser.add_argument("--security", action="store_true", help="Run security tests")
    parser.add_argument("--all", action="store_true", help="Run all tests and checks")
    parser.add_argument("--watch", action="store_true", help="Run tests in watch mode")
    
    args = parser.parse_args()
    
    # Default to all tests if no specific test type specified
    if not any([args.unit, args.integration, args.e2e, args.security]):
        args.all = True
    
    exit_code = 0
    
    # Base pytest command
    pytest_cmd = ["python", "-m", "pytest", "-v"]
    
    if args.coverage or args.all:
        pytest_cmd.extend(["--cov=app", "--cov-report=html", "--cov-report=term", "--cov-report=xml"])
    
    if args.watch:
        pytest_cmd.append("--watch")
    
    # Run specific test categories
    if args.unit or args.all:
        cmd = pytest_cmd + ["tests/unit/"]
        exit_code |= run_command(cmd, "Unit tests")
    
    if args.integration or args.all:
        cmd = pytest_cmd + ["tests/integration/"]
        exit_code |= run_command(cmd, "Integration tests")
    
    if args.e2e or args.all:
        cmd = pytest_cmd + ["tests/e2e/"]
        exit_code |= run_command(cmd, "End-to-end tests")
    
    if args.security or args.all:
        # Security analysis with bandit
        exit_code |= run_command(
            ["python", "-m", "bandit", "-r", "app/", "-f", "json", "-o", "bandit-report.json"],
            "Security analysis (Bandit)"
        )
        
        # Dependency vulnerability check
        exit_code |= run_command(
            ["python", "-m", "safety", "check", "--json", "--output", "safety-report.json"],
            "Dependency vulnerability check (Safety)"
        )
    
    # Code quality checks if running all
    if args.all:
        exit_code |= run_command(
            ["python", "-m", "black", "--check", "--diff", "."],
            "Code formatting check (Black)"
        )
        
        exit_code |= run_command(
            ["python", "-m", "isort", "--check-only", "--diff", "."],
            "Import sorting check (isort)"
        )
        
        exit_code |= run_command(
            ["python", "-m", "flake8", "."],
            "Linting (flake8)"
        )
        
        exit_code |= run_command(
            ["python", "-m", "mypy", "."],
            "Type checking (mypy)"
        )
    
    # Summary
    if exit_code == 0:
        print("\n🎉 All tests and checks passed successfully!")
    else:
        print(f"\n💥 Some tests or checks failed (exit code: {exit_code})")
    
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
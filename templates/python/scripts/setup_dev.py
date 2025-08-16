#!/usr/bin/env python3
"""
Development environment setup script.

Sets up the complete development environment including database,
Redis, dependencies, and initial configuration.
"""

import os
import subprocess
import sys
from pathlib import Path


def run_command(command: list, description: str, check: bool = True) -> int:
    """Run a command with error handling."""
    print(f"\n🔄 {description}...")
    print(f"Running: {' '.join(command)}")
    
    try:
        result = subprocess.run(command, check=check, capture_output=False)
        print(f"✅ {description} completed successfully")
        return 0
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed with exit code {e.returncode}")
        return e.returncode
    except FileNotFoundError:
        print(f"❌ Command not found: {command[0]}")
        return 1


def check_prerequisites():
    """Check if required tools are installed."""
    print("🔍 Checking prerequisites...")
    
    required_tools = [
        ("python", "Python 3.9+"),
        ("poetry", "Poetry package manager"),
        ("docker", "Docker"),
        ("docker-compose", "Docker Compose"),
    ]
    
    missing_tools = []
    
    for tool, description in required_tools:
        try:
            subprocess.run([tool, "--version"], check=True, capture_output=True)
            print(f"✅ {description} found")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"❌ {description} not found")
            missing_tools.append(tool)
    
    if missing_tools:
        print(f"\n❌ Missing required tools: {', '.join(missing_tools)}")
        print("Please install the missing tools and run this script again.")
        return False
    
    print("✅ All prerequisites satisfied")
    return True


def setup_environment():
    """Set up environment files."""
    print("\n🔧 Setting up environment...")
    
    env_example = Path(".env.example")
    env_file = Path(".env")
    
    if env_example.exists() and not env_file.exists():
        import shutil
        shutil.copy(env_example, env_file)
        print("✅ Created .env file from .env.example")
        print("📝 Please edit .env file with your configuration")
    elif env_file.exists():
        print("✅ .env file already exists")
    else:
        print("❌ .env.example file not found")
        return False
    
    return True


def install_dependencies():
    """Install Python dependencies."""
    print("\n📦 Installing dependencies...")
    
    # Check if Poetry is available
    try:
        subprocess.run(["poetry", "--version"], check=True, capture_output=True)
        use_poetry = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        use_poetry = False
    
    if use_poetry:
        # Install with Poetry
        exit_code = run_command(
            ["poetry", "install", "--with", "dev"],
            "Installing dependencies with Poetry"
        )
    else:
        # Fallback to pip
        exit_code = run_command(
            ["pip", "install", "-r", "requirements/development.txt"],
            "Installing dependencies with pip"
        )
    
    return exit_code == 0


def setup_database():
    """Set up database using Docker Compose."""
    print("\n🗄️ Setting up database...")
    
    # Start database services
    exit_code = run_command(
        ["docker-compose", "up", "-d", "db", "redis"],
        "Starting database and Redis services"
    )
    
    if exit_code != 0:
        return False
    
    # Wait for services to be ready
    print("⏳ Waiting for services to be ready...")
    import time
    time.sleep(10)
    
    # Run database migrations
    exit_code = run_command(
        ["poetry", "run", "alembic", "upgrade", "head"],
        "Running database migrations"
    )
    
    return exit_code == 0


def setup_pre_commit():
    """Set up pre-commit hooks."""
    print("\n🪝 Setting up pre-commit hooks...")
    
    exit_code = run_command(
        ["poetry", "run", "pre-commit", "install"],
        "Installing pre-commit hooks"
    )
    
    return exit_code == 0


def run_initial_tests():
    """Run initial tests to verify setup."""
    print("\n🧪 Running initial tests...")
    
    exit_code = run_command(
        ["poetry", "run", "python", "scripts/run_tests.py", "--unit"],
        "Running unit tests",
        check=False
    )
    
    return exit_code == 0


def main():
    """Main setup function."""
    print("🚀 FastAPI Professional Template - Development Setup")
    print("=" * 55)
    
    steps = [
        ("Prerequisites check", check_prerequisites),
        ("Environment setup", setup_environment),
        ("Dependencies installation", install_dependencies),
        ("Pre-commit hooks setup", setup_pre_commit),
        ("Database setup", setup_database),
        ("Initial tests", run_initial_tests),
    ]
    
    for step_name, step_func in steps:
        print(f"\n📋 Step: {step_name}")
        if not step_func():
            print(f"\n💥 Setup failed at step: {step_name}")
            print("Please check the error messages above and try again.")
            return 1
    
    print("\n🎉 Development environment setup completed successfully!")
    print("\n📚 Next steps:")
    print("1. Edit .env file with your configuration")
    print("2. Run: poetry run uvicorn app.main:app --reload")
    print("3. Open: http://localhost:8000/docs")
    print("4. Start developing with: poetry run python scripts/run_tests.py --watch")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
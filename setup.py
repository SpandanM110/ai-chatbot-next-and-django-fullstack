#!/usr/bin/env python3
"""
AI Chatbot Setup Script
Automated setup for the AI Chatbot application
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return success status"""
    try:
        result = subprocess.run(command, cwd=cwd, shell=shell, check=True, capture_output=True, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 11):
        print("❌ Python 3.11 or higher is required")
        print(f"Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def check_node_version():
    """Check if Node.js is installed and compatible"""
    success, output = run_command("node --version")
    if not success:
        print("❌ Node.js is not installed")
        print("Please install Node.js 18 or higher from https://nodejs.org/")
        return False
    
    version = output.strip().lstrip('v')
    major_version = int(version.split('.')[0])
    if major_version < 18:
        print("❌ Node.js 18 or higher is required")
        print(f"Current version: {version}")
        return False
    
    print(f"✅ Node.js {version} detected")
    return True

def check_docker():
    """Check if Docker is installed"""
    success, output = run_command("docker --version")
    if not success:
        print("❌ Docker is not installed")
        print("Please install Docker from https://www.docker.com/get-started")
        return False
    
    print(f"✅ Docker detected: {output.strip()}")
    return True

def setup_backend():
    """Setup Django backend"""
    print("\n🔧 Setting up Django backend...")
    
    backend_path = Path("backend")
    if not backend_path.exists():
        print("❌ Backend directory not found")
        return False
    
    # Create virtual environment
    venv_path = backend_path / "venv"
    if not venv_path.exists():
        print("Creating virtual environment...")
        success, output = run_command(f"python -m venv venv", cwd=backend_path)
        if not success:
            print(f"❌ Failed to create virtual environment: {output}")
            return False
    
    # Determine activation script based on OS
    if platform.system() == "Windows":
        activate_script = venv_path / "Scripts" / "activate.bat"
        pip_path = venv_path / "Scripts" / "pip"
    else:
        activate_script = venv_path / "bin" / "activate"
        pip_path = venv_path / "bin" / "pip"
    
    # Install requirements
    print("Installing Python dependencies...")
    success, output = run_command(f"{pip_path} install -r requirements.txt", cwd=backend_path)
    if not success:
        print(f"❌ Failed to install requirements: {output}")
        return False
    
    # Run migrations
    print("Running database migrations...")
    python_path = venv_path / "Scripts" / "python" if platform.system() == "Windows" else venv_path / "bin" / "python"
    success, output = run_command(f"{python_path} manage.py migrate", cwd=backend_path)
    if not success:
        print(f"❌ Failed to run migrations: {output}")
        return False
    
    print("✅ Backend setup complete")
    return True

def setup_frontend():
    """Setup Next.js frontend"""
    print("\n🔧 Setting up Next.js frontend...")
    
    frontend_path = Path("frontend")
    if not frontend_path.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install dependencies
    print("Installing Node.js dependencies...")
    success, output = run_command("npm install", cwd=frontend_path)
    if not success:
        print(f"❌ Failed to install dependencies: {output}")
        return False
    
    print("✅ Frontend setup complete")
    return True

def create_env_files():
    """Create environment files with default values"""
    print("\n📝 Creating environment files...")
    
    # Backend .env
    backend_env = Path("backend/.env")
    if not backend_env.exists():
        env_content = """# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Groq API (Get from https://console.groq.com/)
GROQ_API_KEY=your-groq-api-key-here

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
"""
        backend_env.write_text(env_content)
        print("✅ Created backend/.env")
    
    # Frontend .env.local
    frontend_env = Path("frontend/.env.local")
    if not frontend_env.exists():
        env_content = """# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# UploadThing (Optional - for file sharing)
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id
"""
        frontend_env.write_text(env_content)
        print("✅ Created frontend/.env.local")

def main():
    """Main setup function"""
    print("🚀 AI Chatbot Setup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python_version():
        return False
    
    if not check_node_version():
        return False
    
    # Check Docker (optional)
    docker_available = check_docker()
    if docker_available:
        print("✅ Docker is available for containerized deployment")
    else:
        print("⚠️  Docker not available - manual setup will be used")
    
    # Setup backend
    if not setup_backend():
        print("❌ Backend setup failed")
        return False
    
    # Setup frontend
    if not setup_frontend():
        print("❌ Frontend setup failed")
        return False
    
    # Create environment files
    create_env_files()
    
    print("\n🎉 Setup complete!")
    print("=" * 50)
    print("Next steps:")
    print("1. Update your API keys in the .env files")
    print("2. Start the application:")
    print("   - Backend: cd backend && venv\\Scripts\\activate && python manage.py runserver")
    print("   - Frontend: cd frontend && npm run dev")
    print("3. Or use Docker: docker-build.bat (Windows) or ./docker-build.sh (Linux/Mac)")
    print("\nAccess your application at:")
    print("- Frontend: http://localhost:3000")
    print("- Backend: http://localhost:8000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
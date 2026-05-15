# api/index.py
import sys
import os

# Add the root directory to sys.path so we can import from 'backend'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the FastAPI app from backend/app/main.py
from backend.app.main import app

# This is the entry point for Vercel
# Vercel will automatically detect 'app' and serve it

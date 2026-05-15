# Vercel Python entry — FastAPI ASGI app
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root, "backend")

# main.py imports `app.*` modules; backend/ must be on sys.path
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app  # noqa: E402

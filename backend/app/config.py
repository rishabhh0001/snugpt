from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    nvidia_api_key: str = ""
    chroma_persist_dir: str = "./chroma_db"
    
    class Config:
        env_file = "../.env"
        extra = "ignore"
        # We will attempt to read from root directory first in case we run it from there.
        # But wait, pydantic uses relative to cwd. Let's make it robust:
        # Actually it's easier to just rely on os.environ being loaded beforehand.
        
settings = Settings()

# Try loading .env from parent directory if API key isn't set yet
if not settings.nvidia_api_key:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))
    settings = Settings()

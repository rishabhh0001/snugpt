from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load .env if it exists (local dev), otherwise rely on system env vars (Vercel)
load_dotenv()

class Settings(BaseSettings):
    nvidia_api_key: Optional[str] = None
    chroma_persist_dir: str = "./chroma_db"
    database_url: Optional[str] = None
    
    # Chroma Cloud settings
    use_chroma_cloud: bool = True
    chroma_api_key: Optional[str] = None
    chroma_tenant: str = "default"
    chroma_database: str = "default"

    class Config:
        env_file = ".env"
        extra = "ignore"
        # Allow case-insensitive environment variables
        case_sensitive = False
        
settings = Settings()

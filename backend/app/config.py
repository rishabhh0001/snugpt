from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

# Load .env if it exists (local dev), otherwise rely on system env vars (Vercel)
load_dotenv()

class Settings(BaseSettings):
    nvidia_api_key: str = ""
    chroma_persist_dir: str = "./chroma_db"
    database_url: str = "postgresql+asyncpg://user:pass@localhost/snugpt"
    
    # Chroma Cloud settings
    use_chroma_cloud: bool = False
    chroma_api_key: Optional[str] = None
    chroma_tenant: str = "default"
    chroma_database: str = "default"

    class Config:
        env_file = ".env"
        extra = "ignore"
        
settings = Settings()

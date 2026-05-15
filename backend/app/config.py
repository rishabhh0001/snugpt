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
    use_chroma_cloud: bool = True
    chroma_api_key: str = "ck-6qVmDL9tQaeYUfScTc1wk64NPpLqjMJ4T1iSaBp5Dx8Q"
    chroma_tenant: str = "bf7a99b2-7384-49c8-8710-25dc1baccd97"
    chroma_database: str = "SNUGPT"

    class Config:
        env_file = ".env"
        extra = "ignore"
        
settings = Settings()

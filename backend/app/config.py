from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        case_sensitive=False,
    )

    nvidia_api_key: str | None = None
    database_url: str | None = None
    chroma_persist_dir: str = "./chroma_db"

    use_chroma_cloud: bool = True
    chroma_api_key: str | None = None
    chroma_tenant: str = "bf7a99b2-7384-49c8-8710-25dc1baccd97"
    chroma_database: str = "SNUGPT"
    chroma_host: str = "localhost"
    chroma_port: int = 8000


settings = Settings()

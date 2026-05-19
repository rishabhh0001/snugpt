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

    google_apps_script_url: str | None = None

    # Auth & OAuth Settings
    github_client_id: str | None = None
    github_client_secret: str | None = None
    google_client_id: str | None = None
    google_client_secret: str | None = None

    # Optional Backend JWT FALLBACK settings
    jwt_secret_key: str | None = None
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # SMTP Mail server settings
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from_email: str | None = None
    smtp_from_name: str | None = None



settings = Settings()


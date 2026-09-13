from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    supabase_url: str
    supabase_key: str
    supabase_storage_bucket: str = "documents"
    redis_url: str
    groq_api_key: str
    groq_model: str = "llama3-8b-8192"
    log_level: str = "INFO"

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

settings = Settings()

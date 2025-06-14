"""
Configuration settings for the API.
Handles environment variables and application settings.
"""
from functools import lru_cache
from typing import Literal
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration settings loaded from environment variables."""
    api_version: str
    SKYRAMP_ENVIRONMENT: Literal["local", "dev", "stg", "prd"] = "local"
    redis_host: str
    redis_port: int
    redis_user: str
    redis_pass: str
    redis_client_crt: str
    redis_client_key: str
    redis_ca_pem: str
    key_ttl_seconds: int
    class Config:
        """Pydantic configuration for environment variables."""
        env_file = ".env"

@lru_cache
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()

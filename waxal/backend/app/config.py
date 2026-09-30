from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Anthropic
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-5"

    # Database
    database_url: str = "sqlite:///./waxal.db"

    # Uploads
    upload_dir: str = "./uploads"
    max_image_size_mb: int = 10

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 30  # 30 days

    # Plans / quotas (generations per calendar month)
    free_monthly_generations: int = 10
    pro_monthly_generations: int = 500
    pro_price_fcfa: int = 2500  # monthly price shown in the UI, in CFA francs

    # When true, POST /billing/upgrade instantly activates Pro without payment.
    # Only for local testing. Replace with a real PayDunya/CinetPay flow in prod.
    dev_fake_billing: bool = False

    cors_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


@lru_cache
def get_settings() -> Settings:
    return Settings()

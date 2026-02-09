from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str

    HF_API_KEY: str
    HF_MODEL: str

    class Config:
        env_file = ".env"

settings = Settings()

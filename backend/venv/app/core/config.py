from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # These must match the names in your .env file
    goplus_api_key: str
    goplus_api_secret: str
    hardhat_url: str = "http://127.0.0.1:8545"
    
    # This tells Pydantic to look for the .env file in your backend root
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
from fastapi import FastAPI, Depends
from app.core.security import verify_api_key
from app.services.security_engine import get_address_security_score
from dotenv import load_dotenv
from app.core.config import get_settings
import os

load_dotenv()  # This looks for your .env file and loads it 

app = FastAPI()

@app.get("/check-security/{address}")
async def check_security(address: str, settings = Depends(get_settings)):
    return get_address_security_score(address)
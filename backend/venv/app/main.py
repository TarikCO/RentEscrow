from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.services.security_engine import get_address_security_score
from app.services.blockchain import BlockchainService
from dotenv import load_dotenv
from app.core.config import get_settings

load_dotenv()  # This looks for your .env file and loads it 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

blockchain_service = BlockchainService()


def ensure_blockchain_connected():
    if not blockchain_service.check_connection():
        raise HTTPException(status_code=503, detail="Blockchain node is not connected. Start Hardhat node at http://127.0.0.1:8545.")


def ensure_contract_loaded():
    if not blockchain_service.is_contract_loaded():
        raise HTTPException(status_code=503, detail="Escrow contract is not loaded. Verify rent_escrow_address and ABI artifacts.")

@app.get("/check-security/{address}")
async def check_security(address: str, settings = Depends(get_settings)):
    return get_address_security_score(address)


@app.get("/escrow-balance")
async def get_escrow_balance():
    ensure_blockchain_connected()
    ensure_contract_loaded()
    return {"escrow_balance_eth": float(blockchain_service.check_escrow_balance())}


@app.get("/transaction-status")
async def get_transaction_status():
    ensure_blockchain_connected()
    ensure_contract_loaded()
    return {"transaction_status": blockchain_service.get_transaction_status()}


@app.get("/landlord-rating")
async def get_landlord_rating():
    ensure_blockchain_connected()
    ensure_contract_loaded()
    return {
        "average_rating": blockchain_service.get_landlord_rating(),
        "num_ratings": blockchain_service.get_num_ratings(),
    }


@app.get("/connection-status")
async def get_connection_status():
    connected = blockchain_service.check_connection()
    return {
        "connected": connected,
        "message": "Connected" if connected else "Blockchain node is not connected. Start Hardhat node at http://127.0.0.1:8545.",
    }


@app.get("/escrow-overview")
async def get_escrow_overview():
    ensure_blockchain_connected()
    ensure_contract_loaded()
    return blockchain_service.get_escrow_overview()
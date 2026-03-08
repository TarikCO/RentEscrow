from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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


class CreateEscrowRequest(BaseModel):
    landlord: str
    rent_amount_eth: str
    yield_percent: int = Field(ge=0, le=100)
    duration_days: int = Field(ge=1, le=365)


class ActorRequest(BaseModel):
    actor: str | None = "tenant"


class RateRequest(BaseModel):
    score: int = Field(ge=1, le=5)
    actor: str | None = "tenant"


def latest_escrow_address_or_503():
    records = blockchain_service.get_all_escrows()
    if not records:
        raise HTTPException(status_code=404, detail="No escrow contracts found.")
    return records[-1]["address"]


def ensure_blockchain_connected():
    if not blockchain_service.check_connection():
        raise HTTPException(status_code=503, detail="Blockchain node is not connected. Start Hardhat node at http://127.0.0.1:8545.")


def ensure_contract_loaded():
    latest = blockchain_service.latest_escrow_address()
    if not latest or not blockchain_service.is_contract_loaded(latest):
        raise HTTPException(status_code=503, detail="Escrow contract is not loaded. Verify rent_escrow_address and ABI artifacts.")

@app.get("/check-security/{address}")
async def check_security(address: str, settings = Depends(get_settings)):
    return get_address_security_score(address)


@app.get("/escrow-balance")
async def get_escrow_balance():
    ensure_blockchain_connected()
    address = latest_escrow_address_or_503()
    return {"escrow_balance_eth": float(blockchain_service.check_escrow_balance(address))}


@app.get("/transaction-status")
async def get_transaction_status():
    ensure_blockchain_connected()
    address = latest_escrow_address_or_503()
    return {"transaction_status": blockchain_service.get_transaction_status(address)}


@app.get("/landlord-rating")
async def get_landlord_rating():
    ensure_blockchain_connected()
    address = latest_escrow_address_or_503()
    return {
        "average_rating": blockchain_service.get_landlord_rating(address),
        "num_ratings": blockchain_service.get_num_ratings(address),
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
    address = latest_escrow_address_or_503()
    return blockchain_service.get_escrow_overview(address)


@app.get("/escrows")
async def list_escrows():
    ensure_blockchain_connected()
    return {"escrows": blockchain_service.get_all_escrows()}


@app.get("/escrows/{escrow_address}")
async def get_escrow_by_address(escrow_address: str):
    ensure_blockchain_connected()
    if not blockchain_service.is_contract_loaded(escrow_address):
        raise HTTPException(status_code=404, detail="Escrow address not found.")

    overview = blockchain_service.get_escrow_overview(escrow_address)
    return {
        **overview,
        "transaction_status": blockchain_service.get_transaction_status(escrow_address),
        "average_rating": blockchain_service.get_landlord_rating(escrow_address),
        "num_ratings": blockchain_service.get_num_ratings(escrow_address),
        "escrow_balance_eth": float(blockchain_service.check_escrow_balance(escrow_address)),
    }


@app.delete("/escrows/{escrow_address}")
async def remove_escrow_by_address(escrow_address: str):
    ensure_blockchain_connected()
    try:
        removed = blockchain_service.remove_escrow_address(escrow_address)
        if not removed:
            raise HTTPException(status_code=404, detail="Escrow address not found in registry.")
        return {"removed": True, "address": escrow_address}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrows/{escrow_address}/remove")
async def remove_escrow_by_address_post(escrow_address: str):
    return await remove_escrow_by_address(escrow_address)


@app.delete("/escrows")
async def clear_escrows_registry():
    ensure_blockchain_connected()
    blockchain_service.clear_escrow_registry()
    return {"cleared": True}


@app.post("/escrows/clear")
async def clear_escrows_registry_post():
    return await clear_escrows_registry()


@app.post("/escrow/create")
async def create_escrow(payload: CreateEscrowRequest):
    ensure_blockchain_connected()
    try:
        return blockchain_service.deploy_escrow(
            landlord=payload.landlord,
            duration_days=payload.duration_days,
            yield_percent=payload.yield_percent,
            rent_amount_eth=payload.rent_amount_eth,
        )
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrow/confirm")
async def confirm_escrow(payload: ActorRequest):
    ensure_blockchain_connected()
    address = latest_escrow_address_or_503()
    try:
        return blockchain_service.confirm_lease(address, payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrow/release")
async def release_escrow(payload: ActorRequest):
    ensure_blockchain_connected()
    address = latest_escrow_address_or_503()
    try:
        return blockchain_service.release_funds(address, payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrow/refund")
async def refund_escrow(payload: ActorRequest):
    ensure_blockchain_connected()
    address = latest_escrow_address_or_503()
    try:
        return blockchain_service.refund(address, payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrow/rate")
async def rate_escrow(payload: RateRequest):
    ensure_blockchain_connected()
    address = latest_escrow_address_or_503()
    try:
        return blockchain_service.rate_landlord(escrow_address=address, score=payload.score, actor=payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrows/{escrow_address}/confirm")
async def confirm_escrow_by_address(escrow_address: str, payload: ActorRequest):
    ensure_blockchain_connected()
    if not blockchain_service.is_contract_loaded(escrow_address):
        raise HTTPException(status_code=404, detail="Escrow address not found.")
    try:
        return blockchain_service.confirm_lease(escrow_address, payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrows/{escrow_address}/release")
async def release_escrow_by_address(escrow_address: str, payload: ActorRequest):
    ensure_blockchain_connected()
    if not blockchain_service.is_contract_loaded(escrow_address):
        raise HTTPException(status_code=404, detail="Escrow address not found.")
    try:
        return blockchain_service.release_funds(escrow_address, payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrows/{escrow_address}/refund")
async def refund_escrow_by_address(escrow_address: str, payload: ActorRequest):
    ensure_blockchain_connected()
    if not blockchain_service.is_contract_loaded(escrow_address):
        raise HTTPException(status_code=404, detail="Escrow address not found.")
    try:
        return blockchain_service.refund(escrow_address, payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@app.post("/escrows/{escrow_address}/rate")
async def rate_escrow_by_address(escrow_address: str, payload: RateRequest):
    ensure_blockchain_connected()
    if not blockchain_service.is_contract_loaded(escrow_address):
        raise HTTPException(status_code=404, detail="Escrow address not found.")
    try:
        return blockchain_service.rate_landlord(escrow_address=escrow_address, score=payload.score, actor=payload.actor)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))
import time
from backend.app.services.blockchain import BlockchainService
from backend.app.services.security_engine import get_address_security_score

def run_demo_scenario():
    print("--- 🛡️ STARTING SECURITY SHIELD SCENARIO ---")
    
    # 1. Initialize Blockchain Service
    # Ensure your .env has the correct RENT_ESCROW_ADDRESS
    blockchain = BlockchainService()
    if not blockchain.contract:
        print("❌ Error: Could not connect to RentEscrow. Check ABI path!")
        return

    # 2. Get Landlord Address from Contract
    # This verifies your Python-to-Solidity connection
    landlord_addr = blockchain.contract.functions.landlord().call()
    print(f"📍 Step 1: Found Landlord Address in Contract: {landlord_addr}")

    # 3. Run GoPlus Security Check
    # Verifies your API Key and Network Settings
    print("🔍 Step 2: Running GoPlus Security Scan...")
    security_results = get_address_security_score(landlord_addr)
    
    if security_results.get("high_risk"):
        print(f"⚠️ ALERT: Landlord is HIGH RISK! Trust Score: {security_results['trust_score']}")
    else:
        print(f"✅ Landlord is SAFE. Trust Score: {security_results['trust_score']}")

    # 4. Check Yield and Rating
    # Verifies your scaling logic (multiplying/dividing by 100)
    yield_val = blockchain.contract.functions.yieldPercent().call()
    avg_rating = blockchain.get_landlord_rating() # Uses your /100.0 logic
    
    print(f"📈 Step 3: Contract Yield set to {yield_val}%")
    print(f"⭐ Step 4: Current Landlord Rating: {avg_rating}/5.0")

    print("--- ✅ SCENARIO COMPLETE: ALL SYSTEMS FUNCTIONAL ---")

if __name__ == "__main__":
    run_demo_scenario()
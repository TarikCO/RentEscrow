import requests
from app.core.config import get_settings

settings = get_settings()

def get_address_security_score(address: str):
    # API endpoint for the Malicious Address check
    url = f"https://api.gopluslabs.io/api/v1/address_security/{address}?chain_id={settings.chain_id}"
    try:
        response = requests.get(url, timeout=12)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        return {
            "address": address,
            "high_risk": False,
            "trust_score": 0,
            "risk_details": {
                "phishing": False,
                "blacklisted": False,
                "honeypot_related": False,
                "sanctioned": False,
                "mixer": False,
                "poisoned": False,
            },
            "error": f"Security provider request failed: {exc}",
            "raw_data": {},
        }
    result = data.get("result", {})

    normalized = address.lower()
    known_placeholder_addresses = {
        "0x0000000000000000000000000000000000000000",
        "0x000000000000000000000000000000000000dead",
        "0x000000000000000000000000000000000000dEaD".lower(),
    }

    # GoPlus may return a fully-zero profile for addresses with little/no intelligence.
    has_low_confidence_data = (not result.get("data_source")) and result.get("contract_address") in {"-1", None, ""}
    is_placeholder_address = normalized in known_placeholder_addresses

    # Advanced Security Flags
    risk_factors = {
        "phishing": result.get("phishing_activities") == "1",
        "blacklisted": result.get("blacklisted") == "1",
        "honeypot_related": result.get("honeypot_related_address") == "1",
        "sanctioned": result.get("sanctioned") == "1", # High priority for FinTech
        "mixer": result.get("mixer") == "1",           # Often used to hide stolen funds
        "poisoned": result.get("address_poisoned") == "1", # Catch Dust/Shadow attacks
        "unverified": has_low_confidence_data or is_placeholder_address,
    }

    # Determine a risk level for the React frontend
    # If any flag is 'True', we mark it as high risk
    is_malicious = any(risk_factors.values())
    
    # Calculate a simple "Trust Score" (e.g., 0-100)
    # Start at 100 and subtract weighted penalties for each risk signal.
    score = 100
    score -= 25 if risk_factors["phishing"] else 0
    score -= 25 if risk_factors["blacklisted"] else 0
    score -= 20 if risk_factors["honeypot_related"] else 0
    score -= 25 if risk_factors["sanctioned"] else 0
    score -= 20 if risk_factors["mixer"] else 0
    score -= 15 if risk_factors["poisoned"] else 0
    score -= 40 if risk_factors["unverified"] else 0
    score = max(0, score) # Ensure it doesn't go below 0

    return {
        "address": address,
        "high_risk": is_malicious,
        "trust_score": score,
        "risk_details": risk_factors, # Send specific flags to the frontend
        "raw_data": result
    }
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

    # Advanced Security Flags
    risk_factors = {
        "phishing": result.get("phishing_activities") == "1",
        "blacklisted": result.get("blacklisted") == "1",
        "honeypot_related": result.get("honeypot_related_address") == "1",
        "sanctioned": result.get("sanctioned") == "1", 
        "mixer": result.get("mixer") == "1",         
        "poisoned": result.get("address_poisoned") == "1" 
    }

    # Determine a risk level for the React frontend
    # If any flag is 'True', we mark it as high risk
    is_malicious = any(risk_factors.values())
    
    # Calculate a simple "Trust Score" (e.g., 0-100)
    # Start at 100 and subtract 25 for every risk factor found
    score = 100 - (sum(risk_factors.values()) * 25)
    score = max(0, score) # Ensure it doesn't go below 0

    return {
        "address": address,
        "high_risk": is_malicious,
        "trust_score": score,
        "risk_details": risk_factors, 
        "raw_data": result
    }
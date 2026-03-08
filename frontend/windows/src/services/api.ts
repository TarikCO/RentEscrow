const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export interface SecurityScoreResponse {
  address: string;
  high_risk: boolean;
  trust_score: number;
  risk_details: Record<string, boolean>;
}

export interface EscrowBalanceResponse {
  escrow_balance_eth: number;
}

export interface TransactionStatusResponse {
  transaction_status: string;
}

export interface LandlordRatingResponse {
  average_rating: number;
  num_ratings: number;
}

export interface ConnectionStatusResponse {
  connected: boolean;
}

export interface EscrowOverviewResponse {
  tenant: string | null;
  landlord: string | null;
  deadline: number | null;
  rent_amount_eth: number | null;
  yield_percent: number | null;
  tenant_confirmed: boolean | null;
  landlord_confirmed: boolean | null;
}

interface TxResponse {
  transaction_hash: string;
}

interface CreateEscrowResponse extends TxResponse {
  contract_address: string;
}

const request = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    let details = "";
    try {
      details = await response.text();
    } catch {
      details = "";
    }
    throw new Error(`API request failed (${response.status}): ${details || response.statusText}`);
  }

  return response.json() as Promise<T>;
};

const postRequest = async <T>(path: string, payload: unknown): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let details = "";
    try {
      details = await response.text();
    } catch {
      details = "";
    }
    throw new Error(`API request failed (${response.status}): ${details || response.statusText}`);
  }

  return response.json() as Promise<T>;
};

export const getSecurityScore = async (address: string) => {
  const normalized = address.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(normalized)) {
    throw new Error("Please enter a valid EVM wallet address.");
  }

  return request<SecurityScoreResponse>(`/check-security/${normalized}`);
};

export const getEscrowBalance = async () => request<EscrowBalanceResponse>("/escrow-balance");

export const getTransactionStatus = async () => request<TransactionStatusResponse>("/transaction-status");

export const getLandlordRating = async () => request<LandlordRatingResponse>("/landlord-rating");

export const getConnectionStatus = async () => request<ConnectionStatusResponse>("/connection-status");

export const getEscrowOverview = async () => request<EscrowOverviewResponse>("/escrow-overview");

export const createEscrowOnChain = async (payload: {
  landlord: string;
  rent_amount_eth: string;
  yield_percent: number;
  duration_days: number;
}) => postRequest<CreateEscrowResponse>("/escrow/create", payload);

export const confirmEscrowOnChain = async (actor: "tenant" | "landlord") =>
  postRequest<TxResponse>("/escrow/confirm", { actor });

export const releaseEscrowOnChain = async (actor: "tenant" | "landlord") =>
  postRequest<TxResponse>("/escrow/release", { actor });

export const refundEscrowOnChain = async (actor: "tenant" | "landlord") =>
  postRequest<TxResponse>("/escrow/refund", { actor });

export const rateLandlordOnChain = async (score: number, actor: "tenant" | "landlord") =>
  postRequest<TxResponse>("/escrow/rate", { score, actor });

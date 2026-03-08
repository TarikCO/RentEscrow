import { useCallback, useEffect, useState } from "react";

import {
  getConnectionStatus,
  getEscrowBalance,
  getEscrowOverview,
  getLandlordRating,
  getTransactionStatus,
} from "@/services/api";

interface BackendDashboardState {
  escrowBalanceEth: number;
  transactionStatus: string;
  landlordAverageRating: number;
  landlordNumRatings: number;
  blockchainConnected: boolean;
  tenantAddress: string | null;
  landlordAddress: string | null;
  refundDeadline: number | null;
}

const initialState: BackendDashboardState = {
  escrowBalanceEth: 0,
  transactionStatus: "Unavailable",
  landlordAverageRating: 0,
  landlordNumRatings: 0,
  blockchainConnected: false,
  tenantAddress: null,
  landlordAddress: null,
  refundDeadline: null,
};

export const useBackendDashboard = () => {
  const [data, setData] = useState<BackendDashboardState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [balance, status, rating, connection, overview] = await Promise.all([
        getEscrowBalance(),
        getTransactionStatus(),
        getLandlordRating(),
        getConnectionStatus(),
        getEscrowOverview(),
      ]);

      setData({
        escrowBalanceEth: Number(balance.escrow_balance_eth ?? 0),
        transactionStatus: status.transaction_status ?? "Unavailable",
        landlordAverageRating: Number(rating.average_rating ?? 0),
        landlordNumRatings: Number(rating.num_ratings ?? 0),
        blockchainConnected: Boolean(connection.connected),
        tenantAddress: overview.tenant,
        landlordAddress: overview.landlord,
        refundDeadline: overview.deadline ? Number(overview.deadline) * 1000 : null,
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load blockchain dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

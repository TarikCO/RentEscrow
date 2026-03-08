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
      const [balanceResult, statusResult, ratingResult, connectionResult, overviewResult] = await Promise.allSettled([
        getEscrowBalance(),
        getTransactionStatus(),
        getLandlordRating(),
        getConnectionStatus(),
        getEscrowOverview(),
      ]);

      const connectionConnected =
        connectionResult.status === "fulfilled" ? Boolean(connectionResult.value.connected) : false;

      const balance = balanceResult.status === "fulfilled" ? balanceResult.value : null;
      const status = statusResult.status === "fulfilled" ? statusResult.value : null;
      const rating = ratingResult.status === "fulfilled" ? ratingResult.value : null;
      const overview = overviewResult.status === "fulfilled" ? overviewResult.value : null;

      setData({
        escrowBalanceEth: Number(balance?.escrow_balance_eth ?? 0),
        transactionStatus: status?.transaction_status ?? "Unavailable",
        landlordAverageRating: Number(rating?.average_rating ?? 0),
        landlordNumRatings: Number(rating?.num_ratings ?? 0),
        blockchainConnected: connectionConnected,
        tenantAddress: overview?.tenant ?? null,
        landlordAddress: overview?.landlord ?? null,
        refundDeadline: overview?.deadline ? Number(overview.deadline) * 1000 : null,
      });

      const hasAnyFailures =
        balanceResult.status === "rejected" ||
        statusResult.status === "rejected" ||
        ratingResult.status === "rejected" ||
        connectionResult.status === "rejected" ||
        overviewResult.status === "rejected";

      const failedMessages = [balanceResult, statusResult, ratingResult, connectionResult, overviewResult]
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => String(result.reason));

      const has404 = failedMessages.some((message) => message.includes("(404)"));
      const connectionFailed = connectionResult.status === "rejected" || !connectionConnected;

      if (connectionFailed) {
        setError("Blockchain node appears disconnected. Start Hardhat node and retry.");
      } else if (hasAnyFailures && has404) {
        setError("No active escrow yet. Create one to populate the live snapshot.");
      } else if (hasAnyFailures) {
        setError("Some dashboard values are unavailable right now.");
      } else {
        setError(null);
      }
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

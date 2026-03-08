import { useCallback, useEffect, useMemo, useState } from "react";

import {
  confirmEscrowOnChain,
  createEscrowOnChain,
  getEscrowOverview,
  getLandlordRating,
  getTransactionStatus,
  rateLandlordOnChain,
  refundEscrowOnChain,
  releaseEscrowOnChain,
} from "@/services/api";
import { CreateEscrowInput, EscrowContract } from "@/types/escrow";

const statusFromBackend = (status: string): EscrowContract["status"] => {
  if (status.includes("Confirmed")) return "confirmed";
  if (status.includes("Released")) return "released";
  if (status.includes("Refund")) return "refunded";
  return "pending";
};

export const useEscrows = (walletAddress?: string) => {
  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [overview, txStatus, rating] = await Promise.all([
        getEscrowOverview(),
        getTransactionStatus(),
        getLandlordRating(),
      ]);

      if (!overview.tenant || !overview.landlord) {
        setEscrows([]);
      } else {
        const now = Date.now();
        const escrow: EscrowContract = {
          address: "live-contract",
          tenant: overview.tenant,
          landlord: overview.landlord,
          rentAmountEth: (overview.rent_amount_eth ?? 0).toString(),
          yieldPercent: overview.yield_percent ?? 0,
          deadline: overview.deadline ? Number(overview.deadline) * 1000 : now,
          status: statusFromBackend(txStatus.transaction_status),
          createdAt: now,
          lastUpdatedAt: now,
          transactionHistory: [],
          ratingHistory:
            rating.num_ratings > 0
              ? [
                  {
                    id: crypto.randomUUID(),
                    reviewer: overview.tenant,
                    score: rating.average_rating,
                    review: "On-chain average rating",
                    timestamp: now,
                  },
                ]
              : [],
        };

        // Show the active on-chain escrow regardless of currently connected UI wallet.
        setEscrows([escrow]);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load escrows");
      setEscrows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const runAction = useCallback(
    async (action: () => Promise<unknown>) => {
      try {
        await action();
        setError(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Escrow action failed";
        setError(message);
        throw err;
      }
    },
    [],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEscrow = useCallback(
    async (payload: CreateEscrowInput, _tenant: string) => {
      await runAction(() =>
        createEscrowOnChain({
          landlord: payload.landlord,
          rent_amount_eth: payload.rentAmountEth,
          yield_percent: payload.yieldPercent,
          duration_days: payload.durationDays,
        }),
      );
      await refresh();
    },
    [refresh, runAction],
  );

  const confirmLease = useCallback(
    async (_address: string) => {
      const actor = escrows[0] && walletAddress?.toLowerCase() === escrows[0].landlord.toLowerCase() ? "landlord" : "tenant";
      await runAction(() => confirmEscrowOnChain(actor));
      await refresh();
    },
    [escrows, refresh, runAction, walletAddress],
  );

  const releaseFunds = useCallback(
    async (_address: string) => {
      const actor = escrows[0] && walletAddress?.toLowerCase() === escrows[0].landlord.toLowerCase() ? "landlord" : "tenant";
      await runAction(() => releaseEscrowOnChain(actor));
      await refresh();
    },
    [escrows, refresh, runAction, walletAddress],
  );

  const requestRefund = useCallback(
    async (_address: string) => {
      await runAction(() => refundEscrowOnChain("tenant"));
      await refresh();
    },
    [refresh, runAction],
  );

  const rateLandlord = useCallback(
    async (_address: string, _reviewer: string, score: number, _review: string) => {
      await runAction(() => rateLandlordOnChain(score, "tenant"));
      await refresh();
    },
    [refresh, runAction],
  );

  const escrowStats = useMemo(() => {
    const totalValueEth = escrows.reduce((sum, escrow) => sum + Number(escrow.rentAmountEth), 0).toFixed(3);
    const pending = escrows.filter((escrow) => escrow.status === "pending").length;
    const confirmed = escrows.filter((escrow) => escrow.status === "confirmed").length;

    return {
      totalEscrows: escrows.length,
      totalValueEth,
      pending,
      confirmed,
    };
  }, [escrows]);

  return {
    escrows,
    loading,
    error,
    escrowStats,
    refresh,
    createEscrow,
    confirmLease,
    releaseFunds,
    requestRefund,
    rateLandlord,
  };
};

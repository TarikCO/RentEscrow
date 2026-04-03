import { useCallback, useEffect, useMemo, useState } from "react";

import {
  clearEscrowsRegistry,
  confirmEscrowOnChain,
  createEscrowOnChain,
  getEscrows,
  rateLandlordOnChain,
  removeEscrowFromRegistry,
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
      const rows = await getEscrows();
      const now = Date.now();
      const mapped = rows.map<EscrowContract>((row) => ({
        address: row.address,
        tenant: row.tenant ?? "0x0000000000000000000000000000000000000000",
        landlord: row.landlord ?? "0x0000000000000000000000000000000000000000",
        rentAmountEth: (row.rent_amount_eth ?? row.escrow_balance_eth ?? 0).toString(),
        yieldPercent: row.yield_percent ?? 0,
        deadline: row.deadline ? Number(row.deadline) * 1000 : now,
        status: statusFromBackend(row.transaction_status),
        createdAt: now,
        lastUpdatedAt: now,
        transactionHistory: [],
        ratingHistory:
          row.num_ratings > 0
            ? [
                {
                  id: crypto.randomUUID(),
                  reviewer: row.tenant ?? "on-chain",
                  score: row.average_rating,
                  review: "On-chain average rating",
                  timestamp: now,
                },
              ]
            : [],
      }));

      setEscrows(mapped);

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
    async (address: string) => {
      const target = escrows.find((item) => item.address === address);
      const actor = target && walletAddress?.toLowerCase() === target.landlord.toLowerCase() ? "landlord" : "tenant";
      await runAction(() => confirmEscrowOnChain(address, actor));
      await refresh();
    },
    [escrows, refresh, runAction, walletAddress],
  );

  const releaseFunds = useCallback(
    async (address: string) => {
      const target = escrows.find((item) => item.address === address);
      const actor = target && walletAddress?.toLowerCase() === target.landlord.toLowerCase() ? "landlord" : "tenant";
      await runAction(() => releaseEscrowOnChain(address, actor));
      await refresh();
    },
    [escrows, refresh, runAction, walletAddress],
  );

  const requestRefund = useCallback(
    async (address: string) => {
      await runAction(() => refundEscrowOnChain(address, "tenant"));
      await refresh();
    },
    [refresh, runAction],
  );

  const rateLandlord = useCallback(
    async (address: string, _reviewer: string, score: number, _review: string) => {
      await runAction(() => rateLandlordOnChain(address, score, "tenant"));
      await refresh();
    },
    [refresh, runAction],
  );

  const removeEscrow = useCallback(
    async (address: string) => {
      await runAction(() => removeEscrowFromRegistry(address));
      await refresh();
    },
    [refresh, runAction],
  );

  const clearEscrows = useCallback(async () => {
    await runAction(() => clearEscrowsRegistry());
    await refresh();
  }, [refresh, runAction]);

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
    removeEscrow,
    clearEscrows,
  };
};

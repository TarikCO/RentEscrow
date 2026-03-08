import { useCallback, useEffect, useState } from "react";

import { SecurityScoreResponse, getSecurityScore } from "@/services/api";

export const useSecurityScore = (address?: string | null) => {
  const [data, setData] = useState<SecurityScoreResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const normalized = address?.trim();
    if (!normalized) {
      setData(null);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const response = await getSecurityScore(normalized);
      setData(response);
      setError(null);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load wallet security status.");
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) return;
    void refetch();
  }, [address, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

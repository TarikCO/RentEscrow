import { useCallback, useEffect, useState } from "react";

import { LandlordRatingResponse, getLandlordRating } from "@/services/api";

const initial: LandlordRatingResponse = {
  average_rating: 0,
  num_ratings: 0,
};

export const useOnChainRating = () => {
  const [data, setData] = useState<LandlordRatingResponse>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getLandlordRating();
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load landlord rating.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};

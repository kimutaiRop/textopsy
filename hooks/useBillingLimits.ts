'use client';

import { useCallback, useEffect, useState } from "react";

export type BillingLimits = {
  plan: "free" | "pro";
  isPro: boolean;
  planExpiresAt: string | null;
  conversationLimit: number | null;
  conversationsUsed: number;
  submissionsLimit: number | null;
  submissionsUsed: number;
  resetsAt: string | null;
  creditLimit: number | null;
  creditsUsed: number;
  creditResetsAt: string | null;
};

type State = {
  limits: BillingLimits | null;
  loading: boolean;
  error: string | null;
};

export function useBillingLimits(authToken: string | null) {
  const [state, setState] = useState<State>({
    limits: null,
    loading: false,
    error: null,
  });

  const fetchLimits = useCallback(async () => {
    if (!authToken) {
      setState({ limits: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch("/api/billing/limits", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load plan limits.");
      }

      const limits = (await response.json()) as BillingLimits;
      setState({ limits, loading: false, error: null });
    } catch (error) {
      setState({
        limits: null,
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load plan limits.",
      });
    }
  }, [authToken]);

  useEffect(() => {
    if (!authToken) {
      setState({ limits: null, loading: false, error: null });
      return;
    }
    fetchLimits();
  }, [authToken, fetchLimits]);

  return {
    limits: state.limits,
    loading: state.loading,
    error: state.error,
    refresh: fetchLimits,
    reset: () => setState({ limits: null, loading: false, error: null }),
  };
}


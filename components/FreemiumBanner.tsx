'use client';

import Link from "next/link";
import type { BillingLimits } from "@/hooks/useBillingLimits";

type FreemiumBannerProps = {
  limits: BillingLimits | null;
  loading: boolean;
  error?: string | null;
  upgradeLoading?: boolean;
  onUpgrade?: () => void;
  onRefresh?: () => void;
  showDetailsLink?: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return null;
  }
}

export function FreemiumBanner({
  limits,
  loading,
  error,
  upgradeLoading = false,
  onUpgrade,
  onRefresh,
  showDetailsLink = true,
}: FreemiumBannerProps) {
  const planLabel = limits?.isPro ? "Pro" : "Free";
  const renewalDate = formatDate(limits?.planExpiresAt ?? null);
  const creditLimit = limits?.creditLimit ?? null;
  const creditsUsed = limits?.creditsUsed ?? 0;
  const creditsRemaining = creditLimit !== null ? Math.max(creditLimit - creditsUsed, 0) : null;

  return (
    <div className="rounded-xl border border-gray-800 bg-[#0b1324] p-4 shadow-[0_0_24px_rgba(11,19,36,0.6)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">Current Plan</p>
          <p className="text-lg font-semibold text-white">
            {planLabel}
            {planLabel === "Pro" && <span className="ml-2 text-sm text-[#b74bff]">$5/mo</span>}
          </p>
          {limits?.isPro && renewalDate && (
            <p className="text-xs text-gray-500">Renews on {renewalDate}</p>
          )}
          {!limits?.isPro && (
            <p className="text-xs text-gray-500">Free tier · 5 conversations · 3 submissions/day · 10/month</p>
          )}
          {!limits?.isPro && creditLimit !== null && (
            <p className="text-xs text-gray-500">
              {creditsRemaining} of {creditLimit} monthly submissions left
            </p>
          )}
          {limits?.isPro && creditLimit !== null && (
            <p className="text-xs text-gray-500">
              {creditsRemaining} of {creditLimit} monthly credits left
            </p>
          )}
        </div>
        {!limits?.isPro && onUpgrade && (
          <button
            type="button"
            onClick={onUpgrade}
            disabled={upgradeLoading || loading}
            className="rounded-lg border border-[#b74bff] px-4 py-2 text-sm font-semibold text-[#b74bff] transition-colors hover:bg-[#b74bff]/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {upgradeLoading ? "Redirecting..." : "Upgrade for $5/mo"}
          </button>
        )}
      </div>

      {error ? (
        <div className="mt-3 rounded border border-red-900/40 bg-red-900/10 px-3 py-2 text-xs text-red-300">
          <div className="flex items-center justify-between gap-2">
            <span>{error}</span>
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="text-[10px] uppercase tracking-widest text-red-200 underline"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-400">
          {limits?.isPro
            ? "Pro keeps responses fast, includes 200 monthly credits, and bumps removal of free caps."
            : "Need more than the free tier? Upgrade anytime or review usage details from the sidebar."}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {showDetailsLink && (
          <Link
            href="/plan"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-200 transition-colors hover:border-gray-600 hover:text-white"
          >
            View usage details
          </Link>
        )}
        {!limits?.isPro && (
          <p className="text-[11px] uppercase tracking-widest text-gray-600">
            Free plan includes 5 conversations, 3 submissions per day & 10 per month
              </p>
            )}
          </div>

      {loading && (
        <p className="mt-3 text-[10px] uppercase tracking-widest text-gray-500">
          Syncing limits...
        </p>
      )}
    </div>
  );
}


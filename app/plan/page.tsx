'use client';

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ConversationSidebar } from "@/components/ConversationSidebar";
import { AuthModal } from "@/components/AuthModal";
import { FreemiumBanner } from "@/components/FreemiumBanner";
import { IconArrowLeft, IconLogo } from "@/components/Icons";
import { useBillingLimits } from "@/hooks/useBillingLimits";
import type { StoredUser } from "@/types/user";

const FREE_PLAN_CONVERSATIONS = 5;
const FREE_PLAN_SUBMISSIONS = 3;

type UsageMeterProps = {
  label: string;
  used: number;
  limit: number | null;
  accentClass: string;
  helpText?: string | null;
};

function getPercent(used: number, limit: number | null) {
  if (!limit || limit <= 0) return 100;
  if (used <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

function UsageMeter({ label, used, limit, accentClass, helpText }: UsageMeterProps) {
  const width = getPercent(used, limit);
  return (
    <div className="space-y-2 rounded-lg border border-gray-800 bg-[#0b1324] p-4">
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-gray-400">
        <span>{label}</span>
        {limit ? (
          <span className="font-mono text-gray-200">
            {used}/{limit}
          </span>
        ) : (
          <span className="font-mono text-green-300">Unlimited</span>
        )}
      </div>
      <div className="h-2 w-full rounded-full bg-gray-900">
        <div className={`h-full rounded-full ${accentClass}`} style={{ width: `${width}%` }} />
      </div>
      {helpText && <p className="text-[11px] text-gray-500">{helpText}</p>}
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString();
  } catch {
    return null;
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("textopsy_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("textopsy_session_id", sessionId);
  }
  return sessionId;
}

export default function PlanPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("textopsy_sidebar_open");
      return saved === "true";
    }
    return false;
  });
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);
  const { limits, loading: limitsLoading, error: limitsError, refresh: refreshLimits, reset: resetLimits } =
    useBillingLimits(authToken);

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("textopsy_auth_token");
    const userStr = localStorage.getItem("textopsy_user");

    if (token && userStr) {
      setAuthToken(token);
      try {
        setUser(JSON.parse(userStr) as StoredUser);
      } catch {
        setUser(null);
      }
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("textopsy_sidebar_open", sidebarOpen.toString());
    }
  }, [sidebarOpen]);

  const handleSelectConversation = (id: string | null) => {
    setCurrentConversationId(id);
    if (id) {
      router.push(`/conversation/${id}`);
    } else {
      router.push("/");
    }
  };

  const handleAuthSuccess = (token: string, newUser: StoredUser) => {
    setAuthToken(token);
    setUser(newUser);
    setAuthModalOpen(false);
    setUpgradeError(null);
    refreshLimits();
  };

  const handleLogout = () => {
    localStorage.removeItem("textopsy_auth_token");
    localStorage.removeItem("textopsy_user");
    setAuthToken(null);
    setUser(null);
    resetLimits();
    setUpgradeError(null);
  };

  const handleUpgradeClick = useCallback(async () => {
    if (!authToken) {
      setAuthModalOpen(true);
      return;
    }

    setUpgradeError(null);
    setUpgradeLoading(true);

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to start Paystack checkout.");
      }

      if (typeof window !== "undefined" && data.authorizationUrl) {
        window.location.href = data.authorizationUrl as string;
      }
    } catch (error) {
      setUpgradeError(error instanceof Error ? error.message : "Failed to initiate upgrade.");
    } finally {
      setUpgradeLoading(false);
    }
  }, [authToken]);

  const billingError = upgradeError || limitsError || null;
  const resetDate = formatDate(limits?.resetsAt ?? null);
  const isPro = Boolean(limits?.isPro);
  const conversationsUsed = limits?.conversationsUsed ?? 0;
  const submissionsUsed = limits?.submissionsUsed ?? 0;
  const conversationLimit = isPro ? null : (limits?.conversationLimit ?? FREE_PLAN_CONVERSATIONS);
  const submissionsLimit = isPro ? null : (limits?.submissionsLimit ?? FREE_PLAN_SUBMISSIONS);
  const creditsLimit = limits?.creditLimit ?? null;
  const creditsUsed = limits?.creditsUsed ?? 0;
  const creditResetDate = formatDate(limits?.creditResetsAt ?? null);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="relative mb-4 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#b74bff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a] text-slate-100">
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} onAuthSuccess={handleAuthSuccess} />

      <ConversationSidebar
        sessionId={sessionId}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`flex flex-1 flex-col transition-all ${sidebarOpen ? "ml-80" : ""}`}>
        <header className="sticky top-0 z-20 border-b border-gray-800 bg-[#0f172a] px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded border border-gray-800 p-1.5 text-gray-400 transition-colors hover:border-gray-700 hover:text-white"
                aria-label="Toggle sidebar"
              >
                <IconArrowLeft
                  className={`h-4 w-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
                />
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-100 transition-colors hover:text-white"
              >
                <IconLogo className="h-5 w-5 text-[#b74bff]" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">Textopsy</p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
                    Message autopsy
                  </p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 border border-gray-800 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-500 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>System online</span>
              </div>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-gray-400 sm:inline">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded border border-[#b74bff] px-4 py-2 text-sm font-medium text-[#b74bff] transition-colors hover:bg-[#b74bff]/10"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">
            {user ? (
              <>
                <FreemiumBanner
                  limits={limits}
                  loading={limitsLoading}
                  error={billingError}
                  upgradeLoading={upgradeLoading}
                  onUpgrade={handleUpgradeClick}
                  onRefresh={refreshLimits}
                  showDetailsLink={false}
                />

                <section className="rounded-xl border border-gray-800 bg-[#080f20] p-6 shadow-[0_0_24px_rgba(8,15,32,0.7)]">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-500">Usage</p>
                      <h2 className="text-2xl font-semibold text-white">Breakdown</h2>
                    </div>
                    <button
                      type="button"
                      onClick={refreshLimits}
                      disabled={limitsLoading}
                      className="rounded border border-gray-700 px-3 py-1.5 text-xs uppercase tracking-widest text-gray-300 transition-colors hover:border-gray-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Refresh
                    </button>
                  </div>

                  {limits ? (
                    <div className="space-y-4">
                      <UsageMeter
                        label="Stored conversations"
                        used={conversationsUsed}
                        limit={conversationLimit}
                        accentClass="bg-[#b74bff]"
                        helpText={
                          conversationLimit !== null
                            ? `${Math.max(conversationLimit - conversationsUsed, 0)} remaining`
                            : "Unlimited storage on Pro"
                        }
                      />
                      <UsageMeter
                        label="Daily submissions"
                        used={submissionsUsed}
                        limit={submissionsLimit}
                        accentClass="bg-[#38bdf8]"
                        helpText={
                          submissionsLimit !== null
                            ? `${Math.max(submissionsLimit - submissionsUsed, 0)} remaining today`
                            : "Unlimited submissions on Pro"
                        }
                      />
                      {creditsLimit !== null && (
                        <UsageMeter
                          label="Monthly credits (Pro)"
                          used={creditsUsed}
                          limit={creditsLimit}
                          accentClass="bg-[#f472b6]"
                          helpText={`${Math.max(creditsLimit - creditsUsed, 0)} remaining${
                            creditResetDate ? ` · resets ${creditResetDate}` : ""
                          }`}
                        />
                      )}

                      {!isPro && resetDate && (
                        <div className="rounded-lg border border-gray-800 bg-[#0b1324] px-4 py-3 text-xs text-gray-400">
                          Daily quota resets {resetDate}.
                        </div>
                      )}

                      {isPro && (
                        <div className="rounded-lg border border-gray-800 bg-[#0b1324] px-4 py-3 text-xs text-gray-400">
                          <p>
                            Pro access:{" "}
                            {limits.planExpiresAt
                              ? `active until ${formatDate(limits.planExpiresAt)}.`
                              : "$5/mo subscription with auto-renew."}
                          </p>
                          {creditResetDate && <p>Credits reset on {creditResetDate}.</p>}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded border border-gray-800 bg-black/20 p-6 text-center text-sm text-gray-400">
                      Connect your account to view plan data.
                    </div>
                  )}
                </section>

                <section className="rounded-xl border border-gray-800 bg-[#080f20] p-6 shadow-[0_0_24px_rgba(8,15,32,0.7)]">
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-widest text-gray-500">Next steps</p>
                    <h2 className="text-xl font-semibold text-white">Upgrade or manage usage</h2>
                  </div>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="rounded border border-gray-800 bg-[#0b1324] px-4 py-3">
                      <span className="block font-semibold text-white">Need more throughput?</span>
                      Upgrade to Pro for unlimited conversations and daily submissions.
                    </li>
                    <li className="rounded border border-gray-800 bg-[#0b1324] px-4 py-3">
                      <span className="block font-semibold text-white">Stay on top of limits</span>
                      Check back here any time for live counts and reset times.
                    </li>
                    <li className="rounded border border-gray-800 bg-[#0b1324] px-4 py-3">
                      <span className="block font-semibold text-white">Run out today?</span>
                      Reset occurs nightly at midnight UTC for free accounts.
                    </li>
                  </ul>
                </section>
              </>
            ) : (
              <div className="rounded-xl border border-gray-800 bg-[#080f20] p-8 text-center shadow-[0_0_24px_rgba(8,15,32,0.7)]">
                <h2 className="text-2xl font-semibold text-white">Sign in to view your plan</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Track usage, upgrade to Pro, and see reset times once you log in.
                </p>
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="mt-6 rounded border border-[#b74bff] px-6 py-2 text-sm font-semibold text-[#b74bff] transition-colors hover:bg-[#b74bff]/10"
                >
                  Log in or create account
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}



'use client';

import { useEffect, useMemo, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  plan: "free" | "pro";
  isPro: boolean;
  planExpiresAt: string | null;
  creditsUsed: number;
  creditsRemaining: number | null;
  conversations: number;
  createdAt: string | null;
  lastCreditUpdate: string | null;
};

type AdminResponse = {
  usageMonth: string;
  proCreditLimit: number;
  generatedAt: string;
  users: AdminUser[];
};

const STORAGE_KEY = "textopsy_admin_token";

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) {
      setToken(cached);
    }
  }, []);

  const handleFetch = async () => {
    if (!token.trim()) {
      setError("Provide the admin token first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/credits", {
        headers: {
          "x-admin-token": token.trim(),
        },
        cache: "no-store",
      });

      const payload = (await response.json()) as AdminResponse | { error: string };
      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Failed to load admin data.");
      }

      sessionStorage.setItem(STORAGE_KEY, token.trim());
      setData(payload as AdminResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin stats.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (!data) {
      return {
        totalUsers: 0,
        proUsers: 0,
        creditsUsed: 0,
        creditsRemaining: 0,
      };
    }

    const proUsers = data.users.filter((user) => user.isPro);
    const creditsUsed = proUsers.reduce((sum, user) => sum + (user.creditsUsed ?? 0), 0);
    const creditsRemaining = proUsers.reduce(
      (sum, user) => sum + Math.max((user.creditsRemaining ?? 0), 0),
      0
    );

    return {
      totalUsers: data.users.length,
      proUsers: proUsers.length,
      creditsUsed,
      creditsRemaining,
    };
  }, [data]);

  const sortedUsers = useMemo(() => {
    if (!data) return [];
    return [...data.users].sort((a, b) => (b.creditsUsed ?? 0) - (a.creditsUsed ?? 0));
  }, [data]);

  return (
    <div className="min-h-screen bg-[#020617] px-6 py-10 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin</p>
          <h1 className="text-3xl font-semibold text-white">Credit Watch</h1>
          <p className="text-sm text-slate-400">
            Inspect monthly Pro credits. Data refreshes live from the API with a shared admin token.
          </p>
        </header>

        <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6 shadow-[0_0_32px_rgba(5,12,31,0.6)]">
          <div className="flex flex-col gap-3 text-sm text-slate-300 sm:flex-row sm:items-end sm:justify-between">
            <label className="flex flex-1 flex-col gap-2 text-xs uppercase tracking-widest text-slate-500">
              Admin Token
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste secret token"
                className="rounded border border-slate-700 bg-[#030b1a] px-3 py-2 text-sm text-white outline-none transition focus:border-[#b74bff]"
              />
            </label>
            <button
              type="button"
              onClick={handleFetch}
              disabled={loading}
              className="rounded border border-[#b74bff] px-4 py-2 text-sm font-semibold text-[#b74bff] transition hover:bg-[#b74bff]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Syncing..." : "Load usage"}
            </button>
          </div>
          {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
          {data && (
            <div className="mt-4 text-xs text-slate-500">
              <p>Usage month: {data.usageMonth}</p>
              <p>Snapshot: {new Date(data.generatedAt).toLocaleString()}</p>
              <p>Credit limit per Pro user: {data.proCreditLimit}</p>
            </div>
          )}
        </section>

        {data && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total users" value={summary.totalUsers} />
              <StatCard label="Pro subscribers" value={summary.proUsers} />
              <StatCard label="Credits used (month)" value={summary.creditsUsed} />
              <StatCard label="Credits remaining" value={summary.creditsRemaining} />
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-500">Users</p>
                  <h2 className="text-xl font-semibold text-white">Monthly credit usage</h2>
                </div>
                <button
                  type="button"
                  onClick={handleFetch}
                  disabled={loading}
                  className="rounded border border-slate-700 px-3 py-1.5 text-xs uppercase tracking-widest text-slate-200 transition-colors hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Plan</th>
                      <th className="px-3 py-2">Credits</th>
                      <th className="px-3 py-2">Conversations</th>
                      <th className="px-3 py-2">Joined</th>
                      <th className="px-3 py-2">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-900/60">
                        <td className="px-3 py-3">
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{user.email}</span>
                            <span className="text-xs text-slate-500">
                              {user.isPro ? "Pro" : "Free"}
                              {user.planExpiresAt ? ` · exp ${new Date(user.planExpiresAt).toLocaleDateString()}` : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] uppercase tracking-widest ${
                              user.isPro ? "bg-[#b74bff]/10 text-[#b74bff]" : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {user.isPro ? "Pro ($5)" : "Free"}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {user.isPro ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs text-slate-400">
                                <span>{user.creditsUsed} used</span>
                                <span>{user.creditsRemaining ?? 0} left</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-slate-900">
                                <div
                                  className="h-full rounded-full bg-[#f472b6]"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (user.creditsUsed / (data.proCreditLimit || 1)) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">Free tier</span>
                          )}
                        </td>
                        <td className="px-3 py-3">{user.conversations}</td>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {user.lastCreditUpdate ? new Date(user.lastCreditUpdate).toLocaleDateString() : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#050c1f] p-4">
      <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}



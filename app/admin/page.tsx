'use client';

import { useEffect, useState } from "react";
import { IconUsers, IconStar, IconGift, IconMessageSquare, IconSparkles, IconTarget, IconBarChart, IconTrendingUp } from "@/components/Icons";

type StatsData = {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalConversations: number;
  recentUsers: number;
  totalCreditsUsed: number;
  usageMonth: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("textopsy_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to load stats");
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load stats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin</p>
          <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Overview of your platform statistics and key metrics.
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/20 p-4 text-red-400">
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchStats}
              className="mt-2 text-xs underline hover:text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        {loading && !stats ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#b74bff] border-r-transparent"></div>
              <p className="text-sm text-slate-400">Loading stats...</p>
            </div>
          </div>
        ) : stats ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-slate-500">Usage Month: {stats.usageMonth}</p>
              <button
                onClick={fetchStats}
                disabled={loading}
                className="rounded border border-slate-700 px-3 py-1.5 text-xs uppercase tracking-widest text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total Users" value={stats.totalUsers} icon={IconUsers} />
              <StatCard label="Pro Users" value={stats.proUsers} icon={IconStar} />
              <StatCard label="Free Users" value={stats.freeUsers} icon={IconGift} />
              <StatCard label="Total Conversations" value={stats.totalConversations} icon={IconMessageSquare} />
              <StatCard label="New Users (30 days)" value={stats.recentUsers} icon={IconSparkles} />
              <StatCard label="Credits Used (Month)" value={stats.totalCreditsUsed} icon={IconTarget} />
            </section>

            <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="/admin/users"
                  className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 transition-colors hover:border-[#b74bff]/50 hover:bg-slate-800/50"
                >
                  <div className="mb-2">
                    <IconUsers className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="text-sm font-medium text-white">Manage Users</div>
                  <div className="mt-1 text-xs text-slate-400">View and edit users</div>
                </a>
                <a
                  href="/admin/conversations"
                  className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 transition-colors hover:border-[#b74bff]/50 hover:bg-slate-800/50"
                >
                  <div className="mb-2">
                    <IconMessageSquare className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="text-sm font-medium text-white">Conversations</div>
                  <div className="mt-1 text-xs text-slate-400">Browse all conversations</div>
                </a>
                <a
                  href="/admin/analytics"
                  className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 transition-colors hover:border-[#b74bff]/50 hover:bg-slate-800/50"
                >
                  <div className="mb-2">
                    <IconTrendingUp className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="text-sm font-medium text-white">Analytics</div>
                  <div className="mt-1 text-xs text-slate-400">View detailed analytics</div>
                </a>
                <a
                  href="/admin"
                  className="rounded-lg border border-slate-700 bg-slate-800/30 p-4 transition-colors hover:border-[#b74bff]/50 hover:bg-slate-800/50"
                >
                  <div className="mb-2">
                    <IconBarChart className="h-6 w-6 text-slate-400" />
                  </div>
                  <div className="text-sm font-medium text-white">Dashboard</div>
                  <div className="mt-1 text-xs text-slate-400">Overview & stats</div>
                </a>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  icon?: React.ComponentType<{ className?: string }>;
};

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#050c1f] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value.toLocaleString()}</p>
        </div>
        {Icon && <Icon className="h-8 w-8 text-slate-600" />}
      </div>
    </div>
  );
}



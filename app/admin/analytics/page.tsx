'use client';

import { useEffect, useState } from "react";
import { IconTrendingUp, IconUsers, IconTarget, IconDollarSign } from "@/components/Icons";

type AnalyticsData = {
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
  users: {
    total: number;
    activePro: number;
    expiredPro: number;
    free: number;
    growth: Array<{ date: string; count: number }>;
    conversionRate: number;
  };
  finances: {
    totalRevenue: number;
    mrr: number;
    arpu: number;
    transactionCount: number;
    revenueByDate: Array<{ date: string; amount: number }>;
    recentTransactions: Array<{ amount: number; currency: string; date: string | null }>;
  };
  usage: {
    conversations: Array<{ date: string; count: number }>;
    credits: Array<{ month: string; totalCredits: number; userCount: number }>;
  };
};

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async (periodDays: number) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("textopsy_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/admin/analytics?days=${periodDays}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to load analytics");
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const formatCurrency = (amount: number, currency = "NGN") => {
    if (currency === "NGN") {
      return `₦${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const maxValue = (arr: Array<{ count?: number; amount?: number; totalCredits?: number }>, key: string) => {
    if (arr.length === 0) return 1;
    const values = arr.map((item) => (item as any)[key] || 0);
    return Math.max(...values, 1);
  };

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Analytics</h1>
              <p className="text-sm text-slate-400">
                Comprehensive analytics and trends for usage, finance, and growth.
              </p>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90, 365].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`rounded border px-3 py-1.5 text-xs font-semibold transition ${
                    days === d
                      ? "border-[#b74bff] bg-[#b74bff]/10 text-[#b74bff]"
                      : "border-slate-700 text-slate-300 hover:border-slate-600 hover:text-white"
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/20 p-4 text-red-400">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => fetchAnalytics(days)}
              className="mt-2 text-xs underline hover:text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#b74bff] border-r-transparent"></div>
              <p className="text-sm text-slate-400">Loading analytics...</p>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Key Metrics */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Total Revenue"
                value={formatCurrency(data.finances.totalRevenue)}
                icon={IconDollarSign}
              />
              <MetricCard
                label="Monthly Recurring Revenue"
                value={formatCurrency(data.finances.mrr)}
                icon={IconTrendingUp}
              />
              <MetricCard
                label="Active Pro Users"
                value={data.users.activePro.toString()}
                icon={IconUsers}
              />
              <MetricCard
                label="Conversion Rate"
                value={`${data.users.conversionRate.toFixed(1)}%`}
                icon={IconTarget}
              />
            </section>

            {/* User Growth Chart */}
            <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">User Growth Trend</h2>
              <div className="h-64">
                <SimpleBarChart
                  data={data.users.growth}
                  labelKey="date"
                  valueKey="count"
                  labelFormatter={formatDate}
                  maxValue={maxValue(data.users.growth, "count")}
                />
              </div>
            </section>

            {/* Revenue Trend Chart */}
            {data.finances.revenueByDate.length > 0 && (
              <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Revenue Trend</h2>
                <div className="h-64">
                  <SimpleBarChart
                    data={data.finances.revenueByDate}
                    labelKey="date"
                    valueKey="amount"
                    labelFormatter={formatDate}
                    maxValue={maxValue(data.finances.revenueByDate, "amount")}
                    valueFormatter={(v) => formatCurrency(v)}
                  />
                </div>
              </section>
            )}

            {/* Conversations Trend */}
            {data.usage.conversations.length > 0 && (
              <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Conversations Created Trend</h2>
                <div className="h-64">
                  <SimpleBarChart
                    data={data.usage.conversations}
                    labelKey="date"
                    valueKey="count"
                    labelFormatter={formatDate}
                    maxValue={maxValue(data.usage.conversations, "count")}
                  />
                </div>
              </section>
            )}

            {/* Credits Usage by Month */}
            {data.usage.credits.length > 0 && (
              <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
                <h2 className="mb-4 text-lg font-semibold text-white">Monthly Credits Usage</h2>
                <div className="h-64">
                  <SimpleBarChart
                    data={data.usage.credits}
                    labelKey="month"
                    valueKey="totalCredits"
                    labelFormatter={formatMonth}
                    maxValue={maxValue(data.usage.credits, "totalCredits")}
                  />
                </div>
              </section>
            )}

            {/* Financial Summary */}
            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Financial Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Transactions:</span>
                    <span className="font-medium text-white">{data.finances.transactionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Revenue Per User:</span>
                    <span className="font-medium text-white">{formatCurrency(data.finances.arpu * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Revenue:</span>
                    <span className="font-medium text-white">{formatCurrency(data.finances.totalRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Recurring Revenue:</span>
                    <span className="font-medium text-[#b74bff]">{formatCurrency(data.finances.mrr)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
                <h3 className="mb-4 text-sm font-semibold text-white">User Distribution</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Users:</span>
                    <span className="font-medium text-white">{data.users.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Pro:</span>
                    <span className="font-medium text-[#b74bff]">{data.users.activePro}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Free Users:</span>
                    <span className="font-medium text-white">{data.users.free}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Conversion Rate:</span>
                    <span className="font-medium text-[#b74bff]">{data.users.conversionRate.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Transactions */}
            {data.finances.recentTransactions.length > 0 && (
              <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
                <h3 className="mb-4 text-sm font-semibold text-white">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                        <th className="px-3 py-2 text-left">Currency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.finances.recentTransactions.map((tx, idx) => (
                        <tr key={idx} className="border-b border-slate-900/60">
                          <td className="px-3 py-2 text-slate-400">
                            {tx.date ? formatDate(tx.date) : "—"}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-white">
                            {formatCurrency(tx.amount, tx.currency)}
                          </td>
                          <td className="px-3 py-2 text-slate-400">{tx.currency}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
};

function MetricCard({ label, value, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#050c1f] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-semibold text-white">{value}</p>
        </div>
        <Icon className="h-8 w-8 text-slate-600" />
      </div>
    </div>
  );
}

type SimpleBarChartProps<T> = {
  data: T[];
  labelKey: keyof T;
  valueKey: keyof T;
  labelFormatter?: (label: string) => string;
  valueFormatter?: (value: number) => string;
  maxValue: number;
};

function SimpleBarChart<T extends Record<string, any>>({
  data,
  labelKey,
  valueKey,
  labelFormatter = (x) => x,
  valueFormatter = (x) => x.toString(),
  maxValue,
}: SimpleBarChartProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        No data available
      </div>
    );
  }

  return (
    <div className="flex h-full items-end gap-1">
      {data.map((item, idx) => {
        const value = Number(item[valueKey] || 0);
        const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
        const label = String(item[labelKey]);

        return (
          <div key={idx} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-full w-full items-end">
              <div
                className="w-full rounded-t bg-gradient-to-t from-[#b74bff]/80 to-[#b74bff]/40 transition-all hover:from-[#b74bff] hover:to-[#b74bff]/60"
                style={{ height: `${height}%` }}
                title={`${labelFormatter(label)}: ${valueFormatter(value)}`}
              />
            </div>
            <div className="text-[10px] text-slate-500">
              {labelFormatter(label).slice(0, 5)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

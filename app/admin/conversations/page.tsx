'use client';

import { useEffect, useState } from "react";
import { IconShield } from "@/components/Icons";

type Conversation = {
  id: string;
  sessionId: string;
  title: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  userId: string | null;
  userEmail: string | null;
  analysisCount: number;
  avgCringeScore: number | null;
  avgInterestLevel: number | null;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [days, setDays] = useState(30);

  const fetchConversations = async (page = 1, periodDays = 30) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("textopsy_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        days: periodDays.toString(),
      });

      const response = await fetch(`/api/admin/conversations?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to load conversations");
      }

      const data = await response.json();
      setConversations(data.conversations);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load conversations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(pagination.page, days);
  }, [days]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin</p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-white">Conversations</h1>
              <p className="text-sm text-slate-400">
                View aggregated conversation data. Messages and responses are private and not accessible.
              </p>
            </div>
            <div className="flex gap-2">
              {[7, 30, 90, 365].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDays(d);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
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

        {/* Privacy Notice */}
        <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-slate-800/50 p-2">
              <IconShield className="h-5 w-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Privacy Protected</p>
              <p className="mt-1 text-xs text-slate-400">
                Only aggregated analysis data is shown. Individual messages, responses, and conversation content are never accessible to administrators.
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/20 p-4 text-red-400">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => fetchConversations(pagination.page, days)}
              className="mt-2 text-xs underline hover:text-red-300"
            >
              Retry
            </button>
          </div>
        )}

        {/* Conversations Table */}
        <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Conversations</p>
              <h2 className="text-xl font-semibold text-white">
                {pagination.total} Total (last {days} days)
              </h2>
            </div>
            <button
              onClick={() => fetchConversations(pagination.page, days)}
              disabled={loading}
              className="rounded border border-slate-700 px-3 py-1.5 text-xs uppercase tracking-widest text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#b74bff] border-r-transparent"></div>
                <p className="text-sm text-slate-400">Loading conversations...</p>
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p>No conversations found in the selected period.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Conversation ID</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Analyses</th>
                      <th className="px-3 py-2">Avg Cringe</th>
                      <th className="px-3 py-2">Avg Interest</th>
                      <th className="px-3 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((conv) => (
                      <tr key={conv.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                        <td className="px-3 py-3">
                          <div className="font-mono text-xs text-slate-400">{conv.id.slice(0, 8)}...</div>
                        </td>
                        <td className="px-3 py-3">
                          {conv.userEmail ? (
                            <div className="text-white">{conv.userEmail}</div>
                          ) : (
                            <span className="text-xs text-slate-500">Guest</span>
                          )}
                          {conv.userId && (
                            <div className="font-mono text-[10px] text-slate-500">
                              {conv.userId.slice(0, 8)}...
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <div className="max-w-xs truncate text-white">
                            {conv.title || <span className="text-slate-500">Untitled</span>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-white">{conv.analysisCount}</span>
                        </td>
                        <td className="px-3 py-3">
                          {conv.avgCringeScore !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-900">
                                  <div
                                    className="h-full bg-[#f472b6]"
                                    style={{ width: `${(conv.avgCringeScore / 100) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs text-slate-400">{conv.avgCringeScore}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {conv.avgInterestLevel !== null ? (
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-900">
                                  <div
                                    className="h-full bg-[#38bdf8]"
                                    style={{ width: `${(conv.avgInterestLevel / 100) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-xs text-slate-400">{conv.avgInterestLevel}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {formatDate(conv.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fetchConversations(pagination.page - 1, days)}
                      disabled={pagination.page === 1 || loading}
                      className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchConversations(pagination.page + 1, days)}
                      disabled={pagination.page >= pagination.totalPages || loading}
                      className="rounded border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

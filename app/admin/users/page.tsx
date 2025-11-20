'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  emailVerifiedAt: string | null;
  lastCreditUpdate: string | null;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPlan, setEditPlan] = useState<"free" | "pro">("pro");
  const [editDurationDays, setEditDurationDays] = useState("30");
  const [saving, setSaving] = useState(false);

  const fetchUsers = async (page = 1) => {
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
      });
      if (search) params.append("search", search);
      if (planFilter) params.append("plan", planFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to load users");
      }

      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when search or filter changes, otherwise use current page
    const pageToFetch = search || planFilter ? 1 : pagination.page;
    fetchUsers(pageToFetch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, planFilter, pagination.page]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value);
    setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setEditPlan(user.plan);
    setEditDurationDays(user.planExpiresAt ? "30" : "");
    setShowEditModal(true);
  };

  const handleSavePlan = async () => {
    if (!editingUser) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("textopsy_auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`/api/admin/users/${editingUser.id}/plan`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: editPlan,
          durationDays: editPlan === "pro" ? Number.parseInt(editDurationDays, 10) || 30 : 0,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || "Failed to update user plan");
      }

      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Admin</p>
          <h1 className="text-3xl font-semibold text-white">User Management</h1>
          <p className="text-sm text-slate-400">
            View and manage all users. Assign or remove pro membership.
          </p>
        </header>

        {/* Filters */}
        <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-xs uppercase tracking-widest text-slate-500">
                Search by Email
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Enter email..."
                className="w-full rounded border border-slate-700 bg-[#030b1a] px-3 py-2 text-sm text-white outline-none transition focus:border-[#b74bff]"
              />
            </div>
            <div className="sm:w-48">
              <label className="mb-2 block text-xs uppercase tracking-widest text-slate-500">
                Filter by Plan
              </label>
              <select
                value={planFilter}
                onChange={(e) => handlePlanFilterChange(e.target.value)}
                className="w-full rounded border border-slate-700 bg-[#030b1a] px-3 py-2 text-sm text-white outline-none transition focus:border-[#b74bff]"
              >
                <option value="">All Plans</option>
                <option value="pro">Pro</option>
                <option value="free">Free</option>
              </select>
            </div>
            <button
              onClick={() => fetchUsers(pagination.page)}
              disabled={loading}
              className="rounded border border-[#b74bff] px-4 py-2 text-sm font-semibold text-[#b74bff] transition hover:bg-[#b74bff]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-800 bg-red-950/20 p-4 text-red-400">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <section className="rounded-xl border border-slate-800 bg-[#050c1f] p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500">Users</p>
              <h2 className="text-xl font-semibold text-white">
                {pagination.total} Total Users
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#b74bff] border-r-transparent"></div>
                <p className="text-sm text-slate-400">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p>No users found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-300">
                  <thead className="border-b border-slate-800 text-xs uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Email</th>
                      <th className="px-3 py-2">Plan</th>
                      <th className="px-3 py-2">Expires</th>
                      <th className="px-3 py-2">Credits</th>
                      <th className="px-3 py-2">Conversations</th>
                      <th className="px-3 py-2">Joined</th>
                      <th className="px-3 py-2">Verified</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-slate-900/60 hover:bg-slate-900/30">
                        <td className="px-3 py-3">
                          <div className="font-medium text-white">{user.email}</div>
                          <div className="text-xs text-slate-500">{user.id}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-[11px] uppercase tracking-widest ${
                              user.isPro
                                ? "bg-[#b74bff]/10 text-[#b74bff]"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {user.isPro ? "Pro" : "Free"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {user.planExpiresAt
                            ? new Date(user.planExpiresAt).toLocaleDateString()
                            : user.isPro
                            ? "Never"
                            : "—"}
                        </td>
                        <td className="px-3 py-3">
                          {user.isPro ? (
                            <div className="text-xs">
                              <div className="text-slate-300">
                                {user.creditsUsed} / {user.creditsRemaining ?? 0}
                              </div>
                              <div className="text-slate-500">used / remaining</div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-400">{user.conversations}</td>
                        <td className="px-3 py-3 text-xs text-slate-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-3">
                          {user.emailVerifiedAt ? (
                            <span className="text-xs text-green-400">✓ Yes</span>
                          ) : (
                            <span className="text-xs text-slate-500">No</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 transition-colors hover:border-[#b74bff] hover:text-[#b74bff]"
                          >
                            Edit
                          </button>
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
                      onClick={() => fetchUsers(pagination.page - 1)}
                      disabled={pagination.page === 1 || loading}
                      className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchUsers(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages || loading}
                      className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        {/* Edit Modal */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl border border-slate-800 bg-[#050c1f] p-6 shadow-xl">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Edit Plan: {editingUser.email}
              </h3>

              <div className="mb-4 space-y-4">
                <div>
                  <label className="mb-2 block text-xs uppercase tracking-widest text-slate-500">
                    Plan
                  </label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as "free" | "pro")}
                    className="w-full rounded border border-slate-700 bg-[#030b1a] px-3 py-2 text-sm text-white outline-none transition focus:border-[#b74bff]"
                  >
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>

                {editPlan === "pro" && (
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-widest text-slate-500">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={editDurationDays}
                      onChange={(e) => setEditDurationDays(e.target.value)}
                      placeholder="30 (0 for lifetime)"
                      min="0"
                      className="w-full rounded border border-slate-700 bg-[#030b1a] px-3 py-2 text-sm text-white outline-none transition focus:border-[#b74bff]"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Enter 0 for lifetime pro membership
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  disabled={saving}
                  className="flex-1 rounded border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  disabled={saving}
                  className="flex-1 rounded border border-[#b74bff] bg-[#b74bff]/10 px-4 py-2 text-sm font-semibold text-[#b74bff] transition hover:bg-[#b74bff]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


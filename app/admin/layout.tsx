'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("textopsy_admin_sidebar_open");
      return saved === "true";
    }
    return true;
  });
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("textopsy_admin_sidebar_open", sidebarOpen.toString());
    }
  }, [sidebarOpen]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (typeof window === "undefined") return;

      const token = localStorage.getItem("textopsy_auth_token");
      if (!token) {
        setIsAdmin(false);
        setLoading(false);
        // Redirect to login or show login modal
        return;
      }

      setAuthToken(token);

      try {
        const response = await fetch("/api/admin/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.admin === true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#b74bff] border-r-transparent"></div>
          <p className="text-sm text-slate-400">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="max-w-md text-center">
          <div className="mb-4 text-4xl">🔒</div>
          <h1 className="mb-2 text-2xl font-semibold">Access Denied</h1>
          <p className="mb-6 text-slate-400">
            You need admin privileges to access this panel. Please contact your administrator.
          </p>
          <button
            onClick={() => router.push("/")}
            className="rounded border border-[#b74bff] px-4 py-2 text-sm font-semibold text-[#b74bff] transition hover:bg-[#b74bff]/10"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className={`flex flex-1 flex-col transition-all duration-300 ${sidebarOpen ? "ml-80" : ""}`}>
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#050c1f] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
              aria-label="Toggle sidebar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}


'use client';

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { IconBarChart, IconUsers, IconMessageSquare, IconTrendingUp, IconShield } from "@/components/Icons";

type AdminSidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
};

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { href: "/admin", label: "Dashboard", icon: IconBarChart },
    { href: "/admin/users", label: "Users", icon: IconUsers },
    { href: "/admin/conversations", label: "Conversations", icon: IconMessageSquare },
    { href: "/admin/analytics", label: "Analytics", icon: IconTrendingUp },
  ];

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-30 h-screen w-80 transform border-r border-slate-800 bg-[#050c1f] transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="rounded-lg bg-[#b74bff]/20 p-2">
                  <IconShield className="h-5 w-5 text-[#b74bff]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Admin Panel</p>
                  <p className="text-[10px] text-slate-500">Textopsy</p>
                </div>
              </Link>
              <button
                onClick={onToggle}
                className="rounded border border-slate-700 p-1.5 text-slate-400 transition-colors hover:border-slate-600 hover:text-white"
                aria-label="Close sidebar"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#b74bff]/10 text-[#b74bff] border border-[#b74bff]/20"
                        : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-slate-800 p-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
            >
              <span>←</span>
              <span>Back to App</span>
            </Link>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
}


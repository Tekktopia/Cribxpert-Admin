// components/layout/ModuleLocked.tsx
// Full-page "no access" state — keeps the sidebar + topbar, replaces the
// main content with a polished locked screen.
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { financeAdminNavigationItems } from "@/components/layout/FinanceSidebar";
import { useAppSelector } from "@/store/hooks";
import { Lock, ShieldAlert } from "lucide-react";

export default function ModuleLocked({
  title,
  message = "Sorry, you don't have the right permission to access this module.",
}: {
  title: string;
  message?: string;
}) {
  const role = (useAppSelector((s) => s.auth.profile?.role) ?? "").toLowerCase();
  const sidebarItems =
    role === "finance_admin" || role === "finance_agent"
      ? financeAdminNavigationItems
      : csrNavigationItems;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={sidebarItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="relative w-full max-w-md text-center">
            {/* Soft glow backdrop */}
            <div className="absolute inset-0 -z-10 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-teal-100/40 blur-3xl" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-10">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg shadow-teal-600/20 mb-5">
                <Lock className="w-7 h-7 text-white" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-700 uppercase tracking-wide mb-4">
                <ShieldAlert className="w-3.5 h-3.5" />
                Access restricted
              </div>

              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{message}</p>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  If you believe this is a mistake, contact your CSR Supervisor
                  or a Platform Administrator.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Shared fixed-sidebar layout shell for all CSR and Finance-Admin pages.
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { csrNavigationItems } from "./csrSidebar";
import { financeAdminNavigationItems } from "./FinanceSidebar";
import { useAppSelector } from "@/store/hooks";

export function CSRLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const role = (useAppSelector((s) => s.auth.profile?.role) ?? "").toLowerCase();
  const navItems =
    role === "finance_admin" || role === "finance_agent"
      ? financeAdminNavigationItems
      : csrNavigationItems;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        navigationItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed inset-y-0 left-0 z-50 lg:z-auto"
      />

      <div className="flex flex-col flex-1 min-w-0 lg:pl-64 h-screen overflow-hidden">
        <div className="sticky top-0 z-30 flex-shrink-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

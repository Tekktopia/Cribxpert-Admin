import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAppSelector } from "@/store/hooks";
import { adminNavigationItems } from "./Sidebar";           // adjust import path
import { csrNavigationItems } from "./csrSidebar";         // adjust import path
import { financeAdminNavigationItems } from "./FinanceSidebar"; // adjust import path

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Use the authoritative profile role (Supabase user.role is just 'authenticated')
  const role = (useAppSelector(state => state.auth.profile?.role) ?? '').toLowerCase();

  const getSidebarItems = () => {
    if (role === 'finance_admin' || role === 'finance_agent') return financeAdminNavigationItems;
    if (role === 'csr_admin'     || role === 'csr_agent')     return csrNavigationItems;
    return adminNavigationItems; // admin, superadmin (also fallback)
  };

  return (
    <div className="flex min-h-screen bg-[FEFEFF]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — all nav arrays already conform to { label, iconSrc, href } */}
      <Sidebar
        navigationItems={getSidebarItems()}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed inset-y-0 left-0 z-50 lg:static lg:z-auto"
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 h-screen">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
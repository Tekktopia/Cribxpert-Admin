import type { ReactNode } from "react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='flex min-h-screen bg-[FEFEFF]'>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/65 bg-opacity-50 lg:hidden'
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className='fixed inset-y-0 left-0 z-50 lg:static lg:z-auto'
      />

      {/* Main content */}
      <div className='flex-1 flex flex-col min-w-0 lg:ml-0 h-screen'>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className='flex-1 overflow-y-auto'>
          <div className='w-full max-w-[1440px] mx-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

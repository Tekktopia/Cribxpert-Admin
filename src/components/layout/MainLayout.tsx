import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className='flex min-h-screen bg-[FEFEFF]'>
      <Sidebar />
      <div className='flex-1 flex flex-col px-6'>
        <Topbar />
        <main className='flex-1 py-6'>{children}</main>
      </div>
    </div>
  );
}

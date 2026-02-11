// components/layout/FinancePageWrapper.tsx
import type { ReactNode } from "react";
import PageTitle from "@/components/layout/PageTitle";
import FinanceSidebar from "./FinanceSidebar";

interface FinancePageWrapperProps {
  title: string;
  subtitle?: string;
  isPopulated?: boolean;
  children?: ReactNode;
  emptyState?:ReactNode; // Accepts custom empty state component
  headerComponent?: ReactNode; // Accepts DashboardHeader or custom header
  showDefaultHeader?: boolean;
  showHeader?: boolean; // Control whether to show any header at all
}

export function FinancePageWrapper({
  title,
  subtitle,
  isPopulated = false,
  children,
  emptyState,
  headerComponent,
  showDefaultHeader = true,
  showHeader = true,
}: FinancePageWrapperProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Finance Sidebar */}
      <FinanceSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {/* Content Container */}
        <div className="p-6">
          {/* Header Section */}
          {showHeader && (
            <div className="space-y-6">
              {/* Custom Header Component (like DashboardHeader) */}
              {headerComponent}

              {/* Default Page Title (only if no custom header) */}
              {showDefaultHeader && !headerComponent && (
                <PageTitle title={title} subtitle={subtitle} />
              )}
            </div>
          )}

          {/* Main Content */}
          {isPopulated ? (
        children
      ) : (
        <div className="flex justify-center items-center min-h-[400px]">
          {emptyState}
        </div>
      )}
        </div>
      </main>
    </div>
  );
}
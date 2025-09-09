import type { ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { EmptyState } from "@/components/layout/EmptyState";
import PageTitle from "@/components/layout/PageTitle";

interface PageWrapperProps {
  title: string;
  subtitle: string;
  isPopulated?: boolean;
  children?: ReactNode;
  emptyState?: {
    iconUrl: string;
    title: string;
    subtitle: string;
    showRefreshButton?: boolean;
  };
  headerComponent?: ReactNode; // For custom header components like DashboardHeader
  showDefaultHeader?: boolean; // Whether to show the PageTitle component
}

export function PageWrapper({
  title,
  subtitle,
  isPopulated = false,
  children,
  emptyState,
  headerComponent,
  showDefaultHeader = true,
}: PageWrapperProps) {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Custom Header Component (like DashboardHeader) */}
        {headerComponent}

        {/* Default Page Header */}
        {showDefaultHeader && <PageTitle title={title} subtitle={subtitle} />}

        {/* Main Content */}
        {isPopulated
          ? children
          : emptyState && (
              <EmptyState
                iconUrl={emptyState.iconUrl}
                title={emptyState.title}
                subtitle={emptyState.subtitle}
              />
            )}
      </div>
    </MainLayout>
  );
}

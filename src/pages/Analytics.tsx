import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  AnalyticsHeader,
  AnalyticsMetricsCards,
  AnalyticsChartsGrid,
  TopPerformingHosts,
} from "@/features/analytics";
import { analyticsData } from "@/data/analyticsData";

export default function Analytics() {
  const isPopulated = true;

  return (
    <PageWrapper
      title='Analytics'
      subtitle='Get insights into user behavior, growth metrics, and listing performance'
      isPopulated={isPopulated}
      showDefaultHeader={false}
      headerComponent={<AnalyticsHeader />}
      emptyState={{
        iconUrl: "/svg/analytics.svg",
        title: "Analytics will appear here",
        subtitle:
          "Track user growth, top listings, and engagement once data is available.",
      }}
    >
      {/* Metric cards */}
      <AnalyticsMetricsCards metrics={analyticsData.metrics} />

      {/* Charts */}
      <AnalyticsChartsGrid
        growth={analyticsData.growth}
        distribution={analyticsData.distribution}
      />

      {/* Top hosts */}
      <div className='grid grid-cols-1 gap-6'>
        <TopPerformingHosts items={analyticsData.topHosts} />
      </div>
    </PageWrapper>
  );
}

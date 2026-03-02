import { PageWrapper } from "@/components/layout/PageWrapper";
import {
  AnalyticsHeader,
  AnalyticsMetricsCards,
  AnalyticsChartsGrid,
  TopPerformingHosts,
} from "@/features/analytics";
import { analyticsData, type AnalyticsMetrics } from "@/data/analyticsData";
import {
  useGetCardStatsQuery,
  useGetPieChartDataQuery,
  useGetUserGrowthTrendQuery,
} from "@/api/features/analytics/analyticsApiSlice";

export default function Analytics() {
  const {
    data: cardStats,
    isLoading: cardLoading,
    isError: cardError,
  } = useGetCardStatsQuery();
  const {
    data: pieData,
    isLoading: pieLoading,
    isError: pieError,
  } = useGetPieChartDataQuery();
  const {
    data: growthData,
    isLoading: growthLoading,
    isError: growthError,
  } = useGetUserGrowthTrendQuery();

  const isLoading = cardLoading || pieLoading || growthLoading;
  const hasError = cardError || pieError || growthError;

  let metrics: AnalyticsMetrics = analyticsData.metrics;
  let distribution = analyticsData.distribution;
  let growth = analyticsData.growth;

  if (cardStats && !hasError) {
    metrics = {
      dau: {
        value: cardStats.dailyActiveUsers,
        change: 0,
        changeText: "today",
        details: "Daily Active Users (DAU)",
      },
      mau: {
        value: cardStats.activeUsersStats.totalActiveUsers,
        change: 0,
        changeText: "active users",
        details: "Users who have logged in at least once",
      },
      guestHostRatio: {
        value:
          cardStats.guestToHostRatio > 0
            ? `${cardStats.guestToHostRatio}:1`
            : "0",
        change: 0,
        changeText: "guests per host",
      },
      conversionRate: {
        value: `${cardStats.conversionRate}%`,
        change: 0,
        changeText: "Guests who became hosts",
      },
    };
  }

  if (pieData && !hasError) {
    distribution = [
      { label: "Guest", value: pieData.guests, color: "#0F6B6F" },
      { label: "Host", value: pieData.hosts, color: "#9A6200" },
    ];
  }

  if (growthData && !hasError) {
    growth = growthData.data.map((point) => ({
      month: point.month,
      host: point.hostCount,
      guest: point.guestCount,
    }));
  }

  const isPopulated = !isLoading && !hasError;

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
      <AnalyticsMetricsCards metrics={metrics} />

      {/* Charts */}
      <AnalyticsChartsGrid
        growth={growth}
        distribution={distribution}
      />

      {/* Top hosts */}
      <div className='grid grid-cols-1 gap-6'>
        <TopPerformingHosts items={analyticsData.topHosts} />
      </div>
    </PageWrapper>
  );
}

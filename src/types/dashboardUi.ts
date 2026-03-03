// =====================================================
// File: src/types/dashboardUi.ts
// =====================================================
export type MetricData = {
    value: number;
    change: number;
    changeText: string;
    details?: string;
  };
  
  export type DashboardUIMetrics = {
    totalUsers: MetricData;
    activeListings: MetricData;
    weeklyBookings: MetricData;
    totalRevenue: MetricData;
  };
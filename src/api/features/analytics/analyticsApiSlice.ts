import { apiSlice } from "@/api/apiSlice";

export interface CardStatsResponse {
  dailyActiveUsers: number;
  activeUsersStats: {
    totalActiveUsers: number;
    activeLast7Days: number;
    activeLast30Days: number;
  };
  guestToHostRatio: number;
  conversionRate: number;
}

export interface PieChartResponse {
  guests: number;
  hosts: number;
}

export interface UserGrowthPoint {
  month: string;
  year: number;
  hostCount: number;
  guestCount: number;
}

export interface UserGrowthTrendResponse {
  data: UserGrowthPoint[];
}

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCardStats: builder.query<CardStatsResponse, void>({
      query: () => ({
        url: "/analytics/card-stats",
        method: "GET",
      }),
    }),
    getPieChartData: builder.query<PieChartResponse, void>({
      query: () => ({
        url: "/analytics/pie-chart",
        method: "GET",
      }),
    }),
    getUserGrowthTrend: builder.query<UserGrowthTrendResponse, void>({
      query: () => ({
        url: "/analytics/user-growth-trend",
        method: "GET",
      }),
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCardStatsQuery,
  useGetPieChartDataQuery,
  useGetUserGrowthTrendQuery,
} = analyticsApiSlice;


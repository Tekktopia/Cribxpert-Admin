import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

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

export interface UserGrowthTrendResponse { data: UserGrowthPoint[] }

export const analyticsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCardStats: builder.query<CardStatsResponse, void>({
      queryFn: async () => {
        const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const [{ count: total }, { count: last7Count }, { count: last30Count }, { count: todayCount }, { data: profiles }] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', last7).not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', last30).not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)'),
          supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', yesterday).not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)'),
          (supabase.from('profiles').select('is_host').not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)') as unknown) as Promise<{ data: any[] | null }>,
        ]);

        const hosts = (profiles ?? []).filter((p: any) => p.is_host).length;
        const guests = (total ?? 0) - hosts;
        const ratio = hosts > 0 ? guests / hosts : 0;
        const conversionRate = (total ?? 0) > 0 ? (hosts / (total ?? 1)) * 100 : 0;

        return {
          data: {
            dailyActiveUsers: todayCount ?? 0,
            activeUsersStats: {
              totalActiveUsers: total ?? 0,
              activeLast7Days: last7Count ?? 0,
              activeLast30Days: last30Count ?? 0,
            },
            guestToHostRatio: parseFloat(ratio.toFixed(2)),
            conversionRate: parseFloat(conversionRate.toFixed(1)),
          },
        };
      },
    }),

    getPieChartData: builder.query<PieChartResponse, void>({
      queryFn: async () => {
        const { data } = await supabase.from('profiles').select('is_host').not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)') as { data: any[] | null };
        const rows = data ?? [];
        const hosts = rows.filter((r: any) => r.is_host).length;
        return { data: { hosts, guests: rows.length - hosts } };
      },
    }),

    getUserGrowthTrend: builder.query<UserGrowthTrendResponse, void>({
      queryFn: async () => {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
        twelveMonthsAgo.setDate(1);

        const { data } = await supabase
          .from('profiles')
          .select('is_host, created_at')
          .gte('created_at', twelveMonthsAgo.toISOString())
          .not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)') as { data: any[] | null };

        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const buckets = new Map<string, { month: string; year: number; hostCount: number; guestCount: number }>();

        for (let i = 0; i < 12; i++) {
          const d = new Date();
          d.setMonth(d.getMonth() - (11 - i));
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          buckets.set(key, { month: monthNames[d.getMonth()], year: d.getFullYear(), hostCount: 0, guestCount: 0 });
        }

        for (const row of (data ?? []) as any[]) {
          const d = new Date(row.created_at);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          const bucket = buckets.get(key);
          if (bucket) {
            if (row.is_host) bucket.hostCount++;
            else bucket.guestCount++;
          }
        }

        return { data: { data: Array.from(buckets.values()) } };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetCardStatsQuery,
  useGetPieChartDataQuery,
  useGetUserGrowthTrendQuery,
} = analyticsApiSlice;

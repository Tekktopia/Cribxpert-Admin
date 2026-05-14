import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "@/lib/supabase";
import type {
  DashboardMetrics,
  User,
  Listing,
  Booking,
  ActivityItem,
  NotificationItem,
} from "@/types";

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Metrics", "Users", "Listings", "Bookings", "Activities", "Notifications"],
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetrics, void>({
      queryFn: async () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [
          { count: totalUsers },
          { count: activeListings },
          { count: weeklyBookings },
          { data: bookingRevenue },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)'),
          supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'approved').eq('hide_status', false),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
          (supabase.from('bookings').select('total_price').eq('status', 'completed') as unknown) as Promise<{ data: any[] | null }>,
        ]);

        const totalRevenue = (bookingRevenue ?? []).reduce((sum: number, b: any) => sum + (b.total_price ?? 0), 0);

        return {
          data: {
            totalUsers: totalUsers ?? 0,
            activeListings: activeListings ?? 0,
            weeklyBookings: weeklyBookings ?? 0,
            totalRevenue,
            userGrowth: 0,
            listingGrowth: 0,
            bookingGrowth: 0,
            revenueGrowth: 0,
          },
        };
      },
      providesTags: ["Metrics"],
    }),

    getUsers: builder.query<User[], { page?: number; status?: string }>({
      queryFn: async ({ status } = {}) => {
        let query = supabase
          .from('profiles')
          .select('id, full_name, email, role, kyc_status, account_disabled, created_at')
          .not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)')
          .order('created_at', { ascending: false })
          .limit(50);

        if (status === 'verified') query = query.eq('kyc_status', 'verified').eq('account_disabled', false);
        else if (status === 'blocked') query = query.eq('account_disabled', true);
        else if (status === 'pending') query = query.neq('kyc_status', 'verified').eq('account_disabled', false);

        const { data, error } = await (query as any);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        return {
          data: (data ?? []).map((p: any) => ({
            id: p.id,
            name: p.full_name ?? p.email ?? '',
            email: p.email ?? '',
            avatar: undefined,
            status: p.account_disabled ? 'blocked' : 'active',
            verificationStatus: p.kyc_status === 'verified' ? 'verified' : 'pending',
            joinDate: p.created_at,
          } as User)),
        };
      },
      providesTags: ["Users"],
    }),

    getListings: builder.query<Listing[], { page?: number; status?: string }>({
      queryFn: async ({ status } = {}) => {
        let query = supabase
          .from('listings')
          .select('id, name, status, base_price, city, state, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(50);

        if (status) query = query.eq('status', status);

        const { data, error } = await (query as any);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        return {
          data: (data ?? []).map((l: any) => ({
            id: l.id,
            title: l.name,
            location: [l.city, l.state].filter(Boolean).join(', '),
            price: l.base_price ?? 0,
            status: l.status === 'approved' ? 'active' : l.status === 'flagged' ? 'flagged' : 'pending',
            createdAt: l.created_at,
            userId: l.user_id ?? '',
          } as Listing)),
        };
      },
      providesTags: ["Listings"],
    }),

    getBookings: builder.query<Booking[], { userId: string; page?: number }>({
      queryFn: async ({ userId }) => {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, status, total_price, check_in, check_out, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20) as any;
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        return {
          data: (data ?? []).map((b: any) => ({
            id: b.id,
            listingId: '',
            userId,
            checkIn: b.check_in ?? '',
            checkOut: b.check_out ?? '',
            totalAmount: b.total_price ?? 0,
            status: b.status === 'confirmed' ? 'confirmed' : b.status === 'cancelled' ? 'cancelled' : 'pending',
            createdAt: b.created_at,
          } as Booking)),
        };
      },
      providesTags: ["Bookings"],
    }),

    getRecentActivities: builder.query<ActivityItem[], void>({
      queryFn: async () => {
        const [{ data: signups }, { data: bookings }] = await Promise.all([
          (supabase.from('profiles').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(5) as unknown) as Promise<{ data: any[] | null }>,
          (supabase.from('bookings').select('id, status, total_price, created_at').order('created_at', { ascending: false }).limit(5) as unknown) as Promise<{ data: any[] | null }>,
        ]);

        const activities: ActivityItem[] = [
          ...(signups ?? []).map((u: any) => ({
            id: u.id,
            type: 'user_verification' as const,
            title: 'New User',
            description: `${u.full_name ?? u.email} signed up`,
            timestamp: u.created_at,
            status: 'completed' as const,
          })),
          ...(bookings ?? []).map((b: any) => ({
            id: b.id,
            type: 'payout_processed' as const,
            title: 'New Booking',
            description: `New booking - ${b.status}`,
            timestamp: b.created_at,
            status: 'pending' as const,
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

        return { data: activities };
      },
      providesTags: ["Activities"],
    }),

    getNotifications: builder.query<NotificationItem[], { userId: string }>({
      queryFn: async ({ userId }) => {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, title, description, is_read, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20) as any;
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        return {
          data: (data ?? []).map((n: any) => ({
            id: n.id,
            type: 'system_alert' as const,
            title: n.title,
            description: n.description ?? '',
            timestamp: n.created_at,
            priority: 'Medium' as const,
            status: n.is_read ? 'read' : 'unread' as const,
          } as NotificationItem)),
        };
      },
      providesTags: ["Notifications"],
    }),

    updateUserStatus: builder.mutation<void, { userId: string; status: string }>({
      queryFn: async ({ userId, status }) => {
        const { error } = await ((supabase.from('profiles') as any)
          .update({ account_disabled: status === 'blocked' })
          .eq('id', userId));
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: undefined };
      },
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetUsersQuery,
  useGetListingsQuery,
  useGetBookingsQuery,
  useGetRecentActivitiesQuery,
  useGetNotificationsQuery,
  useUpdateUserStatusMutation,
} = dashboardApi;

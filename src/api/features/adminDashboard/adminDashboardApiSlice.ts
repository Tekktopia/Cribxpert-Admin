import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export interface DashboardCardsResponse {
  totalUsers: number;
  activeListings: number;
  weeklyBookings: number;
}

export interface UserManagementResponse {
  verifiedUsers: number;
  pendingUsers: number;
  blockedUsers: number;
}

export interface ActivityUser { _id: string; email: string; fullName: string }
export interface ActivityListing { _id: string; name: string }
export interface ActivityBooking { _id: string; totalPrice: number; status: string }

export interface RecentActivity {
  type: "signup" | "listing_update" | "booking";
  timestamp: string;
  user?: ActivityUser;
  listing?: ActivityListing;
  booking?: ActivityBooking;
}

export interface RecentActivityResponse { activities: RecentActivity[] }
export interface RecentActivityParams { limit?: number }

export interface ListingSummaryResponse {
  activeListings: number;
  inactiveListings: number;
  pendingListings: number;
  flaggedListings: number;
}

export const adminDashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardCards: builder.query<DashboardCardsResponse, void>({
      queryFn: async () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [{ count: totalUsers }, { count: activeListings }, { count: weeklyBookings }] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)'),
          supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'approved').eq('hide_status', false),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        ]);
        return { data: { totalUsers: totalUsers ?? 0, activeListings: activeListings ?? 0, weeklyBookings: weeklyBookings ?? 0 } };
      },
    }),

    getUserManagement: builder.query<UserManagementResponse, void>({
      queryFn: async () => {
        const { data } = await supabase
          .from('profiles')
          .select('kyc_status, account_disabled')
          .not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)');
        const rows = data ?? [];
        return {
          data: {
            verifiedUsers: rows.filter(r => r.kyc_status === 'verified' && !r.account_disabled).length,
            pendingUsers: rows.filter(r => r.kyc_status !== 'verified' && !r.account_disabled).length,
            blockedUsers: rows.filter(r => r.account_disabled).length,
          },
        };
      },
    }),

    getRecentActivity: builder.query<RecentActivityResponse, RecentActivityParams | void>({
      queryFn: async (params) => {
        const limit = params?.limit ?? 10;
        const [{ data: signups }, { data: listings }, { data: bookings }] = await Promise.all([
          supabase.from('profiles').select('id, email, full_name, created_at').not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)').order('created_at', { ascending: false }).limit(limit),
          supabase.from('listings').select('id, name, updated_at').order('updated_at', { ascending: false }).limit(limit),
          supabase.from('bookings').select('id, total_price, status, created_at').order('created_at', { ascending: false }).limit(limit),
        ]);

        const activities: RecentActivity[] = [
          ...(signups ?? []).map(u => ({
            type: 'signup' as const,
            timestamp: u.created_at,
            user: { _id: u.id, email: u.email ?? '', fullName: u.full_name ?? '' },
          })),
          ...(listings ?? []).map(l => ({
            type: 'listing_update' as const,
            timestamp: l.updated_at,
            listing: { _id: l.id, name: l.name },
          })),
          ...(bookings ?? []).map(b => ({
            type: 'booking' as const,
            timestamp: b.created_at,
            booking: { _id: b.id, totalPrice: b.total_price ?? 0, status: b.status },
          })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit);

        return { data: { activities } };
      },
    }),

    getListingSummary: builder.query<ListingSummaryResponse, void>({
      queryFn: async () => {
        const { data } = await supabase.from('listings').select('status, hide_status');
        const rows = data ?? [];
        return {
          data: {
            activeListings: rows.filter(r => r.status === 'approved' && !r.hide_status).length,
            inactiveListings: rows.filter(r => r.hide_status).length,
            pendingListings: rows.filter(r => r.status === 'pending').length,
            flaggedListings: rows.filter(r => r.status === 'flagged').length,
          },
        };
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetDashboardCardsQuery,
  useGetUserManagementQuery,
  useGetRecentActivityQuery,
  useGetListingSummaryQuery,
} = adminDashboardApiSlice;

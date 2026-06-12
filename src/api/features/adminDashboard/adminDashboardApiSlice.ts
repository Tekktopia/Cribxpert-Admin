import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export interface DashboardCardsResponse {
  totalUsers: number;      // ALL profiles (no role filter)
  adminTeam: number;       // admins + superadmins only
  kycPending: number;      // kyc_verifications submissions awaiting review
  activeListings: number;
  weeklyBookings: number;
}

export interface BookingStatusBreakdownResponse {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
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

export interface TotalRevenueResponse {
  totalRevenue: number;
}

export const adminDashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardCards: builder.query<DashboardCardsResponse, void>({
      queryFn: async () => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const [
          { count: totalUsers },
          { count: adminTeam },
          { count: kycPending },
          { count: activeListings },
          { count: weeklyBookings },
        ] = await Promise.all([
          // ALL profiles — every registered account in the DB
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          // Admin Team = admins + superadmins only (not CSR/finance staff)
          supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['admin', 'superadmin']),
          // KYC Pending = actual submissions sitting in the review queue —
          // NOT every profile that never submitted documents.
          supabase.from('kyc_verifications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'approved').eq('hide_status', false),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
        ]);
        return {
          data: {
            totalUsers: totalUsers ?? 0,
            adminTeam: adminTeam ?? 0,
            kycPending: kycPending ?? 0,
            activeListings: activeListings ?? 0,
            weeklyBookings: weeklyBookings ?? 0,
          },
        };
      },
    }),

    getUserManagement: builder.query<UserManagementResponse, void>({
      queryFn: async () => {
        const { data } = await supabase
          .from('profiles')
          .select('kyc_status, account_disabled')
          .not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)') as { data: any[] | null };
        const rows = data ?? [];
        return {
          data: {
            verifiedUsers: rows.filter((r: any) => r.kyc_status === 'verified' && !r.account_disabled).length,
            pendingUsers: rows.filter((r: any) => r.kyc_status !== 'verified' && !r.account_disabled).length,
            blockedUsers: rows.filter((r: any) => r.account_disabled).length,
          },
        };
      },
    }),

    getRecentActivity: builder.query<RecentActivityResponse, RecentActivityParams | void>({
      queryFn: async (params) => {
        const limit = params?.limit ?? 10;
        const [{ data: signups }, { data: listings }, { data: bookings }] = await Promise.all([
          (supabase.from('profiles').select('id, email, full_name, created_at').not('role', 'in', '(admin,superadmin,finance_admin,csr_admin)').order('created_at', { ascending: false }).limit(limit) as unknown) as Promise<{ data: any[] | null }>,
          (supabase.from('listings').select('id, name, updated_at').order('updated_at', { ascending: false }).limit(limit) as unknown) as Promise<{ data: any[] | null }>,
          (supabase.from('bookings').select('id, total_price, status, created_at').order('created_at', { ascending: false }).limit(limit) as unknown) as Promise<{ data: any[] | null }>,
        ]);

        const activities: RecentActivity[] = [
          ...(signups ?? []).map((u: any) => ({
            type: 'signup' as const,
            timestamp: u.created_at,
            user: { _id: u.id, email: u.email ?? '', fullName: u.full_name ?? '' },
          })),
          ...(listings ?? []).map((l: any) => ({
            type: 'listing_update' as const,
            timestamp: l.updated_at,
            listing: { _id: l.id, name: l.name },
          })),
          ...(bookings ?? []).map((b: any) => ({
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
        const { data } = await supabase.from('listings').select('status, hide_status') as { data: any[] | null };
        const rows = data ?? [];
        return {
          data: {
            activeListings: rows.filter((r: any) => r.status === 'approved' && !r.hide_status).length,
            inactiveListings: rows.filter((r: any) => r.hide_status).length,
            pendingListings: rows.filter((r: any) => r.status === 'pending').length,
            flaggedListings: rows.filter((r: any) => r.status === 'flagged').length,
          },
        };
      },
    }),

    getBookingStatusBreakdown: builder.query<BookingStatusBreakdownResponse, void>({
      queryFn: async () => {
        const { data } = await supabase.from('bookings').select('status') as { data: { status: string }[] | null };
        const rows = data ?? [];
        return {
          data: {
            total: rows.length,
            pending:   rows.filter((b) => b.status === 'pending').length,
            confirmed: rows.filter((b) => b.status === 'confirmed').length,
            completed: rows.filter((b) => b.status === 'completed').length,
            cancelled: rows.filter((b) => b.status === 'cancelled').length,
          },
        };
      },
    }),

    getTotalRevenue: builder.query<TotalRevenueResponse, void>({
      queryFn: async () => {
        const { data } = await supabase
          .from('bookings')
          .select('total_price, escrow_status, status') as { data: any[] | null };
        // Sum all bookings that have been confirmed/completed or where escrow was released
        const rows = data ?? [];
        const totalRevenue = rows
          .filter((b: any) =>
            b.escrow_status === 'released' ||
            b.escrow_status === 'completed' ||
            b.status === 'confirmed' ||
            b.status === 'completed'
          )
          .reduce((sum: number, b: any) => sum + (Number(b.total_price) || 0), 0);
        return { data: { totalRevenue } };
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
  useGetBookingStatusBreakdownQuery,
  useGetTotalRevenueQuery,
} = adminDashboardApiSlice;

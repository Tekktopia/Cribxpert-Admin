// src/api/features/bookings/bookingsManagementApiSlice.ts
import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

const ESCROW_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/escrow`;

// Call an admin escrow route with the current admin's bearer token. Returns the
// parsed JSON body and throws a readable message on a non-2xx response.
async function callEscrow(path: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not signed in.");
  const res = await fetch(`${ESCROW_FN}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string })?.error ?? `Request failed (${res.status})`);
  return json as Record<string, unknown>;
}

export interface Booking {
  id: string;
  ticketId: string;
  guestName: string;
  guestEmail: string;
  hostName: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  dateRange: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  paymentStatus: string;
  payoutHold: boolean;
  totalPrice: number;
  commission: number;
  createdAt: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface BookingsFilters {
  search?: string;
  status?: string;
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

export const bookingsManagementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all bookings with filtering and pagination
    getBookings: builder.query<BookingsResponse, BookingsFilters | void>({
      queryFn: async (filters) => {
        try {
          const page = filters?.page || 1;
          const limit = filters?.limit || 10;
          const offset = (page - 1) * limit;
          
          // Start building the query
          let query = supabase
            .from('bookings')
            .select(`
              id,
              first_name,
              last_name,
              email,
              listing_id,
              start_date,
              end_date,
              status,
              escrow_status,
              payout_hold,
              total_price,
              created_at,
              listings!bookings_listing_id_fkey (
                name,
                user_id,
                profiles!listings_user_id_fkey (
                  full_name
                )
              )
            `, { count: 'exact' });

          // Apply search filter
          if (filters?.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.trim();
            query = query.or(
              `first_name.ilike.%${searchTerm}%,` +
              `last_name.ilike.%${searchTerm}%,` +
              `email.ilike.%${searchTerm}%,` +
              `listings.name.ilike.%${searchTerm}%`
            );
          }

          // Apply status filter
          if (filters?.status && filters.status !== 'All Status') {
            query = query.eq('status', filters.status);
          }

          // Apply payment status filter
          if (filters?.paymentStatus && filters.paymentStatus !== 'All') {
            query = query.eq('escrow_status', filters.paymentStatus);
          }

          // Get total count first
          const { count: totalCount, error: countError } = await query;
          
          if (countError) throw countError;

          // Apply pagination and ordering
          const { data: bookingsData, error: bookingsError } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

          if (bookingsError) throw bookingsError;

          // Transform data to match the interface
          const bookings: Booking[] = (bookingsData as any[])?.map((booking: any) => {
            // Get host name from profiles
            const hostName = booking.listings?.profiles?.full_name || 'Unknown Host';
            
            // Calculate commission (10% of total_price)
            const commission = Math.round((booking.total_price || 0) * 0.1);
            
            // Format date range
            const startDate = new Date(booking.start_date);
            const endDate = new Date(booking.end_date);
            const dateRange = `${startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}`;
            
            return {
              id: booking.id,
              ticketId: booking.id.slice(0, 8),
              guestName: `${booking.first_name || ''} ${booking.last_name || ''}`.trim(),
              guestEmail: booking.email || '',
              hostName: hostName,
              propertyName: booking.listings?.name || 'Unknown Property',
              startDate: booking.start_date,
              endDate: booking.end_date,
              dateRange: dateRange,
              status: booking.status as 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed',
              paymentStatus: booking.escrow_status || 'Unknown',
              payoutHold: booking.payout_hold ?? false,
              totalPrice: booking.total_price || 0,
              commission: commission,
              createdAt: booking.created_at,
            };
          }) || [];

          return {
            data: {
              bookings,
              totalCount: totalCount || 0,
              currentPage: page,
              totalPages: Math.ceil((totalCount || 0) / limit),
            }
          };
        } catch (error) {
          console.error('Error fetching bookings:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Bookings'],
    }),

    // Update booking status
    updateBookingStatus: builder.mutation<{ success: boolean }, { bookingId: string; status: string }>({
      queryFn: async ({ bookingId, status }) => {
        try {
          const { error } = await (supabase as any)
            .from('bookings')
            .update({
              status,
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

          if (error) throw error;

          return { data: { success: true } };
        } catch (error) {
          console.error('Error updating booking status:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Bookings'],
    }),

    // Update payment status
    updatePaymentStatus: builder.mutation<{ success: boolean }, { bookingId: string; paymentStatus: string }>({
      queryFn: async ({ bookingId, paymentStatus }) => {
        try {
          const { error } = await (supabase as any)
            .from('bookings')
            .update({
              escrow_status: paymentStatus,
              updated_at: new Date().toISOString()
            })
            .eq('id', bookingId);

          if (error) throw error;

          return { data: { success: true } };
        } catch (error) {
          console.error('Error updating payment status:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      invalidatesTags: ['Bookings'],
    }),

    // Admin override: release escrowed funds to the host NOW (early payout).
    releaseEscrow: builder.mutation<{ message: string; hostAmount?: string }, { bookingId: string }>({
      queryFn: async ({ bookingId }) => {
        try {
          const r = await callEscrow(`/admin/bookings/${bookingId}/release`, {});
          return { data: { message: (r.message as string) ?? 'Released', hostAmount: r.hostAmount as string } };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: (e as Error).message } };
        }
      },
      invalidatesTags: ['Bookings'],
    }),

    // Admin override: hold / un-hold a booking's payout so the auto-release
    // cron skips it (e.g. while reviewing a complaint without a formal dispute).
    holdEscrow: builder.mutation<{ message: string; payoutHold: boolean }, { bookingId: string; hold: boolean }>({
      queryFn: async ({ bookingId, hold }) => {
        try {
          const r = await callEscrow(`/admin/bookings/${bookingId}/hold`, { hold });
          return { data: { message: (r.message as string) ?? 'Updated', payoutHold: !!r.payoutHold } };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: (e as Error).message } };
        }
      },
      invalidatesTags: ['Bookings'],
    }),

    // Export bookings to CSV
    exportBookings: builder.query<string, BookingsFilters | void>({
      queryFn: async (filters) => {
        try {
          // Fetch all data without pagination for export
          let query = supabase
            .from('bookings')
            .select(`
              id,
              first_name,
              last_name,
              email,
              start_date,
              end_date,
              status,
              escrow_status,
              total_price,
              created_at,
              listings!bookings_listing_id_fkey (
                name,
                user_id,
                profiles!listings_user_id_fkey (
                  full_name
                )
              )
            `);

          // Apply same filters as getBookings
          if (filters?.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.trim();
            query = query.or(
              `first_name.ilike.%${searchTerm}%,` +
              `last_name.ilike.%${searchTerm}%,` +
              `email.ilike.%${searchTerm}%,` +
              `listings.name.ilike.%${searchTerm}%`
            );
          }

          if (filters?.status && filters.status !== 'All Status') {
            query = query.eq('status', filters.status);
          }

          if (filters?.paymentStatus && filters.paymentStatus !== 'All') {
            query = query.eq('escrow_status', filters.paymentStatus);
          }

          const { data: bookingsData, error } = await query.order('created_at', { ascending: false });

          if (error) throw error;

          // Create CSV headers
          const headers = [
            'Ticket ID',
            'Guest Name',
            'Guest Email',
            'Host Name',
            'Property Name',
            'Start Date',
            'End Date',
            'Status',
            'Payment Status',
            'Total Price',
            'Commission',
            'Created At'
          ];

          // Create CSV rows
          const rows = (bookingsData as any[])?.map((booking: any) => {
            const hostName = booking.listings?.profiles?.full_name || 'Unknown Host';
            const commission = Math.round((booking.total_price || 0) * 0.1);
            
            return [
              booking.id.slice(0, 8),
              `${booking.first_name || ''} ${booking.last_name || ''}`.trim(),
              booking.email || '',
              hostName,
              booking.listings?.name || 'Unknown Property',
              new Date(booking.start_date).toLocaleDateString(),
              new Date(booking.end_date).toLocaleDateString(),
              booking.status,
              booking.escrow_status || 'Unknown',
              booking.total_price || 0,
              commission,
              new Date(booking.created_at).toLocaleString()
            ];
          }) || [];

          // Combine headers and rows
          const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
          ].join('\n');

          return { data: csvContent };
        } catch (error) {
          console.error('Error exporting bookings:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
    }),

    // Get status counts for tabs
    getBookingStatusCounts: builder.query<Record<string, number>, void>({
      queryFn: async () => {
        try {
          const { data: bookings, error } = await (supabase as any)
            .from('bookings')
            .select('status');

          if (error) throw error;

          const typedBookings = bookings as { status: string }[] | null;
          const counts: Record<string, number> = {
            'All Status': typedBookings?.length || 0,
            'Pending': 0,
            'Confirmed': 0,
            'Cancelled': 0,
            'Completed': 0,
          };

          typedBookings?.forEach(booking => {
            if (counts[booking.status] !== undefined) {
              counts[booking.status]++;
            }
          });

          return { data: counts };
        } catch (error) {
          console.error('Error fetching status counts:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Bookings'],
    }),

    // Get payment status counts
    getPaymentStatusCounts: builder.query<Record<string, number>, void>({
      queryFn: async () => {
        try {
          const { data: bookings, error } = await (supabase as any)
            .from('bookings')
            .select('escrow_status');

          if (error) throw error;

          const typedBookings2 = bookings as { escrow_status: string }[] | null;
          const counts: Record<string, number> = {
            'All': typedBookings2?.length || 0,
            'AWAITING_KYC': 0,
            'DELIVERY_CONFIRMED': 0,
          };

          typedBookings2?.forEach(booking => {
            const status = booking.escrow_status;
            if (counts[status] !== undefined) {
              counts[status]++;
            }
          });

          return { data: counts };
        } catch (error) {
          console.error('Error fetching payment status counts:', error);
          return { error: { status: 'FETCH_ERROR', error: String(error) } };
        }
      },
      providesTags: ['Bookings'],
    }),
  }),
  overrideExisting: true,
});

// Export hooks
export const {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useUpdatePaymentStatusMutation,
  useReleaseEscrowMutation,
  useHoldEscrowMutation,
  useExportBookingsQuery,
  useGetBookingStatusCountsQuery,
  useGetPaymentStatusCountsQuery,
} = bookingsManagementApiSlice;
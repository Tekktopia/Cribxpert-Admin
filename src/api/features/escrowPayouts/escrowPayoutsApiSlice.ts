// src/api/features/escrowPayouts/escrowPayoutsApiSlice.ts
// Admin-only API for listing pending escrow payouts and disbursing funds to hosts.
// Reads bookings directly from Supabase; disbursal goes through the escrow edge function.
import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────
export type EscrowStatus =
  | 'AWAITING_KYC'
  | 'AWAITING_PAYMENT'
  | 'FUNDS_HELD'
  | 'DELIVERY_CONFIRMED'
  | 'DISBURSED'
  | 'DISPUTED'
  | 'REFUNDED';

export interface PendingPayout {
  bookingId:    string;
  listingName:  string;
  hostName:     string;
  hostId:       string;
  hostTag:      string | null;
  guestName:    string;
  totalPrice:   number;
  escrowStatus: EscrowStatus;
  checkOut:     string | null;
  paidAt:       string | null;
}

export interface DisburseResult {
  message:      string;
  transactionId?: string;
  reference?:   string;
  hostAmount:   string;
  platformFee:  string;
  feePercent:   number;
}

// ── Edge function helper ──────────────────────────────────────────────────────
const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/escrow`;

async function edgeRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';
  const res = await fetch(`${EDGE_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (json as any)?.error ?? (json as any)?.message ?? `Request failed (${res.status})`
    );
  }
  return json as T;
}

// ── Injected endpoints ────────────────────────────────────────────────────────
export const escrowPayoutsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // List all bookings that are ready to be paid out (FUNDS_HELD | DELIVERY_CONFIRMED).
    getPendingPayouts: builder.query<{ payouts: PendingPayout[] }, void>({
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from('bookings')
            .select(`
              id, total_price, escrow_status, end_date, paid_at, first_name, last_name,
              listing:listings!listing_id(
                id, name, user_id,
                host:profiles!user_id(id, full_name, sznd_user_tag)
              )
            `)
            .in('escrow_status', ['DELIVERY_CONFIRMED', 'FUNDS_HELD'])
            .order('paid_at', { ascending: false });

          if (error) throw new Error(error.message);

          const payouts: PendingPayout[] = ((data ?? []) as any[]).map((b) => {
            const listing = b.listing ?? {};
            const host    = listing.host ?? {};
            return {
              bookingId:    b.id as string,
              listingName:  (listing.name ?? 'Unknown listing') as string,
              hostName:     (host.full_name ?? '—') as string,
              hostId:       (host.id ?? listing.user_id ?? '') as string,
              hostTag:      (host.sznd_user_tag ?? null) as string | null,
              guestName:    `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim() || '—',
              totalPrice:   Number(b.total_price ?? 0),
              escrowStatus: b.escrow_status as EscrowStatus,
              checkOut:     (b.end_date  ?? null) as string | null,
              paidAt:       (b.paid_at   ?? null) as string | null,
            };
          });

          return { data: { payouts } };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : String(e) } };
        }
      },
      providesTags: ['EscrowPayouts'],
    }),

    // Trigger disbursement for a single booking via the escrow edge function.
    disburseToHost: builder.mutation<DisburseResult, { bookingId: string; amount?: number }>({
      queryFn: async ({ bookingId, amount }) => {
        try {
          const result = await edgeRequest<DisburseResult>(
            `/bookings/${bookingId}/disburse`,
            {
              method: 'POST',
              body: JSON.stringify(amount ? { amount } : {}),
            }
          );
          return { data: result };
        } catch (e) {
          return { error: { status: 'CUSTOM_ERROR', error: e instanceof Error ? e.message : String(e) } };
        }
      },
      invalidatesTags: ['EscrowPayouts'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPendingPayoutsQuery,
  useDisburseToHostMutation,
} = escrowPayoutsApiSlice;

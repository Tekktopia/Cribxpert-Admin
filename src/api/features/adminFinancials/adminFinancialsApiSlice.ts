import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";
import type {
  FinancialsData,
  FinancialTransaction,
  TransactionStatus,
  TransactionType,
} from "@/data/financialsData";

// Canonical host-earnings model — MUST stay in sync with calcHostEarnings in
// the frontend repo's escrow edge function, which is what actually pays hosts.
// Host receives accommodation + cleaning in full; CribXpert keeps the guest
// service fee (5%) + VAT (7.5%); the security deposit returns to the guest.
function calcHostEarnings(totalAmount: number, secDeposit: number, storedHostEarnings?: number | null): number {
  const stored = Number(storedHostEarnings ?? 0);
  if (stored > 0) return stored;
  const nonDeposit = totalAmount - secDeposit;
  const vatOnDeposit = secDeposit * 0.075;
  return Math.max(0, (nonDeposit - vatOnDeposit) / 1.12875);
}

// CribXpert revenue on a booking = service_fee + vat when stored; otherwise
// everything that isn't host earnings or the deposit.
function calcPlatformRevenue(b: { total_price?: number; security_deposit_amount?: number; host_earnings?: number | null; service_fee?: number | null; vat_amount?: number | null }): number {
  const fee = Number(b.service_fee ?? 0);
  const vat = Number(b.vat_amount ?? 0);
  if (fee > 0 || vat > 0) return fee + vat;
  const total  = Number(b.total_price ?? 0);
  const secDep = Number(b.security_deposit_amount ?? 0);
  return Math.max(0, total - secDep - calcHostEarnings(total, secDep, b.host_earnings));
}

function escrowToType(status: string): TransactionType {
  if (status === "DISBURSED") return "Payout";
  if (status === "REFUNDED")  return "Refund";
  return "Guest Payment";
}

function escrowToStatus(status: string): TransactionStatus {
  if (status === "DISBURSED" || status === "DELIVERY_CONFIRMED" || status === "REFUNDED") return "Completed";
  if (status === "DISPUTED")  return "Disputed";
  return "Pending";
}

function txAmount(status: string, totalPrice: number, secDep: number, hostEarnings?: number | null): number {
  if (status === "DISBURSED") return Math.round(calcHostEarnings(totalPrice, secDep, hostEarnings));
  if (status === "REFUNDED")  return totalPrice;
  return totalPrice;
}

export const adminFinancialsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAdminFinancials: builder.query<FinancialsData, void>({
      queryFn: async () => {
        try {
          // ── 1. Fetch all bookings ──────────────────────────────────────
          const { data: bookings, error: bookErr } = await supabase
            .from("bookings")
            .select("id, created_at, total_price, security_deposit_amount, host_earnings, service_fee, vat_amount, escrow_status, start_date, end_date, user_id, listing_id")
            .order("created_at", { ascending: false })
            .limit(1000) as { data: any[] | null; error: any };

          if (bookErr) throw new Error(bookErr.message);
          const rows = bookings ?? [];

          // ── 2. Fetch listing names + host IDs ─────────────────────────
          const listingIds = [...new Set(rows.map((b) => b.listing_id).filter(Boolean))];
          let listingMap: Record<string, { name: string; userId: string }> = {};
          if (listingIds.length > 0) {
            const { data: listings } = await supabase
              .from("listings")
              .select("id, name, user_id")
              .in("id", listingIds) as { data: any[] | null; error: any };
            (listings ?? []).forEach((l: any) => {
              listingMap[l.id] = { name: l.name ?? "Unknown listing", userId: l.user_id };
            });
          }

          // ── 3. Fetch profile names for guests + hosts ─────────────────
          const guestIds = rows.map((b) => b.user_id).filter(Boolean);
          const hostIds = Object.values(listingMap).map((l) => l.userId).filter(Boolean);
          const allIds = [...new Set([...guestIds, ...hostIds])];
          let profileMap: Record<string, string> = {};
          if (allIds.length > 0) {
            const { data: profiles } = await supabase
              .from("profiles")
              .select("id, full_name")
              .in("id", allIds) as { data: any[] | null; error: any };
            (profiles ?? []).forEach((p: any) => {
              profileMap[p.id] = p.full_name ?? "";
            });
          }

          // ── 4. Map bookings → transactions ────────────────────────────
          const transactions: FinancialTransaction[] = rows
            .filter((b) => b.escrow_status && b.escrow_status !== "AWAITING_KYC")
            .map((b) => {
              const total  = Number(b.total_price ?? 0);
              const secDep = Number(b.security_deposit_amount ?? 0);
              const listing = listingMap[b.listing_id];
              const hostId  = listing?.userId;
              return {
                id:            b.id,
                date:          (b.created_at ?? "").slice(0, 10),
                type:          escrowToType(b.escrow_status),
                status:        escrowToStatus(b.escrow_status),
                amount:        txAmount(b.escrow_status, total, secDep, b.host_earnings),
                guestName:     profileMap[b.user_id] || undefined,
                hostName:      hostId ? (profileMap[hostId] || undefined) : undefined,
                propertyName:  listing?.name || undefined,
              };
            });

          // ── 5. Build summary cards from real numbers ──────────────────
          let commission  = 0;
          let hostEarned  = 0;
          let escrowHeld  = 0;
          let refunded    = 0;

          rows.forEach((b) => {
            const total  = Number(b.total_price ?? 0);
            const secDep = Number(b.security_deposit_amount ?? 0);
            const s = b.escrow_status;

            if (s === "DISBURSED") {
              commission += Math.round(calcPlatformRevenue(b));
              hostEarned += Math.round(calcHostEarnings(total, secDep, b.host_earnings));
            }
            if (s === "FUNDS_HELD" || s === "DELIVERY_CONFIRMED") {
              escrowHeld += total - secDep;
            }
            if (s === "REFUNDED") {
              refunded += total;
            }
          });

          const data: FinancialsData = {
            summary: [
              {
                id:          "commission",
                title:       "Total Commission Earned",
                value:       commission,
                changeLabel: "all time (service fee + VAT)",
                icon:        "/sidebar/card-tick.svg",
              },
              {
                id:          "hostEarnings",
                title:       "Host Earnings Paid Out",
                value:       hostEarned,
                changeLabel: "disbursed to hosts",
                icon:        "/sidebar/material-symbols_analytics-outline.svg",
              },
              {
                id:          "escrow",
                title:       "Escrow Balance",
                value:       escrowHeld,
                changeLabel: "currently held",
                icon:        "/sidebar/list-setting.svg",
              },
              {
                id:          "refunds",
                title:       "Refunds Issued",
                value:       refunded,
                changeLabel: "all time",
                icon:        "/sidebar/notification-block-03.svg",
              },
            ],
            transactions,
          };

          return { data };
        } catch (err: unknown) {
          return { error: { status: "CUSTOM_ERROR", error: err instanceof Error ? err.message : "Unknown error" } };
        }
      },
      providesTags: ["EscrowPayouts"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetAdminFinancialsQuery } = adminFinancialsApiSlice;

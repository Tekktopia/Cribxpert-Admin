// useAdminBadgeCounts — live badge counts for the main admin sidebar.
//   • kyc:        pending KYC submissions awaiting review
//   • messaging:  conversations with activity in the last 7 days
//   • financials: bookings with funds currently held in escrow (FUNDS_HELD)
//
// Re-counts in realtime off the relevant tables.
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface AdminBadgeCounts {
  kyc: number;
  messaging: number;
  financials: number;
}

export function useAdminBadgeCounts(enabled = true): AdminBadgeCounts {
  const [counts, setCounts] = useState<AdminBadgeCounts>({ kyc: 0, messaging: 0, financials: 0 });

  const recount = useCallback(async () => {
    if (!enabled) return;

    // ── KYC: pending submissions ──────────────────────────────────────────
    const { count: kycCount } = await supabase
      .from("kyc_verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    // ── Messaging: conversations active in the last 7 days ────────────────
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: msgCount } = await supabase
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .gte("last_message_at", sevenDaysAgo);

    // ── Financials: bookings with funds currently held ────────────────────
    const { count: finCount } = await supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("escrow_status", "FUNDS_HELD");

    setCounts({
      kyc:        kycCount  ?? 0,
      messaging:  msgCount  ?? 0,
      financials: finCount  ?? 0,
    });
  }, [enabled]);

  const recountRef = useRef(recount);
  useEffect(() => { recountRef.current = recount; }, [recount]);

  useEffect(() => {
    if (!enabled) return;

    recountRef.current();

    const ch = supabase
      .channel(`admin-badge-counts-${Date.now()}`)
      .on("postgres_changes", { event: "*",      schema: "public", table: "kyc_verifications" }, () => recountRef.current())
      .on("postgres_changes", { event: "*",      schema: "public", table: "conversations" },      () => recountRef.current())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },           () => recountRef.current())
      .on("postgres_changes", { event: "*",      schema: "public", table: "bookings" },           () => recountRef.current())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return counts;
}

// useCsrUnreadCounts — live counts for the CSR sidebar badges.
//   • liveChat:      active (agent-mode, unresolved) sessions awaiting a CSR reply.
//   • tickets:       open tickets (pending / in-progress).
//   • notifications: unread admin-inbox rows for the current user.
//
// Agents are scoped to their own assignments; supervisors/admins see all.
// Re-counts in realtime off relevant tables so badges stay live.
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAppSelector } from "@/store/hooks";
import { isAgent } from "@/utils/roles";

export interface CsrUnreadCounts {
  liveChat: number;
  tickets: number;
  notifications: number;
}

export function useCsrUnreadCounts(enabled = true): CsrUnreadCounts {
  const profileId = useAppSelector((s) => s.auth.profile?.id) ?? "";
  const role = (useAppSelector((s) => s.auth.profile?.role) ?? "").toLowerCase();
  const viewerIsAgent = isAgent(role);

  const [counts, setCounts] = useState<CsrUnreadCounts>({ liveChat: 0, tickets: 0, notifications: 0 });

  const recount = useCallback(async () => {
    if (!enabled) return;

    // ── Tickets ──────────────────────────────────────────────────────────
    let ticketQ = supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "in-progress"]);
    if (viewerIsAgent && profileId) ticketQ = ticketQ.eq("assigned_to", profileId);
    const { count: ticketCount } = await ticketQ;

    // ── Unread notifications ──────────────────────────────────────────────
    let notifCount = 0;
    if (profileId) {
      const { count } = await (supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profileId)
        .eq("is_read", false) as any);
      notifCount = count ?? 0;
    }

    // ── Live chats awaiting CSR reply ─────────────────────────────────────
    let sessQ = supabase
      .from("conversation_sessions")
      .select("session_id, assigned_agent_id")
      .eq("mode", "agent")
      .is("resolved_at", null);
    if (viewerIsAgent && profileId) sessQ = sessQ.eq("assigned_agent_id", profileId);
    const { data: sessions } = await sessQ;

    const sessionIds = ((sessions ?? []) as { session_id: string }[]).map((s) => s.session_id);

    let liveChat = 0;
    if (sessionIds.length > 0) {
      const { data: msgs } = await supabase
        .from("session_messages")
        .select("session_id, role, created_at")
        .in("session_id", sessionIds)
        .order("created_at", { ascending: false })
        .limit(500);

      const latestRoleBySession = new Map<string, string>();
      for (const m of (msgs ?? []) as { session_id: string; role: string }[]) {
        if (!latestRoleBySession.has(m.session_id)) {
          latestRoleBySession.set(m.session_id, m.role);
        }
      }
      liveChat = sessionIds.filter((id) => latestRoleBySession.get(id) === "user").length;
    }

    setCounts({ liveChat, tickets: ticketCount ?? 0, notifications: notifCount });
  }, [viewerIsAgent, profileId, enabled]);

  // Keep a stable ref so the realtime channel callbacks always call the latest
  // recount without needing to be rebuilt whenever recount changes identity.
  const recountRef = useRef(recount);
  useEffect(() => { recountRef.current = recount; }, [recount]);

  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    recountRef.current();

    // Use a unique channel name each mount so Supabase never reuses a cached
    // instance that is still in SUBSCRIBING/SUBSCRIBED state (which throws when
    // .on() is called on it). React StrictMode and profileId changes both cause
    // the effect to re-run before the previous removeChannel fully completes.
    const ch = supabase
      .channel(`csr-unread-counts-${Date.now()}`)
      .on("postgres_changes", { event: "*",      schema: "public", table: "tickets" },               () => recountRef.current())
      .on("postgres_changes", { event: "*",      schema: "public", table: "conversation_sessions" }, () => recountRef.current())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "session_messages" },      () => recountRef.current())
      .on("postgres_changes", { event: "*",      schema: "public", table: "notifications" },         () => recountRef.current())
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, profileId]);

  return counts;
}

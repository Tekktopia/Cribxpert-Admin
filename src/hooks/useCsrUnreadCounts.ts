// useCsrUnreadCounts — live counts for the CSR sidebar badges.
//   • liveChat: active (agent-mode, unresolved) sessions whose most-recent
//               message came from the USER — i.e. awaiting a CSR reply.
//   • tickets:  open tickets (pending / in-progress) still needing attention.
//
// Agents are scoped to their own assignments; supervisors/admins see all.
// Re-counts in realtime off tickets / sessions / messages so badges stay live.
import { useCallback, useEffect, useState } from "react";
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

  const [counts, setCounts] = useState<CsrUnreadCounts>({ liveChat: 0, tickets: 0 });

  const recount = useCallback(async () => {
    if (!enabled) return;
    // ── Tickets: open (pending / in-progress). Agents see only theirs. ──
    let ticketQ = supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "in-progress"]);
    if (viewerIsAgent && profileId) ticketQ = ticketQ.eq("assigned_to", profileId);
    const { count: ticketCount } = await ticketQ;

    // ── Unread notifications for this admin user ──────────────────────────
    let notifCount = 0;
    if (profileId) {
      const { count } = await (supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profileId)
        .eq("is_read", false) as any);
      notifCount = count ?? 0;
    }

    // ── Live chats: active agent-mode sessions awaiting a reply ──
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
      // Pull recent messages for these sessions, newest first, and keep the
      // first (latest) message we see per session. If that message is from the
      // user, the session is awaiting a CSR reply → counts as unread.
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

  useEffect(() => {
    if (!enabled) return;
    recount();
    const ch = supabase
      .channel("csr-unread-counts")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => recount())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_sessions" }, () => recount())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "session_messages" }, () => recount())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => recount())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [recount, enabled]);

  return counts;
}

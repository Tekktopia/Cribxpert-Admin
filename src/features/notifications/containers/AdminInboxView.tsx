// features/notifications/containers/AdminInboxView.tsx
// Admin's incoming-notification inbox. Mirrors the look and feel of the
// frontend (Cribxpert-Frontend) NotificationPage so admins get a consistent
// triage UI across both apps.
//
// What goes here: rows from `public.notifications` targeted at this admin's
// user_id (the auto-trigger on auth.users inserts one row per admin user
// for every new signup, booking, listing event, etc.).
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Bell, AlertCircle, Calendar, Home, CreditCard, ShieldAlert,
  UserPlus, MailOpen, CheckCheck, Inbox, RefreshCcw, Clock,
} from "lucide-react";

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  is_read: boolean;
  status: "read" | "unread";
  created_at: string;
  listing_id?: string | null;
  booking_id?: string | null;
}

type TabKey = "all" | "user_signup" | "booking" | "listing" | "payment" | "system";

const TAB_DEFS: Array<{ key: TabKey; label: string; matches: (cat: string) => boolean }> = [
  { key: "all",         label: "All",          matches: () => true },
  { key: "user_signup", label: "Signups",      matches: (c) => /user_signup|admin_user/.test(c) },
  { key: "booking",     label: "Bookings",     matches: (c) => /booking/.test(c) },
  { key: "listing",     label: "Listings",     matches: (c) => /listing/.test(c) },
  { key: "payment",     label: "Payments",     matches: (c) => /payment|escrow|payout|disburs|finance/.test(c) },
  { key: "system",      label: "System",       matches: (c) => /system|live_chat|dispute|support/.test(c) },
];

function iconForCategory(category: string) {
  if (/user_signup|admin_user/.test(category))                 return UserPlus;
  if (/booking/.test(category))                                return Calendar;
  if (/listing/.test(category))                                return Home;
  if (/payment|escrow|payout|disburs|finance/.test(category))  return CreditCard;
  if (/dispute|support/.test(category))                        return ShieldAlert;
  return Bell;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return "Just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)   return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function AdminInboxView() {
  const [rows, setRows]         = useState<NotificationRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [tab, setTab]           = useState<TabKey>("all");
  const [busyId, setBusyId]     = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setLoading(false);
      return;
    }
    const { data, error: qerr } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (qerr) {
      setError(qerr.message);
    } else {
      setRows((data ?? []) as NotificationRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime: any new notification row for this admin → prepend
  useEffect(() => {
    let userId: string | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      userId = user.id;
      channel = supabase
        .channel(`admin-notif-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            setRows((prev) => [payload.new as NotificationRow, ...prev]);
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const def = TAB_DEFS.find((t) => t.key === tab) ?? TAB_DEFS[0];
    return rows.filter((r) => def.matches(r.category ?? ""));
  }, [rows, tab]);

  const counts = useMemo(() => {
    const out: Record<TabKey, number> = { all: 0, user_signup: 0, booking: 0, listing: 0, payment: 0, system: 0 };
    for (const r of rows) {
      if (!r.is_read || r.status === "unread") {
        for (const def of TAB_DEFS) if (def.matches(r.category ?? "")) out[def.key]++;
      }
    }
    return out;
  }, [rows]);

  const markAsRead = async (id: string) => {
    setBusyId(id);
    const { error: e } = await (supabase.from("notifications") as any)
      .update({ is_read: true, status: "read" })
      .eq("id", id);
    if (!e) {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_read: true, status: "read" } : r))
      );
    }
    setBusyId(null);
  };

  const markAllRead = async () => {
    setBulkBusy(true);
    const ids = filtered.filter((r) => !r.is_read).map((r) => r.id);
    if (ids.length === 0) { setBulkBusy(false); return; }
    const { error: e } = await (supabase.from("notifications") as any)
      .update({ is_read: true, status: "read" })
      .in("id", ids);
    if (!e) {
      setRows((prev) =>
        prev.map((r) => (ids.includes(r.id) ? { ...r, is_read: true, status: "read" } : r))
      );
    }
    setBulkBusy(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Inbox</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Platform events that need your attention. Auto-refreshes in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button
            onClick={markAllRead}
            disabled={bulkBusy || filtered.every((r) => r.is_read)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#1d5c5c] text-white text-sm font-semibold hover:bg-[#154242] disabled:opacity-50"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1">
        {TAB_DEFS.map((def) => {
          const active = tab === def.key;
          const c = counts[def.key];
          return (
            <button
              key={def.key}
              onClick={() => setTab(def.key)}
              className={`flex-shrink-0 inline-flex items-center gap-2 px-3 h-9 rounded-full text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#1d5c5c] text-white shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-[#1d5c5c]/40 hover:text-[#1d5c5c]"
              }`}
            >
              {def.label}
              {c > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold tabular-nums ${
                    active ? "bg-white/20 text-white" : "bg-[#fef2f2] text-[#dc2626]"
                  }`}
                >
                  {c}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Body */}
      {loading ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <div className="inline-block w-7 h-7 border-4 border-[#1d5c5c] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading inbox…</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">Couldn't load notifications</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#e6eff1] text-[#1d5c5c] flex items-center justify-center mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-gray-800">Nothing here</p>
          <p className="text-sm text-gray-500 mt-1">
            New {tab === "all" ? "events" : tab} will show up automatically.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((n) => {
            const Icon = iconForCategory(n.category ?? "");
            const unread = !n.is_read || n.status === "unread";
            return (
              <li
                key={n.id}
                className={`group relative flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 rounded-xl border transition-all ${
                  unread
                    ? "bg-white border-gray-200 hover:border-[#1d5c5c]/40 hover:shadow-sm"
                    : "bg-gray-50 border-gray-100"
                }`}
              >
                {unread && (
                  <span
                    className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#1d5c5c]"
                    aria-hidden
                  />
                )}

                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    unread ? "bg-[#e6eff1] text-[#1d5c5c]" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className={`text-sm leading-snug line-clamp-2 ${
                          unread ? "font-bold text-gray-900" : "font-semibold text-gray-600"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {n.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {timeAgo(n.created_at)}
                      </span>
                      {unread && (
                        <span className="w-2 h-2 rounded-full bg-[#1d5c5c]" aria-label="Unread" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-[#e6eff1] text-[#1d5c5c]">
                      {(n.category ?? "general").replace(/_/g, " ")}
                    </span>
                    {unread && (
                      <button
                        onClick={() => markAsRead(n.id)}
                        disabled={busyId === n.id}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#1d5c5c] disabled:opacity-50 ml-auto"
                      >
                        <MailOpen className="w-3.5 h-3.5" />
                        {busyId === n.id ? "Marking…" : "Mark as read"}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default AdminInboxView;

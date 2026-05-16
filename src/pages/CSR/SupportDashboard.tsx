// pages/CSR/SupportDashboard.tsx — world-class CSR support overview
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import {
  Inbox,
  Headphones,
  CheckCircle2,
  Star,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  StickyNote,
  Clock,
  AlertTriangle,
  Mail,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  useGetTicketsQuery,
  useGetTicketGroupsQuery,
} from "@/api/features/ticket/ticketApiSlice";
import { useAppSelector } from "@/store/hooks";
import { supabase } from "@/lib/supabase";
import { CreateTicketModal } from "@/features/csr/tickets/CreateTicketModal";

// ── helpers ───────────────────────────────────────────────────────────
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
function formatHm(minutes: number): string {
  if (minutes < 1) return "< 1m";
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes - h * 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ── types ─────────────────────────────────────────────────────────────
interface ActivityItem {
  id: string;
  ticket_id: string;
  ticket_number: number | null;
  direction: "inbound" | "outbound" | "note";
  from_name: string | null;
  from_email: string | null;
  body_text: string | null;
  created_at: string;
  subject: string | null;
}

// ── component ─────────────────────────────────────────────────────────
const SupportDashboard = () => {
  const navigate = useNavigate();
  const profile = useAppSelector((s) => s.auth.profile);
  const currentUserId = profile?.id ?? "";
  const currentUserName = profile?.full_name?.split(" ")[0] || "there";

  const { data: ticketsData, refetch: refetchTickets } = useGetTicketsQuery({ limit: 100 });
  const { data: groups = [] } = useGetTicketGroupsQuery();

  const tickets = ticketsData?.data.tickets ?? [];

  // ── live extras ─────────────────────────────────────────────────────
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activeLiveChats, setActiveLiveChats] = useState<number>(0);
  const [csat, setCsat] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [filterMode, setFilterMode] = useState<"queue" | "unassigned" | "urgent">("queue");

  // Recent activity feed
  const fetchActivity = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("ticket_messages")
      .select("id, ticket_id, direction, from_name, from_email, body_text, created_at, subject, tickets!inner(ticket_number)")
      .order("created_at", { ascending: false })
      .limit(8);
    if (!data) return;
    setActivity(
      data.map((r: any) => ({
        id: r.id,
        ticket_id: r.ticket_id,
        ticket_number: r.tickets?.ticket_number ?? null,
        direction: r.direction,
        from_name: r.from_name,
        from_email: r.from_email,
        body_text: r.body_text,
        created_at: r.created_at,
        subject: r.subject,
      })),
    );
  }, []);

  const fetchLiveChats = useCallback(async () => {
    const { count } = await supabase
      .from("conversation_sessions")
      .select("*", { count: "exact", head: true })
      .eq("mode", "agent");
    setActiveLiveChats(count ?? 0);
  }, []);

  const fetchCsat = useCallback(async () => {
    const { data } = await supabase
      .from("session_ratings")
      .select("rating");
    if (!data) return;
    const arr = (data as { rating: number }[]) ?? [];
    if (arr.length === 0) { setCsat({ avg: 0, count: 0 }); return; }
    const avg = arr.reduce((s, r) => s + r.rating, 0) / arr.length;
    setCsat({ avg, count: arr.length });
  }, []);

  useEffect(() => {
    fetchActivity();
    fetchLiveChats();
    fetchCsat();
  }, [fetchActivity, fetchLiveChats, fetchCsat]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel("csr-dashboard-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" },             () => refetchTickets())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages" }, () => fetchActivity())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversation_sessions" }, () => fetchLiveChats())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "session_ratings" }, () => fetchCsat())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetchTickets, fetchActivity, fetchLiveChats, fetchCsat]);

  // ── derived metrics ────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dayBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const openCount   = tickets.filter(t => t.status === "pending" || t.status === "in-progress").length;
    const myTickets   = tickets.filter(t => t.assignedTo === currentUserId);
    const myOpen      = myTickets.filter(t => t.status === "pending" || t.status === "in-progress").length;
    const resolvedToday = tickets.filter(t => t.status === "resolved" && isSameDay(new Date(t.updatedAt), now)).length;
    const resolvedYesterday = tickets.filter(t => t.status === "resolved" && isSameDay(new Date(t.updatedAt), yesterday)).length;
    const urgent      = tickets.filter(t => (t.priority === "urgent" || t.priority === "high") && (t.status === "pending" || t.status === "in-progress")).length;
    const unassigned  = tickets.filter(t => !t.assignedTo && (t.status === "pending" || t.status === "in-progress")).length;
    const openedToday = tickets.filter(t => isSameDay(new Date(t.createdAt), now)).length;
    const openedYesterday = tickets.filter(t => isSameDay(new Date(t.createdAt), yesterday) && !isSameDay(new Date(t.createdAt), dayBefore)).length;

    return { openCount, myOpen, myTickets, resolvedToday, resolvedYesterday, urgent, unassigned, openedToday, openedYesterday };
  }, [tickets, currentUserId]);

  // Queue list (based on filterMode)
  const queueTickets = useMemo(() => {
    let list = tickets.filter(t => t.status === "pending" || t.status === "in-progress");
    if (filterMode === "queue") {
      list = list.filter(t => t.assignedTo === currentUserId);
    } else if (filterMode === "unassigned") {
      list = list.filter(t => !t.assignedTo);
    } else if (filterMode === "urgent") {
      list = list.filter(t => t.priority === "urgent" || t.priority === "high");
    }
    return list
      .sort((a, b) => {
        // priority weighted then last activity
        const pw = { urgent: 0, high: 1, medium: 2, low: 3 } as Record<string, number>;
        const pa = pw[a.priority] ?? 4;
        const pb = pw[b.priority] ?? 4;
        if (pa !== pb) return pa - pb;
        return new Date(b.lastActivityAt ?? b.createdAt).getTime() - new Date(a.lastActivityAt ?? a.createdAt).getTime();
      })
      .slice(0, 8);
  }, [tickets, currentUserId, filterMode]);

  const renderTrend = (current: number, prior: number) => {
    if (prior === 0 && current === 0) return <Trend kind="flat" label="No change" />;
    if (prior === 0) return <Trend kind="up" label={`+${current}`} />;
    const pct = Math.round(((current - prior) / prior) * 100);
    if (pct > 0) return <Trend kind="up" label={`+${pct}%`} />;
    if (pct < 0) return <Trend kind="down" label={`${pct}%`} />;
    return <Trend kind="flat" label="No change" />;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={csrNavigationItems} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-6 py-6 lg:px-8 lg:py-8 space-y-6">
            {/* Greeting + actions */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Support Workspace
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {currentUserName} 👋</h1>
                <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with customer support today.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/csr/live-inbox")}
                  className="px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Headphones className="w-4 h-4 text-teal-600" />
                  Live Inbox
                  {activeLiveChats > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-700">
                      {activeLiveChats}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  New Ticket
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                icon={<Inbox className="w-5 h-5" />}
                tint="teal"
                label="Open Tickets"
                value={metrics.openCount}
                hint={`${metrics.openedToday} opened today`}
                trend={renderTrend(metrics.openedToday, metrics.openedYesterday)}
                onClick={() => navigate("/csr/tickets")}
              />
              <KpiCard
                icon={<Activity className="w-5 h-5" />}
                tint="amber"
                label="My Queue"
                value={metrics.myOpen}
                hint={`${metrics.myTickets.length} assigned overall`}
                onClick={() => setFilterMode("queue")}
              />
              <KpiCard
                icon={<CheckCircle2 className="w-5 h-5" />}
                tint="emerald"
                label="Resolved Today"
                value={metrics.resolvedToday}
                trend={renderTrend(metrics.resolvedToday, metrics.resolvedYesterday)}
              />
              <KpiCard
                icon={<Star className="w-5 h-5" />}
                tint="gold"
                label="Customer Rating"
                value={csat.count > 0 ? csat.avg.toFixed(1) : "—"}
                hint={csat.count > 0 ? `${csat.count} ${csat.count === 1 ? "rating" : "ratings"}` : "No ratings yet"}
              />
            </div>

            {/* Main two-column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: queue */}
              <div className="lg:col-span-2 space-y-6">
                {/* My Queue / filters */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Queue</h2>
                      <p className="text-xs text-gray-500 mt-0.5">Prioritised by urgency · click any ticket to open the mail trail</p>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                      <FilterPill active={filterMode === "queue"}      onClick={() => setFilterMode("queue")}      count={metrics.myOpen}>My Queue</FilterPill>
                      <FilterPill active={filterMode === "unassigned"} onClick={() => setFilterMode("unassigned")} count={metrics.unassigned}>Unassigned</FilterPill>
                      <FilterPill active={filterMode === "urgent"}     onClick={() => setFilterMode("urgent")}     count={metrics.urgent}>Urgent</FilterPill>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {queueTickets.length === 0 ? (
                      <div className="px-5 py-12 text-center">
                        <Inbox className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                        <p className="text-sm font-medium text-gray-700">
                          {filterMode === "queue"      && "You're all caught up. Nice work."}
                          {filterMode === "unassigned" && "Every open ticket has an owner."}
                          {filterMode === "urgent"     && "No urgent tickets right now."}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {filterMode === "queue" && "New assignments will appear here in real time."}
                        </p>
                      </div>
                    ) : (
                      queueTickets.map((t) => {
                        const groupColor = groups.find(g => g.key === t.assignedGroup)?.color ?? "#9ca3af";
                        const num = t.ticketNumber ? `#${String(t.ticketNumber).padStart(6, "0")}` : t.ticketId;
                        return (
                          <button
                            key={t._id}
                            onClick={() => navigate(`/csr/tickets/${t._id}`)}
                            className="w-full px-5 py-4 flex items-center gap-4 hover:bg-teal-50/40 transition-colors text-left"
                          >
                            <PriorityDot priority={t.priority} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-mono text-xs font-semibold text-gray-500">{num}</span>
                                {t.source === "email"     && <SourcePill icon={<Mail className="w-3 h-3" />}          label="Email"     tint="teal" />}
                                {t.source === "live_chat" && <SourcePill icon={<MessageSquare className="w-3 h-3" />} label="Live Chat" tint="amber" />}
                                {t.assignedGroup && (
                                  <span className="text-xs text-gray-500 inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: groupColor }} />
                                    {groups.find(g => g.key === t.assignedGroup)?.name}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm font-medium text-gray-900 truncate">{t.subject || "(no subject)"}</div>
                              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                                <span>{`${t.firstName} ${t.lastName}`.trim() || t.email}</span>
                                <span>·</span>
                                <span>{timeAgo(t.lastActivityAt ?? t.createdAt)}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </button>
                        );
                      })
                    )}
                  </div>

                  {queueTickets.length > 0 && (
                    <div className="px-5 py-3 border-t border-gray-100 text-right">
                      <button
                        onClick={() => navigate("/csr/tickets")}
                        className="text-sm font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
                      >
                        View all tickets
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Performance strip */}
                <div className="bg-gradient-to-br from-teal-50 via-white to-amber-50/50 rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Performance snapshot</h2>
                      <p className="text-xs text-gray-500">Live across all CSR activity</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <PerfStat label="Total tickets"   value={tickets.length} />
                    <PerfStat label="Resolved"        value={tickets.filter(t => t.status === "resolved" || t.status === "closed").length} accent="emerald" />
                    <PerfStat label="Avg rating"      value={csat.count > 0 ? `${csat.avg.toFixed(1)} ★` : "—"} accent="gold" />
                    <PerfStat label="Active chats"    value={activeLiveChats} accent="teal" />
                  </div>
                </div>
              </div>

              {/* Right: live chat + activity */}
              <div className="space-y-6">
                {/* Live Chat snapshot */}
                <button
                  onClick={() => navigate("/csr/live-inbox")}
                  className="w-full text-left bg-white rounded-xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-teal-700" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">Live Chat</div>
                      <div className="text-xs text-gray-500">Real-time customer conversations</div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">{activeLiveChats}</div>
                      <div className="text-xs text-gray-500">active right now</div>
                    </div>
                    <span className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1">
                      Open inbox
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-base font-bold text-gray-900">Recent activity</h2>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto">
                    {activity.length === 0 ? (
                      <div className="px-5 py-10 text-center text-sm text-gray-500">
                        Activity will show up here as tickets move.
                      </div>
                    ) : (
                      activity.map((a) => (
                        <ActivityRow key={a.id} item={a} onClick={() => navigate(`/csr/tickets/${a.ticket_id}`)} />
                      ))
                    )}
                  </div>
                </div>

                {/* Tip card */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-amber-900">Pro tip</div>
                      <div className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                        Use <strong>Internal Notes</strong> on a ticket to brief your teammates without sending an email to the customer.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreateTicketModal isOpen={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
};

export default SupportDashboard;

// ─────────────────────────────────────────────────────────────────────
// Small presentational components
// ─────────────────────────────────────────────────────────────────────

function KpiCard({ icon, tint, label, value, hint, trend, onClick }: {
  icon: React.ReactNode;
  tint: "teal" | "amber" | "emerald" | "gold";
  label: string;
  value: number | string;
  hint?: string;
  trend?: React.ReactNode;
  onClick?: () => void;
}) {
  const tints: Record<string, string> = {
    teal:    "bg-teal-50 text-teal-700",
    amber:   "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    gold:    "bg-orange-50 text-orange-700",
  };
  const Wrapper: any = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`text-left bg-white rounded-xl border border-gray-200 p-5 transition-all ${onClick ? "hover:border-teal-300 hover:shadow-md cursor-pointer" : ""}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tints[tint]}`}>
          {icon}
        </div>
        {trend}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </Wrapper>
  );
}

function Trend({ kind, label }: { kind: "up" | "down" | "flat"; label: string }) {
  const styles = {
    up:   { Icon: TrendingUp,   cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    down: { Icon: TrendingDown, cls: "text-red-700 bg-red-50 border-red-200" },
    flat: { Icon: Minus,        cls: "text-gray-600 bg-gray-50 border-gray-200" },
  }[kind];
  const Icon = styles.Icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${styles.cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function FilterPill({ active, onClick, children, count }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
        active ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
      <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${active ? "bg-teal-100 text-teal-800" : "bg-gray-200 text-gray-600"}`}>
        {count}
      </span>
    </button>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    urgent: "bg-red-500",
    high:   "bg-red-400",
    medium: "bg-amber-400",
    low:    "bg-emerald-400",
  };
  const cls = map[priority] ?? "bg-gray-300";
  return (
    <div className="flex flex-col items-center justify-center w-2 self-stretch">
      <div className={`w-2 h-2 rounded-full ${cls}`} />
    </div>
  );
}

function SourcePill({ icon, label, tint }: { icon: React.ReactNode; label: string; tint: "teal" | "amber" }) {
  const tints: Record<string, string> = {
    teal:  "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold rounded ${tints[tint]}`}>
      {icon}
      {label}
    </span>
  );
}

function PerfStat({ label, value, accent }: { label: string; value: number | string; accent?: "teal" | "gold" | "emerald" }) {
  const accents: Record<string, string> = {
    teal:    "text-teal-700",
    gold:    "text-amber-700",
    emerald: "text-emerald-700",
  };
  const color = accent ? accents[accent] : "text-gray-900";
  return (
    <div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function ActivityRow({ item, onClick }: { item: ActivityItem; onClick: () => void }) {
  const num = item.ticket_number ? `#${String(item.ticket_number).padStart(6, "0")}` : "—";
  const Icon =
    item.direction === "outbound" ? ArrowUpRight :
    item.direction === "note"     ? StickyNote :
                                    ArrowDownLeft;
  const tint =
    item.direction === "outbound" ? "bg-teal-100 text-teal-700" :
    item.direction === "note"     ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-700";
  const who = item.from_name ?? item.from_email ?? "Unknown";
  const preview = (item.body_text ?? "").replace(/\s+/g, " ").trim().slice(0, 80);

  return (
    <button onClick={onClick} className="w-full px-5 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${tint}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-semibold text-gray-700">{num}</span>
          <span className="text-gray-400">·</span>
          <span className="font-medium text-gray-900 truncate">{who}</span>
        </div>
        {preview && (
          <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{preview}</div>
        )}
        <div className="text-[10px] text-gray-400 mt-0.5">{timeAgo(item.created_at)}</div>
      </div>
    </button>
  );
}

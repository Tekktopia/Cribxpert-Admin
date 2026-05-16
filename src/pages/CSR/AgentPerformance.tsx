// pages/CSR/AgentPerformance.tsx — per-agent support metrics
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { financeAdminNavigationItems } from "@/components/layout/FinanceSidebar";
import { useAppSelector } from "@/store/hooks";
import { supabase } from "@/lib/supabase";
import { computeSla } from "@/utils/sla";
import { canExport } from "@/utils/roles";
import { exportCsv } from "@/utils/csv";
import { Users, Download, Sparkles, Star } from "lucide-react";

interface RawTicket {
  id: string;
  assigned_to: string | null;
  status: string;
  created_at: string;
  updated_at: string | null;
  last_activity_at: string | null;
}
interface RawMsg {
  ticket_id: string;
  direction: string;
  created_at: string;
}
interface AgentRow {
  id: string;
  name: string;
  email: string;
  role: string;
  total: number;
  open: number;
  resolved: number;
  slaBreaches: number;
  avgFirstResponseMin: number | null;
}

const SUPPORT_ROLES = [
  "admin",
  "superadmin",
  "csr_admin",
  "finance_admin",
  "csr_agent",
  "finance_agent",
  "group_supervisor",
  "group_agent",
];

function fmtMins(min: number | null): string {
  if (min === null) return "—";
  const m = Math.round(min);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export default function AgentPerformance() {
  const profile = useAppSelector((s) => s.auth.profile);
  const role = (profile?.role ?? "").toLowerCase();
  const sidebarItems =
    role === "finance_admin" || role === "finance_agent"
      ? financeAdminNavigationItems
      : csrNavigationItems;
  const allowExport = canExport(role);

  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<{ id: string; full_name: string | null; email: string | null; role: string }[]>([]);
  const [tickets, setTickets] = useState<RawTicket[]>([]);
  const [firstOutbound, setFirstOutbound] = useState<Record<string, string>>({});
  const [csat, setCsat] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [agentsRes, ticketsRes, msgsRes, ratingsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .in("role", SUPPORT_ROLES),
        supabase
          .from("tickets")
          .select("id, assigned_to, status, created_at, updated_at, last_activity_at"),
        supabase
          .from("ticket_messages")
          .select("ticket_id, direction, created_at")
          .eq("direction", "outbound")
          .order("created_at", { ascending: true }),
        supabase.from("session_ratings").select("rating"),
      ]);
      if (cancelled) return;

      setAgents((agentsRes.data as any[]) ?? []);
      setTickets(((ticketsRes.data as any[]) ?? []) as RawTicket[]);

      // earliest outbound message per ticket (rows already sorted asc)
      const fo: Record<string, string> = {};
      for (const m of ((msgsRes.data as any[]) ?? []) as RawMsg[]) {
        if (!fo[m.ticket_id]) fo[m.ticket_id] = m.created_at;
      }
      setFirstOutbound(fo);

      const ratings = ((ratingsRes.data as { rating: number }[]) ?? []);
      if (ratings.length) {
        setCsat({ avg: ratings.reduce((s, r) => s + r.rating, 0) / ratings.length, count: ratings.length });
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const rows: AgentRow[] = useMemo(() => {
    const byAgent = new Map<string, RawTicket[]>();
    for (const t of tickets) {
      if (!t.assigned_to) continue;
      const arr = byAgent.get(t.assigned_to) ?? [];
      arr.push(t);
      byAgent.set(t.assigned_to, arr);
    }
    return agents
      .map((a) => {
        const list = byAgent.get(a.id) ?? [];
        const open = list.filter((t) => t.status === "pending" || t.status === "in-progress").length;
        const resolved = list.filter((t) => t.status === "resolved" || t.status === "closed").length;
        const slaBreaches = list.filter((t) =>
          computeSla({
            createdAt: t.created_at,
            status: t.status,
            resolvedAt:
              t.status === "resolved" || t.status === "closed"
                ? (t.last_activity_at ?? t.updated_at)
                : null,
          }).anyBreached,
        ).length;

        const responseTimes = list
          .map((t) => {
            const r = firstOutbound[t.id];
            if (!r) return null;
            return (new Date(r).getTime() - new Date(t.created_at).getTime()) / 60000;
          })
          .filter((v): v is number => v !== null && v >= 0);
        const avgFirstResponseMin =
          responseTimes.length > 0
            ? responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length
            : null;

        return {
          id: a.id,
          name: a.full_name ?? a.email ?? "—",
          email: a.email ?? "",
          role: a.role,
          total: list.length,
          open,
          resolved,
          slaBreaches,
          avgFirstResponseMin,
        };
      })
      .sort((x, y) => y.total - x.total);
  }, [agents, tickets, firstOutbound]);

  const handleExport = () => {
    exportCsv(
      `agent-performance-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((r) => ({
        agent: r.name,
        email: r.email,
        role: r.role,
        assigned: r.total,
        open: r.open,
        resolved: r.resolved,
        sla_breaches: r.slaBreaches,
        avg_first_response: r.avgFirstResponseMin === null ? "" : Math.round(r.avgFirstResponseMin),
      })),
      [
        { key: "agent", label: "Agent" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role" },
        { key: "assigned", label: "Assigned" },
        { key: "open", label: "Open" },
        { key: "resolved", label: "Resolved" },
        { key: "sla_breaches", label: "SLA Breaches" },
        { key: "avg_first_response", label: "Avg First Response (min)" },
      ],
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={sidebarItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Team Insights
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Agent Performance</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Ticket volume, resolution and first-response speed per agent.
                </p>
              </div>
              {allowExport && (
                <button
                  onClick={handleExport}
                  className="px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              )}
            </div>

            {/* Global CSAT (live chat ratings have no per-agent attribution yet) */}
            <div className="bg-gradient-to-br from-teal-50 via-white to-amber-50/40 rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-amber-100 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {csat.count > 0 ? `${csat.avg.toFixed(1)} ★` : "—"}
                </div>
                <div className="text-sm text-gray-500">
                  Team CSAT · {csat.count} {csat.count === 1 ? "rating" : "ratings"} (live chat)
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Users className="w-4.5 h-4.5 text-teal-700" />
                </div>
                <h2 className="text-base font-bold text-gray-900">By agent</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Agent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Assigned</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Open</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Resolved</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">SLA Breaches</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Avg 1st Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">Loading…</td></tr>
                    ) : rows.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">No agents found.</td></tr>
                    ) : (
                      rows.map((r) => (
                        <tr key={r.id} className="hover:bg-teal-50/30">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{r.name}</div>
                            <div className="text-xs text-gray-500">{r.email}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-gray-600">{r.role}</td>
                          <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{r.total}</td>
                          <td className="px-6 py-4 text-right text-sm text-gray-700">{r.open}</td>
                          <td className="px-6 py-4 text-right text-sm text-emerald-700 font-medium">{r.resolved}</td>
                          <td className={`px-6 py-4 text-right text-sm font-medium ${r.slaBreaches > 0 ? "text-red-600" : "text-gray-400"}`}>
                            {r.slaBreaches}
                          </td>
                          <td className="px-6 py-4 text-right text-sm text-gray-700">{fmtMins(r.avgFirstResponseMin)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

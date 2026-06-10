// pages/CSR/Users.tsx — CSR team roster (CSR Admins + CSR Agents)
import { useState, useMemo, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { useAppSelector } from "@/store/hooks";
import { supabase } from "@/lib/supabase";
import {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useDisableAdminMutation,
  useDeleteAdminMutation,
  type AdminManagementAdmin,
  type CreateAdminRole,
} from "@/api/features/adminManagement/adminManagementApiSlice";
import {
  Sparkles,
  Users as UsersIcon,
  ShieldCheck,
  UserCog,
  Inbox,
  Plus,
  MoreVertical,
  Eye,
  CheckCircle2,
  Ban,
  Trash2,
  Copy,
  Search,
  Star,
  Activity,
  X,
  Mail,
  RefreshCcw,
  Crown,
  AlertCircle,
} from "lucide-react";

// ── helpers ─────────────────────────────────────────────────────────
function initials(name: string, email?: string): string {
  const src = (name?.trim() || email?.split("@")[0] || "?").trim();
  const parts = src.split(/\s+/);
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : src.slice(0, 2).toUpperCase();
}
function avatarColor(seed: string): string {
  const palette = ["#1d5c5c", "#C18B3F", "#5b21b6", "#0e7490", "#b45309", "#15803d", "#9d174d"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

interface AgentWorkload {
  open: number;
  resolved: number;
}

// ── component ───────────────────────────────────────────────────────
export default function CSRUsers() {
  const profile = useAppSelector((s) => s.auth.profile);
  const myRole = (profile?.role ?? "").toLowerCase();
  const canManageTeam = myRole === "superadmin" || myRole === "csr_admin";

  const { data, isLoading, isError, refetch } = useGetAdminsQuery();
  const [createAdmin, { isLoading: creating }] = useCreateAdminMutation();
  const [disableAdmin] = useDisableAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "csr_admin" | "csr_agent">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "disabled">("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState<{ fullName: string; email: string; password: string; adminType: CreateAdminRole }>({
    fullName: "",
    email: "",
    password: "",
    adminType: "CSRAgent",
  });
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [workload, setWorkload] = useState<Record<string, AgentWorkload>>({});

  // Filter only CSR-relevant users (csr_admin + csr_agent + superadmin too — they help)
  const team: AdminManagementAdmin[] = useMemo(() => {
    const all = data?.admins ?? [];
    return all.filter(a => a.role === "CSRAdmin" || a.role === "CSRAgent" || a.role === "SuperAdmin");
  }, [data]);

  // Pull ticket workload per agent
  const fetchWorkload = useCallback(async () => {
    if (team.length === 0) return;
    const ids = team.map(a => a.id);
    const { data: rows } = await (supabase as any)
      .from("tickets")
      .select("assigned_to, status")
      .in("assigned_to", ids);
    const map: Record<string, AgentWorkload> = {};
    ids.forEach(id => { map[id] = { open: 0, resolved: 0 }; });
    (rows ?? []).forEach((r: any) => {
      const target = map[r.assigned_to];
      if (!target) return;
      if (r.status === "pending" || r.status === "in-progress") target.open += 1;
      if (r.status === "resolved" || r.status === "closed")     target.resolved += 1;
    });
    setWorkload(map);
  }, [team]);

  useEffect(() => { fetchWorkload(); }, [fetchWorkload]);

  // Realtime — profile changes (status flip) + ticket changes (workload)
  useEffect(() => {
    const ch = supabase
      .channel("csr-team-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" },  () => fetchWorkload())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetch, fetchWorkload]);

  // Close action menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest("[data-csr-menu]")) setOpenMenuId(null);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  // ── derived metrics ──────────────────────────────────────────────
  const metrics = useMemo(() => {
    const admins   = team.filter(a => a.role === "CSRAdmin").length;
    const agents   = team.filter(a => a.role === "CSRAgent").length;
    const active   = team.filter(a => !a.accountDisabled).length;
    const totalOpen = Object.values(workload).reduce((s, w) => s + w.open, 0);
    return { admins, agents, active, totalOpen, total: team.length };
  }, [team, workload]);

  // ── filters ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return team.filter(m => {
      const matchSearch =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q);
      const matchRole =
        roleFilter === "all" ||
        (roleFilter === "csr_admin" && m.role === "CSRAdmin") ||
        (roleFilter === "csr_agent" && m.role === "CSRAgent");
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active"   && !m.accountDisabled) ||
        (statusFilter === "disabled" && m.accountDisabled);
      return matchSearch && matchRole && matchStatus;
    });
  }, [team, searchTerm, roleFilter, statusFilter]);

  // ── action handlers ──────────────────────────────────────────────
  const flashToast = (kind: "success" | "error", text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInvite = async () => {
    const name = inviteForm.fullName.trim();
    const email = inviteForm.email.trim();
    const password = inviteForm.password;
    if (!name || !email || password.length < 8) return;
    try {
      await createAdmin({ fullName: name, email, password, adminType: inviteForm.adminType }).unwrap();
      flashToast("success", `${email} created — they can log in now`);
      setInviteOpen(false);
      setInviteForm({ fullName: "", email: "", password: "", adminType: "CSRAgent" });
    } catch (err: any) {
      flashToast("error", err?.data?.error ?? err?.message ?? "Failed to create member");
    }
  };

  const handleToggleActive = async (m: AdminManagementAdmin) => {
    setOpenMenuId(null);
    try {
      await disableAdmin(m.id).unwrap();
      flashToast("success", m.accountDisabled ? `${m.fullName} reactivated` : `${m.fullName} deactivated`);
    } catch (err: any) {
      flashToast("error", err?.data?.error ?? "Action failed");
    }
  };

  const handleRemoveFromTeam = async (m: AdminManagementAdmin) => {
    setOpenMenuId(null);
    if (!confirm(`Remove ${m.fullName} from the team? Their account will be downgraded to a regular user.`)) return;
    try {
      await deleteAdmin(m.id).unwrap();
      flashToast("success", `${m.fullName} removed from team`);
    } catch (err: any) {
      flashToast("error", err?.data?.error ?? "Failed to remove");
    }
  };

  const handleCopyEmail = async (email: string) => {
    setOpenMenuId(null);
    try {
      await navigator.clipboard.writeText(email);
      flashToast("success", `Copied ${email}`);
    } catch {
      flashToast("error", "Couldn't copy email");
    }
  };

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar navigationItems={csrNavigationItems} className="fixed inset-y-0 left-0 z-50 lg:z-auto" />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-6 py-6 lg:px-8 lg:py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  CSR Team
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Everyone on the customer support team and what they're handling right now.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => refetch()}
                  className="px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
                {canManageTeam && (
                  <button
                    onClick={() => setInviteOpen(true)}
                    className="px-3.5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Invite Member
                  </button>
                )}
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={<UsersIcon className="w-5 h-5" />}    tint="teal"    label="Team Size"        value={metrics.total}    hint={`${metrics.active} active`} />
              <KpiCard icon={<ShieldCheck className="w-5 h-5" />}  tint="amber"   label="CSR Admins"        value={metrics.admins}    hint="Supervisors" />
              <KpiCard icon={<UserCog className="w-5 h-5" />}      tint="emerald" label="CSR Agents"        value={metrics.agents}    hint="Front-line" />
              <KpiCard icon={<Inbox className="w-5 h-5" />}        tint="gold"    label="Open Tickets"      value={metrics.totalOpen} hint="Across the team" />
            </div>

            {/* Filter bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All roles</option>
                <option value="csr_admin">CSR Admins</option>
                <option value="csr_agent">CSR Agents</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="disabled">Deactivated</option>
              </select>
            </div>

            {/* Team grid */}
            {isLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-500">Loading team…</div>
            ) : isError ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-red-600">
                Failed to load team. <button onClick={() => refetch()} className="underline">Retry</button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
                <UsersIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-700">No team members match your filters</p>
                <p className="text-xs text-gray-500 mt-1">Try clearing the search or invite someone new.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(m => (
                  <TeamCard
                    key={m.id}
                    member={m}
                    workload={workload[m.id]}
                    isMe={m.id === profile?.id}
                    canManage={canManageTeam && m.id !== profile?.id && m.role !== "SuperAdmin"}
                    menuOpen={openMenuId === m.id}
                    onToggleMenu={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                    onToggleActive={() => handleToggleActive(m)}
                    onRemove={() => handleRemoveFromTeam(m)}
                    onCopyEmail={() => handleCopyEmail(m.email)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Invite team member</h2>
                <p className="text-xs text-gray-500 mt-0.5">They'll receive an email to set up their account.</p>
              </div>
              <button onClick={() => setInviteOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="e.g. Bola Adekunle"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="bola@cribxpert.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="text"
                  autoComplete="new-password"
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="At least 8 characters"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role on CSR team</label>
                <div className="grid grid-cols-2 gap-2">
                  <RoleCard
                    selected={inviteForm.adminType === "CSRAgent"}
                    onClick={() => setInviteForm(f => ({ ...f, adminType: "CSRAgent" }))}
                    icon={<UserCog className="w-4 h-4" />}
                    title="CSR Agent"
                    desc="Handles tickets assigned to them"
                  />
                  <RoleCard
                    selected={inviteForm.adminType === "CSRAdmin"}
                    onClick={() => setInviteForm(f => ({ ...f, adminType: "CSRAdmin" }))}
                    icon={<ShieldCheck className="w-4 h-4" />}
                    title="CSR Admin"
                    desc="Manages the team + routes work"
                  />
                </div>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-800 flex gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <div>
                  No email is sent — share the password with them directly. They
                  can log in immediately and will only see the CSR module.
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              <button
                onClick={() => setInviteOpen(false)}
                className="px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={creating || !inviteForm.fullName.trim() || !inviteForm.email.trim() || inviteForm.password.length < 8}
                className="px-3.5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating ? "Creating…" : (<><Mail className="w-4 h-4" />Create member</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.kind === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        }`}>
          {toast.kind === "success" ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Components
// ──────────────────────────────────────────────────────────────────────

function KpiCard({ icon, tint, label, value, hint }: {
  icon: React.ReactNode;
  tint: "teal" | "amber" | "emerald" | "gold";
  label: string;
  value: number;
  hint?: string;
}) {
  const tints: Record<string, string> = {
    teal:    "bg-teal-50 text-teal-700",
    amber:   "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    gold:    "bg-orange-50 text-orange-700",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${tints[tint]}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

function TeamCard({
  member,
  workload,
  isMe,
  canManage,
  menuOpen,
  onToggleMenu,
  onToggleActive,
  onRemove,
  onCopyEmail,
}: {
  member: AdminManagementAdmin;
  workload?: AgentWorkload;
  isMe: boolean;
  canManage: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onToggleActive: () => void;
  onRemove: () => void;
  onCopyEmail: () => void;
}) {
  const open = workload?.open ?? 0;
  const resolved = workload?.resolved ?? 0;
  const RoleIcon = member.role === "CSRAdmin" ? ShieldCheck : member.role === "SuperAdmin" ? Crown : UserCog;
  const roleClr =
    member.role === "SuperAdmin" ? "bg-purple-50 text-purple-700" :
    member.role === "CSRAdmin"   ? "bg-amber-50 text-amber-700" :
                                    "bg-emerald-50 text-emerald-700";
  const roleLabel =
    member.role === "SuperAdmin" ? "Super Admin" :
    member.role === "CSRAdmin"   ? "CSR Admin" :
                                    "CSR Agent";

  return (
    <div className={`bg-white rounded-xl border ${member.accountDisabled ? "border-red-200 opacity-70" : "border-gray-200"} p-5 hover:shadow-md transition-shadow relative`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: avatarColor(member.id) }}
          >
            {initials(member.fullName, member.email)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-gray-900 truncate">{member.fullName}</h3>
              {isMe && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-100 text-teal-700">You</span>
              )}
            </div>
            <div className="text-xs text-gray-500 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {member.email}
            </div>
          </div>
        </div>

        <div className="relative flex-shrink-0" data-csr-menu>
          {canManage && (
            <button
              onClick={onToggleMenu}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
              aria-label="Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1">
              <MenuItem icon={<Copy className="w-4 h-4" />} onClick={onCopyEmail}>Copy email</MenuItem>
              <div className="border-t border-gray-100 my-1" />
              {member.accountDisabled ? (
                <MenuItem icon={<CheckCircle2 className="w-4 h-4" />} highlight onClick={onToggleActive}>Reactivate</MenuItem>
              ) : (
                <MenuItem icon={<Ban className="w-4 h-4" />} onClick={onToggleActive}>Deactivate</MenuItem>
              )}
              <MenuItem icon={<Trash2 className="w-4 h-4" />} danger onClick={onRemove}>Remove from team</MenuItem>
            </div>
          )}
        </div>
      </div>

      {/* Role + status */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md ${roleClr}`}>
          <RoleIcon className="w-3 h-3" />
          {roleLabel}
        </span>
        {member.accountDisabled ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-700">
            <Ban className="w-3 h-3" />
            Deactivated
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        )}
      </div>

      {/* Workload */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Activity className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{open}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Open</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Star className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">{resolved}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide">Resolved</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleCard({ selected, onClick, icon, title, desc }: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-3 rounded-lg border-2 transition-all ${
        selected ? "border-teal-600 bg-teal-50/50" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className={`flex items-center gap-1.5 mb-1 ${selected ? "text-teal-700" : "text-gray-700"}`}>
        {icon}
        <span className="text-sm font-bold">{title}</span>
      </div>
      <div className="text-xs text-gray-500">{desc}</div>
    </button>
  );
}

function MenuItem({ icon, children, onClick, danger = false, highlight = false, disabled = false }: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  highlight?: boolean;
  disabled?: boolean;
}) {
  const base = "w-full px-3.5 py-2 text-sm flex items-center gap-2.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const cls = danger
    ? `${base} text-red-600 hover:bg-red-50`
    : highlight
      ? `${base} text-emerald-700 hover:bg-emerald-50`
      : `${base} text-gray-700 hover:bg-gray-50`;
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {icon}
      {children}
    </button>
  );
}

// Also export Eye (lint-safe — used nowhere yet but reserved for future "View activity" action)
export { Eye };

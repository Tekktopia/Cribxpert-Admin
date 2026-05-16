// pages/CSR/Users.tsx — Customer directory for CSR (not admins)
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { UserDetailsDrawer } from "@/features/csr/tickets/UserDetailsDrawer";
import { CreateTicketModal, type CreateTicketInitialData } from "@/features/csr/tickets/CreateTicketModal";
import {
  useGetAllUsersQuery,
  useBlockUserMutation,
  type ApiUser,
} from "@/api/features/adminUserManagement/adminUserManagementApiSlice";
import { supabase } from "@/lib/supabase";
import type { User as DrawerUser } from "@/data/csrUserData";
import {
  Search,
  Download,
  Users as UsersIcon,
  UserCheck,
  Home,
  ShieldOff,
  MoreVertical,
  Eye,
  TicketPlus,
  Ticket as TicketIcon,
  Mail,
  Ban,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Phone,
  Sparkles,
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

// ── component ───────────────────────────────────────────────────────
export default function CSRUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "host" | "guest">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "pending" | "blocked">("all");
  const [selectedDrawerUser, setSelectedDrawerUser] = useState<DrawerUser | null>(null);
  const [createTicketFor, setCreateTicketFor] = useState<ApiUser | null>(null);
  const [openMenuFor, setOpenMenuFor] = useState<string | null>(null);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { data, isLoading, isError, refetch } = useGetAllUsersQuery();
  const [blockUser, { isLoading: blocking }] = useBlockUserMutation();

  const users: ApiUser[] = data?.users || [];

  // Realtime — refresh whenever a profile row changes
  useEffect(() => {
    const ch = supabase
      .channel("csr-users-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [refetch]);

  // Close action menu when clicking outside
  const menuContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t?.closest("[data-user-menu]")) setOpenMenuFor(null);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  // ── metrics ──────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const total     = users.length;
    const verified  = users.filter(u => u.status === "verified").length;
    const pending   = users.filter(u => u.status === "pending").length;
    const blocked   = users.filter(u => u.status === "Blocked").length;
    const guests    = users.filter(u => u.role === "GUEST").length;
    const hosts     = users.filter(u => u.role === "HOST").length;
    return { total, verified, pending, blocked, guests, hosts };
  }, [users]);

  // ── filtering ────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return users.filter(u => {
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNo ?? "").toLowerCase().includes(q);
      const matchRole =
        roleFilter === "all" || u.role.toLowerCase() === roleFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "verified" && u.status === "verified") ||
        (statusFilter === "pending"  && u.status === "pending") ||
        (statusFilter === "blocked"  && u.status === "Blocked");
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
  const pagedUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, statusFilter]);

  // ── action handlers ──────────────────────────────────────────────
  const openDrawer = useCallback((u: ApiUser) => {
    const drawerUser: DrawerUser = {
      id: u.userId,
      name: u.name,
      email: u.email,
      role: u.role === "HOST" ? "Host" : "Guest",
      status: u.status === "Blocked" ? "Suspended" : u.status === "verified" ? "Active" : "Pending",
      lastActive: u.lastActive ? new Date(u.lastActive).toLocaleString() : "Never",
      phone: u.phoneNo || "",
      joinDate: "N/A",
      propertyInfo: undefined,
    };
    setSelectedDrawerUser(drawerUser);
  }, []);

  const handleCreateTicket = useCallback((u: ApiUser) => {
    setCreateTicketFor(u);
    setOpenMenuFor(null);
  }, []);

  const handleViewTheirTickets = useCallback((u: ApiUser) => {
    navigate(`/csr/tickets?search=${encodeURIComponent(u.email)}`);
  }, [navigate]);

  const handleCopyEmail = useCallback(async (u: ApiUser) => {
    try {
      await navigator.clipboard.writeText(u.email);
      setToast({ kind: "success", text: `Copied ${u.email}` });
    } catch {
      setToast({ kind: "error", text: "Couldn't copy email" });
    }
    setTimeout(() => setToast(null), 2500);
    setOpenMenuFor(null);
  }, []);

  const handleBlockToggle = useCallback(async (u: ApiUser) => {
    const willBlock = u.status !== "Blocked";
    const reason = willBlock
      ? window.prompt("Reason for suspending this account?")?.trim() ?? ""
      : "Reinstated";
    if (willBlock && !reason) {
      setOpenMenuFor(null);
      return;
    }
    try {
      await blockUser({ userId: u.userId, reason }).unwrap();
      setToast({ kind: "success", text: willBlock ? "Account suspended" : "Account reinstated" });
    } catch (err: any) {
      setToast({ kind: "error", text: err?.data?.error ?? err?.message ?? "Action failed" });
    }
    setTimeout(() => setToast(null), 3000);
    setOpenMenuFor(null);
  }, [blockUser]);

  const ticketInitialData = useMemo<CreateTicketInitialData | undefined>(() => {
    if (!createTicketFor) return undefined;
    const parts = createTicketFor.name.trim().split(/\s+/);
    return {
      firstName: parts[0] || (createTicketFor.email.split("@")[0] ?? "Guest"),
      lastName:  parts.slice(1).join(" "),
      email:     createTicketFor.email,
      phone:     createTicketFor.phoneNo ?? "",
    };
  }, [createTicketFor]);

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={csrNavigationItems} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-6 py-6 lg:px-8 lg:py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Customer Directory
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Look up CribXpert customers, see their activity, and take action.
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
                <button
                  onClick={() => console.log("Export coming soon")}
                  className="px-3.5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={<UsersIcon className="w-5 h-5" />} tint="teal"    label="Total Customers" value={metrics.total}    hint={`${metrics.guests} guests · ${metrics.hosts} hosts`} />
              <KpiCard icon={<UserCheck className="w-5 h-5" />} tint="emerald" label="KYC Verified"    value={metrics.verified} hint={`${metrics.pending} pending`} />
              <KpiCard icon={<Home className="w-5 h-5" />}      tint="amber"   label="Hosts"           value={metrics.hosts}    hint={`${metrics.guests} guests`} />
              <KpiCard icon={<ShieldOff className="w-5 h-5" />} tint="red"     label="Suspended"       value={metrics.blocked}  hint="Blocked accounts" />
            </div>

            {/* Filter bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search name, email, or phone…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All roles</option>
                <option value="guest">Guests</option>
                <option value="host">Hosts</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All statuses</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending KYC</option>
                <option value="blocked">Suspended</option>
              </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" ref={menuContainerRef}>
              {isLoading ? (
                <div className="py-16 text-center text-sm text-gray-500">Loading customers…</div>
              ) : isError ? (
                <div className="py-16 text-center text-sm text-red-600">Failed to load customers. <button onClick={() => refetch()} className="underline">Retry</button></div>
              ) : pagedUsers.length === 0 ? (
                <div className="py-16 text-center">
                  <UsersIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-700">No customers match your filters</p>
                  <p className="text-xs text-gray-500 mt-1">Try clearing the search or changing filters.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pagedUsers.map((u) => (
                          <tr
                            key={u.userId}
                            onClick={() => openDrawer(u)}
                            className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                  style={{ background: avatarColor(u.userId) }}
                                >
                                  {initials(u.name, u.email)}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-sm font-semibold text-gray-900 truncate">{u.name || "(no name)"}</div>
                                  <div className="text-xs text-gray-500 font-mono truncate">{u.userId.slice(0, 8)}…</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-700 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{u.email}</div>
                              {u.phoneNo && (
                                <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" />{u.phoneNo}</div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <RolePill role={u.role} />
                            </td>
                            <td className="px-6 py-4">
                              <StatusPill status={u.status} />
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="relative inline-block" data-user-menu>
                                <button
                                  onClick={() => setOpenMenuFor(openMenuFor === u.userId ? null : u.userId)}
                                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                                  aria-label="Actions"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                                {openMenuFor === u.userId && (
                                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-30 py-1 text-left">
                                    <MenuItem icon={<Eye className="w-4 h-4" />}        onClick={() => { openDrawer(u); setOpenMenuFor(null); }}>View profile</MenuItem>
                                    <MenuItem icon={<TicketPlus className="w-4 h-4" />} onClick={() => handleCreateTicket(u)}>Create ticket for them</MenuItem>
                                    <MenuItem icon={<TicketIcon className="w-4 h-4" />} onClick={() => handleViewTheirTickets(u)}>View their tickets</MenuItem>
                                    <MenuItem icon={<Copy className="w-4 h-4" />}       onClick={() => handleCopyEmail(u)}>Copy email</MenuItem>
                                    <div className="border-t border-gray-100 my-1" />
                                    {u.status === "Blocked" ? (
                                      <MenuItem icon={<CheckCircle2 className="w-4 h-4" />} danger={false} highlight onClick={() => handleBlockToggle(u)} disabled={blocking}>
                                        Reinstate account
                                      </MenuItem>
                                    ) : (
                                      <MenuItem icon={<Ban className="w-4 h-4" />} danger onClick={() => handleBlockToggle(u)} disabled={blocking}>
                                        Suspend account
                                      </MenuItem>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer / pagination */}
                  <div className="px-6 py-3.5 border-t border-gray-100 flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredUsers.length)}</span> of <span className="font-semibold text-gray-900">{filteredUsers.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="px-3 py-1 text-xs font-medium text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modals / drawers */}
      <UserDetailsDrawer
        isOpen={!!selectedDrawerUser}
        onClose={() => setSelectedDrawerUser(null)}
        user={selectedDrawerUser}
      />
      <CreateTicketModal
        isOpen={!!createTicketFor}
        onClose={() => setCreateTicketFor(null)}
        initialData={ticketInitialData}
        contextLabel={createTicketFor ? `For ${createTicketFor.name || createTicketFor.email}` : undefined}
      />

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
// Sub-components
// ──────────────────────────────────────────────────────────────────────

function KpiCard({ icon, tint, label, value, hint }: {
  icon: React.ReactNode;
  tint: "teal" | "emerald" | "amber" | "red";
  label: string;
  value: number;
  hint?: string;
}) {
  const tints: Record<string, string> = {
    teal:    "bg-teal-50 text-teal-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber:   "bg-amber-50 text-amber-700",
    red:     "bg-red-50 text-red-700",
  };
  const valueColor = tint === "red" && value > 0 ? "text-red-600" : "text-gray-900";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${tints[tint]}`}>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
      <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}

function RolePill({ role }: { role: ApiUser["role"] }) {
  if (role === "HOST") {
    return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700"><Home className="w-3 h-3" />Host</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-teal-50 text-teal-700"><UsersIcon className="w-3 h-3" />Guest</span>;
}

function StatusPill({ status }: { status: ApiUser["status"] }) {
  if (status === "verified") {
    return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700"><UserCheck className="w-3 h-3" />Verified</span>;
  }
  if (status === "Blocked") {
    return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-red-50 text-red-700"><ShieldOff className="w-3 h-3" />Suspended</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md bg-amber-50 text-amber-700">Pending KYC</span>;
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

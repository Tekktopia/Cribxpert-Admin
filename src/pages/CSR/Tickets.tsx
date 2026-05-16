import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { financeAdminNavigationItems } from "@/components/layout/FinanceSidebar";
import { useAppSelector } from "@/store/hooks";
import {
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  Mail,
  MessageSquare,
  Inbox,
  Sparkles,
  Ticket as TicketIconLg,
  UserX,
  Flame,
  TrendingUp,
  Plus,
  RefreshCcw,
} from "lucide-react";
import type { Ticket } from "@/features/csr/tickets/types"; // use the actual Ticket type

import { EscalateModal } from "@/features/csr/tickets/EscalateModal";
import { ResolveModal } from "@/features/csr/tickets/ResolveModal";
import { EditTicketModal } from "@/features/csr/tickets/EditTicketModal";
import { CreateTicketModal } from "@/features/csr/tickets/CreateTicketModal";

import {
  useGetTicketsQuery,
  useUpdateTicketStatusMutation,
  useGetTicketGroupsQuery,
} from "@/api/features/ticket/ticketApiSlice";
import { supabase } from "@/lib/supabase";

// Helper to map backend status to UI status
const mapStatus = (backendStatus: string): Ticket['status'] => {
  switch (backendStatus) {
    case 'pending':
    case 'in-progress':
      return 'Open';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Open';
  }
};

// Helper to map backend priority to UI priority
const mapPriority = (backendPriority: string): Ticket['priority'] => {
  switch (backendPriority) {
    case 'urgent':
      return 'High';
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Medium';
  }
};

// Dropdown Component
function TicketActionsDropdown({ ticket, onAction }: { ticket: Ticket; onAction: (ticket: Ticket, action: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          <button
            onClick={() => {
              onAction(ticket, "view");
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Eye className="w-4 h-4" /> View Details
          </button>
          <button
            onClick={() => {
              onAction(ticket, "edit");
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" /> Edit Ticket
          </button>
          <button
            onClick={() => {
              onAction(ticket, "escalate");
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" /> Escalate
          </button>
          <button
            onClick={() => {
              onAction(ticket, "resolve");
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Mark Resolved
          </button>
        </div>
      )}
    </div>
  );
}

export default function Tickets() {
  const navigate = useNavigate();
  // Pick the right sidebar based on the user's role so Finance team also feels at home
  const profileRole = (useAppSelector(s => s.auth.profile?.role) ?? '').toLowerCase();
  const sidebarItems = (profileRole === 'finance_admin' || profileRole === 'finance_agent')
    ? financeAdminNavigationItems
    : csrNavigationItems;
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState("");
  const [filters, setFilters] = useState({
    group: "",
    source: "",
    priority: "",
    status: "",
    search: "",
  });

  const { data: groups = [] } = useGetTicketGroupsQuery();

  // Build query params
  const queryParams = {
    page: currentPage,
    limit: rowsPerPage,
    search: filters.search || undefined,
    priority: filters.priority || undefined,
    status: filters.status ? (filters.status === 'Open' ? 'pending,in-progress' : filters.status.toLowerCase()) : undefined,
    assignedGroup: filters.group || undefined,
    source: filters.source || undefined,
  };

  // Fetch tickets from backend
  const { data, isLoading, isError, refetch } = useGetTicketsQuery(queryParams);
  const [] = useUpdateTicketStatusMutation(); // will be used in modals

  // Supabase Realtime — refetch on any ticket INSERT or UPDATE
  useEffect(() => {
    const channel = supabase
      .channel('csr-tickets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => refetch())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  // Transform backend tickets to UI format
  const tickets = data?.data.tickets.map(t => ({
    id: t._id,
    ticketId: t.ticketId,
    ticketNumber: t.ticketNumber,
    user: `${t.firstName} ${t.lastName}`.trim() || t.email,
    email: t.email,
    subject: t.subject,
    category: t.subject,
    priority: mapPriority(t.priority),
    status: mapStatus(t.status),
    source: t.source ?? 'admin',
    created: new Date(t.createdAt).toLocaleDateString(),
    lastActivityAt: t.lastActivityAt ?? t.createdAt,
    assignedTo: t.assignedTo,
    assignedGroup: t.assignedGroup,
  })) || [];

  const totalItems = data?.data.pagination.total || 0;
  const totalPages = data?.data.pagination.totalPages || 1;

  // KPIs use the stats payload from the API (full counts, not paginated)
  const stats = data?.data.stats;
  const kpis = useMemo(() => {
    // Calculate from current page set for urgency/today (good enough; can promote to dedicated query later)
    const all = data?.data.tickets ?? [];
    const urgent = all.filter(t => t.priority === "urgent" || t.priority === "high").length;
    const unassigned = all.filter(t => !t.assignedTo && (t.status === "pending" || t.status === "in-progress")).length;
    const today = new Date();
    const newToday = all.filter(t => {
      const c = new Date(t.createdAt);
      return c.getFullYear() === today.getFullYear() && c.getMonth() === today.getMonth() && c.getDate() === today.getDate();
    }).length;
    return { urgent, unassigned, newToday };
  }, [data]);

  const getPriorityBadge = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      Open: "bg-blue-100 text-blue-800",
      Resolved: "bg-green-100 text-green-800",
      Escalated: "bg-orange-100 text-orange-800",
      Closed: "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const handleTicketAction = (ticket: Ticket, action: string) => {
    setSelectedTicket(ticket);
    switch (action) {
      case "view":
        navigate(`/csr/tickets/${ticket.id}`);
        break;
      case "edit":
        setShowEditModal(true);
        break;
      case "escalate":
        setShowEscalateModal(true);
        break;
      case "resolve":
        setShowResolveModal(true);
        break;
    }
  };

  const sourceBadge = (src: string) => {
    switch (src) {
      case 'email':     return { Icon: Mail,          label: 'Email',      bg: '#E6EFF1', fg: '#1d5c5c' };
      case 'live_chat': return { Icon: MessageSquare, label: 'Live Chat',  bg: '#fef3c7', fg: '#92400e' };
      default:          return { Icon: Inbox,         label: 'Admin',      bg: '#f3f4f6', fg: '#4b5563' };
    }
  };

  const handlePrevPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setGoToPage("");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={sidebarItems} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto px-6 py-6 lg:px-8 lg:py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1 uppercase tracking-wide">
                  <Sparkles className="w-3.5 h-3.5" />
                  Ticketing
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Track, route, and resolve every customer request in one place.
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
                  onClick={() => setShowCreateModal(true)}
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Ticket
                </button>
              </div>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard icon={<TicketIconLg className="w-5 h-5" />} tint="teal"    label="All Tickets"   value={stats?.total ?? totalItems} hint={`${(stats?.pending ?? 0) + (stats?.inProgress ?? 0)} open`} />
              <KpiCard icon={<UserX className="w-5 h-5" />}        tint="amber"   label="Unassigned"    value={kpis.unassigned}            hint="Need an owner" />
              <KpiCard icon={<Flame className="w-5 h-5" />}        tint="red"     label="High / Urgent" value={kpis.urgent}                hint="Watch closely" />
              <KpiCard icon={<TrendingUp className="w-5 h-5" />}   tint="emerald" label="New Today"     value={kpis.newToday}              hint="In the last 24h" />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-3 flex-wrap">
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.group}
              onChange={(e) => setFilters({...filters, group: e.target.value})}
            >
              <option value="">All Groups</option>
              {groups.map(g => (
                <option key={g.key} value={g.key}>{g.name}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.source}
              onChange={(e) => setFilters({...filters, source: e.target.value})}
            >
              <option value="">All Sources</option>
              <option value="email">Email</option>
              <option value="live_chat">Live Chat</option>
              <option value="admin">Admin</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by ticket #, subject, or email…"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="text-center py-8">Loading tickets...</div>
            ) : isError ? (
              <div className="text-center py-8 text-red-600">Failed to load tickets</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Ticket</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Source</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Group</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Updated</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickets.map((ticket) => {
                        const src = sourceBadge(ticket.source);
                        const SrcIcon = src.Icon;
                        const group = groups.find(g => g.key === ticket.assignedGroup);
                        const numberLabel = ticket.ticketNumber
                          ? `#${String(ticket.ticketNumber).padStart(6, '0')}`
                          : ticket.ticketId;
                        return (
                          <tr
                            key={ticket.id}
                            onClick={() => navigate(`/csr/tickets/${ticket.id}`)}
                            className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              <div className="font-mono text-sm font-semibold text-gray-900">{numberLabel}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[260px] mt-0.5">{ticket.subject}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{ticket.user}</div>
                              <div className="text-xs text-gray-500">{ticket.email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md"
                                style={{ background: src.bg, color: src.fg }}
                              >
                                <SrcIcon className="w-3 h-3" />
                                {src.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {group ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                  <span className="w-2 h-2 rounded-full" style={{ background: group.color ?? '#9ca3af' }} />
                                  {group.name}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              {new Date(ticket.lastActivityAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <TicketActionsDropdown ticket={ticket as Ticket} onAction={handleTicketAction} />
                            </td>
                          </tr>
                        );
                      })}
                      {tickets.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-16 text-center text-sm text-gray-500">
                            <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                            No tickets match your filters yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Go to Page:</span>
                    <input
                      type="text"
                      value={goToPage}
                      onChange={(e) => setGoToPage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleGoToPage()}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      placeholder="1"
                    />
                    <button 
                      onClick={handleGoToPage}
                      className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700"
                    >
                      Go
                    </button>
                  </div>

                  <div className="text-sm text-gray-700">
                    Showing {(currentPage-1)*rowsPerPage+1} - {Math.min(currentPage*rowsPerPage, totalItems)} of {totalItems}
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </main>
      </div>

      {/* Modals and Drawers */}
      {selectedTicket && (
        <>
          <EscalateModal
            isOpen={showEscalateModal}
            onClose={() => setShowEscalateModal(false)}
            ticket={selectedTicket}
          />
          <ResolveModal
            isOpen={showResolveModal}
            onClose={() => setShowResolveModal(false)}
            ticket={selectedTicket}
          />
          <EditTicketModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            ticket={selectedTicket}
          />
        </>
      )}

      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
function KpiCard({ icon, tint, label, value, hint }: {
  icon: React.ReactNode;
  tint: "teal" | "amber" | "emerald" | "red";
  label: string;
  value: number | string;
  hint?: string;
}) {
  const tints: Record<string, string> = {
    teal:    "bg-teal-50 text-teal-700",
    amber:   "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    red:     "bg-red-50 text-red-700",
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
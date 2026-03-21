import { useState, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import {
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import type { Ticket } from "@/features/csr/tickets/types"; // use the actual Ticket type
 // use the actual Ticket type

import { EscalateModal } from "@/features/csr/tickets/EscalateModal";
import { ResolveModal } from "@/features/csr/tickets/ResolveModal";
import { EditTicketModal } from "@/features/csr/tickets/EditTicketModal";
import { CreateTicketModal } from "@/features/csr/tickets/CreateTicketModal";
import { TicketDetailsDrawer } from '@/features/csr/tickets/TicketDetailsDrawer';

import {
  useGetTicketsQuery,
  useUpdateTicketStatusMutation,
} from "@/api/features/ticket/ticketApiSlice";
import { connectSocket } from "@/services/socket";

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
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [goToPage, setGoToPage] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
    search: "",
  });

  // Build query params
  const queryParams = {
    page: currentPage,
    limit: rowsPerPage,
    search: filters.search || undefined,
    priority: filters.priority || undefined,
    status: filters.status ? (filters.status === 'Open' ? 'pending,in-progress' : filters.status.toLowerCase()) : undefined,
  };

  // Fetch tickets from backend
  const { data, isLoading, isError, refetch } = useGetTicketsQuery(queryParams);
  const [] = useUpdateTicketStatusMutation(); // will be used in modals

  // Socket connection for real-time updates
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      const socket = connectSocket(token);
      socket.on('new-ticket', () => {
        refetch(); // refresh list
      });
      socket.on('ticket-updated', () => {
        refetch(); // refresh list
      });
      socket.emit('join-admin-tickets'); // join room
      return () => {
        socket.off('new-ticket');
        socket.off('ticket-updated');
      };
    }
  }, [refetch]);

  // Transform backend tickets to UI format
  const tickets: Ticket[] = data?.data.tickets.map(t => ({
    id: t._id,
    ticketId: t.ticketId,
    user: `${t.firstName} ${t.lastName}`,
    email: t.email,
    subject: t.subject,
    category: t.subject, // you can add a separate category field in backend if needed
    priority: mapPriority(t.priority),
    status: mapStatus(t.status),
    created: new Date(t.createdAt).toLocaleDateString(),
    assignedTo: t.assignedTo,
  })) || [];

  const totalItems = data?.data.pagination.total || 0;
  const totalPages = data?.data.pagination.totalPages || 1;

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
        setShowDetailsDrawer(true);
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
      <Sidebar navigationItems={csrNavigationItems} />
      <div className="flex-1">
        <Topbar />

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
              <p className="text-sm text-gray-600">
                Manage and track customer support tickets
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              + Create Ticket
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              <option value="Payment">Payment</option>
              <option value="Booking">Booking</option>
              <option value="Abuse">Abuse</option>
              <option value="Tech">Tech</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Resolved">Resolved</option>
              <option value="Escalated">Escalated</option>
              <option value="Closed">Closed</option>
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{ticket.ticketId}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.user}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{ticket.subject}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.category}</td>
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
                          <td className="px-6 py-4 text-sm text-gray-700">{ticket.created}</td>
                          <td className="px-6 py-4">
                            <TicketActionsDropdown ticket={ticket} onAction={handleTicketAction} />
                          </td>
                        </tr>
                      ))}
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
          <TicketDetailsDrawer
            isOpen={showDetailsDrawer}
            onClose={() => setShowDetailsDrawer(false)}
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
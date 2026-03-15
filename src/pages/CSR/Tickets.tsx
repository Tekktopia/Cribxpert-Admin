// pages/CSR/tickets/Tickets.tsx
import { useState } from "react";
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import {
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { EscalateModal } from "@/features/csr/tickets/EscalateModal";
import { ResolveModal } from "@/features/csr/tickets/ResolveModal";
import { EditTicketModal } from "@/features/csr/tickets/EditTicketModal";
import { CreateTicketModal } from "@/features/csr/tickets/CreateTicketModal";
 import { TicketDetailsDrawer } from '@/features/csr/tickets/TicketDetailsDrawer';

interface Ticket {
  id: string;
  ticketId: string;
  user: string;
  subject: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Resolved" | "Escalated" | "Closed";
  created: string;
  assignedTo?: string;
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
  const [filters, setFilters] = useState({
    category: "",
    priority: "",
    status: "",
  });

  const tickets: Ticket[] = [
    {
      id: "1",
      ticketId: "100012",
      user: "Tope Akinola",
      subject: "Payment not processed for booking",
      category: "Payment",
      priority: "High",
      status: "Open",
      created: "2025-02-12",
    },
    {
      id: "2",
      ticketId: "100022",
      user: "Tope Akinola",
      subject: "Unable to cancel reservation",
      category: "Booking",
      priority: "Medium",
      status: "Open",
      created: "2025-02-12",
    },
    {
      id: "3",
      ticketId: "100023",
      user: "Tope Akinola",
      subject: "Host not responding to messages",
      category: "Abuse",
      priority: "Low",
      status: "Open",
      created: "2025-02-12",
    },
    {
      id: "4",
      ticketId: "100024",
      user: "Tope Akinola",
      subject: "App crashes on iOS device",
      category: "Tech",
      priority: "Low",
      status: "Resolved",
      created: "2025-02-12",
    },
    {
      id: "5",
      ticketId: "100025",
      user: "Tope Akinola",
      subject: "Refund request for cancelled booking",
      category: "Payment",
      priority: "Low",
      status: "Resolved",
      created: "2025-02-12",
    },
    {
      id: "6",
      ticketId: "100026",
      user: "Tope Akinola",
      subject: "Inappropriate host behavior",
      category: "Abuse",
      priority: "Low",
      status: "Resolved",
      created: "2025-02-12",
    },
    {
      id: "7",
      ticketId: "100027",
      user: "Tope Akinola",
      subject: "Property not as described",
      category: "Booking",
      priority: "Low",
      status: "Escalated",
      created: "2025-02-12",
    },
    {
      id: "8",
      ticketId: "100028",
      user: "Tope Akinola",
      subject: "Double charge on credit card",
      category: "Payment",
      priority: "High",
      status: "Escalated",
      created: "2025-02-12",
    },
  ];

  const getPriorityBadge = (priority: string) => {
    const colors = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
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
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Categories</option>
              <option>Payment</option>
              <option>Booking</option>
              <option>Abuse</option>
              <option>Tech</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Status</option>
              <option>Open</option>
              <option>Resolved</option>
              <option>Escalated</option>
              <option>Closed</option>
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Tickets Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {ticket.ticketId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ticket.user}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ticket.category}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(ticket.priority)}`}
                        >
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ticket.status)}`}
                        >
                          {ticket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {ticket.created}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                            <button
                              onClick={() => handleTicketAction(ticket, "view")}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button
                              onClick={() => handleTicketAction(ticket, "edit")}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit Ticket
                            </button>
                            <button
                              onClick={() =>
                                handleTicketAction(ticket, "escalate")
                              }
                              className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                            >
                              <AlertCircle className="w-4 h-4" /> Escalate
                            </button>
                            <button
                              onClick={() =>
                                handleTicketAction(ticket, "resolve")
                              }
                              className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" /> Mark Resolved
                            </button>
                          </div>
                        </div>
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
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 text-sm bg-teal-600 text-white rounded">
                  1
                </button>
                <button className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                  2
                </button>
                <button className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                  3
                </button>
                <span className="text-sm text-gray-500">...</span>
                <button className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                  50
                </button>
                <button className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Go to Page:</span>
                <input
                  type="text"
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  placeholder="1"
                />
                <button className="px-3 py-1 bg-teal-600 text-white text-sm rounded hover:bg-teal-700">
                  Go
                </button>
              </div>

              <div className="text-sm text-gray-700">Showing 1 - 10 of 500</div>
            </div>
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

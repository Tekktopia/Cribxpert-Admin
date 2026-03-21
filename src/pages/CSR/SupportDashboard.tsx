// pages/CSR/SupportDashboard.tsx
import "@/style(nicholas)/style.scss";

import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { useGetTicketsQuery } from "@/api/features/ticket/ticketApiSlice";
import { connectSocket } from "@/services/socket";
import { useAppSelector } from "@/store/hooks";
import { TicketDetailsDrawer } from "@/features/csr/tickets/TicketDetailsDrawer";
import { type Ticket as TicketType } from "@/features/csr/tickets/types";
import arrow from "/svg/arrow-up.svg";
import plus from "/svg/plus.svg";
import ticketIcon from "/svg/tickets.svg";
import assign from "/svg/assigned.svg";
import resolve from "/svg/resolved.svg";
import escalate from "/svg/escalate.svg";

// Placeholder for RecentActivity
const RecentActivityPlaceholder = () => (
  <div className="bg-white rounded-lg p-4">
    <p className="text-gray-500">Recent activity will appear here.</p>
  </div>
);

interface ticketFilter {
  category: string;
  priority: string;
  status: string;
}

// Map backend status to UI status
const mapStatus = (backendStatus: string): TicketType['status'] => {
  switch (backendStatus) {
    case 'pending':
    case 'in-progress':
      return 'Open';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Pending';
  }
};

// Map backend priority to UI priority
const mapPriority = (backendPriority: string): TicketType['priority'] => {
  switch (backendPriority) {
    case 'urgent':
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

const SupportDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(state => state.auth.user);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [filters, setFilters] = useState<ticketFilter>({
    category: '',
    priority: '',
    status: ''
  });
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch tickets from backend
  const { data, isLoading, isError, refetch } = useGetTicketsQuery({ limit: 100 });

  // Socket for real‑time updates
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;

    const socket = connectSocket(token);
    if (!socket) return;

    const handleNewTicket = () => refetch();
    const handleTicketUpdated = () => refetch();

    socket.on('new-ticket', handleNewTicket);
    socket.on('ticket-updated', handleTicketUpdated);
    socket.emit('join-admin-tickets');

    return () => {
      socket.off('new-ticket', handleNewTicket);
      socket.off('ticket-updated', handleTicketUpdated);
    };
  }, [refetch]);

  // Transform backend tickets to UI format
  const ticketsData = useMemo((): TicketType[] => {
    if (!data?.data.tickets) return [];
    return data.data.tickets.map(t => ({
      id: t._id,
      ticketId: t.ticketId,
      user: `${t.firstName} ${t.lastName}`,
      email: t.email,
      subject: t.subject,
      category: t.subject,
      priority: mapPriority(t.priority),
      status: mapStatus(t.status),
      created: new Date(t.createdAt).toLocaleDateString(),
      dueDate: new Date(t.updatedAt).toLocaleDateString(),
      assignedTo: t.assignedTo,
      message: t.message,           // <-- add this
    }));
  }, [data]);

  // Compute metrics
  const openTickets = ticketsData.filter(t => t.status === 'Open').length;
  const assignedToMe = ticketsData.filter(t => t.assignedTo === currentUser?.id).length;
  const resolvedToday = ticketsData.filter(t => {
    if (t.status !== 'Resolved') return false;
    const today = new Date().toLocaleDateString();
    return t.created === today;
  }).length;
  const escalationsPending = ticketsData.filter(t => t.status === 'Escalated').length;

  // Filter logic
  const filteredTickets = useMemo(() => {
    return ticketsData.filter(ticket => {
      return (
        (filters.category === '' || ticket.category.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.priority === '' || ticket.priority === filters.priority) &&
        (filters.status === '' || ticket.status === filters.status)
      );
    });
  }, [ticketsData, filters]);

  const displayedTickets = useMemo(() => {
    if (showAllTickets) return filteredTickets;
    return filteredTickets.slice(0, 3);
  }, [filteredTickets, showAllTickets]);

  const handleTicketClick = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTicket(null);
  };

  const handleCheckboxChange = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTickets(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(ticketId)) newSelected.delete(ticketId);
      else newSelected.add(ticketId);
      return newSelected;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ids = displayedTickets.map(t => t.ticketId);
      setSelectedTickets(new Set(ids));
      setSelectAll(true);
    } else {
      setSelectedTickets(new Set());
      setSelectAll(false);
    }
  };

  const handleFilterChange = (field: keyof ticketFilter, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setSelectAll(false);
    setSelectedTickets(new Set());
    setShowAllTickets(false);
  };

  const clearFilters = () => {
    setFilters({ category: '', priority: '', status: '' });
    setSelectedTickets(new Set());
    setSelectAll(false);
    setShowAllTickets(false);
  };

  const handleSeeAllClick = () => {
    setShowAllTickets(!showAllTickets);
    setSelectedTickets(new Set());
    setSelectAll(false);
  };

  const isFilterActive = filters.category !== '' || filters.priority !== '' || filters.status !== '';

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'badge badge-high';
      case 'Medium': return 'badge badge-medium';
      case 'Low': return 'badge badge-low';
      default: return 'badge';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Open': return 'badge badge-open';
      case 'Resolved': return 'badge badge-resolved';
      case 'Escalated': return 'badge badge-escalated';
      case 'Pending': return 'badge badge-pending';
      default: return 'badge';
    }
  };

  const uniqueCategories = [...new Set(ticketsData.map(t => t.category))];
  const uniquePriorities = ['High', 'Medium', 'Low'];
  const uniqueStatuses = ['Open', 'Resolved', 'Escalated', 'Pending'];

  if (isLoading) {
    return (
      <div className="supportDash">
        <Sidebar navigationItems={csrNavigationItems} />
        <div className="main">
          <Topbar />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="supportDash">
        <Sidebar navigationItems={csrNavigationItems} />
        <div className="main">
          <Topbar />
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load tickets. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supportDash">
      <Sidebar navigationItems={csrNavigationItems} />
      <div className="main">
        <Topbar />

        <section className="container px-4 md:px-6">
          <div className="text">
            <span>
              <h1>Support Dashboard</h1>
              <p>Track your workload and manage assigned tickets</p>
            </span>
            <button onClick={() => navigate('/csr/tickets/new')}>
              <img src={plus} alt="plus" /> Create Ticket
            </button>
          </div>

          <div className="top">
            <div className="status">
              <div className="statusItem">
                <div>
                  <p>Open Tickets</p>
                  <h4>{openTickets}</h4>
                  <p id="cent">
                    <span><img src={arrow} alt="arrow up" /> 12%</span> From yesterday
                  </p>
                </div>
                <span>
                  <img src={ticketIcon} alt="ticket icon" />
                </span>
              </div>
              <div className="statusItem">
                <div>
                  <p>Assigned to me</p>
                  <h4>{assignedToMe}</h4>
                  <p id="cent">
                    <span><img src={arrow} alt="arrow up" /> 5%</span> From yesterday
                  </p>
                </div>
                <span>
                  <img src={assign} alt="assigned icon" />
                </span>
              </div>
              <div className="statusItem">
                <div>
                  <p>Resolved today</p>
                  <h4>{resolvedToday}</h4>
                  <p id="cent">
                    <span><img src={arrow} alt="arrow up" /> 15%</span> From yesterday
                  </p>
                </div>
                <span>
                  <img src={resolve} alt="resolved icon" />
                </span>
              </div>
              <div className="statusItem">
                <div>
                  <p>Escalations Pending</p>
                  <h4>{escalationsPending}</h4>
                  <p id="cent">
                    <span><img src={arrow} alt="arrow up" /> 12%</span> From yesterday
                  </p>
                </div>
                <span>
                  <img src={escalate} alt="escalate icon" />
                </span>
              </div>
            </div>

            <div className="ticket">
              <div className="tableFilters">
                <div className="filterControls">
                  <div className="filterGroup">
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="filterSelect"
                    >
                      <option value="">All Categories</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filterGroup">
                    <select
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      className="filterSelect"
                    >
                      <option value="">All Priorities</option>
                      {uniquePriorities.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="filterGroup">
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="filterSelect"
                    >
                      <option value="">All Statuses</option>
                      {uniqueStatuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  {isFilterActive && (
                    <button className="clearFilters" onClick={clearFilters}>
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>

              <div className="ticketsTable">
                <div className="tableCont">
                  <table className="min-w-full">
                    <thead>
                      <tr className="tableHeader">
                        <th className="ticketIdHeader">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="selectAllCheckbox"
                          />
                          Ticket ID
                        </th>
                        <th>User</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Due Date</th>
                      </tr>
                    </thead>
                    <tbody className="tableBody">
                      {displayedTickets.length > 0 ? (
                        displayedTickets.map((ticket) => (
                          <tr
                            key={ticket.id}
                            onClick={() => handleTicketClick(ticket)}
                            className="tableRow cursor-pointer hover:bg-gray-50"
                          >
                            <td className="ticketIdCell">
                              <input
                                type="checkbox"
                                checked={selectedTickets.has(ticket.ticketId)}
                                onClick={(e) => handleCheckboxChange(ticket.ticketId, e)}
                                onChange={() => { }}
                                className="ticketCheckbox"
                              />
                              <span className="ticketId">{ticket.ticketId}</span>
                            </td>
                            <td>{ticket.user}</td>
                            <td>{ticket.subject}</td>
                            <td className="categoryCell">{ticket.category}</td>
                            <td>
                              <span className={getPriorityBadgeClass(ticket.priority)}>
                                {ticket.priority}
                              </span>
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(ticket.status)}>
                                {ticket.status}
                              </span>
                            </td>
                            <td>{ticket.created}</td>
                            <td>{ticket.dueDate}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="noResults">
                          <td colSpan={8}>No tickets found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="tableFooter">
                  <div className="selectedCount">
                    {selectedTickets.size > 0 && (
                      <span>{selectedTickets.size} ticket(s) selected</span>
                    )}
                  </div>
                  <button className="seeAllBtn" onClick={handleSeeAllClick}>
                    {showAllTickets ? 'Show Less' : 'See All'}
                  </button>
                </div>
              </div>
            </div>

            <div className="activity">
              <div className="activities">
                <RecentActivityPlaceholder />
              </div>
              <button className="loadMore">Load More Activity</button>
            </div>
          </div>

          <footer className="footer">
            <span>
              <p>Performance Summary</p>
            </span>
            <div className="stats">
              <div className="statItem">
                <h4>{ticketsData.length}</h4>
                <p>Total Tickets Handled</p>
              </div>
              <div className="statItem">
                <h4>94.5%</h4>
                <p>Resolution Rate</p>
              </div>
              <div className="statItem">
                <h4>12m</h4>
                <p>Avg Response Time</p>
              </div>
              <div className="statItem">
                <h4>{escalationsPending}</h4>
                <p>Pending Escalations</p>
              </div>
              <div className="statItem">
                <h4>4.8</h4>
                <p>Customer Rating</p>
              </div>
            </div>
          </footer>
        </section>
      </div>

      {/* Ticket Details Drawer */}
      <TicketDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        ticket={selectedTicket}
        onUpdate={refetch}
      />
    </div>
  );
};

export default SupportDashboard;
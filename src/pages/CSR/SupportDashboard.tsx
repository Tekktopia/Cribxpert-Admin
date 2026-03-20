// pages/CSR/support/SupportDashboard.tsx
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { useNavigate } from "react-router-dom"; 
import arrow from "@public/svg/arrow-up.svg";
import plus from "@public/svg/plus.svg";
import ticket from "@public/svg/tickets.svg";
import assign from "@public/svg/assigned.svg";
import resolve from "@public/svg/resolved.svg";
import escalate from "@public/svg/escalate.svg";
import { RecentActivity } from "@/features/dashboard/RecentActivity";
import "@/style(nicholas)/style.scss";
import { useState, useMemo } from "react";

interface Ticket {
  id: string;
  ticketId: string;
  user: string;
  subject: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Resolved" | "Escalated" | "Pending";
  created: string;
  dueDate: string;
}

interface ticketFilter {
  category: string;
  priority: string;
  status: string;
}

interface ActivityItem {
  id: string;
  type: "user_verification" | "listing_flagged" | "payout_processed";
  title: string;
  description: string;
  timestamp: string;
  status: "pending" | "completed" | "failed";
}

const SupportDash = () => {
  const navigate = useNavigate(); // Add this

  // Remove these state variables
  // const [selectedComplaintId, setSelectedComplaintId] = useState<string | undefined>();
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [filters, setFilters] = useState<ticketFilter>({
    category: '',
    priority: '',
    status: ''
  });

  const [showAllTickets, setShowAllTickets] = useState(false);

  const isFilterActive = useMemo(() => {
    return filters.category !== '' || filters.priority !== '' || filters.status !== '';
  }, [filters]);

  const ticketsData = useMemo((): Ticket[] => {
    return [
      {
        id: "1",
        ticketId: "100012",
        user: "Tope Akinola",
        subject: "payment failed for booking",
        category: "Payment",
        priority: "High",
        status: "Open",
        created: "2025-02-12",
        dueDate: "2025-02-12",
      },
      {
        id: "2",
        ticketId: "100022",
        user: "Tope Akinola",
        subject: "topsky@gmail.com",
        category: "Booking",
        priority: "Medium",
        status: "Resolved",
        created: "2025-02-12",
        dueDate: "2025-02-12",
      },
      {
        id: "3",
        ticketId: "100023",
        user: "Tope Akinola",
        subject: "topsky@gmail.com",
        category: "Abuse",
        priority: "Low",
        status: "Escalated",
        created: "2025-02-12",
        dueDate: "2025-02-12",
      },
      {
        id: "4",
        ticketId: "100024",
        user: "Ada Johnson",
        subject: "WiFi not working",
        category: "Property Issue",
        priority: "Medium",
        status: "Pending",
        created: "2025-02-13",
        dueDate: "2025-02-15",
      },
      {
        id: "5",
        ticketId: "100025",
        user: "Mike Smith",
        subject: "Late check-in",
        category: "Booking",
        priority: "Low",
        status: "Open",
        created: "2025-02-13",
        dueDate: "2025-02-14",
      },
    ];
  }, []);

  const activitiesData: ActivityItem[] = useMemo(() => [
    {
      id: "1",
      type: "user_verification",
      title: "New Ticket #4523 Assigned To You",
      description: "Payment Issue - Requires immediate attention",
      timestamp: "2 minutes ago",
      status: "pending"
    },
    {
      id: "2",
      type: "listing_flagged",
      title: "Guest Ada Replied To Ticket",
      description: "Ticket #4488 - Guest responded to your query",
      timestamp: "2 minutes ago",
      status: "completed"
    },
    {
      id: "3",
      type: "payout_processed",
      title: "Ticket #4487 Resolved",
      description: "Issue marked as resolved successfully",
      timestamp: "2 minutes ago",
      status: "completed"
    }
  ], []);

  const filteredTickets = useMemo(() => {
    return ticketsData.filter(ticket => {
      return (
        (filters.category === '' || ticket.category.toLowerCase().includes(filters.category.toLowerCase())) &&
        (filters.priority === '' || ticket.priority.toLowerCase() === filters.priority.toLowerCase()) &&
        (filters.status === '' || ticket.status.toLowerCase() === filters.status.toLowerCase())
      );
    });
  }, [ticketsData, filters]);

  const displayedTickets = useMemo(() => {
    if (showAllTickets) {
      return filteredTickets;
    } else {
      return filteredTickets.slice(0, 3);
    }
  }, [filteredTickets, showAllTickets]);

  // Update handleTicketClick to navigate
  const handleTicketClick = (ticket: Ticket) => {
    navigate(`/csr/tickets/${ticket.ticketId}`);
  };

  // Remove handleCloseDrawer
  // const handleCloseDrawer = () => {
  //   setIsDrawerOpen(false);
  //   setSelectedComplaintId(undefined);
  // };

  const handleCheckboxChange = (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    setSelectedTickets(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(ticketId)) {
        newSelected.delete(ticketId);
      } else {
        newSelected.add(ticketId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const ticketsToSelect = showAllTickets 
        ? filteredTickets
        : filteredTickets.slice(0, 3);

      const allTicketIds = ticketsToSelect.map(ticket => ticket.ticketId);
      setSelectedTickets(new Set(allTicketIds));
      setSelectAll(true);
    } else {
      setSelectedTickets(new Set());
      setSelectAll(false);
    }
  };

  const handleFilterChange = (field: keyof ticketFilter, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setSelectAll(false);
    setSelectedTickets(new Set());
    setShowAllTickets(false);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priority: '',
      status: ''
    });
    setSelectedTickets(new Set());
    setSelectAll(false);
    setShowAllTickets(false);
  };

  const handleSeeAllClick = () => {
    setShowAllTickets(!showAllTickets);
    
    if (!showAllTickets) {
      const allTicketIds = filteredTickets.map(ticket => ticket.ticketId);
      const allSelected = allTicketIds.every(id => selectedTickets.has(id));
      setSelectAll(allSelected);
    } else {
      const displayedIds = filteredTickets.slice(0, 3).map(ticket => ticket.ticketId);
      const allSelected = displayedIds.every(id => selectedTickets.has(id));
      setSelectAll(allSelected);
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'badge badge-high';
      case 'medium': return 'badge badge-medium';
      case 'low': return 'badge badge-low';
      default: return 'badge';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'badge badge-open';
      case 'resolved': return 'badge badge-resolved';
      case 'escalated': return 'badge badge-escalated';
      case 'pending': return 'badge badge-pending';
      default: return 'badge';
    }
  };

  const uniqueCategories = [...new Set(ticketsData.map(ticket => ticket.category))];
  const uniquePriorities = [...new Set(ticketsData.map(ticket => ticket.priority))];
  const uniqueStatuses = [...new Set(ticketsData.map(ticket => ticket.status))];

  return (
    <div className="supportDash">
      <Sidebar navigationItems={csrNavigationItems} />
      <div className="main">
        <Topbar/>

        <section className="container">
          <div className="text">
            <span>
              <h1>Support Dashboard</h1>
              <p>Track your workload and manage assigned tickets</p>
            </span>
            <button>
              <img src={plus}/> Create Ticket
            </button>
          </div>
          <div className="top">
            <div className="status">
              <div className="statusItem">
                <div>
                  <p>Open Tickets</p>
                  <h4>30</h4>
                  <p id="cent">
                    <span><img src={arrow} alt="arrow up" /> 12%</span> From yesterday
                  </p>
                </div>
                <span>
                  <img src={ticket} alt="ticket icon" />
                </span>
              </div>
              <div className="statusItem">
                <div>
                  <p>Assigned to me</p>
                  <h4>15</h4>
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
                  <h4>8</h4>
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
                  <h4>7</h4>
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
                      {uniqueCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
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
                      {uniquePriorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
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
                      {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
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
                  <table>
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
                                onChange={() => {}}
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
                          <td colSpan={8}>
                            <span>No tickets found</span>
                          </td>
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
                <RecentActivity activities={activitiesData} />
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
                <h4>300</h4>
                <p>Total Tickets Handled</p>
              </div>
              <div className="statItem">
                <h4>94.5%</h4>
                <p>Resolution Time</p>
              </div>
              <div className="statItem">
                <h4>12m</h4>
                <p>Avg Response Time</p>
              </div>
              <div className="statItem">
                <h4>245</h4>
                <p>Disputes Resolved</p>
              </div>
              <div className="statItem">
                <h4>4.8</h4>
                <p>Customer Rating</p>
              </div>
            </div>
          </footer>
        </section>
      </div>
      
      {/* Remove ComplaintDetailsDrawer */}
      {/* <ComplaintDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        complaintId={selectedComplaintId}
      /> */}
    </div>
  );
};

export default SupportDash;
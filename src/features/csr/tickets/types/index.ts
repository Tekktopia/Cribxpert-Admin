// features/tickets/types/index.ts
export interface Ticket {
  id: string;
  ticketId: string;
  user: string;
  email?: string;
  subject: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Resolved' | 'Escalated' | 'Closed' | 'Pending';
  created: string;
  dueDate?: string;
  assignedTo?: string;
  description?: string;
  conversation?: TicketComment[];
  attachments?: TicketAttachment[];
  sla?: {
    responseTime: string;
    resolutionTarget: string;
    timeRemaining: string;
    percentageUsed: number;
  };
  // Add notes field to match backend response
  notes?: Array<{
    message: string;
    addedBy: string;
    createdAt: string;
  }>;
}

export interface TicketComment {
  id: string;
  author: string;
  role: 'Customer' | 'Support Agent' | 'System';
  content: string;
  timestamp: string;
  isAgent?: boolean;
}

export interface TicketAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document';
  size?: number;
}

export interface TicketFilters {
  category: string;
  priority: string;
  status: string;
  search: string;
  dateFrom?: string;
  dateTo?: string;
}
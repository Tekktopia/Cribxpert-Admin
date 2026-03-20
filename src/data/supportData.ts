
export interface Ticket {
  id: string;
  ticketId: string;
  user: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  subject: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  created: string;
  dueDate: string;
  assignedTo?: string;
  designatedBy?: string;
  bookingId?: string;
  description?: string;
  conversation?: Message[];
}

export interface Message {
  id: string;
  sender: {
    name: string;
    role: "user" | "agent" | "system";
    avatar?: string;
  };
  content: string;
  timestamp: string;
  isAgent?: boolean;
}

export const ticketsData: Ticket[] = [
  {
    id: "1",
    ticketId: "TK-00001",
    user: {
      name: "Topie Akimola",
      email: "topie@gmail.com",
      phone: "+2844867984566"
    },
    subject: "Payment failing for booking",
    category: "Payment Issue",
    priority: "High",
    status: "Open",
    created: "2025-02-12",
    dueDate: "2025-02-12",
    designatedBy: "Ine Adewale",
    bookingId: "#2345",
    description: "User is unable to complete payment for their booking",
    conversation: [
      {
        id: "msg1",
        sender: {
          name: "Topie Akimola",
          role: "user"
        },
        content: "Hello, I tried to make a payment for my booking but it keeps failing. Can you please help?",
        timestamp: "2025-02-10 10:00 AM"
      },
      {
        id: "msg2",
        sender: {
          name: "Ace Imole",
          role: "agent"
        },
        content: "Hi Topie, I understand your payment is failing. Can you please try using a different payment method? Also, please check if your card has sufficient funds.",
        timestamp: "2025-02-10 10:15 AM",
        isAgent: true
      },
      {
        id: "msg3",
        sender: {
          name: "Topie Akimola",
          role: "user"
        },
        content: "I tried with two different cards and both have sufficient funds. The error message says 'Payment processor error'. This is urgent as my booking is tomorrow.",
        timestamp: "2025-02-10 10:30 AM"
      }
    ]
  },
  {
    id: "2",
    ticketId: "TK-00002",
    user: {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1234567890"
    },
    subject: "Booking cancellation request",
    category: "Cancellation",
    priority: "Medium",
    status: "Resolved",
    created: "2025-02-12",
    dueDate: "2025-02-14",
    assignedTo: "You"
  },
  // Add more tickets as needed
];

export const metricsData = {
  openTickets: 30,
  openTicketsChange: "+12%",
  assignedToOne: 15,
  assignedToOneChange: "0%",
  resolvedToday: 8,
  resolvedTodayChange: "0%",
  resolvedByMe: 7,
  resolvedByMeChange: "+12%",
  totalTicketsHandled: 300,
  resolutionTime: "94.5%",
  avgResponseTime: "12m",
  disputesResolved: 245,
  customerRating: 4.8
};

export const recentActivities = [
  {
    id: "act1",
    description: "New Ticket #45325 (Payment Issue) Assigned To You",
    priority: "High",
    timestamp: "2 min ago"
  },
  {
    id: "act2",
    description: "Guest Ada Replied To Ticket #4488",
    priority: "Medium",
    timestamp: "15 min ago"
  },
  {
    id: "act3",
    description: "Ticket #4487 Marked As Resolved",
    priority: "Medium",
    timestamp: "1 hour ago"
  }
];
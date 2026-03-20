// pages/CSR/TicketDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from "@/components/layout";
import { Topbar } from "@/components/layout";
import { csrNavigationItems } from "@/components/layout/csrSidebar";
import { 
  ArrowLeft, 
  Send, 
  Save,
  AlertCircle,
  Clock,
  Calendar,
  Phone,
  Mail,
  BookOpen
} from 'lucide-react';

// Define types locally since we're not importing from supportData
interface Message {
  id: string;
  sender: {
    name: string;
    role: string;
  };
  content: string;
  timestamp: string;
  isAgent?: boolean;
}

interface Ticket {
  id: string;
  ticketId: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  subject: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Resolved" | "Escalated" | "Pending";
  created: string;
  dueDate: string;
  conversation?: Message[];
  bookingId?: string;
  designatedBy?: string;
}

// Mock data directly in the component
const mockTicketsData: Ticket[] = [
  {
    id: "1",
    ticketId: "100012",
    user: {
      name: "Tope Akinola",
      email: "topsky@gmail.com",
      phone: "+2348078940565"
    },
    subject: "payment failed for booking",
    category: "Payment",
    priority: "High",
    status: "Open",
    created: "2025-02-12",
    dueDate: "2025-02-12",
    bookingId: "#12345",
    designatedBy: "Irie Adewale",
    conversation: [
      {
        id: "1",
        sender: { name: "Tope Akinola", role: "user" },
        content: "Hello, I tried to make a payment for my booking but it keeps failing. Can you please help?",
        timestamp: "2024-01-15 00:00 AM",
        isAgent: false
      },
      {
        id: "2",
        sender: { name: "Irie Adewale", role: "agent" },
        content: "Hi Tope, I understand your payment is failing. Can you please try using a different payment method? Also, please check if your card has sufficient funds.",
        timestamp: "2024-01-15 10:23 AM",
        isAgent: true
      }
    ]
  },
  {
    id: "2",
    ticketId: "100022",
    user: {
      name: "Tope Akinola",
      email: "topsky@gmail.com"
    },
    subject: "topsky@gmail.com",
    category: "Booking",
    priority: "Medium",
    status: "Resolved",
    created: "2025-02-12",
    dueDate: "2025-02-12"
  },
  {
    id: "3",
    ticketId: "100023",
    user: {
      name: "Tope Akinola",
      email: "topsky@gmail.com"
    },
    subject: "topsky@gmail.com",
    category: "Abuse",
    priority: "Low",
    status: "Escalated",
    created: "2025-02-12",
    dueDate: "2025-02-12"
  },
  {
    id: "4",
    ticketId: "100024",
    user: {
      name: "Ada Johnson",
      email: "ada@example.com"
    },
    subject: "WiFi not working",
    category: "Property Issue",
    priority: "Medium",
    status: "Pending",
    created: "2025-02-13",
    dueDate: "2025-02-15"
  },
  {
    id: "5",
    ticketId: "100025",
    user: {
      name: "Mike Smith",
      email: "mike@example.com"
    },
    subject: "Late check-in",
    category: "Booking",
    priority: "Low",
    status: "Open",
    created: "2025-02-13",
    dueDate: "2025-02-14"
  }
];

export default function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the ticket by ticketId
    console.log("Looking for ticket with ID:", ticketId);
    const found = mockTicketsData.find(t => t.ticketId === ticketId);
    console.log("Found ticket:", found);
    
    // Simulate loading
    setTimeout(() => {
      setTicket(found || null);
      setLoading(false);
    }, 500);
  }, [ticketId]);

  const handleSendReply = () => {
    if (!reply.trim()) return;
    console.log('Sending reply:', reply);
    setReply('');
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', reply);
  };

  const priorityColors = {
    High: 'text-red-700 bg-red-50',
    Medium: 'text-yellow-700 bg-yellow-50',
    Low: 'text-green-700 bg-green-50'
  };

  const statusColors = {
    Open: 'text-blue-700 bg-blue-50',
    Resolved: 'text-green-700 bg-green-50',
    Escalated: 'text-orange-700 bg-orange-50',
    Pending: 'text-gray-700 bg-gray-50'
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navigationItems={csrNavigationItems} />
        <div>
          <Topbar />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navigationItems={csrNavigationItems} />
        <div >
          <Topbar />
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket Not Found</h3>
            <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/csr/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to CSR Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={csrNavigationItems} />
      <div>
        <Topbar />
        
        <div className="p-8">
          {/* Header with back button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/csr/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{ticket.ticketId}</h1>
                <p className="text-gray-600">{ticket.subject}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[ticket.priority]}`}>
                {ticket.priority}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status]}`}>
                {ticket.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Conversation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Dates */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{ticket.created}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Due:</span>
                    <span className="font-medium">{ticket.dueDate}</span>
                  </div>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversation</h3>
                
                <div className="space-y-6">
                  {ticket.conversation && ticket.conversation.length > 0 ? (
                    ticket.conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isAgent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${message.isAgent ? 'bg-teal-50' : 'bg-gray-50'} rounded-lg p-4`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{message.sender.name}</span>
                            <span className="text-xs text-gray-500">{message.timestamp}</span>
                          </div>
                          <p className="text-gray-700">{message.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No conversations yet</p>
                  )}
                </div>

                {/* Reply Box */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Reply to customer</h4>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your response here..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  />
                  <div className="flex items-center justify-end space-x-3 mt-4">
                    <button
                      onClick={handleSaveDraft}
                      className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Draft</span>
                    </button>
                    <button
                      onClick={handleSendReply}
                      disabled={!reply.trim()}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Requester Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requester Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-semibold">
                        {ticket.user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ticket.user.name}</p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{ticket.user.email}</span>
                    </div>
                    
                    {ticket.user.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{ticket.user.phone}</span>
                      </div>
                    )}
                    
                    {ticket.bookingId && (
                      <div className="flex items-center space-x-3 text-sm">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Booking ID: {ticket.bookingId}</span>
                      </div>
                    )}
                  </div>

                  {ticket.designatedBy && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Designated by</p>
                      <p className="font-medium text-gray-900">{ticket.designatedBy}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                    Assign to someone else
                  </button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                    Change priority
                  </button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg">
                    Mark as resolved
                  </button>
                  <button className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg">
                    Close ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
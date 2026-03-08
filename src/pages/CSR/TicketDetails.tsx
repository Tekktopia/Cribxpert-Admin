// pages/support/TicketDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ticketsData, type Ticket, type Message } from '@/data/supportData';
import { 
  ArrowLeft, 
  Send, 
  Save,
  AlertCircle,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  BookOpen
} from 'lucide-react';

export default function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real app, fetch from API
    const found = ticketsData.find(t => t.ticketId === ticketId);
    setTicket(found || null);
    setLoading(false);
  }, [ticketId]);

  const handleSendReply = () => {
    if (!reply.trim()) return;
    console.log('Sending reply:', reply);
    // In real app, send to API
    setReply('');
  };

  const handleSaveDraft = () => {
    console.log('Saving draft:', reply);
    // Save draft logic
  };

  if (loading) {
    return (
      <PageWrapper title="Ticket Details" subtitle="Loading ticket information...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!ticket) {
    return (
      <PageWrapper title="Ticket Not Found" subtitle="The requested ticket could not be found">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket Not Found</h3>
          <p className="text-gray-600 mb-6">The ticket you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/support')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Support Dashboard
          </button>
        </div>
      </PageWrapper>
    );
  }

  const priorityColors = {
    High: 'text-red-700 bg-red-50',
    Medium: 'text-yellow-700 bg-yellow-50',
    Low: 'text-green-700 bg-green-50'
  };

  const statusColors = {
    Open: 'text-blue-700 bg-blue-50',
    'In Progress': 'text-purple-700 bg-purple-50',
    Resolved: 'text-green-700 bg-green-50',
    Closed: 'text-gray-700 bg-gray-50'
  };

  return (
    <PageWrapper 
      title={`Ticket ${ticket.ticketId}`}
      subtitle="View and manage ticket details"
      showDefaultHeader={false}
      headerComponent={
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/support')}
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
      }
    >
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
              {ticket.conversation?.map((message: Message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isAgent ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.isAgent ? 'bg-primary-50' : 'bg-gray-50'} rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{message.sender.name}</span>
                      <span className="text-xs text-gray-500">{message.timestamp}</span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Reply to customer</h4>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response here..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
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
    </PageWrapper>
  );
}
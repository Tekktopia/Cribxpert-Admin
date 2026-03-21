// pages/CSR/TicketDetails.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
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
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {
  useGetTicketByIdQuery,
  useAddTicketNoteMutation,
  useUpdateTicketStatusMutation,
} from "@/api/features/ticket/ticketApiSlice";

export default function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingNote, setAddingNote] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { data: ticket, isLoading, isError, refetch } = useGetTicketByIdQuery(ticketId || '');
  const [addNote] = useAddTicketNoteMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();

  useEffect(() => {
    if (!isLoading && !isError) {
      setLoading(false);
    }
  }, [isLoading, isError]);

  const handleSendReply = async () => {
    if (!reply.trim() || !ticket) return;
    setAddingNote(true);

    try {
      // 1. Add note to ticket (internal record)
      await addNote({ id: ticketId!, message: reply }).unwrap();

      // 2. Send email to the user via EmailJS
      const templateParams = {
        to_email: ticket.email,
        from_name: 'Cribxpert Support',
        reply_message: reply,
        ticket_id: ticket.ticketId,
        subject: ticket.subject,
        user_name: `${ticket.firstName} ${ticket.lastName}`,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_REPLY_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setReply('');
      refetch(); // refresh ticket data
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
    } catch (error) {
      console.error('Failed to send reply', error);
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    } finally {
      setAddingNote(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`draft_${ticketId}`, reply);
    alert('Draft saved');
  };

  useEffect(() => {
    // Load draft from localStorage if exists
    const draft = localStorage.getItem(`draft_${ticketId}`);
    if (draft) setReply(draft);
  }, [ticketId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticketId) return;
    try {
      await updateStatus({ id: ticketId!, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const priorityColors: Record<string, string> = {
    high: 'text-red-700 bg-red-50',
    medium: 'text-yellow-700 bg-yellow-50',
    low: 'text-green-700 bg-green-50',
    urgent: 'text-red-700 bg-red-50',
  };

  const statusColors: Record<string, string> = {
    pending: 'text-blue-700 bg-blue-50',
    'in-progress': 'text-blue-700 bg-blue-50',
    resolved: 'text-green-700 bg-green-50',
    closed: 'text-gray-700 bg-gray-50',
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navigationItems={csrNavigationItems} />
        <div className="flex-1">
          <Topbar />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navigationItems={csrNavigationItems} />
        <div className="flex-1">
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
      <div className="flex-1">
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
                {ticket.priority.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[ticket.status]}`}>
                {ticket.status === 'in-progress' ? 'In Progress' : ticket.status.toUpperCase()}
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
                    <span className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Last updated:</span>
                    <span className="font-medium">{new Date(ticket.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversation</h3>

                <div className="space-y-4">
                  {/* Initial message from customer */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {ticket.firstName} {ticket.lastName}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                  </div>

                  {/* Notes / Replies */}
                  {ticket.notes && ticket.notes.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Replies</h4>
                      {ticket.notes.map((note, idx) => (
                        <div key={idx} className="flex justify-start mb-4">
                          <div className="max-w-[80%] bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-blue-900">{note.addedBy}</span>
                              <span className="text-xs text-blue-600">{new Date(note.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{note.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reply Box */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Reply to customer</h4>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your response here. This will be sent to the customer's email and recorded in the ticket."
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
                      disabled={!reply.trim() || addingNote}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{addingNote ? 'Sending...' : 'Send Reply'}</span>
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
                        {ticket.firstName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ticket.firstName} {ticket.lastName}</p>
                      <p className="text-sm text-gray-500">Customer</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 break-all">{ticket.email}</span>
                    </div>
                    {ticket.phone && (
                      <div className="flex items-center space-x-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{ticket.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleStatusUpdate('in-progress')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Mark as In Progress
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('resolved')}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('closed')}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Close Ticket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">Reply sent successfully to {ticket.email}</p>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">Failed to send reply. Please try again.</p>
          </div>
        </div>
      )}
    </div>
  );
}
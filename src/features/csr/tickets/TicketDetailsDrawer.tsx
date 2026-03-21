import { X, Send, Save, Calendar, Clock, CheckCircle, XCircle, MessageSquare, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { useAddTicketNoteMutation, useUpdateTicketStatusMutation } from '@/api/features/ticket/ticketApiSlice';
import { type Ticket } from '@/features/csr/tickets/types';

interface TicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onUpdate?: () => void;
}

interface ExtendedNote {
  message: string;
  addedBy: string;
  createdAt: string;
  type?: 'reply' | 'note';
}

export function TicketDetailsDrawer({ isOpen, onClose, ticket, onUpdate }: TicketDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'notes'>('messages');
  const [reply, setReply] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [addingReply, setAddingReply] = useState(false);
  const [addingNote, setAddingNote] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [addNote] = useAddTicketNoteMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();

  useEffect(() => {
    if (ticket?.ticketId) {
      const draft = localStorage.getItem(`draft_${ticket.ticketId}`);
      if (draft) setReply(draft);
    }
  }, [ticket]);

  if (!isOpen || !ticket) return null;

  const handleSendReply = async () => {
    if (!reply.trim()) return;
    setAddingReply(true);

    try {
      await addNote({ id: ticket.id, message: reply, type: 'reply' } as any).unwrap();

      const templateParams = {
        to_email: ticket.email,
        from_name: 'Cribxpert Support',
        reply_message: reply,
        ticket_id: ticket.ticketId,
        subject: ticket.subject,
        user_name: ticket.user,
      };

      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID, // Use your existing template
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      setReply('');
      localStorage.removeItem(`draft_${ticket.ticketId}`);
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to send reply', error);
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    } finally {
      setAddingReply(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`draft_${ticket.ticketId}`, reply);
    alert('Draft saved');
  };

  const handleAddInternalNote = async () => {
    if (!internalNote.trim()) return;
    setAddingNote(true);

    try {
      await addNote({ id: ticket.id, message: internalNote, type: 'note' } as any).unwrap();
      setInternalNote('');
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to add internal note', error);
      setShowErrorModal(true);
      setTimeout(() => setShowErrorModal(false), 3000);
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await updateStatus({ id: ticket.id, status: newStatus }).unwrap();
      onUpdate?.();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Escalated': return 'bg-orange-100 text-orange-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const notes = (ticket.notes as ExtendedNote[]) || [];
  const messages = notes.filter(n => (n.type === 'reply') || (!n.type && true));
  const internalNotes = notes.filter(n => n.type === 'note');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-xl font-semibold text-gray-900">{ticket.subject}</h2>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
              </div>
              <p className="text-sm text-gray-500">Ticket ID: {ticket.ticketId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Customer Information */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Customer</p>
              <p className="text-sm font-medium">{ticket.user}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm break-all">{ticket.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm">{ticket.created}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm">{ticket.category}</p>
            </div>
          </div>

          {/* Date/Time row */}
          <div className="mb-6 bg-gray-50 rounded-lg p-3 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Created: {ticket.created}</span>
            </div>
            {ticket.dueDate && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Due: {ticket.dueDate}</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('messages')}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'messages'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Messages
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 text-sm font-medium transition-colors relative ${
                  activeTab === 'notes'
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Internal Notes
              </button>
            </div>
          </div>

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {/* Original message */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{ticket.user}</span>
                    <span className="text-xs text-gray-500">{ticket.created}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.subject}</p>
                </div>

                {/* Replies (messages) */}
                {messages.map((note, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-blue-900">{note.addedBy}</span>
                      <span className="text-xs text-blue-600">{new Date(note.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.message}</p>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Reply to customer</h4>
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your response here. This will be sent to the customer's email and recorded in the conversation."
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
                    disabled={!reply.trim() || addingReply}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{addingReply ? 'Sending...' : 'Send Reply'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {internalNotes.length > 0 ? (
                  internalNotes.map((note, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{note.addedBy}</span>
                        <span className="text-xs text-gray-500">{new Date(note.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No internal notes yet.</p>
                )}
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Add internal note</h4>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Add a note for internal reference (only visible to CSR)."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAddInternalNote}
                    disabled={!internalNote.trim() || addingNote}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={() => handleStatusUpdate('in-progress')}
              className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              Mark In Progress
            </button>
            <button
              onClick={() => handleStatusUpdate('resolved')}
              className="px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50"
            >
              Mark Resolved
            </button>
            <button
              onClick={() => handleStatusUpdate('closed')}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              Close Ticket
            </button>
          </div>
        </div>
      </div>

      {/* Success/Error Modals */}
      {showSuccessModal && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">Message sent successfully to {ticket.email}</p>
          </div>
        </div>
      )}
      {showErrorModal && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <XCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">Failed to send message. Please try again.</p>
          </div>
        </div>
      )}
    </div>
  );
}
// src/features/csr/tickets/TicketDetailsDrawer.tsx
import { X, Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAddTicketNoteMutation } from '@/api/features/ticket/ticketApiSlice';
import { type Ticket } from '@/features/csr/tickets/types';

interface TicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

export function TicketDetailsDrawer({ isOpen, onClose, ticket }: TicketDetailsDrawerProps) {
  const [addNote, { isLoading }] = useAddTicketNoteMutation();
  const [newNote, setNewNote] = useState('');

  if (!isOpen || !ticket) return null;

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await addNote({ id: ticket.id, message: newNote }).unwrap();
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note', error);
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
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="text-sm font-medium">{ticket.user}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm">{ticket.email}</p>
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
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">{ticket.subject}</p>
          </div>

          {/* Notes / Conversation */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity & Comments</h3>
            <div className="space-y-4">
              {ticket.notes?.map((note, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{note.addedBy}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.message}</p>
                </div>
              ))}
              {(!ticket.notes || ticket.notes.length === 0) && (
                <p className="text-gray-500 text-sm">No comments yet.</p>
              )}
            </div>
          </div>

          {/* Add Note */}
          <div className="mb-8">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a comment/update..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim() || isLoading}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Add Comment
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50">
              Escalate
            </button>
            <button className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
              Edit Ticket
            </button>
            <button className="px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50">
              Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
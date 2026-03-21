// pages/CSR/tickets/components/ResolveModal.tsx
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useUpdateTicketStatusMutation } from '@/api/features/ticket/ticketApiSlice';
import { type Ticket } from '@/features/csr/tickets/types';

interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export function ResolveModal({ isOpen, onClose, ticket }: ResolveModalProps) {
  const [updateStatus, { isLoading }] = useUpdateTicketStatusMutation();
  const [resolutionNote, setResolutionNote] = useState('');

  const handleResolve = async () => {
    try {
      await updateStatus({ id: ticket.id, status: 'resolved' }).unwrap();
      // Optionally, add a note with the resolution message
      // You could call addTicketNote here if you want to attach the note.
      onClose();
    } catch (error) {
      console.error('Failed to resolve ticket', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Mark Ticket as Resolved</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">Ticket ID: {ticket.ticketId}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution Notes (optional)
            </label>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Add a note about how this was resolved..."
            />
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">
              This ticket will be marked as resolved. The customer will be notified.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
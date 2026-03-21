// pages/CSR/tickets/components/EditTicketModal.tsx
import { X, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useUpdateTicketStatusMutation } from '@/api/features/ticket/ticketApiSlice';
import { type Ticket } from '@/features/csr/tickets/types';

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket;
}

export function EditTicketModal({ isOpen, onClose, ticket }: EditTicketModalProps) {
  const [updateStatus, { isLoading }] = useUpdateTicketStatusMutation();
  const [priority, setPriority] = useState(ticket.priority);
  const [status, setStatus] = useState(ticket.status);

  const handleSave = async () => {
    try {
      await updateStatus({
        id: ticket.id,
        status: status.toLowerCase(),
        // Note: priority mapping from UI to backend needs translation
        // For now, we only update status. Extend as needed.
      }).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to update ticket', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Edit Ticket</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-500">Ticket ID: {ticket.ticketId}</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              defaultValue={ticket.subject}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Ticket['priority'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Ticket['status'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
                <option value="Escalated">Escalated</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={4}
              defaultValue={ticket.subject}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              disabled
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
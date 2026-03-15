// pages/CSR/tickets/components/EditTicketModal.tsx
import { X } from 'lucide-react';
import { type Ticket } from '@/features/csr/tickets/types';

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket; // Replace 'any' with your Ticket type
}

export function EditTicketModal({ isOpen, onClose, ticket }: EditTicketModalProps) {
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select defaultValue={ticket.category} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Select Category</option>
                <option>Payment</option>
                <option>Booking</option>
                <option>Abuse</option>
                <option>Tech</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select defaultValue={ticket.priority} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select defaultValue={ticket.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Open</option>
                <option>Resolved</option>
                <option>Escalated</option>
                <option>Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option>Unassigned</option>
                <option>Sarah Johnson</option>
                <option>Mike Afolabi</option>
                <option>Irie Adewale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              rows={4}
              defaultValue={ticket.subject}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Provide details of the issue."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Changes will be saved and a notification will be added to the ticket activity log. 
              The customer will be notified if there are significant changes to priority or status.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
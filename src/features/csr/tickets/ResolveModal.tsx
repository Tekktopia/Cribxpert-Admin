// pages/CSR/tickets/components/ResolveModal.tsx
import { X, CheckCircle } from 'lucide-react';
import { type Ticket } from '@/features/csr/tickets/types';
interface ResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket; // Replace 'any' with your Ticket type
}

export function ResolveModal({ isOpen, onClose, ticket }: ResolveModalProps) {
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
              Resolution Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Select resolution type</option>
              <option>Issue Fixed</option>
              <option>Customer Satisfied</option>
              <option>Refund Processed</option>
              <option>Information Provided</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution Notes
            </label>
            <textarea 
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Provide detailed explanation of how the issue was resolved..."
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Notify customer about resolution</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-gray-700">Schedule follow-up with customer</span>
            </label>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800">
              This ticket will be marked as resolved and moved to the resolved queue. The customer will be automatically notified.
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
          <button className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
            Mark as Resolved
          </button>
        </div>
      </div>
    </div>
  );
}
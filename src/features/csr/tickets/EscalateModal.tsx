// pages/CSR/tickets/components/EscalateModal.tsx
import { X, AlertTriangle } from 'lucide-react';
import { type Ticket } from '@/features/csr/tickets/types';
interface EscalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket; // Replace 'any' with your Ticket type
}

export function EscalateModal({ isOpen, onClose, ticket }: EscalateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Escalate Ticket</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escalation Level
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option>Select escalation level</option>
              <option>Level 1 - Supervisor</option>
              <option>Level 2 - Manager</option>
              <option>Level 3 - Finance Team</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escalation Reason
            </label>
            <textarea 
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Provide detailed reason for escalation..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              This ticket will be marked as high priority and escalated immediately.
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
          <button className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Escalate Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
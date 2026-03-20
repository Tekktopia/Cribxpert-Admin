// pages/CSR/tickets/components/SuccessModal.tsx
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  action: 'escalated' | 'resolved';
}

export function SuccessModal({ isOpen, onClose, ticketId, action }: SuccessModalProps) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const messages = {
    escalated: {
      title: 'Ticket Escalated Successfully',
      message: `Ticket #${ticketId} has been escalated. You can now view its progress under escalated tickets.`
    },
    resolved: {
      title: 'Ticket Resolved Successfully',
      message: `Ticket #${ticketId} has been marked as resolved. You can view it under resolved tickets.`
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{messages[action].title}</h2>
          <p className="text-sm text-gray-600 mb-6">{messages[action].message}</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Back
            </button>
            <button 
              onClick={() => {
                onClose();
                navigate(`/csr/tickets/${ticketId}`);
              }}
              className="flex-1 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              View Ticket Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
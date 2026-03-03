import type { Transaction } from "@/data/financeAdminData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Timeline } from "@/components/ui/Timeline";

// 1. DEFINE A UNIFIED TYPE
// This extends your base Transaction type to include fields from your other data sources
// like 'guestName' or 'hostName' so TypeScript knows they might exist.
type ModalTransactionItem = Transaction & {
  guestName?: string;
  hostName?: string;
  timeline?: Array<{ label: string; time: string; isCompleted: boolean }>;
};

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 2. USE THE SPECIFIC TYPE (No more 'any')
  item: ModalTransactionItem | null; 
}

export function DetailsModal({ isOpen, onClose, item }: DetailsModalProps) {
  if (!isOpen || !item) return null;

  // 3. SAFE DATA ACCESS
  // Now TypeScript knows 'transactionId' and 'guestName' are valid optional properties
  const displayId = item.transactionId || item.id || "N/A";

  const userName = item.user?.name || item.guestName || item.hostName;
  const displayTitle = userName 
    ? `${item.type} for ${userName}` 
    : item.id;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold text-gray-900">Details</h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-y-8 gap-x-4">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction ID</p>
            <p className="text-sm font-semibold">{displayId}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
            <StatusBadge status={item.status} />
          </div>
          <div className="col-span-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">User/Description</p>
            <p className="text-sm font-semibold">{displayTitle}</p>
          </div>
        </div>

        {/* Timeline Section */}
        {item.timeline && (
          <div className="mt-10 pt-10 border-t border-gray-100">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Timeline</h4>
            <Timeline steps={item.timeline} />
          </div>
        )}

        <div className="mt-12 flex gap-3">
          <button className="flex-1 bg-teal-700 text-white py-3 rounded-lg font-bold text-sm">Download Receipt</button>
          <button onClick={onClose} className="flex-1 border border-gray-200 py-3 rounded-lg font-bold text-sm text-gray-600">Close</button>
        </div>
      </div>
    </div>
  );
}
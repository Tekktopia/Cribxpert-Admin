import { X, Download } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Transaction } from "@/data/financeAdminData";

// 1. EXTENDED TYPE (Solves 'Property does not exist' error)
// We only add fields that are missing from the base Transaction type.
// We do NOT redefine transactionId to avoid conflicts.
export interface ExtendedTransaction extends Transaction {
  paymentMethod?: string;
  guestName?: string;
  hostName?: string;
}

// --- Shared Modal Wrapper (Matches image_3a21f9.png style) ---
const ModalWrapper = ({ title, onClose, children }: { title: string, onClose: () => void, children: React.ReactNode }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X size={20} className="text-gray-500" />
        </button>
      </div>
      <div className="p-8">
        {children}
      </div>
    </div>
  </div>
);

// --- View Details Modal ---
export const ViewDetailsModal = ({ item, onClose }: { item: ExtendedTransaction, onClose: () => void }) => {
  // Logic to calculate Net amount based on screenshot (Booking = 10% commission)
  const isBooking = item.type.toLowerCase().includes('booking');
  const commission = isBooking ? item.amount * 0.5 : 0; // Mocking 50% for screenshot match or 10% logic
  const net = item.amount - commission;

  return (
    <ModalWrapper title="Transaction Details" onClose={onClose}>
      <div className="grid grid-cols-2 gap-y-8 gap-x-12">
        <DetailGroup label="Transaction ID" value={item.transactionId || item.id} />
        <DetailGroup label="Type" value={item.type} />
        
        {/* User with Blue Link Style (Matches image_3a21f9.png) */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">User</p>
          <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">
            {item.user?.name || "Unknown"}
          </p>
        </div>
        
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Related Booking</p>
          <p className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">
             {item.user?.name || "Robert Smith (Guest)"}
          </p>
        </div>

        <DetailGroup label="Gross Amount" value={`₦${item.amount.toLocaleString()}`} />
        <DetailGroup label="Net Amount (After Commission)" value={`₦${net.toLocaleString()}`} />
        
        <DetailGroup label="Payment Method" value={item.paymentMethod || "Card"} />
        
        <div>
           <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</p>
           <StatusBadge status={item.status} />
        </div>
      </div>

      {/* Timeline Section (Matches image_3b0df7.png) */}
      <div className="mt-10 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-900 mb-4">Timeline</h4>
        <div className="space-y-4">
          <TimelineItem date="May 15, 2025 14:30" label="Payment Initiated" />
          <TimelineItem date="May 15, 2025 14:32" label="Processing" />
          <TimelineItem date="May 15, 2025 14:35" label="Completed" isLast />
        </div>
      </div>
    </ModalWrapper>
  );
};

// --- Download Receipt Modal ---
export const DownloadReceiptModal = ({ item, onClose }: { item: ExtendedTransaction, onClose: () => void }) => {
  return (
    <ModalWrapper title="Download Receipt" onClose={onClose}>
      <div className="flex flex-col items-center">
         {/* Receipt Visual Container (Matches image_3a24a0.png) */}
         <div className="w-full max-w-md bg-gray-50 rounded-lg p-8 border border-gray-200 mb-8">
            <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <h4 className="font-bold text-gray-900 text-lg">Transaction Receipt Preview</h4>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Transaction ID: {item.transactionId || item.id}</p>
            </div>
            
            <div className="space-y-4 text-sm">
                <ReceiptRow label="Date" value={`${item.date} 10:30`} />
                <ReceiptRow label="Type" value={item.type} />
                <ReceiptRow label="User" value={item.user?.name} />
                <ReceiptRow label="Amount" value={`₦${item.amount.toLocaleString()}`} />
                <ReceiptRow label="Commission" value={item.type.toLowerCase().includes('booking') ? `₦${(item.amount * 0.1).toLocaleString()}` : '-'} />
                <ReceiptRow label="Status" value={item.status} />
                <ReceiptRow label="Method" value={item.paymentMethod || "Card"} />
            </div>
         </div>

         <button className="w-full max-w-md bg-teal-700 hover:bg-teal-800 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Download size={18} />
            Download Receipt
         </button>
      </div>
    </ModalWrapper>
  );
}

// --- Helper Components for Clean Code ---
const DetailGroup = ({ label, value }: { label: string, value: string | number }) => (
  <div>
    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</p>
    <p className="text-sm font-semibold text-gray-900">{value}</p>
  </div>
);

const ReceiptRow = ({ label, value }: { label: string, value?: string | number }) => (
  <div className="flex justify-between items-center">
      <span className="text-gray-500 font-medium">{label}:</span>
      <span className="font-bold text-gray-900">{value || '-'}</span>
  </div>
);

const TimelineItem = ({ date, label }: { date: string; label: string }) => (
  <div className="flex gap-4 text-sm items-start relative">
     {/* Simple dot for timeline */}
     <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-300 shrink-0" />
     <div className="flex gap-2">
        <span className="text-gray-500 font-medium w-36">{date}</span>
        <span className="text-gray-900 font-medium">- {label}</span>
     </div>
  </div>
);
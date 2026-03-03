import { X } from "lucide-react";
import type { Transaction } from "@/data/financeAdminData";

// Local Type Extension to support Payout specific fields
export interface PayoutTransaction extends Transaction {
  relatedBookingId?: string;
  scheduledDate?: string;
  payoutStatus?: "Approved" | "Paid" | "Pending" | "Failed";
  // Mock fields for UI match
  bankDetails?: string;
  hostEmail?: string;
  propertyName?: string;
}

interface PayoutDetailsModalProps {
  item: PayoutTransaction;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onMarkPaid: () => void;
}

export const PayoutDetailsModal = ({ item, onClose,onReject, onApprove,onMarkPaid }: PayoutDetailsModalProps) => {
  // --- MOCK DATA CALCULATIONS (To match screenshot logic) ---
  const bookingAmount = item.amount; // Assuming item.amount is the gross booking amount
  const commission = bookingAmount * 0.05; // 5% Commission mock
  const finalPayout = bookingAmount - commission;
  
  // Status Badge Logic specifically for this modal
  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
        case 'approved': return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case 'paid': return "bg-teal-50 text-teal-700 border-teal-100";
        case 'failed': return "bg-red-50 text-red-600 border-red-100";
        default: return "bg-amber-50 text-amber-600 border-amber-100"; // Pending
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Payout Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="p-8 overflow-y-auto">
          
          {/* TOP GRID: Host & Payout Info */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-8">
            {/* Column 1: Host Info */}
            <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900">Host Information</h4>
                
                <DetailRow label="Name">
                    <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                        {item.user?.name || "Robert Smith"}
                    </span>
                </DetailRow>
                
                <DetailRow label="Email" value={item.hostEmail || "robert.smith@gmail.com"} />
                <DetailRow label="Bank Details" value={item.bankDetails || "GTBank - 2884775689"} />
            </div>

            {/* Column 2: Payout Info */}
            <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900">Payout Information</h4>
                
                <DetailRow label="Payout ID" value={item.transactionId || "100012"} />
                
                <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getStatusStyle(item.payoutStatus || 'Pending')}`}>
                        {item.payoutStatus || 'Pending'}
                    </span>
                </div>

                <DetailRow label="Scheduled Date" value={item.scheduledDate || "September 08, 2025"} />
            </div>
          </div>

          {/* MIDDLE: Linked Bookings Card */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Linked Bookings</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-blue-600 cursor-pointer hover:underline">
                        {item.user?.name || "Robert Smith"} (Guest)
                    </span>
                    <span className="text-sm text-gray-500">#{item.amount.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-500">
                    Downtown Apartment - Lagos Island (September 01- 05, 2025)
                </p>
            </div>
          </div>

          {/* BOTTOM: Payment Breakdown */}
          <div className="space-y-3 pt-4 border-t border-gray-50">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Payment Breakdown</h4>
            
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Booking Amount</span>
                <span className="font-medium text-gray-900">₦{bookingAmount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Platform Commission</span>
                <span className="font-medium text-red-500">-₦{commission.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-base mt-2 pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-900">Final Payout Amount</span>
                <span className="font-bold text-emerald-600">₦{finalPayout.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* FOOTER: Action Buttons */}
        {/* FOOTER: Now Interactive */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 grid grid-cols-3 gap-4">
            <button 
                onClick={onApprove} // <--- Wire up click
                className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-lg transition-colors border border-emerald-100"
            >
                Approve Payout
            </button>
            <button 
                onClick={onReject} // <--- Wire up click
                className="py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-lg transition-colors border border-red-100"
            >
                Reject Payout
            </button>
            <button 
                onClick={onMarkPaid} // <--- Wire up click
                className="py-2.5 px-4 bg-white hover:bg-gray-50 text-teal-700 font-bold text-sm rounded-lg transition-colors border border-teal-200"
            >
                Mark as Paid
            </button>
        </div>
      </div>
    </div>
  );
};

// Helper for clean key-value rows
const DetailRow = ({ label, value, children }: { label: string, value?: string, children?: React.ReactNode }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    {children ? children : <p className="text-sm font-medium text-gray-900">{value}</p>}
  </div>
);
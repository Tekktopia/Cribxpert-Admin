import { X } from "lucide-react";
import type { Transaction } from "@/data/financeAdminData";

// Extended Type for Refund-specific data
export interface RefundTransaction extends Transaction {
  bookingId?: string;
  phone?: string;
  reason?: string;
  reasonDetails?: string;
  propertyName?: string;
  checkIn?: string;
  checkOut?: string;
  hostName?: string;
  attachments?: string[];
  refundStatus?: "Approved" | "Pending" | "Failed"; 
}

interface RefundDetailsModalProps {
  item: RefundTransaction;
  onClose: () => void;
  onApprove: () => void;
  onDecline: () => void;
}

export const RefundDetailsModal = ({ item, onClose, onApprove, onDecline }: RefundDetailsModalProps) => {
  
  const getStatusStyle = (status: string) => {
    switch(status?.toLowerCase()) {
        case 'approved': return "bg-emerald-50 text-emerald-600 border-emerald-100";
        case 'failed': return "bg-red-50 text-red-600 border-red-100";
        default: return "bg-amber-50 text-amber-600 border-amber-100"; // Pending
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        
        {/* HEADER */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Refund Details</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-8 overflow-y-auto">
          
          {/* TOP GRID */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 mb-8">
            <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900">Guest Information</h4>
                <DetailRow label="Name">
                     <span className="text-blue-600 font-medium cursor-pointer hover:underline">{item.user?.name}</span>
                </DetailRow>
                <DetailRow label="Email" value="sarahjohnson@gmail.com" /> {/* Mocked */}
                <DetailRow label="Phone" value={item.phone || "+234 7056734217"} />
            </div>

            <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-900">Refund Information</h4>
                <DetailRow label="Refund ID" value={item.transactionId || item.id} />
                <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getStatusStyle(item.refundStatus || 'Pending')}`}>
                        {item.refundStatus || 'Pending'}
                    </span>
                </div>
                <DetailRow label="Amount Requested" value={`₦${item.amount.toLocaleString()}`} />
            </div>
          </div>

          {/* BOOKING INFO BOX */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Booking Information</h4>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-2">
                <div className="flex gap-2 text-sm">
                    <span className="font-bold text-gray-700 w-24">Booking ID:</span>
                    <span className="text-blue-600 font-medium cursor-pointer hover:underline">{item.bookingId || "100012"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                    <span className="font-bold text-gray-700 w-24">Property:</span>
                    <span className="text-gray-600">{item.propertyName || "Downtown Apartment"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                    <span className="font-bold text-gray-700 w-24">Check-in:</span>
                    <span className="text-gray-600">{item.checkIn || "Sep 08, 2025"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                    <span className="font-bold text-gray-700 w-24">Check-out:</span>
                    <span className="text-gray-600">{item.checkOut || "Sep 10, 2025"}</span>
                </div>
                <div className="flex gap-2 text-sm">
                    <span className="font-bold text-gray-700 w-24">Host:</span>
                    <span className="text-blue-600 font-medium cursor-pointer hover:underline">{item.hostName || "Robert Smith"}</span>
                </div>
            </div>
          </div>

          {/* REFUND REASON BOX */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Refund Reason</h4>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-3">
                <div className="text-sm">
                    <span className="font-bold text-gray-700">Reason: </span>
                    <span className="text-gray-600">{item.reason || "Property not as described"}</span>
                </div>
                <div className="text-sm">
                    <span className="font-bold text-gray-700">Details: </span>
                    <span className="text-gray-600">{item.reasonDetails || "The apartment was smaller than advertised and lacked basic amenities mentioned in the listing."}</span>
                </div>
                <div className="text-sm flex gap-2 items-center">
                    <span className="font-bold text-gray-700">Attachments: </span>
                    <div className="flex gap-2">
                         <span className="text-blue-600 underline cursor-pointer hover:text-blue-800 text-xs">photo 1.jpg</span>
                         <span className="text-blue-600 underline cursor-pointer hover:text-blue-800 text-xs">photo 2.jpg</span>
                    </div>
                </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="mt-6 pt-4 border-t border-gray-50">
             <h4 className="text-sm font-bold text-gray-900 mb-3">Timeline</h4>
             <div className="space-y-2 text-xs text-gray-500">
                <p>Sep 08, 2025 14:30 - Checked-In</p>
                <p>Sep 08, 2025 14:32 - Complaint Filed</p>
                <p>Sep 09, 2025 14:35 - Refund Requested</p>
             </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex gap-4">
            <button onClick={onApprove} className="px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-lg border border-emerald-100 transition-colors">
                Approve Refund
            </button>
            <button onClick={onDecline} className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm rounded-lg border border-red-100 transition-colors">
                Decline Refund
            </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value, children }: { label: string, value?: string, children?: React.ReactNode }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    {children ? children : <p className="text-sm font-medium text-gray-900">{value}</p>}
  </div>
);
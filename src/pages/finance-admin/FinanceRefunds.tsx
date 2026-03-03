import { useState, useMemo, useEffect } from "react";
import {
  ChevronDown,
  MoreVertical,
  Search,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { financeData } from "@/data/financeAdminData";
import {
  RefundDetailsModal,
  type RefundTransaction,
} from "@/features/finance-admin/RefundDetailsModal";
import {
  NotificationToast,
  type NotificationProps,
} from "@/components/ui/NotificationToast";

export default function FinanceRefunds() {
  // --- STATE ---
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundTransaction | null>(null);
  const [notification, setNotification] = useState<NotificationProps | null>(null);
  
  // NEW: State for Month Dropdown
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState("This Month");

  const [filters, setFilters] = useState({
    status: "All Status",
    date: "",
    guestSearch: ""
  });

  // Close menus on click outside
  useEffect(() => {
    const closeMenu = () => {
        setActiveActionId(null);
        setIsMonthMenuOpen(false); // Close month menu too
    };
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // --- ACTIONS ---
  const handleApprove = () => {
    setSelectedRefund(null);
    setNotification({
        id: Date.now().toString(),
        type: "success",
        title: "Refund approved successfully",
        message: "The guest has been notified and funds released.",
    });
  };

  const handleDecline = () => {
    setSelectedRefund(null);
    setNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Refund Declined",
        message: "The request has been rejected.",
    });
  };

  // --- DATA LOGIC ---
  const refundsData = useMemo(() => {
    // Filter only refunds from the main dataset
    const raw = financeData.recentTransactions.filter(t => t.type.toLowerCase() === 'refund');
    
    // Map to RefundTransaction (Mocking missing fields to match UI)
    const enhanced: RefundTransaction[] = raw.map(t => ({
        ...t,
        bookingId: `1000${t.id.slice(-2)}`,
        reason: "Property not as described, plumbing issues", 
        refundStatus: t.status.toLowerCase() === 'completed' ? 'Approved' : t.status.toLowerCase() === 'pending' ? 'Pending' : 'Failed'
    }));

    // Apply Filters
    return enhanced.filter(r => {
        const matchStatus = filters.status === "All Status" || r.refundStatus === filters.status;
        const matchGuest = r.user.name.toLowerCase().includes(filters.guestSearch.toLowerCase());
        return matchStatus && matchGuest;
    });
  }, [filters]);

  return (
    <PageWrapper
      title="Refunds"
      subtitle="Review, approve and issue refunds to guests after disputes or cancellation"
      isPopulated={true}
      showDefaultHeader={false}
      headerComponent={
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Review, approve and issue refunds to guests after disputes or cancellation
                </p>
            </div>
            
            {/* FIX: Interactive Month Dropdown */}
            <div className="relative">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMonthMenuOpen(!isMonthMenuOpen);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                    {currentPeriod}
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isMonthMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMonthMenuOpen && (
                    <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {["This Month", "Last Month", "This Year", "All Time"].map((period) => (
                            <button
                                key={period}
                                onClick={() => {
                                    setCurrentPeriod(period);
                                    setIsMonthMenuOpen(false);
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-700 transition-colors"
                            >
                                {period}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      }
    >
      {/* TOAST NOTIFICATION */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {notification && (
            <NotificationToast
                key={notification.id}
                id={notification.id}
                type={notification.type}
                title={notification.title}
                message={notification.message}
                isVisible={!!notification}
                onRemove={() => setNotification(null)}
            />
        )}
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-end">
        {/* Status */}
        <div className="md:col-span-3 flex flex-col gap-2">
             <label className="text-xs font-bold text-gray-900">Status</label>
             <div className="relative">
                <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                    {["All Status", "Approved", "Pending", "Failed"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
             </div>
        </div>

        {/* Date */}
        <div className="md:col-span-4 flex flex-col gap-2">
             <label className="text-xs font-bold text-gray-900">Date Range</label>
             <div className="relative">
                <input 
                    type="date"
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-teal-500 cursor-pointer appearance-none"
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none bg-white" />
             </div>
        </div>

        {/* Guest Search */}
        <div className="md:col-span-5 flex flex-col gap-2">
             <label className="text-xs font-bold text-gray-900">Guest</label>
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search guest"
                    value={filters.guestSearch}
                    onChange={(e) => setFilters({...filters, guestSearch: e.target.value})}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-teal-500 placeholder:text-gray-400"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm min-h-[500px] overflow-x-auto scrollbar-thin-x">
         <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white border-b border-gray-100">
                <tr>
                    <Th className="min-w-[100px]">Refund ID</Th>
                    <Th className="min-w-[120px]">Guest Name</Th>
                    <Th className="min-w-[90px]">Bookings ID</Th>
                    <Th className="min-w-[120px]">Amount Requested</Th>
                    <Th className="min-w-[200px]">Reason</Th>
                    <Th className="min-w-[90px]">Status</Th>
                    <Th align="center" className="bg-white min-w-[88px]">Actions</Th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
                {refundsData.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors bg-white">
                        <Td className="font-medium text-gray-900 min-w-[100px]">{r.transactionId || r.id}</Td>
                        <Td className="min-w-[120px]">{r.user.name}</Td>
                        <Td className="text-gray-500 min-w-[90px]">{r.bookingId}</Td>
                        <Td className="font-medium min-w-[120px]">₦{r.amount.toLocaleString()}</Td>
                        <Td className="min-w-[200px] max-w-[320px] text-gray-500 whitespace-normal align-top">
                            <span className="line-clamp-2" title={r.reason}>{r.reason}</span>
                        </Td>
                        <Td className="min-w-[90px]"><RefundStatusBadge status={r.refundStatus} /></Td>
                        <td className="px-6 py-4 text-center relative bg-white min-w-[88px]">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveActionId(activeActionId === r.id ? null : r.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 inline-flex items-center justify-center transition-colors"
                            >
                                <MoreVertical size={16} />
                            </button>
                            
                            {activeActionId === r.id && (
                                <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                                    <button 
                                        onClick={() => { setSelectedRefund(r); setActiveActionId(null); }}
                                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                    >
                                        <Eye size={16} className="text-gray-400" /> View Details
                                    </button>
                                    <button 
                                        onClick={handleApprove}
                                        className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2 border-t border-gray-50"
                                    >
                                        <CheckCircle size={16} className="text-green-500" /> Approve
                                    </button>
                                    <button 
                                        onClick={handleDecline}
                                        className="w-full px-4 py-3 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                                    >
                                        <XCircle size={16} className="text-red-500" /> Decline
                                    </button>
                                </div>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
         </table>
         {refundsData.length === 0 && <div className="p-12 text-center text-gray-500">No refunds found.</div>}
      </div>

      {/* MODAL */}
      {selectedRefund && (
        <RefundDetailsModal 
            item={selectedRefund} 
            onClose={() => setSelectedRefund(null)} 
            onApprove={handleApprove}
            onDecline={handleDecline}
        />
      )}
    </PageWrapper>
  );
}

// --- SUB-COMPONENTS ---

const RefundStatusBadge = ({ status }: { status: string | undefined }) => {
    const styles: Record<string, string> = {
        Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
        Pending: "bg-amber-50 text-amber-600 border-amber-100",
        Failed: "bg-red-50 text-red-600 border-red-100",
    };
    const style = styles[status || "Pending"] || styles.Pending;
    return (
        <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${style}`}>
            {status}
        </span>
    );
};

// 1. Define specific types for the Table Header
interface ThProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const Th = ({ children, align = 'left', className = '' }: ThProps) => (
    <th className={cn("px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wide whitespace-nowrap", align === "center" && "text-center", align === "right" && "text-right", className)}>
        {children}
    </th>
);

// 2. Define specific types for the Table Data
interface TdProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const Td = ({ children, className = "" }: TdProps) => (
    <td className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap bg-white ${className}`}>
        {children}
    </td>
);
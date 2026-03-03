import { useState, useMemo, useEffect } from "react";
import { ChevronDown, MoreVertical, Search, Calendar, CheckSquare, Square, Eye, CheckCircle, XCircle } from "lucide-react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { financeData } from "@/data/financeAdminData";
// import type { Transaction } from "@/data/financeAdminData";
import { PayoutDetailsModal, type PayoutTransaction } from "@/features/finance-admin/PayoutDetailsModal";
import { NotificationToast, type NotificationProps } from "@/components/ui/NotificationToast";



// Helper Logic
function mapStatusToPayout(status: string): PayoutTransaction['payoutStatus'] {
    switch(status.toLowerCase()) {
        case 'completed': return 'Paid';
        case 'pending': return 'Pending';
        case 'failed': return 'Failed';
        default: return 'Approved';
    }
}

export default function FinancePayouts() {
  // --- STATE ---
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutTransaction | null>(null);
  const [notification, setNotification] = useState<NotificationProps | null>(null);
  
  // NEW: State for Month Dropdown
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState("This Month");

  // Filters
  const [filters, setFilters] = useState({
    status: "All Status",
    date: "",
    hostSearch: ""
  });

  // Close dropdowns on click outside
  useEffect(() => {
    const closeMenu = () => {
        setActiveActionId(null);
        setIsMonthMenuOpen(false); // Close month menu too
    };
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // --- ACTIONS HANDLERS ---
  const handleApprovePayout = () => {
    setSelectedPayout(null);
    setNotification({
        id: Date.now().toString(),
        type: "success",
        title: "Payout approved successfully",
        message: "The funds have been scheduled for release.",
    });
  };

  const handleRejectPayout = () => {
    setSelectedPayout(null);
    setNotification({
        id: Date.now().toString(),
        type: "error",
        title: "Payout Rejected",
        message: "The host has been notified of the rejection.",
    });
  };

  // --- DATA LOGIC ---
  const payoutsData = useMemo(() => {
    const rawPayouts = financeData.recentTransactions.filter(t => t.type.toLowerCase().includes('payout'));
    const enhancedPayouts: PayoutTransaction[] = rawPayouts.map(t => ({
        ...t,
        relatedBookingId: `BK-${t.id.slice(0, 5)}`,
        scheduledDate: t.date,
        payoutStatus: mapStatusToPayout(t.status)
    }));

    return enhancedPayouts.filter(p => {
        const matchesStatus = filters.status === "All Status" || p.payoutStatus === filters.status;
        const matchesHost = p.user.name.toLowerCase().includes(filters.hostSearch.toLowerCase());
        return matchesStatus && matchesHost;
    });
  }, [filters]);

  // --- HANDLERS ---
  const toggleSelectAll = () => {
    if (selectedIds.size === payoutsData.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(payoutsData.map(p => p.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  return (
    <PageWrapper
      title="Payouts"
      subtitle="Review and release payouts to hosts/vendor after commission deduction"
      isPopulated={true}
      headerComponent={
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Review and release payouts to hosts/vendor after commission deduction
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
                                    // You can add logic here to filter data by date range
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
      {/* Toast Notification */}
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

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8 items-end">
        <div className="md:col-span-3 flex flex-col gap-2">
             <label className="text-xs font-bold text-gray-900">Status</label>
             <div className="relative">
                <select 
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                    {["All Status", "Approved", "Paid", "Pending", "Failed"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
             </div>
        </div>

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

        <div className="md:col-span-5 flex flex-col gap-2">
             <label className="text-xs font-bold text-gray-900">Host/Vendor</label>
             <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search host"
                    value={filters.hostSearch}
                    onChange={(e) => setFilters({...filters, hostSearch: e.target.value})}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-teal-500 placeholder:text-gray-400"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-visible shadow-sm min-h-[500px]">
         <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-100">
                <tr>
                    <th className="px-6 py-4 w-12">
                        <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                            {selectedIds.size === payoutsData.length && payoutsData.length > 0 
                                ? <CheckSquare className="w-5 h-5 text-teal-600" /> 
                                : <Square className="w-5 h-5" />}
                        </button>
                    </th>
                    <Th>Payout ID</Th>
                    <Th>Host Name</Th>
                    <Th>Amount</Th>
                    <Th>Related Bookings</Th>
                    <Th>Status</Th>
                    <Th>Scheduled Date</Th>
                    <Th align="center" className="bg-white">Actions</Th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 bg-white">
                {payoutsData.map((p) => {
                    const isSelected = selectedIds.has(p.id);
                    return (
                        <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-teal-50/30' : 'bg-white'}`}>
                            <td className="px-6 py-4">
                                <button onClick={() => toggleSelectRow(p.id)} className="text-gray-400 hover:text-gray-600">
                                    {isSelected 
                                        ? <CheckSquare className="w-5 h-5 text-teal-600" /> 
                                        : <Square className="w-5 h-5" />}
                                </button>
                            </td>
                            
                            <Td className="font-medium text-gray-900">{p.transactionId || p.id}</Td>
                            <Td>{p.user.name}</Td>
                            <Td className="font-medium">₦{p.amount.toLocaleString()}</Td>
                            <Td className="text-gray-500">{p.relatedBookingId}</Td>
                            <Td><PayoutStatusBadge status={p.payoutStatus} /></Td>
                            <Td>{p.scheduledDate}</Td>
                            
                            <td className="px-6 py-4 text-center relative bg-white group-hover:bg-gray-50">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveActionId(activeActionId === p.id ? null : p.id);
                                    }}
                                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 inline-flex items-center justify-center transition-colors"
                                >
                                    <MoreVertical size={16} />
                                </button>
                                
                                {activeActionId === p.id && (
                                    <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                                        <button 
                                            onClick={() => {
                                                setSelectedPayout(p);
                                                setActiveActionId(null);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Eye size={16} className="text-gray-400" />
                                            View Details
                                        </button>
                                        <button 
                                            onClick={handleApprovePayout}
                                            className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2 border-t border-gray-50"
                                        >
                                            <CheckCircle size={16} className="text-green-500" />
                                            Approve Payout
                                        </button>
                                        <button 
                                            onClick={handleRejectPayout}
                                            className="w-full px-4 py-3 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-gray-50"
                                        >
                                            <XCircle size={16} className="text-red-500" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
         </table>
         
         {payoutsData.length === 0 && (
             <div className="p-12 text-center text-gray-500">No payouts found matching your filters.</div>
         )}
      </div>

      {selectedPayout && (
        <PayoutDetailsModal 
            item={selectedPayout} 
            onClose={() => setSelectedPayout(null)} 
            onApprove={handleApprovePayout}
            onReject={handleRejectPayout}
            onMarkPaid={() => setSelectedPayout(null)}
        />
      )}
    </PageWrapper>
  );
}

// Sub-components
const PayoutStatusBadge = ({ status }: { status: string | undefined }) => {
    const styles: Record<string, string> = {
        Approved: "bg-emerald-50 text-emerald-600 border-emerald-100", 
        Paid: "bg-teal-50 text-teal-700 border-teal-100",           
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

interface ThProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const Th = ({ children, align = 'left', className = '' }: ThProps) => (
    <th className={`px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wide whitespace-nowrap text-${align} ${className}`}>
        {children}
    </th>
);

// 2. Define specific types for the Table Data
interface TdProps {
  children: React.ReactNode;
  className?: string;
}

const Td = ({ children, className = "" }: TdProps) => (
    <td className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap bg-white ${className}`}>
        {children}
    </td>
);
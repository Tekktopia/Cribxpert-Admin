import { useState, useMemo, useEffect } from "react";
import { ChevronDown, MoreVertical, Eye, FileText, Calendar } from "lucide-react";
import { FinancePageWrapper } from "@/components/layout/FinancePageWrapper";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { financeData } from "@/data/financeAdminData";
import { ViewDetailsModal, DownloadReceiptModal } from "@/features/finance-admin/TransactionModals"; 
import type { ExtendedTransaction } from "@/features/finance-admin/TransactionModals"; 

export default function FinanceTrans() {
  // --- STATE MANAGEMENT ---
  const [viewModalTx, setViewModalTx] = useState<ExtendedTransaction | null>(null);
  const [receiptModalTx, setReceiptModalTx] = useState<ExtendedTransaction | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isMonthMenuOpen, setIsMonthMenuOpen] = useState(false); // New: Toggle for Month dropdown

  const [filters, setFilters] = useState({ 
    date: "", 
    type: "All Types", 
    status: "All Status", 
    method: "All Methods",
    period: "This Month" // New: Track selected period
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const closeMenu = () => {
        setActiveActionId(null);
        setIsMonthMenuOpen(false);
    };
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  // Filter Logic (Preserved)
  const filteredData = useMemo(() => {
    return financeData.recentTransactions.filter(tx => {
       const typeMatch = filters.type === "All Types" || tx.type.toLowerCase().includes(filters.type.toLowerCase().split(' ')[0]);
       const statusMatch = filters.status === "All Status" || tx.status.toLowerCase() === filters.status.toLowerCase();
       const txMethod = (tx as { paymentMethod?: string }).paymentMethod || "Card"; 
       const methodMatch = filters.method === "All Methods" || txMethod.toLowerCase() === filters.method.toLowerCase();
       // Date logic can be added here using filters.date
       return typeMatch && statusMatch && methodMatch;
    });
  }, [filters]);

  return (
    <FinancePageWrapper 
      title="Transaction" 
      isPopulated={true} 
      headerComponent={
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction</h1>
                <p className="text-gray-500 mt-2 text-sm">
                    Clear record of all financial movements: booking payments, commissions, refunds and payouts
                </p>
            </div>
            
            {/* --- FIX 2: WORKING MONTH DROPDOWN --- */}
            <div className="relative">
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsMonthMenuOpen(!isMonthMenuOpen);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                    {filters.period}
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${isMonthMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isMonthMenuOpen && (
                    <div className="absolute right-0 top-12 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {["This Month", "Last Month", "This Year", "All Time"].map((period) => (
                            <button
                                key={period}
                                onClick={() => setFilters({...filters, period})}
                                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-teal-700"
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
      {/* FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <FilterGroup label="Date Range">
            <div className="relative">
                {/* --- FIX 3: NATIVE DATE PICKER --- */}
                <input 
                    type="date" 
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 focus:outline-none focus:border-teal-500 cursor-pointer appearance-none"
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                />
                {/* Visual Icon (Pointer events none allows clicking the input through the icon) */}
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none bg-white" />
            </div>
        </FilterGroup>
        
        <FilterGroup label="Transaction Type">
            <SelectInput value={filters.type} options={["All Types", "Booking Payment", "Payout", "Refund"]} onChange={(v: string) => setFilters({...filters, type: v})} />
        </FilterGroup>

        <FilterGroup label="Status">
            <SelectInput value={filters.status} options={["All Status", "Completed", "Pending", "Failed"]} onChange={(v: string) => setFilters({...filters, status: v})} />
        </FilterGroup>

        <FilterGroup label="Payment Method">
            <SelectInput value={filters.method} options={["All Methods", "Card", "Bank", "Wallet"]} onChange={(v: string) => setFilters({...filters, method: v})} />
        </FilterGroup>
      </div>

      {/* DATA TABLE */}
      {/* Added bg-white to container to ensure no background bleed-through */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-visible shadow-sm min-h-[500px]">
        {filteredData.length > 0 ? (
          <table className="w-full text-left border-collapse">
              <thead className="bg-white border-b border-gray-100">
                  <tr>
                      <Th>Transaction ID</Th>
                      <Th sort>Type</Th>
                      <Th>User</Th>
                      <Th>Amount</Th>
                      <Th>Commission</Th>
                      <Th>Status</Th>
                      <Th sort>Date & Time</Th>
                      <Th sort>Payment Method</Th>
                      {/* FIX 1: Explicit bg-white on sticky/action headers */}
                      <Th align="center" className="bg-white">Actions</Th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 bg-white">
                  {filteredData.map((tx) => {
                      const role = tx.type.toLowerCase().includes('payout') ? '(Host)' : '(Guest)';
                      const commission = tx.type.toLowerCase().includes('booking') ? `₦${(tx.amount * 0.5).toLocaleString()}` : '-';
                      const paymentMethod = (tx as ExtendedTransaction).paymentMethod || "Card";

                      return (
                          <tr key={tx.id} className="hover:bg-gray-50 transition-colors bg-white">
                              <Td className="font-medium text-gray-900">{tx.transactionId || tx.id}</Td>
                              <Td>{tx.type}</Td>
                              <Td>
                                  <span className="text-gray-900">{tx.user?.name} </span>
                                  <span className="text-gray-400 text-xs">{role}</span>
                              </Td>
                              <Td className="font-medium">₦{tx.amount.toLocaleString()}</Td>
                              <Td>{commission}</Td>
                              <Td><StatusBadge status={tx.status} /></Td>
                              <Td>
                                  <div className="flex flex-col">
                                      <span className="text-gray-900 text-sm">{tx.date}</span>
                                      <span className="text-gray-400 text-xs">10:30 AM</span>
                                  </div>
                              </Td>
                              <Td>{paymentMethod}</Td>
                              
                              {/* FIX 1: Centered Actions with explicit bg-white to fix transparency issues */}
                              <td className="px-6 py-4 text-center relative bg-white group-hover:bg-gray-50 transition-colors">
                                  <button 
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveActionId(activeActionId === tx.id ? null : tx.id);
                                      }}
                                      className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 inline-flex items-center justify-center transition-colors"
                                  >
                                      <MoreVertical size={16} />
                                  </button>
                                  
                                  {activeActionId === tx.id && (
                                      <div className="absolute right-8 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 text-left">
                                          <button 
                                              onClick={() => setViewModalTx(tx as ExtendedTransaction)}
                                              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                          >
                                              <Eye size={16} className="text-gray-400" />
                                              View Details
                                          </button>
                                          <button 
                                              onClick={() => setReceiptModalTx(tx as ExtendedTransaction)}
                                              className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-t border-gray-50"
                                          >
                                              <FileText size={16} className="text-gray-400" />
                                              Download Receipt
                                          </button>
                                      </div>
                                  )}
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
          </table>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-gray-500 bg-white">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
               <Eye className="w-8 h-8 text-gray-300" />
            </div>
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {viewModalTx && <ViewDetailsModal item={viewModalTx} onClose={() => setViewModalTx(null)} />}
      {receiptModalTx && <DownloadReceiptModal item={receiptModalTx} onClose={() => setReceiptModalTx(null)} />}
      
    </FinancePageWrapper>
  );
}

// --- SUB-COMPONENTS (With Alignment & Bg Fixes) ---

const FilterGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-900">{label}</label>
        {children}
    </div>
);

const SelectInput = ({ value, options, onChange }: { value: string, options: string[], onChange: (value: string) => void }) => (
    <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:border-teal-500 cursor-pointer">
            {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
);

const Th = ({ children, sort, align = 'left', className = '' }: { children: React.ReactNode, sort?: boolean, align?: 'left'|'center'|'right', className?: string }) => (
    <th className={`px-6 py-4 text-xs font-bold text-gray-900 uppercase tracking-wide whitespace-nowrap text-${align} ${className}`}>
        <div className={`flex items-center gap-1 cursor-pointer ${align === 'center' ? 'justify-center' : ''} ${align === 'right' ? 'justify-end' : ''}`}>
            {children}
            {sort && <div className="flex flex-col -space-y-1 opacity-30"><ChevronDown className="rotate-180 w-3 h-3"/><ChevronDown className="w-3 h-3"/></div>}
        </div>
    </th>
);

const Td = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <td className={`px-6 py-4 text-sm text-gray-600 whitespace-nowrap bg-white ${className}`}>{children}</td>
);
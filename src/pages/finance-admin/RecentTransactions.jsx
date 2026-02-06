// src/features/finance-admin/RecentTransactions.jsx
import { StatusBadge } from "@/components/ui/StatusBadge";

export function RecentTransactions({ transactions, onRowClick }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 mt-6 divide-y divide-gray-100 overflow-hidden">
      {transactions.map((item) => (
        <div 
          key={item.id} 
          onClick={() => onRowClick(item)}
          className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
        >
          {/* ... Icon and Title Logic ... */}
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-gray-900">₦{item.amount.toLocaleString()}</span>
            <StatusBadge status={item.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
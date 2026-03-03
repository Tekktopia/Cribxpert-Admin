import type { Transaction } from "@/data/financeAdminData";
import { formatCurrency, getTypeLabel } from "@/data/financeAdminData";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface FinanceTableProps {
  data: Transaction[];
  onRowClick: (transaction: Transaction) => void;
}

export function FinanceTable({ data, onRowClick }: FinanceTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="divide-y divide-gray-100">
        {data.map((t) => (
          <div 
            key={t.id} 
            onClick={() => onRowClick(t)}
            className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Avatar fallback */}
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                {t.user.avatar ? (
                  <img src={t.user.avatar} alt={t.user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-gray-400">{t.user.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{t.user.name}</p>
                <p className="text-xs text-gray-500">{getTypeLabel(t.type)} • {t.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-gray-900">{formatCurrency(t.amount)}</span>
              <StatusBadge status={t.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
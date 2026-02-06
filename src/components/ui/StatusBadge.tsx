// Using type-only import for verbatimModuleSyntax compliance
import type { Transaction } from "@/data/financeAdminData";
import { getStatusColor, getStatusIcon } from "@/data/financeAdminData";

interface StatusBadgeProps {
  status: Transaction['status'];
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const Icon = getStatusIcon(status);
  const colorClass = getStatusColor(status);

  return (
    <span className={`px-3 py-2 rounded-lg text-xs font-medium  flex items-center gap-1.5 w-fit ${colorClass} whitespace-nowrap`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span className="capitalize">{status}</span>
    </span>
  );
};
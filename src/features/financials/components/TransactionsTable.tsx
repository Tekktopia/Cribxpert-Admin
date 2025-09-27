import { DataTable, type TableColumn } from "@/components/layout/DataTable";
import { Badge } from "@/components/ui/badge";
import { ActionMenu } from "@/components/ui/ActionMenu";
import {
  formatCurrencyNGN,
  type FinancialTransaction,
} from "@/data/financialsData";
import { statusToBadgeVariant } from "@/features/financials/utils/status";

interface Props {
  data: FinancialTransaction[];
  onAction?: (item: FinancialTransaction, action: string) => void;
}

// use shared util for consistent colors

export function TransactionsTable({ data, onAction }: Props) {
  const columns: TableColumn<FinancialTransaction>[] = [
    {
      key: "date",
      header: "Date",
      render: (t) =>
        new Date(t.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "2-digit",
        }),
    },
    {
      key: "type",
      header: "Transaction Type",
      render: (t) => t.type,
    },
    {
      key: "amount",
      header: "Amount",
      render: (t) => formatCurrencyNGN(t.amount),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => (
        <Badge variant={statusToBadgeVariant(t.status)}>{t.status}</Badge>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(t) => t.id}
      renderRowAction={(t) => (
        <ActionMenu
          items={(function () {
            const base: { label: string; action: string }[] = [
              { label: "View details", action: "view" },
            ];

            // Completed: only View details + Payout
            if (t.status === "Completed") {
              return [...base, { label: "Payout", action: "payout" }];
            }

            // Non-completed guest payment: allow refund and freeze
            if (t.type === "Guest Payment") {
              const items: { label: string; action: string }[] = [
                ...base,
                { label: "Issue refund", action: "refund" },
              ];
              if (t.status === "Pending" || t.status === "Disputed") {
                items.push({ label: "Freeze transaction", action: "freeze" });
              }
              return items;
            }

            return base;
          })()}
          onSelect={(action) => onAction?.(t, action)}
          trigger={
            <button
              className='p-2 rounded hover:bg-gray-100'
              aria-label='Row actions'
            >
              ⋯
            </button>
          }
        />
      )}
      className=''
      tableClassName=''
    />
  );
}

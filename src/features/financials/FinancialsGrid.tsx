import { useMemo, useState } from "react";
import { Download, Filter } from "lucide-react";
import { SummaryCards } from "./components/SummaryCards";
import { TransactionsTable } from "./components/TransactionsTable";
import { TransactionDetailsModal } from "./components/TransactionDetailsModal";
import { IssueRefundModal } from "./components/IssueRefundModal";
import { PayoutModal } from "./components/PayoutModal";
import { FreezeTransactionModal } from "./components/FreezeTransactionModal";
import {
  formatCurrencyNGN,
  type FinancialsData,
  type FinancialTransaction,
} from "@/data/financialsData";
import {
  SearchAndFilters,
  type FilterConfig,
  type ActionButton,
} from "@/components/ui/SearchAndFilters";
import { Button } from "@/components/ui/button";
import { useNotification } from "@/hooks/useNotification";

interface Props {
  data: FinancialsData;
}

function toCSV(rows: FinancialTransaction[]): string {
  const header = ["Date", "Transaction Type", "Amount", "Status"];
  const records = rows.map((r) => [r.date, r.type, r.amount, r.status]);
  return [header, ...records].map((r) => r.join(",")).join("\n");
}

export function FinancialsGrid({ data }: Props) {
  const { showNotification } = useNotification();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<FinancialTransaction | null>(null);
  const [open, setOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [freezeOpen, setFreezeOpen] = useState(false);

  const filtered = useMemo(() => {
    return data.transactions.filter((t) => {
      const matchesSearch = t.type.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "all" || t.type === typeFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [data.transactions, search, typeFilter, statusFilter]);

  const filters: FilterConfig[] = [
    {
      key: "type",
      label: "All Types",
      value: typeFilter,
      onChange: setTypeFilter,
      options: [
        { value: "Payout", label: "Payout" },
        { value: "Refund", label: "Refund" },
        { value: "Guest Payment", label: "Guest Payment" },
      ],
    },
    {
      key: "status",
      label: "All Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "Completed", label: "Completed" },
        { value: "Pending", label: "Pending" },
        { value: "Disputed", label: "Disputed" },
      ],
    },
  ];

  const handleExportCSV = () => {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial-transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    showNotification({
      type: "success",
      title: "Exported CSV",
      message: "Your CSV download has started.",
    });
  };

  // Lightweight print-to-PDF using browser print; real PDF generation can be wired later
  const handleExportPDF = () => {
    window.print();
    showNotification({
      type: "info",
      title: "Print Dialog Opened",
      message: "Use Save as PDF to export.",
    });
  };

  const actionButtons: ActionButton[] = [
    {
      label: "Export CSV",
      onClick: handleExportCSV,
      icon: <Download className='w-4 h-4 ml-2' />,
    },
    {
      label: "Export PDF",
      onClick: handleExportPDF,
      icon: <Download className='w-4 h-4 ml-2' />,
    },
  ];

  const onRowAction = (item: FinancialTransaction, action: string) => {
    if (action === "view") {
      setSelected(item);
      setOpen(true);
      return;
    }
    if (action === "refund") {
      setSelected(item);
      setRefundOpen(true);
      return;
    }
    if (action === "payout") {
      setSelected(item);
      setPayoutOpen(true);
      return;
    }
    if (action === "freeze") {
      setSelected(item);
      setFreezeOpen(true);
      return;
    }
    if (action === "export") {
      const csv = toCSV([item]);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transaction-${item.id}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification({
        type: "success",
        title: "Row Exported",
        message: `Transaction ${item.id} downloaded.`,
      });
      return;
    }
  };

  return (
    <div className='space-y-6'>
      <SummaryCards items={data.summary} />

      <div className='flex items-center justify-between mt-2'>
        <h3 className='text-lg font-semibold'>Financial transactions</h3>
        <Button
          className='flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          size='sm'
        >
          <Filter className='w-4 h-4' /> Filters
        </Button>
      </div>

      <SearchAndFilters
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder='Search transactions...'
        filters={filters}
        actionButtons={actionButtons}
        resultsInfo={{
          total: data.transactions.length,
          filtered: filtered.length,
          entityName: "transactions",
        }}
        showActiveFilters
        onClearFilters={() => {
          setTypeFilter("all");
          setStatusFilter("all");
          setSearch("");
        }}
      />

      <TransactionsTable data={filtered} onAction={onRowAction} />

      <div className='flex justify-center'>
        <Button
          onClick={handleExportCSV}
          className='px-6 py-6 rounded-md text-white bg-[#065F6A] hover:bg-[#065F6A]/90'
        >
          Download Financial Report (CSV/PDF)
        </Button>
      </div>

      <TransactionDetailsModal
        isOpen={open}
        onClose={() => setOpen(false)}
        transaction={selected}
      />

      <IssueRefundModal
        isOpen={refundOpen}
        onClose={() => setRefundOpen(false)}
        transaction={selected || undefined}
        onConfirm={({ reason, notes }) => {
          showNotification({
            type: "success",
            title: "Refund Initiated",
            message: `Refund for ${formatCurrencyNGN(
              selected?.amount || 0
            )} requested. Reason: ${reason}${notes ? ` — ${notes}` : ""}.`,
          });
        }}
      />

      <PayoutModal
        isOpen={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        transaction={selected || undefined}
        onConfirm={() => {
          setPayoutOpen(false);
          showNotification({
            type: "success",
            title: "Payout Confirmed",
            message: `Payment of ${formatCurrencyNGN(
              selected?.amount || 0
            )} will be sent to the host.`,
          });
        }}
      />

      <FreezeTransactionModal
        isOpen={freezeOpen}
        onClose={() => setFreezeOpen(false)}
        transaction={selected || undefined}
        onConfirm={({ reason, notes }) => {
          setFreezeOpen(false);
          showNotification({
            type: "warning",
            title: "Transaction Frozen",
            message: `Freeze placed for ${formatCurrencyNGN(
              selected?.amount || 0
            )}. Reason: ${reason}${notes ? ` — ${notes}` : ""}.`,
          });
        }}
      />
    </div>
  );
}

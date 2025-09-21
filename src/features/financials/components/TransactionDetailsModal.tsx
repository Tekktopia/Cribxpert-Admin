import { Modal, type ModalProps } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyNGN,
  type FinancialTransaction,
} from "@/data/financialsData";
import { statusToBadgeVariant } from "@/features/financials/utils/status";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction | null;
}

export function TransactionDetailsModal({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const rowsTop = [
    { label: "Transaction ID", value: transaction.id },
    {
      label: "Date",
      value: new Date(transaction.date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    { label: "Type", value: transaction.type },
    { label: "Amount", value: formatCurrencyNGN(transaction.amount) },
  ];

  const rowsBottom = [
    transaction.guestName && {
      label: "Guest Name",
      value: transaction.guestName,
    },
    transaction.hostName && { label: "Host Name", value: transaction.hostName },
    transaction.propertyName && {
      label: "Property Name",
      value: transaction.propertyName,
    },
    transaction.paymentMethod && {
      label: "Payment Method",
      value: transaction.paymentMethod,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  const handleDownload = () => {
    // Placeholder: actual receipt generation to be wired to backend later
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Transaction Details'
      size='lg'
      headerAlign='center'
      actions={[] as ModalProps["actions"]}
    >
      <div className='text-left'>
        {/* Top grid */}
        <div className='grid grid-cols-2 gap-y-3 gap-x-8'>
          {rowsTop.map((row) => (
            <div
              key={row.label}
              className='flex items-center justify-between gap-6'
            >
              <span className='text-sm text-gray-500'>{row.label}</span>
              <span className='text-sm text-gray-900 font-medium'>
                {row.value}
              </span>
            </div>
          ))}
          <div className='flex items-center justify-between gap-6'>
            <span className='text-sm text-gray-500'>Status:</span>
            <Badge variant={statusToBadgeVariant(transaction.status)}>
              {transaction.status}
            </Badge>
          </div>
        </div>

        {/* Divider */}
        <hr className='my-5 border-gray-200' />

        {/* Bottom section */}
        <div className='grid grid-cols-2 gap-y-3 gap-x-8'>
          {rowsBottom.map((row) => (
            <div
              key={row.label}
              className='flex items-center justify-between gap-6'
            >
              <span className='text-sm text-gray-500'>{row.label}</span>
              <span className='text-sm text-gray-900 font-medium'>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className='mt-8 flex justify-center'>
          <Button
            onClick={handleDownload}
            className='bg-[#065F6A] hover:bg-[#065F6A]/90 text-white px-6 py-6'
          >
            Download Receipt (PDF)
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default TransactionDetailsModal;

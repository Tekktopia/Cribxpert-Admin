import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyNGN,
  type FinancialTransaction,
} from "@/data/financialsData";

interface IssueRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction | null;
  onConfirm?: (payload: { reason: string; notes?: string }) => void;
}

const REASONS = [
  "Cancellation",
  "Overcharge",
  "Dispute Raised",
  "Other (specify in notes)",
] as const;

export function IssueRefundModal({
  isOpen,
  onClose,
  transaction,
  onConfirm,
}: IssueRefundModalProps) {
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");

  if (!transaction) return null;

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm?.({ reason, notes: notes.trim() || undefined });
    // reset after confirm
    setReason("");
    setNotes("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setReason("");
        setNotes("");
        onClose();
      }}
      title='Issue Refund'
      description='Refund guest payment back to original payment method'
      size='lg'
      headerAlign='center'
      actions={[]}
    >
      <div className='space-y-6 text-left'>
        {/* Context info */}
        <div className='space-y-1'>
          {transaction.hostName && (
            <p className='text-sm text-gray-600'>
              Host Name:{" "}
              <span className='font-medium text-gray-900'>
                {transaction.hostName}
              </span>
            </p>
          )}
          {transaction.propertyName && (
            <p className='text-sm text-gray-600'>
              Property Name:{" "}
              <span className='font-medium text-gray-900'>
                {transaction.propertyName}
              </span>
            </p>
          )}
          <p className='text-sm text-gray-600'>
            Amount To Refund:{" "}
            <span className='font-medium text-gray-900'>
              {formatCurrencyNGN(transaction.amount)}
            </span>
          </p>
        </div>

        {/* Reason radios */}
        <div className='space-y-3'>
          <label className='text-sm font-medium text-gray-900'>
            Reason for Refund <span className='text-red-500'>*</span>
          </label>
          <div className='space-y-2'>
            {REASONS.map((r) => (
              <label
                key={r}
                className='flex items-center gap-3 text-sm text-gray-700'
              >
                <input
                  type='radio'
                  name='refund-reason'
                  value={r}
                  className='h-4 w-4 accent-primary-600'
                  checked={reason === r}
                  onChange={() => setReason(r)}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className='space-y-2'>
          <label className='text-sm font-medium text-gray-900'>
            Additional Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Enter your note...'
            rows={3}
            className='w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600'
          />
        </div>

        {/* Actions Row */}
        <div className='flex items-center justify-end gap-3 pt-2'>
          <Button
            onClick={() => {
              setReason("");
              setNotes("");
              onClose();
            }}
            className='bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason}
            className='bg-[#065F6A] hover:bg-[#065F6A]/90 text-white'
          >
            Confirm Refund
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default IssueRefundModal;

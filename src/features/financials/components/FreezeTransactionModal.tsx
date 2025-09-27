import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyNGN,
  type FinancialTransaction,
} from "@/data/financialsData";

interface FreezeTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction | null;
  onConfirm?: (payload: { reason: string; notes?: string }) => void;
}

const REASONS = [
  "Suspicious activity",
  "Dispute Raised",
  "Other (specify in notes)",
] as const;

export function FreezeTransactionModal({
  isOpen,
  onClose,
  transaction,
  onConfirm,
}: FreezeTransactionModalProps) {
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");

  if (!transaction) return null;

  const handleConfirm = () => {
    if (!reason) return;
    onConfirm?.({ reason, notes: notes.trim() || undefined });
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
      title='Freeze Transaction'
      description='This transaction will be temporarily frozen and funds will not be released until reviewed'
      size='lg'
      headerAlign='center'
      actions={[]}
    >
      <div className='space-y-6 text-left'>
        {/* Context */}
        <div className='space-y-1'>
          {transaction.hostName && (
            <p className='text-sm text-gray-600'>
              Host Name:{" "}
              <span className='font-medium text-gray-900'>
                {transaction.hostName}
              </span>
            </p>
          )}
          <p className='text-sm text-gray-600'>
            Amount:{" "}
            <span className='font-medium text-gray-900'>
              {formatCurrencyNGN(transaction.amount)}
            </span>
          </p>
        </div>

        {/* Reason */}
        <div className='space-y-3'>
          <label className='text-sm font-medium text-gray-900'>
            Reason for Freeze <span className='text-red-500'>*</span>
          </label>
          <div className='space-y-2'>
            {REASONS.map((r) => (
              <label
                key={r}
                className='flex items-center gap-3 text-sm text-gray-700'
              >
                <input
                  type='radio'
                  name='freeze-reason'
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
            placeholder='Enter your note......'
            rows={3}
            className='w-full rounded-md border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600'
          />
        </div>

        {/* Actions */}
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
            className='bg-rose-100 text-rose-600 hover:bg-rose-200 border border-rose-200'
          >
            Confirm Flag
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default FreezeTransactionModal;

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import {
  formatCurrencyNGN,
  type FinancialTransaction,
} from "@/data/financialsData";

interface PayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: FinancialTransaction | null;
  onConfirm?: () => void;
}

export function PayoutModal({
  isOpen,
  onClose,
  transaction,
  onConfirm,
}: PayoutModalProps) {
  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Payout'
      description='Send payment to host immediately'
      size='lg'
      headerAlign='center'
      actions={[]}
    >
      <div className='text-left space-y-6'>
        <div className='grid grid-cols-2 gap-y-3 gap-x-8'>
          {transaction.hostName && (
            <div className='flex items-center justify-between gap-6'>
              <span className='text-sm text-gray-500'>Host Name</span>
              <span className='text-sm text-gray-900 font-medium'>
                {transaction.hostName}
              </span>
            </div>
          )}
          {transaction.propertyName && (
            <div className='flex items-center justify-between gap-6'>
              <span className='text-sm text-gray-500'>Property Name</span>
              <span className='text-sm text-gray-900 font-medium'>
                {transaction.propertyName}
              </span>
            </div>
          )}
          <div className='flex items-center justify-between gap-6'>
            <span className='text-sm text-gray-500'>Amount</span>
            <span className='text-sm text-gray-900 font-medium'>
              {formatCurrencyNGN(transaction.amount)}
            </span>
          </div>
          {transaction.paymentMethod && (
            <div className='flex items-center justify-between gap-6'>
              <span className='text-sm text-gray-500'>Payment Method:</span>
              <span className='text-sm text-gray-900 font-medium'>
                {transaction.paymentMethod}
              </span>
            </div>
          )}
        </div>

        <div className='flex items-center justify-between gap-4 pt-2'>
          <Button
            onClick={onClose}
            className='bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className='bg-[#065F6A] hover:bg-[#065F6A]/90 text-white'
          >
            Confirm Payout
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default PayoutModal;

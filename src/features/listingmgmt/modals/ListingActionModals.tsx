import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { ListingRecord } from "@/data/listingMgmtData";

// Approve Listing Modal
interface ApproveListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingRecord | null;
  onConfirm: () => void;
}

export function ApproveListingModal({
  isOpen,
  onClose,
  listing,
  onConfirm,
}: ApproveListingModalProps) {
  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: "Approve",
      onClick: onConfirm,
      variant: "primary" as const,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Approve Listing'
      description={`Are you sure you want to approve "${listing?.title}"? This listing will go live and be available for bookings.`}
      actions={actions}
      size='md'
    />
  );
}

// Reject Listing Modal
interface RejectListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingRecord | null;
  onConfirm: (reason: string) => void;
}

export function RejectListingModal({
  isOpen,
  onClose,
  listing,
  onConfirm,
}: RejectListingModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: "Reject",
      onClick: handleConfirm,
      variant: "destructive" as const,
      disabled: !reason.trim(),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Reject Listing'
      description={`Are you sure you want to reject "${listing?.title}"? The host will be notified.`}
      actions={actions}
      size='md'
    >
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
            Reason for rejection
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Enter reason for rejection...'
            rows={4}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400 resize-none'
          />
        </div>
      </div>
    </Modal>
  );
}

// Flag Listing Modal
interface FlagListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingRecord | null;
  onConfirm: (reason: string) => void;
}

export function FlagListingModal({
  isOpen,
  onClose,
  listing,
  onConfirm,
}: FlagListingModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: "Flag",
      onClick: handleConfirm,
      variant: "warning" as const,
      disabled: !reason.trim(),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Flag Listing'
      description={`Flag "${listing?.title}" for review. This listing will be marked for further investigation.`}
      actions={actions}
      size='md'
    >
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
            Reason for flagging
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Enter reason for flagging...'
            rows={4}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400 resize-none'
          />
        </div>
      </div>
    </Modal>
  );
}

// Suspend Listing Modal
interface SuspendListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: ListingRecord | null;
  onConfirm: (reason: string) => void;
}

export function SuspendListingModal({
  isOpen,
  onClose,
  listing,
  onConfirm,
}: SuspendListingModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: "Suspend",
      onClick: handleConfirm,
      variant: "warning" as const,
      disabled: !reason.trim(),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Suspend Listing'
      description={`Suspend "${listing?.title}"? This listing will be temporarily unavailable for bookings.`}
      actions={actions}
      size='md'
    >
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
            Reason for suspension
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Enter reason for suspension...'
            rows={4}
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400 resize-none'
          />
        </div>
      </div>
    </Modal>
  );
}

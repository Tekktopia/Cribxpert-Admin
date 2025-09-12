import React, { useState } from "react";
import { Modal } from "./Modal";
import { CheckCircle, Bell } from "lucide-react";

// Block User Modal
interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onConfirm: (reason: string) => void;
}

export function BlockUserModal({
  isOpen,
  onClose,
  userName,
  onConfirm,
}: BlockUserModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason);
    setReason(""); // Reset form
  };

  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: "Block User",
      onClick: handleConfirm,
      variant: "destructive" as const,
      disabled: !reason.trim(),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Block User'
      description={`Are you sure you want to block ${userName}? They will lose access to their account.`}
      actions={actions}
      size='md'
    >
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
            Reason for blocking
          </label>
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder='Enter reason...'
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400'
          />
        </div>
      </div>
    </Modal>
  );
}

// Success Modal (for confirmations)
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actionLabel?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  actionLabel = "Back to Dashboard",
}: SuccessModalProps) {
  const actions = [
    {
      label: actionLabel,
      onClick: onClose,
      variant: "primary" as const,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      actions={actions}
      size='sm'
      showCloseButton={false}
      icon={<CheckCircle className='w-8 h-8 text-primary-600' />}
    />
  );
}

// Send Notification Modal
interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSend: (message: string) => void;
}

export function SendNotificationModal({
  isOpen,
  onClose,
  userName,
  onSend,
}: SendNotificationModalProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    onSend(message);
    setMessage(""); // Reset form
  };

  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: "Send",
      onClick: handleSend,
      variant: "primary" as const,
      disabled: !message.trim(),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Send Notification'
      description={`Send a notification to ${userName}`}
      actions={actions}
      size='md'
      icon={<Bell className='w-6 h-6 text-teal-600' />}
    >
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
            Message
          </label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Enter your message...'
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400'
          />
        </div>
      </div>
    </Modal>
  );
}

// Confirmation Modal (for general confirmations)
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "primary" | "destructive";
  icon?: React.ReactNode;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message = " ",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "primary",
  icon,
}: ConfirmationModalProps) {
  const actions = [
    {
      label: cancelLabel,
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: confirmLabel,
      onClick: onConfirm,
      variant: variant,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={message}
      actions={actions}
      size='sm'
      icon={icon}
    />
  );
}

// Generic Reason Modal with Radio Options (for Reject/Flag Listing)
interface ReasonOption {
  value: string;
  label: string;
}

interface ReasonModalWithOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  reasonLabel: string;
  options: ReasonOption[];
  onConfirm: (reason: string, additionalNotes?: string) => void;
  confirmLabel: string;
  variant?: "primary" | "destructive" | "warning";
  showAdditionalNotes?: boolean;
  additionalNotesLabel?: string;
  additionalNotesPlaceholder?: string;
}

export function ReasonModalWithOptions({
  isOpen,
  onClose,
  title,
  description,
  reasonLabel,
  options,
  onConfirm,
  confirmLabel,
  variant = "primary",
  showAdditionalNotes = true,
  additionalNotesLabel = "Additional Notes (Optional)",
  additionalNotesPlaceholder = "Enter your note...",
}: ReasonModalWithOptionsProps) {
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason, additionalNotes);
      setSelectedReason("");
      setAdditionalNotes("");
    }
  };

  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: confirmLabel,
      onClick: handleConfirm,
      variant: variant,
      disabled: !selectedReason,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      actions={actions}
      size='md'
    >
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
            {reasonLabel} <span className='text-red-500'>*</span>
          </label>
          <div className='space-y-3'>
            {options.map((option) => (
              <label key={option.value} className='flex items-center'>
                <input
                  type='radio'
                  name='reason'
                  value={option.value}
                  checked={selectedReason === option.value}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  className='h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300'
                />
                <span className='ml-3 text-sm text-gray-700'>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {showAdditionalNotes && (
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
              {additionalNotesLabel}
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder={additionalNotesPlaceholder}
              rows={3}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400 resize-none'
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

// Generic Text Input Modal (for simple text input like notes)
interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  onConfirm: (text: string) => void;
  confirmLabel: string;
  variant?: "primary" | "destructive" | "warning";
  useTextarea?: boolean;
  required?: boolean;
}

export function TextInputModal({
  isOpen,
  onClose,
  title,
  description,
  inputLabel,
  inputPlaceholder,
  onConfirm,
  confirmLabel,
  variant = "primary",
  useTextarea = false,
  required = false,
}: TextInputModalProps) {
  const [inputValue, setInputValue] = useState("");

  const handleConfirm = () => {
    if (!required || inputValue.trim()) {
      onConfirm(inputValue);
      setInputValue("");
    }
  };

  const actions = [
    {
      label: "Cancel",
      onClick: onClose,
      variant: "secondary" as const,
    },
    {
      label: confirmLabel,
      onClick: handleConfirm,
      variant: variant,
      disabled: required && !inputValue.trim(),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      actions={actions}
      size='md'
    >
      <div className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-3 text-left'>
            {inputLabel}
            {required && <span className='text-red-500'>*</span>}
          </label>
          {useTextarea ? (
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              rows={4}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400 resize-none'
            />
          ) : (
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm placeholder-gray-400'
            />
          )}
        </div>
      </div>
    </Modal>
  );
}

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

interface ScheduleDateModalProps {
  isOpen: boolean;
  defaultValue?: string; // ISO string
  onCancel: () => void;
  onConfirm: (iso: string) => void;
}

export function ScheduleDateModal({
  isOpen,
  defaultValue,
  onCancel,
  onConfirm,
}: ScheduleDateModalProps) {
  const [value, setValue] = useState<string>(defaultValue || "");

  const actions = [
    { label: "Cancel", onClick: onCancel, variant: "secondary" as const },
    {
      label: "Save",
      onClick: () => value && onConfirm(value),
      variant: "primary" as const,
      disabled: !value,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title='Pick schedule'
      actions={actions}
      size='sm'
      headerAlign='left'
      actionsAlign='right'
    >
      <div className='text-left'>
        <label className='block text-sm font-medium text-gray-700 mb-2'>
          Send At
        </label>
        <input
          type='datetime-local'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm'
        />
      </div>
    </Modal>
  );
}

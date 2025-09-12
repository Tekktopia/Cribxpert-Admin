import React from "react";
import { Modal } from "@/components/ui/Modal";

interface DetailsSectionProps {
  title: string;
  children: React.ReactNode;
}

interface DetailsFieldProps {
  label: string;
  value: string | React.ReactNode;
  className?: string;
}

// Reusable section component
export function DetailsSection({ title, children }: DetailsSectionProps) {
  return (
    <div className='space-y-4'>
      <h4 className='text-base font-medium text-gray-900 flex items-center gap-2'>
        {title}
      </h4>
      <div className='space-y-3'>{children}</div>
      <hr className='border-gray-200' />
    </div>
  );
}

// Reusable field component
export function DetailsField({
  label,
  value,
  className = "",
}: DetailsFieldProps) {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <span className='text-sm text-gray-600'>{label}:</span>
      <div className='text-sm font-medium text-gray-900'>
        {typeof value === "string" ? (
          <span className='font-semibold'>{value}</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

// Main reusable modal component
export function DetailsModal({
  isOpen,
  onClose,
  title,
  size = "lg",
  children,
}: DetailsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      showCloseButton={true}
      closeOnOverlayClick={true}
    >
      <div className='space-y-6 text-left'>{children}</div>
    </Modal>
  );
}

// Export types for reuse
export type { DetailsSectionProps, DetailsFieldProps, DetailsModalProps };

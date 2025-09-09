import React from "react";
import { X } from "lucide-react";

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: ModalAction[];
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  icon?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  icon,
}: ModalProps) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  const getButtonClasses = (variant: ModalAction["variant"] = "secondary") => {
    const baseClasses =
      "px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-[120px]";

    switch (variant) {
      case "primary":
        return `${baseClasses} bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600 shadow-sm`;
      case "destructive":
        return `${baseClasses} bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500 border border-red-200`;
      case "secondary":
      default:
        return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-200`;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      {/* Overlay */}
      <div
        className='fixed inset-0 bg-black/40 bg-opacity-50 transition-opacity'
        onClick={handleOverlayClick}
      />

      {/* Modal */}
      <div className='flex min-h-full items-center justify-center p-4'>
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-center shadow-2xl transition-all ${sizeClasses[size]} w-full`}
        >
          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className='absolute top-4 right-4 rounded-full p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          )}

          {/* Header */}
          <div className='px-8 pt-8 pb-6'>
            {icon && <div className='flex justify-center mb-4'>{icon}</div>}
            <h3 className='text-xl font-semibold text-gray-900 mb-3'>
              {title}
            </h3>
            {description && (
              <p className='text-sm text-gray-600 leading-relaxed max-w-sm mx-auto'>
                {description}
              </p>
            )}
          </div>

          {/* Content */}
          {children && <div className='px-8 pb-6'>{children}</div>}

          {/* Actions */}
          {actions.length > 0 && (
            <div className='px-8 pb-8'>
              <div className='flex justify-center gap-4'>
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`${getButtonClasses(action.variant)} ${
                      action.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

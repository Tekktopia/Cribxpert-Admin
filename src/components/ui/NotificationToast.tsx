import { useCallback, useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";

export interface NotificationProps {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps extends NotificationProps {
  onRemove: (id: string) => void;
  isVisible: boolean;
}

const notificationIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const notificationStyles = {
  success: {
    container: "bg-green-50 border-green-200 text-green-900",
    icon: "text-green-600",
    closeButton: "text-green-500 hover:text-green-700",
  },
  error: {
    container: "bg-red-50 border-red-200 text-red-900",
    icon: "text-red-600",
    closeButton: "text-red-500 hover:text-red-700",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-200 text-yellow-900",
    icon: "text-yellow-600",
    closeButton: "text-yellow-500 hover:text-yellow-700",
  },
  info: {
    container: "bg-blue-50 border-blue-200 text-blue-900",
    icon: "text-blue-600",
    closeButton: "text-blue-500 hover:text-blue-700",
  },
};

export function NotificationToast({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onRemove,
  isVisible,
}: NotificationToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const Icon = notificationIcons[type];
  const styles = notificationStyles[type];
    
  const handleRemove = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(id);
    }, 300); // Animation duration
  }, [id, onRemove]);

  useEffect(() => {
    if (!isVisible) return;

    // Auto remove timer
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, duration, handleRemove]);

  return (
    <div
      className={cn(
        "relative max-w-sm w-full bg-white border rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out",
        styles.container,
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      )}
    >

      {/* Content */}
      <div className='p-4'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <Icon className={cn("w-5 h-5", styles.icon)} />
          </div>

          <div className='ml-3 flex-1'>
            <h4 className='text-sm font-medium'>{title}</h4>
            {message && <p className='mt-1 text-sm opacity-80'>{message}</p>}

            {action && (
              <div className='mt-3'>
                <button
                  onClick={action.onClick}
                  className='text-sm font-medium underline hover:no-underline focus:outline-none'
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>

          <div className='ml-4 flex-shrink-0'>
            <button
              onClick={handleRemove}
              className={cn(
                "inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2",
                styles.closeButton
              )}
            >
              <span className='sr-only'>Close</span>
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

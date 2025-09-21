import { useCallback, useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/utils/cn";

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

type NotificationType = NotificationProps["type"];

function getIcon(type: NotificationType) {
  switch (type) {
    case "success":
      return CheckCircle;
    case "error":
      return AlertCircle;
    case "warning":
      return AlertTriangle;
    case "info":
    default:
      return Info;
  }
}

function getStyles(type: NotificationType) {
  switch (type) {
    case "success":
      return {
        container: "bg-white shadow-md",
        icon: "text-green-500",
        closeButton: "text-gray-400 hover:text-gray-600",
        title: "text-gray-900",
        message: "text-gray-600",
        action: "text-green-600 hover:text-green-700",
      } as const;
    case "error":
      return {
        container: "bg-white shadow-md",
        icon: "text-red-500",
        closeButton: "text-gray-400 hover:text-gray-600",
        title: "text-gray-900",
        message: "text-gray-600",
        action: "text-red-600 hover:text-red-700",
      } as const;
    case "warning":
      return {
        container: "bg-white shadow-md",
        icon: "text-yellow-500",
        closeButton: "text-gray-400 hover:text-gray-600",
        title: "text-gray-900",
        message: "text-gray-600",
        action: "text-yellow-600 hover:text-yellow-700",
      } as const;
    case "info":
    default:
      return {
        container: "bg-white shadow-md",
        icon: "text-blue-500",
        closeButton: "text-gray-400 hover:text-gray-600",
        title: "text-gray-900",
        message: "text-gray-600",
        action: "text-blue-600 hover:text-blue-700",
      } as const;
  }
}

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

  const Icon = getIcon(type);
  const styles = getStyles(type);

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
        "relative max-w-sm w-full rounded-lg overflow-hidden transform transition-all duration-300 ease-in-out",
        styles.container,
        isVisible && !isLeaving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      )}
      role='status'
      aria-live={
        type === "error" || type === "warning" ? "assertive" : "polite"
      }
    >
      {/* Content */}
      <div className='p-4 pr-12'>
        <div className='flex items-start'>
          <div className='flex-shrink-0'>
            <Icon className={cn("w-5 h-5", styles.icon)} />
          </div>

          <div className='ml-3 flex-1 min-w-0'>
            <h4 className={cn("text-sm font-semibold leading-5", styles.title)}>
              {title}
            </h4>
            {message && (
              <p className={cn("mt-1 text-sm leading-5", styles.message)}>
                {message}
              </p>
            )}

            {action && (
              <div className='mt-3'>
                <button
                  onClick={action.onClick}
                  className={cn(
                    "text-sm font-medium underline underline-offset-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
                    styles.action
                  )}
                >
                  {action.label}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close button - positioned absolutely in top right */}
      <button
        onClick={handleRemove}
        className={cn(
          "absolute top-3 right-3 inline-flex rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-offset-2",
          styles.closeButton
        )}
        aria-label='Close notification'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}

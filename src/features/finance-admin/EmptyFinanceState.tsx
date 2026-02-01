// components/finance/EmptyFinanceState.jsx
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface EmptyFinanceStateProps {
  title?: string;
  subtitle?: string;
  showRefreshButton?: boolean;
  refreshButtonText?: string;
  onRefresh?: () => void;
  imageUrl?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyFinanceState({
  title = "Welcome to Finance Dashboard",
  subtitle = "Monitor Revenue, Payouts, And Refunds Once Activity Starts",
  showRefreshButton = true,
  refreshButtonText = "Refresh",
  onRefresh,
  imageUrl,
  icon,
  className = "",
}: EmptyFinanceStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Image or Icon */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Empty state" 
          className="w-48 h-48 mb-6"
        />
      ) : icon ? (
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
          {icon}
        </div>
      ) : (
        // Default finance icon
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Subtitle */}
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        {subtitle}
      </p>

      {/* Refresh Button */}
      {showRefreshButton && (
        <Button
          onClick={onRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {refreshButtonText}
        </Button>
      )}
    </div>
  );
}
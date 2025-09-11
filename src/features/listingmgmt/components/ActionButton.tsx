import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "approve" | "reject" | "flag" | "suspend";
  className?: string;
  disabled?: boolean;
}

const variantStyles = {
  approve: "bg-primary-600 hover:bg-primary-700 text-white",
  reject: "bg-[#FFC2DE] hover:bg-red-100 text-red-600 border-red-200",
  flag: "bg-[#FFC2DE] hover:bg-red-100 text-red-600 border-red-200",
  suspend: "bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200",
} as const;

export const ActionButton = ({
  label,
  onClick,
  variant = "approve",
  className = "",
  disabled = false,
}: ActionButtonProps) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "px-4 py-2 text-sm font-medium rounded-md transition-colors",
      variantStyles[variant as keyof typeof variantStyles] ||
        variantStyles.approve,
      className
    )}
  >
    {label}
  </Button>
);

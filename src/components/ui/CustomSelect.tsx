import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface CustomSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  className?: string;
  children: React.ReactNode;
}

export function CustomSelect({
  className,
  children,
  ...props
}: CustomSelectProps) {
  return (
    <div className="relative inline-block w-full">
      <select
        {...props}
        className={cn(
          "w-full appearance-none bg-white border border-gray-200 rounded-lg text-sm text-gray-900",
          "pl-3 pr-10 py-2",
          "focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {children}
      </select>
      <span
        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
        aria-hidden
      >
        <ChevronDown className="w-4 h-4" />
      </span>
    </div>
  );
}

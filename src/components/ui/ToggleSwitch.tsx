import { cn } from "@/utils/cn";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: ToggleSwitchProps) {
  return (
    <label
      className={cn("inline-flex items-center gap-3 select-none", className)}
    >
      <input
        type='checkbox'
        className='sr-only'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
          checked ? "bg-primary-600" : "bg-gray-200",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        aria-checked={checked}
        role='switch'
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </span>
      {label && <span className='text-sm text-gray-700'>{label}</span>}
    </label>
  );
}

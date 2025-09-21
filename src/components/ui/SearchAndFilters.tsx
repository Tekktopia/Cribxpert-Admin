import {Search, X } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  key: string;
  label: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
  className?: string;
}

interface SearchAndFiltersProps {
  // Search functionality
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters?: FilterConfig[];

  // Action buttons
  actionButtons?: ActionButton[];

  // Results info
  resultsInfo?: {
    total: number;
    filtered: number;
    entityName: string; // e.g., "users", "listings", "bookings"
  };

  // Active filters display
  showActiveFilters?: boolean;
  onClearFilters?: () => void;

  // Layout
  className?: string;
}

export function SearchAndFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  actionButtons = [],
  resultsInfo,
  showActiveFilters = true,
  onClearFilters,
  className = "",
}: SearchAndFiltersProps) {
  // Get active filters for display
  const activeFilters = filters.filter(
    (filter) => filter.value !== "" && filter.value !== "all"
  );

  const getButtonVariant = (variant?: string) => {
    switch (variant) {
      case "primary":
        return "bg-white hover:bg-gray-50 text- border border-gray-200 px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-sm";
      case "secondary":
        return "bg-white hover:bg-gray-50 text- border border-gray-200 px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-sm";
      case "outline":
        return "bg-white hover:bg-gray-50 text- border border-gray-200 px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-sm";
      default:
        return "bg-white hover:bg-gray-50 text- border border-gray-200 px-6 py-2.5 font-medium transition-all duration-200 hover:shadow-sm";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main search and filters row */}
      <div className=''>
        <div className='flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between'>
          <div className='flex flex-col w-full sm:flex-row gap-4 items-start sm:items-center justify-between flex-1'>
            {/* Search Input */}
            <div className='relative flex-1 w-full lg:max-w-sm'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search className='h-5 w-5 text-gray-400' />
              </div>
              <input
                type='text'
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className='block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-sm transition-colors'
              />
            </div>

            <div className='flex gap-2'>
              {/* Dynamic Filters */}
              {filters.map((filter) => (
                <div key={filter.key} className='relative'>
                  <select
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className='appearance-none bg-white border border-gray-200 rounded-md px-3 py-2.5 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 cursor-pointer transition-colors hover:border-gray-300'
                  >
                    <option value='all'>
                      {filter.label}
                    </option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {/* Action Buttons */}
              {actionButtons.length > 0 && (
                <div className='flex items-center gap-2'>
                  {actionButtons.map((button, index) => (
                    <Button
                      key={index}
                      onClick={button.onClick}
                      className={`${getButtonVariant(button.variant)} ${
                        button.className || ""
                      }`}
                      size='sm'
                    >
                      {button.label}

                      {button.icon}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active filters and results info */}
      {(showActiveFilters && activeFilters.length > 0) || resultsInfo ? (
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          {/* Active Filters */}
          {showActiveFilters && activeFilters.length > 0 && (
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-sm text-gray-500 font-medium'>
                Filters:
              </span>
              {activeFilters.map((filter) => {
                const selectedOption = filter.options.find(
                  (opt) => opt.value === filter.value
                );
                return (
                  <Badge
                    key={filter.key}
                    variant='secondary'
                    className='flex items-center gap-1 px-2 py-1'
                  >
                    <span className='text-xs'>
                      {filter.label}: {selectedOption?.label || filter.value}
                    </span>
                    <button
                      onClick={() => filter.onChange("all")}
                      className='ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors'
                    >
                      <X className='w-3 h-3' />
                    </button>
                  </Badge>
                );
              })}
              {onClearFilters && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onClearFilters}
                  className='text-gray-500 hover:text-gray-700 px-2 py-1 h-auto'
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

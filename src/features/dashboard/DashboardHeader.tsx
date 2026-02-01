import PageTitle from "../../components/layout/PageTitle";
import { Button } from "../../components/ui/button";

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  timeFilterOptions?: Array<{ value: string; label: string }>;
  primaryButtonText?: string;
  showSecondaryButton?: boolean;
  secondaryButtonText?: string;
  onTimeFilterChange?: (value: string) => void;
  onPrimaryButtonClick?: () => void;
  onSecondaryButtonClick?: () => void;
}

export function DashboardHeader({
  title = "Dashboard",
  subtitle = "Overview of key metrics and activities",
  timeFilterOptions = [
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'this-year', label: 'This Year' },
  ],
  primaryButtonText = "Generate Report",
  showSecondaryButton = false,
  secondaryButtonText = "Filter",
  onTimeFilterChange,
  onPrimaryButtonClick,
  onSecondaryButtonClick,
}: DashboardHeaderProps) {
  const handleTimeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onTimeFilterChange) {
      onTimeFilterChange(e.target.value);
    }
  };

  const handlePrimaryButtonClick = () => {
    if (onPrimaryButtonClick) {
      onPrimaryButtonClick();
    }
  };

  const handleSecondaryButtonClick = () => {
    if (onSecondaryButtonClick) {
      onSecondaryButtonClick();
    }
  };

  return (
    <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
      <PageTitle title={title} subtitle={subtitle} />
      
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
        {/* Time Filter Dropdown */}
        <div className='relative min-w-[160px]'>
          <select 
            onChange={handleTimeFilterChange}
            className='appearance-none w-full bg-white border border-gray-200 rounded-md px-4 py-2 pr-8 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent cursor-pointer'
            defaultValue={timeFilterOptions[0]?.value}
          >
            {timeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
            <svg
              className='w-4 h-4 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </div>
        </div>
        
        {/* Optional Secondary Button */}
        {showSecondaryButton && (
          <Button
            variant='outline'
            onClick={handleSecondaryButtonClick}
            className='border-primary-600 text-primary-600 hover:bg-primary-50 whitespace-nowrap'
          >
            {secondaryButtonText}
          </Button>
        )}
        
        {/* Primary Button */}
        <Button
          variant='outline'
          onClick={handlePrimaryButtonClick}
          className='bg-primary-600 hover:bg-primary-700 text-white border-0 hover:text-white whitespace-nowrap'
        >
          {primaryButtonText}
        </Button>
      </div>
    </div>
  );
}

// Optional: Create a Finance-specific version
export function FinanceDashboardHeader(props: Omit<DashboardHeaderProps, 'title' | 'subtitle'> & {
  title?: string;
  subtitle?: string;
}) {
  return (
    <DashboardHeader
      title={props.title || "Finance Dashboard"}
      subtitle={props.subtitle || "Financial metrics and transaction overview"}
      timeFilterOptions={[
        { value: 'today', label: 'Today' },
        { value: 'this-week', label: 'This Week' },
        { value: 'this-month', label: 'This Month' },
        { value: 'this-quarter', label: 'This Quarter' },
        { value: 'this-year', label: 'This Year' },
      ]}
      primaryButtonText={props.primaryButtonText || "Download Financial Report"}
      showSecondaryButton={props.showSecondaryButton ?? true}
      secondaryButtonText={props.secondaryButtonText || "Filter Transactions"}
      {...props}
    />
  );
}
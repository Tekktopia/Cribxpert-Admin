import PageTitle from "@/components/layout/PageTitle";
import { Button } from "@/components/ui/button";

export function AnalyticsHeader() {
  return (
    <div className='flex items-start justify-between'>
      <PageTitle
        title='Analytics'
        subtitle='Get insights into user behavior, growth metrics, and listing performance'
      />
      <div className='flex items-center space-x-4'>
        <div className='relative'>
          <select className='appearance-none bg-white border border-gray-200 rounded-md px-4 py-2 pr-8 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent cursor-pointer'>
            <option value='this-week'>This Week</option>
            <option value='this-month'>This Month</option>
            <option value='this-year'>This Year</option>
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
        <Button
          variant='outline'
          className='bg-primary-600 hover:bg-primary-700 text-white border-0'
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
}

import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";

export function DashboardPage() {
  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>
              Dashboard Overview
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Monitor your platform performance and manage operations
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <select className='appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent cursor-pointer'>
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
            <Button variant='primary'>
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

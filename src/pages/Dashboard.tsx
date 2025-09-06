import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Users, Building, Calendar, DollarSign } from "lucide-react";
import { MetricCard } from "../features/dashboard/MetricCard";

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
          </div>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <select className='appearance-none bg-white border border-gray-200 px-4 py-2 pr-8 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent cursor-pointer'>
                <option value='this-month'>This Month</option>
                <option value='this-week'>This Week</option>
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
          </div>
        </div>

        {/* Metrics Cards */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Total Users */}
          <MetricCard
            title='Total Users'
            value='0'
            change={0}
            icon={Users}
            iconBgColor='bg-blue-500'
            changeText='this month'
          />

          {/* Active Listings */}
          <MetricCard
            title='Active Listings'
            value='0'
            change={0}
            icon={Building}
            iconBgColor='bg-blue-500'
            changeText='this week'
          />

          {/* Weekly Bookings */}
          <MetricCard
            title='Weekly Bookings'
            value='0'
            change={0}
            icon={Calendar}
            iconBgColor='bg-amber-500'
            changeText='vs last month'
          />

          {/* Total Revenue */}
          <MetricCard
            title='Total Revenue'
            value='$0'
            change={0}
            icon={DollarSign}
            iconBgColor='bg-green-500'
            changeText='vs last month'
          />
        </div>

        {/* Empty State */}
        <div className='p-12'>
          <div className='text-center'>
            {/* Illustration */}
            <div className='mx-auto w-64 h-48 mb-8'>
              <svg viewBox='0 0 200 150' className='w-full h-full'>
                {/* Dashboard mockup */}
                <rect
                  x='20'
                  y='20'
                  width='160'
                  height='110'
                  rx='8'
                  fill='#f3f4f6'
                  stroke='#e5e7eb'
                  strokeWidth='1'
                />

                {/* Charts */}
                <rect
                  x='30'
                  y='35'
                  width='70'
                  height='40'
                  rx='4'
                  fill='#e0f2fe'
                />
                <rect
                  x='110'
                  y='35'
                  width='60'
                  height='40'
                  rx='4'
                  fill='#ecfdf5'
                />

                {/* Bars */}
                <rect x='35' y='60' width='6' height='10' fill='#0ea5e9' />
                <rect x='45' y='55' width='6' height='15' fill='#0ea5e9' />
                <rect x='55' y='50' width='6' height='20' fill='#0ea5e9' />
                <rect x='65' y='58' width='6' height='12' fill='#0ea5e9' />

                {/* Line chart */}
                <polyline
                  points='115,65 125,55 135,60 145,45 155,50'
                  stroke='#10b981'
                  strokeWidth='2'
                  fill='none'
                />
                <circle cx='115' cy='65' r='2' fill='#10b981' />
                <circle cx='125' cy='55' r='2' fill='#10b981' />
                <circle cx='135' cy='60' r='2' fill='#10b981' />
                <circle cx='145' cy='45' r='2' fill='#10b981' />
                <circle cx='155' cy='50' r='2' fill='#10b981' />

                {/* Bottom section */}
                <rect
                  x='30'
                  y='85'
                  width='140'
                  height='35'
                  rx='4'
                  fill='#fafafa'
                />

                {/* People illustrations */}
                <g transform='translate(70, 100)'>
                  {/* Person 1 */}
                  <circle cx='15' cy='8' r='6' fill='#3b82f6' />
                  <rect
                    x='10'
                    y='12'
                    width='10'
                    height='12'
                    rx='2'
                    fill='#3b82f6'
                  />

                  {/* Person 2 */}
                  <circle cx='35' cy='8' r='6' fill='#10b981' />
                  <rect
                    x='30'
                    y='12'
                    width='10'
                    height='12'
                    rx='2'
                    fill='#10b981'
                  />
                </g>
              </svg>
            </div>

            <h3 className='text-xl font-semibold text-gray-900 mb-2'>
              Your dashboard is quiet... for now.
            </h3>
            <p className='text-gray-500 mb-8 max-w-md mx-auto'>
              Once Users Start Signing Up, Listings Are Added, And Bookings Roll
              In, You'll See Your Key Platform Metrics Here — All In One Place.
            </p>

            <Button
              variant='primary'
              className='mx-auto'
              onClick={() => window.location.reload()}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

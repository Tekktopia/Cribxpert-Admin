import { Button } from "../../components/ui/button";

export function DashboardEmptyState() {
  return (
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
            <rect x='30' y='35' width='70' height='40' rx='4' fill='#e0f2fe' />
            <rect x='110' y='35' width='60' height='40' rx='4' fill='#ecfdf5' />

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
            <rect x='30' y='85' width='140' height='35' rx='4' fill='#fafafa' />

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
          Once Users Start Signing Up, Listings Are Added, And Bookings Roll In,
          You'll See Your Key Platform Metrics Here — All In One Place.
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
  );
}

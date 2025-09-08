import { Button } from "../../components/ui/button";

export function UserMgmtEmptyState() {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='text-center max-w-md'>
        {/* Phone/App Icon Illustration */}
        <div className='mx-auto w-20 h-20 mb-6'>
          <div className='relative'>
            {/* Phone outline */}
            <div className='w-16 h-20 mx-auto bg-white border-2 border-primary-600 rounded-lg relative'>
              {/* Screen */}
              <div className='absolute top-2 left-2 right-2 bottom-2 bg-gray-50 rounded-md'>
                {/* User icons on screen */}
                <div className='grid grid-cols-2 gap-1 p-2 h-full'>
                  <div className='bg-gray-300 rounded-full w-4 h-4'></div>
                  <div className='bg-gray-300 rounded-full w-4 h-4'></div>
                  <div className='bg-gray-300 rounded-full w-4 h-4'></div>
                  <div className='bg-gray-300 rounded-full w-4 h-4'></div>
                </div>
              </div>
              {/* Home indicator */}
              <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gray-400 rounded-full'></div>
            </div>
            {/* primary accent */}
            <div className='absolute -top-1 -right-1 w-4 h-4 bg-primary-600 rounded-full'></div>
          </div>
        </div>

        <h3 className='text-xl font-semibold text-gray-900 mb-2'>
          No users yet
        </h3>
        <p className='text-gray-500 mb-6'>
          Users Will Appear Here Once They Sign Up As Guests Or Hosts.
        </p>

        <Button
          className='bg-primary-600 hover:bg-primary-700 text-white px-6 py-2'
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}

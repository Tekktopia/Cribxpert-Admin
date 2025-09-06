import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export function Topbar() {
  return (
    <header className='bg-white border-b border-gray-200 px-6 py-4'>
      <div className='flex items-center justify-between'>
        {/* Search Bar */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search...'
            className='px-8 py-2 w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm bg-[#F2F2F2]'
          />
        </div>

        {/* Right Section */}
        <div className='flex items-center space-x-4'>
          {/* Notifications */}
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='w-5 h-5' />
            <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full'></span>
          </Button>

          {/* User Avatar */}
          <div className='flex items-center space-x-3'>
            <Avatar className='w-8 h-8'>
              <AvatarImage src='/api/placeholder/32/32' alt='Jasmine D.' />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className='text-right'>
              <p className='text-sm font-medium text-gray-900'>Jasmine D.</p>
              <p className='text-xs text-gray-500'>Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

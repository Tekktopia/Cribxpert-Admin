import { Search, Bell, Menu } from "lucide-react";
import { memo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

interface TopbarProps {
  onMenuClick?: () => void;
}

export const Topbar = memo(function Topbar({ onMenuClick }: TopbarProps) {
  // Memoize the menu click handler
  const handleMenuClick = useCallback(() => {
    onMenuClick?.();
  }, [onMenuClick]);
  return (
    <header className='bg-white border-b border-gray-200 px-4 py-4 sm:px-6'>
      <div className='flex items-center justify-between'>
        {/* Left Section - Mobile menu + Search */}
        <div className='flex items-center space-x-4'>
          {/* Mobile menu button */}
          <Button
            variant='ghost'
            size='icon'
            className='lg:hidden'
            onClick={handleMenuClick}
          >
            <Menu className='w-5 h-5' />
          </Button>

          {/* Search Bar */}
          <div className='relative hidden sm:block'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search...'
              className='px-8 py-2 w-60 sm:w-80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm bg-[#F2F2F2]'
            />
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center space-x-2 sm:space-x-4'>
          {/* Mobile search button */}
          <Button variant='ghost' size='icon' className='sm:hidden'>
            <Search className='w-5 h-5' />
          </Button>

          {/* Notifications */}
          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='w-5 h-5' />
            <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full'></span>
          </Button>

          {/* User Avatar */}
          <div className='flex items-center space-x-2 sm:space-x-3'>
            <Avatar className='w-8 h-8'>
              <AvatarImage src='/api/placeholder/32/32' alt='Jasmine D.' />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className='hidden sm:block text-sm'>
              <div className='font-medium text-gray-900'>Jasmine D.</div>
              <div className='text-gray-500'>Super Admin</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

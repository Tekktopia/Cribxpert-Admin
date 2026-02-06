import { Search, Bell, Menu } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useAppSelector } from "@/store/hooks";

interface TopbarProps {
  onMenuClick?: () => void;
}

// Helper function to get initials from name
const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to get role display name
const getRoleDisplay = (roles: unknown): string => {
  if (!roles || typeof roles !== "object") return "User";
  
  const rolesObj = roles as { SuperAdmin?: number; Admin?: number };
  
  // Check for SuperAdmin first (role code 5150)
  if (rolesObj.SuperAdmin === 1995) {
    return "Super Admin";
  }
  // Check for Admin (role code 1984)
  if (rolesObj.Admin === 1996) {
    return "Admin";
  }
  // Default to User
  return "User";
};

export const Topbar = memo(function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAppSelector((state) => state.auth);
  
  // Memoize the menu click handler
  const handleMenuClick = useCallback(() => {
    onMenuClick?.();
  }, [onMenuClick]);

  // Get user display information
  const userDisplay = useMemo(() => {
    if (!user) {
      return {
        name: "Guest",
        role: "User",
        initials: "GU",
      };
    }

    const fullName = (user.fullName as string) || (user.name as string) || user.email || "User";
    
    // Check role field first, then roles object
    let role = "User";
    if (user.role && typeof user.role === "string") {
      role = user.role === "SuperAdmin" ? "Super Admin" : user.role;
    } else {
      role = getRoleDisplay(user.roles);
    }
    
    const initials = getInitials(fullName);

    return {
      name: fullName,
      role,
      initials,
    };
  }, [user]);
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
              <AvatarImage src='/api/placeholder/32/32' alt={userDisplay.name} />
              <AvatarFallback>{userDisplay.initials}</AvatarFallback>
            </Avatar>
            <div className='hidden sm:block text-sm'>
              <div className='font-medium text-gray-900'>{userDisplay.name}</div>
              <div className='text-gray-500'>{userDisplay.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

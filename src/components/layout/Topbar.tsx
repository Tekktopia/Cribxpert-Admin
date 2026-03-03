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

// Format role string for display (e.g. "FinanceAdmin" -> "Finance Admin")
const formatRoleLabel = (role: string): string => {
  if (!role) return "User";
  const r = role.trim();
  const lower = r.toLowerCase();
  if (lower === "superadmin") return "Super Admin";
  if (lower === "admin") return "Admin";
  if (lower === "financeadmin") return "Finance Admin";
  if (lower === "csradmin") return "CSR Admin";
  return r;
};

// Derive role from API roles object (priority: SuperAdmin > Admin > FinanceAdmin > CSRAdmin)
const getRoleDisplay = (roles: unknown): string => {
  if (roles == null) return "User";
  let rolesObj: Record<string, number> | undefined;
  if (typeof roles === "object" && !Array.isArray(roles)) {
    rolesObj = roles as Record<string, number>;
  } else if (typeof roles === "string") {
    try {
      const parsed = JSON.parse(roles) as Record<string, number>;
      if (parsed && typeof parsed === "object") rolesObj = parsed;
    } catch {
      return "User";
    }
  }
  if (!rolesObj) return "User";
  // Check in order of precedence (highest first)
  if (rolesObj.SuperAdmin != null && rolesObj.SuperAdmin !== 0) return "Super Admin";
  if (rolesObj.Admin != null && rolesObj.Admin !== 0) return "Admin";
  if (rolesObj.FinanceAdmin != null && rolesObj.FinanceAdmin !== 0) return "Finance Admin";
  if (rolesObj.CSRAdmin != null && rolesObj.CSRAdmin !== 0) return "CSR Admin";
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

    // Resolve role: prefer string role from API, then derive from roles object
    let role = "User";
    const roleStr = user.role && typeof user.role === "string" ? user.role.trim() : "";
    if (roleStr) {
      role = formatRoleLabel(roleStr);
    } else if (user.roles != null) {
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

          {/* User Avatar (initials when no avatar URL) + Role */}
          <div className='flex items-center space-x-2 sm:space-x-3'>
            <Avatar className='w-8 h-8 shrink-0'>
              {typeof user?.avatar === "string" && user.avatar ? (
                <AvatarImage src={user.avatar} alt={userDisplay.name} />
              ) : null}
              <AvatarFallback className='bg-primary-100 text-primary-700 text-xs font-semibold'>
                {userDisplay.initials}
              </AvatarFallback>
            </Avatar>
            <div className='hidden sm:block text-sm min-w-0'>
              <div className='font-medium text-gray-900 truncate'>{userDisplay.name}</div>
              <div className='text-gray-500'>{userDisplay.role}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});

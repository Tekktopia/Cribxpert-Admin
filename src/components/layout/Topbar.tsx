import { Search, Bell, Menu, ChevronDown, Settings, LogOut, ArrowLeft } from "lucide-react";
import { memo, useCallback, useMemo, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { useAppSelector } from "@/store/hooks";
import { clearUser } from "@/features/auth/authSlice";

interface TopbarProps {
  onMenuClick?: () => void;
}

// Helper functions remain unchanged
const getInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatRoleLabel = (role: string): string => {
  if (!role) return "User";
  const r = role.trim();
  const lower = r.toLowerCase();
  if (lower === "superadmin" || lower === "super_admin") return "Super Admin";
  if (lower === "admin") return "Admin";
  if (lower === "financeadmin" || lower === "finance_admin") return "Finance Admin";
  if (lower === "csradmin" || lower === "csr_admin") return "CSR Admin";
  return r;
};

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
  if (rolesObj.SuperAdmin != null && rolesObj.SuperAdmin !== 0) return "Super Admin";
  if (rolesObj.Admin != null && rolesObj.Admin !== 0) return "Admin";
  if (rolesObj.FinanceAdmin != null && rolesObj.FinanceAdmin !== 0) return "Finance Admin";
  if (rolesObj.CSRAdmin != null && rolesObj.CSRAdmin !== 0) return "CSR Admin";
  return "User";
};

export const Topbar = memo(function Topbar({ onMenuClick }: TopbarProps) {
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const profile  = useAppSelector((state) => state.auth.profile);
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleMenuClick = useCallback(() => {
    onMenuClick?.();
  }, [onMenuClick]);

  const toggleProfileMenu = useCallback(() => {
    setShowProfileMenu(prev => !prev);
  }, []);

  const closeProfileMenu = useCallback(() => {
    setShowProfileMenu(false);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(clearUser());
    closeProfileMenu();
    window.location.href = '/login';
  }, [dispatch, closeProfileMenu]);

  const userDisplay = useMemo(() => {
    if (!user && !profile) {
      return { name: "Guest", role: "User", initials: "GU", email: "" };
    }

    // Prefer profile data (has the real app role); fall back to auth user metadata
    const fullName =
      profile?.full_name ||
      (user as any)?.user_metadata?.full_name ||
      (user as any)?.fullName ||
      user?.email ||
      "User";

    // profile.role is the authoritative app role (superadmin / admin / csr_admin …)
    const roleStr = profile?.role || (user as any)?.role || "";
    const role = roleStr ? formatRoleLabel(roleStr) : "User";

    return {
      name: fullName,
      role,
      initials: getInitials(fullName),
      email: profile?.email || user?.email || "",
    };
  }, [user, profile]);

  // Show "Back to Main Dashboard" when a superadmin is browsing a CSR page
  const isSuperAdmin = (profile?.role ?? "") === "superadmin";
  const isOnCSRPage = location.pathname.startsWith("/csr");
  const showBackButton = isSuperAdmin && isOnCSRPage;

  return (
    <header className='bg-white border-b border-gray-200 px-4 py-4 sm:px-6'>
      <div className='flex items-center justify-between'>
        {/* Left Section - Mobile menu + Search + Back button */}
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

          {/* Back to Main Dashboard button for Super Admin on CSR pages */}
          {showBackButton && (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Main Dashboard</span>
            </Link>
          )}

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

        {/* Right Section - unchanged */}
        <div className='flex items-center space-x-2 sm:space-x-4'>
          <Button variant='ghost' size='icon' className='sm:hidden'>
            <Search className='w-5 h-5' />
          </Button>

          <Button variant='ghost' size='icon' className='relative'>
            <Bell className='w-5 h-5' />
            <span className='absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full'></span>
          </Button>

          {/* User Avatar + Role dropdown */}
          <div className='relative' ref={menuRef}>
            <button
              onClick={toggleProfileMenu}
              className='flex items-center cursor-pointer space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity focus:outline-none'
            >
              <Avatar className='w-8 h-8 shrink-0 cursor-pointer'>
                {typeof (user as any)?.avatar === "string" && (user as any).avatar ? (
                  <AvatarImage src={(user as any).avatar} alt={userDisplay.name} />
                ) : null}
                <AvatarFallback className='bg-primary-100 text-primary-700 text-xs font-semibold'>
                  {userDisplay.initials}
                </AvatarFallback>
              </Avatar>
              <div className='hidden text-left sm:block text-sm min-w-0'>
                <div className='font-medium text-gray-900 truncate'>{userDisplay.name}</div>
                <span className='inline-block text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full'>
                  {userDisplay.role}
                </span>
              </div>
              <ChevronDown
                className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''
                  }`}
              />
            </button>

            {showProfileMenu && (
              <>
                <div
                  className='fixed inset-0 z-40 cursor-pointer'
                  onClick={closeProfileMenu}
                />
                <div className='absolute right-0 top-[calc(100%+8px)] w-80 cursor-pointer bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden'>
                  <div className='px-4 py-3 border-b border-gray-200 bg-gray-50 cursor-pointer'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='w-10 h-10'>
                        {typeof (user as any)?.avatar === "string" && (user as any).avatar ? (
                          <AvatarImage src={(user as any).avatar} alt={userDisplay.name} />
                        ) : null}
                        <AvatarFallback className='bg-primary-100 text-primary-700 text-sm font-semibold'>
                          {userDisplay.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='font-semibold text-gray-900'>
                          {userDisplay.name}
                        </p>
                        <p className='text-gray-500 text-sm truncate'>
                          {userDisplay.email}
                        </p>
                        <span className='inline-block mt-1 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full'>
                          {userDisplay.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <ul className='py-2'>
                    <li>
                      <Link
                        to='/settings'
                        className='flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                        onClick={closeProfileMenu}
                      >
                        <Settings className='w-4 h-4 mr-3 text-gray-400' />
                        Settings
                      </Link>
                    </li>
                    <li className='border-t border-gray-200 mt-1 pt-1'>
                      <button
                        className='flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors'
                        onClick={handleLogout}
                      >
                        <LogOut className='w-4 h-4 mr-3 text-red-500' />
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});
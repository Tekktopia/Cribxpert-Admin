import {
  LayoutDashboard,
  Users,
  SlidersHorizontal,
  CalendarCheck,
  Shield,
  MessageSquare,
  BarChart3,
  DollarSign,
  Bell,
  Settings,
  UserCog,
  LogOut,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn"; 

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
  },
  {
    label: "Listings",
    icon: SlidersHorizontal,
    href: "/listings",
  },
  {
    label: "Bookings",
    icon: CalendarCheck,
    href: "/bookings",
  },
  {
    label: "KYC",
    icon: Shield,
    href: "/kyc",
  },
  {
    label: "Messaging",
    icon: MessageSquare,
    href: "/messaging",
  },
  {
    label: "Booking Metrics",
    icon: BarChart3,
    href: "/booking-metrics",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "Financials",
    icon: DollarSign,
    href: "/financials",
  },
  {
    label: "Notification",
    icon: Bell,
    href: "/notifications",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Admin Roles",
    icon: UserCog,
    href: "/admin-roles",
  },
  // {
  //   label: "Text Menu",
  //   icon: UserCog,
  //   href: "#",
  // },
  {
    label: "Logout",
    icon: LogOut,
    href: "/log-out",
  },
];

export function Sidebar({ className, isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={cn(
        "w-64 h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out overflow-hidden",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      {/* Mobile close button */}
      <div className='lg:hidden flex justify-between p-4 flex-shrink-0'>
        <div className='flex items-center space-x-3'>
          <span className='text-xl font-bold text-[25px] text-primary-600'>
            Cribxpert
          </span>
        </div>

        <button
          onClick={onClose}
          className='p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>
      </div>

      {/* Logo */}
      <div className='hidden lg:flex px-6 py-6 lg:py-6 flex-shrink-0'>
        <div className='flex items-center space-x-3'>
          <span className='text-xl font-bold text-[25px] text-primary-600'>
            Cribxpert
          </span>
        </div>
      </div>

      <div className='scrollbar-track-transparent hover:scrollbar-thumb-gray-400'></div>
      {/* Navigation - Scrollable */}
      <nav className='flex-1 px-4 py-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 '>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          // Use path matching for better sub-page detection
          const isActive =
            item.href === "#" || item.href === "/log-out"
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose} // Close mobile sidebar when navigating
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className='w-5 h-5 mr-3' />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

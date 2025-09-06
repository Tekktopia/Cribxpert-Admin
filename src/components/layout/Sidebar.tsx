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
  Menu,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
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
    href: "/",
    active: true,
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
];

export function Sidebar({ className, isOpen = false, onClose }: SidebarProps) {
  return (
    <div
      className={cn(
        "w-64 h-screen lg:h-auto lg:min-h-screen bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out overflow-hidden",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}
    >
      {/* Mobile close button */}
      <div className='lg:hidden flex justify-end p-4 flex-shrink-0'>
        <button
          onClick={onClose}
          className='p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>
      </div>

      {/* Logo */}
      <div className='px-6 py-6 lg:py-6 flex-shrink-0'>
        <div className='flex items-center space-x-3'>
          <span className='text-xl font-bold text-[25px] text-primary-600'>
            Cribxpert
          </span>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className='flex-1 px-4 py-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400'>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                item.active
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className='w-5 h-5 mr-3' />
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Bottom Section - Fixed */}
      <div className='flex-shrink-0 px-4 pb-4 space-y-2 pt-4'>
        {/* Text Menu */}
        <button className='flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-white transition-colors'>
          <div className='flex items-center'>
            <Menu className='w-5 h-5 mr-3' />
            Text Menu
          </div>
          <ChevronDown className='w-4 h-4 text-gray-400' />
        </button>

        <button className='flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-white transition-colors'>
          <LogOut className='w-5 h-5 mr-3' />
          Logout
        </button>
      </div>
    </div>
  );
}

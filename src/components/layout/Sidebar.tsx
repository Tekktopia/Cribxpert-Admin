import {
  X,
  LayoutGrid,
  ArrowLeftRight,
  Wallet,
  RefreshCcw,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { memo, useMemo, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import { cn } from "../../utils/cn";
import { SvgIcon } from "@/components/ui/SvgIcon";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

type NavItem =
  | { label: string; href: string; iconSrc: string; icon?: never }
  | { label: string; href: string; icon: LucideIcon; iconSrc?: never };

// Move navigation items outside component to prevent recreation on every render
const navigationItems: NavItem[] = [
  {
    label: "Dashboard",
    iconSrc: "/sidebar/dashboard-square-remove.svg",
    href: "/dashboard",
  },
  {
    label: "Users",
    iconSrc: "/sidebar/user-multiple-02.svg",
    href: "/users",
  },
  {
    label: "Listings",
    iconSrc: "/sidebar/list-setting.svg",
    href: "/listings",
  },
  {
    label: "Bookings",
    iconSrc: "/sidebar/calendar-edit.svg",
    href: "/bookings",
  },
  {
    label: "KYC",
    iconSrc: "/sidebar/card-tick.svg",
    href: "/kyc",
  },
  {
    label: "Messaging",
    iconSrc: "/sidebar/mail-01.svg",
    href: "/messaging",
  },
  {
    label: "Booking Metrics",
    iconSrc: "/sidebar/pixel_analytics.svg",
    href: "/booking-metrics",
  },
  {
    label: "Analytics",
    iconSrc: "/sidebar/material-symbols_analytics-outline.svg",
    href: "/analytics",
  },
  {
    label: "Financials",
    iconSrc: "/sidebar/fluent-mdl2_financial.svg",
    href: "/financials",
  },
  {
    label: "Finance Dashboard",
    icon: LayoutGrid,
    href: "/finance-dashboard",
  },
  {
    label: "Payouts",
    icon: Wallet,
    href: "/finance-payouts",
  },
  {
    label: "Refunds",
    icon: RefreshCcw,
    href: "/finance-refunds",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    href: "/finance-transactions",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/finance-reports",
  },
  {
    label: "Notification",
    iconSrc: "/sidebar/notification-block-03.svg",
    href: "/notifications",
  },
  {
    label: "Settings",
    iconSrc: "/sidebar/setting-2.svg",
    href: "/settings",
  },
  {
    label: "Admin Management",
    iconSrc: "/sidebar/carbon_user-role.svg",
    href: "/admin-management",
  },
  {
    label: "Logout",
    iconSrc: "/sidebar/logout-01.svg",
    href: "/log-out",
  },
];

// FinanceAdmin only sees these sidebar items
const FINANCE_ADMIN_HREFS = new Set([
  "/finance-dashboard",
  "/finance-payouts",
  "/finance-refunds",
  "/finance-transactions",
  "/finance-reports",
  "/settings",
  "/log-out",
]);

function isNavItemVisibleForRole(href: string, role: string): boolean {
  const r = role.trim();
  if (r === "FinanceAdmin") return FINANCE_ADMIN_HREFS.has(href);
  if (r === "Admin" || r === "CSRAdmin") return href !== "/admin-management";
  return true; // SuperAdmin or other: show all
}

export const Sidebar = memo(function Sidebar({
  className,
  isOpen = false,
  onClose,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const role = (useAppSelector((state) => state.auth.user?.role) as string) || "";

  // Memoize the close handler to prevent unnecessary re-renders of child components
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Handle logout
  const handleLogout = useCallback(() => {
    // Clear sessionStorage completely
    if (typeof window !== "undefined") {
      sessionStorage.clear();
    }

    // Dispatch logout action to clear Redux state
    dispatch(logout());

    // Close sidebar if open
    onClose?.();

    // Redirect to login page
    navigate("/login", { replace: true });
  }, [dispatch, navigate, onClose]);

  const renderIcon = (item: NavItem, isActive: boolean) => {
    if ("icon" in item && item.icon) {
      const Icon = item.icon;
      return (
        <Icon
          size={20}
          className={cn("mr-3 shrink-0", isActive ? "text-white" : "text-gray-500")}
        />
      );
    }
    return (
      <SvgIcon
        src={item.iconSrc}
        width={20}
        height={20}
        className="mr-3"
        color={isActive ? "#ffffff" : "#6b7280"}
        alt={`${item.label} icon`}
      />
    );
  };

  // Memoize navigation items rendering (filter by role)
  const navigationLinks = useMemo(() => {
    const visibleItems = navigationItems.filter((item) =>
      isNavItemVisibleForRole(item.href, role)
    );
    return visibleItems.map((item) => {
      // Use path matching for better sub-page detection
      const isActive =
        item.href === "/log-out"
          ? location.pathname === item.href
          : location.pathname.startsWith(item.href);

      // Handle logout separately
      if (item.href === "/log-out") {
        return (
          <button
            key={item.href}
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            {"iconSrc" in item ? (
              <SvgIcon
                src={item.iconSrc}
                width={20}
                height={20}
                className="mr-3"
                color="#6b7280"
                alt={`${item.label} icon`}
              />
            ) : (
              <item.icon size={20} className="mr-3 shrink-0 text-gray-500" />
            )}
            {item.label}
          </button>
        );
      }

      return (
        <Link
          key={item.href}
          to={item.href}
          onClick={handleClose}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-primary-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          {renderIcon(item, isActive)}
          {item.label}
        </Link>
      );
    });
  }, [location.pathname, handleClose, handleLogout, role]);

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
          <SvgIcon
            src='/CribXpert.svg'
            width={120}
            height={32}
            alt='Cribxpert logo'
          />
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
          <SvgIcon
            src='/CribXpert.svg'
            width={140}
            height={40}
            alt='Cribxpert logo'
          />
        </div>
      </div>

      <div className='scrollbar-track-transparent hover:scrollbar-thumb-gray-400'></div>
      {/* Navigation - Scrollable */}
      <nav className='flex-1 px-4 py-1 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 '>
        {navigationLinks}
      </nav>
    </div>
  );
});

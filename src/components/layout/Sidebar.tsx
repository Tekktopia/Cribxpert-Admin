import { X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { memo, useMemo, useCallback } from "react";
import { cn } from "../../utils/cn";
import { SvgIcon } from "@/components/ui/SvgIcon";
import { useAppSelector } from "@/store/hooks";
import { useCsrUnreadCounts } from "@/hooks/useCsrUnreadCounts";

interface NavItem {
  readonly label: string;
  readonly iconSrc: string;
  readonly href: string;
  readonly badgeKey?: "liveChat" | "tickets";
}

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  navigationItems?: ReadonlyArray<NavItem>;
}

const navigationItems: NavItem[] = [
  { label: "Dashboard", iconSrc: "/sidebar/dashboard-square-remove.svg", href: "/dashboard" },
  { label: "Users", iconSrc: "/sidebar/user-multiple-02.svg", href: "/users" },
  { label: "Listings", iconSrc: "/sidebar/list-setting.svg", href: "/listings" },
  { label: "Bookings", iconSrc: "/sidebar/calendar-edit.svg", href: "/bookings" },
  { label: "KYC", iconSrc: "/sidebar/card-tick.svg", href: "/kyc" },
  { label: "Messaging", iconSrc: "/sidebar/mail-01.svg", href: "/messaging" },
  { label: "Booking Metrics", iconSrc: "/sidebar/pixel_analytics.svg", href: "/booking-metrics" },
  { label: "Analytics", iconSrc: "/sidebar/material-symbols_analytics-outline.svg", href: "/analytics" },
  { label: "Financials", iconSrc: "/sidebar/fluent-mdl2_financial.svg", href: "/financials" },
  { label: "Notification", iconSrc: "/sidebar/notification-block-03.svg", href: "/notifications" },
  { label: "Settings", iconSrc: "/sidebar/setting-2.svg", href: "/settings" },
  { label: "Admin Roles", iconSrc: "/sidebar/carbon_user-role.svg", href: "/admin-management" },
  { label: "CSR Tickets", iconSrc: "/sidebar/ticket.svg", href: "/csr/dashboard" },
  { label: "Logout", iconSrc: "/sidebar/logout-01.svg", href: "/log-out" },
];

export const adminNavigationItems = navigationItems;

export const Sidebar = memo(function Sidebar({
  className,
  isOpen = false,
  onClose,
  navigationItems: customNavigationItems, // csr sidebar modification
}: SidebarProps) {
  const location = useLocation();
  const profileRole = useAppSelector((state) => state.auth.profile?.role ?? "");

  // Hide the admin sidebar's "CSR Tickets" shortcut for everyone except
  // superadmin. NOTE: match on the label, not the href — the CSR sidebar's
  // own "Dashboard" entry also points at /csr/dashboard and must stay visible
  // for Supervisors and Agents.
  const baseItems = customNavigationItems ?? navigationItems;
  const items = useMemo(
    () =>
      baseItems.filter(
        (item) => item.label !== "CSR Tickets" || profileRole === "superadmin"
      ),
    [baseItems, profileRole]
  );

  // Only count (and open a realtime channel) when this sidebar actually shows
  // badge-bearing CSR items — keeps the admin/finance sidebars side-effect-free.
  const hasBadges = useMemo(
    () => items.some((item) => "badgeKey" in item && item.badgeKey),
    [items]
  );
  const unread = useCsrUnreadCounts(hasBadges);

  // Memoize the close handler to prevent unnecessary re-renders of child components
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  // Memoize navigation items rendering
  const navigationLinks = useMemo(() => {
    // return navigationItems.map((item) => {
    return items.map((item) => {
      // Use path matching for better sub-page detection
      const isActive =
        item.href === "/log-out"
          ? location.pathname === item.href
          : location.pathname.startsWith(item.href);
      const isLogout = item.label === "Logout";
      const badgeCount = item.badgeKey ? unread[item.badgeKey] : 0;

      return (
        <Link
          key={item.href}
          to={item.href}
          onClick={handleClose}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isLogout && !isActive
              ? "text-red-600 hover:bg-red-50 hover:text-red-700"
              : isActive
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <SvgIcon
            src={item.iconSrc}
            width={20}
            height={20}
            className='mr-3'
            color={isLogout && !isActive ? "#dc2626" : isActive ? "#ffffff" : "#6b7280"}
            alt={`${item.label} icon`}
          />
          <span className="flex-1">{item.label}</span>
          {badgeCount > 0 && (
            <span
              className={cn(
                "ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold leading-none",
                isActive ? "bg-white text-primary-600" : "bg-red-500 text-white"
              )}
              aria-label={`${badgeCount} unread`}
            >
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          )}
        </Link>
      );
    });
  }, [items, location.pathname, handleClose, unread]); // csr sidebar mods

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
            src="/CribXpert.svg"
            width={20}
            height={20}
            className='mr-3'
            color=""
            alt=""
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
            src="/CribXpert.svg"
            width={30}
            height={30}
            className='mr-3'
            color=""
            alt=""
          />
          <span className='text-xl font-bold text-[25px] text-primary-600'>
            Cribxpert
          </span>
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

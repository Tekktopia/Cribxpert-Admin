import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  ArrowLeftRight,
  Wallet,
  RefreshCcw,
  FileText,
  LogOut,
  Ticket,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { SvgIcon } from "@/components/ui/SvgIcon";

// Used by the local FinanceSidebar component below
const financeNavItems = [
  { label: "Dashboard",    icon: LayoutGrid,     href: "/finance-dashboard" },
  { label: "Tickets",      icon: Ticket,         href: "/csr/tickets" },
  { label: "Transactions", icon: ArrowLeftRight, href: "/finance-transactions" },
  { label: "Payouts",      icon: Wallet,         href: "/finance-payouts" },
  { label: "Refunds",      icon: RefreshCcw,     href: "/finance-refunds" },
  { label: "Reports",      icon: FileText,       href: "/finance-reports" },
];

// Shape compatible with the main Sidebar component (iconSrc-based)
export const financeAdminNavigationItems = [
  { label: "Dashboard",    iconSrc: "/sidebar/dashboard-square-remove.svg",     href: "/finance-dashboard" },
  { label: "Tickets",      iconSrc: "/sidebar/ticket.svg",                      href: "/csr/tickets" },
  { label: "Transactions", iconSrc: "/sidebar/fluent-mdl2_financial.svg",       href: "/finance-transactions" },
  { label: "Payouts",      iconSrc: "/sidebar/fluent-mdl2_financial.svg",       href: "/finance-payouts" },
  { label: "Refunds",      iconSrc: "/sidebar/fluent-mdl2_financial.svg",       href: "/finance-refunds" },
  { label: "Reports",      iconSrc: "/sidebar/material-symbols_report-outline.svg", href: "/finance-reports" },
  { label: "Settings",     iconSrc: "/sidebar/setting-2.svg",                   href: "/settings" },
  { label: "Logout",       iconSrc: "/sidebar/logout-01.svg",                   href: "/log-out" },
];

export default function FinanceSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 px-4">
      {/* LOGO*/}
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

      {/* Navigation */}
      <nav className="space-y-1">
        {financeNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                   ? "bg-primary-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-10 px-2">
        <Link
          to="/log-out"
          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </aside>
  );
}

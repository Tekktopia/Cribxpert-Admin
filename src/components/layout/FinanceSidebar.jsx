import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  ArrowLeftRight,
  Wallet,
  RefreshCcw,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "../../utils/cn";

const financeNavItems = [
  {
    label: "Dashboard",
    icon: LayoutGrid,
    href: "/finance-admin/financials",
  },
  {
    label: "Transactions",
    icon: ArrowLeftRight,
    href: "/finance-admin/transactions",
  },
  {
    label: "Payouts",
    icon: Wallet,
    href: "/finance-admin/payouts",
  },
  {
    label: "Refunds",
    icon: RefreshCcw,
    href: "/finance-admin/refunds",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/finance-admin/reports",
  },
];

export default function FinanceSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 px-4">
      {/* LOGO*/}
       <div className='hidden lg:flex px-6 py-6 lg:py-6 flex-shrink-0'>
        <div className='flex items-center space-x-3'>
          <span className='text-xl font-bold text-[25px] text-primary-600'>
            Cribxpert
          </span>
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

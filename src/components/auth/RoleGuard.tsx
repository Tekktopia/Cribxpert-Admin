import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

// Admin‑only paths

// Finance admin paths
const FINANCE_ADMIN_PATHS = [
  "/finance-dashboard",
  "/finance-payouts",
  "/finance-refunds",
  "/finance-transactions",
  "/finance-reports",
  "/settings",
  "/log-out",
];

// CSR paths
const CSR_PATHS = [
  "/csr",
  "/csr/dashboard",
  "/csr/users",
  "/csr/tickets",
  "/csr/disputes",
  "/csr/reports",
  "/csr/notifications",
  "/csr/settings",
  "/settings",
  "/log-out",
];

function isFinancePath(pathname: string) {
  return FINANCE_ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
}
function isCSRPath(pathname: string) {
  return CSR_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
}

export function RoleGuard() {
  const location = useLocation();
  const pathname = location.pathname;
  const role = useAppSelector(state => state.auth.user?.role) || "";

  if (pathname === "/") return <Outlet />;

  const normalizedRole = role.trim();

  // FinanceAdmin: only finance paths
  if (normalizedRole === "FinanceAdmin") {
    if (!isFinancePath(pathname)) {
      return <Navigate to="/finance-dashboard" replace />;
    }
  }

  // Admin or CSRAdmin: block /admin-management
  if (normalizedRole === "Admin" || normalizedRole === "CSRAdmin") {
    if (pathname === "/admin-management") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // CSR: only CSR paths, settings, logout
  if (normalizedRole === "CSR") {
    if (!isCSRPath(pathname)) {
      return <Navigate to="/csr/dashboard" replace />;
    }
  }

  return <Outlet />;
}
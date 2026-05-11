import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

const FINANCE_ADMIN_PATHS = [
  "/finance-dashboard",
  "/finance-payouts",
  "/finance-refunds",
  "/finance-transactions",
  "/finance-reports",
  "/settings",
  "/log-out",
];

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
  // Read role from profile (Supabase string enum)
  const role = useAppSelector(state => state.auth.profile?.role) || "";

  if (pathname === "/") return <Outlet />;

  // finance_admin: only finance paths
  if (role === "finance_admin") {
    if (!isFinancePath(pathname)) {
      return <Navigate to="/finance-dashboard" replace />;
    }
  }

  // admin or csr_admin: block /admin-management (superadmin only)
  if (role === "admin" || role === "csr_admin") {
    if (pathname === "/admin-management") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // csr_admin: only CSR paths, settings, logout
  if (role === "csr_admin") {
    if (!isCSRPath(pathname)) {
      return <Navigate to="/csr/dashboard" replace />;
    }
  }

  return <Outlet />;
}

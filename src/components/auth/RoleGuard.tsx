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

function isFinancePath(pathname: string): boolean {
  return FINANCE_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/**
 * Renders Outlet after checking role-based access.
 * - FinanceAdmin: only finance paths + settings + log-out; else redirect to /finance-dashboard.
 * - Admin / CSRAdmin: all except /admin-management; redirect to /dashboard if they hit admin-management.
 * - SuperAdmin: all paths allowed.
 */
export function RoleGuard() {
  const location = useLocation();
  const pathname = location.pathname;
  const role = (useAppSelector((state) => state.auth.user?.role) as string) || "";

  // Index route "/" is handled by HomeRedirect child
  if (pathname === "/") {
    return <Outlet />;
  }

  const normalizedRole = role.trim();

  if (normalizedRole === "FinanceAdmin") {
    if (!isFinancePath(pathname)) {
      return <Navigate to="/finance-dashboard" replace />;
    }
  }

  if (normalizedRole === "Admin" || normalizedRole === "CSRAdmin") {
    if (pathname === "/admin-management") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}

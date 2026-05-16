import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

const FINANCE_ADMIN_PATHS = [
  "/finance-dashboard",
  "/finance-payouts",
  "/finance-refunds",
  "/finance-transactions",
  "/finance-reports",
  // Finance team also needs access to shared ticket pages
  "/csr/tickets",
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
  "/csr/live-inbox",
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

  // finance_admin / finance_agent: only finance paths + shared tickets
  if (role === "finance_admin" || role === "finance_agent") {
    if (!isFinancePath(pathname)) {
      return <Navigate to="/finance-dashboard" replace />;
    }
  }

  // admin/csr_admin/csr_agent/finance_agent: block /admin-management (superadmin only)
  if (
    role === "admin" ||
    role === "csr_admin" ||
    role === "csr_agent" ||
    role === "finance_admin" ||
    role === "finance_agent"
  ) {
    if (pathname === "/admin-management") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // csr_admin / csr_agent: only CSR paths — land on tickets
  if (role === "csr_admin" || role === "csr_agent") {
    if (!isCSRPath(pathname)) {
      return <Navigate to="/csr/tickets" replace />;
    }
  }

  return <Outlet />;
}

import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

/**
 * Redirects from "/" to the correct home based on role:
 * - FinanceAdmin → /finance-dashboard
 * - Others → /dashboard
 */
export function HomeRedirect() {
  const role = (useAppSelector((state) => state.auth.user?.role) as string) || "";
  const normalizedRole = role.trim();

  if (normalizedRole === "FinanceAdmin") {
    return <Navigate to="/finance-dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

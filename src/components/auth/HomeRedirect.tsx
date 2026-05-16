import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

/**
 * Redirects from "/" to the correct home based on profile.role:
 *   - finance_admin / finance_agent          → /finance-dashboard
 *   - csr_admin / csr_agent / group_*        → /csr/dashboard
 *   - admin / superadmin                     → /dashboard
 */
export function HomeRedirect() {
  const role = (useAppSelector((state) => state.auth.profile?.role) as string) || "";
  const r = role.trim().toLowerCase();

  if (r === "finance_admin" || r === "finance_agent") return <Navigate to="/finance-dashboard" replace />;
  if (r === "csr_admin" || r === "csr_agent" || r === "group_supervisor" || r === "group_agent")
    return <Navigate to="/csr/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
}

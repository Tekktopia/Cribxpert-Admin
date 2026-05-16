import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

/**
 * Redirects from "/" to the correct home based on profile.role:
 *   - finance_admin / finance_agent → /finance-dashboard
 *   - csr_admin / csr_agent         → /csr/tickets
 *   - admin / superadmin            → /dashboard
 */
export function HomeRedirect() {
  const role = (useAppSelector((state) => state.auth.profile?.role) as string) || "";
  const r = role.trim().toLowerCase();

  if (r === "finance_admin" || r === "finance_agent") return <Navigate to="/finance-dashboard" replace />;
  if (r === "csr_admin"     || r === "csr_agent")     return <Navigate to="/csr/tickets" replace />;
  return <Navigate to="/dashboard" replace />;
}

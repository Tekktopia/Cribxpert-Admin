import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import LoadingPage from "@/components/ui/LoadingPage";

const ADMIN_ROLES = ['admin', 'superadmin', 'finance_admin', 'csr_admin', 'csr_agent', 'finance_agent'];

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const profile = useAppSelector((state) => state.auth.profile);

  if (isLoading) return <LoadingPage />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Once profile loads, block non-admin users
  if (profile && !ADMIN_ROLES.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

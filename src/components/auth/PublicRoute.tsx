import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  // Don't redirect while loading initial auth state
  if (isLoading) {
    return <>{children}</>;
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

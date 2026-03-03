import { Navigate } from "react-router-dom";
import { useAppDispatch } from "@/store/hooks";
import { useIsLoggedInQuery } from "@/api/features/auth/authApiSlice";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import LoadingPage from "@/components/ui/LoadingPage";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  
  // Check if admin is logged in via API - only check if we have a token
  const hasToken = typeof window !== "undefined" && sessionStorage.getItem("accessToken");
  const { data, isLoading, error, isSuccess } = useIsLoggedInQuery(undefined, {
    skip: !hasToken, // Skip if no token exists
  });

  // Handle API response - update Redux state when API check succeeds
  useEffect(() => {
    if (isSuccess && data?.user) {
      // Role can be on data.user or at top-level data
      const role =
        (data as { role?: string }).role ??
        (data.user as { role?: string }).role ??
        "";
      const token = sessionStorage.getItem("accessToken") || "";
      dispatch(
        loginSuccess({
          user: {
            id: data.user._id || data.user.id || "",
            _id: data.user._id,
            email: data.user.email,
            name: data.user.name || data.user.fullName || "",
            role,
            fullName: data.user.fullName,
            phoneNo: data.user.phoneNo,
            roles: data.user.roles,
            isVerified: data.user.isVerified,
            lastLogin: data.user.lastLogin,
            createdAt: data.user.createdAt,
            updatedAt: data.user.updatedAt,
          },
          token,
        })
      );
    } else if (error && hasToken) {
      // If API check fails (401 or error) and we have a token, logout
      // This handles expired/invalid tokens
      dispatch(logout());
    }
  }, [data, error, isSuccess, dispatch, hasToken]);

  // Show loading while checking auth status
  if (hasToken && isLoading) {
    return <LoadingPage />;
  }

  // If no token exists, redirect to login
  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  // If API check fails, redirect to login (logout is handled in useEffect)
  if (error) {
    return <Navigate to="/login" replace />;
  }

  // If API check succeeds, show children
  if (isSuccess && data?.user) {
    return <>{children}</>;
  }

  // Default: redirect to login
  return <Navigate to="/login" replace />;
}

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { useIsLoggedInQuery } from "@/api/features/auth/authApiSlice";
import { loginSuccess, logout } from "@/store/slices/authSlice";

/**
 * Global auth checker component that validates JWT token in the background
 * This runs silently without blocking the UI
 * Uses /auth/me endpoint to check if admin is logged in
 */
export function AuthChecker() {
  const dispatch = useAppDispatch();
  
  // Only check if we have a token
  const hasToken = typeof window !== "undefined" && sessionStorage.getItem("accessToken");
  const { data, error, isSuccess } = useIsLoggedInQuery(undefined, {
    skip: !hasToken, // Skip if no token exists
    refetchOnMountOrArgChange: true,
  });

  // Handle API response - update Redux state when API check succeeds
  useEffect(() => {
    if (isSuccess && data?.user) {
      // Update Redux state with the user data from API
      const token = sessionStorage.getItem("accessToken") || "";
      dispatch(
        loginSuccess({
          user: {
            id: data.user._id || data.user.id || "",
            _id: data.user._id,
            email: data.user.email,
            name: data.user.name || data.user.fullName || "",
            role: data.user.role || "",
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

  // This component doesn't render anything
  return null;
}

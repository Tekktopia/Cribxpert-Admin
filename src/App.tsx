import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { NotificationProvider } from "./contexts/NotificationContext";
import { initializeSecurity } from "./security";
import { useEffect, Suspense, lazy } from "react";
import LoadingPage from "./components/ui/LoadingPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { initializeAuth } from "./store/slices/authSlice";

// Lazy load all route components for better performance
const LoginPage = lazy(() =>
  import("./pages/Login").then((module) => ({
    default: module.LoginPage,
  }))
);
const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((module) => ({
    default: module.DashboardPage,
  }))
);
const UsersMgmt = lazy(() => import("./pages/UsersMgmt"));
const UserDetails = lazy(() => import("./pages/UserDetails"));
const ListingMgmt = lazy(() => import("./pages/ListingMgmt"));
const BookingMgmt = lazy(() => import("./pages/BookingMgmt"));
const KYCVerification = lazy(() => import("./pages/KYCVerification"));
const MessagingMgmt = lazy(() => import("./pages/MessagingMgmt"));
const BookingMetrics = lazy(() => import("./pages/BookingMetrics"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const FinancialMgmt = lazy(() => import("./pages/FinancialMgmt"));
const AdminRolesMgmt = lazy(() => import("./pages/AdminRolesMgmt"));
const LogOut = lazy(() => import("./pages/LogOut"));

function App() {
  useEffect(() => {
    initializeSecurity(); // Turn on all security systems
    store.dispatch(initializeAuth()); // Initialize auth state from storage
  }, []);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Public Route - Login */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute>
                    <UsersMgmt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users/:id"
                element={
                  <ProtectedRoute>
                    <UserDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/listings"
                element={
                  <ProtectedRoute>
                    <ListingMgmt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <ProtectedRoute>
                    <BookingMgmt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc"
                element={
                  <ProtectedRoute>
                    <KYCVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messaging"
                element={
                  <ProtectedRoute>
                    <MessagingMgmt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-metrics"
                element={
                  <ProtectedRoute>
                    <BookingMetrics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/financials"
                element={
                  <ProtectedRoute>
                    <FinancialMgmt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-roles"
                element={
                  <ProtectedRoute>
                    <AdminRolesMgmt />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/log-out"
                element={
                  <ProtectedRoute>
                    <LogOut />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;

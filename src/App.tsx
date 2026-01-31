import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { NotificationProvider } from "./contexts/NotificationContext";
import { initializeSecurity } from "./security";
import { useEffect, Suspense, lazy } from "react";
import LoadingPage from "./components/ui/LoadingPage";

import FinanceAdminLayout from "./components/layout/FinanceAdminLayout.jsx";

// Lazy load pages
const DashboardPage = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.DashboardPage }))
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
    initializeSecurity();
  }, []);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              {/* Root */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* ===== EXISTING ADMIN ROUTES (unchanged) ===== */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersMgmt />} />
              <Route path="/users/:id" element={<UserDetails />} />
              <Route path="/listings" element={<ListingMgmt />} />
              <Route path="/bookings" element={<BookingMgmt />} />
              <Route path="/kyc" element={<KYCVerification />} />
              <Route path="/messaging" element={<MessagingMgmt />} />
              <Route path="/booking-metrics" element={<BookingMetrics />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/admin-roles" element={<AdminRolesMgmt />} />
              <Route path="/log-out" element={<LogOut />} />

              {/* ===== FINANCE ADMIN (with layout) ===== */}
              <Route path="/finance-admin" element={<FinanceAdminLayout />}>
                <Route index element={<Navigate to="financials" replace />} />
                <Route path="financials" element={<FinancialMgmt />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;

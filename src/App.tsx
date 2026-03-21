import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { NotificationProvider } from "./contexts/NotificationContext";
import { initializeSecurity } from "./security";
import { useEffect, Suspense, lazy } from "react";
import LoadingPage from "./components/ui/LoadingPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PublicRoute } from "./components/auth/PublicRoute";
import { RoleGuard } from "./components/auth/RoleGuard";
import { HomeRedirect } from "./components/auth/HomeRedirect";
import { initializeAuth } from "./store/slices/authSlice";

const LoginPage = lazy(() =>
  import("./pages/Login").then((module) => ({ default: module.LoginPage }))
);
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
const FinanceDashboard = lazy(() => import("./pages/finance-admin/FinanceDashboard"));
const FinancePayouts = lazy(() => import("./pages/finance-admin/FinancePayouts"));
const FinanceRefunds = lazy(() => import("./pages/finance-admin/FinanceRefunds"));
const FinanceTrans = lazy(() => import("./pages/finance-admin/FinanceTrans"));
const FinanceReports = lazy(() => import("./pages/finance-admin/FinanceReports"));
const AdminRolesMgmt = lazy(() => import("./pages/AdminRolesMgmt"));
const LogOut = lazy(() => import("./pages/LogOut"));

// CSR pages
const SupportDashboard = lazy(() => import("./pages/CSR/SupportDashboard"));
const TicketDetails = lazy(() => import("./pages/CSR/TicketDetails"));
const CSRUsers = lazy(() => import("./pages/CSR/Users"));
const Tickets = lazy(() => import("./pages/CSR/Tickets"));
const Disputes = lazy(() => import("./pages/CSR/Disputes"));
const Reports = lazy(() => import("./pages/CSR/Reports"));
const CSRNotifications = lazy(() => import("./pages/CSR/Notifications"));
const CSRSettings = lazy(() => import("./pages/CSR/Settings"));

function App() {
  useEffect(() => {
    initializeSecurity();
    store.dispatch(initializeAuth());
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
                    <RoleGuard />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomeRedirect />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UsersMgmt />} />
                <Route path="users/:id" element={<UserDetails />} />
                <Route path="listings" element={<ListingMgmt />} />
                <Route path="bookings" element={<BookingMgmt />} />
                <Route path="kyc" element={<KYCVerification />} />
                <Route path="messaging" element={<MessagingMgmt />} />
                <Route path="booking-metrics" element={<BookingMetrics />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="financials" element={<FinancialMgmt />} />
                <Route path="finance-dashboard" element={<FinanceDashboard />} />
                <Route path="finance-payouts" element={<FinancePayouts />} />
                <Route path="finance-refunds" element={<FinanceRefunds />} />
                <Route path="finance-transactions" element={<FinanceTrans />} />
                <Route path="finance-reports" element={<FinanceReports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="admin-management" element={<AdminRolesMgmt />} />
                <Route path="log-out" element={<LogOut />} />

                {/* CSR Routes */}
                <Route path="csr/dashboard" element={<SupportDashboard />} />
                <Route path="csr/users" element={<CSRUsers />} />
                <Route path="csr/tickets" element={<Tickets />} />
                <Route path="csr/tickets/:ticketId" element={<TicketDetails />} />
                <Route path="csr/disputes" element={<Disputes />} />
                <Route path="csr/reports" element={<Reports />} />
                <Route path="csr/notifications" element={<CSRNotifications />} />
                <Route path="csr/settings" element={<CSRSettings />} />
              </Route>

              {/* Finance admin redirects */}
              <Route path="/finance-admin" element={<Navigate to="/finance-dashboard" replace />} />
              <Route path="/finance-admin/*" element={<Navigate to="/finance-dashboard" replace />} />

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;
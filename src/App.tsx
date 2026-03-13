// App.tsx - Update the CSR routes section
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { NotificationProvider } from "./contexts/NotificationContext";
import { initializeSecurity } from "./security";
import { useEffect, Suspense, lazy } from "react";
import LoadingPage from "./components/ui/LoadingPage";

// Lazy load all route components for better performance
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

// CSR pages
const SupportDashboard = lazy(() => import("./pages/CSR/SupportDashboard"));
const TicketDetails = lazy(() => import("./pages/CSR/TicketDetails"));
const CSRUsers = lazy(() => import("./pages/CSR/Users"));
const Tickets = lazy(() => import("./pages/CSR/Tickets")); // Create this if needed
const Disputes = lazy(() => import("./pages/CSR/Disputes")); // Create this if needed
const Reports = lazy(() => import("./pages/CSR/Reports")); // Create this if needed
const CSRNotifications = lazy(() => import("./pages/CSR/Notifications")); // Create this if needed
const CSRSettings = lazy(() => import("./pages/CSR/Settings")); // Create this if needed

function App() {
  useEffect(() => {
    initializeSecurity(); // Turn on all security systems
  }, []);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route path='/' element={<Navigate to='/dashboard' replace />} />
              
              {/* Regular Admin Routes */}
              <Route path='/dashboard' element={<DashboardPage />} />
              <Route path='/users' element={<UsersMgmt />} />
              <Route path='/users/:id' element={<UserDetails />} />
              <Route path='/listings' element={<ListingMgmt />} />
              <Route path='/bookings' element={<BookingMgmt />} />
              <Route path='/kyc' element={<KYCVerification />} />
              <Route path='/messaging' element={<MessagingMgmt />} />
              <Route path='/booking-metrics' element={<BookingMetrics />} />
              <Route path='/analytics' element={<Analytics />} />
              <Route path='/financials' element={<FinancialMgmt />} />
              <Route path='/settings' element={<Settings />} />
              <Route path='/notifications' element={<Notifications />} />
              <Route path='/admin-roles' element={<AdminRolesMgmt />} />
              <Route path='/log-out' element={<LogOut />} />

              {/* CSR Routes - Match your navigation exactly */}
              <Route path="/csr/dashboard" element={<SupportDashboard />} />
              <Route path="/csr/users" element={<CSRUsers />} />
              <Route path="/csr/tickets" element={<Tickets />} />
              <Route path="/csr/tickets/:ticketId" element={<TicketDetails />} />
              <Route path="/csr/disputes" element={<Disputes />} />
              <Route path="/csr/reports" element={<Reports />} />
              <Route path="/csr/notifications" element={<CSRNotifications />} />
              <Route path="/csr/settings" element={<CSRSettings />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { DashboardPage } from "./pages/Dashboard";
import UsersMgmt from "./pages/UsersMgmt";
import { NotificationProvider } from "./contexts/NotificationContext";
import UserDetails from "./pages/UserDetails";
import ListingMgmt from "./pages/ListingMgmt";
import BookingMgmt from "./pages/BookingMgmt";
import KYCVerification from "./pages/KYCVerification";
import MessagingMgmt from "./pages/MessagingMgmt";
import BookingMetrics from "./pages/BookingMetrics";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import FinancialMgmt from "./pages/FinancialMgmt";
import AdminRolesMgmt from "./pages/AdminRolesMgmt";
import LogOut from "./pages/LogOut";

import { initializeSecurity } from "./security";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    initializeSecurity(); // Turn on all security systems
  }, []);

  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
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
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;

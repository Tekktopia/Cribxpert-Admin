import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { DashboardPage } from "./pages/Dashboard";
import UsersMgmt from "./pages/UsersMgmt";
import { NotificationProvider } from "./contexts/NotificationContext";

function App() {
  return (
    <Provider store={store}>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/users' element={<UsersMgmt />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </Provider>
  );
}

export default App;

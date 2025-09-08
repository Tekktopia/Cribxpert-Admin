import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { store } from "./store";
import { DashboardPage } from "./pages/Dashboard";
import UsersMgmt from "./pages/UsersMgmt";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navigate to='/dashboard' replace />} />
          <Route path='/dashboard' element={<DashboardPage />} />
          <Route path='/users' element={<UsersMgmt />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

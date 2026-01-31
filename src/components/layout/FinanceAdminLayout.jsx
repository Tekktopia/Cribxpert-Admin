import { Outlet } from "react-router-dom";

export default function FinanceAdminLayout() {
  return (
    <div className="app-shell">
      <div className="content">
      
        <p>This is the Finance Admin Layout</p>
        <Outlet />
      </div>
    </div>
  );
}

// components/layout/FinanceAdminLayout.jsx
import { Outlet } from "react-router-dom";

export default function FinanceAdminLayout() {
  // This is now a simple wrapper that renders child routes
  // The layout is handled by FinancePageWrapper
  return <Outlet />;
}
// src/features/dashboard/DashboardGrid.tsx
import { UserManagement } from "./UserManagement";
import { ListingSummary } from "./ListingSummary";
import { BookingOverview } from "./BookingOverview";
import { KYCCompliance } from "./KYCCompliance";
import { RecentActivity } from "./RecentActivity";
import type { DashboardData } from "../../data/dashboardData";
import type { BookingStatusBreakdownResponse } from "@/api/features/adminDashboard/adminDashboardApiSlice";

interface DashboardGridProps {
  data: DashboardData;
  bookingBreakdown?: BookingStatusBreakdownResponse;
}

const EMPTY_BREAKDOWN: BookingStatusBreakdownResponse = {
  total: 0,
  pending: 0,
  confirmed: 0,
  completed: 0,
  cancelled: 0,
};

export function DashboardGrid({ data, bookingBreakdown }: DashboardGridProps) {
  const booking = bookingBreakdown ?? EMPTY_BREAKDOWN;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* ── Row 1: User stats · Listing stats · Booking stats ── */}
      <div className="lg:col-span-4">
        <UserManagement userData={data.userManagement} />
      </div>

      <div className="lg:col-span-4">
        <ListingSummary listingData={data.listingSummary} />
      </div>

      <div className="lg:col-span-4">
        <BookingOverview
          total={booking.total}
          pending={booking.pending}
          confirmed={booking.confirmed}
          completed={booking.completed}
          cancelled={booking.cancelled}
        />
      </div>

      {/* ── Row 2: Activity feed · KYC queue ── */}
      <div className="lg:col-span-8">
        <RecentActivity activities={data.recentActivity} />
      </div>

      <div className="lg:col-span-4">
        <KYCCompliance users={data.kycCompliance} />
      </div>
    </div>
  );
}

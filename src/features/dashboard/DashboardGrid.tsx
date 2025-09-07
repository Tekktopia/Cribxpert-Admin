import { UserManagement } from "./UserManagement";
import { ListingSummary } from "./ListingSummary";
import { BookingFinancialMetrics } from "./BookingFinancialMetrics";
import { KYCCompliance } from "./KYCCompliance";
import { MessageOversight } from "./MessageOversight";
import { RecentActivity } from "./RecentActivity";
import { NotificationCenter } from "./NotificationCenter";
import { PlatformHealth } from "./PlatformHealth";
import type { DashboardData } from "../../data/dashboardData";

interface DashboardGridProps {
  data: DashboardData;
}

export function DashboardGrid({ data }: DashboardGridProps) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
      {/* User Management */}
      <div className='lg:col-span-4'>
        <UserManagement userData={data.userManagement} />
      </div>

      {/* Listing Summary */}
      <div className='lg:col-span-4'>
        <ListingSummary listingData={data.listingSummary} />
      </div>

      {/* Booking & Financial Metrics */}
      <div className='lg:col-span-4'>
        <BookingFinancialMetrics data={data.bookingMetrics} />
      </div>

      {/* KYC Compliance */}
      <div className='lg:col-span-4'>
        <KYCCompliance users={data.kycCompliance} />
      </div>

      {/* Message Oversight */}
      <div className='lg:col-span-4'>
        <MessageOversight messages={data.messageOversight} />
      </div>

      {/* Recent Activity */}
      <div className='lg:col-span-4'>
        <RecentActivity activities={data.recentActivity} />
      </div>

      {/* Notification Center - Left Side */}
      <div className='lg:col-span-6'>
        <NotificationCenter notifications={data.notifications} />
      </div>

      {/* Platform Health & Logs - Right Side */}
      <div className='lg:col-span-6'>
        <PlatformHealth
          metrics={data.platformHealth.metrics}
          events={data.platformHealth.events}
        />
      </div>
    </div>
  );
}

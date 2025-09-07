import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "../components/ui/button";
import { Users, Building, Calendar, DollarSign } from "lucide-react";
import { MetricCard } from "../features/dashboard/MetricCard";
import { UserManagement } from "../features/dashboard/UserManagement";
import { ListingSummary } from "../features/dashboard/ListingSummary";
import { BookingFinancialMetrics } from "../features/dashboard/BookingFinancialMetrics";
import { KYCCompliance } from "../features/dashboard/KYCCompliance";
import { MessageOversight } from "../features/dashboard/MessageOversight";
import { RecentActivity } from "../features/dashboard/RecentActivity";
import { NotificationCenter } from "../features/dashboard/NotificationCenter";
import { PlatformHealth } from "../features/dashboard/PlatformHealth";

// Sample data for the dashboard
const dashboardData = {
  // Data for metric cards
  metrics: {
    totalUsers: {
      value: "30",
      change: 12,
      changeText: "this week",
      details: "15 Guests • 14 Hosts",
    },
    activeListings: {
      value: "30",
      change: 5,
      changeText: "this week",
    },
    weeklyBookings: {
      value: "30",
      change: 15,
      changeText: "vs last week",
    },
    totalRevenue: {
      value: "$3,000",
      change: 12,
      changeText: "vs last week",
    },
  },

  // User management data
  userManagement: [
    { label: "Verified", value: 200, color: "#0e7490" }, // Cyan-700
    { label: "Pending", value: 104, color: "#f59e0b" }, // Amber-500
    { label: "Blocked", value: 54, color: "#ef4444" }, // Red-500
  ],

  // Listing summary data
  listingSummary: [
    { label: "Active", value: 80, color: "#006266" }, // Exact Teal from Figma
    { label: "Inactive", value: 60, color: "#0072CE" }, // Exact Blue from Figma
    { label: "Pending", value: 40, color: "#FFC107" }, // Exact Amber from Figma
    { label: "Flagged", value: 10, color: "#FF3E41" }, // Exact Red from Figma
  ],

  // Booking and financial metrics
  bookingMetrics: {
    dailyBookings: {
      label: "Daily Bookings",
      value: "12",
      percentChange: 8.2,
    },
    avgBookingValue: {
      label: "Avg. Booking Value",
      value: "$120",
      percentChange: 12.2,
    },
    bookingsByDay: [
      { day: "Sunday", value: 8 },
      { day: "Monday", value: 5 },
      { day: "Tuesday", value: 10 },
      { day: "Wednesday", value: 15 },
      { day: "Thursday", value: 12 },
      { day: "Friday", value: 20 },
      { day: "Saturday", value: 18 },
    ],
    payouts: [
      {
        label: "Completed Payouts",
        value: "$2,500",
        status: "completed" as const,
      },
      {
        label: "Pending Payouts",
        value: "$600",
        status: "pending" as const,
      },
      {
        label: "Escrow Disputes",
        value: "6",
        status: "dispute" as const,
      },
    ],
  },

  // KYC compliance data
  kycCompliance: [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      avatar: "/avatars/sarah.png",
      status: "pending" as const,
      timestamp: "2mins ago",
    },
    {
      id: "2",
      name: "Michael Ojo",
      email: "michael.o@example.com",
      avatar: "/avatars/michael.png",
      status: "flagged" as const,
      timestamp: "2hrs ago",
    },
    {
      id: "3",
      name: "Cynthia Okoro",
      email: "cynthia.o@example.com",
      avatar: "/avatars/cynthia.png",
      status: "pending" as const,
      timestamp: "2hrs ago",
    },
  ],

  // Message oversight data
  messageOversight: {
    todayCount: 500,
    unreadReports: 500,
    flaggedConversations: [
      {
        id: "1",
        participants: "Alex Thompson → Lisa Ojo",
        message: "Can we meet outside the platform for...",
        reason: "Off-platform communication",
        timestamp: "2hrs ago",
        priority: "High" as const,
      },
      {
        id: "2",
        participants: "Mark Dare → Emma David",
        message: "I can offer you a better deal if...",
        reason: "Price manipulation",
        timestamp: "2hrs ago",
        priority: "Medium" as const,
      },
    ],
  },

  // Recent activity data
  recentActivity: [
    {
      id: "1",
      type: "user_verification" as const,
      title: "User Verification Approved",
      description: "John Deyemi",
      timestamp: "2mins ago",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "listing_flagged" as const,
      title: "Listing Flagged For Review",
      description: "Property #1234",
      timestamp: "3mins ago",
      status: "pending" as const,
    },
    {
      id: "3",
      type: "payout_processed" as const,
      title: "Payout Processed",
      description: "Sarah Wilson - $450",
      timestamp: "4mins ago",
      status: "completed" as const,
    },
  ],

  // Notification center data
  notifications: [
    {
      id: "1",
      type: "system_alert" as const,
      title: "System Alerts",
      description: "Multiple failed login attempts from IP 192.168.1.100",
      timestamp: "5mins ago",
      priority: "High" as const,
      status: "unread" as const,
    },
    {
      id: "2",
      type: "suspicious_activity" as const,
      title: "Suspicious Activity Detected",
      description:
        "Booking date 23-24-320-780 has an activity dispute requiring attention",
      timestamp: "7mins ago",
      priority: "High" as const,
      status: "unread" as const,
    },
    {
      id: "3",
      type: "maintenance" as const,
      title: "System Maintenance Scheduled",
      description: "Scheduled maintenance window from 2:00 AM - 4:00 AM EST",
      timestamp: "1hr ago",
      priority: "Medium" as const,
      status: "unread" as const,
    },
  ],

  // Platform health data
  platformHealth: {
    metrics: [
      {
        label: "Uptime",
        value: "99.9%",
        color: "#10b981", // green
      },
      {
        label: "Avg. Response",
        value: "1.2s",
        color: "#3b82f6", // blue
      },
      {
        label: "Daily Request",
        value: "154",
        color: "#6366f1", // indigo
      },
    ],
    events: [
      {
        id: "1",
        title: "User Account Blocked",
        description: "by Sarah Johnson • user@example.co",
        timestamp: "1:30am",
      },
      {
        id: "2",
        title: "Listing Approved",
        description: "by Mike Kenny • Downtown Apartment",
        timestamp: "1:30am",
      },
      {
        id: "3",
        title: "Payment Released",
        description: "by Sarah Johnson • Booking #BR-2025-001",
        timestamp: "1:30am",
      },
    ],
  },
};

export function DashboardPage() {
  // State to toggle between populated and empty view (for demo purposes)
  const isPopulated = true;

  return (
    <MainLayout>
      <div className='space-y-6'>
        {/* Page Header */}
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>
              Dashboard Overview
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Monitor your platform performance and manage operations
            </p>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='relative'>
              <select className='appearance-none bg-white border border-gray-200 rounded-md px-4 py-2 pr-8 text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent cursor-pointer'>
                <option value='this-week'>This Week</option>
                <option value='this-month'>This Month</option>
                <option value='this-year'>This Year</option>
              </select>
              <div className='absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none'>
                <svg
                  className='w-4 h-4 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </div>
            </div>
            <Button
              variant='outline'
              className='bg-primary-600 hover:bg-primary- hover:text-white text-white border-0'
            >
              Generate Report
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Total Users */}
          <MetricCard
            title='Total Users'
            value={dashboardData.metrics.totalUsers.value}
            change={dashboardData.metrics.totalUsers.change}
            icon={Users}
            iconBgColor='bg-blue-500'
            changeText={dashboardData.metrics.totalUsers.changeText}
            details={dashboardData.metrics.totalUsers.details}
          />

          {/* Active Listings */}
          <MetricCard
            title='Active Listings'
            value={dashboardData.metrics.activeListings.value}
            change={dashboardData.metrics.activeListings.change}
            icon={Building}
            iconBgColor='bg-teal-500'
            changeText={dashboardData.metrics.activeListings.changeText}
          />

          {/* Weekly Bookings */}
          <MetricCard
            title='Weekly Bookings'
            value={dashboardData.metrics.weeklyBookings.value}
            change={dashboardData.metrics.weeklyBookings.change}
            icon={Calendar}
            iconBgColor='bg-amber-500'
            changeText={dashboardData.metrics.weeklyBookings.changeText}
          />

          {/* Total Revenue */}
          <MetricCard
            title='Total Revenue'
            value={dashboardData.metrics.totalRevenue.value}
            change={dashboardData.metrics.totalRevenue.change}
            icon={DollarSign}
            iconBgColor='bg-green-500'
            changeText={dashboardData.metrics.totalRevenue.changeText}
          />
        </div>

        {/* Empty State */}

        {isPopulated ? (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-4'>
            {/* User Management */}
            <div className='lg:col-span-4'>
              <UserManagement userData={dashboardData.userManagement} />
            </div>

            {/* Listing Summary */}
            <div className='lg:col-span-4'>
              <ListingSummary listingData={dashboardData.listingSummary} />
            </div>

            {/* Booking & Financial Metrics */}
            <div className='lg:col-span-4'>
              <BookingFinancialMetrics data={dashboardData.bookingMetrics} />
            </div>

            {/* KYC Compliance */}
            <div className='lg:col-span-4'>
              <KYCCompliance users={dashboardData.kycCompliance} />
            </div>

            {/* Message Oversight */}
            <div className='lg:col-span-4'>
              <MessageOversight messages={dashboardData.messageOversight} />
            </div>

            {/* Recent Activity */}
            <div className='lg:col-span-4'>
              <RecentActivity activities={dashboardData.recentActivity} />
            </div>

            {/* Notification Center - Left Side */}
            <div className='lg:col-span-6'>
              <NotificationCenter notifications={dashboardData.notifications} />
            </div>

            {/* Platform Health & Logs - Right Side */}
            <div className='lg:col-span-6'>
              <PlatformHealth
                metrics={dashboardData.platformHealth.metrics}
                events={dashboardData.platformHealth.events}
              />
            </div>
          </div>
        ) : (
          <div className='p-12'>
            <div className='text-center'>
              {/* Illustration */}
              <div className='mx-auto w-64 h-48 mb-8'>
                <svg viewBox='0 0 200 150' className='w-full h-full'>
                  {/* Dashboard mockup */}
                  <rect
                    x='20'
                    y='20'
                    width='160'
                    height='110'
                    rx='8'
                    fill='#f3f4f6'
                    stroke='#e5e7eb'
                    strokeWidth='1'
                  />

                  {/* Charts */}
                  <rect
                    x='30'
                    y='35'
                    width='70'
                    height='40'
                    rx='4'
                    fill='#e0f2fe'
                  />
                  <rect
                    x='110'
                    y='35'
                    width='60'
                    height='40'
                    rx='4'
                    fill='#ecfdf5'
                  />

                  {/* Bars */}
                  <rect x='35' y='60' width='6' height='10' fill='#0ea5e9' />
                  <rect x='45' y='55' width='6' height='15' fill='#0ea5e9' />
                  <rect x='55' y='50' width='6' height='20' fill='#0ea5e9' />
                  <rect x='65' y='58' width='6' height='12' fill='#0ea5e9' />

                  {/* Line chart */}
                  <polyline
                    points='115,65 125,55 135,60 145,45 155,50'
                    stroke='#10b981'
                    strokeWidth='2'
                    fill='none'
                  />
                  <circle cx='115' cy='65' r='2' fill='#10b981' />
                  <circle cx='125' cy='55' r='2' fill='#10b981' />
                  <circle cx='135' cy='60' r='2' fill='#10b981' />
                  <circle cx='145' cy='45' r='2' fill='#10b981' />
                  <circle cx='155' cy='50' r='2' fill='#10b981' />

                  {/* Bottom section */}
                  <rect
                    x='30'
                    y='85'
                    width='140'
                    height='35'
                    rx='4'
                    fill='#fafafa'
                  />

                  {/* People illustrations */}
                  <g transform='translate(70, 100)'>
                    {/* Person 1 */}
                    <circle cx='15' cy='8' r='6' fill='#3b82f6' />
                    <rect
                      x='10'
                      y='12'
                      width='10'
                      height='12'
                      rx='2'
                      fill='#3b82f6'
                    />

                    {/* Person 2 */}
                    <circle cx='35' cy='8' r='6' fill='#10b981' />
                    <rect
                      x='30'
                      y='12'
                      width='10'
                      height='12'
                      rx='2'
                      fill='#10b981'
                    />
                  </g>
                </svg>
              </div>

              <h3 className='text-xl font-semibold text-gray-900 mb-2'>
                Your dashboard is quiet... for now.
              </h3>
              <p className='text-gray-500 mb-8 max-w-md mx-auto'>
                Once Users Start Signing Up, Listings Are Added, And Bookings
                Roll In, You'll See Your Key Platform Metrics Here — All In One
                Place.
              </p>

              <Button
                variant='primary'
                className='mx-auto'
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

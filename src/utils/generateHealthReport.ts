// src/utils/generateHealthReport.ts
import type { DashboardData } from "../features/dashboard/data/dashboardData";

export interface HealthReport {
  generatedAt: string;
  platformHealth: {
    totalUsers: number;
    activeListings: number;
    weeklyBookings: number;
    userVerificationRate: string;
    blockedUsers: number;
    pendingListings: number;
    flaggedListings: number;
    healthScore: number;
  };
  recentActivityLogs: Array<{
    time: string;
    type: string;
    user: string;
    description: string;
    status: string;
  }>;
  userManagement: {
    verified: number;
    pending: number;
    blocked: number;
    total: number;
  };
  listingSummary: {
    activeListings: number;
    inactiveListings: number;
    pendingListings: number;
    flaggedListings: number;
  };
  alerts: string[];
}

function calculateHealthScore(data: DashboardData): number {
  let score = 100;
  const totalUsers = Number(data.metrics.totalUsers.value);
  const blockedUsers = data.userManagement.find(u => u.label === "Blocked")?.value || 0;
  const flaggedListings = data.listingSummary.find(l => l.label === "Flagged")?.value || 0;
  const weeklyBookings = Number(data.metrics.weeklyBookings.value);
  const activeListings = Number(data.metrics.activeListings.value);

  if (blockedUsers > totalUsers * 0.1) score -= 20;
  if (flaggedListings > activeListings * 0.1) score -= 15;
  if (weeklyBookings < 5) score -= 10;
  return Math.max(0, score);
}

export function generateDynamicReport(data: DashboardData): HealthReport {
  const totalUsers = Number(data.metrics.totalUsers.value);
  const verifiedUsers = data.userManagement.find(u => u.label === "Verified")?.value || 0;
  const blockedUsers = data.userManagement.find(u => u.label === "Blocked")?.value || 0;
  const pendingUsers = data.userManagement.find(u => u.label === "Pending")?.value || 0;
  const activeListings = Number(data.metrics.activeListings.value);
  const weeklyBookings = Number(data.metrics.weeklyBookings.value);
  const pendingListings = data.listingSummary.find(l => l.label === "Pending")?.value || 0;
  const flaggedListings = data.listingSummary.find(l => l.label === "Flagged")?.value || 0;

  // Avoid division by zero
  const verificationRate = totalUsers === 0 ? "0%" : ((verifiedUsers / totalUsers) * 100).toFixed(1) + "%";

  const report: HealthReport = {
    generatedAt: new Date().toISOString(),
    platformHealth: {
      totalUsers,
      activeListings,
      weeklyBookings,
      userVerificationRate: verificationRate,
      blockedUsers,
      pendingListings,
      flaggedListings,
      healthScore: calculateHealthScore(data),
    },
    recentActivityLogs: data.recentActivity.map(activity => ({
      time: activity.timestamp,
      type: activity.type,
      user: activity.description.split(" - ")[0] || "unknown",
      description: activity.title,
      status: activity.status,
    })),
    userManagement: {
      verified: verifiedUsers,
      pending: pendingUsers,
      blocked: blockedUsers,
      total: totalUsers,
    },
    listingSummary: {
      activeListings: data.listingSummary.find(l => l.label === "Active")?.value || 0,
      inactiveListings: data.listingSummary.find(l => l.label === "Inactive")?.value || 0,
      pendingListings,
      flaggedListings,
    },
    alerts: [],
  };

  if (report.platformHealth.blockedUsers > totalUsers * 0.05)
    report.alerts.push("⚠️ High percentage of blocked users (>5%)");
  if (pendingListings > 20)
    report.alerts.push("⏳ Many pending listings (>20) need review");
  if (weeklyBookings === 0 && activeListings > 0)
    report.alerts.push("📉 Zero bookings this week despite active listings");

  return report;
}

export function reportToMarkdown(report: HealthReport): string {
  return `
# 📊 Platform Health Report
**Generated:** ${report.generatedAt}  
**Health Score:** ${report.platformHealth.healthScore}/100

## ⚠️ Alerts
${report.alerts.length ? report.alerts.map(a => `- ${a}`).join("\n") : "✅ None"}

## 📈 Key Metrics
| Metric | Value |
|--------|-------|
| Total Users | ${report.platformHealth.totalUsers} |
| Active Listings | ${report.platformHealth.activeListings} |
| Weekly Bookings | ${report.platformHealth.weeklyBookings} |
| Verification Rate | ${report.platformHealth.userVerificationRate} |
| Blocked Users | ${report.platformHealth.blockedUsers} |
| Pending Listings | ${report.platformHealth.pendingListings} |
| Flagged Listings | ${report.platformHealth.flaggedListings} |

## 📋 Recent Activity Logs (last 10)
${report.recentActivityLogs.slice(0, 10).map(log =>
  `- ${log.time} | ${log.type} | ${log.user} | ${log.description} (${log.status})`
).join("\n")}

## 👥 User Management
- Verified: ${report.userManagement.verified}
- Pending: ${report.userManagement.pending}
- Blocked: ${report.userManagement.blocked}

## 🏠 Listing Summary
- Active: ${report.listingSummary.activeListings}
- Inactive: ${report.listingSummary.inactiveListings}
- Pending: ${report.listingSummary.pendingListings}
- Flagged: ${report.listingSummary.flaggedListings}
`;
}
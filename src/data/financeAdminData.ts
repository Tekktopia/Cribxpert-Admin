// data/financeData.ts
import { 
  DollarSign, 
  Wallet, 
  RefreshCcw, 
  FileText,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUp,
  ArrowDown
} from "lucide-react";

// Types
export interface FinanceMetric {
  id: string;
  title: string;
  value: number;
  change: string;
  trend: "up" | "down";
  icon: any; // Lucide icon component
  format: "currency" | "number";
  description?: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  type: "payout" | "booking" | "refund" | "platform_fee";
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  processedBy?: string;
}

export interface RevenueTrend {
  labels: string[];
  data: number[];
  previousPeriodData?: number[];
}

export interface PayoutBreakdown {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface FinanceData {
  metrics: FinanceMetric[];
  revenueTrend: RevenueTrend;
  payoutBreakdown: PayoutBreakdown;
  recentTransactions: Transaction[];
  topVendors: Array<{
    id: string;
    name: string;
    revenue: number;
    completedPayouts: number;
    pendingAmount: number;
    avatar?: string;
  }>;
}

// Main Data
export const financeData: FinanceData = {
  metrics: [
    {
      id: "total-revenue",
      title: "Total Revenue",
      value: 45231.89,
      change: "↑ 12.5% this month",
      trend: "up",
      icon: DollarSign,
      format: "currency",
      description: "Total platform revenue including all transactions"
    },
    {
      id: "pending-payouts",
      title: "Pending Payouts",
      value: 12500.00,
      change: "↑ 8.2% pending",
      trend: "up",
      icon: Wallet,
      format: "currency",
      description: "Amount awaiting processing to vendors"
    },
    {
      id: "completed-payouts",
      title: "Completed Payouts",
      value: 32731.89,
      change: "↑ 24 completed",
      trend: "up",
      icon: Wallet,
      format: "currency",
      description: "Successfully processed payouts"
    },
    {
      id: "refund-requests",
      title: "Refund Requests",
      value: 3,
      change: "↓ 1 request",
      trend: "down",
      icon: RefreshCcw,
      format: "number",
      description: "Active refund requests awaiting review"
    }
  ],

  revenueTrend: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 32000, 35000, 40000, 38000, 45231],
    previousPeriodData: [10000, 15000, 13000, 20000, 18000, 25000, 23000, 28000, 30000, 35000, 32000, 40000]
  },

  payoutBreakdown: {
    labels: ["Vendors", "Affiliates", "Refunds", "Platform Fees"],
    data: [65, 15, 10, 10],
    colors: ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6"]
  },

  recentTransactions: [
    {
      id: "1",
      transactionId: "TX-78901",
      user: {
        name: "John Smith",
        email: "john@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
      },
      amount: 1250.50,
      type: "payout",
      status: "completed",
      date: "2024-01-15",
      processedBy: "Auto System"
    },
    {
      id: "2",
      transactionId: "TX-78902",
      user: {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
      },
      amount: 850.00,
      type: "booking",
      status: "completed",
      date: "2024-01-14"
    },
    {
      id: "3",
      transactionId: "TX-78903",
      user: {
        name: "Mike Brown",
        email: "mike@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
      },
      amount: 320.75,
      type: "refund",
      status: "refunded",
      date: "2024-01-13",
      processedBy: "Finance Team"
    },
    {
      id: "4",
      transactionId: "TX-78904",
      user: {
        name: "Emma Wilson",
        email: "emma@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
      },
      amount: 2100.00,
      type: "payout",
      status: "pending",
      date: "2024-01-12"
    },
    {
      id: "5",
      transactionId: "TX-78905",
      user: {
        name: "Alex Chen",
        email: "alex@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      },
      amount: 450.25,
      type: "booking",
      status: "failed",
      date: "2024-01-11"
    },
    {
      id: "6",
      transactionId: "TX-78906",
      user: {
        name: "Lisa Wong",
        email: "lisa@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa"
      },
      amount: 150.00,
      type: "platform_fee",
      status: "completed",
      date: "2024-01-10"
    }
  ],

  topVendors: [
    {
      id: "vendor-1",
      name: "Luxury Stays Inc.",
      revenue: 18500.00,
      completedPayouts: 15,
      pendingAmount: 3200.00,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luxury"
    },
    {
      id: "vendor-2",
      name: "City Apartments Ltd.",
      revenue: 14200.00,
      completedPayouts: 12,
      pendingAmount: 2100.00,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=City"
    },
    {
      id: "vendor-3",
      name: "Beachfront Properties",
      revenue: 9800.00,
      completedPayouts: 8,
      pendingAmount: 1500.00,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Beach"
    },
    {
      id: "vendor-4",
      name: "Mountain Retreats",
      revenue: 7500.00,
      completedPayouts: 6,
      pendingAmount: 1200.00,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mountain"
    },
    {
      id: "vendor-5",
      name: "Urban Lofts Co.",
      revenue: 6200.00,
      completedPayouts: 5,
      pendingAmount: 900.00,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Urban"
    }
  ]
};

// Helper functions
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US');
};

export const getStatusColor = (status: Transaction['status']): string => {
  const colors = {
    completed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800"
  };
  return colors[status];
};

export const getStatusIcon = (status: Transaction['status']): any => {
  const icons = {
    completed: CheckCircle,
    pending: Clock,
    failed: XCircle,
    refunded: RefreshCcw
  };
  return icons[status];
};

export const getTypeLabel = (type: Transaction['type']): string => {
  const labels = {
    payout: "Payout",
    booking: "Booking",
    refund: "Refund",
    platform_fee: "Platform Fee"
  };
  return labels[type];
};

// Mock data for empty state
export const emptyFinanceData: FinanceData = {
  metrics: [
    {
      id: "total-revenue",
      title: "Total Revenue",
      value: 0,
      change: "↑ 0% this month",
      trend: "up",
      icon: DollarSign,
      format: "currency"
    },
    {
      id: "pending-payouts",
      title: "Pending Payouts",
      value: 0,
      change: "0 pending",
      trend: "neutral",
      icon: Wallet,
      format: "currency"
    },
    {
      id: "completed-payouts",
      title: "Completed Payouts",
      value: 0,
      change: "↑ 0",
      trend: "up",
      icon: Wallet,
      format: "currency"
    },
    {
      id: "refund-requests",
      title: "Refund Requests",
      value: 0,
      change: "0 requests",
      trend: "neutral",
      icon: RefreshCcw,
      format: "number"
    }
  ],
  revenueTrend: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    data: [0, 0, 0, 0, 0, 0]
  },
  payoutBreakdown: {
    labels: ["Vendors", "Affiliates", "Refunds", "Platform Fees"],
    data: [0, 0, 0, 0],
    colors: ["#3B82F6", "#10B981", "#EF4444", "#8B5CF6"]
  },
  recentTransactions: [],
  topVendors: []
};

// For testing/development
export const testFinanceData: Partial<FinanceData> = {
  metrics: financeData.metrics,
  recentTransactions: financeData.recentTransactions.slice(0, 3)
};

// Export types
export type { FinanceMetric, Transaction, RevenueTrend, PayoutBreakdown };
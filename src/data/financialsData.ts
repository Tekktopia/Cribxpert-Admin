export type TransactionStatus = "Completed" | "Pending" | "Disputed";

export type TransactionType = "Payout" | "Refund" | "Guest Payment";

export interface FinancialTransaction {
  id: string;
  date: string; // ISO date
  type: TransactionType;
  amount: number; // in NGN (kobo not used for simplicity)
  status: TransactionStatus;
  // Optional fields for details modal (present when available)
  guestName?: string;
  hostName?: string;
  propertyName?: string;
  paymentMethod?: string; // e.g. "Credit Card (Visa***2389)"
}

export interface FinancialSummaryCard {
  id: string;
  title: string;
  value: number;
  changePct?: number; // e.g., 5.2 means +5.2%
  changeLabel?: string; // e.g., "since last month"
  icon: string; // public path to svg icon
}

export interface FinancialsData {
  summary: FinancialSummaryCard[];
  transactions: FinancialTransaction[];
}

export const financialsData: FinancialsData = {
  summary: [
    {
      id: "commission",
      title: "Total Commission Earned",
      value: 3450500,
      changePct: 5.2,
      changeLabel: "since last month",
      icon: "/sidebar/card-tick.svg",
    },
    {
      id: "hostEarnings",
      title: "Host Earnings",
      value: 1450500,
      changePct: -2.4,
      changeLabel: "since last week",
      icon: "/sidebar/material-symbols_analytics-outline.svg",
    },
    {
      id: "refunds",
      title: "Refunds Issued",
      value: 1200,
      changePct: -1.1,
      changeLabel: "since last transaction",
      icon: "/sidebar/notification-block-03.svg",
    },
    {
      id: "escrow",
      title: "Escrow Balance",
      value: 250,
      changePct: 3.3,
      changeLabel: "since last Transaction",
      icon: "/sidebar/list-setting.svg",
    },
  ],
  transactions: [
    {
      id: "t1",
      date: "2025-04-21",
      type: "Payout",
      amount: 100000,
      status: "Completed",
      guestName: "Sarah Johnson",
      hostName: "Robert Smith",
      propertyName: "Makinwa’s Cottage",
      paymentMethod: "Credit Card (Visa***2389)",
    },
    {
      id: "t2",
      date: "2025-04-21",
      type: "Refund",
      amount: 300000,
      status: "Pending",
    },
    {
      id: "t3",
      date: "2025-04-21",
      type: "Payout",
      amount: 600000,
      status: "Completed",
    },
    {
      id: "t4",
      date: "2025-04-21",
      type: "Guest Payment",
      amount: 600000,
      status: "Disputed",
    },
    {
      id: "t5",
      date: "2025-04-21",
      type: "Guest Payment",
      amount: 600000,
      status: "Completed",
    },
    {
      id: "t6",
      date: "2025-04-21",
      type: "Refund",
      amount: 600000,
      status: "Pending",
    },
  ],
};

export function formatCurrencyNGN(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("NGN", "₦");
}

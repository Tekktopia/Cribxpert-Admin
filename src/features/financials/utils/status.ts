import type { TransactionStatus } from "@/data/financialsData";

// Map financial transaction status to Badge variant used in the UI
export function statusToBadgeVariant(
  status: TransactionStatus
): "success" | "warning" | "destructive" | "secondary" {
  switch (status) {
    case "Completed":
      return "success";
    case "Pending":
      return "warning";
    case "Disputed":
      return "destructive";
    default:
      return "secondary";
  }
}

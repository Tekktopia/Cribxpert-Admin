// Status mapping configurations using Maps for safer access
const bookingStatusMap = new Map([
  ["Confirmed", { variant: "success" as const, label: "Confirmed" }],
  ["Pending", { variant: "warning" as const, label: "Pending" }],
  ["Cancelled", { variant: "destructive" as const, label: "Cancelled" }],
  ["On Hold", { variant: "secondary" as const, label: "On Hold" }],
  ["Completed", { variant: "success" as const, label: "Completed" }],
  ["Active", { variant: "pending" as const, label: "Active" }],
]);

const userStatusMap = new Map([
  ["Verified", { variant: "success" as const, label: "Verified" }],
  ["Pending", { variant: "warning" as const, label: "Pending" }],
  ["Blocked", { variant: "destructive" as const, label: "Blocked" }],
  ["Active", { variant: "success" as const, label: "Active" }],
]);

const paymentStatusMap = new Map([
  ["Paid", { variant: "success" as const, label: "Paid" }],
  ["On Hold", { variant: "warning" as const, label: "On Hold" }],
  ["Refunded", { variant: "secondary" as const, label: "Refunded" }],
  ["Failed", { variant: "destructive" as const, label: "Failed" }],
  ["Pending", { variant: "warning" as const, label: "Pending" }],
]);

// Listings use a lowercase union in types: "pending" | "active" | "flagged" | "rejected"
const listingStatusMap = new Map([
  ["active", { variant: "success" as const, label: "Active" }],
  ["pending", { variant: "warning" as const, label: "Pending" }],
  ["flagged", { variant: "destructive" as const, label: "Flagged" }],
  ["rejected", { variant: "secondary" as const, label: "Rejected" }],
]);

// Complaint status mappings
const complaintStatusMap = new Map([
  ["Resolved", { variant: "success" as const, label: "Resolved" }],
  [
    "Under Investigation",
    { variant: "warning" as const, label: "Under Investigation" },
  ],
  ["Pending", { variant: "pending" as const, label: "Pending" }],
  ["Closed", { variant: "secondary" as const, label: "Closed" }],
]);

// Complaint priority mappings
const complaintPriorityMap = new Map([
  ["High", { variant: "destructive" as const, label: "High" }],
  ["Medium", { variant: "warning" as const, label: "Medium" }],
  ["Low", { variant: "secondary" as const, label: "Low" }],
]);

// KYC status mappings
const kycStatusMap = new Map([
  ["verified", { variant: "success" as const, label: "Verified" }],
  ["pending", { variant: "warning" as const, label: "Pending" }],
  ["blocked", { variant: "destructive" as const, label: "Blocked" }],
  ["flagged", { variant: "destructive" as const, label: "Flagged" }],
  ["rejected", { variant: "destructive" as const, label: "Rejected" }],
]);

// Activity status mappings (dashboard recent activity)
const activityStatusMap = new Map([
  ["completed", { variant: "success" as const, label: "Completed" }],
  ["pending", { variant: "warning" as const, label: "Pending" }],
  ["failed", { variant: "destructive" as const, label: "Failed" }],
]);

// Main status maps registry
const statusMaps = new Map([
  ["booking", bookingStatusMap],
  ["user", userStatusMap],
  ["payment", paymentStatusMap],
  ["listing", listingStatusMap],
  ["complaint", complaintStatusMap],
  ["complaintPriority", complaintPriorityMap],
  ["kyc", kycStatusMap],
  ["activity", activityStatusMap],
]);

export type BadgeVariant =
  | "success"
  | "warning"
  | "destructive"
  | "secondary"
  | "pending";

export type StatusType =
  | "booking"
  | "user"
  | "payment"
  | "listing"
  | "complaint"
  | "complaintPriority"
  | "kyc"
  | "activity";

export interface StatusConfig {
  variant: "success" | "warning" | "destructive" | "secondary" | "pending";
  label: string;
}

// Utility function to get status configuration
export function getStatusConfig(
  status: string,
  type: StatusType
): StatusConfig | null {
  const statusMap = statusMaps.get(type);
  if (!statusMap) {
    return null;
  }
  return statusMap.get(status) || null;
}

// Utility function to get just the variant
export function getStatusVariant(
  status: string,
  type: StatusType
): BadgeVariant {
  const config = getStatusConfig(status, type);
  return (config?.variant as BadgeVariant) || "secondary";
}

// Utility function to get the label
export function getStatusLabel(status: string, type: StatusType): string {
  const config = getStatusConfig(status, type);
  return config?.label || status;
}

// Helper function to check if a status exists for a given type
export function isValidStatus(status: string, type: StatusType): boolean {
  const statusMap = statusMaps.get(type);
  return statusMap ? statusMap.has(status) : false;
}

// Helper function to get all available statuses for a type
export function getAvailableStatuses(type: StatusType): string[] {
  const statusMap = statusMaps.get(type);
  return statusMap ? Array.from(statusMap.keys()) : [];
}

// Helper function to get status configs for form options
export function getStatusOptions(
  type: StatusType
): Array<{ value: string; label: string; variant: string }> {
  const statusMap = statusMaps.get(type);
  if (!statusMap) return [];

  return Array.from(statusMap.entries()).map(([status, config]) => ({
    value: status,
    label: config.label,
    variant: config.variant,
  }));
}

// Generic status badge creation function
export function createStatusBadge(
  status: string,
  type: StatusType,
  className: string = "text-xs"
): {
  variant: BadgeVariant;
  label: string;
  className: string;
} {
  const config = getStatusConfig(status, type);
  return {
    variant: (config?.variant as BadgeVariant) || "secondary",
    label: config?.label || status,
    className,
  };
}

export interface ActionConfig {
  label: string;
  action: string;
  variant: "approve" | "reject" | "flag" | "suspend";
}

export type ListingStatus = "pending" | "active" | "flagged" | "rejected";

/**
 * Get the available actions for a listing based on its status
 * @param status - The current status of the listing
 * @returns Array of action configurations
 */
export function getListingActions(status: ListingStatus): ActionConfig[] {
  switch (status) {
    case "pending":
      return [
        { label: "Reject", action: "reject", variant: "reject" },
        { label: "Approve", action: "approve", variant: "approve" },
      ];
    case "active":
      return [
        { label: "Flag", action: "flag", variant: "flag" },
        { label: "Suspend", action: "suspend", variant: "suspend" },
      ];
    case "flagged":
      return [
        { label: "Reject", action: "reject", variant: "reject" },
        { label: "Approve", action: "approve", variant: "approve" },
      ];
    case "rejected":
      return []; // No actions available for rejected listings
    default:
      return [];
  }
}

/**
 * Check if a listing has any available actions
 * @param status - The current status of the listing
 * @returns Boolean indicating if actions are available
 */
export function hasListingActions(status: ListingStatus): boolean {
  return getListingActions(status).length > 0;
}

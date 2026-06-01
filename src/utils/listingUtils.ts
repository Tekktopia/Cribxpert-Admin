export interface ActionConfig {
  label: string;
  action: string;
  variant: "approve" | "reject" | "flag" | "hide";
}

// The DB enum uses 'approved'; older code used 'active' as a synonym.
// The listing API also coerces hidden rows to status='hidden' so the UI can
// filter on it. Keep all three accepted here so admin actions surface for
// whichever shape we get.
export type ListingStatus =
  | "pending"
  | "active"
  | "approved"
  | "flagged"
  | "rejected"
  | "hidden"
  | "draft";

/**
 * Get the available actions for a listing based on its status and hideStatus.
 *   - approved / active → Flag + Hide
 *   - hidden            → Unhide (single primary action; admin only)
 *   - pending / flagged → Approve + Reject
 *   - rejected / draft  → no admin actions
 */
export function getListingActions(status: ListingStatus, hideStatus?: boolean): ActionConfig[] {
  // A row may carry status='approved' AND hide_status=true (some queries do
  // NOT coerce). Treat that as the hidden case so the Unhide button shows.
  const effective = hideStatus === true && status !== "hidden" ? "hidden" : status;

  switch (effective) {
    case "pending":
    case "flagged":
      return [
        { label: "Reject",  action: "reject",  variant: "reject"  },
        { label: "Approve", action: "approve", variant: "approve" },
      ];
    case "active":
    case "approved":
      return [
        { label: "Flag", action: "flag", variant: "flag" },
        { label: "Hide", action: "hide", variant: "hide" },
      ];
    case "hidden":
      return [
        { label: "Unhide", action: "hide", variant: "hide" },
      ];
    case "rejected":
    case "draft":
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

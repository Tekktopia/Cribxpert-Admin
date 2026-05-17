import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ListingRecord } from "../../data/listingMgmtData";

export interface ListingState {
  listings: ListingRecord[];
  filteredListings: ListingRecord[];
  activeTab: string;
  selectedListing: ListingRecord | null;
  modals: {
    details: boolean;
    approve: boolean;
    reject: boolean;
    flag: boolean;
    hide: boolean;
    success: boolean;
  };
  successMessage: string;
  loading: boolean;
  error: string | null;
}

const initialState: ListingState = {
  listings: [],
  filteredListings: [],
  activeTab: "all",
  selectedListing: null,
  modals: {
    details: false,
    approve: false,
    reject: false,
    flag: false,
    hide: false,
    success: false,
  },
  successMessage: "",
  loading: false,
  error: null,
};

// Helper function to filter listings based on tab
const filterListingsByTab = (
  listings: ListingRecord[],
  tab: string,
): ListingRecord[] => {
  if (!listings) return [];

  switch (tab) {
    case "approved":
      // Approved/Active = status is 'active' AND not hidden
      return listings.filter(
        (l) =>
          (l.status === "active" || l.status === "approved") && !l.hideStatus,
      );

    case "pending":
      // Pending = status is 'pending' AND not hidden
      return listings.filter((l) => l.status === "pending" && !l.hideStatus);

    case "flagged":
      // Flagged = status is 'flagged' AND not hidden
      return listings.filter((l) => l.status === "flagged" && !l.hideStatus);

    case "rejected":
      // Rejected = status is 'rejected' AND not hidden
      return listings.filter((l) => l.status === "rejected" && !l.hideStatus);

    case "hidden":
      // ✅ FIX: Hidden = hideStatus is true (regardless of status)
      return listings.filter((l) => l.hideStatus === true);

    case "all":
    default:
      return listings;
  }
};

export const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    // Set listings data
    setListings: (state, action: PayloadAction<ListingRecord[]>) => {
      state.listings = action.payload;
      // Re-apply active tab filter
      state.filteredListings = filterListingsByTab(
        state.listings,
        state.activeTab,
      );
    },

    // Filter listings by tab
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
      state.filteredListings = filterListingsByTab(
        state.listings,
        action.payload,
      );
    },

    // Set selected listing
    setSelectedListing: (
      state,
      action: PayloadAction<ListingRecord | null>,
    ) => {
      state.selectedListing = action.payload;
    },

    // Modal management
    openModal: (state, action: PayloadAction<keyof ListingState["modals"]>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (
      state,
      action: PayloadAction<keyof ListingState["modals"]>,
    ) => {
      state.modals[action.payload] = false;
    },

    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof ListingState["modals"]] = false;
      });
    },

    // Success message
    setSuccessMessage: (state, action: PayloadAction<string>) => {
      state.successMessage = action.payload;
    },

    // Loading and error states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Listing actions - update local state after API success
    approveListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.status = "active";
        listing.hideStatus = false;
      }
      // Refresh filtered listings
      state.filteredListings = filterListingsByTab(
        state.listings,
        state.activeTab,
      );
    },

    rejectListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.status = "rejected";
        listing.hideStatus = false;
      }
      // Refresh filtered listings
      state.filteredListings = filterListingsByTab(
        state.listings,
        state.activeTab,
      );
    },

    flagListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.status = "flagged";
        listing.hideStatus = false;
      }
      // Refresh filtered listings
      state.filteredListings = filterListingsByTab(
        state.listings,
        state.activeTab,
      );
    },

    hideListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.hideStatus = !listing.hideStatus;
      }
      // Refresh filtered listings
      state.filteredListings = filterListingsByTab(
        state.listings,
        state.activeTab,
      );
    },
  },
});

// Export actions
export const {
  setListings,
  setActiveTab,
  setSelectedListing,
  openModal,
  closeModal,
  closeAllModals,
  setSuccessMessage,
  setLoading,
  setError,
  approveListing,
  rejectListing,
  flagListing,
  hideListing,
} = listingSlice.actions;

// Export selectors
export const selectListings = (state: { listing: ListingState }) =>
  state.listing.listings;
export const selectFilteredListings = (state: { listing: ListingState }) =>
  state.listing.filteredListings;
export const selectActiveTab = (state: { listing: ListingState }) =>
  state.listing.activeTab;
export const selectSelectedListing = (state: { listing: ListingState }) =>
  state.listing.selectedListing;
export const selectModals = (state: { listing: ListingState }) =>
  state.listing.modals;
export const selectSuccessMessage = (state: { listing: ListingState }) =>
  state.listing.successMessage;
export const selectLoading = (state: { listing: ListingState }) =>
  state.listing.loading;
export const selectError = (state: { listing: ListingState }) =>
  state.listing.error;

// ✅ NEW: Selector for tab counts
export const selectTabCounts = (state: { listing: ListingState }) => {
  const listings = state.listing.listings;
  return {
    all: listings.length,
    approved: listings.filter(
      (l) =>
        (l.status === "active" || l.status === "approved") && !l.hideStatus,
    ).length,
    pending: listings.filter((l) => l.status === "pending" && !l.hideStatus)
      .length,
    flagged: listings.filter((l) => l.status === "flagged" && !l.hideStatus)
      .length,
    rejected: listings.filter((l) => l.status === "rejected" && !l.hideStatus)
      .length,
    hidden: listings.filter((l) => l.hideStatus === true).length,
  };
};

export default listingSlice.reducer;

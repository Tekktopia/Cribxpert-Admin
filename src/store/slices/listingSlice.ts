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

export const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    // Set listings data
    setListings: (state, action: PayloadAction<ListingRecord[]>) => {
      state.listings = action.payload;
      state.filteredListings = action.payload;
    },

    // Filter listings by tab
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;

      switch (action.payload) {
        case "approved":
          // Filter for "active" status (which is "approved" in API)
          state.filteredListings = state.listings.filter(
            (listing) => listing.status === "active"
          );
          break;
        case "pending":
          state.filteredListings = state.listings.filter(
            (listing) => listing.status === "pending"
          );
          break;
        case "flagged":
          state.filteredListings = state.listings.filter(
            (listing) => listing.status === "flagged"
          );
          break;
        case "rejected":
          state.filteredListings = state.listings.filter(
            (listing) => listing.status === "rejected"
          );
          break;
        default:
          // "all" - show all listings
          state.filteredListings = state.listings;
      }
    },

    // Set selected listing
    setSelectedListing: (
      state,
      action: PayloadAction<ListingRecord | null>
    ) => {
      state.selectedListing = action.payload;
    },

    // Modal management
    openModal: (state, action: PayloadAction<keyof ListingState["modals"]>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (
      state,
      action: PayloadAction<keyof ListingState["modals"]>
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

    // Listing actions
    approveListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.status = "active";
      }
      // Update filtered listings if needed
      if (state.activeTab !== "all") {
        listingSlice.caseReducers.setActiveTab(state, {
          payload: state.activeTab,
          type: "listing/setActiveTab",
        });
      }
    },

    rejectListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.status = "rejected";
      }
      // Update filtered listings if needed
      if (state.activeTab !== "all") {
        listingSlice.caseReducers.setActiveTab(state, {
          payload: state.activeTab,
          type: "listing/setActiveTab",
        });
      }
    },

    flagListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.status = "flagged";
      }
      // Update filtered listings if needed
      if (state.activeTab !== "all") {
        listingSlice.caseReducers.setActiveTab(state, {
          payload: state.activeTab,
          type: "listing/setActiveTab",
        });
      }
    },

    hideListing: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        // Hide status is handled by hideStatus field in the API
        // We don't need to change the status here as the API handles it
      }
      // Update filtered listings if needed
      if (state.activeTab !== "all") {
        listingSlice.caseReducers.setActiveTab(state, {
          payload: state.activeTab,
          type: "listing/setActiveTab",
        });
      }
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

export default listingSlice.reducer;

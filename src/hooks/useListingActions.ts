import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setSelectedListing,
  openModal,
  closeModal,
  closeAllModals,
  setSuccessMessage,
  selectSelectedListing,
  selectModals,
  selectSuccessMessage,
} from "../store/slices/listingSlice";
import type { ListingRecord } from "../data/listingMgmtData";
import { useNotification } from "./useNotification";
import {
  useApproveListingMutation,
  useRejectListingMutation,
  useFlagListingMutation,
  useHideListingMutation,
} from "@/api/features/adminListingManagement/adminListingManagementApiSlice";

export function useListingActions() {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();

  const selectedListing = useAppSelector(selectSelectedListing);
  const modals = useAppSelector(selectModals);
  const successMessage = useAppSelector(selectSuccessMessage);

  // API mutations
  const [approveListingMutation] = useApproveListingMutation();
  const [rejectListingMutation] = useRejectListingMutation();
  const [flagListingMutation] = useFlagListingMutation();
  const [hideListingMutation] = useHideListingMutation();

  const handleViewDetails = useCallback(
    (listing: ListingRecord) => {
      dispatch(setSelectedListing(listing));
      dispatch(openModal("details"));
    },
    [dispatch]
  );

  const handleAction = useCallback(
    (listing: ListingRecord, action: string) => {
      dispatch(setSelectedListing(listing));

      switch (action) {
        case "approve":
          dispatch(openModal("approve"));
          break;
        case "reject":
          dispatch(openModal("reject"));
          break;
        case "flag":
          dispatch(openModal("flag"));
          break;
        case "hide":
          dispatch(openModal("hide"));
          break;
      }
    },
    [dispatch]
  );

  const handleApprove = useCallback(
    async (notes?: string) => {
      if (!selectedListing) return;

      try {
        dispatch(closeModal("approve"));

        // Call the API to approve the listing
        await approveListingMutation(selectedListing.id).unwrap();

        const message = `"${selectedListing.title}" has been approved successfully!`;
        dispatch(setSuccessMessage(message));
        dispatch(openModal("success"));
        showNotification({
          type: "success",
          title: "Listing Approved",
          message: `${selectedListing.title} is now live and available for bookings.`,
        });
        // Log notes if provided
        if (notes) {
          console.log("Approval notes:", notes);
        }
      } catch (error: unknown) {
        console.error("Error approving listing:", error);
        let errorMessage = "There was an error approving the listing. Please try again.";
        if (error && typeof error === "object" && "data" in error) {
          const errorData = error.data as { message?: string };
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        }
        showNotification({
          type: "error",
          title: "Failed to Approve Listing",
          message: errorMessage,
        });
      }
    },
    [dispatch, selectedListing, showNotification, approveListingMutation]
  );

  const handleReject = useCallback(
    async (reason: string, additionalNotes?: string) => {
      if (!selectedListing) return;

      try {
        dispatch(closeModal("reject"));

        // Combine reason and additional notes for rejection reason
        const rejectionReason = additionalNotes
          ? `${reason}. ${additionalNotes}`
          : reason;

        // Call the API to reject the listing
        await rejectListingMutation({
          listingId: selectedListing.id,
          rejectionReason,
        }).unwrap();

        const message = `"${selectedListing.title}" has been rejected.`;
        dispatch(setSuccessMessage(message));
        dispatch(openModal("success"));
        showNotification({
          type: "error",
          title: "Listing Rejected",
          message: `${selectedListing.title} has been rejected. Reason: ${reason}`,
        });
      } catch (error: unknown) {
        console.error("Error rejecting listing:", error);
        let errorMessage = "There was an error rejecting the listing. Please try again.";
        if (error && typeof error === "object" && "data" in error) {
          const errorData = error.data as { message?: string };
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        }
        showNotification({
          type: "error",
          title: "Failed to Reject Listing",
          message: errorMessage,
        });
      }
    },
    [dispatch, selectedListing, showNotification, rejectListingMutation]
  );

  const handleFlag = useCallback(
    async (reason: string, additionalNotes?: string) => {
      if (!selectedListing) return;

      try {
        dispatch(closeModal("flag"));

        // Combine reason and additional notes for flag reason
        const flagReason = additionalNotes ? `${reason}. ${additionalNotes}` : reason;

        // Call the API to flag the listing
        await flagListingMutation({
          listingId: selectedListing.id,
          flagReason,
        }).unwrap();

        const message = `"${selectedListing.title}" has been flagged for review.`;
        dispatch(setSuccessMessage(message));
        dispatch(openModal("success"));
        showNotification({
          type: "warning",
          title: "Listing Flagged",
          message: `${selectedListing.title} has been flagged. Reason: ${reason}`,
        });
      } catch (error: unknown) {
        console.error("Error flagging listing:", error);
        let errorMessage = "There was an error flagging the listing. Please try again.";
        if (error && typeof error === "object" && "data" in error) {
          const errorData = error.data as { message?: string };
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        }
        showNotification({
          type: "error",
          title: "Failed to Flag Listing",
          message: errorMessage,
        });
      }
    },
    [dispatch, selectedListing, showNotification, flagListingMutation]
  );

  const handleHide = useCallback(
    async (notes?: string) => {
      if (!selectedListing) return;

      const isCurrentlyHidden = selectedListing.hideStatus === true;
      const action = isCurrentlyHidden ? "unhide" : "hide";

      try {
        dispatch(closeModal("hide"));

        // Call the API to toggle hide status
        await hideListingMutation(selectedListing.id).unwrap();

        const message = isCurrentlyHidden
          ? `"${selectedListing.title}" has been unhidden.`
          : `"${selectedListing.title}" has been hidden.`;
        dispatch(setSuccessMessage(message));
        dispatch(openModal("success"));
        showNotification({
          type: isCurrentlyHidden ? "success" : "warning",
          title: isCurrentlyHidden ? "Listing Unhidden" : "Listing Hidden",
          message: isCurrentlyHidden
            ? `${selectedListing.title} is now visible to guests.`
            : `${selectedListing.title} has been hidden and is no longer visible to guests.`,
        });
        // Log notes if provided
        if (notes) {
          console.log(`${action} notes:`, notes);
        }
      } catch (error: unknown) {
        console.error(`Error ${action}ing listing:`, error);
        let errorMessage = `There was an error ${action}ing the listing. Please try again.`;
        if (error && typeof error === "object" && "data" in error) {
          const errorData = error.data as { message?: string };
          if (errorData?.message) {
            errorMessage = errorData.message;
          }
        }
        showNotification({
          type: "error",
          title: `Failed to ${isCurrentlyHidden ? "Unhide" : "Hide"} Listing`,
          message: errorMessage,
        });
      }
    },
    [dispatch, selectedListing, showNotification, hideListingMutation]
  );

  const handleCloseModal = useCallback(
    (modalName: keyof typeof modals) => {
      dispatch(closeModal(modalName));
    },
    [dispatch]
  );

  const handleCloseAllModals = useCallback(() => {
    dispatch(closeAllModals());
  }, [dispatch]);

  return {
    selectedListing,
    modals,
    successMessage,
    // Legacy properties for compatibility
    isApproveModalOpen: modals.approve,
    isRejectModalOpen: modals.reject,
    isFlagModalOpen: modals.flag,
    isHideModalOpen: modals.hide,
    isSuccessModalOpen: modals.success,
    setIsApproveModalOpen: (open: boolean) =>
      dispatch(open ? openModal("approve") : closeModal("approve")),
    setIsRejectModalOpen: (open: boolean) =>
      dispatch(open ? openModal("reject") : closeModal("reject")),
    setIsFlagModalOpen: (open: boolean) =>
      dispatch(open ? openModal("flag") : closeModal("flag")),
    setIsHideModalOpen: (open: boolean) =>
      dispatch(open ? openModal("hide") : closeModal("hide")),
    setIsSuccessModalOpen: (open: boolean) =>
      dispatch(open ? openModal("success") : closeModal("success")),
    handleViewDetails,
    handleAction,
    handleApprove,
    handleReject,
    handleFlag,
    handleHide,
    handleCloseModal,
    closeAllModals: handleCloseAllModals,
  };
}

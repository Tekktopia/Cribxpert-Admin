import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setSelectedListing,
  openModal,
  closeModal,
  closeAllModals,
  setSuccessMessage,
  approveListing,
  rejectListing,
  flagListing,
  suspendListing,
  selectSelectedListing,
  selectModals,
  selectSuccessMessage,
} from "../store/slices/listingSlice";
import type { ListingRecord } from "../data/listingMgmtData";
import { useNotification } from "./useNotification";

export function useListingActions() {
  const dispatch = useAppDispatch();
  const { showNotification } = useNotification();

  const selectedListing = useAppSelector(selectSelectedListing);
  const modals = useAppSelector(selectModals);
  const successMessage = useAppSelector(selectSuccessMessage);

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
        case "suspend":
          dispatch(openModal("suspend"));
          break;
      }
    },
    [dispatch]
  );

  const handleApprove = useCallback(() => {
    if (selectedListing) {
      dispatch(approveListing(selectedListing.id));
      dispatch(closeModal("approve"));
      const message = `"${selectedListing.title}" has been approved successfully!`;
      dispatch(setSuccessMessage(message));
      dispatch(openModal("success"));
      showNotification({
        type: "success",
        title: "Listing Approved",
        message: `${selectedListing.title} is now live and available for bookings.`,
      });
    }
  }, [dispatch, selectedListing, showNotification]);

  const handleReject = useCallback(
    (reason: string) => {
      if (selectedListing) {
        dispatch(rejectListing(selectedListing.id));
        dispatch(closeModal("reject"));
        const message = `"${selectedListing.title}" has been rejected.`;
        dispatch(setSuccessMessage(message));
        dispatch(openModal("success"));
        showNotification({
          type: "error",
          title: "Listing Rejected",
          message: `${selectedListing.title} has been rejected. Reason: ${reason}`,
        });
      }
    },
    [dispatch, selectedListing, showNotification]
  );

  const handleFlag = useCallback(
    (reason: string) => {
      if (selectedListing) {
        dispatch(flagListing(selectedListing.id));
        dispatch(closeModal("flag"));
        const message = `"${selectedListing.title}" has been flagged for review.`;
        dispatch(setSuccessMessage(message));
        dispatch(openModal("success"));
        showNotification({
          type: "warning",
          title: "Listing Flagged",
          message: `${selectedListing.title} has been flagged. Reason: ${reason}`,
        });
      }
    },
    [dispatch, selectedListing, showNotification]
  );

  const handleSuspend = useCallback(
    (reason: string) => {
      if (selectedListing) {
        dispatch(suspendListing(selectedListing.id));
        dispatch(closeModal("suspend"));
        const message = `"${selectedListing.title}" has been suspended.`;
        dispatch(setSuccessMessage(message));
        dispatch(openModal("success"));
        showNotification({
          type: "warning",
          title: "Listing Suspended",
          message: `${selectedListing.title} has been suspended. Reason: ${reason}`,
        });
      }
    },
    [dispatch, selectedListing, showNotification]
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
    isSuspendModalOpen: modals.suspend,
    isSuccessModalOpen: modals.success,
    setIsApproveModalOpen: (open: boolean) =>
      dispatch(open ? openModal("approve") : closeModal("approve")),
    setIsRejectModalOpen: (open: boolean) =>
      dispatch(open ? openModal("reject") : closeModal("reject")),
    setIsFlagModalOpen: (open: boolean) =>
      dispatch(open ? openModal("flag") : closeModal("flag")),
    setIsSuspendModalOpen: (open: boolean) =>
      dispatch(open ? openModal("suspend") : closeModal("suspend")),
    setIsSuccessModalOpen: (open: boolean) =>
      dispatch(open ? openModal("success") : closeModal("success")),
    handleViewDetails,
    handleAction,
    handleApprove,
    handleReject,
    handleFlag,
    handleSuspend,
    handleCloseModal,
    closeAllModals: handleCloseAllModals,
  };
}

import {
  ApproveListingModal,
  RejectListingModal,
  FlagListingModal,
  SuspendListingModal,
} from "./ListingActionModals";
import { SuccessModal } from "@/components/ui/ActionModals";
import { useListingActions } from "@/hooks/useListingActions";

export function ListingActionModalsManager() {
  const {
    selectedListing,
    modals,
    successMessage,
    handleApprove,
    handleReject,
    handleFlag,
    handleSuspend,
    handleCloseModal,
  } = useListingActions();

  return (
    <>
      <ApproveListingModal
        isOpen={modals.approve}
        onClose={() => handleCloseModal("approve")}
        listing={selectedListing}
        onConfirm={handleApprove}
      />

      <RejectListingModal
        isOpen={modals.reject}
        onClose={() => handleCloseModal("reject")}
        listing={selectedListing}
        onConfirm={handleReject}
      />

      <FlagListingModal
        isOpen={modals.flag}
        onClose={() => handleCloseModal("flag")}
        listing={selectedListing}
        onConfirm={handleFlag}
      />

      <SuspendListingModal
        isOpen={modals.suspend}
        onClose={() => handleCloseModal("suspend")}
        listing={selectedListing}
        onConfirm={handleSuspend}
      />

      <SuccessModal
        isOpen={modals.success}
        onClose={() => handleCloseModal("success")}
        title='Action Completed'
        message={successMessage}
        actionLabel='Continue'
      />
    </>
  );
}

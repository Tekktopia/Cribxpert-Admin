import {
  SuccessModal,
  ReasonModalWithOptions,
  TextInputModal,
} from "@/components/ui/ActionModals";
import { useListingActions } from "@/hooks/useListingActions";

export function ListingActionModalsManager() {
  const {
    modals,
    successMessage,
    selectedListing,
    handleApprove,
    handleReject,
    handleFlag,
    handleHide,
    handleCloseModal,
  } = useListingActions();

  // Predefined reason options for rejecting listings
  const rejectReasons = [
    { value: "inappropriate", label: "Inappropriate content or images" },
    { value: "misleading", label: "Misleading property description" },
    { value: "pricing", label: "Pricing concerns" },
    { value: "location", label: "Location verification failed" },
    { value: "verification", label: "Host verification incomplete" },
    { value: "safety", label: "Property safety concerns" },
    { value: "duplicate", label: "Duplicate listing" },
    { value: "other", label: "Other (specify in notes)" },
  ];

  // Predefined reason options for flagging listings
  const flagReasons = [
    { value: "suspicious", label: "Suspicious activity" },
    { value: "complaints", label: "Guest complaints" },
    { value: "safety", label: "Safety concerns" },
    { value: "fraudulent", label: "Fraudulent listing" },
    { value: "policy", label: "Policy violations" },
    { value: "behavior", label: "Host behavior issues" },
    { value: "other", label: "Other (specify in notes)" },
  ];

  return (
    <>
      {/* Approve Listing Modal */}
      <TextInputModal
        isOpen={modals.approve}
        onClose={() => handleCloseModal("approve")}
        title='Approve Listing'
        description='This listing will be made active and visible to guests.'
        inputLabel='Additional Notes (Optional)'
        inputPlaceholder='Enter your note....'
        onConfirm={(notes) => handleApprove(notes)}
        confirmLabel='Approve Listing'
        variant='primary'
        useTextarea={true}
        required={false}
      />

      {/* Reject Listing Modal */}
      <ReasonModalWithOptions
        isOpen={modals.reject}
        onClose={() => handleCloseModal("reject")}
        title='Reject Listing'
        description='This listing will be rejected and the host will be notified.'
        reasonLabel='Reason for reject'
        options={rejectReasons}
        onConfirm={(reason, notes) => handleReject(reason, notes)}
        confirmLabel='Reject Listing'
        variant='destructive'
        showAdditionalNotes={true}
        additionalNotesLabel='Additional Notes (Optional)'
        additionalNotesPlaceholder='Enter your note....'
      />

      {/* Flag Listing Modal */}
      <ReasonModalWithOptions
        isOpen={modals.flag}
        onClose={() => handleCloseModal("flag")}
        title='Flag Listing'
        description='This listing will be flagged for review and investigation.'
        reasonLabel='Reason for flag'
        options={flagReasons}
        onConfirm={(reason, notes) => handleFlag(reason, notes)}
        confirmLabel='Flag Listing'
        variant='warning'
        showAdditionalNotes={true}
        additionalNotesLabel='Additional Notes (Optional)'
        additionalNotesPlaceholder='Enter your note....'
      />

      {/* Hide/Unhide Listing Modal */}
      {(() => {
        const isHidden = selectedListing?.hideStatus === true;
        return (
          <TextInputModal
            isOpen={modals.hide}
            onClose={() => handleCloseModal("hide")}
            title={isHidden ? "Unhide Listing" : "Hide Listing"}
            description={
              isHidden
                ? "This listing will be made visible to guests again."
                : "This listing will be hidden and no longer visible to guests."
            }
            inputLabel='Additional Notes (Optional)'
            inputPlaceholder='Enter your note....'
            onConfirm={(notes) => handleHide(notes)}
            confirmLabel={isHidden ? "Unhide Listing" : "Hide Listing"}
            variant='warning'
            useTextarea={true}
            required={false}
          />
        );
      })()}

      {/* Success Modal */}
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

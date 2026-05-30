import { useState } from "react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { PageTitle } from "../components/layout/PageTitle";
import { KYCVerificationGrid } from "../features/kyc/KYCVerificationGrid";
import { KYCDetailsModal } from "../features/kyc/KYCDetailsModal";
import { useNotifications } from "../contexts/NotificationContext";
import type { KycSubmissionView } from "../api/features/kyc/kycManagementApiSlice";

export default function KYCVerification() {
  const [selected, setSelected] = useState<KycSubmissionView | null>(null);
  const { showToast } = useNotifications();

  const handleReviewed = (status: "approved" | "rejected", name: string) => {
    setSelected(null);
    showToast({
      type: status === "approved" ? "success" : "info",
      title: status === "approved" ? "KYC approved" : "KYC rejected",
      message:
        status === "approved"
          ? `${name} has been verified and notified.`
          : `${name} has been notified to resubmit.`,
    });
  };

  return (
    <PageWrapper>
      <PageTitle
        title="KYC Verification"
        subtitle="Review identity submissions and approve or reject verification requests."
      />

      <KYCVerificationGrid onViewDetails={setSelected} />

      {selected && (
        <KYCDetailsModal
          record={selected}
          onClose={() => setSelected(null)}
          onReviewed={handleReviewed}
        />
      )}
    </PageWrapper>
  );
}

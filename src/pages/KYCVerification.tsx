import { PageWrapper } from "../components/layout/PageWrapper";
import { KYCVerificationGrid } from "../features/kyc/KYCVerificationGrid";

export default function KYCVerification() {
  return (
    <PageWrapper
      title="KYC Verification"
      subtitle="Review identity submissions and approve or reject verification requests."
      isPopulated
      emptyState={{
        iconUrl: "/sidebar/card-tick.svg",
        title: "No KYC submissions yet",
        subtitle:
          "User ID documents will appear here once someone starts the verification process.",
      }}
    >
      <KYCVerificationGrid />
    </PageWrapper>
  );
}

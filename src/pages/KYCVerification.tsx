import { PageWrapper } from "@/components/layout/PageWrapper";
import { KYCVerificationGrid } from "@/features/kyc/KYCVerificationGrid";
import { mockKycData } from "@/data/kycData";

export default function KYCVerification() {
  const isPopulated = mockKycData.submissions.length > 0;
  return (
    <PageWrapper
      title='KYC Verification'
      subtitle='Approve or reject user ID submissions and ensure compliance'
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/kyc.svg",
        title: "No KYC submissions yet",
        subtitle:
          "User ID documents will appear here once someone starts the verification process.",
      }}
    >
      {isPopulated && <KYCVerificationGrid data={mockKycData} />}
    </PageWrapper>
  );
}

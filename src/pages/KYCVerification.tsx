import { PageWrapper } from "@/components/layout/PageWrapper";

export default function KYCVerification() {
  return (
    <PageWrapper
      title='KYC Verification'
      subtitle='Approve or reject user ID submissions and ensure compliance'
      isPopulated={false}
      emptyState={{
        iconUrl: "/svg/kyc.svg",
        title: "No KYC submissions yet",
        subtitle:
          "User ID documents will appear here once someone starts the verification process.",
      }}
    >
      {/* Future KYC verification content will go here */}
    </PageWrapper>
  );
}

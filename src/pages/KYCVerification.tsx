// src/pages/admin/KYCVerification.tsx
import { PageWrapper } from "@/components/layout/PageWrapper";
import { KYCVerificationGrid } from "@/features/kyc/KYCVerificationGrid";
import { useGetKYCSubmissionsQuery } from "@/api/features/kyc/kycManagementApiSlice";
import { Loader2 } from "lucide-react";

export default function KYCVerification() {
  const { data, isLoading, error } = useGetKYCSubmissionsQuery({ limit: 100 });
  
  if (isLoading) {
    return (
      <PageWrapper
        title='KYC Verification'
        subtitle='Approve or reject user ID submissions and ensure compliance'
        isPopulated={false}
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          <span className="ml-2">Loading KYC data...</span>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper
        title='KYC Verification'
        subtitle='Approve or reject user ID submissions and ensure compliance'
        isPopulated={false}
      >
        <div className="text-red-500 text-center p-8">
          Error loading KYC data. Please refresh the page.
        </div>
      </PageWrapper>
    );
  }

  const isPopulated = data && data.submissions.length > 0;

  return (
    <PageWrapper
      title='KYC Verification'
      subtitle='Approve or reject user ID submissions and ensure compliance'
      isPopulated={isPopulated}
      emptyState={{
        iconUrl: "/svg/kyc.svg",
        title: "No KYC submissions yet",
        subtitle: "User ID documents will appear here once someone starts the verification process.",
      }}
    >
      <KYCVerificationGrid />
    </PageWrapper>
  );
}

// =====================================================
// File: src/features/kyc/KYCDetailsModal.tsx
// =====================================================
import { X } from "lucide-react";
import { useState } from "react";
import type { KYCSubmission } from "@/data/kycData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/features/listingmgmt/components/ActionButton";
import { InfoSection } from "@/components/layout/InfoSection";
import { ConfirmationModal } from "@/components/ui/ActionModals";
import { getInitials, normalizeAvatarSrc, safeText } from "@/utils/userDisplay";

interface Props {
  isOpen: boolean;
  submission: KYCSubmission | null;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function KYCDetailsModal({
  isOpen,
  submission,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    type: "approve" | "reject" | null;
    title: string;
    message: string;
    confirmLabel: string;
  }>({
    isOpen: false,
    type: null,
    title: "",
    message: "",
    confirmLabel: "",
  });

  const handleApproveClick = () => {
    setConfirmationModal({
      isOpen: true,
      type: "approve",
      title: "Approve Submission",
      message: "Are you sure you want to approve?",
      confirmLabel: "Yes, Approve",
    });
  };

  const handleRejectClick = () => {
    setConfirmationModal({
      isOpen: true,
      type: "reject",
      title: "Reject Submission",
      message: "Are you sure you want to reject?",
      confirmLabel: "Yes, Reject",
    });
  };

  const handleConfirmAction = () => {
    if (!submission) return;

    if (confirmationModal.type === "approve") onApprove?.(submission.id);
    if (confirmationModal.type === "reject") onReject?.(submission.id);

    setConfirmationModal({
      isOpen: false,
      type: null,
      title: "",
      message: "",
      confirmLabel: "",
    });
  };

  const handleCancelAction = () => {
    setConfirmationModal({
      isOpen: false,
      type: null,
      title: "",
      message: "",
      confirmLabel: "",
    });
  };

  if (!isOpen || !submission) return null;

  const displayName = safeText((submission as any).name, "Unknown User");
  const docType = safeText((submission as any).documentType, "Unknown Document");
  const avatarSrc = normalizeAvatarSrc((submission as any).avatar);
  const initials = getInitials((submission as any).name, "U");

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Document Review</h2>
            <p className="text-sm text-gray-500 mt-1">
              {displayName} – {docType}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4 mb-8">
                <Avatar className="h-16 w-16 ring-2 ring-gray-100">
                  <AvatarImage src={avatarSrc} alt={displayName} />
                  <AvatarFallback className="bg-gray-100 text-gray-600 text-lg font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{displayName}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-200 text-pink-900">
                      Host
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-600">
                    ID: {(submission as any).internalId || "0000001"}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-base font-semibold text-gray-900 mb-6">Submission Details</h4>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Document Type:
                    </label>
                    <p className="text-sm text-gray-600">{docType}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">
                      Submission Date:
                    </label>
                    <p className="text-sm text-gray-600">
                      {safeText((submission as any).submissionDate, "—")}
                    </p>
                  </div>

                  {(submission as any).notes && (
                    <div>
                      <label className="text-sm font-medium text-gray-900 block mb-2">Notes:</label>
                      <p className="text-sm text-gray-600">{(submission as any).notes}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-900 block mb-2">Status:</label>
                    <Badge
                      variant={(submission as any).status === "Approved" ? "default" : "warning"}
                      className={`font-medium px-3 py-1 ${
                        (submission as any).status === "Approved"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                      }`}
                    >
                      {safeText((submission as any).status, "Pending")}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <InfoSection
                title="Document Images"
                variant="bordered"
                fields={[
                  {
                    label: "",
                    value: (
                      <div className="space-y-4 w-full">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <img
                            src="/images/complaint1.jpg"
                            alt="Driver's License"
                            className="w-full h-auto rounded-lg"
                            style={{ maxHeight: "200px", objectFit: "contain" }}
                          />
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <img
                            src="/images/complaint2.jpg"
                            alt="Categories of Vehicles"
                            className="w-full h-auto rounded-lg"
                            style={{ maxHeight: "200px", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    ),
                    type: "custom",
                  },
                ]}
                className="w-full"
                contentClassName="!px-0"
              />
            </div>
          </div>
        </div>

        {(submission as any).status !== "Approved" && (submission as any).status !== "Rejected" && (
          <div className="flex items-center justify-end gap-4 p-6 pt-4 border-t border-gray-100">
            <ActionButton
              label="Reject"
              onClick={handleRejectClick}
              variant="reject"
              className="px-8 py-2"
            />
            <ActionButton
              label="Approve"
              onClick={handleApproveClick}
              variant="approve"
              className="px-8 py-2"
            />
          </div>
        )}

        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={handleCancelAction}
          title={
            confirmationModal.title ||
            (confirmationModal.type === "approve"
              ? "Are you sure you want to approve?"
              : "Are you sure you want to reject?")
          }
          message={confirmationModal.message}
          confirmLabel={
            confirmationModal.confirmLabel ||
            (confirmationModal.type === "approve" ? "Yes, Approve" : "Yes, Reject")
          }
          onConfirm={handleConfirmAction}
          variant={confirmationModal.type === "reject" ? "destructive" : "primary"}
        />
      </div>
    </div>
  );
}

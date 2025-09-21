import { X } from "lucide-react";
import { useState } from "react";
import type { KYCSubmission } from "@/data/kycData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/features/listingmgmt/components/ActionButton";
import { InfoSection } from "@/components/layout/InfoSection";
import { ConfirmationModal } from "@/components/ui/ActionModals";

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
    if (confirmationModal.type === "approve") {
      onApprove?.(submission!.id);
    } else if (confirmationModal.type === "reject") {
      onReject?.(submission!.id);
    }
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

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 pb-4 border-b border-gray-100'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>
              Document Review
            </h2>
            <p className='text-sm text-gray-500 mt-1'>
              {submission.name} – {submission.documentType}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='h-5 w-5 text-gray-400' />
          </button>
        </div>

        {/* Body */}
        <div className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left - Profile Section */}
            <div>
              {/* Profile Header */}
              <div className='flex items-start gap-4 mb-8'>
                <Avatar className='h-16 w-16 ring-2 ring-gray-100'>
                  <AvatarImage src={submission.avatar} alt={submission.name} />
                  <AvatarFallback className='bg-gray-100 text-gray-600 text-lg font-medium'>
                    {submission.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-3'>
                    <h3 className='text-2xl font-bold text-gray-900'>
                      {submission.name}
                    </h3>
                    <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-pink-200 text-pink-900'>
                      Host
                    </span>
                  </div>
                  <p className='text-sm font-medium text-gray-600'>
                    ID: {submission.internalId || "0000001"}
                  </p>
                </div>
              </div>

              {/* Submission Details */}
              <div>
                <h4 className='text-base font-semibold text-gray-900 mb-6'>
                  Submission Details
                </h4>
                <div className='space-y-5'>
                  <div>
                    <label className='text-sm font-medium text-gray-900 block mb-2'>
                      Document Type:
                    </label>
                    <p className='text-sm text-gray-600'>
                      {submission.documentType}
                    </p>
                  </div>
                  <div>
                    <label className='text-sm font-medium text-gray-900 block mb-2'>
                      Submission Date:
                    </label>
                    <p className='text-sm text-gray-600'>
                      {submission.submissionDate}
                    </p>
                  </div>
                  {submission.notes && (
                    <div>
                      <label className='text-sm font-medium text-gray-900 block mb-2'>
                        Notes:
                      </label>
                      <p className='text-sm text-gray-600'>
                        {submission.notes}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className='text-sm font-medium text-gray-900 block mb-2'>
                      Status:
                    </label>
                    <Badge
                      variant={
                        submission.status === "Approved" ? "default" : "warning"
                      }
                      className={`font-medium px-3 py-1 ${
                        submission.status === "Approved"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-orange-100 text-orange-800 hover:bg-orange-100"
                      }`}
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Document Images */}
            <div>
              <InfoSection
                title='Document Images'
                variant='bordered'
                fields={[
                  {
                    label: "",
                    value: (
                      <div className='space-y-4 w-full'>
                        {/* Driving License Image */}
                        <div className='bg-white rounded-lg p-4 border border-gray-200'>
                          <img
                            src='/images/complaint1.jpg'
                            alt="Driver's License"
                            className='w-full h-auto rounded-lg'
                            style={{ maxHeight: "200px", objectFit: "contain" }}
                          />
                        </div>
                        {/* Categories Table Image */}
                        <div className='bg-white rounded-lg p-4 border border-gray-200'>
                          <img
                            src='/images/complaint2.jpg'
                            alt='Categories of Vehicles'
                            className='w-full h-auto rounded-lg'
                            style={{ maxHeight: "200px", objectFit: "contain" }}
                          />
                        </div>
                      </div>
                    ),
                    type: "custom",
                  },
                ]}
                className='w-full'
                contentClassName='!px-0'
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        {submission.status !== "Approved" &&
          submission.status !== "Rejected" && (
            <div className='flex items-center justify-end gap-4 p-6 pt-4 border-t border-gray-100'>
              <ActionButton
                label='Reject'
                onClick={handleRejectClick}
                variant='reject'
                className='px-8 py-2'
              />
              <ActionButton
                label='Approve'
                onClick={handleApproveClick}
                variant='approve'
                className='px-8 py-2'
              />
            </div>
          )}
        {/* Confirmation Modal */}
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
            (confirmationModal.type === "approve"
              ? "Yes, Approve"
              : "Yes, Reject")
          }
          onConfirm={handleConfirmAction}
          variant={
            confirmationModal.type === "reject" ? "destructive" : "primary"
          }
        />
      </div>
    </div>
  );
}

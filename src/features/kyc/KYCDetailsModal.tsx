import { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  ShieldX,
  Loader2,
  FileText,
  ExternalLink,
  Calendar,
  Mail,
  IdCard,
  AlertTriangle,
} from "lucide-react";
import {
  useGetKycSignedUrlsQuery,
  useReviewKycSubmissionMutation,
  kycDocumentLabel,
  type KycSubmissionView,
} from "../../api/features/kyc/kycManagementApiSlice";
import { getStatusBadgeClasses } from "../../utils/statusBadges";

interface KYCDetailsModalProps {
  record: KycSubmissionView;
  onClose: () => void;
  onReviewed: (status: "approved" | "rejected", name: string) => void;
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const isPdf = (path: string | null) => !!path && path.toLowerCase().endsWith(".pdf");

function DocPreview({
  label,
  url,
  path,
  loading,
}: {
  label: string;
  url: string | null;
  path: string | null;
  loading: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : !url ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-gray-400">
            <FileText className="h-6 w-6" />
            <span className="text-xs">Unavailable</span>
          </div>
        ) : isPdf(path) ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-600 transition hover:bg-gray-100"
          >
            <FileText className="h-8 w-8 text-red-500" />
            <span className="text-xs font-medium">Open PDF</span>
          </a>
        ) : (
          <a href={url} target="_blank" rel="noreferrer" className="block h-full w-full">
            <img
              src={url}
              alt={label}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100">
              <ExternalLink className="h-3 w-3" /> View
            </span>
          </a>
        )}
      </div>
    </div>
  );
}

export function KYCDetailsModal({ record, onClose, onReviewed }: KYCDetailsModalProps) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const { data: urls, isFetching } = useGetKycSignedUrlsQuery({
    front: record.documentFrontPath,
    back: record.documentBackPath,
    selfie: record.selfiePath,
  });

  const [review, { isLoading: isReviewing }] = useReviewKycSubmissionMutation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isPending = record.status === "pending";

  const handleApprove = async () => {
    try {
      await review({ id: record.id, status: "approved" }).unwrap();
      onReviewed("approved", record.userName);
    } catch {
      /* surfaced by parent toast on rejection below */
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    try {
      await review({
        id: record.id,
        status: "rejected",
        rejectionReason: reason.trim(),
      }).unwrap();
      onReviewed("rejected", record.userName);
    } catch {
      /* no-op */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Identity Verification</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Review the submitted documents before approving.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusBadgeClasses(
                record.status
              )}`}
            >
              {record.status}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* Applicant */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#013e4a] text-sm font-semibold text-white">
                {record.userName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{record.userName}</p>
                <p className="flex items-center gap-1 truncate text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5" /> {record.userEmail}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Meta icon={<IdCard className="h-3.5 w-3.5" />} label="Document">
                {kycDocumentLabel(record.documentType)}
              </Meta>
              <Meta icon={<IdCard className="h-3.5 w-3.5" />} label="Number">
                {record.documentNumber || "—"}
              </Meta>
              <Meta icon={<Calendar className="h-3.5 w-3.5" />} label="Submitted">
                {fmtDate(record.createdAt)}
              </Meta>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Uploaded documents</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DocPreview
                label="Document front"
                url={urls?.front ?? null}
                path={record.documentFrontPath}
                loading={isFetching}
              />
              {record.documentBackPath && (
                <DocPreview
                  label="Document back"
                  url={urls?.back ?? null}
                  path={record.documentBackPath}
                  loading={isFetching}
                />
              )}
              <DocPreview
                label="Selfie"
                url={urls?.selfie ?? null}
                path={record.selfiePath}
                loading={isFetching}
              />
            </div>
          </div>

          {/* Prior review outcome */}
          {!isPending && (
            <div
              className={`rounded-xl border p-4 text-sm ${
                record.status === "approved"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              <p className="font-semibold">
                {record.status === "approved" ? "Approved" : "Rejected"} ·{" "}
                {fmtDate(record.reviewedAt)}
              </p>
              {record.status === "rejected" && record.rejectionReason && (
                <p className="mt-1">Reason: {record.rejectionReason}</p>
              )}
            </div>
          )}

          {/* Rejection reason input */}
          {isPending && rejecting && (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-red-700">
                <AlertTriangle className="h-4 w-4" /> Reason for rejection
              </label>
              <p className="mb-2 text-xs text-red-600/80">
                This message is sent to the user in-app and via push notification.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                autoFocus
                placeholder="e.g. The document photo is blurry — please resubmit a clearer image."
                className="w-full resize-none rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {isPending && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4">
            {!rejecting ? (
              <>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={isReviewing}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <ShieldX className="h-4 w-4" /> Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isReviewing}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  {isReviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Approve
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setRejecting(false);
                    setReason("");
                  }}
                  disabled={isReviewing}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isReviewing || !reason.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {isReviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldX className="h-4 w-4" />
                  )}
                  Confirm rejection
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Meta({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-gray-400">
        {icon} {label}
      </span>
      <p className="mt-0.5 text-sm font-medium text-gray-800">{children}</p>
    </div>
  );
}

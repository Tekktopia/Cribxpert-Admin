import { Eye, Calendar, IdCard } from "lucide-react";
import {
  kycDocumentLabel,
  type KycSubmissionView,
} from "../../api/features/kyc/kycManagementApiSlice";
import { Badge } from "../../components/ui/badge";
import { getStatusVariant } from "../../utils/statusBadges";

interface KYCTableProps {
  records: KycSubmissionView[];
  onViewDetails: (record: KycSubmissionView) => void;
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

// Card grid of KYC submissions, matching the My-Listing card aesthetic.
export function KYCTable({ records, onViewDetails }: KYCTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {records.map((r) => (
        <button
          key={r.id}
          onClick={() => onViewDetails(r)}
          className="group text-left bg-white rounded-2xl border border-gray-200 hover:border-[#013e4a]/40 hover:shadow-md transition-all p-4 flex flex-col"
        >
          {/* Applicant */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#013e4a] text-sm font-semibold text-white">
                {initials(r.userName)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-gray-900">{r.userName}</p>
                <p className="truncate text-xs text-gray-500">{r.userEmail}</p>
              </div>
            </div>
            <Badge variant={getStatusVariant(r.status, "kyc")} className="capitalize flex-shrink-0">
              {r.status}
            </Badge>
          </div>

          {/* Meta */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-gray-400 flex items-center gap-1">
                <IdCard className="w-3 h-3" /> Document
              </p>
              <p className="font-medium text-gray-800 truncate mt-0.5">
                {kycDocumentLabel(r.documentType)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
              <p className="text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Submitted
              </p>
              <p className="font-medium text-gray-800 mt-0.5">{fmtDate(r.createdAt)}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 group-hover:border-[#013e4a] group-hover:text-[#013e4a] transition-colors">
              <Eye className="h-3.5 w-3.5" />
              {r.status === "pending" ? "Review" : "View"}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

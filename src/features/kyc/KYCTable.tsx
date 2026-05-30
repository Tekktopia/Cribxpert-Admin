import { Eye } from "lucide-react";
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

export function KYCTable({ records, onViewDetails }: KYCTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3 font-semibold">Applicant</th>
              <th className="px-5 py-3 font-semibold">Document</th>
              <th className="px-5 py-3 font-semibold">Submitted</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {records.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer transition hover:bg-gray-50/60"
                onClick={() => onViewDetails(r)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#013e4a] text-xs font-semibold text-white">
                      {initials(r.userName)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{r.userName}</p>
                      <p className="truncate text-xs text-gray-500">{r.userEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-700">
                  {kycDocumentLabel(r.documentType)}
                </td>
                <td className="px-5 py-3.5 text-gray-600">{fmtDate(r.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={getStatusVariant(r.status, "kyc")} className="capitalize">
                    {r.status}
                  </Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(r);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-[#013e4a] hover:text-[#013e4a]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {r.status === "pending" ? "Review" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

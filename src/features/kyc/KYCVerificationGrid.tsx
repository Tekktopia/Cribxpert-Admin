import { useMemo, useState } from "react";
import {
  Clock,
  ShieldCheck,
  ShieldX,
  Users,
  Loader2,
  AlertCircle,
  Inbox,
  RotateCw,
} from "lucide-react";
import { KYCTable } from "./KYCTable";
import { SearchAndFilters } from "../../components/ui/SearchAndFilters";
import {
  useGetKycSubmissionsQuery,
  type KycSubmissionView,
} from "../../api/features/kyc/kycManagementApiSlice";

interface KYCVerificationGridProps {
  onViewDetails: (record: KycSubmissionView) => void;
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export function KYCVerificationGrid({ onViewDetails }: KYCVerificationGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError, refetch, isFetching } =
    useGetKycSubmissionsQuery();

  const records = useMemo(() => data ?? [], [data]);

  const stats = useMemo(
    () => ({
      pending: records.filter((r) => r.status === "pending").length,
      approved: records.filter((r) => r.status === "approved").length,
      rejected: records.filter((r) => r.status === "rejected").length,
      total: records.length,
    }),
    [records]
  );

  const filtered = useMemo(() => {
    let rows = records;
    if (statusFilter !== "all") rows = rows.filter((r) => r.status === statusFilter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.userName.toLowerCase().includes(q) ||
          r.userEmail.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [records, searchTerm, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          tone="bg-amber-100"
          label="Pending review"
          value={stats.pending}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5 text-green-600" />}
          tone="bg-green-100"
          label="Approved"
          value={stats.approved}
        />
        <StatCard
          icon={<ShieldX className="h-5 w-5 text-red-600" />}
          tone="bg-red-100"
          label="Rejected"
          value={stats.rejected}
        />
        <StatCard
          icon={<Users className="h-5 w-5 text-[#013e4a]" />}
          tone="bg-[#013e4a]/10"
          label="Total submissions"
          value={stats.total}
        />
      </div>

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchPlaceholder="Search by name or email..."
        statusOptions={[
          { value: "all", label: "All statuses" },
          { value: "pending", label: "Pending" },
          { value: "approved", label: "Approved" },
          { value: "rejected", label: "Rejected" },
        ]}
        extraFilters={
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RotateCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        }
      />

      {/* States */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-gray-100 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm text-gray-600">Couldn't load KYC submissions.</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-[#013e4a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#013e4a]/90"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 bg-white text-center">
          <Inbox className="h-8 w-8 text-gray-300" />
          <p className="text-sm font-medium text-gray-600">No submissions found</p>
          <p className="text-xs text-gray-400">
            {records.length === 0
              ? "Verification requests will appear here as users submit them."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <KYCTable records={filtered} onViewDetails={onViewDetails} />
      )}
    </div>
  );
}

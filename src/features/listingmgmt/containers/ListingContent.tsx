import { useMemo } from "react";
import { Search, Building2, Clock, CheckCircle2, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type {
  AdminListing,
  AdminListingStats,
} from "@/api/features/adminListingManagement/adminListingManagementApiSlice";
import { ListingGrid } from "../components/ListingGrid";

interface ListingContentProps {
  listings: AdminListing[];
  stats?: AdminListingStats;
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onViewDetails: (listing: AdminListing) => void;
  onAction: (type: string, listing: AdminListing) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Approved: "#16a34a",
  Pending: "#f59e0b",
  Rejected: "#ef4444",
  Flagged: "#f97316",
};

export function ListingContent({
  listings,
  stats,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  totalPages,
  onPageChange,
  onViewDetails,
  onAction,
}: ListingContentProps) {
  const donutData = useMemo(
    () =>
      [
        { name: "Approved", value: stats?.approved ?? 0 },
        { name: "Pending", value: stats?.pending ?? 0 },
        { name: "Rejected", value: stats?.rejected ?? 0 },
        { name: "Flagged", value: stats?.flagged ?? 0 },
      ].filter((d) => d.value > 0),
    [stats]
  );

  return (
    <div className="space-y-6">
      {/* ── KPI strip + status donut ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={<Building2 className="w-5 h-5" />} tint="teal" label="Total" value={stats?.total ?? 0} />
          <KpiCard icon={<Clock className="w-5 h-5" />} tint="amber" label="Pending" value={stats?.pending ?? 0} />
          <KpiCard icon={<CheckCircle2 className="w-5 h-5" />} tint="green" label="Active" value={stats?.approved ?? 0} />
          <KpiCard icon={<Flag className="w-5 h-5" />} tint="orange" label="Flagged" value={stats?.flagged ?? 0} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Status breakdown</h3>
          {donutData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-xs text-gray-400">No data yet</div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-32 w-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={56} paddingAngle={2}>
                      {donutData.map((d) => (
                        <Cell key={d.name} fill={STATUS_COLORS[d.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="flex-1 space-y-1.5">
                {donutData.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-gray-900">{d.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Search and Filters ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, city, or state..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <ListingGrid
        listings={listings}
        isLoading={isLoading}
        onViewDetails={onViewDetails}
        onAction={onAction}
      />

      {/* ── Pagination ───────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-gray-600 px-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ReactNode;
  tint: "teal" | "amber" | "green" | "orange";
  label: string;
  value: number;
}) {
  const tints: Record<string, string> = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${tints[tint]}`}>{icon}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

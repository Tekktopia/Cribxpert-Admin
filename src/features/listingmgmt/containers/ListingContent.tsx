import { useMemo, useState } from "react";
import { Search, Building2, CheckCircle2, Clock, Flag, Loader2, AlertTriangle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { ListingManagementTabs } from "./ListingManagementTabs";
import { ListingGrid } from "../components/ListingGrid";
import { EditDiffModal } from "../modals/EditDiffModal";
import { useListingFilters } from "@/hooks/useListingFilters";
import {
  useGetListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  type ApiListing,
} from "@/api/features/adminListingManagement/adminListingManagementApiSlice";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingContentProps {
  onViewDetails: (listing: ListingRecord) => void;
  onAction: (listing: ListingRecord, action: string) => void;
}

export function ListingContent({ onViewDetails, onAction }: ListingContentProps) {
  const { filteredListings, activeTab, handleTabChange } = useListingFilters();
  const allListings = useAppSelector((s) => s.listing.listings);
  const [search, setSearch] = useState("");
  const [diffListing, setDiffListing] = useState<ApiListing | null>(null);

  // For the "Edited" tab — query Supabase directly for listings with edit_snapshot set
  const isEditedTab = activeTab === "edited";
  const { data: editedData, isLoading: editedLoading, refetch: refetchEdited } =
    useGetListingsQuery({ status: "edited" as any, limit: 100 }, { skip: !isEditedTab });
  const editedListings = editedData?.listings ?? [];

  const [approveListing, { isLoading: approving }] = useApproveListingMutation();
  const [rejectListing,  { isLoading: rejecting }]  = useRejectListingMutation();

  const stats = useMemo(
    () => ({
      total:   allListings.length,
      active:  allListings.filter((l) => l.status === "active").length,
      pending: allListings.filter((l) => l.status === "pending").length,
      flagged: allListings.filter((l) => l.status === "flagged").length,
    }),
    [allListings]
  );

  const visibleListings = useMemo(() => {
    if (!search.trim()) return filteredListings;
    const q = search.toLowerCase();
    return filteredListings.filter(
      (l) =>
        l.title?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.host?.name?.toLowerCase().includes(q)
    );
  }, [filteredListings, search]);

  const handleApproveEdited = async () => {
    if (!diffListing) return;
    await approveListing(diffListing._id).unwrap();
    setDiffListing(null);
    refetchEdited();
  };

  const handleRejectEdited = async () => {
    if (!diffListing) return;
    await rejectListing({ listingId: diffListing._id }).unwrap();
    setDiffListing(null);
    refetchEdited();
  };

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Building2 className="w-5 h-5" />} tint="bg-teal-50 text-teal-700" label="Total Listings" value={stats.total} />
        <StatCard icon={<CheckCircle2 className="w-5 h-5" />} tint="bg-green-50 text-green-700" label="Active" value={stats.active} />
        <StatCard icon={<Clock className="w-5 h-5" />} tint="bg-amber-50 text-amber-700" label="Pending" value={stats.pending} />
        <StatCard icon={<Flag className="w-5 h-5" />} tint="bg-orange-50 text-orange-700" label="Flagged" value={stats.flagged} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, location, or host…"
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-600/10"
        />
      </div>

      {/* Tabs */}
      <ListingManagementTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* ── Edited tab — shows host-edited listings awaiting re-approval ── */}
      {isEditedTab ? (
        editedLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading edited listings…
          </div>
        ) : editedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-gray-500">
            <CheckCircle2 className="w-10 h-10 text-gray-300 mb-3" />
            <p className="font-medium">No edited listings pending review</p>
            <p className="text-sm text-gray-400 mt-1">When hosts edit their approved listings, they'll appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {editedListings.map((listing: ApiListing) => (
              <button
                key={listing._id}
                onClick={() => setDiffListing(listing)}
                className="w-full text-left bg-white rounded-2xl border border-amber-200 hover:border-amber-400 hover:shadow-sm transition-all p-4 flex items-start gap-4"
              >
                {/* Amber badge */}
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900 truncate">{listing.name}</span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      Edited
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Host: {listing.userId.fullName} · {[listing.city, listing.state].filter(Boolean).join(", ")}
                  </p>
                  <p className="text-xs text-amber-600 mt-1 font-medium">
                    Click to review what changed before approving or rejecting
                  </p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0 mt-1">View diff →</span>
              </button>
            ))}
          </div>
        )
      ) : (
        /* ── Normal tabs ── */
        <ListingGrid
          listings={visibleListings}
          onViewDetails={onViewDetails}
          onAction={onAction}
        />
      )}

      {/* Edit diff modal */}
      {diffListing && (
        <EditDiffModal
          listing={diffListing}
          onClose={() => setDiffListing(null)}
          onApprove={handleApproveEdited}
          onReject={handleRejectEdited}
          isApproving={approving}
          isRejecting={rejecting}
        />
      )}
    </div>
  );
}

function StatCard({ icon, tint, label, value }: { icon: React.ReactNode; tint: string; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${tint}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

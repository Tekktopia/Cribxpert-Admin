import { useMemo, useState } from "react";
import { Search, Building2, CheckCircle2, Clock, Flag, Loader2, PencilLine, MapPin, User, ArrowRight } from "lucide-react";
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
import { useRealtimeRefetch } from "@/hooks/useRealtimeRefetch";

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

  // Keep the Edited tab live — refetch whenever any listing row changes
  useRealtimeRefetch(["listings"], refetchEdited, "edited-tab");

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

      {/* ── Edited tab — host-edited listings awaiting re-approval ── */}
      {isEditedTab ? (
        editedLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
            <Loader2 className="w-7 h-7 animate-spin" />
            <p className="text-sm">Loading edited listings…</p>
          </div>
        ) : editedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-gray-300" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">All clear</p>
              <p className="text-sm text-gray-400 mt-0.5 max-w-xs">
                When hosts edit their approved listings, they'll show up here for review.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {editedListings.map((listing: ApiListing) => {
              const cover = listing.listingImg?.[0]?.fileUrl;
              const location = [listing.city, listing.state].filter(Boolean).join(", ");
              const snapKeys = Object.keys(listing.editSnapshot ?? {});
              const changedCount = snapKeys.length;

              return (
                <button
                  key={listing._id}
                  onClick={() => setDiffListing(listing)}
                  className="group w-full text-left bg-white rounded-2xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Cover image or gradient */}
                  <div className="relative h-32 bg-gradient-to-br from-amber-400 to-orange-500 overflow-hidden flex-shrink-0">
                    {cover && (
                      <img
                        src={cover}
                        alt={listing.name}
                        className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    {/* Badge */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wide shadow-sm">
                      <PencilLine className="w-3 h-3" />
                      Edited
                    </div>
                    {changedCount > 0 && (
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm text-white text-[11px] font-semibold">
                        {changedCount} change{changedCount !== 1 ? "s" : ""}
                      </div>
                    )}
                    {/* Title on image */}
                    <p className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm leading-tight drop-shadow truncate">
                      {listing.name}
                    </p>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="flex flex-col gap-1.5">
                      {listing.userId.fullName && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <User className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{listing.userId.fullName}</span>
                        </div>
                      )}
                      {location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-xs text-amber-600 font-medium">Review changes</p>
                      <div className="w-7 h-7 rounded-lg bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
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

import { useMemo, useState } from "react";
import { Search, Building2, CheckCircle2, Clock, Flag } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { ListingManagementTabs } from "./ListingManagementTabs";
import { ListingGrid } from "../components/ListingGrid";
import { useListingFilters } from "@/hooks/useListingFilters";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingContentProps {
  onViewDetails: (listing: ListingRecord) => void;
  onAction: (listing: ListingRecord, action: string) => void;
}

export function ListingContent({ onViewDetails, onAction }: ListingContentProps) {
  const { filteredListings, activeTab, handleTabChange } = useListingFilters();
  const allListings = useAppSelector((s) => s.listing.listings);
  const [search, setSearch] = useState("");

  // Stat strip — computed from the full set, matching the user My-Listing page.
  const stats = useMemo(
    () => ({
      total: allListings.length,
      active: allListings.filter((l) => l.status === "active").length,
      pending: allListings.filter((l) => l.status === "pending").length,
      flagged: allListings.filter((l) => l.status === "flagged").length,
    }),
    [allListings]
  );

  // Apply the search box on top of the tab filter.
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

      {/* Grid */}
      <ListingGrid
        listings={visibleListings}
        onViewDetails={onViewDetails}
        onAction={onAction}
      />
    </div>
  );
}

function StatCard({
  icon,
  tint,
  label,
  value,
}: {
  icon: React.ReactNode;
  tint: string;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${tint}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

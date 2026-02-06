import { InfoSection } from "@/components/layout/InfoSection";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/utils/statusBadges";
import type { ListingRecord } from "@/data/listingMgmtData";

interface ListingInfoSectionProps {
  listing?: ListingRecord;
}

export function ListingInfoSection({
  listing,
}: ListingInfoSectionProps) {
  // Format created date to readable format
  const formatDate = (dateStr: string) => {
    // Handle DD-MM-YYYY format
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const date = new Date(`${year}-${month}-${day}`);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    // Fallback: try parsing as ISO string
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return dateStr;
  };

  const createdDate = listing?.created
    ? formatDate(listing.created)
    : "Not available";
  const status = listing?.status || "active";

  const variant = getStatusVariant(status.toLowerCase(), "listing");
  const label = getStatusLabel(status.toLowerCase(), "listing");

  return (
    <InfoSection
      title='Listing Info'
      fields={[
        { label: "Created", value: createdDate },
        { label: "Status", value: <Badge variant={variant}>{label}</Badge> },
      ]}
      headerClassName='!text-lg'
      variant='gray'
    />
  );
}

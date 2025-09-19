import { InfoSection } from "@/components/layout/InfoSection";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant, getStatusLabel } from "@/utils/statusBadges";

interface ListingInfoSectionProps {
  createdDate?: string;
  status?: string;
}

export function ListingInfoSection({
  createdDate = "August 9, 2025",
  status = "Active",
}: ListingInfoSectionProps) {
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

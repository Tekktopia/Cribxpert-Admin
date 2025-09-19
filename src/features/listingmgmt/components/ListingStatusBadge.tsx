import { Badge } from "@/components/ui/badge";
import {
  getStatusVariant,
  getStatusLabel,
  type BadgeVariant,
} from "@/utils/statusBadges";

interface ListingStatusBadgeProps {
  status: "pending" | "active" | "flagged" | "rejected";
  className?: string;
}

export const ListingStatusBadge = ({
  status,
  className = "",
}: ListingStatusBadgeProps) => {
  const variant: BadgeVariant = getStatusVariant(status, "listing");
  const label = getStatusLabel(status, "listing");

  return (
    <Badge variant={variant} className={`border-0 ${className}`}>
      {label}
    </Badge>
  );
};

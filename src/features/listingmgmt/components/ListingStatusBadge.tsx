import { Badge } from "@/components/ui/badge";

interface ListingStatusBadgeProps {
  status: "pending" | "active" | "flagged" | "rejected";
  className?: string;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-50 text-yellow-600" },
  active: { label: "Active", className: "bg-green-50 text-green-600" },
  flagged: { label: "Flagged", className: "bg-red-50 text-red-600" },
  rejected: { label: "Rejected", className: "bg-gray-50 text-gray-600" },
} as const;

export const ListingStatusBadge = ({
  status,
  className = "",
}: ListingStatusBadgeProps) => {
  // Safe object access with type checking
  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Badge className={`${config.className} border-0 ${className}`}>
      {config.label}
    </Badge>
  );
};

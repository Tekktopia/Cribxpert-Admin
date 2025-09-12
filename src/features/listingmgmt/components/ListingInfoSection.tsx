import { InfoSection } from "@/components/layout/InfoSection";
import { Badge } from "@/components/ui/badge";

interface ListingInfoSectionProps {
  createdDate?: string;
  status?: string;
}

export function ListingInfoSection({
  createdDate = "August 9, 2025",
  status = "Active",
}: ListingInfoSectionProps) {
  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();

    if (statusLower === "active") {
      return (
        <Badge className='bg-green-50 text-green-600 border-0 hover:bg-green-50'>
          {status}
        </Badge>
      );
    }

    if (statusLower === "pending") {
      return (
        <Badge className='bg-yellow-50 text-yellow-600 border-0 hover:bg-yellow-50'>
          {status}
        </Badge>
      );
    }

    return (
      <Badge className='bg-gray-50 text-gray-600 border-0 hover:bg-gray-50'>
        {status}
      </Badge>
    );
  };

  return (
    <InfoSection
      title='Listing Info'
      fields={[
        { label: "Created", value: createdDate },
        {
          label: "Status",
          value: getStatusBadge(status),
        },
      ]}
      headerClassName='!text-lg'
      variant='gray'
    />
  );
}

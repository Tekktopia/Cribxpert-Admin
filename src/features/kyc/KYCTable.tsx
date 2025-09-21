import { useState } from "react";
import type { KYCSubmission } from "@/data/kycData";
import { DataTable, type TableColumn } from "@/components/layout/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";
import { KYCDetailsModal } from "@/features/kyc/KYCDetailsModal";

interface KYCTableProps {
  submissions: KYCSubmission[];
  onAction?: (id: string, action: string) => void;
  onUpdateStatus?: (id: string, newStatus: KYCSubmission["status"]) => void;
}

export function KYCTable({
  submissions,
  onAction,
  onUpdateStatus,
}: KYCTableProps) {
  const [selected, setSelected] = useState<KYCSubmission | null>(null);

  const statusBadge = (status: KYCSubmission["status"]) => (
    <Badge
      variant={getStatusVariant(status.toLowerCase(), "kyc")}
      className='text-xs'
    >
      {status}
    </Badge>
  );

  const columns: TableColumn<KYCSubmission>[] = [
    {
      key: "ticketId",
      header: "Ticket ID",
      width: "w-24",
      render: (row) => (
        <span className='text-sm text-gray-900'>{row.ticketId}</span>
      ),
    },
    {
      key: "name",
      header: "Name",
      width: "w-56",
      render: (row) => (
        <div className='flex items-center'>
          <Avatar className='h-8 w-8 mr-3'>
            <AvatarImage src={row.avatar} alt={row.name} />
            <AvatarFallback>
              {row.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className='text-sm font-medium text-gray-900'>{row.name}</div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: "w-56",
      render: (row) => (
        <span className='text-sm text-gray-900'>{row.email}</span>
      ),
    },
    {
      key: "documentType",
      header: "Document Type",
      width: "w-40",
      render: (row) => (
        <span className='text-sm text-gray-900'>{row.documentType}</span>
      ),
    },
    {
      key: "status",
      header: "Role",
      width: "w-28",
      render: (row) => statusBadge(row.status),
    },
    {
      key: "submissionDate",
      header: "Submission Date",
      width: "w-32",
      render: (row) => (
        <span className='text-sm text-gray-900'>{row.submissionDate}</span>
      ),
    },
  ];

  const renderRowAction = (row: KYCSubmission) => (
    <button
      onClick={() => {
        setSelected(row);
        onAction?.(row.id, "view");
      }}
      className='text-sm text-cyan-700 hover:underline font-medium'
    >
      View Details
    </button>
  );

  return (
    <>
      <DataTable
        data={submissions}
        columns={columns}
        keyExtractor={(row) => row.id}
        renderRowAction={renderRowAction}
        showCheckboxes={true}
        showPagination={true}
        maxHeight='500px'
        initialItemsPerPage={10}
      />
      <KYCDetailsModal
        isOpen={!!selected}
        submission={selected}
        onClose={() => setSelected(null)}
        onApprove={(id) => {
          onUpdateStatus?.(id, "Approved");
          setSelected(null);
        }}
        onReject={(id) => {
          onUpdateStatus?.(id, "Rejected");
          setSelected(null);
        }}
      />
    </>
  );
}

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";
import { DataTable, type TableColumn } from "@/components/layout/DataTable";
import { ComplaintDetailsDrawer } from "@/features/userdetails/ComplaintDetailsDrawer";
import { mockActivityData, type ActivityRecord } from "@/data/activityData";

interface ActivityTabProps {
  userId: string;
}

export function ActivityTab({ userId }: ActivityTabProps) {
  console.log(userId);
  const [selectedComplaint, setSelectedComplaint] =
    useState<ActivityRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // In a real app, you'd filter by userId or fetch user-specific data
  const activityData = mockActivityData;

  const getStatusBadgeVariant = (status: ActivityRecord["status"]) =>
    getStatusVariant(status, "complaint");

  const columns: TableColumn<ActivityRecord>[] = [
    {
      key: "ticketId",
      header: "Ticket ID",
      render: (item) => (
        <span className='text-sm font-medium text-gray-900'>
          {item.ticketId}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (item) => (
        <span className='text-sm text-gray-600'>{item.date}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <Badge variant={getStatusBadgeVariant(item.status)}>
          {item.status}
        </Badge>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => (
        <span className='text-sm text-gray-600'>{item.type}</span>
      ),
    },
  ];

  const renderRowAction = (item: ActivityRecord) => (
    <button
      className='text-primary-600 hover:text-primary-700 font-medium text-sm'
      onClick={() => {
        setSelectedComplaint(item);
        setIsDrawerOpen(true);
      }}
    >
      View Details
    </button>
  );

  return (
    <div className='border border-[#EBEBEB] rounded-b-lg'>
      {/* Header */}
      <h3 className='text-lg font-semibold py-3 px-4 bg-[#E6EFF1] mb-0'>
        Complaints and Disputes
      </h3>

      {/* Data Table */}
      <DataTable
        data={activityData}
        columns={columns}
        keyExtractor={(item) => item.id}
        renderRowAction={renderRowAction}
        showCheckboxes={true}
        showPagination={true}
        initialItemsPerPage={10}
        itemsPerPageOptions={[2, 10, 25, 50]}
        maxHeight='500px'
        className='border-0 rounded-none'
        tableClassName=''
      />

      {/* Complaint Details Drawer */}
      {selectedComplaint && (
        <ComplaintDetailsDrawer
          complaintId={selectedComplaint.id}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
}

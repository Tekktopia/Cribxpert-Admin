import { DataTable, type TableColumn } from "@/components/layout/DataTable";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { RowActionMenu } from "./RowActionMenu";
import { statusToBadge, formatDateTime } from "../utils/formatters";
import { type NotificationRecord } from "../utils/types";

interface NotificationHistoryTableProps {
  data: NotificationRecord[];
  onAction: (item: NotificationRecord, action: string) => void;
}

export function NotificationHistoryTable({
  data,
  onAction,
}: NotificationHistoryTableProps) {
  const columns: TableColumn<NotificationRecord>[] = [
    {
      key: "title",
      header: "Title",
      width: "w-1/3",
      render: (n) => <span className='text-sm text-gray-900'>{n.title}</span>,
    },
    {
      key: "audience",
      header: "Audience",
      width: "w-1/6",
      render: (n) => (
        <span className='text-sm text-gray-700'>
          {n.audience === "all"
            ? "All Users"
            : n.audience === "hosts"
            ? "Hosts Only"
            : n.audience === "guests"
            ? "Guests Only"
            : "Custom"}
        </span>
      ),
    },
    {
      key: "sentAt",
      header: "Sent Date/Time",
      width: "w-1/6",
      render: (n) => (
        <span className='text-sm text-gray-700 whitespace-pre-line'>
          {formatDateTime(n.sentAt || n.scheduledAt)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-1/6",
      render: (n) => {
        const { label, variant } = statusToBadge(n.status);
        return (
          <Badge variant={variant as BadgeProps["variant"]}>{label}</Badge>
        );
      },
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(n) => n.id}
      renderRowAction={(n) => (
        <RowActionMenu
          isScheduled={n.status === "scheduled"}
          onSelect={(action) => onAction(n, action)}
        />
      )}
      className='mt-6'
      maxHeight='420px'
    />
  );
}

// =====================================================
// File: src/features/kyc/KYCVerificationGrid.tsx
// =====================================================
import { useState } from "react";
import type { KYCData, KYCSubmission } from "@/data/kycData";
import { ManagementGrid } from "@/components/layout/ManagementGrid";
import { useNotification } from "@/hooks/useNotification";
import { commonActions, commonFilters, commonSearchConfigs } from "@/utils/managementActions";
import { KYCTable } from "./KYCTable";
import { safeText } from "@/utils/userDisplay";

interface KYCVerificationGridProps {
  data: KYCData;
}

export function KYCVerificationGrid({ data }: KYCVerificationGridProps) {
  const { showNotification } = useNotification();
  const [rows, setRows] = useState<KYCSubmission[]>(data.submissions);

  const filters = [
    commonFilters.status([
      { value: "Approved", label: "Approved" },
      { value: "Pending", label: "Pending" },
      { value: "Under Review", label: "Under Review" },
      { value: "Rejected", label: "Rejected" },
    ]),
    {
      key: "documentType",
      label: "All Documents",
      value: "all",
      onChange: () => {},
      options: [
        { value: "Driver License", label: "Driver License" },
        { value: "Passport", label: "Passport" },
        { value: "National ID", label: "National ID" },
      ],
    },
  ];

  const handleApprove = (_id: string, name: string) =>
    showNotification({
      type: "success",
      title: "KYC Approved",
      message: `${name} has been approved.`,
      duration: 4000,
    });

  const handleReject = (_id: string, name: string) =>
    showNotification({
      type: "success",
      title: "KYC Rejected",
      message: `${name}'s submission has been rejected.`,
      duration: 4000,
    });

  const handleFlag = (_id: string, name: string) =>
    showNotification({
      type: "success",
      title: "KYC Flagged",
      message: `${name} has been flagged for review.`,
      duration: 4000,
    });

  const handleSendNotification = (_id: string, name: string) =>
    showNotification({
      type: "info",
      title: "Notification Sent",
      message: `A message has been sent to ${name}.`,
      duration: 3000,
    });

  const actions = [
    commonActions.view(() => {}),
    commonActions.activate(handleApprove, "KYC"),
    commonActions.deactivate(handleReject, "KYC"),
    commonActions.hold(handleFlag),
    commonActions.sendNotification(handleSendNotification),
  ];

  const renderTable = (filteredData: KYCSubmission[], onAction: (entityId: string, action: string) => void) => (
    <KYCTable
      submissions={filteredData}
      onAction={onAction}
      onUpdateStatus={(id, newStatus) => {
        setRows((prev) => prev.map((r) => ((r as any).id === id ? { ...r, status: newStatus } : r)));

        showNotification({
          type: newStatus === "Approved" ? "success" : "error",
          title: `KYC ${newStatus}`,
          message: `Submission ${id} marked as ${newStatus}.`,
          duration: 3000,
        });
      }}
    />
  );

  const getEntityName = (row: KYCSubmission) => safeText((row as any).name, "Unknown User");

  return (
    <ManagementGrid
      data={rows}
      entityName="users"
      searchPlaceholder="Search Users..."
      searchConfig={commonSearchConfigs.user}
      filters={filters}
      actions={actions}
      renderTable={renderTable}
      onExport={() =>
        showNotification({
          type: "info",
          title: "Export Started",
          message: "Preparing your KYC export...",
          duration: 3000,
        })
      }
      getEntityName={getEntityName}
    />
  );
}
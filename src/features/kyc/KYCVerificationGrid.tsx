import { useState, useEffect } from "react";
import type { KYCData, KYCSubmission } from "@/data/kycData";
import { ManagementGrid } from "@/components/layout/ManagementGrid";
import { useNotification } from "@/hooks/useNotification";
import {
  commonActions,
  commonFilters,
  commonSearchConfigs,
} from "@/utils/managementActions";
import { KYCTable } from "./KYCTable";
import { safeText } from "@/utils/userDisplay";
import {
  useGetKYCSubmissionsQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
  useResetKYCMutation,
  type KYCSubmission as APIKYCSubmission,
} from "@/api/features/kyc/kycManagementApiSlice";

interface KYCVerificationGridProps {
  data?: KYCData; // Make optional since we'll fetch from API
}

export function KYCVerificationGrid({
  data: propData,
}: KYCVerificationGridProps) {
  const { showNotification } = useNotification();

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<string>("all");

  // Fetch real data from API
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useGetKYCSubmissionsQuery({
    search: searchTerm || undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
    limit: 100,
  });

  const mapDocumentType = (
    type?: string,
  ): "Driver License" | "Passport" | "National ID" => {
    if (
      type === "Driver License" ||
      type === "Passport" ||
      type === "National ID"
    ) {
      return type;
    }
    return "National ID"; // default
  };

  const mapRole = (role?: string): "Host" | "Guest" => {
    if (role === "Host" || role === "Guest") {
      return role;
    }
    return "Guest"; // default
  };
  // Mutations
  const [approveKYC, { isLoading: approving }] = useApproveKYCMutation();
  const [rejectKYC, { isLoading: rejecting }] = useRejectKYCMutation();
  const [resetKYC] = useResetKYCMutation();

  // Transform API data to match component format
  // src/features/kyc/KYCVerificationGrid.tsx
  // Update the transformToKYCSubmission function

  const transformToKYCSubmission = (
    apiSubmission: APIKYCSubmission,
  ): KYCSubmission => {
    // Map status to display format
    let displayStatus: "Pending" | "Under Review" | "Approved" | "Rejected";
    if (apiSubmission.status === "verified") {
      displayStatus = "Approved";
    } else if (apiSubmission.status === "pending") {
      displayStatus = "Pending";
    } else if (apiSubmission.status === "failed") {
      displayStatus = "Rejected";
    } else {
      displayStatus = "Under Review";
    }

    // Generate a ticket ID from the user ID (first 6 characters)
    // Use originalId if available, otherwise use id
    const userId = apiSubmission.id || apiSubmission.userId;
    const ticketId = userId ? userId.slice(0, 6).toUpperCase() : "N/A";

    // Debug: log to see what we're getting
    console.log("Transforming submission:", {
      original: apiSubmission,
      userId,
      ticketId,
      name: apiSubmission.name,
    });

    return {
      id: ticketId,
      name: apiSubmission.name || "Unknown",
      email: apiSubmission.email || "",
      documentType: mapDocumentType(apiSubmission.documentType),
      role: mapRole(apiSubmission.role),
      status: displayStatus,
      submissionDate: apiSubmission.submissionDate
        ? new Date(apiSubmission.submissionDate).toLocaleDateString("en-CA")
        : new Date().toLocaleDateString("en-CA"),
    };
  };

  const submissions = apiData?.submissions.map(transformToKYCSubmission) || [];

  // Handle approval with real API
  const handleApprove = async (id: string, name: string) => {
    // Find the actual user ID from the original data
    const originalSubmission = apiData?.submissions.find(
      (s) => s.id.slice(0, 6) === id,
    );
    if (!originalSubmission) return;

    try {
      await approveKYC({ userId: originalSubmission.userId }).unwrap();
      showNotification({
        type: "success",
        title: "KYC Approved",
        message: `${name}'s KYC has been approved.`,
        duration: 4000,
      });
      refetch();
    } catch (err) {
      showNotification({
        type: "error",
        title: "Action Failed",
        message: `Failed to approve ${name}'s KYC.`,
        duration: 5000,
      });
    }
  };

  // Handle rejection with real API
  const handleReject = async (id: string, name: string) => {
    const originalSubmission = apiData?.submissions.find(
      (s) => s.id.slice(0, 6) === id,
    );
    if (!originalSubmission) return;

    try {
      await rejectKYC({
        userId: originalSubmission.userId,
        reason: "Document verification failed",
      }).unwrap();
      showNotification({
        type: "success",
        title: "KYC Rejected",
        message: `${name}'s submission has been rejected.`,
        duration: 4000,
      });
      refetch();
    } catch (err) {
      showNotification({
        type: "error",
        title: "Action Failed",
        message: `Failed to reject ${name}'s KYC.`,
        duration: 5000,
      });
    }
  };

  // Handle flag (set to pending for review)
  const handleFlag = async (id: string, name: string) => {
    const originalSubmission = apiData?.submissions.find(
      (s) => s.id.slice(0, 6) === id,
    );
    if (!originalSubmission) return;

    try {
      await resetKYC({ userId: originalSubmission.userId }).unwrap();
      showNotification({
        type: "success",
        title: "KYC Flagged",
        message: `${name} has been flagged for review.`,
        duration: 4000,
      });
      refetch();
    } catch (err) {
      showNotification({
        type: "error",
        title: "Action Failed",
        message: `Failed to flag ${name}'s KYC.`,
        duration: 5000,
      });
    }
  };
  console.log("API Data:", apiData);
  console.log("Submissions:", apiData?.submissions);

  const handleSendNotification = (id: string, name: string) => {
    showNotification({
      type: "info",
      title: "Notification Sent",
      message: `A message has been sent to ${name}.`,
      duration: 3000,
    });
  };

  // Filter configurations with proper onChange handlers
  const filters = [
    {
      ...commonFilters.status([
        { value: "Approved", label: "Approved" },
        { value: "Pending", label: "Pending" },
        { value: "Failed", label: "Failed" },
        { value: "Not Started", label: "Not Started" },
      ]),
      value: selectedStatus,
      onChange: (value: string) => setSelectedStatus(value),
    },
    {
      key: "documentType",
      label: "All Documents",
      value: selectedDocumentType,
      onChange: (value: string) => setSelectedDocumentType(value),
      options: [
        { value: "all", label: "All Documents" },
        { value: "Driver License", label: "Driver License" },
        { value: "Passport", label: "Passport" },
        { value: "National ID", label: "National ID" },
      ],
    },
  ];

  const actions = [
    commonActions.view(() => {}),
    commonActions.activate(handleApprove, "KYC"),
    commonActions.deactivate(handleReject, "KYC"),
    commonActions.hold(handleFlag),
    commonActions.sendNotification(handleSendNotification),
  ];

  // Apply local filtering for document type
  const getFilteredData = () => {
    let filtered = submissions;

    if (selectedDocumentType !== "all") {
      filtered = filtered.filter(
        (sub) => sub.documentType === selectedDocumentType,
      );
    }

    return filtered;
  };

  const renderTable = (
    filteredData: KYCSubmission[],
    onAction: (entityId: string, action: string) => void,
  ) => (
    <KYCTable
      submissions={filteredData}
      onAction={onAction}
      onUpdateStatus={(id, newStatus) => {
        // This is now handled by the API mutations
        refetch();
        showNotification({
          type: newStatus === "Approved" ? "success" : "error",
          title: `KYC ${newStatus}`,
          message: `Submission ${id} marked as ${newStatus}.`,
          duration: 3000,
        });
      }}
    />
  );

  const getEntityName = (row: KYCSubmission) =>
    safeText(row.name, "Unknown User");

  const handleExport = () => {
    // Create CSV from current filtered data
    const filteredData = getFilteredData();
    const headers = [
      "ID",
      "Name",
      "Email",
      "Document Type",
      "Role",
      "Status",
      "Submission Date",
    ];
    const rows = filteredData.map((sub) => [
      sub.id,
      sub.name,
      sub.email,
      sub.documentType,
      sub.role,
      sub.status,
      sub.submissionDate,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kyc-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification({
      type: "success",
      title: "Export Complete",
      message: `${filteredData.length} KYC records exported successfully.`,
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2">Loading KYC data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        Error loading KYC data. Please refresh the page.
      </div>
    );
  }

  const filteredData = getFilteredData();
  const isPopulated = filteredData.length > 0;

  if (!isPopulated) {
    return null; // Let PageWrapper handle empty state
  }

  return (
    <ManagementGrid
      data={filteredData}
      entityName="users"
      searchPlaceholder="Search Users..."
      searchConfig={{
        ...commonSearchConfigs.user,
      }}
      filters={filters}
      actions={actions}
      renderTable={renderTable}
      onExport={handleExport}
      getEntityName={getEntityName}
    />
  );
}

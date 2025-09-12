import type { UserMgmtData, User } from "@/data/userMgmtData";
import { UserTable } from "./UserTable";
import { ManagementGrid } from "@/components/layout/ManagementGrid";
import { useNotification } from "@/hooks/useNotification";
import {
  commonActions,
  commonFilters,
  commonSearchConfigs,
} from "@/utils/managementActions";

interface UserMgmtGridProps {
  data: UserMgmtData;
}

export function UserMgmtGrid({ data }: UserMgmtGridProps) {
  const { showNotification } = useNotification();

  // Define filter configurations using common patterns
  const filters = [
    commonFilters.role([
      { value: "Host", label: "Host" },
      { value: "Guest", label: "Guest" },
    ]),
    commonFilters.status([
      { value: "Verified", label: "Verified" },
      { value: "Pending", label: "Pending" },
      { value: "Blocked", label: "Blocked" },
    ]),
  ];

  // Action handlers
  const handleBlockUser = (
    // entityId: string,
    entityName: string,
    // reason?: string
  ) => {
    showNotification({
      type: "success",
      title: "User Blocked Successfully",
      message: `${entityName} has been blocked and will no longer have access to their account.`,
      duration: 5000,
    });
  };

  const handleSendNotification = (
    // entityId: string,
    entityName: string,
    // message?: string
  ) => {
    showNotification({
      type: "success",
      title: "Notification Sent",
      message: `Your notification has been sent to ${entityName}.`,
      duration: 4000,
    });
  };

  const handleResetSession = (
    // entityId: string,
    entityName: string) => {
    showNotification({
      type: "success",
      title: "Session Reset Successfully",
      message: `${entityName}'s session has been reset and they have been logged out.`,
      duration: 4000,
    });
  };

  const handleExport = () => {
    showNotification({
      type: "info",
      title: "Export Started",
      message:
        "Your user data export is being prepared. You'll receive a download link shortly.",
      duration: 3000,
    });
  };

  // Define actions using common action patterns
  const actions = [
    commonActions.view((entityId) => {
      console.log("View user:", entityId);
    }),
    commonActions.block(handleBlockUser),
    commonActions.sendNotification(handleSendNotification),
    commonActions.resetSession(handleResetSession),
  ];

  // Table render function
  const renderTable = (
    filteredData: User[],
    onAction: (entityId: string, action: string) => void
  ) => <UserTable users={filteredData} onUserAction={onAction} />;

  // Entity name extractor for users
  const getEntityName = (user: User) => user.name;

  return (
    <ManagementGrid
      data={data.users}
      entityName='users'
      searchPlaceholder='Search users by name, email, or ticket ID...'
      searchConfig={commonSearchConfigs.user}
      filters={filters}
      actions={actions}
      renderTable={renderTable}
      onExport={handleExport}
      getEntityName={getEntityName}
    />
  );
}

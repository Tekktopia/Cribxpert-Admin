import { useState, useMemo } from "react";
import { Upload } from "lucide-react";
import type { UserMgmtData } from "@/data/userMgmtData";
import {
  SearchAndFilters,
  type FilterConfig,
  type ActionButton,
} from "@/components/ui/SearchAndFilters";
import { UserTable } from "./UserTable";
import {
  BlockUserModal,
  SendNotificationModal,
  ConfirmationModal,
} from "@/components/ui/ActionModals";
import { useNotification } from "@/hooks/useNotification";
import { useBlockUserMutation } from "@/api/features/adminUserManagement/adminUserManagementApiSlice";

interface UserMgmtGridProps {
  data: UserMgmtData;
}

export function UserMgmtGrid({ data }: UserMgmtGridProps) {
  const { showNotification } = useNotification();
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // API hooks
  const [blockUserMutation] = useBlockUserMutation();

  // Modal states
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return data.users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.ticketId.toLowerCase().includes(searchValue.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [data.users, searchValue, roleFilter, statusFilter]);

  const handleUserAction = (userId: string, action: string) => {
    const user = data.users.find((u) => u.id === userId);
    if (!user) return;

    setSelectedUser({ id: userId, name: user.name });

    switch (action) {
      case "block":
        setShowBlockModal(true);
        break;
      case "send-notification":
        setShowNotificationModal(true);
        break;
      case "reset-session":
        setShowResetModal(true);
        break;
      default:
        console.log("User action:", userId, action);
    }
  };

  const handleBlockUser = async (reason: string) => {
    if (!selectedUser?.id) return;

    try {
      setShowBlockModal(false);

      // Call the API to block the user
      // Cache invalidation will automatically refetch the users list
      await blockUserMutation({
        userId: selectedUser.id,
        reason: reason.trim(),
      }).unwrap();

      // Show success notification
      showNotification({
        type: "success",
        title: "User Blocked Successfully",
        message: `${selectedUser.name} has been blocked and will no longer have access to their account.`,
        duration: 5000,
      });

      setSelectedUser(null);
    } catch (error: unknown) {
      console.error("Error blocking user:", error);
      
      // Extract error message
      let errorMessage = "There was an error blocking the user. Please try again.";
      if (error && typeof error === "object" && "data" in error) {
        const errorData = error.data as { message?: string };
        if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Show error notification
      showNotification({
        type: "error",
        title: "Failed to Block User",
        message: errorMessage,
        duration: 5000,
      });
    }
  };

  const handleSendNotification = async (message: string) => {
    try {
      // Here you would make an API call to send notification
      console.log(
        "Sending notification to:",
        selectedUser?.name,
        "Message:",
        message
      );

      setShowNotificationModal(false);

      // Simulate API call
      // await sendNotificationAPI(selectedUser?.id, message);

      // Show success notification
      showNotification({
        type: "success",
        title: "Notification Sent",
        message: `Your notification has been sent to ${selectedUser?.name}.`,
        duration: 4000,
      });

      setSelectedUser(null);
    } catch (error) {
      console.error("Error sending notification:", error);
      // Show error notification
      showNotification({
        type: "error",
        title: "Failed to Send Notification",
        message:
          "There was an error sending the notification. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleResetSession = async () => {
    try {
      // Here you would make an API call to reset user session
      console.log("Resetting session for:", selectedUser?.name);

      setShowResetModal(false);

      // Simulate API call
      // await resetUserSessionAPI(selectedUser?.id);

      // Show success notification
      showNotification({
        type: "success",
        title: "Session Reset Successfully",
        message: `${selectedUser?.name}'s session has been reset and they have been logged out.`,
        duration: 4000,
      });

      setSelectedUser(null);
    } catch (error) {
      console.error("Error resetting session:", error);
      // Show error notification
      showNotification({
        type: "error",
        title: "Failed to Reset Session",
        message:
          "There was an error resetting the user's session. Please try again.",
        duration: 5000,
      });
    }
  };

  const handleExport = () => {
    console.log("Export users");

    // Show export notification
    showNotification({
      type: "info",
      title: "Export Started",
      message:
        "Your user data export is being prepared. You'll receive a download link shortly.",
      duration: 3000,
    });

    // Here you would handle the actual export functionality
  };

  const handleClearFilters = () => {
    setRoleFilter("all");
    setStatusFilter("all");
    setSearchValue("");
  };

  // Define filter configurations
  const filters: FilterConfig[] = [
    {
      key: "role",
      label: "All Roles",
      value: roleFilter,
      onChange: setRoleFilter,
      options: [
        { value: "Host", label: "Host" },
        { value: "Guest", label: "Guest" },
      ],
    },
    {
      key: "status",
      label: "All Status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: "Verified", label: "Verified" },
        { value: "Pending", label: "Pending" },
        { value: "Blocked", label: "Blocked" },
      ],
    },
  ];

  // Define action buttons
  const actionButtons: ActionButton[] = [
    {
      label: "Export",
      icon: <Upload className='w-4 h-4 ml-2' />,
      onClick: handleExport,
      variant: "primary",
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Search and Filters */}
      <SearchAndFilters
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder='Search users by name, email, or ticket ID...'
        filters={filters}
        actionButtons={actionButtons}
        resultsInfo={{
          total: data.users.length,
          filtered: filteredUsers.length,
          entityName: "users",
        }}
        showActiveFilters={true}
        onClearFilters={handleClearFilters}
      />

      {/* Users Table */}
      <UserTable users={filteredUsers} onUserAction={handleUserAction} />

      {/* Modals */}
      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName={selectedUser?.name || ""}
        onConfirm={handleBlockUser}
      />

      <SendNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        userName={selectedUser?.name || ""}
        onSend={handleSendNotification}
      />

      <ConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title='Reset Session'
        message={`Are you sure you want to reset ${selectedUser?.name}'s session? They will be logged out of all devices.`}
        confirmLabel='Reset Session'
        onConfirm={handleResetSession}
        variant='destructive'
      />
    </div>
  );
}

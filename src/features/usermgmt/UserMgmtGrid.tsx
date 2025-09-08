import { useState, useMemo } from "react";
import { Upload } from "lucide-react";
import type { UserMgmtData } from "../../data/userMgmtData";
import {
  SearchAndFilters,
  type FilterConfig,
  type ActionButton,
} from "../../components/ui/SearchAndFilters";
import { UserTable } from "./UserTable";

interface UserMgmtGridProps {
  data: UserMgmtData;
}

export function UserMgmtGrid({ data }: UserMgmtGridProps) {
  const [searchValue, setSearchValue] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
    console.log("User action:", userId, action);
    // Handle user actions like view, edit, block, etc.
  };

  const handleExport = () => {
    console.log("Export users");
    // Handle export functionality
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
    </div>
  );
}

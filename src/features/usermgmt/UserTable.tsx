import { useState } from "react";
import { type User } from "@/data/userMgmtData";
import { Badge } from "@/components/ui/badge";
import { getStatusVariant } from "@/utils/statusBadges";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ActionMenu } from "@/components/ui/ActionMenu";
import { ActionMenuTrigger } from "@/components/ui/ActionMenuTrigger";
import { UserDetailsDrawer } from "@/features/usermgmt/UserDetailsDrawer";
import { DataTable, type TableColumn } from "@/components/layout/DataTable";
import { Eye, Ban, Bell, RotateCcw } from "lucide-react";

interface UserTableProps {
  users: User[];
  onUserAction?: (userId: string, action: string) => void;
}

export function UserTable({ users, onUserAction }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleUserAction = (userId: string, action: string) => {
    if (action === "view") {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setSelectedUser(user);
        setIsDrawerOpen(true);
      }
    } else {
      // Handle other actions
      onUserAction?.(userId, action);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
  };
  const getStatusBadge = (status: User["status"]) => (
    <Badge variant={getStatusVariant(status, "user")} className='text-xs'>
      {status}
    </Badge>
  );

  const getRoleBadge = (role: User["role"]) => {
    return (
      <Badge
        variant={role === "Host" ? "pending" : "secondary"}
        className='text-xs'
      >
        {role}
      </Badge>
    );
  };

  const columns: TableColumn<User>[] = [
    {
      key: "ticketId",
      header: "Ticket ID",
      width: "w-24",
      render: (user) => (
        <span className='text-sm font-medium text-gray-900'>
          {user.ticketId}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      width: "w-48",
      render: (user) => (
        <div className='flex items-center'>
          <Avatar className='h-8 w-8 mr-3'>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className='text-sm font-medium text-gray-900'>{user.name}</div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      width: "w-56",
      render: (user) => (
        <span className='text-sm text-gray-500'>{user.email}</span>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "w-20",
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: "status",
      header: "Status",
      width: "w-24",
      render: (user) => getStatusBadge(user.status),
    },
    {
      key: "lastActive",
      header: "Last Active",
      width: "w-28",
      render: (user) => (
        <span className='text-sm text-gray-500'>{user.lastActive}</span>
      ),
    },
  ];

  const renderRowAction = (user: User) => {
    const menuItems = [
      {
        label: "View",
        action: "view",
        icon: <Eye className='w-4 h-4' />,
      },
      {
        label: "Block",
        action: "block",
        icon: <Ban className='w-4 h-4' />,
        variant: "destructive" as const,
      },
      {
        label: "Send Notification",
        action: "send-notification",
        icon: <Bell className='w-4 h-4' />,
      },
      {
        label: "Reset Session",
        action: "reset-session",
        icon: <RotateCcw className='w-4 h-4' />,
      },
    ];

    return (
      <ActionMenu
        items={menuItems}
        onSelect={(action) => handleUserAction(user.id, action)}
        trigger={<ActionMenuTrigger />}
      />
    );
  };

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
        renderRowAction={renderRowAction}
        onRowAction={(user, action) => handleUserAction(user.id, action)}
        showCheckboxes={true}
        showPagination={true}
        maxHeight='500px'
        initialItemsPerPage={10}
      />

      <UserDetailsDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
      />
    </>
  );
}

import { type User } from "../../data/userMgmtData";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Pagination } from "../../components/ui/Pagination";
import { usePagination } from "../../hooks/usePagination";

interface UserTableProps {
  users: User[];
  onUserAction?: (userId: string, action: string) => void;
}

export function UserTable({ users, onUserAction }: UserTableProps) {
  // Add pagination
  const pagination = usePagination(users.length, 10);
  const paginatedUsers = pagination.slice(users);

  const getStatusBadge = (status: User["status"]) => {
    switch (status) {
      case "Verified":
        return (
          <Badge variant='success' className='text-xs'>
            Verified
          </Badge>
        );
      case "Pending":
        return (
          <Badge variant='warning' className='text-xs'>
            Pending
          </Badge>
        );
      case "Blocked":
        return (
          <Badge variant='destructive' className='text-xs'>
            Blocked
          </Badge>
        );
      default:
        return (
          <Badge variant='secondary' className='text-xs'>
            {status}
          </Badge>
        );
    }
  };

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

  return (
    <div className='bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col'>
      {/* Table container with fixed height and scrolling */}
      <div className='overflow-auto scrollbar-thin' style={{ maxHeight: "500px" }}>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50 sticky top-0 z-10'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-12'>
                <input
                  type='checkbox'
                  className='h-4 w-4 text-primary-600 focus:ring-primary-600 border-gray-300 rounded'
                />
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-24'>
                Ticket ID
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-48'>
                Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-56'>
                Email
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-20'>
                Role
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-24'>
                Status
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-28'>
                Last Active
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 w-16'>
                Action
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {paginatedUsers.map((user) => (
              <tr key={user.id} className='hover:bg-gray-50'>
                <td className='px-6 py-4 whitespace-nowrap w-12'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 text-primary-600 focus:ring-primary-600 border-gray-300 rounded'
                  />
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-24'>
                  {user.ticketId}
                </td>
                <td className='px-6 py-4 whitespace-nowrap w-48'>
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
                    <div className='text-sm font-medium text-gray-900'>
                      {user.name}
                    </div>
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-56'>
                  {user.email}
                </td>
                <td className='px-6 py-4 whitespace-nowrap w-20'>
                  {getRoleBadge(user.role)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap w-24'>
                  {getStatusBadge(user.status)}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-28'>
                  {user.lastActive}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-16'>
                  <div className='relative inline-block text-left'>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 w-8 p-0'
                      onClick={() => onUserAction?.(user.id, "menu")}
                    >
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z'
                        />
                      </svg>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={pagination.onPageChange}
        onItemsPerPageChange={pagination.onItemsPerPageChange}
        showItemsPerPage={true}
        showGoToPage={true}
      />
    </div>
  );
}

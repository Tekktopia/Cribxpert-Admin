import { Upload } from "lucide-react";

interface UserDetailActionsProps {
  onExport: () => void;
  onBlockUser: () => void;
}

export function UserDetailActions({
  onExport,
  onBlockUser,
}: UserDetailActionsProps) {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>User Management</h1>
        <p className='text-sm text-gray-600 mt-1'>
          View, verify, and manage all registered guests and hosts
        </p>
      </div>

      <div className='flex items-center space-x-3'>
        <button
          onClick={onExport}
          className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors'
        >
          <Upload className='w-4 h-4 mr-2' />
          Export
        </button>

        <button
          onClick={onBlockUser}
          className='inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors'
        >
          Block User
        </button>
      </div>
    </div>
  );
}

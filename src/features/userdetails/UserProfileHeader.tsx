import { User } from "lucide-react";

interface UserProfileHeaderProps {
  user: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export function UserProfileHeader({ user }: UserProfileHeaderProps) {
  return (
    <div className='mb-6'>
      <div className='flex items-center space-x-4'>
        {/* Avatar */}
        <div className='relative'>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className='w-16 h-16 rounded-full object-cover'
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center'>
              <User className='w-8 h-8 text-gray-400' />
            </div>
          )}
        </div>

        {/* User Info */}
        <div className='flex-1'>
          <h1 className='text-2xl font-semibold text-gray-900 mb-1'>
            {user.name}
          </h1>
          <div className='flex items-center space-x-3'>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
              {user.role}
            </span>
            <span className='text-sm text-gray-500'>ID: {user.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { X, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type User } from "@/data/userMgmtData";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserDetailsDrawerProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsDrawer({
  user,
  isOpen,
  onClose,
}: UserDetailsDrawerProps) {
  const navigate = useNavigate();

  if (!user) return null;

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

  const handleViewMore = () => {
    navigate(`/users/${user.id}`);
    onClose(); // Close drawer when navigating
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 h-full bg-black/20 bg-opacity-50 z-40 transition-opacity'
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 overflow-y-auto p-4 h-full w-full lg:w-[40%] bg-white rounded-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div
          className='relative h-[150px]  rounded-lg'
          style={{
            background:
              "linear-gradient(90.55deg, #FEBF9B 19.41%, #006073 99.52%)",
          }}
        >
          <button
            onClick={onClose}
            className='absolute top-4 right-4 p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full transition-colors'
          >
            <X className='w-5 h-5' />
          </button>

          {/* Avatar positioned to overlap header and content */}
          <div className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2'>
            <Avatar className='w-20 h-20 border-4 border-white'>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className='text-lg font-semibold'>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 pt-12 space-y-6 overflow-y-auto h-full'>
          {/* User Name and Status */}
          <div className='text-center'>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              {user.name}
            </h2>
            <div className='flex justify-center'>
              {getStatusBadge(user.status)}
            </div>
          </div>

          {/* Personal Information */}
          <div className='space-y-4 rounded-b-lg border-[2px] border-[#EBEBEB]'>
            <h3 className='text-lg py-3 px-4 font-medium bg-[#E6EFF1] text-gray-900'>
              Personal Information
            </h3>

            <div className='space-y-3 px-4 pb-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Role:</span>
                <div>{getRoleBadge(user.role)}</div>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Full Name:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.name}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Gender:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.gender || "Not specified"}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Date Joined:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.dateJoined || "2024-09-15"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className='space-y-4 rounded-b-lg border-[2px] border-[#EBEBEB]'>
            <h3 className='text-lg py-3 px-4 font-medium bg-[#E6EFF1] text-gray-900'>
              Contact Information
            </h3>

            <div className='space-y-3 px-4 pb-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Phone number:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.phone || "08167889767"}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Email:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.email}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Location:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.location || "Lagos, Nigeria"}
                </span>
              </div>
            </div>
          </div>

          {/* Booking Information */}
          <div className='space-y-4 rounded-b-lg border-[2px] border-[#EBEBEB]'>
            <h3 className='text-lg py-3 px-4 font-medium bg-[#E6EFF1] text-gray-900'>
              Booking Information
            </h3>

            <div className='space-y-3 px-4 pb-4'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Last Activity:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.lastActive}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Total Bookings:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.totalBookings || "12"}
                </span>
              </div>

              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Active Bookings:</span>
                <span className='text-sm font-medium text-gray-900'>
                  {user.activeBookings || "3"}
                </span>
              </div>
            </div>
          </div>

          {/* View More Button */}
          <div className='px-4 pb-6'>
            <button
              onClick={handleViewMore}
              className='w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2'
            >
              <span>View More</span>
              <ExternalLink className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

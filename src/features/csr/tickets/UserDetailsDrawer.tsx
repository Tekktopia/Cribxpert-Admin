import { X, Mail, Phone, MessageSquareText ,  Eye , CheckCircle } from "lucide-react";
import { type User } from "@/data/csrUserData";
import cythia from "@public/avatars/cynthia.png";
interface UserDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailsDrawer({ isOpen, onClose, user }: UserDetailsDrawerProps) {
  if (!isOpen || !user) return null;

  const handleSendMessage = () => {
    console.log("Sending message to:", user.email);
  };

  const handleViewTickets = () => {
    console.log("Viewing tickets for user:", user.id);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Drawer */}
        <div 
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl transform transition-all duration-300 ease-in-out overflow-hidden "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className=" text-black pt-4 pl-4 pb-1">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span>BK10001</span>
                  <span>•</span>
                  <span className="text-primary-800 bg-primary-50 px-2 py-1 rounded">Active</span>
                  <span className="text-primary-800 bg-primary-50 px-2 py-1 rounded">Verified</span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-teal-600 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
            <hr className=" max-w-[120%]  border-gray-300 border-1"/>

          {/* Content */}
          <div className="p-6">
            {/* Performance Summary - Grid Layout */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <hr className="border-gray-200 mb-4 border-1"/>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-blue">2</p>
                  <p className="text-xs text-gray-500 mt-4">Active Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-primary-600">10</p>
                  <p className="text-xs text-gray-500 mt-4">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-error">1</p>
                  <p className="text-xs text-gray-500 mt-4">Complaints</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-error">0</p>
                  <p className="text-xs text-gray-500 mt-4">Disputes</p>
                </div>
              </div>
            </div>

              <div className="flex justify-between">

            {/* Host Information */}
            <div className="mb-6 p-4 bg-primary-25 h-[70%]">
        
              <div className=" flex">
                <div className="space-x-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
                <div className="pb-2">
                  <span className="text-sm text-gray-500 ">Name:</span>
                  <span className="text-sm font-medium text-gray-900"> {user.name}</span>
                </div>
                <div className="flex items-start gap-2 pb-2">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900 break-all"> {user.email}</span>
                </div>
                <div className="flex items-start gap-2 pb-2">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900">{user.phone || "+2348167134675"}</span>
                </div>
                <div className="flex items-start gap-2 pb-2 ">
                  <span className="text-sm text-gray-500">Role:</span>
                  <span className="inline-block px-3 py-1 bg-light-purple text-purple text-xs font-medium rounded-md">
                    {user.role}
                  </span>
                </div>
                </div>
                <div>
                <img 
                  src={cythia} 
                  alt="Host Avatar" 
                  className="w-14 h-14 rounded-full object-cover border-2 border-white"
                />
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="border-gray-200 border-2 rounded-b-lg">

            <div className="mb-6">
              <h3 className="text-lg font-semibold bg-primary-25 text-gray-900 mb-4 p-2">Property Information</h3>
              <div className="space-y-3 p-2">
            <div className="flex p-2">
              <p className="text-sm text-black whitespace-nowrap mr-[4px]">Address: </p>
              <span className="text-sm text-gray-600 break-words flex-1">
                 {user.propertyInfo?.address || "No 1234, Adeyemo street, Lagos, Nigeria"}
              </span>
            </div>
          </div>
            </div>

            {/* Stay Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 bg-primary-25 p-2">Stay Information</h3>
              <div className="space-y-1 p-2">
                <div className="flex items-start gap-3">
                  <div>
                    <span className="text-sm text-black">Join Date: </span>
                    <span className="text-sm text-gray-500">{user.joinDate || "Aug 15, 2025"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div>
                    <span className="text-sm text-black">Last Activity: </span>
                    <span className="text-sm text-gray-500">{user.lastActive || "2025-10-19 14:30"}</span>
                  </div>
                </div>
              </div>
            </div>
              </div>

              </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 pt-2 ">
              <button 
                onClick={handleSendMessage}
                className=" flex items-center justify-center gap-1 px-3 py-2.5 bg-white text-primary-600 text-sm font-medium rounded-xl cursor-pointer transition-colors border-2 border-primary-600"
              >
                <MessageSquareText className="w-4 h-4" />
                Send Message
              </button>
              <button 
                onClick={handleViewTickets}
                className=" flex items-center justify-center gap-1 px-3 py-2.5 bg-primary-600 border text-white  text-sm font-medium rounded-lg  cursor-pointer transition-colors"
              >
                < Eye  className="w-4 h-4" />
                View Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
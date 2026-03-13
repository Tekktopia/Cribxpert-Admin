import { X, Mail, Phone, Calendar, Home, MessageCircle, Ticket, CheckCircle } from "lucide-react";
import { type User } from "@/data/csrUserData";

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
          className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl transform transition-all duration-300 ease-in-out overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className=" text-black p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
                <div className="flex items-center gap-2 text-sm">
                  <span>BK10001</span>
                  <span>•</span>
                  <span className="text-primary-800 bg-primary-50 px-2 py-1 rounded">Active</span>
                  <span>Verified</span>
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

          {/* Content */}
          <div className="p-6">
            {/* Performance Summary - Grid Layout */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">2</p>
                  <p className="text-xs text-gray-500 mt-1">Active Bookings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">10</p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">1</p>
                  <p className="text-xs text-gray-500 mt-1">Complaints</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-xs text-gray-500 mt-1">Disputes</p>
                </div>
              </div>
            </div>

            {/* Host Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-sm text-gray-500 min-w-[60px]">Name:</span>
                  <span className="text-sm font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900 break-all">{user.email}</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900">{user.phone || "+2348167134675"}</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-sm text-gray-500 min-w-[60px]">Role:</span>
                  <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Property Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Home className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm text-gray-900">
                    {user.propertyInfo?.address || "No 1234, Adeyemo street, Lagos, Nigeria"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stay Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500">Join Date: </span>
                    <span className="text-sm text-gray-900">{user.joinDate || "Aug 15, 2025"}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <span className="text-sm text-gray-500">Last Activity: </span>
                    <span className="text-sm text-gray-900">{user.lastActive || "2025-10-19 14:30"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button 
                onClick={handleSendMessage}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Send Message
              </button>
              <button 
                onClick={handleViewTickets}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Ticket className="w-4 h-4" />
                View Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
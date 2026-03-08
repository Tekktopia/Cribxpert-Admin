
import { X, Mail, Phone, Calendar, MessageCircle, Ticket, Home, Star, Award } from "lucide-react";
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
    // Implement message functionality
  };

  const handleViewTickets = () => {
    console.log("Viewing tickets for user:", user.id);
    // Navigate to user tickets or open tickets drawer
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-teal-700">
                {user.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                {user.role}
              </span>
            </div>
          </div>

          {/* Summary Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
                <Home className="w-4 h-4" />
                <span>Active Bookings</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.metrics?.activeBookings || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
                <Award className="w-4 h-4" />
                <span>Completed</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.metrics?.completedBookings || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
                <Star className="w-4 h-4" />
                <span>Complaints</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.metrics?.complaints || 0}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-2">
                <Award className="w-4 h-4" />
                <span>Disputes</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{user.metrics?.disputes || 0}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{user.phone || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Stay Information</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Join Date</p>
                  <p className="text-sm font-medium text-gray-900">{user.joinDate}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Last Activity</p>
                  <p className="text-sm font-medium text-gray-900">{user.lastActive}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Property Information (for hosts) */}
          {user.role === "Host" && user.propertyInfo && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Information</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-2">
                {user.propertyInfo.address}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Home className="w-4 h-4" />
                <span>{user.propertyInfo.listings || 0} Listings</span>
              </div>
            </div>
          )}

          {/* Address (for guests) */}
          {user.address && user.role !== "Host" && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Address</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {user.address}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <button 
              onClick={handleSendMessage}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </button>
            <button 
              onClick={handleViewTickets}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              View Tickets
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
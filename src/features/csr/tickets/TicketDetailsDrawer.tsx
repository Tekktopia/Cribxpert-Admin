// src/features/tickets/components/TicketDetailsDrawer.tsx
import {
  X,
  Mail,
  Phone,
  Calendar,
  User,
  Star,
  Clock,
  AlertCircle,
} from "lucide-react";
import { type Ticket } from "@/features/csr/tickets/types";

interface TicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
}

export function TicketDetailsDrawer({
  isOpen,
  onClose,
  ticket,
}: TicketDetailsDrawerProps) {
  if (!isOpen || !ticket) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="w-full max-w-4xl bg-white rounded-lg shadow-xl transform transition-all duration-300 ease-in-out overflow-y-auto max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment not processed for booking
                  </h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    Open
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    High Priority
                  </span>
                </div>
                <p className="text-sm text-gray-500">Ticket ID: TK001</p>
              </div>
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
            <div className="flex">
              <div>
                {/* Customer Information Grid */}
                <div className="mb-8">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Customer</p>
                        <p className="text-sm font-medium text-gray-900">
                          John Smith
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-medium text-gray-900">
                          Payment
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Created </p>
                        <p className="text-sm font-medium text-gray-900">
                          john@email.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Assigned to</p>
                        <p className="text-sm font-medium text-gray-900">
                          March 2024
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                    Customer reports payment was charged but booking
                    confirmation not received.
                  </p>
                </div>

                {/* Activity & Comments */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Activity & Comments
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">
                          Sarah Johnson
                        </span>
                        <span className="text-xs text-gray-500">
                          Customer • 2025-01-15 10:30 AM
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        I'm having trouble accessing my booking confirmation.
                        The email link doesn't seem to work.
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-blue-900">
                          Mike Afolabi
                        </span>
                        <span className="text-xs text-blue-600">
                          Support Agent • 2025-01-15 10:30 AM
                        </span>
                      </div>
                      <p className="text-sm text-blue-800">
                        Hi Sarah, I've checked your booking and resent the
                        confirmation email. Please check your inbox and spam
                        folder.
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">
                          Sarah Johnson
                        </span>
                        <span className="text-xs text-gray-500">
                          Customer • 2025-01-15 10:30 AM
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Thank you! I received the email and can now access my
                        booking details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add Comment */}
                <div className="mb-8">
                  <textarea
                    placeholder="Add a comment/update..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="bg-pink-700">
                {/* Related Information */}
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Related Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500">Related Booking:</span>{" "}
                      <span className="font-medium text-gray-900">
                        BK010001
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-500">Previous Tickets:</span>{" "}
                      <span className="font-medium text-gray-900">
                        BK010001 (Resolved)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors">
                    Escalate
                  </button>
                  <button className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    Edit Ticket
                  </button>
                  <button className="px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors">
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

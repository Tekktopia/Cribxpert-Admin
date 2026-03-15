// src/features/tickets/components/TicketDetailsDrawer.tsx
import { X, Mail, Phone, Calendar, User, MessageCircle, Ticket as TicketIcon, Clock, AlertCircle } from 'lucide-react';
import { type Ticket } from '@/features/csr/tickets/types';
interface TicketDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null; // Replace 'any' with your Ticket type
}

export function TicketDetailsDrawer({ isOpen, onClose, ticket }: TicketDetailsDrawerProps) {
  if (!isOpen || !ticket) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ticket Details</h2>
              <p className="text-sm text-gray-500 mt-1">ID: {ticket.ticketId}</p>
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
          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-medium text-gray-900">{ticket.user}</p>
              <p className="text-sm text-gray-600 mt-1">{ticket.email || 'john@email.com'}</p>
            </div>
          </div>

          {/* Ticket Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-sm font-medium text-gray-900">{ticket.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm font-medium text-gray-900">{ticket.created}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Assigned to</p>
              <p className="text-sm font-medium text-gray-900">{ticket.assignedTo || 'Sarah Johnson'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Priority</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {ticket.priority}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
              {ticket.subject}
            </p>
          </div>

          {/* Activity & Comments */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity & Comments</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">Sarah Johnson</span>
                  <span className="text-xs text-gray-500">Customer, 2025-01-15 10:30 AM</span>
                </div>
                <p className="text-sm text-gray-700">
                  I'm having trouble accessing my booking confirmation. The email link doesn't seem to work.
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-blue-900">Mike Afolabi</span>
                  <span className="text-xs text-blue-600">Support Agent, 2025-01-15 10:30 AM</span>
                </div>
                <p className="text-sm text-blue-800">
                  Hi Sarah, I've checked your booking and resent the confirmation email. Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </div>

          {/* Add Comment */}
          <div className="mb-6">
            <textarea
              placeholder="Add a comment/update..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50">
                Escalate
              </button>
              <button className="px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
                Edit Ticket
              </button>
              <button className="px-4 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50">
                Mark Resolved
              </button>
            </div>
          </div>

          {/* SLA Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">SLA Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-medium text-green-600">Met (12 Hours)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Resolution Target:</span>
                <span className="font-medium text-gray-900">4 Hours</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time Remaining:</span>
                <span className="font-medium text-yellow-600">2.8 Hours</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">25% of SLA time used</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
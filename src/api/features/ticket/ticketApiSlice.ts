// src/api/features/ticket/ticketApiSlice.ts
import { apiSlice } from "@/api/apiSlice";

export interface Ticket {
  _id: string;
  ticketId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  notes?: Array<{
    message: string;
    addedBy: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketData {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const ticketApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTicket: builder.mutation<Ticket, CreateTicketData>({
      query: (data) => ({
        url: '/api/tickets',
        method: 'POST',
        body: { ...data, source: 'admin' },
      }),
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
    getTickets: builder.query<{
      success: boolean;
      data: {
        tickets: Ticket[];
        stats: {
          total: number;
          pending: number;
          inProgress: number;
          resolved: number;
          closed: number;
        };
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      };
    }, {
      status?: string;
      priority?: string;
      search?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/api/tickets',
        params,
      }),
      providesTags: (result) =>
        result?.data?.tickets
          ? [
              ...result.data.tickets.map(({ _id }) => ({ type: 'Ticket' as const, id: _id })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),
    getTicketById: builder.query<Ticket, string>({
      query: (id) => `/api/tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),
    updateTicketStatus: builder.mutation<Ticket, { id: string; status: string; assignedTo?: string }>({
      query: ({ id, ...patch }) => ({
        url: `/api/tickets/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ticket', id }],
    }),
    addTicketNote: builder.mutation<Ticket, { id: string; message: string; type?: string }>({
      query: ({ id, message, type }) => ({
        url: `/tickets/${id}/notes`,
        method: 'POST',
        body: { message, type },
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ticket', id }],
    }),
    deleteTicket: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/tickets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),
  }),
});

export const {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useAddTicketNoteMutation,
  useDeleteTicketMutation,
} = ticketApiSlice;
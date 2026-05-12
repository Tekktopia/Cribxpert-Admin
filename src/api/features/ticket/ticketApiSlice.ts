import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

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
  notes?: Array<{ message: string; addedBy: string; createdAt: string; type?: 'reply' | 'note' }>;
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

function mapTicket(r: Record<string, unknown>): Ticket {
  return {
    _id: r.id as string,
    ticketId: (r.ticket_id as string) ?? (r.id as string),
    firstName: r.first_name as string ?? '',
    lastName: r.last_name as string ?? '',
    email: r.email as string ?? '',
    phone: r.phone as string | undefined,
    subject: r.subject as string ?? '',
    message: r.message as string ?? '',
    status: r.status as Ticket['status'] ?? 'pending',
    priority: r.priority as Ticket['priority'] ?? 'medium',
    assignedTo: r.assigned_to as string | undefined,
    notes: (r.notes as Ticket['notes']) ?? [],
    createdAt: r.created_at as string,
    updatedAt: (r.updated_at as string) ?? (r.created_at as string),
  };
}

interface TicketsListResponse {
  success: boolean;
  data: {
    tickets: Ticket[];
    stats: { total: number; pending: number; inProgress: number; resolved: number; closed: number };
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export const ticketApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTicket: builder.mutation<Ticket, CreateTicketData>({
      queryFn: async (ticketData) => {
        const { data, error } = await (supabase
          .from('tickets')
          .insert({
            first_name: ticketData.firstName,
            last_name: ticketData.lastName ?? '',
            email: ticketData.email,
            phone: ticketData.phone ?? '',
            subject: ticketData.subject,
            message: ticketData.message,
            source: 'admin',
            status: 'pending',
            priority: 'medium',
          } as any)
          .select('*')
          .single() as any);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: mapTicket(data as Record<string, unknown>) };
      },
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),

    getTickets: builder.query<TicketsListResponse, { status?: string; priority?: string; search?: string; page?: number; limit?: number }>({
      queryFn: async (params) => {
        let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
        if (params.status) query = query.eq('status', params.status);
        if (params.priority) query = query.eq('priority', params.priority);
        if (params.search) query = query.or(`subject.ilike.%${params.search}%,email.ilike.%${params.search}%`);

        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const from = (page - 1) * limit;
        query = query.range(from, from + limit - 1);

        const { data, error, count } = await query;
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };

        const tickets = (data ?? []).map(r => mapTicket(r as Record<string, unknown>));
        const { data: allTickets } = await supabase.from('tickets').select('status') as { data: any[] | null };
        const all = allTickets ?? [];

        return {
          data: {
            success: true,
            data: {
              tickets,
              stats: {
                total: all.length,
                pending: all.filter((t: any) => t.status === 'pending').length,
                inProgress: all.filter((t: any) => t.status === 'in-progress').length,
                resolved: all.filter((t: any) => t.status === 'resolved').length,
                closed: all.filter((t: any) => t.status === 'closed').length,
              },
              pagination: { page, limit, total: count ?? tickets.length, totalPages: Math.ceil((count ?? tickets.length) / limit) },
            },
          },
        };
      },
      providesTags: (result) =>
        result?.data?.tickets
          ? [
              ...result.data.tickets.map(({ _id }) => ({ type: 'Ticket' as const, id: _id })),
              { type: 'Ticket', id: 'LIST' },
            ]
          : [{ type: 'Ticket', id: 'LIST' }],
    }),

    getTicketById: builder.query<Ticket, string>({
      queryFn: async (id) => {
        const { data, error } = await supabase.from('tickets').select('*').eq('id', id).single();
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: mapTicket(data as Record<string, unknown>) };
      },
      providesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),

    updateTicketStatus: builder.mutation<Ticket, { id: string; status: string; assignedTo?: string }>({
      queryFn: async ({ id, status, assignedTo }) => {
        const patch: Record<string, unknown> = { status };
        if (assignedTo !== undefined) patch.assigned_to = assignedTo;
        const { data, error } = await ((supabase.from('tickets') as any).update(patch).eq('id', id).select('*').single());
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: mapTicket(data as Record<string, unknown>) };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ticket', id }],
    }),

    addTicketNote: builder.mutation<Ticket, { id: string; message: string; type?: string }>({
      queryFn: async ({ id, message, type = 'reply' }) => {
        const { data: current, error: fetchErr } = await ((supabase.from('tickets') as any).select('notes').eq('id', id).single());
        if (fetchErr) return { error: { status: 'CUSTOM_ERROR', error: fetchErr.message } };
        const existingNotes = (current?.notes as unknown[]) ?? [];
        const newNote = { message, addedBy: 'admin', type, createdAt: new Date().toISOString() };
        const { data, error } = await ((supabase.from('tickets') as any)
          .update({ notes: [...existingNotes, newNote] })
          .eq('id', id)
          .select('*')
          .single());
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: mapTicket(data as Record<string, unknown>) };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ticket', id }],
    }),

    deleteTicket: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id) => {
        const { error } = await supabase.from('tickets').delete().eq('id', id);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { success: true } };
      },
      invalidatesTags: (_result, _error, id) => [{ type: 'Ticket', id }],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useAddTicketNoteMutation,
  useDeleteTicketMutation,
} = ticketApiSlice;

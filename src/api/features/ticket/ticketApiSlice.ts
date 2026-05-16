import { apiSlice } from "@/api/apiSlice";
import { supabase } from "@/lib/supabase";

export type TicketGroupKey = 'csr' | 'finance' | (string & {});

export interface Ticket {
  _id: string;
  ticketId: string;
  ticketNumber?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'pending' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source?: 'email' | 'admin' | 'live_chat' | string;
  assignedTo?: string;
  assignedGroup?: TicketGroupKey;
  lastActivityAt?: string;
  notes?: Array<{ message: string; addedBy: string; createdAt: string; type?: 'reply' | 'note' }>;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  direction: 'inbound' | 'outbound' | 'note';
  fromEmail: string | null;
  fromName: string | null;
  toEmail: string | null;
  subject: string | null;
  bodyText: string | null;
  bodyHtml: string | null;
  messageId: string | null;
  inReplyTo: string | null;
  sentBy: string | null;
  createdAt: string;
}

export interface TicketGroup {
  key: string;
  name: string;
  color: string | null;
}

export interface AssignableAgent {
  id: string;
  fullName: string;
  email: string;
  role: string;
  agentGroup: string | null;
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
    ticketNumber: r.ticket_number as number | undefined,
    firstName: r.first_name as string ?? '',
    lastName: r.last_name as string ?? '',
    email: r.email as string ?? '',
    phone: r.phone as string | undefined,
    subject: r.subject as string ?? '',
    message: r.message as string ?? '',
    status: r.status as Ticket['status'] ?? 'pending',
    priority: r.priority as Ticket['priority'] ?? 'medium',
    source: (r.source as string | undefined) ?? 'admin',
    assignedTo: r.assigned_to as string | undefined,
    assignedGroup: r.assigned_group as string | undefined,
    lastActivityAt: (r.last_activity_at as string | undefined) ?? (r.updated_at as string | undefined),
    notes: (r.notes as Ticket['notes']) ?? [],
    createdAt: r.created_at as string,
    updatedAt: (r.updated_at as string) ?? (r.created_at as string),
  };
}

function mapMessage(r: Record<string, unknown>): TicketMessage {
  return {
    id: r.id as string,
    ticketId: r.ticket_id as string,
    direction: r.direction as TicketMessage['direction'],
    fromEmail: (r.from_email as string | null) ?? null,
    fromName:  (r.from_name as string | null) ?? null,
    toEmail:   (r.to_email as string | null) ?? null,
    subject:   (r.subject as string | null) ?? null,
    bodyText:  (r.body_text as string | null) ?? null,
    bodyHtml:  (r.body_html as string | null) ?? null,
    messageId: (r.message_id as string | null) ?? null,
    inReplyTo: (r.in_reply_to as string | null) ?? null,
    sentBy:    (r.sent_by as string | null) ?? null,
    createdAt: r.created_at as string,
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

    getTickets: builder.query<TicketsListResponse, { status?: string; priority?: string; search?: string; page?: number; limit?: number; assignedGroup?: string; assignedTo?: string; unassigned?: boolean; source?: string }>({
      queryFn: async (params) => {
        // Sort by last_activity_at DESC so most recently active surfaces first
        let query = supabase.from('tickets').select('*').order('last_activity_at', { ascending: false, nullsFirst: false });
        if (params.status) query = query.eq('status', params.status);
        if (params.priority) query = query.eq('priority', params.priority);
        if (params.search) query = query.or(`subject.ilike.%${params.search}%,email.ilike.%${params.search}%,first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%`);
        if (params.assignedGroup) query = query.eq('assigned_group', params.assignedGroup);
        if (params.assignedTo) query = query.eq('assigned_to', params.assignedTo);
        if (params.unassigned) query = query.is('assigned_to', null);
        if (params.source) query = query.eq('source', params.source);

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
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),

    updateTicketPriority: builder.mutation<Ticket, { id: string; priority: 'low' | 'medium' | 'high' | 'urgent' }>({
      queryFn: async ({ id, priority }) => {
        const { data, error } = await ((supabase.from('tickets') as any)
          .update({ priority }).eq('id', id).select('*').single());
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: mapTicket(data as Record<string, unknown>) };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
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

    // ── Mail trail (ordered ascending = oldest first, Gmail style) ─────
    getTicketMessages: builder.query<TicketMessage[], string>({
      queryFn: async (ticketId) => {
        const { data, error } = await supabase
          .from('ticket_messages').select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: (data ?? []).map(r => mapMessage(r as Record<string, unknown>)) };
      },
      providesTags: (_result, _error, ticketId) => [{ type: 'Ticket' as const, id: `${ticketId}-messages` }],
    }),

    // ── Groups (CSR / Finance / future) ────────────────────────────────
    getTicketGroups: builder.query<TicketGroup[], void>({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('ticket_groups').select('*').order('name');
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: (data ?? []).map((r: any) => ({ key: r.key, name: r.name, color: r.color })) };
      },
      providesTags: [{ type: 'Ticket', id: 'GROUPS' }],
    }),

    createTicketGroup: builder.mutation<TicketGroup, { key: string; name: string; color?: string }>({
      queryFn: async ({ key, name, color }) => {
        const { data, error } = await ((supabase.from('ticket_groups') as any)
          .insert({ key: key.toLowerCase().trim(), name: name.trim(), color: color ?? null })
          .select('*').single());
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { key: data.key, name: data.name, color: data.color } };
      },
      invalidatesTags: [{ type: 'Ticket', id: 'GROUPS' }],
    }),

    updateTicketGroup: builder.mutation<TicketGroup, { key: string; name?: string; color?: string }>({
      queryFn: async ({ key, name, color }) => {
        const patch: Record<string, unknown> = {};
        if (name  !== undefined) patch.name  = name.trim();
        if (color !== undefined) patch.color = color;
        const { data, error } = await ((supabase.from('ticket_groups') as any)
          .update(patch).eq('key', key).select('*').single());
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { key: data.key, name: data.name, color: data.color } };
      },
      invalidatesTags: [{ type: 'Ticket', id: 'GROUPS' }, { type: 'Ticket', id: 'LIST' }],
    }),

    deleteTicketGroup: builder.mutation<{ ok: true }, string>({
      queryFn: async (key) => {
        // Refuse to delete a group that still has tickets attached
        const { count } = await supabase
          .from('tickets').select('*', { count: 'exact', head: true }).eq('assigned_group', key);
        if ((count ?? 0) > 0) {
          return { error: { status: 'CUSTOM_ERROR', error: `Cannot delete: ${count} ticket(s) still assigned to this group. Reassign them first.` } };
        }
        const { error } = await supabase.from('ticket_groups').delete().eq('key', key);
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: { ok: true } };
      },
      invalidatesTags: [{ type: 'Ticket', id: 'GROUPS' }],
    }),

    // ── Agents you can assign tickets to (filter by group if provided) ─
    getAssignableAgents: builder.query<AssignableAgent[], string | void>({
      queryFn: async (group) => {
        let query = supabase
          .from('profiles')
          .select('id, full_name, email, role, agent_group')
          .in('role', ['admin', 'superadmin', 'csr_admin', 'finance_admin']);
        if (group) query = query.or(`agent_group.eq.${group},role.eq.${group === 'finance' ? 'finance_admin' : 'csr_admin'}`);
        const { data, error } = await query;
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return {
          data: (data ?? []).map((p: any) => ({
            id: p.id,
            fullName: p.full_name ?? p.email ?? '',
            email: p.email ?? '',
            role: p.role ?? '',
            agentGroup: p.agent_group ?? null,
          })),
        };
      },
    }),

    // ── Assign group/agent to a ticket ─────────────────────────────────
    assignTicket: builder.mutation<Ticket, { id: string; assignedGroup?: string | null; assignedTo?: string | null }>({
      queryFn: async ({ id, assignedGroup, assignedTo }) => {
        const patch: Record<string, unknown> = {};
        if (assignedGroup !== undefined) patch.assigned_group = assignedGroup;
        if (assignedTo !== undefined) patch.assigned_to = assignedTo;
        if (Object.keys(patch).length === 0) {
          return { error: { status: 'CUSTOM_ERROR', error: 'Nothing to update' } };
        }
        const { data, error } = await ((supabase.from('tickets') as any)
          .update(patch).eq('id', id).select('*').single());
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        return { data: mapTicket(data as Record<string, unknown>) };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),

    // ── Send a real email reply via the ticket-reply edge function ─────
    sendTicketReply: builder.mutation<{ ok: true; messageId?: string }, { ticketId: string; body: string; isInternalNote?: boolean }>({
      queryFn: async ({ ticketId, body, isInternalNote = false }) => {
        const { data, error } = await supabase.functions.invoke('ticket-reply', {
          body: { ticketId, body, isInternalNote },
        });
        if (error) return { error: { status: 'CUSTOM_ERROR', error: error.message } };
        if ((data as any)?.error) return { error: { status: 'CUSTOM_ERROR', error: (data as any).error } };
        return { data: data as { ok: true; messageId?: string } };
      },
      invalidatesTags: (_result, _error, { ticketId }) => [
        { type: 'Ticket', id: ticketId },
        { type: 'Ticket', id: `${ticketId}-messages` },
        { type: 'Ticket', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useUpdateTicketStatusMutation,
  useUpdateTicketPriorityMutation,
  useAddTicketNoteMutation,
  useDeleteTicketMutation,
  useGetTicketMessagesQuery,
  useGetTicketGroupsQuery,
  useCreateTicketGroupMutation,
  useUpdateTicketGroupMutation,
  useDeleteTicketGroupMutation,
  useGetAssignableAgentsQuery,
  useAssignTicketMutation,
  useSendTicketReplyMutation,
} = ticketApiSlice;

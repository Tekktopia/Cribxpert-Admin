// pages/CSR/TicketDetails.tsx — Freshdesk-style ticket conversation view
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout';
import { Topbar } from '@/components/layout';
import { csrNavigationItems } from '@/components/layout/csrSidebar';
import { financeAdminNavigationItems } from '@/components/layout/FinanceSidebar';
import { useAppSelector } from '@/store/hooks';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Send,
  MessageSquare,
  StickyNote,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Hash,
  Users as UsersIcon,
  Tag,
} from 'lucide-react';
import {
  useGetTicketByIdQuery,
  useGetTicketMessagesQuery,
  useGetTicketGroupsQuery,
  useGetAssignableAgentsQuery,
  useAssignTicketMutation,
  useSendTicketReplyMutation,
  useUpdateTicketStatusMutation,
} from '@/api/features/ticket/ticketApiSlice';
import { supabase } from '@/lib/supabase';

type ComposerMode = 'reply' | 'note';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function statusPill(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    pending:        { bg: '#fffbeb', text: '#92400e', label: 'Open' },
    'in-progress':  { bg: '#E6EFF1', text: '#1d5c5c', label: 'In Progress' },
    resolved:       { bg: '#f0fdf4', text: '#15803d', label: 'Resolved' },
    closed:         { bg: '#f3f4f6', text: '#4b5563', label: 'Closed' },
  };
  return map[status] ?? { bg: '#f3f4f6', text: '#4b5563', label: status };
}

function priorityPill(priority: string) {
  const map: Record<string, { bg: string; text: string }> = {
    urgent: { bg: '#fef2f2', text: '#b91c1c' },
    high:   { bg: '#fef2f2', text: '#dc2626' },
    medium: { bg: '#fffbeb', text: '#a16207' },
    low:    { bg: '#f0fdf4', text: '#15803d' },
  };
  return map[priority] ?? { bg: '#f3f4f6', text: '#4b5563' };
}

function sourceLabel(source?: string) {
  switch (source) {
    case 'email':     return 'Email';
    case 'live_chat': return 'Live Chat';
    case 'admin':     return 'Admin';
    default:          return source ?? '—';
  }
}

export default function TicketDetails() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const profileRole = (useAppSelector(s => s.auth.profile?.role) ?? '').toLowerCase();
  const sidebarItems = (profileRole === 'finance_admin' || profileRole === 'finance_agent')
    ? financeAdminNavigationItems
    : csrNavigationItems;

  const { data: ticket, isLoading: ticketLoading, refetch: refetchTicket } = useGetTicketByIdQuery(ticketId ?? '', { skip: !ticketId });
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useGetTicketMessagesQuery(ticketId ?? '', { skip: !ticketId });
  const { data: groups = [] } = useGetTicketGroupsQuery();
  const { data: allAgents = [] } = useGetAssignableAgentsQuery(ticket?.assignedGroup ?? undefined);

  const [assignTicket, { isLoading: assigning }] = useAssignTicketMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();
  const [sendReply, { isLoading: sending }] = useSendTicketReplyMutation();

  const [composerMode, setComposerMode] = useState<ComposerMode>('reply');
  const [body, setBody] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Realtime: live-update messages + ticket as they change ───────────
  useEffect(() => {
    if (!ticketId) return;
    const ch = supabase
      .channel(`ticket-detail-${ticketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${ticketId}` }, () => refetchMessages())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` }, () => refetchTicket())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [ticketId, refetchMessages, refetchTicket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const ticketNumberLabel = useMemo(() => {
    if (!ticket?.ticketNumber) return ticket?.ticketId ?? '—';
    return `#${String(ticket.ticketNumber).padStart(6, '0')}`;
  }, [ticket]);

  const customerName = ticket ? `${ticket.firstName ?? ''} ${ticket.lastName ?? ''}`.trim() || ticket.email : '';

  // Submit reply or internal note
  const handleSend = async () => {
    const text = body.trim();
    if (!text || !ticketId) return;
    try {
      await sendReply({ ticketId, body: text, isInternalNote: composerMode === 'note' }).unwrap();
      setBody('');
      setToast({ type: 'success', text: composerMode === 'reply' ? 'Reply sent to customer' : 'Internal note saved' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', text: err?.data?.error ?? err?.message ?? 'Failed to send' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleGroupChange = async (group: string) => {
    if (!ticketId) return;
    // Changing group clears the agent (forces re-assignment within new group)
    await assignTicket({ id: ticketId, assignedGroup: group || null, assignedTo: null });
  };
  const handleAgentChange = async (agentId: string) => {
    if (!ticketId) return;
    await assignTicket({ id: ticketId, assignedTo: agentId || null });
  };
  const handleStatusChange = async (status: string) => {
    if (!ticketId) return;
    await updateStatus({ id: ticketId, status });
  };

  if (ticketLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navigationItems={sidebarItems} />
        <div className="flex-1">
          <Topbar />
          <div className="p-10 text-center text-gray-500">Loading ticket…</div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navigationItems={sidebarItems} />
        <div className="flex-1">
          <Topbar />
          <div className="p-10 text-center text-gray-500">Ticket not found.</div>
        </div>
      </div>
    );
  }

  const sPill = statusPill(ticket.status);
  const pPill = priorityPill(ticket.priority);
  const groupColor = groups.find(g => g.key === ticket.assignedGroup)?.color ?? '#9ca3af';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar navigationItems={sidebarItems} />
      <div className="flex-1 flex flex-col">
        <Topbar />

        {/* Header bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate('/csr/tickets')}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              aria-label="Back to tickets"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Hash className="w-3 h-3" />
                <span className="font-mono">{ticketNumberLabel}</span>
                <span className="text-gray-300">·</span>
                <span>{sourceLabel(ticket.source)}</span>
                <span className="text-gray-300">·</span>
                <span>{timeAgo(ticket.lastActivityAt ?? ticket.createdAt)}</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 truncate mt-0.5">{ticket.subject}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span style={{ background: sPill.bg, color: sPill.text }} className="px-2.5 py-1 text-xs font-semibold rounded-md">{sPill.label}</span>
            <span style={{ background: pPill.bg, color: pPill.text }} className="px-2.5 py-1 text-xs font-semibold rounded-md capitalize">{ticket.priority}</span>
          </div>
        </div>

        {/* Body: mail trail + right sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Mail trail */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
              {messagesLoading ? (
                <div className="text-center py-10 text-sm text-gray-500">Loading conversation…</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  No messages on this ticket yet. {ticket.source === 'admin' ? 'Send the first reply below.' : ''}
                </div>
              ) : (
                messages.map(m => (
                  <MessageCard key={m.id} message={m} customerName={customerName} customerEmail={ticket.email} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply composer */}
            <div className="border-t border-gray-200 bg-white">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setComposerMode('reply')}
                  className={`px-5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    composerMode === 'reply' ? 'border-teal-600 text-teal-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  Reply
                </button>
                <button
                  onClick={() => setComposerMode('note')}
                  className={`px-5 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                    composerMode === 'note' ? 'border-amber-500 text-amber-700' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <StickyNote className="w-4 h-4" />
                  Internal Note
                </button>
              </div>

              <div className={composerMode === 'note' ? 'bg-amber-50/40' : 'bg-white'}>
                {composerMode === 'reply' && (
                  <div className="px-5 pt-3 text-xs text-gray-500 flex items-center gap-1.5">
                    <span>To:</span>
                    <span className="font-medium text-gray-700">{customerName}</span>
                    <span className="text-gray-400">&lt;{ticket.email}&gt;</span>
                  </div>
                )}
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={composerMode === 'reply' ? 'Write your reply to the customer…' : 'Write an internal note (only visible to agents)…'}
                  rows={5}
                  className="w-full px-5 py-3 text-sm resize-none focus:outline-none bg-transparent"
                />
                <div className="px-5 py-3 flex justify-between items-center border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    {composerMode === 'reply'
                      ? 'Will be sent as an email + saved to the mail trail.'
                      : 'Visible only to agents. No email will be sent.'}
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!body.trim() || sending}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      composerMode === 'reply'
                        ? 'bg-teal-600 hover:bg-teal-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {composerMode === 'reply' ? <Send className="w-4 h-4" /> : <StickyNote className="w-4 h-4" />}
                    {sending ? 'Sending…' : composerMode === 'reply' ? 'Send Reply' : 'Save Note'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex-shrink-0">
            {/* Customer card */}
            <div className="p-5 border-b border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Customer</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {(customerName || '?').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{customerName}</div>
                  <div className="text-xs text-gray-500 truncate">{ticket.email}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-gray-400" /> {ticket.email}</div>
                {ticket.phone && (
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" /> {ticket.phone}</div>
                )}
                <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gray-400" /> Opened {formatDateTime(ticket.createdAt)}</div>
              </div>
            </div>

            {/* Properties */}
            <div className="p-5 border-b border-gray-200 space-y-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Properties</div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="pending">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3 h-3" />
                  Priority
                </label>
                <select
                  value={ticket.priority}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled
                  title="Use the Edit Ticket modal to change priority (coming soon here)"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <UsersIcon className="w-3 h-3" />
                  Group
                </label>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: groupColor }} />
                  <select
                    value={ticket.assignedGroup ?? ''}
                    onChange={(e) => handleGroupChange(e.target.value)}
                    disabled={assigning}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Unassigned</option>
                    {groups.map(g => (
                      <option key={g.key} value={g.key}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3" />
                  Agent
                </label>
                <select
                  value={ticket.assignedTo ?? ''}
                  onChange={(e) => handleAgentChange(e.target.value)}
                  disabled={assigning || !ticket.assignedGroup}
                  title={!ticket.assignedGroup ? 'Pick a group first' : undefined}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50"
                >
                  <option value="">{ticket.assignedGroup ? 'Unassigned' : 'Pick a group first'}</option>
                  {allAgents.map(a => (
                    <option key={a.id} value={a.id}>{a.fullName} {a.email ? `(${a.email})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Activity meta */}
            <div className="p-5 text-xs text-gray-500 space-y-1.5">
              <div className="font-semibold text-gray-500 uppercase tracking-wide text-xs mb-2">Activity</div>
              <div>Created: <span className="text-gray-700">{formatDateTime(ticket.createdAt)}</span></div>
              {ticket.lastActivityAt && (
                <div>Last activity: <span className="text-gray-700">{formatDateTime(ticket.lastActivityAt)}</span></div>
              )}
              <div>{messages.length} message{messages.length !== 1 ? 's' : ''} in this thread</div>
            </div>
          </aside>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Message card — renders one item in the mail trail
// ─────────────────────────────────────────────────────────────────────
function MessageCard({ message, customerName, customerEmail }: {
  message: import('@/api/features/ticket/ticketApiSlice').TicketMessage;
  customerName: string;
  customerEmail: string;
}) {
  const isInbound  = message.direction === 'inbound';
  const isOutbound = message.direction === 'outbound';
  const isNote     = message.direction === 'note';

  const displayName = isInbound
    ? (message.fromName ?? customerName ?? customerEmail)
    : (message.fromName ?? 'Support');

  const bg     = isNote ? 'bg-amber-50 border-amber-200' : isOutbound ? 'bg-white border-gray-200' : 'bg-white border-gray-200';
  const accent = isNote ? 'text-amber-700' : isOutbound ? 'text-teal-700' : 'text-gray-700';
  const Icon   = isNote ? StickyNote : isOutbound ? ArrowUpRight : ArrowDownLeft;

  return (
    <div className={`rounded-xl border ${bg} overflow-hidden`}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            isNote ? 'bg-amber-100' : isOutbound ? 'bg-teal-100' : 'bg-gray-200'
          }`}>
            <Icon className={`w-3.5 h-3.5 ${accent}`} />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {displayName}
              {isNote && <span className="ml-2 text-xs text-amber-700 font-medium">· Internal note</span>}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {message.fromEmail ?? (isNote ? 'Private to agents' : '')}
              {message.toEmail && (
                <span className="text-gray-400"> → {message.toEmail}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 flex-shrink-0">{formatDateTime(message.createdAt)}</div>
      </div>

      <div className="px-4 py-4 text-sm text-gray-800 leading-relaxed">
        {message.bodyText
          ? <pre className="whitespace-pre-wrap font-sans">{message.bodyText}</pre>
          : message.bodyHtml
            ? <div dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
            : <span className="text-gray-400 italic">(no content)</span>}
      </div>
    </div>
  );
}

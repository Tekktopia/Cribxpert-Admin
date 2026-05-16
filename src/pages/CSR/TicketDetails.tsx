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
  Clock,
  ChevronDown,
  ChevronRight,
  Zap,
  Lock,
} from 'lucide-react';
import {
  useGetTicketByIdQuery,
  useGetTicketMessagesQuery,
  useGetTicketGroupsQuery,
  useGetAssignableAgentsQuery,
  useAssignTicketMutation,
  useSendTicketReplyMutation,
  useUpdateTicketStatusMutation,
  useUpdateTicketPriorityMutation,
} from '@/api/features/ticket/ticketApiSlice';
import { useGetCannedResponsesQuery } from '@/api/features/cannedResponses/cannedResponsesApiSlice';
import { computeSla, slaBadgeClass } from '@/utils/sla';
import { canAssignTickets } from '@/utils/roles';
import { cleanEmailBody } from '@/utils/email';
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
  const profileId = useAppSelector(s => s.auth.profile?.id) ?? '';
  const profileRole = (useAppSelector(s => s.auth.profile?.role) ?? '').toLowerCase();
  const sidebarItems = (profileRole === 'finance_admin' || profileRole === 'finance_agent')
    ? financeAdminNavigationItems
    : csrNavigationItems;

  const { data: ticket, isLoading: ticketLoading, refetch: refetchTicket } = useGetTicketByIdQuery(ticketId ?? '', { skip: !ticketId });
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useGetTicketMessagesQuery(ticketId ?? '', { skip: !ticketId });
  const { data: groups = [] } = useGetTicketGroupsQuery();
  const { data: allAgents = [] } = useGetAssignableAgentsQuery(ticket?.assignedGroup ?? undefined);
  const { data: cannedAll = [] } = useGetCannedResponsesQuery();

  const [assignTicket, { isLoading: assigning }] = useAssignTicketMutation();
  const [updateStatus] = useUpdateTicketStatusMutation();
  const [updatePriority] = useUpdateTicketPriorityMutation();
  const [sendReply, { isLoading: sending }] = useSendTicketReplyMutation();

  const [composerMode, setComposerMode] = useState<ComposerMode>('reply');
  // Separate drafts so switching tabs never mixes a reply with a note
  const [replyBody, setReplyBody] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const body = composerMode === 'reply' ? replyBody : noteBody;
  const setBody = composerMode === 'reply' ? setReplyBody : setNoteBody;
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cannedOpen, setCannedOpen] = useState(false);
  const [signature, setSignature] = useState('');
  const [now, setNow] = useState(() => Date.now());
  const [expandedIds, setExpandedIds] = useState<Set<string> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cannedRef = useRef<HTMLDivElement>(null);

  const canAssign = canAssignTickets(profileRole);

  // Tick every 60s so the SLA countdown stays live
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);

  // Load this agent's email signature once
  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('email_signature')
        .eq('id', profileId)
        .single();
      if (cancelled) return;
      setSignature(((data as { email_signature?: string | null } | null)?.email_signature) ?? '');
    })();
    return () => { cancelled = true; };
  }, [profileId]);

  // Close canned-response menu on outside click
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (cannedRef.current && !cannedRef.current.contains(e.target as Node)) setCannedOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Canned replies available for this ticket's group (or global)
  const cannedForTicket = useMemo(
    () => cannedAll.filter(c => !c.groupKey || c.groupKey === ticket?.assignedGroup),
    [cannedAll, ticket?.assignedGroup],
  );

  // First outbound reply timestamp drives the response-SLA clock
  const firstResponseAt = useMemo(() => {
    const out = messages
      .filter(m => m.direction === 'outbound')
      .map(m => m.createdAt)
      .sort();
    return out[0] ?? null;
  }, [messages]);

  const sla = useMemo(() => {
    if (!ticket) return null;
    return computeSla(
      {
        createdAt: ticket.createdAt,
        status: ticket.status,
        firstResponseAt,
        resolvedAt:
          ticket.status === 'resolved' || ticket.status === 'closed'
            ? (ticket.lastActivityAt ?? ticket.updatedAt)
            : null,
      },
      now,
    );
  }, [ticket, firstResponseAt, now]);

  const insertCanned = (text: string) => {
    setComposerMode('reply');
    setReplyBody(prev => (prev.trim() ? `${prev.trimEnd()}\n\n${text}` : text));
    setCannedOpen(false);
  };

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

  // Accordion: by default only the most-recent message is expanded
  const lastMsgId = messages.length ? messages[messages.length - 1].id : null;
  const isMsgOpen = (id: string) =>
    expandedIds ? expandedIds.has(id) : id === lastMsgId;
  const toggleMsg = (id: string) => {
    setExpandedIds(prev => {
      const base = prev ?? new Set<string>(lastMsgId ? [lastMsgId] : []);
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Submit reply or internal note
  const handleSend = async () => {
    const text = body.trim();
    if (!text || !ticketId) return;
    // Append the agent's signature to customer-facing replies (not internal notes)
    const sig = signature.trim();
    const outgoing =
      composerMode === 'reply' && sig && !text.includes(sig)
        ? `${text}\n\n${sig}`
        : text;
    try {
      await sendReply({ ticketId, body: outgoing, isInternalNote: composerMode === 'note' }).unwrap();
      setBody('');
      setToast({ type: 'success', text: composerMode === 'reply' ? 'Reply sent to customer' : 'Internal note saved' });
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      console.error(err);
      setToast({ type: 'error', text: err?.data?.error ?? err?.message ?? 'Failed to send' });
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Surface mutation failures (e.g. RLS denials) instead of silently reverting
  const reportError = (err: any, fallback: string) => {
    const text =
      err?.data?.error ?? err?.error ?? err?.message ?? fallback;
    console.error(fallback, err);
    setToast({ type: 'error', text });
    setTimeout(() => setToast(null), 5000);
  };
  const reportOk = (text: string) => {
    setToast({ type: 'success', text });
    setTimeout(() => setToast(null), 2500);
  };

  const handleGroupChange = async (group: string) => {
    if (!ticketId) return;
    // Changing group clears the agent (forces re-assignment within new group)
    try {
      await assignTicket({ id: ticketId, assignedGroup: group || null, assignedTo: null }).unwrap();
      reportOk('Group updated');
    } catch (err) {
      reportError(err, 'Failed to update group');
    }
  };
  const handleAgentChange = async (agentId: string) => {
    if (!ticketId) return;
    try {
      await assignTicket({ id: ticketId, assignedTo: agentId || null }).unwrap();
      reportOk('Agent updated');
    } catch (err) {
      reportError(err, 'Failed to assign agent');
    }
  };
  const handleStatusChange = async (status: string) => {
    if (!ticketId) return;
    try {
      await updateStatus({ id: ticketId, status }).unwrap();
      reportOk('Status updated');
    } catch (err) {
      reportError(err, 'Failed to update status');
    }
  };
  const handlePriorityChange = async (priority: string) => {
    if (!ticketId) return;
    try {
      await updatePriority({ id: ticketId, priority: priority as 'low' | 'medium' | 'high' | 'urgent' }).unwrap();
      reportOk('Priority updated');
    } catch (err) {
      reportError(err, 'Failed to update priority');
    }
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
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar navigationItems={sidebarItems} />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <Topbar />

        {/* Header bar — fixed */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
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
            {sla && (
              <span
                title={`First response target 4h · ${sla.response.label}`}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md border inline-flex items-center gap-1 ${slaBadgeClass(sla.response.state)}`}
              >
                <Clock className="w-3 h-3" />
                {sla.response.state === 'breached'
                  ? `SLA ${sla.response.label}`
                  : sla.response.state === 'met'
                    ? 'SLA met'
                    : `SLA ${sla.response.label}`}
              </span>
            )}
            <span style={{ background: sPill.bg, color: sPill.text }} className="px-2.5 py-1 text-xs font-semibold rounded-md">{sPill.label}</span>
            <span style={{ background: pPill.bg, color: pPill.text }} className="px-2.5 py-1 text-xs font-semibold rounded-md capitalize">{ticket.priority}</span>
          </div>
        </div>

        {/* Body: mail trail + right sidebar */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Mail trail */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 min-h-0">
              {messagesLoading ? (
                <div className="text-center py-10 text-sm text-gray-500">Loading conversation…</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-sm text-gray-500">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                  No messages on this ticket yet. {ticket.source === 'admin' ? 'Send the first reply below.' : ''}
                </div>
              ) : (
                messages.map(m => (
                  <MessageCard
                    key={m.id}
                    message={m}
                    customerName={customerName}
                    customerEmail={ticket.email}
                    open={isMsgOpen(m.id)}
                    onToggle={() => toggleMsg(m.id)}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply composer — fixed at the bottom of the trail column */}
            <div className="border-t border-gray-200 bg-white flex-shrink-0">
              <div className="flex border-b border-gray-200 items-center">
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

                <div className="flex-1" />

                {/* Canned response picker */}
                <div className="relative pr-3" ref={cannedRef}>
                  <button
                    type="button"
                    onClick={() => setCannedOpen(o => !o)}
                    className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Canned reply
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {cannedOpen && (
                    <div className="absolute right-3 bottom-full mb-2 w-80 max-h-72 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                      {cannedForTicket.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-gray-500">
                          No canned replies for this group yet.
                          <br />
                          Add them in Settings.
                        </div>
                      ) : (
                        cannedForTicket.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => insertCanned(c.body)}
                            className="w-full text-left px-4 py-2.5 hover:bg-teal-50/60 border-b border-gray-100 last:border-0"
                          >
                            <div className="text-sm font-semibold text-gray-900 truncate">{c.title}</div>
                            <div className="text-xs text-gray-500 truncate mt-0.5">{c.body}</div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
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
                      ? `Sent as an email + saved to the mail trail.${signature.trim() ? ' Your signature is added automatically.' : ''}`
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
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Properties</div>
                {!canAssign && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400">
                    <Lock className="w-3 h-3" />
                    Agent view
                  </span>
                )}
              </div>
              {!canAssign && (
                <p className="text-[11px] text-gray-400 -mt-2">
                  Only supervisors can change priority, group or re-assign. You can update the status as you work the ticket.
                </p>
              )}

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
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={!canAssign}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
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
                    disabled={assigning || !canAssign}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
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
                  disabled={assigning || !canAssign || !ticket.assignedGroup}
                  title={!canAssign ? 'Only supervisors can re-assign' : !ticket.assignedGroup ? 'Pick a group first' : undefined}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
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
function MessageCard({ message, customerName, customerEmail, open, onToggle }: {
  message: import('@/api/features/ticket/ticketApiSlice').TicketMessage;
  customerName: string;
  customerEmail: string;
  open: boolean;
  onToggle: () => void;
}) {
  const isInbound  = message.direction === 'inbound';
  const isOutbound = message.direction === 'outbound';
  const isNote     = message.direction === 'note';

  const displayName = isInbound
    ? (message.fromName ?? customerName ?? customerEmail)
    : (message.fromName ?? 'Support');

  const bg     = isNote ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200';
  const accent = isNote ? 'text-amber-700' : isOutbound ? 'text-teal-700' : 'text-gray-700';
  const Icon   = isNote ? StickyNote : isOutbound ? ArrowUpRight : ArrowDownLeft;

  // Show only the actual message — strip quoted reply chains + template footer
  const cleaned = cleanEmailBody(message.bodyText);
  const preview = (cleaned || message.bodyText || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90);

  return (
    <div className={`rounded-xl border ${bg} overflow-hidden`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50/50 text-left hover:bg-gray-100/60 transition-colors"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-gray-400 flex-shrink-0">
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
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
              {open
                ? (message.fromEmail ?? (isNote ? 'Private to agents' : ''))
                : (preview || '(no content)')}
              {open && message.toEmail && (
                <span className="text-gray-400"> → {message.toEmail}</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 flex-shrink-0 ml-3">{formatDateTime(message.createdAt)}</div>
      </button>

      {open && (
        <div className="px-4 py-4 text-sm text-gray-800 leading-relaxed">
          {cleaned
            ? <pre className="whitespace-pre-wrap font-sans">{cleaned}</pre>
            : message.bodyHtml
              ? <div dangerouslySetInnerHTML={{ __html: message.bodyHtml }} />
              : <span className="text-gray-400 italic">(no content)</span>}
        </div>
      )}
    </div>
  );
}

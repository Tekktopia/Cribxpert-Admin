import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { csrNavigationItems } from '@/components/layout/csrSidebar';
import { financeAdminNavigationItems } from '@/components/layout/FinanceSidebar';
import { useAppSelector } from '@/store/hooks';
import { useGetAssignableAgentsQuery } from '@/api/features/ticket/ticketApiSlice';
import { canAssignLiveChats, isAgent } from '@/utils/roles';
import { supabase } from '@/lib/supabase';
import {
  MessageSquare,
  CheckCircle2,
  ArrowLeftCircle,
  User as UserIcon,
  Bot,
  Send,
  Inbox,
  CheckCheck,
  Star,
  Ticket as TicketIcon,
  Sparkles,
} from 'lucide-react';
import { CreateTicketModal, type CreateTicketInitialData } from '@/features/csr/tickets/CreateTicketModal';
import '@/style(nicholas)/style.scss';

// ── Types ──────────────────────────────────────────────────────────────────
interface ChatSession {
  session_id: string;
  user_id: string | null;
  mode: 'bot' | 'agent' | 'connecting';
  handed_off_at: string;
  resolved_at: string | null;
  email: string | null;
  name: string | null;
  assigned_agent_id: string | null;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'agent' | 'assistant';
  content: string;
  created_at: string;
}

interface SessionRating {
  session_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString();
}

function getInitials(name: string | null, email: string | null, sessionId?: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  if (sessionId) return `G${sessionId.slice(0, 1).toUpperCase()}`;
  return '??';
}

function getDisplayName(name: string | null, email: string | null, sessionId?: string): string {
  if (name) return name;
  if (email) return email.split('@')[0]; // "johndoe" from "johndoe@gmail.com"
  if (sessionId) return `Guest #${sessionId.slice(0, 6).toUpperCase()}`;
  return 'Guest';
}

function showAdminNotification(title: string, body: string) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body: body.slice(0, 120), icon: '/favicon.ico', tag: title });
  } catch { /* silently ignore */ }
}

// ── Component ──────────────────────────────────────────────────────────────
const LiveInbox = () => {
  const profileId = useAppSelector(s => s.auth.profile?.id) ?? '';
  const profileRole = (useAppSelector(s => s.auth.profile?.role) ?? '').toLowerCase();
  const viewerIsAgent = isAgent(profileRole);
  const canAssign = canAssignLiveChats(profileRole);
  const liveSidebar = (profileRole === 'finance_admin' || profileRole === 'finance_agent')
    ? financeAdminNavigationItems
    : csrNavigationItems;
  const { data: agents = [] } = useGetAssignableAgentsQuery();
  const agentName = useCallback(
    (id?: string | null) => (id ? (agents.find(a => a.id === id)?.fullName ?? null) : null),
    [agents],
  );

  const [tab, setTab]             = useState<'active' | 'resolved'>('active');
  const [activeSessions, setActiveSessions]     = useState<ChatSession[]>([]);
  const [resolvedSessions, setResolvedSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId]   = useState<string | null>(null);
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending]       = useState(false);
  const [resolving, setResolving]   = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [userIsTyping, setUserIsTyping] = useState(false);
  const [ratings, setRatings] = useState<Record<string, SessionRating>>({});
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const messagesEndRef              = useRef<HTMLDivElement>(null);
  const typingChannelRef            = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const agentTypingTimeoutRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userTypingTimeoutRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable ref so the global notification subscription always sees latest active sessions
  const activeSessionsRef = useRef<ChatSession[]>([]);
  useEffect(() => { activeSessionsRef.current = activeSessions; }, [activeSessions]);

  // Sessions shown in the current tab
  const sessions = tab === 'active' ? activeSessions : resolvedSessions;
  const activeSession = sessions.find(s => s.session_id === activeSessionId) ?? null;
  // In resolved tab the conversation is read-only
  const isReadOnly = tab === 'resolved';

  // ── Load sessions (both tabs) + ratings ───────────────────────────────
  const loadSessions = useCallback(async () => {
    const [activeRes, resolvedRes, ratingsRes] = await Promise.all([
      supabase
        .from('conversation_sessions')
        .select('*')
        .eq('mode', 'agent')
        .order('handed_off_at', { ascending: false }),
      supabase
        .from('conversation_sessions')
        .select('*')
        .not('resolved_at', 'is', null)
        .order('resolved_at', { ascending: false })
        .limit(50),
      supabase
        .from('session_ratings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);

    // Agents only see chats assigned to them; supervisors/admins see all.
    const scope = (rows: ChatSession[]) =>
      viewerIsAgent && profileId
        ? rows.filter(r => r.assigned_agent_id === profileId)
        : rows;

    if (activeRes.data)   setActiveSessions(scope(activeRes.data as ChatSession[]));
    if (resolvedRes.data) setResolvedSessions(scope(resolvedRes.data as ChatSession[]));
    if (ratingsRes.data) {
      const map: Record<string, SessionRating> = {};
      (ratingsRes.data as SessionRating[]).forEach(r => { map[r.session_id] = r; });
      setRatings(map);
    }
    setSessionsLoading(false);
  }, [viewerIsAgent, profileId]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // ── Request push-notification permission + global user-message listener ─
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Subscribe to ALL session_messages inserts so we can notify even when
    // the CSR is on a different tab or has a different session selected.
    const ch = supabase
      .channel('admin-global-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'session_messages' },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.role !== 'user') return; // only notify for user messages
          if (document.visibilityState === 'visible') return; // tab is already focused
          if (Notification.permission !== 'granted') return;

          const sess = activeSessionsRef.current.find(s => s.session_id === msg.session_id);
          if (!sess) return; // not one of our active sessions

          const name = getDisplayName(sess.name, sess.email, sess.session_id);
          showAdminNotification(`New message — ${name}`, msg.content);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear selected session when switching tabs
  useEffect(() => { setActiveSessionId(null); }, [tab]);

  // ── Realtime: session list + ratings updates ──────────────────────────
  useEffect(() => {
    const sessionsCh = supabase
      .channel('admin-live-sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_sessions' },
        () => loadSessions(),
      )
      .subscribe();

    const ratingsCh = supabase
      .channel('admin-session-ratings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'session_ratings' },
        (payload) => {
          const r = payload.new as SessionRating;
          setRatings(prev => ({ ...prev, [r.session_id]: r }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsCh);
      supabase.removeChannel(ratingsCh);
    };
  }, [loadSessions]);

  // ── Average rating summary (shown in header on resolved tab) ──────────
  const ratingSummary = useMemo(() => {
    const list = Object.values(ratings);
    if (list.length === 0) return null;
    const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
    return { count: list.length, avg };
  }, [ratings]);

  // ── Build prefilled ticket data from the active live-chat session ────
  const ticketPrefill = useMemo<CreateTicketInitialData | undefined>(() => {
    if (!activeSession) return undefined;

    const nameParts = (activeSession.name ?? '').trim().split(/\s+/);
    const firstName = nameParts[0] || (activeSession.email?.split('@')[0] ?? 'Guest');
    const lastName  = nameParts.slice(1).join(' ');

    // Take the user's first message (if any) for the subject; fall back to a default
    const firstUserMsg = messages.find(m => m.role === 'user')?.content?.trim();
    const subject = firstUserMsg
      ? `Live chat: ${firstUserMsg.slice(0, 60)}${firstUserMsg.length > 60 ? '…' : ''}`
      : `Live chat with ${getDisplayName(activeSession.name, activeSession.email, activeSession.session_id)}`;

    // Build a clean transcript for the ticket message body
    const transcript = messages
      .filter(m => m.role === 'user' || m.role === 'agent')
      .map(m => {
        const who = m.role === 'agent' ? 'CSR' : 'Customer';
        const when = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `[${when}] ${who}: ${m.content}`;
      })
      .join('\n');

    const handedOff = new Date(activeSession.handed_off_at).toLocaleString();
    const header = `--- Live chat transcript (handed off ${handedOff}) ---\n`;
    const message = transcript ? `${header}${transcript}\n--- end of transcript ---` : '';

    return { firstName, lastName, email: activeSession.email ?? '', subject, message };
  }, [activeSession, messages]);

  // ── Load messages for active session ──────────────────────────────────
  const loadMessages = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('session_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data as ChatMessage[]);
  }, []);

  useEffect(() => {
    if (!activeSessionId) { setMessages([]); return; }
    loadMessages(activeSessionId);
  }, [activeSessionId, loadMessages]);

  // ── Realtime: new messages for active session ─────────────────────────
  useEffect(() => {
    if (!activeSessionId) return;

    const ch = supabase
      .channel(`admin-messages-${activeSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${activeSessionId}`,
        },
        (payload) => {
          setMessages(prev => {
            const msg = payload.new as ChatMessage;
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [activeSessionId]);

  // ── Typing indicator channel ──────────────────────────────────────────
  useEffect(() => {
    if (!activeSessionId) {
      setUserIsTyping(false);
      typingChannelRef.current = null;
      return;
    }

    const ch = supabase
      .channel(`typing-${activeSessionId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }: { payload: { role: string; typing: boolean } }) => {
        if (payload?.role !== 'user') return;
        if (payload.typing) {
          setUserIsTyping(true);
          // Auto-clear after 3 s in case the "stop typing" broadcast is missed
          clearTimeout(userTypingTimeoutRef.current ?? undefined);
          userTypingTimeoutRef.current = setTimeout(() => setUserIsTyping(false), 3000);
        } else {
          clearTimeout(userTypingTimeoutRef.current ?? undefined);
          setUserIsTyping(false);
        }
      })
      .subscribe();

    typingChannelRef.current = ch;

    return () => {
      supabase.removeChannel(ch);
      typingChannelRef.current = null;
      setUserIsTyping(false);
      clearTimeout(userTypingTimeoutRef.current ?? undefined);
      clearTimeout(agentTypingTimeoutRef.current ?? undefined);
    };
  }, [activeSessionId]);

  // ── Scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userIsTyping]);

  // ── Broadcast CSR typing ──────────────────────────────────────────────
  const broadcastTyping = useCallback((typing: boolean) => {
    typingChannelRef.current?.send({
      type: 'broadcast',
      event: 'typing',
      payload: { role: 'agent', typing },
    });
  }, []);

  // ── Leave chat without resolving (session stays active) ───────────────
  const leaveChat = useCallback(() => {
    broadcastTyping(false);
    setActiveSessionId(null);
  }, [broadcastTyping]);

  // ── Send reply ────────────────────────────────────────────────────────
  const sendReply = useCallback(async () => {
    if (!replyText.trim() || !activeSessionId || sending) return;
    setSending(true);
    const text = replyText.trim();
    setReplyText('');
    // Stop typing broadcast immediately
    clearTimeout(agentTypingTimeoutRef.current ?? undefined);
    broadcastTyping(false);

    // Insert and retrieve the saved row so we can show it immediately
    // without waiting for the Realtime echo
    const { data: inserted } = await (supabase as any)
      .from('session_messages')
      .insert({ session_id: activeSessionId, role: 'agent', content: text })
      .select()
      .single();

    if (inserted) {
      setMessages(prev =>
        prev.some(m => m.id === (inserted as ChatMessage).id)
          ? prev
          : [...prev, inserted as ChatMessage],
      );
    }

    // ── Push notification to the user via platform notifications table ──
    // The push_on_notification_insert DB trigger fires automatically on insert.
    if (activeSession?.user_id) {
      await (supabase as any).from('notifications').insert({
        user_id: activeSession.user_id,
        title: 'New message from CribXpert Support',
        description: text.slice(0, 200),
        category: 'live_chat',
        status: 'unread',
        is_read: false,
      });
    }

    setSending(false);
  }, [replyText, activeSessionId, sending, activeSession, broadcastTyping]);

  // ── Resolve session ────────────────────────────────────────────────────
  const resolveSession = useCallback(async () => {
    if (!activeSessionId || resolving) return;
    setResolving(true);

    // Capture session before state clears
    const session = activeSessions.find(s => s.session_id === activeSessionId) ?? null;

    await (supabase as any)
      .from('conversation_sessions')
      .update({ mode: 'bot', resolved_at: new Date().toISOString() })
      .eq('session_id', activeSessionId);

    // Send a closing message to the user
    await (supabase as any).from('session_messages').insert({
      session_id: activeSessionId,
      role: 'agent',
      content: 'This support session has been resolved. You have been returned to CribBot. Feel free to reach out again if you need help.',
    });

    // ── Push notification to the user that the session was resolved ──
    if (session?.user_id) {
      await (supabase as any).from('notifications').insert({
        user_id: session.user_id,
        title: 'Support session resolved',
        description: 'Your CribXpert support chat has been closed. CribBot is ready to help anytime.',
        category: 'live_chat',
        status: 'unread',
        is_read: false,
      });
    }

    setActiveSessionId(null);
    setResolving(false);
  }, [activeSessionId, resolving, activeSessions]);

  // ── Supervisor assigns a live chat to an agent + sends a greeting ─────
  const [assigningChat, setAssigningChat] = useState(false);
  const assignChatToAgent = useCallback(async (sessionId: string, agentId: string) => {
    if (!agentId || assigningChat) return;
    setAssigningChat(true);
    const name = agents.find(a => a.id === agentId)?.fullName?.trim() || 'your support agent';

    await (supabase as any)
      .from('conversation_sessions')
      .update({ assigned_agent_id: agentId, mode: 'agent' })
      .eq('session_id', sessionId);

    // Auto-introduce the assigned agent to the customer
    const greeting = `Hello, Nice to meet you. My name is ${name}, how may I be of help to you?`;
    await (supabase as any).from('session_messages').insert({
      session_id: sessionId,
      role: 'agent',
      content: greeting,
    });

    // Notify the user (push trigger fires on insert)
    const sess = activeSessions.find(s => s.session_id === sessionId);
    if (sess?.user_id) {
      await (supabase as any).from('notifications').insert({
        user_id: sess.user_id,
        title: 'A support agent has joined your chat',
        description: greeting.slice(0, 200),
        category: 'live_chat',
        status: 'unread',
        is_read: false,
      });
    }

    setAssigningChat(false);
    loadSessions();
  }, [agents, activeSessions, assigningChat, loadSessions]);

  // ── Unread badge: count sessions that received a new user message ─────
  // (Simple approach — sessions list always shows live count)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar navigationItems={liveSidebar} />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Topbar />

        {/* Page header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-1 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              Live Support
            </div>
            <h1 className="text-xl font-bold text-gray-900">Live Chat Inbox</h1>
            <p className="text-xs text-gray-500 mt-0.5">Real-time conversations handed off from CribBot</p>
          </div>
          <div className="flex items-center gap-2">
            {ratingSummary && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {ratingSummary.avg.toFixed(1)}
                <span className="text-amber-600 font-normal">· {ratingSummary.count}</span>
              </span>
            )}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              activeSessions.length > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${activeSessions.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
              {activeSessions.length} Live {activeSessions.length === 1 ? 'Chat' : 'Chats'}
            </span>
          </div>
        </div>

        {/* Inbox container */}
        <div className="flex-1 flex min-h-0 m-6 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {/* LEFT: Session list */}
          <div className="w-80 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0 p-2 gap-1 bg-gray-50/60">
              {(['active', 'resolved'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 px-3 py-2 text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
                    tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t === 'active' ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  ) : (
                    <CheckCheck className="w-3.5 h-3.5" />
                  )}
                  {t === 'active' ? 'Active' : 'Resolved'}
                  <span className={`px-1.5 py-0.5 text-[10px] rounded-full ${
                    tab === t ? 'bg-teal-100 text-teal-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {t === 'active' ? activeSessions.length : resolvedSessions.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto">
              {sessionsLoading ? (
                <div className="p-6 text-center text-sm text-gray-500">Loading sessions…</div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-3">
                    {tab === 'active' ? <Inbox className="w-6 h-6 text-teal-600" /> : <CheckCheck className="w-6 h-6 text-teal-600" />}
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    {tab === 'active' ? 'No active chats' : 'No resolved chats yet'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {tab === 'active' ? 'Sessions appear when users request a live agent' : 'Resolved sessions will show up here'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sessions.map(session => {
                    const isActive = session.session_id === activeSessionId;
                    const initials = getInitials(session.name, session.email, session.session_id);
                    const displayName = getDisplayName(session.name, session.email, session.session_id);
                    const rating = ratings[session.session_id];
                    return (
                      <button
                        key={session.session_id}
                        onClick={() => setActiveSessionId(session.session_id)}
                        className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors border-l-[3px] ${
                          isActive ? 'bg-teal-50/60 border-teal-600' : 'border-transparent hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isActive ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1.5">
                            <span>{formatTime(tab === 'resolved' && session.resolved_at ? session.resolved_at : session.handed_off_at)}</span>
                            {session.assigned_agent_id ? (
                              <span className="inline-flex items-center gap-1 text-teal-700 font-medium truncate">
                                <span className="text-gray-300">·</span>
                                <UserIcon className="w-2.5 h-2.5" />
                                {agentName(session.assigned_agent_id) ?? 'Assigned'}
                              </span>
                            ) : tab === 'active' ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                                <span className="text-gray-300">·</span>
                                Unassigned
                              </span>
                            ) : null}
                            {tab === 'resolved' && rating && (
                              <span className="inline-flex items-center gap-0.5">
                                <span className="text-gray-300">·</span>
                                {[1,2,3,4,5].map(n => (
                                  <Star key={n} size={9} fill={n <= rating.rating ? '#f59e0b' : 'transparent'} color={n <= rating.rating ? '#f59e0b' : '#d1d5db'} strokeWidth={2} />
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                        {tab === 'active' ? (
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" style={{ boxShadow: '0 0 0 3px rgba(239,68,68,0.15)' }} />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Conversation panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {!activeSession ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-20 h-20 rounded-full bg-teal-50 flex items-center justify-center mb-4">
                  <MessageSquare className="w-9 h-9 text-teal-600" strokeWidth={1.75} />
                </div>
                <div className="text-base font-semibold text-gray-900">Select a conversation</div>
                <div className="text-sm text-gray-500 mt-1">Choose a session from the left to start chatting</div>
              </div>
            ) : (
              <>
                {/* Conversation header */}
                <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between flex-shrink-0 bg-white gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {getInitials(activeSession.name, activeSession.email, activeSession.session_id)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-gray-900 truncate">{getDisplayName(activeSession.name, activeSession.email, activeSession.session_id)}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isReadOnly ? 'bg-gray-400' : 'bg-red-500 animate-pulse'}`} />
                        {isReadOnly ? 'Resolved' : 'Live'} · handed off {formatTime(activeSession.handed_off_at)}
                        {agentName(activeSession.assigned_agent_id) && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="inline-flex items-center gap-1 text-teal-700 font-medium">
                              <UserIcon className="w-3 h-3" />
                              {agentName(activeSession.assigned_agent_id)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {canAssign && (
                        <select
                          value={activeSession.assigned_agent_id ?? ''}
                          onChange={(e) => assignChatToAgent(activeSession.session_id, e.target.value)}
                          disabled={assigningChat}
                          title="Assign this chat to an agent"
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                        >
                          <option value="">Assign agent…</option>
                          {agents.map(a => (
                            <option key={a.id} value={a.id}>{a.fullName}{a.email ? ` (${a.email})` : ''}</option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => setTicketModalOpen(true)}
                        title="Create a support ticket from this conversation"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 border border-teal-300 bg-white rounded-lg hover:bg-teal-50 transition-colors"
                      >
                        <TicketIcon className="w-3.5 h-3.5" />
                        Create Ticket
                      </button>
                      <button
                        onClick={leaveChat}
                        title="Leave this chat — the session stays active for other agents"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ArrowLeftCircle className="w-3.5 h-3.5" />
                        Leave
                      </button>
                      <button
                        onClick={resolveSession}
                        disabled={resolving}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 border border-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {resolving ? 'Resolving…' : 'Resolve & Close'}
                      </button>
                    </div>
                  )}
                  {isReadOnly && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ratings[activeSession.session_id] && (
                        <div className="inline-flex items-center gap-0.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-md">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={12} fill={n <= ratings[activeSession.session_id].rating ? '#f59e0b' : 'transparent'} color={n <= ratings[activeSession.session_id].rating ? '#f59e0b' : '#fcd34d'} strokeWidth={2} />
                          ))}
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Resolved {activeSession.resolved_at ? formatTime(activeSession.resolved_at) : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating comment banner */}
                {isReadOnly && ratings[activeSession.session_id]?.comment && (
                  <div className="px-5 py-3 border-b border-amber-200 bg-amber-50 text-xs text-amber-900 flex gap-2.5 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Customer feedback:</span>{' '}
                      <span className="italic">"{ratings[activeSession.session_id].comment}"</span>
                    </div>
                  </div>
                )}

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2.5 bg-gray-50/40">
                  {messages.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-10">No messages yet — waiting for the user to speak…</div>
                  ) : (
                    messages.map(msg => {
                      const isAgent = msg.role === 'agent';
                      return (
                        <div key={msg.id} className={`flex items-end gap-2 ${isAgent ? 'justify-end' : 'justify-start'}`}>
                          {!isAgent && (
                            <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              {msg.role === 'user'
                                ? <UserIcon size={14} color="#6b7280" strokeWidth={2.25} />
                                : <Bot size={14} color="#C18B3F" strokeWidth={2.25} />}
                            </div>
                          )}
                          <div
                            className="max-w-[72%] px-3.5 py-2.5 text-sm leading-relaxed break-words"
                            style={{
                              background: isAgent ? '#1d5c5c' : '#C18B3F',
                              color: '#ffffff',
                              borderRadius: 14,
                              borderBottomRightRadius: isAgent ? 4 : 14,
                              borderBottomLeftRadius: isAgent ? 14 : 4,
                              boxShadow: isAgent ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                          >
                            {msg.content}
                            <div className={`text-[10px] mt-1 opacity-60 ${isAgent ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.created_at)}
                            </div>
                          </div>
                          {isAgent && (
                            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">CS</div>
                          )}
                        </div>
                      );
                    })
                  )}

                  {userIsTyping && (
                    <div className="flex items-end gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <UserIcon size={14} color="#6b7280" strokeWidth={2.25} />
                      </div>
                      <div className="px-4 py-2.5 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: 'liDot 1.2s ease-in-out infinite' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: 'liDot 1.2s ease-in-out 0.2s infinite' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" style={{ animation: 'liDot 1.2s ease-in-out 0.4s infinite' }} />
                        <style>{`@keyframes liDot { 0%,80%,100% { transform:scale(0.7); opacity:0.4 } 40% { transform:scale(1); opacity:1 } }`}</style>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Composer */}
                {isReadOnly ? (
                  <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 text-center text-xs text-gray-500 flex-shrink-0">
                    This conversation is resolved — read only
                  </div>
                ) : (
                  <div className="px-4 py-3 border-t border-gray-200 bg-white flex items-center gap-2.5 flex-shrink-0">
                    <input
                      type="text"
                      placeholder="Type a reply…"
                      value={replyText}
                      onChange={e => {
                        setReplyText(e.target.value);
                        broadcastTyping(true);
                        clearTimeout(agentTypingTimeoutRef.current ?? undefined);
                        agentTypingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 2000);
                      }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendReply(); }}
                      disabled={sending}
                      maxLength={2000}
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full text-sm text-gray-900 bg-gray-50 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all"
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                      aria-label="Send"
                    >
                      <Send size={16} strokeWidth={2.25} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Create-ticket modal — prefilled with live-chat transcript */}
      <CreateTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        initialData={ticketPrefill}
        contextLabel={
          activeSession
            ? `Created from live chat with ${getDisplayName(activeSession.name, activeSession.email, activeSession.session_id)}`
            : undefined
        }
      />
    </div>
  );
};

export default LiveInbox;

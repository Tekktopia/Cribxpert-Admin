import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { csrNavigationItems } from '@/components/layout/csrSidebar';
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
  Headphones,
} from 'lucide-react';
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

    if (activeRes.data)   setActiveSessions(activeRes.data as ChatSession[]);
    if (resolvedRes.data) setResolvedSessions(resolvedRes.data as ChatSession[]);
    if (ratingsRes.data) {
      const map: Record<string, SessionRating> = {};
      (ratingsRes.data as SessionRating[]).forEach(r => { map[r.session_id] = r; });
      setRatings(map);
    }
    setSessionsLoading(false);
  }, []);

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

  // ── Unread badge: count sessions that received a new user message ─────
  // (Simple approach — sessions list always shows live count)

  return (
    <div className="supportDash" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar navigationItems={csrNavigationItems} />

      {/* Main column — fills all remaining width */}
      <div className="main" style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, height: '100vh', overflow: 'hidden' }}>
        <Topbar />

        {/* Page header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px 12px',
            flexShrink: 0,
          }}
        >
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Headphones size={20} color='#1d5c5c' strokeWidth={2.25} />
              Live Chat Inbox
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>
              Real-time support conversations handed off from CribBot
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {ratingSummary && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#fffbeb',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                }}
                title={`${ratingSummary.count} customer ${ratingSummary.count === 1 ? 'rating' : 'ratings'}`}
              >
                <Star size={13} fill='#f59e0b' color='#f59e0b' />
                {ratingSummary.avg.toFixed(1)}
                <span style={{ color: '#a16207', fontWeight: 500 }}>· {ratingSummary.count}</span>
              </span>
            )}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: activeSessions.length > 0 ? '#fef2f2' : '#f0fdf4',
                color: activeSessions.length > 0 ? '#dc2626' : '#15803d',
                border: `1px solid ${activeSessions.length > 0 ? '#fecaca' : '#bbf7d0'}`,
              }}
            >
              <span
                style={{
                  width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                  background: activeSessions.length > 0 ? '#ef4444' : '#4ade80',
                }}
              />
              {activeSessions.length} Live {activeSessions.length === 1 ? 'Chat' : 'Chats'}
            </span>
          </div>
        </div>

        {/* Main inbox layout — fills rest of page height */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            margin: '0 24px 24px',
            background: '#ffffff',
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
            {/* Session list panel */}
            <div
              style={{
                width: 300,
                minWidth: 260,
                borderRight: '1px solid #e5e7eb',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* ── Tab bar ── */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                {(['active', 'resolved'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      flex: 1,
                      padding: '11px 0',
                      fontSize: 12.5,
                      fontWeight: 600,
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: tab === t ? '#1d5c5c' : '#6b7280',
                      borderBottom: tab === t ? '2.5px solid #1d5c5c' : '2.5px solid transparent',
                      transition: 'color 0.15s, border-color 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    {t === 'active' ? (
                      <>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: tab === t ? '#10b981' : '#9ca3af', display: 'inline-block' }} />
                        Active
                      </>
                    ) : (
                      <>
                        <CheckCheck size={14} />
                        Resolved
                      </>
                    )}
                    <span
                      style={{
                        background: t === 'active'
                          ? (activeSessions.length > 0 ? '#fef2f2' : '#f3f4f6')
                          : '#f3f4f6',
                        color: t === 'active'
                          ? (activeSessions.length > 0 ? '#dc2626' : '#6b7280')
                          : '#6b7280',
                        borderRadius: 10,
                        padding: '0 6px',
                        fontSize: 10.5,
                        fontWeight: 700,
                        minWidth: 18,
                        textAlign: 'center',
                      }}
                    >
                      {t === 'active' ? activeSessions.length : resolvedSessions.length}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {sessionsLoading ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    Loading sessions…
                  </div>
                ) : sessions.length === 0 ? (
                  <div style={{ padding: 36, textAlign: 'center' }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: '#E6EFF1', display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                    }}>
                      {tab === 'active'
                        ? <Inbox size={26} color='#1d5c5c' strokeWidth={2} />
                        : <CheckCheck size={26} color='#1d5c5c' strokeWidth={2} />}
                    </div>
                    <div style={{ color: '#374151', fontSize: 13.5, fontWeight: 600 }}>
                      {tab === 'active' ? 'No active chats' : 'No resolved chats yet'}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                      {tab === 'active'
                        ? 'Sessions appear when users request a live agent'
                        : 'Resolved sessions will show up here'}
                    </div>
                  </div>
                ) : (
                  sessions.map(session => {
                    const isActive = session.session_id === activeSessionId;
                    const initials = getInitials(session.name, session.email, session.session_id);
                    const displayName = getDisplayName(session.name, session.email, session.session_id);
                    return (
                      <button
                        key={session.session_id}
                        onClick={() => setActiveSessionId(session.session_id)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          border: 'none',
                          borderBottom: '1px solid #f5f5f5',
                          background: isActive ? '#E6EFF1' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          borderLeft: isActive ? '3px solid #1d5c5c' : '3px solid transparent',
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: isActive ? '#1d5c5c' : '#e5e7eb',
                            color: isActive ? '#fff' : '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {displayName}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span>{formatTime(tab === 'resolved' && session.resolved_at ? session.resolved_at : session.handed_off_at)}</span>
                            {tab === 'resolved' && ratings[session.session_id] && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                                <span style={{ color: '#d1d5db' }}>·</span>
                                {[1, 2, 3, 4, 5].map(n => (
                                  <Star
                                    key={n}
                                    size={10}
                                    fill={n <= ratings[session.session_id].rating ? '#f59e0b' : 'transparent'}
                                    color={n <= ratings[session.session_id].rating ? '#f59e0b' : '#d1d5db'}
                                    strokeWidth={2}
                                  />
                                ))}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Status dot — live red if active, check if resolved */}
                        {tab === 'active' ? (
                          <span
                            style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: '#ef4444', flexShrink: 0,
                              boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)',
                            }}
                          />
                        ) : (
                          <CheckCircle2 size={16} color='#10b981' style={{ flexShrink: 0 }} />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Conversation panel */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {!activeSession ? (
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9ca3af',
                    background: '#fafafa',
                  }}
                >
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: '#E6EFF1', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                  }}>
                    <MessageSquare size={32} color='#1d5c5c' strokeWidth={1.75} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#374151' }}>Select a conversation</div>
                  <div style={{ fontSize: 13, marginTop: 4, color: '#9ca3af' }}>
                    Choose a session from the left to start chatting
                  </div>
                </div>
              ) : (
                <>
                  {/* Conversation header */}
                  <div
                    style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid #e5e7eb',
                      background: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: '#1d5c5c',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(activeSession.name, activeSession.email, activeSession.session_id)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                          {getDisplayName(activeSession.name, activeSession.email, activeSession.session_id)}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                          Live — handed off {formatTime(activeSession.handed_off_at)}
                        </div>
                      </div>
                    </div>

                    {!isReadOnly && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {/* Leave without resolving — session stays open for other agents */}
                        <button
                          onClick={leaveChat}
                          title="Leave this chat — the session stays active for other agents"
                          style={{
                            background: '#ffffff',
                            border: '1.5px solid #e5e7eb',
                            color: '#374151',
                            fontWeight: 600,
                            fontSize: 12.5,
                            padding: '7px 14px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          <ArrowLeftCircle size={14} />
                          Leave
                        </button>
                        <button
                          onClick={resolveSession}
                          disabled={resolving}
                          style={{
                            background: resolving ? '#f3f4f6' : '#10b981',
                            border: '1.5px solid',
                            borderColor: resolving ? '#d1d5db' : '#10b981',
                            color: resolving ? '#9ca3af' : '#ffffff',
                            fontWeight: 600,
                            fontSize: 12.5,
                            padding: '7px 14px',
                            borderRadius: 8,
                            cursor: resolving ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s',
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                          }}
                        >
                          <CheckCircle2 size={14} />
                          {resolving ? 'Resolving…' : 'Resolve & Close'}
                        </button>
                      </div>
                    )}
                    {isReadOnly && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {ratings[activeSession.session_id] && (
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            background: '#fffbeb', border: '1px solid #fde68a',
                            padding: '5px 10px', borderRadius: 8,
                          }}>
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star
                                key={n}
                                size={13}
                                fill={n <= ratings[activeSession.session_id].rating ? '#f59e0b' : 'transparent'}
                                color={n <= ratings[activeSession.session_id].rating ? '#f59e0b' : '#fcd34d'}
                                strokeWidth={2}
                              />
                            ))}
                          </div>
                        )}
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            color: '#15803d',
                            fontWeight: 600,
                            fontSize: 11.5,
                            padding: '5px 12px',
                            borderRadius: 8,
                          }}
                        >
                          <CheckCircle2 size={12} />
                          Resolved {activeSession?.resolved_at ? formatTime(activeSession.resolved_at) : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating comment banner (only when viewing a resolved session that has one) */}
                  {isReadOnly && ratings[activeSession.session_id]?.comment && (
                    <div style={{
                      padding: '10px 20px',
                      borderBottom: '1px solid #fde68a',
                      background: '#fffbeb',
                      fontSize: 12.5,
                      color: '#78350f',
                      display: 'flex',
                      gap: 8,
                      alignItems: 'flex-start',
                    }}>
                      <Star size={14} fill='#f59e0b' color='#f59e0b' style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <strong style={{ fontWeight: 700 }}>Customer feedback:</strong>{' '}
                        <span style={{ fontStyle: 'italic' }}>"{ratings[activeSession.session_id].comment}"</span>
                      </div>
                    </div>
                  )}

                  {/* Messages area */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      background: '#fafafa',
                    }}
                  >
                    {messages.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 32 }}>
                        No messages yet — waiting for the user to speak…
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isAgent = msg.role === 'agent';
                        const isUser = msg.role === 'user';
                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: 'flex',
                              justifyContent: isAgent ? 'flex-end' : 'flex-start',
                              alignItems: 'flex-end',
                              gap: 8,
                            }}
                          >
                            {!isAgent && (
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: isUser ? '#e5e7eb' : '#1d5c5c',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  flexShrink: 0,
                                }}
                              >
                                {isUser
                                  ? <UserIcon size={14} color='#6b7280' strokeWidth={2.25} />
                                  : <Bot size={14} color='#C18B3F' strokeWidth={2.25} />}
                              </div>
                            )}
                            <div
                              style={{
                                maxWidth: '72%',
                                padding: '10px 14px',
                                borderRadius: 14,
                                fontSize: 13.5,
                                lineHeight: 1.55,
                                wordBreak: 'break-word',
                                // Sender (agent) = teal; receiver (user/bot) = brand gold
                                background: isAgent ? '#1d5c5c' : '#C18B3F',
                                color: '#ffffff',
                                borderBottomRightRadius: isAgent ? 4 : 14,
                                borderBottomLeftRadius: isAgent ? 14 : 4,
                                boxShadow: isAgent ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
                              }}
                            >
                              {msg.content}
                              <div
                                style={{
                                  fontSize: 10,
                                  marginTop: 4,
                                  opacity: 0.6,
                                  textAlign: isAgent ? 'right' : 'left',
                                }}
                              >
                                {formatTime(msg.created_at)}
                              </div>
                            </div>
                            {isAgent && (
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  background: '#1d5c5c',
                                  color: '#fff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  flexShrink: 0,
                                }}
                              >
                                CS
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    {/* Typing indicator */}
                    {userIsTyping && (
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <UserIcon size={14} color='#6b7280' strokeWidth={2.25} />
                        </div>
                        <div style={{ background: '#C18B3F', borderRadius: '14px 14px 14px 4px', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                          {[0, 0.2, 0.4].map((delay, i) => (
                            <span
                              key={i}
                              style={{
                                width: 7, height: 7, borderRadius: '50%', background: '#ffffff',
                                display: 'inline-block',
                                animation: 'typingDot 1.2s ease-in-out infinite',
                                animationDelay: `${delay}s`,
                              }}
                            />
                          ))}
                          <style>{`@keyframes typingDot { 0%,80%,100%{transform:scale(0.7);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply input — hidden for resolved sessions */}
                  {isReadOnly ? (
                    <div
                      style={{
                        padding: '12px 20px',
                        borderTop: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        textAlign: 'center',
                        fontSize: 12.5,
                        color: '#9ca3af',
                        flexShrink: 0,
                      }}
                    >
                      This conversation is resolved — read only
                    </div>
                  ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 16px',
                      borderTop: '1px solid #e5e7eb',
                      background: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Type a reply…"
                      value={replyText}
                      onChange={e => {
                        setReplyText(e.target.value);
                        // Broadcast that agent is typing; auto-stop after 2 s of inactivity
                        broadcastTyping(true);
                        clearTimeout(agentTypingTimeoutRef.current ?? undefined);
                        agentTypingTimeoutRef.current = setTimeout(() => broadcastTyping(false), 2000);
                      }}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendReply(); }}
                      disabled={sending}
                      maxLength={2000}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        border: '1.5px solid #e5e7eb',
                        borderRadius: 24,
                        outline: 'none',
                        fontSize: 13.5,
                        color: '#1f2937',
                        background: '#f9fafb',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1d5c5c'; (e.target as HTMLInputElement).style.background = '#fff'; }}
                      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'; (e.target as HTMLInputElement).style.background = '#f9fafb'; }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#1d5c5c',
                        color: '#fff',
                        border: 'none',
                        cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                        opacity: sending || !replyText.trim() ? 0.4 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        flexShrink: 0,
                        transition: 'opacity 0.2s',
                      }}
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
    </div>
  );
};

export default LiveInbox;

import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { csrNavigationItems } from '@/components/layout/csrSidebar';
import { supabase } from '@/lib/supabase';
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

function getInitials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return '??';
}

function getDisplayName(name: string | null, email: string | null): string {
  return name || email || 'Anonymous User';
}

// ── Component ──────────────────────────────────────────────────────────────
const LiveInbox = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.session_id === activeSessionId) ?? null;

  // ── Load active sessions ──────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    const { data } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('mode', 'agent')
      .order('handed_off_at', { ascending: false });

    if (data) setSessions(data as ChatSession[]);
    setSessionsLoading(false);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // ── Realtime: session list updates ─────────────────────────────────────
  useEffect(() => {
    const ch = supabase
      .channel('admin-live-sessions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversation_sessions' },
        () => loadSessions(),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadSessions]);

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

  // ── Scroll to bottom ──────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Send reply ────────────────────────────────────────────────────────
  const sendReply = useCallback(async () => {
    if (!replyText.trim() || !activeSessionId || sending) return;
    setSending(true);
    const text = replyText.trim();
    setReplyText('');

    await supabase.from('session_messages').insert({
      session_id: activeSessionId,
      role: 'agent',
      content: text,
    });

    setSending(false);
  }, [replyText, activeSessionId, sending]);

  // ── Resolve session ────────────────────────────────────────────────────
  const resolveSession = useCallback(async () => {
    if (!activeSessionId || resolving) return;
    setResolving(true);

    await supabase
      .from('conversation_sessions')
      .update({ mode: 'bot', resolved_at: new Date().toISOString() })
      .eq('session_id', activeSessionId);

    // Send a closing message to the user
    await supabase.from('session_messages').insert({
      session_id: activeSessionId,
      role: 'agent',
      content: '✅ This support session has been resolved. You have been returned to CribBot. Feel free to reach out again if you need help!',
    });

    setActiveSessionId(null);
    setResolving(false);
  }, [activeSessionId, resolving]);

  // ── Unread badge: count sessions that received a new user message ─────
  // (Simple approach — sessions list always shows live count)

  return (
    <div className="supportDash">
      <Sidebar navigationItems={csrNavigationItems} />
      <div className="main">
        <Topbar />

        <section className="container px-4 md:px-6">
          {/* Page header */}
          <div className="text mb-4">
            <span>
              <h1>Live Chat Inbox</h1>
              <p>Real-time support conversations handed off from CribBot</p>
            </span>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: sessions.length > 0 ? '#fef2f2' : '#f0fdf4', color: sessions.length > 0 ? '#dc2626' : '#15803d' }}
              >
                <span
                  style={{
                    width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                    background: sessions.length > 0 ? '#ef4444' : '#4ade80',
                    animation: sessions.length > 0 ? 'pulse 1.5s infinite' : 'none',
                  }}
                />
                {sessions.length} Active {sessions.length === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>
          </div>

          {/* Main inbox layout */}
          <div
            style={{
              display: 'flex',
              height: 'calc(100vh - 180px)',
              gap: 16,
              background: '#f9fafb',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid #e5e7eb',
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
              <div
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>Active Chats</span>
                <span
                  style={{
                    background: sessions.length > 0 ? '#fef2f2' : '#f3f4f6',
                    color: sessions.length > 0 ? '#dc2626' : '#6b7280',
                    borderRadius: 12,
                    padding: '1px 8px',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {sessions.length}
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {sessionsLoading ? (
                  <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    Loading sessions…
                  </div>
                ) : sessions.length === 0 ? (
                  <div style={{ padding: 32, textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
                    <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 500 }}>No active chats</div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                      Sessions will appear when users request a live agent
                    </div>
                  </div>
                ) : (
                  sessions.map(session => {
                    const isActive = session.session_id === activeSessionId;
                    const initials = getInitials(session.name, session.email);
                    const displayName = getDisplayName(session.name, session.email);
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
                          background: isActive ? '#eff6ff' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                          borderLeft: isActive ? '3px solid #1d4ed8' : '3px solid transparent',
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            background: isActive ? '#1d4ed8' : '#e5e7eb',
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
                          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                            {formatTime(session.handed_off_at)}
                          </div>
                        </div>
                        {/* Live dot */}
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: '#ef4444',
                            flexShrink: 0,
                          }}
                        />
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
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#374151' }}>Select a conversation</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>
                    Choose an active session from the left to start chatting
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
                          background: '#1d4ed8',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(activeSession.name, activeSession.email)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                          {getDisplayName(activeSession.name, activeSession.email)}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                          Live — handed off {formatTime(activeSession.handed_off_at)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={resolveSession}
                      disabled={resolving}
                      style={{
                        background: resolving ? '#f3f4f6' : '#f0fdf4',
                        border: '1.5px solid',
                        borderColor: resolving ? '#d1d5db' : '#86efac',
                        color: resolving ? '#9ca3af' : '#15803d',
                        fontWeight: 600,
                        fontSize: 12.5,
                        padding: '7px 16px',
                        borderRadius: 20,
                        cursor: resolving ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {resolving ? 'Resolving…' : '✅ Resolve & Close'}
                    </button>
                  </div>

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
                                  background: isUser ? '#e5e7eb' : '#e6f4f2',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 13,
                                  flexShrink: 0,
                                }}
                              >
                                {isUser ? '👤' : '🏠'}
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
                                background: isAgent ? '#1d4ed8' : msg.role === 'assistant' ? '#ffffff' : '#f3f4f6',
                                color: isAgent ? '#ffffff' : '#1f2937',
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
                                  background: '#1d4ed8',
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
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply input */}
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
                      onChange={e => setReplyText(e.target.value)}
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
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#1d4ed8'; (e.target as HTMLInputElement).style.background = '#fff'; }}
                      onBlur={e => { (e.target as HTMLInputElement).style.borderColor = '#e5e7eb'; (e.target as HTMLInputElement).style.background = '#f9fafb'; }}
                    />
                    <button
                      onClick={sendReply}
                      disabled={sending || !replyText.trim()}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#1d4ed8',
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
                      ➤
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LiveInbox;

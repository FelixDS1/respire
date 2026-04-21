'use client'

// PREMIUM — Secure messaging feature: client component with realtime

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/lib/language'

interface Conversation {
  other_user_id: string
  other_user_name: string
  other_user_avatar: string | null
  last_message: string
  last_message_at: string
  unread_count: number
}

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read_at: string | null
}

interface Props {
  currentUserId: string
  currentUserRole: string
  initialConversations: Conversation[]
  withId?: string | null
  withName?: string | null
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function formatFullTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function Avatar({ name, photoUrl, size = 36 }: { name: string; photoUrl?: string | null; size?: number }) {
  if (photoUrl) {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0, overflow: 'hidden', backgroundColor: 'var(--blue-accent)' }}>
        <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: 'var(--blue-accent)', border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: size * 0.36, fontWeight: 500,
      color: 'var(--blue-primary)', letterSpacing: '0.02em',
    }}>
      {initials(name)}
    </div>
  )
}

export default function MessagesClient({
  currentUserId,
  currentUserRole,
  initialConversations,
  withId: withIdProp,
  withName: withNameProp,
}: Props) {
  const { lang } = useLanguage()

  const withId = withIdProp ?? null
  const withName = withNameProp ?? (lang === 'en' ? 'New conversation' : 'Nouvelle conversation')

  const seedConversations = useCallback((): Conversation[] => {
    if (!withId) return initialConversations
    const exists = initialConversations.some(c => c.other_user_id === withId)
    if (exists) return initialConversations
    return [
      { other_user_id: withId, other_user_name: withName, other_user_avatar: null, last_message: '', last_message_at: new Date().toISOString(), unread_count: 0 },
      ...initialConversations,
    ]
  }, [withId, withName, initialConversations])

  const [conversations, setConversations] = useState<Conversation[]>(seedConversations)
  const [selectedId, setSelectedId] = useState<string | null>(withId ?? initialConversations[0]?.other_user_id ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  // Mobile: which panel is showing — 'list' or 'thread'
  const [mobileView, setMobileView] = useState<'list' | 'thread'>(withId ? 'thread' : 'list')
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedConversation = conversations.find(c => c.other_user_id === selectedId)

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const fetchMessages = useCallback(async (otherUserId: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/get-messages?other_user_id=${encodeURIComponent(otherUserId)}`)
      const json = await res.json()
      setMessages(json.messages ?? [])
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  const markAsRead = useCallback(async (otherUserId: string) => {
    await fetch('/api/mark-messages-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ other_user_id: otherUserId }),
    })
    setConversations(prev => prev.map(c => c.other_user_id === otherUserId ? { ...c, unread_count: 0 } : c))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetchMessages(selectedId)
    markAsRead(selectedId)
  }, [selectedId, fetchMessages, markAsRead])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${currentUserId}` },
        (payload: { new: Message }) => {
          const newMsg = payload.new as Message
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev
            if (newMsg.sender_id === selectedId) {
              markAsRead(newMsg.sender_id)
              return [...prev, newMsg]
            }
            return prev
          })
          setConversations(prev => {
            const exists = prev.find(c => c.other_user_id === newMsg.sender_id)
            if (exists) {
              return prev.map(c => c.other_user_id === newMsg.sender_id
                ? { ...c, last_message: newMsg.content, last_message_at: newMsg.created_at, unread_count: selectedId === newMsg.sender_id ? 0 : c.unread_count + 1 }
                : c
              ).sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
            }
            return [{ other_user_id: newMsg.sender_id, other_user_name: currentUserRole === 'therapist' ? 'Patient' : 'Thérapeute', other_user_avatar: null, last_message: newMsg.content, last_message_at: newMsg.created_at, unread_count: 1 }, ...prev]
          })
        }
      ).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, currentUserRole, selectedId, markAsRead])

  const sendMessage = async () => {
    if (!input.trim() || !selectedId || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    const res = await fetch('/api/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient_id: selectedId, content }),
    })
    const json = await res.json()
    if (json.ok && json.message) {
      setMessages(prev => prev.some(m => m.id === json.message.id) ? prev : [...prev, json.message as Message])
      setConversations(prev =>
        prev.map(c => c.other_user_id === selectedId ? { ...c, last_message: content, last_message_at: json.message.created_at } : c)
          .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      )
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const openConversation = (id: string) => {
    setSelectedId(id)
    setMessages([])
    if (isMobile) setMobileView('thread')
  }

  const goBackToList = () => {
    setMobileView('list')
  }

  const emptyLabel = lang === 'en' ? 'No messages yet.' : 'Aucun message pour le moment.'
  const noConversations = lang === 'en' ? 'No conversations yet.' : 'Aucune conversation pour le moment.'
  const inputPlaceholder = lang === 'en' ? 'Write a message…' : 'Écrire un message…'

  // ── Shared: conversation row (used in both mobile list and desktop sidebar)
  const ConvRow = ({ conv, isActive }: { conv: Conversation; isActive: boolean }) => (
    <button
      onClick={() => openConversation(conv.other_user_id)}
      style={{
        backgroundColor: isActive && !isMobile ? 'var(--blue-accent)' : 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px', border: 'none', width: '100%', textAlign: 'left',
      }}
    >
      <Avatar name={conv.other_user_name} photoUrl={conv.other_user_avatar} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: conv.unread_count > 0 ? 600 : 400, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px', fontFamily: 'Georgia, serif' }}>
            {conv.other_user_name}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#9EB3C2', flexShrink: 0, fontFamily: 'Georgia, serif' }}>
            {formatTime(conv.last_message_at)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: conv.unread_count > 0 ? 'var(--text)' : '#8A9BAD', fontWeight: conv.unread_count > 0 ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px', fontFamily: 'Georgia, serif' }}>
            {conv.last_message || '—'}
          </span>
          {conv.unread_count > 0 && (
            <span style={{ backgroundColor: 'var(--blue-primary)', color: 'white', borderRadius: '10px', fontSize: '0.65rem', lineHeight: 1, padding: '2px 6px', minWidth: '18px', textAlign: 'center', flexShrink: 0 }}>
              {conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )

  // ── Shared: thread panel content
  const ThreadPanel = ({ fullscreen }: { fullscreen?: boolean }) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: fullscreen ? '100%' : undefined }}>
      {selectedConversation ? (
        <>
          {/* Thread header */}
          <div style={{ borderBottom: '1px solid var(--border)', flexShrink: 0, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: 'var(--surface)' }}>
            {fullscreen && (
              <button onClick={goBackToList} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue-primary)', padding: '4px 8px 4px 0', display: 'flex', alignItems: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
            )}
            <Avatar name={selectedConversation.other_user_name} photoUrl={selectedConversation.other_user_avatar} size={38} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text)', fontFamily: 'Georgia, serif' }}>{selectedConversation.other_user_name}</div>
              <div style={{ fontSize: '0.72rem', color: '#9EB3C2', marginTop: '1px', fontFamily: 'Georgia, serif' }}>
                {currentUserRole === 'therapist' ? 'Patient' : 'Thérapeute'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--bg)' }}>
            {loadingMessages ? (
              <div style={{ textAlign: 'center', marginTop: '2rem', color: '#9EB3C2', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}>
                {lang === 'en' ? 'Loading…' : 'Chargement…'}
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', marginTop: '2rem', color: '#9EB3C2', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}>
                {emptyLabel}
              </div>
            ) : (
              messages.map(msg => {
                const isOwn = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '75%', padding: '9px 14px',
                      backgroundColor: isOwn ? 'var(--blue-primary)' : 'var(--surface)',
                      color: isOwn ? 'white' : 'var(--text)',
                      borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word',
                      fontFamily: 'Georgia, serif',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                    }}>
                      {msg.content}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: '#9EB3C2', marginTop: '3px', fontFamily: 'Georgia, serif' }}>
                      {formatFullTime(msg.created_at)}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0, padding: '10px 14px', display: 'flex', gap: '10px', alignItems: 'flex-end', backgroundColor: 'var(--surface)' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              rows={1}
              style={{
                flex: 1, resize: 'none', border: '1px solid var(--border)', borderRadius: '20px',
                padding: '10px 14px', fontSize: '0.9rem', color: 'var(--text)',
                backgroundColor: 'var(--bg)', outline: 'none', fontFamily: 'Georgia, serif', lineHeight: 1.4,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              style={{
                backgroundColor: 'var(--blue-primary)', color: 'white', border: 'none',
                width: '38px', height: '38px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: sending || !input.trim() ? 0.4 : 1, transition: 'opacity 0.15s', flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M10 4l6 4-6 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9EB3C2', fontSize: '0.88rem', fontFamily: 'Georgia, serif' }}>
          {lang === 'en' ? 'Select a conversation to begin.' : 'Sélectionnez une conversation.'}
        </div>
      )}
    </div>
  )

  // ── Mobile layout
  if (isMobile) {
    return (
      <main style={{ backgroundColor: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {mobileView === 'list' ? (
          /* Mobile conversation list */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 16px 12px', backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--text)', fontFamily: 'Georgia, serif', margin: 0 }}>Messages</h1>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.length === 0 ? (
                <div style={{ padding: '3rem 16px', textAlign: 'center', color: '#9EB3C2', fontSize: '0.88rem', fontFamily: 'Georgia, serif' }}>
                  {noConversations}
                </div>
              ) : (
                conversations.map((conv, i) => (
                  <div key={conv.other_user_id}>
                    <ConvRow conv={conv} isActive={conv.other_user_id === selectedId} />
                    {i < conversations.length - 1 && (
                      <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0 16px' }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Mobile thread view — full screen */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' }}>
            <ThreadPanel fullscreen />
          </div>
        )}
      </main>
    )
  }

  // ── Desktop layout (split pane)
  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px 56px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text)', fontFamily: 'Georgia, serif' }}>Messages</h1>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '32px 56px', flex: 1, display: 'flex' }}>
        <div style={{ display: 'flex', flex: 1, border: '1px solid var(--border)', borderRadius: '16px', backgroundColor: 'var(--surface)', minHeight: '520px', maxHeight: '680px', overflow: 'hidden' }}>

          {/* Sidebar */}
          <aside style={{ width: '280px', minWidth: '220px', borderRight: '1px solid var(--border)', overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--blue-primary)', fontFamily: 'Georgia, serif' }}>
              Conversations
            </div>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem 16px', textAlign: 'center', color: '#9EB3C2', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}>{noConversations}</div>
            ) : (
              conversations.map((conv, i) => (
                <div key={conv.other_user_id}>
                  <ConvRow conv={conv} isActive={conv.other_user_id === selectedId} />
                  {i < conversations.length - 1 && <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0 16px' }} />}
                </div>
              ))
            )}
          </aside>

          {/* Thread */}
          <ThreadPanel />
        </div>
      </div>
    </main>
  )
}

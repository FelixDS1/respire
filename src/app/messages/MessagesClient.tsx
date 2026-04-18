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
  if (isToday) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
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
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: '1px solid var(--border)',
        flexShrink: 0,
        overflow: 'hidden',
        backgroundColor: 'var(--blue-accent)',
      }}>
        <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: 'var(--blue-accent)',
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      fontSize: size * 0.36,
      fontWeight: 500,
      color: 'var(--blue-primary)',
      letterSpacing: '0.02em',
    }}>
      {initials(name)}
    </div>
  )
}

function formatFullTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MessagesClient({
  currentUserId,
  currentUserRole,
  initialConversations,
  withId: withIdProp,
  withName: withNameProp,
}: Props) {
  const { lang } = useLanguage()

  // Pre-seed conversation if navigated to with ?with=userId&name=name
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
  const [selectedId, setSelectedId] = useState<string | null>(
    withId ?? initialConversations[0]?.other_user_id ?? null
  )
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedConversation = conversations.find(c => c.other_user_id === selectedId)

  // Scroll to bottom of message thread
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Fetch messages for the selected conversation
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

  // Mark messages as read when conversation is opened
  const markAsRead = useCallback(async (otherUserId: string) => {
    await fetch('/api/mark-messages-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ other_user_id: otherUserId }),
    })
    // Update local unread count to 0
    setConversations(prev =>
      prev.map(c =>
        c.other_user_id === otherUserId ? { ...c, unread_count: 0 } : c
      )
    )
  }, [])

  // Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedId) return
    fetchMessages(selectedId)
    markAsRead(selectedId)
  }, [selectedId, fetchMessages, markAsRead])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Subscribe to realtime messages for the current user
  useEffect(() => {
    const supabase = createClient()

    // PREMIUM — Realtime subscription for new messages
    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${currentUserId}`,
        },
        (payload: { new: Message }) => {
          const newMsg = payload.new as Message

          // If the message belongs to the currently open conversation, add it
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev
            if (
              (currentUserRole === 'therapist'
                ? newMsg.sender_id === selectedId
                : newMsg.sender_id === selectedId)
            ) {
              markAsRead(newMsg.sender_id)
              return [...prev, newMsg]
            }
            return prev
          })

          // Update the conversation list with the new last message
          setConversations(prev => {
            const exists = prev.find(c => c.other_user_id === newMsg.sender_id)
            if (exists) {
              return prev
                .map(c =>
                  c.other_user_id === newMsg.sender_id
                    ? {
                        ...c,
                        last_message: newMsg.content,
                        last_message_at: newMsg.created_at,
                        unread_count:
                          selectedId === newMsg.sender_id
                            ? 0
                            : c.unread_count + 1,
                      }
                    : c
                )
                .sort(
                  (a, b) =>
                    new Date(b.last_message_at).getTime() -
                    new Date(a.last_message_at).getTime()
                )
            }
            // New conversation — add it (name unknown until refresh, use placeholder)
            return [
              {
                other_user_id: newMsg.sender_id,
                other_user_name: currentUserRole === 'therapist' ? 'Patient' : 'Thérapeute', other_user_avatar: null,
                last_message: newMsg.content,
                last_message_at: newMsg.created_at,
                unread_count: 1,
              },
              ...prev,
            ]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, currentUserRole, selectedId, markAsRead])

  // Send a message
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
      // Optimistically add the sent message
      setMessages(prev => {
        if (prev.some(m => m.id === json.message.id)) return prev
        return [...prev, json.message as Message]
      })
      // Update conversation preview
      setConversations(prev =>
        prev
          .map(c =>
            c.other_user_id === selectedId
              ? {
                  ...c,
                  last_message: content,
                  last_message_at: json.message.created_at,
                }
              : c
          )
          .sort(
            (a, b) =>
              new Date(b.last_message_at).getTime() -
              new Date(a.last_message_at).getTime()
          )
      )
    }

    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const selectConversation = (id: string) => {
    setSelectedId(id)
    setMessages([])
  }

  const emptyLabel =
    lang === 'en'
      ? 'No messages yet. Start a conversation.'
      : 'Aucun message pour le moment.'

  const noConversations =
    lang === 'en'
      ? 'No conversations yet.'
      : 'Aucune conversation pour le moment.'

  const inputPlaceholder =
    lang === 'en' ? 'Write a message… (Enter to send)' : 'Écrire un message… (Entrée pour envoyer)'

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Page heading */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        <div className="max-w-[1400px] mx-auto px-14 py-5">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text)', fontFamily: 'Georgia, serif' }}>
            {lang === 'en' ? 'Messages' : 'Messages'}
          </h1>
        </div>
      </div>

      {/* PREMIUM — Main messaging layout */}
      <div className="max-w-[1400px] mx-auto w-full px-14 py-8 flex-1 flex gap-0" style={{ minHeight: 0 }}>
        <div
          className="flex flex-1 overflow-hidden"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '16px',
            backgroundColor: 'var(--surface)',
            minHeight: '520px',
            maxHeight: '680px',
            overflow: 'hidden',
          }}
        >
          {/* Left sidebar — conversation list */}
          <aside
            style={{
              width: '280px',
              minWidth: '220px',
              borderRight: '1px solid var(--border)',
              overflowY: 'auto',
              flexShrink: 0,
            }}
          >
            <div
              className="px-4 py-3 text-xs uppercase tracking-widest"
              style={{
                borderBottom: '1px solid var(--border)',
                color: 'var(--blue-primary)',
              }}
            >
              {lang === 'en' ? 'Conversations' : 'Conversations'}
            </div>

            {conversations.length === 0 ? (
              <div className="px-4 py-8 text-sm text-center" style={{ color: '#9EB3C2' }}>
                {noConversations}
              </div>
            ) : (
              conversations.map((conv, i) => {
                const isActive = conv.other_user_id === selectedId
                return (
                  <div key={conv.other_user_id}>
                  <button
                    onClick={() => selectConversation(conv.other_user_id)}
                    className="w-full text-left transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--blue-accent)' : 'var(--surface)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      border: 'none',
                      width: '100%',
                    }}
                  >
                    <Avatar name={conv.other_user_name} photoUrl={conv.other_user_avatar} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: conv.unread_count > 0 ? 600 : 400,
                          color: isActive ? 'var(--blue-primary)' : 'var(--text)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          maxWidth: '130px',
                        }}>
                          {conv.other_user_name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#9EB3C2', flexShrink: 0 }}>
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          fontSize: '0.78rem', color: conv.unread_count > 0 ? 'var(--text)' : '#8A9BAD',
                          fontWeight: conv.unread_count > 0 ? 500 : 400,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px',
                        }}>
                          {conv.last_message || '—'}
                        </span>
                        {conv.unread_count > 0 && (
                          <span style={{
                            backgroundColor: 'var(--blue-primary)', color: 'var(--surface)',
                            borderRadius: '10px', fontSize: '0.65rem', lineHeight: 1,
                            padding: '2px 6px', minWidth: '18px', textAlign: 'center', flexShrink: 0,
                          }}>
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                  {i < conversations.length - 1 && (
                    <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '0 16px' }} />
                  )}
                  </div>
                )
              })
            )}
          </aside>

          {/* Right panel — message thread */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Thread header */}
            {selectedConversation ? (
              <>
                <div
                  style={{ borderBottom: '1px solid var(--border)', flexShrink: 0, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}
                >
                  <Avatar name={selectedConversation.other_user_name} photoUrl={selectedConversation.other_user_avatar} size={36} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text)' }}>
                      {selectedConversation.other_user_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9EB3C2', marginTop: '1px' }}>
                      {currentUserRole === 'therapist'
                        ? (lang === 'en' ? 'Patient' : 'Patient')
                        : (lang === 'en' ? 'Therapist' : 'Thérapeute')}
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div
                  className="flex-1 overflow-y-auto px-6 py-4"
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  {loadingMessages ? (
                    <div className="text-sm text-center mt-8" style={{ color: '#9EB3C2' }}>
                      {lang === 'en' ? 'Loading…' : 'Chargement…'}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-sm text-center mt-8" style={{ color: '#9EB3C2' }}>
                      {emptyLabel}
                    </div>
                  ) : (
                    messages.map(msg => {
                      const isOwn = msg.sender_id === currentUserId
                      return (
                        <div
                          key={msg.id}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isOwn ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '65%',
                              padding: '8px 14px',
                              backgroundColor: isOwn ? 'var(--blue-primary)' : 'var(--blue-accent)',
                              color: isOwn ? 'white' : 'var(--text)',
                              borderRadius: isOwn
                                ? '16px 16px 4px 16px'
                                : '16px 16px 16px 4px',
                              fontSize: '14px',
                              lineHeight: '1.5',
                              wordBreak: 'break-word',
                            }}
                          >
                            {msg.content}
                          </div>
                          <span
                            className="text-xs mt-1"
                            style={{ color: '#9EB3C2' }}
                          >
                            {formatFullTime(msg.created_at)}
                          </span>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* PREMIUM — Message input */}
                <div
                  className="px-6 py-3 flex gap-3 items-end"
                  style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}
                >
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={inputPlaceholder}
                    rows={2}
                    style={{
                      flex: 1,
                      resize: 'none',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: 'var(--text)',
                      backgroundColor: 'var(--bg)',
                      outline: 'none',
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.5',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    title={lang === 'en' ? 'Send' : 'Envoyer'}
                    style={{
                      backgroundColor: 'var(--blue-primary)',
                      color: 'white',
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                      opacity: sending || !input.trim() ? 0.4 : 1,
                      transition: 'opacity 0.15s',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8h12M10 4l6 4-6 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </>
            ) : (
              <div
                className="flex-1 flex items-center justify-center text-sm"
                style={{ color: '#9EB3C2' }}
              >
                {lang === 'en'
                  ? 'Select a conversation to begin.'
                  : 'Sélectionnez une conversation pour commencer.'}
              </div>
            )}
          </div>
        </div>
      </div>

    </main>
  )
}

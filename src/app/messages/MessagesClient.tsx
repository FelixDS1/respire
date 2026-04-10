'use client'

// PREMIUM — Secure messaging feature: client component with realtime

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useLanguage } from '@/lib/language'

interface Conversation {
  other_user_id: string
  other_user_name: string
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
      { other_user_id: withId, other_user_name: withName, last_message: '', last_message_at: new Date().toISOString(), unread_count: 0 },
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
        (payload) => {
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
                other_user_name: currentUserRole === 'therapist' ? 'Patient' : 'Thérapeute',
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
      {/* PREMIUM — Page heading */}
      <div
        style={{
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'white',
        }}
      >
        <div className="max-w-5xl mx-auto px-6 py-6">
          <h1
            className="text-2xl font-light"
            style={{ color: 'var(--text)' }}
          >
            {lang === 'en' ? 'Messages' : 'Messages'}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#4A6070' }}>
            {lang === 'en'
              ? 'Secure, private communication with your therapist or patients.'
              : 'Communication sécurisée et privée avec votre thérapeute ou vos patients.'}
          </p>
        </div>
      </div>

      {/* PREMIUM — Main messaging layout */}
      <div className="max-w-5xl mx-auto w-full px-6 py-8 flex-1 flex gap-0" style={{ minHeight: 0 }}>
        <div
          className="flex flex-1 overflow-hidden"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'white',
            minHeight: '520px',
            maxHeight: '680px',
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
              <div
                className="px-4 py-6 text-sm text-center"
                style={{ color: '#4A6070' }}
              >
                {noConversations}
              </div>
            ) : (
              conversations.map(conv => {
                const isActive = conv.other_user_id === selectedId
                return (
                  <button
                    key={conv.other_user_id}
                    onClick={() => selectConversation(conv.other_user_id)}
                    className="w-full text-left px-4 py-3 transition-colors"
                    style={{
                      backgroundColor: isActive ? 'var(--blue-accent)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      display: 'block',
                      border: 'none',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className="text-sm font-normal truncate"
                        style={{
                          color: isActive ? 'var(--blue-primary)' : 'var(--text)',
                          maxWidth: '160px',
                        }}
                      >
                        {conv.other_user_name}
                      </span>
                      <span className="text-xs" style={{ color: '#9EB3C2', flexShrink: 0 }}>
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs truncate"
                        style={{ color: '#4A6070', maxWidth: '170px' }}
                      >
                        {conv.last_message}
                      </span>
                      {conv.unread_count > 0 && (
                        <span
                          className="text-xs px-1.5 py-0.5 ml-1"
                          style={{
                            backgroundColor: 'var(--blue-primary)',
                            color: 'white',
                            borderRadius: '10px',
                            minWidth: '18px',
                            textAlign: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
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
                  className="px-6 py-3 flex items-center"
                  style={{ borderBottom: '1px solid var(--border)', flexShrink: 0 }}
                >
                  <div>
                    <div className="text-sm font-normal" style={{ color: 'var(--text)' }}>
                      {selectedConversation.other_user_name}
                    </div>
                    <div className="text-xs" style={{ color: '#9EB3C2' }}>
                      {currentUserRole === 'therapist'
                        ? lang === 'en' ? 'Patient' : 'Patient'
                        : lang === 'en' ? 'Therapist' : 'Thérapeute'}
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
                      padding: '8px 12px',
                      fontSize: '14px',
                      color: 'var(--text)',
                      backgroundColor: 'white',
                      outline: 'none',
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.5',
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !input.trim()}
                    style={{
                      backgroundColor: 'var(--blue-primary)',
                      color: 'white',
                      border: 'none',
                      padding: '10px 20px',
                      fontSize: '13px',
                      cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                      opacity: sending || !input.trim() ? 0.5 : 1,
                      transition: 'opacity 0.15s',
                      flexShrink: 0,
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    {lang === 'en' ? 'Send' : 'Envoyer'}
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

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'white' }}>
        <div
          className="max-w-5xl mx-auto px-6 py-8 flex justify-between items-center text-sm"
          style={{ color: '#4A6070' }}
        >
          <span>© 2026 Respire</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:opacity-70 transition-opacity">
              {lang === 'en' ? 'Privacy' : 'Confidentialité'}
            </a>
            <a href="/terms" className="hover:opacity-70 transition-opacity">
              {lang === 'en' ? 'Terms' : 'Conditions'}
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

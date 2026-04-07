'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function Logout() {
  useEffect(() => {
    async function signOut() {
      try {
        await createClient().auth.signOut()
      } catch {
        // ignore
      }
      window.location.href = '/api/logout'
    }
    signOut()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <p className="text-sm" style={{ color: '#4A6070' }}>Déconnexion...</p>
    </div>
  )
}

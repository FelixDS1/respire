import { createBrowserClient } from '@supabase/ssr'

// Use a global singleton to prevent multiple instances competing for the auth lock
const globalKey = '__supabase_client__'

declare global {
  interface Window {
    [globalKey]: ReturnType<typeof createBrowserClient> | undefined
  }
}

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!window[globalKey]) {
    window[globalKey] = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  return window[globalKey]!
}

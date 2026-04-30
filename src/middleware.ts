import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Pages accessible without being logged in
const PUBLIC_PATHS = [
  '/liste-attente',
  '/login',
  '/api/pre-launch-signup',
  '/api/logout',
  '/privacy',
  '/terms',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow Next.js internals and static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|webp|woff2?|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Always allow explicitly public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }

  // Check Supabase session
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/liste-attente', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

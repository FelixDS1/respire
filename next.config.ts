import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent your pages being embedded in iframes on other sites (clickjacking)
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stop browsers guessing content types (MIME sniffing attacks)
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Only send referrer on same-origin requests
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable access to browser features you don't use
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Force HTTPS for 1 year (enable once you have a verified domain)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Content Security Policy — restricts where scripts/styles/data can load from
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Supabase API and realtime
              `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com https://api.resend.com`,
              // Stripe checkout redirect + scripts
              "frame-src 'self' https://js.stripe.com https://checkout.stripe.com",
              "script-src 'self' 'unsafe-inline' https://js.stripe.com",
              // Styles — unsafe-inline needed for Tailwind's runtime styles
              "style-src 'self' 'unsafe-inline'",
              // Images — Supabase storage for avatars/credentials
              `img-src 'self' data: blob: https://*.supabase.co`,
              // Fonts
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig;

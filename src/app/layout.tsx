import type { Metadata } from "next";
import { Cormorant_Garamond } from 'next/font/google'
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import { LanguageProvider } from "@/lib/language";
import { createServerSupabaseClient } from "@/lib/supabase-server";

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Respire — Trouvez votre thérapeute à Paris",
  description: "Prenez rendez-vous avec un thérapeute à Paris. Parcourez les profils et réservez en ligne.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  let role: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null
  }

  return (
    <html lang="fr" className={`h-full ${cormorant.variable}`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <Navbar initialEmail={user?.email ?? null} initialRole={role} />
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}

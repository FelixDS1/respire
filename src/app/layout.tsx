import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/lib/language";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <Navbar initialEmail={user?.email ?? null} initialRole={role} />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Cormorant_Garamond } from 'next/font/google'
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import StudentCTA from "@/components/StudentCTA";
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
  let isStudent = false
  let studentVerified = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? null

    if (role === 'patient') {
      const { data: studentData } = await supabase
        .from('patient_students')
        .select('is_student, student_verified')
        .eq('patient_id', user.id)
        .single()
      isStudent = studentData?.is_student ?? false
      studentVerified = studentData?.student_verified ?? false
    }
  }

  return (
    <html lang="fr" className={`h-full ${cormorant.variable}`}>
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <Navbar initialEmail={user?.email ?? null} initialRole={role} />
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
          <CookieBanner />
          {role === 'patient' && (
            <StudentCTA patientId={user?.id ?? null} isStudent={isStudent} studentVerified={studentVerified} />
          )}
        </LanguageProvider>
      </body>
    </html>
  );
}

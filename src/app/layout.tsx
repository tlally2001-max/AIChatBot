import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Demo Drop - AI Receptionist",
  description: "Generate AI knowledge bases from business websites and manage demo leads",
};

async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-blue-600 text-white shadow">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Demo Drop
        </Link>
        <div className="flex gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-blue-100">
                Dashboard
              </Link>
              <form
                action={async () => {
                  "use server";
                  const supabase = await createClient();
                  await supabase.auth.signOut();
                }}
              >
                <button
                  type="submit"
                  className="hover:text-blue-100"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="hover:text-blue-100">
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainNav from "@/components/navigation/MainNav";
import MobileNav from "@/components/navigation/MobileNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SKINgenius — AI-Powered Skin Analysis",
  description: "Medical-grade skin analysis. Photo → condition detection → evidence-based product, supplement & professional service recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Desktop Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#FFFBF5]/85 backdrop-blur-md border-b border-[#E7E5E4]">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-stone-900 tracking-tight">
                SKINgenius
              </span>
            </a>
            <MainNav />
            <div className="hidden md:block">
              {/* UserMenu placeholder for desktop — pages handle auth themselves */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pt-16">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </body>
    </html>
  );
}

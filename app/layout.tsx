import type { Metadata } from "next";
import { Bungee, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/Provider";
import Link from "next/link";
import "./globals.css";

const bungee = Bungee({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bungee",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "hoichoi AI Content Studio & Command Center",
  description: "Cross-platform multi-agent content generation with human-in-the-loop approval and feedback loops",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${bungee.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="min-h-screen bg-paper text-ink flex flex-col font-inter selection:bg-lime selection:text-ink">
          <TRPCProvider>
            {/* Sticker Studio Neobrutalist Top Header */}
            <header className="border-b-4 border-ink bg-paper sticky top-0 z-50 shadow-neo-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link href="/" className="flex items-center gap-2 group">
                    <span className="bg-tomato text-paper border-2 border-ink px-2.5 py-1 font-bungee text-xl rotate-[-2deg] shadow-neo-sm group-hover:rotate-0 transition-transform">
                      HOICHOI
                    </span>
                    <span className="font-bungee text-xl tracking-tight text-ink">
                      CONTENT STUDIO
                    </span>
                  </Link>

                  <nav className="hidden md:flex items-center gap-2 pl-4 border-l-2 border-ink">
                    <Link
                      href="/"
                      className="px-3 py-1.5 font-bungee text-sm hover:bg-lime border-2 border-transparent hover:border-ink hover:shadow-neo-sm transition-all"
                    >
                      Studio
                    </Link>
                    <Link
                      href="/approval"
                      className="px-3 py-1.5 font-bungee text-sm hover:bg-sunshine border-2 border-transparent hover:border-ink hover:shadow-neo-sm transition-all flex items-center gap-1.5"
                    >
                      Approval Queue
                      <span className="bg-tomato text-white text-[10px] px-1.5 py-0.5 border border-ink">
                        HITL
                      </span>
                    </Link>
                    <Link
                      href="/publisher"
                      className="px-3 py-1.5 font-bungee text-sm hover:bg-blue hover:text-white border-2 border-transparent hover:border-ink hover:shadow-neo-sm transition-all"
                    >
                      Publisher
                    </Link>
                    <Link
                      href="/insights"
                      className="px-3 py-1.5 font-bungee text-sm hover:bg-pink hover:text-white border-2 border-transparent hover:border-ink hover:shadow-neo-sm transition-all"
                    >
                      Insights & Report
                    </Link>
                  </nav>
                </div>

                <div className="flex items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button className="neo-btn bg-lime text-ink px-4 py-2 text-sm">
                        Sign In
                      </button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline font-mono text-xs text-ink/70">
                        Content Manager
                      </span>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </header>

            {/* Main Application Container */}
            <main className="flex-1 flex flex-col">{children}</main>

            {/* Footer with Safeguard Status */}
            <footer className="border-t-3 border-ink bg-white py-4 px-6 text-xs font-mono text-ink/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 bg-lime px-2 py-0.5 border-2 border-ink font-bungee text-[11px]">
                  ✓ GATE ACTIVE
                </span>
                <span>Human Approval Enforced (No Auto-Publish)</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Bengali Nativeness: Runtime Checked</span>
                <span>•</span>
                <span>Compliance: Deterministic (ADR-005)</span>
                <span>•</span>
                <span>Insights: pgvector RAG Loop (ADR-008)</span>
              </div>
            </footer>
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

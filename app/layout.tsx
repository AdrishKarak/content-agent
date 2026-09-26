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

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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
            <Navbar />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

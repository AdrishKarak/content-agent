"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Send,
  BarChart3,
  BookOpen,
  Layers,
  ChevronRight,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    {
      name: "Studio",
      href: "/",
      icon: Sparkles,
      color: "hover:bg-lime",
      activeBg: "bg-lime",
    },
    {
      name: "Approval Queue",
      href: "/approval",
      icon: ShieldCheck,
      color: "hover:bg-sunshine",
      activeBg: "bg-sunshine",
      badge: "HITL",
      badgeColor: "bg-tomato text-white",
    },
    {
      name: "Publisher Command",
      href: "/publisher",
      icon: Send,
      color: "hover:bg-blue hover:text-white",
      activeBg: "bg-blue text-white",
    },
    {
      name: "Insights & Reports",
      href: "/insights",
      icon: BarChart3,
      color: "hover:bg-pink hover:text-white",
      activeBg: "bg-pink text-white",
    },
    {
      name: "User Guide",
      href: "/guide",
      icon: BookOpen,
      color: "hover:bg-lime",
      activeBg: "bg-lime",
    },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="border-b-4 border-ink bg-paper sticky top-0 z-50 shadow-neo-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="bg-tomato text-paper border-2 border-ink px-2.5 py-1 font-bungee text-lg sm:text-xl rotate-[-2deg] shadow-neo-sm group-hover:rotate-0 transition-transform">
              HOICHOI
            </span>
            <span className="font-bungee text-lg sm:text-xl tracking-tight text-ink">
              CONTENT STUDIO
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 pl-4 border-l-2 border-ink">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1.5 font-bungee text-xs sm:text-sm border-2 border-ink transition-all flex items-center gap-1.5 shadow-neo-sm ${
                    isActive
                      ? link.activeBg
                      : `bg-white ${link.color} hover:shadow-neo`
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.name}
                  {link.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 border border-ink font-mono font-bold ${link.badgeColor}`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Auth & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="neo-btn bg-lime text-ink px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bungee">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <span className="hidden md:inline font-mono text-xs text-ink/70 bg-white border border-ink px-2 py-0.5 shadow-neo-xs">
                Content Manager
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 border-2 border-ink bg-white shadow-neo-sm hover:bg-sunshine transition-colors focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-ink" />
            ) : (
              <Menu className="w-6 h-6 text-ink" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-3 border-ink bg-paper px-4 py-5 shadow-neo space-y-3 animate-in fade-in slide-in-from-top-4 duration-150">
          <div className="font-mono text-xs font-bold text-ink/60 uppercase px-1">
            Navigation Menu
          </div>
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={closeMenu}
                  className={`p-3 border-2 border-ink flex items-center justify-between font-bungee text-sm shadow-neo-sm transition-all ${
                    isActive
                      ? link.activeBg
                      : `bg-white ${link.color}`
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <link.icon className="w-4 h-4" />
                    <span>{link.name}</span>
                    {link.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 border border-ink ${link.badgeColor}`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-ink/60" />
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t-2 border-ink/30 flex items-center justify-between">
            <span className="font-mono text-[11px] text-ink/70">
              hoichoi Hackathon &apos;26 • Problem 3
            </span>
            <span className="font-bungee text-[10px] bg-lime px-2 py-0.5 border border-ink">
              v1.0 Ready
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { ShieldCheck, BookOpen, ExternalLink, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t-3 border-ink bg-white py-6 px-4 sm:px-6 lg:px-8 text-xs font-mono text-ink/80">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Guardrails */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
          <span className="inline-flex items-center gap-1.5 bg-lime px-2 py-0.5 border-2 border-ink font-bungee text-[11px] shadow-neo-xs">
            <ShieldCheck className="w-3.5 h-3.5" /> GATE ACTIVE
          </span>
          <span className="font-semibold text-ink">
            Human Approval Enforced (Zero Auto-Publish)
          </span>
        </div>

        {/* Safeguard Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[11px]">
          <span className="bg-paper px-2 py-0.5 border border-ink/40">
            Bengali Nativeness: <strong>Runtime Checked</strong>
          </span>
          <span className="bg-paper px-2 py-0.5 border border-ink/40">
            Compliance: <strong>Deterministic (ADR-005)</strong>
          </span>
          <span className="bg-paper px-2 py-0.5 border border-ink/40">
            Insights: <strong>pgvector RAG Loop (ADR-008)</strong>
          </span>
          <Link
            href="/guide"
            className="font-bungee text-tomato hover:underline inline-flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3" /> System Guide
          </Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-ink/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ink/60 gap-2">
        <span>© 2026 hoichoi AI Content Studio. Built for hoichoi Hackathon &apos;26 (Problem 3).</span>
        <span>Cross-Platform Multi-Agent Command Center</span>
      </div>
    </footer>
  );
}

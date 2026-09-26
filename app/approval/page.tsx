"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { getStickerRotationStyle } from "@/lib/design/stickerRotation";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  RotateCw,
  AlertTriangle,
  Send,
  Calendar,
  Layers,
  History,
} from "lucide-react";

export default function ApprovalQueuePage() {
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [showFeedbackFor, setShowFeedbackFor] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: queue, isLoading } = trpc.approval.pendingQueue.useQuery();

  const decideMutation = trpc.approval.decide.useMutation({
    onSuccess: () => {
      utils.approval.pendingQueue.invalidate();
    },
  });

  const handleDecide = (
    assetId: string,
    decision: "APPROVE" | "REJECT" | "REGENERATE"
  ) => {
    const feedback = feedbackMap[assetId];
    decideMutation.mutate({
      assetId,
      decision,
      feedback,
    });
    setShowFeedbackFor(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="mb-8 border-4 border-ink bg-white p-6 shadow-neo">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-sunshine px-2 py-0.5 border-2 border-ink font-bungee text-xs">
                MODULE 2
              </span>
              <span className="font-mono text-xs text-ink/70">
                HUMAN-IN-THE-LOOP APPROVAL GATE (AC 8.1)
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl text-ink font-bungee">APPROVAL QUEUE</h1>
            <p className="font-inter text-sm text-ink/80 mt-1 max-w-2xl">
              Strict Gatekeeper: No asset can be scheduled or mock-published without an explicit
              human decision. Review each tailored asset, provide feedback to regenerate, or
              authorize release to the publisher.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-lime text-ink px-3 py-1 border-2 border-ink font-mono text-xs font-bold">
              {queue?.filter((a) => a.status === "PENDING_APPROVAL").length ?? 0} Pending Review
            </span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="border-3 border-ink bg-white p-12 text-center shadow-neo">
          <RotateCw className="w-8 h-8 animate-spin mx-auto text-sunshine mb-3" />
          <h3 className="font-bungee text-lg">Loading Approval Queue...</h3>
        </div>
      ) : queue && queue.length > 0 ? (
        /* Scrapbook / Corkboard Layout per DESIGN_SYSTEM.md */
        <div className="corkboard-pattern border-4 border-ink p-8 shadow-neo min-h-[500px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {queue.map((asset) => {
              const rotationStyle = getStickerRotationStyle(asset.id);
              const channelName = asset.channel.toLowerCase();
              const isInstagram = channelName === "instagram";
              const isFacebook = channelName === "facebook";

              const channelColor = isInstagram
                ? "bg-pink text-white"
                : isFacebook
                ? "bg-blue text-white"
                : "bg-jet text-white";

              const isRejected = asset.status === "REJECTED";
              const failedChecks = asset.complianceChecks?.filter((c) => !c.passed) ?? [];
              const latestApproval = asset.approvals?.[0];

              return (
                <div
                  key={asset.id}
                  style={rotationStyle}
                  className="neo-card p-5 flex flex-col justify-between transition-transform hover:rotate-0 hover:scale-[1.01]"
                >
                  <div>
                    {/* Channel & Version Info */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2.5 py-0.5 border-2 border-ink font-bungee text-xs uppercase shadow-neo-sm ${channelColor}`}
                      >
                        {asset.channel}
                      </span>
                      <span className="font-mono text-xs bg-paper px-2 py-0.5 border-2 border-ink">
                        v{asset.version} {asset.version >= 3 ? "(Max Reached)" : ""}
                      </span>
                    </div>

                    {/* Brief Genre Title */}
                    <div className="mb-2">
                      <span className="font-mono text-[10px] text-ink/60 uppercase block">
                        Campaign
                      </span>
                      <h4 className="font-bungee text-sm text-ink truncate">
                        {asset.brief.genre || "Media Promotion"}
                      </h4>
                    </div>

                    {/* Image Preview */}
                    {asset.imageUrl && (
                      <div className="mb-3 border-2 border-ink overflow-hidden bg-black/5 relative">
                        <img
                          src={asset.imageUrl}
                          alt={asset.channel}
                          className={`w-full object-cover ${
                            isInstagram ? "aspect-square" : "aspect-video"
                          }`}
                        />
                      </div>
                    )}

                    {/* Bengali Nativeness Badge */}
                    {asset.copyBn && (
                      <div className="mb-2">
                        {asset.bengaliNativenessPassed ? (
                          <span className="text-[11px] font-mono text-[#057A55] bg-[#DEF7EC] px-1.5 py-0.5 border border-[#057A55] inline-flex items-center gap-1">
                            ✓ Native Bengali Verified
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-tomato bg-tomato/10 px-1.5 py-0.5 border border-tomato inline-flex items-center gap-1">
                            ⚠ Bengali Nativeness Flagged
                          </span>
                        )}
                      </div>
                    )}

                    {/* Copy Text */}
                    <div className="space-y-2 mb-3 bg-paper p-2.5 border-2 border-ink text-xs font-inter">
                      {asset.copyBn && <p className="text-ink font-medium">{asset.copyBn}</p>}
                      {asset.copyEn && <p className="text-ink/80 italic">{asset.copyEn}</p>}
                      {asset.cta && (
                        <div className="font-semibold text-ink pt-1 border-t border-ink/20">
                          CTA: {asset.cta}
                        </div>
                      )}
                      {asset.hashtags && asset.hashtags.length > 0 && (
                        <div className="text-[10px] font-mono text-ink/70">
                          {asset.hashtags.map((h) => `#${h}`).join(" ")}
                        </div>
                      )}
                    </div>

                    {/* Torn-Ticket Compliance Failure Banner (AC 6.1) */}
                    {failedChecks.length > 0 && (
                      <div className="torn-ticket p-3 mb-3">
                        <div className="flex items-center gap-1 font-bungee text-xs mb-1">
                          <AlertTriangle className="w-4 h-4 text-white" />
                          COMPLIANCE VIOLATION
                        </div>
                        <ul className="text-xs font-inter list-disc list-inside space-y-0.5">
                          {failedChecks.map((f, i) => (
                            <li key={i}>{f.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Previous Feedback Note if applicable */}
                    {latestApproval?.feedback && (
                      <div className="mb-3 bg-sunshine/20 border-2 border-ink p-2 text-xs font-inter">
                        <span className="font-bungee text-[10px] text-ink block mb-0.5">
                          Previous Feedback:
                        </span>
                        "{latestApproval.feedback}"
                      </div>
                    )}

                    {/* Feedback Input Field (Revealed for Take Two / Reject) */}
                    {showFeedbackFor === asset.id && (
                      <div className="mb-3 space-y-2">
                        <textarea
                          value={feedbackMap[asset.id] || ""}
                          onChange={(e) =>
                            setFeedbackMap({
                              ...feedbackMap,
                              [asset.id]: e.target.value,
                            })
                          }
                          placeholder="What needs to change? (e.g. 'Make it more playful', 'Change the background tone')..."
                          rows={2}
                          className="w-full text-xs font-inter border-2 border-ink p-2 bg-paper focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Neobrutalist Action Buttons per DESIGN_SYSTEM.md Voice Table */}
                  <div className="space-y-2 pt-3 border-t-2 border-ink/20">
                    <div className="grid grid-cols-3 gap-2">
                      {/* Ship It (Approve) */}
                      <button
                        onClick={() => handleDecide(asset.id, "APPROVE")}
                        disabled={decideMutation.isPending || failedChecks.length > 0}
                        title={
                          failedChecks.length > 0
                            ? "Cannot approve an asset with compliance violations"
                            : "Authorize for publication"
                        }
                        className="neo-btn bg-lime text-ink py-2 text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-lime-hover"
                      >
                        Ship It 🔥
                      </button>

                      {/* Take Two (Regenerate with feedback) */}
                      <button
                        onClick={() => {
                          if (showFeedbackFor !== asset.id) {
                            setShowFeedbackFor(asset.id);
                          } else {
                            handleDecide(asset.id, "REGENERATE");
                          }
                        }}
                        disabled={decideMutation.isPending || asset.version >= 3}
                        title={
                          asset.version >= 3
                            ? "Capped at 2 regenerations (ADR-009)"
                            : "Regenerate with feedback"
                        }
                        className="neo-btn bg-sunshine text-ink py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-sunshine-hover"
                      >
                        {showFeedbackFor === asset.id ? "Run 🚀" : "Take Two 🎬"}
                      </button>

                      {/* Nope (Reject) */}
                      <button
                        onClick={() => {
                          if (showFeedbackFor !== asset.id) {
                            setShowFeedbackFor(asset.id);
                          } else {
                            handleDecide(asset.id, "REJECT");
                          }
                        }}
                        disabled={decideMutation.isPending}
                        className="neo-btn bg-tomato text-white py-2 text-xs hover:bg-tomato-hover"
                      >
                        Nope ❌
                      </button>
                    </div>

                    {asset.status === "APPROVED" && (
                      <Link
                        href="/publisher"
                        className="w-full neo-btn bg-blue text-white py-1.5 text-xs text-center block mt-2"
                      >
                        Proceed to Schedule →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="border-3 border-ink bg-white p-12 text-center shadow-neo">
          <CheckCircle className="w-12 h-12 text-lime mx-auto mb-3" />
          <h3 className="font-bungee text-2xl mb-1">Queue is Clear!</h3>
          <p className="font-inter text-sm text-ink/70 max-w-sm mx-auto mb-4">
            All generated assets have been reviewed. Return to the Generative Studio to process new
            briefs or check the Publisher for scheduled drops.
          </p>
          <Link href="/" className="neo-btn bg-lime text-ink px-4 py-2 text-sm">
            ← Back to Studio
          </Link>
        </div>
      )}
    </div>
  );
}

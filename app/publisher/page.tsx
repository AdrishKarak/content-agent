"use client";

import React, { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import {
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Share2,
  BarChart3,
  Layers,
} from "lucide-react";

export default function PublisherPage() {
  const [scheduleTimes, setScheduleTimes] = useState<Record<string, string>>({});
  const utils = trpc.useUtils();

  // Queries
  const { data: scheduledPosts, isLoading: isLoadingScheduled } =
    trpc.publisher.list.useQuery();

  const { data: queue } = trpc.approval.pendingQueue.useQuery();
  const approvedAssets = queue?.filter((a) => a.status === "APPROVED") ?? [];

  // Mutations
  const scheduleMutation = trpc.publisher.schedule.useMutation({
    onSuccess: () => {
      utils.publisher.list.invalidate();
      utils.approval.pendingQueue.invalidate();
    },
  });

  const publishNowMutation = trpc.publisher.publishNow.useMutation({
    onSuccess: () => {
      utils.publisher.list.invalidate();
      utils.approval.pendingQueue.invalidate();
    },
  });

  const handleSchedule = (assetId: string) => {
    const time = scheduleTimes[assetId] || new Date(Date.now() + 3600000).toISOString();
    scheduleMutation.mutate({
      assetId,
      scheduledAt: time,
    });
  };

  const handlePublishNow = (scheduledPostId: string) => {
    publishNowMutation.mutate({ scheduledPostId });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Top Banner */}
      <div className="mb-8 border-4 border-ink bg-white p-6 shadow-neo">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue text-white px-2 py-0.5 border-2 border-ink font-bungee text-xs">
                MODULE 2
              </span>
              <span className="font-mono text-xs text-ink/70">
                MULTI-PLATFORM MOCK PUBLISHER (ADR-001)
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl text-ink font-bungee">PUBLISHER COMMAND</h1>
            <p className="font-inter text-sm text-ink/80 mt-1 max-w-2xl">
              Schedule approved assets for cross-platform release. The mock adapter layer executes
              a second-layer constraint re-validation (AC 12.2) to guarantee no non-compliant
              content goes live.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/insights"
              className="neo-btn bg-pink text-white px-4 py-2 text-sm flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" /> View Cross-Platform Insights
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Approved Assets Waiting to be Scheduled (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <h2 className="text-xl font-bungee mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-lime" /> Approved & Ready
            </h2>
            <p className="font-inter text-xs text-ink/70 mb-4">
              Assets signed off by human review. Set schedule date or trigger immediate mock drop.
            </p>

            {approvedAssets.length === 0 ? (
              <div className="border-2 border-dashed border-ink/40 p-6 text-center bg-paper">
                <span className="font-bungee text-sm block mb-1">No approved assets pending</span>
                <p className="font-inter text-xs text-ink/60 mb-3">
                  Approve assets in the Approval Queue to unlock scheduling.
                </p>
                <Link
                  href="/approval"
                  className="neo-btn bg-sunshine text-ink px-3 py-1.5 text-xs inline-block"
                >
                  Go to Approval Queue →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {approvedAssets.map((asset) => {
                  const channel = asset.channel.toLowerCase();
                  const isInstagram = channel === "instagram";
                  const isFacebook = channel === "facebook";
                  const channelColor = isInstagram
                    ? "bg-pink text-white"
                    : isFacebook
                    ? "bg-blue text-white"
                    : "bg-jet text-white";

                  return (
                    <div key={asset.id} className="border-2 border-ink p-3 bg-paper shadow-neo-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-bungee text-[10px] px-2 py-0.5 border border-ink uppercase ${channelColor}`}
                        >
                          {asset.channel}
                        </span>
                        <span className="font-mono text-[10px] text-ink/60">
                          {asset.brief.genre || "Promotion"}
                        </span>
                      </div>

                      <p className="font-inter text-xs text-ink line-clamp-2 mb-2 font-medium">
                        {asset.copyBn || asset.copyEn}
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-ink/20">
                        <input
                          type="datetime-local"
                          value={
                            scheduleTimes[asset.id] ||
                            new Date(Date.now() + 3600000).toISOString().slice(0, 16)
                          }
                          onChange={(e) =>
                            setScheduleTimes({
                              ...scheduleTimes,
                              [asset.id]: new Date(e.target.value).toISOString(),
                            })
                          }
                          className="font-mono text-xs border border-ink p-1 bg-white flex-1"
                        />
                        <button
                          onClick={() => handleSchedule(asset.id)}
                          disabled={scheduleMutation.isPending}
                          className="neo-btn bg-lime text-ink px-3 py-1 text-xs shrink-0"
                        >
                          Schedule
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scheduled & Published Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <h2 className="text-xl font-bungee mb-1 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue" /> Scheduled Drops & Live Feed
            </h2>
            <p className="font-inter text-xs text-ink/70 mb-4">
              Mock publishing execution history with simulated platform post IDs and re-validated
              constraints.
            </p>

            {isLoadingScheduled ? (
              <div className="p-8 text-center">
                <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue mb-2" />
                <span className="font-mono text-xs">Loading publishing logs...</span>
              </div>
            ) : scheduledPosts && scheduledPosts.length > 0 ? (
              <div className="space-y-4">
                {scheduledPosts.map((post) => {
                  const asset = post.asset;
                  const channel = asset.channel.toLowerCase();
                  const isInstagram = channel === "instagram";
                  const isFacebook = channel === "facebook";
                  const channelColor = isInstagram
                    ? "bg-pink text-white"
                    : isFacebook
                    ? "bg-blue text-white"
                    : "bg-jet text-white";

                  const isLive = !!post.publishedPost;

                  return (
                    <div
                      key={post.id}
                      className={`border-3 border-ink p-4 shadow-neo-sm transition-all ${
                        isLive ? "bg-white" : "bg-sunshine/10"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bungee text-[11px] px-2.5 py-0.5 border-2 border-ink uppercase ${channelColor}`}
                          >
                            {asset.channel}
                          </span>
                          <span className="font-bungee text-xs text-ink">
                            {asset.brief.genre || "Media Post"}
                          </span>
                        </div>

                        {isLive ? (
                          <span className="bg-lime text-ink px-2 py-0.5 border border-ink font-bungee text-[11px] inline-flex items-center gap-1 shadow-neo-sm">
                            ✓ Published (Live)
                          </span>
                        ) : (
                          <span className="bg-sunshine text-ink px-2 py-0.5 border border-ink font-bungee text-[11px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Scheduled
                          </span>
                        )}
                      </div>

                      <div className="flex gap-4 mb-3">
                        {asset.imageUrl && (
                          <img
                            src={asset.imageUrl}
                            alt="Post Visual"
                            className="w-20 h-20 object-cover border-2 border-ink shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-inter text-xs text-ink line-clamp-3 mb-1">
                            {asset.copyBn || asset.copyEn}
                          </p>
                          <div className="font-mono text-[10px] text-ink/60">
                            Scheduled: {new Date(post.scheduledAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Live Platform Post ID & Action */}
                      <div className="pt-2 border-t border-ink/20 flex flex-wrap items-center justify-between gap-2">
                        {isLive ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-paper px-2 py-0.5 border border-ink">
                              Post ID: <strong>{post.publishedPost?.mockPlatformPostId}</strong>
                            </span>
                            <span className="font-mono text-[10px] text-ink/60">
                              Published {new Date(post.publishedPost!.publishedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handlePublishNow(post.id)}
                            disabled={publishNowMutation.isPending}
                            className="neo-btn bg-lime text-ink px-3 py-1 text-xs hover:bg-lime-hover"
                          >
                            Mock Publish Now (Enforce AC 12.2) 🚀
                          </button>
                        )}

                        <Link
                          href={`/insights?briefId=${asset.briefId}`}
                          className="font-bungee text-[11px] text-blue hover:underline inline-flex items-center gap-1"
                        >
                          Compare Performance →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-ink/40">
                <p className="font-inter text-sm text-ink/70">
                  No scheduled drops found yet. Approve an asset in the queue to begin.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

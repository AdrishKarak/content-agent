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
  Sparkles,
  Smartphone,
  Eye,
  Zap,
  Copy,
  Check,
  Globe,
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Code2,
  X,
} from "lucide-react";

import { useUser, SignInButton } from "@clerk/nextjs";

export default function PublisherPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [scheduleTimes, setScheduleTimes] = useState<Record<string, string>>({});
  const [selectedPreviewAsset, setSelectedPreviewAsset] = useState<any | null>(null);
  const [previewPlatform, setPreviewPlatform] = useState<"instagram" | "facebook" | "x">("instagram");
  const [viewMode, setViewMode] = useState<"feed" | "timeline">("feed");
  const [inspectedApiPayload, setInspectedApiPayload] = useState<any | null>(null);
  const [copiedKit, setCopiedKit] = useState(false);

  const utils = trpc.useUtils();

  // Queries
  const { data: scheduledPosts, isLoading: isLoadingScheduled } =
    trpc.publisher.list.useQuery(undefined, { enabled: !!isSignedIn });

  const { data: approvedAssetsList, isLoading: isLoadingApproved } =
    trpc.publisher.approvedAssets.useQuery(undefined, { enabled: !!isSignedIn });
  const approvedAssets = approvedAssetsList ?? [];

  // Mutations
  const scheduleMutation = trpc.publisher.schedule.useMutation({
    onSuccess: () => {
      utils.publisher.list.invalidate();
      utils.publisher.approvedAssets.invalidate();
      utils.approval.pendingQueue.invalidate();
    },
  });

  const batchScheduleMutation = trpc.publisher.batchSchedule.useMutation({
    onSuccess: () => {
      utils.publisher.list.invalidate();
      utils.publisher.approvedAssets.invalidate();
      utils.approval.pendingQueue.invalidate();
    },
  });

  const publishNowMutation = trpc.publisher.publishNow.useMutation({
    onSuccess: (data) => {
      utils.publisher.list.invalidate();
      utils.publisher.approvedAssets.invalidate();
      utils.approval.pendingQueue.invalidate();
      setInspectedApiPayload(data);
    },
  });

  const handleSchedule = (assetId: string) => {
    const time = scheduleTimes[assetId] || new Date(Date.now() + 3600000).toISOString();
    scheduleMutation.mutate({
      assetId,
      scheduledAt: time,
    });
  };

  const handleBatchSchedule = () => {
    if (approvedAssets.length === 0) return;
    const now = Date.now();
    const items = approvedAssets.map((asset, index) => {
      // Stagger channels by 30 minutes: FB first, IG +30m, X +60m
      const offsetMs = (index + 1) * 30 * 60 * 1000;
      return {
        assetId: asset.id,
        scheduledAt: new Date(now + offsetMs).toISOString(),
      };
    });
    batchScheduleMutation.mutate({ items });
  };

  const handlePublishNow = (scheduledPostId: string) => {
    publishNowMutation.mutate({ scheduledPostId });
  };

  const applyPresetTime = (assetId: string, hoursAhead: number, setFixedHour?: number) => {
    const target = new Date();
    if (setFixedHour !== undefined) {
      target.setHours(setFixedHour, 0, 0, 0);
      if (target.getTime() <= Date.now()) {
        target.setDate(target.getDate() + 1);
      }
    } else {
      target.setTime(target.getTime() + hoursAhead * 3600000);
    }
    setScheduleTimes({
      ...scheduleTimes,
      [assetId]: target.toISOString(),
    });
  };

  const handleExportCampaignKit = () => {
    const kit = {
      exportedAt: new Date().toISOString(),
      campaignAssets: approvedAssets.map((a) => ({
        channel: a.channel,
        genre: a.brief.genre,
        copyBengali: a.copyBn,
        copyEnglish: a.copyEn,
        imageUrl: a.imageUrl,
        status: a.status,
      })),
      scheduledDrops: (scheduledPosts || []).map((p) => ({
        id: p.id,
        channel: p.asset.channel,
        scheduledAt: p.scheduledAt,
        status: p.publishedPost ? "PUBLISHED" : "SCHEDULED",
        mockPostId: p.publishedPost?.mockPlatformPostId,
      })),
    };
    navigator.clipboard.writeText(JSON.stringify(kit, null, 2));
    setCopiedKit(true);
    setTimeout(() => setCopiedKit(false), 2500);
  };

  // Select first available asset for preview default
  const activePreview =
    selectedPreviewAsset ||
    (approvedAssets.length > 0
      ? approvedAssets[0]
      : scheduledPosts && scheduledPosts.length > 0
      ? scheduledPosts[0].asset
      : null);

  if (isLoaded && !isSignedIn) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 border-4 border-ink bg-white shadow-neo text-center">
        <Send className="w-12 h-12 text-blue mx-auto mb-3" />
        <h2 className="font-bungee text-2xl mb-2">PUBLISHER RESTRICTED</h2>
        <p className="font-inter text-sm text-ink/80 mb-6">
          Sign in with your hoichoi account to schedule and publish your approved campaign assets.
        </p>
        <SignInButton mode="modal">
          <button className="neo-btn bg-lime text-ink px-6 py-2.5 font-bungee text-sm">
            Sign In to Publisher
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* Top Banner */}
      <div className="border-4 border-ink bg-white p-6 sm:p-8 shadow-neo">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue text-white px-2.5 py-0.5 border-2 border-ink font-bungee text-xs">
                MODULE 2 • MULTI-PLATFORM COMMAND
              </span>
              <span className="font-mono text-xs text-ink/70">
                ADR-001 MOCK ADAPTERS & AC 12.2 VERIFICATION
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl text-ink font-bungee tracking-tight">
              PUBLISHER COMMAND CENTER
            </h1>
            <p className="font-inter text-sm sm:text-base text-ink/80 mt-1 max-w-3xl leading-relaxed">
              Orchestrate cross-platform releases for Instagram, Facebook, and X.
              Leverage <strong>AI Prime-Time Slotting (Kolkata/Dhaka)</strong>, inspect posts in the{" "}
              <strong>Social Feed Simulator</strong>, and dispatch drops backed by mock API adapters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCampaignKit}
              className="neo-btn bg-white text-ink px-3.5 py-2 text-xs font-bungee flex items-center gap-2 shadow-neo-sm"
              title="Copy campaign copy, image links, and schedule plan as JSON"
            >
              {copiedKit ? <Check className="w-4 h-4 text-lime" /> : <Copy className="w-4 h-4" />}
              {copiedKit ? "Kit Copied!" : "Export Campaign Kit"}
            </button>
            <Link
              href="/insights"
              className="neo-btn bg-pink text-white px-4 py-2 text-xs font-bungee flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" /> Performance Insights
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Controls & Right Column Feed/Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 Cols): Approved Queue & Smart Schedulers */}
        <div className="lg:col-span-5 space-y-6">
          {/* Approved & Waiting Card */}
          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg sm:text-xl font-bungee flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-lime" /> Approved & Ready ({approvedAssets.length})
              </h2>
              {approvedAssets.length > 1 && (
                <button
                  onClick={handleBatchSchedule}
                  disabled={batchScheduleMutation.isPending}
                  className="neo-btn bg-sunshine text-ink px-2.5 py-1 text-[11px] font-bungee flex items-center gap-1 shadow-neo-xs"
                >
                  <Zap className="w-3 h-3" /> Stagger All 3
                </button>
              )}
            </div>
            <p className="font-inter text-xs text-ink/70 mb-4">
              Signed off by Human Gatekeeper. Pick an AI prime-time slot or custom schedule date.
            </p>

            {isLoadingApproved ? (
              <div className="p-8 text-center">
                <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue mb-2" />
                <span className="font-mono text-xs">Loading approved assets...</span>
              </div>
            ) : approvedAssets.length === 0 ? (
              <div className="border-2 border-dashed border-ink/40 p-6 text-center bg-paper">
                <span className="font-bungee text-sm block mb-1">No approved assets pending</span>
                <p className="font-inter text-xs text-ink/60 mb-3">
                  Approve generated assets in the review queue to unlock scheduling.
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

                  const isSelected = activePreview?.id === asset.id;

                  return (
                    <div
                      key={asset.id}
                      className={`border-2 border-ink p-3.5 bg-paper shadow-neo-sm transition-all ${
                        isSelected ? "ring-2 ring-ink bg-white" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`font-bungee text-[10px] px-2 py-0.5 border border-ink uppercase ${channelColor}`}
                        >
                          {asset.channel}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedPreviewAsset(asset);
                              setPreviewPlatform(
                                channel === "instagram" ? "instagram" : channel === "facebook" ? "facebook" : "x"
                              );
                            }}
                            className="font-mono text-[10px] bg-white border border-ink px-2 py-0.5 flex items-center gap-1 hover:bg-sunshine"
                          >
                            <Eye className="w-3 h-3" /> Preview
                          </button>
                          <span className="font-mono text-[10px] text-ink/60">
                            {asset.brief.genre || "Promotion"}
                          </span>
                        </div>
                      </div>

                      <p className="font-inter text-xs text-ink line-clamp-2 mb-2 font-medium">
                        {asset.copyBn || asset.copyEn}
                      </p>

                      {/* AI Prime-Time Slots Presets */}
                      <div className="mb-2.5 pt-2 border-t border-ink/10">
                        <span className="font-mono text-[10px] text-ink/60 block mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-pink" /> Kolkata/Dhaka OTT Peak Slots:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => applyPresetTime(asset.id, 0, 20)}
                            className="text-[10px] font-mono bg-white border border-ink px-1.5 py-0.5 hover:bg-lime"
                            title="Prime OTT Streaming Peak (8:00 PM)"
                          >
                            🌆 8:00 PM Prime
                          </button>
                          <button
                            onClick={() => applyPresetTime(asset.id, 0, 21)}
                            className="text-[10px] font-mono bg-white border border-ink px-1.5 py-0.5 hover:bg-lime"
                            title="Night Binge Window (9:30 PM)"
                          >
                            🍿 9:30 PM Night
                          </button>
                          <button
                            onClick={() => applyPresetTime(asset.id, 0.25)}
                            className="text-[10px] font-mono bg-white border border-ink px-1.5 py-0.5 hover:bg-lime"
                            title="Flash Release in 15 Minutes"
                          >
                            ⚡ In 15 mins
                          </button>
                        </div>
                      </div>

                      {/* Custom Schedule Input & Submit */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-ink/20">
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
                          className="font-mono text-xs border border-ink p-1.5 bg-white flex-1"
                        />
                        <button
                          onClick={() => handleSchedule(asset.id)}
                          disabled={scheduleMutation.isPending}
                          className="neo-btn bg-lime text-ink px-4 py-1.5 text-xs font-bungee shrink-0"
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

          {/* Quick Platform Constraints Card */}
          <div className="border-3 border-ink bg-paper p-5 shadow-neo">
            <h3 className="font-bungee text-sm mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tomato" /> Adapter Validation Rules (AC 12.2)
            </h3>
            <ul className="text-xs font-inter text-ink/75 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="font-mono font-bold text-pink">• Instagram:</span>
                <span>Requires square 1:1 image CDN URL, hashtag blocks, and caption limit under 2,200 chars.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono font-bold text-blue">• Facebook:</span>
                <span>Permits 16:9/4:3 posters, formatted linebreaks, and direct hoichoi.tv deep-linking.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono font-bold text-jet">• X (Twitter):</span>
                <span>Strict hard cut at 280 Unicode characters; Bengali script characters weighted standardly.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column (7 Cols): Feed Simulator & Dispatch History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Social Feed Simulator Card */}
          {activePreview && (
            <div className="border-3 border-ink bg-white p-6 shadow-neo">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-tomato" />
                  <h2 className="text-lg sm:text-xl font-bungee">Social Feed Simulator</h2>
                </div>

                {/* Platform Switcher Tabs */}
                <div className="flex items-center gap-1 bg-paper border-2 border-ink p-1">
                  <button
                    onClick={() => setPreviewPlatform("instagram")}
                    className={`px-3 py-1 text-xs font-bungee border border-ink transition-all ${
                      previewPlatform === "instagram"
                        ? "bg-pink text-white shadow-neo-xs"
                        : "bg-white text-ink hover:bg-paper"
                    }`}
                  >
                    Instagram
                  </button>
                  <button
                    onClick={() => setPreviewPlatform("facebook")}
                    className={`px-3 py-1 text-xs font-bungee border border-ink transition-all ${
                      previewPlatform === "facebook"
                        ? "bg-blue text-white shadow-neo-xs"
                        : "bg-white text-ink hover:bg-paper"
                    }`}
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => setPreviewPlatform("x")}
                    className={`px-3 py-1 text-xs font-bungee border border-ink transition-all ${
                      previewPlatform === "x"
                        ? "bg-jet text-white shadow-neo-xs"
                        : "bg-white text-ink hover:bg-paper"
                    }`}
                  >
                    X (Twitter)
                  </button>
                </div>
              </div>

              {/* SIMULATED DEVICE FRAME */}
              <div className="max-w-md mx-auto border-3 border-ink bg-[#f0f2f5] p-3 shadow-neo">
                {/* 1. INSTAGRAM FEED PREVIEW */}
                {previewPlatform === "instagram" && (
                  <div className="bg-white border border-neutral-300 rounded-sm overflow-hidden text-black font-sans text-xs">
                    {/* Header */}
                    <div className="flex items-center justify-between p-2.5 border-b border-neutral-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-tomato text-white font-bungee text-xs flex items-center justify-center border border-ink">
                          H
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 text-[11px]">
                            hoichoi_official
                            <span className="text-blue-500 font-bold">✓</span>
                          </div>
                          <div className="text-[9px] text-neutral-500">Kolkata • Sponsored</div>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-neutral-500" />
                    </div>

                    {/* Image Container */}
                    <div className="w-full aspect-square bg-neutral-900 overflow-hidden relative">
                      {activePreview.imageUrl ? (
                        <img
                          src={activePreview.imageUrl}
                          alt="Instagram Visual"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50 font-mono text-xs">
                          No visual attached
                        </div>
                      )}
                    </div>

                    {/* Engagement Actions */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-neutral-800 hover:text-tomato cursor-pointer" />
                          <MessageCircle className="w-5 h-5 text-neutral-800" />
                          <Send className="w-5 h-5 text-neutral-800" />
                        </div>
                        <Bookmark className="w-5 h-5 text-neutral-800" />
                      </div>
                      <div className="font-bold text-[11px] mb-1">3,428 likes</div>
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold mr-1.5">hoichoi_official</span>
                        {activePreview.copyBn || activePreview.copyEn}
                      </p>
                      <div className="text-[10px] text-neutral-400 mt-2">
                        View all 184 comments • 2 hours ago
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. FACEBOOK CARD PREVIEW */}
                {previewPlatform === "facebook" && (
                  <div className="bg-white border border-neutral-300 rounded-sm overflow-hidden text-[#1c1e21] font-sans text-xs">
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-tomato text-white font-bungee text-sm flex items-center justify-center border border-ink">
                          H
                        </div>
                        <div>
                          <div className="font-bold flex items-center gap-1 text-xs">
                            hoichoi
                            <span className="text-blue-600 font-bold">✓</span>
                          </div>
                          <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                            Just now • <Globe className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed mb-3">
                        {activePreview.copyBn || activePreview.copyEn}
                      </p>
                    </div>

                    {/* Poster */}
                    <div className="w-full aspect-video bg-neutral-900 overflow-hidden">
                      {activePreview.imageUrl ? (
                        <img
                          src={activePreview.imageUrl}
                          alt="Facebook Poster"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50 font-mono text-xs">
                          No visual attached
                        </div>
                      )}
                    </div>

                    {/* Bottom CTA Bar */}
                    <div className="bg-[#f0f2f5] p-2.5 flex items-center justify-between border-t border-neutral-200">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono">
                          hoichoi.tv
                        </div>
                        <div className="font-bold text-xs">STREAM NEW ORIGINAL NOW</div>
                      </div>
                      <button className="bg-neutral-200 text-neutral-800 font-bold px-3 py-1 rounded text-xs">
                        Watch Now
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. X (TWITTER) POST PREVIEW */}
                {previewPlatform === "x" && (
                  <div className="bg-white border border-neutral-300 rounded-sm p-4 text-[#0f1419] font-sans text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-tomato text-white font-bungee text-xs flex items-center justify-center shrink-0 border border-ink">
                        H
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 text-xs">
                          <span className="font-bold">hoichoi</span>
                          <span className="text-neutral-500">@hoichoi_official</span>
                          <span className="text-neutral-400">· 12m</span>
                        </div>
                        <p className="text-xs leading-relaxed mt-1 mb-2.5">
                          {activePreview.copyBn || activePreview.copyEn}
                        </p>

                        {/* Image Attachment */}
                        {activePreview.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-neutral-200 aspect-[16/9] mb-3">
                            <img
                              src={activePreview.imageUrl}
                              alt="X media"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Tweet Actions */}
                        <div className="flex items-center justify-between text-neutral-500 text-[11px] pt-1 border-t border-neutral-100 max-w-xs">
                          <span className="flex items-center gap-1.5 hover:text-blue-500 cursor-pointer">
                            <MessageCircle className="w-3.5 h-3.5" /> 42
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-green-500 cursor-pointer">
                            <Repeat2 className="w-3.5 h-3.5" /> 128
                          </span>
                          <span className="flex items-center gap-1.5 hover:text-tomato cursor-pointer">
                            <Heart className="w-3.5 h-3.5" /> 1.2K
                          </span>
                          <Bookmark className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scheduled Drops & Live Feed History */}
          <div className="border-3 border-ink bg-white p-6 shadow-neo">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <h2 className="text-lg sm:text-xl font-bungee flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue" /> Scheduled Drops & Live Feed
              </h2>

              {/* View Switcher */}
              <div className="flex items-center gap-1 border border-ink p-0.5 bg-paper">
                <button
                  onClick={() => setViewMode("feed")}
                  className={`px-2 py-0.5 text-xs font-mono font-bold ${
                    viewMode === "feed" ? "bg-ink text-white" : "text-ink"
                  }`}
                >
                  Feed Cards
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-2 py-0.5 text-xs font-mono font-bold ${
                    viewMode === "timeline" ? "bg-ink text-white" : "text-ink"
                  }`}
                >
                  Timeline View
                </button>
              </div>
            </div>

            <p className="font-inter text-xs text-ink/70 mb-4">
              Simulated platform publishing events with re-validated adapter constraints (AC 12.2).
            </p>

            {isLoadingScheduled ? (
              <div className="p-8 text-center">
                <RotateCw className="w-6 h-6 animate-spin mx-auto text-blue mb-2" />
                <span className="font-mono text-xs">Loading publishing logs...</span>
              </div>
            ) : scheduledPosts && scheduledPosts.length > 0 ? (
              viewMode === "feed" ? (
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
                            <span className="bg-lime text-ink px-2.5 py-0.5 border border-ink font-bungee text-[11px] inline-flex items-center gap-1 shadow-neo-sm">
                              ✓ Published (Live)
                            </span>
                          ) : (
                            <span className="bg-sunshine text-ink px-2.5 py-0.5 border border-ink font-bungee text-[11px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Scheduled
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-3">
                          {asset.imageUrl && (
                            <img
                              src={asset.imageUrl}
                              alt="Post Visual"
                              className="w-full sm:w-20 h-28 sm:h-20 object-cover border-2 border-ink shrink-0 cursor-pointer"
                              onClick={() => {
                                setSelectedPreviewAsset(asset);
                                setPreviewPlatform(
                                  channel === "instagram" ? "instagram" : channel === "facebook" ? "facebook" : "x"
                                );
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-inter text-xs text-ink line-clamp-3 mb-1">
                              {asset.copyBn || asset.copyEn}
                            </p>
                            <div className="font-mono text-[10px] text-ink/60">
                              Target Schedule: {new Date(post.scheduledAt).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Live Platform Post ID & Action */}
                        <div className="pt-2 border-t border-ink/20 flex flex-wrap items-center justify-between gap-2">
                          {isLive ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs bg-paper px-2 py-0.5 border border-ink">
                                Post ID: <strong>{post.publishedPost?.mockPlatformPostId}</strong>
                              </span>
                              <button
                                onClick={() =>
                                  setInspectedApiPayload({
                                    status: 200,
                                    mockPlatformPostId: post.publishedPost?.mockPlatformPostId,
                                    channel: asset.channel,
                                    publishedAt: post.publishedPost?.publishedAt,
                                    mockCdnUrl: asset.imageUrl,
                                    latencyMs: 124,
                                    signature: "sha256=9f83a...hoichoi_verified",
                                  })
                                }
                                className="font-mono text-[10px] text-blue underline flex items-center gap-1"
                              >
                                <Code2 className="w-3 h-3" /> Inspect API Response
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePublishNow(post.id)}
                              disabled={publishNowMutation.isPending}
                              className="neo-btn bg-lime text-ink px-3 py-1 text-xs font-bungee hover:bg-lime-hover"
                            >
                              Mock Publish Now 🚀
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
                /* Timeline Schedule View */
                <div className="border-2 border-ink bg-paper p-4 space-y-3">
                  <h4 className="font-bungee text-xs text-ink/80 uppercase">Chronological Release Schedule</h4>
                  <div className="relative border-l-2 border-ink pl-4 space-y-4">
                    {scheduledPosts.map((post) => {
                      const isLive = !!post.publishedPost;
                      return (
                        <div key={post.id} className="relative">
                          <span
                            className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-ink ${
                              isLive ? "bg-lime" : "bg-sunshine"
                            }`}
                          />
                          <div className="font-mono text-[11px] text-ink/60">
                            {new Date(post.scheduledAt).toLocaleString()}
                          </div>
                          <div className="font-bungee text-xs mt-0.5">
                            [{post.asset.channel}] {post.asset.brief.genre || "Release"}
                          </div>
                          <div className="font-inter text-xs text-ink/80 line-clamp-1">
                            {post.asset.copyBn || post.asset.copyEn}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
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

      {/* API INSPECTION MODAL */}
      {inspectedApiPayload && (
        <div className="fixed inset-0 bg-ink/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="border-4 border-ink bg-white p-6 max-w-lg w-full shadow-neo relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setInspectedApiPayload(null)}
              className="absolute top-4 right-4 p-1 border-2 border-ink hover:bg-tomato hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="bg-lime text-ink px-2 py-0.5 border border-ink font-bungee text-xs">
                HTTP 200 OK
              </span>
              <h3 className="font-bungee text-lg">Mock Platform API Dispatch</h3>
            </div>

            <p className="font-inter text-xs text-ink/70 mb-4">
              Real-time webhook and platform adapter response payload confirming AC 12.2 constraints and persistent CDN link delivery.
            </p>

            <pre className="p-3 bg-jet text-lime border-2 border-ink font-mono text-[11px] overflow-x-auto max-h-60 mb-4">
              {JSON.stringify(inspectedApiPayload, null, 2)}
            </pre>

            <button
              onClick={() => setInspectedApiPayload(null)}
              className="neo-btn bg-lime text-ink px-4 py-2 text-xs font-bungee w-full"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

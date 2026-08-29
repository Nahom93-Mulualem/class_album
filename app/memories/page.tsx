"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useApp } from "../context/AppContext";
import { MemoryCategory } from "../data/initialData";

const CATEGORIES: { label: string; value: MemoryCategory | "All"; icon: string }[] = [
  { label: "All Memories", value: "All", icon: "auto_awesome" },
  { label: "Graduation", value: "Graduation", icon: "school" },
  { label: "Campus Life", value: "Campus Life", icon: "apartment" },
  { label: "Class Events", value: "Class Events", icon: "celebration" },
  { label: "Friends", value: "Friends", icon: "group" },
  { label: "Trips", value: "Trips", icon: "flight_takeoff" },
  { label: "Funny Moments", value: "Funny Moments", icon: "sentiment_very_satisfied" },
  { label: "Throwbacks", value: "Throwbacks", icon: "history" },
  { label: "Other", value: "Other", icon: "category" },
];

const YEARS = ["All", "2026", "2025", "2024", "2023", "2022", "2021", "2020"] as const;

type ViewMode = "masonry" | "grid" | "timeline";

export default function MemoriesPage() {
  const {
    memories,
    toggleLikeMemory,
    openLightbox,
    setIsNewMemoryModalOpen,
    setActiveMemoryForDetail,
    showToast,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | "All">("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "loved" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("masonry");
  const [animatingHeartId, setAnimatingHeartId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [, startTransition] = useTransition();

  // Trigger graduation cap celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#fcd400", "#002875", "#8ab4f8", "#ffd700", "#ffffff"],
    });
    showToast("🎓 Celebrating Phoenix Software Engineering Class of 2020 – 2026!", "success");
  };

  // Filter change with brief smooth transition
  const handleCategoryChange = (cat: MemoryCategory | "All") => {
    setIsLoading(true);
    startTransition(() => {
      setSelectedCategory(cat);
      setTimeout(() => setIsLoading(false), 240);
    });
  };

  const handleYearChange = (yr: string) => {
    setIsLoading(true);
    startTransition(() => {
      setSelectedYear(yr);
      setTimeout(() => setIsLoading(false), 240);
    });
  };

  const handleLikeClick = (e: React.MouseEvent, memId: string) => {
    e.stopPropagation();
    setAnimatingHeartId(memId);
    toggleLikeMemory(memId);
    setTimeout(() => setAnimatingHeartId(null), 500);
  };

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: memories.length };
    CATEGORIES.forEach((c) => {
      if (c.value !== "All") {
        counts[c.value] = memories.filter((m) => m.category === c.value).length;
      }
    });
    return counts;
  }, [memories]);

  // Filtered and sorted memories
  const filteredMemories = useMemo(() => {
    let result = memories.filter((m) => {
      const matchCat = selectedCategory === "All" || m.category === selectedCategory;
      const matchYear = selectedYear === "All" || m.year === selectedYear;
      const matchSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.story.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.taggedClassmates &&
          m.taggedClassmates.some((t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase())
          ));
      return matchCat && matchYear && matchSearch;
    });

    if (sortBy === "loved") {
      result = [...result].sort((a, b) => b.likesCount - a.likesCount);
    } else if (sortBy === "oldest") {
      result = [...result].sort((a, b) => a.year.localeCompare(b.year));
    } else {
      result = [...result].sort((a, b) => b.year.localeCompare(a.year));
    }

    return result;
  }, [memories, selectedCategory, selectedYear, searchQuery, sortBy]);

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 pb-24 md:pb-12 animate-page-entry">
      {/* 1. Digital Yearbook Hero Banner with Official Logo */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container via-primary to-[#00102e] text-on-primary p-6 md:p-10 shadow-2xl border border-secondary-container/30">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-96 h-96 rounded-full bg-primary-fixed-dim/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Logo & Headline */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-3xl">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden shadow-2xl shrink-0 border-2 border-secondary-container/50 bg-black/40 p-0.5">
              <img
                src="/phoenix-logo.png"
                alt="Phoenix Batch Official Logo"
                className="w-full h-full object-cover rounded-[22px]"
              />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary-container/40 text-secondary-container text-xs font-headline font-bold uppercase tracking-wider">
                <span>🎓</span>
                <span>Commencement & Memory Vault • 2020 – 2026</span>
              </div>
              <h1 className="font-headline text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Software Engineering Memory Vault
              </h1>
              <p className="text-xs sm:text-sm text-primary-fixed leading-relaxed">
                Relive our 4-year journey from freshman year to graduation commencement, capstones, and lifelong friendships.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => setIsNewMemoryModalOpen(true)}
              className="flex-1 lg:flex-none px-5 py-3 bg-secondary-container text-on-secondary-container rounded-2xl font-headline font-bold text-xs shadow-lg hover:brightness-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">cloud_upload</span>
              <span>Upload Memory</span>
            </button>

            <button
              onClick={triggerConfetti}
              className="flex-1 lg:flex-none px-4 py-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl font-headline font-semibold text-xs backdrop-blur-md border border-white/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg text-secondary-container">
                celebration
              </span>
              <span>Throw Caps 🎓</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Navigation Controls */}
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-4 md:p-6 shadow-sm space-y-4">
        {/* Category Pills Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-primary uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-secondary">collections</span>
              Categories
            </span>
            <span className="text-on-surface-variant font-medium lowercase">
              {filteredMemories.length} memories matching
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.value;
              const count = categoryCounts[cat.value] || 0;
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-headline font-semibold whitespace-nowrap transition-all flex items-center gap-2 active:scale-95 cursor-pointer shrink-0 border ${
                    isSelected
                      ? "bg-secondary-container text-on-secondary-container border-secondary-container shadow-xs font-bold scale-102"
                      : "bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-outline-variant/20"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Year Filter (2020 - 2026), Search, Sort & View Mode */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-outline-variant/15">
          {/* Year Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
            <span className="text-xs font-bold text-on-surface-variant mr-1 shrink-0 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">calendar_today</span>
              Timeline:
            </span>
            {YEARS.map((yr) => {
              const isSelected = selectedYear === yr;
              return (
                <button
                  key={yr}
                  onClick={() => handleYearChange(yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 active:scale-95 cursor-pointer ${
                    isSelected
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20"
                  }`}
                >
                  {yr === "All" ? "All (2020–2026)" : `'${yr.slice(2)}`}
                </button>
              );
            })}
          </div>

          {/* Search, Sort, View Modes */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search memories, stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-1.5 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl text-xs font-body text-on-surface outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs font-body text-on-surface outline-none cursor-pointer"
            >
              <option value="newest">Most Recent (2026)</option>
              <option value="loved">Most Loved ❤️</option>
              <option value="oldest">Freshman First (2020)</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-surface-container-low rounded-xl p-0.5 border border-outline-variant/30">
              <button
                onClick={() => setViewMode("masonry")}
                title="Masonry Gallery View"
                className={`p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                  viewMode === "masonry"
                    ? "bg-surface text-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg">dashboard</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Yearbook Scrapbook Grid"
                className={`p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-surface text-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                title="Story Timeline View"
                className={`p-1.5 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                  viewMode === "timeline"
                    ? "bg-surface text-primary shadow-xs"
                    : "text-outline hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-lg">view_timeline</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Skeleton Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-3xl p-4 border border-outline-variant/30 space-y-3"
            >
              <div className="w-full h-56 rounded-2xl skeleton-shimmer"></div>
              <div className="w-3/4 h-4 rounded-md skeleton-shimmer"></div>
              <div className="w-1/2 h-3 rounded-md skeleton-shimmer"></div>
            </div>
          ))}
        </div>
      ) : filteredMemories.length === 0 ? (
        /* Empty State */
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center text-3xl mx-auto">
            📸
          </div>
          <h3 className="font-headline font-bold text-lg text-primary">No Memories Found</h3>
          <p className="text-xs text-on-surface-variant">
            No digital yearbook moments match your current filter selection &quot;{selectedCategory}&quot; in year {selectedYear}.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedYear("All");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-surface-container-low hover:bg-surface-container-high text-primary rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsNewMemoryModalOpen(true)}
              className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-xl text-xs font-bold hover:brightness-95 transition-all shadow-xs cursor-pointer"
            >
              Upload First Memory
            </button>
          </div>
        </div>
      ) : viewMode === "timeline" ? (
        /* 4. Timeline View */
        <div className="space-y-6 relative before:absolute before:left-4 md:before:left-1/2 before:top-4 before:bottom-4 before:w-0.5 before:bg-outline-variant/40">
          {filteredMemories.map((mem, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div
                key={mem.id}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  isEven ? "md:flex-row-reverse" : ""
                } gap-6 pl-10 md:pl-0`}
              >
                {/* Center Node */}
                <div className="absolute left-2.5 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-secondary-container border-4 border-surface-container-lowest shadow-md z-10"></div>

                {/* Content Card */}
                <div className="w-full md:w-[calc(50%-2rem)]">
                  <div
                    onClick={() => setActiveMemoryForDetail(mem)}
                    className="yearbook-polaroid rounded-3xl p-5 cursor-pointer group"
                  >
                    <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[16/9] bg-black/40">
                      <img
                        src={mem.image}
                        alt={mem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 bg-secondary-container/90 text-on-secondary-container text-[10px] font-bold rounded-full backdrop-blur-sm">
                        🎓 {mem.category}
                      </span>
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 text-white text-[10px] font-bold rounded-full backdrop-blur-sm">
                        {mem.year}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                        <span>{mem.date}</span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">location_on</span>
                          {mem.location}
                        </span>
                      </div>

                      <h3 className="font-headline font-bold text-base text-primary group-hover:text-primary-container transition-colors">
                        {mem.title}
                      </h3>

                      <p className="text-xs text-on-surface line-clamp-2">{mem.story}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15">
                        <div className="flex items-center gap-2">
                          <img
                            src={mem.authorAvatar}
                            alt={mem.authorName}
                            className="w-6 h-6 rounded-full object-cover border border-outline-variant/30"
                          />
                          <span className="text-xs font-semibold text-primary">{mem.authorName}</span>
                        </div>

                        <button
                          onClick={(e) => handleLikeClick(e, mem.id)}
                          className="flex items-center gap-1 text-xs font-bold text-red-500 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                        >
                          <span
                            className={`material-symbols-outlined text-base ${
                              animatingHeartId === mem.id ? "animate-heart-burst" : ""
                            }`}
                            style={{
                              fontVariationSettings: mem.isLiked ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            favorite
                          </span>
                          <span>{mem.likesCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. Visual Masonry / Gallery Grid */
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
          }
        >
          {filteredMemories.map((mem) => {
            const isLiked = mem.isLiked;
            const isFeatured = mem.aspect === "featured";
            const isTall = mem.aspect === "tall";

            return (
              <article
                key={mem.id}
                onClick={() => setActiveMemoryForDetail(mem)}
                className={`break-inside-avoid yearbook-polaroid rounded-3xl overflow-hidden p-4 sm:p-5 cursor-pointer group flex flex-col justify-between ${
                  isFeatured ? "ring-2 ring-secondary-container/50" : ""
                }`}
              >
                {/* Media Container with Polaroid Styling */}
                <div
                  className={`relative rounded-2xl overflow-hidden bg-black/40 ${
                    isTall
                      ? "aspect-[3/4]"
                      : isFeatured
                      ? "aspect-[16/10]"
                      : "aspect-[4/3]"
                  }`}
                >
                  <img
                    src={mem.image}
                    alt={mem.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Video Icon Indicator */}
                  {mem.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-secondary-container/90 text-on-secondary-container flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">play_arrow</span>
                      </div>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-3 py-1 bg-secondary-container/95 text-on-secondary-container text-[11px] font-headline font-bold rounded-full shadow-md backdrop-blur-sm flex items-center gap-1">
                      <span>🎓</span>
                      <span>{mem.category}</span>
                    </span>
                  </div>

                  {/* Year Tag Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 bg-black/65 text-white text-[11px] font-bold rounded-full backdrop-blur-md">
                      &apos;{mem.year.slice(2)}
                    </span>
                  </div>

                  {/* Hover Lightbox Quick Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(mem.image, mem.video ? "video" : "image", mem.title);
                    }}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm shadow-md cursor-pointer"
                    title="Zoom Photo"
                  >
                    <span className="material-symbols-outlined text-base">zoom_in</span>
                  </button>
                </div>

                {/* Content & Metadata */}
                <div className="pt-4 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Timestamp & Location Ribbon */}
                    <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium">
                      <span>{mem.date}</span>
                      <span className="flex items-center gap-0.5 truncate max-w-[150px]">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        <span className="truncate">{mem.location}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-headline font-bold text-base text-primary group-hover:text-primary-container transition-colors mt-1 leading-snug">
                      {mem.title}
                    </h3>

                    {/* Story Preview Snippet */}
                    <p className="font-body text-xs text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                      {mem.story}
                    </p>
                  </div>

                  {/* Tagged Classmates Avatars */}
                  {mem.taggedClassmates && mem.taggedClassmates.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-on-surface-variant font-bold">With:</span>
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {mem.taggedClassmates.slice(0, 3).map((tagged) => (
                          <img
                            key={tagged.id}
                            src={tagged.avatar}
                            alt={tagged.name}
                            title={tagged.name}
                            className="w-5 h-5 rounded-full object-cover border border-surface-container-lowest ring-1 ring-outline-variant/30"
                          />
                        ))}
                      </div>
                      {mem.taggedClassmates.length > 3 && (
                        <span className="text-[10px] text-outline">
                          +{mem.taggedClassmates.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Card Bottom Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-outline-variant/15 mt-2">
                    <Link
                      href={`/profile/${mem.authorId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 group/author"
                    >
                      <img
                        src={mem.authorAvatar}
                        alt={mem.authorName}
                        className="w-6 h-6 rounded-full object-cover border border-outline-variant/30 group-hover/author:ring-1 group-hover/author:ring-primary transition-all"
                      />
                      <span className="text-xs font-semibold text-primary group-hover/author:text-primary-container truncate max-w-[110px]">
                        {mem.authorName}
                      </span>
                    </Link>

                    <div className="flex items-center gap-2">
                      {/* Comments count indicator */}
                      {mem.comments.length > 0 && (
                        <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">chat_bubble</span>
                          <span>{mem.comments.length}</span>
                        </span>
                      )}

                      {/* Animated Like Button */}
                      <button
                        onClick={(e) => handleLikeClick(e, mem.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-80 cursor-pointer ${
                          isLiked
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                            : "bg-surface-container-low text-on-surface-variant hover:text-red-500 border border-outline-variant/20"
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-base ${
                            animatingHeartId === mem.id ? "animate-heart-burst" : ""
                          }`}
                          style={{
                            fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0",
                          }}
                        >
                          favorite
                        </span>
                        <span>{mem.likesCount}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

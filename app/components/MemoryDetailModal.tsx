"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";

export default function MemoryDetailModal() {
  const {
    activeMemoryForDetail,
    setActiveMemoryForDetail,
    memories,
    toggleLikeMemory,
    addMemoryComment,
    openLightbox,
    showToast,
  } = useApp();

  const [commentInput, setCommentInput] = useState("");
  const [isLiking, setIsLiking] = useState(false);

  const currentIndex = activeMemoryForDetail
    ? memories.findIndex((m) => m.id === activeMemoryForDetail.id)
    : -1;

  const navigateMemory = useCallback(
    (direction: "next" | "prev") => {
      if (currentIndex === -1 || memories.length === 0) return;
      let nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex >= memories.length) nextIndex = 0;
      if (nextIndex < 0) nextIndex = memories.length - 1;
      setActiveMemoryForDetail(memories[nextIndex]);
    },
    [currentIndex, memories, setActiveMemoryForDetail]
  );

  // Keyboard navigation for digital yearbook flipping
  useEffect(() => {
    if (!activeMemoryForDetail) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMemoryForDetail(null);
      } else if (e.key === "ArrowRight") {
        navigateMemory("next");
      } else if (e.key === "ArrowLeft") {
        navigateMemory("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMemoryForDetail, navigateMemory, setActiveMemoryForDetail]);

  if (!activeMemoryForDetail) return null;

  const handleLike = () => {
    setIsLiking(true);
    toggleLikeMemory(activeMemoryForDetail.id);
    setTimeout(() => setIsLiking(false), 500);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addMemoryComment(activeMemoryForDetail.id, commentInput);
    setCommentInput("");
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`Link to "${activeMemoryForDetail.title}" copied! 📋`, "copy");
    } else {
      showToast("Link shared!", "copy");
    }
  };

  return (
    <div
      onClick={() => setActiveMemoryForDetail(null)}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-2xl overflow-hidden animate-modal-entry my-auto max-h-[92vh] flex flex-col md:flex-row relative"
      >
        {/* Navigation Arrow Left (Desktop) */}
        <button
          onClick={() => navigateMemory("prev")}
          className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="Previous Memory (← Arrow Key)"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>

        {/* Navigation Arrow Right (Desktop) */}
        <button
          onClick={() => navigateMemory("next")}
          className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          title="Next Memory (→ Arrow Key)"
        >
          <span className="material-symbols-outlined text-2xl">arrow_forward</span>
        </button>

        {/* Close Button */}
        <button
          onClick={() => setActiveMemoryForDetail(null)}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          title="Close (Esc)"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Left Half: Media Visual Presentation */}
        <div className="w-full md:w-1/2 bg-black/90 flex flex-col justify-center items-center relative min-h-[300px] md:min-h-[500px] overflow-hidden group">
          {activeMemoryForDetail.video ? (
            <div className="w-full h-full flex flex-col justify-center items-center p-2">
              <video
                src={activeMemoryForDetail.video}
                controls
                autoPlay
                loop
                playsInline
                className="w-full max-h-[480px] object-contain rounded-2xl shadow-xl"
              />
            </div>
          ) : (
            <div className="w-full h-full relative cursor-zoom-in flex items-center justify-center">
              <img
                src={activeMemoryForDetail.image}
                alt={activeMemoryForDetail.title}
                onClick={() => openLightbox(activeMemoryForDetail.image, "image", activeMemoryForDetail.title)}
                className="w-full h-full max-h-[540px] object-contain transition-transform duration-300 group-hover:scale-102"
              />
              <div
                onClick={() => openLightbox(activeMemoryForDetail.image, "image", activeMemoryForDetail.title)}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white text-xs font-semibold"
              >
                <span>Click to expand high-res photo</span>
                <span className="material-symbols-outlined text-lg">zoom_in</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Half: Story, Author, Tagged Classmates, & Comments */}
        <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 bg-surface-container-lowest overflow-y-auto max-h-[540px] hide-scrollbar">
          {/* Top Bar: Author Info */}
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
            <Link
              href={`/profile/${activeMemoryForDetail.authorId}`}
              className="flex items-center gap-3 group"
            >
              <img
                src={activeMemoryForDetail.authorAvatar}
                alt={activeMemoryForDetail.authorName}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant/40 group-hover:ring-2 group-hover:ring-primary transition-all"
              />
              <div>
                <h4 className="font-headline font-bold text-sm text-primary group-hover:text-primary-container transition-colors">
                  {activeMemoryForDetail.authorName}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span>{activeMemoryForDetail.date}</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Memory Story Content */}
          <div className="py-4 space-y-3 flex-1">
            <h3 className="font-headline font-bold text-lg md:text-xl text-primary leading-snug">
              {activeMemoryForDetail.title}
            </h3>
            <p className="font-body text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low/60 p-4 rounded-2xl border border-outline-variant/15 font-normal">
              &quot;{activeMemoryForDetail.story}&quot;
            </p>

            {/* Tagged Classmates */}
            {activeMemoryForDetail.taggedClassmates && activeMemoryForDetail.taggedClassmates.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Tagged Classmates ({activeMemoryForDetail.taggedClassmates.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeMemoryForDetail.taggedClassmates.map((tagged) => (
                    <Link
                      key={tagged.id}
                      href={`/profile/${tagged.id}`}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-primary transition-colors"
                    >
                      <img
                        src={tagged.avatar}
                        alt={tagged.name}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                      <span>{tagged.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar (Like, Comments Count, Share) */}
            <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs transition-all active:scale-90 cursor-pointer ${
                  activeMemoryForDetail.isLiked
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30"
                    : "bg-surface-container-low text-on-surface-variant hover:text-red-500 border border-outline-variant/20"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-lg ${
                    isLiking ? "animate-heart-burst" : ""
                  }`}
                  style={{
                    fontVariationSettings: activeMemoryForDetail.isLiked ? "'FILL' 1" : "'FILL' 0",
                  }}
                >
                  favorite
                </span>
                <span>{activeMemoryForDetail.likesCount} Loves</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant text-xs font-semibold transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">share</span>
                <span>Share</span>
              </button>
            </div>

            {/* Comments Stream */}
            <div className="pt-3 space-y-2.5">
              <h5 className="text-xs font-bold text-primary font-headline uppercase tracking-wider">
                Yearbook Notes & Comments ({activeMemoryForDetail.comments.length})
              </h5>

              <div className="space-y-2 max-h-40 overflow-y-auto hide-scrollbar">
                {activeMemoryForDetail.comments.length > 0 ? (
                  activeMemoryForDetail.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 bg-surface-container-low rounded-2xl text-xs space-y-1 border border-outline-variant/10"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary font-headline">{c.authorName}</span>
                        <span className="text-[10px] text-outline">{c.timeAgo}</span>
                      </div>
                      <p className="text-on-surface font-body">{c.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-on-surface-variant italic py-1">
                    No notes yet. Be the first to leave a message in this yearbook memory!
                  </p>
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Sign a note or comment on this memory..."
                  className="flex-1 px-4 py-2 bg-surface-container-low border border-outline-variant/20 focus:border-primary rounded-full text-xs font-body text-on-surface outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="p-2 bg-secondary-container text-on-secondary-container rounded-full hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Flip Indicators */}
          <div className="pt-4 border-t border-outline-variant/15 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="text-[11px]">
              Memory {currentIndex + 1} of {memories.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMemory("prev")}
                className="px-3 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>←</span>
                <span>Prev</span>
              </button>
              <button
                onClick={() => navigateMemory("next")}
                className="px-3 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-xs font-semibold text-primary transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Next</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SafeImage from "../components/SafeImage";
import { useApp } from "../context/AppContext";
import { Post } from "../data/initialData";

export default function FeedPage() {
  const {
    currentUser,
    posts,
    createPost,
    toggleLikePost,
    addComment,
    events,
    toggleRSVP,
    openLightbox,
    showToast,
    setIsNewPostModalOpen,
    refreshLiveDatabaseData,
  } = useApp();

  React.useEffect(() => {
    refreshLiveDatabaseData();
  }, [refreshLiveDatabaseData]);

  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [composerText, setComposerText] = useState("");
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: boolean }>({
    "post-1": true,
    "post-2": true,
  });
  const [accessDeniedAlert, setAccessDeniedAlert] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("error") === "access_denied_admin_only";
    }
    return false;
  });

  useEffect(() => {
    if (accessDeniedAlert) {
      showToast("⚠️ Admin Console is restricted to Administrators only.", "info");
    }
  }, [accessDeniedAlert, showToast]);

  const filterTags = ["All", "Projects", "Career & Offers", "Hackathons & Tech", "Campus Life"];

  const filteredPosts =
    activeFilter === "All" ? posts : posts.filter((p) => p.tag === activeFilter);

  const handleInlinePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerText.trim()) return;
    createPost(composerText, "Projects");
    setComposerText("");
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;
    addComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const toggleCommentsExpansion = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleShare = (post: Post) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(`Link to ${post.authorName}'s post copied to clipboard! 📋`);
    } else {
      showToast("Post link shared!");
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-page-entry">
      {/* Main Feed Column */}
      <div className="col-span-1 lg:col-span-8 space-y-5 pb-20 md:pb-8">
        {/* Access Denied Notice if Student attempted to visit /admin */}
        {accessDeniedAlert && (
          <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 animate-shake">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl shrink-0">
                admin_panel_settings
              </span>
              <div>
                <strong>Administrator Access Restricted:</strong> Your current account is a Student account. The Admin Console requires Administrator credentials. You are currently viewing the <strong>Student Lounge</strong>.
              </div>
            </div>
            <button
              onClick={() => setAccessDeniedAlert(false)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-container via-primary to-[#001740] text-on-primary p-6 md:p-8 shadow-lg border border-secondary-container/20">
          <div className="absolute right-0 top-0 -mr-10 -mt-10 w-64 h-64 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-secondary-container bg-secondary-container/20 border border-secondary-container/30 px-3 py-0.5 rounded-full">
                {currentUser?.role === "ADMIN" ? "👑 Administrator Access" : "🎓 Software Engineering Senior"}
              </span>
              <span className="text-xs text-white/80 font-medium hidden sm:inline">
                • {currentUser?.track || "Class of 2026"}
              </span>
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-white">
              Welcome to Phoenix Lounge, {currentUser?.name || "Classmate"}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-primary-fixed mt-1.5 max-w-xl leading-relaxed">
              Share capstone milestones, technical triumphs, project updates, and senior highlights with your cohort peers.
            </p>
          </div>
        </div>

        {/* Quick Composer Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 ambient-shadow p-4 sm:p-5">
          <div className="flex gap-3.5">
            <Link href="/profile" className="shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 hover:scale-105 transition-transform shadow-xs relative">
                <SafeImage
                  src={currentUser?.avatar || "/phoenix-logo.png"}
                  alt={currentUser?.name || "Classmate"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <div className="flex-1">
              <textarea
                rows={2}
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                placeholder="Share a milestone, senior capstone update, code clip, or video demo..."
                className="w-full bg-surface-container-low border border-transparent focus:border-primary/30 rounded-xl p-3 text-xs sm:text-sm font-body text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 resize-none shadow-inner"
              />
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-outline-variant/20">
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewPostModalOpen(true)}
                    className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">image</span>
                    <span className="hidden sm:inline">Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewPostModalOpen(true)}
                    className="p-2 rounded-xl hover:bg-secondary-container/30 text-secondary transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">videocam</span>
                    <span className="hidden sm:inline">Video Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsNewPostModalOpen(true)}
                    className="p-2 rounded-xl hover:bg-primary/10 text-primary transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">celebration</span>
                    <span className="hidden sm:inline">Milestone</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleInlinePostSubmit}
                  disabled={!composerText.trim()}
                  className="px-5 py-2 bg-secondary-container text-on-secondary-container rounded-full font-headline font-bold text-xs shadow-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeFilter === tag
                ? "bg-primary text-on-primary shadow-sm scale-102 font-bold"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
            >
              {tag === "Projects" && "💻 "}
              {tag === "Career & Offers" && "🎉 "}
              {tag === "Hackathons & Tech" && "⚡️ "}
              {tag === "Campus Life" && "🎓 "}
              {tag}
            </button>
          ))}
        </div>

        {/* Feed Posts Stream */}
        <div className="space-y-5">
          {filteredPosts.map((post) => {
            const isCommentsOpen = !!expandedComments[post.id];
            const commentValue = commentInputs[post.id] || "";

            return (
              <article
                key={post.id}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 ambient-shadow card-hover overflow-hidden transition-all"
              >
                {/* Post Header */}
                <div className="p-5 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.authorId}`} className="shrink-0 group">
                      <div className="w-11 h-11 rounded-full overflow-hidden border border-outline-variant/30 group-hover:scale-105 transition-transform shadow-xs relative">
                        <SafeImage
                          src={post.authorAvatar}
                          alt={post.authorName}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/profile/${post.authorId}`}
                          className="font-headline font-bold text-sm text-primary hover:text-primary-container transition-colors"
                        >
                          {post.authorName}
                        </Link>
                        <span className="bg-gradient-to-r from-secondary-container to-primary-container text-on-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                          Phoenix &apos;26
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                        {post.timeAgo} • <span className="text-primary font-semibold">{post.authorTrack}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-secondary bg-secondary-container/30 border border-secondary/20 px-2.5 py-1 rounded-full">
                    {post.tag}
                  </span>
                </div>

                {/* Post Text Content */}
                <div className="px-5 pb-3 font-body text-xs sm:text-sm text-on-surface leading-relaxed">
                  <p>{post.content}</p>
                </div>

                {/* Post Attached Video */}
                {post.video && (
                  <div className="w-full bg-black overflow-hidden relative group">
                    <video
                      src={post.video}
                      controls
                      playsInline
                      preload="metadata"
                      className="w-full max-h-[460px] object-contain bg-black"
                    />
                  </div>
                )}

                {/* Post Attached Image */}
                {post.image && (
                  <div
                    onClick={() => openLightbox(post.image!)}
                    className="w-full h-72 sm:h-96 bg-surface-container overflow-hidden cursor-zoom-in relative group"
                  >
                    <img
                      src={post.image}
                      alt="Post media"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-3xl bg-black/50 p-2.5 rounded-full backdrop-blur-sm shadow-md">
                        zoom_in
                      </span>
                    </div>
                  </div>
                )}

                {/* Interactions Bar */}
                <div className="px-5 py-3 border-t border-b border-outline-variant/20 flex items-center justify-between text-on-surface-variant">
                  <div className="flex items-center gap-6">
                    {/* Like Button */}
                    <button
                      onClick={() => toggleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-90 cursor-pointer group ${post.isLiked ? "text-error font-bold" : "hover:text-error"
                        }`}
                    >
                      <span
                        className={`material-symbols-outlined text-xl group-hover:scale-125 transition-transform ${post.isLiked ? "text-error animate-heart-burst" : ""
                          }`}
                        style={{ fontVariationSettings: post.isLiked ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        favorite
                      </span>
                      <span>{post.likesCount}</span>
                    </button>

                    {/* Comment Toggle Button */}
                    <button
                      onClick={() => toggleCommentsExpansion(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold hover:text-primary transition-colors cursor-pointer group"
                    >
                      <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">
                        mode_comment
                      </span>
                      <span>{post.comments.length} Comments</span>
                    </button>
                  </div>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(post)}
                    className="flex items-center gap-1 text-xs font-semibold hover:text-primary transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-surface-container-low"
                  >
                    <span className="material-symbols-outlined text-lg">share</span>
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>

                {/* Expandable Comments Drawer */}
                {isCommentsOpen && (
                  <div className="p-5 pt-4 bg-surface-bright border-t border-outline-variant/10 space-y-3.5">
                    {/* Existing Comments List */}
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2.5">
                        <img
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          className="w-8 h-8 rounded-full object-cover border border-outline-variant/30 shrink-0 mt-0.5"
                        />
                        <div className="bg-surface-container-low p-3 rounded-2xl rounded-tl-none flex-1 border border-outline-variant/10">
                          <div className="flex items-baseline justify-between mb-1">
                            <span className="font-headline text-xs font-bold text-primary">
                              {comment.authorName}
                            </span>
                            <span className="text-[10px] text-outline">{comment.timeAgo}</span>
                          </div>
                          <p className="font-body text-xs text-on-surface leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Add Comment Input */}
                    <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2.5 pt-1">
                      <img
                        src={currentUser?.avatar || "/phoenix-logo.png"}
                        alt={currentUser?.name || "User"}
                        className="w-8 h-8 rounded-full object-cover border border-outline-variant/30 shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentValue}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        className="flex-1 bg-surface-container-low border border-outline-variant/20 focus:border-primary/40 rounded-full py-2 px-4 text-xs font-body outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!commentValue.trim()}
                        className="p-2 bg-secondary-container text-on-secondary-container rounded-full hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-xs"
                      >
                        <span className="material-symbols-outlined text-base">send</span>
                      </button>
                    </form>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* Right Column: Upcoming SE Events & Highlights (Desktop) */}
      <aside className="hidden lg:block lg:col-span-4 space-y-5 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar pb-8">
        {/* Digital Yearbook Vault Spotlight Card */}
        <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-3xl p-5 border border-secondary-container/30 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-7xl font-headline font-black text-white/5 pointer-events-none">
            &apos;26
          </div>
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🎓</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-container bg-secondary-container/20 px-2 py-0.5 rounded-full">
                Memory Vault
              </span>
            </div>
            <h3 className="font-headline font-bold text-base text-white">
              Class of 2026 Digital Yearbook
            </h3>
            <p className="text-xs text-primary-fixed leading-relaxed">
              Explore graduation photos, hackathons, and moments in a visual masonry gallery.
            </p>
            <Link
              href="/memories"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-xl font-headline font-bold text-xs shadow-md hover:brightness-95 active:scale-95 transition-all mt-1"
            >
              <span>Open Yearbook</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Upcoming SE Events Card */}
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/30 ambient-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">event</span>
              Senior Class Events
            </h3>
            <span className="text-[11px] font-bold text-secondary-container bg-primary-container px-2 py-0.5 rounded-full">
              Phoenix &apos;26
            </span>
          </div>

          <div className="space-y-3.5">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-3 rounded-2xl bg-surface-container-low/70 border border-outline-variant/20 hover:border-primary/30 transition-all flex flex-col gap-2 group"
              >
                <div className="flex gap-3">
                  <div className="bg-primary-container text-on-primary-container rounded-xl p-2 text-center w-12 h-12 flex-shrink-0 flex flex-col justify-center group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors">
                    <span className="font-headline text-[9px] uppercase font-bold tracking-wider leading-none">
                      {evt.month}
                    </span>
                    <span className="font-headline text-base font-bold leading-tight mt-0.5">
                      {evt.day}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline text-xs font-bold text-primary group-hover:text-primary-container transition-colors line-clamp-1">
                      {evt.title}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs text-outline">location_on</span>
                      <span className="truncate">{evt.location}</span>
                    </p>
                    <p className="text-[10px] text-outline mt-0.5">{evt.time}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
                  <span className="text-[10px] text-on-surface-variant line-clamp-1">{evt.description}</span>
                  <button
                    onClick={() => toggleRSVP(evt.id)}
                    className={`text-[11px] font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${evt.isRSVPed
                      ? "bg-secondary-container text-on-secondary-container shadow-xs"
                      : "bg-surface text-primary border border-primary/30 hover:bg-primary-fixed/30"
                      }`}
                  >
                    {evt.isRSVPed ? "✓ Going" : "RSVP"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}

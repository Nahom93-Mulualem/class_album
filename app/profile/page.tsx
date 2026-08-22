"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";

export default function CurrentUserProfilePage() {
  const {
    currentUser,
    setIsEditProfileModalOpen,
    gallery,
    yearbookSignatures,
    addYearbookSignature,
    openLightbox,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"about" | "gallery" | "yearbook">("about");
  const [newSignature, setNewSignature] = useState("");

  const handleAddSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSignature.trim()) return;
    addYearbookSignature(newSignature);
    setNewSignature("");
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-12 space-y-6">
      {/* Profile Header Card */}
      <section className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow border border-outline-variant/30 flex flex-col relative pb-6">
        {/* Cover Photo */}
        <div className="w-full h-48 sm:h-64 bg-surface-container-highest relative overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDL89L9PaJ9NEi-lfnwJ5qTDX1cbySDaTvCeYF9k33qDbkrFRk6m8EHpKOtBPCr3Jf48aRrjdnyEorml_ONa40iQTxiUHEpBbtdH4sl66eA649UZsBaA7lXP4D3z9w40oHosCwG_DAHI4VqiuYX7Fi7X7rTqqhKJPDPbqSIAVlAz22VBTEaG82CVcc2_pPGcSxy5hjDkeI6L1jEy1NpJkOECRZIiJGQ8yZm2f2A2VhveeoJYGenEuScWg"
            alt="Campus Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>

        {/* Profile Info Group */}
        <div className="px-6 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 md:-mt-20 relative z-10 gap-4">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 w-full md:w-auto">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-surface overflow-hidden bg-surface-container relative ambient-shadow shrink-0 shadow-lg">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Name & SE Specialization */}
            <div className="text-center md:text-left mb-1">
              <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary flex items-center justify-center md:justify-start gap-2">
                {currentUser.name}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-secondary-container to-primary-container text-on-primary shadow-sm">
                  SE &apos;26
                </span>
              </h1>
              <p className="font-body text-sm font-semibold text-secondary mt-0.5">
                {currentUser.degree}
              </p>
              <p className="font-body text-xs text-on-surface-variant font-medium mt-0.5">
                {currentUser.track} • Class of 2026 Senior
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 w-full md:w-auto justify-center md:justify-end mb-1">
            <button
              onClick={() => setIsEditProfileModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary font-headline text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit Profile
            </button>
            <Link
              href="/directory"
              className="px-5 py-2.5 rounded-xl border-2 border-primary-container text-primary font-headline text-xs font-bold hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">group</span>
              Directory
            </Link>
          </div>
        </div>

        {/* Status Announcement Banner */}
        <div className="px-6 md:px-8 mt-5">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-3.5 flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              campaign
            </span>
            <p className="font-body text-xs md:text-sm text-on-surface font-medium italic">
              &quot;{currentUser.statusQuote}&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Navigation (About & Details, Bento Gallery, Yearbook Wall) */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
        <button
          onClick={() => setActiveTab("about")}
          className={`px-5 py-2 rounded-xl font-headline text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "about"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">person</span>
          About & Tech Stack
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`px-5 py-2 rounded-xl font-headline text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "gallery"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">photo_library</span>
          SE Gallery & Projects ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab("yearbook")}
          className={`px-5 py-2 rounded-xl font-headline text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "yearbook"
              ? "bg-primary text-on-primary shadow-sm"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">auto_stories</span>
          Digital Yearbook Wall ({yearbookSignatures.length})
        </button>
      </div>

      {/* Tab 1: About & Tech Stack */}
      {activeTab === "about" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 ambient-shadow border border-outline-variant/30 space-y-5">
            <div>
              <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary">terminal</span>
                Senior Engineering Bio
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {currentUser.bio}
              </p>
            </div>

            <div className="border-t border-outline-variant/20 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline">Degree</span>
                  <p className="font-body text-xs font-bold text-on-surface">{currentUser.degree}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-lg">event</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline">Graduation Date</span>
                  <p className="font-body text-xs font-bold text-on-surface">May 22, 2026</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-lg">location_on</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline">Campus Dorm</span>
                  <p className="font-body text-xs font-bold text-on-surface">{currentUser.dorm}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-on-surface-variant">
                <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-lg">code</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline">GitHub</span>
                  <p className="font-body text-xs font-bold text-on-surface">@{currentUser.github}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Tech Focus Card */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 ambient-shadow border border-outline-variant/30 space-y-4">
            <h3 className="font-headline text-sm font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">memory</span>
              Tech Stack & Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentUser.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-primary-container/10 text-primary font-headline text-xs font-bold rounded-xl border border-primary-container/15"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="border-t border-outline-variant/20 pt-4">
              <h4 className="font-headline text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Senior Capstone
              </h4>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <p className="font-headline text-xs font-bold text-primary">Autonomous DevPulse Tooling</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  High-throughput distributed AI development runtime built with Rust & Next.js.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bento Media Gallery */}
      {activeTab === "gallery" && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow border border-outline-variant/30 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">photo_library</span>
              Software Engineering Photo Album
            </h3>
            <span className="text-xs text-on-surface-variant font-medium">Class of 2026 Moments</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px] md:auto-rows-[220px]">
            {gallery.map((item) => (
              <div
                key={item.id}
                onClick={() => openLightbox(item.image)}
                className={`rounded-2xl overflow-hidden relative group cursor-pointer border border-outline-variant/30 shadow-sm ${
                  item.aspect === "large" ? "col-span-2 row-span-2" : ""
                }`}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-container">
                    {item.category}
                  </span>
                  <p className="font-headline text-sm font-bold">{item.title}</p>
                </div>
                {item.hasVideo && (
                  <div className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5 backdrop-blur-sm text-white">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      play_arrow
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Digital Yearbook Wall */}
      {activeTab === "yearbook" && (
        <div className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow border border-outline-variant/30 space-y-6">
          <div>
            <h3 className="font-headline text-base font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">auto_stories</span>
              Senior Yearbook Signatures
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Messages and memories left by fellow Software Engineering Class of 2026 classmates.
            </p>
          </div>

          {/* Leave a Signature Form */}
          <form onSubmit={handleAddSignature} className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 space-y-2">
            <label className="block text-xs font-bold text-primary uppercase tracking-wider">
              ✍️ Leave a Senior Yearbook Note
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSignature}
                onChange={(e) => setNewSignature(e.target.value)}
                placeholder="Write a graduation memory or senior note..."
                className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2 text-xs font-body outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={!newSignature.trim()}
                className="px-5 py-2 bg-secondary-container text-on-secondary-container rounded-xl font-headline font-bold text-xs shadow-sm hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Sign Yearbook
              </button>
            </div>
          </form>

          {/* Signatures List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yearbookSignatures.map((sig) => (
              <div
                key={sig.id}
                className="p-4 rounded-xl bg-surface-bright border border-outline-variant/30 space-y-2.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={sig.authorAvatar}
                    alt={sig.authorName}
                    className="w-9 h-9 rounded-full object-cover border border-outline-variant/30"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline text-xs font-bold text-primary truncate">
                      {sig.authorName}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant">
                      {sig.authorTrack} • {sig.date}
                    </p>
                  </div>
                </div>
                <p className="font-body text-xs text-on-surface leading-relaxed italic bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
                  &quot;{sig.message}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

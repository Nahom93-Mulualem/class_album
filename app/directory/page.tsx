"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function DirectoryPage() {
  const router = useRouter();
  const { students, toggleConnect, startConversationWithStudent, refreshLiveDatabaseData } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12);

  // Fetch live database data on mount to ensure newly added cohort members are present
  React.useEffect(() => {
    refreshLiveDatabaseData();
  }, [refreshLiveDatabaseData]);

  const techTracks = [
    "All",
    "AI & Machine Learning",
    "Full-Stack & Cloud Architecture",
    "FinTech & Distributed Systems",
    "UI/UX Engineering & Design Systems",
    "Cybersecurity & Cryptography",
    "Cloud Infrastructure & DevOps",
    "Mobile & iOS Systems",
    "AI & Computer Vision",
    "Compilers & Systems Architecture",
    "Backend & Microservices",
  ];

  const filteredStudents = students.filter((student) => {
    if (!student) return false;
    const q = searchQuery.toLowerCase().trim();
    const name = (student.name || "").toLowerCase();
    const track = (student.track || "").toLowerCase();
    const dorm = (student.dorm || "").toLowerCase();
    const skills = Array.isArray(student.skills) ? student.skills : [];

    const matchesSearch =
      !q ||
      name.includes(q) ||
      track.includes(q) ||
      dorm.includes(q) ||
      skills.some((sk) => (sk || "").toLowerCase().includes(q));

    const matchesTrack =
      selectedTrack === "All" ||
      track.includes(selectedTrack.toLowerCase().split(" ")[0]);

    return matchesSearch && matchesTrack;
  });

  const displayedStudents = filteredStudents.slice(0, visibleCount);

  const handleMessageStudent = (studentId: string) => {
    startConversationWithStudent(studentId);
    router.push(`/messages?user=${studentId}`);
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-12 animate-page-entry">
      {/* Header Banner */}
      <div className="mb-8 bg-surface-container-lowest border border-outline-variant/30 ambient-shadow rounded-3xl p-6 md:p-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-secondary-container bg-primary-container px-3 py-0.5 rounded-full uppercase tracking-wider">
              Phoenix • Class of 2026
            </span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-primary">Class Directory</h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Browse and connect with senior cohort members across specialized engineering tracks.
          </p>
        </div>
      </div>

      {/* Search & Track Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Input Bar */}
        <div className="relative max-w-xl">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-xl">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classmates by name, tech skill (Rust, PyTorch, React), or track..."
            className="w-full pl-11 pr-14 py-3 bg-surface-container-lowest border border-outline-variant/30 focus:border-primary/40 rounded-2xl text-xs sm:text-sm font-body text-on-surface shadow-xs outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary text-xs font-bold p-1 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Specialization / Tech Track Pills */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">filter_list</span>
            Track:
          </span>
          {techTracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTrack === track
                  ? "bg-secondary-container text-on-secondary-container font-bold shadow-xs scale-102"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high border border-outline-variant/20"
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Students Bento Grid */}
      {displayedStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedStudents.map((student) => (
            <div
              key={student.id}
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 ambient-shadow card-hover flex flex-col items-center text-center relative group"
            >
              {/* Online Indicator */}
              {student.online && (
                <div
                  className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                  title="Active on campus"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </div>
              )}

              {/* Avatar with Class Gradient Badge */}
              <Link href={`/profile/${student.id}`} className="relative mb-4 block group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface shadow-md group-hover:scale-105 transition-transform">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {/* Name & SE Specialization */}
              <Link href={`/profile/${student.id}`} className="group-hover:text-primary transition-colors">
                <h3 className="font-headline text-base font-bold text-primary leading-snug">
                  {student.name}
                </h3>
              </Link>
              <p className="font-body text-xs font-semibold text-secondary mt-0.5">
                B.S. Software Engineering
              </p>
              <p className="font-body text-xs text-on-surface-variant font-medium mt-1 line-clamp-1">
                {student.track}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-3 mb-5 max-h-14 overflow-hidden">
                {(student.skills || []).slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary-container/10 text-primary font-body text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border border-primary-container/15"
                  >
                    {skill}
                  </span>
                ))}
                {(student.skills || []).length > 3 && (
                  <span className="text-[10px] text-on-surface-variant font-medium self-center">
                    +{(student.skills || []).length - 3}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-auto pt-3 border-t border-outline-variant/15 flex gap-2">
                <button
                  onClick={() => handleMessageStudent(student.id)}
                  className="flex-1 bg-surface border-2 border-primary text-primary font-headline text-xs font-bold py-2 rounded-xl hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">chat_bubble</span>
                  Message
                </button>
                <button
                  onClick={() => toggleConnect(student.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-headline font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    student.connected
                      ? "bg-secondary-container text-on-secondary-container shadow-xs"
                      : "border border-outline-variant/40 text-on-surface hover:bg-surface-container-high"
                  }`}
                  title={student.connected ? "Connected" : "Connect with classmate"}
                >
                  <span className="material-symbols-outlined text-base">
                    {student.connected ? "check" : "person_add"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">person_search</span>
          <h3 className="font-headline font-bold text-base text-primary">No Classmates Found</h3>
          <p className="text-xs text-on-surface-variant mt-1">
            We couldn&apos;t find anyone matching &quot;{searchQuery}&quot; in the {selectedTrack} track.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTrack("All");
            }}
            className="mt-4 px-4 py-2 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full hover:brightness-95 transition-all cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Load More Pagination Button */}
      {visibleCount < filteredStudents.length && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="bg-surface-container-high text-primary font-headline text-xs font-bold py-3 px-8 rounded-full hover:bg-surface-container-highest transition-colors shadow-xs cursor-pointer"
          >
            Load More Classmates ({filteredStudents.length - visibleCount} remaining)
          </button>
          <button
            onClick={() => setVisibleCount(filteredStudents.length)}
            className="bg-primary-container text-on-primary-container font-headline text-xs font-bold py-3 px-6 rounded-full hover:brightness-105 transition-all shadow-xs cursor-pointer"
          >
            Show All ({filteredStudents.length})
          </button>
        </div>
      )}
    </main>
  );
}

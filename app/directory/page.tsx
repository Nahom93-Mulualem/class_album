"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function DirectoryPage() {
  const router = useRouter();
  const { students, toggleConnect, startConversationWithStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("All");
  const [visibleCount, setVisibleCount] = useState(12);

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
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase())) ||
      student.dorm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTrack =
      selectedTrack === "All" || student.track.toLowerCase().includes(selectedTrack.toLowerCase().split(" ")[0]);

    return matchesSearch && matchesTrack;
  });

  const displayedStudents = filteredStudents.slice(0, visibleCount);

  const handleMessageStudent = (studentId: string) => {
    startConversationWithStudent(studentId);
    router.push(`/messages?user=${studentId}`);
  };

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 md:pb-12">
      {/* Header & Stats Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant/30 ambient-shadow rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-secondary-container bg-primary-container px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Phoenix • Class of 2026
            </span>
            <span className="text-xs font-semibold text-on-surface-variant">Software Engineering Roster</span>
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary">Class Directory</h1>
          <p className="font-body text-xs md:text-sm text-on-surface-variant mt-1">
            Connect with your 50 fellow Software Engineering graduates, discover their tech stacks, and start collaborating.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 self-start md:self-auto">
          <div className="text-center px-3 border-r border-outline-variant/30">
            <span className="block font-headline text-xl font-bold text-primary">{students.length}</span>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Classmates</span>
          </div>
          <div className="text-center px-3 border-r border-outline-variant/30">
            <span className="block font-headline text-xl font-bold text-secondary">2026</span>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">Grad Year</span>
          </div>
          <div className="text-center px-3">
            <span className="block font-headline text-xl font-bold text-primary-container">100%</span>
            <span className="text-[10px] text-on-surface-variant uppercase font-bold">SE Cohort</span>
          </div>
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
            className="w-full pl-11 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 focus:border-primary/40 rounded-2xl text-sm font-body text-on-surface shadow-sm outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Specialization / Tech Track Pills */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap mr-1">
            Tech Focus:
          </span>
          {techTracks.map((track) => (
            <button
              key={track}
              onClick={() => setSelectedTrack(track)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTrack === track
                  ? "bg-secondary-container text-on-secondary-container font-bold shadow-sm scale-105"
                  : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
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
              className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 ambient-shadow card-hover flex flex-col items-center text-center relative group"
            >
              {/* Online Indicator */}
              {student.online && (
                <div
                  className="absolute top-4 right-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"
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
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-secondary-container to-primary-container px-3 py-0.5 rounded-full border-2 border-surface shadow-sm">
                  <span className="font-headline text-[10px] text-on-primary font-bold tracking-wider">
                    SE &apos;26
                  </span>
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
                {student.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="bg-primary-container/10 text-primary font-body text-[11px] font-medium px-2.5 py-0.5 rounded-lg border border-primary-container/10"
                  >
                    {skill}
                  </span>
                ))}
                {student.skills.length > 3 && (
                  <span className="text-[10px] text-on-surface-variant font-medium self-center">
                    +{student.skills.length - 3}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="w-full mt-auto pt-3 border-t border-outline-variant/15 flex gap-2">
                <button
                  onClick={() => handleMessageStudent(student.id)}
                  className="flex-1 bg-surface border-2 border-primary text-primary font-headline text-xs font-bold py-2 rounded-xl hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">chat_bubble</span>
                  Message
                </button>
                <Link
                  href={`/profile/${student.id}`}
                  className="px-3 bg-surface-container-low hover:bg-surface-container-high text-on-surface font-headline text-xs font-bold py-2 rounded-xl transition-colors flex items-center justify-center"
                  title="View full profile"
                >
                  <span className="material-symbols-outlined text-base">visibility</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center max-w-lg mx-auto">
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
            className="mt-4 px-4 py-2 bg-secondary-container text-on-secondary-container text-xs font-bold rounded-full hover:brightness-95 transition-all"
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
            className="bg-surface-container-high text-primary font-headline text-xs font-bold py-3 px-8 rounded-full hover:bg-surface-container-highest transition-colors shadow-sm cursor-pointer"
          >
            Load More Classmates ({filteredStudents.length - visibleCount} remaining)
          </button>
          <button
            onClick={() => setVisibleCount(filteredStudents.length)}
            className="bg-primary-container text-on-primary-container font-headline text-xs font-bold py-3 px-6 rounded-full hover:brightness-105 transition-all shadow-sm cursor-pointer"
          >
            Show All ({filteredStudents.length})
          </button>
        </div>
      )}
    </main>
  );
}

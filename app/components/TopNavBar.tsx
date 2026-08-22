"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function TopNavBar() {
  const router = useRouter();
  const { currentUser, students, notifications, markNotificationAsRead, markAllNotificationsRead } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Filter students based on search query
  const filteredStudents = searchQuery.trim()
    ? students
        .filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.track.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.skills.some((sk) => sk.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 5)
    : [];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav border-b border-outline-variant/30 shadow-sm backdrop-blur-xl">
      <div className="flex justify-between items-center px-4 md:px-8 h-16 w-full max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-container text-secondary-container flex items-center justify-center font-headline font-bold text-base shadow-sm group-hover:scale-105 transition-transform border border-secondary-container/20">
              🔥
            </div>
            <div>
              <span className="font-headline text-lg md:text-xl font-bold text-primary tracking-tight group-hover:text-primary-container transition-colors">
                Phoenix
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-primary-fixed text-primary rounded-full">
                Batch &apos;26
              </span>
            </div>
          </Link>
        </div>

        {/* Global Live Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors text-xl">
              search
            </span>
            <input
              type="text"
              placeholder="Search SE classmates, skills (Rust, AI, React)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-transparent focus:border-primary/40 focus:bg-surface-container-lowest rounded-full text-sm font-body text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 shadow-inner"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchOpen && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl p-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                Software Engineering Classmates ({filteredStudents.length})
              </div>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/profile/${student.id}`}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg transition-colors group"
                  >
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-8 h-8 rounded-full object-cover border border-outline-variant/30"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-primary group-hover:text-primary-container truncate">
                          {student.name}
                        </span>
                        <span className="text-[10px] bg-secondary-container/30 text-secondary font-bold px-1.5 py-0.2 rounded">
                          &apos;26
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">{student.track}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-on-surface-variant">
                  No classmate matching &quot;{searchQuery}&quot; found.
                </div>
              )}
              <div className="border-t border-outline-variant/20 mt-1 pt-1">
                <Link
                  href="/directory"
                  onClick={() => setIsSearchOpen(false)}
                  className="block text-center py-1.5 text-xs font-bold text-primary hover:underline"
                >
                  View All in Directory →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions (Notifications, Profile) */}
        <div className="flex items-center gap-3">
          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 text-primary hover:bg-surface-container-high rounded-full transition-colors active:scale-95 flex items-center justify-center"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-2xl">notifications</span>
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-2">
                  <h4 className="font-headline font-bold text-sm text-primary">Notifications</h4>
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs font-semibold text-secondary hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationAsRead(notif.id)}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-start gap-3 ${
                        notif.read ? "bg-surface hover:bg-surface-container-low" : "bg-primary-fixed/20 hover:bg-primary-fixed/30"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 text-sm font-bold">
                        {notif.type === "message" && "💬"}
                        {notif.type === "like" && "❤️"}
                        {notif.type === "event" && "📅"}
                        {notif.type === "connect" && "🤝"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-primary line-clamp-1">{notif.title}</p>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">{notif.description}</p>
                        <span className="text-[10px] text-outline mt-1 block">{notif.time}</span>
                      </div>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5"></span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/30 transition-all"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-surface-container-high shrink-0 shadow-sm">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl p-2 z-50">
                <div className="px-3 py-2 border-b border-outline-variant/20 mb-1">
                  <p className="font-headline font-bold text-sm text-primary">{currentUser.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{currentUser.track}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-secondary-container to-primary-container text-on-primary rounded-full">
                    Phoenix &apos;26
                  </span>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">person</span>
                  My Profile
                </Link>
                <Link
                  href="/directory"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">group</span>
                  SE Class Directory
                </Link>
                <Link
                  href="/messages"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low rounded-xl transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">chat_bubble</span>
                  Direct Messages
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

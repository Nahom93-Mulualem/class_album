"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, updateCurrentUser, showToast, refreshAuthSession } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick Switcher Drawer state
  const [quickSwitchUsers, setQuickSwitchUsers] = useState<any[]>([]);
  const [quickSearch, setQuickSearch] = useState("");
  const [quickRoleTab, setQuickRoleTab] = useState<"ALL" | "ADMIN" | "STUDENT">("ALL");

  useEffect(() => {
    // Fetch user directory for the quick switcher
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.users) {
          setQuickSwitchUsers(data.users);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        showToast(`🔥 Welcome back, ${data.user.name}!`);
        await refreshAuthSession();
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "Login failed. Please check credentials.");
      }
    } catch {
      setError("Network error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetUsername: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: targetUsername }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        showToast(`⚡ Switched to ${data.user.name} (${data.user.role})!`);
        await refreshAuthSession();
        if (data.user.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } else {
        setError(data.error || "Failed to switch account.");
      }
    } catch {
      setError("Network error during quick switch.");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuickUsers = quickSwitchUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(quickSearch.toLowerCase()) ||
      u.track.toLowerCase().includes(quickSearch.toLowerCase());

    const matchesRole = quickRoleTab === "ALL" || u.role === quickRoleTab;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Login Card */}
        <div className="col-span-1 lg:col-span-6 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-secondary-container flex items-center justify-center font-headline font-bold text-2xl shadow-md border border-secondary-container/20">
                🔥
              </div>
              <div>
                <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">
                  Phoenix Sign In
                </h1>
                <p className="text-xs text-on-surface-variant font-medium">
                  Software Engineering Class of 2026
                </p>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant pt-2">
              Sign in with your cohort credentials to access the digital lounge, class directory, and yearbook.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-start gap-2.5 animate-shake">
              <span className="material-symbols-outlined text-error text-lg shrink-0 mt-0.5">
                error
              </span>
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-on-surface block mb-1.5">
                Username or University Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
                  account_circle
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or alex.chen"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-body text-on-surface focus:border-primary outline-none transition-colors shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-on-surface">Password</label>
                <span className="text-[11px] text-outline">Default: Student@2026! / Admin@2026!</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">
                  lock
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-body text-on-surface focus:border-primary outline-none transition-colors shadow-inner"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-secondary-container rounded-xl font-headline font-bold text-xs md:text-sm shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Authenticating with PostgreSQL...</span>
              ) : (
                <>
                  <span>Sign In to Phoenix</span>
                  <span className="material-symbols-outlined text-base">login</span>
                </>
              )}
            </button>
          </form>

          {/* Helper Credentials Callout */}
          <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline-variant/20 space-y-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-sm">info</span>
              <span className="text-[11px] font-bold text-on-surface">Sample Test Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant font-mono">
              <div
                onClick={() => {
                  setUsername("admin");
                  setPassword("Admin@2026!");
                }}
                className="p-2 rounded-lg bg-surface hover:bg-surface-container-highest cursor-pointer transition-colors border border-outline-variant/20"
              >
                <strong className="text-primary block font-sans">👑 Admin Account:</strong>
                username: admin<br />
                pass: Admin@2026!
              </div>

              <div
                onClick={() => {
                  setUsername("alex.chen");
                  setPassword("Student@2026!");
                }}
                className="p-2 rounded-lg bg-surface hover:bg-surface-container-highest cursor-pointer transition-colors border border-outline-variant/20"
              >
                <strong className="text-primary block font-sans">🎓 Student Account:</strong>
                username: alex.chen<br />
                pass: Student@2026!
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Interactive Account Switcher */}
        <div className="col-span-1 lg:col-span-6 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface flex items-center gap-2">
                <span>⚡ 1-Click Quick Login</span>
              </h2>
              <p className="text-xs text-on-surface-variant">
                Instantly test any of the 50 students or admin accounts
              </p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/40 text-on-secondary-container text-[10px] font-extrabold">
              {quickSwitchUsers.length} Cohort Accounts
            </span>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base">
                search
              </span>
              <input
                type="text"
                placeholder="Search classmate name or skill..."
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface-container-low text-xs text-on-surface outline-none border border-transparent focus:border-primary/40"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-[11px] font-bold">
              {(["ALL", "ADMIN", "STUDENT"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setQuickRoleTab(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    quickRoleTab === tab
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable list of 50 students + admin */}
          <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {filteredQuickUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => handleQuickLogin(u.username)}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                  u.isActive
                    ? "bg-surface hover:bg-surface-container-high border-outline-variant/20 hover:border-primary/40 hover:scale-101"
                    : "bg-rose-500/5 border-rose-500/20 opacity-75"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-full object-cover border border-outline-variant/30 shrink-0"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        u.isActive ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    ></span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">
                        {u.name}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                          u.role === "ADMIN"
                            ? "bg-fuchsia-500/20 text-fuchsia-700"
                            : "bg-sky-500/20 text-sky-700"
                        }`}
                      >
                        {u.role}
                      </span>
                      {!u.isActive && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-700">
                          Deactivated
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-on-surface-variant truncate">{u.track}</p>
                  </div>
                </div>

                <button className="px-3 py-1 bg-secondary-container/40 group-hover:bg-secondary-container text-on-secondary-container font-bold text-[11px] rounded-lg transition-colors shrink-0">
                  Login →
                </button>
              </div>
            ))}

            {filteredQuickUsers.length === 0 && (
              <div className="p-6 text-center text-xs text-on-surface-variant">
                No cohort members found matching &quot;{quickSearch}&quot;.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

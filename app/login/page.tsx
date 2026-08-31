"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast, refreshAuthSession } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both your username and password.");
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

      const getDestination = (role: string) => {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          if (redirect && redirect.startsWith("/") && redirect !== "/") {
            if (role === "ADMIN") return redirect;
            if (!redirect.startsWith("/admin")) return redirect;
          }
        }
        return role === "ADMIN" ? "/admin" : "/feed";
      };

      if (res.ok && data.user) {
        await refreshAuthSession();
        router.push(getDestination(data.user.role));
      } else {
        setError(data.error || "Login failed. Please verify your cohort credentials.");
      }
    } catch {
      setError("A network error occurred. Please verify your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
      {/* Background Ambient Aura */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow"></div>
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow"></div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Graduation Memory & Phoenix Batch Showcase (Desktop & Tablet) */}
        <section className="lg:col-span-7 flex flex-col justify-center space-y-6 md:space-y-8 py-4">
          {/* Official Badge & Logo */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden shadow-2xl border-2 border-secondary-container/60 p-1 bg-black/40 shrink-0 animate-float">
              <img
                src="/phoenix-logo.png"
                alt="Phoenix Batch 2026 Crest"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/20 border border-secondary-container/40 text-secondary text-xs font-headline font-bold uppercase tracking-wider mb-1">
                <span>🎓</span>
                <span>Phoenix Batch • 2020 – 2026</span>
              </div>
              <h2 className="font-headline text-xl sm:text-2xl font-extrabold text-primary tracking-tight">
                Software Engineering
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                Digital Memory Vault & Lounge
              </p>
            </div>
          </div>

          {/* Inspirational Commencement Headline */}
          <div className="space-y-3">
            <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight leading-tight">
              Celebrating <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">six Years</span> of Innovation, Friendship & Milestones.
            </h1>
            <p className="font-body text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-2xl">
              From our first lines of code in freshman labs to senior capstones, late-night hackathons, and graduation commencement. Welcome home to our private cohort platform.
            </p>
          </div>


          {/* Graduation Memory Quote Highlight */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-fixed/30 to-secondary-container/20 border border-outline-variant/30 flex items-start gap-3.5">
            <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5">
              format_quote
            </span>
            <div className="space-y-1">
              <p className="font-body text-xs sm:text-sm text-on-surface italic leading-relaxed">
                &quot;The debugging sessions, hackathon triumphs, and friendships we built will stay with us forever. Here&apos;s to the software engineers of tomorrow!&quot;
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-primary">
                <span>— Phoenix Class of 2026 Yearbook Committee</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Modern Glassmorphic Login Form */}
        <section className="lg:col-span-5 w-full">
          <div className="w-full bg-surface-container-lowest/90 border border-outline-variant/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden backdrop-blur-xl transition-all">
            {/* Subtle Top Glow Line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-secondary-container to-primary"></div>

            {/* Form Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h2 className="font-headline text-xl sm:text-2xl font-bold text-primary tracking-tight">
                  Sign In to Phoenix
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                  2020 – 2026
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Enter your Software Engineering cohort credentials to enter the digital lounge, directory, and memory vault.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/30 text-on-error-container text-xs flex items-start gap-2.5 animate-shake">
                <span className="material-symbols-outlined text-error text-lg shrink-0 mt-0.5">
                  error
                </span>
                <div className="leading-relaxed font-medium">{error}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Username or Email</span>
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-lg transition-colors">
                    account_circle
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. alex.chen or admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-outline-variant/50 text-xs sm:text-sm font-body text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface">Password</label>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary text-lg transition-colors">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-surface border border-outline-variant/50 text-xs sm:text-sm font-body text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    autoComplete="current-password"
                  />
                  {/* Password Visibility Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg leading-none">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-primary via-primary-container to-primary text-on-primary rounded-xl font-headline font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Authenticating Cohort Session...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Phoenix Lounge</span>
                    <span className="material-symbols-outlined text-base">login</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </section>
      </div>
    </main>
  );
}

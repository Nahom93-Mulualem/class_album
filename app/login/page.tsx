"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function LoginPage() {
  const router = useRouter();
  const { showToast, refreshAuthSession } = useApp();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      const getDestination = (role: string) => {
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get("redirect");
          if (redirect && redirect.startsWith("/")) {
            if (role === "ADMIN") return redirect;
            if (!redirect.startsWith("/admin")) return redirect;
          }
        }
        return role === "ADMIN" ? "/admin" : "/";
      };

      if (res.ok && data.user) {
        showToast(`🔥 Welcome back, ${data.user.name}!`);
        await refreshAuthSession();
        router.push(getDestination(data.user.role));
      } else {
        setError(data.error || "Login failed. Please check credentials.");
      }
    } catch {
      setError("Network error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-md mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <div className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-lg border border-secondary-container/40 p-0.5 bg-black/40 shrink-0">
              <img
                src="/phoenix-logo.png"
                alt="Phoenix Batch 2026 Official Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">
                Phoenix Sign In
              </h1>
              <p className="text-xs text-on-surface-variant font-medium">
                Software Engineering Class of 2020 - 2026
              </p>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant pt-1 leading-relaxed">
            Sign in with your cohort credentials to access the digital lounge, class directory, and yearbook vault.
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
              Username or Email
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
              <span className="inline-block w-4 h-4 border-2 border-secondary-container border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In to Phoenix</span>
                <span className="material-symbols-outlined text-base">login</span>
              </>
            )}
          </button>
        </form>


      </div>
    </div>
  );
}

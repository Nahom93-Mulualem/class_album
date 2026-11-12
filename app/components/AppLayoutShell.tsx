"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import TopNavBar from "./TopNavBar";
import SideNavBar from "./SideNavBar";
import MobileBottomNav from "./MobileBottomNav";
import NewPostModal from "./NewPostModal";
import EditProfileModal from "./EditProfileModal";
import AccountCredentialsModal from "./AccountCredentialsModal";
import ImageLightboxModal from "./ImageLightboxModal";
import NewMemoryModal from "./NewMemoryModal";
import MemoryDetailModal from "./MemoryDetailModal";
import ToastContainer from "./ToastContainer";

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isAuthLoading, theme, toggleTheme, isThemeMounted } = useApp();

  // Detect public auth entry pages immediately (handles null/empty during hydration)
  const isLoginPage = !pathname || pathname === "/login" || pathname === "/" || pathname.startsWith("/login");

  // Strict client-side authentication guard: only protect non-login internal routes
  useEffect(() => {
    if (!isAuthLoading && !currentUser && !isLoginPage) {
      const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${redirectParam}`);
    }
  }, [isAuthLoading, currentUser, isLoginPage, pathname, router]);

  // If on login page, ALWAYS render the login page immediately without waiting for auth loaders
  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background text-on-background relative overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container transition-colors duration-300">
        {/* Floating Theme Switcher on Login Page */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-3 rounded-2xl bg-surface/80 hover:bg-surface border border-outline-variant/30 text-on-surface shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center backdrop-blur-md group"
            title={
              isThemeMounted
                ? `Switch to ${theme === "light" ? "Midnight Obsidian (Dark)" : "Sunlight Warm (Light)"} mode`
                : "Switch theme mode"
            }
          >
            <span className="material-symbols-outlined text-xl text-amber-500 dark:text-indigo-300 transition-transform group-hover:rotate-45">
              {!isThemeMounted ? "light_mode" : theme === "light" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>

        {/* Login Page Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {children}
        </div>

        {/* Minimal Graduation Commemorative Footer */}
        <footer className="py-4 px-4 text-center text-xs text-on-surface-variant/70 border-t border-outline-variant/15 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 font-body">
          <span className="font-semibold text-primary">Phoenix • Software Engineering Class of 2026</span>
          <span className="hidden sm:inline text-outline-variant">•</span>
          <span>Official Digital Lounge & Yearbook Vault</span>
          <span className="hidden sm:inline text-outline-variant">•</span>
          <span className="text-[11px] text-on-surface-variant/60">Class of 2020 – 2026</span>
        </footer>

        <ToastContainer />
      </div>
    );
  }

  // If loading auth state or not authenticated on protected routes, show refined branded loader
  // NEVER render protected layout or class feed to unauthenticated users!
  if (isAuthLoading || !currentUser) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-on-background p-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none -top-20 -right-20"></div>
        <div className="absolute w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none -bottom-20 -left-20"></div>

        <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
          {/* Logo with pulsing glow */}
          <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-2xl border-2 border-secondary/40 p-1 bg-black/40 animate-float mb-6 relative">
            <img
              src="/phoenix-logo.png"
              alt="Phoenix Class Crest"
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-0 rounded-2xl ring-2 ring-secondary/30 pointer-events-none"></div>
          </div>

          <div className="flex items-center justify-center gap-2.5 text-primary font-headline font-bold text-base tracking-tight mb-2">
            <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>{isAuthLoading ? "Verifying Phoenix Session..." : "Redirecting to Sign In..."}</span>
          </div>

          <p className="text-xs text-on-surface-variant font-medium">
            Software Engineering Senior Cohort 2020 – 2026
          </p>
        </div>
      </div>
    );
  }

  // Authenticated App Shell layout (Dashboard, Directory, Memories, etc.)
  return (
    <>
      {/* Top Shared Navbar */}
      <TopNavBar />

      {/* Main App Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto pt-16 flex min-w-0">
        {/* Desktop Side Navigation */}
        <SideNavBar />

        {/* Page Content Container */}
        <div className="flex-1 md:ml-64 min-w-0 max-w-full min-h-[calc(100vh-64px)] flex flex-col overflow-x-clip">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals & Notifications */}
      <NewPostModal />
      <EditProfileModal />
      <AccountCredentialsModal />
      <NewMemoryModal />
      <MemoryDetailModal />
      <ImageLightboxModal />
      <ToastContainer />
    </>
  );
}

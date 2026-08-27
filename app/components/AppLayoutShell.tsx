"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import TopNavBar from "./TopNavBar";
import SideNavBar from "./SideNavBar";
import MobileBottomNav from "./MobileBottomNav";
import NewPostModal from "./NewPostModal";
import EditProfileModal from "./EditProfileModal";
import ImageLightboxModal from "./ImageLightboxModal";
import NewMemoryModal from "./NewMemoryModal";
import MemoryDetailModal from "./MemoryDetailModal";
import ToastContainer from "./ToastContainer";

export default function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthLoading, theme, toggleTheme } = useApp();

  const isLoginPage = pathname === "/login";

  // If on login page, render clean, distraction-free authentication layout
  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-background text-on-background relative overflow-x-hidden selection:bg-secondary-container selection:text-on-secondary-container">
        {/* Floating Theme Switcher on Login Page */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-full bg-surface-container-high/80 backdrop-blur-md border border-outline-variant/30 text-on-surface shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
          >
            <span className="material-symbols-outlined text-lg text-amber-500 dark:text-indigo-300">
              {theme === "light" ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </div>

        {/* Login Page Content */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-8">
          {children}
        </div>

        {/* Minimal Footer */}
        <footer className="py-4 text-center text-xs text-on-surface-variant/70 border-t border-outline-variant/10">
          Phoenix • Software Engineering Class of 2026 • Official Digital Yearbook & Lounge
        </footer>

        <ToastContainer />
      </div>
    );
  }

  // If loading auth state on protected routes, show subtle branded loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-on-background">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border border-secondary-container/40 p-1 bg-black/40 animate-pulse mb-4">
          <img
            src="/phoenix-logo.png"
            alt="Phoenix Class Crest"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 text-primary font-headline font-bold text-sm tracking-tight">
          <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>Loading Phoenix Session...</span>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">Software Engineering Batch of 2026</p>
      </div>
    );
  }

  // Authenticated App Shell layout (Dashboard, Directory, Memories, etc.)
  return (
    <>
      {/* Top Shared Navbar */}
      <TopNavBar />

      {/* Main App Layout Container */}
      <div className="flex-1 w-full max-w-7xl mx-auto pt-16 flex">
        {/* Desktop Side Navigation */}
        <SideNavBar />

        {/* Page Content Container */}
        <div className="flex-1 md:ml-64 w-full min-h-[calc(100vh-64px)] flex flex-col">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Global Modals & Notifications */}
      <NewPostModal />
      <EditProfileModal />
      <NewMemoryModal />
      <MemoryDetailModal />
      <ImageLightboxModal />
      <ToastContainer />
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function SideNavBar() {
  const pathname = usePathname();
  const { conversations, currentUser, logoutUser } = useApp();

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const isAdmin = currentUser?.role === "ADMIN";

  const navItems = [
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin Dashboard",
            icon: "admin_panel_settings",
            isActive: pathname.startsWith("/admin"),
            isAdminSpecial: true,
          },
        ]
      : []),
    {
      href: "/feed",
      label: isAdmin ? "Student Lounge (Feed)" : "Class Feed",
      icon: "dynamic_feed",
      isActive: pathname === "/" || pathname === "/feed",
    },
    {
      href: "/memories",
      label: "Memory Vault",
      icon: "auto_awesome",
      badge: "Yearbook",
      isSpecial: true,
      isActive: pathname.startsWith("/memories"),
    },
    {
      href: "/messages",
      label: "Messages",
      icon: "chat_bubble",
      badge: totalUnreadMessages > 0 ? `${totalUnreadMessages}` : undefined,
      isActive: pathname.startsWith("/messages"),
    },
    {
      href: "/directory",
      label: "Class Directory",
      icon: "group",
      isActive: pathname.startsWith("/directory"),
    },
    {
      href: "/profile",
      label: "My Profile",
      icon: "person",
      isActive: pathname === "/profile",
    },
  ];

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface border-r border-outline-variant/30 p-3 space-y-2 z-40 overflow-y-auto hide-scrollbar transition-colors duration-300">
      {/* Lounge Badge with Official Crest */}
      <div className="flex items-center gap-3 p-2 mb-1">
        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md border border-secondary/50 shrink-0 p-0.5 bg-black/40">
          <img
            src="/phoenix-logo.png"
            alt="Phoenix Logo"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <div>
          <h2 className="font-headline text-sm font-bold text-primary leading-tight">Phoenix Lounge</h2>
          <p className="text-[11px] text-on-surface-variant font-medium">Class of 2020 – 2026</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-1 flex-1 pt-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
              item.isActive
                ? item.isAdminSpecial
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md translate-x-1"
                  : "bg-secondary-container text-on-secondary-container font-bold shadow-sm translate-x-1"
                : item.isAdminSpecial
                ? "text-violet-700 dark:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 font-bold hover:translate-x-1"
                : item.isSpecial
                ? "text-primary hover:bg-surface-container-high font-semibold hover:translate-x-1"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary hover:translate-x-1"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-xl"
                style={{ fontVariationSettings: item.isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="font-body text-xs sm:text-sm">{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  item.isSpecial
                    ? item.isActive
                      ? "bg-primary text-on-primary"
                      : "bg-secondary-container text-on-secondary-container"
                    : "bg-error text-on-error"
                }`}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Sign Out & Phoenix Batch Tagline */}
      <div className="px-2 py-3 mt-auto border-t border-outline-variant/20 space-y-2">
        <button
          onClick={logoutUser}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-base">logout</span>
          <span>Sign Out</span>
        </button>
        <div className="text-center">
          <p className="text-[11px] font-bold text-primary">Phoenix • Class of 2026</p>
          <p className="text-[10px] text-on-surface-variant">Software Engineering Vault</p>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function SideNavBar() {
  const pathname = usePathname();
  const { setIsNewPostModalOpen, conversations } = useApp();

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const navItems = [
    {
      href: "/",
      label: "Feed",
      icon: "dynamic_feed",
      isActive: pathname === "/",
    },
    {
      href: "/messages",
      label: "Messages",
      icon: "chat_bubble",
      badge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
      isActive: pathname.startsWith("/messages"),
    },
    {
      href: "/directory",
      label: "Directory",
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
    <aside className="hidden md:flex flex-col fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface border-r border-outline-variant/30 p-4 space-y-3 z-40 overflow-y-auto hide-scrollbar">
      {/* Lounge Badge */}
      <div className="flex items-center gap-3 p-2 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container text-secondary-container flex items-center justify-center font-headline font-bold text-lg shadow-sm border border-secondary-container/20">
          🔥
        </div>
        <div>
          <h2 className="font-headline text-base font-bold text-primary leading-tight">Phoenix Lounge</h2>
          <p className="font-body text-xs text-on-surface-variant font-medium">Batch of 2026</p>
        </div>
      </div>

      {/* New Post Action */}
      <button
        onClick={() => setIsNewPostModalOpen(true)}
        className="w-full py-3 px-4 bg-secondary-container text-on-secondary-container rounded-xl font-headline font-bold text-sm shadow-sm hover:brightness-95 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span className="material-symbols-outlined text-lg">add_circle</span>
        <span>New Post</span>
      </button>

      {/* Navigation Items */}
      <nav className="space-y-1.5 flex-1 pt-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
              item.isActive
                ? "bg-secondary-container text-on-secondary-container font-bold shadow-sm translate-x-1"
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
              <span className="font-body text-sm">{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className="px-2 py-0.5 text-[10px] font-bold bg-error text-on-error rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Phoenix Batch Tagline */}
      <div className="px-2 py-3 text-center mt-auto border-t border-outline-variant/20">
        <p className="text-[11px] font-semibold text-primary">Phoenix • Class of 2026</p>
        <p className="text-[10px] text-outline">Software Engineering Alumni</p>
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { conversations, currentUser, isMobileChatOpen } = useApp();

  // If user is inside an active mobile 1-on-1 chat, hide the bottom bar completely
  // so the message composer has full unobstructed visibility above keyboards and safe areas!
  if (pathname.startsWith("/messages") && isMobileChatOpen) {
    return null;
  }

  const totalUnreadMessages = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const isAdmin = currentUser?.role === "ADMIN";

  const navItems = [
    ...(isAdmin
      ? [
          {
            href: "/admin",
            label: "Admin",
            icon: "admin_panel_settings",
            isActive: pathname.startsWith("/admin"),
          },
        ]
      : []),
    {
      href: "/feed",
      label: "Feed",
      icon: "dynamic_feed",
      isActive: pathname === "/" || pathname === "/feed",
    },
    {
      href: "/memories",
      label: "Vault",
      icon: "auto_awesome",
      isActive: pathname.startsWith("/memories"),
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
      label: "Profile",
      icon: "person",
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full glass-nav border-t border-outline-variant/30 z-50 px-1 py-1 shadow-lg transition-colors duration-300">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl transition-all relative ${
              item.isActive ? "text-primary font-bold" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <div
              className={`px-3 py-0.5 rounded-full transition-all ${
                item.isActive ? "bg-secondary-container/40 text-primary shadow-xs" : "bg-transparent"
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: item.isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
            </div>
            <span className="text-[10px] mt-0.5 font-body font-medium">{item.label}</span>
            {item.badge !== undefined && (
              <span className="absolute top-0 right-3 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

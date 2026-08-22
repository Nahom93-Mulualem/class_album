"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { conversations } = useApp();

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
      label: "Profile",
      icon: "person",
      isActive: pathname === "/profile",
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full glass-nav border-t border-outline-variant/30 z-50 px-2 py-1 shadow-lg">
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
                item.isActive ? "bg-primary-fixed" : "bg-transparent"
              }`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: item.isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
            </div>
            <span className="text-[10px] mt-0.5 font-body">{item.label}</span>
            {item.badge !== undefined && (
              <span className="absolute top-0 right-4 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

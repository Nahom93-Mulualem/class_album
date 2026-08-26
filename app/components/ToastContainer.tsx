"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export default function ToastContainer() {
  const { toast } = useApp();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "heart":
        return "❤️";
      case "success":
        return "✨";
      case "copy":
        return "📋";
      case "event":
        return "🎟️";
      default:
        return "🔥";
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 animate-toast">
      <div className="bg-primary text-on-primary px-4 py-3 rounded-2xl shadow-2xl border border-primary-fixed/20 flex items-center gap-3 backdrop-blur-xl max-w-sm">
        <span className="text-base shrink-0">{getIcon()}</span>
        <span className="text-xs font-semibold font-body tracking-wide leading-tight">
          {toast.message}
        </span>
      </div>
    </div>
  );
}

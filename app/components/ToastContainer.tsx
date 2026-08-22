"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export default function ToastContainer() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 animate-bounce">
      <div className="bg-primary text-on-primary px-4 py-3 rounded-2xl shadow-xl border border-primary-fixed/20 flex items-center gap-3 backdrop-blur-md">
        <span className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-pulse"></span>
        <span className="text-xs font-semibold font-body tracking-wide">{toastMessage}</span>
      </div>
    </div>
  );
}

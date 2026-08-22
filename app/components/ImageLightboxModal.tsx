"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export default function ImageLightboxModal() {
  const { lightboxImage, closeLightbox } = useApp();

  if (!lightboxImage) return null;

  return (
    <div
      onClick={closeLightbox}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md transition-all cursor-zoom-out"
    >
      <button
        onClick={closeLightbox}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        aria-label="Close image preview"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl bg-black/40 border border-white/10"
      >
        <img
          src={lightboxImage}
          alt="Enlarged view"
          className="w-full h-full object-contain max-h-[85vh]"
        />
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useApp } from "../context/AppContext";

export default function ImageLightboxModal() {
  const { lightboxMedia, closeLightbox, showToast } = useApp();
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleClose = useCallback(() => {
    setZoomLevel(1);
    closeLightbox();
  }, [closeLightbox]);

  useEffect(() => {
    if (!lightboxMedia) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxMedia, handleClose]);

  if (!lightboxMedia) return null;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(lightboxMedia.url);
      showToast("Media link copied to clipboard! 📋", "copy");
    }
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => (prev === 1 ? 1.5 : 1));
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-modal-entry transition-all cursor-zoom-out"
    >
      {/* Top Action Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl flex items-center justify-between py-3 px-4 text-white z-20 cursor-default"
      >
        <div className="flex items-center gap-2 max-w-md truncate">
          <span className="w-2 h-2 rounded-full bg-secondary-container animate-pulse"></span>
          <span className="text-sm font-headline font-bold truncate">
            {lightboxMedia.title || "Phoenix Digital Yearbook Preview"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lightboxMedia.type !== "video" && (
            <button
              onClick={handleZoom}
              className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
              title={zoomLevel === 1 ? "Zoom in" : "Reset zoom"}
            >
              <span className="material-symbols-outlined text-xl">
                {zoomLevel === 1 ? "zoom_in" : "zoom_out"}
              </span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            title="Copy media URL"
          >
            <span className="material-symbols-outlined text-xl">link</span>
          </button>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/35 text-white transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            title="Close (Esc)"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
      </div>

      {/* Main Media Stage */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-5xl max-h-[82vh] w-full flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-black/50 border border-white/10 relative cursor-default"
      >
        {lightboxMedia.type === "video" ? (
          <video
            src={lightboxMedia.url}
            controls
            autoPlay
            playsInline
            className="w-full max-h-[80vh] object-contain"
          />
        ) : (
          <div className="overflow-auto max-h-[80vh] w-full flex items-center justify-center">
            <img
              src={lightboxMedia.url}
              alt={lightboxMedia.title || "Enlarged preview"}
              style={{ transform: `scale(${zoomLevel})` }}
              className="w-full h-full object-contain max-h-[80vh] transition-transform duration-200 cursor-zoom-in"
              onClick={() => setZoomLevel((prev) => (prev === 1 ? 1.6 : 1))}
            />
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <p className="text-white/60 text-xs mt-3 select-none">
        Press <kbd className="px-1.5 py-0.5 bg-white/20 rounded text-[10px]">Esc</kbd> or click outside to close
      </p>
    </div>
  );
}

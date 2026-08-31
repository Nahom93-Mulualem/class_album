"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import { MemoryCategory } from "../data/initialData";

const CATEGORIES: MemoryCategory[] = [
  "Graduation",
  "Campus Life",
  "Class Events",
  "Friends",
  "Trips",
  "Funny Moments",
  "Throwbacks",
  "Other",
];

export default function NewMemoryModal() {
  const { isNewMemoryModalOpen, setIsNewMemoryModalOpen, addMemory, currentUser, students, showToast } =
    useApp();

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("Graduation");
  const [year, setYear] = useState<"2026" | "2025" | "2024" | "2023" | "2022" | "2021" | "2020">("2026");
  const [date, setDate] = useState("May 2026");
  const [location, setLocation] = useState("Main Campus Quad");

  // Uploaded media state (can be photo only, video only, or both)
  const [uploadedImage, setUploadedImage] = useState<string>("");
  const [uploadedImageName, setUploadedImageName] = useState<string>("");
  const [uploadedVideo, setUploadedVideo] = useState<string>("");
  const [uploadedVideoName, setUploadedVideoName] = useState<string>("");

  const [aspect, setAspect] = useState<"tall" | "wide" | "square" | "featured">("featured");
  const [taggedStudentIds, setTaggedStudentIds] = useState<string[]>([]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!isNewMemoryModalOpen) return null;

  // Handle direct file upload for images
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (PNG, JPG, WebP, GIF)", "info");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
      setUploadedImageName(file.name);
      showToast(`Photo "${file.name}" loaded successfully! 📸`, "success");
    };
    reader.readAsDataURL(file);
  };

  // Handle direct file upload for videos
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      showToast("Please upload a video file (MP4, WebM, MOV)", "info");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedVideo(reader.result as string);
      setUploadedVideoName(file.name);
      showToast(`Video "${file.name}" loaded successfully! 🎥`, "success");
    };
    reader.readAsDataURL(file);
  };

  const toggleTaggedStudent = (id: string) => {
    setTaggedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const hasMedia = Boolean(uploadedImage || uploadedVideo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !story.trim()) {
      showToast("Please provide a title and memory story!", "info");
      return;
    }

    if (!hasMedia) {
      showToast("Please upload at least a picture or a video!", "info");
      return;
    }

    const taggedClassmates = students
      .filter((s) => taggedStudentIds.includes(s.id))
      .map((s) => ({ id: s.id, name: s.name, avatar: s.avatar }));

    addMemory({
      title: title.trim(),
      story: story.trim(),
      category,
      year,
      date: date.trim() || `${year} Semester`,
      location: location.trim() || "University Campus",
      image: uploadedImage || "",
      video: uploadedVideo || undefined,
      aspect,
      authorId: currentUser?.id || "student-guest",
      authorName: currentUser?.name || "Phoenix Classmate",
      authorAvatar: currentUser?.avatar || "/phoenix-logo.png",
      taggedClassmates,
    });

    // Reset Form
    setTitle("");
    setStory("");
    setCategory("Graduation");
    setYear("2026");
    setDate("May 2026");
    setLocation("Main Campus Quad");
    setUploadedImage("");
    setUploadedImageName("");
    setUploadedVideo("");
    setUploadedVideoName("");
    setTaggedStudentIds([]);
    setIsNewMemoryModalOpen(false);
  };

  return (
    <div
      onClick={() => setIsNewMemoryModalOpen(false)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-2xl p-6 md:p-8 animate-modal-entry my-8 max-h-[90vh] overflow-y-auto hide-scrollbar"
      >
        {/* Header with Phoenix Badge */}
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md shrink-0 border border-secondary-container/30">
              <img
                src="/phoenix-logo.png"
                alt="Phoenix Badge"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg md:text-xl text-primary">
                Add to Digital Yearbook
              </h2>
              <p className="text-xs text-on-surface-variant">
                Upload your photo, video, or both to keep memories in the 2020–2026 Vault
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewMemoryModalOpen(false)}
            className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5 mt-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold font-headline text-primary mb-1.5 uppercase tracking-wider">
              Memory Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Capstone Live Demo, 3 AM Algorithm Marathon, Spring Retreat..."
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl text-sm font-body text-on-surface outline-none transition-all"
            />
          </div>

          {/* Category & Academic Year (2020 - 2026) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-headline text-primary mb-1.5 uppercase tracking-wider">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl text-sm font-body text-on-surface outline-none transition-all cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-headline text-primary mb-1.5 uppercase tracking-wider">
                Cohort Year (2020 - 2026) *
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value as typeof year)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl text-sm font-body text-on-surface outline-none transition-all cursor-pointer"
              >
                <option value="2026">2026 (Senior Year - Graduation 🎓)</option>
                <option value="2025">2025 </option>
                <option value="2024">2024 </option>
                <option value="2023">2023 </option>
                <option value="2022">2022 </option>
                <option value="2021">2021 </option>
                <option value="2020">2020 (Freshman Year - Meles Campus ✨)</option>
              </select>
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-headline text-primary mb-1.5 uppercase tracking-wider">
                Date Display
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. May 14, 2026 or Fall 2020"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl text-sm font-body text-on-surface outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold font-headline text-primary mb-1.5 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Main Campus Quad, Tech Lab 3"
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl text-sm font-body text-on-surface outline-none transition-all"
              />
            </div>
          </div>

          {/* Media Uploads: Upload Picture, Upload Video, or Both */}
          <div className="space-y-3.5 bg-surface-container-low/70 p-4.5 rounded-2xl border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-headline text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-base">cloud_upload</span>
                Media Attachment (Photo, Video, or Both) *
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium">
                {uploadedImage && uploadedVideo
                  ? "📸 Photo & 🎥 Video Attached"
                  : uploadedImage
                    ? "📸 Photo Attached"
                    : uploadedVideo
                      ? "🎥 Video Attached"
                      : "Upload photo, video, or both"}
              </span>
            </div>

            {/* 1. Photo Upload Dropzone */}
            <div>
              <label className="block text-[11px] font-bold font-headline text-on-surface-variant mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-secondary">image</span>
                Picture {uploadedVideo && !uploadedImage ? "(Optional)" : ""}
              </label>
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="relative rounded-2xl overflow-hidden border border-outline-variant/40 bg-black/40 h-44 group">
                  <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-primary rounded-xl text-xs font-bold shadow-md hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Change Picture
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedImage("");
                        setUploadedImageName("");
                      }}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-black/70 text-white text-[10px] rounded-md backdrop-blur-sm truncate max-w-[200px]">
                    📷 {uploadedImageName || "Photo uploaded"}
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  className="border-2 border-dashed border-outline-variant/50 hover:border-primary rounded-2xl p-4 text-center cursor-pointer transition-colors bg-surface-container-lowest/60 hover:bg-surface-container-lowest group"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-xl">add_a_photo</span>
                  </div>
                  <p className="text-xs font-bold text-primary">Click to select photo from device</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    PNG, JPG, JPEG, WEBP, GIF
                  </p>
                </div>
              )}
            </div>

            {/* 2. Video Upload Dropzone */}
            <div>
              <label className="block text-[11px] font-bold font-headline text-on-surface-variant mb-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-secondary">movie</span>
                Video Clip {uploadedImage && !uploadedVideo ? "(Optional)" : ""}
              </label>
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />

              {uploadedVideo ? (
                <div className="relative rounded-2xl overflow-hidden border border-outline-variant/40 bg-black p-3 flex flex-col gap-2">
                  <div className="w-full max-h-40 rounded-xl overflow-hidden bg-black/60 flex items-center justify-center">
                    <video
                      src={uploadedVideo}
                      controls
                      playsInline
                      className="max-h-36 w-auto rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-white text-xs truncate max-w-[250px]">
                      <span className="material-symbols-outlined text-secondary-container text-sm">videocam</span>
                      <span className="truncate">{uploadedVideoName || "Video attached"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => videoInputRef.current?.click()}
                        className="px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Replace
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedVideo("");
                          setUploadedVideoName("");
                        }}
                        className="px-2.5 py-1 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="border-2 border-dashed border-outline-variant/50 hover:border-secondary rounded-2xl p-4 text-center cursor-pointer transition-colors bg-surface-container-lowest/60 hover:bg-surface-container-lowest group"
                  >
                    <div className="w-9 h-9 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">videocam</span>
                    </div>
                    <p className="text-xs font-bold text-secondary">Click to upload video clip from device</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      MP4, WebM, MOV video files
                    </p>
                  </div>

                  {/* Preset Video Clips (Limited to exactly 2) */}
                  <div className="pt-1">
                    <p className="text-[10px] font-bold text-on-surface-variant mb-1">Or choose sample video clip:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "AI Drone Demo 🛸", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
                        { label: "Autonomous Navigation 🤖", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
                      ].map((sample) => (
                        <button
                          key={sample.label}
                          type="button"
                          onClick={() => {
                            setUploadedVideo(sample.url);
                            setUploadedVideoName(sample.label);
                            showToast(`Selected "${sample.label}"! 🎥`, "success");
                          }}
                          className="px-2.5 py-1 bg-surface-container hover:bg-secondary-container hover:text-on-secondary-container border border-outline-variant/30 text-on-surface rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                        >
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Story Narrative */}
          <div>
            <label className="block text-xs font-bold font-headline text-primary mb-1.5 uppercase tracking-wider">
              Story & Memory Note *
            </label>
            <textarea
              required
              rows={3}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Write what happened, memorable quotes, funny bugs, or what made this moment special..."
              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/30 focus:border-primary rounded-xl text-sm font-body text-on-surface outline-none transition-all resize-none"
            />
          </div>

          {/* Tag Classmates */}
          <div>
            <label className="block text-xs font-bold font-headline text-primary mb-1.5 uppercase tracking-wider">
              Tag Classmates
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-surface-container-low rounded-2xl border border-outline-variant/20 hide-scrollbar">
              {students.map((student) => {
                const isSelected = taggedStudentIds.includes(student.id);
                return (
                  <button
                    type="button"
                    key={student.id}
                    onClick={() => toggleTaggedStudent(student.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${isSelected
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/50"
                      }`}
                  >
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{student.name}</span>
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsNewMemoryModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !story.trim() || !hasMedia}
              className="px-6 py-2.5 bg-gradient-to-r from-secondary-container to-secondary-fixed text-on-secondary-container font-headline font-bold text-xs rounded-xl shadow-md hover:brightness-95 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">save</span>
              Save to Yearbook Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

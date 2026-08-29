"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";
import confetti from "canvas-confetti";

export default function NewPostModal() {
  const { isNewPostModalOpen, setIsNewPostModalOpen, currentUser, createPost } = useApp();
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState<"Career & Offers" | "Campus Life" | "Hackathons & Tech" | "Projects">(
    "Projects"
  );
  
  // Media Attachment State
  const [mediaType, setMediaType] = useState<"none" | "image" | "video">("none");
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [customImageUrl, setCustomImageUrl] = useState<string>("");
  const [selectedVideo, setSelectedVideo] = useState<string>("");
  const [customVideoUrl, setCustomVideoUrl] = useState<string>("");

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  if (!isNewPostModalOpen) return null;

  const sampleImages = [
    {
      label: "Hackathon & Code",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqevVO5_wHxhoQDc4KRJHtQwo3DPY1n-8I7xivRIAY-oVmzxZruRcIb3djwnzfBLgNk1jJsW-BdyWVzREJ6Mq4BVhnp1XyYvB5a5fMAHRzcSgPBeDummr6XPPXuRiIDESfaRfvQOrg87-nP2QbJd7AhuxsCiPZIiho8b2jmNCBVClqxoudmn4nH0Q0GNt0ED5H8yBNdCkFIrOkB-TMrCoUEAVXwQqIeBen-2Vb_1klmV01mZOP8H0U_A",
    },
    {
      label: "Celebration",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgcOuqBJPMpAwZ7k8OfkIjFTwhRdHQX8O959hDa99ZHSZlk9xLaGKl0D1tGwRvvINb9QeMHrRrughUkT_-LTY913UKn4ZXkmkIfuultPcc6nPJs4o3I4QGgTZmfRMjp8j-nAbCnBs-Si-1UzqZhzs5bNZ9A0td6JQSNYlhCf372mVjgeijXka6P82gAw4aLSnks0lZu7OStMuMVg5xajitMnalvMePKl7qySNfG2QeuesrK83GXQNvCA",
    },
    {
      label: "Coffee & Architecture",
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVKSi5KNEGsCkJ978c4-ItkyffXdqLQkoV9YtsZtAMwuAZn0LrFoFjc2pCWQM6dMeixLe30ykUPrz7j2XJ0AuSVE6TpQC_cf6JbwivOFctHZOhCw9LkZky8LUqCZPVaBkb7uvIY8zVMJB5Aympx1AvHKbAC7wXwWPq8zH3TpWS6G2eI4lS9d9tSosBXAZKsxFuuPVYWf_3lM20LgCkBWOCzq_0BPpoYRytLaeznmqYKUnn9bGc-d9_QA",
    },
  ];

  const sampleVideos = [
    {
      label: "Capstone AI Drone Demo",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    },
    {
      label: "Autonomous Navigation Test",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      label: "Campus Hackathon Walkthrough",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    },
  ];

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setSelectedImage(reader.result);
          setCustomImageUrl("");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedVideo(url);
      setCustomVideoUrl("");
    }
  };

  const activeImageToUse = selectedImage || customImageUrl.trim() || undefined;
  const activeVideoToUse = selectedVideo || customVideoUrl.trim() || undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost(
      content,
      selectedTag,
      mediaType === "image" ? activeImageToUse : undefined,
      mediaType === "video" ? activeVideoToUse : undefined
    );

    // Fire celebration confetti if posting a Career or Project milestone!
    if (selectedTag === "Career & Offers" || selectedTag === "Projects") {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore if not supported
      }
    }

    setContent("");
    setSelectedImage("");
    setCustomImageUrl("");
    setSelectedVideo("");
    setCustomVideoUrl("");
    setMediaType("none");
  };

  const clearMedia = () => {
    setMediaType("none");
    setSelectedImage("");
    setCustomImageUrl("");
    setSelectedVideo("");
    setCustomVideoUrl("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest">
          <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">edit_note</span>
            Create Post • Phoenix Lounge
          </h3>
          <button
            onClick={() => setIsNewPostModalOpen(false)}
            className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.avatar || "/phoenix-logo.png"}
              alt={currentUser?.name || "User"}
              className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shadow-sm"
            />
            <div>
              <p className="font-headline font-bold text-sm text-primary">{currentUser?.name || "Phoenix Classmate"}</p>
              <p className="text-xs text-on-surface-variant">{currentUser?.track || "Software Engineering"} • Phoenix &apos;26</p>
            </div>
          </div>

          {/* Category Tag Pills */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Topic Tag
            </label>
            <div className="flex flex-wrap gap-2">
              {(["Projects", "Career & Offers", "Hackathons & Tech", "Campus Life"] as const).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    selectedTag === tag
                      ? "bg-secondary-container text-on-secondary-container shadow-sm scale-105"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {tag === "Career & Offers" && "🎉 "}
                  {tag === "Projects" && "💻 "}
                  {tag === "Hackathons & Tech" && "⚡️ "}
                  {tag === "Campus Life" && "🎓 "}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Post Text Area */}
          <div>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening in your SE journey? Share an internship offer, capstone progress, tech win, or meetup idea..."
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/40 rounded-xl p-3.5 text-sm font-body text-on-surface outline-none transition-all placeholder:text-on-surface-variant/70 resize-none"
              autoFocus
            />
          </div>

          {/* PHOTO ATTACHMENT SECTION */}
          {mediaType === "image" && (
            <div className="space-y-3 p-3.5 bg-surface-container-low rounded-xl border border-outline-variant/20 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">image</span>
                  Attach Photo
                </span>
                <button
                  type="button"
                  onClick={clearMedia}
                  className="text-[11px] text-error font-semibold hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Upload from file button */}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={imageFileInputRef}
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-surface-container-highest hover:bg-primary/10 text-primary border border-outline-variant/30 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">upload_file</span>
                  Upload from Device
                </button>
              </div>

              {/* Preset Image Options */}
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1.5">
                  Or select preset photo:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {sampleImages.map((img) => (
                    <div
                      key={img.url}
                      onClick={() => {
                        setSelectedImage(img.url);
                        setCustomImageUrl("");
                      }}
                      className={`relative rounded-lg overflow-hidden h-16 cursor-pointer border-2 transition-all ${
                        selectedImage === img.url ? "border-secondary scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate text-center">
                        {img.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Image URL */}
              <div>
                <input
                  type="url"
                  placeholder="Or paste an image URL (https://...)"
                  value={customImageUrl}
                  onChange={(e) => {
                    setCustomImageUrl(e.target.value);
                    setSelectedImage("");
                  }}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary font-body"
                />
              </div>

              {/* Live Image Preview */}
              {activeImageToUse && (
                <div className="relative rounded-xl overflow-hidden max-h-48 border border-outline-variant/30 shadow-inner bg-black/10">
                  <img src={activeImageToUse} alt="Preview" className="w-full h-44 object-cover" />
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-md">
                    Photo Preview
                  </span>
                </div>
              )}
            </div>
          )}

          {/* VIDEO ATTACHMENT SECTION */}
          {mediaType === "video" && (
            <div className="space-y-3 p-3.5 bg-surface-container-low rounded-xl border border-secondary/30 animate-fadeIn">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-secondary">videocam</span>
                  Attach Video (MP4, WebM, MOV)
                </span>
                <button
                  type="button"
                  onClick={clearMedia}
                  className="text-[11px] text-error font-semibold hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>

              {/* Upload from file button */}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={videoFileInputRef}
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => videoFileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-secondary-container text-on-secondary-container hover:brightness-95 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">video_file</span>
                  Upload Video from Device
                </button>
              </div>

              {/* Preset Video Options */}
              <div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block mb-1.5">
                  Or select preset tech demo video:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {sampleVideos.map((vid) => (
                    <button
                      key={vid.url}
                      type="button"
                      onClick={() => {
                        setSelectedVideo(vid.url);
                        setCustomVideoUrl("");
                      }}
                      className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                        selectedVideo === vid.url
                          ? "bg-secondary-container/40 border-secondary text-primary font-bold shadow-sm"
                          : "bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="material-symbols-outlined text-sm text-secondary">play_circle</span>
                        <span className="truncate text-[11px]">{vid.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Video URL */}
              <div>
                <input
                  type="url"
                  placeholder="Or paste a video URL (e.g. https://.../video.mp4)"
                  value={customVideoUrl}
                  onChange={(e) => {
                    setCustomVideoUrl(e.target.value);
                    setSelectedVideo("");
                  }}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-secondary font-body"
                />
              </div>

              {/* Live Video Preview Player */}
              {activeVideoToUse && (
                <div className="relative rounded-xl overflow-hidden border border-secondary/40 shadow-md bg-black">
                  <video
                    src={activeVideoToUse}
                    controls
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-secondary-container text-[10px] font-bold rounded-md flex items-center gap-1 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                    Video Attached
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Bar within Form */}
          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/20">
            <div className="flex items-center gap-2">
              {/* Photo Toggle */}
              <button
                type="button"
                onClick={() => setMediaType(mediaType === "image" ? "none" : "image")}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mediaType === "image"
                    ? "bg-primary-container text-on-primary-container font-bold"
                    : "text-primary hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-lg">image</span>
                <span>Photo</span>
              </button>

              {/* Video Toggle */}
              <button
                type="button"
                onClick={() => setMediaType(mediaType === "video" ? "none" : "video")}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  mediaType === "video"
                    ? "bg-secondary-container text-on-secondary-container font-bold"
                    : "text-secondary hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined text-lg">videocam</span>
                <span>Video</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-6 py-2 bg-secondary-container text-on-secondary-container rounded-full font-headline font-bold text-xs shadow-sm hover:brightness-95 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider cursor-pointer"
            >
              Post to Lounge
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

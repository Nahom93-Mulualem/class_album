"use client";

import React, { useState, useRef } from "react";
import { useApp } from "../context/AppContext";

export default function EditProfileModal() {
  const { isEditProfileModalOpen, setIsEditProfileModalOpen, currentUser, updateCurrentUser } = useApp();

  const [name, setName] = useState(currentUser?.name || "");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "");
  const [coverImage, setCoverImage] = useState(
    currentUser?.coverImage ||
      (typeof window !== "undefined" && currentUser
        ? localStorage.getItem(`phoenix_cover_${currentUser.id}`) || ""
        : "") ||
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&q=80"
  );
  const [track, setTrack] = useState(currentUser?.track || "");
  const [statusQuote, setStatusQuote] = useState(currentUser?.statusQuote || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  const [dorm, setDorm] = useState(currentUser?.dorm || "");
  const [skillsStr, setSkillsStr] = useState(currentUser?.skills ? currentUser.skills.join(", ") : "");
  const [github, setGithub] = useState(currentUser?.github || "");
  const [linkedin, setLinkedin] = useState(currentUser?.linkedin || "");

  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isEditProfileModalOpen || !currentUser) return null;

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCoverImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    await updateCurrentUser({
      name,
      avatar,
      coverImage,
      track,
      statusQuote,
      bio,
      dorm,
      skills,
      github,
      linkedin,
    });
    setIsSaving(false);
    setIsEditProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20">
          <h3 className="font-headline font-bold text-base text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">manage_accounts</span>
            Edit Software Engineering Profile
          </h3>
          <button
            onClick={() => setIsEditProfileModalOpen(false)}
            className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-4 text-left">
          {/* Profile Picture & Background Photos Section */}
          <div className="p-4 bg-surface-container-low border border-outline-variant/30 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-primary uppercase tracking-wider block">
              Profile Photos & Banner
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Profile Picture (Avatar) */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-surface shadow-md bg-surface-container shrink-0 relative group">
                    <img src={avatar} alt="Profile Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={avatarInputRef}
                      onChange={handleAvatarFile}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 bg-surface border border-outline-variant/50 hover:bg-surface-container-high text-xs font-bold rounded-xl text-primary flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                      <span>Change Photo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Background Banner */}
              <div>
                <label className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Background Banner
                </label>
                <div className="space-y-1.5">
                  <div className="w-full h-16 rounded-xl overflow-hidden border border-outline-variant/30 relative">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={handleCoverFile}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full py-1.5 bg-surface border border-outline-variant/50 hover:bg-surface-container-high text-xs font-bold rounded-xl text-primary flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">wallpaper</span>
                    <span>Change Background</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm text-on-surface outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Tech Track / Specialization
              </label>
              <input
                type="text"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
                placeholder="e.g. Full-Stack & AI Systems"
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm text-on-surface outline-none focus:border-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Status Quote / Announcement
            </label>
            <input
              type="text"
              value={statusQuote}
              onChange={(e) => setStatusQuote(e.target.value)}
              placeholder="e.g. Senior Capstone team locked in! 🚀"
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm text-on-surface outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              About / Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 text-sm text-on-surface outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Campus Dorm / Location
              </label>
              <input
                type="text"
                value={dorm}
                onChange={(e) => setDorm(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                Tech Stack / Skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="TypeScript, Next.js, Rust, Docker"
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                GitHub Username
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="alexchen-26"
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                LinkedIn Username
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="alexchen-se26"
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2 text-sm text-on-surface outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(false)}
              className="px-5 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-primary-container text-on-primary rounded-xl font-headline font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
              <span>{isSaving ? "Saving..." : "Save Profile Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

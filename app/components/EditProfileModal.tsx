"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function EditProfileModal() {
  const { isEditProfileModalOpen, setIsEditProfileModalOpen, currentUser, updateCurrentUser } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [track, setTrack] = useState(currentUser.track);
  const [statusQuote, setStatusQuote] = useState(currentUser.statusQuote);
  const [bio, setBio] = useState(currentUser.bio);
  const [dorm, setDorm] = useState(currentUser.dorm);
  const [skillsStr, setSkillsStr] = useState(currentUser.skills.join(", "));
  const [github, setGithub] = useState(currentUser.github || "");
  const [linkedin, setLinkedin] = useState(currentUser.linkedin || "");

  if (!isEditProfileModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    updateCurrentUser({
      name,
      track,
      statusQuote,
      bio,
      dorm,
      skills,
      github,
      linkedin,
    });
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
              className="px-6 py-2 bg-primary-container text-on-primary rounded-xl font-headline font-bold text-xs shadow-sm hover:opacity-90 transition-all cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

export default function AccountCredentialsModal() {
  const {
    isChangePasswordModalOpen,
    setIsChangePasswordModalOpen,
    credentialsModalTab,
    currentUser,
    updateCurrentUser,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"username" | "password" | "both">("password");

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isChangePasswordModalOpen && currentUser) {
      if (credentialsModalTab) {
        setActiveTab(credentialsModalTab);
      }
      setCurrentPassword("");
      setNewUsername(currentUser.username || "");
      setNewPassword("");
      setConfirmPassword("");
      setErrorMsg("");
    }
  }, [isChangePasswordModalOpen, credentialsModalTab, currentUser]);

  if (!isChangePasswordModalOpen || !currentUser) return null;

  const handleClose = () => {
    setCurrentPassword("");
    setNewUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setIsChangePasswordModalOpen(false);
  };

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!currentPassword) {
      setErrorMsg("Please enter your current password to verify your identity.");
      return;
    }

    const isUpdatingUsername = activeTab === "username" || activeTab === "both";
    const isUpdatingPassword = activeTab === "password" || activeTab === "both";

    if (isUpdatingUsername) {
      const trimmedUser = newUsername.trim().toLowerCase();
      if (!trimmedUser || trimmedUser.length < 4 || trimmedUser.length > 12) {
        setErrorMsg("Username must be between 4 and 12 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9._-]+$/.test(trimmedUser)) {
        setErrorMsg("Username may only contain letters, numbers, dots (.), underscores (_), and hyphens (-).");
        return;
      }
    }

    if (isUpdatingPassword) {
      if (newPassword.length < 6) {
        setErrorMsg("New password must be at least 6 characters long.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("New password and confirmation do not match.");
        return;
      }
      if (currentPassword === newPassword) {
        setErrorMsg("New password cannot be identical to your current password.");
        return;
      }
    }

    setIsLoading(true);

    try {
      let endpoint = "/api/auth/change-credentials";
      const payload: Record<string, string> = { currentPassword };

      if (isUpdatingUsername) {
        payload.newUsername = newUsername.trim().toLowerCase();
      }
      if (isUpdatingPassword) {
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update account credentials.");
        setIsLoading(false);
        return;
      }

      // Update local state if username changed
      if (data.username) {
        await updateCurrentUser({ username: data.username });
      }

      showToast(data.message || "Credentials updated successfully! 🔐", "success");
      handleClose();
    } catch {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-modal-entry">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant/20 bg-surface-container-low/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-secondary-container/20 text-secondary border border-secondary-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">manage_accounts</span>
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm text-primary">Account Credentials</h3>
              <p className="text-[11px] text-on-surface-variant font-medium">
                Manage your Phoenix login username and password
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-on-surface-variant hover:bg-surface-container-high p-1.5 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-outline-variant/20 bg-surface-container-low/20 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab("username");
              setErrorMsg("");
            }}
            className={`pb-2.5 px-3 font-headline text-xs font-bold transition-all cursor-pointer relative flex items-center gap-1.5 ${
              activeTab === "username" ? "text-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-sm">badge</span>
            <span>Username</span>
            {activeTab === "username" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("password");
              setErrorMsg("");
            }}
            className={`pb-2.5 px-3 font-headline text-xs font-bold transition-all cursor-pointer relative flex items-center gap-1.5 ${
              activeTab === "password" ? "text-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-sm">lock_reset</span>
            <span>Password</span>
            {activeTab === "password" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("both");
              setErrorMsg("");
            }}
            className={`pb-2.5 px-3 font-headline text-xs font-bold transition-all cursor-pointer relative flex items-center gap-1.5 ${
              activeTab === "both" ? "text-primary" : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>Update Both</span>
            {activeTab === "both" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"></span>
            )}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Current Username Info Badge */}
          <div className="px-3.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs">
            <span className="text-on-surface-variant">Active Login Username:</span>
            <span className="font-mono font-bold text-primary">@{currentUser.username || "student"}</span>
          </div>

          {/* Username Field */}
          {(activeTab === "username" || activeTab === "both") && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                New Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline font-mono text-xs">
                  @
                </span>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. alex.chen"
                  maxLength={12}
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-mono text-on-surface outline-none focus:border-primary transition-all"
                  required={activeTab === "username" || activeTab === "both"}
                />
              </div>
              <p className="text-[10px] text-on-surface-variant">
                4–12 characters (letters, numbers, dots, hyphens, underscores).
              </p>
            </div>
          )}

          {/* Password Fields */}
          {(activeTab === "password" || activeTab === "both") && (
            <>
              {/* New Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters..."
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-body text-on-surface outline-none focus:border-primary transition-all"
                    required={activeTab === "password" || activeTab === "both"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showNew ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <div className="pt-1 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            strength >= step
                              ? strength === 1
                                ? "bg-red-500"
                                : strength <= 2
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                              : "bg-outline-variant/20"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-on-surface-variant">
                      <span>
                        {strength <= 1 ? "Weak" : strength <= 2 ? "Fair" : strength === 3 ? "Good" : "Strong"}
                      </span>
                      <span>Min 6 characters</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password..."
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-body text-on-surface outline-none focus:border-primary transition-all"
                    required={activeTab === "password" || activeTab === "both"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirm ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[10px] text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </>
          )}

          {/* Current Password (Always required for verification) */}
          <div className="space-y-1 pt-2 border-t border-outline-variant/20">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Verify Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password to authorize changes..."
                className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3.5 py-2.5 pr-10 text-xs font-body text-on-surface outline-none focus:border-primary transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors cursor-pointer"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                <span className="material-symbols-outlined text-lg">
                  {showCurrent ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant">
              Required to ensure account security.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2.5 pt-4 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading ||
                !currentPassword ||
                ((activeTab === "username" || activeTab === "both") && !newUsername.trim()) ||
                ((activeTab === "password" || activeTab === "both") &&
                  (!newPassword || newPassword !== confirmPassword || newPassword.length < 6))
              }
              className="px-5 py-2 bg-primary-container text-on-primary rounded-xl font-headline font-bold text-xs shadow-sm hover:brightness-105 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && (
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              <span>{isLoading ? "Updating Credentials..." : "Save Credentials"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

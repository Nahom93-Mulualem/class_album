"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar: string;
  role: "STUDENT" | "ADMIN";
  isActive: boolean;
  degree: string;
  gradYear: string;
  track: string;
  statusQuote?: string;
  bio?: string;
  dorm?: string;
  skills: string[];
  github?: string;
  linkedin?: string;
  createdAt: string;
  _count?: {
    posts: number;
    comments: number;
  };
}

interface AdminPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTrack: string;
  timeAgo: string;
  content: string;
  image?: string;
  video?: string;
  tag: string;
  likesCount: number;
  createdAt: string;
  comments: {
    id: string;
    authorName: string;
    authorAvatar: string;
    authorTrack: string;
    timeAgo: string;
    content: string;
    createdAt: string;
  }[];
  _count: {
    comments: number;
    likes: number;
  };
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  deactivatedUsers: number;
  totalStudents: number;
  totalAdmins: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalMessages: number;
  dbStatus: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser, showToast, refreshAuthSession } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "posts" | "logs">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters for Users
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");

  // Search & Filters for Posts
  const [postSearch, setPostSearch] = useState("");
  const [postTagFilter, setPostTagFilter] = useState<string>("All");

  // Modals & Selected items
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<AdminUser | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState("Student@2026!");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "Student@2026!",
    role: "STUDENT",
    track: "Full-Stack & AI Systems",
    bio: "",
  });

  const [isDeletePostModalOpen, setIsDeletePostModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<AdminPost | null>(null);
  const [isDeletingPost, setIsDeletingPost] = useState(false);

  const [inspectPost, setInspectPost] = useState<AdminPost | null>(null);

  // Fetch Admin Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, postsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/posts"),
      ]);

      if (statsRes.status === 403 || usersRes.status === 403) {
        showToast("Access Denied: You must be an Administrator.");
        router.push("/");
        return;
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      showToast("Error loading dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Toggle User Active / Deactivate
  const handleToggleUserActive = async (user: AdminUser) => {
    const nextState = !user.isActive;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "TOGGLE_ACTIVE",
          isActive: nextState,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: nextState } : u))
        );
        showToast(
          nextState
            ? `✅ Activated ${user.name}'s account!`
            : `⚠️ Deactivated ${user.name}'s account. They cannot log in.`
        );
        // Refresh stats
        if (stats) {
          setStats({
            ...stats,
            activeUsers: stats.activeUsers + (nextState ? 1 : -1),
            deactivatedUsers: stats.deactivatedUsers + (nextState ? -1 : 1),
          });
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update user status.");
      }
    } catch {
      showToast("Network error while updating user status.");
    }
  };

  // 2. Reset / Change User Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForPassword || !newPasswordInput.trim()) return;

    try {
      setIsResettingPassword(true);
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserForPassword.id,
          action: "RESET_PASSWORD",
          newPassword: newPasswordInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`🔑 Password for ${selectedUserForPassword.name} reset successfully!`);
        setIsResetPasswordModalOpen(false);
        setSelectedUserForPassword(null);
      } else {
        showToast(data.error || "Failed to reset password.");
      }
    } catch {
      showToast("Error resetting password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  // 3. Toggle Role (Student <-> Admin)
  const handleToggleRole = async (user: AdminUser) => {
    const newRole = user.role === "ADMIN" ? "STUDENT" : "ADMIN";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          action: "CHANGE_ROLE",
          role: newRole,
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
        );
        showToast(`👑 ${user.name} is now a ${newRole}!`);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to change user role.");
      }
    } catch {
      showToast("Error updating user role.");
    }
  };

  // 4. Create New User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.username || !newUserForm.email || !newUserForm.password) {
      showToast("Please fill in all required fields.");
      return;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`🎉 Created new account for ${newUserForm.name}!`);
        setIsCreateUserModalOpen(false);
        setNewUserForm({
          name: "",
          username: "",
          email: "",
          password: "Student@2026!",
          role: "STUDENT",
          track: "Full-Stack & AI Systems",
          bio: "",
        });
        fetchData();
      } else {
        showToast(data.error || "Failed to create user.");
      }
    } catch {
      showToast("Network error creating user.");
    }
  };

  // 5. Delete Post with Cascading Delete
  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;

    try {
      setIsDeletingPost(true);
      const res = await fetch(`/api/admin/posts?postId=${postToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
        showToast("🗑️ Post and all associated comments/likes deleted via cascade.");
        setIsDeletePostModalOpen(false);
        setPostToDelete(null);
        if (inspectPost?.id === postToDelete.id) {
          setInspectPost(null);
        }
        if (stats) {
          setStats({ ...stats, totalPosts: Math.max(0, stats.totalPosts - 1) });
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to delete post.");
      }
    } catch {
      showToast("Error deleting post.");
    } finally {
      setIsDeletingPost(false);
    }
  };

  // 6. Delete Comment
  const handleDeleteComment = async (postId: string, commentId: string) => {
    try {
      const res = await fetch(`/api/admin/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("💬 Comment removed.");
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === postId) {
              return {
                ...p,
                comments: p.comments.filter((c) => c.id !== commentId),
                _count: { ...p._count, comments: Math.max(0, p._count.comments - 1) },
              };
            }
            return p;
          })
        );
        if (inspectPost && inspectPost.id === postId) {
          setInspectPost((prev) =>
            prev
              ? {
                ...prev,
                comments: prev.comments.filter((c) => c.id !== commentId),
              }
              : null
          );
        }
      } else {
        showToast("Failed to delete comment.");
      }
    } catch {
      showToast("Error deleting comment.");
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.track.toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole =
      userRoleFilter === "ALL" || u.role === userRoleFilter;

    const matchesStatus =
      userStatusFilter === "ALL" ||
      (userStatusFilter === "ACTIVE" && u.isActive) ||
      (userStatusFilter === "DEACTIVATED" && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Filtered Posts
  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.content.toLowerCase().includes(postSearch.toLowerCase()) ||
      p.authorName.toLowerCase().includes(postSearch.toLowerCase());

    const matchesTag = postTagFilter === "All" || p.tag === postTagFilter;

    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Top Banner with Rich Vibrant Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-2xl border border-violet-500/20">
        {/* Glow Spheres */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-secondary-container/40 p-0.5 bg-black/40 shrink-0 hidden sm:block">
              <img
                src="/phoenix-logo.png"
                alt="Phoenix Batch 2026 Logo"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <h1 className="font-headline text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-violet-200">
                Phoenix Cohort Control Center
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Real-time oversight for the Software Engineering Class of 2020 - 2026.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-900/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Add Cohort Member
            </button>
            <Link
              href="/"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to Lounge
            </Link>
          </div>
        </div>
      </div>

      {/* Colorful Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Card 1: Users (Emerald/Teal Gradient) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 p-5 text-white shadow-lg shadow-emerald-950/20 group hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Total Cohort
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-headline tracking-tight">
              {loading ? "..." : stats?.totalUsers || 0}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-100">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {stats?.totalStudents || 0} Students
              </span>
              <span className="bg-emerald-900/40 px-2 py-0.5 rounded-full font-bold">
                {stats?.totalAdmins || 0} Admin
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Account Status (Amber/Orange Gradient) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-lg shadow-amber-950/20 group hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-100">
              Account Status
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">toggle_on</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-headline tracking-tight">
              {loading ? "..." : `${stats?.activeUsers || 0} Active`}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-amber-100">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {stats?.deactivatedUsers || 0} Deactivated
              </span>
              <span className="text-[11px] opacity-90">Instant Access Control</span>
            </div>
          </div>
        </div>

        {/* Card 3: Class Feed Posts (Violet/Indigo Gradient) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-5 text-white shadow-lg shadow-violet-950/20 group hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-100">
              Class Feed & Moderation
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">dynamic_feed</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-headline tracking-tight">
              {loading ? "..." : stats?.totalPosts || 0} Posts
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-violet-100">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {stats?.totalComments || 0} Comments
              </span>
              <span className="bg-indigo-900/40 px-2 py-0.5 rounded-full font-bold">
                {stats?.totalLikes || 0} Likes
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Messages & Network (Rose/Fuchsia Gradient) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 p-5 text-white shadow-lg shadow-rose-950/20 group hover:-translate-y-1 transition-transform">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-100">
              Direct Messages
            </span>
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">forum</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold font-headline tracking-tight">
              {loading ? "..." : stats?.totalMessages || 0} Exchanged
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-rose-100">
              <span className="bg-white/20 px-2 py-0.5 rounded-full font-bold">
                Active Lounge Chat
              </span>
              <span className="text-[11px] opacity-90">50 Cohort peers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs md:text-sm transition-all cursor-pointer ${activeTab === "overview"
            ? "bg-primary text-on-primary shadow-md scale-102"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
        >
          <span className="material-symbols-outlined text-lg">dashboard</span>
          <span>Cohort Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs md:text-sm transition-all cursor-pointer ${activeTab === "users"
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-102"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
        >
          <span className="material-symbols-outlined text-lg">manage_accounts</span>
          <span>Manage Users ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("posts")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs md:text-sm transition-all cursor-pointer ${activeTab === "posts"
            ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md scale-102"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
        >
          <span className="material-symbols-outlined text-lg">post_add</span>
          <span>Moderate Posts ({posts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-headline font-bold text-xs md:text-sm transition-all cursor-pointer ${activeTab === "logs"
            ? "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-md scale-102"
            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
        >
          <span className="material-symbols-outlined text-lg">security</span>
          <span>Security & Audit</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Quick User Management Snapshot */}
            <div className="col-span-1 lg:col-span-7 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 ambient-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">
                    Recent Cohort Members
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    50 student accounts + 1 administrator active in PostgreSQL
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("users")}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  View All {users.length} →
                </button>
              </div>

              <div className="space-y-3">
                {users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-surface hover:bg-surface-container-low transition-colors border border-outline-variant/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-surface-container-high"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${user.isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                        ></span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-sm text-on-surface">
                            {user.name}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${user.role === "ADMIN"
                              ? "bg-fuchsia-500/20 text-fuchsia-700 border border-fuchsia-400/40"
                              : "bg-sky-500/20 text-sky-700 border border-sky-400/40"
                              }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant">{user.track}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleUserActive(user)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${user.isActive
                          ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          }`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserForPassword(user);
                          setIsResetPasswordModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant transition-colors cursor-pointer"
                        title="Reset Password"
                      >
                        <span className="material-symbols-outlined text-base">key</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Post Moderation Snapshot */}
            <div className="col-span-1 lg:col-span-5 bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 ambient-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-headline font-bold text-lg text-on-surface">
                      Feed Activity Snapshot
                    </h3>
                    <p className="text-xs text-on-surface-variant">
                      Moderation queue & cascading deletes
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("posts")}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Manage Posts →
                  </button>
                </div>

                <div className="space-y-3">
                  {posts.slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-2xl bg-surface border border-outline-variant/20 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">{post.authorName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-secondary-container/40 text-on-secondary-container">
                          {post.tag}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant line-clamp-2">{post.content}</p>
                      <div className="flex items-center justify-between text-[11px] text-outline pt-1">
                        <span>❤️ {post.likesCount} • 💬 {post.comments.length} comments</span>
                        <button
                          onClick={() => {
                            setPostToDelete(post);
                            setIsDeletePostModalOpen(true);
                          }}
                          className="text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Status Alert */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-lg">database</span>
                </div>
                <div className="text-xs">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">
                    PostgreSQL 100% Operational
                  </p>
                  <p className="text-on-surface-variant">
                    Cascading deletes actively enforce relational integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE USERS */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 ambient-shadow">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search by name, username, email, track..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-xl text-xs font-body text-on-surface outline-none border border-transparent focus:border-primary/40"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Role filter */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs font-bold">
                {["ALL", "STUDENT", "ADMIN"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setUserRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${userRoleFilter === r
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    {r === "ALL" ? "All Roles" : r}
                  </button>
                ))}
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs font-bold">
                {["ALL", "ACTIVE", "DEACTIVATED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setUserStatusFilter(s)}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${userStatusFilter === s
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                      }`}
                  >
                    {s === "ALL" ? "All Status" : s}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:brightness-105 shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden ambient-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30 bg-surface-container-low text-[11px] font-extrabold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-4">Cohort Member</th>
                    <th className="py-3.5 px-4">Username & Email</th>
                    <th className="py-3.5 px-4">Track / Focus</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-xs">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-surface-container-low/60 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
                            />
                            <span
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${user.isActive ? "bg-emerald-500" : "bg-rose-500"
                                }`}
                            ></span>
                          </div>
                          <div>
                            <span className="font-bold text-on-surface block">{user.name}</span>
                            <span className="text-[11px] text-outline">{user.degree}</span>
                          </div>
                        </div>
                      </td>

                      {/* Username & Email */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs font-semibold text-primary block">
                          @{user.username}
                        </span>
                        <span className="text-[11px] text-on-surface-variant">{user.email}</span>
                      </td>

                      {/* Track */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-medium text-[11px]">
                          {user.track}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleRole(user)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition-all cursor-pointer ${user.role === "ADMIN"
                            ? "bg-fuchsia-500/20 text-fuchsia-700 border border-fuchsia-400/40 hover:bg-fuchsia-500/30"
                            : "bg-sky-500/20 text-sky-700 border border-sky-400/40 hover:bg-sky-500/30"
                            }`}
                          title="Click to toggle role"
                        >
                          {user.role} 🔄
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleUserActive(user)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${user.isActive
                            ? "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25"
                            : "bg-rose-500/15 text-rose-700 hover:bg-rose-500/25"
                            }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                          ></span>
                          <span>{user.isActive ? "Active" : "Deactivated"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForPassword(user);
                              setNewPasswordInput("Student@2026!");
                              setIsResetPasswordModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Reset password"
                          >
                            <span className="material-symbols-outlined text-sm">lock_reset</span>
                            Reset Pass
                          </button>

                          <button
                            onClick={() => handleToggleUserActive(user)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${user.isActive
                              ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600"
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600"
                              }`}
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {user.isActive ? "block" : "check_circle"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-xs text-on-surface-variant">
                  No cohort members matching the selected criteria.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MANAGE POSTS & CASCADING DELETION */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {/* Post Filter Bar */}
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 ambient-shadow">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="Search posts by text or author..."
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-xl text-xs font-body text-on-surface outline-none border border-transparent focus:border-primary/40"
              />
            </div>

            {/* Tag Filter Pills */}
            <div className="flex flex-wrap items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs font-bold">
              {["All", "Projects", "Career & Offers", "Hackathons & Tech", "Campus Life"].map((t) => (
                <button
                  key={t}
                  onClick={() => setPostTagFilter(t)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${postTagFilter === t
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-5 ambient-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
                      />
                      <div>
                        <span className="font-bold text-sm text-on-surface block">
                          {post.authorName}
                        </span>
                        <span className="text-[11px] text-outline">{post.authorTrack}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-secondary-container/40 text-on-secondary-container">
                      {post.tag}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-on-surface leading-relaxed">{post.content}</p>

                  {/* Media Preview if exists */}
                  {post.image && (
                    <div className="rounded-2xl overflow-hidden max-h-48 border border-outline-variant/20">
                      <img
                        src={post.image}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Footer Engagement & Actions */}
                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-on-surface-variant font-semibold">
                    <span>❤️ {post.likesCount} Likes</span>
                    <span>💬 {post.comments.length} Comments</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.comments.length > 0 && (
                      <button
                        onClick={() => setInspectPost(post)}
                        className="px-3 py-1 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs transition-colors cursor-pointer"
                      >
                        Inspect Comments ({post.comments.length})
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setPostToDelete(post);
                        setIsDeletePostModalOpen(true);
                      }}
                      className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Cascading Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-3xl border border-outline-variant/30">
              No class feed posts matching the query.
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SECURITY & AUDIT */}
      {activeTab === "logs" && (
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 ambient-shadow space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Platform Security & Database Architecture
              </h3>
              <p className="text-xs text-on-surface-variant">
                Relational cascade validation and authentication integrity
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 font-bold text-xs">
              System Protected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 space-y-1.5">
              <span className="text-xs font-bold text-primary block">Password Hashing</span>
              <p className="text-xs text-on-surface-variant">
                Bcrypt with 10 salt rounds applied to all 50 student and admin passwords.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 space-y-1.5">
              <span className="text-xs font-bold text-violet-600 block">Cascading Integrity</span>
              <p className="text-xs text-on-surface-variant">
                `onDelete: Cascade` active on Post -&gt; Comments, Post -&gt; Likes, User -&gt; Posts.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface border border-outline-variant/20 space-y-1.5">
              <span className="text-xs font-bold text-teal-600 block">RBAC Permission Gate</span>
              <p className="text-xs text-on-surface-variant">
                Only authenticated users with role `ADMIN` can view or execute admin APIs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RESET PASSWORD */}
      {isResetPasswordModalOpen && selectedUserForPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">key</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    Reset User Password
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    for {selectedUserForPassword.name} (@{selectedUserForPassword.username})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">
                  New Secure Password
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface focus:border-primary outline-none"
                  placeholder="Enter new password..."
                  required
                />
                <span className="text-[10px] text-outline mt-1 block">
                  Password will be hashed using Bcrypt before database storage.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  {isResettingPassword ? "Resetting..." : "Confirm Password Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE NEW USER */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline font-bold text-base text-on-surface">
                    Add New Cohort Member
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Create a new Software Engineering student or admin account
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={newUserForm.name}
                    onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. jordan.miller"
                    value={newUserForm.username}
                    onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@phoenix2026.edu"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface outline-none focus:border-primary"
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Track</label>
                <input
                  type="text"
                  placeholder="e.g. Full-Stack & Cloud Architecture"
                  value={newUserForm.track}
                  onChange={(e) => setNewUserForm({ ...newUserForm, track: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">Initial Password</label>
                <input
                  type="text"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-xs font-mono text-on-surface outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md hover:brightness-105 transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CASCADING DELETE POST CONFIRMATION */}
      {isDeletePostModalOpen && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-rose-500/30 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Cascading Delete Post
                </h3>
                <p className="text-xs text-on-surface-variant">Post by {postToDelete.authorName}</p>
              </div>
            </div>

            <p className="text-xs text-on-surface leading-relaxed">
              Are you sure you want to delete this post? This will permanently and automatically cascade to delete all <strong>{postToDelete.comments.length} comments</strong> and <strong>{postToDelete.likesCount} likes</strong> linked to this post in PostgreSQL.
            </p>

            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant line-clamp-3">
              &quot;{postToDelete.content}&quot;
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletePostModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingPost}
                onClick={handleConfirmDeletePost}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">delete_forever</span>
                {isDeletingPost ? "Deleting..." : "Delete Cascading Post"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: INSPECT & DELETE INDIVIDUAL COMMENTS */}
      {inspectPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <div>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Comments on {inspectPost.authorName}&apos;s Post
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {inspectPost.comments.length} comments total
                </p>
              </div>
              <button
                onClick={() => setInspectPost(null)}
                className="p-1 rounded-lg text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {inspectPost.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-2xl bg-surface border border-outline-variant/20 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <img
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-primary">{comment.authorName}</span>
                        <span className="text-[10px] text-outline">{comment.timeAgo}</span>
                      </div>
                      <p className="text-xs text-on-surface mt-0.5">{comment.content}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteComment(inspectPost.id, comment.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                    title="Delete Comment"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))}

              {inspectPost.comments.length === 0 && (
                <div className="p-6 text-center text-xs text-on-surface-variant">
                  No comments on this post.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectPost(null)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

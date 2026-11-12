"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  Student,
  Post,
  Conversation,
  MessageItem,
  ReactionItem,
  TechEvent,
  GalleryItem,
  YearbookSignature,
  NotificationItem,
  MemoryItem,
  INITIAL_STUDENTS,
  INITIAL_POSTS,
  INITIAL_CONVERSATIONS,
  INITIAL_EVENTS,
  INITIAL_GALLERY,
  INITIAL_SIGNATURES,
  INITIAL_NOTIFICATIONS,
  INITIAL_MEMORIES,
} from "../data/initialData";

export interface ExtendedUser extends Student {
  username?: string;
  email?: string;
  role?: "STUDENT" | "ADMIN";
  isActive?: boolean;
}

export interface ToastItem {
  message: string;
  type?: "success" | "info" | "heart" | "copy" | "event";
}

export interface LightboxData {
  url: string;
  type?: "image" | "video";
  title?: string;
}

const CLIENT_INSTANCE_ID = typeof window !== "undefined" ? Math.random().toString(36).substring(2, 11) : "server";

interface AppContextType {
  theme: "light" | "dark";
  isThemeMounted: boolean;
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  currentUser: ExtendedUser | null;
  isAuthLoading: boolean;
  updateCurrentUser: (updated: Partial<ExtendedUser>) => Promise<boolean>;
  students: Student[];
  toggleConnect: (studentId: string) => Promise<void>;
  posts: Post[];
  createPost: (content: string, tag: Post["tag"], image?: string, video?: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  toggleMessageReaction: (conversationId: string, messageId: string, emoji: string) => void;
  startConversationWithStudent: (studentId: string) => string;
  events: TechEvent[];
  toggleRSVP: (eventId: string) => void;
  gallery: GalleryItem[];
  yearbookSignatures: YearbookSignature[];
  addYearbookSignature: (message: string) => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  memories: MemoryItem[];
  addMemory: (memory: Omit<MemoryItem, "id" | "likesCount" | "isLiked" | "comments">) => Promise<void> | void;
  deleteMemory: (memoryId: string) => Promise<boolean>;
  toggleLikeMemory: (memoryId: string) => void;
  addMemoryComment: (memoryId: string, content: string) => void;
  isNewPostModalOpen: boolean;
  setIsNewPostModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  credentialsModalTab: "username" | "password" | "both";
  setCredentialsModalTab: (tab: "username" | "password" | "both") => void;
  openCredentialsModal: (tab?: "username" | "password" | "both") => void;
  isMobileChatOpen: boolean;
  setIsMobileChatOpen: (open: boolean) => void;
  isNewMemoryModalOpen: boolean;
  setIsNewMemoryModalOpen: (open: boolean) => void;
  activeMemoryForDetail: MemoryItem | null;
  setActiveMemoryForDetail: (memory: MemoryItem | null) => void;
  lightboxMedia: LightboxData | null;
  openLightbox: (url: string, type?: "image" | "video", title?: string) => void;
  closeLightbox: () => void;
  toast: ToastItem | null;
  showToast: (msg: string, type?: ToastItem["type"]) => void;
  refreshLiveDatabaseData: () => Promise<void>;
  refreshAuthSession: () => Promise<ExtendedUser | null>;
  restoreAdminAuthority: () => Promise<boolean>;
  logoutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function applyThemeClass(t: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (t === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
    root.setAttribute("data-theme", "light");
  }
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => { };
  window.addEventListener("storage", callback);
  window.addEventListener("phoenix_theme_change", callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("phoenix_theme_change", callback);
    media.removeEventListener("change", callback);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  try {
    const savedTheme = localStorage.getItem("phoenix_theme") as "light" | "dark" | null;
    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // Fallback
  }
  return "light";
}

function getThemeServerSnapshot(): "light" | "dark" {
  return "light";
}

function subscribeMounted(callback: () => void) {
  callback();
  return () => { };
}

function getMountedSnapshot(): boolean {
  return true;
}

function getMountedServerSnapshot(): boolean {
  return false;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Theme State: Synchronized with client store via React 18/19 useSyncExternalStore (100% SSR & Hydration safe)
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const isThemeMounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getMountedServerSnapshot);

  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("phoenix_conversations_current");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch { }
    }
    return INITIAL_CONVERSATIONS;
  });
  const [activeConversationId, setActiveConversationId] = useState<string>("conv-sarah");
  const [events, setEvents] = useState<TechEvent[]>(INITIAL_EVENTS);
  const [gallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [yearbookSignatures, setYearbookSignatures] = useState<YearbookSignature[]>(INITIAL_SIGNATURES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("phoenix_notifications_current");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch { }
    }
    return INITIAL_NOTIFICATIONS;
  });
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("phoenix_custom_memories");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Keep only genuine custom user memories that are not duplicates of INITIAL_MEMORIES
            const customOnly = parsed.filter(
              (m: MemoryItem) => m && m.id && !INITIAL_MEMORIES.some((init) => init.id === m.id)
            );
            // Deduplicate custom memories among themselves by ID
            const seenIds = new Set<string>();
            const uniqueCustom: MemoryItem[] = [];
            for (const item of customOnly) {
              if (!seenIds.has(item.id)) {
                seenIds.add(item.id);
                uniqueCustom.push(item);
              }
            }
            try {
              localStorage.setItem("phoenix_custom_memories", JSON.stringify(uniqueCustom));
            } catch { }
            return [...uniqueCustom, ...INITIAL_MEMORIES];
          }
        }
      } catch {
        // Fallback
      }
    }
    return INITIAL_MEMORIES;
  });

  // Modals & UI States
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [credentialsModalTab, setCredentialsModalTab] = useState<"username" | "password" | "both">("password");

  const openCredentialsModal = useCallback((tab: "username" | "password" | "both" = "password") => {
    setCredentialsModalTab(tab);
    setIsChangePasswordModalOpen(true);
  }, []);

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isNewMemoryModalOpen, setIsNewMemoryModalOpen] = useState(false);
  const [activeMemoryForDetail, setActiveMemoryForDetail] = useState<MemoryItem | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxData | null>(null);
  const [toast, setToast] = useState<ToastItem | null>(null);

  // Synchronize document classes when theme changes on client
  useEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: "light" | "dark") => {
    try {
      localStorage.setItem("phoenix_theme", newTheme);
      window.dispatchEvent(new Event("phoenix_theme_change"));
    } catch {
      // ignore
    }
    applyThemeClass(newTheme);
  }, []);

  const showToast = useCallback((msg: string, type: ToastItem["type"] = "info") => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === msg ? null : prev));
    }, 3200);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    showToast(
      next === "dark" ? "Switched to Midnight Obsidian Theme 🌙" : "Switched to Sunlight Warm Theme ☀️",
      "info"
    );
  }, [theme, setTheme, showToast]);

  const openLightbox = (url: string, type: "image" | "video" = "image", title?: string) => {
    setLightboxMedia({ url, type, title });
  };
  const closeLightbox = () => setLightboxMedia(null);

  // Refresh current session from server cookie
  const refreshAuthSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const storedCover =
            typeof window !== "undefined"
              ? localStorage.getItem(`phoenix_cover_${data.user.id}`)
              : null;
          const userWithCover = {
            ...data.user,
            coverImage: storedCover || data.user.coverImage,
          };
          setCurrentUser(userWithCover);
          setIsAuthLoading(false);
          return userWithCover;
        }
      }
      setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsAuthLoading(false);
    }
    return null;
  }, []);

  // Restore Admin Authority
  const restoreAdminAuthority = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/restore-admin", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        showToast("👑 Admin Authority Restored! Welcome back, Admin.", "success");
        return true;
      }
    } catch {
      // Fallback
    }

    showToast("Failed to restore admin authority.", "info");
    return false;
  };

  // Fetch live database records for directory, posts, events, signatures, and memories
  const fetchLiveDatabaseData = useCallback(async () => {
    try {
      const [usersRes, postsRes, eventsRes, sigsRes, memsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/posts"),
        fetch("/api/events"),
        fetch("/api/signatures"),
        fetch("/api/memories"),
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data.users && Array.isArray(data.users)) {
          const normalizedUsers: Student[] = data.users.map((u: Partial<ExtendedUser>) => ({
            id: u.id,
            name: u.name || "Phoenix Senior",
            avatar:
              u.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username || "student"}`,
            degree: u.degree || "B.S. Software Engineering",
            gradYear: u.gradYear || "2026",
            track: u.track || "Full-Stack & Cloud Architecture",
            statusQuote: u.statusQuote || "",
            bio: u.bio || "Software Engineering Senior Class of 2026.",
            dorm: u.dorm || "Campus Residential",
            skills:
              Array.isArray(u.skills) && u.skills.length > 0
                ? u.skills
                : ["TypeScript", "Full-Stack"],
            github: u.github || u.username || "",
            linkedin: u.linkedin || "",
            connected: Boolean(u.connected),
            online: Boolean(u.online),
            username: u.username,
            email: u.email,
            role: u.role,
            isActive: u.isActive !== undefined ? u.isActive : true,
          }));
          setStudents(normalizedUsers);
        }
      }

      if (postsRes.ok) {
        const data = await postsRes.json();
        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts);
        }
      }

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        if (data.events && Array.isArray(data.events)) {
          setEvents(data.events);
        }
      }

      if (sigsRes.ok) {
        const data = await sigsRes.json();
        if (data.signatures && Array.isArray(data.signatures)) {
          setYearbookSignatures(data.signatures);
        }
      }

      if (memsRes.ok) {
        const data = await memsRes.json();
        if (data.memories && Array.isArray(data.memories) && data.memories.length > 0) {
          setMemories(data.memories);
        }
      }
    } catch {
      // Offline fallback
    }
  }, []);

  // Fetch live database messages for the logged-in user in real time
  const fetchLiveMessages = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.messages || !Array.isArray(data.messages)) return;

      setConversations((prevConvs) => {
        let hasAnyChange = false;
        const currentList = prevConvs.map((c) => ({ ...c, messages: [...c.messages] }));

        for (const msg of data.messages) {
          const partnerId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;

          const convIndex = currentList.findIndex(
            (c) =>
              c.studentId === partnerId ||
              `student-${c.studentId}` === partnerId ||
              c.studentId === `student-${partnerId}`
          );

          if (convIndex === -1) {
            const isUnreadForMe = !msg.isRead && msg.receiverId === currentUser.id;
            const newConv: Conversation = {
              id: `conv-${partnerId}`,
              studentId: partnerId,
              lastMessage: msg.text,
              lastMessageTime: msg.time,
              unreadCount: isUnreadForMe ? 1 : 0,
              messages: [msg],
            };
            currentList.unshift(newConv);
            hasAnyChange = true;
          } else {
            const conv = currentList[convIndex];
            const alreadyExists = conv.messages.some((m) => m.id === msg.id);
            if (!alreadyExists) {
              const isIncomingUnread =
                !msg.isRead &&
                msg.receiverId === currentUser.id &&
                activeConversationId !== conv.id;

              conv.messages.push(msg);
              conv.lastMessage = msg.text;
              conv.lastMessageTime = msg.time;
              if (isIncomingUnread) {
                conv.unreadCount += 1;
              }
              hasAnyChange = true;
            }
          }
        }

        if (!hasAnyChange) return prevConvs;
        return currentList;
      });
    } catch {
      // offline fallback
    }
  }, [currentUser?.id, activeConversationId]);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      if (mounted) {
        await refreshAuthSession();
        await fetchLiveDatabaseData();
        await fetchLiveMessages();
      }
    };
    initialize();

    const handleSyncEvent = () => {
      fetchLiveDatabaseData();
      fetchLiveMessages();
    };

    const handleFocus = () => {
      fetchLiveDatabaseData();
      fetchLiveMessages();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLiveMessages();
      }
    };

    let chatChannel: BroadcastChannel | null = null;
    if (typeof window !== "undefined") {
      window.addEventListener("phoenix_data_sync", handleSyncEvent);
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleVisibility);

      if ("BroadcastChannel" in window) {
        chatChannel = new BroadcastChannel("phoenix_chat_sync");
        chatChannel.onmessage = () => {
          fetchLiveMessages();
        };
      }
    }

    // Auto-sync general data every 10s, live messages every 1.2s for responsive real-time conversation
    const syncInterval = setInterval(() => {
      fetchLiveDatabaseData();
    }, 10000);

    const messageInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      fetchLiveMessages();
    }, 1200);

    return () => {
      mounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("phoenix_data_sync", handleSyncEvent);
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleVisibility);
      }
      if (chatChannel) {
        chatChannel.close();
      }
      clearInterval(syncInterval);
      clearInterval(messageInterval);
    };
  }, [refreshAuthSession, fetchLiveDatabaseData, fetchLiveMessages]);

  // User-specific notification and conversation persistence
  const previousUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentUser || typeof window === "undefined") return;
    if (previousUserIdRef.current === currentUser.id) return;
    previousUserIdRef.current = currentUser.id;

    // Load user notifications from localStorage if exists
    try {
      const storedNotifs = localStorage.getItem(`phoenix_notifications_${currentUser.id}`);
      if (storedNotifs) {
        const parsed = JSON.parse(storedNotifs);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      } else {
        // If demo user alex.chen, load INITIAL_NOTIFICATIONS
        if (currentUser.username === "alex.chen") {
          setNotifications(INITIAL_NOTIFICATIONS);
          localStorage.setItem(`phoenix_notifications_${currentUser.id}`, JSON.stringify(INITIAL_NOTIFICATIONS));
        } else {
          // Tailored welcome notification for new student or admin
          const welcomeNotifs: NotificationItem[] = [
            {
              id: `notif-welcome-${Date.now()}`,
              type: "event",
              title: `Welcome to Phoenix Lounge! 🎓`,
              description: `Glad to have you with us, ${currentUser.name}. Explore the digital class album and connect with classmates.`,
              time: "Just now",
              read: false,
            },
          ];
          setNotifications(welcomeNotifs);
          localStorage.setItem(`phoenix_notifications_${currentUser.id}`, JSON.stringify(welcomeNotifs));
        }
      }
    } catch { }

    // Load user conversations from localStorage if exists
    try {
      const storedConvs = localStorage.getItem(`phoenix_conversations_${currentUser.id}`);
      if (storedConvs) {
        const parsed = JSON.parse(storedConvs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
        }
      }
    } catch { }
  }, [currentUser]);

  // Persist notifications whenever updated
  useEffect(() => {
    if (typeof window === "undefined" || !currentUser?.id) return;
    try {
      localStorage.setItem(`phoenix_notifications_${currentUser.id}`, JSON.stringify(notifications));
      localStorage.setItem("phoenix_notifications_current", JSON.stringify(notifications));
    } catch { }
  }, [notifications, currentUser?.id]);

  // Persist conversations whenever updated
  useEffect(() => {
    if (typeof window === "undefined" || !currentUser?.id) return;
    try {
      localStorage.setItem(`phoenix_conversations_${currentUser.id}`, JSON.stringify(conversations));
      localStorage.setItem("phoenix_conversations_current", JSON.stringify(conversations));
    } catch { }
  }, [conversations, currentUser?.id]);

  const logoutUser = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Signed out successfully. See you soon!", "info");
      setCurrentUser(null);
      window.location.href = "/login";
    } catch {
      setCurrentUser(null);
      window.location.href = "/login";
    }
  };

  const updateCurrentUser = async (updated: Partial<ExtendedUser>): Promise<boolean> => {
    if (updated.coverImage && typeof window !== "undefined") {
      try {
        const userId = currentUser?.id || "user";
        localStorage.setItem(`phoenix_cover_${userId}`, updated.coverImage);
      } catch { }
    }

    setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));

    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          const cover =
            updated.coverImage ||
            (typeof window !== "undefined"
              ? localStorage.getItem(`phoenix_cover_${data.user.id}`)
              : null);
          const merged = { ...data.user, coverImage: cover || data.user.coverImage };
          setCurrentUser(merged);
          setStudents((prev) =>
            prev.map((s) => (s.id === data.user.id ? { ...s, ...merged } : s))
          );
        }
        showToast("Profile updated successfully! ✨", "success");
        return true;
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to update profile.", "info");
        return false;
      }
    } catch {
      showToast("Profile saved locally.", "info");
      return true;
    }
  };

  const toggleConnect = async (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextState = !s.connected;
          showToast(nextState ? `Connected with ${s.name}! 🤝` : `Disconnected from ${s.name}`, "info");
          return { ...s, connected: nextState };
        }
        return s;
      })
    );

    try {
      await fetch(`/api/users/${studentId}/connect`, { method: "POST" });
    } catch {
      // Keep optimistic
    }
  };

  const createPost = async (content: string, tag: Post["tag"], image?: string, video?: string) => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tag, image, video }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.post) {
          setPosts([data.post, ...posts]);
          setIsNewPostModalOpen(false);
          showToast("Post shared to Phoenix Feed! 🎉", "success");
          return;
        }
      }
    } catch {
      // Fallback
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser?.id || "guest",
      authorName: currentUser?.name || "Phoenix Classmate",
      authorAvatar: currentUser?.avatar || "/phoenix-logo.png",
      authorTrack: currentUser?.track || "Software Engineering",
      timeAgo: "Just now",
      content,
      image,
      video,
      tag,
      likesCount: 0,
      isLiked: false,
      comments: [],
    };
    setPosts([newPost, ...posts]);
    setIsNewPostModalOpen(false);
    showToast("Post shared to Phoenix Feed! 🎉", "success");
  };

  const toggleLikePost = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          if (isLiked) {
            showToast(`Liked ${p.authorName}'s update! ❤️`, "heart");
          }
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch {
      // Revert if needed
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!content.trim()) return;

    const optimisticComment = {
      id: `c-${Date.now()}`,
      authorName: currentUser?.name || "Phoenix Classmate",
      authorAvatar: currentUser?.avatar || "/phoenix-logo.png",
      authorTrack: currentUser?.track || "Software Engineering",
      timeAgo: "Just now",
      content,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return { ...p, comments: [...p.comments, optimisticComment] };
        }
        return p;
      })
    );
    showToast("Comment posted! 💬", "success");

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          setPosts((prev) =>
            prev.map((p) => {
              if (p.id === postId) {
                return {
                  ...p,
                  comments: p.comments.map((c) =>
                    c.id === optimisticComment.id ? data.comment : c
                  ),
                };
              }
              return p;
            })
          );
        }
      }
    } catch {
      // Keep optimistic
    }
  };

  // Memories methods with persistent database storage
  const addMemory = async (
    memoryData: Omit<MemoryItem, "id" | "likesCount" | "isLiked" | "comments">
  ) => {
    const optimisticMemory: MemoryItem = {
      ...memoryData,
      id: `user-mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      likesCount: 0,
      isLiked: false,
      comments: [],
    };

    setMemories((prev) => [optimisticMemory, ...prev]);
    setIsNewMemoryModalOpen(false);
    showToast(`Memory uploaded to Digital Yearbook Vault! 🎓📸`, "success");

    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoryData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.memory) {
          setMemories((prev) =>
            prev.map((m) => (m.id === optimisticMemory.id ? data.memory : m))
          );
        }
        await fetchLiveDatabaseData();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("phoenix_data_sync"));
        }
      }
    } catch {
      // Keep optimistic
    }
  };

  const deleteMemory = async (memoryId: string): Promise<boolean> => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("phoenix_custom_memories");
        if (stored) {
          const parsed = JSON.parse(stored);
          const filtered = parsed.filter((m: MemoryItem) => m.id !== memoryId);
          localStorage.setItem("phoenix_custom_memories", JSON.stringify(filtered));
        }
      } catch {}
    }

    if (activeMemoryForDetail?.id === memoryId) {
      setActiveMemoryForDetail(null);
    }

    try {
      const res = await fetch(`/api/admin/memories?memoryId=${memoryId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchLiveDatabaseData();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("phoenix_data_sync"));
        }
        return true;
      } else {
        const fallbackRes = await fetch(`/api/memories/${memoryId}`, {
          method: "DELETE",
        });
        if (fallbackRes.ok) {
          await fetchLiveDatabaseData();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("phoenix_data_sync"));
          }
          return true;
        }
      }
    } catch {
      // Optimistic state already updated
    }
    return true;
  };

  const toggleLikeMemory = (memoryId: string) => {
    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === memoryId) {
          const isLiked = !m.isLiked;
          if (isLiked) {
            showToast(`Loved "${m.title}"! ❤️`, "heart");
          }
          const updated = {
            ...m,
            isLiked,
            likesCount: isLiked ? m.likesCount + 1 : Math.max(0, m.likesCount - 1),
          };
          if (activeMemoryForDetail?.id === memoryId) {
            setActiveMemoryForDetail(updated);
          }
          return updated;
        }
        return m;
      })
    );
  };

  const addMemoryComment = (memoryId: string, content: string) => {
    if (!content.trim()) return;

    const newComment = {
      id: `mc-${Date.now()}`,
      authorName: currentUser?.name || "Phoenix Classmate",
      authorAvatar: currentUser?.avatar || "/phoenix-logo.png",
      authorTrack: currentUser?.track || "Software Engineering",
      timeAgo: "Just now",
      content,
    };

    setMemories((prev) =>
      prev.map((m) => {
        if (m.id === memoryId) {
          const updated = {
            ...m,
            comments: [...m.comments, newComment],
          };
          if (activeMemoryForDetail?.id === memoryId) {
            setActiveMemoryForDetail(updated);
          }
          return updated;
        }
        return m;
      })
    );
    showToast("Yearbook comment added! ✍️", "success");
  };

  const markConversationAsRead = useCallback((conversationId: string) => {
    let wasUpdated = false;
    let partnerStudentId: string | null = null;

    setConversations((prev) => {
      const target = prev.find((c) => c.id === conversationId);
      if (!target) return prev;
      partnerStudentId = target.studentId;

      // If already marked as read and unreadCount is 0, do nothing (preserves reference)
      const allMessagesRead = target.messages.every((m) => m.isRead);
      if (target.unreadCount === 0 && allMessagesRead) {
        return prev;
      }

      wasUpdated = true;
      return prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            unreadCount: 0,
            messages: conv.messages.map((m) => ({ ...m, isRead: true })),
          };
        }
        return conv;
      });
    });

    // Mark related notifications as read outside of setConversations
    if (partnerStudentId) {
      const student = students.find((s) => s.id === partnerStudentId);
      if (student) {
        setNotifications((prev) => {
          const hasMatchingUnread = prev.some(
            (n) => !n.read && n.type === "message" && n.title.toLowerCase().includes(student.name.toLowerCase())
          );
          if (!hasMatchingUnread) return prev;
          return prev.map((n) =>
            n.type === "message" && n.title.toLowerCase().includes(student.name.toLowerCase())
              ? { ...n, read: true }
              : n
          );
        });

        // Notify backend if recipient is in DB
        fetch("/api/messages/read", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerId: student.id }),
        }).catch(() => {});
      }
    }

    // Broadcast only if updated, and include senderId to prevent echo loop
    if (wasUpdated) {
      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const bc = new BroadcastChannel("phoenix_realtime_sync");
          bc.postMessage({ type: "MARK_CONVERSATION_READ", conversationId, senderId: CLIENT_INSTANCE_ID });
          bc.close();
        }
      } catch {}
    }
  }, [students]);

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const timeNow = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date());

    const tempMessageId = `msg-${Date.now()}`;
    const newMessage: MessageItem = {
      id: tempMessageId,
      senderId: currentUser?.id || "current-user",
      text: text.trim(),
      time: timeNow,
      isRead: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text.trim(),
            lastMessageTime: timeNow,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      })
    );

    // Save message to backend database (real persistence, no fake automated replies)
    const currentConv = conversations.find((c) => c.id === conversationId);
    if (currentConv) {
      fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: currentConv.studentId, text: text.trim() }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.message) {
            // Broadcast to other tabs/windows for instant real-time sync
            if (typeof window !== "undefined" && "BroadcastChannel" in window) {
              try {
                const bc = new BroadcastChannel("phoenix_chat_sync");
                bc.postMessage({ type: "new_message", conversationId });
                bc.close();
              } catch {}
            }

            // Replace temporary message with actual database message
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id === conversationId) {
                  return {
                    ...c,
                    messages: c.messages.map((m) => (m.id === tempMessageId ? data.message : m)),
                  };
                }
                return c;
              })
            );

            // Broadcast real message to other open tabs
            try {
              if (typeof window !== "undefined" && "BroadcastChannel" in window) {
                const bc = new BroadcastChannel("phoenix_realtime_sync");
                bc.postMessage({
                  type: "NEW_DB_MESSAGE",
                  conversationId,
                  message: data.message,
                  senderId: CLIENT_INSTANCE_ID,
                });
                bc.close();
              }
            } catch {}
          }
        })
        .catch(() => {});
    }
  };

  // Cross-tab real-time sync listener & periodic database poll
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const bc = new BroadcastChannel("phoenix_realtime_sync");
    bc.onmessage = (event) => {
      const data = event.data;
      if (!data || data.senderId === CLIENT_INSTANCE_ID) return;

      if (data.type === "MARK_CONVERSATION_READ" && data.conversationId) {
        setConversations((prev) => {
          const target = prev.find((c) => c.id === data.conversationId);
          if (!target || (target.unreadCount === 0 && target.messages.every((m) => m.isRead))) {
            return prev;
          }
          return prev.map((c) =>
            c.id === data.conversationId
              ? { ...c, unreadCount: 0, messages: c.messages.map((m) => ({ ...m, isRead: true })) }
              : c
          );
        });
      } else if (data.type === "NEW_LOCAL_MESSAGE" && data.conversationId && data.message) {
        setConversations((prev) => {
          const conv = prev.find((c) => c.id === data.conversationId);
          if (!conv || conv.messages.some((m) => m.id === data.message.id)) {
            return prev;
          }
          return prev.map((c) => {
            if (c.id === data.conversationId) {
              return {
                ...c,
                lastMessage: data.message.text,
                lastMessageTime: data.message.time,
                messages: [...c.messages, data.message],
              };
            }
            return c;
          });
        });
      } else if (data.type === "NEW_DB_MESSAGE") {
        fetchLiveMessages();
      }
    };

    return () => {
      bc.close();
    };
  }, [fetchLiveMessages]);

  const toggleMessageReaction = (conversationId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;

    const currentUserId = currentUser.id || "current-user";

    const isMatchUser = (userId: string) =>
      userId === currentUserId ||
      (currentUserId === "current-user" && userId === currentUser.id) ||
      (userId === "current-user" && currentUserId === currentUser.id);

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv;

        const updatedMessages = conv.messages.map((msg) => {
          if (msg.id !== messageId) return msg;

          const existingReactions = msg.reactions || [];

          // Check if user already reacted with THIS EXACT emoji
          const existingTargetReaction = existingReactions.find((r) => r.emoji === emoji);
          const hasReactedWithThisEmoji = existingTargetReaction
            ? existingTargetReaction.users.some(isMatchUser)
            : false;

          if (hasReactedWithThisEmoji) {
            // TOGGLE OFF: Remove user from this emoji reaction
            const newReactions = existingReactions
              .map((r) => {
                if (r.emoji !== emoji) return r;
                const newUsers = r.users.filter((u) => !isMatchUser(u));
                return { ...r, count: newUsers.length, users: newUsers };
              })
              .filter((r) => r.users.length > 0);

            return { ...msg, reactions: newReactions };
          } else {
            // SWITCH / ADD: Remove user from any other emoji reactions on this message first
            const cleanedReactions = existingReactions
              .map((r) => {
                const newUsers = r.users.filter((u) => !isMatchUser(u));
                return { ...r, count: newUsers.length, users: newUsers };
              })
              .filter((r) => r.users.length > 0);

            // Now add user to the chosen emoji
            const targetIdx = cleanedReactions.findIndex((r) => r.emoji === emoji);
            let finalReactions: ReactionItem[];

            if (targetIdx > -1) {
              finalReactions = cleanedReactions.map((r, idx) =>
                idx === targetIdx
                  ? { ...r, count: r.count + 1, users: [...r.users, currentUserId] }
                  : r
              );
            } else {
              finalReactions = [
                ...cleanedReactions,
                { emoji, count: 1, users: [currentUserId] },
              ];
            }

            return { ...msg, reactions: finalReactions };
          }
        });

        return { ...conv, messages: updatedMessages };
      })
    );
  };

  const startConversationWithStudent = useCallback((studentId: string): string => {
    const existing = conversations.find((c) => c.studentId === studentId);
    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const student = students.find((s) => s.id === studentId);
    const newConvId = `conv-${studentId}-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      studentId,
      lastMessage: `Started a direct message with ${student?.name || "Classmate"}`,
      lastMessageTime: "Just now",
      unreadCount: 0,
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    return newConvId;
  }, [conversations, students]);

  const toggleRSVP = async (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId) {
          const nextState = !e.isRSVPed;
          showToast(nextState ? `RSVP confirmed for ${e.title}! 🎟️` : `Removed RSVP for ${e.title}`, "event");
          return { ...e, isRSVPed: nextState };
        }
        return e;
      })
    );

    try {
      await fetch(`/api/events/${eventId}/rsvp`, { method: "POST" });
    } catch {
      // Keep optimistic
    }
  };

  const addYearbookSignature = async (message: string) => {
    if (!message.trim()) return;

    const nowFormatted = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());

    const optimisticSig: YearbookSignature = {
      id: `sig-${Date.now()}`,
      authorName: currentUser?.name || "Phoenix Classmate",
      authorAvatar: currentUser?.avatar || "/phoenix-logo.png",
      authorTrack: currentUser?.track || "Software Engineering",
      date: nowFormatted,
      message: message.trim(),
    };
    setYearbookSignatures((prev) => [optimisticSig, ...prev]);
    showToast("Yearbook memory signed! 🎓✍️", "success");

    try {
      const res = await fetch("/api/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.signature) {
          setYearbookSignatures((prev) =>
            prev.map((s) => (s.id === optimisticSig.id ? data.signature : s))
          );
        }
      }
    } catch {
      // Keep optimistic
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      if (typeof window !== "undefined" && currentUser?.id) {
        try {
          localStorage.setItem(`phoenix_notifications_${currentUser.id}`, JSON.stringify(updated));
          localStorage.setItem("phoenix_notifications_current", JSON.stringify(updated));
        } catch { }
      }
      return updated;
    });
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      if (typeof window !== "undefined" && currentUser?.id) {
        try {
          localStorage.setItem(`phoenix_notifications_${currentUser.id}`, JSON.stringify(updated));
          localStorage.setItem("phoenix_notifications_current", JSON.stringify(updated));
        } catch { }
      }
      return updated;
    });
    showToast("All notifications marked as read.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        isThemeMounted,
        toggleTheme,
        setTheme,
        currentUser,
        isAuthLoading,
        updateCurrentUser,
        students,
        toggleConnect,
        posts,
        createPost,
        toggleLikePost,
        addComment,
        conversations,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        markConversationAsRead,
        toggleMessageReaction,
        startConversationWithStudent,
        events,
        toggleRSVP,
        gallery,
        yearbookSignatures,
        addYearbookSignature,
        notifications,
        markNotificationAsRead,
        markAllNotificationsRead,
        memories,
        addMemory,
        deleteMemory,
        toggleLikeMemory,
        addMemoryComment,
        isNewPostModalOpen,
        setIsNewPostModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        credentialsModalTab,
        setCredentialsModalTab,
        openCredentialsModal,
        isMobileChatOpen,
        setIsMobileChatOpen,
        isNewMemoryModalOpen,
        setIsNewMemoryModalOpen,
        activeMemoryForDetail,
        setActiveMemoryForDetail,
        lightboxMedia,
        openLightbox,
        closeLightbox,
        toast,
        showToast,
        refreshLiveDatabaseData: fetchLiveDatabaseData,
        refreshAuthSession,
        restoreAdminAuthority,
        logoutUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

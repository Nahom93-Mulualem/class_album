"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  CURRENT_USER,
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

interface AppContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
  currentUser: ExtendedUser | null;
  isAuthLoading: boolean;
  updateCurrentUser: (updated: Partial<ExtendedUser>) => void;
  students: Student[];
  toggleConnect: (studentId: string) => void;
  posts: Post[];
  createPost: (content: string, tag: Post["tag"], image?: string, video?: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
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
  addMemory: (memory: Omit<MemoryItem, "id" | "likesCount" | "isLiked" | "comments">) => void;
  toggleLikeMemory: (memoryId: string) => void;
  addMemoryComment: (memoryId: string, content: string) => void;
  isNewPostModalOpen: boolean;
  setIsNewPostModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  isNewMemoryModalOpen: boolean;
  setIsNewMemoryModalOpen: (open: boolean) => void;
  activeMemoryForDetail: MemoryItem | null;
  setActiveMemoryForDetail: (memory: MemoryItem | null) => void;
  lightboxMedia: LightboxData | null;
  openLightbox: (url: string, type?: "image" | "video", title?: string) => void;
  closeLightbox: () => void;
  toast: ToastItem | null;
  showToast: (msg: string, type?: ToastItem["type"]) => void;
  refreshAuthSession: () => Promise<void>;
  restoreAdminAuthority: () => Promise<boolean>;
  logoutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Theme State
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>("conv-sarah");
  const [events, setEvents] = useState<TechEvent[]>(INITIAL_EVENTS);
  const [gallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [yearbookSignatures, setYearbookSignatures] = useState<YearbookSignature[]>(INITIAL_SIGNATURES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);

  // Modals & UI States
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isNewMemoryModalOpen, setIsNewMemoryModalOpen] = useState(false);
  const [activeMemoryForDetail, setActiveMemoryForDetail] = useState<MemoryItem | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxData | null>(null);
  const [toast, setToast] = useState<ToastItem | null>(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("phoenix_theme") as "light" | "dark" | null;
      if (savedTheme === "dark" || savedTheme === "light") {
        setThemeState(savedTheme);
        applyThemeClass(savedTheme);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initial = prefersDark ? "dark" : "light";
        setThemeState(initial);
        applyThemeClass(initial);
      }
    } catch {
      // Fallback
    }
  }, []);

  const applyThemeClass = (t: "light" | "dark") => {
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
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    applyThemeClass(newTheme);
    try {
      localStorage.setItem("phoenix_theme", newTheme);
    } catch {
      // ignore
    }
  };

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    showToast(next === "dark" ? "Switched to Midnight Obsidian Theme 🌙" : "Switched to Sunlight Warm Theme ☀️", "info");
  };

  const showToast = (msg: string, type: ToastItem["type"] = "info") => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === msg ? null : prev));
    }, 3200);
  };

  const openLightbox = (url: string, type: "image" | "video" = "image", title?: string) => {
    setLightboxMedia({ url, type, title });
  };
  const closeLightbox = () => setLightboxMedia(null);

  // Refresh current session from server cookie
  const refreshAuthSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
          setIsAuthLoading(false);
          return data.user;
        }
      }
      setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsAuthLoading(false);
    }
    return null;
  };

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

  // Fetch live database records for directory and posts
  const fetchLiveDatabaseData = async () => {
    try {
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data.users && data.users.length > 0) {
          setStudents(data.users);
        }
      }

      const postsRes = await fetch("/api/posts");
      if (postsRes.ok) {
        const data = await postsRes.json();
        if (data.posts && data.posts.length > 0) {
          setPosts(data.posts);
        }
      }
    } catch {
      // Offline fallback
    }
  };

  useEffect(() => {
    refreshAuthSession();
    fetchLiveDatabaseData();
  }, []);

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

  const updateCurrentUser = (updated: Partial<ExtendedUser>) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null));
    showToast("Profile updated successfully!", "success");
  };

  const toggleConnect = (studentId: string) => {
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

  // Memories methods
  const addMemory = (memoryData: Omit<MemoryItem, "id" | "likesCount" | "isLiked" | "comments">) => {
    const newMemory: MemoryItem = {
      ...memoryData,
      id: `mem-${Date.now()}`,
      likesCount: 1,
      isLiked: true,
      comments: [],
    };
    setMemories([newMemory, ...memories]);
    setIsNewMemoryModalOpen(false);
    showToast(`Memory added to Digital Yearbook! 🎓📸`, "success");
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

  const sendMessage = (conversationId: string, text: string) => {
    if (!text.trim()) return;

    const timeNow = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(new Date());

    const newMessage = {
      id: `msg-${Date.now()}`,
      senderId: "current-user",
      text,
      time: timeNow,
      isRead: true,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: timeNow,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      })
    );

    // Simulated reply
    setTimeout(() => {
      const conv = conversations.find((c) => c.id === conversationId);
      const student = students.find((s) => s.id === conv?.studentId);
      if (!student) return;

      const replySamples = [
        `Sounds awesome! Let's sync up after the afternoon lecture! 🚀`,
        `Got it! I'm pushing my code branch now, let me know what you think. 💻`,
        `Awesome idea, let's grab coffee at the campus center and work through the details! ☕`,
        `Nice! That's going to make our Senior Capstone demo so much stronger.`,
        `Thanks for sharing! See you in the SE lab later!`,
      ];
      const randomReply = replySamples[Math.floor(Math.random() * replySamples.length)];

      const replyTime = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      }).format(new Date());

      const replyMsg = {
        id: `msg-reply-${Date.now()}`,
        senderId: student.id,
        text: randomReply,
        time: replyTime,
        isRead: false,
      };

      setConversations((currentConvs) =>
        currentConvs.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: randomReply,
              lastMessageTime: replyTime,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1400);
  };

  const toggleMessageReaction = (conversationId: string, messageId: string, emoji: string) => {
    if (!currentUser) return;

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== conversationId) return conv;

        const updatedMessages = conv.messages.map((msg) => {
          if (msg.id !== messageId) return msg;

          const existingReactions = msg.reactions || [];
          const reactionIndex = existingReactions.findIndex((r) => r.emoji === emoji);

          if (reactionIndex > -1) {
            const currentReaction = existingReactions[reactionIndex];
            const hasReacted = currentReaction.users.includes(currentUser.id);

            let newReactions: ReactionItem[];
            if (hasReacted) {
              const newUsers = currentReaction.users.filter((u) => u !== currentUser.id);
              if (newUsers.length === 0) {
                newReactions = existingReactions.filter((_, idx) => idx !== reactionIndex);
              } else {
                newReactions = existingReactions.map((r, idx) =>
                  idx === reactionIndex ? { ...r, count: r.count - 1, users: newUsers } : r
                );
              }
            } else {
              newReactions = existingReactions.map((r, idx) =>
                idx === reactionIndex
                  ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] }
                  : r
              );
            }
            return { ...msg, reactions: newReactions };
          } else {
            const newReaction: ReactionItem = {
              emoji,
              count: 1,
              users: [currentUser.id],
            };
            return { ...msg, reactions: [...existingReactions, newReaction] };
          }
        });

        return { ...conv, messages: updatedMessages };
      })
    );
  };

  const startConversationWithStudent = (studentId: string): string => {
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

    setConversations([newConv, ...conversations]);
    setActiveConversationId(newConvId);
    return newConvId;
  };

  const toggleRSVP = (eventId: string) => {
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
  };

  const addYearbookSignature = (message: string) => {
    if (!message.trim()) return;
    const newSig: YearbookSignature = {
      id: `sig-${Date.now()}`,
      authorName: currentUser?.name || "Phoenix Classmate",
      authorAvatar: currentUser?.avatar || "/phoenix-logo.png",
      authorTrack: currentUser?.track || "Software Engineering",
      date: "Today",
      message,
    };
    setYearbookSignatures([newSig, ...yearbookSignatures]);
    showToast("Yearbook memory signed! 🎓✍️", "success");
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        theme,
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
        toggleLikeMemory,
        addMemoryComment,
        isNewPostModalOpen,
        setIsNewPostModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        isNewMemoryModalOpen,
        setIsNewMemoryModalOpen,
        activeMemoryForDetail,
        setActiveMemoryForDetail,
        lightboxMedia,
        openLightbox,
        closeLightbox,
        toast,
        showToast,
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

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
  CURRENT_USER,
  INITIAL_STUDENTS,
  INITIAL_POSTS,
  INITIAL_CONVERSATIONS,
  INITIAL_EVENTS,
  INITIAL_GALLERY,
  INITIAL_SIGNATURES,
  INITIAL_NOTIFICATIONS,
} from "../data/initialData";

export interface ExtendedUser extends Student {
  username?: string;
  email?: string;
  role?: "STUDENT" | "ADMIN";
  isActive?: boolean;
}

interface AppContextType {
  currentUser: ExtendedUser;
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
  isNewPostModalOpen: boolean;
  setIsNewPostModalOpen: (open: boolean) => void;
  isEditProfileModalOpen: boolean;
  setIsEditProfileModalOpen: (open: boolean) => void;
  lightboxImage: string | null;
  openLightbox: (imageUrl: string) => void;
  closeLightbox: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  refreshAuthSession: () => Promise<void>;
  logoutUser: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<ExtendedUser>({
    ...CURRENT_USER,
    username: "admin",
    role: "ADMIN",
    isActive: true,
  });

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string>("conv-sarah");
  const [events, setEvents] = useState<TechEvent[]>(INITIAL_EVENTS);
  const [gallery] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [yearbookSignatures, setYearbookSignatures] = useState<YearbookSignature[]>(INITIAL_SIGNATURES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Modals & UI States
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const openLightbox = (imageUrl: string) => setLightboxImage(imageUrl);
  const closeLightbox = () => setLightboxImage(null);

  // Refresh current session from server cookie
  const refreshAuthSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch {
      // Fallback
    }
  };

  // Fetch live database records for directory and posts
  const fetchLiveDatabaseData = async () => {
    try {
      // 1. Fetch Users
      const usersRes = await fetch("/api/users");
      if (usersRes.ok) {
        const data = await usersRes.json();
        if (data.users && data.users.length > 0) {
          setStudents(data.users);
        }
      }

      // 2. Fetch Posts
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
      showToast("Signed out successfully.");
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const updateCurrentUser = (updated: Partial<ExtendedUser>) => {
    setCurrentUser((prev) => ({ ...prev, ...updated }));
    showToast("Profile updated successfully!");
  };

  const toggleConnect = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextState = !s.connected;
          showToast(nextState ? `Connected with ${s.name}!` : `Disconnected from ${s.name}`);
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
          showToast("Post shared to Phoenix Feed! 🎉");
          return;
        }
      }
    } catch {
      // Fallback
    }

    // Local state fallback
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorTrack: currentUser.track,
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
    showToast("Post shared to Phoenix Feed! 🎉");
  };

  const toggleLikePost = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
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
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorTrack: currentUser.track,
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
    showToast("Comment posted!");

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

    // Simulated smart reply
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
          showToast(nextState ? `RSVP confirmed for ${e.title}! 🎟️` : `Removed RSVP for ${e.title}`);
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
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorTrack: currentUser.track,
      date: "Today",
      message,
    };
    setYearbookSignatures([newSig, ...yearbookSignatures]);
    showToast("Yearbook memory signed! 🎓✍️");
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
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
        isNewPostModalOpen,
        setIsNewPostModalOpen,
        isEditProfileModalOpen,
        setIsEditProfileModalOpen,
        lightboxImage,
        openLightbox,
        closeLightbox,
        toastMessage,
        showToast,
        refreshAuthSession,
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

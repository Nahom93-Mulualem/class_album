"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "../context/AppContext";

function MessagesContent() {
  const searchParams = useSearchParams();
  const targetUserParam = searchParams.get("user");

  const {
    currentUser,
    students,
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    toggleMessageReaction,
    startConversationWithStudent,
  } = useApp();

  const [messageText, setMessageText] = useState("");
  const [chatSearch, setChatSearch] = useState("");
  const [showMobileChatPane, setShowMobileChatPane] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const reactionMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If URL has ?user=studentId, open or create conversation with that student
  useEffect(() => {
    if (targetUserParam) {
      const convId = startConversationWithStudent(targetUserParam);
      setActiveConversationId(convId);
      const timer = setTimeout(() => setShowMobileChatPane(true), 50);
      return () => clearTimeout(timer);
    }
  }, [targetUserParam, startConversationWithStudent, setActiveConversationId]);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeStudent = students.find((s) => s.id === activeConv?.studentId);

  // Scroll to bottom of message stream
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  // Click outside to close emoji picker and reaction menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setIsEmojiPickerOpen(false);
      }
      if (reactionMenuRef.current && !reactionMenuRef.current.contains(e.target as Node)) {
        setActiveReactionMessageId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;
    sendMessage(activeConv.id, messageText);
    setMessageText("");
    setIsEmojiPickerOpen(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    setMessageText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleReactionClick = (messageId: string, emoji: string) => {
    if (!activeConv) return;
    toggleMessageReaction(activeConv.id, messageId, emoji);
    setActiveReactionMessageId(null);
  };

  const quickReactionEmojis = ["❤️", "👍", "😂", "🔥", "🚀", "👏", "🎉", "💯"];

  const emojiCategories = [
    {
      name: "Trending & Reactions",
      emojis: ["❤️", "🔥", "🚀", "👍", "😂", "👏", "🎉", "💯", "✨", "💡", "😍", "🙌", "🤝", "⚡️"],
    },
    {
      name: "Tech & Campus",
      emojis: ["💻", "🤖", "☕️", "🍕", "🎓", "📚", "🏆", "🎯", "🛠️", "📝", "🧠", "💼", "🍻", "🚀"],
    },
    {
      name: "Faces & Vibes",
      emojis: ["😎", "🤩", "🥳", "😴", "🤔", "🫡", "💪", "👀", "🌟", "👋", "🥳", "😇", "🤫", "✨"],
    },
  ];

  const filteredConversations = conversations.filter((c) => {
    const student = students.find((s) => s.id === c.studentId);
    if (!student) return true;
    return (
      student.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(chatSearch.toLowerCase()) ||
      student.track.toLowerCase().includes(chatSearch.toLowerCase())
    );
  });

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto flex h-[calc(100vh-64px)] overflow-hidden bg-surface-container-lowest border-l border-r border-outline-variant/30 animate-page-entry">
      {/* Conversations List (Left Pane) */}
      <aside
        className={`w-full md:w-80 border-r border-outline-variant/30 flex flex-col bg-surface-container-lowest h-full z-10 transition-transform duration-300 md:relative absolute inset-0 ${
          showMobileChatPane ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        }`}
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-20 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-lg font-bold text-primary">Direct Messages</h1>
              <p className="text-[11px] text-on-surface-variant font-medium">Phoenix • 1-on-1 Cohort Chats</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-fixed text-primary rounded-full">
              {conversations.length} Active
            </span>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="Search conversations..."
              value={chatSearch}
              onChange={(e) => setChatSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-transparent focus:border-primary/30 rounded-full py-2 pl-9 pr-4 text-xs font-body text-on-surface outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto hide-scrollbar p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const student = students.find((s) => s.id === conv.studentId);
            if (!student) return null;
            const isActive = activeConv?.id === conv.id;

            return (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setShowMobileChatPane(true);
                }}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-secondary-container/30 border border-secondary-container/50 shadow-xs"
                    : "hover:bg-surface-container-low border border-transparent"
                }`}
              >
                {/* Avatar with Online indicator */}
                <div className="relative shrink-0">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-11 h-11 rounded-full object-cover border border-outline-variant/30 shadow-xs"
                  />
                  {student.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface-container-lowest rounded-full"></div>
                  )}
                </div>

                {/* Info & Last Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-headline text-xs font-bold text-primary truncate">
                      {student.name}
                    </h3>
                    <span className="text-[10px] text-on-surface-variant font-medium shrink-0 ml-1">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant line-clamp-1 font-body">
                    {conv.lastMessage}
                  </p>
                  <span className="text-[9px] font-semibold text-secondary block mt-0.5 truncate">
                    {student.track}
                  </span>
                </div>

                {/* Unread Counter Badge */}
                {conv.unreadCount > 0 && (
                  <div className="shrink-0 self-center">
                    <span className="w-5 h-5 bg-error text-on-error font-headline text-[10px] font-bold flex items-center justify-center rounded-full shadow-xs">
                      {conv.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Active 1-on-1 Chat Window (Right Pane) */}
      <section
        className={`flex-1 flex flex-col bg-surface-bright h-full relative z-20 transition-transform duration-300 md:translate-x-0 ${
          showMobileChatPane ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {activeStudent ? (
          <>
            {/* Active Chat Header */}
            <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-outline-variant/30 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {/* Mobile Back to List Button */}
                <button
                  onClick={() => setShowMobileChatPane(false)}
                  className="md:hidden p-1.5 -ml-1 text-on-surface-variant hover:bg-surface-container-low rounded-full cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back</span>
                </button>

                <Link href={`/profile/${activeStudent.id}`} className="relative shrink-0 group">
                  <img
                    src={activeStudent.avatar}
                    alt={activeStudent.name}
                    className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shadow-xs group-hover:scale-105 transition-transform"
                  />
                  {activeStudent.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface-container-lowest rounded-full"></div>
                  )}
                </Link>

                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${activeStudent.id}`}
                      className="font-headline text-sm font-bold text-primary hover:underline truncate"
                    >
                      {activeStudent.name}
                    </Link>
                    <span className="px-2 py-0.2 bg-gradient-to-r from-secondary-container to-primary-container text-on-primary font-headline text-[9px] font-bold rounded-full shadow-xs">
                      Phoenix &apos;26
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-medium">
                    {activeStudent.online ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active now</span>
                    ) : (
                      "Offline"
                    )}{" "}
                    • {activeStudent.track}
                  </p>
                </div>
              </div>

              {/* Header Profile Link */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${activeStudent.id}`}
                  className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-xs font-bold text-primary flex items-center gap-1 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">person</span>
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              </div>
            </header>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 hide-scrollbar">
              {/* Date Divider */}
              <div className="flex justify-center my-2">
                <span className="px-3 py-1 bg-surface-container-low/90 border border-outline-variant/20 rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-wider shadow-xs">
                  Direct Messages • Phoenix Batch 2026
                </span>
              </div>

              {/* Messages List */}
              {activeConv?.messages.map((msg) => {
                const isCurrentUser =
                  msg.senderId === "current-user" ||
                  (currentUser && msg.senderId === currentUser.id);
                const hasReactions = msg.reactions && msg.reactions.length > 0;
                const isReactionMenuOpen = activeReactionMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`relative group flex gap-2.5 max-w-[85%] ${
                      isCurrentUser ? "ml-auto justify-end" : "justify-start"
                    }`}
                  >
                    {!isCurrentUser && (
                      <img
                        src={activeStudent.avatar}
                        alt={activeStudent.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto shadow-xs"
                      />
                    )}

                    <div className={`flex flex-col gap-1.5 ${isCurrentUser ? "items-end" : "items-start"}`}>
                      {/* Message Bubble + Reaction trigger wrapper */}
                      <div className="relative group/bubble flex items-center gap-1">
                        {/* Reaction Trigger Button (Left side if current user) */}
                        {isCurrentUser && (
                          <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveReactionMessageId(isReactionMenuOpen ? null : msg.id)
                              }
                              className="p-1 hover:bg-surface-container-highest text-on-surface-variant rounded-full text-xs transition-colors cursor-pointer"
                              title="Add reaction"
                            >
                              <span className="material-symbols-outlined text-base">add_reaction</span>
                            </button>
                          </div>
                        )}

                        {/* Text Bubble */}
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-body leading-relaxed shadow-sm relative ${
                            isCurrentUser
                              ? "bg-primary text-on-primary rounded-br-none"
                              : "bg-surface-container-lowest text-on-surface rounded-bl-none border border-outline-variant/20"
                          }`}
                        >
                          {msg.text}
                        </div>

                        {/* Reaction Trigger Button (Right side if classmate) */}
                        {!isCurrentUser && (
                          <div className="opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveReactionMessageId(isReactionMenuOpen ? null : msg.id)
                              }
                              className="p-1 hover:bg-surface-container-highest text-on-surface-variant rounded-full text-xs transition-colors cursor-pointer"
                              title="Add reaction"
                            >
                              <span className="material-symbols-outlined text-base">add_reaction</span>
                            </button>
                          </div>
                        )}

                        {/* Quick Reaction Floating Bar */}
                        {isReactionMenuOpen && (
                          <div
                            ref={reactionMenuRef}
                            className={`absolute z-30 bottom-full mb-1 flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/30 rounded-full px-2 py-1 shadow-2xl animate-fadeIn ${
                              isCurrentUser ? "right-0" : "left-0"
                            }`}
                          >
                            {quickReactionEmojis.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleReactionClick(msg.id, emoji)}
                                className="w-7 h-7 hover:scale-125 transition-transform flex items-center justify-center text-sm rounded-full hover:bg-surface-container-high cursor-pointer"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Active Emoji Reaction Badges Under Message */}
                      {hasReactions && (
                        <div className={`flex flex-wrap gap-1 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                          {msg.reactions!.map((reaction) => {
                            const userReacted = currentUser
                              ? reaction.users.includes(currentUser.id) || (currentUser.id === "user-admin" && reaction.users.includes("current-user")) || reaction.users.includes("current-user")
                              : false;
                            return (
                              <button
                                key={reaction.emoji}
                                type="button"
                                onClick={() => handleReactionClick(msg.id, reaction.emoji)}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                  userReacted
                                    ? "bg-secondary-container/40 border-secondary text-primary shadow-xs scale-105"
                                    : "bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container-high"
                                }`}
                                title={`${reaction.users.length} reaction${reaction.users.length > 1 ? "s" : ""}`}
                              >
                                <span>{reaction.emoji}</span>
                                <span className="text-[10px] font-bold">{reaction.count}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Message Time and Status */}
                      <div className="flex items-center gap-1 px-1">
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {msg.time}
                        </span>
                        {isCurrentUser && (
                          <span className="material-symbols-outlined text-[13px] text-primary">
                            done_all
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Box & Emoji Picker */}
            <div className="p-3 md:p-4 bg-surface-container-lowest border-t border-outline-variant/30 relative">
              {/* Emoji Picker Popover */}
              {isEmojiPickerOpen && (
                <div
                  ref={emojiPickerRef}
                  className="absolute bottom-full left-4 mb-2 w-72 sm:w-80 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-2xl p-3 z-50 space-y-2.5 animate-fadeIn backdrop-blur-md"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
                    <span className="text-xs font-bold text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary text-base">sentiment_satisfied</span>
                      Select Emoji
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEmojiPickerOpen(false)}
                      className="text-on-surface-variant hover:bg-surface-container-high p-1 rounded-full text-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-3 hide-scrollbar">
                    {emojiCategories.map((cat) => (
                      <div key={cat.name}>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                          {cat.name}
                        </p>
                        <div className="grid grid-cols-7 gap-1">
                          {cat.emojis.map((em, idx) => (
                            <button
                              key={`${cat.name}-${idx}`}
                              type="button"
                              onClick={() => handleInsertEmoji(em)}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 hover:bg-surface-container-high rounded-lg transition-transform cursor-pointer"
                            >
                              {em}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-surface-container-low rounded-2xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/30 border border-transparent focus-within:border-primary/20 transition-all shadow-inner">
                  {/* Emoji Trigger in Input */}
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                    className="p-1 text-on-surface-variant hover:text-secondary hover:bg-surface-container-high rounded-full transition-colors mr-1.5 cursor-pointer"
                    title="Insert Emoji"
                  >
                    <span className="material-symbols-outlined text-lg leading-none">sentiment_satisfied</span>
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Message ${activeStudent.name}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs sm:text-sm font-body text-on-surface outline-none py-1.5"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-2.5 bg-secondary-container text-on-secondary-container rounded-full hover:brightness-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label="Send message"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-2">chat</span>
            <h3 className="font-headline font-bold text-base text-primary">Select a Classmate</h3>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
              Choose a Phoenix classmate from the left list or directory to start chatting.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}

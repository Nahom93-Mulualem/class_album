"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "./context/AppContext";

export default function RootEntryPage() {
  const router = useRouter();
  const { currentUser, isAuthLoading } = useApp();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!currentUser) {
        // Unauthenticated visitor -> strictly navigate to /login
        router.replace("/login");
      } else if (currentUser.role === "ADMIN") {
        // Authenticated Admin -> navigate to Admin Console
        router.replace("/admin");
      } else {
        // Authenticated Student -> navigate to Class Feed
        router.replace("/feed");
      }
    }
  }, [currentUser, isAuthLoading, router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-secondary/40 bg-black/40 p-0.5 shadow-xl animate-float">
          <img
            src="/phoenix-logo.png"
            alt="Phoenix Batch Crest"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 text-primary font-headline font-bold text-sm">
          <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>Redirecting to Phoenix Portal...</span>
        </div>
      </div>
    </div>
  );
}

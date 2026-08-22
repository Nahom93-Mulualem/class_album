import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import TopNavBar from "./components/TopNavBar";
import SideNavBar from "./components/SideNavBar";
import MobileBottomNav from "./components/MobileBottomNav";
import NewPostModal from "./components/NewPostModal";
import EditProfileModal from "./components/EditProfileModal";
import ImageLightboxModal from "./components/ImageLightboxModal";
import ToastContainer from "./components/ToastContainer";

export const metadata: Metadata = {
  title: "Class of 2026 • Software Engineering Alumni & Lounge",
  description: "Official digital lounge and class directory for Software Engineering Class of 2026 graduates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Montserrat:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-body bg-background text-on-background antialiased selection:bg-secondary-container selection:text-on-secondary-container">
        <AppProvider>
          {/* Top Shared Navbar */}
          <TopNavBar />

          {/* Main App Layout Container */}
          <div className="flex-1 w-full max-w-7xl mx-auto pt-16 flex">
            {/* Desktop Side Navigation */}
            <SideNavBar />

            {/* Page Content Container */}
            <div className="flex-1 md:ml-64 w-full min-h-[calc(100vh-64px)] flex flex-col">
              {children}
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />

          {/* Global Modals & Notifications */}
          <NewPostModal />
          <EditProfileModal />
          <ImageLightboxModal />
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}

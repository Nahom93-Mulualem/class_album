import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "./context/AppContext";
import AppLayoutShell from "./components/AppLayoutShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  title: "Phoenix • Software Engineering Class of 2026 Digital Yearbook & Lounge",
  description: "Official digital lounge, class directory, and digital yearbook memory vault for the Phoenix Software Engineering Batch of 2026.",
  openGraph: {
    title: "Phoenix • Software Engineering Class of 2026",
    description: "Celebrating 6 Years of Innovation, Friendship & Milestones. Explore our memories, directory, and digital yearbook vault.",
    url: "/",
    siteName: "Phoenix Class Album 2026",
    images: [
      {
        url: "/phoenix-logo.png",
        width: 800,
        height: 800,
        alt: "Phoenix Class of 2026 Crest",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Phoenix • Software Engineering Class of 2026",
    description: "Official digital lounge and yearbook memory vault for the Phoenix Software Engineering Batch of 2026.",
    images: ["/phoenix-logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
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
          <AppLayoutShell>{children}</AppLayoutShell>
        </AppProvider>
      </body>
    </html>
  );
}

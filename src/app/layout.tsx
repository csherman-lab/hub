import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { GrokBootstrap } from "@/components/ai/GrokBootstrap";
import { HubStorageBootstrap } from "@/components/layout/HubStorageBootstrap";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CommandPalette } from "@/components/layout/CommandPalette";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hub — Your Personal AI Agent",
  description:
    "Create your personalized AI agent. Text, call, and video chat with expressive cartoon avatars that help automate your work.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Hub",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#007AFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#f5f5f7] text-zinc-900 dark:bg-black dark:text-zinc-100">
        <ThemeProvider>
          <HubStorageBootstrap />
          <GrokBootstrap />
          <ToastProvider />
          <CommandPalette />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

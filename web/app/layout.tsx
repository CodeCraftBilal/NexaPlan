import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers/Providers";

export const metadata: Metadata = {
  title: "ProjectAI — AI Powered Project Management",
  description: "Manage projects effortlessly with AI assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-primary/25">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

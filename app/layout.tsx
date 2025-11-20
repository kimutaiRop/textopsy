import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://textopsy.com"),
  title: {
    default: "Textopsy - Decode the Subtext | Message Autopsy Analysis",
    template: "%s | Textopsy",
  },
  description: "Persona-driven analysis for your confusing text threads. Find out if you're being ghosted, gaslit, or loved. Analyze messages with AI-powered insights.",
  keywords: [
    "text analysis",
    "message analysis",
    "relationship advice",
    "conversation analysis",
    "text thread analysis",
    "ghosting detection",
    "communication analysis",
    "AI text analysis",
  ],
  authors: [{ name: "Textopsy" }],
  creator: "Textopsy",
  publisher: "Textopsy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Textopsy",
    title: "Textopsy - Decode the Subtext | Message Autopsy Analysis",
    description: "Persona-driven analysis for your confusing text threads. Find out if you're being ghosted, gaslit, or loved.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Textopsy - Decode the Subtext",
    description: "Persona-driven analysis for your confusing text threads. Find out if you're being ghosted, gaslit, or loved.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

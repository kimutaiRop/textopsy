import type { Metadata } from "next";
import HomePageClient from "@/components/HomePageClient";

export const metadata: Metadata = {
  title: "Textopsy - Decode the Subtext | Message Autopsy Analysis",
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://textopsy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Textopsy",
    title: "Textopsy - Decode the Subtext | Message Autopsy Analysis",
    description: "Persona-driven analysis for your confusing text threads. Find out if you're being ghosted, gaslit, or loved.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Textopsy - Message Autopsy Analysis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Textopsy - Decode the Subtext",
    description: "Persona-driven analysis for your confusing text threads. Find out if you're being ghosted, gaslit, or loved.",
    images: ["/og-image.png"],
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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Textopsy",
            description: "Persona-driven analysis for your confusing text threads. Find out if you're being ghosted, gaslit, or loved.",
            url: process.env.NEXT_PUBLIC_APP_URL || "https://textopsy.com",
            applicationCategory: "UtilityApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              ratingCount: "1",
            },
          }),
        }}
      />
      <HomePageClient />
    </>
  );
}

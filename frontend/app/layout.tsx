import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond, Lora, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { StickyCTA } from "@/components/client/sticky-cta";
import { ScrollToTop } from "@/components/client/scroll-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Premium display font - elegant serif for headings
const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

// Elegant body font - pairs beautifully with Cormorant
const lora = Lora({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
});

// Mono font for prices
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-alt",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://premium-flora.vercel.app"),
  title: {
    default: "Premium Flora — Оптові поставки квітів",
    template: "%s | Premium Flora",
  },
  description:
    "Преміальні оптові поставки свіжих квітів для флористів, готелів та івент-агентств. Холодний ланцюг, доставка по Україні. Нові поставки щоп'ятниці.",
  keywords: ["оптові квіти", "квіти оптом", "флористика", "доставка квітів", "купити квіти оптом", "Київ", "Україна", "premium flora", "свіжі квіти"],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Premium Flora",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Premium Flora — Оптові поставки квітів",
    description: "Преміальні оптові поставки свіжих квітів для флористів, готелів та івент-агентств. Нові поставки щоп'ятниці.",
    locale: "uk_UA",
    type: "website",
    siteName: "Premium Flora",
    url: "https://premium-flora.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Premium Flora — Оптові поставки квітів",
    description: "Преміальні оптові поставки свіжих квітів для флористів, готелів та івент-агентств.",
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
  alternates: {
    canonical: "https://premium-flora.vercel.app",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${lora.variable} ${jetbrainsMono.variable} antialiased min-h-screen text-slate-900 dark:text-[var(--admin-text-primary)]`}
      >
        {/* Scroll to top on route change */}
        <ScrollToTop />
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="skip-link">
          Перейти до основного контенту
        </a>
        <div id="main-content" className="min-h-screen gpu-accelerated">
          {children}
        </div>
        {/* Sticky CTA - appears on scroll */}
        <StickyCTA />
      </body>
    </html>
  );
}

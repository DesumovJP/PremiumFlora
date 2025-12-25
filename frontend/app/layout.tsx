import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Premium Flora — Оптові поставки квітів",
  description:
    "Преміальні оптові поставки свіжих квітів для флористів, готелів та івент-агентств. Холодний ланцюг -20°C, доставка 24/48h по Україні.",
  keywords: ["оптові квіти", "флористика", "доставка квітів", "Київ", "Україна", "premium flora"],
  openGraph: {
    title: "Premium Flora — Оптові поставки квітів",
    description: "Преміальні оптові поставки свіжих квітів для флористів, готелів та івент-агентств.",
    locale: "uk_UA",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#f9fbfa] dark:bg-[#0d1117] text-slate-900 dark:text-[var(--admin-text-primary)]`}
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

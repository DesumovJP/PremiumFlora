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
  title: "Premium Flora",
  description:
    "Premium Flora — головний сайт і адмін-панель з POS, товарами, клієнтами та аналітикою.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[radial-gradient(1200px_circle_at_10%_10%,#ecf8f1,transparent),radial-gradient(1400px_circle_at_90%_20%,#eef2ff,transparent),linear-gradient(180deg,#f9fbfa_0%,#f4f7f6_40%,#f7faf9_100%)] text-slate-900`}
      >
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}

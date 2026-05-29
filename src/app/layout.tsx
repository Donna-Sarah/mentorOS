import type { Metadata } from "next";
import { Inter, Montserrat, Playfair } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const montserrat = Montserrat({
  weight: "700",
  subsets: ["latin", "vietnamese"],
  variable: "--font-display",
});

const inter = Inter({
  weight: ["400", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
});

const playfair = Playfair({
  weight: "300",
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "mentorOS — Suy nghĩ rõ hơn. Học nhanh hơn. Làm việc thông minh hơn.",
  description:
    "Hệ thống tư duy chuyên môn bằng AI — học và làm việc hiệu quả hơn với mentorOS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${montserrat.variable} ${inter.variable} ${playfair.variable} font-body antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0B1220" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />
        <meta name="apple-mobile-web-app-title" content="mentorOS" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="bg-white-canvas text-midnight-ink min-h-screen">
        {/* TODO: analytics — initialize tracking (e.g. Plausible / PostHog) here */}
        <LanguageProvider>
          <Navbar />
          <main className="pt-[56px] md:pt-[64px]">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}

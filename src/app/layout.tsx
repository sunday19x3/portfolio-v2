import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { TransitionProvider } from "@/components/TransitionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sunday19x3.xyz"),
  title: "Sunday — Frontend & Web3 developer",
  description: "Frontend & Web3 developer, based in Hanoi.",
  openGraph: {
    title: "Sunday — Frontend & Web3 developer",
    description: "Frontend & Web3 developer, based in Hanoi.",
    type: "website",
    url: "https://sunday19x3.xyz",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sunday — Frontend & Web3 developer",
    description: "Frontend & Web3 developer, based in Hanoi.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <TransitionProvider>{children}</TransitionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

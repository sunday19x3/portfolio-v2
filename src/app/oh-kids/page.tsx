import type { Metadata } from "next";
import View from "./view";

export const metadata: Metadata = {
  title: "Oh Kids — Draft · Sunday",
  description:
    "A baby-clothing brand on TikTok Shop with inventory that doesn't lie when 40 livestream orders land at once. Draft case study.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Oh Kids — Draft · Sunday",
    description: "Baby-clothing brand on TikTok Shop — draft case study.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oh Kids — Draft · Sunday",
    description: "Baby-clothing brand on TikTok Shop — draft case study.",
  },
};

export default function Page() {
  return <View />;
}

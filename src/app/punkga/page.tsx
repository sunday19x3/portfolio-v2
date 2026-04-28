import type { Metadata } from "next";
import View from "./view";

export const metadata: Metadata = {
  title: "Punkga.me — № 02 · Sunday",
  description:
    "A cyberpunk manga multiverse — readers, artists, and characters share one on-chain world where every chapter, mint, and cameo is licensable IP.",
  openGraph: {
    title: "Punkga.me — № 02 · Sunday",
    description: "Cyberpunk manga multiverse — case study.",
    images: ["/projects/punkga-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Punkga.me — № 02 · Sunday",
    description: "Cyberpunk manga multiverse — case study.",
    images: ["/projects/punkga-banner.png"],
  },
};

export default function Page() {
  return <View />;
}

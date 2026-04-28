import type { Metadata } from "next";
import View from "./view";

export const metadata: Metadata = {
  title: "Dichung — № 04 · Sunday",
  description:
    "On-demand ride-share and delivery across 40+ Vietnamese provinces — airport transfers, shared trips, self-drive rentals, and express cargo. Case study by Sunday.",
  openGraph: {
    title: "Dichung — № 04 · Sunday",
    description:
      "Vietnam-wide ride-share and delivery platform — case study.",
    images: ["/projects/dichung-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dichung — № 04 · Sunday",
    description:
      "Vietnam-wide ride-share and delivery platform — case study.",
    images: ["/projects/dichung-banner.png"],
  },
};

export default function Page() {
  return <View />;
}

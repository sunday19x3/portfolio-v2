import type { Metadata } from "next";
import View from "./view";

export const metadata: Metadata = {
  title: "Mimboku — № 01 · Sunday",
  description:
    "First native liquidity aggregator and top NFT community on Story — swap, stake, mint, and earn ecosystem rewards. Case study by Sunday.",
  openGraph: {
    title: "Mimboku — № 01 · Sunday",
    description:
      "First native liquidity aggregator on Story Protocol — case study.",
    images: ["/projects/mimboku-banner.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mimboku — № 01 · Sunday",
    description:
      "First native liquidity aggregator on Story Protocol — case study.",
    images: ["/projects/mimboku-banner.jpeg"],
  },
};

export default function Page() {
  return <View />;
}

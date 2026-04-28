import type { Metadata } from "next";
import View from "./view";

export const metadata: Metadata = {
  title: "Pyxis Safe — № 03 · Sunday",
  description:
    "Multi-signature safe for the Cosmos interchain — co-owners share custody, M-of-N approval to move funds. Case study by Sunday.",
  openGraph: {
    title: "Pyxis Safe — № 03 · Sunday",
    description: "Cosmos-native multi-signature safe — case study.",
    images: ["/projects/pyxis-banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pyxis Safe — № 03 · Sunday",
    description: "Cosmos-native multi-signature safe — case study.",
    images: ["/projects/pyxis-banner.png"],
  },
};

export default function Page() {
  return <View />;
}

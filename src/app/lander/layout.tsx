import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SNUGPT — University Intelligence Engine",
  description: "The ultimate student brain engine for Shiv Nadar University. Neural-grade search for policies, academics, and campus intelligence.",
  keywords: ["SNU", "Shiv Nadar University", "AI", "Intelligence", "Student Assistant", "SNUGPT"],
  openGraph: {
    title: "SNUGPT",
    description: "The Student Brain Engine for Shiv Nadar University.",
    type: "website",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SNUGPT",
    description: "The Student Brain Engine for Shiv Nadar University.",
    images: ["/og-image.png"],
  }
};

export default function LanderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

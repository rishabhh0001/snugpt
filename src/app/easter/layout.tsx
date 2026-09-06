import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SNU Campus Glider | Easter Egg Arcade Game",
  description:
    "An interactive retro arcade game easter egg on SNUGPT. Pilot through campus blocks, dodge obstacles, collect attendance passes, and compete for the high score on PC and mobile.",
};

export default function EasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

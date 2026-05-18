"use client";

import { MorphingSquare } from "@/components/ui/morphing-square";

export default function RootLoading() {
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#050505] z-[99999999999]">
      <MorphingSquare message="Loading..." />
    </div>
  );
}

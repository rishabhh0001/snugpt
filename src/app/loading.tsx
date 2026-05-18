"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Preloader from "@/components/ui/preloader";
import { MorphingSquare } from "@/components/ui/morphing-square";

export default function RootLoading() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // For sub-pages/other pages, show the elegant MorphingSquare spinner centered on the screen
  if (pathname !== "/") {
    return (
      <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-background z-[99999999999]">
        <MorphingSquare message="Loading..." />
      </div>
    );
  }

  if (!loading) return null;

  return <Preloader onComplete={() => setLoading(false)} />;
}

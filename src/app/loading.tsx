"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Preloader from "@/components/ui/preloader";

export default function RootLoading() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  // Only show the greeting splash preloader on the home page (landing page)
  if (pathname !== "/") {
    return null;
  }

  if (!loading) return null;

  return <Preloader onComplete={() => setLoading(false)} />;
}

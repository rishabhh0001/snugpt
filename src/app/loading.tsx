"use client";

import { useState } from "react";
import Preloader from "@/components/ui/preloader";

export default function RootLoading() {
  const [loading, setLoading] = useState(true);

  if (!loading) return null;

  return <Preloader onComplete={() => setLoading(false)} />;
}

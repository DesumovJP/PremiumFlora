"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * ScrollToTop component that scrolls to top when the route changes.
 * This ensures that when navigating between pages, the user starts at the top.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when the route changes
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

"use client";

import { useEffect, useState } from "react";

/**
 * Lazy-loads Tailwind utilities CSS to avoid render-blocking.
 * Shows content immediately but applies utility classes after CSS loads.
 */
export function TailwindUtilities() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // @ts-expect-error - CSS import for lazy loading
    import("./utilities.css").then(() => {
      setLoaded(true);
    });
  }, []);

  return null;
}

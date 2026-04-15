"use client";

import { useEffect, useState } from "react";

/**
 * Lazy-loads Tailwind utilities CSS to avoid render-blocking.
 * Shows content immediately but applies utility classes after CSS loads.
 */
export function TailwindUtilities() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    
    // @ts-expect-error - CSS import for lazy loading
    import("./utilities.css")
      .then(() => {
        if (!cancelled) {
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (!cancelled && process.env.NODE_ENV === 'development') {
          console.error('Failed to load utilities CSS:', error);
        }
      });
    
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}

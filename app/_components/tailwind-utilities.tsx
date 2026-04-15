"use client";

import { useEffect } from "react";

/**
 * Lazy-loads Tailwind utilities CSS to avoid render-blocking.
 * CSS is cached after first load, so no need to track state.
 */
export function TailwindUtilities() {
  useEffect(() => {
    // @ts-expect-error - CSS import for lazy loading
    import("./utilities.css").catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load utilities CSS:', error);
      }
    });
    
    // No cleanup needed - CSS imports are cached by the browser
  }, []);

  return null;
}

"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * Lazy-loads CSS module styles after component mount to avoid render-blocking CSS.
 * Returns the hashed CSS module class name once loaded, 
 * enabling SSR while deferring animation/non-critical styles to the client.
 * 
 * @param importStyles - Memoized function that imports the CSS module (wrap in useCallback or define outside component)
 * @param className - The CSS class name to extract from the module
 */
export function useLazyStyles(
  importStyles: () => Promise<{ default: Record<string, string> }>,
  className: string
) {
  const [loadedClassName, setLoadedClassName] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    
    importStyles().then((styles) => {
      // Only update state if effect hasn't been cleaned up
      if (!cancelled) {
        setLoadedClassName(styles.default[className]);
      }
    }).catch((error) => {
      if (!cancelled) {
        console.error('Failed to load lazy styles:', error);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [importStyles, className]);

  return loadedClassName;
}

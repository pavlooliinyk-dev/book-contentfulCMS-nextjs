"use client";

import { useEffect, useState } from "react";

/**
 * Lazy-loads CSS module styles after component mount to avoid render-blocking CSS.
 * Returns the hashed CSS module class name once loaded, 
 * enabling SSR while deferring animation/non-critical styles to the client.
 * 
 * React 18+ safely handles state updates after unmount, so no manual tracking needed.
 * 
 * @param importStyles - Memoized function that imports the CSS module (define outside component or wrap in useCallback)
 * @param className - The CSS class name to extract from the module
 * @returns The loaded CSS module class name, or empty string while loading
 */
export function useLazyStyles(
  importStyles: () => Promise<{ default: Record<string, string> }>,
  className: string
): string {
  const [loadedClassName, setLoadedClassName] = useState<string>("");

  useEffect(() => {
    // Load styles asynchronously
    // React 18+ safely ignores state updates on unmounted components
    (async () => {
      try {
        const styles = await importStyles();
        const resolvedClassName = styles.default?.[className];
        setLoadedClassName(resolvedClassName || "");
      } catch (error) {
        console.error(
          `[useLazyStyles] Failed to load lazy styles for class "${className}":`,
          error
        );
      }
    })();
  }, [importStyles, className]);

  return loadedClassName;
}

"use client";

import { useEffect, useState, useRef } from "react";

/**
 * Lazy-loads CSS module styles after component mount to avoid render-blocking CSS.
 * Returns the hashed CSS module class name once loaded, 
 * enabling SSR while deferring animation/non-critical styles to the client.
 * 
 * @param importStyles - Memoized function that imports the CSS module (wrap in useCallback or define outside component)
 * @param className - The CSS class name to extract from the module
 * @returns The loaded CSS module class name, or empty string while loading
 */
export function useLazyStyles(
  importStyles: () => Promise<{ default: Record<string, string> }>,
  className: string
): string {
  const [loadedClassName, setLoadedClassName] = useState<string>("");
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    // Track mount status via ref
    isMountedRef.current = true;

    (async () => {
      try {
        const styles = await importStyles();
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          const resolvedClassName = styles.default?.[className];
          
          setLoadedClassName(resolvedClassName || "");
        }
      } catch (error) {
        // Only log error if component is still mounted
        if (isMountedRef.current) {
          console.error(
            `[useLazyStyles] Failed to load lazy styles for class "${className}":`,
            error
          );
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, [importStyles, className]);

  return loadedClassName;
}

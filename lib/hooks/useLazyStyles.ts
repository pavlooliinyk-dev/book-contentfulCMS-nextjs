"use client";

import { useEffect, useState } from "react";

/**
 * Lazy-loads CSS module styles after component mount to avoid render-blocking CSS.
 * Returns the hashed CSS module class name once loaded, 
 * enabling SSR while deferring animation/non-critical styles to the client.
 */
export function useLazyStyles(
  importStyles: () => Promise<{ default: Record<string, string> }>,
  className: string
) {
  const [loadedClassName, setLoadedClassName] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    importStyles().then((styles) => {
      if (isMounted) {
        setLoadedClassName(styles.default[className]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [importStyles, className]);

  return loadedClassName;
}

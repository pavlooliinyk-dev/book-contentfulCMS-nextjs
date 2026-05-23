import { useState, useEffect, useRef } from "react";

/**
 * Debounces a pending/loading state to prevent UI flashing on fast operations.
 * 
 * @param isPending - The actual pending/loading state to debounce
 * @param showDelay - Delay before showing the pending state (default: 150ms)
 * @param hideDelay - Minimum time to keep the pending state visible once shown (default: 300ms)
 * @returns Debounced pending state
 */
export function useDebouncedPending(
  isPending: boolean,
  showDelay = 0,
  hideDelay = 300
): boolean {
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPending) {
      timer = setTimeout(() => {
        setShowPending(true);
      }, showDelay);
    } else {
      timer = setTimeout(() => {
        setShowPending(false);
      }, hideDelay);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isPending, showDelay, hideDelay]);

  return showPending;
}

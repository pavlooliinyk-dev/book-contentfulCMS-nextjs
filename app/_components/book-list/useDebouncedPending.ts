import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";

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
  const debouncedShow = useDebounce(isPending, showDelay);
  const debouncedHide = useDebounce(isPending, hideDelay);
  
  const [showPending, setShowPending] = useState(false);

  useEffect(() => {
    if (isPending) {
      if (debouncedShow) setShowPending(true);
    } else {
      if (!debouncedHide) setShowPending(false);
    }
  }, [isPending, debouncedShow, debouncedHide]);

  return showPending;
}

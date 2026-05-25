"use client";

interface InfiniteScrollSentinelProps {
  sentinelRef: (node: HTMLDivElement | null) => void;
  loading: boolean;
}

export default function InfiniteScrollSentinel({ sentinelRef, loading }: InfiniteScrollSentinelProps) {
  return (
    <div
      ref={sentinelRef}
      className="h-10"
      role="status"
      aria-label="Loading more books"
      aria-live="polite"
      aria-busy={loading}
    />
  );
}

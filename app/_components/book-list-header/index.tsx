"use client";

import Link from "next/link";

interface BookListHeaderProps {
  bookCount: number;
  total: number;
  isInfinite: boolean;
  showPending: boolean;
  onTogglePagination: () => void;
}

export default function BookListHeader({
  bookCount,
  total,
  isInfinite,
  showPending,
  onTogglePagination,
}: BookListHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-4xl font-bold">
        <Link href="/books">
          Books ({bookCount} of {total}){showPending ? " - Updating..." : ""}
        </Link>
      </h2>
      <button
        onClick={onTogglePagination}
        className="text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
      >
        {isInfinite ? "Switch to Buttons" : "Switch to Infinite Scroll"}
      </button>
    </div>
  );
}

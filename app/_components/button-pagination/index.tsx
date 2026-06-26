"use client";

interface ButtonPaginationProps {
  page: number;
  total: number;
  limit: number;
  disabled: boolean;
  onGoToPage: (dir: 1 | -1) => void;
}

export default function ButtonPagination({ page, total, limit, disabled, onGoToPage }: ButtonPaginationProps) {
  return (
    <div className="mt-12 flex justify-center items-center gap-8">
      <button
        onClick={() => onGoToPage(-1)}
        disabled={page === 0 || disabled}
        className="px-6 py-2 border border-black rounded disabled:opacity-30
          disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
      >
        ← Previous
      </button>
      <span className="font-mono text-lg">
        Page {page + 1} of {Math.ceil(total / limit)}
      </span>
      <button
        onClick={() => onGoToPage(1)}
        disabled={(page + 1) * limit >= total || disabled}
        className="px-6 py-2 border border-black rounded disabled:opacity-30 
          disabled:cursor-not-allowed hover:bg-black hover:text-white transition"
      >
        Next →
      </button>
    </div>
  );
}

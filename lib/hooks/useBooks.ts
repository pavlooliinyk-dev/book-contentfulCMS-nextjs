// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Book, TaxonomyTerm } from "../types";

// interface UseBooksProps {
//   initialBooks: Book[];
//   initialTotal: number;
//   limit: number;
// }

// export function useBooks({ initialBooks, initialTotal, limit }: UseBooksProps) {
//   const [books, setBooks] = useState<Book[]>(initialBooks);
//   const [total, setTotal] = useState(initialTotal);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(0);
//   const [isInfinite, setIsInfinite] = useState(true);
//   const [selectedTaxTitles, setSelectedTaxTitles] = useState<string[]>([]);
//   const sentinelRef = useRef<HTMLDivElement>(null);

//   console.log('[DEBUG]: useBooks init');
  
//   const fetchBooks = (skip: number, append = false, currentTaxTitles = selectedTaxTitles) => {
//     setLoading(true);
//     const taxParam = currentTaxTitles.length > 0 ? `&taxonomies=${currentTaxTitles.join(",")}` : "";
//     fetch(`/api/books?limit=${limit}&skip=${skip}${taxParam}`)
//       .then((r) => r.json())
//       .then((data) => {
//         if (data.errors || data.error) {
//           setError(data.error || "Error fetching books");
//           return;
//         }
//         const newItems = data.items || [];
//         setBooks((prev) => {
//           const combined = append ? [...prev, ...newItems] : newItems;
//           const unique = combined.filter((book: Book, index: number, self: Book[]) =>
//             index === self.findIndex((b) => b.title === book.title)
//           );
//           return unique;
//         });
//         setTotal(data.total);
//       })
//       .catch((e) => setError(String(e)))
//       .finally(() => setLoading(false));
//   };

//   const handleFilterChange = (tax: TaxonomyTerm) => {
//     const taxValue = tax.title;
//     const nextTitles = selectedTaxTitles.includes(taxValue)
//       ? selectedTaxTitles.filter((title) => title !== taxValue)
//       : [...selectedTaxTitles, taxValue];

//     setSelectedTaxTitles(nextTitles);
//     setPage(0);
//     fetchBooks(0, false, nextTitles);
//   };

//   const clearFilters = () => {
//     setSelectedTaxTitles([]);
//     setPage(0);
//     fetchBooks(0, false, []);
//   };

//   const togglePagination = () => {
//     setIsInfinite(!isInfinite);
//     setPage(0);
//     fetchBooks(0);
//   };

//   const goToPage = (direction: number) => {
//     const next = page + direction;
//     setPage(next);
//     fetchBooks(next * limit);
//   };

//   // Infinite Scroll Logic using IntersectionObserver
//   useEffect(() => {
//     if (!isInfinite || !sentinelRef.current || books.length >= total) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !loading) {
//           setPage((p) => {
//             const next = p + 1;
//             fetchBooks(next * limit, true);
//             return next;
//           });
//         }
//       },
//       { rootMargin: "100px" }
//     );

//     observer.observe(sentinelRef.current);
//     return () => observer.disconnect();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isInfinite, loading, books.length, total]);

//   return {
//     books,
//     total,
//     error,
//     loading,
//     page,
//     isInfinite,
//     selectedTaxTitles,
//     sentinelRef,
//     handleFilterChange,
//     clearFilters,
//     togglePagination,
//     goToPage,
//   };
// }

"use client";

import React, { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "@/lib/types";
import Pricing from "../pricing";

interface BookGridProps {
  books: Book[];
}

const BookCard = memo(({ book }: { book: Book }) => {
  return (
    <article className="flex flex-col">
      {book.coverImage?.url && (
        <div className="mb-5 relative w-full h-[400px]">
          <Link href={`/books/${book.slug}`}>
            <Image
              src={book.coverImage.url}
              alt={`Cover image of ${book.title}` || "Book cover"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover hover:opacity-80 transition shadow-md rounded"
            />
          </Link>
        </div>
      )}
      <h3 className="text-3xl mb-3 leading-snug font-bold">
        <Link href={`/books/${book.slug}`} className="hover:underline">
          {book.title}
        </Link>
      </h3>
      {book.slug && <Pricing bookId={book.slug} />}
      <div className="text-lg mb-4 text-gray-700">
        {book.authors && book.authors.length > 0 && (
          <span className="font-semibold">
            {book.authors.join(", ")}
          </span>
        )}
        {book.numberOfPages && (
          <span className="ml-4 italic text-gray-500">
            {book.numberOfPages} pages
          </span>
        )}
      </div>
      {book.slug && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            {book.slug}
          </span>
        </div>
      )}

      {book.taxonomies && book.taxonomies.length > 0 && (
        <div className="mt-8">
          <span className="font-bold">Taxonomies: </span>
          {book.taxonomies.map((t) => t.title).join(", ")}
        </div>
      )}
    </article>
  );
});

BookCard.displayName = "BookCard";

export default function BookGrid({ books }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {books.map((book) => (
        <BookCard 
          key={book.slug || book.title} 
          book={book} 
        />
      ))}
    </div>
  );
}

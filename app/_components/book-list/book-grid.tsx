"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Book } from "./useBooksList";
import Pricing from "../pricing";

interface BookGridProps {
  books: Book[];
}

export default function BookGrid({ books }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {books.map((b, i) => (
        <article key={i} className="flex flex-col">
          {b.coverImage?.url && (
            <div className="mb-5 relative w-full h-[400px]">
              <Link href={`/books/${b.slug}`}>
                <Image
                  src={b.coverImage.url}
                  alt={b.title || "Book cover"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover hover:opacity-80 transition shadow-md rounded"
                />
              </Link>
            </div>
          )}
          <h3 className="text-3xl mb-3 leading-snug font-bold">
            <Link href={`/books/${b.slug}`} className="hover:underline">
              {b.title}
            </Link>
          </h3>
          {/* <p>bookId:{b.slug}</p> */}
          {b.slug && <Pricing bookId={b.slug} />}
          <div className="text-lg mb-4 text-gray-700">
            {b.authorsCollection?.items && (
              <span className="font-semibold">
                {b.authorsCollection.items.map((author) => author.name).join(", ")}
              </span>
            )}
            {b.numberOfPages && <span className="ml-4 italic text-gray-500">{b.numberOfPages} pages</span>}
          </div>
          {b.slug && (
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs uppercase tracking-wider">
                {JSON.stringify(b.slug)}
              </span>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}

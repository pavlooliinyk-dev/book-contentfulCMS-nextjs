import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { Markdown } from "@/lib/markdown";
import { getAllBooks, getBookBySlug } from "@/lib/api";
import CoverImage from "../../_components/cover-image";
import { StarRatingDisplay } from "../../_components/star-rating-display";
import Pricing from "../../_components/pricing";

export async function generateStaticParams() {
  // Limit to 20 to avoid complexity errors in Contentful GraphQL
  const { items: allBooks } = await getAllBooks(false, 20);

  return allBooks.map((book) => ({
    slug: book.slug,
  }));
}

export default async function BookPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const { isEnabled } = await draftMode();
  
//   console.log("DEBUG: Looking for slug:", slug);
const book = await getBookBySlug(slug, isEnabled);

if (!book) {
  notFound();
}
console.log("DEBUG: Found book:", book);

  return (
    <div className="container mx-auto px-5">
      <h2 className="mb-20 mt-8 text-2xl font-bold leading-tight tracking-tight md:text-4xl md:tracking-tighter">
        <Link href="/" className="hover:underline">
          {'Home'}
        </Link>
        <Link href="/books" className="hover:underline">
          {' / Books library'}
        </Link>
      </h2>
      <article>
        <h1 className="mb-12 text-center text-6xl font-bold leading-tight tracking-tighter md:text-left md:text-7xl md:leading-none lg:text-8xl">
          Product detail: {book.title}
        </h1>
        <div className="mb-8 sm:mx-0 md:mb-16">
          {book.coverImage?.url && (
            <CoverImage title={book.title} url={book.coverImage.url} slug={book.slug}/>
          )}
        </div>
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 text-lg">
            {book.authorsCollection?.items && (
              <span className="font-bold">
                By: {book.authorsCollection.items.map((a: any) => a.name).join(", ")}
              </span>
            )}
            {book.numberOfPages && <span className="ml-4">{book.numberOfPages} pages</span>}
          </div>
          {/* <p>bookId:{book.slug}</p> */}
          <Pricing bookId={book.slug} />
          <StarRatingDisplay rating={book?.rating} size="sm" />
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="prose">
            {book.shortDescription && <Markdown content={book.shortDescription} />}
          </div>
          {book.externalResourceLink && (
            <div className="mt-8">
              <a
                href={book.externalResourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-white hover:text-black border border-black transition-colors"
              >
                View Resource
              </a>
            </div>
          )}
        </div>
      </article>
      <hr className="border-accent-2 mt-28 mb-24" />
    </div>
  );
}

import { draftMode } from "next/headers";
import dynamic from "next/dynamic";

import { getAllBooks, getHomePage } from "@/lib/api";
import Intro from "./_components/intro";
import Link from "next/link";
import ContentfulApiUsage from "./_components/contentful-api-usage";
import HeroBanner from "./_components/hero-banner";

const BookList = dynamic(() => import("./_components/book-list"), {
  loading: () => <div className="mt-12 text-center text-gray-500">Loading books...</div>,
});

const HeroBook = dynamic(() => import("./_components/hero-book"));

export default async function Page() {
  const { isEnabled } = await draftMode();
  const [{ items: initialBooks, total: initialTotal }, homePage] = await Promise.all([
    getAllBooks(isEnabled, 5),
    getHomePage(isEnabled),
  ]);

  const heroBook = initialBooks && initialBooks.length > 0 ? initialBooks[0] : null;

  console.log('homePage', homePage);
  return (
    <div className="container mx-auto px-5">
      <Intro title={homePage?.title} />

      <p className="d-none">{JSON.stringify(homePage, null, 2)}</p>

      <Link href={`/books`}>
          Go to Books Library →
      </Link>
      <Link href={`/movies`} className="ml-4">
          Go to Movies Library →
      </Link>
      
      {homePage?.heroBanner && (
        <HeroBanner 
          heroBanner={homePage.heroBanner}
          title={homePage.title}
          imageWithTextSection={homePage.imageWithTextSection}
        />
      )}
      
      {heroBook && (
        <HeroBook 
          title={heroBook.title}
          coverImage={heroBook.coverImage}
          authors={heroBook.authors}
          numberOfPages={heroBook.numberOfPages}
          externalResourceLink={heroBook.externalResourceLink}
          metaUI={heroBook.metaUi}
          taxonomies={heroBook.taxonomies}
        />
      )}
      
      <BookList initialBooks={initialBooks} initialTotal={initialTotal} withFilters={false} />
    </div>
  );
}

import { draftMode } from "next/headers";
import Image from "next/image";
import dynamic from "next/dynamic";

import { getAllBooks, getHomePage } from "@/lib/api";
import Intro from "./components/intro";

const BooksClient = dynamic(() => import("./components/books-client"), {
  loading: () => <div className="mt-12 text-center text-gray-500">Loading books...</div>,
});

const HeroBook = dynamic(() => import("./components/hero-book"));

export default async function Page() {
  const { isEnabled } = await draftMode();
  const [allBooks, homePage] = await Promise.all([
    getAllBooks(isEnabled),
    getHomePage(isEnabled),
  ]);
  const heroBook = allBooks && allBooks.length > 0 ? allBooks[0] : null;
  
  return (
    <div className="container mx-auto px-5">
      <Intro title={homePage?.title} />

      {homePage?.heroBanner && (
        <div className="mb-8 md:mb-16 relative w-full h-[400px] md:h-[600px]">
          <Image 
            src={homePage.heroBanner.url} 
            alt={homePage.title || "Hero banner"}
            fill
            priority
            sizes="100vw"
            className="object-cover rounded-lg shadow-lg"
          />
        </div>
      )}

      {homePage?.imageWithTextSection?.text && (
        <div className="mb-12 p-8 bg-gray-50 rounded-lg text-center">
          <p className="text-xl italic text-gray-700">
            {homePage.imageWithTextSection.text}
          </p>
        </div>
      )}
      
      {heroBook && (
        <HeroBook 
          title={heroBook.title}
          coverImage={heroBook.coverImage}
          authors={heroBook.author}
          numberOfPages={heroBook.numberOfPages}
          externalResourceLink={heroBook.externalResourceLink}
          taxonomy={heroBook.taxonomy}
        />
      )}
      <BooksClient initialBooks={allBooks} />
    </div>
  );
}

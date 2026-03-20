import { draftMode } from "next/headers";

import BooksClient from "./components/BooksClient";
import HeroBook from "./components/HeroBook";

import { getAllBooks, getHomePage } from "@/lib/api";
import { CMS_NAME, CMS_URL } from "@/lib/constants";

function Intro({ title }: { title?: string }) {
  return (
    <section className="flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12 intro">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        {title || "Readify."}
      </h1>
    </section>
  );
}

export default async function Page() {
  const { isEnabled } = await draftMode();
  const [allBooks, homePage] = await Promise.all([
    getAllBooks(isEnabled),
    getHomePage(isEnabled),
  ]);
  const heroBook = allBooks && allBooks.length > 0 ? allBooks[0] : null;

  console.log('allBooks:', allBooks);
  console.log('heroBook:', heroBook);
  
  return (
    <div className="container mx-auto px-5">
      {isEnabled && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mt-4" role="alert">
          <p className="font-bold">Preview Mode</p>
          <p>You are viewing draft content. <a href="/api/disable-draft" className="underline">Disable Preview</a></p>
        </div>
      )}
      <Intro title={homePage?.title} />

      {homePage?.heroBanner && (
        <div className="mb-8 md:mb-16">
          <img 
            src={homePage.heroBanner.url} 
            alt={homePage.title} 
            className="w-full h-auto object-cover rounded-lg shadow-lg"
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

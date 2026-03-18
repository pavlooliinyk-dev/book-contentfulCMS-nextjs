import Link from "next/link";
import CoverImage from "./cover-image";
import { Book } from "@/lib/hooks/useBooks";

export default function HeroBook({
  title,
  coverImage,
  authors,
  numberOfPages,
  externalResourceLink,
  taxonomy,
}: Book) {
  return (
    <section className="mb-20">
      <div className="mb-8 md:mb-16">
        {coverImage?.url && (
          <CoverImage title={title || "Book Cover"} slug={""} url={coverImage.url} />
        )}
      </div>
      <div className="md:grid md:grid-cols-2 md:gap-x-16 lg:gap-x-8 mb-20 md:mb-28">
        <div>
          <h3 className="mb-4 text-4xl lg:text-6xl leading-tight">
            {externalResourceLink ? (
              <a href={externalResourceLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {title}
              </a>
            ) : (
              title
            )}
          </h3>
          <div className="mb-4 md:mb-0 text-lg text-gray-600">
            {authors && (
              <span>By: {Array.isArray(authors) ? authors.join(", ") : authors}</span>
            )}
          </div>
        </div>
        <div>
          <div className="text-lg leading-relaxed mb-4">
            {numberOfPages && <p className="mb-2">{numberOfPages} pages</p>}
            {taxonomy && (
              <div className="flex gap-2">
                {(Array.isArray(taxonomy) ? taxonomy : [taxonomy]).map((t) => (
                  <span key={t} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

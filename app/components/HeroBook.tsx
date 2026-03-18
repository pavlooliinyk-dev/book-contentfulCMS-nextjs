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
  const getTaxonomyValue = (t: any) => (typeof t === "string" ? t : t?.position);
  const taxonomyArray = (Array.isArray(taxonomy) ? taxonomy : [taxonomy]).filter(Boolean);
  const position = taxonomyArray.map(getTaxonomyValue).find(v => v === "left" || v === "right") || "left";

  return (
    <section className="mb-20 bg-gray-200 p-6">
        <h2 className="text-4xl font-bold pb-2">
          HeroBook section
        </h2>
      <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${position === "right" ? "md:flex-row-reverse" : ""}`}>
        <div className="w-full md:w-1/2">
          <div className="mb-4">
            {coverImage?.url && (
              <CoverImage title={title || "Book Cover"} slug={""} url={coverImage.url} />
            )}
          </div>
        </div>
        <div className="w-full md:w-1/2">
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
          <div className="text-lg leading-relaxed mt-4">
            {numberOfPages && <p className="mb-2">{numberOfPages} pages</p>}
            {taxonomy && (
              <div className="flex gap-2">
                {taxonomyArray.map((t, i) => (
                  <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {getTaxonomyValue(t)}
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

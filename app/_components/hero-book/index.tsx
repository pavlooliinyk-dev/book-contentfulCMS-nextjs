import CoverImage from "../cover-image";
import { Book, TaxonomyTerm, Position } from "@/lib/types";
import Pricing from "../pricing";

export default function HeroBook({
  title,
  slug,
  coverImage,
  authors,
  numberOfPages,
  externalResourceLink,
  metaUI,
  taxonomies,
}: Book) {
  const metaUIValue = Array.isArray(metaUI) ? metaUI.find(Boolean) : metaUI;
  const position: Position = (typeof metaUIValue === "string" ? metaUIValue : metaUIValue?.position) === Position.RIGHT ? Position.RIGHT : Position.LEFT;
  
  return (
    <section className="mb-20 bg-gray-200 p-6">
      <h2 className="text-4xl font-bold pb-2">
          HeroBook section
      </h2>
      <div className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${position === Position.RIGHT ? "md:flex-row-reverse" : ""}`}>
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
          {slug && <Pricing bookId={slug} />}
          <div className="text-lg leading-relaxed mt-4">
            {numberOfPages && <p className="mb-2">{numberOfPages} pages</p>}
            {metaUIValue && (
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                metaUI image position: {position}
              </span>
            )}
            {taxonomies && taxonomies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 text-sm">
                {taxonomies.map((tax: TaxonomyTerm) => (
                  <div key={tax.sys.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex flex-col items-center">
                    <span className="font-bold">{tax.slug || "Unknown"}</span>
                    <div className="flex gap-2 text-[10px] uppercase opacity-95">
                      {tax.type && <span>type: {tax.type}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

import ContentfulImage from "./contentful-image";
import Link from "next/link";

export default function CoverImage({
  title,
  url,
  slug,
  priority = false,
  sizes,
}: {
  title: string;
  url: string;
  slug?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const image = (
    <ContentfulImage
      alt={`Cover Image for ${title}`}
      priority={priority}
      width={1200}
      height={600}
      className={`shadow-small${slug ? " hover:shadow-medium transition-shadow duration-200 hover:opacity-75" : ""}`}
      src={url}
      sizes={sizes}
    />
  );

  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/books/${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
}

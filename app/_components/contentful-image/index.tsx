"use client";

import Image, { ImageProps } from "next/image";

type ContentfulImageProps = Omit<ImageProps, "src"> & {
  src: string;
};

/**
 * Custom loader that uses Contentful's Image API for resizing and format conversion
 */
const contentfulLoader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => {
  if (!src.includes('ctfassets.net') && !src.includes('contentful.com')) {
    return src;
  }
  const url = new URL(src);
  const params = new URLSearchParams(url.search);
  params.set('fm', 'webp');
  params.set('w', width.toString());
  if (quality) params.set('q', quality.toString());
  url.search = params.toString();
  return url.toString();
};

export default function ContentfulImage({ 
  src, 
  quality = 80,
  ...props 
}: ContentfulImageProps) {
  return (
    <Image 
      src={src}
      quality={quality}
      loader={contentfulLoader}
      {...props}
    />
  );
}

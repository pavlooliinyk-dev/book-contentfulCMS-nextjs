"use client";

import Image from "next/image";

interface ContentfulImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  fill?: boolean;
  sizes?: string;
  [key: string]: any;
}

/**
 * Optimizes Contentful images by adding URL parameters for resizing and format conversion
 */
function getOptimizedContentfulUrl(
  src: string, 
  width?: number, 
  quality: number = 80
): string {
  if (!src.includes('ctfassets.net') && !src.includes('contentful.com')) {
    return src; // Not a Contentful image
  }

  const url = new URL(src);
  const params = new URLSearchParams(url.search);
  
  // Add WebP format for better compression
  params.set('fm', 'webp');
  
  // Add quality parameter (1-100, default 80)
  params.set('q', quality.toString());
  
  // Add width if provided (for responsive sizing)
  if (width) {
    params.set('w', width.toString());
  }
  
  url.search = params.toString();
  return url.toString();
}

/**
 * Custom loader that bypasses Next.js image optimization
 * since we're already optimizing through Contentful's Image API
 */
const contentfulLoader = ({ src }: { src: string }) => {
  return src;
};

export default function ContentfulImage({ 
  src, 
  width, 
  height, 
  quality = 80,
  fill,
  alt,
  sizes,
  ...props 
}: ContentfulImageProps) {
  // For fill images, use a reasonable max width (e.g., 1920px for typical screens)
  // Otherwise use the provided width
  const optimizationWidth = fill ? 1920 : width;
  const optimizedSrc = getOptimizedContentfulUrl(src, optimizationWidth, quality);
  
  return (
    <Image 
      alt={alt}
      src={optimizedSrc}
      width={width}
      height={height}
      fill={fill}
      quality={quality}
      sizes={sizes}
      loader={contentfulLoader}
      {...props}
    />
  );
}
